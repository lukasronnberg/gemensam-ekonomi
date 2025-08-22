# backend/app.py
import datetime as dt

from fastapi import Depends, FastAPI, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlmodel import Session, select

from .db import engine, get_session, init_db
from .models import Account, Member, SharedSavingsTx, SharedTxTypeEnum, SplitMethodEnum, Transaction
from .services.splits import compute_shares, net_for_member

app = FastAPI(title="Gemensam Ekonomi")
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


@app.on_event("startup")
def startup():
    init_db()
    # seed: ett konto + två medlemmar (Lukas, Sambo)
    with Session(engine) as s:
        acc = s.exec(select(Account)).first()
        if not acc:
            acc = Account(name="Hushållet")
            s.add(acc)
            s.commit()
            s.refresh(acc)
        members = s.exec(select(Member).where(Member.account_id == acc.id)).all()
        names = [m.display_name for m in members]
        changed = False
        if "Lukas" not in names:
            s.add(Member(account_id=acc.id, display_name="Lukas"))
            changed = True
        if "Annie" not in names:
            s.add(Member(account_id=acc.id, display_name="Annie"))
            changed = True
        if changed:
            s.commit()


@app.get("/", response_class=HTMLResponse)
def home(request: Request, session: Session = Depends(get_session)):
    acc = session.exec(select(Account)).first()
    members = session.exec(select(Member).where(Member.account_id == acc.id)).all()

    # sparkontosaldo
    deposits = session.exec(
        select(SharedSavingsTx).where(
            (SharedSavingsTx.account_id == acc.id) & (SharedSavingsTx.type == "deposit")
        )
    ).all()
    payouts = session.exec(
        select(SharedSavingsTx).where(
            (SharedSavingsTx.account_id == acc.id) & (SharedSavingsTx.type == "payout")
        )
    ).all()
    saldo = sum(d.amount for d in deposits) - sum(p.amount for p in payouts)

    # netto per medlem
    txs = session.exec(select(Transaction).where(Transaction.account_id == acc.id)).all()

    # paid/ share
    paid = {m.id: 0.0 for m in members}
    share = {m.id: 0.0 for m in members}

    # Hitta Lukas (om han inte finns: ta första medlemmen)
    lukas = next((m for m in members if m.display_name.lower() == "lukas"), None)
    if not lukas:
        lukas = members[0]

    # Partner = någon som inte är Lukas (för tvåpersoners-hushåll)
    partner = next((m for m in members if m.id != lukas.id), None)

    for t in txs:
        paid[t.payer_member_id] += t.amount
        if t.is_shared:
            l_share, p_share = compute_shares(
                t.amount, t.split_method, t.split_percent_lukas, t.split_fixed_lukas
            )
            share[lukas.id] += l_share
            if partner:
                share[partner.id] += p_share

    net = {m.id: net_for_member(paid[m.id], share[m.id]) for m in members}

    # rekommenderad utbetalning:
    # endast till den som har positivt netto (ska få pengar), men inte mer än saldo
    suggestions = {}
    remaining = saldo
    for m in members:
        if net[m.id] > 0:
            bel = min(net[m.id], remaining)
            suggestions[m.id] = round(bel, 2)
            remaining -= bel
        else:
            suggestions[m.id] = 0.0

    return templates.TemplateResponse(
        "home.html",
        {
            "request": request,
            "members": members,
            "net": net,
            "saldo": round(saldo, 2),
            "suggestions": suggestions,
        },
    )


@app.get("/transactions", response_class=HTMLResponse)
def transactions_page(request: Request, session: Session = Depends(get_session)):
    acc = session.exec(select(Account)).first()
    members = session.exec(select(Member).where(Member.account_id == acc.id)).all()
    txs = session.exec(
        select(Transaction)
        .where(Transaction.account_id == acc.id)
        .order_by(Transaction.date.desc())
    ).all()
    return templates.TemplateResponse(
        "transactions.html",
        {
            "request": request,
            "members": members,
            "txs": txs,
            "payer_map": {m.id: m.display_name for m in members},  # NYTT
        },
    )


@app.post("/transactions/create")
def create_tx(
    date: str = Form(...),
    category: str = Form(...),
    description: str = Form(""),
    amount: float = Form(...),
    payer_member_id: int = Form(...),
    is_shared: bool = Form(False),
    split_method: str = Form("equal"),
    # nya fält
    percent_raw: str = Form(""),  # str -> float | None
    percent_target: str = Form(""),  # 'lukas' eller 'annie' (sätts av JS)
    fixed_raw: str = Form(""),  # str -> float | None
    fixed_target: str = Form("lukas"),  # 'lukas' eller 'annie'
    session: Session = Depends(get_session),
):
    acc = session.exec(select(Account)).first()
    date_obj = dt.date.fromisoformat(date)
    sm = SplitMethodEnum(split_method)

    # Normalisera inputs
    p = float(percent_raw) if percent_raw.strip() else None
    f = float(fixed_raw) if fixed_raw.strip() else None

    # Mappa till "Lukas-värden" som vi lagrar
    percent_lukas = None
    fixed_lukas = None

    if sm == SplitMethodEnum.percent and p is not None:
        # Om procent avser Annie -> Lukas = 1 - p
        if percent_target.lower() == "annie":
            percent_lukas = round(1 - p, 6)
        else:
            percent_lukas = p

    if sm == SplitMethodEnum.fixed and f is not None:
        tgt = (fixed_target or "lukas").lower()
        if tgt == "lukas":
            fixed_lukas = f
        else:
            # fast belopp gäller Annie -> Lukas del = amount - f
            fixed_lukas = amount - f

    tx = Transaction(
        account_id=acc.id,
        date=date_obj,
        category=category,
        description=description,
        amount=amount,
        payer_member_id=payer_member_id,
        is_shared=is_shared,
        split_method=sm,
        split_percent_lukas=percent_lukas,  # kan vara None
        split_fixed_lukas=fixed_lukas,  # kan vara None
    )
    session.add(tx)
    session.commit()
    return RedirectResponse(url="/transactions", status_code=303)


@app.get("/shared", response_class=HTMLResponse)
def shared_page(request: Request, session: Session = Depends(get_session)):
    acc = session.exec(select(Account)).first()
    members = session.exec(select(Member).where(Member.account_id == acc.id)).all()
    rows = session.exec(
        select(SharedSavingsTx)
        .where(SharedSavingsTx.account_id == acc.id)
        .order_by(SharedSavingsTx.date.desc())
    ).all()
    # saldo
    saldo = sum(r.amount for r in rows if r.type == "deposit") - sum(
        r.amount for r in rows if r.type == "payout"
    )
    return templates.TemplateResponse(
        "shared.html",
        {"request": request, "members": members, "rows": rows, "saldo": round(saldo, 2)},
    )


@app.post("/shared/add")
def shared_add(
    date: str = Form(...),
    type: str = Form(...),  # "deposit" eller "payout"
    member_id_raw: str = Form(""),
    amount: float = Form(...),
    note: str = Form(""),
    session: Session = Depends(get_session),
):
    acc = session.exec(select(Account)).first()
    date_obj = dt.date.fromisoformat(date)
    tx_type = SharedTxTypeEnum(type)
    member_id = int(member_id_raw) if member_id_raw.strip() else None

    if tx_type == SharedTxTypeEnum.payout and member_id is None:
        raise HTTPException(status_code=400, detail="Välj mottagare för utbetalning.")

    row = SharedSavingsTx(
        account_id=acc.id,
        date=date_obj,
        type=tx_type,
        member_id=member_id,
        amount=amount,
        note=note,
    )
    session.add(row)
    session.commit()
    return RedirectResponse(url="/shared", status_code=303)

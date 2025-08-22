# backend/services/splits.py
def compute_shares(
    amount: float,
    method: str,
    percent_lukas: float | None = None,
    fixed_lukas: float | None = None,
) -> tuple[float, float]:
    """Returnerar (Lukas andel, Partner andel)."""
    if method == "equal":
        lukas_share = amount / 2
    elif method == "percent":
        p = percent_lukas if percent_lukas is not None else 0.5
        lukas_share = amount * p
    elif method == "fixed":
        lukas_share = fixed_lukas if fixed_lukas is not None else amount / 2
    else:
        lukas_share = amount / 2
    partner_share = amount - lukas_share
    return round(lukas_share, 2), round(partner_share, 2)


def net_for_member(paid: float, share: float) -> float:
    return round(paid - share, 2)

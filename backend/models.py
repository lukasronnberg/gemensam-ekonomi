# backend/models.py
from datetime import date
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


# Riktiga Enums (SQLModel/SQLAlchemy gillar dessa)
class SplitMethodEnum(str, Enum):
    equal = "equal"
    percent = "percent"
    fixed = "fixed"


class SharedTxTypeEnum(str, Enum):
    deposit = "deposit"
    payout = "payout"


class Account(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str


class Member(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    account_id: int = Field(foreign_key="account.id")
    display_name: str


class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    account_id: int = Field(foreign_key="account.id")
    date: date
    category: str
    description: Optional[str] = None
    amount: float
    payer_member_id: int = Field(foreign_key="member.id")
    is_shared: bool = True
    split_method: SplitMethodEnum = SplitMethodEnum.equal
    split_percent_lukas: Optional[float] = None  # 0..1
    split_fixed_lukas: Optional[float] = None  # kr


class Budget(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    account_id: int = Field(foreign_key="account.id")
    month: str  # "YYYY-MM"
    category: str
    amount: float


class SharedSavingsTx(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    account_id: int = Field(foreign_key="account.id")
    date: date
    type: SharedTxTypeEnum
    member_id: Optional[int] = Field(default=None, foreign_key="member.id")
    amount: float
    note: Optional[str] = None

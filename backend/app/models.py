from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ExpenseCreate(BaseModel):
    raw_input: str


class Expense(BaseModel):
    id: str
    raw_input: str
    description: str
    amount: float
    category: str
    date: str
    created_at: str


class ExpenseUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[str] = None


# Income Models
INCOME_SOURCES = [
    "Part-time Job",
    "Freelance",
    "Allowance",
    "Venmo/Zelle",
    "Scholarship",
    "Refund",
    "Gift",
    "Other"
]


class IncomeCreate(BaseModel):
    raw_input: str


class Income(BaseModel):
    id: str
    raw_input: str
    description: str
    amount: float
    source: str
    date: str
    created_at: str


class IncomeUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    source: Optional[str] = None
    date: Optional[str] = None


class AnalyticsResponse(BaseModel):
    month: str
    total_spent: float
    by_category: dict
    daily_spending: list
    top_categories: list


# Budget Models
class BudgetCreate(BaseModel):
    category: str
    monthly_limit: float


class Budget(BaseModel):
    id: str
    category: str
    monthly_limit: float
    created_at: str


class BudgetUpdate(BaseModel):
    category: Optional[str] = None
    monthly_limit: Optional[float] = None


# Recurring Expense Models
class RecurringExpenseCreate(BaseModel):
    description: str
    amount: float
    category: str
    day_of_month: int  # 1-28 to avoid month-end issues


class RecurringExpense(BaseModel):
    id: str
    description: str
    amount: float
    category: str
    day_of_month: int
    is_active: bool
    last_added: Optional[str] = None
    created_at: str


class RecurringExpenseUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    day_of_month: Optional[int] = None
    is_active: Optional[bool] = None

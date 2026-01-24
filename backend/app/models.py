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


class AnalyticsResponse(BaseModel):
    month: str
    total_spent: float
    by_category: dict
    daily_spending: list
    top_categories: list

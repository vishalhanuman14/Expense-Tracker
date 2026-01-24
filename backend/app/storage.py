import json
import os
from typing import List, Optional
from .models import Expense
from datetime import datetime
import uuid

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "expenses.json")


def ensure_data_dir():
    """Ensure the data directory exists."""
    data_dir = os.path.dirname(DATA_FILE)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w") as f:
            json.dump([], f)


def load_expenses() -> List[dict]:
    """Load all expenses from JSON file."""
    ensure_data_dir()
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def save_expenses(expenses: List[dict]):
    """Save expenses to JSON file."""
    ensure_data_dir()
    with open(DATA_FILE, "w") as f:
        json.dump(expenses, f, indent=2)


def add_expense(expense_data: dict) -> dict:
    """Add a new expense."""
    expenses = load_expenses()
    expense = {
        "id": str(uuid.uuid4()),
        "created_at": datetime.now().isoformat(),
        **expense_data
    }
    expenses.append(expense)
    save_expenses(expenses)
    return expense


def get_expense(expense_id: str) -> Optional[dict]:
    """Get a single expense by ID."""
    expenses = load_expenses()
    for expense in expenses:
        if expense["id"] == expense_id:
            return expense
    return None


def update_expense(expense_id: str, update_data: dict) -> Optional[dict]:
    """Update an expense."""
    expenses = load_expenses()
    for i, expense in enumerate(expenses):
        if expense["id"] == expense_id:
            expenses[i] = {**expense, **{k: v for k, v in update_data.items() if v is not None}}
            save_expenses(expenses)
            return expenses[i]
    return None


def delete_expense(expense_id: str) -> bool:
    """Delete an expense."""
    expenses = load_expenses()
    initial_len = len(expenses)
    expenses = [e for e in expenses if e["id"] != expense_id]
    if len(expenses) < initial_len:
        save_expenses(expenses)
        return True
    return False


def get_expenses_by_month(year: int, month: int) -> List[dict]:
    """Get expenses for a specific month."""
    expenses = load_expenses()
    filtered = []
    for expense in expenses:
        try:
            date = datetime.fromisoformat(expense["date"])
            if date.year == year and date.month == month:
                filtered.append(expense)
        except (ValueError, KeyError):
            continue
    return filtered


def get_all_months() -> List[str]:
    """Get all unique months that have expenses."""
    expenses = load_expenses()
    months = set()
    for expense in expenses:
        try:
            date = datetime.fromisoformat(expense["date"])
            months.add(f"{date.year}-{date.month:02d}")
        except (ValueError, KeyError):
            continue
    return sorted(list(months), reverse=True)

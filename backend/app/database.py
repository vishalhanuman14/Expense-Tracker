"""
Database module - supports both JSON (local) and Supabase (production).
Set SUPABASE_URL and SUPABASE_KEY env vars to use Supabase.
"""
import os
import json
from datetime import datetime
from typing import List, Optional
import uuid

# Check if Supabase is configured
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if SUPABASE_URL and SUPABASE_KEY:
    from supabase import create_client, Client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    USE_SUPABASE = True
    print("✓ Using Supabase database")
else:
    supabase = None
    USE_SUPABASE = False
    print("✓ Using local JSON storage")


# ============ JSON Storage (Local Development) ============

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "expenses.json")


def _ensure_data_dir():
    data_dir = os.path.dirname(DATA_FILE)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w") as f:
            json.dump([], f)


def _load_json() -> List[dict]:
    _ensure_data_dir()
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def _save_json(expenses: List[dict]):
    _ensure_data_dir()
    with open(DATA_FILE, "w") as f:
        json.dump(expenses, f, indent=2)


# ============ Unified Database Functions ============

def load_expenses() -> List[dict]:
    """Load all expenses."""
    if USE_SUPABASE:
        response = supabase.table("expenses").select("*").order("date", desc=True).execute()
        return response.data or []
    else:
        return _load_json()


def add_expense(expense_data: dict) -> dict:
    """Add a new expense."""
    expense = {
        "id": str(uuid.uuid4()),
        "created_at": datetime.now().isoformat(),
        **expense_data
    }
    
    if USE_SUPABASE:
        response = supabase.table("expenses").insert(expense).execute()
        return response.data[0] if response.data else expense
    else:
        expenses = _load_json()
        expenses.append(expense)
        _save_json(expenses)
        return expense


def get_expense(expense_id: str) -> Optional[dict]:
    """Get a single expense by ID."""
    if USE_SUPABASE:
        response = supabase.table("expenses").select("*").eq("id", expense_id).execute()
        return response.data[0] if response.data else None
    else:
        expenses = _load_json()
        for expense in expenses:
            if expense["id"] == expense_id:
                return expense
        return None


def update_expense(expense_id: str, update_data: dict) -> Optional[dict]:
    """Update an expense."""
    clean_data = {k: v for k, v in update_data.items() if v is not None}
    
    if USE_SUPABASE:
        response = supabase.table("expenses").update(clean_data).eq("id", expense_id).execute()
        return response.data[0] if response.data else None
    else:
        expenses = _load_json()
        for i, expense in enumerate(expenses):
            if expense["id"] == expense_id:
                expenses[i] = {**expense, **clean_data}
                _save_json(expenses)
                return expenses[i]
        return None


def delete_expense(expense_id: str) -> bool:
    """Delete an expense."""
    if USE_SUPABASE:
        response = supabase.table("expenses").delete().eq("id", expense_id).execute()
        return bool(response.data)
    else:
        expenses = _load_json()
        initial_len = len(expenses)
        expenses = [e for e in expenses if e["id"] != expense_id]
        if len(expenses) < initial_len:
            _save_json(expenses)
            return True
        return False


def get_expenses_by_month(year: int, month: int) -> List[dict]:
    """Get expenses for a specific month."""
    if USE_SUPABASE:
        # Filter by date range
        start_date = f"{year}-{month:02d}-01"
        if month == 12:
            end_date = f"{year + 1}-01-01"
        else:
            end_date = f"{year}-{month + 1:02d}-01"
        
        response = supabase.table("expenses").select("*").gte("date", start_date).lt("date", end_date).execute()
        return response.data or []
    else:
        expenses = _load_json()
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

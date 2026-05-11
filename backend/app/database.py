"""
Database module - supports both JSON (local) and Supabase (production).
Set SUPABASE_URL and SUPABASE_KEY env vars to use Supabase.
"""
import os
import json
from datetime import datetime
from typing import List, Optional
import uuid
from dotenv import load_dotenv

# Load .env file FIRST before checking env vars
load_dotenv()

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

PAYMENT_METHODS = {"debit", "credit"}


# ============ JSON Storage (Local Development) ============

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "expenses.json")


def _normalize_payment_method(value: str) -> str:
    method = str(value or "").strip().lower()
    return method if method in PAYMENT_METHODS else "debit"


def _normalize_expense(expense: dict) -> dict:
    return {
        **expense,
        "payment_method": _normalize_payment_method(expense.get("payment_method"))
    }


def _normalize_expenses(expenses: List[dict]) -> List[dict]:
    return [_normalize_expense(expense) for expense in expenses]


def _normalize_recurring_expense(item: dict) -> dict:
    return {
        **item,
        "payment_method": _normalize_payment_method(item.get("payment_method"))
    }


def _normalize_recurring_expenses(items: List[dict]) -> List[dict]:
    return [_normalize_recurring_expense(item) for item in items]


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
        return _normalize_expenses(response.data or [])
    else:
        return _normalize_expenses(_load_json())


def add_expense(expense_data: dict) -> dict:
    """Add a new expense."""
    expense = {
        "id": str(uuid.uuid4()),
        "created_at": datetime.now().isoformat(),
        "payment_method": "debit",
        **expense_data
    }
    expense["payment_method"] = _normalize_payment_method(expense.get("payment_method"))
    
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
        return _normalize_expense(response.data[0]) if response.data else None
    else:
        expenses = _load_json()
        for expense in expenses:
            if expense["id"] == expense_id:
                return _normalize_expense(expense)
        return None


def update_expense(expense_id: str, update_data: dict) -> Optional[dict]:
    """Update an expense."""
    clean_data = {k: v for k, v in update_data.items() if v is not None}
    if "payment_method" in clean_data:
        clean_data["payment_method"] = _normalize_payment_method(clean_data["payment_method"])
    
    if USE_SUPABASE:
        response = supabase.table("expenses").update(clean_data).eq("id", expense_id).execute()
        return _normalize_expense(response.data[0]) if response.data else None
    else:
        expenses = _load_json()
        for i, expense in enumerate(expenses):
            if expense["id"] == expense_id:
                expenses[i] = {**expense, **clean_data}
                _save_json(expenses)
                return _normalize_expense(expenses[i])
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
        return _normalize_expenses(response.data or [])
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
        return _normalize_expenses(filtered)


def get_all_months() -> List[str]:
    """Get all unique months that have expenses or income."""
    expenses = load_expenses()
    incomes = load_incomes()
    months = set()
    
    for expense in expenses:
        try:
            date = datetime.fromisoformat(expense["date"])
            months.add(f"{date.year}-{date.month:02d}")
        except (ValueError, KeyError):
            continue
    
    for income in incomes:
        try:
            date = datetime.fromisoformat(income["date"])
            months.add(f"{date.year}-{date.month:02d}")
        except (ValueError, KeyError):
            continue
    
    return sorted(list(months), reverse=True)


# ============ Income Functions ============

INCOME_DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "income.json")


def _load_income_json() -> List[dict]:
    """Load income from local JSON file."""
    data_dir = os.path.dirname(INCOME_DATA_FILE)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    if not os.path.exists(INCOME_DATA_FILE):
        with open(INCOME_DATA_FILE, "w") as f:
            json.dump([], f)
    try:
        with open(INCOME_DATA_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def _save_income_json(incomes: List[dict]):
    """Save income to local JSON file."""
    data_dir = os.path.dirname(INCOME_DATA_FILE)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    with open(INCOME_DATA_FILE, "w") as f:
        json.dump(incomes, f, indent=2)


def load_incomes() -> List[dict]:
    """Load all income entries."""
    if USE_SUPABASE:
        response = supabase.table("income").select("*").order("date", desc=True).execute()
        return response.data or []
    else:
        return _load_income_json()


def add_income(income_data: dict) -> dict:
    """Add a new income entry."""
    income = {
        "id": str(uuid.uuid4()),
        "created_at": datetime.now().isoformat(),
        **income_data
    }
    
    if USE_SUPABASE:
        response = supabase.table("income").insert(income).execute()
        return response.data[0] if response.data else income
    else:
        incomes = _load_income_json()
        incomes.append(income)
        _save_income_json(incomes)
        return income


def get_income(income_id: str) -> Optional[dict]:
    """Get a single income entry by ID."""
    if USE_SUPABASE:
        response = supabase.table("income").select("*").eq("id", income_id).execute()
        return response.data[0] if response.data else None
    else:
        incomes = _load_income_json()
        for income in incomes:
            if income["id"] == income_id:
                return income
        return None


def update_income(income_id: str, update_data: dict) -> Optional[dict]:
    """Update an income entry."""
    clean_data = {k: v for k, v in update_data.items() if v is not None}
    
    if USE_SUPABASE:
        response = supabase.table("income").update(clean_data).eq("id", income_id).execute()
        return response.data[0] if response.data else None
    else:
        incomes = _load_income_json()
        for i, income in enumerate(incomes):
            if income["id"] == income_id:
                incomes[i] = {**income, **clean_data}
                _save_income_json(incomes)
                return incomes[i]
        return None


def delete_income(income_id: str) -> bool:
    """Delete an income entry."""
    if USE_SUPABASE:
        response = supabase.table("income").delete().eq("id", income_id).execute()
        return bool(response.data)
    else:
        incomes = _load_income_json()
        initial_len = len(incomes)
        incomes = [i for i in incomes if i["id"] != income_id]
        if len(incomes) < initial_len:
            _save_income_json(incomes)
            return True
        return False


def get_income_by_month(year: int, month: int) -> List[dict]:
    """Get income for a specific month."""
    if USE_SUPABASE:
        start_date = f"{year}-{month:02d}-01"
        if month == 12:
            end_date = f"{year + 1}-01-01"
        else:
            end_date = f"{year}-{month + 1:02d}-01"
        
        response = supabase.table("income").select("*").gte("date", start_date).lt("date", end_date).execute()
        return response.data or []
    else:
        incomes = _load_income_json()
        filtered = []
        for income in incomes:
            try:
                date = datetime.fromisoformat(income["date"])
                if date.year == year and date.month == month:
                    filtered.append(income)
            except (ValueError, KeyError):
                continue
        return filtered


# ============ Budget Functions ============

BUDGET_DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "budgets.json")


def _load_budget_json() -> List[dict]:
    """Load budgets from local JSON file."""
    data_dir = os.path.dirname(BUDGET_DATA_FILE)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    if not os.path.exists(BUDGET_DATA_FILE):
        with open(BUDGET_DATA_FILE, "w") as f:
            json.dump([], f)
    try:
        with open(BUDGET_DATA_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def _save_budget_json(budgets: List[dict]):
    """Save budgets to local JSON file."""
    data_dir = os.path.dirname(BUDGET_DATA_FILE)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    with open(BUDGET_DATA_FILE, "w") as f:
        json.dump(budgets, f, indent=2)


def load_budgets() -> List[dict]:
    """Load all budgets."""
    if USE_SUPABASE:
        response = supabase.table("budgets").select("*").execute()
        return response.data or []
    else:
        return _load_budget_json()


def add_budget(budget_data: dict) -> dict:
    """Add a new budget."""
    budget = {
        "id": str(uuid.uuid4()),
        "created_at": datetime.now().isoformat(),
        **budget_data
    }
    
    if USE_SUPABASE:
        response = supabase.table("budgets").insert(budget).execute()
        return response.data[0] if response.data else budget
    else:
        budgets = _load_budget_json()
        budgets.append(budget)
        _save_budget_json(budgets)
        return budget


def get_budget(budget_id: str) -> Optional[dict]:
    """Get a single budget by ID."""
    if USE_SUPABASE:
        response = supabase.table("budgets").select("*").eq("id", budget_id).execute()
        return response.data[0] if response.data else None
    else:
        budgets = _load_budget_json()
        for budget in budgets:
            if budget["id"] == budget_id:
                return budget
        return None


def get_budget_by_category(category: str) -> Optional[dict]:
    """Get a budget by category."""
    if USE_SUPABASE:
        response = supabase.table("budgets").select("*").eq("category", category).execute()
        return response.data[0] if response.data else None
    else:
        budgets = _load_budget_json()
        for budget in budgets:
            if budget["category"] == category:
                return budget
        return None


def update_budget(budget_id: str, update_data: dict) -> Optional[dict]:
    """Update a budget."""
    clean_data = {k: v for k, v in update_data.items() if v is not None}
    
    if USE_SUPABASE:
        response = supabase.table("budgets").update(clean_data).eq("id", budget_id).execute()
        return response.data[0] if response.data else None
    else:
        budgets = _load_budget_json()
        for i, budget in enumerate(budgets):
            if budget["id"] == budget_id:
                budgets[i] = {**budget, **clean_data}
                _save_budget_json(budgets)
                return budgets[i]
        return None


def delete_budget(budget_id: str) -> bool:
    """Delete a budget."""
    if USE_SUPABASE:
        response = supabase.table("budgets").delete().eq("id", budget_id).execute()
        return bool(response.data)
    else:
        budgets = _load_budget_json()
        initial_len = len(budgets)
        budgets = [b for b in budgets if b["id"] != budget_id]
        if len(budgets) < initial_len:
            _save_budget_json(budgets)
            return True
        return False


# ============ Recurring Expense Functions ============

RECURRING_DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "recurring.json")


def _load_recurring_json() -> List[dict]:
    """Load recurring expenses from local JSON file."""
    data_dir = os.path.dirname(RECURRING_DATA_FILE)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    if not os.path.exists(RECURRING_DATA_FILE):
        with open(RECURRING_DATA_FILE, "w") as f:
            json.dump([], f)
    try:
        with open(RECURRING_DATA_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def _save_recurring_json(recurring: List[dict]):
    """Save recurring expenses to local JSON file."""
    data_dir = os.path.dirname(RECURRING_DATA_FILE)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    with open(RECURRING_DATA_FILE, "w") as f:
        json.dump(recurring, f, indent=2)


def load_recurring_expenses() -> List[dict]:
    """Load all recurring expenses."""
    if USE_SUPABASE:
        response = supabase.table("recurring_expenses").select("*").execute()
        return _normalize_recurring_expenses(response.data or [])
    else:
        return _normalize_recurring_expenses(_load_recurring_json())


def add_recurring_expense(recurring_data: dict) -> dict:
    """Add a new recurring expense."""
    recurring = {
        "id": str(uuid.uuid4()),
        "is_active": True,
        "last_added": None,
        "created_at": datetime.now().isoformat(),
        "payment_method": "debit",
        **recurring_data
    }
    recurring["payment_method"] = _normalize_payment_method(recurring.get("payment_method"))
    
    if USE_SUPABASE:
        response = supabase.table("recurring_expenses").insert(recurring).execute()
        return response.data[0] if response.data else recurring
    else:
        items = _load_recurring_json()
        items.append(recurring)
        _save_recurring_json(items)
        return recurring


def get_recurring_expense(recurring_id: str) -> Optional[dict]:
    """Get a single recurring expense by ID."""
    if USE_SUPABASE:
        response = supabase.table("recurring_expenses").select("*").eq("id", recurring_id).execute()
        return _normalize_recurring_expense(response.data[0]) if response.data else None
    else:
        items = _load_recurring_json()
        for item in items:
            if item["id"] == recurring_id:
                return _normalize_recurring_expense(item)
        return None


def update_recurring_expense(recurring_id: str, update_data: dict) -> Optional[dict]:
    """Update a recurring expense."""
    clean_data = {k: v for k, v in update_data.items() if v is not None}
    if "payment_method" in clean_data:
        clean_data["payment_method"] = _normalize_payment_method(clean_data["payment_method"])
    
    if USE_SUPABASE:
        response = supabase.table("recurring_expenses").update(clean_data).eq("id", recurring_id).execute()
        return _normalize_recurring_expense(response.data[0]) if response.data else None
    else:
        items = _load_recurring_json()
        for i, item in enumerate(items):
            if item["id"] == recurring_id:
                items[i] = {**item, **clean_data}
                _save_recurring_json(items)
                return _normalize_recurring_expense(items[i])
        return None


def delete_recurring_expense(recurring_id: str) -> bool:
    """Delete a recurring expense."""
    if USE_SUPABASE:
        response = supabase.table("recurring_expenses").delete().eq("id", recurring_id).execute()
        return bool(response.data)
    else:
        items = _load_recurring_json()
        initial_len = len(items)
        items = [r for r in items if r["id"] != recurring_id]
        if len(items) < initial_len:
            _save_recurring_json(items)
            return True
        return False


def process_recurring_expenses() -> List[dict]:
    """Check and add recurring expenses for the current month."""
    today = datetime.now()
    current_month = f"{today.year}-{today.month:02d}"
    added_expenses = []
    
    recurring_items = load_recurring_expenses()
    
    for item in recurring_items:
        if not item.get("is_active", True):
            continue
            
        last_added = item.get("last_added")
        
        # Check if already added this month
        if last_added and last_added.startswith(current_month):
            continue
        
        # Check if it's time to add (day of month has passed or is today)
        day_of_month = item.get("day_of_month", 1)
        if today.day >= day_of_month:
            # Add the expense
            expense_data = {
                "raw_input": f"[Recurring] {item['description']}",
                "description": item["description"],
                "amount": item["amount"],
                "category": item["category"],
                "payment_method": _normalize_payment_method(item.get("payment_method")),
                "date": f"{today.year}-{today.month:02d}-{day_of_month:02d}"
            }
            
            new_expense = add_expense(expense_data)
            added_expenses.append(new_expense)
            
            # Update last_added
            update_recurring_expense(item["id"], {"last_added": current_month})
    
    return added_expenses

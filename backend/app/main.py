import os
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from collections import defaultdict
from dotenv import load_dotenv
from typing import Optional

from .models import ExpenseCreate, Expense, ExpenseUpdate, AnalyticsResponse
from .database import (
    load_expenses, add_expense, get_expense, update_expense, 
    delete_expense, get_expenses_by_month, get_all_months
)
from .llm import parse_expense_with_llm, get_categories

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Expense Tracker API", version="1.0.0")


def verify_auth(x_auth_password: Optional[str] = Header(None)):
    """Verify the auth password for protected routes."""
    auth_password = os.getenv("AUTH_PASSWORD")
    
    # If no password is set, allow access (for local development)
    if not auth_password:
        return True
    
    if x_auth_password != auth_password:
        raise HTTPException(
            status_code=401, 
            detail="Unauthorized. Invalid or missing password."
        )
    return True

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Expense Tracker API", "version": "1.0.0"}


@app.get("/auth/check")
async def check_auth():
    """Check if authentication is required."""
    auth_password = os.getenv("AUTH_PASSWORD")
    return {"auth_required": bool(auth_password)}


@app.post("/auth/verify")
async def verify_password(authorized: bool = Depends(verify_auth)):
    """Verify the provided password."""
    return {"success": True}


@app.get("/categories")
async def list_categories():
    """Get all available expense categories."""
    return {"categories": get_categories()}


@app.post("/expenses")
async def create_expense(expense: ExpenseCreate, authorized: bool = Depends(verify_auth)):
    """Create a new expense from raw input, using LLM to parse and categorize."""
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        raise HTTPException(
            status_code=400, 
            detail="OPENAI_API_KEY environment variable is not set. Please set it in your .env file."
        )
    
    try:
        # Parse the raw input using LLM
        parsed = parse_expense_with_llm(expense.raw_input, api_key)
        
        # Save to storage
        expense_data = {
            "raw_input": expense.raw_input,
            **parsed
        }
        saved = add_expense(expense_data)
        
        return {"success": True, "expense": saved}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/expenses")
async def list_expenses(year: int = None, month: int = None):
    """Get all expenses, optionally filtered by month."""
    if year and month:
        expenses = get_expenses_by_month(year, month)
    else:
        expenses = load_expenses()
    
    # Sort by date descending
    expenses.sort(key=lambda x: x.get("date", ""), reverse=True)
    
    return {"expenses": expenses}


@app.get("/expenses/{expense_id}")
async def get_single_expense(expense_id: str):
    """Get a single expense by ID."""
    expense = get_expense(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"expense": expense}


@app.put("/expenses/{expense_id}")
async def update_single_expense(expense_id: str, update: ExpenseUpdate, authorized: bool = Depends(verify_auth)):
    """Update an expense."""
    updated = update_expense(expense_id, update.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"success": True, "expense": updated}


@app.delete("/expenses/{expense_id}")
async def delete_single_expense(expense_id: str, authorized: bool = Depends(verify_auth)):
    """Delete an expense."""
    if delete_expense(expense_id):
        return {"success": True}
    raise HTTPException(status_code=404, detail="Expense not found")


@app.get("/analytics")
async def get_analytics(year: int = None, month: int = None):
    """Get spending analytics for a specific month or all time."""
    if year and month:
        expenses = get_expenses_by_month(year, month)
        month_label = f"{year}-{month:02d}"
    else:
        expenses = load_expenses()
        month_label = "all"
    
    if not expenses:
        return {
            "month": month_label,
            "total_spent": 0,
            "by_category": {},
            "daily_spending": [],
            "top_categories": [],
            "expense_count": 0
        }
    
    # Calculate totals by category
    by_category = defaultdict(float)
    daily_spending = defaultdict(float)
    
    for expense in expenses:
        amount = expense.get("amount", 0)
        category = expense.get("category", "Other")
        date = expense.get("date", "")
        
        by_category[category] += amount
        if date:
            daily_spending[date] += amount
    
    # Sort categories by amount
    sorted_categories = sorted(by_category.items(), key=lambda x: x[1], reverse=True)
    top_categories = [{"category": cat, "amount": round(amt, 2)} for cat, amt in sorted_categories[:5]]
    
    # Format daily spending for chart
    daily_list = [{"date": date, "amount": round(amt, 2)} for date, amt in sorted(daily_spending.items())]
    
    total = sum(by_category.values())
    
    return {
        "month": month_label,
        "total_spent": round(total, 2),
        "by_category": {k: round(v, 2) for k, v in by_category.items()},
        "daily_spending": daily_list,
        "top_categories": top_categories,
        "expense_count": len(expenses)
    }


@app.get("/analytics/months")
async def get_available_months():
    """Get all months that have expense data."""
    months = get_all_months()
    return {"months": months}


@app.get("/analytics/trends")
async def get_trends():
    """Get spending trends across all months."""
    months = get_all_months()
    trends = []
    
    for month_str in months:
        year, month = map(int, month_str.split("-"))
        expenses = get_expenses_by_month(year, month)
        
        by_category = defaultdict(float)
        total = 0
        
        for expense in expenses:
            amount = expense.get("amount", 0)
            category = expense.get("category", "Other")
            by_category[category] += amount
            total += amount
        
        trends.append({
            "month": month_str,
            "total": round(total, 2),
            "by_category": {k: round(v, 2) for k, v in by_category.items()},
            "expense_count": len(expenses)
        })
    
    return {"trends": trends}

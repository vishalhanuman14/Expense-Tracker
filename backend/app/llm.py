from openai import OpenAI
import json
import re
from datetime import datetime


CATEGORIES = [
    "Rent & Housing",      # Rent, furniture, home stuff
    "Utilities",           # Electric, gas, water, internet, phone bill
    "Groceries",           # Grocery stores, supermarkets
    "Food & Dining",       # Restaurants, takeout, coffee, delivery
    "Transportation",      # Gas, Uber, Lyft, car maintenance, parking
    "Alcohol & Bars",      # Beer, wine, liquor, bars, clubs
    "Tobacco & Vapes",     # Cigarettes, vapes, cigars
    "Entertainment",       # Movies, concerts, games, sports events
    "Subscriptions",       # Netflix, Spotify, gym, software
    "Shopping",            # Clothes, Amazon, online shopping
    "Health & Fitness",    # Gym, pharmacy, doctor, medicine
    "Personal Care",       # Haircuts, toiletries, skincare
    "Education",           # Books, courses, tuition, supplies
    "Travel",              # Flights, hotels, trips
    "Gifts & Donations",   # Presents, charity, tips
    "Other"                # Miscellaneous
]


def parse_expense_with_llm(raw_input: str, api_key: str) -> dict:
    """Use OpenAI to parse raw expense input and categorize it."""
    
    client = OpenAI(api_key=api_key)
    
    now = datetime.now()
    today = now.strftime("%Y-%m-%d")
    current_year = now.year
    current_month = now.strftime("%B")
    
    prompt = f"""Parse this expense and return a JSON object.

CURRENT DATE: {today} ({current_month} {now.day}, {current_year})

Rules for parsing dates:
- If a specific date is mentioned (e.g., "Jan 10th", "January 10"), use the current year {current_year}
- "yesterday" = one day before {today}
- "last week" = 7 days before {today}
- If no date mentioned, use today: {today}
- Always return date in YYYY-MM-DD format

Return these fields:
- description: Clean description of the expense
- amount: Number only (no $ symbol)
- category: One of: {', '.join(CATEGORIES)}
- date: YYYY-MM-DD format

Raw input: "{raw_input}"

Return ONLY valid JSON. Example:
{{"description": "Rent payment", "amount": 100.00, "category": "Rent & Housing", "date": "{current_year}-01-10"}}"""

    response = client.chat.completions.create(
        model="gpt-4.1-nano",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that parses expense inputs and categorizes them. Always return valid JSON only."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,
        max_tokens=200
    )
    
    result_text = response.choices[0].message.content.strip()
    
    # Clean up the response - remove markdown code blocks if present
    if result_text.startswith("```"):
        result_text = re.sub(r'^```(?:json)?\n?', '', result_text)
        result_text = re.sub(r'\n?```$', '', result_text)
    
    try:
        parsed = json.loads(result_text)
        
        # Validate and clean the result
        return {
            "description": str(parsed.get("description", raw_input)),
            "amount": float(parsed.get("amount", 0)),
            "category": parsed.get("category", "Other") if parsed.get("category") in CATEGORIES else "Other",
            "date": parsed.get("date", today)
        }
    except json.JSONDecodeError:
        # Fallback: try to extract amount from raw input
        amount_match = re.search(r'\$?(\d+(?:\.\d{2})?)', raw_input)
        amount = float(amount_match.group(1)) if amount_match else 0
        
        return {
            "description": raw_input,
            "amount": amount,
            "category": "Other",
            "date": today
        }


def get_categories() -> list:
    """Return the list of available categories."""
    return CATEGORIES

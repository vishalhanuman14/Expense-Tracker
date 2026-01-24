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
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    prompt = f"""Parse this expense and return a JSON object with the following fields:
- description: A clean description of the expense
- amount: The amount spent (number only, no currency symbols)
- category: One of these categories: {', '.join(CATEGORIES)}
- date: The date in YYYY-MM-DD format. If no date is mentioned, use today's date: {today}

Raw expense input: "{raw_input}"

Return ONLY valid JSON, no other text. Example:
{{"description": "Popeyes chicken", "amount": 5.00, "category": "Food & Dining", "date": "2024-01-15"}}"""

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

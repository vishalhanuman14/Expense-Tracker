# Spend - AI Expense Tracker

**Made by Deva Anand** | Built with [Cursor AI](https://cursor.sh)

A simple expense tracker that uses AI to automatically categorize your spending. Just type "chipotle $14" and the AI handles the rest.

---

## Features

- **AI Categorization** - Type naturally, AI picks the category
- **Typo Correction** - AI fixes spelling mistakes
- **Monthly Analytics** - Charts showing spending trends
- **Password Protection** - Only you can add/edit expenses
- **Guest View Mode** - Others can view without editing
- **Free Hosting** - Runs entirely on free tiers

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- OpenAI API Key (get one at platform.openai.com)

### 1. Clone the Repo

```bash
git clone https://github.com/Deva-1903/Expense-Tracker.git
cd Expense-Tracker
```

### 2. Set Up Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
echo "OPENAI_API_KEY=sk-your-key-here" > .env
echo "AUTH_PASSWORD=your-password" >> .env

# Run server
uvicorn app.main:app --reload --port 8000
```

### 3. Set Up Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Open Browser

Go to http://localhost:5173

---

## Usage Examples

| Input | Result |
|-------|--------|
| `chipotle $14` | Chipotle - Food & Dining - $14.00 |
| `uber to campus $8` | Uber to Campus - Transportation - $8.00 |
| `rent $850 on jan 1` | Rent - Rent & Housing - $850.00 |
| `starbuks cofee $6` | Starbucks Coffee - Food & Dining - $6.00 |

The AI fixes typos, picks categories, and parses dates automatically.

---

## Categories

- Rent & Housing
- Utilities
- Groceries
- Food & Dining
- Transportation
- Alcohol & Bars
- Tobacco & Vapes
- Entertainment
- Subscriptions
- Shopping
- Health & Fitness
- Personal Care
- Education
- Travel
- Gifts & Donations

---

## Deploy Your Own (Free)

### 1. Set Up Supabase (Database)
1. Create account at supabase.com
2. New Project
3. Run this SQL:

```sql
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  raw_input TEXT,
  description TEXT,
  amount DECIMAL(10,2),
  category TEXT,
  date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

4. Copy your Project URL and anon key from Settings > API

### 2. Deploy Backend (Render)
1. Create account at render.com
2. New Web Service > Connect GitHub repo
3. Root Directory: `backend`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   - OPENAI_API_KEY
   - AUTH_PASSWORD
   - SUPABASE_URL
   - SUPABASE_KEY

### 3. Deploy Frontend (Vercel)
1. Create account at vercel.com
2. Import GitHub repo
3. Root Directory: `frontend`
4. Add environment variable:
   - VITE_API_URL = your Render backend URL

### Cost

| Service | Cost |
|---------|------|
| Vercel | Free |
| Render | Free |
| Supabase | Free (500MB) |
| OpenAI | ~$0.01 per 50 expenses |

---

## Tech Stack

- Frontend: React, Vite, Recharts
- Backend: Python, FastAPI
- Database: Supabase (PostgreSQL)
- AI: OpenAI GPT-4.1-nano

---

## License

MIT - Use it however you want.

---

**Made by Deva Anand** - Built with help from Cursor AI

Feel free to clone, fork, and make it your own.

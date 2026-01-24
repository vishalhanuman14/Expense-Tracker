# Spend - AI Expense Tracker

**Made by Deva Anand** | Built with [Cursor AI](https://cursor.sh)

A simple expense tracker that uses AI to automatically categorize your spending. Just type "chipotle $14" and the AI handles the rest.

---

## Features

- **AI Categorization** - Type naturally, AI picks the category
- **Typo Correction** - AI fixes spelling mistakes
- **Income Tracking** - Track money coming in (paychecks, freelance, etc.)
- **Net Balance** - See income vs expenses at a glance
- **Monthly Budgets** - Set spending limits per category with progress bars
- **Recurring Expenses** - Auto-add monthly bills (rent, subscriptions, etc.)
- **Search & Filter** - Find expenses by description or category
- **Monthly Analytics** - Charts showing spending trends
- **Password Protection** - Only you can add/edit expenses
- **Guest View Mode** - Others can view demo data without editing
- **Free Hosting** - Runs entirely on free tiers

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- LLM API Key (OpenAI recommended, but free alternatives work too - see below)

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
echo "OPENAI_API_KEY=sk-your-key-here" > .env  # Or use free LLM API key
echo "AUTH_PASSWORD=your-password" >> .env
echo "SUPABASE_URL=https://your-project.supabase.co" >> .env
echo "SUPABASE_KEY=your-anon-key" >> .env

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

### Expenses
| Input | Result |
|-------|--------|
| `chipotle $14` | Chipotle - Food & Dining - $14.00 |
| `uber to campus $8` | Uber to Campus - Transportation - $8.00 |
| `rent $850 on jan 1` | Rent - Rent & Housing - $850.00 |
| `starbuks cofee $6` | Starbucks Coffee - Food & Dining - $6.00 |

### Income
| Input | Result |
|-------|--------|
| `paycheck $250` | Paycheck - Part-time Job - $250.00 |
| `venmo from roommate $40` | Venmo from Roommate - Venmo/Zelle - $40.00 |
| `freelance project $150` | Freelance Project - Freelance - $150.00 |

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
- Other

## Income Sources

- Part-time Job
- Freelance
- Allowance
- Venmo/Zelle
- Scholarship
- Refund
- Gift
- Other

---

## Deploy Your Own (Free)

### 1. Set Up Supabase (Database)
1. Create account at supabase.com
2. New Project
3. Run this SQL in SQL Editor:

```sql
-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_input TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Income table
CREATE TABLE income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_input TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  source TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budgets table
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL UNIQUE,
  monthly_limit DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recurring expenses table
CREATE TABLE recurring_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  day_of_month INTEGER NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 28),
  is_active BOOLEAN DEFAULT true,
  last_added TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;

-- Allow all operations (adjust for production)
CREATE POLICY "Allow all operations on expenses" ON expenses
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on income" ON income
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on budgets" ON budgets
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on recurring_expenses" ON recurring_expenses
  FOR ALL USING (true) WITH CHECK (true);
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
| Free LLMs | $0 (Groq, Ollama, Hugging Face) |

---

## Key Features Explained

### Monthly Budgets
Set spending limits per category (e.g., $200/month on Food & Dining). The app shows:
- Progress bars with color coding (green/yellow/red)
- Alerts when nearing or exceeding limits
- Automatic monthly reset

### Recurring Expenses
Add monthly bills that auto-add on their scheduled day:
- Set the day of month (1-28)
- Automatically creates expense entries
- Pause/resume anytime

### Income Tracking
Track all money coming in:
- Part-time jobs, freelance work, allowances
- See net balance (income - expenses)
- Separate from spending for better insights

### Search & Filter
- Search expenses/income by description
- Filter expenses by category
- Works in real-time as you type

## Tech Stack

- Frontend: React, Vite, Recharts, Framer Motion
- Backend: Python, FastAPI
- Database: Supabase (PostgreSQL)
- AI: OpenAI GPT-4.1-nano (I use OpenAI because I like it, but you can use free LLMs too!)

### Using Free LLMs Instead

The app uses OpenAI by default, but you can easily swap it for free alternatives:

- **Groq** - Free tier with fast inference (groq.com)
- **Ollama** - Run models locally (ollama.ai)
- **Hugging Face** - Free API access (huggingface.co)

Just modify `backend/app/llm.py` to use your preferred LLM's API. The prompt format is simple and works with any LLM that supports chat completions.

---

## License

MIT - Use it however you want.

---

**Made by Deva Anand** - Built with help from Cursor AI

Feel free to clone, fork, and make it your own.

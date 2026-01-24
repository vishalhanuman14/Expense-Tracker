# Spend · Expense Tracker

A beautiful, AI-powered expense tracker that automatically categorizes your spending using natural language input.

![Expense Tracker](https://img.shields.io/badge/status-ready-brightgreen)

## Features

- **Natural Language Input**: Just type "popeyes $12" and the AI will parse and categorize it
- **AI-Powered Categorization**: Uses OpenAI to automatically categorize expenses into 12 categories
- **Monthly Analytics**: Beautiful charts showing spending trends, category breakdowns, and daily patterns
- **Trend Analysis**: See where you're spending more over time
- **Local Storage**: Data stored in JSON for easy local testing (SQLite-ready for production)
- **Dark Theme**: Modern, sleek UI with amber accents

## Tech Stack

- **Frontend**: React 18 + Vite, Framer Motion, Recharts
- **Backend**: Python FastAPI
- **Storage**: JSON file (local), easily upgradeable to SQLite
- **AI**: OpenAI GPT-3.5-turbo for expense categorization

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- OpenAI API Key

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your OpenAI API key and auth password
echo "OPENAI_API_KEY=sk-your-api-key-here" > .env
echo "AUTH_PASSWORD=your-secret-password" >> .env

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Usage

1. Make sure your `.env` file in `backend/` has your OpenAI API key
2. Open http://localhost:5173 in your browser
3. If `AUTH_PASSWORD` is set, you'll see a login screen - enter your password
4. Start adding expenses using natural language!

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key for expense categorization |
| `AUTH_PASSWORD` | No | Password to protect add/edit/delete operations (recommended for hosting) |
| `SUPABASE_URL` | For production | Your Supabase project URL |
| `SUPABASE_KEY` | For production | Your Supabase anon/public key |

## Example Inputs

- `popeyes $12.50`
- `uber to airport $45`
- `netflix subscription $15.99`
- `groceries at costco $150`
- `coffee at starbucks $6.50 yesterday`

## Expense Categories

The AI automatically categorizes expenses into:

- 🍽️ Food & Dining
- 🛒 Groceries
- 🚗 Transportation
- 🎬 Entertainment
- 🛍️ Shopping
- 📱 Bills & Utilities
- 💊 Health & Medical
- ✈️ Travel
- 📚 Education
- 💅 Personal Care
- 📺 Subscriptions
- 📦 Other

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/categories` | List all categories |
| POST | `/expenses` | Create expense with AI categorization |
| GET | `/expenses` | List all expenses |
| GET | `/expenses?year=2024&month=1` | Filter by month |
| PUT | `/expenses/{id}` | Update expense |
| DELETE | `/expenses/{id}` | Delete expense |
| GET | `/analytics` | Get spending analytics |
| GET | `/analytics/months` | Get months with data |
| GET | `/analytics/trends` | Get monthly trends |

## Deployment (Free Hosting)

### Step 1: Push to GitHub

```bash
cd /Users/devaanand/Desktop/Coding\ Stuff/Expense\ Tracker
git init
git add .
git commit -m "Initial commit"
# Create a repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
git push -u origin main
```

### Step 2: Set Up Supabase Database (FREE)

1. Go to [supabase.com](https://supabase.com) → Sign up
2. Click **New Project** → Name it `expense-tracker`
3. Go to **SQL Editor** and run this:

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

4. Go to **Settings → API** and copy:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **anon public key**

### Step 3: Deploy Backend to Render (FREE)

1. Go to [render.com](https://render.com) and sign up
2. Click **New → Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `expense-tracker-api`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `OPENAI_API_KEY` = your OpenAI key
   - `AUTH_PASSWORD` = your secret password
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_KEY` = your Supabase anon key
6. Click **Create Web Service**
7. Copy your URL (e.g., `https://expense-tracker-api.onrender.com`)

### Step 4: Deploy Frontend to Vercel (FREE)

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **Add New → Project**
3. Import your GitHub repo
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Vite
5. Add Environment Variable:
   - `VITE_API_URL` = your Render backend URL (e.g., `https://expense-tracker-api.onrender.com`)
6. Click **Deploy**

### Done! 🎉

Your app is now live:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://expense-tracker-api.onrender.com`

### Cost Summary

| Service | Cost |
|---------|------|
| Vercel (Frontend) | **Free** |
| Render (Backend) | **Free** (spins down after 15min inactivity) |
| Supabase (Database) | **Free** (500MB) |
| OpenAI API | ~$0.01 per 50 expenses |
| **Total** | **~$0/month** for personal use |

> ⚠️ **Note**: Render free tier spins down after 15 minutes of inactivity. First request after sleep takes ~30 seconds. Upgrade to $7/month for always-on.

## License

MIT

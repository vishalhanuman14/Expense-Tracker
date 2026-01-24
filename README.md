# 💰 Spend - AI Expense Tracker

> **Made with ❤️ by Deva Anand** | Built with [Cursor AI](https://cursor.sh)

A beautiful, AI-powered expense tracker that automatically categorizes your spending using natural language. Just type "chipotle $14" and AI does the rest!

![Status](https://img.shields.io/badge/status-live-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Made with Cursor](https://img.shields.io/badge/made%20with-Cursor%20AI-blueviolet)

---

## ✨ Features

- 🧠 **AI-Powered Categorization** - Type naturally, AI categorizes automatically
- 📝 **Typo Correction** - AI fixes spelling mistakes in your input
- 📊 **Monthly Analytics** - Beautiful charts showing spending trends
- 🔐 **Password Protection** - Only you can add/edit expenses
- 👀 **Guest View Mode** - Others can view without editing
- 🌙 **Dark Theme** - Easy on the eyes
- 💸 **Free Hosting** - Runs on free tiers (Vercel + Render + Supabase)

---

## 🚀 Quick Start (For College Students!)

Want your own expense tracker? Follow these steps:

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://python.org/) (v3.9+)
- [Git](https://git-scm.com/)
- OpenAI API Key ([get one here](https://platform.openai.com/api-keys) - ~$5 lasts months!)

### 1️⃣ Clone the Repo

```bash
git clone https://github.com/Deva-1903/Expense-Tracker.git
cd Expense-Tracker
```

### 2️⃣ Set Up Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "OPENAI_API_KEY=sk-your-key-here" > .env
echo "AUTH_PASSWORD=your-password" >> .env

# Run the server
uvicorn app.main:app --reload --port 8000
```

### 3️⃣ Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run the app
npm run dev
```

### 4️⃣ Open in Browser

Go to **http://localhost:5173** and start tracking! 🎉

---

## 📱 How to Use

Just type your expenses naturally:

| Input | AI Output |
|-------|-----------|
| `chipotle $14` | 🍽️ Chipotle - Food & Dining - $14.00 |
| `uber to campus $8` | 🚗 Uber to Campus - Transportation - $8.00 |
| `rent $850 on jan 1` | 🏠 Rent - Rent & Housing - $850.00 (Jan 1) |
| `beer at bar $25 yesterday` | 🍺 Beer at Bar - Alcohol & Bars - $25.00 |
| `starbuks cofee $6` | ☕ Starbucks Coffee - Food & Dining - $6.00 |

The AI automatically:
- ✅ Fixes typos
- ✅ Picks the right category
- ✅ Parses dates from natural language
- ✅ Formats descriptions nicely

---

## 📂 Categories

| Category | Icon | Examples |
|----------|------|----------|
| Rent & Housing | 🏠 | Rent, furniture |
| Utilities | 💡 | Electric, internet, phone |
| Groceries | 🛒 | Walmart, Trader Joe's |
| Food & Dining | 🍽️ | Restaurants, DoorDash, coffee |
| Transportation | 🚗 | Gas, Uber, parking |
| Alcohol & Bars | 🍺 | Bars, liquor store |
| Tobacco & Vapes | 🚬 | Cigarettes, vapes |
| Entertainment | 🎬 | Movies, concerts, games |
| Subscriptions | 📺 | Netflix, Spotify, gym |
| Shopping | 🛍️ | Amazon, clothes |
| Health & Fitness | 💪 | Gym, pharmacy |
| Personal Care | 💅 | Haircuts, toiletries |
| Education | 📚 | Books, courses |
| Travel | ✈️ | Flights, hotels |
| Gifts & Donations | 🎁 | Presents, tips |

---

## 🌐 Deploy Your Own (FREE!)

### Step 1: Fork & Clone
Fork this repo to your GitHub, then clone it.

### Step 2: Set Up Supabase (Database - FREE)
1. Go to [supabase.com](https://supabase.com) → Create account
2. New Project → Name it `expense-tracker`
3. SQL Editor → Run:

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

4. Settings → API → Copy **URL** and **anon key**

### Step 3: Deploy Backend (Render - FREE)
1. Go to [render.com](https://render.com) → Connect GitHub
2. New → Web Service → Select your repo
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables:
   - `OPENAI_API_KEY` = your key
   - `AUTH_PASSWORD` = your password
   - `SUPABASE_URL` = from step 2
   - `SUPABASE_KEY` = from step 2

### Step 4: Deploy Frontend (Vercel - FREE)
1. Go to [vercel.com](https://vercel.com) → Connect GitHub
2. Import your repo
3. Settings:
   - **Root Directory**: `frontend`
4. Environment Variables:
   - `VITE_API_URL` = your Render URL (e.g., `https://your-app.onrender.com`)
5. Deploy!

### 💰 Total Cost: $0/month
| Service | Cost |
|---------|------|
| Vercel | Free |
| Render | Free |
| Supabase | Free (500MB) |
| OpenAI | ~$0.01 per 50 expenses |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Framer Motion, Recharts
- **Backend**: Python, FastAPI
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4.1-nano
- **Hosting**: Vercel + Render

---

## 🤝 Contributing

Feel free to fork, clone, and make it your own! PRs welcome.

```bash
# Fork this repo
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Expense-Tracker.git

# Make changes
# Push and create PR
```

---

## 📄 License

MIT License - Use it however you want!

---

<div align="center">

### Made by **Deva Anand** 🚀

*A college student who wanted to track spending better*

*Built with the help of [Cursor AI](https://cursor.sh) - the AI-first code editor*

**⭐ Star this repo if you found it helpful!**

</div>

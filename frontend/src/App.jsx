import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ExpenseInput from './components/ExpenseInput'
import ExpenseList from './components/ExpenseList'
import Analytics from './components/Analytics'
import ErrorPopup from './components/ErrorPopup'
import Login from './components/Login'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [expenses, setExpenses] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [trends, setTrends] = useState([])
  const [availableMonths, setAvailableMonths] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [activeTab, setActiveTab] = useState('expenses')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Auth state
  const [authRequired, setAuthRequired] = useState(false)
  const [authPassword, setAuthPassword] = useState(() => sessionStorage.getItem('auth_password') || '')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isViewOnly, setIsViewOnly] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Check if auth is required on mount
  useEffect(() => {
    checkAuthRequired()
  }, [])

  // Fetch data once authenticated, view-only, or if no auth required
  useEffect(() => {
    if (!checkingAuth && (isAuthenticated || isViewOnly || !authRequired)) {
      fetchExpenses()
      fetchAnalytics()
      fetchTrends()
      fetchAvailableMonths()
    }
  }, [selectedMonth, isAuthenticated, isViewOnly, authRequired, checkingAuth])

  const checkAuthRequired = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/check`)
      const data = await res.json()
      setAuthRequired(data.auth_required)
      
      // If auth required and we have stored password, verify it
      if (data.auth_required && authPassword) {
        const verifyRes = await fetch(`${API_URL}/auth/verify`, {
          method: 'POST',
          headers: { 'X-Auth-Password': authPassword }
        })
        if (verifyRes.ok) {
          setIsAuthenticated(true)
        } else {
          sessionStorage.removeItem('auth_password')
          setAuthPassword('')
        }
      } else if (!data.auth_required) {
        setIsAuthenticated(true)
      }
    } catch (err) {
      console.error('Failed to check auth:', err)
    } finally {
      setCheckingAuth(false)
    }
  }

  const handleLogin = (password) => {
    setAuthPassword(password)
    sessionStorage.setItem('auth_password', password)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setAuthPassword('')
    sessionStorage.removeItem('auth_password')
    setIsAuthenticated(false)
    setIsViewOnly(false)
  }

  const handleViewOnly = () => {
    setIsViewOnly(true)
  }

  const getAuthHeaders = () => {
    const headers = { 'Content-Type': 'application/json' }
    if (authPassword) {
      headers['X-Auth-Password'] = authPassword
    }
    return headers
  }

  const fetchExpenses = async () => {
    try {
      let url = `${API_URL}/expenses`
      if (selectedMonth) {
        const [year, month] = selectedMonth.split('-')
        url += `?year=${year}&month=${month}`
      }
      const res = await fetch(url)
      const data = await res.json()
      setExpenses(data.expenses || [])
    } catch (err) {
      console.error('Failed to fetch expenses:', err)
    }
  }

  const fetchAnalytics = async () => {
    try {
      let url = `${API_URL}/analytics`
      if (selectedMonth) {
        const [year, month] = selectedMonth.split('-')
        url += `?year=${year}&month=${month}`
      }
      const res = await fetch(url)
      const data = await res.json()
      setAnalytics(data)
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    }
  }

  const fetchTrends = async () => {
    try {
      const res = await fetch(`${API_URL}/analytics/trends`)
      const data = await res.json()
      setTrends(data.trends || [])
    } catch (err) {
      console.error('Failed to fetch trends:', err)
    }
  }

  const fetchAvailableMonths = async () => {
    try {
      const res = await fetch(`${API_URL}/analytics/months`)
      const data = await res.json()
      setAvailableMonths(data.months || [])
    } catch (err) {
      console.error('Failed to fetch months:', err)
    }
  }

  const addExpense = async (rawInput) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ raw_input: rawInput })
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        const errorMessage = errorData.detail || 'Failed to add expense'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
      
      const data = await res.json()
      
      // Refresh data
      await Promise.all([fetchExpenses(), fetchAnalytics(), fetchTrends(), fetchAvailableMonths()])
      
      return { success: true, expense: data.expense }
    } catch (err) {
      console.error('Failed to add expense:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }

  const deleteExpense = async (id) => {
    try {
      await fetch(`${API_URL}/expenses/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      await Promise.all([fetchExpenses(), fetchAnalytics(), fetchTrends()])
    } catch (err) {
      console.error('Failed to delete expense:', err)
    }
  }

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="app loading-screen">
        <div className="loading-spinner-large" />
      </div>
    )
  }

  // Show login if auth required and not authenticated and not view-only
  if (authRequired && !isAuthenticated && !isViewOnly) {
    return <Login onLogin={handleLogin} onViewOnly={handleViewOnly} />
  }

  // Check if user can edit (authenticated or no auth required)
  const canEdit = isAuthenticated || !authRequired

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">Spend</span>
          </div>
          <nav className="nav">
            <button
              className={`nav-btn ${activeTab === 'expenses' ? 'active' : ''}`}
              onClick={() => setActiveTab('expenses')}
            >
              Expenses
            </button>
            <button
              className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </nav>
          {(isAuthenticated || isViewOnly) && authRequired && (
            <button className="logout-btn" onClick={handleLogout} title={isViewOnly ? "Sign in" : "Logout"}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          )}
          {!authRequired && <div className="logo-accent">◈</div>}
        </div>
      </header>

      <main className="main">
        <AnimatePresence mode="wait">
          {activeTab === 'expenses' && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="tab-content"
            >
              {canEdit && <ExpenseInput onAdd={addExpense} isLoading={isLoading} />}
              
              {isViewOnly && (
                <div className="view-only-banner">
                  <span>👁️ View-only mode</span>
                  <button onClick={() => { setIsViewOnly(false) }}>Sign in to edit</button>
                </div>
              )}
              
              <div className="month-filter">
                <button
                  className={`month-btn ${!selectedMonth ? 'active' : ''}`}
                  onClick={() => setSelectedMonth(null)}
                >
                  All Time
                </button>
                {availableMonths.slice(0, 6).map(month => (
                  <button
                    key={month}
                    className={`month-btn ${selectedMonth === month ? 'active' : ''}`}
                    onClick={() => setSelectedMonth(month)}
                  >
                    {formatMonth(month)}
                  </button>
                ))}
              </div>

              <ExpenseList 
                expenses={expenses} 
                onDelete={canEdit ? deleteExpense : null}
                analytics={analytics}
              />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="tab-content"
            >
              <Analytics 
                analytics={analytics} 
                trends={trends}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
                availableMonths={availableMonths}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {error && (
          <ErrorPopup
            message={error}
            onClose={() => setError(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function formatMonth(monthStr) {
  const [year, month] = monthStr.split('-')
  const date = new Date(year, month - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export default App

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ExpenseInput from './components/ExpenseInput'
import ExpenseList from './components/ExpenseList'
import IncomeList from './components/IncomeList'
import Analytics from './components/Analytics'
import BudgetManager from './components/BudgetManager'
import RecurringManager from './components/RecurringManager'
import ErrorPopup from './components/ErrorPopup'
import Login from './components/Login'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const CATEGORIES = [
  'Rent & Housing', 'Utilities', 'Groceries', 'Food & Dining', 'Transportation',
  'Alcohol & Bars', 'Tobacco & Vapes', 'Entertainment', 'Subscriptions',
  'Shopping', 'Health & Fitness', 'Personal Care', 'Education', 'Travel',
  'Gifts & Donations', 'Other'
]

function App() {
  const [expenses, setExpenses] = useState([])
  const [income, setIncome] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [trends, setTrends] = useState([])
  const [availableMonths, setAvailableMonths] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [activeTab, setActiveTab] = useState('expenses')
  const [activeSubTab, setActiveSubTab] = useState('spending')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Budget & Recurring state
  const [budgets, setBudgets] = useState([])
  const [budgetStatus, setBudgetStatus] = useState([])
  const [recurring, setRecurring] = useState([])
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  
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
      fetchIncome()
      fetchAnalytics()
      fetchTrends()
      fetchAvailableMonths()
      fetchBudgets()
      fetchBudgetStatus()
      fetchRecurring()
      // Process recurring expenses on load
      if (isAuthenticated || !authRequired) {
        processRecurring()
      }
    }
  }, [selectedMonth, isAuthenticated, isViewOnly, authRequired, checkingAuth])

  // Filtered expenses based on search and category
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = !searchQuery || 
        expense.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = !categoryFilter || expense.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [expenses, searchQuery, categoryFilter])

  // Filtered income based on search
  const filteredIncome = useMemo(() => {
    return income.filter(item => {
      return !searchQuery || 
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    })
  }, [income, searchQuery])

  const checkAuthRequired = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/check`)
      const data = await res.json()
      setAuthRequired(data.auth_required)
      
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

  // ============ Fetch Functions ============

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

  const fetchIncome = async () => {
    try {
      let url = `${API_URL}/income`
      if (selectedMonth) {
        const [year, month] = selectedMonth.split('-')
        url += `?year=${year}&month=${month}`
      }
      const res = await fetch(url)
      const data = await res.json()
      setIncome(data.income || [])
    } catch (err) {
      console.error('Failed to fetch income:', err)
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

  const fetchBudgets = async () => {
    try {
      const res = await fetch(`${API_URL}/budgets`)
      const data = await res.json()
      setBudgets(data.budgets || [])
    } catch (err) {
      console.error('Failed to fetch budgets:', err)
    }
  }

  const fetchBudgetStatus = async () => {
    try {
      const now = new Date()
      const year = selectedMonth ? parseInt(selectedMonth.split('-')[0]) : now.getFullYear()
      const month = selectedMonth ? parseInt(selectedMonth.split('-')[1]) : now.getMonth() + 1
      
      const res = await fetch(`${API_URL}/budgets/status/${year}/${month}`)
      const data = await res.json()
      setBudgetStatus(data.budget_status || [])
    } catch (err) {
      console.error('Failed to fetch budget status:', err)
    }
  }

  const fetchRecurring = async () => {
    try {
      const res = await fetch(`${API_URL}/recurring`)
      const data = await res.json()
      setRecurring(data.recurring || [])
    } catch (err) {
      console.error('Failed to fetch recurring:', err)
    }
  }

  const processRecurring = async () => {
    try {
      await fetch(`${API_URL}/recurring/process`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
    } catch (err) {
      console.error('Failed to process recurring:', err)
    }
  }

  const refreshAllData = () => {
    return Promise.all([
      fetchExpenses(), fetchIncome(), fetchAnalytics(), 
      fetchTrends(), fetchAvailableMonths(), fetchBudgetStatus()
    ])
  }

  // ============ Expense CRUD ============

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
      await refreshAllData()
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
      await refreshAllData()
    } catch (err) {
      console.error('Failed to delete expense:', err)
    }
  }

  const updateExpense = async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.detail || 'Failed to update expense')
        return false
      }
      
      await refreshAllData()
      return true
    } catch (err) {
      console.error('Failed to update expense:', err)
      setError(err.message)
      return false
    }
  }

  // ============ Income CRUD ============

  const addIncome = async (rawInput) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/income`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ raw_input: rawInput })
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        const errorMessage = errorData.detail || 'Failed to add income'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
      
      const data = await res.json()
      await refreshAllData()
      return { success: true, income: data.income }
    } catch (err) {
      console.error('Failed to add income:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }

  const deleteIncome = async (id) => {
    try {
      await fetch(`${API_URL}/income/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      await refreshAllData()
    } catch (err) {
      console.error('Failed to delete income:', err)
    }
  }

  const updateIncome = async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/income/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.detail || 'Failed to update income')
        return false
      }
      
      await refreshAllData()
      return true
    } catch (err) {
      console.error('Failed to update income:', err)
      setError(err.message)
      return false
    }
  }

  // ============ Budget CRUD ============

  const addBudget = async (budgetData) => {
    try {
      const res = await fetch(`${API_URL}/budgets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(budgetData)
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.detail || 'Failed to add budget')
        return false
      }
      
      await fetchBudgets()
      await fetchBudgetStatus()
      return true
    } catch (err) {
      console.error('Failed to add budget:', err)
      setError(err.message)
      return false
    }
  }

  const updateBudget = async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/budgets/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.detail || 'Failed to update budget')
        return false
      }
      
      await fetchBudgets()
      await fetchBudgetStatus()
      return true
    } catch (err) {
      console.error('Failed to update budget:', err)
      setError(err.message)
      return false
    }
  }

  const deleteBudget = async (id) => {
    try {
      await fetch(`${API_URL}/budgets/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      await fetchBudgets()
      await fetchBudgetStatus()
    } catch (err) {
      console.error('Failed to delete budget:', err)
    }
  }

  // ============ Recurring CRUD ============

  const addRecurring = async (recurringData) => {
    try {
      const res = await fetch(`${API_URL}/recurring`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(recurringData)
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.detail || 'Failed to add recurring expense')
        return false
      }
      
      await fetchRecurring()
      return true
    } catch (err) {
      console.error('Failed to add recurring:', err)
      setError(err.message)
      return false
    }
  }

  const updateRecurring = async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/recurring/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.detail || 'Failed to update recurring expense')
        return false
      }
      
      await fetchRecurring()
      return true
    } catch (err) {
      console.error('Failed to update recurring:', err)
      setError(err.message)
      return false
    }
  }

  const deleteRecurring = async (id) => {
    try {
      await fetch(`${API_URL}/recurring/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      await fetchRecurring()
    } catch (err) {
      console.error('Failed to delete recurring:', err)
    }
  }

  const handleProcessRecurring = async () => {
    try {
      const res = await fetch(`${API_URL}/recurring/process`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      const data = await res.json()
      if (data.added_count > 0) {
        await refreshAllData()
      }
    } catch (err) {
      console.error('Failed to process recurring:', err)
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

  const canEdit = isAuthenticated || !authRequired

  // Get budget warnings for current view
  const budgetWarnings = budgetStatus.filter(b => b.status === 'warning' || b.status === 'exceeded')

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
              Tracker
            </button>
            <button
              className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
            <button
              className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
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
              {/* Balance Summary */}
              {analytics && (
                <div className="balance-summary">
                  <div className="balance-card income-card">
                    <span className="balance-label">Income</span>
                    <span className="balance-value income">+${(analytics.total_income || 0).toLocaleString()}</span>
                  </div>
                  <div className="balance-card expense-card">
                    <span className="balance-label">Expenses</span>
                    <span className="balance-value expense">-${(analytics.total_spent || 0).toLocaleString()}</span>
                  </div>
                  <div className="balance-card net-card">
                    <span className="balance-label">Net Balance</span>
                    <span className={`balance-value ${(analytics.net_balance || 0) >= 0 ? 'positive' : 'negative'}`}>
                      {(analytics.net_balance || 0) >= 0 ? '+' : ''}${(analytics.net_balance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Budget Alerts */}
              {budgetWarnings.length > 0 && (
                <div className="budget-alerts">
                  {budgetWarnings.map(b => (
                    <div key={b.id} className={`budget-alert ${b.status}`}>
                      <span className="alert-icon">{b.status === 'exceeded' ? '🚨' : '⚠️'}</span>
                      <span className="alert-text">
                        <strong>{b.category}</strong>: ${b.spent} of ${b.monthly_limit} 
                        ({b.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-tabs for Spending/Income */}
              <div className="sub-tabs">
                <button
                  className={`sub-tab ${activeSubTab === 'spending' ? 'active' : ''}`}
                  onClick={() => setActiveSubTab('spending')}
                >
                  💸 Spending
                </button>
                <button
                  className={`sub-tab ${activeSubTab === 'income' ? 'active income-tab' : ''}`}
                  onClick={() => setActiveSubTab('income')}
                >
                  💰 Income
                </button>
              </div>

              {canEdit && (
                <ExpenseInput 
                  onAdd={activeSubTab === 'spending' ? addExpense : addIncome} 
                  isLoading={isLoading}
                  placeholder={activeSubTab === 'spending' 
                    ? "e.g., Starbucks coffee $5.50" 
                    : "e.g., Paycheck from work $250"
                  }
                  isIncome={activeSubTab === 'income'}
                />
              )}
              
              {isViewOnly && (
                <div className="view-only-banner">
                  <span>👁️ View-only mode</span>
                  <button onClick={() => { setIsViewOnly(false) }}>Sign in to edit</button>
                </div>
              )}

              {/* Search & Filter Bar */}
              <div className="filter-bar">
                <div className="search-box">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="clear-search" onClick={() => setSearchQuery('')}>×</button>
                  )}
                </div>
                
                {activeSubTab === 'spending' && (
                  <select
                    className="category-filter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}
              </div>
              
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

              {activeSubTab === 'spending' ? (
                <ExpenseList 
                  expenses={filteredExpenses} 
                  onDelete={canEdit ? deleteExpense : null}
                  onEdit={canEdit ? updateExpense : null}
                  analytics={null}
                />
              ) : (
                <IncomeList 
                  income={filteredIncome}
                  onDelete={canEdit ? deleteIncome : null}
                  onEdit={canEdit ? updateIncome : null}
                />
              )}
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

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="tab-content settings-tab"
            >
              <BudgetManager
                budgets={budgets}
                budgetStatus={budgetStatus}
                onAdd={addBudget}
                onUpdate={updateBudget}
                onDelete={deleteBudget}
                canEdit={canEdit}
              />
              
              <RecurringManager
                recurring={recurring}
                onAdd={addRecurring}
                onUpdate={updateRecurring}
                onDelete={deleteRecurring}
                onProcess={handleProcessRecurring}
                canEdit={canEdit}
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

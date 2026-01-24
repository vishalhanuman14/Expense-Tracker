import { motion, AnimatePresence } from 'framer-motion'
import './ExpenseList.css'

const categoryIcons = {
  'Rent & Housing': '🏠',
  'Utilities': '💡',
  'Groceries': '🛒',
  'Food & Dining': '🍽️',
  'Transportation': '🚗',
  'Alcohol & Bars': '🍺',
  'Tobacco & Vapes': '🚬',
  'Entertainment': '🎬',
  'Subscriptions': '📺',
  'Shopping': '🛍️',
  'Health & Fitness': '💪',
  'Personal Care': '💅',
  'Education': '📚',
  'Travel': '✈️',
  'Gifts & Donations': '🎁',
  'Other': '📦'
}

const categoryColors = {
  'Rent & Housing': '#8b5cf6',
  'Utilities': '#6366f1',
  'Groceries': '#22c55e',
  'Food & Dining': '#f59e0b',
  'Transportation': '#3b82f6',
  'Alcohol & Bars': '#dc2626',
  'Tobacco & Vapes': '#78716c',
  'Entertainment': '#a855f7',
  'Subscriptions': '#14b8a6',
  'Shopping': '#ec4899',
  'Health & Fitness': '#10b981',
  'Personal Care': '#f472b6',
  'Education': '#0ea5e9',
  'Travel': '#06b6d4',
  'Gifts & Donations': '#f43f5e',
  'Other': '#71717a'
}

function ExpenseList({ expenses, onDelete, analytics }) {
  if (expenses.length === 0) {
    return (
      <div className="expense-list-empty">
        <div className="empty-icon">◇</div>
        <h3>No expenses yet</h3>
        <p>Add your first expense above to get started</p>
      </div>
    )
  }

  return (
    <div className="expense-list-container">
      {analytics && (
        <div className="summary-bar">
          <div className="summary-item">
            <span className="summary-label">Total Spent</span>
            <span className="summary-value">${analytics.total_spent.toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Expenses</span>
            <span className="summary-value">{analytics.expense_count}</span>
          </div>
          {analytics.top_categories?.[0] && (
            <div className="summary-item">
              <span className="summary-label">Top Category</span>
              <span className="summary-value top-category">
                {categoryIcons[analytics.top_categories[0].category]} {analytics.top_categories[0].category}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="expense-list">
        <AnimatePresence>
          {expenses.map((expense, index) => (
            <motion.div
              key={expense.id}
              className="expense-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.03 }}
              layout
            >
              <div 
                className="expense-category-icon"
                style={{ 
                  background: `${categoryColors[expense.category]}20`,
                  color: categoryColors[expense.category]
                }}
              >
                {categoryIcons[expense.category] || '📦'}
              </div>
              
              <div className="expense-details">
                <div className="expense-description">{expense.description}</div>
                <div className="expense-meta">
                  <span 
                    className="expense-category-tag"
                    style={{ 
                      background: `${categoryColors[expense.category]}15`,
                      color: categoryColors[expense.category]
                    }}
                  >
                    {expense.category}
                  </span>
                  <span className="expense-date">{formatDate(expense.date)}</span>
                </div>
              </div>
              
              <div className="expense-amount">
                ${expense.amount.toFixed(2)}
              </div>
              
              {onDelete && (
                <button
                  className="delete-btn"
                  onClick={() => onDelete(expense.id)}
                  title="Delete expense"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                  </svg>
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function formatDate(dateStr) {
  // Parse date string manually to avoid timezone issues
  // "2026-01-17" should display as Jan 17, not Jan 16
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day) // month is 0-indexed
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.getTime() === today.getTime()) {
    return 'Today'
  } else if (date.getTime() === yesterday.getTime()) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

export default ExpenseList

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ExpenseList.css'

const CATEGORIES = [
  'Rent & Housing',
  'Utilities',
  'Groceries',
  'Food & Dining',
  'Transportation',
  'Alcohol & Bars',
  'Tobacco & Vapes',
  'Entertainment',
  'Subscriptions',
  'Shopping',
  'Health & Fitness',
  'Personal Care',
  'Education',
  'Travel',
  'Gifts & Donations',
  'Other'
]

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

function ExpenseList({ expenses, onDelete, onEdit, analytics }) {
  const [editingExpense, setEditingExpense] = useState(null)
  const [editForm, setEditForm] = useState({
    description: '',
    amount: '',
    category: '',
    date: ''
  })

  const openEditModal = (expense) => {
    setEditingExpense(expense)
    setEditForm({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date.split('T')[0]
    })
  }

  const closeEditModal = () => {
    setEditingExpense(null)
    setEditForm({ description: '', amount: '', category: '', date: '' })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingExpense || !onEdit) return

    await onEdit(editingExpense.id, {
      description: editForm.description,
      amount: parseFloat(editForm.amount),
      category: editForm.category,
      date: editForm.date
    })
    closeEditModal()
  }

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
              
              <div className="expense-actions">
                {onEdit && (
                  <button
                    className="edit-btn"
                    onClick={() => openEditModal(expense)}
                    title="Edit expense"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                )}
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
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingExpense && (
          <motion.div
            className="edit-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeEditModal}
          >
            <motion.div
              className="edit-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="edit-modal-header">
                <h3>Edit Expense</h3>
                <button className="close-modal-btn" onClick={closeEditModal}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="edit-form">
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {categoryIcons[cat]} {cat}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="edit-modal-actions">
                  <button type="button" className="cancel-btn" onClick={closeEditModal}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return 'Unknown'
  
  const datePart = dateStr.split('T')[0]
  const parts = datePart.split('-')
  if (parts.length !== 3) return dateStr
  
  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10)
  const day = parseInt(parts[2], 10)
  
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

  if (datePart === todayStr) {
    return 'Today'
  } else if (datePart === yesterdayStr) {
    return 'Yesterday'
  } else {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[month - 1]} ${day}`
  }
}

export default ExpenseList

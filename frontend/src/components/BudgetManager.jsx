import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './BudgetManager.css'

const CATEGORIES = [
  'Rent & Housing', 'Utilities', 'Groceries', 'Food & Dining', 'Transportation',
  'Alcohol & Bars', 'Tobacco & Vapes', 'Entertainment', 'Subscriptions',
  'Shopping', 'Health & Fitness', 'Personal Care', 'Education', 'Travel',
  'Gifts & Donations', 'Other'
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

function BudgetManager({ budgets, budgetStatus, onAdd, onUpdate, onDelete, canEdit }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ category: '', monthly_limit: '' })

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.category || !form.monthly_limit) return
    
    await onAdd({
      category: form.category,
      monthly_limit: parseFloat(form.monthly_limit)
    })
    setForm({ category: '', monthly_limit: '' })
    setIsAdding(false)
  }

  const handleUpdate = async (id) => {
    await onUpdate(id, {
      monthly_limit: parseFloat(form.monthly_limit)
    })
    setEditingId(null)
    setForm({ category: '', monthly_limit: '' })
  }

  const startEdit = (budget) => {
    setEditingId(budget.id)
    setForm({ category: budget.category, monthly_limit: budget.monthly_limit.toString() })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ category: '', monthly_limit: '' })
  }

  // Get categories that don't have budgets yet
  const availableCategories = CATEGORIES.filter(
    cat => !budgets.some(b => b.category === cat)
  )

  // Merge budgets with status
  const budgetsWithStatus = budgets.map(budget => {
    const status = budgetStatus?.find(s => s.id === budget.id)
    return { ...budget, ...status }
  })

  return (
    <div className="budget-manager">
      <div className="section-header">
        <h3>Monthly Budgets</h3>
        {canEdit && !isAdding && availableCategories.length > 0 && (
          <button className="add-btn" onClick={() => setIsAdding(true)}>
            + Add Budget
          </button>
        )}
      </div>

      {/* Add Budget Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            className="budget-form"
            onSubmit={handleAdd}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{categoryIcons[cat]} {cat}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Monthly limit ($)"
              value={form.monthly_limit}
              onChange={(e) => setForm({ ...form, monthly_limit: e.target.value })}
              min="0"
              step="0.01"
              required
            />
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => setIsAdding(false)}>
                Cancel
              </button>
              <button type="submit" className="save-btn">Add</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Budget List */}
      {budgetsWithStatus.length === 0 ? (
        <div className="empty-state">
          <p>No budgets set. Add a budget to track your spending limits.</p>
        </div>
      ) : (
        <div className="budget-list">
          {budgetsWithStatus.map(budget => (
            <motion.div
              key={budget.id}
              className={`budget-item ${budget.status || 'ok'}`}
              layout
            >
              {editingId === budget.id ? (
                <div className="budget-edit">
                  <span className="budget-category">
                    {categoryIcons[budget.category]} {budget.category}
                  </span>
                  <input
                    type="number"
                    value={form.monthly_limit}
                    onChange={(e) => setForm({ ...form, monthly_limit: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                  <div className="edit-actions">
                    <button className="cancel-btn" onClick={cancelEdit}>✕</button>
                    <button className="save-btn" onClick={() => handleUpdate(budget.id)}>✓</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="budget-info">
                    <div className="budget-category">
                      <span className="category-icon">{categoryIcons[budget.category]}</span>
                      <span>{budget.category}</span>
                    </div>
                    <div className="budget-amounts">
                      <span className="spent">${(budget.spent || 0).toFixed(0)}</span>
                      <span className="separator">/</span>
                      <span className="limit">${budget.monthly_limit.toFixed(0)}</span>
                    </div>
                  </div>
                  
                  <div className="progress-bar-container">
                    <div 
                      className={`progress-bar ${budget.status || 'ok'}`}
                      style={{ width: `${Math.min(budget.percentage || 0, 100)}%` }}
                    />
                  </div>
                  
                  <div className="budget-footer">
                    <span className={`status-badge ${budget.status || 'ok'}`}>
                      {budget.percentage >= 100 ? 'Over budget!' : 
                       budget.percentage >= 80 ? 'Nearing limit' : 
                       `${(budget.percentage || 0).toFixed(0)}% used`}
                    </span>
                    {canEdit && (
                      <div className="budget-actions">
                        <button className="edit-btn" onClick={() => startEdit(budget)}>
                          Edit
                        </button>
                        <button className="delete-btn" onClick={() => onDelete(budget.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BudgetManager

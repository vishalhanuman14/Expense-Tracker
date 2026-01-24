import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './RecurringManager.css'

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

function RecurringManager({ recurring, onAdd, onUpdate, onDelete, onProcess, canEdit }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: '',
    day_of_month: ''
  })

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.description || !form.amount || !form.category || !form.day_of_month) return
    
    await onAdd({
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category,
      day_of_month: parseInt(form.day_of_month)
    })
    setForm({ description: '', amount: '', category: '', day_of_month: '' })
    setIsAdding(false)
  }

  const handleUpdate = async (id) => {
    await onUpdate(id, {
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category,
      day_of_month: parseInt(form.day_of_month)
    })
    setEditingId(null)
    setForm({ description: '', amount: '', category: '', day_of_month: '' })
  }

  const toggleActive = async (item) => {
    await onUpdate(item.id, { is_active: !item.is_active })
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setForm({
      description: item.description,
      amount: item.amount.toString(),
      category: item.category,
      day_of_month: item.day_of_month.toString()
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ description: '', amount: '', category: '', day_of_month: '' })
  }

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th'
    switch (day % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }

  return (
    <div className="recurring-manager">
      <div className="section-header">
        <h3>Recurring Expenses</h3>
        <div className="header-actions">
          {canEdit && onProcess && (
            <button className="process-btn" onClick={onProcess} title="Add pending recurring expenses">
              🔄 Process Now
            </button>
          )}
          {canEdit && !isAdding && (
            <button className="add-btn" onClick={() => setIsAdding(true)}>
              + Add Recurring
            </button>
          )}
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            className="recurring-form"
            onSubmit={handleAdd}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              type="text"
              placeholder="Description (e.g., Rent, Netflix)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Amount ($)"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              min="0"
              step="0.01"
              required
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">Category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{categoryIcons[cat]} {cat}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Day of month (1-28)"
              value={form.day_of_month}
              onChange={(e) => setForm({ ...form, day_of_month: e.target.value })}
              min="1"
              max="28"
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

      {/* Recurring List */}
      {recurring.length === 0 ? (
        <div className="empty-state">
          <p>No recurring expenses. Add bills that repeat monthly.</p>
        </div>
      ) : (
        <div className="recurring-list">
          {recurring.map(item => (
            <motion.div
              key={item.id}
              className={`recurring-item ${item.is_active ? 'active' : 'inactive'}`}
              layout
            >
              {editingId === item.id ? (
                <div className="recurring-edit">
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Description"
                  />
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="Amount"
                    min="0"
                    step="0.01"
                  />
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={form.day_of_month}
                    onChange={(e) => setForm({ ...form, day_of_month: e.target.value })}
                    placeholder="Day"
                    min="1"
                    max="28"
                  />
                  <div className="edit-actions">
                    <button className="cancel-btn" onClick={cancelEdit}>✕</button>
                    <button className="save-btn" onClick={() => handleUpdate(item.id)}>✓</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="recurring-icon">
                    {categoryIcons[item.category] || '📦'}
                  </div>
                  
                  <div className="recurring-info">
                    <div className="recurring-description">{item.description}</div>
                    <div className="recurring-meta">
                      <span className="recurring-category">{item.category}</span>
                      <span className="recurring-schedule">
                        {item.day_of_month}{getOrdinalSuffix(item.day_of_month)} of each month
                      </span>
                    </div>
                  </div>
                  
                  <div className="recurring-amount">
                    ${item.amount.toFixed(2)}
                  </div>
                  
                  {canEdit && (
                    <div className="recurring-actions">
                      <button 
                        className={`toggle-btn ${item.is_active ? 'active' : ''}`}
                        onClick={() => toggleActive(item)}
                        title={item.is_active ? 'Pause' : 'Resume'}
                      >
                        {item.is_active ? '⏸' : '▶️'}
                      </button>
                      <button className="edit-btn" onClick={() => startEdit(item)}>
                        ✏️
                      </button>
                      <button className="delete-btn" onClick={() => onDelete(item.id)}>
                        🗑️
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}
      
      <p className="recurring-info-text">
        💡 Recurring expenses are auto-added on their scheduled day each month.
      </p>
    </div>
  )
}

export default RecurringManager

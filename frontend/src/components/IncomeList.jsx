import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './IncomeList.css'

const INCOME_SOURCES = [
  'Part-time Job',
  'Freelance',
  'Allowance',
  'Venmo/Zelle',
  'Scholarship',
  'Refund',
  'Gift',
  'Other'
]

const sourceIcons = {
  'Part-time Job': '💼',
  'Freelance': '💻',
  'Allowance': '👨‍👩‍👧',
  'Venmo/Zelle': '📱',
  'Scholarship': '🎓',
  'Refund': '↩️',
  'Gift': '🎁',
  'Other': '💰'
}

const sourceColors = {
  'Part-time Job': '#22c55e',
  'Freelance': '#3b82f6',
  'Allowance': '#a855f7',
  'Venmo/Zelle': '#14b8a6',
  'Scholarship': '#f59e0b',
  'Refund': '#6366f1',
  'Gift': '#ec4899',
  'Other': '#71717a'
}

function IncomeList({ income, onDelete, onEdit }) {
  const [editingIncome, setEditingIncome] = useState(null)
  const [editForm, setEditForm] = useState({
    description: '',
    amount: '',
    source: '',
    date: ''
  })

  const openEditModal = (item) => {
    setEditingIncome(item)
    setEditForm({
      description: item.description,
      amount: item.amount.toString(),
      source: item.source,
      date: item.date.split('T')[0]
    })
  }

  const closeEditModal = () => {
    setEditingIncome(null)
    setEditForm({ description: '', amount: '', source: '', date: '' })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingIncome || !onEdit) return

    await onEdit(editingIncome.id, {
      description: editForm.description,
      amount: parseFloat(editForm.amount),
      source: editForm.source,
      date: editForm.date
    })
    closeEditModal()
  }

  if (income.length === 0) {
    return (
      <div className="income-list-empty">
        <div className="empty-icon">💰</div>
        <h3>No income recorded</h3>
        <p>Add your income sources above</p>
      </div>
    )
  }

  return (
    <div className="income-list-container">
      <div className="income-list">
        <AnimatePresence>
          {income.map((item, index) => (
            <motion.div
              key={item.id}
              className="income-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.03 }}
              layout
            >
              <div 
                className="income-source-icon"
                style={{ 
                  background: `${sourceColors[item.source]}20`,
                  color: sourceColors[item.source]
                }}
              >
                {sourceIcons[item.source] || '💰'}
              </div>
              
              <div className="income-details">
                <div className="income-description">{item.description}</div>
                <div className="income-meta">
                  <span 
                    className="income-source-tag"
                    style={{ 
                      background: `${sourceColors[item.source]}15`,
                      color: sourceColors[item.source]
                    }}
                  >
                    {item.source}
                  </span>
                  <span className="income-date">{formatDate(item.date)}</span>
                </div>
              </div>
              
              <div className="income-amount">
                +${item.amount.toFixed(2)}
              </div>
              
              <div className="income-actions">
                {onEdit && (
                  <button
                    className="edit-btn"
                    onClick={() => openEditModal(item)}
                    title="Edit income"
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
                    onClick={() => onDelete(item.id)}
                    title="Delete income"
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
        {editingIncome && (
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
                <h3>Edit Income</h3>
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
                  <label>Source</label>
                  <select
                    value={editForm.source}
                    onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                    required
                  >
                    {INCOME_SOURCES.map((src) => (
                      <option key={src} value={src}>
                        {sourceIcons[src]} {src}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="edit-modal-actions">
                  <button type="button" className="cancel-btn" onClick={closeEditModal}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn income-save">
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

export default IncomeList

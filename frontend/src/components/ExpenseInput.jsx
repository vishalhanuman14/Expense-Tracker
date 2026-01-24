import { useState } from 'react'
import { motion } from 'framer-motion'
import './ExpenseInput.css'

function ExpenseInput({ onAdd, isLoading }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    setError('')
    setSuccess('')

    const result = await onAdd(input.trim())
    
    if (result.success) {
      setInput('')
      setSuccess(`Added: ${result.expense.description} - $${result.expense.amount} (${result.expense.category})`)
      setTimeout(() => setSuccess(''), 4000)
    } else {
      setError(result.error)
    }
  }

  const examples = [
    'rent $850',
    'uber to campus $8',
    'chipotle $14',
    'beer at bar $25',
  ]

  return (
    <div className="expense-input-container">
      <div className="input-header">
        <h2>Add Expense</h2>
        <p className="input-hint">
          Just type naturally — AI will categorize it for you
        </p>
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., coffee at starbucks $6.50"
            className="expense-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <span className="loading-spinner" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            )}
          </button>
        </div>
      </form>

      {error && (
        <motion.div 
          className="message error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div 
          className="message success"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✓ {success}
        </motion.div>
      )}

      <div className="examples">
        <span className="examples-label">Try:</span>
        {examples.map((example, i) => (
          <button
            key={i}
            className="example-btn"
            onClick={() => setInput(example)}
            disabled={isLoading}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ExpenseInput

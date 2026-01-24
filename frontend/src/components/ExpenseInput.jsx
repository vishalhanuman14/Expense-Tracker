import { useState } from 'react'
import { motion } from 'framer-motion'
import './ExpenseInput.css'

function ExpenseInput({ onAdd, isLoading, placeholder, isIncome = false }) {
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
      if (isIncome) {
        setSuccess(`Added: ${result.income.description} - $${result.income.amount} (${result.income.source})`)
      } else {
        setSuccess(`Added: ${result.expense.description} - $${result.expense.amount} (${result.expense.category})`)
      }
      setTimeout(() => setSuccess(''), 4000)
    } else {
      setError(result.error)
    }
  }

  const expenseExamples = [
    'rent $850',
    'uber to campus $8',
    'chipotle $14',
    'beer at bar $25',
  ]

  const incomeExamples = [
    'paycheck $250',
    'venmo from roommate $40',
    'freelance project $150',
    'allowance $100',
  ]

  const examples = isIncome ? incomeExamples : expenseExamples

  return (
    <div className={`expense-input-container ${isIncome ? 'income-mode' : ''}`}>
      <div className="input-header">
        <h2>{isIncome ? 'Add Income' : 'Add Expense'}</h2>
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
            placeholder={placeholder || (isIncome ? "e.g., paycheck from work $250" : "e.g., coffee at starbucks $6.50")}
            className={`expense-input ${isIncome ? 'income-input' : ''}`}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className={`submit-btn ${isIncome ? 'income-btn' : ''}`}
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
          className={`message success ${isIncome ? 'income-success' : ''}`}
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
            className={`example-btn ${isIncome ? 'income-example' : ''}`}
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

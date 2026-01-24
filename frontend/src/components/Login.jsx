import { useState } from 'react'
import { motion } from 'framer-motion'
import './Login.css'

function Login({ onLogin, onViewOnly }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'X-Auth-Password': password
        }
      })

      if (res.ok) {
        onLogin(password)
      } else {
        setError('Invalid password')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="login-logo">
          <span className="login-logo-icon">◈</span>
          <span className="login-logo-text">Spend</span>
        </div>
        
        <h1>Welcome</h1>
        <p className="login-subtitle">Enter password to manage expenses</p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="login-input"
            autoFocus
          />
          
          {error && (
            <motion.div 
              className="login-error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading || !password.trim()}
          >
            {isLoading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        <div className="login-divider">
          <span>or</span>
        </div>

        <button 
          type="button" 
          className="view-only-btn"
          onClick={onViewOnly}
        >
          Continue as Guest
          <span className="view-only-hint">View only</span>
        </button>
      </motion.div>
    </div>
  )
}

export default Login

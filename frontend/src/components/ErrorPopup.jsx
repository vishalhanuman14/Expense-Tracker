import { motion } from 'framer-motion'
import './ErrorPopup.css'

function ErrorPopup({ message, onClose }) {
  return (
    <motion.div 
      className="error-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="error-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        
        <h2 className="error-title">Error</h2>
        <p className="error-message">{message}</p>
        
        {message.includes('OPENAI_API_KEY') && (
          <div className="error-help">
            <p>To fix this, create a <code>.env</code> file in the <code>backend/</code> folder with:</p>
            <pre>OPENAI_API_KEY=sk-your-api-key-here</pre>
            <p>Then restart the backend server.</p>
          </div>
        )}
        
        <button className="error-close-btn" onClick={onClose}>
          Got it
        </button>
      </motion.div>
    </motion.div>
  )
}

export default ErrorPopup

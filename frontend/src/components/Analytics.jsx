import { motion } from 'framer-motion'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart
} from 'recharts'
import './Analytics.css'

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

const CHART_COLORS = ['#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#6366f1', '#ef4444', '#06b6d4']

const paymentMethodColors = {
  debit: '#22c55e',
  credit: '#3b82f6'
}

function Analytics({ analytics, trends, selectedMonth, onMonthChange, availableMonths }) {
  if (!analytics) {
    return (
      <div className="analytics-empty">
        <div className="empty-icon">📊</div>
        <h3>No data yet</h3>
        <p>Start adding expenses to see your analytics</p>
      </div>
    )
  }

  const pieData = Object.entries(analytics.by_category || {}).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || '#71717a'
  }))

  const paymentData = [
    {
      name: 'Debit / Bank',
      method: 'debit',
      value: analytics.by_payment_method?.debit || 0,
      color: paymentMethodColors.debit
    },
    {
      name: 'Credit Card',
      method: 'credit',
      value: analytics.by_payment_method?.credit || 0,
      color: paymentMethodColors.credit
    }
  ].filter(item => item.value > 0)

  const trendData = trends.map(t => ({
    month: formatMonthShort(t.month),
    total: t.total,
    debitSpent: t.debit_spent || 0,
    creditSpent: t.credit_spent || 0,
    count: t.expense_count
  })).reverse()

  return (
    <div className="analytics-container">
      {/* Month Selector */}
      <div className="analytics-header">
        <div className="month-selector">
          <button
            className={`month-pill ${!selectedMonth ? 'active' : ''}`}
            onClick={() => onMonthChange(null)}
          >
            All Time
          </button>
          {availableMonths.slice(0, 6).map(month => (
            <button
              key={month}
              className={`month-pill ${selectedMonth === month ? 'active' : ''}`}
              onClick={() => onMonthChange(month)}
            >
              {formatMonthShort(month)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <motion.div 
          className="summary-card primary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <span className="card-label">Total Spent</span>
          <span className="card-value">${analytics.total_spent.toLocaleString()}</span>
          <span className="card-subtitle">
            {analytics.expense_count} expense{analytics.expense_count !== 1 ? 's' : ''}
          </span>
        </motion.div>

        <motion.div 
          className="summary-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <span className="card-label">Debit Spend</span>
          <span className="card-value debit-value">${(analytics.debit_spent || 0).toLocaleString()}</span>
        </motion.div>

        <motion.div 
          className="summary-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="card-label">Credit Spend</span>
          <span className="card-value credit-value">${(analytics.credit_spent || 0).toLocaleString()}</span>
          <span className="card-subtitle">${(analytics.credit_card_balance || 0).toLocaleString()} due</span>
        </motion.div>

        <motion.div 
          className="summary-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <span className="card-label">Average per Expense</span>
          <span className="card-value">
            ${analytics.expense_count > 0 
              ? (analytics.total_spent / analytics.expense_count).toFixed(2) 
              : '0.00'}
          </span>
        </motion.div>

        <motion.div 
          className="summary-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="card-label">Categories Used</span>
          <span className="card-value">{Object.keys(analytics.by_category || {}).length}</span>
        </motion.div>
      </div>

      {/* Overview Charts */}
      <div className="charts-row overview-charts">
        {/* Spending by Category */}
        <motion.div 
          className="chart-card category-chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="chart-title">Spending by Category</h3>
          {pieData.length > 0 ? (
            <div className="pie-chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={<CustomPieTooltip />}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {pieData.slice(0, 5).map((item, i) => (
                  <div key={i} className="legend-item">
                    <span className="legend-dot" style={{ background: item.color }} />
                    <span className="legend-label">{item.name}</span>
                    <span className="legend-value">${item.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="chart-empty">No data available</div>
          )}
        </motion.div>

        {/* Credit vs Debit */}
        <motion.div 
          className="chart-card payment-chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <h3 className="chart-title">Credit vs Debit</h3>
          {paymentData.length > 0 ? (
            <div className="pie-chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`payment-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPaymentTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {paymentData.map((item) => (
                  <div key={item.method} className="legend-item">
                    <span className="legend-dot" style={{ background: item.color }} />
                    <span className="legend-label">{item.name}</span>
                    <span className="legend-value">${item.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="chart-empty">No data available</div>
          )}
        </motion.div>
      </div>

      {/* Top Categories Bar Chart */}
      <motion.div 
        className="chart-card full-width top-categories-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="chart-title">Top Spending Categories</h3>
        {analytics.top_categories?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={analytics.top_categories.slice(0, 5)} 
              layout="vertical"
              margin={{ left: 8, right: 28, top: 4, bottom: 8 }}
              barCategoryGap={18}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: '#71717a', fontSize: 12 }} />
              <YAxis 
                type="category" 
                dataKey="category" 
                width={128}
                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                tickFormatter={formatCategoryAxisLabel}
                interval={0}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar 
                dataKey="amount" 
                radius={[0, 5, 5, 0]}
                maxBarSize={34}
              >
                {analytics.top_categories.slice(0, 5).map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={categoryColors[entry.category] || CHART_COLORS[index % CHART_COLORS.length]} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty">No data available</div>
        )}
      </motion.div>

      {/* Spending Trend */}
      {trendData.length > 1 && (
        <motion.div 
          className="chart-card full-width"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h3 className="chart-title">Monthly Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} />
              <YAxis tick={{ fill: '#71717a', fontSize: 12 }} />
              <Tooltip content={<CustomTrendTooltip />} />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#f59e0b" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Monthly Credit vs Debit */}
      {trendData.length > 1 && (
        <motion.div 
          className="chart-card full-width"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          <h3 className="chart-title">Monthly Credit vs Debit</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} />
              <YAxis tick={{ fill: '#71717a', fontSize: 12 }} />
              <Tooltip content={<CustomPaymentTrendTooltip />} />
              <Bar dataKey="debitSpent" stackId="payment" name="Debit / Bank" fill={paymentMethodColors.debit} radius={[0, 0, 4, 4]} />
              <Bar dataKey="creditSpent" stackId="payment" name="Credit Card" fill={paymentMethodColors.credit} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Daily Spending */}
      {analytics.daily_spending?.length > 0 && (
        <motion.div 
          className="chart-card full-width"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="chart-title">Daily Spending</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.daily_spending.slice(-14)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#71717a', fontSize: 11 }}
                tickFormatter={(val) => {
                  const [year, month, day] = val.split('-').map(Number)
                  return `${month}/${day}`
                }}
              />
              <YAxis tick={{ fill: '#71717a', fontSize: 12 }} />
              <Tooltip content={<CustomDailyTooltip />} />
              <Bar dataKey="amount" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  )
}

function CustomPieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{payload[0].payload.name}</p>
        <p className="tooltip-value">${payload[0].value.toFixed(2)}</p>
      </div>
    )
  }
  return null
}

function CustomPaymentTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{payload[0].payload.name}</p>
        <p className="tooltip-value">${payload[0].value.toFixed(2)}</p>
      </div>
    )
  }
  return null
}

function CustomBarTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{payload[0].payload.category}</p>
        <p className="tooltip-value">${payload[0].value.toFixed(2)}</p>
      </div>
    )
  }
  return null
}

function CustomPaymentTrendTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const debit = payload.find(item => item.dataKey === 'debitSpent')?.value || 0
    const credit = payload.find(item => item.dataKey === 'creditSpent')?.value || 0
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-value debit-tooltip">Debit: ${debit.toFixed(2)}</p>
        <p className="tooltip-value credit-tooltip">Credit: ${credit.toFixed(2)}</p>
      </div>
    )
  }
  return null
}

function CustomTrendTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{payload[0].payload.month}</p>
        <p className="tooltip-value">${payload[0].value.toFixed(2)}</p>
        <p className="tooltip-subtitle">{payload[0].payload.count} expenses</p>
      </div>
    )
  }
  return null
}

function CustomDailyTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const dateStr = payload[0].payload.date
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
        <p className="tooltip-value">${payload[0].value.toFixed(2)}</p>
      </div>
    )
  }
  return null
}

function formatMonthShort(monthStr) {
  const [year, month] = monthStr.split('-')
  const date = new Date(year, month - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function formatCategoryAxisLabel(value) {
  if (!value || value.length <= 18) return value
  return `${value.slice(0, 16)}...`
}

export default Analytics

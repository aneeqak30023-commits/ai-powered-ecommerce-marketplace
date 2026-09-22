import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  getAnalyticsOverview,
  getAnalyticsSales,
  getAnalyticsProducts,
  getAnalyticsCustomers,
  getAnalyticsOrders,
  getAnalyticsPayments,
  getAnalyticsSupport,
  getAnalyticsReturns,
  getAnalyticsRefunds,
} from '../../services/analyticsApi.js'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#EEF2FF',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
}

const RANGES = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: 'all', label: 'All Time' },
]

const COLORS = [C.primary, C.success, C.warning, C.danger, C.textSecondary, '#8B5CF6', '#EC4899', '#14B8A6']

function StatCard({ title, value, prefix, suffix, icon }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '.04em' }}>{title}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: C.text, margin: 0 }}>
            {prefix}{value}{suffix}
          </p>
        </div>
        <div style={{ fontSize: 32, opacity: 0.9 }}>{icon}</div>
      </div>
    </div>
  )
}

function Card({ title, children, subtitle }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', marginBottom: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 4px' }}>{title}</h3>
      {subtitle && <p style={{ fontSize: 13, color: C.textSecondary, margin: '0 0 16px' }}>{subtitle}</p>}
      {children}
    </div>
  )
}

export default function AdminAnalytics() {
  const { user, loading: authLoading } = useAuth()
  const [range, setRange] = useState('30d')
  const [overview, setOverview] = useState(null)
  const [sales, setSales] = useState(null)
  const [products, setProducts] = useState(null)
  const [customers, setCustomers] = useState(null)
  const [orders, setOrders] = useState(null)
  const [payments, setPayments] = useState(null)
  const [support, setSupport] = useState(null)
  const [returns, setReturns] = useState(null)
  const [refunds, setRefunds] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const [overviewData, salesData, productsData, customersData, ordersData, paymentsData, supportData, returnsData, refundsData] = await Promise.all([
        getAnalyticsOverview(range),
        getAnalyticsSales(range),
        getAnalyticsProducts(),
        getAnalyticsCustomers(range),
        getAnalyticsOrders(range),
        getAnalyticsPayments(range),
        getAnalyticsSupport(range),
        getAnalyticsReturns(range),
        getAnalyticsRefunds(range),
      ])
      setOverview(overviewData)
      setSales(salesData)
      setProducts(productsData)
      setCustomers(customersData)
      setOrders(ordersData)
      setPayments(paymentsData)
      setSupport(supportData)
      setReturns(returnsData)
      setRefunds(refundsData)
    } catch (err) {
      setError(err.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      loadAnalytics()
    }
  }, [authLoading, user, range])

  if (authLoading) {
    return <div style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>Loading...</div>
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>Loading analytics...</div>
  }

  if (error) {
    return (
      <div style={{ background: `${C.danger}10`, border: `1px solid ${C.danger}30`, borderRadius: 12, padding: 20, color: C.danger, fontSize: 14 }}>
        {error}
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Analytics Dashboard</h2>
          <p style={{ fontSize: 14, color: C.textSecondary, margin: 0 }}>Real-time insights from your store data</p>
        </div>
        <div style={{ display: 'flex', gap: 8, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4 }}>
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: range === r.value ? C.primary : 'transparent',
                color: range === r.value ? '#fff' : C.textSecondary,
                transition: 'all 0.2s ease',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 24 }}>
        <StatCard title="Total Revenue" value={`$${(overview?.totalRevenue || 0).toFixed(2)}`} icon="💰" />
        <StatCard title="Total Orders" value={overview?.totalOrders || 0} icon="📋" />
        <StatCard title="Total Customers" value={overview?.totalCustomers || 0} icon="👥" />
        <StatCard title="Avg Order Value" value={`$${(overview?.averageOrderValue || 0).toFixed(2)}`} icon="📊" />
        <StatCard title="Pending Orders" value={overview?.pendingOrders || 0} icon="⏳" />
        <StatCard title="Completed Orders" value={overview?.completedOrders || 0} icon="✅" />
        <StatCard title="Cancelled Orders" value={overview?.cancelledOrders || 0} icon="❌" />
        <StatCard title="Total Products" value={overview?.totalProducts || 0} icon="📦" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 24 }}>
        <Card title="Revenue Over Time" subtitle="Total revenue trend">
          {sales?.data && sales.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sales.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="date" stroke={C.textSecondary} fontSize={12} tick={{ fontSize: 12 }} />
                <YAxis stroke={C.textSecondary} fontSize={12} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}
                  labelStyle={{ color: C.text, fontWeight: 600 }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke={C.primary} strokeWidth={2} name="Revenue ($)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: C.textSecondary, fontSize: 14, textAlign: 'center', padding: 40 }}>No revenue data available for this period.</p>
          )}
        </Card>

        <Card title="Orders Over Time" subtitle="Order count trend">
          {sales?.data && sales.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sales.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="date" stroke={C.textSecondary} fontSize={12} tick={{ fontSize: 12 }} />
                <YAxis stroke={C.textSecondary} fontSize={12} tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}
                  labelStyle={{ color: C.text, fontWeight: 600 }}
                />
                <Legend />
                <Bar dataKey="orders" fill={C.primary} name="Orders" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: C.textSecondary, fontSize: 14, textAlign: 'center', padding: 40 }}>No order data available for this period.</p>
          )}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
        <Card title="Orders by Status" subtitle="Distribution of order statuses">
          {orders?.byStatus && orders.byStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orders.byStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {orders.byStatus.map((entry, index) => (
                    <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: C.textSecondary, fontSize: 14, textAlign: 'center', padding: 40 }}>No order status data available.</p>
          )}
        </Card>

        <Card title="Orders by Payment Method" subtitle="Payment method distribution">
          {orders?.byPaymentMethod && orders.byPaymentMethod.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orders.byPaymentMethod}
                  dataKey="count"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ method, count }) => `${method}: ${count}`}
                >
                  {orders.byPaymentMethod.map((entry, index) => (
                    <Cell key={entry.method} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: C.textSecondary, fontSize: 14, textAlign: 'center', padding: 40 }}>No payment method data available.</p>
          )}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 24 }}>
        <Card title="Top Selling Products" subtitle="By quantity sold">
          {products?.topProducts && products.topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={products.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis type="number" stroke={C.textSecondary} fontSize={12} tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke={C.textSecondary} fontSize={12} tick={{ fontSize: 12 }} width={120} />
                <Tooltip
                  contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}
                  labelStyle={{ color: C.text, fontWeight: 600 }}
                />
                <Legend />
                <Bar dataKey="totalQuantity" fill={C.primary} name="Qty Sold" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: C.textSecondary, fontSize: 14, textAlign: 'center', padding: 40 }}>No product sales data available.</p>
          )}
        </Card>

        <Card title="Best Performing Categories" subtitle="By revenue">
          {products?.categories && products.categories.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={products.categories}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="name" stroke={C.textSecondary} fontSize={12} tick={{ fontSize: 12 }} />
                <YAxis stroke={C.textSecondary} fontSize={12} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}
                  labelStyle={{ color: C.text, fontWeight: 600 }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                />
                <Legend />
                <Bar dataKey="revenue" fill={C.success} name="Revenue ($)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: C.textSecondary, fontSize: 14, textAlign: 'center', padding: 40 }}>No category data available.</p>
          )}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 24 }}>
        <Card title="Customer Growth" subtitle="New customers over time">
          {customers?.newCustomersOverTime && customers.newCustomersOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={customers.newCustomersOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="date" stroke={C.textSecondary} fontSize={12} tick={{ fontSize: 12 }} />
                <YAxis stroke={C.textSecondary} fontSize={12} tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}
                  labelStyle={{ color: C.text, fontWeight: 600 }}
                />
                <Legend />
                <Line type="monotone" dataKey="count" stroke={C.warning} strokeWidth={2} name="New Customers" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: C.textSecondary, fontSize: 14, textAlign: 'center', padding: 40 }}>No customer data available for this period.</p>
          )}
        </Card>

        <Card title="Support Tickets" subtitle="Tickets over time">
          {support?.overTime && support.overTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={support.overTime}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="date" stroke={C.textSecondary} fontSize={12} tick={{ fontSize: 12 }} />
                <YAxis stroke={C.textSecondary} fontSize={12} tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}
                  labelStyle={{ color: C.text, fontWeight: 600 }}
                />
                <Legend />
                <Bar dataKey="count" fill={C.warning} name="Tickets" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: C.textSecondary, fontSize: 14, textAlign: 'center', padding: 40 }}>No support ticket data available for this period.</p>
          )}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
        <Card title="Payment Analytics" subtitle="Totals by status and method">
          {payments && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, margin: '0 0 8px', textTransform: 'uppercase' }}>Total Payment Volume</p>
                <p style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>${(payments.totalAmount || 0).toFixed(2)}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, margin: '0 0 8px', textTransform: 'uppercase' }}>By Status</p>
                  {payments.byStatus.map(item => (
                    <div key={item.status} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 13, color: C.text, textTransform: 'capitalize' }}>{item.status}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.count} <span style={{ color: C.textSecondary, fontWeight: 400 }}>(${item.amount.toFixed(2)})</span></span>
                    </div>
                  ))}
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, margin: '0 0 8px', textTransform: 'uppercase' }}>By Method</p>
                  {payments.byMethod.map(item => (
                    <div key={item.method} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 13, color: C.text, textTransform: 'capitalize' }}>{item.method?.replace('_', ' ') || item.method}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.count} <span style={{ color: C.textSecondary, fontWeight: 400 }}>(${item.amount.toFixed(2)})</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card title="Support Analytics" subtitle="Ticket breakdown">
          {support && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1, background: C.background, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, margin: '0 0 4px', textTransform: 'uppercase' }}>Total</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>{support.totalTickets}</p>
                </div>
                <div style={{ flex: 1, background: C.background, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, margin: '0 0 4px', textTransform: 'uppercase' }}>Open</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: C.warning, margin: 0 }}>{support.openTickets}</p>
                </div>
                <div style={{ flex: 1, background: C.background, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, margin: '0 0 4px', textTransform: 'uppercase' }}>Resolved</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: C.success, margin: 0 }}>{support.resolvedTickets}</p>
                </div>
              </div>
              {support.byCategory && support.byCategory.length > 0 && (
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, margin: '0 0 8px', textTransform: 'uppercase' }}>By Category</p>
                  {support.byCategory.map(item => (
                    <div key={item.category} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 13, color: C.text, textTransform: 'capitalize' }}>{item.category}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
        <Card title="Low Stock Products" subtitle="Products with stock ≤ 5">
          {products?.lowStock && products.lowStock.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Product</th>
                    <th style={{ textAlign: 'right', padding: '10px 8px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Stock</th>
                    <th style={{ textAlign: 'right', padding: '10px 8px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {products.lowStock.map(item => (
                    <tr key={item.productId} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '10px 8px', color: C.text, fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: C.danger, fontWeight: 700 }}>{item.stock}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: C.textSecondary }}>{item.threshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: C.textSecondary, fontSize: 14, textAlign: 'center', padding: 40 }}>No low-stock products.</p>
          )}
        </Card>

        <Card title="Out of Stock Products" subtitle="Products with zero stock">
          {products?.outOfStock && products.outOfStock.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Product</th>
                    <th style={{ textAlign: 'right', padding: '10px 8px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.outOfStock.map(item => (
                    <tr key={item.productId} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '10px 8px', color: C.text, fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: C.textSecondary }}>${item.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: C.textSecondary, fontSize: 14, textAlign: 'center', padding: 40 }}>No out-of-stock products.</p>
          )}
        </Card>
      </div>

      <Card title="Top Customers" subtitle="By total spending">
        {customers?.topCustomers && customers.topCustomers.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  <th style={{ textAlign: 'left', padding: '12px 8px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Customer</th>
                  <th style={{ textAlign: 'center', padding: '12px 8px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Orders</th>
                  <th style={{ textAlign: 'right', padding: '12px 8px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {customers.topCustomers.map(customer => (
                  <tr key={customer.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '12px 8px', color: C.text, fontWeight: 600 }}>
                      <div>{customer.name}</div>
                      <div style={{ fontSize: 12, color: C.textSecondary, fontWeight: 400 }}>{customer.email}</div>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', color: C.text }}>{customer.orderCount}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: C.text }}>${customer.totalSpent.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: C.textSecondary, fontSize: 14, textAlign: 'center', padding: 40 }}>No customer data available.</p>
        )}
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
      <Card title="Return Analytics" subtitle="Returns by status and volume">
        {returns && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, margin: '0 0 8px', textTransform: 'uppercase' }}>Total Returns</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>{returns.totalReturns || 0}</p>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, margin: '0 0 8px', textTransform: 'uppercase' }}>Total Refunded</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>${(returns.totalRefundAmount || 0).toFixed(2)}</p>
            </div>
            {returns.byStatus && returns.byStatus.length > 0 && (
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, margin: '0 0 8px', textTransform: 'uppercase' }}>By Status</p>
                {returns.byStatus.map(item => (
                  <div key={item.status} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                    <span style={{ color: C.text, textTransform: 'capitalize' }}>{item.status}</span>
                    <span style={{ fontWeight: 600, color: C.text }}>{item.count} (${(item.amount || 0).toFixed(2)})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {!returns && (
          <p style={{ color: C.textSecondary, fontSize: 14, textAlign: 'center', padding: 40 }}>No return data available.</p>
        )}
      </Card>

      <Card title="Refund Analytics" subtitle="Refunds by status and method">
        {refunds && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, margin: '0 0 8px', textTransform: 'uppercase' }}>Total Refunds</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>{refunds.totalRefunds || 0}</p>
              <p style={{ fontSize: 14, color: C.textSecondary, margin: '2px 0 0' }}>Total amount: ${(refunds.totalAmount || 0).toFixed(2)}</p>
            </div>
            {refunds.byStatus && refunds.byStatus.length > 0 && (
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, margin: '0 0 8px', textTransform: 'uppercase' }}>By Status</p>
                {refunds.byStatus.map(item => (
                  <div key={item.status} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                    <span style={{ color: C.text, textTransform: 'capitalize' }}>{item.status}</span>
                    <span style={{ fontWeight: 600, color: C.text }}>{item.count} (${(item.amount || 0).toFixed(2)})</span>
                  </div>
                ))}
              </div>
            )}
            {refunds.byMethod && refunds.byMethod.length > 0 && (
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, margin: '0 0 8px', textTransform: 'uppercase' }}>By Method</p>
                {refunds.byMethod.map(item => (
                  <div key={item.method} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                    <span style={{ color: C.text, textTransform: 'capitalize' }}>{item.method}</span>
                    <span style={{ fontWeight: 600, color: C.text }}>{item.count} (${(item.amount || 0).toFixed(2)})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {!refunds && (
          <p style={{ color: C.textSecondary, fontSize: 14, textAlign: 'center', padding: 40 }}>No refund data available.</p>
        )}
      </Card>
    </div>
  </div>
)
}

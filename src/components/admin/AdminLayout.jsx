import { useState } from 'react'
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#EEF2FF',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  danger: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
}

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { path: '/admin/products', label: 'Products', icon: '📦' },
  { path: '/admin/orders', label: 'Orders', icon: '📋' },
  { path: '/admin/customers', label: 'Customers', icon: '👥' },
  { path: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { path: '/admin/support', label: 'Support', icon: '🎧' },
  { path: '/admin/inventory', label: 'Inventory', icon: '🏭' },
  { path: '/admin/payments', label: 'Payments', icon: '💳' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: C.textSecondary, fontSize: 15 }}>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.background }}>
      <div style={{
        width: 260,
        background: C.surface,
        borderRight: `1px solid ${C.border}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
      }}>
        <div style={{ padding: '24px 20px', borderBottom: `1px solid ${C.border}` }}>
          <Link to="/admin" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0 }}>NexMart Admin</h1>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path)

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  color: isActive ? C.primary : C.textSecondary,
                  background: isActive ? C.primaryLight : 'transparent',
                  marginBottom: 4,
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}` }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 10,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              color: C.textSecondary,
              background: C.background,
            }}
          >
            ← Back to Store
          </Link>
        </div>
      </div>

      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main style={{
        flex: 1,
        marginLeft: 260,
        padding: '24px 32px',
        minHeight: '100vh',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: 18,
              color: C.text,
            }}
            className="admin-menu-button"
          >
            ☰
          </button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>
              {NAV_ITEMS.find(item => item.path === location.pathname)?.label || 'Admin'}
            </h1>
          </div>
        </div>
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-menu-button {
            display: block !important;
          }
          main {
            margin-left: 0 !important;
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  )
}

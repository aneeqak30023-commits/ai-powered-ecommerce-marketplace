import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  danger: '#DC2626'
}

export default function AccountPage() {
  const { user, isAuthenticated, loading, logout, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    shippingAddress: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, loading, navigate])

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        shippingAddress: user.shippingAddress || ''
      })
    }
  }, [user])

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
    setSaved(false)
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!validate()) return
    updateProfile({
      name: form.name.trim(),
      email: form.email.trim(),
      shippingAddress: form.shippingAddress.trim()
    })
    setSaved(true)
    setEditing(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
        <p style={{ color: C.textSecondary, fontSize: 15 }}>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div style={{ minHeight: '100vh', background: C.background, padding: '40px 24px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: C.text }}>My Account</h1>
          <button
            onClick={handleLogout}
            style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.textSecondary, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            Sign out
          </button>
        </div>

        {saved && (
          <div style={{ padding: '12px 16px', borderRadius: 12, background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', fontSize: 14, marginBottom: 20 }}>
            Profile updated successfully
          </div>
        )}

        <div style={{ background: C.surface, borderRadius: 20, padding: 32, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: `1px solid ${C.border}`, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>Profile Information</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.primary, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>Full name</label>
              {editing ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 10, border: `1px solid ${errors.name ? C.danger : C.border}`, fontSize: 14, outline: 'none' }}
                />
              ) : (
                <p style={{ margin: 0, fontSize: 15, color: C.text }}>{user.name}</p>
              )}
              {errors.name && <p style={{ margin: '4px 0 0', fontSize: 12, color: C.danger }}>{errors.name}</p>}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>Email</label>
              {editing ? (
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 10, border: `1px solid ${errors.email ? C.danger : C.border}`, fontSize: 14, outline: 'none' }}
                />
              ) : (
                <p style={{ margin: 0, fontSize: 15, color: C.text }}>{user.email}</p>
              )}
              {errors.email && <p style={{ margin: '4px 0 0', fontSize: 12, color: C.danger }}>{errors.email}</p>}
            </div>

            <div style={{ marginBottom: editing ? 24 : 0 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>Saved shipping address</label>
              {editing ? (
                <textarea
                  value={form.shippingAddress}
                  onChange={(e) => handleChange('shippingAddress', e.target.value)}
                  placeholder="123 Main St, City, State, ZIP"
                  rows={3}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, outline: 'none', resize: 'vertical' }}
                />
              ) : (
                <p style={{ margin: 0, fontSize: 15, color: user.shippingAddress ? C.text : C.textSecondary }}>
                  {user.shippingAddress || 'No shipping address saved'}
                </p>
              )}
            </div>

            {editing && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="submit"
                  style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: C.primary, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                >
                  Save changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setForm({ name: user.name || '', email: user.email || '', shippingAddress: user.shippingAddress || '' })
                    setErrors({})
                  }}
                  style={{ padding: '12px 24px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface, color: C.textSecondary, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        <div style={{ background: C.surface, borderRadius: 20, padding: 32, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: `1px solid ${C.border}` }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: C.text }}>Account</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link to="/orders" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 12, border: `1px solid ${C.border}`, textDecoration: 'none', color: C.text, fontSize: 14, fontWeight: 500, transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.background = '#FAFAFF' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface }}
            >
              <span>My Orders</span>
              <span style={{ color: C.textSecondary }}>&rsaquo;</span>
            </Link>
            <Link to="/wishlist" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 12, border: `1px solid ${C.border}`, textDecoration: 'none', color: C.text, fontSize: 14, fontWeight: 500, transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.background = '#FAFAFF' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface }}
            >
              <span>Wishlist</span>
              <span style={{ color: C.textSecondary }}>&rsaquo;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

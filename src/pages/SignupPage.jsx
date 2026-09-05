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

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/account', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const result = await register(email, password, name)
    
    if (result.success) {
      navigate('/account', { replace: true })
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.background, padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, background: C.surface, borderRadius: 20, padding: 40, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700, color: C.text }}>Create account</h1>
          <p style={{ margin: 0, fontSize: 14, color: C.textSecondary }}>Join NexMart for a personalized shopping experience</p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 12, background: '#FEF2F2', border: '1px solid #FECACA', color: C.danger, fontSize: 14, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="At least 8 characters"
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Repeat your password"
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, outline: 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 12,
              border: 'none',
              background: C.primary,
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', margin: '24px 0 0', fontSize: 14, color: C.textSecondary }}>
          Already have an account? <Link to="/login" style={{ color: C.primary, textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

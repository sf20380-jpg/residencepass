'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function GuardLogin() {
  const [guardId, setGuardId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: any) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: `${guardId}@residencepass.local`,
      password: password
    })

    if (error) {
      setError('Invalid Guard ID or password')
      setLoading(false)
      return
    }

    window.location.href = '/guard/dashboard'
  }

  return (
    <div className="app-container">
      <div className="topbar">
        <button className="back-btn" onClick={() => window.location.href = '/'}>←</button>
        <h2>Guard Portal</h2>
      </div>
      <div style={{ background: 'var(--primary)', padding: '56px 24px 40px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.15)', borderRadius: '18px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🛡️</div>
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', margin: '0 0 6px' }}>Guard Portal</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0' }}>Sign in to continue</p>
      </div>

      <div style={{ padding: '28px 16px' }}>
        <form onSubmit={handleLogin}>
          <div className="field">
            <label>Guard ID</label>
            <input type="text" required placeholder="e.g. G001" value={guardId} onChange={e => setGuardId(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" required placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          {error && (
            <div style={{ background: 'var(--danger-light)', border: '0.5px solid var(--danger)', borderRadius: '10px', padding: '10px 12px', marginBottom: '16px' }}>
              <p style={{ color: 'var(--danger)', fontSize: '13px', margin: '0' }}>❌ {error}</p>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => window.location.href = '/'}>
            Back
          </button>
        </form>
      </div>
    </div>
  )
}

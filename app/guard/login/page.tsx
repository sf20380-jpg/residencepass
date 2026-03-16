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

    const { data, error } = await supabase.auth.signInWithPassword({
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
    <div style={{ minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#185FA5', padding: '48px 24px 32px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.15)', borderRadius: '16px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🛡️</div>
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '500', margin: '0 0 6px' }}>Guard Portal</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0' }}>Sign in to continue</p>
      </div>

      <div style={{ maxWidth: '420px', margin: '0 auto', padding: '24px' }}>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Guard ID</label>
            <input
              type="text"
              required
              placeholder="e.g. G001"
              value={guardId}
              onChange={e => setGuardId(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', color: '#000', background: '#fff' }} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Password</label>
            <input
              type="password"
              required
              placeholder="••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', color: '#000', background: '#fff' }} />
          </div>

          {error && (
            <div style={{ background: '#FCEBEB', border: '1px solid #f0b0b0', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px' }}>
              <p style={{ color: '#A32D2D', fontSize: '13px', margin: '0' }}>❌ {error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '13px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
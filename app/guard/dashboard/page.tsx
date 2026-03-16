'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function GuardDashboard() {
  const [visitors, setVisitors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('today')
  const [guardEmail, setGuardEmail] = useState('')

  useEffect(() => {
    checkAuth()
    fetchVisitors()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/guard/login'; return }
    setGuardEmail(user.email?.split('@')[0] || '')
  }

  async function fetchVisitors() {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('visitors')
      .select('*, checkins(*)')
      .eq('visit_date', today)
      .order('created_at', { ascending: false })
    if (data) setVisitors(data)
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/guard/login'
  }

  const filtered = visitors.filter(v => {
    const q = search.toLowerCase()
    return (
      v.name?.toLowerCase().includes(q) ||
      v.unit?.toLowerCase().includes(q) ||
      v.plate?.toLowerCase().includes(q) ||
      v.otp_code?.includes(q)
    )
  })

  const pending = filtered.filter(v => v.status === 'pending')
  const inside = filtered.filter(v => v.status === 'inside')
  const checkedout = filtered.filter(v => v.status === 'checked_out')
  const tabData: any = { today: filtered, inside, history: checkedout }
  const currentList = tabData[activeTab] || []

  const statusConfig: any = {
    pending: { cls: 'status status-pending', label: 'Pending' },
    inside: { cls: 'status status-inside', label: 'Inside' },
    checked_out: { cls: 'status status-out', label: 'Out' },
  }

  return (
    <div className="app-container">

      <div className="topbar">
        <h2>Dashboard</h2>
        <span className="badge">{guardEmail}</span>
        <button className="logout-btn" onClick={handleLogout}>Sign out</button>
      </div>

      <div className="stats-grid">
        {[
          { num: pending.length, label: 'Pending', color: 'var(--primary)' },
          { num: inside.length, label: 'Inside', color: 'var(--success)' },
          { num: checkedout.length, label: 'Checked out', color: 'var(--gray)' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="num" style={{ color: s.color }}>{s.num}</div>
            <div className="lbl">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="tabs">
        {[['today', 'Today'], ['inside', 'Inside'], ['history', 'History']].map(([key, label]) => (
          <button key={key} className={`tab ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>
            {label}
          </button>
        ))}
      </div>

      <div className="search-wrap">
        <div style={{ position: 'relative' }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, unit or plate..."
            value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="content">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '32px', opacity: 0.5, fontSize: '13px' }}>Loading...</p>
        ) : currentList.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '32px', opacity: 0.5, fontSize: '13px' }}>No visitors found</p>
        ) : currentList.map((v: any) => {
          const s = statusConfig[v.status] || statusConfig.pending
          return (
            <div key={v.id} className="card" style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/guard/verify/${v.id}`}>
              <div className="card-row">
                <div className="avatar">
                  {v.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                </div>
                <div className="card-info">
                  <h3>{v.name}</h3>
                  <p>Unit {v.unit} · {v.expected_time || '-'} · {v.plate || 'No plate'}</p>
                </div>
                <span className={s.cls}>{s.label}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bottomnav">
        <button className="active">
          <span className="nav-icon">📊</span>
          Dashboard
        </button>
        <button onClick={() => window.location.href = '/guard/scan'}>
          <span className="nav-icon">📷</span>
          Scan
        </button>
        <button onClick={() => window.location.href = '/guard/walkin'}>
          <span className="nav-icon">➕</span>
          Walk-in
        </button>
      </div>

    </div>
  )
}

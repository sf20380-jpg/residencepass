'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function AdminDashboard() {
  const [visitors, setVisitors] = useState<any[]>([])
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('visitors')
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0])
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0])
  const [todayStats, setTodayStats] = useState({ total: 0, inside: 0, checkedOut: 0, deliveries: 0 })

  useEffect(() => {
    checkAuth()
    fetchVisitors()
    fetchDeliveries()
    fetchTodayStats()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email?.startsWith('admin')) {
      window.location.href = '/guard/login'
      return
    }
  }

  async function fetchTodayStats() {
    const today = new Date().toISOString().split('T')[0]
    const { data: v } = await supabase.from('visitors').select('status').eq('visit_date', today)
    const { data: d } = await supabase.from('deliveries').select('id').eq('visit_date', today)
    if (v) {
      setTodayStats({
        total: v.length,
        inside: v.filter(x => x.status === 'inside').length,
        checkedOut: v.filter(x => x.status === 'checked_out').length,
        deliveries: d?.length || 0
      })
    }
  }

  async function fetchVisitors() {
    setLoading(true)
    const { data } = await supabase
      .from('visitors')
      .select('*, checkins(*)')
      .gte('visit_date', fromDate)
      .lte('visit_date', toDate)
      .order('created_at', { ascending: false })
    if (data) setVisitors(data)
    setLoading(false)
  }

  async function fetchDeliveries() {
    const { data } = await supabase
      .from('deliveries')
      .select('*')
      .gte('visit_date', fromDate)
      .lte('visit_date', toDate)
      .order('created_at', { ascending: false })
    if (data) setDeliveries(data)
  }

  async function applyFilter() {
    fetchVisitors()
    fetchDeliveries()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/guard/login'
  }

  const filteredVisitors = visitors.filter(v => {
    const q = search.toLowerCase()
    return (
      v.name?.toLowerCase().includes(q) ||
      v.unit?.toLowerCase().includes(q) ||
      v.plate?.toLowerCase().includes(q) ||
      v.host_name?.toLowerCase().includes(q)
    )
  })

  const filteredDeliveries = deliveries.filter(d => {
    const q = search.toLowerCase()
    return (
      d.name?.toLowerCase().includes(q) ||
      d.courier?.toLowerCase().includes(q) ||
      d.units?.toLowerCase().includes(q) ||
      d.plate?.toLowerCase().includes(q)
    )
  })

  function exportVisitorsCSV() {
    const headers = ['Name', 'Phone', 'Unit', 'Host', 'Host Phone', 'Plate', 'Purpose', 'Visit Date', 'Expected Time', 'Status', 'Check-in Time', 'Check-out Time', 'Guard ID', 'Type']
    const rows = filteredVisitors.map(v => {
      const c = v.checkins?.[0]
      return [
        v.name, v.phone, v.unit, v.host_name, v.host_phone || '-',
        v.plate || '-', v.purpose, v.visit_date, v.expected_time || '-', v.status,
        c?.checked_in_at ? new Date(c.checked_in_at).toLocaleString('en-MY') : '-',
        c?.checked_out_at ? new Date(c.checked_out_at).toLocaleString('en-MY') : '-',
        c?.guard_id || '-',
        c?.is_walkin ? 'Walk-in' : 'Pre-registered'
      ]
    })
    downloadCSV(headers, rows, `visitors_${fromDate}_to_${toDate}.csv`)
  }

  function exportDeliveriesCSV() {
    const headers = ['Name', 'Phone', 'Courier', 'Plate', 'Units', 'Ref Code', 'Visit Date', 'Arrival Time']
    const rows = filteredDeliveries.map(d => [
      d.name, d.phone, d.courier, d.plate || '-',
      d.units, d.ref_code, d.visit_date, d.arrival_time || '-'
    ])
    downloadCSV(headers, rows, `deliveries_${fromDate}_to_${toDate}.csv`)
  }

  function downloadCSV(headers: string[], rows: any[], filename: string) {
    const csv = [headers, ...rows].map(r => r.map((c: any) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const statusConfig: any = {
    pending: { cls: 'status status-pending', label: 'Pending' },
    inside: { cls: 'status status-inside', label: 'Inside' },
    checked_out: { cls: 'status status-out', label: 'Out' },
  }

  return (
    <div className="app-container">

      <div className="topbar">
        <h2>Admin Dashboard</h2>
        <span className="badge">Admin</span>
        <button className="logout-btn" onClick={handleLogout}>Sign out</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        {[
          { num: todayStats.total, label: 'Visitors', color: 'var(--primary)' },
          { num: todayStats.inside, label: 'Inside', color: 'var(--success)' },
          { num: todayStats.checkedOut, label: 'Out', color: 'var(--gray)' },
          { num: todayStats.deliveries, label: 'Delivery', color: 'var(--warning)' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="num" style={{ color: s.color, fontSize: '20px' }}>{s.num}</div>
            <div className="lbl">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        <div className="card">
          <div className="sec-hdr">Filter by date</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>From</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text)', fontSize: '13px' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>To</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text)', fontSize: '13px' }} />
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginBottom: '0' }} onClick={applyFilter}>
            Apply Filter
          </button>
        </div>
      </div>

      <div className="tabs">
        {[['visitors', 'Visitors'], ['deliveries', 'Deliveries']].map(([key, label]) => (
          <button key={key} className={`tab ${activeTab === key ? 'active' : ''}`} onClick={() => { setActiveTab(key); setSearch('') }}>
            {label}
          </button>
        ))}
      </div>

      <div className="search-wrap">
        <div style={{ position: 'relative' }}>
          <span className="search-icon">🔍</span>
          <input type="text" placeholder={activeTab === 'visitors' ? 'Search name, unit, plate...' : 'Search name, courier, unit...'}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ padding: '8px 16px 0' }}>
        <button className="btn btn-outline" onClick={activeTab === 'visitors' ? exportVisitorsCSV : exportDeliveriesCSV}>
          📊 Export CSV ({activeTab === 'visitors' ? filteredVisitors.length : filteredDeliveries.length} records)
        </button>
      </div>

      <div className="content">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '32px', opacity: 0.5, fontSize: '13px' }}>Loading...</p>
        ) : activeTab === 'visitors' ? (
          filteredVisitors.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '32px', opacity: 0.5, fontSize: '13px' }}>No visitors found</p>
          ) : filteredVisitors.map((v: any) => {
            const s = statusConfig[v.status] || statusConfig.pending
            return (
              <div key={v.id} className="card" style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/admin/verify/${v.id}`}>
                <div className="card-row" style={{ marginBottom: '8px' }}>
                  <div className="avatar">
                    {v.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                  </div>
                  <div className="card-info">
                    <h3>{v.name}</h3>
                    <p>Unit {v.unit} · {v.visit_date}</p>
                  </div>
                  <span className={s.cls}>{s.label}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text2)' }}>Host: <span style={{ color: 'var(--text)' }}>{v.host_name}</span></div>
                  <div style={{ fontSize: '11px', color: 'var(--text2)' }}>Plate: <span style={{ color: 'var(--text)' }}>{v.plate || '-'}</span></div>
                  <div style={{ fontSize: '11px', color: 'var(--text2)' }}>Phone: <span style={{ color: 'var(--text)' }}>{v.phone}</span></div>
                  <div style={{ fontSize: '11px', color: 'var(--text2)' }}>Purpose: <span style={{ color: 'var(--text)' }}>{v.purpose}</span></div>
                </div>
              </div>
            )
          })
        ) : (
          filteredDeliveries.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '32px', opacity: 0.5, fontSize: '13px' }}>No deliveries found</p>
          ) : filteredDeliveries.map((d: any) => (
            <div key={d.id} className="card">
              <div className="card-row" style={{ marginBottom: '8px' }}>
                <div className="avatar" style={{ background: 'var(--warning-light)', color: 'var(--warning)', fontSize: '18px' }}>
                  📦
                </div>
                <div className="card-info">
                  <h3>{d.courier} · {d.name}</h3>
                  <p>Units: {d.units} · {d.visit_date}</p>
                </div>
                <span className="status status-inside">Done</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text2)' }}>Phone: <span style={{ color: 'var(--text)' }}>{d.phone}</span></div>
                <div style={{ fontSize: '11px', color: 'var(--text2)' }}>Plate: <span style={{ color: 'var(--text)' }}>{d.plate || '-'}</span></div>
                <div style={{ fontSize: '11px', color: 'var(--text2)' }}>Ref: <span style={{ color: 'var(--text)' }}>{d.ref_code}</span></div>
                <div style={{ fontSize: '11px', color: 'var(--text2)' }}>Time: <span style={{ color: 'var(--text)' }}>{d.arrival_time || '-'}</span></div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}

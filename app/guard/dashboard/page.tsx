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
    if (!user) {
      window.location.href = '/guard/login'
      return
    }
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

  function getStatusBadge(status: string) {
    const styles: any = {
      pending: { bg: '#E6F1FB', color: '#185FA5', label: 'Pending' },
      inside: { bg: '#EAF3DE', color: '#3B6D11', label: 'Inside' },
      checked_out: { bg: '#F1EFE8', color: '#5F5E5A', label: 'Out' },
    }
    const s = styles[status] || styles.pending
    return (
      <span style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '20px', fontWeight: '500', background: s.bg, color: s.color, flexShrink: 0 }}>
        {s.label}
      </span>
    )
  }

  function getInitials(name: string) {
    return name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??'
  }

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: 'var(--color-background-tertiary, #F8F9FA)' }}>

      {/* Topbar */}
      <div style={{ backgroundColor: 'var(--color-background-primary, #fff)', borderBottom: '1px solid var(--color-border-tertiary, #eee)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h2 style={{ flex: 1, fontSize: '16px', fontWeight: '500', margin: '0', color: 'var(--color-text-primary)' }}>Dashboard</h2>
        <span style={{ fontSize: '12px', background: '#E6F1FB', color: '#185FA5', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' }}>
          {guardEmail}
        </span>
        <button onClick={handleLogout}
          style={{ fontSize: '12px', color: '#A32D2D', padding: '4px 8px', border: '1px solid #FCEBEB', borderRadius: '8px', background: '#FCEBEB', cursor: 'pointer' }}>
          Sign out
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '16px 16px 0' }}>
        {[
          { num: pending.length, label: 'Pending', color: '#185FA5' },
          { num: inside.length, label: 'Inside', color: '#3B6D11' },
          { num: checkedout.length, label: 'Checked out', color: '#5F5E5A' },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: 'var(--color-background-primary, #fff)', border: '1px solid var(--color-border-tertiary, #eee)', borderRadius: '8px', padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: '500', color: s.color }}>{s.num}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #888)', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', backgroundColor: 'var(--color-background-primary, #fff)', borderBottom: '1px solid var(--color-border-tertiary, #eee)', marginTop: '16px' }}>
        {[['today', 'Today'], ['inside', 'Inside'], ['history', 'History']].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{ flex: 1, padding: '12px 0', fontSize: '13px', background: 'none', border: 'none', borderBottom: activeTab === key ? '2px solid #185FA5' : '2px solid transparent', color: activeTab === key ? '#185FA5' : 'var(--color-text-secondary, #888)', fontWeight: activeTab === key ? '500' : '400', cursor: 'pointer' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ position: 'relative' }}>
          <spa

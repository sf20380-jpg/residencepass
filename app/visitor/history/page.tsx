'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function HistoryPage() {
  const [phone, setPhone] = useState('')
  const [visitors, setVisitors] = useState<any[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: any) {
    e.preventDefault()
    setLoading(true)
    setSearched(false)

    const { data } = await supabase
      .from('visitors')
      .select('*')
      .eq('host_phone', phone.trim())
      .order('created_at', { ascending: false })
      .limit(20)

    setVisitors(data || [])
    setSearched(true)
    setLoading(false)
  }

  function getStatusStyle(status: string) {
    const map: any = {
      pending: { cls: 'status status-pending', label: 'Pending' },
      inside: { cls: 'status status-inside', label: 'Inside' },
      checked_out: { cls: 'status status-out', label: 'Checked out' },
    }
    return map[status] || map.pending
  }

  function sharePass(v: any) {
    const passUrl = `${window.location.origin}/pass/${v.qr_token}`
    const message = `Your visitor pass for unit ${v.unit} on ${v.visit_date}: ${passUrl}`

    if (navigator.share) {
      navigator.share({
        title: 'Visitor Pass',
        text: message,
        url: passUrl
      })
    } else {
      navigator.clipboard.writeText(passUrl)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="app-container">

      <div style={{ background: 'var(--primary)', padding: '40px 24px 32px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.15)', borderRadius: '16px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📋</div>
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', margin: '0 0 6px' }}>My Visitor History</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0' }}>Enter your phone number to view passes</p>
      </div>

      <div style={{ padding: '20px 16px' }}>
        <form onSubmit={handleSearch}>
          <div className="field">
            <label>Your Phone Number</label>
            <input
              type="tel"
              required
              placeholder="e.g. 012-3456789"
              value={phone}
              onChange={e => setPhone(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'View My Passes'}
          </button>
        </form>

        {searched && (
          <div style={{ marginTop: '24px' }}>
            <div className="sec-hdr">
              {visitors.length > 0 ? `${visitors.length} pass(es) found` : 'No passes found'}
            </div>

            {visitors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', opacity: 0.5 }}>
                <p style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</p>
                <p style={{ fontSize: '13px' }}>No visitor passes found for this number</p>
              </div>
            ) : visitors.map((v: any) => {
              const s = getStatusStyle(v.status)
              return (
                <div key={v.id} className="card">
                  <div className="card-row" style={{ marginBottom: '10px' }}>
                    <div className="avatar">
                      {v.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                    </div>
                    <div className="card-info">
                      <h3>{v.name}</h3>
                      <p>Unit {v.unit} · {v.visit_date}</p>
                    </div>
                    <span className={s.cls}>{s.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => window.location.href = `/pass/${v.qr_token}`}
                      style={{ flex: 1, padding: '8px', background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                      View Pass
                    </button>
                    <button
                      onClick={() => sharePass(v)}
                      style={{ flex: 1, padding: '8px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                      🔗 Share Pass
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: '16px' }}>
          <button className="btn btn-outline" onClick={() => window.location.href = '/visitor'}>
            Register New Visitor
          </button>
        </div>
      </div>
    </div>
  )
}

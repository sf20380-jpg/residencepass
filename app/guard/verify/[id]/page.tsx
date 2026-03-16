'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'

export default function VerifyPage({ params }: { params: { id: string } }) {
  const [visitor, setVisitor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchVisitor()
  }, [])

  async function fetchVisitor() {
    const { data } = await supabase
      .from('visitors')
      .select('*')
      .eq('id', params.id)
      .single()
    if (data) setVisitor(data)
    setLoading(false)
  }

  async function handleCheckIn() {
    setActionLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('visitors').update({ status: 'inside' }).eq('id', params.id)
    await supabase.from('checkins').insert([{
      visitor_id: params.id,
      guard_id: user?.email?.split('@')[0] || 'unknown',
      is_walkin: false
    }])
    window.location.href = '/guard/dashboard'
  }

  async function handleCheckOut() {
    setActionLoading(true)
    const now = new Date().toISOString()
    await supabase.from('visitors').update({ status: 'checked_out' }).eq('id', params.id)
    await supabase.from('checkins')
      .update({ checked_out_at: now })
      .eq('visitor_id', params.id)
      .is('checked_out_at', null)
    window.location.href = '/guard/dashboard'
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Loading...</div>
  if (!visitor) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Visitor not found</div>

  const isInside = visitor.status === 'inside'
  const isOut = visitor.status === 'checked_out'
  const heroColor = isInside ? 'var(--success)' : 'var(--primary)'

  return (
    <div className="app-container">

      <div className="topbar">
        <button className="back-btn" onClick={() => window.location.href = '/guard/dashboard'}>←</button>
        <h2>Verify Visitor</h2>
      </div>

      <div style={{ background: heroColor, padding: '24px', textAlign: 'center', color: '#fff' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '700' }}>
          {visitor.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px' }}>{visitor.name}</h2>
        <p style={{ fontSize: '13px', opacity: 0.7, margin: '0' }}>Unit {visitor.unit} · Host: {visitor.host_name}</p>
      </div>

      <div style={{ padding: '14px 16px' }}>
        <div className="info-grid">
          {[
            { label: 'Phone', value: visitor.phone },
            { label: 'Vehicle plate', value: visitor.plate || '-' },
            { label: 'Expected arrival', value: visitor.expected_time || '-' },
            { label: 'Purpose', value: visitor.purpose || '-' },
          ].map((item, i) => (
            <div key={i} className="info-item">
              <div className="ilbl">{item.label}</div>
              <div className="ival">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="info-item" style={{ marginBottom: '16px' }}>
          <div className="ilbl">Pass code</div>
          <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '8px', color: 'var(--primary)', marginTop: '4px' }}>{visitor.otp_code}</div>
        </div>

        {!isOut && (
          <>
            {!isInside && (
              <button className="btn btn-success" onClick={handleCheckIn} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : '✓ Check-In Visitor'}
              </button>
            )}
            {isInside && (
              <button className="btn btn-danger" onClick={handleCheckOut} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Confirm Check-Out'}
              </button>
            )}
            <button className="btn btn-outline" onClick={() => window.location.href = '/guard/dashboard'}>
              Cancel
            </button>
          </>
        )}

        {isOut && (
          <div style={{ background: 'var(--gray-light)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
            <p style={{ color: 'var(--gray)', fontSize: '14px', margin: '0' }}>Visitor has already checked out</p>
          </div>
        )}
      </div>
    </div>
  )
}

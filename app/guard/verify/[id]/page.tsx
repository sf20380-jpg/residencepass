'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'

export default function VerifyPage({ params }: { params: { id: string } }) {
  const [visitor, setVisitor] = useState<any>(null)
  const [checkin, setCheckin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchVisitor()
  }, [])

  async function fetchVisitor() {
    const { data: v } = await supabase
      .from('visitors')
      .select('*')
      .eq('id', params.id)
      .single()
    if (v) setVisitor(v)

    const { data: c } = await supabase
      .from('checkins')
      .select('*')
      .eq('visitor_id', params.id)
      .order('checked_in_at', { ascending: false })
      .limit(1)
      .single()
    if (c) setCheckin(c)

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

  function formatTime(ts: string | null) {
    if (!ts) return '-'
    return new Date(ts).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })
  }

  function formatDateTime(ts: string | null) {
    if (!ts) return '-'
    return new Date(ts).toLocaleString('en-MY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Loading...</div>
  if (!visitor) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Visitor not found</div>

  const isPending = visitor.status === 'pending'
  const isInside = visitor.status === 'inside'
  const isOut = visitor.status === 'checked_out'
  const heroColor = isInside ? 'var(--success)' : isOut ? 'var(--gray)' : 'var(--primary)'

  return (
    <div className="app-container">

      <div className="topbar">
        <button className="back-btn" onClick={() => window.history.back()}>←</button>
        <h2>Visitor Details</h2>
      </div>

      <div style={{ background: heroColor, padding: '24px', textAlign: 'center', color: '#fff' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '700' }}>
          {visitor.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px' }}>{visitor.name}</h2>
        <p style={{ fontSize: '13px', opacity: 0.7, margin: '0' }}>Unit {visitor.unit} · Host: {visitor.host_name}</p>
        <div style={{ marginTop: '10px' }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', fontSize: '12px', padding: '3px 12px', borderRadius: '20px' }}>
            {isPending ? 'Pending' : isInside ? 'Inside' : 'Checked Out'}
          </span>
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>

        {/* Visitor Info */}
        <div className="sec-hdr">Visitor Information</div>
        <div className="info-grid" style={{ marginBottom: '14px' }}>
          <div className="info-item">
            <div className="ilbl">Phone</div>
            <div className="ival">{visitor.phone}</div>
          </div>
          <div className="info-item">
            <div className="ilbl">Vehicle plate</div>
            <div className="ival">{visitor.plate || '-'}</div>
          </div>
          <div className="info-item">
            <div className="ilbl">Purpose</div>
            <div className="ival">{visitor.purpose || '-'}</div>
          </div>
          <div className="info-item">
            <div className="ilbl">Visit date</div>
            <div className="ival">{visitor.visit_date}</div>
          </div>
        </div>

        {/* Timing Info — changes based on status */}
        <div className="sec-hdr">Timing</div>
        <div className="info-grid" style={{ marginBottom: '14px' }}>
          {isPending && (
            <>
              <div className="info-item">
                <div className="ilbl">Expected arrival</div>
                <div className="ival">{visitor.expected_time || '-'}</div>
              </div>
              <div className="info-item">
                <div className="ilbl">Pass code</div>
                <div className="ival" style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '4px', color: 'var(--primary)' }}>{visitor.otp_code}</div>
              </div>
            </>
          )}
          {(isInside || isOut) && checkin && (
            <>
              <div className="info-item">
                <div className="ilbl">Checked in at</div>
                <div className="ival" style={{ color: 'var(--success)' }}>{formatDateTime(checkin.checked_in_at)}</div>
              </div>
              <div className="info-item">
                <div className="ilbl">Checked out at</div>
                <div className="ival" style={{ color: isOut ? 'var(--danger)' : 'var(--text2)' }}>
                  {isOut ? formatDateTime(checkin.checked_out_at) : 'Still inside'}
                </div>
              </div>
              {checkin.guard_id && (
                <div className="info-item">
                  <div className="ilbl">Processed by</div>
                  <div className="ival">{checkin.guard_id}</div>
                </div>
              )}
              {checkin.is_walkin && (
                <div className="info-item">
                  <div className="ilbl">Type</div>
                  <div className="ival" style={{ color: 'var(--warning)' }}>Walk-in</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        {isPending && (
          <button className="btn btn-success" onClick={handleCheckIn} disabled={actionLoading}>
            {actionLoading ? 'Processing...' : '✓ Check-In Visitor'}
          </button>
        )}
        {isInside && (
          <button className="btn btn-danger" onClick={handleCheckOut} disabled={actionLoading}>
            {actionLoading ? 'Processing...' : 'Confirm Check-Out'}
          </button>
        )}
        {isOut && (
          <div style={{ background: 'var(--gray-light)', borderRadius: '10px', padding: '16px', textAlign: 'center', marginBottom: '8px' }}>
            <p style={{ color: 'var(--gray)', fontSize: '14px', margin: '0' }}>Visitor has checked out</p>
          </div>
        )}
        <button className="btn btn-outline" onClick={() => window.history.back()}>
          Back
        </button>
      </div>
    </div>
  )
}

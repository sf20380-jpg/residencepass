'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'

export default function AdminVerifyPage({ params }: { params: { id: string } }) {
  const [visitor, setVisitor] = useState<any>(null)
  const [checkin, setCheckin] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
        <span className="badge">Admin</span>
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
          <div className="info-item">
            <div className="ilbl">Host phone</div>
            <div className="ival">{visitor.host_phone || '-'}</div>
          </div>
          <div className="info-item">
            <div className="ilbl">Pass code</div>
            <div className="ival" style={{ fontWeight: '700', letterSpacing: '4px', color: 'var(--primary)' }}>{visitor.otp_code}</div>
          </div>
        </div>

        <div className="sec-hdr">Timing</div>
        <div className="info-grid" style={{ marginBottom: '14px' }}>
          <div className="info-item">
            <div className="ilbl">Expected arrival</div>
            <div className="ival">{visitor.expected_time || '-'}</div>
          </div>
          <div className="info-item">
            <div className="ilbl">Type</div>
            <div className="ival" style={{ color: checkin?.is_walkin ? 'var(--warning)' : 'var(--primary)' }}>
              {checkin ? (checkin.is_walkin ? 'Walk-in' : 'Pre-registered') : '-'}
            </div>
          </div>
          {checkin && (
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
              <div className="info-item">
                <div className="ilbl">Processed by</div>
                <div className="ival">{checkin.guard_id || '-'}</div>
              </div>
            </>
          )}
        </div>

        <button className="btn btn-outline" onClick={() => window.history.back()}>
          Back
        </button>
      </div>
    </div>
  )
}

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

  function getInitials(name: string) {
    return name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??'
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Loading...</div>
  if (!visitor) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Visitor not found</div>

  const isInside = visitor.status === 'inside'
  const isOut = visitor.status === 'checked_out'
  const heroColor = isInside ? '#3B6D11' : '#185FA5'

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto', minHeight: '100vh', fontFamily: 'sans-serif' }}>

      {/* Topbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={() => window.location.href = '/guard/dashboard'}
          style={{ background: 'none', border: 'none', fontSize: '18px', color: '#185FA5', cursor: 'pointer' }}>←</button>
        <h2 style={{ flex: 1, fontSize: '16px', fontWeight: '500', margin: '0' }}>Verify Visitor</h2>
      </div>

      {/* Hero */}
      <div style={{ background: heroColor, padding: '24px', textAlign: 'center', color: '#fff' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '500' }}>
          {getInitials(visitor.name)}
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '500', margin: '0 0 4px' }}>{visitor.name}</h2>
        <p style={{ fontSize: '13px', opacity: 0.7, margin: '0' }}>Unit {visitor.unit} · Host: {visitor.host_name}</p>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          {[
            { label: 'Phone', value: visitor.phone },
            { label: 'Vehicle plate', value: visitor.plate || '-' },
            { label: 'Expected arrival', value: visitor.expected_time || '-' },
            { label: 'Purpose', value: visitor.purpose || '-' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#F8F9FA', borderRadius: '8px', padding: '10px 12px' }}>
              <p style={{ fontSize: '11px', color: '#888', margin: '0 0 2px' }}>{item.label}</p>
              <p style={{ fontSize: '13px', fontWeight: '500', margin: '0' }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Status */}
        <div style={{ background: '#F8F9FA', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', color: '#888', margin: '0 0 2px' }}>Pass code</p>
          <p style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '6px', color: '#185FA5', margin: '0' }}>{visitor.otp_code}</p>
        </div>

        {/* Actions */}
        {!isOut && (
          <>
            {!isInside && (
              <button onClick={handleCheckIn} disabled={actionLoading}
                style={{ width: '100%', padding: '13px', background: '#3B6D11', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginBottom: '8px' }}>
                {actionLoading ? 'Processing...' : '✓ Check-In Visitor'}
              </button>
            )}
            {isInside && (
              <button onClick={handleCheckOut} disabled={actionLoading}
                style={{ width: '100%', padding: '13px', background: '#A32D2D', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginBottom: '8px' }}>
                {actionLoading ? 'Processing...' : 'Confirm Check-Out'}
              </button>
            )}
            <button onClick={() => window.location.href = '/guard/dashboard'}
              style={{ width: '100%', padding: '13px', background: 'none', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
              Cancel
            </button>
          </>
        )}

        {isOut && (
          <div style={{ background: '#F1EFE8', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
            <p style={{ color: '#5F5E5A', fontSize: '14px', margin: '0' }}>Visitor has already checked out</p>
          </div>
        )}
      </div>
    </div>
  )
}
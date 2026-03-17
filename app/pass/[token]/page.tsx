'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { QRCodeSVG } from 'qrcode.react'

export default function PassPage({ params }: { params: { token: string } }) {
  const [visitor, setVisitor] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVisitor() {
      const { data } = await supabase
        .from('visitors')
        .select('*')
        .eq('qr_token', params.token)
        .single()
      if (data) setVisitor(data)
      setLoading(false)
    }
    fetchVisitor()
  }, [])

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Loading...</div>
  if (!visitor) return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <p style={{ fontSize: '40px', marginBottom: '16px' }}>❌</p>
      <h2>Pass not found</h2>
      <p style={{ color: '#888', marginTop: '8px' }}>This pass may have expired or is invalid.</p>
    </div>
  )

  const isExpired = visitor.status === 'checked_out'
  const isInside = visitor.status === 'inside'

  return (
    <div className="app-container">

      <div className="topbar">
        <button className="back-btn" onClick={() => window.location.href = '/'}>←</button>
        <h2>Visitor Pass</h2>
      </div>
      <div style={{ background: isExpired ? 'var(--gray)' : isInside ? 'var(--success)' : 'var(--primary)', padding: '40px 24px 32px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.15)', borderRadius: '16px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
          {isExpired ? '✗' : isInside ? '✓' : '🎫'}
        </div>
        <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', margin: '0 0 6px' }}>
          {isExpired ? 'Pass Expired' : isInside ? 'Currently Inside' : 'Visitor Pass'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0' }}>
          {isExpired ? 'This pass has been used' : isInside ? 'Visitor is inside the compound' : 'Show this to the guard at entrance'}
        </p>
      </div>

      <div style={{ padding: '16px' }}>

        {!isExpired && (
          <div className="card" style={{ textAlign: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '16px' }}>Scan QR or use pass code</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: '#fff', borderRadius: '12px', display: 'inline-block' }}>
                <QRCodeSVG value={params.token} size={160} level="M" />
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '8px' }}>Pass code</p>
            <div style={{ fontSize: '36px', fontWeight: '700', letterSpacing: '10px', color: 'var(--primary)', marginBottom: '10px' }}>
              {visitor.otp_code}
            </div>
            <div style={{ display: 'inline-block', background: 'var(--warning-light)', color: 'var(--warning)', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' }}>
              Valid today only
            </div>
          </div>
        )}

        <div className="card">
          <div className="sec-hdr">Visitor Details</div>
          <div className="info-grid">
            <div className="info-item">
              <div className="ilbl">Name</div>
              <div className="ival">{visitor.name}</div>
            </div>
            <div className="info-item">
              <div className="ilbl">Unit</div>
              <div className="ival">{visitor.unit}</div>
            </div>
            <div className="info-item">
              <div className="ilbl">Phone</div>
              <div className="ival">{visitor.phone}</div>
            </div>
            <div className="info-item">
              <div className="ilbl">Plate</div>
              <div className="ival">{visitor.plate || '-'}</div>
            </div>
            <div className="info-item">
              <div className="ilbl">Visit date</div>
              <div className="ival">{visitor.visit_date}</div>
            </div>
            <div className="info-item">
              <div className="ilbl">Purpose</div>
              <div className="ival">{visitor.purpose}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

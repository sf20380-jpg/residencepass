'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { QRCodeSVG } from 'qrcode.react'

function SuccessContent() {
  const params = useSearchParams()
  const otp = params.get('otp')
  const name = params.get('name')
  const unit = params.get('unit')
  const phone = params.get('phone')
  const plate = params.get('plate')
  const token = params.get('token')

  return (
    <div className="app-container">

      <div style={{ background: 'var(--primary)', padding: '40px 24px 32px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>✓</div>
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', margin: '0 0 6px' }}>Access Code Ready</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0' }}>Show this to the guard at entrance</p>
      </div>

      <div style={{ padding: '16px' }}>

        <div className="card" style={{ textAlign: 'center', marginBottom: '12px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '16px' }}>Scan QR code or use pass code below</p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: '#fff', borderRadius: '12px', display: 'inline-block' }}>
              <QRCodeSVG
                value={token || ''}
                size={160}
                level="M"
              />
            </div>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '8px' }}>or use pass code</p>
          <div style={{ fontSize: '36px', fontWeight: '700', letterSpacing: '10px', color: 'var(--primary)', marginBottom: '10px' }}>
            {otp}
          </div>
          <div style={{ display: 'inline-block', background: 'var(--warning-light)', color: 'var(--warning)', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' }}>
            Valid today only
          </div>
        </div>

        <div className="card">
          <div className="sec-hdr">Visitor Details</div>
          <div className="info-grid">
            <div className="info-item">
              <div className="ilbl">Name</div>
              <div className="ival">{name}</div>
            </div>
            <div className="info-item">
              <div className="ilbl">Unit</div>
              <div className="ival">{unit}</div>
            </div>
            <div className="info-item">
              <div className="ilbl">Phone</div>
              <div className="ival">{phone || '-'}</div>
            </div>
            <div className="info-item">
              <div className="ilbl">Plate</div>
              <div className="ival">{plate || '-'}</div>
            </div>
          </div>
        </div>

        <button className="btn btn-outline" style={{ background: '#25D366', color: '#fff', border: 'none' }}
          onClick={() => {
            const passUrl = `${window.location.origin}/pass/${token}`
            const message = `Hi! Here is your visitor pass for ${name} to visit unit ${unit}. Please show this to the guard at entrance: ${passUrl}`
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`)
          }}>
          📲 Share via WhatsApp
        </button>
        <button className="btn btn-outline" onClick={() => window.location.href = '/visitor'}>
          Register Another Visitor
        </button>
        <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
          Back to Home
        </button>

      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}

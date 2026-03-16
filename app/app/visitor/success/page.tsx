'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const params = useSearchParams()
  const otp = params.get('otp')
  const name = params.get('name')
  const unit = params.get('unit')
  const token = params.get('token')

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto', padding: '24px', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ width: '64px', height: '64px', background: '#EAF3DE', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>✓</div>
        <h2 style={{ color: '#185FA5', marginBottom: '4px' }}>Access Code Generated</h2>
        <p style={{ color: '#888', fontSize: '13px' }}>Show this to the guard at entrance</p>
      </div>

      <div style={{ background: '#F8F9FA', border: '1px solid #ddd', borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>One-time pass code</p>
        <div style={{ fontSize: '36px', fontWeight: '700', letterSpacing: '12px', color: '#185FA5', marginBottom: '8px' }}>
          {otp}
        </div>
        <p style={{ fontSize: '11px', color: '#aaa' }}>Valid today only</p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', fontWeight: '600' }}>Visitor Details</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ background: '#F8F9FA', borderRadius: '8px', padding: '10px' }}>
            <p style={{ fontSize: '11px', color: '#888', margin: '0 0 2px' }}>Name</p>
            <p style={{ fontSize: '13px', fontWeight: '500', margin: '0' }}>{name}</p>
          </div>
          <div style={{ background: '#F8F9FA', borderRadius: '8px', padding: '10px' }}>
            <p style={{ fontSize: '11px', color: '#888', margin: '0 0 2px' }}>Unit</p>
            <p style={{ fontSize: '13px', fontWeight: '500', margin: '0' }}>{unit}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.location.href = '/visitor'}
        style={{ width: '100%', padding: '13px', background: 'none', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
        Register Another Visitor
      </button>
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
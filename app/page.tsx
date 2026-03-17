'use client'

export default function Home() {
  return (
    <div className="app-container">

      <div style={{ background: 'var(--primary)', padding: '56px 24px 40px', textAlign: 'center' }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          <img
            src="/162residency_logo.png"
            alt="162 Residency"
            style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '16px' }}
          />
        </div>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '700', margin: '0 0 6px' }}>162 Residency</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0' }}>Visitor Management System</p>
      </div>

      <div style={{ padding: '32px 16px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text2)', textAlign: 'center', marginBottom: '24px' }}>Select your role to continue</p>

        <div className="card" style={{ cursor: 'pointer', marginBottom: '12px' }}
          onClick={() => window.location.href = '/visitor'}>
          <div className="card-row">
            <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '20px', background: 'var(--primary-light)' }}>🏠</div>
            <div className="card-info">
              <h3>Resident / Visitor</h3>
              <p>Register a visitor & generate access pass</p>
            </div>
            <span style={{ fontSize: '18px', color: 'var(--text2)' }}>›</span>
          </div>
        </div>

        <div className="card" style={{ cursor: 'pointer', marginBottom: '12px' }}
          onClick={() => window.location.href = '/visitor/history'}>
          <div className="card-row">
            <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '20px', background: 'var(--success-light)' }}>📋</div>
            <div className="card-info">
              <h3>My Visitor History</h3>
              <p>View & reshare previous passes</p>
            </div>
            <span style={{ fontSize: '18px', color: 'var(--text2)' }}>›</span>
          </div>
        </div>

        <div className="card" style={{ cursor: 'pointer' }}
          onClick={() => window.location.href = '/guard/login'}>
          <div className="card-row">
            <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '20px', background: 'var(--success-light)' }}>🛡️</div>
            <div className="card-info">
              <h3>Security Guard</h3>
              <p>Login to verify & check-in visitors</p>
            </div>
            <span style={{ fontSize: '18px', color: 'var(--text2)' }}>›</span>
          </div>
        </div>

      </div>

      <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text2)', padding: '0 0 32px' }}>
        162 Residency Selayang © {new Date().getFullYear()}
      </p>

    </div>
  )
}

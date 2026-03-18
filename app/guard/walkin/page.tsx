'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function WalkInPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', plate: '', unit: '', host_name: '', purpose: 'Family visit'
  })

  // Unit dropdown state
  const [unitBlock, setUnitBlock] = useState('')
  const [unitFloor, setUnitFloor] = useState('')
  const [unitNo, setUnitNo] = useState('')

  // Helper: capitalize each word
  function toTitleCase(str: string) {
    return str.replace(/\b\w/g, c => c.toUpperCase())
  }

  // Helper: strip non-digits from phone
  function cleanPhone(str: string) {
    return str.replace(/\D/g, '')
  }

  function handleChange(e: any) {
    const { name, value } = e.target
    let processed = value

    if (name === 'name' || name === 'host_name') {
      processed = toTitleCase(value)
    }
    if (name === 'phone') {
      processed = cleanPhone(value)
    }
    if (name === 'plate') {
      processed = value.toUpperCase()
    }

    setForm({ ...form, [name]: processed })
  }

  function handleUnitBlock(e: any) {
    const val = e.target.value
    setUnitBlock(val)
    setForm(f => ({ ...f, unit: `${val}-${unitFloor}-${unitNo.toUpperCase()}` }))
  }
  function handleUnitFloor(e: any) {
    const val = e.target.value
    setUnitFloor(val)
    setForm(f => ({ ...f, unit: `${unitBlock}-${val}-${unitNo.toUpperCase()}` }))
  }
  function handleUnitNo(e: any) {
    const val = e.target.value.toUpperCase()
    setUnitNo(val)
    setForm(f => ({ ...f, unit: `${unitBlock}-${unitFloor}-${val}` }))
  }

  async function handleSubmit(e: any) {
    e.preventDefault()

    if (!unitBlock || !unitFloor || !unitNo.trim()) {
      alert('Please complete the unit (Block, Floor & Unit No.)')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/guard/login'; return }

    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    const token = crypto.randomUUID()
    const today = new Date().toISOString().split('T')[0]
    const finalUnit = `${unitBlock}-${unitFloor}-${unitNo.trim().toUpperCase()}`

    const { data: visitor, error } = await supabase.from('visitors').insert([{
      ...form,
      unit: finalUnit,
      otp_code: otp,
      qr_token: token,
      visit_date: today,
      status: 'inside'
    }]).select().single()

    if (error) {
      alert('Error: ' + error.message)
      setLoading(false)
      return
    }

    await supabase.from('checkins').insert([{
      visitor_id: visitor.id,
      guard_id: user.email?.split('@')[0] || 'unknown',
      is_walkin: true
    }])

    window.location.href = '/guard/dashboard'
  }

  const selectStyle = {
    flex: 1,
    padding: '10px 8px',
    border: '1.5px solid var(--border)',
    borderRadius: '10px',
    fontSize: '14px',
    background: 'var(--bg)',
    color: 'var(--text)',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    paddingRight: '28px',
  }

  return (
    <div className="app-container">

      <div className="topbar">
        <button className="back-btn" onClick={() => window.location.href = '/guard/dashboard'}>←</button>
        <h2>Walk-In Registration</h2>
      </div>

      <div style={{ padding: '16px' }}>
        <div className="warning-box">
          <p>⚠️ Visitor without pre-registration. Please confirm with resident before proceeding.</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Visitor Name */}
          <div className="field">
            <label>Visitor Name *</label>
            <input
              type="text" name="name" required
              placeholder="Full name"
              value={form.name}
              onChange={handleChange} />
          </div>

          {/* Phone */}
          <div className="field">
            <label>Phone Number *</label>
            <input
              type="tel" name="phone" required
              placeholder="e.g. 0123456789"
              value={form.phone}
              onChange={handleChange} />
            <span style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '4px', display: 'block' }}>
              Digits only, no dashes (e.g. 0123456789)
            </span>
          </div>

          {/* Vehicle Plate */}
          <div className="field">
            <label>Vehicle Plate No.</label>
            <input
              type="text" name="plate"
              placeholder="Optional"
              value={form.plate}
              onChange={handleChange} />
          </div>

          {/* Unit — 3 part dropdown */}
          <div className="field">
            <label>Unit to Visit *</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select value={unitBlock} onChange={handleUnitBlock} style={selectStyle} required>
                <option value="">Block</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>

              <span style={{ color: 'var(--text2)', fontWeight: '600' }}>-</span>

              <select value={unitFloor} onChange={handleUnitFloor} style={selectStyle} required>
                <option value="">Floor</option>
                {Array.from({ length: 9 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={String(n)}>{n}</option>
                ))}
              </select>

              <span style={{ color: 'var(--text2)', fontWeight: '600' }}>-</span>

              <input
                type="text"
                placeholder="No."
                value={unitNo}
                onChange={handleUnitNo}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  border: '1.5px solid var(--border)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                }}
              />
            </div>

            {unitBlock && unitFloor && unitNo && (
              <span style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '6px', display: 'block', fontWeight: '600' }}>
                ✓ Unit: {unitBlock}-{unitFloor}-{unitNo.toUpperCase()}
              </span>
            )}
          </div>

          {/* Resident Name */}
          <div className="field">
            <label>Resident's Name</label>
            <input
              type="text" name="host_name"
              placeholder="Name of resident"
              value={form.host_name}
              onChange={handleChange} />
          </div>

          {/* Purpose */}
          <div className="field">
            <label>Purpose of Visit</label>
            <select name="purpose" onChange={handleChange}>
              <option>Family visit</option>
              <option>Delivery</option>
              <option>Contractor / work</option>
              <option>Friend / guest</option>
              <option>Other</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register & Check-In'}
          </button>

        </form>
      </div>

      <div className="bottomnav">
        <button onClick={() => window.location.href = '/guard/dashboard'}>
          <span className="nav-icon">📊</span>
          Dashboard
        </button>
        <button onClick={() => window.location.href = '/guard/scan'}>
          <span className="nav-icon">📷</span>
          Scan
        </button>
        <button className="active">
          <span className="nav-icon">➕</span>
          Walk-in
        </button>
      </div>

    </div>
  )
}

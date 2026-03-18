'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function VisitorPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', plate: '', unit: '',
    host_name: '', host_phone: '', purpose: 'Family visit',
    visit_date: '', expected_time: ''
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

  // Helper: pad unit number to 2 digits, preserve trailing letters (e.g. 2→02, 3A→03A, 12→12)
  function formatUnitNo(str: string) {
    return str.replace(/^(\d+)([A-Z]*)$/, (_, num, letters) => {
      return num.padStart(2, '0') + letters
    })
  }

  function handleChange(e: any) {
    const { name, value } = e.target
    let processed = value

    if (name === 'name' || name === 'host_name') {
      processed = value.toUpperCase()
    }
    if (name === 'phone' || name === 'host_phone') {
      processed = cleanPhone(value)
    }
    if (name === 'plate') {
      processed = value.toUpperCase()
    }

    setForm({ ...form, [name]: processed })
  }

  // Update combined unit whenever any part changes
  function handleUnitBlock(e: any) {
    const val = e.target.value
    setUnitBlock(val)
    const combined = `${val}-${unitFloor}-${unitNo.toUpperCase()}`
    setForm(f => ({ ...f, unit: combined }))
  }
  function handleUnitFloor(e: any) {
    const val = e.target.value
    setUnitFloor(val)
    const combined = `${unitBlock}-${val}-${unitNo.toUpperCase()}`
    setForm(f => ({ ...f, unit: combined }))
  }
  function handleUnitNo(e: any) {
    const raw = e.target.value.toUpperCase()
    setUnitNo(raw)
    setForm(f => ({ ...f, unit: `${unitBlock}-${unitFloor}-${raw}` }))
  }

  function handleUnitNoBlur() {
    if (!unitNo) return
    const formatted = formatUnitNo(unitNo)
    setUnitNo(formatted)
    setForm(f => ({ ...f, unit: `${unitBlock}-${unitFloor}-${formatted}` }))
  }

  async function handleSubmit(e: any) {
    e.preventDefault()

    // Validate unit
    if (!unitBlock || !unitFloor || !unitNo.trim()) {
      alert('Please complete the unit (Block, Floor & Unit No.)')
      return
    }

    setLoading(true)

    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    const token = crypto.randomUUID()

    const finalUnit = `${unitBlock}-${unitFloor}-${formatUnitNo(unitNo.trim().toUpperCase())}`

    const { data, error } = await supabase.from('visitors').insert([{
      ...form,
      unit: finalUnit,
      otp_code: otp,
      qr_token: token,
      status: 'pending'
    }]).select()

    if (error) {
      alert('Error: ' + error.message)
      setLoading(false)
      return
    }

    window.location.href = `/visitor/success?otp=${otp}&token=${token}&name=${encodeURIComponent(form.name)}&unit=${encodeURIComponent(finalUnit)}&phone=${encodeURIComponent(form.phone)}&plate=${encodeURIComponent(form.plate)}`
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
        <button className="back-btn" onClick={() => window.location.href = '/'}>←</button>
        <h2>Register Visitor</h2>
      </div>

      <div style={{ background: 'var(--primary)', padding: '40px 24px 32px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.15)', borderRadius: '16px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🏠</div>
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', margin: '0 0 6px' }}>Register Visitor</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0' }}>No login required</p>
      </div>

      <div style={{ padding: '20px 16px' }}>
        <form onSubmit={handleSubmit}>

          {/* Visitor Name */}
          <div className="field">
            <label>Visitor Name *</label>
            <input
              type="text" name="name" required
              placeholder="e.g. Ahmad Bin Ali"
              value={form.name}
              onChange={handleChange} />
          </div>

          {/* Visitor Phone */}
          <div className="field">
            <label>Visitor Phone *</label>
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
              placeholder="e.g. WXY1234"
              value={form.plate}
              onChange={handleChange} />
          </div>

          {/* Unit to Visit — 3 part dropdown */}
          <div className="field">
            <label>Unit to Visit *</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Block */}
              <select value={unitBlock} onChange={handleUnitBlock} style={selectStyle} required>
                <option value="">Block</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>

              <span style={{ color: 'var(--text2)', fontWeight: '600' }}>-</span>

              {/* Tingkat */}
              <select value={unitFloor} onChange={handleUnitFloor} style={selectStyle} required>
                <option value="">Floor</option>
                {Array.from({ length: 9 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={String(n)}>{n}</option>
                ))}
              </select>

              <span style={{ color: 'var(--text2)', fontWeight: '600' }}>-</span>

              {/* No. Unit — manual, auto uppercase */}
              <input
                type="text"
                placeholder="No."
                value={unitNo}
                onChange={handleUnitNo}
                onBlur={handleUnitNoBlur}
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

            {/* Preview */}
            {unitBlock && unitFloor && unitNo && (
              <span style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '6px', display: 'block', fontWeight: '600' }}>
                ✓ Unit: {unitBlock}-{unitFloor}-{formatUnitNo(unitNo.toUpperCase())}
              </span>
            )}
          </div>

          {/* Resident Name */}
          <div className="field">
            <label>Resident's Name *</label>
            <input
              type="text" name="host_name" required
              placeholder="e.g. Sarah Johnson"
              value={form.host_name}
              onChange={handleChange} />
          </div>

          {/* Resident Phone */}
          <div className="field">
            <label>Resident's Phone *</label>
            <input
              type="tel" name="host_phone" required
              placeholder="e.g. 0123456789"
              value={form.host_phone}
              onChange={handleChange} />
            <span style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '4px', display: 'block' }}>
              Digits only, no dashes (e.g. 0123456789)
            </span>
          </div>

          {/* Visit Date */}
          <div className="field">
            <label>Visit Date *</label>
            <input type="date" name="visit_date" required onChange={handleChange} />
          </div>

          {/* Expected Arrival Time */}
          <div className="field">
            <label>Expected Arrival Time</label>
            <input type="time" name="expected_time" onChange={handleChange} />
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
            {loading ? 'Generating...' : 'Generate Access Code'}
          </button>

        </form>
      </div>
    </div>
  )
}

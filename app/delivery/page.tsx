'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function DeliveryPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [refCode, setRefCode] = useState('')
  const [form, setForm] = useState({
    name: '', phone: '', courier: 'Poslaju', plate: '', units: ''
  })

  // Unit type toggle
  const [unitType, setUnitType] = useState<'single' | 'multi'>('single')

  // Single unit dropdown state
  const [unitBlock, setUnitBlock] = useState('')
  const [unitFloor, setUnitFloor] = useState('')
  const [unitNo, setUnitNo] = useState('')

  // Multi unit block checkboxes
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([])

  // Frequent rider suggestion
  const [suggestion, setSuggestion] = useState<any>(null)

  // Helper: strip non-digits from phone
  function cleanPhone(str: string) {
    return str.replace(/\D/g, '')
  }

  // Helper: pad unit number to 2 digits
  function formatUnitNo(str: string) {
    return str.replace(/^(\d+)([A-Z]*)$/, (_, num, letters) => {
      return num.padStart(2, '0') + letters
    })
  }

  function handleChange(e: any) {
    const { name, value } = e.target
    let processed = value

    if (name === 'name') processed = value.toUpperCase()
    if (name === 'phone') processed = cleanPhone(value)
    if (name === 'plate') processed = value.toUpperCase()

    setForm({ ...form, [name]: processed })
  }

  // Search for previous delivery when phone is filled
  async function handlePhoneBlur() {
    const phone = form.phone.trim()
    if (phone.length < 9) return

    const { data } = await supabase
      .from('deliveries')
      .select('name, phone, courier, plate')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (data) {
      setSuggestion(data)
    } else {
      setSuggestion(null)
    }
  }

  // Auto-fill form from suggestion
  function applySuggestion() {
    if (!suggestion) return
    setForm(f => ({
      ...f,
      name: suggestion.name || '',
      courier: suggestion.courier || 'Poslaju',
      plate: suggestion.plate || '',
    }))
    setSuggestion(null)
  }

  // Unit dropdown handlers
  function handleUnitBlock(e: any) {
    const val = e.target.value
    setUnitBlock(val)
    setForm(f => ({ ...f, units: `${val}-${unitFloor}-${unitNo.toUpperCase()}` }))
  }

  function handleUnitFloor(e: any) {
    const val = e.target.value
    setUnitFloor(val)
    setForm(f => ({ ...f, units: `${unitBlock}-${val}-${unitNo.toUpperCase()}` }))
  }

  function handleUnitNo(e: any) {
    const raw = e.target.value.toUpperCase()
    setUnitNo(raw)
    setForm(f => ({ ...f, units: `${unitBlock}-${unitFloor}-${raw}` }))
  }

  function handleUnitNoBlur() {
    if (!unitNo) return
    const formatted = formatUnitNo(unitNo)
    setUnitNo(formatted)
    setForm(f => ({ ...f, units: `${unitBlock}-${unitFloor}-${formatted}` }))
  }

  // Block checkbox handler
  function toggleBlock(block: string) {
    const updated = selectedBlocks.includes(block)
      ? selectedBlocks.filter(b => b !== block)
      : [...selectedBlocks, block].sort()
    setSelectedBlocks(updated)
    setForm(f => ({ ...f, units: updated.map(b => `Block ${b}`).join(', ') }))
  }

  // Reset unit fields when switching type
  function handleUnitTypeChange(type: 'single' | 'multi') {
    setUnitType(type)
    setUnitBlock('')
    setUnitFloor('')
    setUnitNo('')
    setSelectedBlocks([])
    setForm(f => ({ ...f, units: '' }))
  }

  async function handleSubmit(e: any) {
    e.preventDefault()

    if (unitType === 'single' && (!unitBlock || !unitFloor || !unitNo.trim())) {
      alert('Please complete the unit (Block, Floor & Unit No.)')
      return
    }
    if (unitType === 'multi' && selectedBlocks.length === 0) {
      alert('Please select at least one block')
      return
    }

    setLoading(true)

    const ref = Math.floor(100000 + Math.random() * 900000).toString()
    const today = new Date().toISOString().split('T')[0]
    const time = new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })

    const finalUnits = unitType === 'single'
      ? `${unitBlock}-${unitFloor}-${formatUnitNo(unitNo.trim().toUpperCase())}`
      : selectedBlocks.map(b => `Block ${b}`).join(', ')

    const { error } = await supabase.from('deliveries').insert([{
      name: form.name,
      phone: form.phone,
      courier: form.courier,
      plate: form.plate || null,
      units: finalUnits,
      ref_code: ref,
      visit_date: today,
      arrival_time: time,
      status: 'completed'
    }])

    if (error) {
      alert('Error: ' + error.message)
      setLoading(false)
      return
    }

    setRefCode(ref)
    setForm(f => ({ ...f, units: finalUnits }))
    setSubmitted(true)
    setLoading(false)
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

  if (submitted) {
    return (
      <div className="app-container">
        <div style={{ background: 'var(--success)', padding: '40px 24px 32px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>✓</div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', margin: '0 0 6px' }}>Delivery Registered</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0' }}>Show this screen to the guard</p>
        </div>

        <div style={{ padding: '16px' }}>
          <div className="card" style={{ textAlign: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '8px' }}>Reference code</p>
            <div style={{ fontSize: '36px', fontWeight: '700', letterSpacing: '8px', color: 'var(--success)', marginBottom: '8px' }}>
              {refCode}
            </div>
            <div style={{ display: 'inline-block', background: 'var(--success-light)', color: 'var(--success)', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' }}>
              {new Date().toLocaleDateString('en-MY')} · {new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="card">
            <div className="sec-hdr">Delivery Details</div>
            <div className="info-grid">
              <div className="info-item">
                <div className="ilbl">Name</div>
                <div className="ival">{form.name}</div>
              </div>
              <div className="info-item">
                <div className="ilbl">Courier</div>
                <div className="ival">{form.courier}</div>
              </div>
              <div className="info-item">
                <div className="ilbl">Phone</div>
                <div className="ival">{form.phone}</div>
              </div>
              <div className="info-item">
                <div className="ilbl">Plate</div>
                <div className="ival">{form.plate || '-'}</div>
              </div>
            </div>
            <div className="info-item" style={{ marginTop: '8px' }}>
              <div className="ilbl">Unit(s)</div>
              <div className="ival">{form.units}</div>
            </div>
          </div>

          <button className="btn btn-outline" onClick={() => {
            setSubmitted(false)
            setForm({ name: '', phone: '', courier: 'Poslaju', plate: '', units: '' })
            setUnitBlock('')
            setUnitFloor('')
            setUnitNo('')
            setSelectedBlocks([])
            setUnitType('single')
          }}>
            New Delivery
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <div style={{ background: 'var(--primary)', padding: '40px 24px 32px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.15)', borderRadius: '16px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📦</div>
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', margin: '0 0 6px' }}>Delivery Check-In</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0' }}>162 Residency Selayang</p>
      </div>

      <div style={{ padding: '20px 16px' }}>
        <form onSubmit={handleSubmit}>

          {/* Phone — first, triggers suggestion */}
          <div className="field">
            <label>Phone Number *</label>
            <input
              type="tel" name="phone" required
              placeholder="e.g. 0123456789"
              value={form.phone}
              onChange={handleChange}
              onBlur={handlePhoneBlur} />
            <span style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '4px', display: 'block' }}>
              Digits only, no dashes (e.g. 0123456789)
            </span>
          </div>

          {/* Frequent rider suggestion card */}
          {suggestion && (
            <div style={{
              background: 'var(--primary-light)',
              border: '1.5px solid var(--primary)',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '16px',
            }}>
              <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600', margin: '0 0 8px' }}>
                🔁 Returning rider found
              </p>
              <div style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '10px' }}>
                <div><strong>{suggestion.name}</strong></div>
                <div style={{ color: 'var(--text2)', fontSize: '12px' }}>
                  {suggestion.courier} · {suggestion.plate ? `Plate: ${suggestion.plate}` : 'No plate'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={applySuggestion}
                  style={{
                    flex: 1, padding: '8px', background: 'var(--primary)', color: '#fff',
                    border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                  }}>
                  Yes, use this
                </button>
                <button
                  type="button"
                  onClick={() => setSuggestion(null)}
                  style={{
                    flex: 1, padding: '8px', background: 'transparent', color: 'var(--text2)',
                    border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', cursor: 'pointer'
                  }}>
                  No, fill manually
                </button>
              </div>
            </div>
          )}

          {/* Rider Name */}
          <div className="field">
            <label>Rider Name *</label>
            <input
              type="text" name="name" required
              placeholder="Full name"
              value={form.name}
              onChange={handleChange} />
          </div>

          {/* Courier */}
          <div className="field">
            <label>Courier Company *</label>
            <select name="courier" value={form.courier} onChange={handleChange}>
              <option>Poslaju</option>
              <option>J&T Express</option>
              <option>Shopee Express</option>
              <option>Ninja Van</option>
              <option>GrabFood</option>
              <option>Foodpanda</option>
              <option>DHL</option>
              <option>City-Link</option>
              <option>Other</option>
            </select>
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

          {/* Unit type toggle */}
          <div className="field">
            <label>Delivery To</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {(['single', 'multi'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleUnitTypeChange(type)}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px', fontSize: '13px', fontWeight: '500',
                    cursor: 'pointer', border: '1.5px solid',
                    borderColor: unitType === type ? 'var(--primary)' : 'var(--border)',
                    background: unitType === type ? 'var(--primary-light)' : 'var(--bg)',
                    color: unitType === type ? 'var(--primary)' : 'var(--text2)',
                  }}>
                  {type === 'single' ? 'Single Unit' : 'Multiple Blocks'}
                </button>
              ))}
            </div>

            {/* Single unit — 3 part dropdown */}
            {unitType === 'single' && (
              <>
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
                    onBlur={handleUnitNoBlur}
                    style={{
                      flex: 1, padding: '10px 8px',
                      border: '1.5px solid var(--border)',
                      borderRadius: '10px', fontSize: '14px',
                      textTransform: 'uppercase',
                      background: 'var(--bg)', color: 'var(--text)',
                    }}
                  />
                </div>
                {unitBlock && unitFloor && unitNo && (
                  <span style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '6px', display: 'block', fontWeight: '600' }}>
                    ✓ Unit: {unitBlock}-{unitFloor}-{formatUnitNo(unitNo.toUpperCase())}
                  </span>
                )}
              </>
            )}

            {/* Multi unit — block checkboxes */}
            {unitType === 'multi' && (
              <>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['A', 'B', 'C'].map(block => (
                    <button
                      key={block}
                      type="button"
                      onClick={() => toggleBlock(block)}
                      style={{
                        flex: 1, padding: '12px 8px', borderRadius: '10px',
                        fontSize: '16px', fontWeight: '700', cursor: 'pointer',
                        border: '1.5px solid',
                        borderColor: selectedBlocks.includes(block) ? 'var(--primary)' : 'var(--border)',
                        background: selectedBlocks.includes(block) ? 'var(--primary-light)' : 'var(--bg)',
                        color: selectedBlocks.includes(block) ? 'var(--primary)' : 'var(--text2)',
                      }}>
                      Block {block}
                    </button>
                  ))}
                </div>
                {selectedBlocks.length > 0 && (
                  <span style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '6px', display: 'block', fontWeight: '600' }}>
                    ✓ {selectedBlocks.map(b => `Block ${b}`).join(', ')}
                  </span>
                )}
              </>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register Delivery'}
          </button>

        </form>
      </div>
    </div>
  )
}

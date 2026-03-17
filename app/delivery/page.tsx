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

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)

    const ref = Math.floor(100000 + Math.random() * 900000).toString()
    const today = new Date().toISOString().split('T')[0]
    const time = new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })

    const { error } = await supabase.from('deliveries').insert([{
      name: form.name,
      phone: form.phone,
      courier: form.courier,
      plate: form.plate || null,
      units: form.units,
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
    setSubmitted(true)
    setLoading(false)
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

          <button className="btn btn-outline" onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', courier: 'Poslaju', plate: '', units: '' }) }}>
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
          <div className="field">
            <label>Rider Name *</label>
            <input type="text" name="name" required placeholder="Full name" onChange={handleChange} />
          </div>
          <div className="field">
            <label>Phone Number *</label>
            <input type="tel" name="phone" required placeholder="012-XXXXXXX" onChange={handleChange} />
          </div>
          <div className="field">
            <label>Courier Company *</label>
            <select name="courier" onChange={handleChange}>
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
          <div className="field">
            <label>Vehicle Plate No.</label>
            <input type="text" name="plate" placeholder="Optional" onChange={handleChange} />
          </div>
          <div className="field">
            <label>Unit(s) to Deliver *</label>
            <input type="text" name="units" required placeholder="e.g. A-01-02, B-03-05, C-07-11" onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register Delivery'}
          </button>
        </form>
      </div>
    </div>
  )
}

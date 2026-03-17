'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function VisitorPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', plate: '', unit: '', host_name: '', host_phone: '', purpose: 'Family visit', visit_date: '', expected_time: ''
  })

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)

    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    const token = crypto.randomUUID()

    const { data, error } = await supabase.from('visitors').insert([{
      ...form,
      otp_code: otp,
      qr_token: token,
      status: 'pending'
    }]).select()

    if (error) {
      alert('Error: ' + error.message)
      setLoading(false)
      return
    }

    window.location.href = `/visitor/success?otp=${otp}&token=${token}&name=${encodeURIComponent(form.name)}&unit=${encodeURIComponent(form.unit)}&phone=${encodeURIComponent(form.phone)}&plate=${encodeURIComponent(form.plate)}`
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
          <div className="field">
            <label>Visitor Name *</label>
            <input type="text" name="name" required placeholder="e.g. John Smith" onChange={handleChange} />
          </div>
          <div className="field">
            <label>Visitor Phone *</label>
            <input type="tel" name="phone" required placeholder="e.g. 012-3456789" onChange={handleChange} />
          </div>
          <div className="field">
            <label>Vehicle Plate No.</label>
            <input type="text" name="plate" placeholder="e.g. WXY 1234" onChange={handleChange} />
          </div>
          <div className="field">
            <label>Unit to Visit *</label>
            <input type="text" name="unit" required placeholder="e.g. A-12-05" onChange={handleChange} />
          </div>
          <div className="field">
            <label>Resident's Name *</label>
            <input type="text" name="host_name" required placeholder="e.g. Sarah Johnson" onChange={handleChange} />
          </div>
          <div className="field">
            <label>Resident's Phone *</label>
            <input type="tel" name="host_phone" required placeholder="e.g. 012-3456789" onChange={handleChange} />
          </div>
          <div className="field">
            <label>Visit Date *</label>
            <input type="date" name="visit_date" required onChange={handleChange} />
          </div>
          <div className="field">
            <label>Expected Arrival Time</label>
            <input type="time" name="expected_time" onChange={handleChange} />
          </div>
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

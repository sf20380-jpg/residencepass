'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function WalkInPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', plate: '', unit: '', host_name: '', purpose: 'Family visit'
  })

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/guard/login'; return }

    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    const token = crypto.randomUUID()
    const today = new Date().toISOString().split('T')[0]

    const { data: visitor, error } = await supabase.from('visitors').insert([{
      ...form,
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
          <div className="field">
            <label>Visitor Name *</label>
            <input type="text" name="name" required placeholder="Full name" onChange={handleChange} />
          </div>
          <div className="field">
            <label>Phone Number *</label>
            <input type="tel" name="phone" required placeholder="012-XXXXXXX" onChange={handleChange} />
          </div>
          <div className="field">
            <label>Vehicle Plate No.</label>
            <input type="text" name="plate" placeholder="Optional" onChange={handleChange} />
          </div>
          <div className="field">
            <label>Unit to Visit *</label>
            <input type="text" name="unit" required placeholder="e.g. A-12-05" onChange={handleChange} />
          </div>
          <div className="field">
            <label>Resident's Name</label>
            <input type="text" name="host_name" placeholder="Name of resident" onChange={handleChange} />
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

'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function VisitorPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', plate: '', unit: '', host_name: '', purpose: 'Family visit', visit_date: '', expected_time: ''
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

    window.location.href = `/visitor/success?otp=${otp}&token=${token}&name=${form.name}&unit=${form.unit}`
  }

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto', padding: '24px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#185FA5' }}>Register Visitor</h2>
      <p style={{ color: '#888', fontSize: '13px', marginBottom: '24px' }}>No login required</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Visitor Name *</label>
          <input name="name" required onChange={handleChange} placeholder="e.g. John Smith"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }} />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Phone Number *</label>
          <input name="phone" required onChange={handleChange} placeholder="e.g. 012-3456789"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }} />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Vehicle Plate No.</label>
          <input name="plate" onChange={handleChange} placeholder="e.g. WXY 1234"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }} />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Unit to Visit *</label>
          <input name="unit" required onChange={handleChange} placeholder="e.g. A-12-05"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }} />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Resident Name *</label>
          <input name="host_name" required onChange={handleChange} placeholder="e.g. Sarah Johnson"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }} />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Visit Date *</label>
          <input name="visit_date" type="date" required onChange={handleChange}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }} />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Expected Arrival Time</label>
          <input name="expected_time" type="time" onChange={handleChange}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }} />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Purpose of Visit</label>
          <select name="purpose" onChange={handleChange}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}>
            <option>Family visit</option>
            <option>Delivery</option>
            <option>Contractor / work</option>
            <option>Friend / guest</option>
            <option>Other</option>
          </select>
        </div>

        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: '13px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
          {loading ? 'Generating...' : 'Generate Access Code'}
        </button>
      </form>
    </div>
  )
}
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
    if (!user) {
      window.location.href = '/guard/login'
      return
    }

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
    <div style={{ maxWidth: '420px', margin: '0 auto', minHeight: '100vh', fontFamily: 'sans-serif' }}>

      {/* Topbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={() => window.location.href = '/guard/dashboard'}
          style={{ background: 'none', border: 'none', fontSize: '18px', color: '#185FA5', cursor: 'pointer' }}>←</button>
        <h2 style={{ flex: 1, fontSize: '16px', fontWeight: '500', margin: '0' }}>Walk-In Registration</h2>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ background: '#FAEEDA', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#854F0B', margin: '0' }}>⚠️ Visitor without pre-registration. Please confirm with resident before proceeding.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Visitor Name *', name: 'name', type: 'text', placeholder: 'Full name', required: true },
            { label: 'Phone Number *', name: 'phone', type: 'tel', placeholder: '012-XXXXXXX', required: true },
            { label: 'Vehicle Plate No.', name: 'plate', type: 'text', placeholder: 'Optional', required: false },
            { label: 'Unit to Visit *', name: 'unit', type: 'text', placeholder: 'e.g. A-12-05', required: true },
            { label: "Resident's Name", name: 'host_name', type: 'text', placeholder: 'Name of resident', required: false },
          ].map((field) => (
            <div key={field.name} style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                required={field.required}
                placeholder={field.placeholder}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
          ))}

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
            {loading ? 'Registering...' : 'Register & Check-In'}
          </button>
        </form>
      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '420px', background: '#fff', borderTop: '1px solid #eee', display: 'flex' }}>
        <button onClick={() => window.location.href = '/guard/dashboard'}
          style={{ flex: 1, padding: '12px 0 10px', background: 'none', border: 'none', fontSize: '11px', color: '#888', cursor: 'pointer' }}>
          📊 Dashboard
        </button>
        <button onClick={() => window.location.href = '/guard/scan'}
          style={{ flex: 1, padding: '12px 0 10px', background: 'none', border: 'none', fontSize: '11px', color: '#888', cursor: 'pointer' }}>
          📷 Scan
        </button>
        <button style={{ flex: 1, padding: '12px 0 10px', background: 'none', border: 'none', fontSize: '11px', color: '#185FA5', cursor: 'pointer' }}>
          ➕ Walk-in
        </button>
      </div>
    </div>
  )
}
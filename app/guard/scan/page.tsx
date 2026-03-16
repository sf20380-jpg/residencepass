'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'

export default function ScanPage() {
  const [manualCode, setManualCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scanningRef = useRef(false)

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        scanningRef.current = true
        requestAnimationFrame(scanFrame)
      }
    } catch (err) {
      console.log('Camera not available')
    }
  }

  function stopCamera() {
    scanningRef.current = false
    const video = videoRef.current
    if (video?.srcObject) {
      const tracks = (video.srcObject as MediaStream).getTracks()
      tracks.forEach(t => t.stop())
    }
  }

  async function scanFrame() {
    if (!scanningRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState !== 4) {
      requestAnimationFrame(scanFrame)
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    try {
      const jsQR = (await import('jsqr')).default
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const result = jsQR(imageData.data, canvas.width, canvas.height)
      if (result?.data) {
        scanningRef.current = false
        stopCamera()
        await searchVisitor(result.data)
        return
      }
    } catch (e) {}

    requestAnimationFrame(scanFrame)
  }

  async function searchVisitor(query: string) {
    setLoading(true)
    setError('')

    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabase
      .from('visitors')
      .select('*')
      .eq('visit_date', today)
      .or(`otp_code.eq.${query},qr_token.eq.${query},name.ilike.%${query}%,plate.ilike.%${query}%`)
      .limit(1)
      .single()

    setLoading(false)

    if (data) {
      window.location.href = `/guard/verify/${data.id}`
    } else {
      setError('Visitor not found. Please try again.')
      scanningRef.current = true
      startCamera()
    }
  }

  async function handleManualSearch(e: any) {
    e.preventDefault()
    if (!manualCode.trim()) return
    await searchVisitor(manualCode.trim())
  }

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto', minHeight: '100vh', fontFamily: 'sans-serif' }}>

      {/* Topbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={() => window.location.href = '/guard/dashboard'}
          style={{ background: 'none', border: 'none', fontSize: '18px', color: '#185FA5', cursor: 'pointer' }}>←</button>
        <h2 style={{ flex: 1, fontSize: '16px', fontWeight: '500', margin: '0' }}>Scan / Verify</h2>
      </div>

      {/* Camera */}
      <div style={{ background: '#F8F9FA', border: '1px solid #eee', margin: '16px', borderRadius: '12px', padding: '24px 16px', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 12px', border: '2px solid #185FA5', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
          <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline muted />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {/* Corner marks */}
          {[
            { top: -1, left: -1, borderWidth: '3px 0 0 3px' },
            { top: -1, right: -1, borderWidth: '3px 3px 0 0' },
            { bottom: -1, left: -1, borderWidth: '0 0 3px 3px' },
            { bottom: -1, right: -1, borderWidth: '0 3px 3px 0' },
          ].map((s, i) => (
            <div key={i} style={{ position: 'absolute', width: '20px', height: '20px', borderColor: '#185FA5', borderStyle: 'solid', borderRadius: '2px', ...s }} />
          ))}
        </div>
        <p style={{ fontSize: '13px', color: '#888', margin: '0' }}>Point camera at visitor's QR code</p>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 16px 16px', color: '#aaa', fontSize: '12px' }}>
        <div style={{ flex: 1, height: '1px', background: '#eee' }} />
        or enter manually
        <div style={{ flex: 1, height: '1px', background: '#eee' }} />
      </div>

      {/* Manual search */}
      <div style={{ padding: '0 16px' }}>
        <form onSubmit={handleManualSearch}>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Pass code / name / plate number"
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', color: '#000', background: '#fff' }} />
          </div>

          {error && (
            <div style={{ background: '#FCEBEB', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
              <p style={{ color: '#A32D2D', fontSize: '13px', margin: '0' }}>❌ {error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '13px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
            {loading ? 'Searching...' : 'Search & Verify'}
          </button>
        </form>
      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '420px', background: '#fff', borderTop: '1px solid #eee', display: 'flex' }}>
        <button onClick={() => window.location.href = '/guard/dashboard'}
          style={{ flex: 1, padding: '12px 0 10px', background: 'none', border: 'none', fontSize: '11px', color: '#888', cursor: 'pointer' }}>
          📊 Dashboard
        </button>
        <button style={{ flex: 1, padding: '12px 0 10px', background: 'none', border: 'none', fontSize: '11px', color: '#185FA5', cursor: 'pointer' }}>
          📷 Scan
        </button>
        <button onClick={() => window.location.href = '/guard/walkin'}
          style={{ flex: 1, padding: '12px 0 10px', background: 'none', border: 'none', fontSize: '11px', color: '#888', cursor: 'pointer' }}>
          ➕ Walk-in
        </button>
      </div>
    </div>
  )
}

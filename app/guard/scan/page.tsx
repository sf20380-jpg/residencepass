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
    <div className="app-container">

      <div className="topbar">
        <button className="back-btn" onClick={() => window.location.href = '/guard/dashboard'}>←</button>
        <h2>Scan / Verify</h2>
      </div>

      <div style={{ margin: '16px', background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '24px 16px', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 12px', border: '2px solid var(--primary)', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
          <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline muted />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {[
            { top: -1, left: -1, borderWidth: '3px 0 0 3px' },
            { top: -1, right: -1, borderWidth: '3px 3px 0 0' },
            { bottom: -1, left: -1, borderWidth: '0 0 3px 3px' },
            { bottom: -1, right: -1, borderWidth: '0 3px 3px 0' },
          ].map((s, i) => (
            <div key={i} style={{ position: 'absolute', width: '20px', height: '20px', borderColor: 'var(--primary)', borderStyle: 'solid', borderRadius: '2px', ...s }} />
          ))}
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text2)', margin: '0' }}>Point camera at visitor's QR code</p>
      </div>

      <div className="divider" style={{ margin: '0 16px' }}>or enter manually</div>

      <div style={{ padding: '0 16px' }}>
        <form onSubmit={handleManualSearch}>
          <div className="field">
            <label>Pass code / name / plate number</label>
            <input type="text" placeholder="e.g. 4728 / John Smith / WXY 1234" value={manualCode} onChange={e => setManualCode(e.target.value)} />
          </div>

          {error && (
            <div style={{ background: 'var(--danger-light)', border: '0.5px solid var(--danger)', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px' }}>
              <p style={{ color: 'var(--danger)', fontSize: '13px', margin: '0' }}>❌ {error}</p>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search & Verify'}
          </button>
        </form>
      </div>

      <div className="bottomnav">
        <button onClick={() => window.location.href = '/guard/dashboard'}>
          <span className="nav-icon">📊</span>
          Dashboard
        </button>
        <button className="active">
          <span className="nav-icon">📷</span>
          Scan
        </button>
        <button onClick={() => window.location.href = '/guard/walkin'}>
          <span className="nav-icon">➕</span>
          Walk-in
        </button>
      </div>

    </div>
  )
}

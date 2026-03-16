'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [status, setStatus] = useState('Testing connection...')

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.from('visitors').select('count')
      if (error) {
        setStatus('❌ Error: ' + error.message)
      } else {
        setStatus('✅ Supabase connected!')
      }
    }
    testConnection()
  }, [])

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>ResidencePass</h1>
      <p>{status}</p>
    </div>
  )
}
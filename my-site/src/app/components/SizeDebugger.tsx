'use client'

import { useEffect, useState } from 'react'

/**
 * Debug component to help identify sizing issues
 * Shows current CSS variable values and viewport info
 * 
 * To use: Add <SizeDebugger /> temporarily to your Experience component
 * Then remove it once we've figured out the right values
 */
export default function SizeDebugger() {
  const [values, setValues] = useState({
    viewport: { width: 0, height: 0, aspect: 0 },
    camera: 0,
    boardingPass: { width: '', padding: '', bottom: '' },
    music: { width: '', padding: '', bottom: '', right: '' },
    flightControls: { width: '', padding: '', gap: '', bottom: '', left: '' }
  })

  useEffect(() => {
    const updateValues = () => {
      const root = document.documentElement
      const computed = getComputedStyle(root)
      
      setValues({
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          aspect: window.innerWidth / window.innerHeight
        },
        camera: parseFloat(computed.getPropertyValue('--camera-distance-multiplier') || '1.0'),
        boardingPass: {
          width: computed.getPropertyValue('--boarding-pass-width') || 'not set',
          padding: computed.getPropertyValue('--boarding-pass-padding') || 'not set',
          bottom: computed.getPropertyValue('--boarding-pass-bottom') || 'not set'
        },
        music: {
          width: computed.getPropertyValue('--music-controls-width') || 'not set',
          padding: computed.getPropertyValue('--music-controls-padding') || 'not set',
          bottom: computed.getPropertyValue('--music-controls-bottom') || 'not set',
          right: computed.getPropertyValue('--music-controls-right') || 'not set'
        },
        flightControls: {
          width: computed.getPropertyValue('--flight-controls-width') || 'not set',
          padding: computed.getPropertyValue('--flight-controls-padding') || 'not set',
          gap: computed.getPropertyValue('--flight-controls-gap') || 'not set',
          bottom: computed.getPropertyValue('--flight-controls-bottom') || 'not set',
          left: computed.getPropertyValue('--flight-controls-left') || 'not set'
        }
      })
    }

    updateValues()
    window.addEventListener('resize', updateValues)
    return () => window.removeEventListener('resize', updateValues)
  }, [])

  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.85)',
        color: '#fff',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '11px',
        fontFamily: 'monospace',
        zIndex: 9999,
        maxWidth: '300px',
        lineHeight: '1.5'
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #555', paddingBottom: '4px' }}>
        📐 Size Debugger
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Viewport:</strong><br />
        {values.viewport.width} × {values.viewport.height}<br />
        Aspect: {values.viewport.aspect.toFixed(2)}:1
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>🌍 Camera:</strong><br />
        Multiplier: {values.camera.toFixed(2)}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>🎫 Boarding Pass:</strong><br />
        Width: {values.boardingPass.width}<br />
        Padding: {values.boardingPass.padding}<br />
        Bottom: {values.boardingPass.bottom}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>🎵 Music:</strong><br />
        Width: {values.music.width}<br />
        Padding: {values.music.padding}<br />
        Bottom: {values.music.bottom}<br />
        Right: {values.music.right}
      </div>

      <div>
        <strong>🎮 Flight Controls:</strong><br />
        Width: {values.flightControls.width}<br />
        Padding: {values.flightControls.padding}<br />
        Gap: {values.flightControls.gap}<br />
        Bottom: {values.flightControls.bottom}<br />
        Left: {values.flightControls.left}
      </div>

      <div style={{ marginTop: '8px', fontSize: '10px', color: '#aaa', borderTop: '1px solid #555', paddingTop: '4px' }}>
        Copy these values and tell me what looks wrong!
      </div>
    </div>
  )
}

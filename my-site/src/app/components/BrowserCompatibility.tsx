'use client'

import { useEffect, useState } from 'react'

interface BrowserInfo {
  userAgent: string
  platform: string
  language: string
  cookieEnabled: boolean
  onLine: boolean
  hardwareConcurrency: number
  deviceMemory?: number
  maxTouchPoints: number
  screenWidth: number
  screenHeight: number
  windowWidth: number
  windowHeight: number
  webglSupported: boolean
  isChrome: boolean
  isSafari: boolean
  isFirefox: boolean
  isEdge: boolean
  touchSupported: boolean
  pointerEventsSupported: boolean
  webAssemblySupported: boolean
}

export default function BrowserCompatibility() {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    if (typeof window !== 'undefined') {
      const info = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: (navigator as unknown as { deviceMemory?: number }).deviceMemory,
        maxTouchPoints: navigator.maxTouchPoints,
        
        // Screen info
        screenWidth: screen.width,
        screenHeight: screen.height,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        
        // WebGL info
        webglSupported: (() => {
          try {
            const canvas = document.createElement('canvas')
            return !!(window.WebGLRenderingContext && canvas.getContext('webgl'))
          } catch {
            return false
          }
        })(),
        
        // Browser detection
        isChrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
        isSafari: /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor),
        isFirefox: /Firefox/.test(navigator.userAgent),
        isEdge: /Edg/.test(navigator.userAgent),
        
        // Feature detection
        touchSupported: 'ontouchstart' in window,
        pointerEventsSupported: 'PointerEvent' in window,
        webAssemblySupported: typeof WebAssembly === 'object',
      }
      
      setBrowserInfo(info)
    }
  }, [])

  if (!isClient) return null

  // Only show for debugging - you can remove this in production
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed top-4 left-4 z-50 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-md">
      <div className="font-bold mb-2">Debug Info:</div>
      {browserInfo && (
        <div className="space-y-1">
          <div>Browser: {browserInfo.isChrome ? 'Chrome' : browserInfo.isSafari ? 'Safari' : browserInfo.isFirefox ? 'Firefox' : browserInfo.isEdge ? 'Edge' : 'Unknown'}</div>
          <div>WebGL: {browserInfo.webglSupported ? '✅' : '❌'}</div>
          <div>Touch: {browserInfo.touchSupported ? '✅' : '❌'}</div>
          <div>Screen: {browserInfo.screenWidth}x{browserInfo.screenHeight}</div>
          <div>Window: {browserInfo.windowWidth}x{browserInfo.windowHeight}</div>
          <div>Memory: {browserInfo.deviceMemory || 'Unknown'} GB</div>
          <div>Cores: {browserInfo.hardwareConcurrency || 'Unknown'}</div>
        </div>
      )}
    </div>
  )
} 
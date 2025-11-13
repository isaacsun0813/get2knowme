'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  errorMessage: string
  webglSupported: boolean | null
  isClient: boolean
}

export default class WebGLErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      errorMessage: '',
      webglSupported: null, // Will be checked after mount
      isClient: false
    }
  }

  componentDidMount() {
    // Only check WebGL on client side to avoid hydration mismatch
    // Add a small delay for Chrome/Safari to ensure everything is ready
    setTimeout(() => {
      const supported = this.checkWebGLSupport()
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
      
      console.log('WebGL Support Check:', {
        supported,
        browser: navigator.userAgent,
        vendor: navigator.vendor,
        isSafari
      })
      
      // Safari-specific: If WebGL check fails, try again with longer delay
      if (!supported && isSafari) {
        console.warn('Safari: WebGL check failed, retrying...')
        setTimeout(() => {
          const retrySupported = this.checkWebGLSupport()
          console.log('Safari: WebGL retry result:', retrySupported)
          this.setState({
            isClient: true,
            webglSupported: retrySupported
          })
        }, 500)
      } else {
        this.setState({
          isClient: true,
          webglSupported: supported
        })
      }
    }, 100) // Small delay to ensure Chrome/Safari is ready
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Ignore React DevTools errors (they don't affect functionality)
    const errorMessage = error.message || ''
    if (errorMessage.includes('semver') || errorMessage.includes('react_devtools')) {
      // This is a React DevTools compatibility issue, not a real error
      return {}
    }
    
    return {
      hasError: true,
      errorMessage: error.message
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Ignore React DevTools errors (they don't affect functionality)
    const errorMessage = error.message || ''
    if (errorMessage.includes('semver') || errorMessage.includes('react_devtools')) {
      // This is a React DevTools compatibility issue with React 19
      // It doesn't affect the app functionality, so we can ignore it
      console.warn('React DevTools compatibility warning (can be ignored):', error.message)
      return
    }
    
    // Log real errors
    console.error('WebGL Error occurred:', error, errorInfo)
  }

  // Check WebGL support - more comprehensive detection with Chrome-specific fixes
  checkWebGLSupport = () => {
    if (typeof window === 'undefined') return true // Assume support during SSR
    
    try {
      // Check if WebGL is available at all
      if (!window.WebGLRenderingContext && !window.WebGL2RenderingContext) {
        console.warn('WebGL: No WebGL rendering context available')
        return false
      }
      
      const canvas = document.createElement('canvas')
      
      // Chrome-specific: Try WebGL2 first, then WebGL1, then experimental
      // Chrome is stricter about context attributes, so we'll try with minimal options first
      let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null
      
      // Try WebGL2
      try {
        gl = canvas.getContext('webgl2', {
          antialias: false,
          depth: true,
          stencil: false,
          alpha: false,
          preserveDrawingBuffer: false,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false
        }) as WebGL2RenderingContext | null
      } catch {
        // WebGL2 not available, continue
      }
      
      // Try WebGL1 if WebGL2 failed
      if (!gl) {
        try {
          gl = canvas.getContext('webgl', {
            antialias: false,
            depth: true,
            stencil: false,
            alpha: false,
            preserveDrawingBuffer: false,
            powerPreference: 'default',
            failIfMajorPerformanceCaveat: false
          }) as WebGLRenderingContext | null
        } catch {
          // WebGL1 failed, try experimental
        }
      }
      
      // Try experimental-webgl as last resort
      if (!gl) {
        try {
          gl = canvas.getContext('experimental-webgl', {
            antialias: false,
            depth: true,
            stencil: false,
            alpha: false,
            preserveDrawingBuffer: false
          }) as WebGLRenderingContext | null
        } catch {
          // All attempts failed
        }
      }
      
      // More lenient check - Chrome sometimes returns contexts that don't pass instanceof
      if (!gl) {
        console.warn('WebGL: Could not create WebGL context')
        return false
      }
      
      // Check if context has required methods (more reliable than instanceof)
      if (typeof gl.getParameter !== 'function' || typeof gl.clear !== 'function') {
        console.warn('WebGL: Context created but missing required methods')
        return false
      }
      
      // Try to get a parameter to ensure context is actually working
      try {
        const vendor = gl.getParameter(gl.VENDOR)
        const renderer = gl.getParameter(gl.RENDERER)
        console.log('WebGL: Context created successfully', { vendor, renderer })
      } catch {
        console.warn('WebGL: Context created but getParameter failed')
        return false
      }
      
      return true
    } catch (error) {
      console.error('WebGL detection error:', error)
      return false
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-sky-200 to-sky-300 flex items-center justify-center p-8">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 p-8 max-w-2xl text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Browser Compatibility Issue
            </h1>
            <p className="text-gray-600 mb-6">
              Your browser doesn&apos;t support WebGL or 3D graphics, which is required for this experience.
            </p>
            <div className="space-y-4 text-left">
              <h3 className="font-semibold text-gray-800">Try these solutions:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Update your browser to the latest version</li>
                <li>Enable hardware acceleration in browser settings</li>
                <li>Try a different browser (Chrome, Firefox, Safari, Edge)</li>
                <li>Update your graphics drivers</li>
                <li>Disable browser extensions that might block WebGL</li>
              </ul>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    // Show loading during initial client-side check
    if (!this.state.isClient) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-sky-200 to-sky-300 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        </div>
      )
    }

    // Check WebGL support after client mount
    if (this.state.webglSupported === false) {
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
      
      return (
        <div className="min-h-screen bg-gradient-to-b from-sky-200 to-sky-300 flex items-center justify-center p-8">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 p-8 max-w-2xl text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              WebGL Not Supported
            </h1>
            <p className="text-gray-600 mb-6">
              This browser doesn&apos;t support WebGL, which is required for the 3D experience.
            </p>
            {isChrome && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
                <h3 className="font-semibold text-yellow-800 mb-2">Chrome-Specific Fixes:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
                  <li>Enable hardware acceleration: chrome://settings/system → Enable &quot;Use hardware acceleration when available&quot;</li>
                  <li>Disable extensions that block WebGL (ad blockers, privacy extensions)</li>
                  <li>Check chrome://gpu/ to see if WebGL is enabled</li>
                  <li>Try incognito mode to rule out extension conflicts</li>
                  <li>Update Chrome to the latest version</li>
                </ol>
              </div>
            )}
            <div className="space-y-4 text-left">
              <h3 className="font-semibold text-gray-800">General Solutions:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Update your browser to the latest version</li>
                <li>Enable hardware acceleration in browser settings</li>
                <li>Try a different browser (Chrome, Firefox, Safari, Edge)</li>
                <li>Update your graphics drivers</li>
                <li>Disable browser extensions that might block WebGL</li>
              </ul>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 
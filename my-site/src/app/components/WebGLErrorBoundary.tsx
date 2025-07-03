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
    this.setState({
      isClient: true,
      webglSupported: this.checkWebGLSupport()
    })
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      errorMessage: error.message
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('WebGL Error:', error, errorInfo)
  }

  // Check WebGL support - more comprehensive detection
  checkWebGLSupport = () => {
    if (typeof window === 'undefined') return true // Assume support during SSR
    
    try {
      const canvas = document.createElement('canvas')
      
      // Try multiple WebGL contexts
      const gl = canvas.getContext('webgl2') || 
                 canvas.getContext('webgl') || 
                 canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
      
      if (!gl || !(gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext)) {
        return false
      }
      
      // Additional checks for WebGL functionality
      const webglContext = gl as WebGLRenderingContext
      const hasRequiredExtensions = webglContext.getExtension('OES_texture_float') !== null
      
      console.log('WebGL Detection:', {
        webgl2: !!canvas.getContext('webgl2'),
        webgl1: !!canvas.getContext('webgl'),
        experimental: !!canvas.getContext('experimental-webgl'),
        vendor: webglContext.getParameter(webglContext.VENDOR),
        renderer: webglContext.getParameter(webglContext.RENDERER),
        version: webglContext.getParameter(webglContext.VERSION),
        hasExtensions: hasRequiredExtensions
      })
      
      return true
    } catch (e) {
      console.error('WebGL detection error:', e)
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
      return (
        <div className="min-h-screen bg-gradient-to-b from-sky-200 to-sky-300 flex items-center justify-center p-8">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 p-8 max-w-2xl text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              WebGL Not Supported
            </h1>
            <p className="text-gray-600 mb-6">
              This browser doesn&apos;t support WebGL, which is required for the 3D experience.
            </p>
            <p className="text-sm text-gray-500">
              Please try using Chrome, Firefox, Safari, or Edge with hardware acceleration enabled.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 
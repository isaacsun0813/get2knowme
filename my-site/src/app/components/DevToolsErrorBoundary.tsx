'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class DevToolsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a React DevTools semver error
    const errorMessage = error?.message || String(error)
    if (
      errorMessage.includes('semver') ||
      errorMessage.includes('react_devtools') ||
      errorMessage.includes('Invalid argument not valid semver')
    ) {
      // Suppress React DevTools errors - don't show error state
      return { hasError: false }
    }
    // For other errors, show error state
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    // Check if this is a React DevTools semver error
    const errorMessage = error?.message || String(error)
    if (
      errorMessage.includes('semver') ||
      errorMessage.includes('react_devtools') ||
      errorMessage.includes('Invalid argument not valid semver')
    ) {
      // Silently suppress React DevTools errors
      return
    }
    // Log other errors normally
  }

  render() {
    // Always render children, even if there was a suppressed error
    return this.props.children
  }
}


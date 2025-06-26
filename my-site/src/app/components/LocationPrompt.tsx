'use client'

import { useEffect, useState } from 'react'

// Type for landmark configuration
export type LandmarkConfig = {
  name: string
  displayName: string
  subtitle: string
  component: React.ComponentType<{ isOpen: boolean; onClose: () => void }>
  triggerDistance: number
}

interface LocationPromptProps {
  landmark: LandmarkConfig | null
  onClose: () => void
  onSpacePressed: () => void
}

export default function LocationPrompt({ 
  landmark, 
  onClose,
  onSpacePressed
}: LocationPromptProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    console.log('🎪 LocationPrompt useEffect - landmark:', landmark)
    if (landmark) {
      console.log('🎪 Setting popup visible for:', landmark.displayName)
      setIsVisible(true)
    } else {
      console.log('🎪 Hiding popup')
      setIsVisible(false)
    }
  }, [landmark])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && landmark) {
        e.preventDefault()
        onSpacePressed()
      }
    }

    if (isVisible) {
      window.addEventListener('keydown', handleKeyPress)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [isVisible, landmark, onSpacePressed])

  if (!isVisible || !landmark) return null

  // Dynamic styling based on subtitle - softer colors with retro font
  const getPromptStyling = (subtitle: string) => {
    switch (subtitle) {
      case "About Me":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          spaceButton: "bg-gradient-to-r from-blue-400 to-blue-600",
          emoji: "🌊"
        }
      case "Ambition":
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          spaceButton: "bg-gradient-to-r from-gray-400 to-gray-600",
          emoji: "🚀"
        }
      case "Home":
        return {
          bg: "bg-orange-100",
          text: "text-orange-800",
          spaceButton: "bg-gradient-to-r from-orange-400 to-orange-600",
          emoji: "🏠"
        }
      case "Vibes":
        return {
          bg: "bg-pink-100",
          text: "text-pink-800",
          spaceButton: "bg-gradient-to-r from-pink-400 to-pink-600",
          emoji: "✨"
        }
      case "Adventure":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          spaceButton: "bg-gradient-to-r from-green-400 to-green-600",
          emoji: "🗻"
        }
      case "Career":
        return {
          bg: "bg-purple-100",
          text: "text-purple-800",
          spaceButton: "bg-gradient-to-r from-purple-400 to-purple-600",
          emoji: "💼"
        }
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          spaceButton: "bg-gradient-to-r from-gray-400 to-gray-600",
          emoji: "📍"
        }
    }
  }

  const styling = getPromptStyling(landmark.subtitle)

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-8 z-50 pointer-events-none">
      <div className={`${styling.bg} ${styling.text} px-8 py-6 rounded-2xl shadow-xl backdrop-blur-sm border-2 border-white/60`}>
        <div className="text-center">
          <div className="text-3xl mb-3">{styling.emoji}</div>
          <h2 className={`text-2xl font-bold mb-2 ${styling.text} font-mono uppercase tracking-wider`}>
            {landmark.displayName}
          </h2>
          <h3 className={`text-lg font-bold mb-4 ${styling.text} font-mono uppercase tracking-widest opacity-80`}>
            {landmark.subtitle}
          </h3>
          <div className="flex items-center justify-center gap-3">
            <span className={`text-base font-semibold ${styling.text} font-mono uppercase tracking-wide`}>Press</span>
            <kbd className={`${styling.spaceButton} text-white px-4 py-2 rounded-lg font-mono font-bold text-base shadow-lg animate-pulse`}>
              SPACE
            </kbd>
            <span className={`text-base font-semibold ${styling.text} font-mono uppercase tracking-wide`}>to Explore</span>
          </div>
        </div>
      </div>
    </div>
  )
} 
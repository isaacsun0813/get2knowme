'use client'

import { useState, useEffect } from 'react'
import { AboutMe, Career, Ambition, Vibes, Adventure } from '../landmark-pages'

interface MobilePortfolioPageProps {
  onClose?: () => void
}

/**
 * Mobile Portfolio Page - Sharp, minimal design
 * Renders landmark components as modals when clicked
 */
export default function MobilePortfolioPage({ onClose }: MobilePortfolioPageProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)

  const sections = [
    { id: 'about', name: 'About', component: AboutMe },
    { id: 'career', name: 'Career', component: Career },
    { id: 'adventure', name: 'Adventure', component: Adventure },
    { id: 'ambition', name: 'Ambition', component: Ambition },
    { id: 'vibes', name: 'Inspiration', component: Vibes },
  ]

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <>
      <div className="fixed inset-0 z-[200] bg-white">
        {/* Header - Sharp black border */}
        <div className="sticky top-0 z-10 bg-white border-b-2 border-black">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold tracking-tight uppercase" style={{ color: '#1a1a1a', letterSpacing: '0.1em' }}>
                Isaac Sun
              </h1>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-black hover:text-gray-600 text-xs font-semibold uppercase tracking-wider"
                >
                  3D →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Grid - Sharp */}
        <div className="border-b-2 border-black bg-white border-r-2 border-black">
          <div className="grid grid-cols-3 gap-0">
            {sections.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                className={`px-3 py-4 text-xs font-bold uppercase tracking-wider border-r-2 border-black transition-colors ${
                  openSection === section.id
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-50'
                } ${idx % 3 === 2 ? 'border-r-0' : ''} ${idx >= 3 ? 'border-t-2' : ''}`}
              >
                {section.name}
              </button>
            ))}
            {/* Empty cell to complete the grid */}
            <div className="border-t-2 border-black bg-white" />
          </div>
        </div>

        {/* Content placeholder */}
        {!openSection && (
          <div className="p-8 text-center">
            <div className="border-2 border-black p-8 bg-white max-w-sm mx-auto">
              <p className="text-sm text-gray-700 mb-2">Select a section above</p>
              <p className="text-xs text-gray-500">Tap any button to view content</p>
            </div>
          </div>
        )}
      </div>

      {/* Render modals when section is clicked - they'll overlay */}
      {sections.map((section) => {
        if (openSection !== section.id) return null
        const SectionComponent = section.component
        return (
          <div key={section.id} className="fixed inset-0 z-[250]">
            <SectionComponent
              isOpen={true}
              onClose={() => setOpenSection(null)}
            />
          </div>
        )
      })}
    </>
  )
}

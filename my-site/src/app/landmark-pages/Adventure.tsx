'use client'

import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Mountain, X } from 'lucide-react'

interface AdventureProps {
  isOpen: boolean
  onClose: () => void
}

// Pin colors for Polaroid photos
const pinColors = [
  { color: '#ef4444', name: 'red' },
  { color: '#3b82f6', name: 'blue' },
  { color: '#eab308', name: 'yellow' },
  { color: '#10b981', name: 'green' },
  { color: '#d97706', name: 'orange' },
  { color: '#8b5cf6', name: 'purple' },
  { color: '#ec4899', name: 'pink' },
  { color: '#f59e0b', name: 'amber' },
  { color: '#14b8a6', name: 'teal' },
  { color: '#a78bfa', name: 'violet' },
  { color: '#f97316', name: 'orange-red' },
  { color: '#06b6d4', name: 'cyan' },
  { color: '#84cc16', name: 'lime' },
  { color: '#f43f5e', name: 'rose' },
  { color: '#6366f1', name: 'indigo' },
  { color: '#64748b', name: 'slate' },
  { color: '#78716c', name: 'stone' },
]

export default function Adventure({ isOpen, onClose }: AdventureProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({})
  const modalRef = useRef<HTMLDivElement>(null)

  const adventurePhotos = useMemo(() => [
    { src: '/photos/adventure/adventure1.jpg', caption: 'Ticino' },
    { src: '/photos/adventure/adventure2.jpg', caption: 'Skiing in Alestch' },
    { src: '/photos/adventure/adventure3.jpg', caption: 'El Yunque' },
    { src: '/photos/adventure/adventure4.jpg', caption: 'Milan' },
    { src: '/photos/adventure/adventure5.jpg', caption: 'Monte Carlo' },
    { src: '/photos/adventure/adventure6.jpg', caption: 'Stoos Ridge Hike' },
    { src: '/photos/adventure/adventure7.jpg', caption: 'Oktoberfest' },
    { src: '/photos/adventure/adventure8.jpg', caption: 'swimming in zurich' },
    { src: '/photos/adventure/adventure9.jpg', caption: 'Interlaken' },
    { src: '/photos/adventure/adventure10.jpg', caption: 'Alestch' },
    { src: '/photos/adventure/adventure11.jpg', caption: 'Zurich' },
    { src: '/photos/adventure/adventure12.jpg', caption: 'Zurich' },
    { src: '/photos/adventure/adventure13.jpg', caption: 'Ticino' },
    { src: '/photos/adventure/adventure14.jpg', caption: 'Zermatt' },
    { src: '/photos/adventure/adventure15.jpg', caption: 'Wicker Park' },
    { src: '/photos/adventure/adventure16.jpg', caption: 'Interlaken' },
    { src: '/photos/adventure/adventure17.jpg', caption: 'Stoos' },
  ], [])

  // Generate random rotations and offsets for natural arrangement
  const photoPositions = useMemo(() => 
    adventurePhotos.map((_, index) => ({
      rotation: (Math.random() - 0.5) * 8, // ±4 degrees
      x: (Math.random() - 0.5) * 20, // ±10px
      y: (Math.random() - 0.5) * 20, // ±10px
      pinColor: pinColors[index % pinColors.length],
      zIndex: Math.floor(Math.random() * 5) + 1
    }))
  , [adventurePhotos])

  const handleClose = useCallback(() => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex(null)
      setTimeout(() => onClose(), 400)
    } else {
      onClose()
    }
  }, [selectedPhotoIndex, onClose])

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPhotoIndex !== null) {
          setSelectedPhotoIndex(null)
        } else {
          handleClose()
        }
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, selectedPhotoIndex, handleClose])

  // Animation handling
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false)
        setSelectedPhotoIndex(null)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handlePhotoClick = useCallback((index: number) => {
    setSelectedPhotoIndex(index)
  }, [])

  const handleImageLoad = useCallback((index: number) => {
    setImageLoaded(prev => ({ ...prev, [index]: true }))
  }, [])

  if (!shouldRender) return null

  const selectedPhoto = selectedPhotoIndex !== null ? adventurePhotos[selectedPhotoIndex] : null
  const selectedPosition = selectedPhotoIndex !== null ? photoPositions[selectedPhotoIndex] : null

  return (
    <AnimatePresence>
      {shouldRender && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: isOpen ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-50"
            onClick={() => {
              if (selectedPhotoIndex !== null) {
                setSelectedPhotoIndex(null)
              } else {
                handleClose()
              }
            }}
            style={{
              backdropFilter: selectedPhotoIndex !== null ? 'blur(40px) saturate(0.2)' : 'blur(40px) saturate(0.3)',
              background: selectedPhotoIndex !== null ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.55)'
            }}
          />

          {/* Ambient Particle Dust */}
          <div className="fixed inset-0 z-[51] pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${2 + Math.random() * 3}px`,
                  height: `${2 + Math.random() * 3}px`,
                  background: 'rgba(255,255,255,0.03)',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, (Math.random() - 0.5) * 150],
                  y: [0, (Math.random() - 0.5) * 150],
                  opacity: [0, 0.03, 0]
                }}
                transition={{
                  duration: 20 + Math.random() * 15,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>

          {/* Main Modal Container */}
          <motion.div
            key="modal"
            ref={modalRef}
            initial={{ 
              opacity: 0, 
              scale: 0.94,
              y: 40,
              filter: 'blur(12px) brightness(0.8)'
            }}
            animate={{ 
              opacity: isOpen ? 1 : 0, 
              scale: isOpen ? 1 : 0.94,
              y: isOpen ? 0 : 40,
              filter: isOpen ? 'blur(0px) brightness(1)' : 'blur(8px) brightness(0.8)',
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.94,
              y: 40,
              filter: 'blur(8px) brightness(0.8)'
            }}
            transition={{
              duration: 0.8,
              ease: [0.23, 1, 0.32, 1]
            }}
            className="fixed inset-0 z-[52] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Skyglass Modal Container - Photo Wall Board */}
            <motion.div
              className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto pointer-events-auto"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.92) 50%, rgba(240,248,255,0.9) 100%)',
                backdropFilter: 'blur(40px)',
                borderRadius: '2rem',
                boxShadow: `
                  0px 20px 60px rgba(0,0,0,0.4),
                  0px 0px 0px 1px rgba(255,255,255,0.8),
                  inset 0px 1px 0px rgba(255,255,255,0.95),
                  0px 0px 120px rgba(16,185,129,0.08),
                  0px 0px 0px 2px rgba(16,185,129,0.1)
                `,
                border: '2px solid rgba(255,255,255,0.9)',
                transform: 'translateZ(0)',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(16,185,129,0.3) transparent'
              }}
            >
              {/* Close Button */}
              <motion.button
                onClick={handleClose}
                className="absolute top-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center group"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255,255,255,0.5)'
                }}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: 90,
                  background: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.9)'
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <X size={24} className="text-gray-600 group-hover:text-gray-800" strokeWidth={2.5} />
              </motion.button>

              {/* Content Area */}
              <div className="relative p-8 sm:p-10 md:p-12 pb-16">
                
                {/* Header */}
                <motion.div
                  className="text-center mb-10"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -20 }}
                  transition={{ delay: 0.2, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                >
                  <motion.div
                    className="flex items-center justify-center gap-4 mb-4"
                    animate={{
                      y: [0, -4, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)',
                        filter: 'blur(8px)',
                        transform: 'scale(1.5)'
                      }}
                    />
                    <Mountain 
                      size={48} 
                      className="relative"
                      style={{
                        color: '#10b981',
                        filter: 'drop-shadow(0 4px 8px rgba(16,185,129,0.3))'
                      }}
                    />
                  </motion.div>
                  <h1 
                    className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-4"
                    style={{
                      fontFamily: 'Satoshi, Manrope, General Sans, system-ui, sans-serif',
                      background: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textShadow: '0 2px 20px rgba(16,185,129,0.2)',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    Adventure
                  </h1>
                  <p
                    className="text-xl sm:text-2xl md:text-3xl mt-4 font-semibold"
                    style={{
                      fontFamily: 'Inter, Nunito, Lato, system-ui, sans-serif',
                      lineHeight: '1.6',
                      fontWeight: '600',
                      color: '#000000',
                      textShadow: '0 1px 3px rgba(255,255,255,0.8), 0 2px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    Check out some of my favorite places!
                  </p>
                </motion.div>

                {/* Polaroid Photo Wall Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8">
                  {adventurePhotos.map((photo, index) => {
                    const position = photoPositions[index]
                    const isSelected = selectedPhotoIndex === index
                    
                    return (
                      <motion.div
                        key={index}
                        className="relative cursor-pointer"
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ 
                          opacity: isOpen ? 1 : 0,
                          scale: isOpen ? 1 : 0.8,
                          rotate: isSelected ? 0 : position.rotation,
                          x: isSelected ? 0 : position.x,
                          y: isSelected ? (isOpen ? 0 : position.y) : (isOpen ? 0 : 20),
                          zIndex: isSelected ? 1000 : position.zIndex
                        }}
                        transition={{ 
                          delay: 0.3 + index * 0.05,
                          duration: 0.6,
                          ease: [0.23, 1, 0.32, 1],
                          rotate: { type: 'spring', stiffness: 200, damping: 15 }
                        }}
                        onClick={() => handlePhotoClick(index)}
                        whileHover={!isSelected ? {
                          scale: 1.05,
                          rotate: position.rotation * 0.7,
                          transition: { duration: 0.3 }
                        } : {}}
                      >
                        {/* Colored Pin */}
                        <div
                          className="absolute -top-2 left-1/2 -translate-x-1/2 z-10"
                          style={{
                            width: '12px',
                            height: '12px',
                            background: position.pinColor.color,
                            borderRadius: '50%',
                            boxShadow: `
                              0 2px 4px rgba(0,0,0,0.2),
                              inset 0 1px 0 rgba(255,255,255,0.3)
                            `,
                            border: '1px solid rgba(0,0,0,0.1)'
                          }}
                        />
                        
                        {/* Pin Shadow */}
                        <div
                          className="absolute -top-1 left-1/2 -translate-x-1/2 z-9"
                          style={{
                            width: '8px',
                            height: '4px',
                            background: 'rgba(0,0,0,0.15)',
                            borderRadius: '50%',
                            filter: 'blur(2px)'
                          }}
                        />

                        {/* Polaroid Frame */}
                        <div
                          className="relative bg-white rounded-lg p-2 shadow-lg"
                          style={{
                            boxShadow: `
                              0 8px 24px rgba(0,0,0,0.15),
                              0 0 0 1px rgba(0,0,0,0.05),
                              inset 0 1px 0 rgba(255,255,255,0.9)
                            `,
                            transform: 'translateZ(0)'
                          }}
                        >
                          {/* Photo Area */}
                          <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-gray-100">
                            {imageLoaded[index] ? null : (
                              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100">
                                <motion.div
                                  animate={{ opacity: [0.5, 1, 0.5] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                  className="text-gray-600 text-xs"
                                >
                                  Loading...
                                </motion.div>
                              </div>
                            )}
                            <Image
                              src={photo.src}
                              alt={photo.caption}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                              onLoad={() => handleImageLoad(index)}
                            />
                          </div>
                          
                          {/* Caption Area */}
                          <div className="mt-3 px-2 pb-2">
                            <p
                              className="text-base sm:text-lg text-center font-semibold"
                              style={{
                                fontFamily: 'Inter, system-ui, sans-serif',
                                lineHeight: '1.5',
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#000000',
                                textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                              }}
                            >
                              {photo.caption}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>

            {/* Expanded Photo View */}
            <AnimatePresence>
              {selectedPhotoIndex !== null && selectedPhoto && selectedPosition && (
                <motion.div
                  key="expanded-photo"
                  className="fixed inset-0 z-[53] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => setSelectedPhotoIndex(null)}
                >
                  <motion.div
                    className="relative max-w-4xl w-full pointer-events-auto"
                    initial={{
                      scale: 0.8,
                      rotate: selectedPosition.rotation,
                      x: selectedPosition.x * 10,
                      y: selectedPosition.y * 10,
                      opacity: 0
                    }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                      x: 0,
                      y: 0,
                      opacity: 1
                    }}
                    exit={{
                      scale: 0.8,
                      rotate: selectedPosition.rotation,
                      x: selectedPosition.x * 10,
                      y: selectedPosition.y * 10,
                      opacity: 0
                    }}
                    transition={{
                      duration: 0.6,
                      ease: [0.23, 1, 0.32, 1]
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Expanded Polaroid */}
                    <div
                      className="relative bg-white rounded-xl p-4 shadow-2xl"
                      style={{
                        boxShadow: `
                          0 30px 80px rgba(0,0,0,0.3),
                          0 0 0 1px rgba(0,0,0,0.05),
                          inset 0 1px 0 rgba(255,255,255,0.9)
                        `
                      }}
                    >
                      {/* Close Button */}
                      <motion.button
                        onClick={() => setSelectedPhotoIndex(null)}
                        className="absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-lg z-50"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <X size={20} className="text-gray-600" strokeWidth={2.5} />
                      </motion.button>

                      {/* Photo */}
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 mb-4">
                        <Image
                          src={selectedPhoto.src}
                          alt={selectedPhoto.caption}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 95vw, 80vw"
                          priority
                        />
                      </div>

                      {/* Caption */}
                      <div className="text-center">
                        <p
                          className="text-xl sm:text-2xl md:text-3xl font-semibold"
                          style={{
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontWeight: '600',
                            color: '#000000',
                            textShadow: '0 1px 3px rgba(255,255,255,0.8), 0 2px 6px rgba(0,0,0,0.1)'
                          }}
                        >
                          {selectedPhoto.caption}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* Custom Scrollbar Styles */}
          <style jsx>{`
            .relative.w-full.max-w-6xl::-webkit-scrollbar {
              width: 10px;
            }
            .relative.w-full.max-w-6xl::-webkit-scrollbar-track {
              background: rgba(255,255,255,0.1);
              border-radius: 10px;
            }
            .relative.w-full.max-w-6xl::-webkit-scrollbar-thumb {
              background: rgba(16,185,129,0.4);
              border-radius: 10px;
              border: 2px solid rgba(255,255,255,0.8);
            }
            .relative.w-full.max-w-6xl::-webkit-scrollbar-thumb:hover {
              background: rgba(16,185,129,0.6);
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  )
}

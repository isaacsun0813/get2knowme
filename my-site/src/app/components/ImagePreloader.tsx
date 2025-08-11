'use client'

import { useEffect } from 'react'

interface ImagePreloaderProps {
  isInWorld: boolean
}

export default function ImagePreloader({ }: ImagePreloaderProps) {
  useEffect(() => {
    // Start preloading immediately when component mounts, not just when entering world
    const allImages = [
      // Adventure photos - load these immediately for instant access
      '/photos/adventure/adventure1.jpg',
      '/photos/adventure/adventure2.jpg', 
      '/photos/adventure/adventure3.jpg',
      '/photos/adventure/adventure4.jpg',
      '/photos/adventure/adventure5.jpg',
      '/photos/adventure/adventure6.jpg',
      '/photos/adventure/adventure7.jpg',
      '/photos/adventure/adventure8.jpg',
      '/photos/adventure/adventure9.jpg',
      '/photos/adventure/adventure10.jpg',
      '/photos/adventure/adventure11.jpg',
      '/photos/adventure/adventure12.jpg',
      '/photos/adventure/adventure13.jpg',
      '/photos/adventure/adventure14.jpg',
      '/photos/adventure/adventure15.jpg',
      '/photos/adventure/adventure16.jpg',
      '/photos/adventure/adventure17.jpg',
      '/photos/adventure/aot.gif',
      // Profile and project images
      '/photos/profilePic.jpeg',
      '/photos/projects/Verdra.png',
      '/photos/projects/PrizeSole.png'
    ]

    // Strategy 1: Add preload links to head for highest priority
    allImages.forEach((imageSrc) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = imageSrc
      link.type = 'image/jpeg'
      document.head.appendChild(link)
    })

    // Strategy 2: Load ALL images immediately with maximum priority
    allImages.forEach((imageSrc) => {
      const img = new window.Image()
      
      // Set maximum priority for instant loading
      img.loading = 'eager'
      img.decoding = 'sync'
      
      // Preload with high priority
      img.onload = () => {
        // Image loaded successfully - keep in memory
      }
      
      img.onerror = () => {
        // Image failed to load - will retry when actually needed
      }
      
      // Start loading immediately
      img.src = imageSrc
    })

    // Strategy 3: Fetch preload for critical images (first 5)
    const criticalImages = allImages.slice(0, 5)
    criticalImages.forEach((imageSrc) => {
      fetch(imageSrc, { 
        method: 'GET',
        cache: 'force-cache'
      }).catch(() => {
        // Ignore fetch errors - fallback to img preload
      })
    })

  }, []) // Remove isInWorld dependency to start loading immediately

  return null
} 
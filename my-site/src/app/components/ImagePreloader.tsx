'use client'

import { useEffect } from 'react'

interface ImagePreloaderProps {
  isInWorld: boolean
}

export default function ImagePreloader({ isInWorld }: ImagePreloaderProps) {
  useEffect(() => {
    if (!isInWorld) return

    const allImages = [
      // Adventure photos
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

    // Create multiple concurrent preload batches for faster loading
    const batchSize = 5
    const batches = []
    
    for (let i = 0; i < allImages.length; i += batchSize) {
      batches.push(allImages.slice(i, i + batchSize))
    }

    // Process batches with small delays to prevent overwhelming the browser
    batches.forEach((batch, batchIndex) => {
      setTimeout(() => {
        batch.forEach((imageSrc) => {
          const img = new window.Image()
          
          img.onload = () => {
            // Image preloaded successfully
          }
          
          img.onerror = () => {
            // Image failed to preload
          }
          
          // Set high priority for first few images
          if (batchIndex === 0) {
            img.loading = 'eager'
          }
          
          img.src = imageSrc
        })
      }, batchIndex * 100) // 100ms delay between batches
    })

  }, [isInWorld])

  return null // This component doesn't render anything
} 
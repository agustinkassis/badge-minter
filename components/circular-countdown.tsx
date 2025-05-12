'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface CircularCountdownProps {
  duration: number // in seconds
  size?: number
  strokeWidth?: number
  className?: string
  onComplete?: () => void
}

export function CircularCountdown({
  duration,
  size = 36,
  strokeWidth = 3,
  className,
  onComplete
}: CircularCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(duration)

  // Calculate progress as a percentage (0-100)
  const progress = (timeLeft / duration) * 100

  // Calculate SVG parameters
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  useEffect(() => {
    // Reset timer when duration changes
    setTimeLeft(duration)

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer)
          if (onComplete) onComplete()
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [duration, onComplete])

  return (
    <div className={cn('relative flex-shrink-0', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="opacity-20"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>

      {/* Display seconds remaining in the center */}
      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
        {timeLeft}
      </div>
    </div>
  )
}

import { cn } from '@/lib/utils'

interface CircularProgressBarProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  className?: string
}

export function CircularProgressBar({
  progress,
  size = 36,
  strokeWidth = 3,
  className
}: CircularProgressBarProps) {
  // Ensure progress is between 0-100
  const normalizedProgress = Math.min(100, Math.max(0, progress))

  // Calculate SVG parameters
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset =
    circumference - (normalizedProgress / 100) * circumference

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
    </div>
  )
}

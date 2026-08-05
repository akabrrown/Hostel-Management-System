'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { LucideIcon } from 'lucide-react'
import { iconBackgrounds, iconColors, transitions, shadows } from '@/lib/design-tokens'
import { animations } from '@/lib/animations'

interface AnimatedStatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  iconColor?: keyof typeof iconColors
  trend?: {
    value: string
    isPositive: boolean
  }
  className?: string
  subText?: string
}

export default function AnimatedStatCard({
  icon: Icon,
  label,
  value,
  iconColor = 'blue',
  trend,
  className = '',
  subText,
}: AnimatedStatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    // Animate card entry
    if (cardRef.current) {
      animations.scaleIn(cardRef.current)
    }

    // Animate number if it's a number
    if (valueRef.current && typeof value === 'number') {
      animations.countUp(valueRef.current, value)
    }
  }, [value])

  const handleMouseEnter = () => {
    if (cardRef.current) {
      animations.cardHover(cardRef.current)
    }
  }

  const handleMouseLeave = () => {
    if (cardRef.current) {
      animations.cardHoverOut(cardRef.current)
    }
  }

  return (
    <div
      ref={cardRef}
      className={`bg-white rounded-lg ${shadows.card} ${transitions.default} p-6 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 ${iconBackgrounds[iconColor]} rounded-lg`}>
            <Icon className={`h-6 w-6 ${iconColors[iconColor]}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p
              ref={valueRef}
              className="text-2xl font-bold text-gray-900 mt-1"
            >
              {value}
            </p>
            {subText && (
              <p className="text-xs text-gray-400 mt-1 font-medium">{subText}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className="text-right">
            <span
              className={`text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

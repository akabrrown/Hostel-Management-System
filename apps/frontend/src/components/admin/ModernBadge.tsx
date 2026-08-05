'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { LucideIcon } from 'lucide-react'
import { badgeColors, transitions } from '@/lib/design-tokens'
import { animations } from '@/lib/animations'

interface ModernBadgeProps {
  children: ReactNode
  variant?: keyof typeof badgeColors
  icon?: LucideIcon
  animate?: boolean
  className?: string
}

export default function ModernBadge({
  children,
  variant = 'neutral',
  icon: Icon,
  animate = false,
  className = '',
}: ModernBadgeProps) {
  const badgeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (animate && badgeRef.current) {
      animations.scaleIn(badgeRef.current, 0.2)
    }
  }, [animate])

  return (
    <span
      ref={badgeRef}
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${badgeColors[variant]} ${transitions.fast} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 mr-1.5" />}
      {children}
    </span>
  )
}

'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { gradients, shadows, transitions } from '@/lib/design-tokens'
import { animations } from '@/lib/animations'

interface GradientCardProps {
  children: ReactNode
  gradient?: keyof typeof gradients
  className?: string
  animate?: boolean
  onClick?: () => void
}

export default function GradientCard({
  children,
  gradient = 'primary',
  className = '',
  animate = true,
  onClick,
}: GradientCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (animate && cardRef.current) {
      animations.scaleIn(cardRef.current)
    }
  }, [animate])

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
      className={`${gradients[gradient]} ${shadows.cardLg} ${transitions.default} rounded-lg p-6 text-white ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

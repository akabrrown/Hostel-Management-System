'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { LucideIcon } from 'lucide-react'
import Button from '@/components/ui/button'
import { animations } from '@/lib/animations'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      animations.fadeIn(containerRef.current)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
    >
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 text-center max-w-md mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}

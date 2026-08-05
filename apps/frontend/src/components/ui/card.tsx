import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white shadow-md p-4 sm:p-6',
      outlined: 'bg-white border border-gray-200 p-4 sm:p-6',
      elevated: 'bg-white shadow-xl p-4 sm:p-6',
    }

    return (
      <div
        className={cn(
          'rounded-lg transition-colors duration-200',
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card

'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'
import { Power4, Elastic, Back, Circ, Expo, Sine } from 'gsap'
import styles from './animations.module.css'
import { LoadingPage } from '@/components/ui/loading';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin)

// Page Transition Animation
export function PageTransition({ children, duration = 0.8 }: { children: React.ReactNode; duration?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const tl = gsap.timeline()
    
    // Fade in from bottom with stagger
    tl.fromTo(containerRef.current.children,
      { 
        opacity: 0, 
        y: 50,
        scale: 0.95
      },
      { 
        opacity: 1, 
        y: 0,
        scale: 1,
        duration: duration,
        stagger: 0.1,
        ease: Power4.easeOut
      }
    )

    return () => {
      tl.kill()
    }
  }, [duration])

  return (
    <div ref={containerRef} className="page-transition">
      {children}
    </div>
  )
}

// Animated Button Component
export function AnimatedButton({ 
  children, 
  className = '', 
  onClick,
  disabled = false,
  variant = 'primary',
  loading = false
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline'
  loading?: boolean
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!buttonRef.current) return

    const button = buttonRef.current

    // Hover animation
    const handleMouseEnter = () => {
      setIsHovered(true)
      gsap.to(button, {
        scale: 1.05,
        duration: 0.3,
        ease: Back.easeOut.config(1.7)
      })
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      gsap.to(button, {
        scale: 1,
        duration: 0.3,
        ease: Power4.easeOut
      })
    }

    // Click animation
    const handleMouseDown = () => {
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        ease: Power4.easeOut
      })
    }

    const handleMouseUp = () => {
      gsap.to(button, {
        scale: isHovered ? 1.05 : 1,
        duration: 0.2,
        ease: Elastic.easeOut.config(1, 0.3)
      })
    }

    button.addEventListener('mouseenter', handleMouseEnter)
    button.addEventListener('mouseleave', handleMouseLeave)
    button.addEventListener('mousedown', handleMouseDown)
    button.addEventListener('mouseup', handleMouseUp)

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter)
      button.removeEventListener('mouseleave', handleMouseLeave)
      button.removeEventListener('mousedown', handleMouseDown)
      button.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isHovered])

  const baseClasses = `px-6 py-3 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
    disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  } ${className}`

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500'
  }

  return (
    <button
      ref={buttonRef}
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <LoadingPage />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}

// Animated Card Component
export function AnimatedCard({ 
  children, 
  className = '', 
  hover = true,
  delay = 0 
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
  delay?: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current) return

    const card = cardRef.current

    // Initial entrance animation
    gsap.fromTo(card,
      { 
        opacity: 0, 
        y: 30,
        scale: 0.9
      },
      { 
        opacity: 1, 
        y: 0,
        scale: 1,
        duration: 0.8,
        delay: delay,
        ease: Power4.easeOut
      }
    )

    if (hover) {
      // Hover animation
      const handleMouseEnter = () => {
        gsap.to(card, {
          y: -5,
          scale: 1.02,
          duration: 0.3,
          ease: Back.easeOut.config(1.7)
        })
      }

      const handleMouseLeave = () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: Power4.easeOut
        })
      }

      card.addEventListener('mouseenter', handleMouseEnter)
      card.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        card.removeEventListener('mouseenter', handleMouseEnter)
        card.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [hover, delay])

  return (
    <div ref={cardRef} className={`bg-white rounded-lg shadow-lg ${className}`}>
      {children}
    </div>
  )
}

// Loading Skeleton Animation
export function LoadingSkeleton({ 
  lines = 3, 
  className = '' 
}: {
  lines?: number
  className?: string
}) {
  const skeletonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!skeletonRef.current) return

    const skeleton = skeletonRef.current
    const skeletonLines = skeleton.querySelectorAll('.skeleton-line')

    // Animate skeleton lines
    gsap.fromTo(skeletonLines,
      { 
        opacity: 0.3,
        x: -20
      },
      { 
        opacity: 1,
        x: 0,
        duration: 1.5,
        stagger: 0.2,
        repeat: -1,
        yoyo: true,
        ease: Sine.easeInOut
      }
    )
  }, [lines])

  return (
    <div ref={skeletonRef} className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="skeleton-line bg-gray-200 rounded"
          style={{
            width: `${Math.random() * 40 + 60}%`,
            height: `${Math.random() * 10 + 15}px`
          }}
        />
      ))}
    </div>
  )
}

// Fade In Animation Component
export function FadeIn({ 
  children, 
  duration = 0.8, 
  delay = 0,
  direction = 'up',
  distance = 30
}: {
  children: React.ReactNode
  duration?: number
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
}) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!elementRef.current) return

    const element = elementRef.current

    // Set initial position based on direction
    const initialPosition = {
      up: { y: distance, x: 0 },
      down: { y: -distance, x: 0 },
      left: { y: 0, x: distance },
      right: { y: 0, x: -distance }
    }

    gsap.fromTo(element,
      { 
        opacity: 0, 
        ...initialPosition[direction]
      },
      { 
        opacity: 1, 
        y: 0,
        x: 0,
        duration: duration,
        delay: delay,
        ease: Power4.easeOut
      }
    )
  }, [duration, delay, direction, distance])

  return (
    <div ref={elementRef}>
      {children}
    </div>
  )
}

// Scroll Animation Component
export function ScrollAnimation({ 
  children, 
  animation = 'fadeUp',
  threshold = 0.1 
}: {
  children: React.ReactNode
  animation?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale'
  threshold?: number
}) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!elementRef.current) return

    const element = elementRef.current

    const animations = {
      fadeUp: {
        from: { opacity: 0, y: 50 },
        to: { opacity: 1, y: 0 }
      },
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 }
      },
      slideLeft: {
        from: { opacity: 0, x: 50 },
        to: { opacity: 1, x: 0 }
      },
      slideRight: {
        from: { opacity: 0, x: -50 },
        to: { opacity: 1, x: 0 }
      },
      scale: {
        from: { opacity: 0, scale: 0.8 },
        to: { opacity: 1, scale: 1 }
      }
    }

    ScrollTrigger.create({
      trigger: element,
      start: `top bottom-=${threshold * 100}%`,
      onEnter: () => {
        gsap.fromTo(element,
          animations[animation].from,
          {
            ...animations[animation].to,
            duration: 0.8,
            ease: Power4.easeOut
          }
        )
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [animation, threshold])

  return (
    <div ref={elementRef}>
      {children}
    </div>
  )
}

// Text Animation Component
export function AnimatedText({ 
  text, 
  className = '',
  animation = 'typewriter',
  duration = 0.05 
}: {
  text: string
  className?: string
  animation?: 'typewriter' | 'fadeIn' | 'slideIn'
  duration?: number
}) {
  const textRef = useRef<HTMLDivElement>(null)
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    if (!textRef.current) return

    const element = textRef.current

    if (animation === 'typewriter') {
      let currentIndex = 0
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(interval)
        }
      }, duration * 1000)

      return () => clearInterval(interval)
    } else if (animation === 'fadeIn') {
      gsap.fromTo(element,
        { opacity: 0 },
        { 
          opacity: 1, 
          duration: 1,
          ease: Power4.easeOut
        }
      )
    } else if (animation === 'slideIn') {
      gsap.fromTo(element,
        { opacity: 0, x: -50 },
        { 
          opacity: 1, 
          x: 0,
          duration: 0.8,
          ease: Power4.easeOut
        }
      )
    }
  }, [text, animation, duration])

  return (
    <div ref={textRef} className={className}>
      {animation === 'typewriter' ? displayText : text}
      {animation === 'typewriter' && displayText.length < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </div>
  )
}

// Counter Animation Component
export function AnimatedCounter({ 
  end, 
  duration = 2, 
  delay = 0,
  prefix = '',
  suffix = ''
}: {
  end: number
  duration?: number
  delay?: number
  prefix?: string
  suffix?: string
}) {
  const counterRef = useRef<HTMLSpanElement>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!counterRef.current) return

    const counter = counterRef.current

    gsap.to({}, {
      duration: duration,
      delay: delay,
      ease: Power4.easeOut,
      onUpdate: function() {
        const progress = this.progress()
        const currentCount = Math.floor(end * progress)
        setCount(currentCount)
      }
    })
  }, [end, duration, delay])

  return (
    <span ref={counterRef}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

// Progress Bar Animation
export function AnimatedProgressBar({ 
  value, 
  max = 100,
  duration = 1,
  color = 'blue',
  showPercentage = true
}: {
  value: number
  max?: number
  duration?: number
  color?: 'blue' | 'green' | 'red' | 'yellow'
  showPercentage?: boolean
}) {
  const progressBarRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!fillRef.current) return

    const percentage = (value / max) * 100

    gsap.to(fillRef.current, {
      width: `${percentage}%`,
      duration: duration,
      ease: Power4.easeOut
    })
  }, [value, max, duration])

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  }

  return (
    <div ref={progressBarRef} className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Progress</span>
        {showPercentage && (
          <span className="text-sm text-gray-600">
            {Math.round((value / max) * 100)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          ref={fillRef}
          className={`h-2 rounded-full ${colorClasses[color]} transition-all duration-300`}
          style={{ width: '0%' }}
        />
      </div>
    </div>
  )
}

// Stagger Animation Hook
export function useStaggerAnimation(
  elements: HTMLElement[],
  animation = 'fadeIn',
  stagger = 0.1,
  duration = 0.8
) {
  useEffect(() => {
    if (elements.length === 0) return

    const animations = {
      fadeIn: { opacity: 0, to: { opacity: 1 } },
      fadeUp: { opacity: 0, y: 30, to: { opacity: 1, y: 0 } },
      fadeDown: { opacity: 0, y: -30, to: { opacity: 1, y: 0 } },
      slideLeft: { opacity: 0, x: 30, to: { opacity: 1, x: 0 } },
      slideRight: { opacity: 0, x: -30, to: { opacity: 1, x: 0 } }
    }

    const selectedAnimation = animations[animation as keyof typeof animations]

    gsap.fromTo(elements,
      selectedAnimation,
      {
        ...selectedAnimation.to,
        duration: duration,
        stagger: stagger,
        ease: Power4.easeOut
      }
    )
  }, [elements, animation, stagger, duration])
}

// Page Transition Hook
export function usePageTransition() {
  useEffect(() => {
    // Fade out current page
    const tl = gsap.timeline()
    
    tl.to('body', {
      opacity: 0,
      duration: 0.3,
      ease: Power4.easeIn
    })
    .set('body', { opacity: 0 })
    .to('body', {
      opacity: 1,
      duration: 0.5,
      ease: Power4.easeOut
    })

    return () => {
      tl.kill()
    }
  }, [])
}

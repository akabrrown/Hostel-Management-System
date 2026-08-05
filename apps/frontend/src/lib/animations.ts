import gsap from 'gsap'

/**
 * GSAP Animation Utilities for Admin Portal
 * Reusable animation functions for consistent motion design
 */

export const animations = {
  // Page entry animations
  fadeIn: (element: string | Element, delay: number = 0) => {
    gsap.fromTo(
      element,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, delay, ease: 'power3.out' }
    )
  },

  slideUp: (element: string | Element, delay: number = 0) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay, ease: 'power3.out' }
    )
  },

  slideDown: (element: string | Element, delay: number = 0) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, delay, ease: 'power3.out' }
    )
  },

  scaleIn: (element: string | Element, delay: number = 0) => {
    gsap.fromTo(
      element,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.4, delay, ease: 'power3.out' }
    )
  },

  // Staggered animations for lists
  staggerFadeIn: (elements: string, stagger: number = 0.1) => {
    gsap.fromTo(
      elements,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger,
        ease: 'power3.out',
      }
    )
  },

  // Page transition timeline
  pageEntryTimeline: () => {
    const tl = gsap.timeline()
    
    tl.fromTo(
      '.page-header',
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo(
      '.stats-cards',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo(
      '.content-section',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.3'
    )

    return tl
  },

  // Card hover animation
  cardHover: (element: Element) => {
    gsap.to(element, {
      scale: 1.02,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      duration: 0.3,
      ease: 'power2.out',
    })
  },

  cardHoverOut: (element: Element) => {
    gsap.to(element, {
      scale: 1,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      duration: 0.3,
      ease: 'power2.out',
    })
  },

  // Number counter animation
  countUp: (element: Element, endValue: number, duration: number = 1) => {
    const obj = { value: 0 }
    gsap.to(obj, {
      value: endValue,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        element.textContent = Math.round(obj.value).toString()
      },
    })
  },
}

/**
 * Initialize page animations
 * Call this in useEffect on page mount
 */
export const initPageAnimations = (delay: number = 100) => {
  setTimeout(() => {
    animations.pageEntryTimeline()
  }, delay)
}

/**
 * Animate elements on scroll
 */
export const animateOnScroll = (elements: string) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animations.slideUp(entry.target)
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
  )

  document.querySelectorAll(elements).forEach((el) => {
    observer.observe(el)
  })
}

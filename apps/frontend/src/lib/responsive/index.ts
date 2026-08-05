// Responsive design utilities
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}

export const useResponsive = () => {
  const getScreenSize = () => {
    if (typeof window === 'undefined') return 'lg'
    
    const width = window.innerWidth
    if (width < 640) return 'sm'
    if (width < 768) return 'md'
    if (width < 1024) return 'lg'
    if (width < 1280) return 'xl'
    return '2xl'
  }

  const isMobile = () => {
    return getScreenSize() === 'sm' || getScreenSize() === 'md'
  }

  const isTablet = () => {
    return getScreenSize() === 'lg'
  }

  const isDesktop = () => {
    return getScreenSize() === 'xl' || getScreenSize() === '2xl'
  }

  return {
    screenSize: getScreenSize(),
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop()
  }
}

export const responsive = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)'
}

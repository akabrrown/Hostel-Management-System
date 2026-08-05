/**
 * Design Tokens for Admin Portal
 * Consistent colors, gradients, and spacing used across all admin pages
 */

export const gradients = {
  primary: 'bg-gradient-to-br from-blue-500 to-purple-600',
  primaryHover: 'hover:from-blue-600 hover:to-purple-700',
  success: 'bg-gradient-to-br from-green-500 to-teal-600',
  successHover: 'hover:from-green-600 hover:to-teal-700',
  warning: 'bg-gradient-to-br from-yellow-500 to-orange-600',
  warningHover: 'hover:from-yellow-600 hover:to-orange-700',
  danger: 'bg-gradient-to-br from-red-500 to-pink-600',
  dangerHover: 'hover:from-red-600 hover:to-pink-700',
  info: 'bg-gradient-to-br from-cyan-500 to-blue-600',
  infoHover: 'hover:from-cyan-600 hover:to-blue-700',
  purple: 'bg-gradient-to-br from-purple-500 to-pink-600',
  purpleHover: 'hover:from-purple-600 hover:to-pink-700',
  indigo: 'bg-gradient-to-br from-indigo-500 to-blue-600',
  rose: 'bg-gradient-to-br from-rose-500 to-pink-600',
}

export const iconBackgrounds = {
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  yellow: 'bg-yellow-100',
  red: 'bg-red-100',
  purple: 'bg-purple-100',
  cyan: 'bg-cyan-100',
  orange: 'bg-orange-100',
  pink: 'bg-pink-100',
  emerald: 'bg-emerald-100',
  amber: 'bg-amber-100',
  rose: 'bg-rose-100',
}

export const iconColors = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  yellow: 'text-yellow-600',
  red: 'text-red-600',
  purple: 'text-purple-600',
  cyan: 'text-cyan-600',
  orange: 'text-orange-600',
  pink: 'text-pink-600',
  emerald: 'text-emerald-600',
  amber: 'text-amber-600',
  rose: 'text-rose-600',
}

export const badgeColors = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-800',
  purple: 'bg-purple-100 text-purple-800',
}

export const spacing = {
  cardPadding: 'p-6',
  cardPaddingSm: 'p-4',
  sectionGap: 'gap-6',
  sectionGapSm: 'gap-4',
  contentPadding: 'p-6',
  pageContainer: 'max-w-7xl mx-auto',
}

export const shadows = {
  card: 'shadow-sm hover:shadow-md',
  cardLg: 'shadow-md hover:shadow-lg',
  button: 'shadow-sm hover:shadow-md',
}

export const transitions = {
  default: 'transition-all duration-300 ease-in-out',
  fast: 'transition-all duration-150 ease-in-out',
  slow: 'transition-all duration-500 ease-in-out',
}

export const borders = {
  default: 'border border-gray-200',
  hover: 'hover:border-gray-300',
  focus: 'focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
  rounded: 'rounded-lg',
  roundedFull: 'rounded-full',
}

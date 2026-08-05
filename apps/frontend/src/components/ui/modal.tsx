import React from 'react'
import styles from './modal.module.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/60 w-full relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${sizeClasses[size]}`}>
        {/* Subtle signature detail: Top accent border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600/80" />
        
        {title && (
          <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6 pt-4">
          {children}
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export default function Input({ label, error, helperText, className = '', ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = props.type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : props.type

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-responsive-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          type={inputType}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-responsive-base ${error ? 'border-red-500' : ''} ${isPassword ? 'pr-10' : ''} ${className}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-responsive-xs text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-responsive-xs text-gray-500">{helperText}</p>
      )}
    </div>
  )
}

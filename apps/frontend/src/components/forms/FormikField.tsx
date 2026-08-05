'use client'

import { useField, useFormikContext } from 'formik'
import { useState } from 'react'
import Input from '@/components/ui/input'
import Button from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { ReactNode } from 'react'
import styles from './FormikField.module.css'

interface FormikFieldProps {
  name: string
  label?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'select' | 'textarea' | 'file'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: Array<{ value: string; label: string }>
  helperText?: string
  className?: string
  startIcon?: ReactNode
  endIcon?: ReactNode
  showPasswordToggle?: boolean
  accept?: string
}

export function FormikField({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  options,
  helperText,
  className = '',
  startIcon,
  endIcon,
  showPasswordToggle = false
}: FormikFieldProps) {
  const [field, meta] = useField(name)
  const [showPassword, setShowPassword] = useState(false)
  const { isSubmitting } = useFormikContext() || {}

  const hasError = meta.touched && meta.error
  const actualType = type === 'password' && showPasswordToggle ? (showPassword ? 'text' : 'password') : type

  const renderField = () => {
    switch (type) {
      case 'select':
        return (
          <select
            {...field}
            id={name}
            disabled={disabled || isSubmitting}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : ''
            } ${className}`}
          >
            <option value="">Select {label}</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      
      case 'textarea':
        return (
          <textarea
            {...field}
            id={name}
            placeholder={placeholder}
            disabled={disabled || isSubmitting}
            rows={4}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : ''
            } ${className}`}
          />
        )
      
      default:
        return (
          <div className="relative">
            {startIcon && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {startIcon}
              </div>
            )}
            <Input
              {...field}
              id={name}
              type={actualType}
              placeholder={placeholder}
              disabled={disabled || isSubmitting}
              className={`w-full ${startIcon ? 'pl-10' : ''} ${endIcon || showPasswordToggle ? 'pr-10' : ''} ${
                hasError ? 'border-red-500' : ''
              } ${className}`}
            />
            {(endIcon || showPasswordToggle) && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {showPasswordToggle ? (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                ) : (
                  endIcon
                )}
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {renderField()}
      
      {hasError && (
        <div className="flex items-center space-x-1 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{meta.error}</span>
        </div>
      )}
      
      {helperText && !hasError && (
        <p className="text-gray-500 text-sm">{helperText}</p>
      )}
    </div>
  )
}

interface FormikCheckboxProps {
  name: string
  label: string
  disabled?: boolean
  className?: string
  required?: boolean
}

export function FormikCheckbox({ name, label, disabled = false, className = '' }: FormikCheckboxProps) {
  const [field, meta] = useField({ name, type: 'checkbox' })
  const { isSubmitting } = useFormikContext() || {}

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <input
        {...field}
        id={name}
        type="checkbox"
        disabled={disabled}
        className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
          meta.touched && meta.error ? 'border-red-500' : ''
        }`}
      />
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {meta.touched && meta.error && (
        <p className="text-red-600 text-sm ml-2">{meta.error}</p>
      )}
    </div>
  )
}

interface FormikRadioGroupProps {
  name: string
  label?: string
  options: Array<{ value: string; label: string }>
  disabled?: boolean
  className?: string
  direction?: 'horizontal' | 'vertical'
}

export function FormikRadioGroup({
  name,
  label,
  options,
  disabled = false,
  className = '',
  direction = 'vertical'
}: FormikRadioGroupProps) {
  const [field, meta] = useField(name)
  const { isSubmitting } = useFormikContext() || {}

  const hasError = meta.touched && meta.error

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      
      <div className={`${direction === 'horizontal' ? 'flex space-x-4' : 'space-y-2'}`}>
        {options.map(option => (
          <div key={option.value} className="flex items-center space-x-2">
            <input
              {...field}
              type="radio"
              id={`${name}-${option.value}`}
              value={option.value}
              disabled={disabled || isSubmitting}
              className={`w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 ${
                hasError ? 'border-red-500' : ''
              }`}
            />
            <label htmlFor={`${name}-${option.value}`} className="text-sm font-medium text-gray-700">
              {option.label}
            </label>
          </div>
        ))}
      </div>
      
      {hasError && (
        <div className="flex items-center space-x-1 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{meta.error}</span>
        </div>
      )}
    </div>
  )
}

interface FormikFileProps {
  name: string
  label?: string
  accept?: string
  multiple?: boolean
  maxSize?: number
  helperText?: string
  className?: string
  onFileChange?: (files: File[]) => void
}

export function FormikFile({
  name,
  label,
  accept,
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  helperText,
  className = '',
  onFileChange
}: FormikFileProps) {
  const [field, meta] = useField(name)
  const [dragActive, setDragActive] = useState(false)
  const { isSubmitting } = useFormikContext() || {}

  const hasError = meta.touched && meta.error

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    
    // Validate file sizes
    const oversizedFiles = fileArray.filter(file => file.size > maxSize)
    if (oversizedFiles.length > 0) {
      alert(`Files are too large. Maximum size is ${maxSize / 1024 / 1024}MB`)
      return
    }

    field.onChange({
      target: {
        name,
        value: multiple ? fileArray : fileArray[0]
      }
    })

    onFileChange?.(fileArray)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
        } ${hasError ? 'border-red-500' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          {...field}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={isSubmitting}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => handleFiles(e.target.files)}
        />
        
        <div className="space-y-2">
          <div className="text-gray-600">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm">Drag and drop files here, or click to select</p>
          </div>
          
          {field.value && (
            <div className="text-sm text-gray-600">
              {multiple ? (
                <span>{Array.isArray(field.value) ? field.value.length : 0} files selected</span>
              ) : (
                <span>1 file selected</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {hasError && (
        <div className="flex items-center space-x-1 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{meta.error}</span>
        </div>
      )}
      
      {helperText && !hasError && (
        <p className="text-gray-500 text-sm">{helperText}</p>
      )}
    </div>
  )
}

interface FormikMultiStepProps {
  children: ReactNode
  currentStep: number
  totalSteps: number
  onStepChange?: (step: number) => void
  className?: string
}

export function FormikMultiStep({
  children,
  currentStep,
  totalSteps,
  onStepChange,
  className = ''
}: FormikMultiStepProps) {
  const steps = Array.isArray(children) ? children : [children]
  const currentStepComponent = steps[currentStep]

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      onStepChange?.(step)
    }
  }

  const nextStep = () => goToStep(currentStep + 1)
  const prevStep = () => goToStep(currentStep - 1)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i === currentStep
                  ? 'bg-blue-600 text-white'
                  : i < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  i < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <div className="min-h-[300px]">
        {currentStepComponent}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Step {currentStep + 1} of {totalSteps}
          </span>
          
          {currentStep < totalSteps - 1 ? (
            <Button onClick={nextStep}>
              Next Step
            </Button>
          ) : (
            <Button type="submit">
              Submit
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

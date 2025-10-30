'use client'
import React, { forwardRef } from 'react'

interface MobileInputProps {
  type?: 'text' | 'email' | 'password' | 'search' | 'number'
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
  error?: boolean
  helperText?: string
  label?: string
  required?: boolean
  className?: string
  autoComplete?: string
  autoFocus?: boolean
}

const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(({
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  error = false,
  helperText,
  label,
  required = false,
  className = '',
  autoComplete,
  autoFocus = false
}, ref) => {
  const baseClasses = 'mobile-input'
  const errorClass = error ? 'mobile-input-error' : ''

  const classes = [
    baseClasses,
    errorClass,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className="mobile-space-y-sm">
      {label && (
        <label className="mobile-text-sm mobile-font-medium mobile-text-primary">
          {label}
          {required && <span className="mobile-text-error mobile-ml-xs">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        className={classes}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
      />
      {helperText && (
        <p className={`mobile-text-xs ${error ? 'mobile-text-error' : 'mobile-text-secondary'}`}>
          {helperText}
        </p>
      )}
    </div>
  )
})

MobileInput.displayName = 'MobileInput'

export default MobileInput

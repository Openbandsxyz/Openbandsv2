'use client'
import React from 'react'

interface MobileButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export default function MobileButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button'
}: MobileButtonProps) {
  const baseClasses = 'mobile-btn'
  const variantClasses = {
    primary: 'mobile-btn-primary',
    secondary: 'mobile-btn-secondary',
    outline: 'mobile-btn-outline',
    ghost: 'mobile-btn-ghost'
  }
  const sizeClasses = {
    sm: 'mobile-btn-sm',
    md: '',
    lg: 'mobile-btn-lg',
    xl: 'mobile-btn-xl'
  }
  const fullWidthClass = fullWidth ? 'mobile-btn-full' : ''

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidthClass,
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className="mobile-flex mobile-items-center mobile-gap-sm">
          <div className="mobile-spinner" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}

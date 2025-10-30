'use client'
import React from 'react'

interface MobileCardProps {
  children: React.ReactNode
  interactive?: boolean
  onClick?: () => void
  className?: string
  loading?: boolean
}

export default function MobileCard({
  children,
  interactive = false,
  onClick,
  className = '',
  loading = false
}: MobileCardProps) {
  const baseClasses = 'mobile-card'
  const interactiveClass = interactive ? 'mobile-card-interactive' : ''
  const loadingClass = loading ? 'mobile-skeleton' : ''

  const classes = [
    baseClasses,
    interactiveClass,
    loadingClass,
    className
  ].filter(Boolean).join(' ')

  if (loading) {
    return (
      <div className={classes}>
        <div className="mobile-p-md mobile-space-y-md">
          <div className="mobile-skeleton mobile-h-4 mobile-w-3/4 mobile-rounded" />
          <div className="mobile-skeleton mobile-h-3 mobile-w-full mobile-rounded" />
          <div className="mobile-skeleton mobile-h-3 mobile-w-1/2 mobile-rounded" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={classes}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  )
}

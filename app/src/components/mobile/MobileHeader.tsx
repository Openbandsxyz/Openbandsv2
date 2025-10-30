'use client'
import React from 'react'

interface MobileHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  onBack?: () => void
  showBack?: boolean
}

export default function MobileHeader({
  title,
  subtitle,
  actions,
  onBack,
  showBack = false
}: MobileHeaderProps) {
  return (
    <header className="mobile-header mobile-safe-top">
      <div className="mobile-flex mobile-items-center mobile-justify-between mobile-w-full">
        <div className="mobile-flex mobile-items-center mobile-gap-md">
          {showBack && (
            <button
              onClick={onBack}
              className="mobile-btn mobile-btn-ghost mobile-btn-sm mobile-p-sm"
              aria-label="Go back"
            >
              <svg className="mobile-w-5 mobile-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="mobile-header-title">{title}</h1>
            {subtitle && (
              <p className="mobile-text-sm mobile-text-secondary mobile-mt-xs">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="mobile-header-actions">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}

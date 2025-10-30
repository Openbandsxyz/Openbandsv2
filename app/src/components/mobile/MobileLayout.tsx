'use client'
import React from 'react'
import BottomTabNavigation, { TabId } from './BottomTabNavigation'
import MobileHeader from './MobileHeader'

interface MobileLayoutProps {
  children: React.ReactNode
  activeTab: TabId
  onTabChange: (tabId: TabId) => void
  headerTitle?: string
  headerSubtitle?: string
  headerActions?: React.ReactNode
  showBack?: boolean
  onBack?: () => void
  className?: string
}

export default function MobileLayout({
  children,
  activeTab,
  onTabChange,
  headerTitle,
  headerSubtitle,
  headerActions,
  showBack = false,
  onBack,
  className = ''
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {headerTitle && (
        <MobileHeader
          title={headerTitle}
          subtitle={headerSubtitle}
          actions={headerActions}
          showBack={showBack}
          onBack={onBack}
        />
      )}
      
      {/* Main Content */}
      <main className={`mobile-content ${className}`}>
        {children}
      </main>
      
      {/* Bottom Navigation - Only on mobile */}
      <div className="lg:hidden">
        <BottomTabNavigation
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      </div>
    </div>
  )
}

// Container component for consistent spacing
export function MobileContainer({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`mobile-container ${className}`}>
      {children}
    </div>
  )
}

// Section component for content sections
export function MobileSection({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <section className={`mobile-py-lg ${className}`}>
      {children}
    </section>
  )
}

'use client'
import { SelfVerifyPlayground } from '@/components/zkpassports/self/SelfVerifyPlayground'

interface SelfQRCodeVerificationPanelProps {
  selectedAttribute?: string | null
  isMobile?: boolean
  onClose?: () => void
}

export const SelfQRCodeVerificationPanel = ({ 
  selectedAttribute, 
  isMobile = false,
  onClose 
}: SelfQRCodeVerificationPanelProps) => {
  
  const getVerificationTitle = () => {
    switch (selectedAttribute) {
      case 'nationality':
        return 'Nationality Verification'
      case 'age':
        return 'Age Verification'
      default:
        return 'Identity Verification'
    }
  }

  const getVerificationDescription = () => {
    switch (selectedAttribute) {
      case 'nationality':
        return 'Verify your nationality using your passport with Self.xyz protocol'
      case 'age':
        return 'Verify your age (18+) using your passport with Self.xyz protocol'
      default:
        return 'Verify your identity using your passport with Self.xyz protocol'
    }
  }

  return (
    <div className="w-full">
      {/* Header with close button if onClose is provided */}
      {onClose && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {getVerificationTitle()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* QR Code Verification Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        padding: '24px', 
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ 
          marginBottom: '8px', 
          color: '#495057',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          🛡️ {getVerificationTitle()} (Self.xyz)
        </h3>
        <p style={{ 
          color: '#6c757d', 
          fontSize: '14px', 
          marginBottom: '20px',
          lineHeight: '1.5'
        }}>
          {getVerificationDescription()}
        </p>
        <SelfVerifyPlayground isMobile={isMobile} />
      </div>
    </div>
  )
}
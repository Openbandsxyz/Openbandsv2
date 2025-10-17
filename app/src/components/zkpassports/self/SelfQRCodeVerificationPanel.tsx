'use client'
import { useState } from 'react'
import Image from 'next/image'
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
  const [showVerification, setShowVerification] = useState(false)
  
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
      
      {/* Verification Section */}
      {!showVerification ? (
        /* Connect Button Interface */
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Self.xyz Official Logo */}
              <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-2">
                <Image 
                  src="https://i.postimg.cc/mrmVf9hm/self.png" 
                  alt="Self.xyz Logo" 
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              
              {/* Content */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Self
                </h3>
                <p className="text-sm text-gray-600">
                  {getVerificationDescription()}
                </p>
              </div>
            </div>
            
            {/* Connect Button */}
            <button
              onClick={() => setShowVerification(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Connect
            </button>
          </div>
        </div>
      ) : (
        /* QR Code Verification Interface */
        <div className="space-y-4">
          {/* Back Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowVerification(false)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">Back to verification options</span>
            </button>
          </div>
          
          {/* QR Code Section */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🛡️ {getVerificationTitle()}
              </h3>
              <p className="text-sm text-gray-600">
                Scan the QR code with your Self mobile app to verify your identity
              </p>
            </div>
            
            <SelfVerifyPlayground isMobile={isMobile} />
          </div>
        </div>
      )}
    </div>
  )
}
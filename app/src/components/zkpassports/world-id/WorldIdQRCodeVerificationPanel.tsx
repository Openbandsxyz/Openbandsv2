'use client'
import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit'


interface WorldIdQRCodeVerificationPanelProps {
  selectedAttribute?: string | null
  onClose?: () => void
}

export const WorldIdQRCodeVerificationPanel = ({ 
  selectedAttribute, 
  onClose 
}: WorldIdQRCodeVerificationPanelProps) => {
  
  const app_id = process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID || "WORLDCOIN_APP_ID is not set"
  const action = process.env.NEXT_PUBLIC_WORLDCOIN_ACTION || "WORLDCOIN_ACTION is not set"
  
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
        return 'Verify your nationality using your passport with World ID protocol'
      case 'age':
        return 'Verify your age (18+) using your passport with World ID protocol'
      default:
        return 'Verify your identity using your passport with World ID protocol'
    }
  }

  const handleVerify = (result: ISuccessResult) => {
    console.log("World ID verification successful:", result)
    // Modal is already closed when IDKitWidget opened
    // Handle successful verification result here if needed
  }

  const handleError = (error: Error) => {
    console.error("World ID verification failed:", error)
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
      
      {/* Connect Button Interface */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
        {/* Header Section */}
        <div className="flex items-center space-x-4 mb-4">
          {/* World ID Logo */}
          <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">🌍</span>
          </div>
          
          {/* Content */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              World ID
            </h3>
            <p className="text-sm text-gray-600">
              {getVerificationDescription()}
            </p>
          </div>
        </div>
        
        {/* Connect Button with IDKitWidget */}
        <div 
          role="region" 
          aria-labelledby="world-id-title"
          aria-describedby="world-id-description"
        >
          {/* Hidden title for screen readers */}
          <h3 id="world-id-title" className="sr-only">
            {getVerificationTitle()} with World ID
          </h3>
          <p id="world-id-description" className="sr-only">
            {getVerificationDescription()}
          </p>
          
          <IDKitWidget
            app_id={app_id}
            action={action}
            verification_level={VerificationLevel.SecureDocument}
            onSuccess={handleVerify}
            onError={handleError}
            credential_types={["secure document"]}
            enableTelemetry
            // Add title for accessibility
            title={getVerificationTitle()}
            // Add accessibility props
            aria-label={`${getVerificationTitle()} - World ID Verification`}
          >
            {({ open }: { open: () => void }) => (
              <button
                onClick={() => {
                  // Close current modal immediately when opening IDKitWidget
                  if (onClose) {
                    onClose()
                  }
                  // Open IDKitWidget modal immediately
                  open()
                }}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Connect with World ID
              </button>
            )}
          </IDKitWidget>
        </div>
      </div>
    </div>
  )
}
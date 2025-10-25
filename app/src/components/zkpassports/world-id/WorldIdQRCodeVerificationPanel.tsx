'use client'
import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit'
import { useEffect, useRef } from 'react'


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
  const openRef = useRef<(() => void) | null>(null)
  
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



  // Auto-open World ID verification when component mounts
  useEffect(() => {
    if (openRef.current) {
      // Close the current modal and open World ID verification immediately
      if (onClose) {
        onClose()
      }
      openRef.current()
    }
  }, [onClose])

  const handleVerify = (result: ISuccessResult) => {
    console.log("World ID verification successful:", result)
    // Handle successful verification result here if needed
  }

  const handleError = (error: Error) => {
    console.error("World ID verification failed:", error)
  }

  return (
    <div className="hidden">
      {/* IDKitWidget - Auto-opens World ID verification modal */}
      <IDKitWidget
        app_id={app_id}
        action={action}
        verification_level={VerificationLevel.SecureDocument}
        onSuccess={handleVerify}
        onError={handleError}
        credential_types={["secure document"]}
        enableTelemetry
        title={getVerificationTitle()}
        aria-label={`${getVerificationTitle()} - World ID Verification`}
      >
        {({ open }: { open: () => void }) => {
          // Store the open function to call it automatically
          openRef.current = open
          return null
        }}
      </IDKitWidget>
    </div>
  )
}
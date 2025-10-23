'use client'
import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit'
import { useState } from 'react'

interface WorldIdProps {
  onSuccess?: (result: ISuccessResult) => void;
  onError?: (error: Error) => void;
}

export const WorldIdVerification = ({ onSuccess, onError }: WorldIdProps) => {
  const [isVerified, setIsVerified] = useState(false);
  const [verificationResult, setVerificationResult] = useState<ISuccessResult | null>(null);

  const app_id = process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID || "WORLDCOIN_APP_ID is not set"; // Replace with your actual app_id
  const action = process.env.NEXT_PUBLIC_WORLDCOIN_ACTION || "WORLDCOIN_ACTION is not set"; // Replace with your action

  const handleVerify = (result: ISuccessResult) => {
    console.log("World ID verification successful:", result);
    setIsVerified(true);
    setVerificationResult(result);
    if (onSuccess) {
      onSuccess(result);
    }
  };

  const handleError = (error: Error) => {
    console.error("World ID verification failed:", error);
    if (onError) {
      onError(error);
    }
  };

  return (
    <div className="world-id-container">
      {!isVerified ? (
        <IDKitWidget
          app_id={app_id}
          action={action}
          verification_level={VerificationLevel.SecureDocument}
          onSuccess={handleVerify}
          onError={handleError}
          credential_types={["secure document"]}
          //credential_types={["orb", "phone"]}
          enableTelemetry
        >
          {({ open }: { open: () => void }) => (
            <button 
              onClick={open}
              className="world-id-button"
              style={{
                backgroundColor: '#000000',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginTop: '10px'
              }}
            >
              🌍 Verify with World ID
            </button>
          )}
        </IDKitWidget>
      ) : (
        <div className="verification-success" style={{ 
          padding: '16px', 
          backgroundColor: '#f0f9ff', 
          border: '1px solid #0ea5e9', 
          borderRadius: '8px',
          marginTop: '10px'
        }}>
          <p style={{ margin: 0, color: '#0c4a6e', fontWeight: '600' }}>
            ✅ World ID Verified Successfully!
          </p>
          {verificationResult && (
            <details style={{ marginTop: '8px' }}>
              <summary style={{ cursor: 'pointer', color: '#0369a1' }}>
                View Verification Details
              </summary>
              <pre style={{ 
                fontSize: '12px', 
                backgroundColor: '#e0f2fe', 
                padding: '8px', 
                borderRadius: '4px',
                overflow: 'auto',
                marginTop: '8px'
              }}>
                {JSON.stringify(verificationResult, null, 2)}
              </pre>
            </details>
          )}
          <button 
            onClick={() => {
              setIsVerified(false);
              setVerificationResult(null);
            }}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            Reset Verification
          </button>
        </div>
      )}
    </div>
  );
};
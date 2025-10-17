'use client'
import { useEffect, useState } from 'react'
import { countries, SelfQRcodeWrapper } from '@selfxyz/qrcode'
import { SelfAppBuilder } from '@selfxyz/qrcode'
import { useAccount } from 'wagmi'

interface SelfVerifyQRCodeProps {
  isMobile?: boolean
}

export const SelfVerifyQRCode = ({ isMobile = false }: SelfVerifyQRCodeProps) => {
  const [selfApp, setSelfApp] = useState<any | null>(null)
  const [universalLink, setUniversalLink] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const { address, isConnected } = useAccount()

  useEffect(() => {
    // Use the connected wallet address if available, otherwise use a demo address
    const userId = address || 'No Wallet Connected'
    
    try {
      const appConfig: any = {
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || 'OpenBands.xyz v2 - Passport verification with Self.xyz',
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || 'OpenBands.xyz v2 - Passport verification with Self.xyz',
        endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT || 'https://api.self.xyz'}`,
        logoBase64: 'https://i.postimg.cc/mrmVf9hm/self.png',
        userId,
        endpointType: 'staging_celo',
        userIdType: 'hex', // 'hex' for EVM address or 'uuid' for uuidv4
        userDefinedData: 'Identity verification via Self.xyz QR Code',
        disclosures: {
          // What you want to verify from the user's identity
          minimumAge: 18,
          excludedCountries: [countries.CUBA, countries.IRAN, countries.NORTH_KOREA, countries.RUSSIA],
          // What you want users to disclose
          nationality: true,
          gender: true,
        },
      }

      // Add deeplink callback for mobile
      if (isMobile) {
        appConfig.deeplinkCallback = `${window.location.origin}/verification-callback`
      }

      const app = new SelfAppBuilder(appConfig).build()

      setSelfApp(app)
      
      if (isMobile) {
        // Note: getUniversalLink may need to be imported differently or may be part of the app object
        // For now, we'll create a placeholder universal link
        const baseUrl = 'https://self.xyz/app'
        const encodedApp = encodeURIComponent(JSON.stringify(app))
        const link = `${baseUrl}?data=${encodedApp}`
        setUniversalLink(link)
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error('Error creating SelfApp:', error)
      setIsLoading(false)
    }
  }, [isMobile, address])

  const handleSuccessfulVerification = () => {
    // Persist the attestation / session result to your backend, then gate content
    console.log('Identity verified successfully!')
    setIsVerified(true)
  }

  const handleVerificationError = (error: any) => {
    console.error('Error: Failed to verify identity', error)
    setIsVerified(false)
  }

  const openSelfApp = () => {
    if (!universalLink) return
    window.open(universalLink, "_blank")
  }

  if (isLoading) {
    return (
      <div className="self-qr-loading">
        <p>Loading Self.xyz QR Code...</p>
      </div>
    )
  }

  if (isVerified) {
    return (
      <div className="self-qr-success">
        <p>✅ Identity Verified!</p>
        <button onClick={() => setIsVerified(false)}>
          Verify Again
        </button>
      </div>
    )
  }

  // Show connection prompt when no wallet is connected
  if (!isConnected && !address) {
    return (
      <div className="self-qr-container">
        <h3>Identity Verification</h3>
        <p>Connect your wallet first to verify your identity with Self.xyz</p>
        
        <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
          NOTE: Please switch the newtork to Celo Mainnet.
        </p> 
       
      </div>
    )
  }

  if (isMobile && selfApp) {
    return (
      <div className="self-mobile-verify">
        <h3>Verify Identity (Mobile)</h3>
        <button
          type="button"
          onClick={openSelfApp}
          disabled={!universalLink}
          className="self-mobile-button"
        >
          Open Self App
        </button>
      </div>
    )
  }

  return (
    <div className="self-qr-container">
      <h3>Scan QR Code to Verify Identity</h3>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
        Verifying for: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x742d...3E2E'}
        {!address && ' (demo address)'}
      </p>
      {selfApp ? (
        <SelfQRcodeWrapper
          selfApp={selfApp}
          onSuccess={handleSuccessfulVerification}
          onError={handleVerificationError}
        />
      ) : (
        <div>
          <p>Error: Unable to initialize Self.xyz QR Code</p>
        </div>
      )}
    </div>
  )
}
'use client'
import { useEffect, useState } from 'react'
import { countries, SelfQRcodeWrapper } from '@selfxyz/qrcode'
import { SelfAppBuilder } from '@selfxyz/qrcode'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { VerificationStatusDisplay, VerificationStatus } from './VerificationStatusDisplay'

interface SelfVerifyPlaygroundProps {
  isMobile?: boolean
}

export const SelfVerifyPlayground = ({ isMobile = false }: SelfVerifyPlaygroundProps) => {
  const [selfApp, setSelfApp] = useState<any | null>(null)
  const [universalLink, setUniversalLink] = useState("")
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    status: 'idle',
    message: 'Connect your wallet to begin identity verification'
  })
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  // Check if we're on Celo network (for display purposes)
  const isOnCeloNetwork = chainId === 42220 // Celo Mainnet chain ID
  const isOnBaseNetwork = chainId === 8453  // Base Mainnet chain ID

  useEffect(() => {
    if (!isConnected || !address) {
      setVerificationStatus({
        status: 'idle',
        message: 'Connect your wallet to begin identity verification'
      })
      return
    }

    // Initialize Self.xyz app regardless of network since verification is off-chain
    initializeSelfApp()
  }, [address, isConnected, isMobile])

  const initializeSelfApp = async () => {
    if (!address) return

    setVerificationStatus({
      status: 'connecting',
      message: 'Initializing Self.xyz verification...'
    })

    try {
      const appConfig: any = {
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || 'Self.xyz Playground Demo',
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || 'selfxyz-playground',
        endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT || 'https://api.staging.self.xyz'}`,
        logoBase64: 'https://i.postimg.cc/mrmVf9hm/self.png',
        userId: address,
        endpointType: 'staging_celo',
        userIdType: 'hex',
        userDefinedData: `Identity verification for ${address}`,
        disclosures: {
          minimumAge: 18,
          excludedCountries: [
            countries.CUBA, 
            countries.IRAN, 
            countries.NORTH_KOREA, 
            countries.RUSSIA
          ],
          nationality: true,
          gender: false, // Optional
          dateOfBirth: false, // Optional
        },
      }

      // Add deeplink callback for mobile
      if (isMobile) {
        appConfig.deeplinkCallback = `${window.location.origin}/verification-callback`
      }

      const app = new SelfAppBuilder(appConfig).build()
      setSelfApp(app)

      if (isMobile) {
        const baseUrl = 'https://self.xyz/app'
        const encodedApp = encodeURIComponent(JSON.stringify(app))
        const link = `${baseUrl}?data=${encodedApp}`
        setUniversalLink(link)
      }

      setVerificationStatus({
        status: 'waiting_for_scan',
        message: isMobile 
          ? 'Tap the button below to open Self app and complete verification'
          : 'Scan the QR code with your Self mobile app to verify your identity'
      })

    } catch (error) {
      console.error('Error creating SelfApp:', error)
      setVerificationStatus({
        status: 'error',
        message: 'Failed to initialize verification',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const handleSuccessfulVerification = (result?: any) => {
    console.log('Identity verified successfully!', result)
    setVerificationStatus({
      status: 'success',
      message: 'Your identity has been successfully verified!',
      details: result
    })
  }

  const handleVerificationError = (error: any) => {
    console.error('Verification failed:', error)
    setVerificationStatus({
      status: 'error',
      message: 'Identity verification failed',
      error: error?.message || 'Unknown verification error'
    })
  }

  const handleRetry = () => {
    initializeSelfApp()
  }

  const handleReset = () => {
    setSelfApp(null)
    setUniversalLink('')
    setVerificationStatus({
      status: 'idle',
      message: 'Ready to start a new verification'
    })
  }

  const handleSwitchToCelo = async () => {
    try {
      // Switch to Celo network (chain ID 42220)
      switchChain({ chainId: 42220 })
    } catch (error) {
      console.error('Failed to switch network:', error)
    }
  }

  const openSelfApp = () => {
    if (!universalLink) return
    setVerificationStatus({
      status: 'verifying',
      message: 'Opening Self app... Please complete verification in the app'
    })
    window.open(universalLink, "_blank")
  }

  return (
    <div className="self-playground-container">
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '8px' }}>Self.xyz Identity Verification</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
          Verify your identity using your passport with Self.xyz protocol
        </p>

        {/* Network Status */}
        {isConnected && (
          <div className={`network-status ${isOnCeloNetwork || isOnBaseNetwork ? 'connected' : 'warning'}`}>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Identity verification with Self.xyz works on Celo mainnet
            </div>
          </div>
        )}

        {/* Address Display */}
        {address && (
          <div className="address-display">
            <strong>Verifying for:</strong> {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        )}
      </div>

      {/* Verification Status Display */}
      {/* 
      <VerificationStatusDisplay
        status={verificationStatus}
        onRetry={handleRetry}
        onReset={handleReset}
      />  
      */}

      {/* QR Code or Mobile Button */}
      {selfApp && verificationStatus.status === 'waiting_for_scan' && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          {isMobile ? (
            <button
              type="button"
              onClick={openSelfApp}
              disabled={!universalLink}
              className="playground-button"
              style={{
                padding: '16px 32px',
                fontSize: '16px'
              }}
            >
              🚀 Open Self App
            </button>
          ) : (
            <div className="qr-code-container">
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={handleSuccessfulVerification}
                onError={handleVerificationError}
              />
              <p style={{ 
                marginTop: '16px', 
                fontSize: '12px', 
                color: '#666',
                maxWidth: '280px',
                lineHeight: '1.4'
              }}>
                📱 Don&apos;t have the Self app?<br/>
                Download it from your app store to get started
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
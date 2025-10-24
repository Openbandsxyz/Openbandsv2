'use client'
import { useEffect, useState, useMemo } from 'react'
import { countries, SelfQRcodeWrapper } from '@selfxyz/qrcode'
import { SelfAppBuilder } from '@selfxyz/qrcode'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { VerificationStatusDisplay, VerificationStatus } from './VerificationStatusDisplay'

// @dev - OpenbandsV2NationalityRegistry.sol related module
import { storeNationalityVerification } from '@/lib/blockchains/evm/smart-contracts/wagmi/nationality-registry';

interface SelfVerifyPlaygroundProps {
  isMobile?: boolean
  onVerificationSuccess?: () => void
}

export const SelfVerifyPlayground = ({ isMobile = false, onVerificationSuccess }: SelfVerifyPlaygroundProps) => {
  const [selfApp, setSelfApp] = useState<any | null>(null)
  const [appConfig, setAppConfig] = useState<any | null>(null)
  const [userId, setUserId] = useState<string>("")
  const [universalLink, setUniversalLink] = useState("")
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    status: 'idle',
    message: 'Connect your wallet to begin identity verification'
  })

  // Use useMemo to cache the array to avoid creating a new array on each render
  const excludedCountries = useMemo(() => [countries.UNITED_STATES], []);

  // @dev - Wagmi
  const { address, isConnected } = useAccount() // @dev - Get connected wallet address
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  // Check if we're on Celo network (for display purposes)
  const isOnCeloNetwork = chainId === 42220 // Celo Mainnet chain ID
  const isOnBaseNetwork = chainId === 8453  // Base Mainnet chain ID

  useEffect(() => {
    // @dev - Set a user ID, which is the connected wallet address
    setUserId(address || "");

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
    console.log('🔄 initializeSelfApp called', { address, isMobile });
    if (!address) {
      console.log('❌ No address, returning');
      return;
    }

    setVerificationStatus({
      status: 'connecting',
      message: 'Initializing Self.xyz verification...'
    })

    // @dev - Set a fixed user ID for testing
    setUserId(address);
    console.log('✅ UserId set:', address);

    try {
      // const appConfig = {
      //   version: 2,
      //   appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "OpenBands v2",
      //   scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "openbands-v2",
      //   //scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "self-workshop",
      //   endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}`, // @dev - The ProofOfHumanity contract address
      //   logoBase64:
      //     "https://i.postimg.cc/mrmVf9hm/self.png", // url of a png image, base64 is accepted but not recommended
      //   userId: address,
      //   endpointType: "staging_celo",
      //   userIdType: "hex", // use 'hex' for ethereum address or 'uuid' for uuidv4
      //   userDefinedData: "Hello Eth Delhi!!!",
      //   disclosures: {
      //   // what you want to verify from users' identity
      //     minimumAge: 18,
      //     // ofac: true,
      //     excludedCountries: excludedCountries,
      //     // what you want users to reveal
      //     // name: false,
      //     // issuing_state: true,
      //     // nationality: true,
      //     // date_of_birth: true,
      //     // passport_number: false,
      //     // gender: true,
      //     // expiry_date: false,
      //   }
      // }

      // @dev - Contract Verification Mode Configuration (on-chain verification via Hub)
      // Self.xyz SDK sends proof to your contract, which calls Hub for verification
      // See: https://docs.self.xyz/frontend-integration/qrcode-sdk
      const appConfig: Record<string, unknown> = {
        version: 2,
        appName: "OpenBands v2",
        scope: "openbands-v2",
        // endpoint = YOUR contract address (lowercase!)
        endpoint: (process.env.NEXT_PUBLIC_NATIONALITY_REGISTRY_CONTRACT_ADDRESS || "0xC64C921399b8dea7B4bAA438de3518d04023Ae97").toLowerCase(),
        endpointType: "celo", // "celo" for mainnet, "staging_celo" for testnet
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
        userId: address,
        userIdType: "hex",
        userDefinedData: "Verification for the OpenBands v2 app",
        disclosures: {
          minimumAge: 18,
          excludedCountries: excludedCountries,
          nationality: true,
        }
      }
      setAppConfig(appConfig);


      // Add deeplink callback for mobile
      if (isMobile) {
        appConfig.deeplinkCallback = `${window.location.origin}/verification-callback`
        console.log(`appConfig.deeplinkCallback: ${appConfig.deeplinkCallback}`)
      }

      const app = new SelfAppBuilder(appConfig).build()
      console.log('✅ SelfApp built:', app);
      setSelfApp(app)

      if (isMobile) {
        const baseUrl = 'https://self.xyz/app'
        const encodedApp = encodeURIComponent(JSON.stringify(app))
        const link = `${baseUrl}?data=${encodedApp}`
        setUniversalLink(link)
        console.log('📱 Mobile link generated:', link);
      }

      console.log('✅ Setting status to waiting_for_scan');
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

  const handleSuccessfulVerification = async(verificationResult?: any) => { // @dev - This function would be called - once the "onSuccess" callback from the <SelfQRcodeWrapper> component is triggered
    console.log('✅ Identity verified successfully!')
    console.log('📦 Verification result:', verificationResult)

    // @dev - In Hub mode, nationality verification happens AUTOMATICALLY on-chain!
    // The Self.xyz Hub has already:
    // 1. Verified the ZK proof cryptographically
    // 2. Extracted the nationality from public outputs
    // 3. Called our contract's customVerificationHook()
    // 4. Stored the nationality on-chain
    
    console.log('🎯 Nationality has been verified and stored on-chain by Self.xyz Hub');
    console.log('📱 Check "My Badges" page to see your nationality badge');

    setVerificationStatus({
      status: 'success',
      message: 'Your identity has been verified on-chain! Check "My Badges" to see your nationality badge.'
    })

    // @dev - Close the modal after successful verification
    if (onVerificationSuccess) {
      setTimeout(() => {
        onVerificationSuccess();
      }, 2000);
    }
  }

  const handleVerificationError = (error: Error | unknown) => {
    console.error('Verification failed:', error)
    setVerificationStatus({
      status: 'error',
      message: 'Identity verification failed',
      error: error instanceof Error ? error.message : 'Unknown verification error'
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
              Identity verification with Self.xyz works on Celo testnet
            </div>
          </div>
        )}

        {/* Address Display */}
        {address && (
          <div className="address-display">
            <strong>User ID to be verified:</strong> {address.slice(0, 6)}...{address.slice(-4)}
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

      {/* Debug info */}
      {console.log('🔍 QR Code render check:', { 
        selfApp: !!selfApp, 
        status: verificationStatus.status,
        shouldShow: selfApp && verificationStatus.status === 'waiting_for_scan'
      })}

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
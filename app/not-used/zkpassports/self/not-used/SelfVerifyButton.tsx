'use client'
import { useEffect, useState, useMemo } from 'react'
import { countries, SelfQRcodeWrapper, SelfApp } from '@selfxyz/qrcode'
import { SelfAppBuilder } from '@selfxyz/qrcode'
import { useAccount } from 'wagmi'

export const SelfVerifyButton = () => {
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const { address, isConnected } = useAccount()

  // Use useMemo to cache the array to avoid creating a new array on each render
  const excludedCountries = useMemo(() => [countries.UNITED_STATES], []);

  useEffect(() => {
    // Use the connected wallet address if available, otherwise use a demo address
    const userId = address || '0x742d35Cc6634C0532925a3b8D6Ac6464688C3E2E'
    
    try {
      // const app = new SelfAppBuilder({
      //   // Contract integration settings
      //   //endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT || 'https://api.self.xyz'}`,
      //   endpoint: `${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'https://api.self.xyz'}`,
      //   endpointType: 'staging_celo', // Use "celo" for mainnet
      //   userIdType: 'hex',            // For wallet addresses
      //   version: 2,                   // Always use V2

      //   // App details
      //   appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || 'Self.xyz QR Demo',
      //   scope: process.env.NEXT_PUBLIC_SELF_SCOPE || 'selfxyz-demo',
      //   userDefinedData: 'Identity verification via Self.xyz QR Code',
      //   logoBase64: 'https://i.postimg.cc/mrmVf9hm/self.png',
      //   userId,
      //   disclosures: {
      //     // What you want to verify from the user's identity
      //     minimumAge: 18,
      //     excludedCountries: [countries.CUBA, countries.IRAN, countries.NORTH_KOREA, countries.RUSSIA],
      //     // What you want users to disclose
      //     nationality: true,
      //     gender: true,
      //   },
      // }).build()

      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Self Workshop",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "self-workshop",
        endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}`,
        logoBase64:
          "https://i.postimg.cc/mrmVf9hm/self.png", // url of a png image, base64 is accepted but not recommended
        userId: "0x652579C23f87CE1F36676804BFdc40F99c5A9009",
        //userId: userId,
        endpointType: "staging_celo",
        userIdType: "hex", // use 'hex' for ethereum address or 'uuid' for uuidv4
        userDefinedData: "Hello Eth Delhi!!!",
        disclosures: {
        // what you want to verify from users' identity
          minimumAge: 18,
          // ofac: true,
          excludedCountries: excludedCountries,
          // what you want users to reveal
          // name: false,
          // issuing_state: true,
          // nationality: true,
          // date_of_birth: true,
          // passport_number: false,
          // gender: true,
          // expiry_date: false,
        }
      }).build();

      setSelfApp(app)
      setIsLoading(false)
    } catch (error) {
      console.error('Error creating SelfApp:', error)
      setIsLoading(false)
    }
  }, [address])

  const handleSuccessfulVerification = () => {
    // Persist the attestation / session result to your backend, then gate content
    console.log('Identity verified successfully!')
    setIsVerified(true)
  }

  const handleVerificationError = (error: { error_code?: string; reason?: string }) => {
    console.error('Error: Failed to verify identity', error)
    setIsVerified(false)
  }

  if (isLoading) {
    return (
      <div className="self-verify-loading">
        <p>Loading Self.xyz verification...</p>
      </div>
    )
  }

  if (isVerified) {
    return (
      <div className="self-verify-success">
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
      <div className="self-verify-container">
        <h3>Identity Verification</h3>
        <p>Connect your wallet first to verify your identity with Self.xyz</p>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
          Using demo address for testing: 0x742d...3E2E
        </p>
      </div>
    )
  }

  return (
    <div className="self-verify-container">
      <h3>Verify Your Identity with Self.xyz</h3>
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
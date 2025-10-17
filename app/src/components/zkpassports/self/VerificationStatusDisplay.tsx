'use client'
import { useState, useEffect } from 'react'

export interface VerificationStatus {
  status: 'idle' | 'connecting' | 'waiting_for_scan' | 'verifying' | 'success' | 'error'
  message: string
  details?: any
  error?: string
}

interface VerificationStatusDisplayProps {
  status: VerificationStatus
  onRetry?: () => void
  onReset?: () => void
}

export const VerificationStatusDisplay = ({ 
  status, 
  onRetry, 
  onReset 
}: VerificationStatusDisplayProps) => {
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (status.status === 'connecting' || status.status === 'waiting_for_scan' || status.status === 'verifying') {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.')
      }, 500)
      return () => clearInterval(interval)
    }
  }, [status.status])

  const getStatusIcon = () => {
    switch (status.status) {
      case 'connecting':
        return '🔗'
      case 'waiting_for_scan':
        return '📱'
      case 'verifying':
        return '🔍'
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '🔒'
    }
  }

  const getStatusColor = () => {
    switch (status.status) {
      case 'success':
        return '#28a745'
      case 'error':
        return '#dc3545'
      case 'connecting':
      case 'waiting_for_scan':
      case 'verifying':
        return '#007bff'
      default:
        return '#6c757d'
    }
  }

  return (
    <div className="verification-status" style={{ 
      padding: '20px', 
      textAlign: 'center',
      border: `2px solid ${getStatusColor()}`,
      borderRadius: '12px',
      backgroundColor: `${getStatusColor()}10`,
      margin: '16px 0'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>
        {getStatusIcon()}
      </div>
      
      <h3 style={{ color: getStatusColor(), marginBottom: '8px' }}>
        {status.status === 'idle' && 'Ready to Verify'}
        {status.status === 'connecting' && `Connecting${dots}`}
        {status.status === 'waiting_for_scan' && `Waiting for Scan${dots}`}
        {status.status === 'verifying' && `Verifying${dots}`}
        {status.status === 'success' && 'Verification Successful!'}
        {status.status === 'error' && 'Verification Failed'}
      </h3>

      <p style={{ color: '#666', marginBottom: '16px', fontSize: '14px' }}>
        {status.message}
      </p>

      {status.error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '8px 12px', 
          borderRadius: '4px', 
          margin: '8px 0',
          fontSize: '12px'
        }}>
          Error: {status.error}
        </div>
      )}

      {status.details && status.status === 'success' && (
        <div style={{ 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          padding: '12px', 
          borderRadius: '8px', 
          margin: '12px 0',
          fontSize: '12px',
          textAlign: 'left'
        }}>
          <strong>Verification Details:</strong>
          <pre style={{ margin: '8px 0 0 0', fontSize: '11px', overflow: 'auto' }}>
            {JSON.stringify(status.details, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
        {status.status === 'error' && onRetry && (
          <button 
            onClick={onRetry}
            className="playground-button"
            style={{ padding: '8px 16px' }}
          >
            Try Again
          </button>
        )}
        
        {(status.status === 'success' || status.status === 'error') && onReset && (
          <button 
            onClick={onReset}
            className="playground-button"
            style={{ 
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)'
            }}
          >
            Start New Verification
          </button>
        )}
      </div>
    </div>
  )
}
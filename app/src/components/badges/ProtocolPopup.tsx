import { useState } from 'react';

type ProtocolType = 'google' | 'self' | 'worldid' | null;

interface Protocol {
  id: ProtocolType;
  label: string;
  icon: 'google' | 'self' | 'worldid';
  disabled?: boolean;
  forAttributes: (string | null)[];
}

interface ProtocolPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (protocol: ProtocolType) => void;
  availableProtocols: Protocol[];
}

export default function ProtocolPopup({ isOpen, onClose, onSelect, availableProtocols }: ProtocolPopupProps) {
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolType>(null);

  const handleSelect = (protocol: ProtocolType) => {
    setSelectedProtocol(protocol);
    onSelect(protocol);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Choose Verification Method</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-sm text-gray-600">
            Select how you want to verify your information:
          </p>
          
          <div className="space-y-2">
            {availableProtocols.map((protocol) => (
              <button
                key={protocol.id}
                onClick={() => handleSelect(protocol.id)}
                disabled={protocol.disabled}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  protocol.disabled
                    ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span className="font-medium">{protocol.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

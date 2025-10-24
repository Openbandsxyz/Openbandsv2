import { SelfQRCodeVerificationPanel } from '../zkpassports/self/SelfQRCodeVerificationPanel';

type AttributeType = 'age' | 'email' | 'nationality' | null;

interface SelfPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedAttribute: AttributeType;
}

export default function SelfPopup({ isOpen, onClose, onSuccess, selectedAttribute }: SelfPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <SelfQRCodeVerificationPanel
          selectedAttribute={selectedAttribute}
          isMobile={false}
          onClose={onSuccess}
        />
      </div>
    </div>
  );
}


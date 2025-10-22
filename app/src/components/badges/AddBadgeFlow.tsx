import { useState } from 'react';
import AttributeSelection from "./steps/AttributeSelection";
import ProtocolPopup from "./ProtocolPopup";
import EmailPopup from "./EmailPopup";

type AttributeType = 'age' | 'email' | 'nationality' | null;
type ProtocolType = 'google' | 'self' | 'worldid' | null;

interface Attribute {
  id: AttributeType;
  label: string;
  icon: 'contact' | 'mail' | 'earth';
}

interface Protocol {
  id: ProtocolType;
  label: string;
  icon: 'google' | 'self' | 'worldid';
  disabled?: boolean;
  forAttributes: AttributeType[];
}

interface AddBadgeFlowProps {
  onClose: () => void;
  onCreateBadge: (attribute: AttributeType, protocol: ProtocolType) => void;
}

const attributes: Attribute[] = [
  { id: 'nationality', label: 'Nationality', icon: 'earth' },
  { id: 'age', label: 'Age (18+)', icon: 'contact' },
  { id: 'email', label: 'Company Email', icon: 'mail' }
];

const protocols: Protocol[] = [
  { id: 'google', label: 'Google Sign in', icon: 'google', forAttributes: ['email'] },
  { id: 'self', label: 'Self Protocol', icon: 'self', forAttributes: ['age', 'nationality'] },
  { id: 'worldid', label: 'WorldID', icon: 'worldid', forAttributes: ['age', 'nationality'] }
];

export default function AddBadgeFlow({ onClose, onCreateBadge }: AddBadgeFlowProps) {
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeType>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolType>(null);
  const [showProtocolPopup, setShowProtocolPopup] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);

  const handleAttributeSelect = (attribute: AttributeType) => {
    setSelectedAttribute(attribute);
    
    if (attribute === 'email') {
      // For email, show email popup
      setSelectedProtocol('google');
      setShowEmailPopup(true);
    } else {
      // For nationality and age, show protocol popup
      setShowProtocolPopup(true);
    }
  };

  const handleProtocolSelect = (protocol: ProtocolType) => {
    setSelectedProtocol(protocol);
    setShowProtocolPopup(false);
    // No further action - just close the popup
  };

  const handleEmailSuccess = () => {
    setShowEmailPopup(false);
    // Create the badge
    if (selectedAttribute && selectedProtocol) {
      onCreateBadge(selectedAttribute, selectedProtocol);
    }
    onClose();
  };

  // Filter protocols based on selected attribute
  const availableProtocols = protocols.filter(protocol => 
    selectedAttribute && protocol.forAttributes.includes(selectedAttribute)
  );

  return (
    <div className="relative size-full">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start pb-[24px] pl-[24px] pr-[24px] pt-[24px] relative size-full">
          {/* Main Content */}
          <div className="content-stretch flex flex-col gap-[40px] items-center justify-center relative shrink-0 w-full">
            <div className="box-border content-stretch flex flex-col gap-[40px] items-end pb-0 pt-[24px] px-0 relative shrink-0 w-full">
              {/* Header Section */}
              <div className="content-stretch flex flex-col gap-[24px] items-end relative shrink-0 w-full">
                {/* Title and Description */}
                <div className="content-stretch flex gap-[112px] items-start relative shrink-0 w-full">
                  <div className="basis-0 content-stretch flex gap-[8px] grow items-start min-h-px min-w-px relative shrink-0">
                    <div className="basis-0 content-stretch flex flex-col gap-[8px] grow items-start min-h-px min-w-px relative shrink-0 w-full">
                      <div className="content-stretch flex flex-col gap-[24px] items-start justify-center max-w-[1280px] relative shrink-0 w-full">
                        <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start justify-center min-h-px min-w-px relative shrink-0 w-full">
                          <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[36px] not-italic relative shrink-0 text-[30px] text-nowrap text-zinc-900 whitespace-pre">Add New Badge</p>
                          <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-zinc-500 w-full">
                            Add new badges to your profile, verify and use them as part of your identity securely. Your badges help build trust and credibility within the community.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="content-stretch flex flex-col gap-[40px] items-start relative shrink-0 w-full">
                {/* Always show Attribute Selection */}
                <AttributeSelection
                  attributes={attributes}
                  selectedAttribute={selectedAttribute}
                  onSelect={handleAttributeSelect}
                />
              </div>

              {/* Navigation Buttons */}
              <div className="content-stretch flex gap-[14px] items-start justify-end relative shrink-0 w-full">
                {/* Back Button */}
                <button
                  onClick={onClose}
                  className="bg-white box-border content-stretch flex gap-[8px] h-[32px] items-center justify-center px-[12px] py-[8px] relative rounded-[6px] shrink-0 hover:bg-zinc-50 transition-colors"
                >
                  <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[6px]" />
                  <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-900">
                    <p className="leading-[16px] whitespace-pre">Back</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Protocol Selection Popup */}
      <ProtocolPopup
        isOpen={showProtocolPopup}
        onClose={() => setShowProtocolPopup(false)}
        onSelect={handleProtocolSelect}
        availableProtocols={availableProtocols}
      />
      
      {/* Email Verification Popup */}
      <EmailPopup
        isOpen={showEmailPopup}
        onClose={() => setShowEmailPopup(false)}
        onSuccess={handleEmailSuccess}
      />
    </div>
  );
}

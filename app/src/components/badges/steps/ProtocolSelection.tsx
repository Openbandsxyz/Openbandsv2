import svgPathsProtocol from "../../imports/svg-8n02an1ezp";

type ProtocolType = 'google' | 'self' | 'worldid' | null;

interface Protocol {
  id: ProtocolType;
  label: string;
  icon: 'google' | 'self' | 'worldid';
  disabled?: boolean;
  forAttributes: (string | null)[];
}

interface ProtocolSelectionProps {
  protocols: Protocol[];
  selectedProtocol: ProtocolType;
  onSelect: (id: ProtocolType) => void;
}

export default function ProtocolSelection({ protocols, selectedProtocol, onSelect }: ProtocolSelectionProps) {
  return (
    <div className="content-stretch flex flex-col gap-[56px] items-center relative shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[14px] items-center relative shrink-0 w-full">
        <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[14px] text-zinc-900 w-full">Select a Protocol to verify this attribute</p>
        
        {/* Protocol Buttons Grid */}
        <div className="content-center flex flex-wrap gap-[14px] items-center relative shrink-0 w-full">
          {protocols.map((protocol) => (
            <ProtocolButton
              key={protocol.id}
              protocol={protocol}
              isSelected={selectedProtocol === protocol.id}
              onClick={() => !protocol.disabled && onSelect(protocol.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Protocol Button Component
function ProtocolButton({ protocol, isSelected, onClick }: {
  protocol: Protocol;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={protocol.disabled}
      className={`basis-0 grow min-h-px min-w-px relative rounded-[6px] shrink-0 transition-colors ${
        protocol.disabled 
          ? 'bg-neutral-50 opacity-50 cursor-not-allowed border border-zinc-200'
          : isSelected 
            ? 'bg-gray-50 border border-gray-800' 
            : 'bg-white hover:bg-zinc-50 border border-zinc-200'
      }`}
    >
      <div aria-hidden="true" className={`absolute border-solid inset-0 pointer-events-none rounded-[6px] ${
        protocol.disabled 
          ? 'border border-zinc-200'
          : isSelected 
            ? 'border border-gray-800' 
            : 'border border-zinc-200'
      }`} />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-center justify-center px-[12px] py-[20px] relative w-full">
          <div className="content-stretch flex gap-[4px] items-center justify-center relative shrink-0">
            <ProtocolIcon icon={protocol.icon} />
            <p className={`font-['Inter:Medium',_sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-nowrap whitespace-pre ${
              isSelected ? 'text-gray-800' : 'text-zinc-900'
            }`}>
              {protocol.label}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

// Protocol Icon Component
function ProtocolIcon({ icon }: { icon: string }) {
  if (icon === 'google') {
    return (
      <div className="relative shrink-0 size-[14px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
          <g clipPath="url(#clip0_google)">
            <path d={svgPathsProtocol.pb3a1700} fill="#4280EF" />
            <path d={svgPathsProtocol.p30f11200} fill="#34A853" />
            <path d={svgPathsProtocol.p3b4a8700} fill="#FBBC05" />
            <path d={svgPathsProtocol.p2889b370} fill="#EA4335" />
          </g>
          <defs>
            <clipPath id="clip0_google">
              <rect fill="white" height="14" width="14" />
            </clipPath>
          </defs>
        </svg>
      </div>
    );
  }
  
  if (icon === 'self') {
    return (
      <div className="relative shrink-0 size-[14px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
          <path d="M7 7L7 7" stroke="#18181B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        </svg>
      </div>
    );
  }
  
  if (icon === 'worldid') {
    return (
      <div className="relative shrink-0 size-[14px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
          <path d="M7 7L7 7" stroke="#18181B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        </svg>
      </div>
    );
  }
  
  return null;
}

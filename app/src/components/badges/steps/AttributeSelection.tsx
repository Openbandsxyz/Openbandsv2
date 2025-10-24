import addBadgeSvgPaths from "../../imports/svg-jmqvhq0q0e";

type AttributeType = 'age' | 'email' | 'nationality' | null;

interface Attribute {
  id: AttributeType;
  label: string;
  icon: 'contact' | 'mail' | 'earth';
}

interface AttributeSelectionProps {
  attributes: Attribute[];
  selectedAttribute: AttributeType;
  onSelect: (id: AttributeType) => void;
}

export default function AttributeSelection({ attributes, selectedAttribute, onSelect }: AttributeSelectionProps) {
  return (
    <div className="content-stretch flex flex-col gap-[56px] items-center relative shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[14px] items-center relative shrink-0 w-full">
        <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[14px] text-zinc-900 w-full">Select the Attribute you want to verify</p>
        
        {/* Attribute Buttons Grid */}
        <div className="content-center flex flex-wrap gap-[14px] items-center relative shrink-0 w-full">
          {attributes.map((attribute) => (
            <AttributeButton
              key={attribute.id}
              attribute={attribute}
              isSelected={selectedAttribute === attribute.id}
              onClick={() => onSelect(attribute.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Attribute Button Component
function AttributeButton({ attribute, isSelected, onClick }: { 
  attribute: Attribute; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`box-border content-stretch flex gap-[8px] items-center justify-center p-[8px] relative rounded-[6px] shrink-0 w-[206px] transition-colors ${
        isSelected ? 'bg-gray-50 border border-gray-800' : 'bg-white hover:bg-zinc-50 border border-zinc-200'
      }`}
    >
      <div aria-hidden="true" className={`absolute border-solid inset-0 pointer-events-none rounded-[6px] ${
        isSelected ? 'border border-gray-800' : 'border border-zinc-200'
      }`} />
      <IconWrapper icon={attribute.icon} />
      <p className={`font-['Inter:Medium',_sans-serif] font-medium leading-none not-italic relative shrink-0 text-[14px] w-[142px] ${
        isSelected ? 'text-gray-800' : 'text-zinc-900'
      }`}>
        {attribute.label}
      </p>
    </button>
  );
}

// Icon Wrapper Component
function IconWrapper({ icon }: { icon: string }) {
  return (
    <div className="bg-white content-stretch flex items-center justify-center relative rounded-[4px] shrink-0 size-[24px]">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      {icon === 'contact' && <IconContact />}
      {icon === 'mail' && <IconMail />}
      {icon === 'earth' && <IconEarth />}
    </div>
  );
}

// Icon Components
function IconContact() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <path d={addBadgeSvgPaths.p271fe100} stroke="var(--stroke-0, #71717A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
      </svg>
    </div>
  );
}

function IconMail() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <path d={addBadgeSvgPaths.p18738a00} stroke="var(--stroke-0, #71717A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
      </svg>
    </div>
  );
}

function IconEarth() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_earth)">
          <path d={addBadgeSvgPaths.p1c8b08c0} stroke="var(--stroke-0, #71717A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        </g>
        <defs>
          <clipPath id="clip0_earth">
            <rect fill="white" height="14" width="14" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

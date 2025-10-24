import svgPaths from "../../imports/svg-2ghqtjcq8j";

interface BadgeItemProps {
  icon: string;
  text: string;
}

export default function BadgeItem({ icon, text }: BadgeItemProps) {
  return (
    <div className="content-stretch flex items-start relative rounded-[12px] shrink-0">
      <div className="bg-neutral-50 box-border content-stretch flex gap-[8px] items-center justify-center px-[10px] py-[2px] relative rounded-[12px] shrink-0">
        <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[12px]" />
        <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
          {icon === 'user' && <UserPlusIcon />}
          {icon === 'earth' && <EarthIcon />}
          {icon === 'mail' && <MailIcon />}
          <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-900 whitespace-pre">{text}</p>
        </div>
      </div>
    </div>
  );
}

// Icon Components
function UserPlusIcon() {
  return (
    <div className="relative shrink-0 size-[11px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 11">
        <g clipPath="url(#clip0_4_5135)">
          <path d={svgPaths.p14032600} stroke="var(--stroke-0, #71717A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
        </g>
        <defs>
          <clipPath id="clip0_4_5135">
            <rect fill="white" height="11" width="11" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function EarthIcon() {
  return (
    <div className="relative shrink-0 size-[11px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 11">
        <g clipPath="url(#clip0_4_5126)">
          <path d={svgPaths.p2dbf9f00} stroke="var(--stroke-0, #71717A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
        </g>
        <defs>
          <clipPath id="clip0_4_5126">
            <rect fill="white" height="11" width="11" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function MailIcon() {
  return (
    <div className="relative shrink-0 size-[11px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 11">
        <path d={svgPaths.pbc72700} stroke="var(--stroke-0, #71717A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

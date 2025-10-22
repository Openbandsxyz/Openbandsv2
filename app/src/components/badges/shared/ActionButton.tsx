import svgPaths from "../../imports/svg-2ghqtjcq8j";

interface ActionButtonProps {
  icon: string;
  text: string;
  highlighted: boolean;
  onClick: () => void;
}

export default function ActionButton({ icon, text, highlighted, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="content-stretch flex gap-[4px] items-center relative shrink-0 hover:opacity-80 transition-opacity"
      aria-label={text}
    >
      {icon === 'reverify' && (highlighted ? <RotateCcwIconHighlighted /> : <RotateCcwIcon />)}
      {icon === 'delete' && (highlighted ? <TrashIconHighlighted /> : <TrashIcon />)}
      <div className={`flex flex-col font-['Inter:${highlighted ? 'Medium' : 'Regular'}',_sans-serif] ${highlighted ? 'font-medium' : 'font-normal'} justify-center leading-[0] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[${highlighted ? '0' : '12'}px] text-nowrap text-right ${highlighted ? 'text-zinc-900' : 'text-zinc-500'}`}>
        <p className={`${highlighted ? '[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid' : ''} leading-[16px] overflow-ellipsis overflow-hidden ${highlighted ? 'text-[12px] underline' : ''} whitespace-pre`}>{text}</p>
      </div>
    </button>
  );
}

// Icon Components
function RotateCcwIcon() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <path d={svgPaths.p13923680} stroke="var(--stroke-0, #71717A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function TrashIcon() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <path d={svgPaths.p1662b200} stroke="var(--stroke-0, #71717A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function RotateCcwIconHighlighted() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <path d={svgPaths.p13923680} stroke="var(--stroke-0, #18181B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function TrashIconHighlighted() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <path d={svgPaths.p1662b200} stroke="var(--stroke-0, #18181B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

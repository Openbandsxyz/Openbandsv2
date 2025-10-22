interface TableHeaderProps {
  text: string;
}

export default function TableHeader({ text }: TableHeaderProps) {
  return (
    <div className="h-[40px] min-w-[85px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-solid border-zinc-200 inset-0 pointer-events-none" />
      <div className="flex flex-row items-center min-w-inherit size-full">
        <div className="box-border content-stretch flex h-[40px] items-center min-w-inherit px-[8px] py-0 relative w-full">
          <div className="basis-0 flex flex-col font-['Inter:Medium',_sans-serif] font-medium grow h-full justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-zinc-500">
            <p className="leading-[20px]">{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

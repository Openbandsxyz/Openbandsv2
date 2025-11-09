import TableHeader from "./shared/TableHeader";
import BadgeItem from "./shared/BadgeItem";
import ActionButton from "./shared/ActionButton";
import PlusIcon from "./shared/PlusIcon";

interface Badge {
  id: string;
  name: string;
  icon: 'user' | 'earth' | 'mail';
  verifiedAt: string;
}

interface BadgesListProps {
  badges: Badge[];
  onAddNewBadge: () => void;
  onDeleteBadge: (id: string) => void;
  onReverifyBadge: (id: string) => void;
}

export default function BadgesList({ badges, onAddNewBadge, onDeleteBadge, onReverifyBadge }: BadgesListProps) {
  return (
    <div className="relative size-full">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start pb-[24px] pt-0 relative size-full">
          {/* Main Content */}
          <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
            {/* Page Header */}
            <div className="relative shrink-0 w-full">
              <div className="flex flex-col items-center overflow-clip rounded-[inherit] size-full">
                <div className="box-border content-stretch flex flex-col gap-[24px] items-center pb-0 pl-0 pr-[24px] pt-[24px] relative w-full">
                  <div className="content-stretch flex flex-col gap-[24px] items-start max-w-[1280px] relative shrink-0 w-full">
                    {/* Title */}
                    <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full">
                      <div className="basis-0 content-stretch flex flex-col gap-[8px] grow items-start max-w-[720px] min-h-px min-w-px relative shrink-0">
                        <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[36px] not-italic relative shrink-0 text-[30px] text-zinc-900 w-full">My Badges</p>
                      </div>
                      <div className="basis-0 content-stretch flex flex-col gap-[10px] grow h-[40px] items-end min-h-px min-w-px shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
              <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
                <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-zinc-500 w-full">Manage and customize your badges here. You can manage visibility, add new badges, reverify or remove ones you no longer want.</p>
                
                {/* Card Content */}
                <div className="relative rounded-[6px] shrink-0 w-full">
                  <div className="overflow-clip rounded-[inherit] size-full">
                    <div className="box-border content-stretch flex flex-col gap-[16px] items-start p-[24px] relative w-full">
                      {/* Table */}
                      <div className="content-stretch flex flex-col gap-[6px] items-start min-w-[356px] relative shrink-0 w-full">
                        <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-full">
                          {/* Badge Column */}
                          <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-[260px]">
                            <TableHeader text="Badge" />
                            {badges.map((badge, index) => (
                              <div
                                key={badge.id}
                                className={`${index === 1 ? 'bg-zinc-100' : ''} h-[72px] min-w-[85px] relative ${index === 1 ? 'rounded-bl-[6px] rounded-tl-[6px]' : ''} shrink-0 w-full`}
                              >
                                <div aria-hidden="true" className={`absolute border-[0px_0px_1px] border-solid border-zinc-200 inset-0 pointer-events-none ${index === 1 ? 'rounded-bl-[6px] rounded-tl-[6px]' : ''}`} />
                                <div className="flex flex-row items-center min-w-inherit size-full">
                                  <div className="box-border content-stretch flex gap-[10px] h-[72px] items-center min-w-inherit p-[8px] relative w-full">
                                    <BadgeItem icon={badge.icon} text={badge.name} />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Verified Column */}
                          <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-[146px]">
                            <TableHeader text="Verified" />
                            {badges.map((badge, index) => (
                              <div
                                key={badge.id}
                                className={`${index === 1 ? 'bg-zinc-100' : ''} h-[72px] min-w-[85px] relative shrink-0 w-full`}
                              >
                                <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-solid border-zinc-200 inset-0 pointer-events-none" />
                                <div className="flex flex-row items-center min-w-inherit size-full">
                                  <div className="box-border content-stretch flex gap-[10px] h-[72px] items-center min-w-inherit p-[8px] relative w-full">
                                    <div className="basis-0 flex flex-col font-['Inter:Regular',_sans-serif] font-normal grow justify-center leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-nowrap text-zinc-900">
                                      <p className="[white-space-collapse:collapse] leading-[16px] overflow-ellipsis overflow-hidden">{badge.verifiedAt}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Actions Column */}
                          <div className="basis-0 content-stretch flex flex-col grow items-end min-h-px min-w-px overflow-clip relative shrink-0">
                            <TableHeader text="" />
                            {badges.map((badge, index) => (
                              <div
                                key={badge.id}
                                className={`${index === 1 ? 'bg-zinc-100' : ''} h-[72px] min-w-[85px] relative ${index === 1 ? 'rounded-br-[6px] rounded-tr-[6px]' : ''} shrink-0 w-full`}
                              >
                                <div aria-hidden="true" className={`absolute border-[0px_0px_1px] border-solid border-zinc-200 inset-0 pointer-events-none ${index === 1 ? 'rounded-br-[6px] rounded-tr-[6px]' : ''}`} />
                                <div className="flex flex-row items-center justify-end min-w-inherit size-full">
                                  <div className="box-border content-stretch flex gap-[24px] h-[72px] items-center justify-end min-w-inherit p-[8px] relative w-full">
                                    <ActionButton
                                      icon="reverify"
                                      text="Reverify"
                                      highlighted={index === 1}
                                      onClick={() => onReverifyBadge(badge.id)}
                                    />
                                    <ActionButton
                                      icon="delete"
                                      text="Delete"
                                      highlighted={index === 1}
                                      onClick={() => onDeleteBadge(badge.id)}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Add New Badge Button */}
                      <button
                        onClick={onAddNewBadge}
                        className="bg-zinc-900 box-border content-stretch flex gap-[8px] h-[32px] items-center justify-center px-[12px] py-[8px] relative rounded-[6px] shrink-0 hover:bg-zinc-800 transition-colors"
                      >
                        <PlusIcon />
                        <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-neutral-50 text-nowrap">
                          <p className="leading-[16px] whitespace-pre">Add new badge</p>
                        </div>
                      </button>
                    </div>
                  </div>
                  <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[6px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

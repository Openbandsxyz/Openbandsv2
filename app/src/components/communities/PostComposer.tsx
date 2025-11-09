/**
 * OpenBands v2 - Post Composer Component
 * 
 * Allows community members to create posts.
 */

'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

interface PostComposerProps {
  communityId: string;
  isMember: boolean;
  onPostCreated: () => void;
  defaultOpen?: boolean; // If true, show form directly instead of button
  onCancel?: () => void; // Optional callback when user cancels
}

const MAX_TITLE_LENGTH = 200;


export function PostComposer({ communityId, isMember, onPostCreated, defaultOpen = false, onCancel }: PostComposerProps) {
  const { address } = useAccount();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(defaultOpen);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !isMember) return;
    
    setIsPosting(true);
    setError(null);
    
    try {
      console.log(`[Post Composer] Creating post in ${communityId}...`);
      
      const response = await fetch(`/api/communities/${communityId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          title: title.trim() || undefined,
          content: content.trim(),
          anonymousId: `Anon-${address.slice(2, 8)}`,
        }),
      });
      
      const result = await response.json();
      console.log('[Post Composer] API response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create post');
      }
      
      // Success! Reset form and notify parent
      setTitle('');
      setContent('');
      setShowComposer(false);
      onPostCreated();
    } catch (err) {
      console.error('[Post Composer] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };
  
  if (!address) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <p className="text-sm text-gray-600">Connect your wallet to post</p>
      </div>
    );
  }
  
  if (!isMember) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
        <p className="text-sm text-yellow-700">Join this community to create posts</p>
      </div>
    );
  }
  
  if (!showComposer) {
    return (
      <button
        onClick={() => setShowComposer(true)}
        className="w-full p-4 bg-white border border-gray-200 rounded-lg text-left hover:border-blue-500 hover:shadow-sm transition-all"
      >
        <p className="text-gray-500 text-sm">Share something with the community...</p>
      </button>
    );
  }
  
  return (
    <div className="content-stretch flex flex-col items-start justify-between relative size-full p-8 max-w-3xl w-full">
      <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
        {/* Header */}
        <div className="relative shrink-0 w-full">
          <div className="flex flex-col items-center overflow-clip rounded-[inherit] size-full">
            <div className="box-border content-stretch flex flex-col gap-[24px] items-center pl-0 pr-[24px] py-0 relative w-full">
              <div className="content-stretch flex flex-col gap-[24px] items-start w-full max-w-full relative shrink-0">
                <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full">
                  <div className="basis-0 content-stretch flex flex-col gap-[8px] grow items-start max-w-[720px] min-h-px min-w-px relative shrink-0">
                    <p className="font-['Inter:Bold',sans-serif] font-bold leading-[36px] not-italic relative shrink-0 text-[30px] text-zinc-900 w-full">New post</p>
                  </div>
                  <div className="basis-0 content-stretch flex flex-col gap-[10px] grow h-[40px] items-end min-h-px min-w-px shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="content-stretch flex flex-col gap-[36px] items-start relative shrink-0 w-full">
          <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
              {/* Title Input */}
              <div className="content-stretch flex flex-col gap-[8px] items-end justify-center relative shrink-0 w-full">
                <div className="content-stretch flex flex-col gap-[8px] items-end relative shrink-0 w-full">
                  <div className="bg-white h-[36px] relative rounded-[6px] shrink-0 w-full">
                    <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                      <div className="box-border content-stretch flex gap-[4px] h-[36px] items-center px-[12px] py-[4px] relative w-full">
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
                          placeholder="Title*"
                          required
                          className="[white-space-collapse:collapse] basis-0 font-['Inter:Regular',sans-serif] font-normal grow leading-[20px] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-nowrap bg-transparent border-none outline-none w-full placeholder:text-zinc-500"
                        />
                      </div>
                    </div>
                    <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[6px]" />
                  </div>
                  <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-right text-zinc-500 w-full">
                    {title.length}/{MAX_TITLE_LENGTH}
                  </p>
                </div>
              </div>

              {/* Text Editor */}
              <div className="bg-white h-[130px] relative rounded-[6px] shrink-0 w-full">
                <div className="overflow-clip rounded-[inherit] size-full">
                  <div className="box-border content-stretch flex flex-col gap-[10px] h-[130px] items-start p-[12px] relative w-full">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Have something on your mind? Write it here!"
                      required
                      minLength={1}
                      maxLength={10000}
                      className="[white-space-collapse:collapse] basis-0 font-['Inter:Regular',sans-serif] font-normal grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[14px] w-full bg-transparent border-none outline-none resize-none placeholder:text-zinc-500"
                    />
                  </div>
                </div>
                <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[6px]" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg w-full">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Footer - Post Button */}
          <div className="content-stretch flex items-center justify-end relative shrink-0 w-full mt-8">
            <div className="flex gap-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={() => {
                    setShowComposer(false);
                    setTitle('');
                    setContent('');
                    setError(null);
                    onCancel();
                  }}
                  disabled={isPosting}
                  className="bg-white box-border content-stretch flex gap-[8px] h-[36px] items-center justify-center px-[16px] py-[8px] relative rounded-[6px] border border-zinc-200 shrink-0 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-zinc-900 text-nowrap">
                    <p className="leading-[20px] whitespace-pre">Cancel</p>
                  </div>
                </button>
              )}
              <button
                type="submit"
                disabled={isPosting || !content.trim() || !title.trim()}
                className="bg-zinc-900 box-border content-stretch flex gap-[8px] h-[36px] items-center justify-center px-[16px] py-[8px] relative rounded-[6px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] shrink-0 w-[160px] hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-50 text-nowrap">
                  <p className="leading-[20px] whitespace-pre">{isPosting ? 'Posting...' : 'Post'}</p>
                </div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

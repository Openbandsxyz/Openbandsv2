/**
 * OpenBands v2 - Post Detail Component
 * 
 * Displays a single post with comments.
 */

'use client';

import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { useAccount } from 'wagmi';

interface Post {
  id: string;
  community_id: string;
  title: string | null;
  content: string;
  author_address: string;
  author_anonymous_id: string;
  upvote_count: number;
  comment_count: number;
  created_at: string;
}

interface Comment {
  id: string;
  post_id: string;
  parent_comment_id?: string | null;
  author_address: string;
  author_anonymous_id: string;
  content: string;
  upvote_count: number;
  created_at: string;
  replies?: Comment[]; // For nested structure
}

interface PostDetailProps {
  communityId: string;
  postId: string;
  communityName?: string;
  sort?: 'newest' | 'popular';
  onSortChange?: (sort: 'newest' | 'popular') => void;
}

// Icon Components
function IconUsers() {
  return (
    <div className="overflow-clip relative shrink-0 size-[14px]">
      <div className="absolute inset-[12.5%_8.33%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 12">
          <path 
            d="M9 9.5C9.82843 9.5 10.5 8.82843 10.5 8C10.5 7.17157 9.82843 6.5 9 6.5C8.17157 6.5 7.5 7.17157 7.5 8C7.5 8.82843 8.17157 9.5 9 9.5Z M4 9.5C4.82843 9.5 5.5 8.82843 5.5 8C5.5 7.17157 4.82843 6.5 4 6.5C3.17157 6.5 2.5 7.17157 2.5 8C2.5 8.82843 3.17157 9.5 4 9.5Z M9 5.5C10.3807 5.5 11.5 4.38071 11.5 3C11.5 1.61929 10.3807 0.5 9 0.5C7.61929 0.5 6.5 1.61929 6.5 3C6.5 4.38071 7.61929 5.5 9 5.5Z M4 5.5C5.38071 5.5 6.5 4.38071 6.5 3C6.5 1.61929 5.38071 0.5 4 0.5C2.61929 0.5 1.5 1.61929 1.5 3C1.5 4.38071 2.61929 5.5 4 5.5Z" 
            stroke="rgba(59, 130, 246, 1)" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.2" 
          />
        </svg>
      </div>
    </div>
  );
}

// Two people icon (community icon) - front person and back person
function IconCommunity() {
  return (
    <div className="overflow-clip relative shrink-0 size-[14px]">
      <div className="absolute inset-[10%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
          {/* Front person - full head (circle) and shoulders (rounded arch) */}
          <circle cx="5" cy="4" r="2" stroke="rgba(59, 130, 246, 1)" strokeWidth="1.3" fill="none" />
          <path 
            d="M 3 6.5 Q 3 7.5 5 7.5 Q 7 7.5 7 8.5" 
            stroke="rgba(59, 130, 246, 1)" 
            strokeWidth="1.3" 
            strokeLinecap="round" 
            fill="none"
          />
          {/* Back person - partial head (circle) and upper shoulders (smaller rounded arch) */}
          <circle cx="9" cy="4.5" r="1.5" stroke="rgba(59, 130, 246, 1)" strokeWidth="1.3" fill="none" />
          <path 
            d="M 8 6.5 Q 8 7.2 9.5 7.2 Q 11 7.2 11 8" 
            stroke="rgba(59, 130, 246, 1)" 
            strokeWidth="1.3" 
            strokeLinecap="round" 
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}

function IconMessageSquare() {
  return (
    <div className="overflow-clip relative shrink-0 size-[16px]">
      <div className="absolute inset-[12.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
          <path 
            d="M2 2H12V10H6L2 14V2Z" 
            stroke="rgba(24, 24, 27, 1)" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.33" 
          />
        </svg>
      </div>
    </div>
  );
}

function IconReply() {
  return (
    <div className="overflow-clip relative shrink-0 size-[16px]">
      <div className="absolute bottom-1/4 left-[16.67%] right-[16.67%] top-[29.17%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 9">
          <path 
            d="M1 4.5H11M1 4.5L4.5 1M1 4.5L4.5 8" 
            stroke="rgba(24, 24, 27, 1)" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.33" 
          />
        </svg>
      </div>
    </div>
  );
}

function IconArrowUpLarge() {
  return (
    <div className="overflow-clip relative shrink-0 size-[16px]">
      <div className="absolute inset-[12.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
          <path 
            d="M7 3.5V10.5M7 3.5L3.5 7M7 3.5L10.5 7" 
            stroke="rgba(24, 24, 27, 1)" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
          />
        </svg>
      </div>
    </div>
  );
}

function IconMail({ verified = false }: { verified?: boolean }) {
  return (
    <div className="overflow-clip relative shrink-0 size-[11px]">
      <div className="absolute inset-[16.67%_8.33%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 9">
          <path 
            d="M1 1H10V8H1V1Z M1 1L5.5 4.5L10 1" 
            stroke={verified ? "rgba(42, 157, 144, 1)" : "rgba(113, 113, 122, 1)"} 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.2" 
          />
        </svg>
      </div>
    </div>
  );
}

// Recursive CommentItem component for nested comments
interface CommentItemProps {
  comment: Comment;
  depth: number;
  formatTimestamp: (date: string) => string;
  handleUpvoteComment: (commentId: string) => void;
  handleReplyClick: (commentId: string, depth?: number) => void;
  handlePostComment: (parentCommentId?: string | null) => void;
  handleCancelReply: (commentId: string) => void;
  replyingTo: string | null;
  replyTexts: Record<string, string>;
  setReplyTexts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  replyTextareaHeights: Record<string, number>;
  setReplyTextareaHeights: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  address: string | undefined;
  isPostingComment: boolean;
  isMember: boolean;
  collapsedComments: Set<string>;
  toggleCommentCollapse: (commentId: string) => void;
}

const CommentItem = memo(function CommentItem({
  comment,
  depth,
  formatTimestamp,
  handleUpvoteComment,
  handleReplyClick,
  handlePostComment,
  handleCancelReply,
  replyingTo,
  replyTexts,
  setReplyTexts,
  replyTextareaHeights,
  setReplyTextareaHeights,
  address,
  isPostingComment,
  isMember,
  collapsedComments,
  toggleCommentCollapse,
}: CommentItemProps) {
  const commentAuthorName = comment.author_anonymous_id.startsWith('Anon-') 
    ? `User${comment.author_anonymous_id.slice(-4)}` 
    : comment.author_anonymous_id;
  
  // Generate random color for avatar based on address
  const avatarColors = ['bg-purple-600', 'bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
  const avatarColor = avatarColors[parseInt(comment.author_address.slice(-2), 16) % avatarColors.length];
  
  const isReplying = replyingTo === comment.id;
  const replyText = replyTexts[comment.id] || '';
  const replyTextareaHeight = replyTextareaHeights[comment.id] || 40;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const isCollapsed = collapsedComments.has(comment.id); // Reddit-style: track collapsed state per comment
  
  // Simple 2-level structure: root comments (depth 0) and direct replies (depth 1)
  const MAX_DEPTH = 1; // Only allow 2 levels: root (0) and replies (1)
  const canReply = depth < MAX_DEPTH; // Only allow replies to root comments (depth 0)
  
  // No need for hidden replies count - we only show 2 levels
  
  // Simple 2-level visual structure
  // Level 0 (root): no indentation
  // Level 1 (reply): indented with border-left
  const borderLeftWidth = depth > 0 ? '1px' : '0px';
  const borderLeftColor = '#d0d0d0'; // Light gray
  const paddingLeft = depth > 0 ? '16px' : '0px';
  const marginLeft = depth > 0 ? '8px' : '0px';
  
  // For level 1 replies: vertical line and horizontal connector
  const verticalLineLeft = 0;
  const avatarLeft = 16; // 16px indentation for level 1
  const horizontalConnectorWidth = avatarLeft;
  
  return (
    <div 
      className="content-stretch flex flex-col items-start relative shrink-0 w-full" 
      data-name="Post comment card"
      style={{
        position: 'relative',
        paddingLeft: paddingLeft,
        marginLeft: marginLeft,
        borderLeft: `${borderLeftWidth} solid ${borderLeftColor}`,
      }}
    >
      {/* Nested comments don't need their own vertical line - they use the parent's line via borderLeft */}
      {/* The parent root comment's vertical line extends through all nested replies */}
      
      {/* Horizontal connector for level 1 replies - connects vertical line to avatar */}
      {depth === 1 && (
        <div
          style={{
            position: 'absolute',
            top: '12px', // Align with center of avatar (24px / 2 = 12px)
            left: `${verticalLineLeft}px`, // Start from the vertical line
            width: `${horizontalConnectorWidth}px`, // Extend to avatar edge
            height: '1px',
            backgroundColor: borderLeftColor,
            zIndex: 1,
          }}
        />
      )}
      
      <div className="content-stretch flex gap-[16px] items-start min-w-[85px] relative shrink-0 w-full">
        <div className="basis-0 content-stretch flex gap-[10px] grow items-start min-h-px min-w-px relative shrink-0">
          <div className={`${avatarColor} rounded-[9999px] shrink-0 size-[24px]`} data-name="Avatar" />
          <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px relative shrink-0" data-name="Text Wrapper">
            {/* Comment Header */}
            <div className="content-stretch flex flex-col gap-[8px] items-start not-italic relative shrink-0 w-full">
              <div className="content-stretch flex gap-[4px] items-center justify-center relative shrink-0 text-nowrap">
                <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-zinc-900">
                  <p className="leading-[20px] overflow-ellipsis overflow-hidden text-nowrap whitespace-pre">{commentAuthorName}</p>
                </div>
                <p className="font-['Inter:Medium',sans-serif] font-medium leading-[19px] relative shrink-0 text-[14px] text-zinc-950 whitespace-pre">·</p>
                <div className="flex flex-col font-['Inter:italic',sans-serif] justify-center leading-[0] overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-zinc-500">
                  <p className="leading-none overflow-ellipsis overflow-hidden text-nowrap whitespace-pre">{formatTimestamp(comment.created_at)}</p>
                </div>
              </div>
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] min-w-full relative shrink-0 text-[14px] text-zinc-900 w-[min-content] break-words overflow-wrap-break-word whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>

            {/* Comment Actions */}
            <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full">
              <button
                onClick={() => handleUpvoteComment(comment.id)}
                disabled={!address || !isMember}
                className="bg-white box-border content-stretch flex gap-[8px] h-[32px] items-center justify-center px-[12px] py-[8px] relative rounded-[6px] shrink-0 cursor-pointer hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                data-name="Button"
                title={!address ? 'Connect wallet to upvote' : !isMember ? 'Join community to upvote' : 'Upvote'}
              >
                <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[6px]" />
                <IconArrowUpLarge />
                <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-900">
                  <p className="leading-[16px] whitespace-pre">{comment.upvote_count || 0}</p>
                </div>
              </button>
              {/* Only show reply button on root comments (depth 0) */}
              {depth === 0 && (
                <button
                  onClick={() => handleReplyClick(comment.id, depth)}
                  disabled={!address || !isMember}
                  className="bg-white box-border content-stretch flex gap-[8px] h-[32px] items-center justify-center px-[12px] py-[8px] relative rounded-[6px] shrink-0 cursor-pointer hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  data-name="Button"
                  title={!address ? 'Connect wallet to reply' : !isMember ? 'Join community to reply' : 'Reply'}
                >
                  <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[6px]" />
                  <IconReply />
                </button>
              )}
            </div>

            {/* Reply Input */}
            {isReplying && !canReply && (
              <div className="bg-zinc-50 border border-zinc-200 relative rounded-[6px] shrink-0 w-full mt-2 p-3" data-name="Max depth message">
                <p className="text-sm text-zinc-600">
                  Only 2 levels of comments are allowed. You can only reply to root comments.
                </p>
              </div>
            )}
            {isReplying && canReply && (
              <div className="bg-white relative rounded-[6px] shrink-0 w-full mt-2" data-name="Blocks / Text Editor">
                <div className="flex flex-col justify-center overflow-clip rounded-[inherit] size-full">
                  <div className="box-border content-stretch flex flex-col gap-[10px] items-start justify-center px-[12px] py-[12px] relative w-full">
                    <textarea
                      value={replyText}
                      onChange={(e) => {
                        const newText = e.target.value;
                        setReplyTexts(prev => ({ ...prev, [comment.id]: newText }));
                        // Auto-resize textarea
                        const textarea = e.target;
                        textarea.style.height = 'auto';
                        const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 300);
                        textarea.style.height = `${newHeight}px`;
                        setReplyTextareaHeights(prev => ({ ...prev, [comment.id]: newHeight }));
                      }}
                      onFocus={(e) => {
                        const textarea = e.target;
                        textarea.style.height = 'auto';
                        const newHeight = Math.min(Math.max(textarea.scrollHeight, 60), 300);
                        textarea.style.height = `${newHeight}px`;
                        setReplyTextareaHeights(prev => ({ ...prev, [comment.id]: newHeight }));
                      }}
                      placeholder="Add your reply"
                      className="[white-space-collapse:collapse] font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-zinc-500 w-full bg-transparent border-none outline-none resize-none placeholder:text-zinc-500 overflow-y-auto"
                      style={{ 
                        minHeight: '40px',
                        maxHeight: '300px',
                        height: `${replyTextareaHeight}px`,
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          handlePostComment(comment.id);
                        }
                      }}
                    />
                    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0 w-full">
                      <button
                        onClick={() => handleCancelReply(comment.id)}
                        className="bg-white box-border content-stretch flex gap-[8px] h-[36px] items-center justify-center px-[16px] py-[8px] relative rounded-[6px] shrink-0 cursor-pointer hover:bg-zinc-50 transition-colors"
                        data-name="Button"
                      >
                        <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[6px]" />
                        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-zinc-900">
                          <p className="leading-[20px] whitespace-pre">Cancel</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handlePostComment(comment.id)}
                        disabled={!replyText.trim() || isPostingComment || !address || !isMember}
                        className="bg-zinc-900 box-border content-stretch flex gap-[8px] h-[36px] items-center justify-center px-[16px] py-[8px] relative rounded-[6px] shrink-0 cursor-pointer hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)]"
                        data-name="Button"
                        title={!address ? 'Connect wallet to reply' : !isMember ? 'Join community to reply' : 'Reply'}
                      >
                        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-neutral-50">
                          <p className="leading-[20px] whitespace-pre">{isPostingComment ? 'Posting...' : 'Reply'}</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
                <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[6px]" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Direct Replies - Only show for root comments (depth 0) */}
      {hasReplies && !isCollapsed && depth === 0 && (
        <div 
          style={{ 
            marginTop: '8px', 
            position: 'relative', 
            paddingBottom: '0px', 
            marginBottom: '0px', 
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Vertical line for root comments - extends from avatar down through all replies */}
          {hasReplies && (
            <div
              style={{
                position: 'absolute',
                left: '0px', // Position at the start (no offset to prevent cutoff)
                top: '-12px', // Start from avatar center (negative to go up to parent's avatar)
                bottom: '0px', // Extend to bottom of container
                width: '1px',
                backgroundColor: borderLeftColor,
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />
          )}
          {/* Render direct replies (level 1 only) */}
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={1} // Always depth 1 for replies
              formatTimestamp={formatTimestamp}
              handleUpvoteComment={handleUpvoteComment}
              handleReplyClick={handleReplyClick}
              handlePostComment={handlePostComment}
              handleCancelReply={handleCancelReply}
              replyingTo={replyingTo}
              replyTexts={replyTexts}
              setReplyTexts={setReplyTexts}
              replyTextareaHeights={replyTextareaHeights}
              setReplyTextareaHeights={setReplyTextareaHeights}
              address={address}
              isPostingComment={isPostingComment}
              isMember={isMember}
              collapsedComments={collapsedComments}
              toggleCommentCollapse={toggleCommentCollapse}
            />
          ))}
          
          {/* Show "Collapse replies" button after replies when expanded */}
          <button
            onClick={() => toggleCommentCollapse(comment.id)}
            className="flex items-center gap-2 py-2 px-3 text-sm text-blue-600 hover:text-blue-700 cursor-pointer hover:underline transition-colors mt-2"
            aria-label="Collapse replies"
          >
            <span className="font-medium">Collapse replies</span>
          </button>
        </div>
      )}
      
      {/* Show "X more replies" when collapsed - clickable to expand */}
      {hasReplies && isCollapsed && depth === 0 && (
        <button
          onClick={() => toggleCommentCollapse(comment.id)}
          className="flex items-center gap-2 py-2 px-3 text-sm text-blue-600 hover:text-blue-700 cursor-pointer hover:underline transition-colors"
          aria-label={`Show ${comment.replies!.length} more ${comment.replies!.length === 1 ? 'reply' : 'replies'}`}
        >
          <span className="font-medium">{comment.replies!.length} more {comment.replies!.length === 1 ? 'reply' : 'replies'}</span>
        </button>
      )}
    </div>
  );
});

export function PostDetail({ communityId, postId, communityName, sort: externalSort, onSortChange }: PostDetailProps) {
  const { address } = useAccount();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [commentText, setCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isCommentInputFocused, setIsCommentInputFocused] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState<number>(40); // Initial height in pixels
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // ID of comment being replied to
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({}); // Store reply text for each comment
  const [replyTextareaHeights, setReplyTextareaHeights] = useState<Record<string, number>>({}); // Store textarea heights
  const [collapsedComments, setCollapsedComments] = useState<Set<string>>(new Set()); // Track collapsed comments

  // Toggle collapse/expand for root comments with replies
  const toggleCommentCollapse = (commentId: string) => {
    setCollapsedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId); // Expand: remove from collapsed set
      } else {
        newSet.add(commentId); // Collapse: add to collapsed set
      }
      return newSet;
    });
  };

  useEffect(() => {
    fetchPost();
  }, [communityId, postId, externalSort, address]); // Re-fetch when sort or address changes

  // Debug: Log state changes
  useEffect(() => {
    console.log('[Post Detail] State changed - post:', post);
    console.log('[Post Detail] State changed - comments:', comments);
    console.log('[Post Detail] State changed - comments length:', comments?.length || 0);
  }, [post, comments]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add cache-busting parameter and sort parameter
      const cacheBuster = Date.now();
      const sortParam = externalSort || 'popular';
      // Include wallet address to check membership
      const params = new URLSearchParams({
        t: cacheBuster.toString(),
        sort: sortParam,
      });
      if (address) {
        params.append('walletAddress', address);
      }
      
      const response = await fetch(`/api/communities/${communityId}/posts/${postId}?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const result = await response.json();
      
      console.log('[Post Detail] API Response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch post');
      }
      
      // Set membership status
      setIsMember(result.isMember || false);
      
      console.log('[Post Detail] Post data:', result.post);
      console.log('[Post Detail] Comments data:', result.comments);
      console.log('[Post Detail] Is member:', result.isMember);
      console.log('[Post Detail] Comments count:', result.comments?.length || 0);
      console.log('[Post Detail] Comments type:', typeof result.comments);
      console.log('[Post Detail] Comments is array:', Array.isArray(result.comments));
      
      // Ensure comments is always an array
      let commentsArray = Array.isArray(result.comments) ? result.comments : [];
      
      // Build simple 2-level comment structure: root comments and their direct replies only
      const buildCommentTree = (comments: Comment[]): Comment[] => {
        const commentMap = new Map<string, Comment>();
        const rootComments: Comment[] = [];
        
        // First pass: create map and initialize replies array
        comments.forEach(comment => {
          commentMap.set(comment.id, { ...comment, replies: [] });
        });
        
        // Second pass: build 2-level structure (root + direct replies only)
        comments.forEach(comment => {
          const commentWithReplies = commentMap.get(comment.id)!;
          if (comment.parent_comment_id) {
            // This is a reply - find its parent
            const parent = commentMap.get(comment.parent_comment_id);
            if (parent) {
              // Only add as reply if parent is a root comment (parent_comment_id is null)
              // This ensures we only have 2 levels: root and direct replies
              if (!parent.parent_comment_id) {
                if (!parent.replies) parent.replies = [];
                parent.replies.push(commentWithReplies);
              } else {
                // Parent is already a reply - ignore this comment (would be level 3+)
                console.warn('[buildCommentTree] Ignoring nested reply beyond level 2:', {
                  commentId: comment.id,
                  parentCommentId: comment.parent_comment_id,
                  content: comment.content.substring(0, 30),
                });
              }
            } else {
              // Parent not found - treat as root comment (orphaned comment)
              console.warn('[buildCommentTree] Comment has parent_comment_id but parent not found, treating as root:', {
                commentId: comment.id,
                parentCommentId: comment.parent_comment_id,
                content: comment.content.substring(0, 30),
              });
              rootComments.push(commentWithReplies);
            }
          } else {
            // Root comment (no parent)
            rootComments.push(commentWithReplies);
          }
        });
        
        // Sort root comments
        if (sortParam === 'popular') {
          rootComments.sort((a, b) => {
            const aScore = (a.upvote_count || 0);
            const bScore = (b.upvote_count || 0);
            if (bScore !== aScore) {
              return bScore - aScore;
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
        } else {
          rootComments.sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
        }
        
        // Sort direct replies by created_at (chronological order)
        rootComments.forEach(rootComment => {
          if (rootComment.replies && rootComment.replies.length > 0) {
            rootComment.replies.sort((a, b) => {
              return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            });
          }
        });
        
        return rootComments;
      };
      
      const commentTree = buildCommentTree(commentsArray);
      
      console.log('[Post Detail] Setting comments tree with root comments:', commentTree.length);
      console.log('[Post Detail] Post upvote_count:', result.post?.upvote_count);
      console.log('[Post Detail] Post comment_count:', result.post?.comment_count);
      console.log('[Post Detail] Sort param:', sortParam);
      
      // Force state update
      setPost(result.post);
      setComments(commentTree);
      
      // Log after state update (will show in next render)
      setTimeout(() => {
        console.log('[Post Detail] State after update - post:', post);
        console.log('[Post Detail] State after update - comments:', comments);
      }, 100);
    } catch (err) {
      console.error('[Post Detail] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handlePostComment = async (parentCommentId?: string | null) => {
    const textToPost = parentCommentId ? (replyTexts[parentCommentId] || '').trim() : commentText.trim();
    if (!address || !textToPost) return;
    
    setIsPostingComment(true);
    try {
      const response = await fetch(`/api/communities/${communityId}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          content: textToPost,
          anonymousId: `Anon-${address.slice(2, 8)}`,
          parentCommentId: parentCommentId || null,
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to post comment');
      }
      
      if (parentCommentId) {
        // Clear reply state
        setReplyTexts(prev => {
          const newReplies = { ...prev };
          delete newReplies[parentCommentId];
          return newReplies;
        });
        setReplyTextareaHeights(prev => {
          const newHeights = { ...prev };
          delete newHeights[parentCommentId];
          return newHeights;
        });
        setReplyingTo(null);
      } else {
        setCommentText('');
        setIsCommentInputFocused(false);
        setTextareaHeight(40); // Reset to initial height
      }
      fetchPost(); // Refresh to get new comment
    } catch (err) {
      console.error('[Post Detail] Error posting comment:', err);
      alert(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleCancelComment = () => {
    setCommentText('');
    setIsCommentInputFocused(false);
    setTextareaHeight(40); // Reset to initial height
  };

  const handleCancelReply = (commentId: string) => {
    setReplyTexts(prev => {
      const newReplies = { ...prev };
      delete newReplies[commentId];
      return newReplies;
    });
    setReplyTextareaHeights(prev => {
      const newHeights = { ...prev };
      delete newHeights[commentId];
      return newHeights;
    });
    setReplyingTo(prev => prev === commentId ? null : prev);
  };

  const handleReplyClick = (commentId: string, depth?: number) => {
    const MAX_DEPTH = 1; // Only allow 2 levels: root (0) and replies (1)
    // Check depth if provided (from CommentItem)
    if (depth !== undefined && depth >= MAX_DEPTH) {
      alert('Only 2 levels of comments are allowed. You can only reply to root comments.');
      return;
    }
    setReplyingTo(commentId);
    if (!replyTexts[commentId]) {
      setReplyTexts(prev => ({ ...prev, [commentId]: '' }));
      setReplyTextareaHeights(prev => ({ ...prev, [commentId]: 40 }));
    }
  };

  const handleUpvotePost = async () => {
    if (!address) {
      alert('Please connect your wallet to upvote');
      return;
    }
    
    if (!isMember) {
      alert('You must join this community before upvoting');
      return;
    }

    // Optimistic update: update UI immediately
    const previousCount = post?.upvote_count || 0;
    const optimisticCount = previousCount + 1;
    
    if (post) {
      setPost({ ...post, upvote_count: optimisticCount });
    }

    try {
      const response = await fetch(`/api/communities/${communityId}/posts/${postId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });

      const result = await response.json();

      if (!result.success) {
        // Revert optimistic update on error
        if (post) {
          setPost({ ...post, upvote_count: previousCount });
        }
        throw new Error(result.error || 'Failed to upvote');
      }

      // Update with server response (handles both increment and decrement)
      if (post && result.upvoteCount !== undefined) {
        setPost({ ...post, upvote_count: result.upvoteCount });
      }
    } catch (err) {
      console.error('[Post Detail] Error upvoting:', err);
      // Revert optimistic update on error
      if (post) {
        setPost({ ...post, upvote_count: previousCount });
      }
      alert(err instanceof Error ? err.message : 'Failed to upvote');
    }
  };

  const handleUpvoteComment = async (commentId: string) => {
    if (!address) {
      alert('Please connect your wallet to upvote');
      return;
    }

    // Optimistic update: find comment and update immediately
    const updateCommentUpvote = (commentList: Comment[]): Comment[] => {
      return commentList.map(comment => {
        if (comment.id === commentId) {
          const previousCount = comment.upvote_count || 0;
          return { ...comment, upvote_count: previousCount + 1 };
        }
        if (comment.replies) {
          return { ...comment, replies: updateCommentUpvote(comment.replies) };
        }
        return comment;
      });
    };

    // Store previous state for rollback
    const previousComments = comments ? JSON.parse(JSON.stringify(comments)) : null;
    
    // Optimistically update UI
    if (comments) {
      setComments(updateCommentUpvote(comments));
    }

    try {
      const response = await fetch(`/api/communities/${communityId}/posts/${postId}/comments/${commentId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });

      const result = await response.json();

      if (!result.success) {
        // Revert optimistic update on error
        if (previousComments) {
          setComments(previousComments);
        }
        throw new Error(result.error || 'Failed to upvote');
      }

      // Update with server response (handles both increment and decrement)
      if (result.upvoteCount !== undefined && comments) {
        const updateWithServerCount = (commentList: Comment[]): Comment[] => {
          return commentList.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, upvote_count: result.upvoteCount };
            }
            if (comment.replies) {
              return { ...comment, replies: updateWithServerCount(comment.replies) };
            }
            return comment;
          });
        };
        setComments(updateWithServerCount(comments));
      }
    } catch (err) {
      console.error('[Post Detail] Error upvoting comment:', err);
      // Revert optimistic update on error
      if (previousComments) {
        setComments(previousComments);
      }
      alert(err instanceof Error ? err.message : 'Failed to upvote');
    }
  };

  if (loading) {
    return (
      <div className="content-stretch flex flex-col gap-[28px] items-center relative size-full pl-6">
        {/* Skeleton loader for post */}
        <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full max-w-3xl">
          <div className="bg-white min-w-[85px] relative rounded-[6px] shrink-0 w-full animate-pulse">
            <div className="box-border content-stretch flex gap-[16px] items-start min-w-inherit p-[14px] relative w-full">
              <div className="basis-0 content-stretch flex flex-col gap-[24px] grow items-start min-h-px min-w-px relative shrink-0">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Error: {error || 'Post not found'}</p>
      </div>
    );
  }

  const authorName = post.author_anonymous_id.startsWith('Anon-') 
    ? `User${post.author_anonymous_id.slice(-4)}` 
    : post.author_anonymous_id;

  // Placeholder for author badges
  const authorBadges: Array<{ domain: string; verified: boolean }> = [];

  return (
    <div className="content-stretch flex flex-col gap-[28px] items-center relative size-full pl-6">
      {/* Post Card */}
      <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full max-w-3xl">
        <div className="bg-white min-w-[85px] relative rounded-[6px] shrink-0 w-full" data-name="Post details card">
          <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[6px]" />
          <div className="min-w-inherit size-full">
            <div className="box-border content-stretch flex gap-[16px] items-start min-w-inherit p-[14px] relative w-full">
              <div className="basis-0 content-stretch flex flex-col gap-[24px] grow items-start min-h-px min-w-px relative shrink-0">
                {/* Header: Community tag + Timestamp */}
                <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
                  {communityName && (
                    <div className="box-border content-stretch flex gap-[4px] items-center p-[2px] relative rounded-[6px] shrink-0 flex-1 min-w-0" data-name="Community tag">
                      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[6px]" />
                      <IconCommunity />
                      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[14px] text-blue-500 break-words overflow-wrap-break-word">
                        {communityName}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-col font-['Inter:italic',sans-serif] justify-center leading-[0] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-nowrap text-zinc-500">
                    <p className="leading-none overflow-ellipsis overflow-hidden whitespace-pre">{formatTimestamp(post.created_at)}</p>
                  </div>
                </div>

                {/* Author + Badges */}
                <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
                  <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full">
                    {/* Author */}
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
                      <div className="bg-green-500 rounded-[9999px] shrink-0 size-[20px]" data-name="Avatar" />
                      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-950 whitespace-pre">
                        {authorName}
                      </p>
                      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-950 whitespace-pre">·</p>
                    </div>

                    {/* Author Badges */}
                    {authorBadges.length > 0 && (
                      <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
                        {authorBadges.map((badge, idx) => (
                          <div key={idx} className="content-stretch flex items-start relative rounded-[12px] shrink-0" data-name="Badge">
                            <div className="bg-neutral-50 box-border content-stretch flex gap-[8px] items-center justify-center px-[10px] py-[2px] relative rounded-[12px] shrink-0" data-name="Badge">
                              <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[12px]" />
                              <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
                                <IconMail verified={badge.verified} />
                                <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-nowrap text-zinc-900 whitespace-pre">
                                  @{badge.domain}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full">
                    {post.title && (
                      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[36px] not-italic relative shrink-0 text-[30px] text-zinc-950 w-full break-words overflow-wrap-break-word">
                        {post.title}
                      </p>
                    )}
                  </div>

                  {/* Content */}
                  <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-zinc-900 w-full whitespace-pre-wrap break-words overflow-wrap-break-word">
                    {post.content}
                  </p>
                </div>

                {/* Actions: Upvote + Comment */}
                <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
                  {/* Upvote Button */}
                  <button
                    onClick={handleUpvotePost}
                    disabled={!address || !isMember}
                    className="bg-white box-border content-stretch flex gap-[8px] h-[36px] items-center justify-center px-[12px] py-[8px] relative rounded-[6px] shrink-0 cursor-pointer hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    data-name="Button"
                    title={!address ? 'Connect wallet to upvote' : !isMember ? 'Join community to upvote' : 'Upvote'}
                  >
                    <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[6px]" />
                    <IconArrowUpLarge />
                    <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-zinc-900">
                      <p className="leading-[20px] whitespace-pre">{post?.upvote_count ?? 0}</p>
                    </div>
                  </button>

                  {/* Comment Button */}
                  <div className="bg-white box-border content-stretch flex gap-[8px] h-[36px] items-center justify-center px-[12px] py-[8px] relative rounded-[6px] shrink-0" data-name="Button">
                    <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[6px]" />
                    <IconMessageSquare />
                    <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-zinc-900">
                      <p className="leading-[20px] whitespace-pre">{post?.comment_count ?? 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comment Input */}
        <div className="bg-white relative rounded-[6px] shrink-0 w-full" data-name="Blocks / Text Editor">
          <div className="flex flex-col justify-center overflow-clip rounded-[inherit] size-full">
            <div className="box-border content-stretch flex flex-col gap-[10px] items-start justify-center px-[12px] py-[20px] relative w-full">
              <textarea
                value={commentText}
                onChange={(e) => {
                  setCommentText(e.target.value);
                  // Auto-resize textarea
                  const textarea = e.target;
                  textarea.style.height = 'auto';
                  const newHeight = Math.min(textarea.scrollHeight, 300); // Max 300px height
                  textarea.style.height = `${newHeight}px`;
                  setTextareaHeight(newHeight);
                }}
                onFocus={(e) => {
                  setIsCommentInputFocused(true);
                  // Auto-resize on focus
                  const textarea = e.target;
                  textarea.style.height = 'auto';
                  const newHeight = Math.min(Math.max(textarea.scrollHeight, 60), 300); // Min 60px (3 lines), max 300px
                  textarea.style.height = `${newHeight}px`;
                  setTextareaHeight(newHeight);
                }}
                placeholder="Add your reply"
                className="[white-space-collapse:collapse] font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-zinc-500 w-full bg-transparent border-none outline-none resize-none placeholder:text-zinc-500 overflow-y-auto"
                style={{ 
                  minHeight: '40px',
                  maxHeight: '300px',
                  height: `${textareaHeight}px`,
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                }}
                onKeyDown={(e) => {
                  // Allow Enter for new lines, Ctrl/Cmd+Enter to submit
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handlePostComment();
                  }
                }}
              />
              {isCommentInputFocused && (
                <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0 w-full">
                  <button
                    onClick={handleCancelComment}
                    className="bg-white box-border content-stretch flex gap-[8px] h-[36px] items-center justify-center px-[16px] py-[8px] relative rounded-[6px] shrink-0 cursor-pointer hover:bg-zinc-50 transition-colors"
                    data-name="Button"
                  >
                    <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[6px]" />
                    <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-zinc-900">
                      <p className="leading-[20px] whitespace-pre">Cancel</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handlePostComment()}
                    disabled={!commentText.trim() || isPostingComment || !address || !isMember}
                    className="bg-zinc-900 box-border content-stretch flex gap-[8px] h-[36px] items-center justify-center px-[16px] py-[8px] relative rounded-[6px] shrink-0 cursor-pointer hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)]"
                    data-name="Button"
                    title={!address ? 'Connect wallet to comment' : !isMember ? 'Join community to comment' : 'Comment'}
                  >
                    <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-neutral-50">
                      <p className="leading-[20px] whitespace-pre">{isPostingComment ? 'Posting...' : 'Comment'}</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
          <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[6px]" />
        </div>

        {/* Filter Tabs - Below comment box */}
        {onSortChange && (
          <div className="backdrop-blur-sm backdrop-filter bg-zinc-100 box-border content-stretch cursor-pointer flex h-[32px] items-center max-h-[32px] p-[4px] relative rounded-[8px] shrink-0" data-name="Tabs">
            <button 
              className={`box-border content-stretch flex gap-[8px] h-full items-center justify-center overflow-visible px-[12px] py-[4px] relative rounded-[6px] shrink-0 ${externalSort === 'popular' ? 'bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)]' : ''}`}
              onClick={() => onSortChange('popular')}
              data-name="Tabs / Trigger"
            >
              <p className={`font-['Inter:Medium',sans-serif] font-medium leading-none not-italic relative shrink-0 text-[12px] text-center text-nowrap whitespace-pre ${externalSort === 'popular' ? 'text-zinc-900' : 'text-zinc-500'}`}>
                Popular
              </p>
            </button>
            <button 
              className={`box-border content-stretch flex gap-[8px] h-full items-center justify-center overflow-visible px-[12px] py-[4px] relative rounded-[6px] shrink-0 ${externalSort === 'newest' ? 'bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)]' : ''}`}
              onClick={() => onSortChange('newest')}
              data-name="Tabs / Trigger"
            >
              <p className={`font-['Inter:Medium',sans-serif] font-medium leading-none not-italic relative shrink-0 text-[12px] text-center text-nowrap whitespace-pre ${externalSort === 'newest' ? 'text-zinc-900' : 'text-zinc-500'}`}>
                Most recent
              </p>
            </button>
          </div>
        )}
      </div>

      {/* Comments List */}
      {comments && comments.length > 0 ? (
        <div className="bg-white box-border content-stretch flex flex-col gap-[24px] items-start overflow-clip px-0 py-[14px] relative rounded-[6px] shrink-0 w-full max-w-3xl" data-name="Comments card">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              depth={0}
              formatTimestamp={formatTimestamp}
              handleUpvoteComment={handleUpvoteComment}
              handleReplyClick={handleReplyClick}
              handlePostComment={handlePostComment}
              handleCancelReply={handleCancelReply}
              replyingTo={replyingTo}
              replyTexts={replyTexts}
              setReplyTexts={setReplyTexts}
              replyTextareaHeights={replyTextareaHeights}
              setReplyTextareaHeights={setReplyTextareaHeights}
              address={address}
              isPostingComment={isPostingComment}
              isMember={isMember}
              collapsedComments={collapsedComments}
              toggleCommentCollapse={toggleCommentCollapse}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white box-border content-stretch flex flex-col gap-[24px] items-start overflow-clip px-0 py-[14px] relative rounded-[6px] shrink-0 w-full max-w-3xl" data-name="Comments card">
          <p className="text-zinc-500 text-sm">No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
}


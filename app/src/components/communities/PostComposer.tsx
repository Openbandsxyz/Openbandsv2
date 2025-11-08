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
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            maxLength={255}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {title && (
            <p className="text-xs text-gray-500 mt-1">{title.length}/255 characters</p>
          )}
        </div>
        
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            required
            minLength={1}
            maxLength={10000}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{content.length}/10,000 characters</p>
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => {
              setShowComposer(false);
              setTitle('');
              setContent('');
              setError(null);
              // Notify parent to hide composer if callback provided
              onCancel?.();
            }}
            disabled={isPosting}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPosting || !content.trim()}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPosting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}


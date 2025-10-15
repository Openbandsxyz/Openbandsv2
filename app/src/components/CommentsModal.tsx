"use client";
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useComments, createComment, likeComment as likeCommentSupabase } from '@/lib/supabase';
import type { Post } from '@/lib/types';

interface CommentsModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentsModal({ post, isOpen, onClose }: CommentsModalProps) {
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { isAuthenticated, anonymousId, companyDomain } = useApp();
  const { comments, loading, error, refetch } = useComments(post.id);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isLoading || !isAuthenticated || !anonymousId) return;

    setIsLoading(true);
    try {
      await createComment(post.id, newComment.trim(), anonymousId, companyDomain);
      setNewComment('');
      await refetch({ silent: true }); // Refresh comments quietly
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!isAuthenticated || !anonymousId) return;
    
    try {
      await likeCommentSupabase(commentId, anonymousId, companyDomain);
      await refetch({ silent: true }); // Refresh comments quietly
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const timeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / 86400000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="relative w-full max-w-md max-h-[85vh] bg-white rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Close comments"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-gray-500 text-sm">Loading comments...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 text-sm">Error loading comments</p>
              <p className="text-xs text-gray-400">{error}</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No comments yet</p>
              <p className="text-xs text-gray-400">Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-xs">
                      {comment.authorAnonymousId.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">
                        Someone from {comment.companyDomain || 'their company'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {timeAgo(comment.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-900 mb-2 whitespace-pre-wrap pl-8">
                  {comment.content}
                </p>
                
                <div className="pl-8">
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className={`flex items-center space-x-1 text-xs ${
                      comment.likeCount > 0 
                        ? 'text-blue-600' 
                        : 'text-gray-500 hover:text-blue-600'
                    }`}
                  >
                    <svg className="w-3 h-3" fill={comment.likeCount > 0 ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{comment.likeCount}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        {isAuthenticated && anonymousId && (
          <div className="border-t p-4 sticky bottom-0 bg-white">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-medium text-xs">
                    {anonymousId.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Write a comment..."
                    maxLength={300}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center pl-8">
                <div className="text-xs text-gray-500">
                  {newComment.length}/300
                </div>
                <button
                  type="submit"
                  disabled={!newComment.trim() || isLoading}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Posting...' : 'Comment'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { createPost } from '@/lib/supabase';

interface PostComposerProps {
  onPosted?: () => void;
}

export function PostComposer({ onPosted }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, anonymousId, companyDomain } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading || !isAuthenticated || !anonymousId) return;

    setIsLoading(true);
    try {
      await createPost(content.trim(), anonymousId, companyDomain);
      setContent('');
      onPosted?.();
    } catch (error) {
      console.error('Error creating post:', error);
      
      // Provide user feedback for common errors
      if (error instanceof Error) {
        if (error.message.includes('supabase') || error.message.includes('Supabase')) {
          alert('Database connection failed. Please check your Supabase configuration.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          alert('Network error. Please check your connection and try again.');
        } else {
          alert('Failed to create post. Please try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !anonymousId) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-medium text-sm">
            {anonymousId.charAt(0)}
          </span>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">
            {anonymousId}
          </div>
          <div className="text-xs text-gray-500">
            Posting as {companyDomain || 'Anonymous'}
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="What's on your mind? Share with your colleagues..."
          maxLength={500}
          required
        />
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {content.length}/500
          </div>
          <button
            type="submit"
            disabled={!content.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}

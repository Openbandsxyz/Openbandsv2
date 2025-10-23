"use client";
import { useState } from 'react';
import svgPaths from "./imports/svg-nzgioea0kc";

interface NewPostPageProps {
  onClose: () => void;
  countryName: string;
}

function TitleInput() {
  const [title, setTitle] = useState('');
  const maxLength = 200;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="relative w-full">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={maxLength}
          placeholder="Title*"
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <p className="text-sm text-gray-500 text-right">
        {title.length}/{maxLength}
      </p>
    </div>
  );
}

function ContentTextarea() {
  const [content, setContent] = useState('');

  return (
    <div className="w-full">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Have something on your mind? Write it here!"
        className="w-full h-32 px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
    </div>
  );
}

function BadgesLabel() {
  return (
    <div className="flex gap-2 items-center mb-2">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 18 18">
        <path d={svgPaths.p12d72af0} stroke="#71717A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" />
      </svg>
      <p className="text-sm font-medium text-gray-600">Badges</p>
    </div>
  );
}

function BadgesSelect() {
  return (
    <div className="w-full max-w-xs">
      <select className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <option>Add Badges</option>
      </select>
    </div>
  );
}

export default function NewPostPage({ onClose, countryName }: NewPostPageProps) {
  const handlePost = () => {
    // TODO: Implement post creation logic
    console.log('Creating post for community:', countryName);
    onClose();
  };

  return (
    <div className="flex-1 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-6">
        <h1 className="text-2xl font-bold text-gray-900">New post</h1>
        <p className="text-gray-600 mt-2">
          Share your thoughts with the {countryName} community
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-3xl space-y-6">
          {/* Title Input */}
          <TitleInput />
          
          {/* Content Textarea */}
          <ContentTextarea />
          
          {/* Badges Section */}
          <div>
            <BadgesLabel />
            <BadgesSelect />
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-900 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePost}
              className="px-6 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


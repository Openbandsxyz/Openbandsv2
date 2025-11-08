/**
 * OpenBands v2 - Communities Page
 * 
 * Main page for browsing and creating communities.
 */

'use client';

import { useState } from 'react';
import { CreateCommunityButton } from '@/components/communities/CreateCommunityButton';
import { CommunityList } from '@/components/communities/CommunityList';

export default function CommunitiesPage() {
  const [attestationType, setAttestationType] = useState<'all' | 'nationality' | 'company' | 'age'>('all');
  const [sort, setSort] = useState<'newest' | 'popular' | 'active'>('newest');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Communities</h1>
              <p className="text-gray-600">
                Join badge-gated communities or create your own
              </p>
            </div>
            <CreateCommunityButton />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-2">
              <span className="text-sm text-gray-600 font-medium">Type:</span>
              <button
                onClick={() => setAttestationType('all')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  attestationType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setAttestationType('nationality')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  attestationType === 'nationality'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                🌍 Nationality
              </button>
              <button
                onClick={() => setAttestationType('company')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  attestationType === 'company'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                🏢 Company
              </button>
              <button
                onClick={() => setAttestationType('age')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  attestationType === 'age'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                🎂 Age
              </button>
            </div>
            
            <div className="flex gap-2 ml-auto">
              <span className="text-sm text-gray-600 font-medium">Sort:</span>
              <button
                onClick={() => setSort('newest')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  sort === 'newest'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setSort('popular')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  sort === 'popular'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Popular
              </button>
              <button
                onClick={() => setSort('active')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  sort === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Active
              </button>
            </div>
          </div>
        </div>
        
        {/* Community List */}
        <CommunityList attestationType={attestationType} sort={sort} />
      </div>
    </div>
  );
}


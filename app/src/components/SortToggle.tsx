"use client";

interface SortToggleProps {
  sort: 'new' | 'hot';
  onSortChange: (sort: 'new' | 'hot') => void;
}

export function SortToggle({ sort, onSortChange }: SortToggleProps) {

  return (
    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onSortChange('new')}
        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
          sort === 'new'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        New
      </button>
      <button
        onClick={() => onSortChange('hot')}
        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
          sort === 'hot'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Hot
      </button>
    </div>
  );
}

import React from 'react';

interface KeywordTagProps {
  text: string;
  isRemoved: boolean;
  onRemove: () => void;
}

export const KeywordTag: React.FC<KeywordTagProps> = ({
  text,
  isRemoved,
  onRemove
}) => {
  if (isRemoved) return null;

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
      <span className="text-sm font-medium text-gray-700">{text}</span>
      <button
        onClick={onRemove}
        className="text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Remove keyword"
      >
        ✕
      </button>
    </div>
  );
};


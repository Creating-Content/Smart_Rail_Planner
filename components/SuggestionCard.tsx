
import React from 'react';
import { LightBulbIcon } from './icons';

interface SuggestionCardProps {
  suggestion: string;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion }) => {
  return (
    <div className="bg-yellow-50 dark:bg-gray-800 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 rounded-r-lg shadow-sm">
      <div className="flex">
        <div className="flex-shrink-0">
          <LightBulbIcon className="h-6 w-6 text-yellow-400 dark:text-yellow-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700 dark:text-yellow-200">{suggestion}</p>
        </div>
      </div>
    </div>
  );
};

export default SuggestionCard;

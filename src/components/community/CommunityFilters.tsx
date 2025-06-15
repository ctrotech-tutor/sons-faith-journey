
import React from 'react';
import { Flame, TrendingUp, Clock, Check } from 'lucide-react';

interface CommunityFiltersProps {
  filter: 'recent' | 'trending' | 'popular' | 'admin';
  setFilter: (filter: 'recent' | 'trending' | 'popular' | 'admin') => void;
}

const CommunityFilters = ({ filter, setFilter }: CommunityFiltersProps) => {
  const filterTypes = [
    { key: 'trending', label: 'Trending', icon: Flame },
    { key: 'popular', label: 'Popular', icon: TrendingUp },
    { key: 'recent', label: 'Recent', icon: Clock },
    { key: 'admin', label: 'Leaders', icon: Check },
  ] as const;

  return (
    <div className="max-w-md mx-auto px-4">
      <div className="mt-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm p-1 rounded-xl flex justify-between shadow-inner border border-white/20 dark:border-white/10">
        {filterTypes.map((filterType) => (
          <button
            key={filterType.key}
            onClick={() => setFilter(filterType.key)}
            className={`flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1 ${
              filter === filterType.key
                ? 'bg-white dark:bg-gray-800 text-purple-800 dark:text-purple-200 shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-300'
            }`}
          >
            <filterType.icon className="h-3 w-3" />
            {filterType.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CommunityFilters;

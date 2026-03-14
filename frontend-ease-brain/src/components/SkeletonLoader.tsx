import React from 'react';
import { useDarkMode } from '@/context/DarkModeContext';

interface SkeletonLoaderProps {
  count?: number;
  type?: 'card' | 'chart' | 'table' | 'list';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 1, type = 'card' }) => {
  const { isDarkMode } = useDarkMode();

  const skeletonClass = `animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`;

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-teal-100'}`}
          >
            <div className={`w-14 h-14 rounded-xl mb-4 ${skeletonClass}`} />
            <div className={`h-4 rounded w-3/4 mb-4 ${skeletonClass}`} />
            <div className={`h-8 rounded w-1/2 mb-2 ${skeletonClass}`} />
            <div className={`h-3 rounded w-full ${skeletonClass}`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-teal-100'}`}>
        <div className={`h-6 rounded w-2/3 mb-4 ${skeletonClass}`} />
        <div className={`h-72 rounded mb-4 ${skeletonClass}`} />
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-teal-100'}`}>
        <div className={`h-6 rounded w-2/3 mb-4 ${skeletonClass}`} />
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, idx) => (
            <div key={idx} className="flex gap-4">
              <div className={`h-4 rounded flex-1 ${skeletonClass}`} />
              <div className={`h-4 rounded flex-1 ${skeletonClass}`} />
              <div className={`h-4 rounded flex-1 ${skeletonClass}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`rounded-lg p-4 border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-teal-100'}`}
        >
          <div className={`h-4 rounded w-3/4 mb-2 ${skeletonClass}`} />
          <div className={`h-3 rounded w-full ${skeletonClass}`} />
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;

import { useState } from 'react';

export default function TriggerWarningToggle({ warningText, children }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="w-full">
      {!isVisible ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-900">Trigger Warning</h3>
                <p className="text-red-700 mt-1">{warningText || 'This post contains sensitive content'}</p>
              </div>
            </div>
            <button
              onClick={() => setIsVisible(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors whitespace-nowrap ml-4"
            >
              Show Content
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setIsVisible(false)}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-medium transition-colors"
            >
              Hide Content
            </button>
          </div>
          <div className="bg-white border border-gray-200 rounded p-4 prose prose-sm max-w-none">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

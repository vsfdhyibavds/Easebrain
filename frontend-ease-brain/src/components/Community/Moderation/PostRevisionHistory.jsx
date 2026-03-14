import { useState } from 'react';

// Mock revision data
const mockRevisions = [
  {
    id: 1,
    version: 3,
    timestamp: new Date(),
    authorName: 'John Doe',
    content: 'Updated content with more specific advice on managing anxiety with breathing exercises and meditation techniques.',
    changeType: 'edit',
    changeDescription: 'Added meditation techniques section',
  },
  {
    id: 2,
    version: 2,
    timestamp: new Date(Date.now() - 3600000),
    authorName: 'John Doe',
    content: 'Tips for managing anxiety: Practice regular exercise, maintain healthy sleep schedule, and try mindfulness.',
    changeType: 'edit',
    changeDescription: 'Fixed typo and restructured content',
  },
  {
    id: 3,
    version: 1,
    timestamp: new Date(Date.now() - 7200000),
    authorName: 'John Doe',
    content: 'Ways to deal with anxiety: exercise is good, sleep is important, meditation helps.',
    changeType: 'create',
    changeDescription: 'Original post',
  },
];

export default function PostRevisionHistory({ postTitle }) {
  const [selectedRevision, setSelectedRevision] = useState(mockRevisions[0]);
  const [showDiff, setShowDiff] = useState(false);

  const getChangeTypeBadge = (changeType) => {
    if (changeType === 'create')
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">✓ Created</span>;
    if (changeType === 'edit')
      return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">✏️ Edited</span>;
    if (changeType === 'restore')
      return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">↩️ Restored</span>;
    return null;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Post Revision History</h2>
        <p className="text-gray-600 text-sm">All changes made to "{postTitle}"</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revision List */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-blue-50 border-b border-gray-200 px-4 py-3">
              <h3 className="font-bold text-gray-900">Versions ({mockRevisions.length})</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {mockRevisions.map((revision) => (
                <button
                  key={revision.id}
                  onClick={() => setSelectedRevision(revision)}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    selectedRevision.id === revision.id
                      ? 'bg-blue-50 border-l-4 border-blue-600'
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-900">v{revision.version}</p>
                    {getChangeTypeBadge(revision.changeType)}
                  </div>
                  <p className="text-sm text-gray-600">{formatDate(revision.timestamp)}</p>
                  <p className="text-xs text-gray-500 mt-1">{revision.authorName}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Revision Detail */}
        <div className="lg:col-span-2 space-y-4">
          {/* Revision Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Version {selectedRevision.version}</h3>
                <p className="text-gray-600 text-sm">{formatDate(selectedRevision.timestamp)}</p>
              </div>
              {getChangeTypeBadge(selectedRevision.changeType)}
            </div>

            <div className="space-y-3 pb-4 border-b border-gray-200 mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Author</p>
                <p className="text-gray-900">{selectedRevision.authorName}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Change Description</p>
                <p className="text-gray-900">{selectedRevision.changeDescription}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium rounded-lg transition-colors">
                ↩️ Revert to This Version
              </button>
              <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-colors">
                👁️ View Full Post
              </button>
            </div>
          </div>

          {/* Content Preview */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-bold text-gray-900 mb-3">Content</h4>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{selectedRevision.content}</p>
            </div>
            <p className="text-xs text-gray-500 mt-3">{selectedRevision.content.length} characters</p>
          </div>

          {/* Comparison (if not first revision) */}
          {selectedRevision.version > 1 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <button
                onClick={() => setShowDiff(!showDiff)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
              >
                {showDiff ? '▼' : '▶'} Compare with Previous Version
              </button>

              {showDiff && (
                <div className="space-y-3 text-sm">
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="font-semibold text-red-900 mb-2">Removed</p>
                    <p className="text-red-700 line-through">practice regular exercise, maintain healthy sleep schedule</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="font-semibold text-green-900 mb-2">Added</p>
                    <p className="text-green-700">
                      breathing exercises and meditation techniques, specific time recommendations
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-bold text-gray-900 mb-4">Activity Timeline</h3>
        <div className="space-y-4">
          {mockRevisions.map((revision, index) => (
            <div key={revision.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-blue-600 border-4 border-white"></div>
                {index < mockRevisions.length - 1 && <div className="w-1 h-12 bg-gray-200 my-2"></div>}
              </div>
              <div className="pt-1 pb-4">
                <p className="font-semibold text-gray-900">
                  {revision.changeType === 'create'
                    ? 'Post created'
                    : revision.changeType === 'edit'
                      ? 'Post edited'
                      : 'Post restored'}
                </p>
                <p className="text-sm text-gray-600">{revision.changeDescription}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(revision.timestamp)} by {revision.authorName}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

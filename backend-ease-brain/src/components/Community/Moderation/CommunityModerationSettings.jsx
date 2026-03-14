import { useState } from 'react';

export default function CommunityModerationSettings({ communityName }) {
  const [rules, setRules] = useState([
    {
      id: 1,
      title: 'No Self-Harm Content',
      description: 'Do not promote, encourage, or provide methods for self-harm',
      priority: 'critical',
      enabled: true,
    },
    {
      id: 2,
      title: 'No Hate Speech',
      description: 'Content targeting individuals or groups based on protected characteristics',
      priority: 'critical',
      enabled: true,
    },
    {
      id: 3,
      title: 'Be Respectful',
      description: 'Treat all members with respect and courtesy',
      priority: 'high',
      enabled: true,
    },
    {
      id: 4,
      title: 'No Spam',
      description: 'Do not spam or repeatedly post the same content',
      priority: 'medium',
      enabled: true,
    },
  ]);

  const [keywords, setKeywords] = useState([
    { id: 1, word: 'suicide method', severity: 'critical', autoAction: 'remove' },
    { id: 2, word: 'self harm guide', severity: 'critical', autoAction: 'remove' },
    { id: 3, word: 'buy illegal drugs', severity: 'high', autoAction: 'flag' },
  ]);

  const [newKeyword, setNewKeyword] = useState('');
  const [newSeverity, setNewSeverity] = useState('medium');
  const [newAction, setNewAction] = useState('flag');
  const [_editingRule, _setEditingRule] = useState(null);

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      setKeywords([
        ...keywords,
        {
          id: Date.now(),
          word: newKeyword,
          severity: newSeverity,
          autoAction: newAction,
        },
      ]);
      setNewKeyword('');
      setNewSeverity('medium');
      setNewAction('flag');
    }
  };

  const handleRemoveKeyword = (id) => {
    setKeywords(keywords.filter((k) => k.id !== id));
  };

  const handleToggleRule = (id) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-teal-100 text-teal-800',
    };
    return badges[severity] || badges.medium;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
    };
    return badges[priority] || badges.medium;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Community Moderation Settings</h2>
        <p className="text-gray-600 text-sm">Configure rules and automated content filtering for {communityName}</p>
      </div>

      {/* Community Rules */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Community Rules</h3>
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => handleToggleRule(rule.id)}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                    />
                    <h4 className={`font-semibold ${rule.enabled ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
                      {rule.title}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadge(rule.priority)}`}>
                      {rule.priority.charAt(0).toUpperCase() + rule.priority.slice(1)} Priority
                    </span>
                  </div>
                  <p className={`text-sm ${rule.enabled ? 'text-gray-600' : 'text-gray-400'}`}>{rule.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Filter - Keyword Filtering */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Automated Content Filter</h3>
        <p className="text-sm text-gray-600 mb-4">
          Posts containing these keywords will be automatically flagged or removed based on severity.
        </p>

        {/* Add Keyword Form */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Add Blocked Keyword</h4>
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Enter keyword or phrase..."
              className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
            />
            <select
              value={newSeverity}
              onChange={(e) => setNewSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="flag">Flag</option>
              <option value="remove">Remove</option>
            </select>
            <button
              onClick={handleAddKeyword}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Keywords List */}
        <div className="space-y-2">
          {keywords.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No keywords configured</p>
          ) : (
            keywords.map((keyword) => (
              <div key={keyword.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">"{keyword.word}"</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityBadge(keyword.severity)}`}>
                      {keyword.severity.charAt(0).toUpperCase() + keyword.severity.slice(1)}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {keyword.autoAction === 'remove' ? '🗑️ Auto-Remove' : '🚩 Auto-Flag'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveKeyword(keyword.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settings Summary */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
        <h3 className="font-bold text-teal-900 mb-3">⚙️ Settings Summary</h3>
        <div className="space-y-2 text-sm text-teal-800">
          <p>✓ {rules.filter((r) => r.enabled).length} rules enabled</p>
          <p>✓ {keywords.length} keywords in filter</p>
          <p>✓ {keywords.filter((k) => k.severity === 'critical').length} critical severity keywords</p>
          <p>✓ Auto-remove enabled for {keywords.filter((k) => k.autoAction === 'remove').length} keywords</p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors">
          Save Settings
        </button>
        <button className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg transition-colors">
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}

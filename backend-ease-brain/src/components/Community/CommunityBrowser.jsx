import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetCommunitiesQuery } from '../../app/communityApi';
import { FaHome, FaBook, FaCalendarAlt, FaCommentAlt, FaUsers, FaCog } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const sidebarLinks = [
  { icon: <FaHome />, label: 'Dashboard', to: '/easebrain/dashboard' },
  { icon: <FaBook />, label: 'Notes', to: '/easebrain/notes' },
  { icon: <FaCalendarAlt />, label: 'Reminders', to: '/easebrain/reminders' },
  { icon: <FaCommentAlt />, label: 'Messages', to: '/easebrain/messages' },
  { icon: <FaUsers />, label: 'Community', to: '/easebrain/community' },
  { icon: <FaCog />, label: 'Settings', to: '/easebrain/settings' },
];

const SUBJECT_AREAS = [
  { value: 'anxiety', label: 'Anxiety', icon: '😰' },
  { value: 'depression', label: 'Depression', icon: '🌧️' },
  { value: 'ocd', label: 'OCD', icon: '🔄' },
  { value: 'ptsd', label: 'PTSD', icon: '💪' },
  { value: 'sleep', label: 'Sleep', icon: '😴' },
  { value: 'eating_disorder', label: 'Eating Disorders', icon: '🍎' },
  { value: 'bipolar', label: 'Bipolar', icon: '⚡' },
  { value: 'schizophrenia', label: 'Schizophrenia', icon: '🧠' },
  { value: 'general', label: 'General MH', icon: '💚' },
  { value: 'success_stories', label: 'Success Stories', icon: '🌟' },
];

export default function CommunityBrowser({ onSelectCommunity }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedSubjectArea, setSelectedSubjectArea] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [collapsed, setCollapsed] = useState(false);

  const { data, isLoading, error } = useGetCommunitiesQuery({
    subjectArea: selectedSubjectArea,
    search: searchTerm,
    page: currentPage,
    perPage: 12,
  });

  const communities = data?.communities || [];
  const pagination = data?.pagination || {};

  const handleSelectCommunity = (communityId) => {
    if (onSelectCommunity) {
      onSelectCommunity(communityId);
    } else {
      // Navigate to community detail page if no callback provided
      navigate(`/easebrain/community/${communityId}`);
    }
  };

  const getColorClass = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 border-blue-300',
      gray: 'bg-gray-100 border-gray-300',
      purple: 'bg-purple-100 border-purple-300',
      green: 'bg-green-100 border-green-300',
      yellow: 'bg-yellow-100 border-yellow-300',
      gold: 'bg-yellow-100 border-yellow-300',
    };
    return colorMap[color] || 'bg-gray-100 border-gray-300';
  };

  return (
    <>
      <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
        {/* Sidebar */}
        <aside
          className={`${
            collapsed ? 'w-20' : 'w-64'
          } bg-teal-900 dark:bg-slate-950 text-white transition-all duration-300 flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className="p-6 border-b border-teal-700 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              {!collapsed && <span className="text-2xl font-extrabold dark:text-teal-300">Ease Brain</span>}
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-white p-1 rounded hover:bg-teal-700 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
              aria-label="Toggle sidebar"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarLinks.map(link => {
              const isActiveBase = location.pathname.startsWith(link.to);
              return (
                <li
                  key={link.label}
                  className={`px-6 py-3 flex items-center gap-3 text-lg font-medium cursor-pointer transition-colors duration-150 rounded-lg ${isActiveBase ? 'bg-teal-800 dark:bg-teal-700 text-yellow-300' : 'hover:bg-teal-700 dark:hover:bg-slate-800'}`}
                  title={collapsed ? link.label : ""}
                >
                  <Link to={link.to} className="flex items-center gap-3 w-full">
                    <span className="inline-block w-6 text-center text-xl flex-shrink-0">
                      {link.icon}
                    </span>
                    {!collapsed && link.label}
                  </Link>
                </li>
              );
            })}
          </nav>
          <div className={`px-6 py-4 text-xs text-gray-300 dark:text-gray-500 ${collapsed ? 'hidden' : ''}`}>© 2025 Ease Brain. All rights reserved.</div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Main Content Area */}
          <section className="flex-1 p-6 md:p-8 bg-gradient-to-br from-teal-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Mental Health Communities</h1>
        <p className="text-lg text-gray-600">Find peer support in communities focused on your mental health</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search communities by name..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Subject Area Filter Tabs */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-gray-700 mb-3">Filter by subject area:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedSubjectArea(null);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              selectedSubjectArea === null
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All Communities
          </button>
          {SUBJECT_AREAS.map((area) => (
            <button
              key={area.value}
              onClick={() => {
                setSelectedSubjectArea(area.value);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
                selectedSubjectArea === area.value
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {area.icon} {area.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading communities...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-700">Failed to load communities. Please try again.</p>
        </div>
      )}

      {/* Communities Grid */}
      {!isLoading && communities.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {communities.map((community) => (
              <button
                key={community.id}
                onClick={() => handleSelectCommunity(community.id)}
                className={`p-6 rounded-lg border-2 text-left transition-all hover:shadow-lg active:scale-95 ${getColorClass(
                  community.color
                )}`}
              >
                {/* Icon */}
                <div className="text-5xl mb-4">{community.icon}</div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{community.name}</h3>

                {/* Subject Area */}
                <p className="text-sm text-gray-600 mb-3">{community.subject_area}</p>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{community.description}</p>

                {/* Stats */}
                <div className="flex justify-between text-sm text-gray-600 mb-4 pb-4 border-b border-gray-300">
                  <span>📝 {community.post_count} posts</span>
                  <span>👥 {community.moderator_count} mods</span>
                </div>

                {/* Crisis Hotline */}
                {community.crisis_hotline_phone && (
                  <div className="bg-red-50 rounded px-3 py-2 mb-3 border border-red-200">
                    <p className="text-xs font-medium text-red-900">
                      🚨 Crisis Support: {community.crisis_hotline_phone}
                    </p>
                  </div>
                )}

                {/* Enter Button */}
                <div className="flex items-center justify-between text-blue-600 font-semibold">
                  <span>Enter Community</span>
                  <span>→</span>
                </div>
              </button>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mb-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 rounded font-medium transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                disabled={currentPage === pagination.pages}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 rounded font-medium transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && communities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No communities found matching your search.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSubjectArea(null);
              setCurrentPage(1);
            }}
            className="mt-4 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
            </div>
          </section>
        </main>
      </div>

      {/* Footer is rendered globally in App.jsx; do not render it here to avoid duplication */}
    </>
  );
}

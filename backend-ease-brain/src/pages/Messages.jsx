
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../config/apiConfig';
import Footer from '@/components/Footer';
import { FaSearch, FaPaperPlane, FaPlus, FaCircle, FaClock, FaTrash, FaHome, FaBook, FaCalendarAlt, FaCommentAlt, FaUsers, FaCog, FaArrowLeft, FaComments, FaCheck } from 'react-icons/fa';

const sidebarLinks = [
  { icon: <FaHome />, label: 'Dashboard', to: '/easebrain/dashboard' },
  { icon: <FaBook />, label: 'Notes', to: '/easebrain/notes' },
  { icon: <FaCalendarAlt />, label: 'Reminders', to: '/easebrain/reminders' },
  { icon: <FaCommentAlt />, label: 'Messages', to: '/easebrain/messages' },
  { icon: <FaUsers />, label: 'Community', to: '/easebrain/community' },
  { icon: <FaCog />, label: 'Settings', to: '/easebrain/settings' },

];


export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(null); // messageId or null
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesPerPage] = useState(50);
  const [totalMessagePages, setTotalMessagePages] = useState(1);
  const [messageCache, setMessageCache] = useState({}); // Cache: convId -> messages
  const location = useLocation();
  const navigate = useNavigate();
  const conversationCacheRef = React.useRef(null); // Store conversations to avoid re-fetching

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        // Check cache first
        if (conversationCacheRef.current) {
          setConversations(conversationCacheRef.current);
          return;
        }

        setIsLoading(true);
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${BASE_URL}/conversations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          conversationCacheRef.current = data; // Cache conversations
          setConversations(data || []);
          if (data && data.length > 0) {
            setSelectedConversation(data[0]);
            // Load messages for first conversation
            loadMessages(data[0].id);
          }
        } else if (response.status === 401) {
          navigate('/signin');
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [navigate]);

  // Load messages for selected conversation with pagination
  const loadMessages = async (conversationId, page = 1) => {
    try {
      if (page === 1 && messageCache[conversationId]) {
        setCurrentMessages(messageCache[conversationId]);
        return;
      }

      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${BASE_URL}/conversations/${conversationId}/messages?page=${page}&per_page=${messagesPerPage}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        const messages = data.messages || data; // Handle both paginated and non-paginated responses
        const pagination = data.pagination;

        // Update cache
        setMessageCache(prev => ({
          ...prev,
          [conversationId]: messages
        }));

        setCurrentMessages(messages || []);

        // Set pagination info if available
        if (pagination) {
          setTotalMessagePages(pagination.pages);
          setMessagesPage(page);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!selectedConversation) return;
    const ok = window.confirm('Delete this message?');
    if (!ok) return;

    try {
      const token = localStorage.getItem('access_token');
      const resp = await fetch(
        `${BASE_URL}/conversations/${selectedConversation.id}/messages/${messageId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      if (resp.status === 204) {
        setCurrentMessages(currentMessages.filter((m) => m.id !== messageId));
        setFeedbackMessage('Message deleted');
        setTimeout(() => setFeedbackMessage(''), 1500);
      } else {
        const err = await resp.json().catch(() => ({}));
        setFeedbackMessage(err.message || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      setFeedbackMessage('Error deleting message');
    }
  };

  const deleteConversation = async (conversationId) => {
    const ok = window.confirm('Delete this conversation and all messages?');
    if (!ok) return;

    try {
      const token = localStorage.getItem('access_token');
      const resp = await fetch(
        `${BASE_URL}/conversations/${conversationId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      if (resp.status === 204) {
        setConversations(conversations.filter((c) => c.id !== conversationId));
        setSelectedConversation(null);
        setCurrentMessages([]);
        setFeedbackMessage('Conversation deleted');
        setTimeout(() => setFeedbackMessage(''), 1500);
      } else {
        const err = await resp.json().catch(() => ({}));
        setFeedbackMessage(err.message || 'Failed to delete conversation');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setFeedbackMessage('Error deleting conversation');
    }
  };

  const editMessage = async (messageId) => {
    if (!selectedConversation || !editContent.trim()) return;

    try {
      const token = localStorage.getItem('access_token');
      const resp = await fetch(
        `${BASE_URL}/conversations/${selectedConversation.id}/messages/${messageId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: editContent.trim() }),
        }
      );

      if (resp.ok) {
        const updated = await resp.json();
        setCurrentMessages(
          currentMessages.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  content: updated.content,
                  edited_at: updated.edited_at,
                }
              : m
          )
        );
        setEditingId(null);
        setEditContent('');
        setFeedbackMessage('Message edited');
        setTimeout(() => setFeedbackMessage(''), 1500);
      } else {
        const err = await resp.json().catch(() => ({}));
        setFeedbackMessage(err.message || 'Failed to edit message');
      }
    } catch (error) {
      console.error('Error editing message:', error);
      setFeedbackMessage('Error editing message');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${BASE_URL}/conversations/${selectedConversation.id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: messageInput })
        }
      );

      if (response.ok) {
        const newMessage = await response.json();
        setCurrentMessages([...currentMessages, newMessage]);
        setMessageInput('');
        setFeedbackMessage('Message sent! ✓');
        setTimeout(() => setFeedbackMessage(''), 2000);
      } else {
        console.error('Error sending message:', response.status);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCompose = async (e) => {
    e.preventDefault();
    if (!recipientEmail.trim()) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BASE_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: recipientEmail })
      });

      if (response.ok || response.status === 201) {
        const newConversation = await response.json();
        setConversations([newConversation, ...conversations]);
        setSelectedConversation(newConversation);
        setCurrentMessages([]);
        setRecipientEmail('');
        setShowCompose(false);
        setFeedbackMessage('Conversation started! ✓');
        setTimeout(() => setFeedbackMessage(''), 2000);
      } else {
        const error = await response.json();
        setFeedbackMessage(`Error: ${error.message || 'Failed to create conversation'}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      setFeedbackMessage('Error creating conversation');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Poll for typing status
  React.useEffect(() => {
    if (!selectedConversation) return;

    const pollTyping = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(
          `${BASE_URL}/conversations/${selectedConversation.id}/typing`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setTypingUsers(data.typing_users || []);
        }
      } catch (err) {
        console.error('Error polling typing status:', err);
      }
    };

    const interval = setInterval(pollTyping, 1000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

  const sendTypingStatus = async () => {
    if (!selectedConversation) return;
    try {
      const token = localStorage.getItem('access_token');
      await fetch(
        `${BASE_URL}/conversations/${selectedConversation.id}/typing`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error('Error sending typing status:', err);
    }
  };

  const handleMessageInputChange = (e) => {
    setMessageInput(e.target.value);
    sendTypingStatus();
  };

  const markMessageAsRead = async (messageId, messageStatus) => {
    // Only mark messages with 'delivered' status as 'read'
    if (messageStatus !== 'delivered') return;

    if (!selectedConversation) return;
    try {
      const token = localStorage.getItem('access_token');
      const resp = await fetch(
        `${BASE_URL}/conversations/${selectedConversation.id}/messages/${messageId}`,
        {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (resp.ok) {
        const updated = await resp.json();
        setCurrentMessages(
          currentMessages.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  is_read: updated.is_read,
                  message_status: updated.message_status,
                }
              : m
          )
        );
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const emojis = ['❤️', '👍', '😂', '😮', '😭', '🔥', '✨', '👏', '🎉', '🙏'];

  const addReaction = async (messageId, emoji) => {
    if (!selectedConversation) return;
    try {
      const token = localStorage.getItem('access_token');
      const resp = await fetch(
        `${BASE_URL}/conversations/${selectedConversation.id}/messages/${messageId}/reactions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ emoji }),
        }
      );

      if (resp.ok || resp.status === 201 || resp.status === 409) {
        // Reload messages to get updated reactions
        loadMessages(selectedConversation.id);
        setEmojiPickerOpen(null);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const removeReaction = async (messageId, emoji, reactionId) => {
    if (!selectedConversation) return;
    try {
      const token = localStorage.getItem('access_token');
      const resp = await fetch(
        `${BASE_URL}/conversations/${selectedConversation.id}/messages/${messageId}/reactions/${reactionId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (resp.status === 204) {
        // Reload messages to get updated reactions
        loadMessages(selectedConversation.id);
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const toggleArchiveConversation = async () => {
    if (!selectedConversation) return;
    try {
      const token = localStorage.getItem('access_token');
      const isArchived = selectedConversation.archived || false;
      const resp = await fetch(
        `${BASE_URL}/conversations/${selectedConversation.id}/settings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ archived: !isArchived }),
        }
      );

      if (resp.ok) {
        setSelectedConversation({
          ...selectedConversation,
          archived: !isArchived,
        });
        setFeedbackMessage(isArchived ? 'Conversation unarchived' : 'Conversation archived');
        setTimeout(() => setFeedbackMessage(''), 2000);
      }
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  };

  const toggleMuteConversation = async () => {
    if (!selectedConversation) return;
    try {
      const token = localStorage.getItem('access_token');
      const isMuted = selectedConversation.muted || false;
      const resp = await fetch(
        `${BASE_URL}/conversations/${selectedConversation.id}/settings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ muted: !isMuted }),
        }
      );

      if (resp.ok) {
        setSelectedConversation({
          ...selectedConversation,
          muted: !isMuted,
        });
        setFeedbackMessage(isMuted ? 'Notifications unmuted' : 'Notifications muted');
        setTimeout(() => setFeedbackMessage(''), 2000);
      }
    } catch (error) {
      console.error('Error muting conversation:', error);
    }
  };

  const togglePinMessage = async (messageId) => {
    if (!selectedConversation) return;
    try {
      const msg = currentMessages.find(m => m.id === messageId);
      const token = localStorage.getItem('access_token');
      const resp = await fetch(
        `${BASE_URL}/conversations/${selectedConversation.id}/messages/${messageId}/pin`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_pinned: !msg.is_pinned }),
        }
      );

      if (resp.ok) {
        setCurrentMessages(
          currentMessages.map(m =>
            m.id === messageId ? { ...m, is_pinned: !m.is_pinned } : m
          )
        );
        setFeedbackMessage(msg.is_pinned ? 'Message unpinned' : 'Message pinned');
        setTimeout(() => setFeedbackMessage(''), 1500);
      }
    } catch (error) {
      console.error('Error pinning message:', error);
    }
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const msgTime = new Date(timestamp);
    const diffMs = now - msgTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return msgTime.toLocaleDateString();
  };

  // Filter messages by search query
  const filteredMessages = messageSearchQuery.trim()
    ? currentMessages.filter((msg) =>
        msg.content.toLowerCase().includes(messageSearchQuery.toLowerCase())
      )
    : currentMessages;

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
            const isExact = location.pathname === link.to;
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
                {!collapsed && isActiveBase && !isExact && (
                  <button
                    className="ml-2 text-white p-1 rounded hover:bg-teal-700 dark:hover:bg-slate-800"
                    onClick={() => navigate(link.to)}
                    aria-label={`Back to ${link.label}`}
                    title={`Back to ${link.label}`}
                  >
                    <FaArrowLeft />
                  </button>
                )}
              </li>
            );
          })}
        </nav>
        <div className={`px-6 py-4 text-xs text-gray-300 dark:text-gray-500 ${collapsed ? 'hidden' : ''}`}>© 2025 Ease Brain. All rights reserved.</div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        <div className="flex flex-1 bg-gray-50 dark:bg-slate-900">
          {/* Sidebar - Conversations List */}
          <div className="w-full md:w-96 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl font-bold text-teal-900 dark:text-teal-300 mb-4">Messages</h1>

              {/* Search Bar */}
          <div className="relative mb-4">
            <FaSearch className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>

          {/* Compose Button */}
          <button
            onClick={() => setShowCompose(!showCompose)}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FaPlus /> New Message
          </button>
        </div>

        {/* Compose Form */}
        {showCompose && (
          <div className="p-4 bg-teal-50 border-b border-teal-200">
            <form onSubmit={handleCompose} className="space-y-3">
              <input
                type="email"
                placeholder="Recipient email..."
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors text-sm"
                  disabled={!recipientEmail.trim()}
                >
                  Start Chat
                </button>
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full border-3 border-teal-400 border-t-transparent animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600">Loading conversations...</p>
              </div>
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map(conversation => (
              <button
                key={conversation.id}
                onClick={() => {
                  setSelectedConversation(conversation);
                  loadMessages(conversation.id);
                }}
                className={`w-full p-4 text-left border-b border-gray-100 transition-colors ${
                  selectedConversation?.id === conversation.id
                    ? 'bg-teal-50 border-l-4 border-l-teal-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`${conversation.color} rounded-full w-12 h-12 flex items-center justify-center font-bold text-gray-700 flex-shrink-0`}>
                    {conversation.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900 truncate">{conversation.name}</p>
                      {conversation.unread > 0 && (
                        <span className="bg-teal-600 text-white text-xs font-bold rounded-full px-2 py-0.5 flex-shrink-0">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <FaClock className="w-3 h-3" />
                      {conversation.timestamp}
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No conversations found</p>
            </div>
          )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="hidden md:flex flex-1 flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-green-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`${selectedConversation.color} rounded-full w-14 h-14 flex items-center justify-center font-bold text-gray-700`}>
                    {selectedConversation.avatar}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-teal-900">{selectedConversation.name}</h2>
                    <p className="text-sm text-gray-600">{selectedConversation.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteConversation(selectedConversation.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete conversation"
                  aria-label="Delete conversation"
                >
                  <FaTrash size={18} />
                </button>
                <button
                  onClick={toggleMuteConversation}
                  className={`p-2 rounded-lg transition-colors ${
                    selectedConversation.muted
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={selectedConversation.muted ? 'Unmute notifications' : 'Mute notifications'}
                  aria-label="Toggle mute"
                >
                  🔇
                </button>
                <button
                  onClick={toggleArchiveConversation}
                  className={`p-2 rounded-lg transition-colors ${
                    selectedConversation.archived
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={selectedConversation.archived ? 'Unarchive' : 'Archive'}
                  aria-label="Toggle archive"
                >
                  📦
                </button>
              </div>

              {/* Message Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={messageSearchQuery}
                  onChange={(e) => setMessageSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
                {messageSearchQuery && (
                  <button
                    onClick={() => setMessageSearchQuery('')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-lg"
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
                {messageSearchQuery && (
                  <p className="text-xs text-gray-600 mt-1">
                    {filteredMessages.length} of {currentMessages.length} messages
                  </p>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {filteredMessages.length > 0 ? (
                filteredMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    {editingId === msg.id ? (
                      <div className="max-w-xs lg:max-w-md bg-white border border-teal-400 rounded-lg p-3">
                        <input
                          type="text"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded mb-2 text-sm"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => editMessage(msg.id)}
                            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-1 rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditContent('');
                            }}
                            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white text-xs font-bold py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          msg.isOwn
                            ? 'bg-teal-600 text-white rounded-br-none'
                            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                        {msg.edited_at && (
                          <p className={`text-xs mt-1 ${msg.isOwn ? 'text-teal-100' : 'text-gray-400'}`}>
                            edited
                          </p>
                        )}
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className={`text-xs ${msg.isOwn ? 'text-teal-100' : 'text-gray-500'}`}>
                            {getRelativeTime(msg.timestamp)}
                            {msg.is_pinned && ' 📌'}
                          </p>
                          <div className="flex items-center gap-1">
                            {msg.isOwn && (
                              <div
                                className={`flex gap-0.5 ${
                                  msg.message_status === 'read' ? 'text-blue-400' : 'text-teal-100'
                                }`}
                                onClick={() => markMessageAsRead(msg.id, msg.message_status)}
                                style={{ cursor: msg.message_status === 'delivered' ? 'pointer' : 'default' }}
                                title={`Status: ${msg.message_status || 'sent'}`}
                              >
                                <FaCheck size={12} />
                                {(msg.message_status === 'delivered' || msg.message_status === 'read') && (
                                  <FaCheck size={12} />
                                )}
                              </div>
                            )}
                            {msg.isOwn && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => togglePinMessage(msg.id)}
                                  aria-label="Pin message"
                                  className="text-sm text-white/80 hover:text-white"
                                  title={msg.is_pinned ? 'Unpin' : 'Pin'}
                                >
                                  {msg.is_pinned ? '📌' : '📍'}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingId(msg.id);
                                    setEditContent(msg.content);
                                  }}
                                  aria-label="Edit message"
                                  className="text-sm text-white/80 hover:text-white"
                                  title="Edit"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteMessage(msg.id);
                                  }}
                                  aria-label="Delete message"
                                  className="text-sm text-white/80 hover:text-white"
                                  title="Delete"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reactions Display */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(msg.reactions).map(([emoji, reactionData]) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              if (reactionData.current_user_reacted) {
                                removeReaction(msg.id, emoji, reactionData.id);
                              } else {
                                addReaction(msg.id, emoji);
                              }
                            }}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-colors ${
                              reactionData.current_user_reacted
                                ? 'bg-teal-200 text-teal-900 hover:bg-teal-300'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            title={reactionData.users.map(u => u.name).join(', ')}
                          >
                            {emoji} {reactionData.count}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Emoji Picker */}
                    {emojiPickerOpen === msg.id && (
                      <div className="flex flex-wrap gap-1 mt-2 bg-gray-100 p-2 rounded">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addReaction(msg.id, emoji)}
                            className="text-lg hover:bg-gray-300 p-1 rounded transition-colors"
                            title={emoji}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Add Reaction Button */}
                    <button
                      onClick={() => setEmojiPickerOpen(emojiPickerOpen === msg.id ? null : msg.id)}
                      className="text-xs text-gray-400 hover:text-gray-600 mt-1 ml-1"
                      title="Add reaction"
                    >
                      😊 Add reaction
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>
                    {messageSearchQuery
                      ? `No messages match "${messageSearchQuery}"`
                      : 'No messages yet. Start the conversation!'}
                  </p>
                </div>
              )}

              {/* Pagination Controls */}
              {!messageSearchQuery && totalMessagePages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4 py-2">
                  <button
                    onClick={() => loadMessages(selectedConversation.id, messagesPage - 1)}
                    disabled={messagesPage === 1}
                    className="px-3 py-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white text-xs rounded transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {messagesPage} of {totalMessagePages}
                  </span>
                  <button
                    onClick={() => loadMessages(selectedConversation.id, messagesPage + 1)}
                    disabled={messagesPage === totalMessagePages}
                    className="px-3 py-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white text-xs rounded transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-gray-200 bg-white">
              {feedbackMessage && (
                <p className="text-sm text-green-600 mb-3 flex items-center gap-2">
                  {feedbackMessage}
                </p>
              )}

              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <p className="text-xs text-gray-500 mb-2 italic">
                  {typingUsers.map(u => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </p>
              )}

              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={handleMessageInputChange}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FaPaperPlane /> Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
          </div>
        </div>
      </main>

    </div>
    <Footer />
    </>
  );
}

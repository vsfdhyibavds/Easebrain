import React, { useState, useMemo } from 'react';
import { useDarkMode } from '@/context/DarkModeContext';
import {
  FaComments,
  FaPaperPlane,
  FaPlus,
  FaCheckDouble,
  FaEye,
  FaTrash,
  FaUser,
  FaUsers,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'template';
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: 'reminder' | 'wellness' | 'appointment' | 'other';
}

interface CommunicationHubProps {
  caregiverName?: string;
}

const generateSampleMessages = (): Message[] => [
  {
    id: 'msg1',
    senderId: 'caregiver1',
    senderName: 'You',
    recipientId: 'dep1',
    recipientName: 'John Smith',
    content: "Good morning! Don't forget to take your morning medication.",
    timestamp: new Date(Date.now() - 3600000),
    read: true,
    type: 'text',
  },
  {
    id: 'msg2',
    senderId: 'dep1',
    senderName: 'John Smith',
    recipientId: 'caregiver1',
    recipientName: 'You',
    content: 'Done! I took my medication at 8 AM with breakfast.',
    timestamp: new Date(Date.now() - 3300000),
    read: true,
    type: 'text',
  },
  {
    id: 'msg3',
    senderId: 'caregiver1',
    senderName: 'You',
    recipientId: 'dep2',
    recipientName: 'Mary Johnson',
    content: 'Your doctor appointment is tomorrow at 2 PM. Remember to bring your insurance card.',
    timestamp: new Date(Date.now() - 7200000),
    read: false,
    type: 'template',
  },
  {
    id: 'msg4',
    senderId: 'dep2',
    senderName: 'Mary Johnson',
    recipientId: 'caregiver1',
    recipientName: 'You',
    content: 'Thank you for the reminder! I will be ready.',
    timestamp: new Date(Date.now() - 7000000),
    read: true,
    type: 'text',
  },
  {
    id: 'msg5',
    senderId: 'caregiver1',
    senderName: 'You',
    recipientId: 'dep3',
    recipientName: 'Robert Brown',
    content: 'How are you feeling today? Any concerns?',
    timestamp: new Date(Date.now() - 14400000),
    read: true,
    type: 'text',
  },
];

const messageTemplates: MessageTemplate[] = [
  {
    id: 'tmpl1',
    name: 'Medication Reminder',
    content: "Don't forget to take your medication as prescribed. Let me know when it's done!",
    category: 'reminder',
  },
  {
    id: 'tmpl2',
    name: 'Daily Check-in',
    content: 'Good morning! How are you feeling today? Any concerns or updates I should know about?',
    category: 'wellness',
  },
  {
    id: 'tmpl3',
    name: 'Appointment Reminder',
    content: "Your appointment is coming up. Don't forget to:\n- Bring your insurance card\n- Prepare your list of questions\n- Take your current medications list",
    category: 'appointment',
  },
  {
    id: 'tmpl4',
    name: 'Physical Activity Reminder',
    content: 'Time for your daily walk! Get some fresh air and gentle exercise. Stay safe!',
    category: 'reminder',
  },
  {
    id: 'tmpl5',
    name: 'Meal Time Reminder',
    content: 'Don\'t forget to have a healthy meal. Stay hydrated and nourished!',
    category: 'reminder',
  },
];

const dependents = [
  { id: 'dep1', name: 'John Smith' },
  { id: 'dep2', name: 'Mary Johnson' },
  { id: 'dep3', name: 'Robert Brown' },
];

const CommunicationHub: React.FC<CommunicationHubProps> = () => {
  const { isDarkMode } = useDarkMode();
  const [messages, setMessages] = useState(generateSampleMessages());
  const [selectedDependent, setSelectedDependent] = useState('dep1');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState<'conversations' | 'templates'>('conversations');

  const selectedDependentData = useMemo(
    () => dependents.find((d) => d.id === selectedDependent),
    [selectedDependent]
  );

  const conversationMessages = useMemo(() => {
    return messages
      .filter(
        (m) =>
          (m.recipientId === selectedDependent || m.senderId === selectedDependent) &&
          (m.content.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery)
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [messages, selectedDependent, searchQuery]);

  const unreadMessages = useMemo(() => {
    return messages.filter((m) => !m.read && m.recipientId === 'caregiver1').length;
  }, [messages]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    const newMessage: Message = {
      id: `msg${Date.now()}`,
      senderId: 'caregiver1',
      senderName: 'You',
      recipientId: selectedDependent,
      recipientName: selectedDependentData?.name || 'Unknown',
      content: content,
      timestamp: new Date(),
      read: false,
      type: 'text',
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
    toast.success(`Message sent to ${selectedDependentData?.name}`);
  };

  const handleSendTemplate = (template: MessageTemplate) => {
    handleSendMessage(template.content);
    toast.success(`Template sent to ${selectedDependentData?.name}`);
  };

  const handleMarkAsRead = (messageId: string) => {
    setMessages(messages.map((m) => (m.id === messageId ? { ...m, read: true } : m)));
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((m) => m.id !== messageId));
    toast.success('Message deleted');
  };

  const handleSendToAll = (content: string) => {
    if (!content.trim()) return;

    dependents.forEach((dep) => {
      const newMessage: Message = {
        id: `msg${Date.now()}_${dep.id}`,
        senderId: 'caregiver1',
        senderName: 'You',
        recipientId: dep.id,
        recipientName: dep.name,
        content: content,
        timestamp: new Date(),
        read: false,
        type: 'text',
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    setMessageInput('');
    toast.success('Message sent to all dependents');
  };

  return (
    <div className={`rounded-2xl p-8 shadow-lg border h-full ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-teal-100'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className={`text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
          <FaComments className={`text-base sm:text-lg ${isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />
          <span className="text-xl sm:text-3xl">Communication Hub</span>
        </h2>
        <span className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base whitespace-nowrap ${isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'}`}>
          {unreadMessages} unread
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 h-screen max-h-96 md:max-h-full">
        {/* Sidebar - Conversations/Dependents */}
        <div className={`rounded-lg sm:rounded-xl border p-3 sm:p-4 flex flex-col ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className="mb-3 sm:mb-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base ${
                isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-600'
              }`}
            />
          </div>

          <p className={`text-xs font-semibold mb-2 sm:mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            DEPENDENTS
          </p>
          <div className="space-y-2 flex-1 overflow-y-auto">
            {dependents.map((dep) => {
              const hasMessages = messages.some(
                (m) => m.recipientId === dep.id || m.senderId === dep.id
              );
              const depUnread = messages.filter(
                (m) => m.senderId === dep.id && !m.read
              ).length;

              return (
                <button
                  key={dep.id}
                  onClick={() => {
                    setSelectedDependent(dep.id);
                    setShowTemplates(false);
                  }}
                  className={`w-full text-left p-2 sm:p-3 rounded-lg transition-all flex items-center justify-between min-h-[44px] sm:min-h-auto text-sm sm:text-base ${
                    selectedDependent === dep.id
                      ? isDarkMode
                        ? 'bg-teal-600 text-white'
                        : 'bg-teal-500 text-white'
                      : isDarkMode
                        ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                  } ${!hasMessages ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <FaUser className="text-sm" />
                    <span className="text-sm font-semibold">{dep.name}</span>
                  </div>
                  {depUnread > 0 && (
                    <span className={`text-xs font-bold px-2 py-1 rounded ${isDarkMode ? 'bg-red-600' : 'bg-red-500'}`}>
                      {depUnread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Send to All Button */}
          <button
            onClick={() => {
              const content = prompt('Enter message to send to all dependents:');
              if (content) handleSendToAll(content);
            }}
            className={`w-full mt-4 px-3 sm:px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all min-h-[44px] sm:min-h-auto text-sm sm:text-base ${
              isDarkMode
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            <FaUsers className="text-sm" />
            Send to All
          </button>
        </div>

        {/* Main Chat Area */}
        <div className={`lg:col-span-2 rounded-lg sm:rounded-xl border flex flex-col ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
          {/* Tabs */}
          <div className={`flex border-b text-sm sm:text-base ${isDarkMode ? 'border-slate-600' : 'border-gray-200'}`}>
            <button
              onClick={() => {
                setActiveTab('conversations');
                setShowTemplates(false);
              }}
              className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 font-semibold transition-colors min-h-[44px] sm:min-h-auto flex items-center justify-center gap-1 sm:gap-2 ${
                activeTab === 'conversations'
                  ? isDarkMode
                    ? 'border-b-2 border-teal-500 text-teal-400'
                    : 'border-b-2 border-teal-500 text-teal-600'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-700'
              }`}
            >
              <FaComments />
              <span className="hidden sm:inline">Conversations</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('templates');
                setShowTemplates(true);
              }}
              className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 font-semibold transition-colors min-h-[44px] sm:min-h-auto flex items-center justify-center gap-1 sm:gap-2 ${
                activeTab === 'templates'
                  ? isDarkMode
                    ? 'border-b-2 border-teal-500 text-teal-400'
                    : 'border-b-2 border-teal-500 text-teal-600'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-700'
              }`}
            >
              <FaPlus />
              <span className="hidden sm:inline">Templates</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-hidden">
            {!showTemplates ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-2 sm:mb-4 space-y-2 sm:space-y-3">
                  {conversationMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        No messages yet. Start a conversation!
                      </p>
                    </div>
                  ) : (
                    conversationMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === 'caregiver1' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm group relative ${
                            msg.senderId === 'caregiver1'
                              ? isDarkMode
                                ? 'bg-teal-600 text-white'
                                : 'bg-teal-500 text-white'
                              : isDarkMode
                                ? 'bg-slate-700 text-gray-100'
                                : 'bg-white text-gray-900'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <div className={`text-xs mt-1 flex items-center justify-between gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {msg.senderId === 'caregiver1' && (
                              <FaCheckDouble
                                className={`text-xs ${msg.read ? (isDarkMode ? 'text-blue-300' : 'text-blue-500') : ''}`}
                              />
                            )}
                            {!msg.read && msg.senderId !== 'caregiver1' && (
                              <button
                                onClick={() => handleMarkAsRead(msg.id)}
                                className="hover:text-yellow-400"
                              >
                                <FaEye className="text-xs" />
                              </button>
                            )}
                          </div>
                          <div className="absolute right-0 top-0 hidden group-hover:flex gap-1 p-1">
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className={`p-1 rounded ${isDarkMode ? 'hover:bg-red-600' : 'hover:bg-red-300'}`}
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input Area */}
                <div className="flex gap-1 sm:gap-2">
                  <input
                    type="text"
                    placeholder={`${selectedDependentData?.name}...`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && messageInput.trim()) {
                        handleSendMessage(messageInput);
                      }
                    }}
                    className={`flex-1 px-2 sm:px-4 py-2 rounded-lg border text-xs sm:text-base ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-600'
                    }`}
                  />
                  <button
                    onClick={() => handleSendMessage(messageInput)}
                    disabled={!messageInput.trim()}
                    className={`px-2 sm:px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-1 sm:gap-2 transition-all min-h-[44px] sm:min-h-auto text-sm sm:text-base ${
                      messageInput.trim()
                        ? isDarkMode
                          ? 'bg-teal-600 text-white hover:bg-teal-700'
                          : 'bg-teal-500 text-white hover:bg-teal-600'
                        : isDarkMode
                          ? 'bg-slate-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <FaPaperPlane />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </>
            ) : (
              /* Templates View */
              <div className="flex-1 overflow-y-auto space-y-3">
                {messageTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-teal-500 ${
                      isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                    }`}
                    onClick={() => handleSendTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                        {template.name}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs rounded capitalize ${
                          isDarkMode
                            ? 'bg-teal-600/30 text-teal-300'
                            : 'bg-teal-100 text-teal-700'
                        }`}
                      >
                        {template.category}
                      </span>
                    </div>
                    <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {template.content}
                    </p>
                  </div>
                ))}
                <p className={`text-xs text-center p-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Click a template to send
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationHub;

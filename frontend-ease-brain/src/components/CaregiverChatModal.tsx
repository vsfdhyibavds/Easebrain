import { FC, useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import { FaTimes, FaPaperPlane, FaSmile, FaPhone, FaEllipsisV } from 'react-icons/fa';
import { useDarkMode } from '@/context/DarkModeContext';

interface Message {
  id: number;
  sender: 'caregiver' | 'dependent';
  text: string;
  timestamp: string;
  read: boolean;
}

interface Dependent {
  id: number;
  name: string;
  status: string;
}

interface CaregiverChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  dependent?: Dependent | null;
}

const CaregiverChatModal: FC<CaregiverChatModalProps> = ({
  isOpen,
  onClose,
  dependent,
}) => {
  const { isDarkMode } = useDarkMode();
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'dependent',
      text: "Hey, I'm feeling better today!",
      timestamp: '10:30 AM',
      read: true,
    },
    {
      id: 2,
      sender: 'caregiver',
      text: 'That is wonderful to hear! Have you taken your medications today?',
      timestamp: '10:32 AM',
      read: true,
    },
    {
      id: 3,
      sender: 'dependent',
      text: 'Yes, I took them this morning',
      timestamp: '10:33 AM',
      read: true,
    },
    {
      id: 4,
      sender: 'caregiver',
      text: 'Great! Keep it up. Let me know if you need anything.',
      timestamp: '10:34 AM',
      read: true,
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!messageText.trim()) {
      return;
    }

    // Add caregiver message
    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'caregiver',
      text: messageText,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      read: true,
    };

    setMessages([...messages, newMessage]);
    setMessageText('');

    // Simulate dependent response
    setTimeout(() => {
      const responses = [
        'Thank you for checking in!',
        'I appreciate your support',
        'Will do, thanks for the reminder',
        'I feel much better now',
      ];
      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      const dependentMessage: Message = {
        id: messages.length + 2,
        sender: 'dependent',
        text: randomResponse,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        read: true,
      };
      setMessages((prev) => [...prev, dependentMessage]);
    }, 1000);
  };

  if (!isOpen || !dependent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        className={`w-full max-w-2xl h-[600px] rounded-3xl shadow-2xl flex flex-col ${
          isDarkMode ? 'bg-slate-700' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b px-6 sm:px-8 py-4 sm:py-5 ${
            isDarkMode ? 'border-slate-600' : 'border-teal-100'
          }`}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className={`w-10 sm:w-12 h-10 sm:h-12 rounded-full flex items-center justify-center ${
                isDarkMode
                  ? 'bg-gradient-to-br from-teal-500 to-cyan-500'
                  : 'bg-gradient-to-br from-teal-400 to-cyan-400'
              }`}
            >
              <span className="text-white font-bold text-sm sm:text-base">
                {dependent.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3
                className={`font-bold text-base sm:text-lg ${
                  isDarkMode ? 'text-white' : 'text-teal-900'
                }`}
              >
                {dependent.name}
              </h3>
              <p
                className={`text-xs sm:text-sm ${
                  isDarkMode ? 'text-teal-300' : 'text-teal-600'
                }`}
              >
                <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                Online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'hover:bg-slate-600 text-teal-400'
                  : 'hover:bg-teal-50 text-teal-600'
              }`}
            >
              <FaPhone className="text-lg" />
            </button>
            <button
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'hover:bg-slate-600 text-teal-400'
                  : 'hover:bg-teal-50 text-teal-600'
              }`}
            >
              <FaEllipsisV className="text-lg" />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'hover:bg-slate-600 text-teal-400'
                  : 'hover:bg-teal-50 text-teal-600'
              }`}
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === 'caregiver' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-2.5 sm:px-6 sm:py-3 ${
                  msg.sender === 'caregiver'
                    ? isDarkMode
                      ? 'bg-teal-600 text-white'
                      : 'bg-teal-600 text-white'
                    : isDarkMode
                    ? 'bg-slate-600 text-teal-100 border border-slate-500'
                    : 'bg-teal-50 text-teal-900 border border-teal-100'
                }`}
              >
                <p className="text-sm sm:text-base break-words">{msg.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender === 'caregiver'
                      ? 'text-teal-100'
                      : isDarkMode
                      ? 'text-teal-300'
                      : 'text-teal-600'
                  }`}
                >
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          className={`border-t px-4 sm:px-6 py-4 sm:py-5 ${
            isDarkMode ? 'border-slate-600' : 'border-teal-100'
          }`}
        >
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className={`p-2 sm:p-2.5 rounded-lg transition-colors flex-shrink-0 ${
                isDarkMode
                  ? 'hover:bg-slate-600 text-teal-400'
                  : 'hover:bg-teal-50 text-teal-600'
              }`}
            >
              <FaSmile className="text-lg sm:text-xl" />
            </button>

            <input
              type="text"
              value={messageText}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setMessageText(e.target.value)
              }
              placeholder="Type a message..."
              className={`flex-1 px-4 py-2 sm:py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base ${
                isDarkMode
                  ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
                  : 'bg-white border-teal-200 text-teal-900 placeholder-teal-400'
              }`}
            />

            <button
              type="submit"
              disabled={!messageText.trim()}
              className={`p-2 sm:p-2.5 rounded-lg transition-colors flex-shrink-0 ${
                messageText.trim()
                  ? isDarkMode
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                  : isDarkMode
                  ? 'bg-slate-600 text-teal-400 cursor-not-allowed'
                  : 'bg-teal-50 text-teal-400 cursor-not-allowed'
              }`}
            >
              <FaPaperPlane className="text-lg sm:text-xl" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CaregiverChatModal;

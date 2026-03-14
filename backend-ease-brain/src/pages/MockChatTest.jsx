/**
 * Mock Chat Test Page
 * 
 * This page demonstrates how ChatSpace.jsx works with mock data.
 * Import and use this to test the chat functionality without backend.
 */

import React, { useState, useEffect, useRef } from "react";
import { FaUser, FaComments, FaPaperPlane, FaPaperclip } from "react-icons/fa";
import { mockDependents, mockCurrentUser, getMessagesForConversation, simulateSendMessage, simulateReceiveMessage } from "../utils/mockCaregiverData";

function MockChatTest() {
  const [selectedDependent, setSelectedDependent] = useState(mockDependents[0]);
  const [conversationId] = useState("conv-1");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  // Load messages when dependent changes
  useEffect(() => {
    setMessages(getMessagesForConversation(conversationId));
  }, [conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment({
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      });
    }
  };

  // Clear attachment
  const clearAttachment = () => {
    if (attachment?.url) {
      URL.revokeObjectURL(attachment.url);
    }
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Simulate receiving a message (for demo purposes)
  const simulateIncomingMessage = () => {
    const responses = [
      "Thank you for checking in!",
      "I'm doing much better today.",
      "Yes, I took my medication.",
      "Looking forward to my appointment tomorrow.",
      "I appreciate you reaching out."
    ];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const msg = simulateReceiveMessage(conversationId, randomResponse, selectedDependent.id, selectedDependent.name);
    setMessages(prev => [...prev, msg]);
  };

  // Handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachment) return;

    const msg = simulateSendMessage(
      conversationId,
      newMessage,
      mockCurrentUser.id,
      mockCurrentUser.name,
      mockCurrentUser.role
    );

    // Add attachment to message if present
    if (attachment) {
      msg.attachment = attachment;
    }

    setMessages(prev => [...prev, msg]);
    setNewMessage("");
    clearAttachment();

    // Simulate typing indicator
    setTypingUser(selectedDependent.name);
    setTimeout(() => {
      setTypingUser(null);
      // Simulate response after 1-2 seconds
      setTimeout(simulateIncomingMessage, 1500);
    }, 2000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-teal-700 mb-6">Chat Demo - Mock Data</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dependent List */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h2 className="text-xl font-semibold text-teal-700 mb-4 flex items-center gap-2">
              <FaUser /> Your Dependents
            </h2>
            <div className="space-y-3">
              {mockDependents.map(dependent => (
                <button
                  key={dependent.id}
                  onClick={() => setSelectedDependent(dependent)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedDependent.id === dependent.id
                      ? "bg-teal-50 border-2 border-teal-500"
                      : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                  }`}
                >
                  <div className="font-semibold text-gray-800">{dependent.name}</div>
                  <div className="text-sm text-gray-500">{dependent.relationship}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      dependent.status === "Excellent" ? "bg-teal-100 text-teal-700" :
                      dependent.status === "Stable" ? "bg-cyan-100 text-cyan-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {dependent.status}
                    </span>
                    <span className="text-xs text-gray-500">Mood: {dependent.mood}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg flex flex-col h-[600px]">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FaUser />
                </div>
                <div>
                  <div className="font-semibold">Chat with {selectedDependent.name}</div>
                  <div className="text-sm text-teal-100">
                    {selectedDependent.status} - Last check: {selectedDependent.lastCheck}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaComments />
                <span>{messages.length} messages</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <FaComments className="text-4xl mx-auto mb-2" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.is_from_caregiver ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-xl text-sm ${
                        msg.is_from_caregiver
                          ? "bg-teal-600 text-white rounded-br-none"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"
                      }`}
                    >
                      {!msg.is_from_caregiver && (
                        <div className="text-xs text-teal-600 mb-1 font-medium">
                          {msg.sender_name}
                        </div>
                      )}
                      <p>{msg.content || msg.message}</p>
                      
                      {/* Attachment Display */}
                      {msg.attachment && (
                        <div className={`mt-2 p-2 rounded-lg ${
                          msg.is_from_caregiver ? "bg-white/20" : "bg-gray-100 border border-gray-200"
                        }`}>
                          <a 
                            href={msg.attachment.url} 
                            target="_blank" 
                            className={`flex items-center gap-2 text-sm ${
                              msg.is_from_caregiver ? "text-white hover:underline" : "text-teal-600 hover:underline"
                            }`}
                          >
                            <FaPaperclip />
                            <span className="truncate">{msg.attachment.name}</span>
                            <span className="text-xs opacity-70">({formatFileSize(msg.attachment.size)})</span>
                          </a>
                        </div>
                      )}
                      
                      <div className={`text-[10px] mt-1 ${msg.is_from_caregiver ? "text-teal-100" : "text-gray-400"}`}>
                        {formatTime(msg.created_at)}
                        {msg.is_from_caregiver && (
                          <span className="ml-2">
                            {msg.read ? "✓✓ Read" : "✓ Sent"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {/* Typing Indicator */}
              {typingUser && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-bl-none rounded-xl px-4 py-2 shadow-sm">
                    <div className="flex gap-1">
                     Name="flex gap <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={bottomRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                {/* File Input (Hidden) */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                
                {/* Attach Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2 rounded-lg transition-colors ${
                    attachment ? "bg-teal-100 text-teal-600" : "text-gray-400 hover:text-teal-600 hover:bg-gray-100"
                  }`}
                  title="Attach file"
                >
                  <FaPaperclip />
                </button>

                {/* Attachment Preview */}
                {attachment && (
                  <div className="flex items-center gap-2 bg-teal-50 px-3 py-2 rounded-lg border border-teal-200">
                    <span className="text-sm text-teal-700 truncate max-w-[120px]">
                      {attachment.name}
                    </span>
                    <button
                      type="button"
                      onClick={clearAttachment}
                      className="text-teal-400 hover:text-teal-600 font-bold"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Message Input */}
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${selectedDependent.name}...`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                
                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!newMessage.trim() && !attachment}
                  className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FaPaperPlane />
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Message Structure Info */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-4">Message Structure (for ChatSpace.jsx)</h2>
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-700">
{`// Each message has this structure:
{
  id: number,
  conversation_id: string,
  sender_id: number,
  sender_name: string,
  sender_role: "dependent" | "caregiver",
  content: string,
  created_at: string (ISO timestamp),
  is_from_caregiver: boolean,
  read: boolean,
  attachment?: { name: string, type: string, size: number, url: string }
}

// ChatSpace.jsx uses:
// - messages.map(msg => ...) to render message bubbles
// - msg.is_from_caregiver to determine if message is own
// - msg.message (or content) for the message text
// - msg.file_url (or msg.attachment) for attachments
// - msg.read for read status`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MockChatTest;

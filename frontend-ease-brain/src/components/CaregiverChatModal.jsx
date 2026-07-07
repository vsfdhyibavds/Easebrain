import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaPaperPlane, FaComments, FaUser } from "react-icons/fa";
import { useGetConversationMessagesQuery, useSendMessageMutation, useStartConversationMutation } from "@/app/messagesApi";
import toast from "react-hot-toast";

export default function CaregiverChatModal({ isOpen, onClose, dependent }) {
  const [messageInput, setMessageInput] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const { data: messages = [], isLoading: messagesLoading } = useGetConversationMessagesQuery(
    conversationId,
    { skip: !conversationId }
  );

  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();
  const [startConversation, { isLoading: starting }] = useStartConversationMutation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start conversation when modal opens
  useEffect(() => {
    if (isOpen && dependent && !conversationId) {
      handleStartConversation();
    }
  }, [isOpen, dependent, conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStartConversation = async () => {
    try {
      if (!dependent) return;
      const result = await startConversation(dependent.id).unwrap();
      setConversationId(result.conversation_id);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !conversationId || !dependent) return;

    try {
      await sendMessage({
        conversationId,
        content: messageInput.trim(),
        recipientId: dependent.id,
      }).unwrap();

      setMessageInput("");
      toast.success("Message sent!");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen || !dependent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FaUser className="text-white text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Chat with {dependent.name}</h3>
              <p className="text-teal-100 text-sm">Caregiver Communication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-teal-100 transition-colors p-2"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messagesLoading || starting ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-200 border-t-teal-600 mx-auto mb-2"></div>
                <p className="text-teal-600">Loading conversation...</p>
              </div>
            </div>
          ) : messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.is_from_caregiver ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.is_from_caregiver
                      ? "bg-teal-600 text-white rounded-br-none"
                      : "bg-white text-gray-900 border border-gray-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.is_from_caregiver ? "text-teal-100" : "text-gray-500"
                    }`}
                  >
                    {formatTimestamp(message.created_at)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <FaComments className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Start the conversation with {dependent.name}</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-gray-200 bg-white rounded-b-2xl">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              placeholder={`Message ${dependent.name}...`}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!messageInput.trim() || sending}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <FaPaperPlane />
              )}
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaLock, FaPaperPlane, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import Footer from "../components/Footer";

export default function AISupport() {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm EaseBrain AI. How are you feeling today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // DeepSeek API Key (Vite)
  const DEEPSEEK_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;

  // Auto-scroll when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ------------------------
  // Send Message Function
  // ------------------------
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    console.log("DeepSeek API Key is", DEEPSEEK_KEY ? "set" : "not set");

    const userMessage = inputMessage.trim();
    setInputMessage("");

    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are EaseBrain AI, a compassionate mental health support assistant. Provide empathetic, supportive responses. Offer calming exercises, motivational quotes, and active listening. Never provide medical advice. Keep responses concise and caring.",
            },
            ...newMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DeepSeek API response error:", response.status, errorText);

        let errorMessage = `API request failed with status ${response.status}`;
        if (response.status === 402) {
          errorMessage = "Payment required. Please check your API subscription or usage limits.";
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
    } catch (error) {
      console.error("DeepSeek Error:", error.message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            `Error: ${error.message}. Please try again in a moment.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Enter to send
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Reset chat
  const resetChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hello! I'm EaseBrain AI. How are you feeling today?",
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-teal-50 flex flex-col">
      {/* Header with Logo */}
      <div className="w-full bg-white shadow-md py-4 px-4 sm:px-8 mb-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <img src={logo} alt="EaseBrain Logo" className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/")} />
          <h1 className="text-xl sm:text-2xl font-bold text-teal-700">AI Support</h1>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-grow px-4 sm:px-8 py-10 flex flex-col items-center text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal-600 flex items-center justify-center gap-2 mb-6 flex-wrap">
          <FaRobot className="text-teal-500" /> Meet EaseBrain AI — Your 24/7 Companion
        </h1>

        <p className="text-gray-700 max-w-2xl mb-8 text-sm sm:text-base leading-relaxed">
          Our AI assistant listens and guides you during tough moments, suggests
          calming exercises, and offers motivational quotes to help you feel supported
          any time of day.
        </p>

        <div className="border rounded-2xl p-6 sm:p-8 shadow-md bg-white/70 backdrop-blur-sm hover:shadow-lg transition w-full max-w-md">
          <p className="text-gray-800 text-base sm:text-lg mb-4">
            💬 "How are you feeling today?"
          </p>
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 transition text-sm sm:text-base font-semibold shadow-md hover:shadow-lg"
          >
            Start Chat
          </button>
        </div>

        <div className="mt-10 text-gray-600 flex items-center justify-center gap-2 text-sm sm:text-base">
          <FaLock className="text-teal-600" /> Your conversations are private and secure.
        </div>

        <p className="text-gray-500 text-xs sm:text-sm mt-2 max-w-md text-center">
          Disclaimer: EaseBrain AI does not provide medical advice. It's meant for emotional
          support and motivation only.
        </p>
      </main>

      {/* CHAT MODAL */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            {/* HEADER */}
            <div className="bg-teal-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaRobot className="text-white" />
                <span className="font-semibold">EaseBrain AI</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={resetChat}
                  className="text-white hover:text-teal-200 text-sm"
                  title="New Chat"
                >
                  ↻
                </button>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-white hover:text-teal-200"
                >
                  ×
                </button>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      message.role === "user"
                        ? "bg-teal-600 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.role === "user" ? (
                        <FaUser className="text-sm" />
                      ) : (
                        <FaRobot className="text-sm" />
                      )}
                      <span className="text-xs font-semibold">
                        {message.role === "user" ? "You" : "EaseBrain AI"}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-none p-3 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <FaRobot className="text-sm" />
                      <span className="text-xs font-semibold">EaseBrain AI</span>
                    </div>
                    <div className="flex space-x-1 mt-1">
                      <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
                  rows="1"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPaperPlane className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { FaPaperPlane, FaPaperclip } from "react-icons/fa";
import { useAuth } from "../features/auth/AuthContext";
import io from "socket.io-client";

// fallback to production backend URL if VITE_SOCKET_URL not set
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://www.easebrain.live";
const socket = io(SOCKET_URL, {
  withCredentials: true,
});

export default function ChatSpace() {
  const { conversationId } = useParams();
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  /* ------------------- SOCKET EVENTS ------------------- */
  useEffect(() => {
    socket.emit("join_room", conversationId);

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      socket.emit("message_read", msg.id);
    });

    socket.on("typing", (user) => setTypingUser(user));
    socket.on("stop_typing", () => setTypingUser(null));

    return () => socket.off();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ------------------- SEND MESSAGE ------------------- */
  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("send_message", {
      conversationId,
      message: text,
      sender_role: currentUser.role,
      sender_name: currentUser.name,
    });

    setText("");
    socket.emit("stop_typing", conversationId);
  };

  /* ------------------- FILE UPLOAD ------------------- */
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversationId", conversationId);

    await fetch("/api/chats/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow border">
      {/* Header */}
      <div className="p-4 border-b bg-teal-50">
        <h2 className="font-semibold text-teal-700">Care Chat</h2>
        {typingUser && (
          <p className="text-xs text-gray-500">
            {typingUser} is typing...
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isOwn={msg.sender_role === currentUser.role}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t flex items-center gap-2">
        <button onClick={() => fileRef.current.click()}>
          <FaPaperclip className="text-teal-600" />
        </button>

        <input
          ref={fileRef}
          type="file"
          hidden
          onChange={handleFile}
        />

        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            socket.emit("typing", currentUser.name);
          }}
          placeholder="Type your message..."
          className="flex-1 border rounded-xl px-4 py-2"
        />

        <button
          onClick={sendMessage}
          className="bg-teal-600 text-white p-3 rounded-xl"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}

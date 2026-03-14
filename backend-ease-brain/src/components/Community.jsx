import React from "react";
import { FaComments, FaHeart, FaPlusCircle } from "react-icons/fa";

export default function Community() {
  const threads = [
    { title: "Finding balance in daily life", replies: 12, likes: 25 },
    { title: "Overcoming social anxiety", replies: 7, likes: 18 },
    { title: "How do you deal with burnout?", replies: 9, likes: 31 },
    { title: "Mindfulness tips that actually help", replies: 5, likes: 20 },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800 p-8">
      <h1 className="text-4xl font-bold text-teal-600 mb-6 flex items-center gap-2">
        <FaComments /> Welcome to the Community — You’re Not Alone
      </h1>

      <div className="grid gap-4">
        {threads.map((t, i) => (
          <div
            key={i}
            className="border rounded-2xl p-4 hover:shadow-md transition bg-white hover:bg-teal-50"
          >
            <h2 className="text-lg font-semibold text-gray-900">{t.title}</h2>
            <div className="flex justify-between mt-2 text-gray-600 text-sm">
              <span>💬 {t.replies} Replies</span>
              <span>❤️ {t.likes} Likes</span>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-6 bg-teal-600 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-teal-700 transition font-medium">
        <FaPlusCircle /> Start a New Discussion
      </button>

      <div className="mt-10 text-sm text-gray-600 bg-teal-50 p-4 rounded-xl">
        <p className="font-semibold text-teal-700 mb-2">Community Guidelines:</p>
        <ul className="list-disc ml-6 space-y-1">
          <li>Be respectful and kind to others.</li>
          <li>No harmful, triggering, or medical advice.</li>
          <li>Keep discussions supportive and inclusive.</li>
        </ul>
      </div>
    </div>
  );
}

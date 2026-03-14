
import React, { useState } from "react";
import {
  FaEnvelope,
  FaPaperPlane,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import logo from "../assets/logo.jpg";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-50 via-white to-teal-100 text-gray-800">
      {/* Main content container */}
      <main className="flex-1 flex flex-col items-center justify-center py-10 px-4 sm:px-6 md:px-12 lg:px-20 w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="w-full mb-8 flex items-center justify-center text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal-700 flex items-center gap-2 flex-wrap justify-center">
            <FaEnvelope className="text-teal-600" /> Contact EaseBrain
          </h1>
        </div>

        {/* Logo and Intro Section */}
        <div className="flex flex-col items-center text-center mb-10">
          <img
            src={logo}
            alt="EaseBrain Logo"
            className="w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 rounded-full shadow-md border-4 border-teal-100 object-cover mb-3 bg-white animate-pulse"
          />
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700">
            EaseBrain Support Team
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-md">
            We're here to listen and guide you toward better mental clarity 💚
          </p>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-md rounded-2xl p-6 sm:p-8 border border-teal-100 hover:shadow-lg transition"
        >
          <div className="space-y-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border border-teal-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none p-3 w-full rounded-lg transition placeholder-gray-400"
              placeholder="Your Name"
              required
            />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="border border-teal-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none p-3 w-full rounded-lg transition placeholder-gray-400"
              placeholder="Your Email"
              type="email"
              required
            />
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              className="border border-teal-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none p-3 w-full rounded-lg transition placeholder-gray-400"
              rows="4"
              placeholder="Your Message"
              required
            />
            <button
              type="submit"
              className={`mt-2 w-full font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition ${
                submitted
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-teal-600 hover:bg-teal-700 text-white"
              }`}
            >
              <FaPaperPlane />
              {submitted ? "Message Sent!" : "Send Message"}
            </button>
          </div>
        </form>

        {/* Contact Info */}
        <div className="mt-10 text-center px-4">
          <p className="text-gray-700 text-sm sm:text-base">
            📧 Email us at{" "}
            <a
              href="mailto:support@easebrain.com"
              className="text-teal-600 underline hover:text-teal-700"
            >
              support@easebrain.com
            </a>
          </p>

          {/* Social Links */}
          <div className="flex gap-6 sm:gap-8 mt-6 text-xl sm:text-2xl justify-center">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="text-teal-600 hover:text-teal-800 transition transform hover:-translate-y-1"
            >
              <FaTwitter />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="text-teal-600 hover:text-teal-800 transition transform hover:-translate-y-1"
            >
              <FaInstagram />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="text-teal-600 hover:text-teal-800 transition transform hover:-translate-y-1"
            >
              <FaLinkedin />
            </a>
          </div>

          <p className="text-xs sm:text-sm text-gray-500 mt-6 italic max-w-md mx-auto">
            We usually reply within 24–48 hours. Thank you for reaching out 💚
          </p>
        </div>
      </main>

      {/* Footer is rendered by AppLayout for public pages */}
    </div>
  );
}

import React from "react";
import { FaPhoneAlt, FaHeartbeat, FaHandsHelping } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import Footer from "../components/Footer";

export default function Emergency() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-teal-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
      {/* Header with Logo */}
      <div className="w-full bg-white shadow-md py-4 px-4 sm:px-8 mb-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <img src={logo} alt="EaseBrain Logo" className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/")} />
          <h1 className="text-xl sm:text-2xl font-bold text-red-600">Emergency Assistance</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start px-4 sm:px-8 py-10">
        {/* Header */}
        <div className="w-full max-w-3xl flex items-center justify-center mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600 flex items-center gap-2 text-center">
            <FaHeartbeat className="text-xl sm:text-2xl md:text-3xl" />
            Emergency Assistance
          </h1>
        </div>

        {/* Main CTA Message */}
        <p className="text-gray-700 text-center mb-6 max-w-lg text-sm sm:text-base md:text-lg leading-relaxed">
          If you are in immediate danger or thinking of harming yourself, reach out for help
          <strong> right now</strong>. You are important — support is available 24/7.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 w-full justify-center">
          <a
            href="tel:911"
            className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 flex items-center justify-center gap-2 text-sm sm:text-base transition shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            <FaPhoneAlt /> Call 911
          </a>
          <a
            href="tel:988"
            className="bg-teal-600 text-white px-6 py-3 rounded-full hover:bg-teal-700 flex items-center justify-center gap-2 text-sm sm:text-base transition shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            <FaPhoneAlt /> Call 988 Lifeline
          </a>
        </div>

        {/* Supportive Message */}
        <div className="max-w-xl bg-white/60 backdrop-blur-lg p-5 rounded-xl shadow-md border border-white/40 mb-10">
          <p className="text-gray-700 text-center text-sm sm:text-base leading-relaxed">
            You are not alone. Try grounding yourself — place your hand on your chest,
            breathe slowly, and focus on the present moment. Below are calming tools
            to help stabilize your emotions while you seek support.
          </p>
        </div>

        {/* Supportive Videos Section */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">

          {/* Breathing Exercise */}
          <div className="rounded-xl shadow-md hover:shadow-xl transition bg-white p-3">
            <h3 className="text-center text-teal-700 font-semibold mb-2">Guided Breathing</h3>
            <iframe
              width="100%"
              height="220"
              src="https://www.youtube.com/embed/86HUcX8ZtAk"
              title="Breathing Exercise"
              className="rounded-xl"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          {/* Panic Attack Relief */}
          <div className="rounded-xl shadow-md hover:shadow-xl transition bg-white p-3">
            <h3 className="text-center text-teal-700 font-semibold mb-2">Panic Attack Relief</h3>
            <iframe
              width="100%"
              height="220"
              src="https://www.youtube.com/embed/Oa7LRePH1pA"
              title="Panic Attack Help"
              className="rounded-xl"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          {/* Grounding Technique */}
          <div className="rounded-xl shadow-md hover:shadow-xl transition bg-white p-3">
            <h3 className="text-center text-teal-700 font-semibold mb-2">5-4-3-2-1 Grounding</h3>
            <iframe
              width="100%"
              height="220"
              src="https://www.youtube.com/embed/30VMIEmA114"
              title="Grounding Technique"
              className="rounded-xl"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          {/* Calm Anxiety Fast */}
          <div className="rounded-xl shadow-md hover:shadow-xl transition bg-white p-3">
            <h3 className="text-center text-teal-700 font-semibold mb-2">Calm Anxiety Fast</h3>
            <iframe
              width="100%"
              height="220"
              src="https://www.youtube.com/embed/ZToicYcHIOU"
              title="Calm Anxiety"
              className="rounded-xl"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

        </div>

        {/* Support and Encouragement */}
        <div className="text-center max-w-lg mx-auto mb-8">
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            If you can, reach out to a trusted friend or family member. Talking to someone can help you feel safer.
            You deserve help, and you deserve peace.
          </p>
        </div>

      </main>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import {
  FaHome,
  FaUsers,
  FaLifeRing,
  FaDollarSign,
  FaPhoneAlt,
  FaComments,
  FaHeartbeat,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";

export default function CrisisSupport() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (path) => navigate(path);
  const handleNavigateWithHash = (path, hash) => {
    navigate(path);
    setTimeout(() => {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-teal-700">
      {/* NAVBAR — reused EXACTLY from your Features page */}
      <nav
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50
                   w-[95%] sm:w-[90%] md:w-[80%]
                   flex justify-between items-center
                   px-4 sm:px-6 py-3 rounded-2xl
                   bg-white/20 backdrop-blur-xl shadow-lg border border-white/30"
      >
        <div
          onClick={() => handleNavigate("/")}
          className="flex items-center gap-2 text-teal-700 font-extrabold text-base sm:text-lg cursor-pointer"
        >
          <img
            src={logo}
            alt="EaseBrain Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-teal-300 shadow-sm"
          />
          <span className="hidden sm:inline">EaseBrain</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium text-sm lg:text-base">
          <button onClick={() => handleNavigate("/")}>Home</button>
          <button onClick={() => handleNavigate("/features")}>Features</button>
          <button onClick={() => handleNavigate("/easebrain/community")}>Community</button>
          <button className="text-teal-600 font-semibold">Crisis Support</button>
          <button onClick={() => handleNavigate("/pricing")}>Pricing</button>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button onClick={() => handleNavigate("/signin")} className="text-gray-700 hover:text-teal-600 transition-all">
            Sign In
          </button>
          <button
            onClick={() => handleNavigate("/signup")}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-700 transition-all"
          >
            Get Started
          </button>
        </div>

        <div className="flex md:hidden items-center gap-4 text-teal-700 text-lg sm:text-xl">
          <FaHome onClick={() => handleNavigate("/")} className="cursor-pointer hover:text-teal-600" />
          <FaUsers
            onClick={() => handleNavigate("/easebrain/community")}
            className="cursor-pointer hover:text-teal-600"
          />
          <FaLifeRing onClick={() => handleNavigate("/support")} className="cursor-pointer hover:text-teal-600" />
          <FaDollarSign onClick={() => handleNavigate("/pricing")} className="cursor-pointer hover:text-teal-600" />
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main
        className={`flex-1 flex flex-col items-center px-6 md:px-20 lg:px-40 text-center mt-32 mb-24 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <h1 className="text-3xl sm:text-5xl font-bold text-teal-700 mb-4">
          You Are Not Alone.
        </h1>
        <p className="text-gray-600 max-w-2xl text-sm sm:text-base md:text-lg mb-10">
          If you’re feeling overwhelmed, unsafe, or emotionally distressed,
          immediate help is available. Reach out — help is closer than you think.
        </p>

        {/* SUPPORT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {/* Emergency Hotline */}
          <div className="p-6 bg-white shadow-lg rounded-2xl border border-teal-100 hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
            <FaPhoneAlt className="text-teal-600 text-4xl mb-4 mx-auto" />
            <h3 className="font-bold text-xl mb-2">Emergency Hotline</h3>
            <p className="text-gray-600 mb-3">Speak directly to crisis responders.</p>
            <button onClick={() => handleNavigateWithHash("/crisis-hotlines", "immediate-resources")} className="bg-teal-600 text-white px-4 py-2 rounded-lg shadow hover:bg-teal-700 transition">
              Call Now
            </button>
          </div>

          {/* Chat With a Responder */}
          <div className="p-6 bg-white shadow-lg rounded-2xl border border-teal-100 hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
            <FaComments className="text-teal-600 text-4xl mb-4 mx-auto" />
            <h3 className="font-bold text-xl mb-2">Live Crisis Chat</h3>
            <p className="text-gray-600 mb-3">Chat anonymously with trained volunteers.</p>
            <button onClick={() => handleNavigateWithHash("/crisis-hotlines", "immediate-resources")} className="border border-teal-600 text-teal-700 px-4 py-2 rounded-lg hover:bg-teal-50">
              Start Chat
            </button>
          </div>

          {/* Quick Safety Plan */}
          <div className="p-6 bg-white shadow-lg rounded-2xl border border-teal-100 hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
            <FaHeartbeat className="text-teal-600 text-4xl mb-4 mx-auto" />
            <h3 className="font-bold text-xl mb-2">Create Safety Plan</h3>
            <p className="text-gray-600 mb-3">Build a quick safety roadmap tailored to you.</p>
            <button onClick={() => handleNavigateWithHash("/crisis-hotlines", "safety-plan")} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700">
              Build Plan
            </button>
          </div>

          {/* Find Local Support */}
          <div className="p-6 bg-white shadow-lg rounded-2xl border border-teal-100 hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
            <FaMapMarkerAlt className="text-teal-600 text-4xl mb-4 mx-auto" />
            <h3 className="font-bold text-xl mb-2">Find Local Support</h3>
            <p className="text-gray-600 mb-3">Locate nearby crisis centers and therapy groups.</p>
            <button onClick={() => handleNavigateWithHash("/crisis-hotlines", "peer-support")} className="border border-teal-600 text-teal-700 px-4 py-2 rounded-lg hover:bg-teal-50">
              Search
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

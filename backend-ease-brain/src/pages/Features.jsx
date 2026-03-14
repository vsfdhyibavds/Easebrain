
import React, { useEffect, useState } from "react";
import { FaHome, FaUsers, FaLifeRing, FaDollarSign, FaBrain, FaStethoscope, FaShieldAlt, FaChartLine, FaPen, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";

const FeaturesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-teal-700">
      {/* 🌟 Glassy Navigation Bar */}
      <nav
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50
                   w-[95%] sm:w-[90%] md:w-[80%]
                   flex justify-between items-center
                   px-4 sm:px-6 py-3 rounded-2xl
                   bg-white/20 backdrop-blur-xl shadow-lg border border-white/30"
      >
        {/* Logo / Title */}
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

        {/* Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium text-sm lg:text-base">
          <button
            onClick={() => handleNavigate("/")}
            className="hover:text-teal-600 transition-all"
          >
            Home
          </button>
          <button
            onClick={() => handleNavigate("/features")}
            className="text-teal-600 font-semibold"
          >
            Features
          </button>
          <button
            onClick={() => handleNavigate("/easebrain/community")}
            className="hover:text-teal-600 transition-all"
          >
            Community
          </button>
          <button
            onClick={() => handleNavigate("/support")}
            className="hover:text-teal-600 transition-all"
          >
            Crisis Support
          </button>
          <button
            onClick={() => handleNavigate("/pricing")}
            className="hover:text-teal-600 transition-all"
          >
            Pricing
          </button>
        </div>

        {/* Right Side (Login + CTA) */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => handleNavigate("/signin")}
            className="text-gray-700 hover:text-teal-600 transition-all"
          >
            Sign In
          </button>
          <button
            onClick={() => handleNavigate("/signup")}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-700 transition-all"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Icons */}
        <div className="flex md:hidden items-center gap-4 text-teal-700 text-lg sm:text-xl">
          <FaHome
            onClick={() => handleNavigate("/")}
            className="cursor-pointer hover:text-teal-600"
          />
          <FaUsers
            onClick={() => handleNavigate("/easebrain/community")}
            className="cursor-pointer hover:text-teal-600"
          />
          <FaLifeRing
            onClick={() => handleNavigate("/support")}
            className="cursor-pointer hover:text-teal-600"
          />
          <FaDollarSign
            onClick={() => handleNavigate("/pricing")}
            className="cursor-pointer hover:text-teal-600"
          />
        </div>
      </nav>

      {/* Main content area */}
      <main
        className={`flex-1 flex flex-col items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 text-center mt-28 sm:mt-36 mb-16 transition-all duration-1000 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        {/* Badge */}
        <div className="mb-6 mt-12 sm:mt-10">
          <span className="inline-flex items-center bg-teal-100 text-teal-800 font-semibold px-4 py-2 rounded-full text-xs sm:text-sm shadow-sm hover:scale-105 transition-transform duration-300">
            🚀 Comprehensive Mental Health Platform
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">
          All The Tools You Need for <br />
          <span className="text-teal-600">Mental Wellness</span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl text-sm sm:text-base md:text-lg text-gray-600 mb-8 mx-auto px-2">
          Explore EaseBrain’s extensive suite of features designed to support every
          aspect of your mental health journey. From anonymous support to professional
          therapy and crisis care, we provide a holistic approach.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
          <button onClick={() => handleNavigate("/signup")} className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:bg-teal-700 hover:shadow-lg transition-all duration-300 w-full sm:w-auto">
            Start Your Journey →
          </button>
          <button onClick={() => handleNavigate("/contact")} className="border border-teal-600 text-teal-700 px-6 py-3 rounded-lg font-medium hover:bg-teal-50 transition-all duration-300 w-full sm:w-auto">
            Contact Sales
          </button>
        </div>
      </main>

      {/* Features Grid Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-8 md:px-16 lg:px-24 bg-gradient-to-b from-white to-teal-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-teal-900 mb-4">
              Comprehensive Mental Health Tools
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Access a complete suite of features designed to support your mental wellness journey
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-teal-100">
              <div className="bg-teal-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <FaUsers className="text-teal-600 text-2xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-teal-900 mb-2">Community Support</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Connect with peer support groups across 10+ mental health topics. Share experiences, learn from others, and feel less alone.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-teal-100">
              <div className="bg-teal-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <FaBrain className="text-teal-600 text-2xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-teal-900 mb-2">AI Wellness Coach</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Get personalized wellness recommendations, coping strategies, and daily mental health tips powered by AI insights.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-teal-100">
              <div className="bg-teal-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <FaStethoscope className="text-teal-600 text-2xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-teal-900 mb-2">Professional Support</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Find and connect with licensed therapists. Get matched based on your needs, schedule, and preferences.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-teal-100">
              <div className="bg-teal-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <FaLifeRing className="text-teal-600 text-2xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-teal-900 mb-2">Crisis Support</h3>
              <p className="text-sm sm:text-base text-gray-600">
                24/7 access to crisis hotlines and emergency resources. Immediate support when you need it most.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-teal-100">
              <div className="bg-teal-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <FaPen className="text-teal-600 text-2xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-teal-900 mb-2">Journaling & Notes</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Document your thoughts, feelings, and progress. Private journaling space for self-reflection and growth.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-teal-100">
              <div className="bg-teal-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <FaChartLine className="text-teal-600 text-2xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-teal-900 mb-2">Progress Tracking</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Monitor your wellness journey with mood tracking, reminders, and insights into your mental health patterns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-8 md:px-16 lg:px-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-teal-900 mb-4">
              Simple Steps to Get Started
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Begin your mental health journey in just a few minutes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { number: "1", title: "Sign Up", description: "Create your free account in minutes with email or social login" },
              { number: "2", title: "Take Assessment", description: "Complete a brief questionnaire to understand your needs" },
              { number: "3", title: "Explore Resources", description: "Access communities, AI coach, therapy matching, and more" },
              { number: "4", title: "Start Healing", description: "Begin your personalized mental wellness journey today" }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold text-teal-900 text-center mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 text-center">{step.description}</p>
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-6 left-full w-8 h-0.5 bg-teal-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why EaseBrain Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-8 md:px-16 lg:px-24 bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-teal-900 mb-4">
              Why Choose EaseBrain?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              We're committed to making mental health support accessible, affordable, and effective
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {[
              { icon: FaShieldAlt, title: "100% Private & Secure", desc: "Your data is encrypted and confidential. We prioritize your privacy." },
              { icon: FaStethoscope, title: "Holistic Approach", desc: "Combine peer support, AI tools, and professional therapy in one place." },
              { icon: FaDollarSign, title: "Affordable Access", desc: "Free community access + flexible therapy options for all budgets." },
              { icon: FaCheckCircle, title: "Evidence-Based", desc: "All tools designed with input from mental health professionals." },
              { icon: FaUsers, title: "Global Community", desc: "Connect with thousands of supportive people on similar journeys." },
              { icon: FaBrain, title: "Personalized Care", desc: "AI matches you with resources and therapists suited to your needs." }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 sm:gap-6">
                <div className="bg-teal-100 w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="text-teal-600 text-2xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-teal-900 mb-2">{item.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-8 md:px-16 lg:px-24 bg-gradient-to-r from-teal-600 to-teal-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to Transform Your Mental Health?
          </h2>
          <p className="text-base sm:text-lg text-teal-50 mb-8 max-w-2xl mx-auto">
            Join thousands of people taking control of their mental wellness. Start your journey with EaseBrain today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <button
              onClick={() => handleNavigate("/signup")}
              className="bg-white text-teal-600 px-6 sm:px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            >
              Get Started Free
            </button>
            <button
              onClick={() => handleNavigate("/easebrain/community")}
              className="border-2 border-white text-white px-6 sm:px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-all duration-300 w-full sm:w-auto"
            >
              Explore Communities
            </button>
          </div>

          <p className="text-teal-100 text-xs sm:text-sm mt-6">
            No credit card required. Free community access for everyone.
          </p>
        </div>
      </section>

      {/* Footer is rendered by AppLayout for public pages */}
    </div>
  );
};

export default FeaturesSection;
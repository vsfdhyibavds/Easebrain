
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpg";
import SafeSpaceSection from "@/components/SafeSpaceSection";
import { FiGrid, FiLogIn } from "react-icons/fi";


const HomePage = () => {
  const [activeStat, setActiveStat] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Dashboard stats
  const stats = [
    { title: "Mindfulness", value: "87%", description: "Consistent practice", change: "+5%" },
    { title: "Sleep Quality", value: "7.2h", description: "Average per night", change: "+0.8h" },
    { title: "Stress Levels", value: "Low", description: "This week", change: "-12%" },
    { title: "Mood", value: "Positive", description: "Current state", change: "+18%" },
  ];



  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-200 font-sans">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="EaseBrain" className="w-12 h-12 rounded-full object-cover" />
            <span className="text-2xl font-bold text-teal-800">EaseBrain</span>
          </Link>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link to="/features">
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 transition-all duration-300 transform hover:scale-105 rounded-md">
              Features
            </button>
          </Link>
          <Link to="/pricing">
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 transition-all duration-300 transform hover:scale-105 rounded-md">
              Pricing
            </button>
          </Link>

          <Link to="/signin">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 transition-all duration-300 transform hover:scale-105">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Mobile Icons */}
        <div className="flex sm:hidden items-center gap-4 text-teal-700">
          <Link to="/features" className="text-2xl hover:text-teal-800 transition-colors duration-300">
            <FiGrid />
          </Link>
          <Link to="/signin" className="text-2xl hover:text-teal-800 transition-colors duration-300">
            <FiLogIn />
          </Link>
        </div>
      </nav>


      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-28 flex flex-col md:flex-row items-center">
        {/* Left column */}
        <div
          className={`md:w-1/2 mb-12 md:mb-0 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight mb-6">
            Your gateway to better <span className="text-teal-600">mental clarity</span>.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-lg">
            Join thousands using EaseBrain to track, learn, and grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/signup">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-teal-200">
                Get Started
              </Button>
            </Link>
            <Link to="/signin">
              <Button className="border-2 bg-stone-50 border-teal-600 text-teal-600 hover:bg-teal-700 hover:text-white px-8 py-4 text-lg font-medium transition-all duration-300">
                Welcome back
              </Button>
            </Link>
          </div>
        </div>

        {/* Right column - insight card */}
        <div className="md:w-1/2 flex justify-center">
          <div
            className={`bg-white rounded-3xl p-8 shadow-xl max-w-md w-full transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="text-center mb-8">
              <div className="inline-block bg-teal-100 text-teal-800 px-4 py-2 rounded-b-2xl mb-4">
                <span className="text-lg">🌟</span> Daily Insight
              </div>
              <p className="text-xl italic text-gray-700">
                "Consistency is more important than perfection."
              </p>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              {stats.map((stat, index) => (
                <Button
                  key={index}
                  onClick={() => setActiveStat(index)}
                  className={`px-4 py-2 rounded-b-2xl transition-all ${
                    activeStat === index
                      ? "bg-teal-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {stat.title}
                </Button>
              ))}
            </div>

            <div className="bg-teal-50 rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{stats[activeStat].title}</h3>
                <span className="text-sm bg-white px-2 py-1 rounded-full text-green-600">
                  {stats[activeStat].change}
                </span>
              </div>
              <div className="text-3xl font-bold text-teal-700 mb-2">{stats[activeStat].value}</div>
              <p className="text-gray-600">{stats[activeStat].description}</p>
            </div>

            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-700"
                style={{ width: `${activeStat * 25 + 30}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-16">
            How EaseBrain Helps You Grow
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Personalized Tracking", desc: "Monitor your mental wellness with customized metrics", icon: "📊" },
              { title: "Actionable Insights", desc: "Get science-based recommendations tailored to you", icon: "💡" },
              { title: "Community Support", desc: "Connect with others on similar wellness journeys", icon: "👥" },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-teal-50 p-8 rounded-3xl transition-all duration-500 hover:shadow-lg hover:translate-y-2"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SafeSpaceSection />

  {/* Footer is rendered by AppLayout for public pages */}
    </div>
  );
};

export default HomePage;

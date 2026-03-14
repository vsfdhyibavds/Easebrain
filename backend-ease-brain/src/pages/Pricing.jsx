import React, { useEffect } from "react";
import { FaHome, FaUsers, FaLifeRing, FaDollarSign } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";

export default function Pricing() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {}, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };

  // 🌟 Updated plans (Now 4 cards)
  const plans = [
    {
      title: "Free",
      price: "0",
      description: "Great for casual users starting their wellness journey.",
      features: [
        "Access to basic self-help tools",
        "Community support access",
        "Weekly wellness tips",
        "Find a therapist directory",
      ],
      button: "Get Started",
      highlight: false,
    },
    {
      title: "Pro",
      price: "9",
      description: "Perfect for individuals who want structured mental support.",
      features: [
        "Everything in Free",
        "Unlimited mood tracking",
        "Personalized wellness routines",
        "Priority support",
        "Ad-free experience",
      ],
      button: "Upgrade Now",
      highlight: true,
    },
    {
      title: "Therapist",
      price: "29",
      description: "For certified therapists offering virtual or physical sessions.",
      features: [
        "Therapist dashboard",
        "Client management tools",
        "Session scheduling",
        "Private messaging",
        "Verified badge",
      ],
      button: "Join as Therapist",
      highlight: false,
    },
    {
      title: "Caregiver",
      price: "19",
      description: "Designed for caregivers providing emotional and daily support.",
      features: [
        "Caregiver tools & insights",
        "Patient progress monitoring",
        "Shared wellness routines",
        "Resource library access",
        "Support hotline priority",
      ],
      button: "Join as Caregiver",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-teal-700">

      {/* 🌟 NAVBAR */}
      <nav
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50
                   w-[94%] sm:w-[90%] md:w-[82%]
                   flex justify-between items-center
                   px-5 py-3 rounded-2xl
                   bg-white/20 backdrop-blur-xl shadow-lg border border-white/30"
      >
        <div
          onClick={() => handleNavigate("/")}
          className="flex items-center gap-2 text-teal-700 font-extrabold cursor-pointer"
        >
          <img src={logo} alt="EaseBrain Logo" className="w-9 h-9 rounded-full border border-teal-300 shadow-sm" />
          <span className="hidden sm:inline text-lg">EaseBrain</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium text-base">
          <button onClick={() => handleNavigate("/")} className="hover:text-teal-600">Home</button>
          <button onClick={() => handleNavigate("/features")} className="hover:text-teal-600">Features</button>
          <button onClick={() => handleNavigate("/easebrain/community")} className="hover:text-teal-600">Community</button>
          <button onClick={() => handleNavigate("/support")} className="hover:text-teal-600">Crisis Support</button>
          <button onClick={() => handleNavigate("/pricing")} className="text-teal-600 font-bold">Pricing</button>
        </div>

        {/* Sign In / Up */}
        <div className="hidden md:flex items-center gap-4">
          <button onClick={() => handleNavigate("/signin")} className="text-gray-700 hover:text-teal-600">Sign In</button>
          <button onClick={() => handleNavigate("/signup")} className="bg-teal-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-700">
            Get Started
          </button>
        </div>

        {/* MOBILE NAV */}
        <div className="flex md:hidden items-center gap-5 text-teal-700 text-xl">
          <FaHome onClick={() => handleNavigate("/")} className="cursor-pointer hover:text-teal-600" />
          <FaUsers onClick={() => handleNavigate("/easebrain/community")} className="cursor-pointer hover:text-teal-600" />
          <FaLifeRing onClick={() => handleNavigate("/support")} className="cursor-pointer hover:text-teal-600" />
          <FaDollarSign onClick={() => handleNavigate("/pricing")} className="cursor-pointer hover:text-teal-600" />
        </div>
      </nav>

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto mb-16 mt-28 sm:mt-36 px-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Affordable Pricing for Everyone</h1>
        <p className="text-gray-600 text-lg">
          Choose a plan that fits your mental wellness needs.
        </p>
      </motion.div>

      {/* PRICING CARDS — now 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto px-4 sm:px-0">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className={`p-8 rounded-3xl shadow-xl hover:scale-105 transition-transform duration-300 ${
              plan.highlight
                ? "bg-teal-500 text-white border-2 border-cyan-300 shadow-cyan-400/60"
                : "bg-teal-100/40 text-teal-900 border border-teal-200/50"
            }`}
          >
            <h2 className="text-3xl font-semibold text-center mb-4">{plan.title}</h2>
            <p className="text-center mb-6">
              {plan.description}
            </p>
            <div className="text-center mb-8">
              <span className={`text-5xl font-bold ${plan.highlight ? "text-white" : "text-teal-900"}`}>${plan.price}</span>
              <span className={`text-lg ${plan.highlight ? "text-white/80" : "text-teal-800"}`}>/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${plan.highlight ? "bg-white" : "bg-teal-600"}`}></span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              className={`w-full py-3 rounded-xl text-lg font-semibold transition-all ${
                plan.highlight
                  ? "bg-cyan-400 text-blue-950 hover:bg-cyan-300"
                  : "bg-white/20 text-teal-900 hover:bg-white/30"
              }`}
            >
              {plan.button}
            </button>
          </motion.div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto mt-24 text-center px-4">
        <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          If you have more questions, feel free to reach out to our support team anytime.
        </p>
      </div>
    </div>
  );
}

import React from 'react';

const WelcomeSplash = ({ onGetStarted }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-indigo-200 via-blue-100 to-white">
    <div className="max-w-lg w-full p-10 rounded-3xl shadow-xl bg-white text-center border border-indigo-100">
  <img src="/logo.svg" alt="Ease Brain Logo" className="mx-auto mb-8 w-24 h-24 animate-bounce" />
      <h1 className="text-5xl font-black mb-6 text-indigo-800 tracking-tight">Ease Brain</h1>
      <p className="text-lg mb-10 text-gray-600 font-medium">
        Empower your ideas. Connect, create, and thrive with a workspace built for growth and collaboration.
      </p>
      <button
        className="px-10 py-3 bg-indigo-700 text-white rounded-xl font-bold text-xl shadow-lg hover:bg-indigo-800 transition"
        onClick={onGetStarted}
      >
        Get Started
      </button>
    </div>
  </div>
);

export default WelcomeSplash;

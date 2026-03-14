
import React from "react";
import { FaFileContract } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";

export default function Terms() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-teal-50 text-gray-800">
      {/* Header with Logo */}
      <div className="w-full bg-white shadow-md py-4 px-4 sm:px-8 mb-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <img src={logo} alt="EaseBrain Logo" className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/")} />
          <h1 className="text-xl sm:text-2xl font-bold text-teal-700">Terms of Service</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow w-full px-4 sm:px-8 py-10 flex flex-col items-center">
        {/* Header */}
        <div className="w-full max-w-3xl mb-8 flex items-center justify-center text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal-700 flex items-center justify-center gap-2">
            <FaFileContract className="text-teal-600 text-xl sm:text-2xl" />
            Terms of Service
          </h1>
        </div>

        {/* Content Card */}
        <div className="bg-white shadow-md border border-teal-100 rounded-2xl p-6 sm:p-8 w-full max-w-3xl hover:shadow-lg transition-all duration-300">
          <p className="text-gray-700 mb-4 text-sm sm:text-base leading-relaxed">
            Welcome to <span className="font-semibold text-teal-600">EaseBrain</span>.
            By using our website, mobile application, or any of our services, you agree
            to comply with the terms and conditions outlined below. Please read them
            carefully to understand your rights and responsibilities.
          </p>

          <h2 className="text-lg sm:text-xl font-semibold text-teal-700 mt-6 mb-2">
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-700 mb-4 text-sm sm:text-base leading-relaxed">
            By creating an account or accessing EaseBrain, you confirm that you are at least
            16 years old and that you agree to be bound by these Terms of Service and our
            Privacy Policy.
          </p>

          <h2 className="text-lg sm:text-xl font-semibold text-teal-700 mt-6 mb-2">
            2. Community Conduct
          </h2>
          <ul className="list-disc ml-5 sm:ml-6 text-gray-700 space-y-1 text-sm sm:text-base leading-relaxed">
            <li>Be kind and respectful in all forums, discussions, and chat spaces.</li>
            <li>Do not share harmful, hateful, or misleading information.</li>
            <li>Keep all conversations supportive and constructive.</li>
            <li>Do not impersonate others or share private user data.</li>
          </ul>

          <h2 className="text-lg sm:text-xl font-semibold text-teal-700 mt-6 mb-2">
            3. Health Disclaimer
          </h2>
          <p className="text-gray-700 mb-4 text-sm sm:text-base leading-relaxed">
            EaseBrain provides emotional wellness tools and AI-based guidance for support,
            but it is <span className="font-semibold">not a substitute for professional medical advice</span>.
            If you are experiencing severe distress or mental health issues, please seek
            help from a licensed therapist or emergency hotline.
          </p>

          <h2 className="text-lg sm:text-xl font-semibold text-teal-700 mt-6 mb-2">
            4. Limitation of Liability
          </h2>
          <p className="text-gray-700 mb-4 text-sm sm:text-base leading-relaxed">
            While we strive to maintain accurate and safe services, EaseBrain is not
            responsible for any indirect, incidental, or consequential damages arising
            from the use of our platform.
          </p>

          <h2 className="text-lg sm:text-xl font-semibold text-teal-700 mt-6 mb-2">
            5. Account and Data Usage
          </h2>
          <p className="text-gray-700 mb-4 text-sm sm:text-base leading-relaxed">
            You are responsible for maintaining the confidentiality of your account
            credentials. By using EaseBrain, you consent to our handling of data as
            described in our{" "}
            <a
              href="/privacy"
              className="text-teal-600 underline hover:text-teal-700"
            >
              Privacy Policy
            </a>
            .
          </p>

          <h2 className="text-lg sm:text-xl font-semibold text-teal-700 mt-6 mb-2">
            6. Changes to These Terms
          </h2>
          <p className="text-gray-700 mb-6 text-sm sm:text-base leading-relaxed">
            EaseBrain may update these terms periodically to reflect service improvements
            or legal requirements. Continued use after such updates constitutes acceptance
            of the revised Terms of Service.
          </p>

          <p className="text-gray-600 italic text-xs sm:text-sm mt-6">
            Last updated: October 2025
          </p>
        </div>
      </main>

      {/* Footer is rendered by AppLayout for public pages */}
    </div>
  );
}

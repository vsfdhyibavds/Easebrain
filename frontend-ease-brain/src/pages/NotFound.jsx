import React from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpg";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#eafffa]">
      <img src={logo} alt="EaseBrain" className="w-28 h-28 rounded-full mb-6" />
      <h1 className="text-5xl font-bold text-teal-700 mb-4">404</h1>
      <p className="text-xl text-gray-700 mb-6">Sorry, the page you are looking for does not exist.</p>
      <Link to="/easebrain" className="bg-teal-600 text-white px-6 py-2 rounded shadow hover:bg-teal-700">
        Return Home
      </Link>
    </div>
  );
}

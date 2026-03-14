import React from "react";
import { MdChatBubbleOutline } from "react-icons/md";
import { FaUsers, FaLifeRing } from "react-icons/fa";

const supportOptions = [
  {
    title: "Community Support",
    desc: "Connect with a supportive community, share experiences, and find solidarity anonymously.",
    icon: <MdChatBubbleOutline className="text-cyan-400 text-5xl" />,
  },
  {
    title: "Professional Therapy",
    desc: "Access licensed therapists for individual, group, or specialized counseling sessions.",
    icon: <FaUsers className="text-cyan-400 text-5xl" />,
  },
  {
    title: "Crisis Support",
    desc: "Immediate access to crisis hotlines and chat support when you need it most.",
    icon: <FaLifeRing className="text-red-500 text-5xl" />,
  },
];

export default function SafeSpaceSection() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
          A Safe Space for Every Need
        </h2>
        <p className="text-center text-gray-600 mb-16">
          Discover the tools and support systems designed for your wellbeing.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {supportOptions.map((item, index) => (
            <div
              key={index}
              className="bg-teal-50 p-8 rounded-3xl transition-all duration-500 hover:shadow-lg hover:translate-y-2"
            >
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

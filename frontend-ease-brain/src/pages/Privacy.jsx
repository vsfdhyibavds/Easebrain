
import React from "react";
import { FaLock, FaShieldAlt, FaEye, FaUsersCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";

export default function Privacy() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Introduction",
      icon: FaLock,
      content: "Your privacy matters to us. EaseBrain is committed to protecting your personal information and maintaining transparency about how we collect, use, and safeguard your data. This Privacy Policy outlines our data practices."
    },
    {
      title: "2. Information We Collect",
      icon: FaEye,
      content: [
        "Account Information: Email, username, password, first/last name, phone number, location, date of birth",
        "Health Information: Mood logs, emotional check-ins, safety plans, crisis contacts, caregiver notes, and AI chat conversations",
        "Usage Data: Login times, feature interactions, device information, browser type, IP address",
        "Organization Data: If you're with a healthcare organization, your organization affiliation and role"
      ]
    },
    {
      title: "3. How We Use Your Data",
      icon: FaShieldAlt,
      content: [
        "Provide personalized mental health support through our AI chat and mood tracking",
        "Enable caregiver connections and crisis communication",
        "Monitor safety plans and alert caregivers to identified risks",
        "Improve EaseBrain's features and user experience",
        "Send you important service notifications and updates",
        "Comply with legal and healthcare regulations"
      ]
    },
    {
      title: "4. Data Sharing & Access Control",
      icon: FaUsersCog,
      content: [
        "Patients: Only your caregivers and healthcare organization can access your data",
        "Caregivers: You can view safety plans and notes belonging to connected patients",
        "Organizations: Organization admin can see patient/caregiver data within their organization",
        "Third Parties: We do not sell your data. We only share with service providers for hosting, email delivery, and analytics",
        "Legal Requests: We may disclose data when required by law or to prevent harm"
      ]
    },
    {
      title: "5. Data Security",
      content: [
        "All data is encrypted in transit (HTTPS/TLS)",
        "Sensitive data like passwords are hashed and never stored in plain text",
        "Access is restricted to authorized users only",
        "We conduct regular security audits and vulnerability assessments",
        "Our team follows strict data handling procedures"
      ]
    },
    {
      title: "6. Your Rights & Choices",
      content: [
        "Access: Request a copy of your data anytime",
        "Correction: Update or correct inaccurate information",
        "Deletion: Request deletion of your account and associated data (subject to legal requirements)",
        "Opt-Out: Unsubscribe from non-essential communications",
        "Data Portability: Request your data in a portable format",
        "Revoke Caregiver Access: Remove caregivers from your account",
        "To exercise these rights, contact: privacy@easebrain.com"
      ]
    },
    {
      title: "7. Caregiver Privacy",
      content: [
        "Caregivers can only access patient data they're explicitly connected to",
        "Patient safety plans and notes are visible to connected caregivers and organization staff",
        "Caregivers cannot access other patients' data without authorization",
        "All caregiver activity is logged for security and audit purposes"
      ]
    },
    {
      title: "8. Crisis & Emergency Situations",
      content: [
        "If you identify yourself in crisis, we may alert your caregivers and emergency contacts",
        "In life-threatening situations, we may contact emergency services or your emergency contacts",
        "Your safety is our priority; privacy may be temporarily limited in emergency scenarios"
      ]
    },
    {
      title: "9. Children's Privacy",
      content: [
        "EaseBrain is not intended for users under 13",
        "We do not knowingly collect data from children under 13",
        "If we become aware of data from someone under 13, we will delete it immediately",
        "For minors aged 13-18, parents/guardians may request access or deletion of data"
      ]
    },
    {
      title: "10. Data Retention",
      content: [
        "Mood logs & AI chat: Retained while your account is active, deleted 6 months after account closure",
        "Safety plans & caregiver notes: Retained as long as the caregiver relationship is active",
        "Login & activity logs: Retained for 1 year for security purposes",
        "Legal/compliance data: Retained as long as required by law"
      ]
    },
    {
      title: "11. Cookies & Tracking",
      content: [
        "We use cookies to maintain your session and remember your preferences",
        "Cookies do not track you across websites; they're only used within EaseBrain",
        "You can disable cookies in your browser settings, but some features may not work",
        "We use analytics tools to measure app performance and user engagement"
      ]
    },
    {
      title: "12. Third-Party Services",
      content: [
        "SendGrid: Email delivery (privacy policy at sendgrid.com/legal/privacy)",
        "AWS: Data hosting (privacy policy at aws.amazon.com/privacy)",
        "Analytics tools: Usage measurement (non-identifying)",
        "Payment processors: If applicable, PCI-DSS compliant",
        "These services have their own privacy policies; we recommend reviewing them"
      ]
    },
    {
      title: "13. Healthcare Compliance",
      content: [
        "EaseBrain complies with applicable healthcare privacy laws",
        "We follow principles similar to HIPAA (Health Insurance Portability and Accountability Act) for data protection",
        "Organization partners must comply with their local healthcare privacy regulations",
        "Your health information is treated as sensitive data with heightened protection"
      ]
    },
    {
      title: "14. Policy Updates",
      content: [
        "We may update this Privacy Policy as our services evolve",
        "Significant changes will be communicated via email or app notification",
        "Continued use of EaseBrain after updates indicates acceptance of changes",
        "Check this page periodically for the most current policy"
      ]
    },
    {
      title: "15. Contact Us",
      content: [
        "Privacy Concerns: privacy@easebrain.com",
        "Data Requests: support@easebrain.com",
        "General Support: help@easebrain.com",
        "We aim to respond to privacy requests within 30 days"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Logo */}
      <div className="w-full bg-white shadow-md py-4 px-4 sm:px-8 mb-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <img
            src={logo}
            alt="EaseBrain Logo"
            className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-teal-700">Privacy Policy</h1>
            <p className="text-gray-500 text-sm mt-1">Last Updated: February 2026</p>
          </div>
        </div>
      </div>

      <main className="flex-grow px-4 sm:px-8 py-8 flex justify-center bg-gray-50">
        <div className="max-w-4xl w-full">
          {/* Introduction */}
          <div className="bg-teal-50 border-l-4 border-teal-600 p-6 rounded mb-8">
            <p className="text-gray-800 leading-relaxed text-base">
              Your privacy and the security of your mental health information are fundamental to EaseBrain.
              We collect limited, purposeful data to provide personalized mental health support and enable
              caregiver connections. You have full control over your data and may request deletion or corrections
              anytime by contacting <a href="mailto:privacy@easebrain.com" className="text-teal-600 underline font-semibold">privacy@easebrain.com</a>.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8">
            {sections.map((section, idx) => {
              const IconComponent = section.icon;
              return (
                <div key={idx} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4 flex items-center gap-3">
                    {IconComponent && <IconComponent className="text-white text-xl" />}
                    <h2 className="text-xl font-bold text-white">{section.title}</h2>
                  </div>
                  <div className="p-6">
                    {typeof section.content === "string" ? (
                      <p className="text-gray-700 leading-relaxed">{section.content}</p>
                    ) : (
                      <ul className="space-y-3">
                        {section.content.map((item, i) => (
                          <li key={i} className="flex gap-3 text-gray-700 leading-relaxed">
                            <span className="text-teal-600 font-bold mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer CTA */}
          <div className="mt-12 bg-teal-50 border border-teal-200 rounded-lg p-8 text-center">
            <FaShieldAlt className="text-teal-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-teal-900 mb-3">Your Privacy is Our Priority</h3>
            <p className="text-gray-700 mb-6">
              Have questions about our privacy practices? We're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:privacy@easebrain.com"
                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition"
              >
                Contact Privacy Team
              </a>
              <button
                onClick={() => navigate("/")}
                className="border border-teal-600 text-teal-600 px-6 py-2 rounded-lg hover:bg-teal-50 transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

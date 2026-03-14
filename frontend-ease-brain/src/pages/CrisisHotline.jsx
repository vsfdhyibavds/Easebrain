import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPhone,
  FaComment,
  FaShieldAlt,
  FaClock,
  FaUser,
  FaArrowRight,
  FaHeartbeat,
  FaGlobe,
  FaExclamationTriangle,
  FaClipboardList,
  FaLeaf,
  FaBook,
  FaVolumeUp,
  FaDownload,
  FaTimes,
  FaCheck,
  FaVideo,
  FaComments,
  FaExclamationCircle,
  FaCodeBranch,
  FaEye,
  FaBandAid,
  FaFireExtinguisher,
  FaBrain,
  FaSyringe,
  FaQuestionCircle,
  FaHome,
  FaUsers,
  FaLifeRing,
  FaDollarSign,
} from "react-icons/fa";
import logo from "@/assets/logo.jpg";

// Helper to generate consistent anonymous display names
function getAnonymousDisplayName(userId) {
  const hash = Math.abs(userId.toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0));
  return `Anon #${hash % 9999}`;
}

export default function CrisisHotline() {
  const navigate = useNavigate();

  const handleJoinGroup = (communityId) => {
    navigate(`/easebrain/community/${communityId}`);
  };

  // Lightweight string map to make future i18n extraction easier
  const STRINGS = {
    callNow: "Call 988 Now",
    chatNow: "Chat Now",
    joinCommunity: "Join Support Community",
    call: "Call",
    text: "Text",
    call988: "Call 988",
    youMatter: "You Matter",
  };

  // Minimal analytics stub that intentionally avoids sending PII.
  // Replace with a proper analytics implementation that strips PII and respects user privacy.
  const trackEvent = (action) => {
    try {
      if (window && typeof window.dataLayer !== "undefined") {
        window.dataLayer.push({ event: "easebrain_action", action });
      } else if (window && typeof window.gtag === "function") {
        window.gtag("event", action, { event_category: "crisis_hotline", non_interaction: false });
      }
    } catch {
      // swallow errors to avoid breaking UI
      // console.debug("analytics disabled");
    }
  };
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("USA");
  const [showChatWidget, setShowChatWidget] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, type: "bot", message: "Hi there! I'm here to listen. How are you feeling today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [crisisType, setCrisisType] = useState(null);
  const [emergencyConfirm, setEmergencyConfirm] = useState(false);
  const [userLocation, setUserLocation] = useState("USA");
  const [selectedVideoTechnique, setSelectedVideoTechnique] = useState(null);
  const [safetyPlanItems, setSafetyPlanItems] = useState([
    { id: 1, label: "Warning signs", value: "", completed: false },
    { id: 2, label: "Internal coping strategies", value: "", completed: false },
    { id: 3, label: "People and social settings that help", value: "", completed: false },
    { id: 4, label: "Professional contacts", value: "", completed: false },
    { id: 5, label: "Ways to make home safer", value: "", completed: false },
  ]);

  // Victory Stories (user-submitted recovery stories) stored locally for now.
  const [victoryStories, setVictoryStories] = useState(() => {
    try {
      const raw = localStorage.getItem("victoryStories");
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore parse errors
    }
    // sensible defaults to show on first load
    return [
      {
        id: 1,
        title: "Finding Strength in Small Steps",
        author: "Sam",
        anonymous: false,
        userId: 1,
        content:
          "I started with a single walk each day and slowly built routines that helped me feel more grounded. Small steps added up.",
        date: new Date().toISOString(),
      },
      {
        id: 2,
        title: "A New Day",
        author: "",
        anonymous: true,
        userId: 2,
        content: "Sharing my story helped me feel less alone. You don't have to carry it by yourself.",
        date: new Date().toISOString(),
      },
    ];
  });

  const [showVictoryForm, setShowVictoryForm] = useState(false);
  const [victoryForm, setVictoryForm] = useState({ title: "", author: "", content: "", anonymous: false });

  useEffect(() => {
    try {
      localStorage.setItem("victoryStories", JSON.stringify(victoryStories));
    } catch {
      // ignore errors
    }
  }, [victoryStories]);

  function handleVictorySubmit(e) {
    e.preventDefault();
    const content = victoryForm.content.trim();
    if (!content) return;
    const userId = Date.now() % 10000; // unique-ish userId based on timestamp
    const newStory = {
      id: Date.now(),
      title: victoryForm.title || "Untitled",
      author: victoryForm.anonymous ? "" : victoryForm.author.trim() || "",
      anonymous: victoryForm.anonymous,
      userId: victoryForm.anonymous ? userId : 999, // assign a userId for anonymous display name generation
      content,
      date: new Date().toISOString(),
    };
    setVictoryStories((s) => [newStory, ...s]);
    setVictoryForm({ title: "", author: "", content: "", anonymous: false });
    setShowVictoryForm(false);
    trackEvent("submit_victory_story");
  }

  function handleDeleteVictory(id) {
    setVictoryStories((s) => s.filter((st) => st.id !== id));
    trackEvent("delete_victory_story");
  }

  const crisisTypes = [
    { id: "suicidal", label: "Suicidal Thoughts", icon: FaExclamationTriangle, selectedClass: "bg-teal-600 text-white", hoverBorderColor: "#0d9488" },
    { id: "selfharm", label: "Self-Harm", icon: FaBandAid, selectedClass: "bg-teal-500 text-white", hoverBorderColor: "#14b8a6" },
    { id: "domestic", label: "Domestic Violence", icon: FaShieldAlt, selectedClass: "bg-teal-700 text-white", hoverBorderColor: "#115e59" },
    { id: "mental", label: "Mental Health Crisis", icon: FaBrain, selectedClass: "bg-teal-600 text-white", hoverBorderColor: "#0d9488" },
    { id: "substance", label: "Substance Use Crisis", icon: FaSyringe, selectedClass: "bg-teal-500 text-white", hoverBorderColor: "#14b8a6" },
    { id: "other", label: "Other", icon: FaQuestionCircle, selectedClass: "bg-teal-400 text-white", hoverBorderColor: "#2dd4bf" },
  ];

  const groundingTechniques = [
    {
      title: "5-4-3-2-1 Grounding",
      description: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste",
      icon: <FaEye className="text-4xl text-teal-600" />,
      videoUrl: "https://www.youtube.com/embed/We-pjP3m8qA",
      videoTitle: "Learn the 5-4-3-2-1 technique"
    },
    {
      title: "Cold Water Immersion",
      description: "Splash cold water on your face or hold ice cubes for 30 seconds",
      icon: <FaLeaf className="text-4xl text-teal-600" />,
      videoUrl: "https://www.youtube.com/embed/DhRBIe6UzUg",
      videoTitle: "Ice dive reflex technique"
    },
    {
      title: "Box Breathing",
      description: "Breathe in for 4 counts, hold for 4, exhale for 4, hold for 4",
      icon: <FaClipboardList className="text-4xl text-teal-600" />,
      videoUrl: "https://www.youtube.com/embed/U3Y-h5Z_V5U",
      videoTitle: "Guided box breathing"
    },
    {
      title: "Body Scan",
      description: "Mentally scan your body from head to toe, noting sensations",
      icon: <FaBrain className="text-4xl text-teal-600" />,
      videoUrl: "https://www.youtube.com/embed/vF0QsZCLBdQ",
      videoTitle: "Progressive body scan meditation"
    },
  ];

  const features = [
    {
      icon: <FaClock className="text-4xl" />,
      title: "24/7 Availability",
      description: "Crisis support is available around the clock, every day of the year",
    },
    {
      icon: <FaShieldAlt className="text-4xl" />,
      title: "Confidential",
      description: "All conversations are private and confidential",
    },
    {
      icon: <FaUser className="text-4xl" />,
      title: "Trained Professionals",
      description: "Speak with certified crisis intervention specialists",
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah M.",
      role: "Recovered from suicidal thoughts",
      quote: "Calling 988 saved my life. The counselor listened without judgment and helped me see a future I thought didn't exist.",
      avatar: "SM",
      avatarBg: "bg-teal-600",
      outcome: "Now 2 years stable with ongoing support"
    },
    {
      id: 2,
      name: "James T.",
      role: "Managing depression and anxiety",
      quote: "I was terrified to reach out, but the crisis chat was there 24/7. It gave me the push to seek professional help.",
      avatar: "JT",
      avatarBg: "bg-blue-600",
      outcome: "Connected with therapist, medication adjusted"
    },
    {
      id: 3,
      name: "Maria L.",
      role: "Escaped domestic violence",
      quote: "The domestic violence hotline provided immediate safety planning and resource referrals. I'm rebuilding my life safely.",
      avatar: "ML",
      avatarBg: "bg-purple-600",
      outcome: "Safe housing and legal support secured"
    },
    {
      id: 4,
      name: "David K.",
      role: "Overcoming substance addiction",
      quote: "The SAMHSA helpline connected me with treatment options I didn't know existed. Recovery is possible.",
      avatar: "DK",
      avatarBg: "bg-green-600",
      outcome: "6 months sober, attending support groups"
    },
  ];

  const resources = [
    {
      icon: <FaPhone className="text-3xl" />,
      title: "Crisis Hotline",
      description: "Speak with a trained crisis counselor immediately",
      action: "Call 988",
      link: "tel:988",
      badge: "Available 24/7 • Free & Confidential",
    },
    {
      icon: <FaComment className="text-3xl" />,
      title: "Crisis Chat",
      description: "Text with a crisis counselor if you prefer not to call",
      // use SMS scheme for mobile devices; body prefilled with recommended keyword
      action: `Text 741741`,
      link: "sms:741741?body=HELLO",
      badge: "Text HELLO to 741741",
    },
    {
      icon: <FaHeartbeat className="text-3xl" />,
      title: "Support Community",
      description: "Connect with peer support groups tailored to your needs",
      action: "Explore Groups",
      link: "/community",
      badge: "Peer Support Available",
    },
  ];

  const internationalHotlines = {
    USA: [
      { name: "988 Suicide & Crisis Lifeline", number: "988", access: "Call or Text" },
      { name: "Crisis Text Line", number: "Text HOME to 741741", access: "Text" },
      { name: "TTY for Deaf/Hard of Hearing", number: "1-800-799-4889", access: "TTY" },
    ],
    UK: [
      { name: "Samaritans", number: "116 123", access: "Call 24/7" },
      { name: "Crisis Text Line", number: "Text SHOUT to 85258", access: "Text" },
    ],
    Canada: [
      { name: "Talk Suicide Canada", number: "1-833-456-4566", access: "Call 24/7" },
      { name: "Text Message Support", number: "Text TALK to 741741", access: "Text" },
    ],
    Kenya: [
      { name: "Befrienders Kenya", number: "0722 178 177", access: "Call" },
      { name: "MEWA Kenya", number: "0800 77 1111", access: "Call" },
    ],
    Australia: [
      { name: "Lifeline", number: "13 11 14", access: "Call 24/7" },
      { name: "Crisis Text Line", number: "Text 0438 351 497", access: "Text" },
    ],
    India: [
      { name: "iCall", number: "96 5046 2000", access: "Call/Chat" },
      { name: "AASRA", number: "9820 466 726", access: "Call" },
    ],
  };

  const warningSignsOptions = [
    "Talking about wanting to die or feeling hopeless",
    "Talking about being a burden to others",
    "Increasing use of alcohol or drugs",
    "Sleeping more or less than usual",
    "Withdrawing from friends and activities",
    "Giving away possessions",
    "Extreme mood changes",
    "Expressing rage or unbridled anger",
    "Reckless behavior or high-risk activities",
    "Researching ways to harm oneself",
  ];

  const copingStrategies = [
    {
      title: "5-4-3-2-1 Grounding",
      description: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste",
    },
    {
      title: "Box Breathing",
      description: "Breathe in for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat.",
    },
    {
      title: "Progressive Muscle Relaxation",
      description: "Tense each muscle group for 5 seconds, then relax. Start with toes.",
    },
    {
      title: "Mindfulness Walking",
      description: "Take a slow walk and focus on each step, the ground beneath you, and surroundings.",
    },
    {
      title: "Creative Expression",
      description: "Draw, write, sing, or dance without judgment. Let emotions flow naturally.",
    },
    {
      title: "Cold Water Therapy",
      description: "Splash cold water on your face or hold ice cubes. Activates the diving reflex.",
    },
  ];

  const trustedResources = [
    {
      name: "NAMI",
      link: "https://www.nami.org",
      description: "Education, advocacy, and support for mental illness",
    },
    {
      name: "SAMHSA National Helpline",
      link: "https://www.samhsa.gov",
      description: "Free, confidential, 24/7 treatment referral and information service",
    },
    {
      name: "Crisis Text Line",
      link: "https://www.crisistextline.org",
      description: "Text HOME to 741741 for support and crisis resources",
    },
    {
      name: "The Trevor Project",
      link: "https://www.thetrevorproject.org",
      description: "Crisis support for LGBTQ+ individuals",
    },
    {
      name: "National Domestic Violence Hotline",
      link: "https://www.thehotline.org",
      description: "24/7 support for domestic violence survivors",
    },
    {
      name: "Veterans Crisis Line",
      link: "https://www.veteranscrisisline.net",
      description: "Crisis support for veterans and their families",
    },
  ];

  const faqs = [
    {
      question: "Is it really free and confidential?",
      answer:
        "Yes, crisis hotlines and chat services are completely free. Your privacy is protected, and conversations are confidential.",
    },
    {
      question: "What if I'm not sure if I should call?",
      answer:
        "If you're having any thoughts of self-harm or suicide, or if you're in emotional distress, reaching out is always the right choice.",
    },
    {
      question: "Can I speak anonymously?",
      answer:
        "Yes, you can remain anonymous when using crisis chat and hotlines. You don't need to provide personal information.",
    },
    {
      question: "What happens after I call or chat?",
      answer:
        "A trained counselor will listen to you, provide support, and help you develop a safety plan if needed. They can also connect you with local resources.",
    },
  ];

  const assessmentQuestions = [
    {
      id: 1,
      question: "Are you having thoughts of harming yourself or others right now?",
      type: "critical",
      yes: { severity: "SEVERE", action: "Call 911 immediately" },
      no: { severity: "PROCEED", action: "Continue assessment" }
    },
    {
      id: 2,
      question: "Do you have access to means of self-harm (weapons, medications, etc.)?",
      type: "danger",
      yes: { severity: "HIGH", action: "Remove access & call crisis hotline" },
      no: { severity: "MODERATE", action: "Continue" }
    },
    {
      id: 3,
      question: "Do you have a safe place to go right now?",
      type: "safety",
      yes: { severity: "STABLE", action: "Go there & call for support" },
      no: { severity: "HIGH", action: "Crisis hotline can help find shelter" }
    },
    {
      id: 4,
      question: "Do you have someone you trust you could call right now?",
      type: "support",
      yes: { severity: "HAS_SUPPORT", action: "Reach out to them now" },
      no: { severity: "ISOLATED", action: "Crisis services are your support" }
    },
  ];

  const peerSupportGroups = [
    {
      id: 1,
      name: "Suicide Survivors Support",
      crisisType: "suicidal",
      meetings: "Daily 7PM EST, Thursdays 3PM EST",
      description: "Support group for those who have survived suicidal ideation",
      communityId: 1
    },
    {
      id: 2,
      name: "Self-Harm Recovery",
      crisisType: "self-harm",
      meetings: "Mondays & Fridays 6PM EST",
      description: "Peer-led recovery group with harm reduction focus",
      communityId: 7
    },
    {
      id: 3,
      name: "Domestic Violence Survivors",
      crisisType: "domestic",
      meetings: "Tuesdays & Saturdays 5PM EST, Sundays 2PM EST",
      description: "Safe space for survivors rebuilding their lives",
      communityId: 4
    },
    {
      id: 4,
      name: "Mental Health Warriors",
      crisisType: "mental-health",
      meetings: "Daily 4PM EST, Evenings 8PM EST",
      description: "Community supporting mental health recovery and wellness",
      communityId: 2
    },
    {
      id: 5,
      name: "Addiction Recovery Circle",
      crisisType: "substance",
      meetings: "Daily 10AM EST, 6PM EST, 9PM EST",
      description: "12-step based and alternative recovery approaches",
      communityId: 6
    },
  ];

  const escalationGuide = [
    {
      scenario: "Having active suicidal thoughts with a plan",
      action: "CALL 911",
      reason: "Immediate danger to life"
    },
    {
      scenario: "Experiencing severe panic/flashbacks, feeling unsafe",
      action: "CALL 911",
      reason: "May need immediate medical evaluation"
    },
    {
      scenario: "Threat of harm to others nearby",
      action: "CALL 911",
      reason: "Public safety risk"
    },
    {
      scenario: "Suicidal thoughts but no plan",
      action: "CALL 988",
      reason: "Crisis hotline can provide immediate support"
    },
    {
      scenario: "Self-harm urges, need grounding & coping strategies",
      action: "CALL 988 or TEXT 'HELLO' to 741741",
      reason: "Crisis services can help right now"
    },
    {
      scenario: "Domestic violence in progress",
      action: "CALL 911 + 1-800-799-7233",
      reason: "Safety first, then expert support"
    },
    {
      scenario: "Not in crisis but struggling, need ongoing support",
      action: "CALL therapist or scheduled appointment",
      reason: "Regular care is appropriate, not crisis response"
    },
  ];

  const handleSafetyPlanChange = (id, value) => {
    setSafetyPlanItems(
      safetyPlanItems.map((item) => (item.id === id ? { ...item, value, completed: value.length > 0 } : item))
    );
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, { id: Date.now(), type: "user", message: chatInput }]);
      setChatInput("");
      // Simulate bot response
      setTimeout(() => {
        const responses = [
          "I hear you. Thank you for sharing. What's one thing that helped you feel better recently?",
          "That sounds really difficult. You're doing great by reaching out.",
          "I'm here to listen. Take your time.",
          "It's okay to feel overwhelmed. You're not alone in this.",
        ];
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          type: "bot",
          message: responses[Math.floor(Math.random() * responses.length)]
        }]);
      }, 500);
    }
  };

  const downloadSafetyPlan = () => {
    // Build HTML content with safety plan items
    let itemsHtml = safetyPlanItems.map(item => {
      return `<div class="item"><div class="label">${item.label}</div><div style="color: #555; margin-top: 5px;">${item.value || '(Not filled in)'}</div></div>`;
    }).join('');

    const currentDate = new Date().toLocaleDateString();

    // Create HTML content for printing/PDF
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Crisis Safety Plan</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    h1 { color: #0D9488; text-align: center; }
    .item { margin: 15px 0; padding: 10px; border-left: 4px solid #0D9488; background: #f0f9f8; }
    .label { font-weight: bold; color: #0D9488; }
    .emergency { margin-top: 20px; padding: 15px; background: #FFE5E5; border: 2px solid #FF6B6B; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <h1>Crisis Safety Plan</h1>
  <p style="text-align: center;">Personal Crisis Management & Safety Strategy</p>
  <div class="content">
    ${itemsHtml}
  </div>
  <div class="emergency">
    <div style="font-weight: bold; color: #FF6B6B;">🚨 IN IMMEDIATE CRISIS:</div>
    <p>Call 911 or go to your nearest emergency room</p>
    <p>National Suicide Prevention Lifeline: <strong>988</strong></p>
    <p>Crisis Text Line: Text <strong>HOME</strong> to <strong>741741</strong></p>
  </div>
  <div class="footer">
    <p>Generated on ${currentDate} | Ease Brain Crisis Safety Tool</p>
    <p>Keep this plan accessible for times of crisis</p>
  </div>
  <script>
    window.print();
  </script>
</body>
</html>`;

    // Open in new window for printing/saving as PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  const safetyPlanProgress = Math.round((safetyPlanItems.filter(item => item.completed).length / safetyPlanItems.length) * 100);

  // Crisis-specific hotline mapping
  const crisisHotlineMap = {
    suicidal: {
      primary: "988",
      name: "National Suicide Prevention Lifeline",
      features: ["Call anytime", "Free & confidential", "Trained counselors"]
    },
    "self-harm": {
      primary: "1-800-DONT-CUT",
      name: "Crisis Text Line",
      features: ["Text HOME to 741741", "24/7 support", "Anonymous"]
    },
    domestic: {
      primary: "1-800-799-7233",
      name: "National Domestic Violence Hotline",
      features: ["Confidential", "No judgment", "Safety planning"]
    },
    "mental-health": {
      primary: "1-800-950-NAMI",
      name: "NAMI Helpline",
      features: ["Mental health info", "Peer support", "Resource navigation"]
    },
    substance: {
      primary: "1-800-662-4357",
      name: "SAMHSA National Helpline",
      features: ["Substance abuse help", "Free & confidential", "Referrals available"]
    },
    other: {
      primary: "2-1-1",
      name: "211 - Community Resources",
      features: ["Local services", "Basic needs help", "Emergency assistance"]
    }
  };

  const handleEmergencyCall = () => {
    if (crisisType && crisisHotlineMap[crisisType]) {
      const phoneNumber = crisisHotlineMap[crisisType].primary.replace(/[^\d]/g, '');
      trackEvent(`call_emergency_${phoneNumber}`);
      window.location.href = `tel:${phoneNumber}`;
    }
    setEmergencyConfirm(false);
  };

  const detectUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // In a real app, you'd reverse geocode coordinates to get country
          // For now, we'll set a default and let user select
          setUserLocation("USA");
        },
        () => {
          console.log("Location detection failed");
          setUserLocation("USA");
        }
      );
    } else {
      setUserLocation("USA");
    }
  };

  React.useEffect(() => {
    detectUserLocation();
  }, []);

  // Helpers for phone/sms links
  const sanitizeDigits = (text = "") => (text || "").toString().replace(/[^\d+]/g, "");
  const extractFirstDigits = (text = "") => {
    const m = (text || "").match(/\d+/g);
    return m ? m.join("") : null;
  };

  // Handle ESC key to close emergency modal
  React.useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && emergencyConfirm) {
        setEmergencyConfirm(false);
      }
    };

    if (emergencyConfirm) {
      window.addEventListener("keydown", handleEscapeKey);
      return () => window.removeEventListener("keydown", handleEscapeKey);
    }
  }, [emergencyConfirm]);

  return (
    <div role="main" className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-slate-900 dark:to-slate-800 font-sans">
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
          onClick={() => navigate("/")}
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
            onClick={() => navigate("/")}
            className="hover:text-teal-600 transition-all"
          >
            Home
          </button>
          <button
            onClick={() => navigate("/features")}
            className="hover:text-teal-600 transition-all"
          >
            Features
          </button>
          <button
            onClick={() => navigate("/easebrain/community")}
            className="hover:text-teal-600 transition-all"
          >
            Community
          </button>
          <button
            onClick={() => navigate("/support")}
            className="text-teal-600 font-semibold"
          >
            Crisis Support
          </button>
          <button
            onClick={() => navigate("/pricing")}
            className="hover:text-teal-600 transition-all"
          >
            Pricing
          </button>
        </div>

        {/* Right Side (Login + CTA) */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => navigate("/signin")}
            className="text-gray-700 hover:text-teal-600 transition-all"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-700 transition-all"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Icons */}
        <div className="flex md:hidden items-center gap-4 text-teal-700 text-lg sm:text-xl">
          <FaHome
            onClick={() => navigate("/")}
            className="cursor-pointer hover:text-teal-600"
          />
          <FaUsers
            onClick={() => navigate("/easebrain/community")}
            className="cursor-pointer hover:text-teal-600"
          />
          <FaLifeRing
            onClick={() => navigate("/support")}
            className="cursor-pointer hover:text-teal-600"
          />
          <FaDollarSign
            onClick={() => navigate("/pricing")}
            className="cursor-pointer hover:text-teal-600"
          />
        </div>
      </nav>

      {/* Hero Section */}
      <section id="immediate-resources" className="max-w-7xl mx-auto px-6 py-16 text-center mt-28 sm:mt-36 mb-16" role="region" aria-label="Crisis hero">
        <div className="mb-6 inline-block px-4 py-2 bg-teal-100 dark:bg-teal-900 rounded-full">
          <p className="text-teal-700 dark:text-teal-300 font-semibold">You Matter</p>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Crisis Support & Help</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Immediate help is available 24/7. You are not alone. If you're having thoughts of suicide
          or self-harm, please reach out for help immediately. Your life has value, and there are
          people who want to help you through this difficult time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a
            href="tel:988"
            aria-label="Call 988 now"
            onClick={() => trackEvent("call_988_hero")}
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <FaPhone /> {STRINGS.callNow}
          </a>
          <button
            onClick={() => setShowChatWidget(!showChatWidget)}
            aria-pressed={showChatWidget}
            onMouseDown={() => trackEvent("open_chat_widget")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 hover:shadow-lg"
          >
            <FaComments /> {STRINGS.chatNow}
          </button>
          <Link
            to="/community"
            className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 hover:shadow-md px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
          >
            {STRINGS.joinCommunity}
          </Link>
        </div>

        {/* Crisis Type Selector */}
        <div className="mb-8">
          <p className="text-center text-gray-600 dark:text-gray-400 mb-4 font-semibold">What kind of support do you need?</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {crisisTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setCrisisType(type.id)}
                  aria-pressed={crisisType === type.id}
                  style={{
                    color: crisisType === type.id ? 'white' : 'black',
                    backgroundColor: crisisType === type.id ? undefined : 'white',
                  }}
                  className={`p-4 rounded-lg transition-all text-sm font-black transform hover:scale-110 flex flex-col items-center justify-center gap-2 h-auto border-2 ${
                    crisisType === type.id
                      ? `${type.selectedClass} shadow-lg scale-105`
                      : `dark:bg-slate-800 dark:text-white border-gray-200 dark:border-gray-700 hover:shadow-md`
                  }`}
                  onMouseEnter={(e) => {
                    if (crisisType !== type.id) {
                      e.currentTarget.style.borderColor = type.hoverBorderColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (crisisType !== type.id) {
                      e.currentTarget.style.borderColor = '';
                    }
                  }}
                >
                  <IconComponent className={`text-3xl ${crisisType === type.id ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`} aria-hidden="true" />
                  <span className="text-center leading-tight">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Emergency Button with Crisis-Specific Hotline */}
        {crisisType && crisisHotlineMap[crisisType] && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationCircle className="text-red-600 dark:text-red-400 text-2xl" />
              <div>
                <h3 className="font-bold text-red-700 dark:text-red-300">{crisisHotlineMap[crisisType].name}</h3>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {crisisHotlineMap[crisisType].features.join(" • ")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setEmergencyConfirm(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              <FaPhone /> Call {crisisHotlineMap[crisisType].primary}
            </button>
          </div>
        )}
      </section>

      {/* Victory Stories */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-4xl font-bold text-gray-900">
              <FaHeartbeat className="inline mr-3 text-teal-600" /> Victory Stories
            </h2>
            <button
              onClick={() => setShowVictoryForm(!showVictoryForm)}
              className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded"
            >
              {showVictoryForm ? "Close" : "Share your story"}
            </button>
          </div>

          {showVictoryForm && (
            <form onSubmit={handleVictorySubmit} className="bg-teal-50 p-6 rounded-lg mb-8 border-2 border-teal-200 hover:border-teal-400 transition-colors shadow-md">
              <div className="grid gap-4">
                <input
                  value={victoryForm.title}
                  onChange={(e) => setVictoryForm({ ...victoryForm, title: e.target.value })}
                  placeholder="Title (optional)"
                  className="p-3 border-2 border-teal-200 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all hover:border-teal-400 hover:shadow-sm"
                />
                {!victoryForm.anonymous && (
                  <input
                    value={victoryForm.author}
                    onChange={(e) => setVictoryForm({ ...victoryForm, author: e.target.value })}
                    placeholder="Your name (optional)"
                    className="p-3 border-2 border-teal-200 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all hover:border-teal-400 hover:shadow-sm"
                  />
                )}
                <textarea
                  value={victoryForm.content}
                  onChange={(e) => setVictoryForm({ ...victoryForm, content: e.target.value })}
                  rows={5}
                  placeholder="Share what helped you or what recovery looks like for you..."
                  className="p-3 border-2 border-teal-200 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all hover:border-teal-400 hover:shadow-md resize-none"
                />
                <label className="flex items-center gap-2 text-sm cursor-pointer group hover:text-teal-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={victoryForm.anonymous}
                    onChange={(e) => setVictoryForm({ ...victoryForm, anonymous: e.target.checked })}
                    className="cursor-pointer accent-teal-600 hover:accent-teal-700 transition-colors"
                  />
                  Post anonymously
                </label>
                <div className="flex gap-2">
                  <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg">
                    Post
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowVictoryForm(false);
                      setVictoryForm({ title: "", author: "", content: "", anonymous: false });
                    }}
                    className="bg-white border-2 border-teal-200 text-teal-600 hover:bg-teal-50 hover:border-teal-400 py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {victoryStories.length === 0 ? (
              <p className="text-gray-600">Be the first to share a recovery story.</p>
            ) : (
              victoryStories.map((st) => {
                const displayAuthor = st.anonymous ? getAnonymousDisplayName(st.userId) : st.author;
                return (
                  <article key={st.id} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-teal-600 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">{st.title}</h3>
                      <span className="text-xs text-gray-500">{new Date(st.date).toLocaleDateString()}</span>
                    </div>
                    {st.anonymous && (
                      <div className="flex items-center gap-1 text-xs text-purple-600 mb-2">
                        <FaEye className="w-3 h-3" /> Anonymous
                      </div>
                    )}
                    <p className="text-gray-700 mt-3 whitespace-pre-line group-hover:text-gray-800 transition-colors">{st.content}</p>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-500">— {displayAuthor}</div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            try {
                            navigator.clipboard?.writeText(st.content);
                          } catch {
                            // ignore errors
                          }
                          // analytics disabled
                        }}
                        className="text-sm text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1 rounded-lg font-semibold transition-all duration-200 transform hover:scale-110"
                      >
                        Copy
                      </button>
                      <button onClick={() => handleDeleteVictory(st.id)} className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg font-semibold transition-all duration-200 transform hover:scale-110">
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
                );
              })
            )}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Stories are public and saved locally in your browser. Do not share personal identifying information. For moderation
            or persistent sharing, contact the team.
          </p>
        </div>
      </section>

      {/* Chat Widget Modal */}
      {showChatWidget && (
        <div className="fixed bottom-0 right-0 m-6 w-96 max-w-full bg-white dark:bg-slate-800 rounded-lg shadow-2xl z-50 flex flex-col h-96">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">Crisis Support Chat</h3>
            <button onClick={() => setShowChatWidget(false)} aria-label="Close chat" className="hover:bg-blue-700 p-1 rounded">
              <FaTimes />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" role="log" aria-live="polite" aria-label="Chat messages">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.type === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none"
                }`}>
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleChatSubmit} className="border-t dark:border-gray-700 p-3 flex gap-2 hover:bg-blue-50 dark:hover:bg-slate-700/30 transition-colors rounded-b-lg" aria-label="Chat input form">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message..."
              aria-label="Type your message"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-md">
              Send
            </button>
          </form>
        </div>
      )}

      {/* Quick Resources */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {resources.map((resource, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-teal-600 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 group"
            >
              <div className="text-teal-600 mb-4 group-hover:scale-110 transition-transform duration-300">{resource.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{resource.title}</h3>
              <p className="text-gray-600 mb-4">{resource.description}</p>
              <p className="text-sm text-teal-600 font-semibold mb-4">{resource.badge}</p>
              <a
                href={resource.link}
                onClick={() => trackEvent(`resource_${resource.action.replace(/\s+/g, "_").toLowerCase()}`)}
                aria-label={resource.action}
                className="inline-flex items-center gap-2 bg-teal-100 text-teal-600 hover:bg-teal-200 px-4 py-2 rounded-lg font-semibold transition-all duration-300 group-hover:translate-x-1"
              >
                {resource.action} <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-teal-600 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Why Choose Our Crisis Support
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-8 text-center text-white hover:bg-opacity-30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex justify-center mb-4 text-teal-600 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-teal-700 transition-colors">{feature.title}</h3>
                <p className="text-gray-900 font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gradient-to-r from-blue-50 to-teal-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
            Stories of Hope & Recovery
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Real people sharing how crisis support transformed their lives
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-teal-600 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-3 mb-4 group-hover:scale-105 transition-transform">
                  <div className={`${testimonial.avatarBg} text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-lg group-hover:scale-125 transition-transform duration-300 shadow-md`}>{testimonial.avatar}</div>
                  <div className="group-hover:translate-x-1 transition-transform">
                    <p className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{testimonial.name}</p>
                    <p className="text-sm text-teal-600 font-semibold group-hover:text-teal-700">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic mb-4 group-hover:text-gray-800 transition-colors">"{testimonial.quote}"</p>
                <div className="border-t pt-4 group-hover:border-teal-300 transition-colors">
                  <p className="text-sm font-semibold text-green-600 group-hover:text-green-700 transition-colors">✓ {testimonial.outcome}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* International Hotlines */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
          <FaGlobe className="inline mr-3 text-teal-600" /> International Crisis Hotlines
        </h2>
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {Object.keys(internationalHotlines).map((country) => (
            <button
              key={country}
              onClick={() => setSelectedCountry(country)}
              className={`px-5 py-2 rounded-lg font-semibold transition-all transform hover:scale-110 duration-300 ${
                selectedCountry === country
                  ? "bg-teal-600 text-white shadow-lg scale-105"
                  : "bg-gray-200 text-gray-800 hover:bg-teal-100 hover:text-teal-700 hover:shadow-md"
              }`}
            >
              {country}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {internationalHotlines[selectedCountry].map((hotline, idx) => {
            const maybeDigits = extractFirstDigits(hotline.number) || extractFirstDigits(hotline.access);
            const isText = /text/i.test(hotline.number) || /text/i.test(hotline.access) || /^Text\s+/i.test(hotline.number);
            const telHref = maybeDigits ? `tel:${sanitizeDigits(maybeDigits)}` : null;
            const smsHref = maybeDigits ? `sms:${sanitizeDigits(maybeDigits)}` : null;

            return (
              <div key={idx} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-teal-600 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">{hotline.name}</h3>
                <p className="text-teal-600 font-semibold text-lg mb-3 group-hover:text-teal-700 transition-colors">{hotline.number}</p>
                <p className="text-gray-600 mb-4 group-hover:text-gray-800 transition-colors">{hotline.access}</p>

                <div className="flex gap-3 flex-wrap group-hover:gap-4 transition-all">
                  {telHref && (
                    <a
                      href={telHref}
                      onClick={() => trackEvent(`call_international_${sanitizeDigits(maybeDigits)}`)}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold text-sm hover:bg-teal-700 transition-all duration-200 transform hover:scale-105"
                      aria-label={`Call ${hotline.name}`}
                    >
                      <FaPhone className="inline mr-2" /> {STRINGS.call}
                    </a>
                  )}

                  {isText && smsHref && (
                    <a
                      href={smsHref}
                      onClick={() => trackEvent(`text_international_${sanitizeDigits(maybeDigits)}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                      aria-label={`Text ${hotline.name}`}
                    >
                      <FaComment className="inline mr-2" /> {STRINGS.text}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Warning Signs */}
      <section className="bg-gradient-to-r from-red-50 to-orange-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
            <FaExclamationTriangle className="inline mr-3 text-red-600" /> Warning Signs
          </h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            If you or someone you know shows these signs, crisis support can help:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {warningSignsOptions.map((sign, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-4 border-l-4 border-red-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group hover:bg-red-50 dark:hover:bg-red-900/10"
              >
                <p className="text-gray-800 font-medium group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">{sign}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Crisis Assessment Tool */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
            <FaExclamationCircle className="inline mr-3 text-orange-600" /> Quick Crisis Assessment
          </h2>
          <p className="text-center text-gray-600 mb-10">
            Answer these questions to help determine what level of support you need right now
          </p>

          <div className="space-y-6">
            {assessmentQuestions.map((q) => (
              <div key={q.id} className="border-l-4 border-orange-500 pl-6 py-4 bg-orange-50 rounded-r-lg">
                <p className="font-semibold text-gray-900 mb-3">{q.question}</p>
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-sm font-semibold rounded-lg transition-all transform hover:scale-105">
                    Yes
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 hover:shadow-sm font-semibold rounded-lg transition-all transform hover:scale-105">
                    No
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm font-semibold rounded-lg transition-all transform hover:scale-105">
                    Unsure
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-2 border-red-200">
            <p className="font-semibold text-red-700 mb-3">⚠️ If you answered YES to question 1 or 2:</p>
            <p className="text-red-600 font-bold text-lg mb-4">CALL 911 IMMEDIATELY</p>
            <p className="text-gray-700">Your safety is the top priority. Emergency services can help right now.</p>
          </div>
        </div>
      </section>

      {/* Interactive Safety Plan Builder */}
      <section id="safety-plan" className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
          <FaClipboardList className="inline mr-3 text-teal-600" /> Create Your Safety Plan
        </h2>
        <p className="text-center text-gray-600 mb-10">
          A safety plan helps you recognize warning signs and identifies coping strategies you can
          use during a crisis.
        </p>

        {/* Progress Bar */}
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-700">Completion Progress</span>
            <span className="text-teal-600 font-bold">{safetyPlanProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-teal-600 h-full transition-all duration-300"
              style={{ width: `${safetyPlanProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {safetyPlanItems.filter(item => item.completed).length} of {safetyPlanItems.length} sections completed
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {safetyPlanItems.map((item) => (
            <div key={item.id} className="border-l-4 border-teal-600 pl-6 py-2 hover:bg-teal-50 dark:hover:bg-slate-700/30 rounded transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors cursor-pointer">
                  {item.label}
                </label>
                {item.completed && <FaCheck className="text-green-500 text-lg animate-pulse" />}
              </div>
              <textarea
                value={item.value}
                onChange={(e) => handleSafetyPlanChange(item.id, e.target.value)}
                placeholder={`Enter your ${item.label.toLowerCase()}...`}
                className="w-full p-3 border border-teal-200 dark:border-teal-700 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-md group-hover:bg-white dark:group-hover:bg-slate-600"
                rows="3"
              />
            </div>
          ))}
          <button
            onClick={downloadSafetyPlan}
            disabled={safetyPlanProgress === 0}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 hover:shadow-lg disabled:hover:scale-100"
          >
            <FaDownload /> Download Safety Plan ({safetyPlanProgress}% complete)
          </button>
        </div>
      </section>

      {/* Grounding Techniques Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
          <FaVideo className="inline mr-3 text-teal-600" /> Grounding Techniques
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {groundingTechniques.map((technique, idx) => (
            <div key={idx} className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-lg p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
              <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">{technique.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{technique.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">{technique.description}</p>
              {technique.videoUrl && (
                <button
                  onClick={() => setSelectedVideoTechnique(technique)}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 transform hover:scale-110 shadow-md hover:shadow-lg"
                >
                  <FaVideo className="text-sm" /> Watch Video
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Self-Care Tips */}
      <section className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">
            <FaLeaf className="inline mr-3 text-green-600" /> Quick Coping Techniques
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {copingStrategies.map((strategy, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{strategy.title}</h3>
                <p className="text-gray-700 dark:text-gray-300">{strategy.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Crisis Resources Directory */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
          <FaBook className="inline mr-3 text-teal-600" /> Trusted Organizations & Resources
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {trustedResources.map((org, idx) => (
            <a
              key={idx}
              href={org.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-teal-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <h3 className="text-xl font-bold text-teal-600 mb-2 group-hover:text-teal-700 transition-colors">{org.name}</h3>
              <p className="text-gray-700">{org.description}</p>
              <p className="text-teal-500 text-sm mt-3 flex items-center gap-1 group-hover:text-teal-700 transition-colors">
                Visit <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            <FaVolumeUp className="inline mr-3 text-teal-600" /> Accessibility Options
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Deaf & Hard of Hearing</h3>
              <p className="text-gray-700 mb-4">
                TTY services are available for those who are deaf or hard of hearing:
              </p>
              <p className="text-lg font-semibold text-teal-600">TTY: 1-800-799-4889</p>
              <p className="text-sm text-gray-600 mt-2">Or use video relay services available 24/7</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Speech/Language Disabilities</h3>
              <p className="text-gray-700 mb-4">
                All hotlines are trained to work with individuals with communication disabilities.
                Text, chat, and relay services are available.
              </p>
              <p className="text-sm text-gray-600 mt-4">
                Most services do not require payment or insurance information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Message */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-2xl p-12 border-2 border-teal-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">You Are Not Alone</h2>
          <p className="text-lg text-gray-700 mb-8">
            Whether you're struggling with depression, anxiety, suicidal thoughts, or any other
            crisis, there are trained professionals ready to listen and help. Your feelings are
            valid, and reaching out is a sign of strength, not weakness.
          </p>
          <div className="bg-white rounded-lg p-6 inline-block">
            <p className="text-xl font-bold text-teal-600 mb-2">
              National Suicide Prevention Lifeline
            </p>
            <p className="text-2xl font-bold text-gray-900">988</p>
            <p className="text-gray-600 mt-2">Available 24/7 • Call or Text • Free & Confidential</p>
          </div>
        </div>
      </section>

      {/* Peer Support Communities */}
      <section id="peer-support" className="bg-gradient-to-r from-teal-50 to-cyan-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
            <FaComments className="inline mr-3 text-teal-600" /> Peer Support Communities
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Connect with others who understand your journey. Join moderated peer support groups.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {peerSupportGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-l-4 border-teal-600 cursor-pointer group flex flex-col">
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">{group.name}</h3>
                <p className="text-sm text-gray-600 mb-3 group-hover:text-teal-700 transition-colors flex-grow">{group.description}</p>
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-teal-600 font-semibold group-hover:text-teal-700 transition-colors">📅 {group.meetings}</p>
                </div>
                <button
                  onClick={() => handleJoinGroup(group.communityId)}
                  className="w-full text-center bg-teal-600 hover:bg-teal-700 hover:scale-105 text-white py-2 rounded-lg font-semibold transition-all duration-200 text-sm cursor-pointer mt-auto"
                >
                  Join Group
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-teal-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full flex justify-between items-center p-6 bg-white hover:bg-teal-50 hover:shadow-md transition-all duration-300 group"
              >
                <h3 className="text-lg font-semibold text-gray-900 text-left group-hover:text-teal-600 transition-colors">{faq.question}</h3>
                <span
                  className={`text-teal-600 text-2xl transition-transform duration-300 group-hover:text-teal-700 ${
                    expandedFaq === idx ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
              {expandedFaq === idx && (
                <div className="p-6 bg-teal-50 border-t border-teal-200">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Crisis Escalation Guide */}
      <section className="bg-gradient-to-r from-yellow-50 to-orange-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
            <FaCodeBranch className="inline mr-3 text-orange-600" /> When to Escalate: 911 vs Crisis Hotline
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Not sure what to do? Use this guide to determine the right level of support right now.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-red-50 border-2 border-red-600 rounded-lg p-6">
              <div className="bg-red-600 text-white font-bold text-lg p-3 rounded-lg mb-4 text-center">
                CALL 911
              </div>
              <ul className="space-y-3">
                {escalationGuide.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="text-sm">
                    <p className="font-semibold text-red-700 mb-1">{item.scenario}</p>
                    <p className="text-gray-600 text-xs italic">{item.reason}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-6">
              <div className="bg-blue-600 text-white font-bold text-lg p-3 rounded-lg mb-4 text-center">
                CALL 988
              </div>
              <ul className="space-y-3">
                {escalationGuide.slice(3, 5).map((item, idx) => (
                  <li key={idx} className="text-sm">
                    <p className="font-semibold text-blue-700 mb-1">{item.scenario}</p>
                    <p className="text-gray-600 text-xs italic">{item.reason}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 border-2 border-green-600 rounded-lg p-6">
              <div className="bg-green-600 text-white font-bold text-lg p-3 rounded-lg mb-4 text-center">
                OTHER SUPPORT
              </div>
              <ul className="space-y-3">
                {escalationGuide.slice(5).map((item, idx) => (
                  <li key={idx} className="text-sm">
                    <p className="font-semibold text-green-700 mb-1">{item.scenario}</p>
                    <p className="text-gray-600 text-xs italic">{item.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Crisis Escalation Guide */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-900/10 dark:via-orange-900/10 rounded-xl p-8">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-4">
            <FaCodeBranch className="inline mr-3 text-red-600" /> When to Call 911 vs Crisis Hotline
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Use this quick decision guide to help determine the most appropriate action in an emergency.
          </p>

          <div className="space-y-4">
            {escalationGuide.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-5 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-gray-900 dark:text-white flex-1">{item.scenario}</p>
                  <span className={`px-3 py-1 rounded-full font-bold text-sm ml-4 whitespace-nowrap ${
                    item.action.includes('911')
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}>
                    {item.action.includes('911') ? '911' : item.action.split(' ')[0]}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Action:</strong> {item.action}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  💡 {item.reason}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-600 p-6 rounded-r-lg">
            <p className="text-red-700 dark:text-red-300 font-bold mb-2">⚡ REMEMBER: When in doubt, CALL 911</p>
            <p className="text-red-600 dark:text-red-400 text-sm">
              Your safety is the priority. Emergency responders are trained to help in any life-threatening situation.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-700 py-16 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Support?</h2>
          <p className="text-xl text-teal-100 mb-8">
            Start your journey to healing today. Join EaseBrain and connect with our supportive
            community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:988"
              aria-label="Call 988"
              onClick={() => trackEvent('call_988_footer')}
              className="bg-white text-teal-600 hover:bg-teal-50 hover:shadow-lg px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              {STRINGS.call988}
            </a>
            <Link
              to="/signup"
              className="border-2 border-white text-white hover:bg-white hover:text-teal-600 hover:shadow-lg px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Join EaseBrain
            </Link>
          </div>
        </div>
      </section>

      {/* Emergency Confirmation Modal */}
      {emergencyConfirm && crisisType && crisisHotlineMap[crisisType] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="emergency-modal-title" aria-describedby="emergency-modal-desc" className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full animate-in fade-in scale-in-95 transition-all">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center gap-3">
                <FaExclamationCircle className="text-2xl" />
                <h2 id="emergency-modal-title" className="text-2xl font-bold">Confirm Emergency Call</h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p id="emergency-modal-desc" className="text-gray-700 dark:text-gray-300 text-lg">
                You're about to call:
              </p>
              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4 border-l-4 border-red-600">
                <p className="font-bold text-gray-900 dark:text-white text-lg">
                  {crisisHotlineMap[crisisType].name}
                </p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {crisisHotlineMap[crisisType].primary}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {crisisHotlineMap[crisisType].features.join(" • ")}
                </p>
              </div>

              {userLocation && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  📍 Location: {userLocation}
                </p>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-600">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  ✓ Free & Confidential
                  <br />✓ Trained Counselors Available
                  <br />✓ Available 24/7
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-4 p-6 bg-gray-50 dark:bg-slate-700/50 rounded-b-xl border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setEmergencyConfirm(false)}
                className="flex-1 px-4 py-3 rounded-lg font-semibold bg-gray-300 text-gray-800 hover:bg-gray-400 transition-all duration-200 hover:shadow-md transform hover:scale-105"
                aria-label="Cancel emergency call"
              >
                <FaTimes className="inline mr-2" />
                Cancel
              </button>
              <button
                onClick={handleEmergencyCall}
                className="flex-1 px-4 py-3 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                aria-label="Confirm and call emergency service"
              >
                <FaPhone className="inline mr-2" />
                Call Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Tutorial Modal */}
      {selectedVideoTechnique && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="video-modal-title" className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full animate-in fade-in scale-in-95 transition-all">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-xl flex justify-between items-center">
              <h2 id="video-modal-title" className="text-2xl font-bold">{selectedVideoTechnique.videoTitle}</h2>
              <button
                onClick={() => setSelectedVideoTechnique(null)}
                className="hover:bg-purple-700 p-2 rounded transition-all"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="relative w-full pt-[56.25%] bg-black rounded-lg overflow-hidden">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={selectedVideoTechnique.videoUrl}
                  title={selectedVideoTechnique.videoTitle}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="mt-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{selectedVideoTechnique.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{selectedVideoTechnique.description}</p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-600">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💡 <strong>Tip:</strong> Practice this technique regularly, even when you're not in crisis. This helps your brain remember it when you need it most.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-4 p-6 bg-gray-50 dark:bg-slate-700/50 rounded-b-xl border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedVideoTechnique(null)}
                className="flex-1 px-4 py-3 rounded-lg font-semibold bg-gray-300 text-gray-800 hover:bg-gray-400 transition-all duration-200 hover:shadow-md transform hover:scale-105"
              >
                Close
              </button>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-3 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-105 hover:shadow-lg"
              >
                <FaVideo /> Full Video on YouTube
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

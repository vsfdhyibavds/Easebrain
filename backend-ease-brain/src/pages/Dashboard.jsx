import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../config/apiConfig';
import Notification from '../components/Notification';
import { authFetch } from '../lib/api';
import { FaBars, FaBell, FaUserCircle, FaHome, FaBook, FaCalendarAlt, FaCommentAlt, FaUsers, FaCog, FaChevronLeft, FaChevronRight, FaArrowLeft, FaComments } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import { useAuth } from '../features/auth/AuthContext';

const sidebarLinks = [
  { icon: <FaHome />, label: 'Dashboard', to: '/easebrain/dashboard' },
  { icon: <FaBook />, label: 'Notes', to: '/easebrain/notes' },
  { icon: <FaCalendarAlt />, label: 'Reminders', to: '/easebrain/reminders' },
  { icon: <FaCommentAlt />, label: 'Messages', to: '/easebrain/messages' },
  { icon: <FaUsers />, label: 'Community', to: '/easebrain/community' },

  { icon: <FaCog />, label: 'Settings', to: '/easebrain/settings' },
];

// Wellness tips array for dynamic rotation (50+ tips)
const wellnessTips = [
  { title: "Take a Deep Breath", message: "Take a 5-minute break every hour to practice deep breathing. It can significantly reduce stress and improve focus!" },
  { title: "Stay Hydrated", message: "Drink at least 8 glasses of water daily. Proper hydration improves cognitive function and boosts your mood." },
  { title: "Move Your Body", message: "Aim for at least 30 minutes of movement daily. Even a short walk can boost your mood and energy levels." },
  { title: "Mindful Moments", message: "Spend 5 minutes in mindfulness or meditation. It helps reduce anxiety and improves mental clarity." },
  { title: "Sleep Well", message: "Maintain a consistent sleep schedule. Getting 7-9 hours of quality sleep is essential for your well-being." },
  { title: "Connect With Others", message: "Reach out to a friend or family member today. Social connections are vital for your mental health." },
  { title: "Journaling Benefits", message: "Spend 10 minutes journaling your thoughts. Writing helps process emotions and improves self-awareness." },
  { title: "Nutrition Matters", message: "Include more colorful fruits and vegetables in your diet. A balanced diet supports both physical and mental health." },
  { title: "Stretch It Out", message: "Do some gentle stretching for 5 minutes. It improves flexibility and relieves muscle tension." },
  { title: "Smile More", message: "Smiling reduces stress and releases endorphins. Try smiling for a few seconds and notice the difference!" },
  { title: "Practice Gratitude", message: "Write down 3 things you're grateful for today. Gratitude shifts your perspective and boosts happiness." },
  { title: "Take a Walk", message: "Step outside for a 15-minute walk. Fresh air and natural light improve mood and creativity." },
  { title: "Limit Screen Time", message: "Take a 20-minute break from screens every 2 hours. Rest your eyes and reduce mental fatigue." },
  { title: "Practice Self-Compassion", message: "Treat yourself with kindness when things don't go perfectly. You deserve the same compassion you give others." },
  { title: "Listen Actively", message: "When talking to someone, listen without planning your response. Real listening strengthens relationships." },
  { title: "Eat Slowly", message: "Slow down and chew your food thoroughly. Eating mindfully improves digestion and satisfaction." },
  { title: "Try Something New", message: "Learn something new today, even if it's small. Growth and novelty boost mental engagement." },
  { title: "Breathe Deeply", message: "Practice 4-7-8 breathing: inhale for 4, hold for 7, exhale for 8. It's excellent for calming your nervous system." },
  { title: "Reduce Sugar", message: "Limit sugary foods and drinks. Stable blood sugar supports better mood and energy levels." },
  { title: "Set Boundaries", message: "It's okay to say no. Setting healthy boundaries protects your mental and emotional energy." },
  { title: "Practice Yoga", message: "Even 10 minutes of yoga can improve flexibility, strength, and mental clarity." },
  { title: "Laugh Out Loud", message: "Watch something funny or spend time with someone who makes you laugh. Laughter is natural medicine." },
  { title: "Get Sunlight", message: "Spend at least 15 minutes in natural sunlight daily. It boosts vitamin D and regulates your sleep cycle." },
  { title: "Organize Your Space", message: "A tidy environment reduces stress and improves focus. Start with just one small area." },
  { title: "Practice Forgiveness", message: "Let go of grudges for your own peace. Forgiveness is a gift you give yourself." },
  { title: "Eat More Fiber", message: "Include whole grains, legumes, and vegetables. Fiber supports digestion and overall health." },
  { title: "Take a Bath", message: "A warm bath can relax muscles and calm your mind. Add some essential oils for extra relaxation." },
  { title: "Avoid Caffeine Late", message: "Cut off caffeine after 2 PM for better sleep quality. Good sleep improves everything." },
  { title: "Hug Someone", message: "A warm hug releases oxytocin, the bonding hormone. It reduces stress and builds connection." },
  { title: "Practice Affirmations", message: "Repeat positive statements about yourself daily. Your thoughts shape your reality." },
  { title: "Try Cooking", message: "Prepare a healthy meal from scratch. Cooking is therapeutic and nourishing." },
  { title: "Dance It Out", message: "Put on your favorite song and dance for 3 minutes. Movement and music boost mood instantly." },
  { title: "Meditate", message: "Start with just 5 minutes of meditation. It reduces anxiety and improves emotional regulation." },
  { title: "Read Something", message: "Read a book, article, or poem for 15 minutes. Reading expands your mind and reduces stress." },
  { title: "Do Acts of Kindness", message: "Help someone today without expecting anything in return. Kindness benefits both giver and receiver." },
  { title: "Cold Water Wash", message: "Splash your face with cold water. It invigorates and improves circulation." },
  { title: "Practice Acceptance", message: "Accept what you can't change and focus on what you can control. This reduces unnecessary stress." },
  { title: "Eat Nuts and Seeds", message: "Include almonds, walnuts, and seeds in your diet. They're rich in healthy fats and nutrients." },
  { title: "Take Stairs", message: "Use stairs instead of elevators. Small bursts of activity throughout the day add up." },
  { title: "Listen to Music", message: "Listen to calming or uplifting music for 20 minutes. Music has powerful healing effects." },
  { title: "Practice Mindful Eating", message: "Eat without distractions and savor each bite. Mindful eating improves digestion and satisfaction." },
  { title: "Spend Time in Nature", message: "Nature reduces stress and anxiety. Even looking at plants can improve your mood." },
  { title: "Keep a Bedtime Routine", message: "Go to bed at the same time each night. Consistency improves sleep quality significantly." },
  { title: "Do a Hobby", message: "Engage in something you love for 30 minutes. Hobbies provide joy and stress relief." },
  { title: "Practice Saying No", message: "Protect your energy by declining commitments that don't serve you. It's empowering." },
  { title: "Get a Massage", message: "Massage releases tension and improves circulation. Even self-massage on your shoulders helps." },
  { title: "Eat Antioxidants", message: "Include berries, dark chocolate, and green tea. Antioxidants protect your brain and body." },
  { title: "Take Breaks", message: "Every 90 minutes, take a 10-minute break. This rhythm optimizes productivity and well-being." },
  { title: "Practice Vulnerability", message: "Share your true feelings with someone you trust. Connection requires authentic communication." },
  { title: "End Your Day Well", message: "Reflect on today, appreciate what you did, and get ready for a restful night's sleep." }
];


export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Function to get greeting based on time of day
  const getTimeBasedGreeting = (isFirstTime = false, username = 'User') => {
    if (isFirstTime) {
      return `Welcome, ${username}! 👋`;
    }

    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      return `Good morning, ${username}! 🌅`;
    } else if (currentHour >= 12 && currentHour < 17) {
      return `Good afternoon, ${username}! ☀️`;
    } else if (currentHour >= 17 && currentHour < 22) {
      return `Good evening, ${username}! 🌙`;
    } else {
      return `Good night, ${username}! 🌟`;
    }
  };



  // Initialize tip index from localStorage or shuffle daily
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('wellnessDate');

    if (storedDate !== today) {
      // New day - reset to 0 and update the stored date
      localStorage.setItem('wellnessDate', today);
      localStorage.setItem('wellnessTipIndex', '0');
      setCurrentTipIndex(0);
    } else {
      // Same day - restore from localStorage
      const savedIndex = parseInt(localStorage.getItem('wellnessTipIndex') || '0');
      setCurrentTipIndex(savedIndex);
    }
  }, []);

  // Mock activity data
  const activityFeed = [
    {
      id: 1,
      user: "You",
      action: "created a new note",
      item: "Morning Reflection",
      timestamp: "2 hours ago",
      type: "note",
      avatar: "Y",
      color: "bg-blue-100",
    },
    {
      id: 2,
      user: "You",
      action: "joined community",
      item: "Mental Wellness Circle",
      timestamp: "5 hours ago",
      type: "community",
      avatar: "Y",
      color: "bg-green-100",
    },
    {
      id: 3,
      user: "Sarah Chen",
      action: "sent you a message",
      item: "Let's catch up soon!",
      timestamp: "1 day ago",
      type: "message",
      avatar: "SC",
      color: "bg-purple-100",
    },
    {
      id: 4,
      user: "You",
      action: "set a reminder",
      item: "Weekly therapy session",
      timestamp: "2 days ago",
      type: "reminder",
      avatar: "Y",
      color: "bg-orange-100",
    },
  ];

  useEffect(() => {
    fetch(`${BASE_URL}/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => setStats(null));
    fetch(`${BASE_URL}/notes`)
      .then(res => res.json())
      .then(data => setRecentNotes(Array.isArray(data) ? data : []))
      .catch(() => setRecentNotes([]));

    // Poll for new reminders/messages every 30 seconds
    const pollInterval = setInterval(() => {
      authFetch('/notifications')
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            // Show the first new notification
            setNotification(data[0].message || 'You have a new notification!');
          }
        })
        .catch(err => console.error("Error fetching notifications:", err));
    }, 30000);

    // Rotate wellness tips every 5 seconds
    const tipRotationInterval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % wellnessTips.length;
        localStorage.setItem('wellnessTipIndex', newIndex.toString());
        return newIndex;
      });
    }, 5000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(tipRotationInterval);
    };
  }, []);

  return (
    <>
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      {/* Live Notification Popup */}
      <Notification message={notification} type="info" onClose={() => setNotification(null)} />

      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } bg-teal-900 dark:bg-slate-950 text-white transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="p-6 border-b border-teal-700 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {!collapsed && <span className="text-2xl font-extrabold dark:text-teal-300">Ease Brain</span>}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white p-1 rounded hover:bg-teal-700 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarLinks.map(link => {
            const isActiveBase = location.pathname.startsWith(link.to);
            const isExact = location.pathname === link.to;
            return (
              <li
                key={link.label}
                className={`px-6 py-3 flex items-center gap-3 text-lg font-medium cursor-pointer transition-colors duration-150 rounded-lg ${isActiveBase ? 'bg-teal-800 dark:bg-teal-700 text-yellow-300' : 'hover:bg-teal-700 dark:hover:bg-slate-800'}`}
                title={collapsed ? link.label : ""}
              >
                <Link to={link.to} className="flex items-center gap-3 w-full">
                  <span className="inline-block w-6 text-center text-xl flex-shrink-0">
                    {link.icon}
                  </span>
                  {!collapsed && link.label}
                </Link>
                {/* Show a small "back to section" button when on a nested route under this section */}
                {!collapsed && isActiveBase && !isExact && (
                  <button
                    className="ml-2 text-white p-1 rounded hover:bg-teal-700 dark:hover:bg-slate-800"
                    onClick={() => navigate(link.to)}
                    aria-label={`Back to ${link.label}`}
                    title={`Back to ${link.label}`}
                  >
                    <FaArrowLeft />
                  </button>
                )}
              </li>
            );
          })}
        </nav>
        <div className={`px-6 py-4 text-xs text-gray-300 dark:text-gray-500 ${collapsed ? 'hidden' : ''}`}>© 2025 Ease Brain. All rights reserved.</div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content Area */}
        <section className="flex-1 p-6 md:p-8 bg-gradient-to-br from-teal-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-teal-900 dark:text-teal-300 mb-2">{getTimeBasedGreeting(false, user?.first_name || 'User')}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Here's your wellness snapshot and recent activity.</p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Notes Card */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md border border-teal-100 dark:border-teal-900 p-6 transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">📝</div>
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900 px-2 py-1 rounded">+2 this week</span>
                </div>
                <div className="text-3xl font-bold text-teal-700 dark:text-teal-300 mb-1">{stats ? stats.notes : '0'}</div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Notes Created</div>
              </div>

              {/* Reminders Card */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md border border-teal-100 dark:border-teal-900 p-6 transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">⏰</div>
                  <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900 px-2 py-1 rounded">2 pending</span>
                </div>
                <div className="text-3xl font-bold text-teal-700 dark:text-teal-300 mb-1">{stats ? stats.reminders : '0'}</div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Reminders Set</div>
              </div>

              {/* Messages Card */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md border border-teal-100 dark:border-teal-900 p-6 transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">💬</div>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900 px-2 py-1 rounded">3 unread</span>
                </div>
                <div className="text-3xl font-bold text-teal-700 dark:text-teal-300 mb-1">{stats ? stats.messages : '0'}</div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Messages</div>
              </div>

              {/* Communities Card */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md border border-teal-100 dark:border-teal-900 p-6 transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">👥</div>
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900 px-2 py-1 rounded">Active member</span>
                </div>
                <div className="text-3xl font-bold text-teal-700 dark:text-teal-300 mb-1">{stats ? stats.communities : '0'}</div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Communities</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8 flex flex-wrap gap-3">
              <button
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                onClick={() => navigate('/easebrain/notes')}
              >
                New Note
              </button>
              <button
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                onClick={() => navigate('/easebrain/reminders')}
              >
                Set Reminder
              </button>
              <button
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                onClick={() => navigate('/easebrain/messages')}
              >
                Send Message
              </button>
              <button
                className="border-2 border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-700 font-semibold px-6 py-3 rounded-lg transition-colors"
                onClick={() => navigate('/easebrain/community')}
              >
                Explore Communities
              </button>
            </div>

            {/* Main Content Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-teal-100 dark:border-teal-900">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 px-6 pt-4">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`pb-4 px-4 font-semibold transition-colors border-b-2 ${
                    activeTab === "overview"
                      ? "text-teal-600 border-teal-600"
                      : "text-gray-600 border-transparent hover:text-teal-600"
                  }`}
                >
                  📊 Overview
                </button>
                <button
                  onClick={() => setActiveTab("activity")}
                  className={`pb-4 px-4 font-semibold transition-colors border-b-2 ${
                    activeTab === "activity"
                      ? "text-teal-600 border-teal-600"
                      : "text-gray-600 border-transparent hover:text-teal-600"
                  }`}
                >
                  📈 Activity
                </button>
                <button
                  onClick={() => setActiveTab("notes")}
                  className={`pb-4 px-4 font-semibold transition-colors border-b-2 ${
                    activeTab === "notes"
                      ? "text-teal-600 border-teal-600"
                      : "text-gray-600 border-transparent hover:text-teal-600"
                  }`}
                >
                  📝 Recent Notes
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* User Profile Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 bg-gradient-to-r from-teal-50 to-green-50 rounded-lg p-6 border border-teal-200">
                        <div className="flex items-start gap-4">
                          <div className="bg-teal-200 rounded-full w-20 h-20 flex items-center justify-center text-4xl text-teal-700 flex-shrink-0">
                            <FaUserCircle />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-teal-900 mb-1">Welcome to Your Dashboard</h3>
                            <p className="text-gray-700 mb-3">You're doing great! Keep up with your wellness journey and stay connected with your community.</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate('/easebrain/settings')}
                                className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                              >
                                Edit Profile →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Wellness Streak */}
                      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-6 border border-orange-200">
                        <div className="text-center">
                          <div className="text-5xl mb-2">🔥</div>
                          <div className="text-3xl font-bold text-orange-600 mb-1">0</div>
                          <div className="text-gray-700 font-medium">Day Streak</div>
                          <p className="text-sm text-gray-600 mt-2">Keep it up!</p>
                        </div>
                      </div>
                    </div>

                    {/* Tips Section */}
                    <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 dark:border-blue-300 rounded-lg p-6 transition-all duration-500">
                      <div className="flex gap-4">
                        <div className="text-3xl flex-shrink-0">💡</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-1">{wellnessTips[currentTipIndex].title}</h4>
                          <p className="text-blue-800 dark:text-blue-200">{wellnessTips[currentTipIndex].message}</p>
                          <div className="mt-3 flex gap-3 justify-center items-center">
                            {/* Previous Tip Button */}
                            <button
                              onClick={() => {
                                const prevIndex = (currentTipIndex - 1 + wellnessTips.length) % wellnessTips.length;
                                setCurrentTipIndex(prevIndex);
                                localStorage.setItem('wellnessTipIndex', prevIndex.toString());
                              }}
                              className="w-2 h-2 rounded-full bg-blue-300 dark:bg-blue-600 hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors"
                              title={`Previous: ${wellnessTips[(currentTipIndex - 1 + wellnessTips.length) % wellnessTips.length].title}`}
                              aria-label="Previous tip"
                            />
                            {/* Current Tip Indicator */}
                            <button
                              className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-400 transition-colors ring-2 ring-blue-400 dark:ring-blue-300"
                              title={`Current: ${wellnessTips[currentTipIndex].title}`}
                              aria-label="Current tip"
                              disabled
                            />
                            {/* Next Tip Button */}
                            <button
                              onClick={() => {
                                const nextIndex = (currentTipIndex + 1) % wellnessTips.length;
                                setCurrentTipIndex(nextIndex);
                                localStorage.setItem('wellnessTipIndex', nextIndex.toString());
                              }}
                              className="w-2 h-2 rounded-full bg-blue-300 dark:bg-blue-600 hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors"
                              title={`Next: ${wellnessTips[(currentTipIndex + 1) % wellnessTips.length].title}`}
                              aria-label="Next tip"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === "activity" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-teal-900 text-lg mb-4">Your Recent Activity</h3>
                    {activityFeed.map((item, index) => (
                      <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                        {/* Timeline connector */}
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className={`${item.color} rounded-full w-10 h-10 flex items-center justify-center font-semibold text-sm text-gray-700`}>
                            {item.avatar}
                          </div>
                          {index !== activityFeed.length - 1 && (
                            <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
                          )}
                        </div>
                        {/* Activity content */}
                        <div className="pt-1 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {item.user} <span className="font-normal text-gray-600">{item.action}</span>
                              </p>
                              <p className="text-teal-600 font-medium text-sm mt-1">"{item.item}"</p>
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{item.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent Notes Tab */}
                {activeTab === "notes" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-teal-900 text-lg">Your Recent Notes</h3>
                      <button
                        onClick={() => navigate('/easebrain/notes')}
                        className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                      >
                        View All →
                      </button>
                    </div>
                    {recentNotes.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recentNotes.map(note => (
                          <div key={note.id} className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400 hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-teal-700 text-lg mb-2 line-clamp-2">{note.title}</h4>
                            <p className="text-gray-700 text-sm mb-3 line-clamp-3">{note.content}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">Updated {note.updated}</span>
                              <button
                                onClick={() => navigate('/easebrain/notes')}
                                className="text-teal-600 hover:text-teal-700 font-medium text-xs"
                              >
                                Edit →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 mb-3">No notes yet. Start your first note today!</p>
                        <button
                          onClick={() => navigate('/easebrain/notes')}
                          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                        >
                          Create a Note
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        {/* Footer */}
      </main>
    </div>
    <Footer />
    </>
  );
}

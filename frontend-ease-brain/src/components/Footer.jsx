import { Link } from 'react-router-dom';

export default function Footer() {
  const emergencyButton = () => {
    // Open emergency services dialog or redirect to emergency page
    window.location.href = '/emergency';
  };

  return (
    <footer className="bg-[#020817] dark:bg-slate-950 text-gray-300 dark:text-gray-400 py-8 sm:py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Platform Section */}
        <div>
          <h2 className="text-white dark:text-gray-200 text-xl font-semibold mb-4">PLATFORM</h2>
          <ul className="space-y-2">
            <li><Link to="/features" className="hover:text-white dark:hover:text-gray-300">Features</Link></li>
            <li><Link to="/community" className="hover:text-white dark:hover:text-gray-300">Community</Link></li>
            <li><Link to="/find-therapist" className="hover:text-white dark:hover:text-gray-300">Find a Therapist</Link></li>
            <li><Link to="/ai-support" className="hover:text-white dark:hover:text-gray-300">AI Support</Link></li>
          </ul>
        </div>

        {/* Support Section */}
        <div>
          <h2 className="text-white dark:text-gray-200 text-xl font-semibold mb-4">SUPPORT</h2>
          <ul className="space-y-2">
            <li><Link to="/crisis-hotlines" className="hover:text-white dark:hover:text-gray-300">Crisis Hotlines</Link></li>
            <li><Link to="/contact" className="hover:text-white dark:hover:text-gray-300">Contact Us</Link></li>
            <li><Link to="/privacy" className="hover:text-white dark:hover:text-gray-300">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white dark:hover:text-gray-300">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Emergency Section */}
        <div>
          <h2 className="text-white dark:text-gray-200 text-xl font-semibold mb-4">EMERGENCY</h2>
          <ul className="space-y-2">
            <li className="flex flex-col sm:flex-row sm:items-center">
              <span className="sm:mr-2">Crisis Hotline:</span>
              <a href="tel:988" className="font-semibold hover:text-white dark:hover:text-gray-300">988</a>
            </li>
            <li className="flex flex-col sm:flex-row sm:items-center">
              <span className="sm:mr-2">Emergency Services:</span>
              <a href="tel:911" className="font-semibold hover:text-white dark:hover:text-gray-300">911</a>
            </li>
          </ul>
          <button
            onClick={emergencyButton}
            className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Get Immediate Help
          </button>
        </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 text-center py-4 text-sm text-gray-400">
        © {new Date().getFullYear()} <span className="font-semibold text-white">EaseBrain</span>. All rights reserved.
        <br />
        <span className="text-gray-500 text-xs">
          This platform is for informational and supportive purposes and does
          not replace professional medical advice or treatment.
        </span>
      </div>
    </footer>
  );
}
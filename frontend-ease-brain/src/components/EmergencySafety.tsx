import React, { useState } from 'react';
import { useDarkMode } from '@/context/DarkModeContext';
import {
  FaPhone,
  FaComments,
  FaMapMarkerAlt,
  FaTrash,
  FaPlus,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaHeartbeat,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  availability: 'available' | 'unavailable' | 'unknown';
}

interface EmergencyAlert {
  id: string;
  timestamp: Date;
  type: 'critical' | 'high' | 'medium';
  message: string;
  dependent: string;
  status: 'active' | 'resolved';
  respondedBy?: string;
}

interface EmergencySafetyProps {
  dependentName?: string;
}

const EmergencySafety: React.FC<EmergencySafetyProps> = ({ dependentName = 'John Smith' }) => {
  const { isDarkMode } = useDarkMode();
  const [sosActive, setSosActive] = useState(false);
  const [sosTimer, setSosTimer] = useState(0);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    {
      id: 'ec1',
      name: 'Sarah Johnson',
      relationship: 'Daughter',
      phone: '+1 (555) 123-4567',
      email: 'sarah.j@email.com',
      availability: 'available',
    },
    {
      id: 'ec2',
      name: 'Dr. Michael Chen',
      relationship: 'Primary Doctor',
      phone: '+1 (555) 234-5678',
      email: 'mchen@medicenter.com',
      availability: 'available',
    },
    {
      id: 'ec3',
      name: 'John Smith Jr.',
      relationship: 'Son',
      phone: '+1 (555) 345-6789',
      email: 'john.jr@email.com',
      availability: 'unknown',
    },
    {
      id: 'ec4',
      name: 'Emergency Services',
      relationship: '911',
      phone: '911',
      availability: 'available',
    },
  ]);

  const [emergencyAlerts] = useState<EmergencyAlert[]>([
    {
      id: 'alert1',
      timestamp: new Date(Date.now() - 3600000),
      type: 'critical',
      message: 'Fall detected - Patient on ground',
      dependent: dependentName,
      status: 'resolved',
      respondedBy: 'Sarah Johnson',
    },
    {
      id: 'alert2',
      timestamp: new Date(Date.now() - 7200000),
      type: 'high',
      message: 'Heart rate abnormal - 125 bpm',
      dependent: dependentName,
      status: 'resolved',
      respondedBy: 'Dr. Michael Chen',
    },
    {
      id: 'alert3',
      timestamp: new Date(Date.now() - 86400000),
      type: 'medium',
      message: 'Medication not taken at scheduled time',
      dependent: dependentName,
      status: 'active',
    },
  ]);

  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);

  const handleSOSActivation = () => {
    if (!sosActive) {
      setSosActive(true);
      setSosTimer(10);
      toast.error(`🚨 SOS ACTIVATED for ${dependentName}! Notifying emergency contacts...`, {
        duration: 5000,
      });

      // Simulate countdown
      const interval = setInterval(() => {
        setSosTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Simulate alert resolution after 30 seconds
      setTimeout(() => {
        toast.success('Emergency contacts have been notified');
      }, 2000);
    } else {
      setSosActive(false);
      setSosTimer(0);
      toast.success('SOS alert cancelled', { duration: 2000 });
    }
  };

  const handleCallContact = (contact: EmergencyContact) => {
    toast.success(`Initiating call to ${contact.name} (${contact.phone})`, {
      duration: 2000,
    });
  };

  const handleSendMessage = (contact: EmergencyContact) => {
    toast.success(`Sending emergency message to ${contact.name}`, {
      duration: 2000,
    });
  };

  const handleAddContact = () => {
    if (newContactName && newContactPhone) {
      const newContact: EmergencyContact = {
        id: `ec${Date.now()}`,
        name: newContactName,
        relationship: 'Other',
        phone: newContactPhone,
        availability: 'unknown',
      };
      setEmergencyContacts([...emergencyContacts, newContact]);
      setNewContactName('');
      setNewContactPhone('');
      setShowAddContact(false);
      toast.success(`${newContactName} added to emergency contacts`);
    }
  };

  const handleDeleteContact = (id: string) => {
    setEmergencyContacts(emergencyContacts.filter((c) => c.id !== id));
    toast.success('Contact removed from emergency contacts');
  };

  const activeAlerts = emergencyAlerts.filter((a) => a.status === 'active');
  const criticalAlerts = activeAlerts.filter((a) => a.type === 'critical');

  return (
    <div className={`space-y-4 sm:space-y-8`}>
      {/* SOS Alert Panel */}
      <div
        className={`rounded-lg sm:rounded-2xl p-4 sm:p-8 shadow-lg border-2 ${
          sosActive
            ? isDarkMode
              ? 'bg-gradient-to-br from-red-900/50 to-orange-900/50 border-red-500 animate-pulse'
              : 'bg-gradient-to-br from-red-100 to-orange-100 border-red-500 animate-pulse'
            : isDarkMode
              ? 'bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600'
              : 'bg-white border-teal-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <FaExclamationTriangle className={`text-3xl sm:text-4xl ${sosActive ? 'text-red-500 animate-spin' : isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />
            <div>
              <h2 className={`text-2xl sm:text-3xl font-bold ${
                sosActive
                  ? 'text-red-500'
                  : isDarkMode
                    ? 'text-white'
                    : 'text-teal-900'
              }`}>
                Emergency SOS
              </h2>
              {sosActive && (
                <p className="text-xs sm:text-sm text-red-500 animate-pulse">
                  ALERT ACTIVE
                </p>
              )}
            </div>
          </div>
          {sosActive && (
            <div className={`px-3 sm:px-6 py-2 sm:py-4 rounded-lg sm:rounded-xl whitespace-nowrap ${isDarkMode ? 'bg-red-900/50' : 'bg-red-200'}`}>
              <div className="text-2xl sm:text-3xl font-bold text-red-500">{sosTimer}s</div>
              <p className={`text-xs ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>Active</p>
            </div>
          )}
        </div>

        {/* Critical Alerts Display */}
        {criticalAlerts.length > 0 && (
          <div className="mb-4 sm:mb-6 p-2 sm:p-4 rounded-lg sm:rounded-xl bg-red-500/20 border border-red-500">
            <p className="text-red-500 font-bold text-xs sm:text-sm">
              ⚠️ {criticalAlerts.length} CRITICAL ALERT{criticalAlerts.length !== 1 ? 'S' : ''}
            </p>
            {criticalAlerts.map((alert) => (
              <p key={alert.id} className={`text-xs sm:text-sm mt-1 sm:mt-2 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                • {alert.message}
              </p>
            ))}
          </div>
        )}

        {/* SOS Button */}
        <button
          onClick={handleSOSActivation}
          className={`w-full py-4 sm:py-6 px-4 sm:px-8 rounded-lg sm:rounded-xl font-bold text-base sm:text-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 min-h-[44px] sm:min-h-auto ${
            sosActive
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
              : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-2xl'
          }`}
        >
          <FaExclamationTriangle className="text-lg sm:text-2xl" />
          {sosActive ? 'CANCEL' : 'SOS'}
        </button>

        {sosActive && (
          <div className={`mt-4 p-2 sm:p-4 rounded-lg text-center text-xs sm:text-sm ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
            All emergency contacts have been notified.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Emergency Contacts */}
        <div className={`lg:col-span-2 rounded-lg sm:rounded-2xl p-4 sm:p-8 shadow-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-teal-100'}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h3 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
              <FaPhone className={`text-base sm:text-lg ${isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />
              Emergency Contacts
            </h3>
            <button
              onClick={() => setShowAddContact(!showAddContact)}
              className={`px-2 sm:px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all text-xs sm:text-sm min-h-[44px] sm:min-h-auto ${
                isDarkMode
                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                  : 'bg-teal-500 text-white hover:bg-teal-600'
              }`}
            >
              <FaPlus /> Add
            </button>
          </div>

          {/* Add Contact Form */}
          {showAddContact && (
            <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 ${isDarkMode ? 'bg-slate-800 border-teal-500' : 'bg-teal-50 border-teal-300'}`}>
              <div className="space-y-2 sm:space-y-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className={`w-full px-2 sm:px-4 py-2 rounded-lg border text-xs sm:text-sm ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                      : 'bg-white border-teal-200 text-teal-900 placeholder-teal-400'
                  }`}
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className={`w-full px-2 sm:px-4 py-2 rounded-lg border text-xs sm:text-sm ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                      : 'bg-white border-teal-200 text-teal-900 placeholder-teal-400'
                  }`}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddContact}
                    className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm min-h-[44px] sm:min-h-auto flex items-center justify-center ${
                      isDarkMode
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-emerald-500 text-white hover:bg-emerald-600'
                    }`}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddContact(false)}
                    className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm min-h-[44px] sm:min-h-auto flex items-center justify-center ${
                      isDarkMode
                        ? 'bg-slate-600 text-white hover:bg-slate-500'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contacts List */}
          <div className="space-y-2 sm:space-y-3">
            {emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 ${
                  isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                    {contact.name}
                  </p>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {contact.relationship} • {contact.phone}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        contact.availability === 'available'
                          ? 'bg-emerald-500'
                          : contact.availability === 'unavailable'
                            ? 'bg-red-500'
                            : 'bg-gray-500'
                      }`}
                    />
                    <span className={`text-xs capitalize ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {contact.availability}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCallContact(contact)}
                    className={`p-3 rounded-lg transition-all ${
                      isDarkMode
                        ? 'bg-emerald-600/50 text-emerald-300 hover:bg-emerald-600/70'
                        : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                    }`}
                    title="Call"
                  >
                    <FaPhone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSendMessage(contact)}
                    className={`p-3 rounded-lg transition-all ${
                      isDarkMode
                        ? 'bg-blue-600/50 text-blue-300 hover:bg-blue-600/70'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                    title="Send message"
                  >
                    <FaComments className="w-4 h-4" />
                  </button>
                  {contact.id !== 'ec4' && (
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className={`p-3 rounded-lg transition-all ${
                        isDarkMode
                          ? 'bg-red-600/50 text-red-300 hover:bg-red-600/70'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                      title="Delete"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Info & Status */}
        <div className={`rounded-2xl p-8 shadow-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-teal-100'}`}>
          <h3 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
            <FaHeartbeat className={isDarkMode ? 'text-teal-400' : 'text-teal-500'} />
            Safety Status
          </h3>

          <div className="space-y-4">
            {/* Current Status */}
            <div className={`p-4 rounded-xl border-2 ${sosActive ? (isDarkMode ? 'bg-red-900/30 border-red-500' : 'bg-red-50 border-red-300') : (isDarkMode ? 'bg-emerald-900/30 border-emerald-500' : 'bg-emerald-50 border-emerald-300')}`}>
              <p className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Current Status
              </p>
              <p className={`text-2xl font-bold flex items-center gap-2 ${sosActive ? 'text-red-500' : 'text-emerald-600'}`}>
                {sosActive ? (
                  <>
                    <FaExclamationTriangle /> ALERT ACTIVE
                  </>
                ) : (
                  <>
                    <FaCheckCircle /> NORMAL
                  </>
                )}
              </p>
            </div>

            {/* Active Alerts Count */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Active Alerts
              </p>
              <p className={`text-3xl font-bold ${activeAlerts.length > 0 ? 'text-orange-500' : 'text-emerald-600'}`}>
                {activeAlerts.length}
              </p>
              {activeAlerts.length > 0 && (
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {criticalAlerts.length} critical, {activeAlerts.length - criticalAlerts.length} other
                </p>
              )}
            </div>

            {/* Last Alert */}
            {emergencyAlerts.length > 0 && (
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                <p className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Last Alert
                </p>
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {emergencyAlerts[0].message}
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  {Math.round((Date.now() - emergencyAlerts[0].timestamp.getTime()) / 60000)} minutes ago
                </p>
              </div>
            )}

            {/* Quick Info */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-teal-900/30 border-teal-600' : 'bg-teal-50 border-teal-300'}`}>
              <p className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                <FaMapMarkerAlt /> Quick Tips
              </p>
              <ul className={`text-xs space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• Always keep emergency contacts updated</li>
                <li>• SOS will notify all primary contacts</li>
                <li>• Medical info available to responders</li>
                <li>• Location tracking can be enabled</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Alert History */}
      <div className={`rounded-2xl p-8 shadow-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-teal-100'}`}>
        <h3 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
          <FaClock className={isDarkMode ? 'text-teal-400' : 'text-teal-500'} />
          Alert History
        </h3>

        <div className="space-y-3">
          {emergencyAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex items-start gap-4 ${
                alert.status === 'active'
                  ? isDarkMode
                    ? 'bg-yellow-900/20 border-yellow-600'
                    : 'bg-yellow-50 border-yellow-300'
                  : isDarkMode
                    ? 'bg-slate-800 border-slate-600'
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                  alert.type === 'critical'
                    ? 'bg-red-500'
                    : alert.type === 'high'
                      ? 'bg-orange-500'
                      : 'bg-yellow-500'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                    {alert.message}
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                      alert.status === 'active'
                        ? isDarkMode
                          ? 'bg-yellow-600/50 text-yellow-300'
                          : 'bg-yellow-100 text-yellow-700'
                        : isDarkMode
                          ? 'bg-emerald-600/50 text-emerald-300'
                          : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {alert.status === 'active' ? 'ACTIVE' : 'RESOLVED'}
                  </span>
                </div>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {alert.timestamp.toLocaleString()}
                  {alert.respondedBy && ` • Responded by: ${alert.respondedBy}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmergencySafety;

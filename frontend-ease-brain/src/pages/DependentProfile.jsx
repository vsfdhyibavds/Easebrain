import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaUserCircle,
  FaNotesMedical,
  FaCalendar,
  FaPills,
  FaCheckCircle,
  FaClock,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaHeartbeat,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

function DependentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dependent, setDependent] = useState(null);

  // Mock data for demonstration
  const mockDependentData = {
    1: {
      id: 1,
      name: 'Mary Johnson',
      age: 72,
      email: 'mary.johnson@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Oak Street, Anytown, CA 90210',
      status: 'stable',
      mood: 'positive',
      medicationAdherence: 95,
      emergencyContact: {
        name: 'John Johnson',
        relationship: 'Son',
        phone: '+1 (555) 987-6543',
      },
      medications: [
        { id: 1, name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', adherence: 98 },
        { id: 2, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', adherence: 92 },
      ],
      appointments: [
        { id: 1, type: 'Doctor Checkup', date: '2026-02-15', time: '10:00 AM', status: 'scheduled' },
        { id: 2, type: 'Physical Therapy', date: '2026-01-30', time: '2:00 PM', status: 'upcoming' },
      ],
      notes: [
        { id: 1, date: '2026-01-23', content: 'Mary seems more energetic today, ate well at lunch' },
        { id: 2, date: '2026-01-22', content: 'Blood pressure readings stable. Continue monitoring.' },
      ],
      carePlan: [
        { id: 1, goal: 'Maintain daily medication schedule', status: 'on-track' },
        { id: 2, goal: 'Exercise 30 minutes daily', status: 'on-track' },
        { id: 3, goal: 'Attend monthly doctor appointments', status: 'on-track' },
      ],
    },
    2: {
      id: 2,
      name: 'Robert Smith',
      age: 68,
      email: 'robert.smith@email.com',
      phone: '+1 (555) 234-5678',
      address: '456 Maple Avenue, Somewhere, CA 90211',
      status: 'stable',
      mood: 'neutral',
      medicationAdherence: 82,
      emergencyContact: {
        name: 'Sarah Smith',
        relationship: 'Daughter',
        phone: '+1 (555) 876-5432',
      },
      medications: [
        { id: 1, name: 'Atorvastatin', dosage: '20mg', frequency: 'Daily', adherence: 85 },
      ],
      appointments: [
        { id: 1, type: 'Cardiology', date: '2026-02-20', time: '11:00 AM', status: 'scheduled' },
      ],
      notes: [
        { id: 1, date: '2026-01-23', content: 'Walked around the neighborhood today' },
      ],
      carePlan: [
        { id: 1, goal: 'Maintain heart health', status: 'on-track' },
      ],
    },
    3: {
      id: 3,
      name: 'Patricia Davis',
      age: 75,
      email: 'patricia.davis@email.com',
      phone: '+1 (555) 345-6789',
      address: '789 Elm Street, Nowhere, CA 90212',
      status: 'needs_attention',
      mood: 'negative',
      medicationAdherence: 65,
      emergencyContact: {
        name: 'Michael Davis',
        relationship: 'Son',
        phone: '+1 (555) 765-4321',
      },
      medications: [
        { id: 1, name: 'Amlodipine', dosage: '5mg', frequency: 'Daily', adherence: 70 },
        { id: 2, name: 'Levothyroxine', dosage: '50mcg', frequency: 'Daily', adherence: 60 },
      ],
      appointments: [
        { id: 1, type: 'Follow-up Consultation', date: '2026-01-28', time: '3:00 PM', status: 'upcoming' },
      ],
      notes: [
        { id: 1, date: '2026-01-23', content: 'Reported feeling tired and anxious. May need mood check.' },
        { id: 2, date: '2026-01-21', content: 'Missed one medication dose yesterday' },
      ],
      carePlan: [
        { id: 1, goal: 'Improve medication adherence', status: 'needs-attention' },
        { id: 2, goal: 'Daily mental health check-ins', status: 'in-progress' },
      ],
    },
    4: {
      id: 4,
      name: 'James Wilson',
      age: 70,
      email: 'james.wilson@email.com',
      phone: '+1 (555) 456-7890',
      address: '321 Pine Road, Someplace, CA 90213',
      status: 'stable',
      mood: 'positive',
      medicationAdherence: 88,
      emergencyContact: {
        name: 'Emma Wilson',
        relationship: 'Daughter',
        phone: '+1 (555) 654-3210',
      },
      medications: [
        { id: 1, name: 'Omeprazole', dosage: '20mg', frequency: 'Daily', adherence: 90 },
        { id: 2, name: 'Aspirin', dosage: '81mg', frequency: 'Daily', adherence: 85 },
      ],
      appointments: [
        { id: 1, type: 'Annual Checkup', date: '2026-03-10', time: '9:00 AM', status: 'scheduled' },
      ],
      notes: [
        { id: 1, date: '2026-01-23', content: 'Great progress with physical rehabilitation' },
        { id: 2, date: '2026-01-20', content: 'Weight stable, appetite good' },
      ],
      carePlan: [
        { id: 1, goal: 'Complete physical therapy sessions', status: 'on-track' },
        { id: 2, goal: 'Maintain healthy diet', status: 'on-track' },
        { id: 3, goal: 'Regular exercise routine', status: 'on-track' },
      ],
    },
    5: {
      id: 5,
      name: 'Elizabeth Brown',
      age: 65,
      email: 'elizabeth.brown@email.com',
      phone: '+1 (555) 567-8901',
      address: '555 Birch Lane, Somewhere Else, CA 90214',
      status: 'stable',
      mood: 'positive',
      medicationAdherence: 92,
      emergencyContact: {
        name: 'Christopher Brown',
        relationship: 'Son',
        phone: '+1 (555) 543-2109',
      },
      medications: [
        { id: 1, name: 'Metoprolol', dosage: '50mg', frequency: 'Twice daily', adherence: 95 },
        { id: 2, name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', adherence: 90 },
        { id: 3, name: 'Atorvastatin', dosage: '40mg', frequency: 'Daily', adherence: 88 },
      ],
      appointments: [
        { id: 1, type: 'Cardiology Checkup', date: '2026-02-05', time: '2:30 PM', status: 'upcoming' },
        { id: 2, type: 'Lab Work', date: '2026-02-03', time: '8:00 AM', status: 'upcoming' },
      ],
      notes: [
        { id: 1, date: '2026-01-23', content: 'Heart rate and blood pressure within normal range' },
        { id: 2, date: '2026-01-22', content: 'Compliant with medication schedule' },
        { id: 3, date: '2026-01-20', content: 'Good energy levels, enjoying daily walks' },
      ],
      carePlan: [
        { id: 1, goal: 'Monitor heart health', status: 'on-track' },
        { id: 2, goal: 'Continue regular exercise', status: 'on-track' },
      ],
    },
  };

  useEffect(() => {
    // Try to fetch from API first, fallback to mock data on error
    setLoading(true);

    const fetchDependentData = async () => {
      try {
        // Try to fetch from backend API
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://www.easebrain.live/api';
        const response = await fetch(`${apiBase}/users/${id}`);

        if (response.ok) {
          const apiData = await response.json();
          setDependent(apiData);
          setLoading(false);
          return;
        } else {
          // API returned error status, use mock data
          console.log(`API returned ${response.status}, using mock data`);
        }
      } catch (error) {
        // API error, will fallback to mock data
        console.log('API unavailable, using mock data', error);
      }

      // Fallback to mock data
      const mockData = mockDependentData[id];
      if (mockData) {
        setDependent(mockData);
        setLoading(false);
      } else {
        toast.error('Dependent not found');
        navigate('/caregiver');
      }
    };

    fetchDependentData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-teal-200 border-t-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-700 font-medium">Loading dependent details...</p>
        </div>
      </div>
    );
  }

  if (!dependent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-teal-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Dependent not found</h1>
          <button
            onClick={() => navigate('/caregiver')}
            className="mt-4 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-white to-teal-50 min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/caregiver')}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold mb-4 hover:bg-teal-50 px-3 py-2 rounded-lg transition"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>

        <div className="bg-white shadow-lg rounded-2xl p-6 border border-teal-100">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {dependent.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-black text-teal-900 mb-2">{dependent.name}</h1>
              <div className="flex flex-wrap gap-4 text-teal-600">
                <div className="flex items-center gap-2">
                  <FaBirthdayCake className="text-teal-500" />
                  <span>{dependent.age} years old</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaHeartbeat className="text-teal-500" />
                  <span className={`font-semibold ${
                    dependent.status === 'stable' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {dependent.status.charAt(0).toUpperCase() + dependent.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-teal-200">
        <div className="flex gap-8">
          {[
            { id: 'overview', label: 'Overview', icon: FaUserCircle },
            { id: 'medications', label: 'Medications', icon: FaPills },
            { id: 'appointments', label: 'Appointments', icon: FaCalendar },
            { id: 'notes', label: 'Health Notes', icon: FaNotesMedical },
            { id: 'carePlan', label: 'Care Plan', icon: FaCheckCircle },
          ].map(({ id: tabId, label, icon }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`pb-4 px-2 font-semibold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === tabId
                  ? 'text-teal-600 border-teal-600'
                  : 'text-teal-700 border-transparent hover:text-teal-600'
              }`}
            >
              {icon ? React.createElement(icon) : null} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow-lg rounded-2xl p-6 border border-teal-100">
                <h3 className="text-xl font-bold text-teal-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FaPhone className="text-teal-500 mt-1" />
                    <div>
                      <div className="text-sm text-teal-600">Phone</div>
                      <div className="font-semibold text-teal-900">{dependent.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-teal-500 mt-1" />
                    <div>
                      <div className="text-sm text-teal-600">Address</div>
                      <div className="font-semibold text-teal-900">{dependent.address}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-lg rounded-2xl p-6 border border-teal-100">
                <h3 className="text-xl font-bold text-teal-900 mb-4">Emergency Contact</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-teal-600">Name</div>
                    <div className="font-semibold text-teal-900">{dependent.emergencyContact.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-teal-600">Relationship</div>
                    <div className="font-semibold text-teal-900">{dependent.emergencyContact.relationship}</div>
                  </div>
                  <div>
                    <div className="text-sm text-teal-600">Phone</div>
                    <div className="font-semibold text-teal-900">{dependent.emergencyContact.phone}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-lg rounded-2xl p-6 border border-teal-100">
              <h3 className="text-xl font-bold text-teal-900 mb-4">Current Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="text-sm text-green-700">Overall Status</div>
                  <div className="text-2xl font-bold text-green-600 mt-2">
                    {dependent.status.charAt(0).toUpperCase() + dependent.status.slice(1)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="text-sm text-blue-700">Current Mood</div>
                  <div className="text-2xl font-bold text-blue-600 mt-2">
                    {dependent.mood.charAt(0).toUpperCase() + dependent.mood.slice(1)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medications Tab */}
        {activeTab === 'medications' && (
          <div className="space-y-6">
            <div className="bg-white shadow-lg rounded-2xl p-6 border border-teal-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-teal-900">Current Medications</h3>
                  <p className="text-teal-600 text-sm">Overall adherence: {dependent.medicationAdherence}%</p>
                </div>
              </div>
              <div className="space-y-4">
                {dependent.medications.map((med) => (
                  <div
                    key={med.id}
                    className="flex items-center justify-between p-4 bg-teal-50 rounded-xl border border-teal-200 hover:border-teal-300 transition"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-teal-900">{med.name}</div>
                      <div className="text-sm text-teal-600">{med.dosage} • {med.frequency}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-teal-600">{med.adherence}%</div>
                      <div className="text-xs text-teal-600">Adherence</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="bg-white shadow-lg rounded-2xl p-6 border border-teal-100">
              <h3 className="text-2xl font-bold text-teal-900 mb-6">Appointments</h3>
              <div className="space-y-4">
                {dependent.appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 bg-teal-50 rounded-xl border border-teal-200"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-teal-900">{apt.type}</div>
                      <div className="flex items-center gap-4 mt-2 text-teal-600 text-sm">
                        <span className="flex items-center gap-1">
                          <FaCalendar /> {apt.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock /> {apt.time}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      apt.status === 'scheduled' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Health Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="bg-white shadow-lg rounded-2xl p-6 border border-teal-100">
              <h3 className="text-2xl font-bold text-teal-900 mb-6">Health Notes</h3>
              <div className="space-y-4">
                {dependent.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 bg-teal-50 rounded-xl border border-teal-200"
                  >
                    <div className="text-sm text-teal-600 font-semibold mb-2">{note.date}</div>
                    <div className="text-teal-900">{note.content}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Care Plan Tab */}
        {activeTab === 'carePlan' && (
          <div className="space-y-6">
            <div className="bg-white shadow-lg rounded-2xl p-6 border border-teal-100">
              <h3 className="text-2xl font-bold text-teal-900 mb-6">Care Plan Goals</h3>
              <div className="space-y-4">
                {dependent.carePlan.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between p-4 bg-teal-50 rounded-xl border border-teal-200"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FaCheckCircle className={`text-xl ${
                        goal.status === 'on-track' ? 'text-green-500' : 'text-yellow-500'
                      }`} />
                      <div className="font-semibold text-teal-900">{goal.goal}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      goal.status === 'on-track' ? 'bg-green-100 text-green-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {goal.status === 'on-track' ? 'On Track' : 'Needs Attention'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DependentProfile;

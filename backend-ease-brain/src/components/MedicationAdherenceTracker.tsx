import React, { useState, useMemo } from 'react';
import { useDarkMode } from '@/context/DarkModeContext';
import {
  FaMedkit,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationCircle,
  FaCalendarAlt,
  FaChartLine,
  FaBell,
  FaUser,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  dependentId: string;
  dependentName: string;
}

interface MedicationSchedule {
  date: string;
  dependent: string;
  medication: string;
  scheduledTime: string;
  status: 'taken' | 'missed' | 'pending';
  notes?: string;
}

interface MedicationAdherenceTrackerProps {
  onAlert?: (message: string) => void;
}

const generateSampleMedications = (): Medication[] => [
  {
    id: 'med1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    time: '08:00 AM',
    dependentId: 'dep1',
    dependentName: 'John Smith',
  },
  {
    id: 'med2',
    name: 'Aspirin',
    dosage: '81mg',
    frequency: 'Once daily',
    time: '08:00 AM',
    dependentId: 'dep1',
    dependentName: 'John Smith',
  },
  {
    id: 'med3',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    time: '08:00 AM, 06:00 PM',
    dependentId: 'dep2',
    dependentName: 'Mary Johnson',
  },
  {
    id: 'med4',
    name: 'Omeprazole',
    dosage: '20mg',
    frequency: 'Once daily',
    time: '07:00 AM',
    dependentId: 'dep3',
    dependentName: 'Robert Brown',
  },
];

const generateSampleSchedule = (): MedicationSchedule[] => {
  const today = new Date();
  const schedule: MedicationSchedule[] = [];

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Sample data for each dependent
    const medications = [
      { dependent: 'John Smith', medication: 'Lisinopril', time: '08:00' },
      { dependent: 'John Smith', medication: 'Aspirin', time: '08:00' },
      { dependent: 'Mary Johnson', medication: 'Metformin', time: '08:00' },
      { dependent: 'Mary Johnson', medication: 'Metformin', time: '18:00' },
      { dependent: 'Robert Brown', medication: 'Omeprazole', time: '07:00' },
    ];

    medications.forEach((med) => {
      const rand = Math.random();
      let status: 'taken' | 'missed' | 'pending' = 'taken';

      if (i === 0) {
        status = rand < 0.3 ? 'pending' : 'taken';
      } else {
        status = rand < 0.85 ? 'taken' : 'missed';
      }

      schedule.push({
        date: dateStr,
        dependent: med.dependent,
        medication: med.medication,
        scheduledTime: med.time,
        status,
        notes: status === 'missed' ? 'Patient refused' : status === 'taken' ? 'Taken with water' : undefined,
      });
    });
  }

  return schedule;
};

const MedicationAdherenceTracker: React.FC<MedicationAdherenceTrackerProps> = ({ onAlert }) => {
  const { isDarkMode } = useDarkMode();
  const [selectedDependent, setSelectedDependent] = useState('all');
  const [medications] = useState(generateSampleMedications());
  const [schedule] = useState<MedicationSchedule[]>(generateSampleSchedule());

  const dependents = useMemo(() => {
    const deps = new Set(medications.map((m) => ({ id: m.dependentId, name: m.dependentName })));
    return Array.from(deps);
  }, [medications]);

  const filteredSchedule = useMemo(() => {
    if (selectedDependent === 'all') return schedule;
    const dependent = dependents.find((d) => d.id === selectedDependent);
    return schedule.filter((s) => s.dependent === dependent?.name);
  }, [schedule, selectedDependent, dependents]);

  // Calculate adherence data for chart
  const adherenceChartData = useMemo(() => {
    const weeks: { [key: string]: { taken: number; total: number } } = {};

    filteredSchedule.forEach((item) => {
      const date = new Date(item.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeks[weekKey]) {
        weeks[weekKey] = { taken: 0, total: 0 };
      }

      weeks[weekKey].total += 1;
      if (item.status === 'taken') {
        weeks[weekKey].taken += 1;
      }
    });

    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, { taken, total }]) => ({
        week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        adherence: Math.round((taken / total) * 100),
      }));
  }, [filteredSchedule]);

  // Calculate overall metrics
  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySchedule = filteredSchedule.filter((s) => s.date === today);
    const taken = todaySchedule.filter((s) => s.status === 'taken').length;
    const missed = todaySchedule.filter((s) => s.status === 'missed').length;
    const pending = todaySchedule.filter((s) => s.status === 'pending').length;

    const allTaken = filteredSchedule.filter((s) => s.status === 'taken').length;
    const allMissed = filteredSchedule.filter((s) => s.status === 'missed').length;
    const totalRecords = filteredSchedule.length;
    const overallAdherence = totalRecords > 0 ? Math.round((allTaken / totalRecords) * 100) : 0;

    return {
      todayTaken: taken,
      todayMissed: missed,
      todayPending: pending,
      overallAdherence,
      missedDoses: allMissed,
      totalScheduled: totalRecords,
    };
  }, [filteredSchedule]);

  const handleMarkTaken = (schedule: MedicationSchedule) => {
    toast.success(`Marked ${schedule.medication} as taken for ${schedule.dependent}`);
  };

  const handleSetReminder = (medication: Medication) => {
    toast.success(`Reminder set for ${medication.name} at ${medication.time}`);
    if (onAlert) {
      onAlert(`Reminder set for ${medication.name}`);
    }
  };

  const getMissedMedications = () => {
    const today = new Date().toISOString().split('T')[0];
    return filteredSchedule.filter(
      (s) => s.date === today && s.status === 'missed'
    );
  };

  const missedToday = getMissedMedications();

  return (
    <div className={`rounded-lg sm:rounded-2xl p-4 sm:p-8 shadow-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-teal-100'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <FaMedkit className={`text-2xl sm:text-3xl ${isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />
          <h2 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
            Medication Tracker
          </h2>
        </div>
        {missedToday.length > 0 && (
          <div className={`px-2 sm:px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm ${isDarkMode ? 'bg-red-900/30 border border-red-500' : 'bg-red-50 border border-red-200'}`}>
            <FaExclamationCircle className={`${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
            <span className={`font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
              {missedToday.length} missed
            </span>
          </div>
        )}
      </div>

      {/* Dependent Filter */}
      <div className="mb-6 sm:mb-8">
        <label className={`block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
          <FaUser className="inline mr-2" />
          Filter by Dependent
        </label>
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          <button
            onClick={() => setSelectedDependent('all')}
            className={`px-2 sm:px-4 py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm min-h-[44px] sm:min-h-auto flex items-center ${
              selectedDependent === 'all'
                ? isDarkMode
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-500 text-white'
                : isDarkMode
                  ? 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                  : 'bg-gray-100 text-teal-700 hover:bg-teal-50'
            }`}
          >
            All
          </button>
          {dependents.map((dep) => (
            <button
              key={dep.id}
              onClick={() => setSelectedDependent(dep.id)}
              className={`px-2 sm:px-4 py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm min-h-[44px] sm:min-h-auto flex items-center ${
                selectedDependent === dep.id
                  ? isDarkMode
                    ? 'bg-teal-600 text-white'
                    : 'bg-teal-500 text-white'
                  : isDarkMode
                    ? 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                    : 'bg-gray-100 text-teal-700 hover:bg-teal-50'
              }`}
            >
              {dep.name}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Overall Adherence */}
        <div className={`p-3 sm:p-6 rounded-lg sm:rounded-xl border-2 ${isDarkMode ? 'bg-gradient-to-br from-teal-900/40 to-emerald-900/40 border-teal-500' : 'bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-300'}`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
              Overall
            </p>
            <FaChartLine className={`text-sm sm:text-base ${isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />
          </div>
          <div className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}>
            {metrics.overallAdherence}%
          </div>
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {metrics.totalScheduled} tracked
          </p>
        </div>

        {/* Today's Taken */}
        <div className={`p-3 sm:p-6 rounded-lg sm:rounded-xl border-2 ${isDarkMode ? 'bg-gradient-to-br from-emerald-900/40 to-green-900/40 border-emerald-500' : 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300'}`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
              Today Taken
            </p>
            <FaCheckCircle className={`text-sm sm:text-base ${isDarkMode ? 'text-emerald-400' : 'text-emerald-500'}`} />
          </div>
          <div className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>
            {metrics.todayTaken}
          </div>
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            of {metrics.todayTaken + metrics.todayMissed + metrics.todayPending}
          </p>
        </div>

        {/* Today's Missed */}
        <div className={`p-6 rounded-xl border-2 ${isDarkMode ? 'bg-gradient-to-br from-red-900/40 to-orange-900/40 border-red-500' : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-300'}`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
              Today Missed
            </p>
            <FaTimesCircle className={isDarkMode ? 'text-red-400' : 'text-red-500'} />
          </div>
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
            {metrics.todayMissed}
          </div>
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {metrics.missedDoses} total
          </p>
        </div>

        {/* Pending */}
        <div className={`p-6 rounded-xl border-2 ${isDarkMode ? 'bg-gradient-to-br from-amber-900/40 to-yellow-900/40 border-amber-500' : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300'}`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
              Pending Today
            </p>
            <FaClock className={isDarkMode ? 'text-amber-400' : 'text-amber-500'} />
          </div>
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`}>
            {metrics.todayPending}
          </div>
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Awaiting confirmation
          </p>
        </div>
      </div>

      {/* Adherence Trend Chart */}
      <div className={`p-6 rounded-xl border mb-8 ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-gray-50 border-teal-200'}`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
          <FaCalendarAlt className={isDarkMode ? 'text-teal-400' : 'text-teal-500'} />
          Adherence Trend (2 Weeks)
        </h3>
        <div style={{ minHeight: '300px' }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={adherenceChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#475569' : '#e5e7eb'} />
              <XAxis dataKey="week" stroke={isDarkMode ? '#94a3b8' : '#6b7280'} />
              <YAxis stroke={isDarkMode ? '#94a3b8' : '#6b7280'} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                  border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                  color: isDarkMode ? '#e2e8f0' : '#000',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="adherence"
                name="Adherence %"
                stroke="#0d9488"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Medication List */}
      <div className="mb-8">
        <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
          <FaMedkit className="inline mr-2" />
          Active Medications
        </h3>
        <div className="space-y-3">
          {medications
            .filter((med) => selectedDependent === 'all' || med.dependentId === selectedDependent)
            .map((med) => (
              <div
                key={med.id}
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                    {med.name}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {med.dosage} • {med.frequency}
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}>
                    Scheduled: {med.time} • {med.dependentName}
                  </p>
                </div>
                <button
                  onClick={() => handleSetReminder(med)}
                  className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                    isDarkMode
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'bg-teal-500 text-white hover:bg-teal-600'
                  }`}
                >
                  <FaBell className="w-4 h-4" />
                  Reminder
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Schedule */}
      <div>
        <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
          <FaCalendarAlt className="inline mr-2" />
          Recent Schedule (Last 7 Days)
        </h3>
        <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'border-slate-600' : 'border-gray-200'}`}>
          <div className={`overflow-x-auto`}>
            <table className="w-full">
              <thead>
                <tr className={isDarkMode ? 'bg-slate-800' : 'bg-teal-50'}>
                  <th className={`px-4 py-3 text-left font-semibold text-sm ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                    Date
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold text-sm ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                    Dependent
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold text-sm ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                    Medication
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold text-sm ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                    Time
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold text-sm ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                    Status
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold text-sm ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedule.slice(0, 10).map((item, idx) => (
                  <tr
                    key={idx}
                    className={`border-t ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                        : 'bg-white border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {item.dependent}
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                      {item.medication}
                    </td>
                    <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {item.scheduledTime}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                          item.status === 'taken'
                            ? isDarkMode
                              ? 'bg-emerald-900/50 text-emerald-300'
                              : 'bg-emerald-100 text-emerald-700'
                            : item.status === 'missed'
                              ? isDarkMode
                                ? 'bg-red-900/50 text-red-300'
                                : 'bg-red-100 text-red-700'
                              : isDarkMode
                                ? 'bg-amber-900/50 text-amber-300'
                                : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {item.status === 'taken' ? (
                          <FaCheckCircle className="w-3 h-3" />
                        ) : item.status === 'missed' ? (
                          <FaTimesCircle className="w-3 h-3" />
                        ) : (
                          <FaClock className="w-3 h-3" />
                        )}
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.status === 'pending' ? (
                        <button
                          onClick={() => handleMarkTaken(item)}
                          className={`px-3 py-1 rounded font-semibold text-xs transition-all ${
                            isDarkMode
                              ? 'bg-teal-600 text-white hover:bg-teal-700'
                              : 'bg-teal-500 text-white hover:bg-teal-600'
                          }`}
                        >
                          Mark Taken
                        </button>
                      ) : (
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          •••
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationAdherenceTracker;

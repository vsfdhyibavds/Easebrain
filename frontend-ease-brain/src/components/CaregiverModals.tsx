import { FC, useState, FormEvent, ChangeEvent } from 'react';
import {
  FaTimes,
  FaPlus,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaClock,
  FaBell,
  FaCheckCircle,
  FaClipboardList,
  FaStethoscope,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useDarkMode } from '@/context/DarkModeContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Add Dependent Modal
export const AddDependentModal: FC<ModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: 'family',
    dateOfBirth: '',
    medicalConditions: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(`${formData.name} has been added as a dependent!`);
      setFormData({
        name: '',
        email: '',
        phone: '',
        relationship: 'family',
        dateOfBirth: '',
        medicalConditions: '',
      });
      onClose();
    } catch {
      toast.error('Failed to add dependent');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        className={`w-full max-w-2xl rounded-3xl shadow-2xl ${
          isDarkMode ? 'bg-slate-700' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b px-6 sm:px-8 py-4 sm:py-6 ${isDarkMode ? 'border-slate-600' : 'border-teal-100'}`}>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-teal-500 to-cyan-500 p-3 rounded-xl">
              <FaPlus className="text-white text-lg sm:text-xl" />
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
              Add New Dependent
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-slate-600 text-teal-400' : 'hover:bg-teal-50 text-teal-600'
            }`}
            aria-label="Close modal"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 sm:space-y-6">
          {/* Full Name */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
              Full Name *
            </label>
            <div className="relative">
              <FaUser className={`absolute left-4 top-3.5 ${isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  isDarkMode
                    ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
                    : 'bg-white border-teal-200 text-teal-900 placeholder-teal-400'
                }`}
              />
            </div>
          </div>

          {/* Grid for Email and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Email */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                Email
              </label>
              <div className="relative">
                <FaEnvelope className={`absolute left-4 top-3.5 ${isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    isDarkMode
                      ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
                      : 'bg-white border-teal-200 text-teal-900 placeholder-teal-400'
                  }`}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                Phone Number
              </label>
              <div className="relative">
                <FaPhone className={`absolute left-4 top-3.5 ${isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    isDarkMode
                      ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
                      : 'bg-white border-teal-200 text-teal-900 placeholder-teal-400'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Grid for Date of Birth and Relationship */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Date of Birth */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                Date of Birth
              </label>
              <div className="relative">
                <FaCalendar className={`absolute left-4 top-3.5 ${isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    isDarkMode
                      ? 'bg-slate-600 border-slate-500 text-white'
                      : 'bg-white border-teal-200 text-teal-900'
                  }`}
                />
              </div>
            </div>

            {/* Relationship */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                Relationship
              </label>
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  isDarkMode
                    ? 'bg-slate-600 border-slate-500 text-white'
                    : 'bg-white border-teal-200 text-teal-900'
                }`}
              >
                <option value="family">Family Member</option>
                <option value="friend">Friend</option>
                <option value="colleague">Colleague</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Medical Conditions */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
              Medical Conditions (Optional)
            </label>
            <textarea
              name="medicalConditions"
              value={formData.medicalConditions}
              onChange={handleChange}
              placeholder="List any relevant medical conditions or allergies..."
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${
                isDarkMode
                  ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
                  : 'bg-white border-teal-200 text-teal-900 placeholder-teal-400'
              }`}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                isDarkMode
                  ? 'bg-slate-600 hover:bg-slate-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                loading
                  ? isDarkMode
                    ? 'bg-teal-600/50 text-teal-200'
                    : 'bg-teal-500/50 text-white'
                  : isDarkMode
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {loading ? (
                <>
                  <FaClock className="animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <FaCheckCircle /> Add Dependent
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Task Modal
export const CreateTaskModal: FC<ModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: 'all',
    priority: 'medium',
    dueDate: '',
    category: 'health',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(`Task "${formData.title}" has been created!`);
      setFormData({
        title: '',
        description: '',
        assignee: 'all',
        priority: 'medium',
        dueDate: '',
        category: 'health',
      });
      onClose();
    } catch {
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`w-full max-w-2xl rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b px-6 sm:px-8 py-4 sm:py-6 ${isDarkMode ? 'border-slate-600' : 'border-teal-100'}`}>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-xl">
              <FaClipboardList className="text-white text-lg sm:text-xl" />
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
              Create New Task
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-slate-600 text-teal-400' : 'hover:bg-teal-50 text-teal-600'
            }`}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 sm:space-y-6">
          {/* Title */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Daily medication reminder"
              required
              className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                isDarkMode
                  ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
                  : 'bg-white border-teal-200 text-teal-900 placeholder-teal-400'
              }`}
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add task details..."
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${
                isDarkMode
                  ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
                  : 'bg-white border-teal-200 text-teal-900 placeholder-teal-400'
              }`}
            />
          </div>

          {/* Grid for Category, Priority, Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  isDarkMode
                    ? 'bg-slate-600 border-slate-500 text-white'
                    : 'bg-white border-teal-200 text-teal-900'
                }`}
              >
                <option value="health">Health</option>
                <option value="medication">Medication</option>
                <option value="appointment">Appointment</option>
                <option value="activity">Activity</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  isDarkMode
                    ? 'bg-slate-600 border-slate-500 text-white'
                    : 'bg-white border-teal-200 text-teal-900'
                }`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                Assign To
              </label>
              <select
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  isDarkMode
                    ? 'bg-slate-600 border-slate-500 text-white'
                    : 'bg-white border-teal-200 text-teal-900'
                }`}
              >
                <option value="all">All Dependents</option>
                <option value="john">John Doe</option>
                <option value="mary">Mary Johnson</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
              Due Date
            </label>
            <div className="relative">
              <FaCalendar className={`absolute left-4 top-3.5 ${isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  isDarkMode
                    ? 'bg-slate-600 border-slate-500 text-white'
                    : 'bg-white border-teal-200 text-teal-900'
                }`}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                isDarkMode
                  ? 'bg-slate-600 hover:bg-slate-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                loading
                  ? isDarkMode
                    ? 'bg-amber-600/50 text-amber-200'
                    : 'bg-amber-500/50 text-white'
                  : isDarkMode
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {loading ? (
                <>
                  <FaClock className="animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <FaCheckCircle /> Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Send Alert Modal
export const SendAlertModal: FC<ModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    recipient: 'all',
    severity: 'warning',
    title: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Health alert has been sent!');
      setFormData({
        recipient: 'all',
        severity: 'warning',
        title: '',
        message: '',
      });
      onClose();
    } catch {
      toast.error('Failed to send alert');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`w-full max-w-2xl rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b px-6 sm:px-8 py-4 sm:py-6 ${isDarkMode ? 'border-slate-600' : 'border-teal-100'}`}>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-red-500 to-orange-500 p-3 rounded-xl">
              <FaBell className="text-white text-lg sm:text-xl" />
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
              Send Health Alert
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-slate-600 text-teal-400' : 'hover:bg-teal-50 text-teal-600'
            }`}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 sm:space-y-6">
          {/* Grid for Recipient and Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                Send To
              </label>
              <select
                name="recipient"
                value={formData.recipient}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  isDarkMode
                    ? 'bg-slate-600 border-slate-500 text-white'
                    : 'bg-white border-teal-200 text-teal-900'
                }`}
              >
                <option value="all">All Dependents</option>
                <option value="john">John Doe</option>
                <option value="mary">Mary Johnson</option>
                <option value="family">Family Members</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                Severity Level
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  isDarkMode
                    ? 'bg-slate-600 border-slate-500 text-white'
                    : 'bg-white border-teal-200 text-teal-900'
                }`}
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Alert Title */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
              Alert Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., High Blood Pressure Reading"
              required
              className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                isDarkMode
                  ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
                  : 'bg-white border-teal-200 text-teal-900 placeholder-teal-400'
              }`}
            />
          </div>

          {/* Alert Message */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Describe the health concern or required action..."
              rows={4}
              required
              className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${
                isDarkMode
                  ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
                  : 'bg-white border-teal-200 text-teal-900 placeholder-teal-400'
              }`}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                isDarkMode
                  ? 'bg-slate-600 hover:bg-slate-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                loading
                  ? isDarkMode
                    ? 'bg-red-600/50 text-red-200'
                    : 'bg-red-500/50 text-white'
                  : isDarkMode
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {loading ? (
                <>
                  <FaClock className="animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <FaBell /> Send Alert
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Schedule Appointment Modal
export const ScheduleAppointmentModal: FC<ModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    dependent: 'john',
    appointmentType: 'checkup',
    provider: '',
    date: '',
    time: '',
    location: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(
        `Appointment scheduled for ${formData.date} at ${formData.time}!`
      );
      setFormData({
        dependent: 'john',
        appointmentType: 'checkup',
        provider: '',
        date: '',
        time: '',
        location: '',
        notes: '',
      });
      onClose();
    } catch {
      toast.error('Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`w-full max-w-2xl rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b px-6 sm:px-8 py-4 sm:py-6 ${isDarkMode ? 'border-slate-600' : 'border-teal-100'}`}>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3 rounded-xl">
              <FaStethoscope className="text-white text-lg sm:text-xl" />
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
              Schedule Appointment
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-slate-600 text-teal-400' : 'hover:bg-teal-50 text-teal-600'
            }`}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 sm:space-y-6">
          {/* Grid for Dependent and Appointment Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                Dependent *
              </label>
              <select
                name="dependent"
                value={formData.dependent}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  isDarkMode
                    ? 'bg-slate-600 border-slate-500 text-white'
                    : 'bg-white border-teal-200 text-teal-900'
                }`}
              >
                <option value="john">John Doe</option>
                <option value="mary">Mary Johnson</option>
                <option value="patricia">Patricia Davis</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                Appointment Type *
              </label>
              <select
                name="appointmentType"
                value={formData.appointmentType}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  isDarkMode
                    ? 'bg-slate-600 border-slate-500 text-white'
                    : 'bg-white border-teal-200 text-teal-900'
                }`}
              >
                <option value="checkup">Annual Checkup</option>
                <option value="cardiology">Cardiology</option>
                <option value="neurology">Neurology</option>
                <option value="dentist">Dentist</option>
                <option value="other">Other Specialist</option>
              </select>
            </div>
          </div>

          {/* Provider */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
              Provider Name *
            </label>
            <input
              type="text"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              placeholder="e.g., Dr. Smith"
              required
              className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                isDarkMode
                  ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
                  : 'bg-white border-teal-200 text-teal-900 placeholder-teal-400'
              }`}
            />
          </div>

          {/* Grid for Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                Date *
              </label>
              <div className="relative">
                <FaCalendar className={`absolute left-4 top-3.5 ${isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    isDarkMode
                      ? 'bg-slate-600 border-slate-500 text-white'
                      : 'bg-white border-teal-200 text-teal-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                Time *
              </label>
              <div className="relative">
                <FaClock className={`absolute left-4 top-3.5 ${isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    isDarkMode
                      ? 'bg-slate-600 border-slate-500 text-white'
                      : 'bg-white border-teal-200 text-teal-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Main Hospital, Room 201"
              className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                isDarkMode
                  ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
                  : 'bg-white border-teal-200 text-teal-900 placeholder-teal-400'
              }`}
            />
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any special instructions or notes..."
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${
                isDarkMode
                  ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
                  : 'bg-white border-teal-200 text-teal-900 placeholder-teal-400'
              }`}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                isDarkMode
                  ? 'bg-slate-600 hover:bg-slate-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                loading
                  ? isDarkMode
                    ? 'bg-emerald-600/50 text-emerald-200'
                    : 'bg-emerald-500/50 text-white'
                  : isDarkMode
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {loading ? (
                <>
                  <FaClock className="animate-spin" /> Scheduling...
                </>
              ) : (
                <>
                  <FaCheckCircle /> Schedule Appointment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Wrapper component for managing multiple modals
interface CaregiverModalsWrapperProps {
  isAddModalOpen?: boolean;
  isEditModalOpen?: boolean;
  isDeleteModalOpen?: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
  selectedCaregiver?: any;
  [key: string]: any; // Allow any additional props
}

const CaregiverModalsWrapper: FC<CaregiverModalsWrapperProps> = ({
  isAddModalOpen = false,
  isEditModalOpen = false,
  isDeleteModalOpen = false,
  onClose,
  onSave: _onSave,
}) => {
  return (
    <>
      <AddDependentModal isOpen={isAddModalOpen} onClose={onClose} />
      <CreateTaskModal isOpen={isEditModalOpen} onClose={onClose} />
      <SendAlertModal isOpen={isDeleteModalOpen} onClose={onClose} />
      <ScheduleAppointmentModal isOpen={false} onClose={onClose} />
    </>
  );
};

export default CaregiverModalsWrapper;

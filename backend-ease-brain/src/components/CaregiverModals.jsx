import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { BASE_URL } from '@/utils/utils';

export function AddDependentModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    medicalHistory: '',
    emergencyContact: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const _handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/caregiver/dependents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          date_of_birth: formData.dateOfBirth,
          medical_history: formData.medicalHistory,
          emergency_contact: formData.emergencyContact
        })
      });

        if (res.ok) {
        const _data = await res.json();
        toast.success(`${formData.name} added as dependent!`);
        setFormData({ name: '', dateOfBirth: '', medicalHistory: '', emergencyContact: '' });
        onClose();
      } else {
        toast.error('Failed to add dependent');
      }
    } catch (error) {
      console.error('Error adding dependent:', error);
      toast.error('Failed to add dependent');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={_handleKeyDown}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-dependent-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="add-dependent-title" className="text-2xl font-bold text-teal-900">Add New Dependent</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
            type="button"
          >
            <FaTimes size={20} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="dependent-name" className="block text-sm font-semibold text-teal-900 mb-1">Name</label>
            <input
              id="dependent-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
              placeholder="Enter dependent's name"
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="dependent-dob" className="block text-sm font-semibold text-teal-900 mb-1">Date of Birth</label>
            <input
              id="dependent-dob"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="dependent-medical-history" className="block text-sm font-semibold text-teal-900 mb-1">Medical History</label>
            <textarea
              id="dependent-medical-history"
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
              placeholder="Any relevant medical conditions..."
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="dependent-emergency-contact" className="block text-sm font-semibold text-teal-900 mb-1">Emergency Contact</label>
            <input
              id="dependent-emergency-contact"
              type="text"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
              placeholder="Emergency contact number"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-teal-200 text-teal-700 rounded-lg hover:bg-teal-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Dependent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CreateTaskModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    assignedTo: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const _handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/caregiver/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          due_date: formData.dueDate,
          priority: formData.priority,
          dependent_id: formData.dependentId
        })
      });

      if (res.ok) {
        const _data = await res.json();
        toast.success(`Task "${formData.title}" created!`);
        setFormData({ title: '', description: '', dueDate: '', priority: 'medium', assignedTo: '' });
        onClose();
      } else {
        toast.error('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={_handleKeyDown}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-task-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="create-task-title" className="text-2xl font-bold text-teal-900">Create Task List</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
            type="button"
          >
            <FaTimes size={20} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-sm font-semibold text-teal-900 mb-1">Task Title</label>
            <input
              id="task-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              aria-required="true"
              className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
              placeholder="e.g., Morning medication"
            />
          </div>

          <div>
            <label htmlFor="task-description" className="block text-sm font-semibold text-teal-900 mb-1">Description</label>
            <textarea
              id="task-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
              placeholder="Task details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-due-date" className="block text-sm font-semibold text-teal-900 mb-1">Due Date</label>
              <input
                id="task-due-date"
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label htmlFor="task-priority" className="block text-sm font-semibold text-teal-900 mb-1">Priority</label>
              <select
                id="task-priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                aria-label="Select task priority"
                className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-teal-200 text-teal-700 rounded-lg hover:bg-teal-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SendAlertModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    dependentName: '',
    alertType: 'health',
    message: '',
    severity: 'medium'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const _handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/caregiver/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dependent_name: formData.dependentName,
          alert_type: formData.alertType,
          message: formData.message,
          severity: formData.severity
        })
      });

      if (res.ok) {
        const _data = await res.json();
        toast.success('Health alert sent!');
        setFormData({ dependentName: '', alertType: 'health', message: '', severity: 'medium' });
        onClose();
      } else {
        toast.error('Failed to send alert');
      }
    } catch (error) {
      console.error('Error sending alert:', error);
      toast.error('Failed to send alert');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-teal-900">Send Health Alert</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-teal-900 mb-1">Alert Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
              placeholder="What is the alert about?"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-teal-900 mb-1">Severity</label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-teal-200 text-teal-700 rounded-lg hover:bg-teal-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ScheduleAppointmentModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    dependentName: '',
    appointmentType: '',
    date: '',
    time: '',
    provider: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const _handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/caregiver/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dependent_name: formData.dependentName,
          appointment_type: formData.appointmentType,
          date: formData.date,
          time: formData.time,
          provider: formData.provider
        })
      });

      if (res.ok) {
        const _data = await res.json();
        toast.success(`Appointment for ${formData.dependentName} scheduled!`);
        setFormData({ dependentName: '', appointmentType: '', date: '', time: '', provider: '' });
        onClose();
      } else {
        toast.error('Failed to schedule appointment');
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast.error('Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-teal-900">Schedule Appointment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">


          <div>
            <label className="block text-sm font-semibold text-teal-900 mb-1">Provider</label>
            <input
              type="text"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
              placeholder="Provider name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-teal-900 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-teal-900 mb-1">Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>



          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-teal-200 text-teal-700 rounded-lg hover:bg-teal-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

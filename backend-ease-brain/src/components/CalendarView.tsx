import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment-timezone';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useDarkMode } from '@/context/DarkModeContext';
import { FaChevronLeft, FaChevronRight, FaCalendar } from 'react-icons/fa';

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  dependent: string;
  type: 'appointment' | 'task' | 'reminder';
  color: string;
}

interface CalendarViewProps {
  onEventSelect?: (event: CalendarEvent) => void;
  onDateSelect?: (date: Date) => void;
}

// Sample data - in production, this would come from your API
const generateSampleEvents = (): CalendarEvent[] => {
  const today = new Date();
  const dependents = [
    { name: 'John Smith', color: '#0d9488' },
    { name: 'Mary Johnson', color: '#7c3aed' },
    { name: 'Robert Brown', color: '#f59e0b' },
  ];

  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Doctor Checkup',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 11, 0),
      dependent: dependents[0].name,
      type: 'appointment',
      color: dependents[0].color,
    },
    {
      id: '2',
      title: 'Medication Reminder',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30),
      dependent: dependents[1].name,
      type: 'reminder',
      color: dependents[1].color,
    },
    {
      id: '3',
      title: 'Physical Therapy',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 15, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 16, 30),
      dependent: dependents[0].name,
      type: 'appointment',
      color: dependents[0].color,
    },
    {
      id: '4',
      title: 'Daily Task - Morning Walk',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 9, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 9, 30),
      dependent: dependents[2].name,
      type: 'task',
      color: dependents[2].color,
    },
    {
      id: '5',
      title: 'Follow-up Call',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 11, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 11, 30),
      dependent: dependents[1].name,
      type: 'appointment',
      color: dependents[1].color,
    },
    {
      id: '6',
      title: 'Meal Prep Task',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 18, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 19, 0),
      dependent: dependents[2].name,
      type: 'task',
      color: dependents[2].color,
    },
  ];

  return events;
};

const CalendarView: React.FC<CalendarViewProps> = ({ onEventSelect, onDateSelect }) => {
  const { isDarkMode } = useDarkMode();
  const [events] = useState<CalendarEvent[]>(generateSampleEvents());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');

  const userEvents = useMemo(() => {
    return events.map((event) => ({
      ...event,
      resource: {
        color: event.color,
        type: event.type,
        dependent: event.dependent,
      },
    }));
  }, [events]);

  const handleSelectEvent = (event: any) => {
    if (onEventSelect) {
      onEventSelect(event);
    }
  };

  const handleSelectSlot = (slotInfo: any) => {
    if (onDateSelect) {
      onDateSelect(slotInfo.start);
    }
  };

  const customEventStyleGetter = (event: any) => {
    const backgroundColor = event.resource?.color || '#0d9488';
    const isDark = isDarkMode;

    return {
      style: {
        backgroundColor: backgroundColor,
        borderRadius: '6px',
        opacity: 0.8,
        color: '#fff',
        border: `2px solid ${isDark ? '#1e293b' : '#f1f5f9'}`,
        display: 'block',
        fontSize: '0.85rem',
        padding: '4px 6px',
        fontWeight: 500,
      },
    };
  };

  const CustomToolbar = (toolbar: any) => {
    const goToToday = () => {
      toolbar.onNavigate('TODAY');
    };

    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const label = () => {
      const date = new Date(toolbar.date);
      return (
        <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
          {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
      );
    };

    return (
      <div className={`flex items-center justify-between mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-teal-50'}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={goToBack}
            className={`p-2 rounded-lg transition ${isDarkMode ? 'bg-slate-600 text-white hover:bg-slate-500' : 'bg-white text-teal-600 hover:bg-teal-100 border border-teal-200'}`}
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={goToToday}
            className={`px-4 py-2 rounded-lg font-semibold transition ${isDarkMode ? 'bg-teal-600 text-white hover:bg-teal-500' : 'bg-teal-500 text-white hover:bg-teal-600'}`}
          >
            Today
          </button>
          <button
            onClick={goToNext}
            className={`p-2 rounded-lg transition ${isDarkMode ? 'bg-slate-600 text-white hover:bg-slate-500' : 'bg-white text-teal-600 hover:bg-teal-100 border border-teal-200'}`}
          >
            <FaChevronRight />
          </button>
        </div>
        {label()}
        <div className="flex gap-2">
          {['month', 'week', 'day', 'agenda'].map((viewType) => (
            <button
              key={viewType}
              onClick={() => setView(viewType as any)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition capitalize ${
                view === viewType
                  ? isDarkMode
                    ? 'bg-teal-600 text-white'
                    : 'bg-teal-500 text-white'
                  : isDarkMode
                    ? 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                    : 'bg-white text-teal-600 hover:bg-teal-50 border border-teal-200'
              }`}
            >
              {viewType}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`rounded-2xl p-6 shadow-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-teal-100'}`}>
      <div className="flex items-center gap-3 mb-6">
        <FaCalendar className={`text-2xl ${isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
          Calendar
        </h2>
      </div>

      <style>{`
        .rbc-calendar {
          font-family: inherit;
        }

        .rbc-header {
          padding: 12px 4px;
          font-weight: 600;
          font-size: 0.95rem;
          ${isDarkMode ? 'background-color: #0f172a; color: #e0e7ff;' : 'background-color: #f8fafc; color: #1e3a8a;'}
          border-bottom: 2px solid ${isDarkMode ? '#475569' : '#cbd5e1'};
        }

        .rbc-calendar button {
          cursor: pointer;
        }

        .rbc-btn-group button {
          background-color: ${isDarkMode ? '#475569' : '#f1f5f9'};
          color: ${isDarkMode ? '#e2e8f0' : '#0f172a'};
          border: 1px solid ${isDarkMode ? '#64748b' : '#cbd5e1'};
          padding: 6px 12px;
          margin: 0 4px;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .rbc-btn-group button:hover {
          background-color: ${isDarkMode ? '#64748b' : '#e0e7ff'};
          color: ${isDarkMode ? '#fff' : '#0f172a'};
        }

        .rbc-btn-group button.rbc-active {
          background-color: ${isDarkMode ? '#0d9488' : '#0d9488'};
          color: #fff;
          border-color: ${isDarkMode ? '#06b6d4' : '#06b6d4'};
        }

        .rbc-today {
          background-color: ${isDarkMode ? 'rgba(13, 148, 136, 0.1)' : 'rgba(13, 148, 136, 0.05)'};
        }

        .rbc-off-range-bg {
          background-color: ${isDarkMode ? '#1e293b' : '#f8fafc'};
        }

        .rbc-date-cell {
          padding: 8px 4px;
          text-align: right;
        }

        .rbc-date-cell > a {
          color: ${isDarkMode ? '#e0e7ff' : '#0f172a'};
          text-decoration: none;
          font-weight: 500;
        }

        .rbc-event {
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .rbc-event-content {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 2px 4px;
        }

        .rbc-event-label {
          font-weight: 500;
        }

        .rbc-time-slot {
          ${isDarkMode ? 'background-color: #1e293b;' : 'background-color: #fff;'}
        }

        .rbc-time-content {
          border-top: 1px solid ${isDarkMode ? '#475569' : '#e2e8f0'};
        }

        .rbc-current-time-indicator {
          background-color: ${isDarkMode ? '#0d9488' : '#06b6d4'};
          pointer-events: none;
          z-index: 3;
          left: 0;
          right: 0;
          height: 2px;
        }

        .rbc-time-cell {
          color: ${isDarkMode ? '#94a3b8' : '#64748b'};
          padding: 0 4px;
        }

        .rbc-timeslot-group {
          border-left: 1px solid ${isDarkMode ? '#475569' : '#e2e8f0'};
          min-height: 40px;
        }

        .rbc-day-bg {
          border-right: 1px solid ${isDarkMode ? '#475569' : '#e2e8f0'};
        }

        .rbc-time-header {
          border-bottom: 2px solid ${isDarkMode ? '#475569' : '#e2e8f0'};
        }

        .rbc-toolbar {
          display: none;
        }

        .rbc-agenda-view {
          background-color: ${isDarkMode ? '#1e293b' : '#f8fafc'};
          color: ${isDarkMode ? '#e2e8f0' : '#0f172a'};
        }

        .rbc-agenda-view table {
          width: 100%;
          border-collapse: collapse;
        }

        .rbc-agenda-view table tbody > tr > td {
          padding: 12px 8px;
          border-bottom: 1px solid ${isDarkMode ? '#475569' : '#e2e8f0'};
          background-color: ${isDarkMode ? '#0f172a' : '#fff'};
        }

        .rbc-agenda-view table tbody > tr[data-event]:hover > td {
          background-color: ${isDarkMode ? '#1e293b' : '#f1f5f9'};
        }

        .rbc-agenda-date-cell {
          color: ${isDarkMode ? '#e0e7ff' : '#0f172a'};
          font-weight: 600;
          width: auto;
          white-space: nowrap;
        }

        .rbc-agenda-time-cell {
          color: ${isDarkMode ? '#94a3b8' : '#64748b'};
          text-align: right;
          width: 120px;
          white-space: nowrap;
        }

        .rbc-agenda-event-cell {
          width: 100%;
        }

        .rbc-show-more {
          background-color: ${isDarkMode ? '#475569' : '#f1f5f9'};
          color: ${isDarkMode ? '#e2e8f0' : '#0f172a'};
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid ${isDarkMode ? '#64748b' : '#cbd5e1'};
        }

        .rbc-show-more:hover {
          background-color: ${isDarkMode ? '#64748b' : '#e0e7ff'};
        }

        .rbc-overlay {
          background-color: ${isDarkMode ? '#1e293b' : '#fff'};
          border: 2px solid ${isDarkMode ? '#475569' : '#e2e8f0'};
          color: ${isDarkMode ? '#e2e8f0' : '#0f172a'};
          box-shadow: 0 10px 25px ${isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'};
          border-radius: 8px;
          padding: 16px;
        }

        .rbc-overlay-header {
          color: ${isDarkMode ? '#e0e7ff' : '#0f172a'};
          font-weight: 600;
          margin-bottom: 8px;
        }
      `}</style>

      <div className={`${isDarkMode ? 'rbc-dark' : ''}`} style={{ minHeight: '600px' }}>
        <Calendar
          localizer={localizer}
          events={userEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          view={view}
          onView={setView}
          views={['month', 'week', 'day', 'agenda']}
          eventPropGetter={customEventStyleGetter}
          components={{ toolbar: CustomToolbar }}
          selectable
          popup
          defaultDate={new Date()}
          step={30}
          showMultiDayTimes
        />
      </div>

      {/* Legend */}
      <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-slate-600' : 'border-teal-200'}`}>
        <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
          Legend
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-teal-500" />
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              John Smith
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-600" />
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Mary Johnson
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500" />
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Robert Brown
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-500" />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Appointment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Task</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Reminder</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

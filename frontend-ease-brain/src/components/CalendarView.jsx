import React from "react";

export default function CalendarView({ reminders }) {
  // This is a simple placeholder. For a real calendar, use a library like react-big-calendar or FullCalendar.
  // Here, we just show reminders grouped by date.
  const grouped = reminders.reduce((acc, r) => {
    const date = r.remind_at ? r.remind_at.split('T')[0] : 'No Date';
    if (!acc[date]) acc[date] = [];
    acc[date].push(r);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8 w-full max-w-5xl">
      <h2 className="text-2xl font-bold text-teal-700 mb-4">Calendar View</h2>
      {Object.keys(grouped).sort().map(date => (
        <div key={date} className="mb-6">
          <div className="font-semibold text-teal-600 mb-2">{date}</div>
          <div className="flex flex-wrap gap-4">
            {grouped[date].map(reminder => (
              <div key={reminder.id} className="bg-gray-100 rounded p-4 shadow w-64">
                <div className="font-bold">{reminder.title}</div>
                <div className="text-sm text-gray-700">{reminder.description}</div>
                <div className="text-xs text-gray-500">{reminder.remind_at}</div>
                <div className="text-xs text-gray-500">Recurring: {reminder.recurring === 'none' ? 'No' : reminder.recurring === 'custom' ? `Every ${reminder.recurring_interval} days` : reminder.recurring.charAt(0).toUpperCase() + reminder.recurring.slice(1)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

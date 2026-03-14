import React, { useEffect, useState } from 'react';
import { BASE_URL } from '@/utils/utils';

// Fetch caregiver notes from API
const fetchNotes = async (token, userId) => {
  const response = await fetch(`${BASE_URL}/caregiver/notes?user_id=${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }

  const data = await response.json();
  return data.notes || [];
};

export default function CaregiverNotes({ userId, token }) {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotes(token, userId).then(setNotes).catch(() => setError('Failed to fetch notes'));
  }, [userId, token]);

  return (
    <div className="max-w-md mx-auto p-6 bg-gradient-to-br from-[#0D9488] to-pink-200 rounded-xl shadow-lg mt-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#0D9488' }}>Caregiver Notes</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <ul className="space-y-2">
        {notes.map(n => (
          <li key={n.id} className="px-4 py-2 bg-white rounded-lg shadow font-semibold border border-[#0D9488]" style={{ color: '#0D9488' }}>{n.note}</li>
        ))}
      </ul>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
// Placeholder API function, replace with real API call
const fetchCommunities = async () => {
  // Example: GET /communities
  return [
    { id: 1, name: 'Mental Health' },
    { id: 2, name: 'Caregivers' }
  ];
};

export default function Community({ token }) {
  const [communities, setCommunities] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    fetchCommunities(token)
      .then((res) => { if (mounted) setCommunities(res); })
      .catch(() => { if (mounted) setError('Failed to fetch communities'); });
    return () => { mounted = false; };
  }, [token]);

  return (
    <div className="max-w-md mx-auto p-6 bg-gradient-to-br from-[#0D9488] to-cyan-200 rounded-xl shadow-lg mt-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#0D9488' }}>Communities</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <ul className="space-y-2">
        {communities.map(c => (
          <li key={c.id} className="px-4 py-2 bg-white rounded-lg shadow font-semibold border border-[#0D9488]" style={{ color: '#0D9488' }}>{c.name}</li>
        ))}
      </ul>
    </div>
  );
}
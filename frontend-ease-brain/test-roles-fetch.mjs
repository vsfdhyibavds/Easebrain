const BASE_URL = '/api';
const response = await fetch(`http://localhost:5173${BASE_URL}/roles`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});
console.log('Status:', response.status);
const data = await response.json();
console.log('Data:', data);

export default function ErrorMessage({ message }) {
  if (!message) return null;
  return <div className="text-red-500 bg-red-100 p-2 rounded mb-2">{message}</div>;
}
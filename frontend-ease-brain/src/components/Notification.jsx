export default function Notification({ message, type = "info", onClose }) {
  if (!message) return null;
  const color = type === "error" ? "bg-red-500" : type === "success" ? "bg-green-500" : "bg-teal-500";
  return (
    <div className={`${color} text-white p-3 rounded fixed top-4 right-4 shadow-lg z-50`}>
      {message}
      <button className="ml-2 text-white" onClick={onClose}>✕</button>
    </div>
  );
}
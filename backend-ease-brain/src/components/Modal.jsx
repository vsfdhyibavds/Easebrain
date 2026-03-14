export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded p-6 shadow-lg dark:shadow-2xl min-w-[300px]">
        <button className="float-right text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" onClick={onClose}>✕</button>
        <div className="text-gray-900 dark:text-gray-100">{children}</div>
      </div>
    </div>
  );
}
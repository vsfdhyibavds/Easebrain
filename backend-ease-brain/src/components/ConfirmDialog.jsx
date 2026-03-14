import React from "react";
import { FaCheck, FaTimes, FaExclamationCircle } from "react-icons/fa";

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", isDangerous = false, darkMode = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in slide-in-from-top-2 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className={`flex items-center gap-3 mb-4 ${isDangerous ? "text-red-600" : darkMode ? "text-teal-400" : "text-teal-600"}`}>
          <FaExclamationCircle className="text-2xl" />
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
        </div>
        <p className={`mb-6 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold hover:opacity-80 transition-all ${darkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg text-white font-semibold transition-all transform active:scale-95 ${
              isDangerous
                ? "bg-red-600 hover:bg-red-700"
                : darkMode ? "bg-teal-600 hover:bg-teal-700" : "bg-teal-600 hover:bg-teal-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

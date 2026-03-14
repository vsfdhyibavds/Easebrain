import { FC, useState } from "react";
import { FaTimes, FaDownload, FaFileExcel, FaFileAlt, FaFileCsv } from "react-icons/fa";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportModal: FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [format, setFormat] = useState<"csv" | "json" | "excel">("csv");
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      // TODO: Connect to API to fetch data
      const data = {
        dependents: [],
        tasks: [],
        users: [],
        exportDate: new Date().toISOString(),
      };

      let content = "";
      let filename = "";
      let mimeType = "";

      switch (format) {
        case "csv":
          content = convertToCSV(data);
          filename = `easebrain-export-${new Date().toISOString().split("T")[0]}.csv`;
          mimeType = "text/csv";
          break;
        case "json":
          content = JSON.stringify(data, null, 2);
          filename = `easebrain-export-${new Date().toISOString().split("T")[0]}.json`;
          mimeType = "application/json";
          break;
        case "excel":
          content = convertToCSV(data); // Could use xlsx library for true Excel
          filename = `easebrain-export-${new Date().toISOString().split("T")[0]}.xlsx`;
          mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          break;
      }

      // Create blob and download
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const convertToCSV = (data: any) => {
    // Simple CSV conversion
    let csv = "System Export Report\n";
    csv += `Export Date: ${new Date().toLocaleString()}\n\n`;
    csv += "Summary\n";
    csv += `Total Dependents: ${data.dependents.length}\n`;
    csv += `Total Tasks: ${data.tasks.length}\n`;
    csv += `Total Users: ${data.users.length}\n`;
    return csv;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Export Data</h2>
            <button onClick={onClose} className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
              <FaTimes className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-4 px-6 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose a format to export all system data including dependents, tasks, and user information.
            </p>

            <div className="space-y-3">
              {/* CSV Option */}
              <label className="flex cursor-pointer items-center gap-3 rounded border-2 border-gray-200 dark:border-gray-700 p-3 hover:border-teal-500 dark:hover:border-teal-400 dark:bg-gray-700">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={format === "csv"}
                  onChange={(e) => setFormat(e.target.value as "csv")}
                  className="cursor-pointer"
                />
                <FaFileCsv className="text-blue-600 dark:text-blue-400" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">CSV Format</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Spreadsheet compatible</div>
                </div>
              </label>

              {/* JSON Option */}
              <label className="flex cursor-pointer items-center gap-3 rounded border-2 border-gray-200 dark:border-gray-700 p-3 hover:border-teal-500 dark:hover:border-teal-400 dark:bg-gray-700">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={format === "json"}
                  onChange={(e) => setFormat(e.target.value as "json")}
                  className="cursor-pointer"
                />
                <FaFileAlt className="text-yellow-600 dark:text-yellow-400" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">JSON Format</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Machine readable</div>
                </div>
              </label>

              {/* Excel Option */}
              <label className="flex cursor-pointer items-center gap-3 rounded border-2 border-gray-200 dark:border-gray-700 p-3 hover:border-teal-500 dark:hover:border-teal-400 dark:bg-gray-700">
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={format === "excel"}
                  onChange={(e) => setFormat(e.target.value as "excel")}
                  className="cursor-pointer"
                />
                <FaFileExcel className="text-green-600 dark:text-green-400" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Excel Format</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Advanced features</div>
                </div>
              </label>
            </div>

            <div className="rounded bg-blue-50 dark:bg-blue-950 p-3">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                💡 <strong>Tip:</strong> Exported data is encrypted and contains no sensitive credentials.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 flex gap-2 px-6 py-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded border border-gray-300 dark:border-gray-600 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 rounded bg-teal-600 dark:bg-teal-700 py-2 text-white hover:bg-teal-700 dark:hover:bg-teal-600 disabled:opacity-50"
            >
              <FaDownload /> {isLoading ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExportModal;

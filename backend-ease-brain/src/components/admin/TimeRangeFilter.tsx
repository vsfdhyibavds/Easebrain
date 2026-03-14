import { FC, useState } from "react";
import { FaCalendar, FaChevronDown } from "react-icons/fa";

export type TimeRange = "today" | "week" | "month" | "custom";

interface TimeRangeFilterProps {
  onRangeChange: (range: TimeRange) => void;
  defaultRange?: TimeRange;
}

const TimeRangeFilter: FC<TimeRangeFilterProps> = ({ onRangeChange, defaultRange = "week" }) => {
  const [activeRange, setActiveRange] = useState<TimeRange>(defaultRange);
  const [showDropdown, setShowDropdown] = useState(false);

  const ranges: { value: TimeRange; label: string; description: string }[] = [
    { value: "today", label: "Today", description: "Last 24 hours" },
    { value: "week", label: "This Week", description: "Last 7 days" },
    { value: "month", label: "This Month", description: "Last 30 days" },
    { value: "custom", label: "Custom", description: "Pick a date range" },
  ];

  const handleRangeChange = (range: TimeRange) => {
    setActiveRange(range);
    onRangeChange(range);
    setShowDropdown(false);
  };

  const activeLabel = ranges.find((r) => r.value === activeRange)?.label || "This Week";

  return (
    <div className="flex items-center gap-2">
      <FaCalendar className="text-teal-600 text-sm" />
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 rounded-lg border border-teal-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-teal-50 transition"
        >
          {activeLabel}
          <FaChevronDown size={12} />
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-teal-200 bg-white shadow-lg z-10">
            <div className="p-2">
              {ranges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => handleRangeChange(range.value)}
                  className={`w-full rounded px-3 py-2 text-left transition ${
                    activeRange === range.value
                      ? "bg-teal-100 text-teal-900"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="font-medium">{range.label}</div>
                  <div className="text-xs text-gray-500">{range.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeRangeFilter;

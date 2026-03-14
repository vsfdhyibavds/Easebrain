import { FC } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

interface TrendIndicatorProps {
  value: number; // percentage change
  label: string;
  showSparkline?: boolean;
}

const TrendIndicator: FC<TrendIndicatorProps> = ({ value, label, showSparkline = true }) => {
  const isPositive = value >= 0;
  const color = isPositive ? "text-green-600" : "text-red-600";
  const bgColor = isPositive ? "bg-green-50" : "bg-red-50";

  // Simple mini sparkline effect using bars
  const generateSparkline = () => {
    const data = [65, 72, 68, 85, 78, 90, 88];
    const max = Math.max(...data);
    const normalized = data.map((val) => (val / max) * 100);

    return (
      <div className="flex items-end gap-0.5">
        {normalized.map((height, idx) => (
          <div
            key={idx}
            className="w-1 rounded-sm bg-teal-300 opacity-60"
            style={{ height: `${height * 0.8 + 20}%` }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`rounded-lg p-3 ${bgColor} border border-opacity-20`}>
      <div className="space-y-2">
        {showSparkline && <div className="h-6">{generateSparkline()}</div>}

        <div className="flex items-center gap-1">
          {isPositive ? (
            <FaArrowUp className={`${color} text-xs`} />
          ) : (
            <FaArrowDown className={`${color} text-xs`} />
          )}
          <span className={`text-sm font-bold ${color}`}>{isPositive ? "+" : ""}{value}%</span>
          <span className="text-xs text-gray-600">{label}</span>
        </div>
      </div>
    </div>
  );
};

export default TrendIndicator;

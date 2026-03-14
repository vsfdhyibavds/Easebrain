import { FC } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaUsers, FaCheckCircle, FaChartLine } from "react-icons/fa";

// User Distribution Data
const userDistributionData = [
  { name: "Dependents", value: 42, fill: "#14b8a6" },
  { name: "Caregivers", value: 89, fill: "#06b6d4" },
  { name: "Admins", value: 25, fill: "#8b5cf6" },
];

// Tasks by Status
const tasksStatusData = [
  { status: "Pending", count: 12, fill: "#f59e0b" },
  { status: "In Progress", count: 18, fill: "#3b82f6" },
  { status: "Completed", count: 145, fill: "#10b981" },
  { status: "Overdue", count: 5, fill: "#ef4444" },
];

// System Health Timeline
const systemHealthData = [
  { time: "00:00", uptime: 99.8, health: 95 },
  { time: "04:00", uptime: 99.9, health: 96 },
  { time: "08:00", uptime: 99.7, health: 94 },
  { time: "12:00", uptime: 99.8, health: 95 },
  { time: "16:00", uptime: 99.9, health: 97 },
  { time: "20:00", uptime: 99.8, health: 96 },
  { time: "24:00", uptime: 99.9, health: 98 },
];

interface DashboardChartsProps {
  // Future use for conditional rendering
}

const DashboardCharts: FC<DashboardChartsProps> = () => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* User Distribution Pie Chart */}
      <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow dark:shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Distribution</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active users by type</p>
          </div>
          <FaUsers className="text-2xl text-teal-600 dark:text-teal-400" />
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={userDistributionData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {userDistributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {userDistributionData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks by Status Bar Chart */}
      <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow dark:shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tasks by Status</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Task breakdown</p>
          </div>
          <FaCheckCircle className="text-2xl text-blue-600 dark:text-blue-400" />
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={tasksStatusData}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" />
            <XAxis dataKey="status" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {tasksStatusData.map((item) => (
            <div key={item.status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.status}</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* System Health Line Chart */}
      <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow dark:shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">System Health</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">24h trend</p>
          </div>
          <FaChartLine className="text-2xl text-green-600 dark:text-green-400" />
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={systemHealthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" />
            <XAxis dataKey="time" />
            <YAxis domain={[90, 100]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="uptime"
              stroke="#10b981"
              dot={false}
              strokeWidth={2}
              name="Uptime %"
            />
            <Line
              type="monotone"
              dataKey="health"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={2}
              name="Health %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;

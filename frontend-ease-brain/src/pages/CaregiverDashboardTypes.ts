// Type definitions for CaregiverDashboard
import { IconType } from "react-icons";

export interface StatCard {
  title: string;
  value: number;
  icon: IconType;
  trend: string;
  change: string;
  trendUp: boolean;
  color: string;
  iconBg: string;
  textColor: string;
}

export interface Dependent {
  id: number;
  name: string;
  age: number;
  status: string;
  mood: string;
  medication_adherence: number;
  lastCheck: string;
  is_verified: boolean;
}

export interface Activity {
  id: number;
  dependent: string;
  activity: string;
  priority: string;
  timestamp: string;
  status: string;
}

export interface PerformanceData {
  overallScore: number;
  rating: string;
  taskCompletion: number;
  medicationAdherence: number;
  moodPositivity: number;
  responseTime: number;
}

export interface MoodDataPoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface MedicationDataPoint {
  dependent: string;
  taken: number;
  missed: number;
}

export interface DashboardStats {
  dependents_count: number;
  active_tasks: number;
  safety_concerns: number;
  completion_rate: number;
}

export interface DashboardData {
  stats: DashboardStats;
  dependents: Dependent[];
  recent_activities: Activity[];
  performance: PerformanceData;
  mood_data: MoodDataPoint[];
  medication_data: MedicationDataPoint[];
}

export interface ModalState {
  addDependent: boolean;
  createTask: boolean;
  sendAlert: boolean;
  scheduleAppointment: boolean;
  chat: boolean;
  viewReports: boolean;
  viewActivities: boolean;
  viewAllDependents: boolean;
  viewAllNotifications: boolean;
}

export interface User {
  accessToken: string;
  first_name: string;
  username: string;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

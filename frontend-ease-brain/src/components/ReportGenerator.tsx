import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { useDarkMode } from '@/context/DarkModeContext';
import {
  FaCalendarAlt,
  FaChartBar,
  FaHeartbeat,
  FaFileDownload,
  FaEnvelope,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

interface ReportData {
  period: 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  medicationAdherence: number;
  taskCompletion: number;
  moodScore: number;
  healthMetrics: {
    avgHeartRate: number;
    avgBloodPressure: string;
    avgTemperature: number;
    avgSteps: number;
  };
  trends: {
    medicationTrend: number; // percentage change
    taskTrend: number;
    moodTrend: number;
  };
  dependentsSummary: Array<{
    name: string;
    status: 'stable' | 'attention' | 'critical';
    notes: string;
  }>;
}

interface ReportGeneratorProps {
  // onClose?: () => void;
}

const generateSampleReportData = (period: 'weekly' | 'monthly'): ReportData => {
  const today = new Date();
  const startDate = new Date(today);
  const endDate = new Date(today);

  if (period === 'weekly') {
    startDate.setDate(today.getDate() - 7);
  } else {
    startDate.setMonth(today.getMonth() - 1);
  }

  return {
    period,
    startDate,
    endDate,
    medicationAdherence: 92,
    taskCompletion: 87,
    moodScore: 78,
    healthMetrics: {
      avgHeartRate: 72,
      avgBloodPressure: '120/80',
      avgTemperature: 98.6,
      avgSteps: 8234,
    },
    trends: {
      medicationTrend: 5.2,
      taskTrend: -2.1,
      moodTrend: 8.5,
    },
    dependentsSummary: [
      {
        name: 'John Smith',
        status: 'stable',
        notes: 'Consistent medication adherence. All vital signs normal.',
      },
      {
        name: 'Mary Johnson',
        status: 'attention',
        notes: 'Minor blood pressure spike detected. Recommend follow-up.',
      },
      {
        name: 'Robert Brown',
        status: 'stable',
        notes: 'Excellent mood improvement. Tasks completed on schedule.',
      },
    ],
  };
};

const ReportGenerator: React.FC<ReportGeneratorProps> = () => {
  const { isDarkMode } = useDarkMode();
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportData = generateSampleReportData(selectedPeriod);

  const generatePDF = async () => {
    try {
      setIsGenerating(true);

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentY = 15;
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;

      // Helper function to add text with wrapping
      const addWrappedText = (
        text: string,
        x: number,
        y: number,
        options: any = {}
      ) => {
        const lines = doc.splitTextToSize(text, contentWidth - 10);
        doc.text(lines, x, y, options);
        return y + lines.length * 5;
      };

      // Header with report title
      doc.setFontSize(24);
      doc.setTextColor(13, 148, 136); // Teal color
      doc.text('Caregiver Report', margin, currentY);

      currentY += 12;
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      const periodLabel =
        selectedPeriod === 'weekly' ? 'Weekly' : 'Monthly';
      doc.text(
        `${periodLabel} Summary Report - ${reportData.startDate.toLocaleDateString()} to ${reportData.endDate.toLocaleDateString()}`,
        margin,
        currentY
      );

      currentY += 10;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, currentY, pageWidth - margin, currentY);

      // Executive Summary Section
      currentY += 8;
      doc.setFontSize(14);
      doc.setTextColor(13, 148, 136);
      doc.text('Executive Summary', margin, currentY);

      currentY += 8;
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);

      const summaryContent = `This ${periodLabel.toLowerCase()} report provides a comprehensive overview of caregiver activities and dependent health metrics. Overall health management shows positive trends with improved medication adherence and task completion rates.`;

      currentY = addWrappedText(summaryContent, margin + 5, currentY);

      // Key Metrics Section
      currentY += 8;
      doc.setFontSize(14);
      doc.setTextColor(13, 148, 136);
      doc.text('Key Metrics Overview', margin, currentY);

      currentY += 8;

      // Create metrics boxes
      const metrics = [
        {
          label: 'Medication Adherence',
          value: `${reportData.medicationAdherence}%`,
          trend: `${reportData.trends.medicationTrend > 0 ? '+' : ''}${reportData.trends.medicationTrend}%`,
          colorRGB: { r: 13, g: 148, b: 136 },
        },
        {
          label: 'Task Completion',
          value: `${reportData.taskCompletion}%`,
          trend: `${reportData.trends.taskTrend > 0 ? '+' : ''}${reportData.trends.taskTrend}%`,
          colorRGB: { r: 245, g: 158, b: 11 },
        },
        {
          label: 'Mood Score',
          value: `${reportData.moodScore}/100`,
          trend: `${reportData.trends.moodTrend > 0 ? '+' : ''}${reportData.trends.moodTrend}%`,
          colorRGB: { r: 34, g: 197, b: 94 },
        },
      ];

      const metricsPerRow = 3;
      const metricBoxWidth = contentWidth / metricsPerRow - 5;
      let metricsX = margin;

      metrics.forEach((metric, idx) => {
        if (idx > 0 && idx % metricsPerRow === 0) {
          currentY += 35;
          metricsX = margin;
        }

        // Box background
        doc.setFillColor(245, 245, 245);
        doc.rect(metricsX, currentY, metricBoxWidth, 30, 'F');

        // Box border
        doc.setDrawColor(metric.colorRGB.r, metric.colorRGB.g, metric.colorRGB.b);
        doc.setLineWidth(0.5);
        doc.rect(metricsX, currentY, metricBoxWidth, 30);

        // Metric label
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(metric.label, metricsX + 4, currentY + 6);

        // Metric value
        doc.setFontSize(16);
        doc.setTextColor(metric.colorRGB.r, metric.colorRGB.g, metric.colorRGB.b);
        doc.text(metric.value, metricsX + 4, currentY + 16);

        // Trend
        doc.setFontSize(9);
        const trendColor = metric.trend.includes('-')
          ? { r: 220, g: 38, b: 38 }
          : { r: 34, g: 197, b: 94 };
        doc.setTextColor(trendColor.r, trendColor.g, trendColor.b);
        doc.text(metric.trend, metricsX + 4, currentY + 25);

        metricsX += metricBoxWidth + 5;
      });

      currentY += 40;

      // Add page break if needed
      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = 15;
      }

      // Health Metrics Detail Section
      doc.setFontSize(14);
      doc.setTextColor(13, 148, 136);
      doc.text('Health Metrics Detail', margin, currentY);

      currentY += 8;

      const healthMetrics = [
        {
          label: 'Average Heart Rate',
          value: `${reportData.healthMetrics.avgHeartRate} bpm`,
        },
        {
          label: 'Average Blood Pressure',
          value: reportData.healthMetrics.avgBloodPressure,
        },
        {
          label: 'Average Temperature',
          value: `${reportData.healthMetrics.avgTemperature}°F`,
        },
        {
          label: 'Average Daily Steps',
          value: reportData.healthMetrics.avgSteps.toLocaleString(),
        },
      ];

      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);

      healthMetrics.forEach((metric) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 50, 50);
        doc.text(`${metric.label}:`, margin + 5, currentY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(metric.value, margin + 50, currentY);

        currentY += 7;
      });

      currentY += 5;

      // Add page break if needed
      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = 15;
      }

      // Dependent Summary Section
      doc.setFontSize(14);
      doc.setTextColor(13, 148, 136);
      doc.text('Dependent Status Summary', margin, currentY);

      currentY += 8;

      reportData.dependentsSummary.forEach((dependent, idx) => {
        // Status indicator color
        let statusColor = { r: 13, g: 148, b: 136 }; // stable (teal)
        if (dependent.status === 'attention') {
          statusColor = { r: 245, g: 158, b: 11 }; // amber
        } else if (dependent.status === 'critical') {
          statusColor = { r: 220, g: 38, b: 38 }; // red
        }

        // Dependent header
        doc.setFontSize(11);
        doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
        doc.text(
          `${dependent.name} - ${dependent.status.toUpperCase()}`,
          margin + 5,
          currentY
        );

        currentY += 6;

        // Notes
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        currentY = addWrappedText(
          dependent.notes,
          margin + 8,
          currentY,
          {}
        );

        currentY += 4;

        if (idx < reportData.dependentsSummary.length - 1) {
          doc.setDrawColor(200, 200, 200);
          doc.line(margin + 5, currentY, pageWidth - margin - 5, currentY);
          currentY += 4;
        }
      });

      currentY += 8;

      // Add page break if needed
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = 15;
      }

      // Recommendations Section
      doc.setFontSize(14);
      doc.setTextColor(13, 148, 136);
      doc.text('Recommendations', margin, currentY);

      currentY += 8;

      const recommendations = [
        'Continue current medication schedule - high adherence rate achieved',
        'Monitor blood pressure trends in dependent #2 as noted',
        'Maintain consistent physical activity levels',
        'Schedule follow-up appointments for health checks',
        'Consider mood tracking more frequently for enhanced insights',
      ];

      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);

      recommendations.forEach((rec, idx) => {
        doc.text(`${idx + 1}. `, margin + 5, currentY);
        currentY = addWrappedText(rec, margin + 10, currentY);
        currentY += 2;
      });

      // Footer
      currentY = pageHeight - 15;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} by EaseBrain Caregiver Dashboard`,
        margin,
        currentY
      );

      // Save the PDF
      const fileName = `caregiver-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success(`${periodLabel} report downloaded successfully!`);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate report');
      setIsGenerating(false);
    }
  };

  return (
    <div className={`rounded-lg sm:rounded-2xl p-4 sm:p-8 shadow-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-teal-100'}`}>
      <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-6 sm:mb-8 flex-col sm:flex-row">
        <FaChartBar className={`text-2xl sm:text-3xl ${isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />
        <h2 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
          Generate Reports
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Left Side - Report Options */}
        <div className="lg:col-span-1">
          <h3 className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
            Report Options
          </h3>

          <div className="space-y-4 sm:space-y-6">
            {/* Period Selection */}
            <div>
              <label className={`block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                <FaCalendarAlt className="inline mr-2" />
                Report Period
              </label>
              <div className="space-y-2">
                {(['weekly', 'monthly'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold transition-all text-left capitalize text-sm sm:text-base min-h-[44px] sm:min-h-auto flex items-center ${
                      selectedPeriod === period
                        ? isDarkMode
                          ? 'bg-teal-600 text-white'
                          : 'bg-teal-500 text-white'
                        : isDarkMode
                          ? 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                          : 'bg-gray-100 text-teal-700 hover:bg-teal-50'
                    }`}
                  >
                    {period === 'weekly' ? '📅 Weekly Report' : '📅 Monthly Report'}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Option */}
            <div>
              <label className={`block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                <FaEnvelope className="inline mr-2" />
                Delivery Method
              </label>
              <div className="space-y-2">
                <button
                  className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold transition-all text-left text-sm sm:text-base min-h-[44px] sm:min-h-auto flex items-center ${isDarkMode ? 'bg-slate-600 text-white hover:bg-slate-500' : 'bg-gray-100 text-teal-700 hover:bg-teal-50'}`}
                >
                  📥 Download PDF
                </button>
                <button
                  className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold transition-all text-left text-sm sm:text-base min-h-[44px] sm:min-h-auto flex items-center ${isDarkMode ? 'bg-slate-600 text-white hover:bg-slate-500' : 'bg-gray-100 text-teal-700 hover:bg-teal-50'}`}
                >
                  📧 Email Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Report Preview & Download */}
        <div className="lg:col-span-2">
          <h3 className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
            Report Summary
          </h3>

          <div className="space-y-3 sm:space-y-4">
            {/* Key Metrics Preview */}
            <div className={`p-3 sm:p-6 rounded-lg sm:rounded-xl border-2 ${isDarkMode ? 'bg-slate-800 border-teal-500' : 'bg-teal-50 border-teal-300'}`}>
              <h4 className={`text-xs sm:text-sm font-semibold mb-3 sm:mb-4 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                <FaChartBar className="inline mr-2" />
                Key Metrics
              </h4>

              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className={`p-2 sm:p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Medication
                  </p>
                  <p className={`text-xl sm:text-2xl font-bold mt-1 sm:mt-2 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                    {reportData.medicationAdherence}%
                  </p>
                  <p className={`text-xs mt-1 ${reportData.trends.medicationTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {reportData.trends.medicationTrend > 0 ? '↑' : '↓'} {Math.abs(reportData.trends.medicationTrend)}%
                  </p>
                </div>

                <div className={`p-2 sm:p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Tasks
                  </p>
                  <p className={`text-xl sm:text-2xl font-bold mt-1 sm:mt-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                    {reportData.taskCompletion}%
                  </p>
                  <p className={`text-xs mt-1 ${reportData.trends.taskTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {reportData.trends.taskTrend > 0 ? '↑' : '↓'} {Math.abs(reportData.trends.taskTrend)}%
                  </p>
                </div>

                <div className={`p-2 sm:p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Mood
                  </p>
                  <p className={`text-xl sm:text-2xl font-bold mt-1 sm:mt-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {reportData.moodScore}
                  </p>
                  <p className={`text-xs mt-1 ${reportData.trends.moodTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {reportData.trends.moodTrend > 0 ? '↑' : '↓'} {Math.abs(reportData.trends.moodTrend)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Health Metrics */}
            <div className={`p-3 sm:p-6 rounded-lg sm:rounded-xl border-2 ${isDarkMode ? 'bg-slate-800 border-emerald-500' : 'bg-emerald-50 border-emerald-300'}`}>
              <h4 className={`text-xs sm:text-sm font-semibold mb-3 sm:mb-4 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                <FaHeartbeat className="inline mr-2" />
                Health Metrics
              </h4>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Heart Rate</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                    {reportData.healthMetrics.avgHeartRate} bpm
                  </p>
                </div>
                <div>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>BP</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                    {reportData.healthMetrics.avgBloodPressure}
                  </p>
                </div>
                <div>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Temp</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                    {reportData.healthMetrics.avgTemperature}°F
                  </p>
                </div>
                <div>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Steps</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-teal-900'}`}>
                    {(reportData.healthMetrics.avgSteps/1000).toFixed(1)}k
                  </p>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold sm:font-bold text-sm sm:text-lg transition-all flex items-center justify-center gap-2 sm:gap-3 min-h-[44px] sm:min-h-auto ${
                isGenerating
                  ? isDarkMode
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : isDarkMode
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600'
              }`}
            >
              <FaFileDownload />
              {isGenerating ? 'Generating...' : 'Download PDF Report'}
            </button>

            {/* Info Text */}
            <p className={`text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              ℹ️ Report includes detailed metrics, health analysis, dependent summary, and recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;

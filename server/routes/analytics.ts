import { RequestHandler } from "express";
import { AnalyticsResponse, AnalyticsData } from "@shared/api";

/**
 * Generate sample analytics data
 * In a real app, this would query a database
 */
function generateAnalyticsData(): AnalyticsData {
  return {
    overview: {
      studentsGraded: 1248,
      averageScore: 76,
      timeSaved: 62,
    },
    byClass: [
      { name: "Class A", avg: 78 },
      { name: "Class B", avg: 72 },
      { name: "Class C", avg: 85 },
      { name: "Class D", avg: 68 },
    ],
    trend: Array.from({ length: 10 }, (_, i) => ({
      day: `W${i + 1}`,
      score: 60 + Math.round(Math.random() * 35),
    })),
    distribution: [
      { name: "A", value: 22 },
      { name: "B", value: 35 },
      { name: "C", value: 28 },
      { name: "D", value: 11 },
      { name: "F", value: 4 },
    ],
    recent: Array.from({ length: 8 }).map((_, i) => ({
      id: i + 1,
      student: `Student ${i + 1}`,
      score: 55 + Math.round(Math.random() * 45),
    })),
  };
}

/**
 * GET /api/analytics
 * Get analytics data for dashboard
 */
export const handleGetAnalytics: RequestHandler = (req, res) => {
  try {
    const analyticsData = generateAnalyticsData();

    const response: AnalyticsResponse = {
      success: true,
      data: analyticsData,
    };

    res.json(response);
  } catch (error) {
    console.error("Error getting analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get analytics data",
    });
  }
};

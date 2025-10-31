/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Paper Part Configuration
 */
export interface PartConfig {
  id: string;
  name: string;
  questions: number;
  marksPerQuestion: number;
  difficulty: "easy" | "medium" | "hard";
  stepMarking: boolean;
  partialCredit: number; // 0-100
}

/**
 * Paper Upload Request
 */
export interface PaperUploadRequest {
  title: string;
  course: string;
  parts: PartConfig[];
}

/**
 * Paper Upload Response
 */
export interface PaperUploadResponse {
  success: boolean;
  paperId: string;
  message: string;
  totalMarks: number;
}

/**
 * Grading Progress Update
 */
export interface GradingProgress {
  paperId: string;
  progress: number; // 0-100
  status: "uploading" | "parsing" | "grading" | "completed" | "failed";
  message: string;
}

/**
 * Grading Request
 */
export interface GradingRequest {
  paperId: string;
  studentAnswers?: any[]; // In a real app, this would have student answer data
}

/**
 * Grading Response
 */
export interface GradingResponse {
  success: boolean;
  paperId: string;
  gradingId: string;
  message: string;
  estimatedTime: number; // seconds
}

/**
 * Analytics Data
 */
export interface AnalyticsData {
  overview: {
    studentsGraded: number;
    averageScore: number;
    timeSaved: number; // hours
  };
  byClass: Array<{
    name: string;
    avg: number;
  }>;
  trend: Array<{
    day: string;
    score: number;
  }>;
  distribution: Array<{
    name: string;
    value: number;
  }>;
  recent: Array<{
    id: number;
    student: string;
    score: number;
  }>;
}

/**
 * Analytics Response
 */
export interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsData;
}

/**
 * Paper Details
 */
export interface PaperDetails {
  id: string;
  title: string;
  course: string;
  parts: PartConfig[];
  totalMarks: number;
  createdAt: string;
}

/**
 * Paper Details Response
 */
export interface PaperDetailsResponse {
  success: boolean;
  data: PaperDetails;
}

/**
 * Grading Record
 */
export interface GradingRecord {
  id: string;
  paperId: string;
  status: "grading" | "completed" | "failed";
  progress: number;
  startedAt: string;
  completedAt?: string;
}

/**
 * Grading Progress Response
 */
export interface GradingProgressResponse {
  success: boolean;
  data: GradingRecord;
}

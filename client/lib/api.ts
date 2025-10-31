/**
 * API Client for type-safe backend communication
 */

import {
  PaperUploadRequest,
  PaperUploadResponse,
  GradingRequest,
  GradingResponse,
  AnalyticsResponse,
  DemoResponse,
  PaperDetailsResponse,
  GradingProgressResponse,
} from "@shared/api";

/**
 * Get the base API URL
 * In development, this is the same origin (Vite dev server proxies to Express)
 * In production, it would be the deployed backend URL
 */
function getBaseUrl(): string {
  // In development with Vite, API is served on same port via middleware
  // In production, this would be configured via environment variable
  return "";
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${getBaseUrl()}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP error ${response.status}`,
      }));
      throw new Error(error.message || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API error for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * API Client
 */
export const api = {
  /**
   * Health check endpoint
   */
  ping: async (): Promise<{ message: string }> => {
    return apiFetch("/api/ping");
  },

  /**
   * Demo endpoint
   */
  demo: async (): Promise<DemoResponse> => {
    return apiFetch("/api/demo");
  },

  /**
   * Upload a paper
   */
  uploadPaper: async (
    data: PaperUploadRequest
  ): Promise<PaperUploadResponse> => {
    return apiFetch("/api/papers/upload", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Start grading a paper
   */
  startGrading: async (data: GradingRequest): Promise<GradingResponse> => {
    return apiFetch("/api/papers/grade", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Get grading progress
   */
  getGradingProgress: async (
    gradingId: string
  ): Promise<GradingProgressResponse> => {
    return apiFetch(`/api/papers/grade/${gradingId}`);
  },

  /**
   * Get paper details
   */
  getPaper: async (paperId: string): Promise<PaperDetailsResponse> => {
    return apiFetch(`/api/papers/${paperId}`);
  },

  /**
   * Get analytics data
   */
  getAnalytics: async (): Promise<AnalyticsResponse> => {
    return apiFetch("/api/analytics");
  },
};

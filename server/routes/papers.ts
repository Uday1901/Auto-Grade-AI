import { RequestHandler } from "express";
import {
  PaperUploadRequest,
  PaperUploadResponse,
  GradingRequest,
  GradingResponse,
  PaperDetails,
  PaperDetailsResponse,
  GradingRecord,
  GradingProgressResponse,
} from "@shared/api";

// In-memory storage for demo purposes
// In a real app, this would be a database
const papers = new Map<string, PaperDetails>();
const grading = new Map<string, GradingRecord>();

/**
 * POST /api/papers/upload
 * Upload a new question paper with parts and configuration
 */
export const handlePaperUpload: RequestHandler = (req, res) => {
  try {
    const uploadData = req.body as PaperUploadRequest;

    // Validate request
    if (!uploadData.title || !uploadData.course || !uploadData.parts || uploadData.parts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, course, and parts",
      });
    }

    // Generate a unique paper ID
    const paperId = `paper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculate total marks
    const totalMarks = uploadData.parts.reduce(
      (sum, part) => sum + part.questions * part.marksPerQuestion,
      0
    );

    // Store paper configuration
    papers.set(paperId, {
      id: paperId,
      title: uploadData.title,
      course: uploadData.course,
      parts: uploadData.parts,
      totalMarks,
      createdAt: new Date().toISOString(),
    });

    const response: PaperUploadResponse = {
      success: true,
      paperId,
      message: "Paper uploaded successfully",
      totalMarks,
    };

    res.json(response);
  } catch (error) {
    console.error("Error uploading paper:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload paper",
    });
  }
};

/**
 * POST /api/papers/grade
 * Start grading process for a paper
 */
export const handleStartGrading: RequestHandler = (req, res) => {
  try {
    const gradingData = req.body as GradingRequest;

    // Validate request
    if (!gradingData.paperId) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: paperId",
      });
    }

    // Check if paper exists
    const paper = papers.get(gradingData.paperId);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found",
      });
    }

    // Generate a unique grading ID
    const gradingId = `grading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Simulate grading process
    // In a real app, this would trigger an AI grading job
    grading.set(gradingId, {
      id: gradingId,
      paperId: gradingData.paperId,
      status: "grading",
      progress: 0,
      startedAt: new Date().toISOString(),
    });

    // Simulate progress updates
    // In a real app, this would be an async job queue
    const interval = setInterval(() => {
      const gradingRecord = grading.get(gradingId);
      if (!gradingRecord) {
        clearInterval(interval);
        return;
      }

      // Update progress
      const currentProgress = gradingRecord.progress + Math.random() * 15;

      if (currentProgress >= 100) {
        // Grading complete
        gradingRecord.status = "completed";
        gradingRecord.progress = 100;
        gradingRecord.completedAt = new Date().toISOString();
        grading.set(gradingId, gradingRecord);
        clearInterval(interval);
      } else {
        // Update progress
        gradingRecord.progress = Math.round(currentProgress);
        grading.set(gradingId, gradingRecord);
      }
    }, 500);

    const response: GradingResponse = {
      success: true,
      paperId: gradingData.paperId,
      gradingId,
      message: "Grading started successfully",
      estimatedTime: 30, // 30 seconds
    };

    res.json(response);
  } catch (error) {
    console.error("Error starting grading:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start grading",
    });
  }
};

/**
 * GET /api/papers/grade/:gradingId
 * Get grading progress
 */
export const handleGetGradingProgress: RequestHandler = (req, res) => {
  try {
    const { gradingId } = req.params;

    const gradingRecord = grading.get(gradingId);
    if (!gradingRecord) {
      return res.status(404).json({
        success: false,
        message: "Grading record not found",
      });
    }

    const response: GradingProgressResponse = {
      success: true,
      data: gradingRecord,
    };

    res.json(response);
  } catch (error) {
    console.error("Error getting grading progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get grading progress",
    });
  }
};

/**
 * GET /api/papers/:paperId
 * Get paper details
 */
export const handleGetPaper: RequestHandler = (req, res) => {
  try {
    const { paperId } = req.params;

    const paper = papers.get(paperId);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found",
      });
    }

    const response: PaperDetailsResponse = {
      success: true,
      data: paper,
    };

    res.json(response);
  } catch (error) {
    console.error("Error getting paper:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get paper",
    });
  }
};

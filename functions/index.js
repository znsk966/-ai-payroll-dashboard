/**
 * Main entry point for all Cloud Functions.
 * This file should import and export functions from other modules.
 */

require("dotenv").config();
const admin = require("firebase-admin");

// Initialize the Firebase Admin SDK once
try {
  admin.initializeApp();
} catch (error) {
  console.log("Firebase Admin SDK already initialized or error:",
      error.message);
}

// Import functions from their separate files
const enhancedAnalytics = require("./enhanced-analytics");
const aiFunctions = require("./ai-insights");
// Admin functions removed - use Firebase Console for user management


// --- Export Analytics Functions ---

// The "slow" function to recalculate the summary (enhanced for real data)
exports.updateAnalyticsSummary = enhancedAnalytics.updateAnalyticsSummary;

// The "fast" function for the dashboard to read the summary
exports.getDashboardAnalytics = enhancedAnalytics.getDashboardAnalytics;


// --- Export AI Functions ---

// Analyzes payroll data and generates intelligent insights
exports.generateAIInsights = aiFunctions.generateAIInsights;

// Handles natural language queries from the AI chat assistant
exports.aiChatQuery = aiFunctions.aiChatQuery;


// --- Admin Functions Removed ---
// All user management is now handled through Firebase Console

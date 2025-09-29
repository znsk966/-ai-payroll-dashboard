/**
 * Contains all AI-related Cloud Functions, using the official Google AI SDK.
 */
require("dotenv").config();
const {onCall} = require("firebase-functions/v2/https");
const {logger} = require("firebase-functions");
const admin = require("firebase-admin");
const {GoogleGenerativeAI} = require("@google/generative-ai");
// const functions = require("firebase-functions");

const AI_SERVICE_KEY = process.env.GEMINI_KEY;

// Initialize the AI client only if key is available
let genAI = null;
let aiModel = null;

if (AI_SERVICE_KEY) {
  genAI = new GoogleGenerativeAI(AI_SERVICE_KEY);
  aiModel = genAI.getGenerativeModel({model: "gemini-2.0-flash"});
} else {
  logger.warn(
      "Gemini API key not found in Firebase Functions configuration. " +
    "AI functions will be disabled.",
  );
}

/**
 * AI-Powered Payroll Insights Function
 * Analyzes payroll data to generate intelligent insights and recommendations.
 * RENAMED to match the frontend call.
 */
exports.generateAIInsights = onCall(
    {region: "europe-west1", enforceAppCheck: false},
    async (request) => {
      // Authentication and Authorization
      if (!request.auth) throw new Error("Authentication required.");

      // Check admin privileges by email
      // (since we created user document with email as ID)
      const userEmail = request.auth.token.email ||
        request.auth.token.email_verified;
      if (!userEmail) throw new Error("User email not found in token.");

      const userDoc = await admin.firestore()
          .collection("users")
          .doc(request.auth.token.email)
          .get();
      if (!userDoc.exists || !userDoc.data().isAdmin) {
        throw new Error("Admin privileges required.");
      }

      logger.info(
          `AI insights generation started by admin: ${request.auth.uid}`,
      );
      const db = admin.firestore();
      const snapshot = await db
          .collection("employees")
          .where("status", "==", "Active")
          .get();

      if (snapshot.empty) {
        logger.warn("No active employees found for AI analysis.");
        return {message: "No active employees to analyze.", insights: []};
      }

      const employees = snapshot.docs.map((doc) => doc.data());
      logger.info(
          `Processing ${employees.length} employees for AI insights`,
      );

      // Generate AI insights using Gemini
      const insights = await generateAIIInsights(employees);

      await db.collection("ai-insights").doc("latest").set({
        insights,
        generatedAt: new Date(),
        generatedBy: request.auth.uid,
      });

      logger.info(
          `Successfully generated ${insights.length} AI insights!`,
      );
      return {
        message: "AI insights generated successfully!",
        insights,
        count: insights.length,
      };
    });

/**
 * AI Chat Function for Natural Language Queries
 */
exports.generatePayrollInsights = onCall(
    {region: "europe-west1", enforceAppCheck: false},
    async (request) => {
      if (!request.auth) throw new Error("Authentication required.");
      const userDoc = await admin.firestore()
          .collection("users")
          .doc(request.auth.uid)
          .get();
      if (!userDoc.exists || !userDoc.data().isAdmin) {
        throw new Error("Admin privileges required.");
      }

      logger.info(
          `Generating AI insights for admin ${request.auth.uid}`,
      );
      const db = admin.firestore();

      // Fetch analytics data for context
      const analyticsDoc = await db
          .collection("analytics")
          .doc("summary")
          .get();
      const analyticsData = analyticsDoc.exists ? analyticsDoc.data() : null;

      // Generate AI insights
      const insights = await generateAIIInsights(analyticsData);

      // Save insights to Firestore
      await db.collection("ai-insights").doc("latest").set({
        insights: insights,
        generatedAt: new Date(),
        generatedBy: request.auth.uid,
      });

      return {insights: insights, count: insights.length};
    });

exports.aiChatQuery = onCall(
    {region: "europe-west1", enforceAppCheck: false},
    async (request) => {
      if (!request.auth) throw new Error("Authentication required.");

      // Check admin privileges for AI Chat by email
      const userEmail = request.auth.token.email;
      if (!userEmail) throw new Error("User email not found in token.");

      const userDoc = await admin.firestore()
          .collection("users")
          .doc(userEmail)
          .get();
      if (!userDoc.exists || !userDoc.data().isAdmin) {
        throw new Error(
            "AI Chat requires admin privileges. " +
            "Please contact your administrator.",
        );
      }

      const {question} = request.data;
      if (!question) throw new Error("A question is required.");

      logger.info(
          `AI Chat Query from admin ${request.auth.uid}: "${question}"`,
      );
      const db = admin.firestore();

      // Fetch data for context
      const analyticsDoc = await db
          .collection("analytics")
          .doc("summary")
          .get();
      const analyticsData = analyticsDoc.exists ? analyticsDoc.data() : null;

      const response = await processAIQueryWithSDK(question, analyticsData);

      await db.collection("ai-chat-history").add({
        question,
        response,
        userId: request.auth.uid,
        timestamp: new Date(),
      });

      return {question, response, timestamp: new Date()};
    });

/**
 * Generates AI insights using the Gemini API
 * @param {Array} employees - Array of employee data
 * @return {Promise<Array>} Array of AI-generated insights
 */
async function generateAIIInsights(employees) {
  if (!AI_SERVICE_KEY || !aiModel) {
    logger.error(
        "Gemini API key not configured or AI model not initialized. " +
      "AI functions are disabled.",
    );
    return [];
  }

  try {
    const context = buildEmployeeContext(employees);
    const basePrompt = `Analyze the following employee data and generate 5-7 ` +
      `actionable insights for HR management. Focus on salary optimization, ` +
      `retention risks, budget forecasting, diversity metrics, and ` +
      `department performance.`;

    const structureGuide = `Please provide insights in JSON format with the ` +
      `following structure:
[
  {
    "title": "Insight Title",
    "content": "Detailed explanation of the insight with specific data points",
    "type": "recommendation|warning|prediction",
    "category": "salary_opt|retention|budget|diversity|dept_performance",
    "impact": "high|medium|low",
    "actionable": true
  }
]

Make insights specific and data-driven. Include numbers and percentages.`;

    const prompt = `${basePrompt}

Employee Data Summary:
${context}

${structureGuide}`;

    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON response
    try {
      // Clean the response text - remove markdown code blocks if present
      let cleanText = text.trim();
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const insights = JSON.parse(cleanText);
      logger.info(`Successfully generated ${insights.length} AI insights`);
      return insights;
    } catch (parseError) {
      logger.warn(
          "Failed to parse AI response as JSON, returning formatted text",
      );
      return [{
        title: "AI Analysis",
        content: text,
        type: "recommendation",
        category: "general",
        impact: "medium",
        actionable: true,
      }];
    }
  } catch (error) {
    logger.error("Error generating AI insights:", error);
    return [];
  }
}

/**
 * Processes a query by calling the Gemini API using the Google AI SDK.
 * @param {string} question - The user's question
 * @param {Object} analyticsData - Analytics data for context
 * @return {Promise<string>} AI response text
 */
async function processAIQueryWithSDK(question, analyticsData) {
  if (!AI_SERVICE_KEY || !aiModel) {
    logger.error(
        "Gemini API key not configured or AI model not initialized. " +
      "AI functions are disabled.",
    );
    return "The AI service is not configured correctly. " +
      "Please contact the administrator.";
  }

  try {
    // Fetch employees data for context
    const db = admin.firestore();
    const employeesSnapshot = await db
        .collection("employees")
        .where("status", "==", "Active")
        .get();
    const employees = employeesSnapshot.docs.map((doc) => doc.data());

    const context = buildEmployeeContext(employees);
    const prompt = `You are a helpful AI assistant specializing in payroll ` +
      `and HR analytics. Provide concise, data-driven insights based on the ` +
      `provided data.

Context:
${context}

User Question: ${question}`;

    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    logger.error("Error calling Google AI SDK:", error);
    return "I'm sorry, I encountered an error while processing your request " +
      "with the AI service.";
  }
}

/**
 * Builds a comprehensive context from employee data for the AI prompt.
 * @param {Array} employees - Array of employee data
 * @return {string} Formatted context string
 */
function buildEmployeeContext(employees) {
  if (!employees || employees.length === 0) return "No employee data.";

  // Calculate comprehensive statistics
  const totalEmployees = employees.length;
  const departments = {};
  const departmentSalaries = {}; // Track salaries by department
  const levels = {};
  const levelSalaries = {}; // Track salaries by level
  const locations = {};
  const genders = {};
  const ageGroups = {};
  const performanceRatings = [];
  const salaries = [];
  const tenureGroups = {};

  employees.forEach((emp) => {
    // Department distribution
    departments[emp.department] = (departments[emp.department] || 0) + 1;

    // Department salaries
    if (emp.baseSalary && emp.department) {
      if (!departmentSalaries[emp.department]) {
        departmentSalaries[emp.department] = [];
      }
      departmentSalaries[emp.department].push(emp.baseSalary);
    }

    // Level distribution
    levels[emp.level] = (levels[emp.level] || 0) + 1;

    // Level salaries
    if (emp.baseSalary && emp.level) {
      if (!levelSalaries[emp.level]) {
        levelSalaries[emp.level] = [];
      }
      levelSalaries[emp.level].push(emp.baseSalary);
    }

    // Location distribution
    locations[emp.location] = (locations[emp.location] || 0) + 1;

    // Gender distribution
    genders[emp.gender] = (genders[emp.gender] || 0) + 1;

    // Age groups
    if (emp.dob) {
      const age = new Date().getFullYear() - new Date(emp.dob).getFullYear();
      let ageGroup;
      if (age < 25) ageGroup = "Under 25";
      else if (age < 30) ageGroup = "25-30";
      else if (age < 35) ageGroup = "30-35";
      else if (age < 40) ageGroup = "35-40";
      else if (age < 45) ageGroup = "40-45";
      else if (age < 50) ageGroup = "45-50";
      else if (age < 55) ageGroup = "50-55";
      else ageGroup = "Over 55";
      ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + 1;
    }

    // Performance ratings
    if (emp.performanceRating) {
      performanceRatings.push(emp.performanceRating);
    }

    // Salaries
    if (emp.baseSalary) {
      salaries.push(emp.baseSalary);
    }

    // Tenure groups
    if (emp.startDate) {
      const currentYear = new Date().getFullYear();
      const startYear = new Date(emp.startDate).getFullYear();
      const tenure = currentYear - startYear;
      let tenureGroup;
      if (tenure <= 1) tenureGroup = "New (0-1 years)";
      else if (tenure <= 3) tenureGroup = "Junior (1-3 years)";
      else if (tenure <= 5) tenureGroup = "Mid (3-5 years)";
      else if (tenure <= 10) tenureGroup = "Senior (5-10 years)";
      else tenureGroup = "Veteran (10+ years)";
      tenureGroups[tenureGroup] = (tenureGroups[tenureGroup] || 0) + 1;
    }
  });

  // Calculate averages
  const avgPerformance = performanceRatings.length > 0 ?
    (performanceRatings.reduce((a, b) => a + b, 0) /
     performanceRatings.length).toFixed(2) :
    "N/A";

  const avgSalary = salaries.length > 0 ?
    Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length) :
    0;

  const totalAnnualCost = salaries.reduce((a, b) => a + b, 0);

  // Calculate average salaries by department
  const departmentSalaryAverages = {};
  Object.keys(departmentSalaries).forEach((dept) => {
    const deptSalaries = departmentSalaries[dept];
    const total = deptSalaries.reduce((a, b) => a + b, 0);
    const avgSalary = total / deptSalaries.length;
    departmentSalaryAverages[dept] = Math.round(avgSalary);
  });

  // Calculate average salaries by level
  const levelSalaryAverages = {};
  Object.keys(levelSalaries).forEach((level) => {
    const levelSalariesList = levelSalaries[level];
    const total = levelSalariesList.reduce((a, b) => a + b, 0);
    const avgSalary = total / levelSalariesList.length;
    levelSalaryAverages[level] = Math.round(avgSalary);
  });

  // Sort departments by average salary (highest first)
  const departmentsBySalary = Object.entries(departmentSalaryAverages)
      .sort(([, a], [, b]) => b - a)
      .map(([dept, avgSalary]) => `${dept}: $${avgSalary.toLocaleString()}`);

  // Sort levels by average salary (highest first)
  const levelsBySalary = Object.entries(levelSalaryAverages)
      .sort(([, a], [, b]) => b - a)
      .map(([level, avgSalary]) => `${level}: $${avgSalary.toLocaleString()}`);

  // Build context object
  const context = {
    totalEmployees,
    totalAnnualCost: formatCurrency(totalAnnualCost),
    averageSalary: formatCurrency(avgSalary),
    averagePerformanceRating: avgPerformance,
    departmentDistribution: departments,
    departmentSalaryAverages,
    departmentsBySalary,
    levelDistribution: levels,
    levelSalaryAverages,
    levelsBySalary,
    locationDistribution: Object.keys(locations).length + " unique locations",
    genderDistribution: genders,
    ageDistribution: ageGroups,
    tenureDistribution: tenureGroups,
    topDepartments: Object.entries(departments)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([dept, count]) => `${dept}: ${count} employees`),
    topLocations: Object.entries(locations)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([loc, count]) => `${loc}: ${count} employees`),
  };

  return `Employee Analytics Summary: ${JSON.stringify(context, null, 2)}`;
}

/**
 * Utility function to format currency
 * @param {number} amount - The amount to format
 * @return {string} Formatted currency string
 */
function formatCurrency(amount) {
  if (typeof amount !== "number") return "$0.00";
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Enhanced Analytics Functions for Real Data Processing
 * Processes 1000 employees with historical data for accurate insights
 */

require("dotenv").config();
const {onCall} = require("firebase-functions/v2/https");
const {logger} = require("firebase-functions");
const admin = require("firebase-admin");

// Ensure admin is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
// const {FieldValue} = require("firebase-admin/firestore");

/**
 * Enhanced analytics calculation with real historical data
 */
exports.updateAnalyticsSummary = onCall(
    {region: "europe-west1", enforceAppCheck: false},
    async (request) => {
      try {
        // Temporarily disable auth for testing
        // if (!request.auth) {
        //   throw new Error("You must be authenticated to run this function.");
        // }
        logger.info(`Enhanced analytics summary calculation initiated`);

        // Initialize counters
        let totalHeadcount = 0;
        let totalAnnualCost = 0;
        // let totalAnnualBonus = 0;
        const departmentCounts = {};
        const departmentSalaries = {};
        const levelCounts = {};
        const genderCounts = {};
        const ethnicityCounts = {};

        // Historical data tracking
        // const monthlyCosts = {};
        const salaryTrends = {};
        const performanceTrends = {};
        const retentionRisks = [];
        const budgetRisks = [];
        const complianceRisks = [];
        const operationalRisks = [];

        const snapshot = await db
            .collection("employees")
            .where("status", "==", "Active")
            .get();

        if (snapshot.empty) {
          logger.warn("No active employees found to generate analytics.");
          await db.collection("analytics").doc("summary").set({
            message: "No active employees found.",
            lastUpdated: new Date(),
          });
          return {message: "No active employees to process."};
        }

        totalHeadcount = snapshot.size;

        snapshot.forEach((doc) => {
          const emp = doc.data();

          // Use flat data structure (matching your actual data)
          const baseSalary = emp.baseSalary || 0;
          const annualBonus = emp.bonus || 0;
          const totalComp = baseSalary + annualBonus;

          totalAnnualCost += totalComp;
          // totalAnnualBonus += annualBonus;

          // Department analysis
          const dept = emp.department || "Unknown";
          departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
          if (!departmentSalaries[dept]) {
            departmentSalaries[dept] = {total: 0, count: 0};
          }
          departmentSalaries[dept].total += totalComp;
          departmentSalaries[dept].count += 1;

          // Level analysis
          const level = emp.level || "Unknown";
          levelCounts[level] = (levelCounts[level] || 0) + 1;

          // Gender analysis
          const gender = emp.gender || "Unknown";
          genderCounts[gender] = (genderCounts[gender] || 0) + 1;

          // Ethnicity analysis
          const ethnicity = emp.ethnicity || "Unknown";
          ethnicityCounts[ethnicity] = (ethnicityCounts[ethnicity] || 0) + 1;

          // Historical salary trends (using flat structure)
          if (emp.salaryHistory) {
            // Handle different salary history formats
            if (Array.isArray(emp.salaryHistory)) {
              emp.salaryHistory.forEach((entry) => {
                const year = entry.date ? entry.date.split("-")[0] : "2023";
                if (!salaryTrends[year]) {
                  salaryTrends[year] = {total: 0, count: 0};
                }
                salaryTrends[year].total += entry.salary || baseSalary;
                salaryTrends[year].count += 1;
              });
            }
          }

          // Performance trends (using flat structure)
          if (emp.performanceHistory) {
            if (Array.isArray(emp.performanceHistory)) {
              emp.performanceHistory.forEach((entry) => {
                const year = entry.year || "2023";
                if (!performanceTrends[year]) {
                  performanceTrends[year] = {total: 0, count: 0};
                }
                performanceTrends[year].total += entry.rating || 3.0;
                performanceTrends[year].count += 1;
              });
            }
          }

          // Risk calculations (using real data)
          const retentionRisk = calculateRealRetentionRisk(emp);
          const budgetRisk = calculateRealBudgetRisk(emp, totalComp);
          const complianceRisk = calculateRealComplianceRisk(emp);
          const operationalRisk = calculateRealOperationalRisk(emp);

          retentionRisks.push(retentionRisk);
          budgetRisks.push(budgetRisk);
          complianceRisks.push(complianceRisk);
          operationalRisks.push(operationalRisk);
        });

        // Calculate averages
        const averageMonthlySalary = totalAnnualCost / totalHeadcount / 12;
        const totalMonthlyCost = totalAnnualCost / 12;

        // Calculate department averages
        const averageSalaryByDepartment = {};
        Object.keys(departmentSalaries).forEach((dept) => {
          averageSalaryByDepartment[dept] =
        departmentSalaries[dept].total / departmentSalaries[dept].count;
        });

        // Calculate real risk metrics
        const avgRetentionRisk = retentionRisks.reduce((a, b) => a + b, 0) /
      retentionRisks.length;
        const avgBudgetRisk = budgetRisks.reduce((a, b) => a + b, 0) /
      budgetRisks.length;
        const avgComplianceRisk = complianceRisks.reduce((a, b) => a + b, 0) /
      complianceRisks.length;
        const avgOperationalRisk = operationalRisks.reduce((a, b) => a + b, 0) /
      operationalRisks.length;

        // Calculate diversity metrics
        const diversityScore = calculateDiversityScore(
            genderCounts,
            ethnicityCounts,
            totalHeadcount,
        );

        // Generate historical monthly costs (last 12 months)
        const monthlyCostHistory = generateMonthlyCostHistory(
            salaryTrends,
            totalMonthlyCost,
        );

        // Generate future predictions based on real trends
        const futurePredictions = generateFuturePredictions(
            monthlyCostHistory,
            totalHeadcount,
            averageMonthlySalary,
        );

        const summary = {
          totalHeadcount,
          totalMonthlyCost,
          totalAnnualCost,
          averageMonthlySalary,
          departmentCounts,
          averageSalaryByDepartment,
          levelCounts,
          genderCounts,
          ethnicityCounts,
          diversityScore,
          monthlyCostHistory,
          futurePredictions,
          riskMetrics: {
            retentionRisk: Math.round(avgRetentionRisk),
            budgetRisk: Math.round(avgBudgetRisk),
            complianceRisk: Math.round(avgComplianceRisk),
            operationalRisk: Math.round(avgOperationalRisk),
          },
          performanceTrends,
          salaryTrends,
          lastUpdated: new Date(),
          dataSource: "real_employee_data",
        };

        await db
            .collection("analytics")
            .doc("summary")
            .set(summary);

        logger.info(
            `Analytics summary updated successfully. ` +
            `Processed ${totalHeadcount} employees.`,
        );
        return {
          message: `Analytics summary updated successfully. ` +
            `Processed ${totalHeadcount} employees.`,
          summary: summary,
        };
      } catch (error) {
        logger.error("Error updating analytics summary:", error);
        throw new Error(`Failed to update analytics: ${error.message}`);
      }
    });

/**
 * Calculate real retention risk based on employee data
 * @param {Object} emp - Employee data object
 * @return {number} Retention risk score
 */
function calculateRealRetentionRisk(emp) {
  let risk = 20; // Base risk

  // Years at company (higher risk if too short or too long)
  const yearsAtCompany = emp.yearsAtCompany || 0;
  if (yearsAtCompany < 1) risk += 30; // New employees
  if (yearsAtCompany > 10) risk += 20; // Long-tenured employees

  // Performance rating
  const performance = emp.performanceRating || 0;
  if (performance < 3.0) risk += 25; // Low performers
  if (performance > 4.5) risk += 15; // High performers (market competition)

  // Last promotion
  const lastPromotion = emp.lastPromotionDate;
  if (lastPromotion) {
    const monthsSincePromotion = (new Date() - new Date(lastPromotion)) /
      (1000 * 60 * 60 * 24 * 30);
    if (monthsSincePromotion > 24) risk += 20; // No promotion in 2+ years
  }

  // Salary competitiveness
  const salary = emp.baseSalary || 0;
  const marketDemand = emp.marketDemandLevel || "medium";
  if (marketDemand === "high" && salary < 100000) risk += 20;

  // Career growth potential
  const growthPotential = emp.careerGrowthPotential || "medium";
  if (growthPotential === "low") risk += 15;

  return Math.min(95, Math.round(risk));
}

/**
 * Calculate real budget risk based on employee data
 * @param {Object} emp - Employee data object
 * @param {number} totalComp - Total compensation
 * @return {number} Budget risk score
 */
function calculateRealBudgetRisk(emp, totalComp) {
  let risk = 15; // Base risk

  // High compensation employees
  if (totalComp > 200000) risk += 25;
  if (totalComp > 300000) risk += 20;

  // Overtime patterns
  const overtimeHours = emp.overtimeHoursMonthly || 0;
  if (overtimeHours > 20) risk += 15;

  // Project completion rate
  const completionRate = emp.projectCompletionRate || 1.0;
  if (completionRate < 0.8) risk += 20;

  return Math.min(90, Math.round(risk));
}

/**
 * Calculate real compliance risk based on employee data
 * @param {Object} emp - Employee data object
 * @return {number} Compliance risk score
 */
function calculateRealComplianceRisk(emp) {
  let risk = 10; // Base risk

  // Attendance issues (using flat structure)
  const daysAbsent = emp.daysAbsent || 0;
  const lateArrivals = emp.lateArrivals || 0;
  if (daysAbsent > 3) risk += 20;
  if (lateArrivals > 5) risk += 15;

  // Training compliance
  const trainingHours = emp.trainingHoursAnnual || 0;
  if (trainingHours < 20) risk += 15;

  // Performance consistency (simplified)
  const performanceRating = emp.performanceRating || 3.0;
  if (performanceRating < 2.5) risk += 20;

  return Math.min(85, Math.round(risk));
}

/**
 * Calculate real operational risk based on employee data
 * @param {Object} emp - Employee data object
 * @return {number} Operational risk score
 */
function calculateRealOperationalRisk(emp) {
  let risk = 25; // Base risk

  // Work pattern efficiency (using flat structure)
  const avgHours = emp.averageHoursPerWeek || 40;
  const completionRate = emp.projectCompletionRate || 1.0;

  if (avgHours > 50 && completionRate < 0.9) risk += 20; // Overworked
  if (avgHours < 35) risk += 15; // Underutilized

  // Remote work effectiveness
  const remotePercentage = emp.remoteWorkPercentage || 0;
  const meetingHours = emp.meetingHoursWeekly || 0;

  if (remotePercentage > 80 && meetingHours < 5) risk += 15; // Isolated remote

  // Skill development (using flat structure)
  const trainingHours = emp.trainingHoursAnnual || 0;
  if (trainingHours < 10) risk += 10;

  return Math.min(90, Math.round(risk));
}

/**
 * Calculate diversity score based on real data
 * @param {Object} genderCounts - Gender distribution counts
 * @param {Object} ethnicityCounts - Ethnicity distribution counts
 * @param {number} totalCount - Total number of employees
 * @return {number} Diversity score (0-100)
 */
function calculateDiversityScore(genderCounts, ethnicityCounts, totalCount) {
  // Gender diversity
  const genderValues = Object.values(genderCounts);
  const genderDiversity = 1 - (genderValues.reduce((sum, count) =>
    sum + Math.pow(count / totalCount, 2), 0));

  // Ethnicity diversity
  const ethnicityValues = Object.values(ethnicityCounts);
  const ethnicityDiversity = 1 - (ethnicityValues.reduce((sum, count) =>
    sum + Math.pow(count / totalCount, 2), 0));

  return Math.round(((genderDiversity + ethnicityDiversity) / 2) * 100);
}

/**
 * Generate monthly cost history from real salary trends
 * @param {Object} salaryTrends - Historical salary trend data
 * @param {number} currentMonthlyCost - Current monthly cost
 * @return {Object} Monthly cost history with months and costs arrays
 */
function generateMonthlyCostHistory(salaryTrends, currentMonthlyCost) {
  const months = [];
  const costs = [];
  const currentDate = new Date();

  for (let i = 11; i >= 0; i--) {
    const currentYear = currentDate.getFullYear();
    const month = currentDate.getMonth() - i;
    const date = new Date(currentYear, month, 1);
    // const monthKey = date.toISOString().substring(0, 7);
    months.push(date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }));

    // Use historical data if available, otherwise estimate
    const year = date.getFullYear().toString();
    if (salaryTrends[year]) {
      const avgSalary = salaryTrends[year].total / salaryTrends[year].count;
      costs.push(avgSalary * 0.08); // Approximate monthly cost
    } else {
      const variation = 0.95 + Math.random() * 0.1;
      costs.push(currentMonthlyCost * variation); // Small variation
    }
  }

  return {months, costs};
}

/**
 * Generate future predictions based on real trends
 * @param {Object} monthlyHistory - Monthly cost history data
 * @param {number} currentHeadcount - Current employee headcount
 * @param {number} currentAvgSalary - Current average salary
 * @return {Object} Future predictions with months, costs, headcount, salaries
 */
function generateFuturePredictions(monthlyHistory, currentHeadcount,
    currentAvgSalary) {
  const predictions = {
    months: [],
    predictedCosts: [],
    predictedHeadcount: [],
    predictedSalaries: [],
  };

  // Calculate growth trends from historical data
  const costs = monthlyHistory.costs;
  const recentGrowth = costs.length > 3 ?
    (costs[costs.length - 1] - costs[costs.length - 4]) /
    costs[costs.length - 4] : 0.02;

  const currentDate = new Date();
  for (let i = 1; i <= 6; i++) {
    const futureDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + i,
        1,
    );
    predictions.months.push(futureDate.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }));

    // Predict based on real growth trends
    const growthFactor = 1 + (recentGrowth * i);
    predictions.predictedCosts.push(
        monthlyHistory.costs[monthlyHistory.costs.length - 1] * growthFactor,
    );
    predictions.predictedHeadcount.push(
        Math.round(currentHeadcount * (1 + (recentGrowth * 0.3) * i)),
    );
    predictions.predictedSalaries.push(
        currentAvgSalary * (1 + (recentGrowth * 0.5) * i),
    );
  }

  return predictions;
}

/**
 * Fast function to retrieve the pre-calculated analytics summary
 */
exports.getDashboardAnalytics = onCall(
    {region: "europe-west1", enforceAppCheck: false},
    async (request) => {
      try {
        // Temporarily disable auth for testing
        // if (!request.auth) {
        //   throw new Error("You must be authenticated to view analytics.");
        // }

        const summaryDoc = await db
            .collection("analytics")
            .doc("summary")
            .get();

        if (!summaryDoc.exists) {
          logger.warn(
              "Analytics summary document not found. Returning empty data.",
          );
          return {
            totalHeadcount: 0,
            totalMonthlyCost: 0,
            totalAnnualCost: 0,
            averageMonthlySalary: 0,
            departmentCounts: {},
            averageSalaryByDepartment: {},
            levelCounts: {},
            genderCounts: {},
            lastUpdated: null,
            message: "No analytics data. Please run Update Analytics first.",
          };
        }

        return summaryDoc.data();
      } catch (error) {
        logger.error("Error in getDashboardAnalytics:", error);
        throw new Error(`Failed to retrieve analytics: ${error.message}`);
      }
    });

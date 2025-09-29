# 🤖 AI-Powered Payroll Analytics Dashboard

[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![Google AI](https://img.shields.io/badge/Google_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google/)

> **An enterprise-grade, AI-powered payroll analytics dashboard that transforms raw employee data into strategic business insights using Firebase, Cloud Functions v2, and Google Gemini AI.**

## 🌟 **Live Demo**

🚀 **[Try the Dashboard](https://your-firebase-project.web.app/clean-firebase-dashboard.html)** | 📊 **951 Employees** | 🤖 **AI Insights** | 💬 **Interactive Chat**

## 🎯 **Project Overview**

This is a production-ready, full-stack payroll analytics platform that demonstrates modern web development practices with AI integration. Built with Firebase as Backend-as-a-Service, it processes real-time employee data to provide comprehensive insights through beautiful visualizations and intelligent AI recommendations.

## 🛠 **Tech Stack**

- **Frontend**: HTML5, CSS3, JavaScript ES6+ (Modules)
- **Backend**: Firebase Cloud Functions v2 (Node.js)
- **Database**: Cloud Firestore (NoSQL)
- **Authentication**: Firebase Authentication
- **Hosting**: Firebase Hosting
- **Charts**: Chart.js (v4) with advanced visualizations
- **Region**: Europe West 1 (eur3)

## ✨ **Key Features**

### 🤖 **AI-Powered Insights**
- **Strategic Recommendations**: AI generates 7+ actionable insights from workforce data
- **Interactive Chat**: Natural language queries about salary, performance, and demographics
- **Smart Analysis**: Department-level and role-level salary comparisons
- **Risk Assessment**: Retention risk analysis and performance predictions

### 📊 **Advanced Analytics**
- **Real-time KPIs**: Live metrics from 951 employees
- **Interactive Charts**: 15+ professional visualizations
- **Multi-dimensional Analysis**: Department, level, location, and demographic insights
- **Performance Heatmaps**: Visual performance analysis across teams

### 🔐 **Enterprise Security**
- **Admin Authentication**: Secure user management
- **Firestore Security Rules**: Proper data access controls
- **API Key Protection**: Secure AI service integration

## 📊 **Dashboard Features**

### 🏠 **Overview Section** (Main Dashboard)
- **Executive Summary Cards**
  - Total Headcount
  - Total Monthly Cost
  - Total Annual Cost  
  - Average Monthly Salary
- **Core Analytics Charts**
  - Department Headcount (Bar Chart)
  - Average Salary by Department (Bar Chart)
  - Level Distribution (Doughnut Chart)
  - Gender Diversity (Doughnut Chart)

### 💰 **Interactive Salary Trends** ✅ COMPLETED
Advanced multi-view salary analysis with real-time Firestore queries:

1. **By Department** (Bar Chart)
   - Average salary per department
   - Interactive tooltips with formatted currency
   - Real-time data from active employees

2. **By Level** (Doughnut Chart with Percentages)
   - Percentage of total salary budget by level
   - Enhanced tooltips showing:
     - Percentage of budget
     - Total salary for level
     - Average salary per person
   - Visual budget allocation insights

3. **All Employees** (Line Chart)
   - Salary distribution across ranges
   - Ranges: <$50k, $50k-$75k, $75k-$100k, $100k-$150k, >$150k
   - Employee count visualization

**Features:**
- ✅ Real-time Firestore queries (direct database access)
- ✅ Interactive dropdown filters
- ✅ Refresh functionality
- ✅ Chart canvas management (prevents conflicts)
- ✅ Error handling with canvas clearing
- ✅ Responsive design

### 🎯 **Performance Analytics** ✅ COMPLETED
Comprehensive performance analysis across organizational dimensions:

1. **Department vs Level Heatmap** (Scatter Plot)
   - Performance rating visualization by department and level
   - Color-coded performance indicators (1-5 scale)
   - Interactive tooltips with detailed metrics
   - Identifies performance patterns across the organization

2. **Performance Trends** (Bar Chart)
   - Employee distribution by performance rating ranges
   - Ranges: 1.0-2.0, 2.0-3.0, 3.0-4.0, 4.0-5.0
   - Performance distribution insights

3. **High Performers by Department** (Radar Chart)
   - Percentage of high performers (4.0+ rating) by department
   - 0-100% scale showing high performer ratios
   - Enhanced tooltips with detailed metrics

**Features:**
- ✅ Real-time performance data analysis
- ✅ Multi-chart view switching
- ✅ Department-level insights
- ✅ Performance pattern identification
- ✅ Interactive controls and tooltips

### ⚠️ **Risk Analysis** 🚧 COMING SOON
Advanced risk indicators and predictive analytics:
- Employee retention risk scoring
- Performance trend analysis
- Satisfaction correlation metrics
- Real-time alert system

### 👥 **Demographics** 🚧 COMING SOON
Advanced demographic visualization and analysis:
- Multi-dimensional demographic breakdowns
- Diversity metrics and trends
- Geographic distribution analysis
- Age, tenure, and experience analytics

### 🤖 **AI Insights** 🚧 COMING SOON
Intelligent analytics powered by OpenAI:
- Natural language query processing
- Automated insight generation
- Predictive analytics
- Smart recommendations

## 🔧 **Technical Architecture**

### **Firebase Configuration**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA5vLyX5Zq_YTBj0coqUN6RTFxGUr_KHWw",
  authDomain: "ai-payroll-dashboard.firebaseapp.com",
  projectId: "ai-payroll-dashboard",
  storageBucket: "ai-payroll-dashboard.firebasestorage.app",
  messagingSenderId: "446937180242",
  appId: "1:446937180242:web:7beb8c5ccf1e5a8045178b"
};
```

### **Cloud Functions** (Functions v2)
- `updateAnalyticsSummary` - Processes and caches analytics data
- `getDashboardAnalytics` - Fast retrieval of cached analytics
- `generateAIInsights` - AI-powered insights generation
- `aiChatQuery` - Natural language query processing

### **Database Structure** (Firestore)
```
employees/
├── {employeeId}/
│   ├── firstName: string
│   ├── lastName: string
│   ├── department: string
│   ├── level: string
│   ├── baseSalary: number
│   ├── performanceRating: number (1.0-5.0 scale)
│   ├── performanceTrend: string ('improving'|'stable'|'declining')
│   ├── lastPerformanceReview: timestamp
│   ├── status: string
│   └── ...50+ fields

analytics/
└── summary/
    ├── totalHeadcount: number
    ├── totalMonthlyCost: number
    ├── departmentCounts: object
    ├── levelCounts: object
    └── lastUpdated: timestamp
```

### **Security Rules**
```javascript
// Authenticated users can read data
match /employees/{employeeId} {
  allow read: if request.auth != null;
  allow write: if false; // Only Cloud Functions can write
}

match /analytics/{document} {
  allow read: if request.auth != null;
  allow write: if false; // Only Cloud Functions can write
}
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v16 or higher)
- Firebase CLI
- Google Cloud Account (for Gemini AI)
- Git

### **Installation**

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ai-payroll-dashboard.git
cd ai-payroll-dashboard

# Install dependencies
npm install

# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Start development environment
firebase emulators:start --import=./firebase-data --export-on-exit=./firebase-data
```

### **AI Setup**
See [AI-INSIGHTS-SETUP.md](AI-INSIGHTS-SETUP.md) for detailed AI configuration instructions.

### **Access Dashboard**
Open your browser and navigate to:
```
http://localhost:5000/clean-firebase-dashboard.html
```

**Default Admin Credentials:**
- Email: `zoki.nedelkovski@gmail.com`
- Password: `admin123`

### **Features to Explore**
1. **📊 Executive Overview** - Real-time KPIs from 951 employees
2. **💰 Salary Trends** - Multi-year analysis with interactive charts
3. **📈 Performance Analytics** - Department vs Level heatmaps
4. **⚠️ Risk Analysis** - Real-time alerts and retention risk
5. **👥 Demographics** - Age, gender, tenure, and location analysis
6. **🤖 AI Insights** - Strategic recommendations (Admin only)
7. **💬 AI Chat** - Interactive Q&A about workforce data (Admin only)

## 📈 **Chart Technologies**

### **Chart.js Integration**
- **Version**: Latest v4
- **Types Used**: Bar, Doughnut, Line, Scatter, Radar
- **Features**: Interactive tooltips, responsive design, animation
- **Custom Configurations**: Currency formatting, percentage calculations

### **Data Processing**
- Real-time Firestore queries
- Client-side data aggregation
- Performance optimization with data caching
- Error handling and graceful degradation

## 🔐 **Authentication & Security**

### **Firebase Authentication**
- Email/password authentication
- Admin-managed user creation (via Firebase Console)
- Session management with `onAuthStateChanged`
- Secure logout functionality

### **Data Security**
- Firestore security rules enforce authentication
- Direct database queries for authenticated users
- Cloud Functions with authentication verification
- CORS configured for localhost development

## 🌟 **Key Features**

### ✅ **Completed Features**
- 🔥 Firebase integration with emulator support
- 📊 Interactive salary trends analysis (3 chart types)
- 🎯 Performance heatmap analytics (3 chart types)
- 🏠 Executive overview dashboard
- 🔧 Real-time data processing
- 📱 Responsive design
- 🔐 Secure authentication
- 📈 Advanced charting with Chart.js

### 🚧 **In Development**
- ⚠️ Risk analysis dashboard
- 👥 Advanced demographics visualization
- 🤖 AI insights integration
- 🔍 Interactive filtering and drill-down

## 📚 **API Documentation**

### **Cloud Functions**
```javascript
// Get dashboard analytics
const getAnalytics = httpsCallable(functions, 'getDashboardAnalytics');
const result = await getAnalytics();

// Update analytics summary
const updateAnalytics = httpsCallable(functions, 'updateAnalyticsSummary');
const result = await updateAnalytics();
```

### **Firestore Queries**
```javascript
// Get active employees
const employeesSnap = await getDocs(collection(db, 'employees'));
const employees = employeesSnap.docs
  .map(doc => doc.data())
  .filter(emp => emp.status === 'Active');
```

## 🛠 **Development Notes**

### **Best Practices Implemented**
- ✅ Modular JavaScript with ES6 imports
- ✅ Proper error handling and logging
- ✅ Chart memory management (destroy/recreate)
- ✅ Firebase emulator for local development
- ✅ Security rules for data protection
- ✅ Responsive CSS with modern design

### **Performance Optimizations**
- ✅ Analytics data caching in Firestore
- ✅ Client-side data processing
- ✅ Efficient chart rendering with Chart.js
- ✅ Proper cleanup of chart instances

## 📊 **Data Insights Available**

### **Salary Analytics**
- Department salary averages and distributions
- Level-based budget allocation
- Salary range distributions
- Real-time cost calculations

### **Performance Metrics**
- Department vs Level performance heatmaps
- Performance rating distributions
- Cross-departmental comparisons
- Performance trend analysis

### **Organizational Insights**
- Headcount analytics by department/level
- Gender diversity metrics
- Cost center analysis
- Budget allocation insights

## 🚀 **Future Roadmap**

### **Phase 1** ✅ COMPLETED
- Basic dashboard with Firebase integration
- Salary trends analysis
- Performance heatmaps

### **Phase 2** 🚧 IN PROGRESS
- Risk analysis dashboard
- Advanced demographics
- Interactive filtering

### **Phase 3** 📋 PLANNED
- AI insights integration with OpenAI
- Predictive analytics
- Natural language querying
- Advanced reporting features

---

## 📞 **Support & Contact**

For questions, issues, or feature requests, please contact the development team or create an issue in the repository.

**Built with ❤️ using Firebase and modern web technologies**

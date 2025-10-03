const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with service account
// You'll need to download your service account key from Firebase Console
const serviceAccount = require('./service-account-key.json'); // You'll need to create this

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'ai-payroll-dashboard'
});

// Connect to real Firestore database
const db = admin.firestore();

async function seedProductionData() {
  console.log('🌱 Starting production data seeding process...');
  console.log('⚠️  WARNING: This will modify your PRODUCTION Firestore database!');
  
  try {
    // Read the JSON file
    const dataPath = path.join(__dirname, 'realistic_employee_data.json');
    
    if (!fs.existsSync(dataPath)) {
      console.error('❌ Error: realistic_employee_data.json not found in the root directory');
      console.log('Please ensure the file exists and try again.');
      process.exit(1);
    }
    
    console.log('📖 Reading realistic_employee_data.json...');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const employees = JSON.parse(rawData);
    
    console.log(`📊 Found ${employees.length} employees to import`);
    
    // Validate data structure
    if (!Array.isArray(employees)) {
      console.error('❌ Error: JSON file should contain an array of employee objects');
      process.exit(1);
    }
    
    if (employees.length === 0) {
      console.error('❌ Error: No employees found in the JSON file');
      process.exit(1);
    }
    
    // Check required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'department', 'level', 'baseSalary'];
    const sampleEmployee = employees[0];
    const missingFields = requiredFields.filter(field => !(field in sampleEmployee));
    
    if (missingFields.length > 0) {
      console.error(`❌ Error: Missing required fields: ${missingFields.join(', ')}`);
      console.log('Sample employee structure:', Object.keys(sampleEmployee));
      process.exit(1);
    }
    
    console.log('✅ Data validation passed');
    
    // Ask for confirmation before proceeding
    console.log('\n🚨 PRODUCTION DATABASE WARNING 🚨');
    console.log('This will modify your REAL Firestore database.');
    console.log('Existing employee data will be DELETED and replaced.');
    console.log(`You are about to import ${employees.length} employees.`);
    console.log('\nPress Ctrl+C to cancel, or wait 10 seconds to continue...');
    
    // Wait 10 seconds for user to cancel
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Clear existing data
    console.log('🗑️ Clearing existing employee data from production...');
    const existingSnap = await db.collection('employees').get();
    const batch = db.batch();
    
    existingSnap.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`✅ Deleted ${existingSnap.docs.length} existing employees from production`);
    
    // Add new data in batches
    console.log('📝 Adding new employee data to production...');
    const batchSize = 500; // Firestore batch limit
    let totalAdded = 0;
    
    for (let i = 0; i < employees.length; i += batchSize) {
      const batch = db.batch();
      const batchData = employees.slice(i, i + batchSize);
      
      batchData.forEach(employee => {
        // Ensure all required fields are present
        const employeeData = {
          firstName: employee.firstName || 'Unknown',
          lastName: employee.lastName || 'Unknown',
          email: employee.email || `${employee.firstName}.${employee.lastName}@company.com`,
          gender: employee.gender || 'Unknown',
          dob: employee.dob || '1990-01-01',
          location: employee.location || 'Unknown',
          department: employee.department || 'Unknown',
          level: employee.level || 'Unknown',
          role: employee.role || 'Employee',
          startDate: employee.startDate || '2020-01-01',
          status: employee.status || 'Active',
          isActive: employee.isActive !== undefined ? employee.isActive : true,
          baseSalary: employee.baseSalary || 50000,
          bonus: employee.bonus || 0,
          currency: employee.currency || 'USD',
          payFrequency: employee.payFrequency || 'Semi-Monthly',
          healthInsurance: employee.healthInsurance !== undefined ? employee.healthInsurance : true,
          retirementPlan: employee.retirementPlan || 'Tier1',
          vacationDaysTotal: employee.vacationDaysTotal || 20,
          vacationDaysUsed: employee.vacationDaysUsed || 0,
          performanceRating: employee.performanceRating || 3.0,
          performanceTrend: employee.performanceTrend || 'stable',
          lastPerformanceReview: employee.lastPerformanceReview || admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = db.collection('employees').doc();
        batch.set(docRef, employeeData);
      });
      
      await batch.commit();
      totalAdded += batchData.length;
      console.log(`✅ Added batch ${Math.ceil((i + batchSize) / batchSize)}/${Math.ceil(employees.length / batchSize)} (${totalAdded}/${employees.length} employees)`);
    }
    
    console.log(`\n🎉 Successfully seeded ${totalAdded} employees to PRODUCTION Firestore!`);
    
    // Verify the data
    console.log('\n🔍 Verifying seeded data in production...');
    const verifySnap = await db.collection('employees').get();
    console.log(`✅ Verification: ${verifySnap.docs.length} employees in production database`);
    
    // Show sample data
    if (verifySnap.docs.length > 0) {
      const sampleData = verifySnap.docs[0].data();
      console.log('\n📋 Sample employee data in production:');
      console.log(`Name: ${sampleData.firstName} ${sampleData.lastName}`);
      console.log(`Email: ${sampleData.email}`);
      console.log(`Department: ${sampleData.department}`);
      console.log(`Level: ${sampleData.level}`);
      console.log(`Location: ${sampleData.location}`);
      console.log(`Salary: $${sampleData.baseSalary.toLocaleString()}`);
      console.log(`Performance Rating: ${sampleData.performanceRating}`);
    }
    
    // Show demographics summary
    console.log('\n📊 Production Database Demographics Summary:');
    const departments = new Set();
    const locations = new Set();
    const levels = new Set();
    const genders = new Set();
    
    verifySnap.docs.forEach(doc => {
      const data = doc.data();
      departments.add(data.department);
      locations.add(data.location);
      levels.add(data.level);
      genders.add(data.gender);
    });
    
    console.log(`Departments: ${departments.size} (${Array.from(departments).join(', ')})`);
    console.log(`Locations: ${locations.size} (${Array.from(locations).slice(0, 5).join(', ')}${locations.size > 5 ? '...' : ''})`);
    console.log(`Levels: ${levels.size} (${Array.from(levels).join(', ')})`);
    console.log(`Genders: ${genders.size} (${Array.from(genders).join(', ')})`);
    
    console.log('\n🚀 Production data seeding completed successfully!');
    console.log('Your AI-powered payroll dashboard is now ready with real data!');
    
  } catch (error) {
    console.error('❌ Error during production seeding:', error);
    process.exit(1);
  }
}

// Run the seeding process
seedProductionData().catch(console.error);

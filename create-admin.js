const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'ai-payroll-dashboard'
});

const db = admin.firestore();

async function createAdminUser(userEmail) {
  try {
    console.log(`🔍 Setting up admin user: ${userEmail}`);
    
    // Create admin user document in Firestore
    await db.collection('users').doc(userEmail).set({
      email: userEmail,
      isAdmin: true,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Successfully created admin user document for: ${userEmail}`);
    
    // Also set custom claims for additional security
    const user = await admin.auth().getUserByEmail(userEmail);
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
      role: 'admin'
    });
    
    console.log(`🎉 Successfully set ${userEmail} as admin with both Firestore document and custom claims!`);
    
    // Verify the setup
    const userDoc = await db.collection('users').doc(userEmail).get();
    const updatedUser = await admin.auth().getUser(user.uid);
    
    console.log('\n📋 Verification:');
    console.log('Firestore document:', userDoc.data());
    console.log('Custom claims:', updatedUser.customClaims);
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ User with email ${userEmail} not found in Authentication.`);
      console.log('Please make sure the user exists in Firebase Authentication first.');
    } else {
      console.error('❌ Error setting up admin user:', error.message);
    }
  }
}

// Get email from command line argument
const userEmail = process.argv[2];

if (!userEmail) {
  console.log('❌ Please provide a user email as an argument.');
  console.log('Usage: node create-admin.js user@example.com');
  process.exit(1);
}

// Run the function
createAdminUser(userEmail).catch(console.error);

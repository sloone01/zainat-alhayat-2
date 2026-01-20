// Test authentication and enrollment API
const axios = require('axios');

async function testAuth() {
  try {
    console.log('🔐 Testing admin login...');

    // Login with admin credentials
    const loginResponse = await axios.post('http://localhost:3002/api/auth/login', {
      email: 'admin@zinatalhaykindergarten.com',
      password: 'Admin123!'
    });

    console.log('Full login response:', loginResponse.data);

    if (!loginResponse.data.data.access_token) {
      throw new Error('No access token received');
    }

    console.log('✅ Login successful!');
    console.log('Token:', loginResponse.data.data.access_token.substring(0, 20) + '...');
    console.log('User:', loginResponse.data.data.user);

    const token = loginResponse.data.data.access_token;

    console.log('\n📋 Testing enrollment list...');

    // Test enrollment list endpoint
    const enrollmentsResponse = await axios.get('http://localhost:3002/api/enrollments', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Enrollments list retrieved successfully!');
    console.log('Count:', enrollmentsResponse.data.count);
    console.log('First enrollment:', enrollmentsResponse.data.data[0]?.fullName);

    if (enrollmentsResponse.data.data.length > 0) {
      const firstEnrollmentId = enrollmentsResponse.data.data[0].id;
      console.log('\n📄 Testing single enrollment...');

      // Test single enrollment endpoint
      const singleEnrollmentResponse = await axios.get(`http://localhost:3002/api/enrollments/${firstEnrollmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Single enrollment retrieved successfully!');
      console.log('Student:', singleEnrollmentResponse.data.data.fullName);
      console.log('Status:', singleEnrollmentResponse.data.data.status);
      console.log('Grade:', singleEnrollmentResponse.data.data.gradeLevel);

      console.log('\n🎯 You can now test the print functionality!');
      console.log(`Print URL: http://localhost:5174/enrollments/${firstEnrollmentId}/print`);
    } else {
      console.log('❌ No enrollments found in database');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuth();
// Test script to verify the auth service fix
const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testLogin() {
  try {
    console.log('🔍 Testing login with admin credentials...');
    
    // Simulate what the frontend auth service does
    const backendResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@zinatalhaykindergarten.com',
      password: 'admin123'
    });
    
    console.log('📡 Raw backend response status:', backendResponse.status);
    console.log('📡 Raw backend response data:', JSON.stringify(backendResponse.data, null, 2));
    
    // This is what the frontend auth service gets
    const response = backendResponse.data;
    console.log('\n🔧 Frontend gets response:', JSON.stringify(response, null, 2));
    
    // This is what the frontend should extract
    const authData = response.data;
    console.log('\n✅ Auth data extracted:', JSON.stringify(authData, null, 2));
    
    // Verify the structure
    if (authData && authData.access_token && authData.user) {
      console.log('\n🎉 SUCCESS: Auth data structure is correct!');
      console.log('   - access_token:', authData.access_token ? 'Present' : 'Missing');
      console.log('   - user.id:', authData.user.id || 'Missing');
      console.log('   - user.email:', authData.user.email || 'Missing');
      console.log('   - user.role:', authData.user.role || 'Missing');
      console.log('   - user.firstName:', authData.user.firstName || 'Missing');
      console.log('   - user.lastName:', authData.user.lastName || 'Missing');
      
      // Test token storage simulation
      console.log('\n💾 Simulating localStorage storage:');
      console.log('   - auth_token would be stored:', authData.access_token.substring(0, 50) + '...');
      console.log('   - user_data would be stored:', JSON.stringify(authData.user));
      
      return true;
    } else {
      console.log('\n❌ FAILED: Auth data structure is incorrect');
      console.log('   - authData:', authData);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
    return false;
  }
}

async function testMultipleUsers() {
  const testUsers = [
    { email: 'admin@zinatalhaykindergarten.com', password: 'admin123', role: 'admin' },
    { email: 'fatima.alzahra@zinatalhaykindergarten.com', password: 'teacher123', role: 'teacher' },
    { email: 'ahmed.hassan@example.com', password: 'parent123', role: 'parent' }
  ];
  
  console.log('\n🧪 Testing multiple user types...\n');
  
  for (const user of testUsers) {
    try {
      console.log(`Testing ${user.role}: ${user.email}`);
      
      const backendResponse = await axios.post(`${API_BASE}/api/auth/login`, {
        email: user.email,
        password: user.password
      });
      
      const response = backendResponse.data;
      const authData = response.data;
      
      if (authData && authData.access_token && authData.user && authData.user.role === user.role) {
        console.log(`   ✅ ${user.role} login successful`);
        console.log(`   - User: ${authData.user.firstName} ${authData.user.lastName}`);
        console.log(`   - Role: ${authData.user.role}`);
        console.log(`   - School: ${authData.user.school_name || 'N/A'}`);
      } else {
        console.log(`   ❌ ${user.role} login failed - invalid structure`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${user.role} login failed:`, error.response?.data?.message || error.message);
    }
    
    console.log(''); // Empty line for readability
  }
}

async function main() {
  console.log('🚀 Testing Frontend Auth Service Fix\n');
  console.log('=' * 50);
  
  const success = await testLogin();
  
  if (success) {
    await testMultipleUsers();
    console.log('🎯 All tests completed! The frontend auth service should now work correctly.');
  } else {
    console.log('🚨 Basic login test failed. Please check the backend response structure.');
  }
}

main().catch(console.error);

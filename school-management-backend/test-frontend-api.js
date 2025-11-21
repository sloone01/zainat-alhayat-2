const axios = require('axios');

// Simulate the frontend API calls
async function testFrontendAPI() {
  try {
    console.log('🔄 Testing Frontend API calls...');

    // Test 1: Get progress for student درر المسكرية
    console.log('\n📊 Test 1: Get progress for student درر المسكرية');
    const studentId1 = '6f28a8bf-0035-459b-90f5-47a45d52bc1e';
    
    try {
      const response1 = await axios.get(`http://localhost:3002/api/student-progress/student/${studentId1}`);
      console.log('✅ API Response Status:', response1.status);
      console.log('✅ API Response Data:', JSON.stringify(response1.data, null, 2));
      
      // Check if data is in expected format
      if (response1.data.success && response1.data.data) {
        console.log('✅ Progress records found:', response1.data.data.length);
        response1.data.data.forEach((record, index) => {
          console.log(`  Record ${index + 1}:`, {
            status: record.status,
            teacher_notes: record.teacher_notes,
            milestone_id: record.milestone_id
          });
        });
      }
    } catch (error) {
      console.log('❌ API call failed:', error.message);
      if (error.response) {
        console.log('❌ Response status:', error.response.status);
        console.log('❌ Response data:', error.response.data);
      }
    }

    // Test 2: Get progress for student صالح المسكري
    console.log('\n📊 Test 2: Get progress for student صالح المسكري');
    const studentId2 = 'ab3e3706-5b1d-4e9f-a4b2-4f435e7f8067';
    
    try {
      const response2 = await axios.get(`http://localhost:3002/api/student-progress/student/${studentId2}`);
      console.log('✅ API Response Status:', response2.status);
      console.log('✅ Progress records found:', response2.data.data.length);
      response2.data.data.forEach((record, index) => {
        console.log(`  Record ${index + 1}:`, {
          status: record.status,
          teacher_notes: record.teacher_notes,
          milestone_id: record.milestone_id
        });
      });
    } catch (error) {
      console.log('❌ API call failed:', error.message);
    }

    // Test 3: Get progress for student روان العويدي
    console.log('\n📊 Test 3: Get progress for student روان العويدي');
    const studentId3 = '273933e4-0027-4a0a-8fd3-eb29449897fc';
    
    try {
      const response3 = await axios.get(`http://localhost:3002/api/student-progress/student/${studentId3}`);
      console.log('✅ API Response Status:', response3.status);
      console.log('✅ Progress records found:', response3.data.data.length);
      response3.data.data.forEach((record, index) => {
        console.log(`  Record ${index + 1}:`, {
          status: record.status,
          teacher_notes: record.teacher_notes,
          milestone_id: record.milestone_id
        });
      });
    } catch (error) {
      console.log('❌ API call failed:', error.message);
    }

    console.log('\n🎉 Frontend API test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFrontendAPI();

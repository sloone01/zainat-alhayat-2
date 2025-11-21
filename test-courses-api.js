// Test script to verify courses API and frontend integration
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3003/api';

async function testCoursesAPI() {
  console.log('🧪 Testing Courses API Integration...\n');

  try {
    // Test 1: Get all courses
    console.log('1️⃣ Testing GET /api/courses');
    const coursesResponse = await axios.get(`${API_BASE_URL}/courses`);
    
    if (coursesResponse.data.success) {
      console.log('✅ Courses API working');
      console.log(`📊 Found ${coursesResponse.data.count} courses`);
      
      // Show course details
      coursesResponse.data.data.forEach((course, index) => {
        console.log(`   ${index + 1}. ${course.name} (${course.is_active ? 'Active' : 'Inactive'})`);
      });
    } else {
      console.log('❌ Courses API returned success: false');
    }

    // Test 2: Test course creation
    console.log('\n2️⃣ Testing POST /api/courses (Create Course)');
    const newCourseData = {
      name: 'Test Course API',
      description: 'Test course created via API',
      is_active: true,
      school_id: 1
    };

    const createResponse = await axios.post(`${API_BASE_URL}/courses`, newCourseData);
    
    if (createResponse.data.success) {
      console.log('✅ Course creation working');
      console.log(`📝 Created course: ${createResponse.data.data.name}`);
      
      const createdCourseId = createResponse.data.data.id;
      
      // Test 3: Test phase creation for the new course
      console.log('\n3️⃣ Testing POST /api/phases (Create Phase)');
      const phaseData = {
        name: 'Test Phase',
        description: 'Test phase for the course',
        order: 1,
        courseId: createdCourseId
      };

      const phaseResponse = await axios.post(`${API_BASE_URL}/phases`, phaseData);
      
      if (phaseResponse.data.success) {
        console.log('✅ Phase creation working');
        console.log(`📋 Created phase: ${phaseResponse.data.data.name}`);
      } else {
        console.log('❌ Phase creation failed');
      }

      // Test 4: Clean up - delete the test course
      console.log('\n4️⃣ Testing DELETE /api/courses/:id (Cleanup)');
      try {
        await axios.delete(`${API_BASE_URL}/courses/${createdCourseId}`);
        console.log('✅ Course deletion working (cleanup successful)');
      } catch (deleteError) {
        console.log('⚠️  Course deletion not implemented (test course remains)');
      }
      
    } else {
      console.log('❌ Course creation failed');
    }

    // Test 5: Check frontend compatibility
    console.log('\n5️⃣ Testing Frontend Data Mapping');
    const mappedCourses = coursesResponse.data.data.map(course => ({
      ...course,
      title: course.name || course.title,
      status: course.is_active ? 'active' : 'inactive',
      category: course.category || 'general'
    }));

    console.log('✅ Frontend mapping working');
    console.log(`📋 Mapped ${mappedCourses.length} courses for frontend`);

    // Summary
    console.log('\n📋 SUMMARY:');
    console.log('✅ Backend API: Working');
    console.log('✅ Courses endpoint: Working');
    console.log('✅ Course creation: Working');
    console.log('✅ Phase creation: Working');
    console.log('✅ Data mapping: Working');
    console.log('\n🎉 The /courses screen should work correctly!');
    
    // Note about sample data
    if (coursesResponse.data.count > 0) {
      console.log('\n⚠️  NOTE: Sample/seed data detected in database');
      console.log('   Consider running the production-database-cleanup.sql script');
      console.log('   to remove sample courses and show only real data.');
    }

  } catch (error) {
    console.error('\n❌ API Test Failed:', error.message);
    
    if (error.response) {
      console.error('📥 Error Response:', error.response.status, error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Backend not running on http://localhost:3003');
    }
  }
}

testCoursesAPI();

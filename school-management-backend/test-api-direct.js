const { Client } = require('pg');

// Database connection
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'school_management',
  user: 'salim',
});

async function testAPIDirectly() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Test 1: Check what students exist
    console.log('\n🔄 Test 1: Checking existing students...');
    const studentsQuery = `SELECT id, "firstName", "lastName" FROM students LIMIT 5;`;
    const studentsResult = await client.query(studentsQuery);
    console.log('✅ Students found:', studentsResult.rows);

    // Test 2: Check what progress records exist
    console.log('\n🔄 Test 2: Checking existing progress records...');
    const progressQuery = `SELECT * FROM student_progress LIMIT 5;`;
    const progressResult = await client.query(progressQuery);
    console.log('✅ Progress records found:', progressResult.rows.length);
    console.log('Progress records:', progressResult.rows);

    // Test 3: Check if the student ID we're using exists
    console.log('\n🔄 Test 3: Checking specific student ID...');
    const specificStudentQuery = `SELECT id, "firstName", "lastName" FROM students WHERE id = $1;`;
    const specificStudentResult = await client.query(specificStudentQuery, ['c76bba3f-89f1-4cfa-b05a-941ac34be80a']);
    console.log('✅ Specific student found:', specificStudentResult.rows);

    // Test 4: Check progress for specific student
    console.log('\n🔄 Test 4: Checking progress for specific student...');
    const studentProgressQuery = `SELECT * FROM student_progress WHERE student_id = $1;`;
    const studentProgressResult = await client.query(studentProgressQuery, ['c76bba3f-89f1-4cfa-b05a-941ac34be80a']);
    console.log('✅ Progress for specific student:', studentProgressResult.rows);

    // Test 5: Check all students in a group (if groups exist)
    console.log('\n🔄 Test 5: Checking students in groups...');
    const groupStudentsQuery = `
      SELECT s.id, s."firstName", s."lastName", g.name as group_name 
      FROM students s 
      LEFT JOIN student_groups sg ON s.id = sg.student_id 
      LEFT JOIN groups g ON sg.group_id = g.id 
      LIMIT 10;
    `;
    const groupStudentsResult = await client.query(groupStudentsQuery);
    console.log('✅ Students in groups:', groupStudentsResult.rows);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await client.end();
    console.log('✅ Database connection closed');
  }
}

// Run the test
testAPIDirectly();

const { Client } = require('pg');

// Database connection
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'school_management',
  user: 'salim',
});

async function testProgressAPI() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Test 1: Insert a progress record
    console.log('\n🔄 Test 1: Inserting progress record...');
    
    const insertQuery = `
      INSERT INTO student_progress (
        status, teacher_notes, started_date, completed_date, 
        student_id, course_id, milestone_id, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, status, teacher_notes, student_id, milestone_id;
    `;
    
    const insertValues = [
      'completed',
      'Test progress record',
      '2025-11-13',
      '2025-11-14',
      'c76bba3f-89f1-4cfa-b05a-941ac34be80a', // Student UUID
      '92c77aa3-1a51-48a7-8226-6cf4e95c68f7', // Course UUID
      'f1676cf1-7d90-4e1c-9dc1-e84220590274', // Milestone UUID
      1 // Staff ID (integer)
    ];

    const insertResult = await client.query(insertQuery, insertValues);
    console.log('✅ Progress record inserted:', insertResult.rows[0]);

    // Test 2: Query progress by student
    console.log('\n🔄 Test 2: Querying progress by student...');
    
    const selectQuery = `
      SELECT * FROM student_progress 
      WHERE student_id = $1;
    `;
    
    const selectResult = await client.query(selectQuery, ['c76bba3f-89f1-4cfa-b05a-941ac34be80a']);
    console.log('✅ Progress records found:', selectResult.rows.length);
    console.log('Records:', selectResult.rows);

    // Test 3: Query progress by student and milestone
    console.log('\n🔄 Test 3: Querying progress by student and milestone...');
    
    const specificQuery = `
      SELECT * FROM student_progress 
      WHERE student_id = $1 AND milestone_id = $2;
    `;
    
    const specificResult = await client.query(specificQuery, [
      'c76bba3f-89f1-4cfa-b05a-941ac34be80a',
      'f1676cf1-7d90-4e1c-9dc1-e84220590274'
    ]);
    console.log('✅ Specific progress record:', specificResult.rows[0]);

    // Test 4: Update progress record
    console.log('\n🔄 Test 4: Updating progress record...');
    
    const updateQuery = `
      UPDATE student_progress 
      SET status = $1, teacher_notes = $2, updated_at = NOW()
      WHERE student_id = $3 AND milestone_id = $4
      RETURNING id, status, teacher_notes;
    `;
    
    const updateResult = await client.query(updateQuery, [
      'in_progress',
      'Updated test record',
      'c76bba3f-89f1-4cfa-b05a-941ac34be80a',
      'f1676cf1-7d90-4e1c-9dc1-e84220590274'
    ]);
    console.log('✅ Progress record updated:', updateResult.rows[0]);

    console.log('\n🎉 All tests passed! Progress API database operations work correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await client.end();
    console.log('✅ Database connection closed');
  }
}

// Run the test
testProgressAPI();

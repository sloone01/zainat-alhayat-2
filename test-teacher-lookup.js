// Test Teacher Lookup Logic
console.log('🧪 Testing Teacher Lookup Logic');

// Simulate the API response structure
const mockApiTeachers = [
  {
    id: "a845910d-da81-48d2-9dc7-3b3f5ebc3716",
    firstName: "Aisha",
    lastName: "Mohamed",
    email: "aisha.mohamed@zinatalhaykindergarten.com"
  },
  {
    id: "46d30267-6432-4727-896c-b5aad126a61f",
    firstName: "Sara",
    lastName: "Abdullah",
    email: "sara.abdullah@zinatalhaykindergarten.com"
  }
];

// Simulate how frontend processes the teachers (after fix)
const teachers = mockApiTeachers.map(teacher => ({
  id: teacher.id,
  firstName: teacher.firstName,
  lastName: teacher.lastName,
  name: `${teacher.firstName} ${teacher.lastName}`,
  email: teacher.email
}));

console.log('📋 Processed teachers:', teachers);

// Simulate class data from modal
const classData = {
  teacher: "Aisha Mohamed",  // This is what comes from the select dropdown
  subject: "Physical Development",
  day: "monday",
  startTime: "08:00",
  endTime: "09:30"
};

console.log('📝 Class data from modal:', classData);

// Test the lookup logic (current implementation)
const foundTeacher = teachers.find(t => {
  const fullName = `${t.firstName} ${t.lastName}`;
  console.log(`Comparing "${fullName}" with "${classData.teacher}"`);
  return fullName === classData.teacher || t.id === classData.teacher;
});

console.log('🔍 Found teacher:', foundTeacher);

if (foundTeacher) {
  console.log('✅ Teacher lookup successful!');
  console.log(`   Teacher ID: ${foundTeacher.id}`);
  console.log(`   Teacher Name: ${foundTeacher.firstName} ${foundTeacher.lastName}`);
} else {
  console.log('❌ Teacher lookup failed!');
  console.log('Available teacher names:');
  teachers.forEach(t => console.log(`  - "${t.firstName} ${t.lastName}"`));
}

// Test with "غير محدد" case
const classDataNoTeacher = {
  teacher: "غير محدد",
  subject: "Physical Development"
};

const foundTeacherNoAssignment = teachers.find(t => {
  const fullName = `${t.firstName} ${t.lastName}`;
  return fullName === classDataNoTeacher.teacher || t.id === classDataNoTeacher.teacher;
});

console.log('\n🧪 Testing "غير محدد" case:');
console.log('Class data:', classDataNoTeacher);
console.log('Found teacher:', foundTeacherNoAssignment);
console.log(foundTeacherNoAssignment ? '❌ Should be null' : '✅ Correctly null');

// Simulate final schedule data
const scheduleData = {
  day_of_week: classData.day,
  start_time: classData.startTime,
  end_time: classData.endTime,
  teacher_id: foundTeacher?.id || null,
  notes: ''
};

console.log('\n📋 Final schedule data:');
console.log(scheduleData);

if (scheduleData.teacher_id) {
  console.log('✅ Teacher ID will be saved to database');
} else {
  console.log('⚠️ Teacher ID is null - will not be saved');
}

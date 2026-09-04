// Test enrollment form submission with sample data
const testEnrollmentData = {
  student: {
    fullName: 'سارة أحمد محمد',
    tribe: 'البلوشي',
    idNumber: '12345678',
    gender: 'female',
    nationality: 'عماني',
    religion: 'الإسلام',
    dateOfBirth: new Date('2020-03-15'),
    age: 4,
    hasSiblings: true,
    photo: null
  },
  academic: {
    enrollmentStatus: 'new',
    gradeLevel: 'KG1',
    previousSchool: ''
  },
  health: {
    allergies: true,
    allergiesDetails: 'حساسية من الفول السوداني',
    seizures: false,
    seizuresDetails: '',
    surgeries: false,
    surgeriesDetails: '',
    chronicDiseases: false,
    chronicDiseasesDetails: '',
    other: 'الطفل بحالة صحية جيدة بشكل عام',
    medicalReports: []
  },
  guardian: {
    type: 'father',
    fatherInfo: {
      fullName: 'أحمد محمد علي البلوشي',
      tribe: 'البلوشي',
      workplace: 'وزارة الصحة',
      workPhone: '+968 24123456',
      mobile: '+968 99123456',
      email: 'ahmed.mohamed@gmail.com',
      maritalStatus: 'متزوج'
    },
    motherInfo: {
      fullName: 'فاطمة سالم أحمد',
      tribe: 'المعشني',
      workplace: 'وزارة التربية والتعليم',
      workPhone: '+968 24987654',
      mobile: '+968 99987654',
      email: 'fatima.salem@gmail.com',
      maritalStatus: 'متزوجة'
    },
    emergencyContact: {
      fullName: 'سالم أحمد محمد',
      tribe: 'البلوشي',
      workplace: 'شركة تنمية نفط عمان',
      workPhone: '+968 24555666',
      mobile: '+968 99555666',
      relationship: 'العم'
    }
  },
  address: {
    area: 'الخوير',
    village: 'الخوير الأولى',
    landmark: 'بجوار مسجد الإمام',
    streetNumber: '123',
    alleyNumber: '45',
    buildingNumber: '67',
    housingType: 'house'
  }
};

console.log('Sample enrollment data:');
console.log(JSON.stringify(testEnrollmentData, null, 2));

// Test API submission
async function testAPISubmission() {
  try {
    console.log('Testing API submission...');

    const response = await fetch('http://localhost:3002/api/enrollments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEnrollmentData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Enrollment submitted successfully!');
      console.log('Enrollment ID:', result.data.id);
      console.log('Status:', result.data.status);
      console.log('Student Name:', result.data.fullName);
      console.log('Father Name:', result.data.fatherFullName);
    } else {
      console.log('❌ Error submitting enrollment:');
      console.log(result);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

// Run the test if this is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testAPISubmission();
}
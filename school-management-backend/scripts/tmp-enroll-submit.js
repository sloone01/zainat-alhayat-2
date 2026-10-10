const DOC =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

async function main() {
  const school = '91d02698-72f9-45ac-9715-be10da76e8fa'
  const plansRes = await fetch(
    `http://127.0.0.1:3002/api/public/enrollment-fees/plans?school_id=${school}`,
  )
  const plansJson = await plansRes.json()
  const plan = (plansJson.data || [])[0]?.id
  const civil = '77665544'
  const body = {
    school_id: school,
    installment_plan_id: plan,
    student: {
      fullName: 'Test Student',
      first_name_ar: 'تست',
      first_name_en: 'Test',
      last_name_ar: 'طالب',
      last_name_en: 'Student',
      secondName: 'وسط',
      secondNameEn: 'Mid',
      idNumber: civil,
      gender: 'male',
      nationality: 'Omani',
      religion: 'Islam',
      dateOfBirth: '2019-05-01',
      age: 5,
      hasSiblings: false,
    },
    academic: { enrollmentStatus: 'new', gradeLevel: 'KG1' },
    health: { allergies: false, seizures: false, surgeries: false, chronicDiseases: false },
    guardian: {
      type: 'father',
      fatherInfo: {
        first_name_ar: 'أب',
        first_name_en: 'Dad',
        last_name_ar: 'طالب',
        last_name_en: 'Student',
        civil_id: civil,
        mobile: '91234567',
        email: 'dad@example.com',
      },
      motherInfo: {
        first_name_ar: 'أم',
        first_name_en: 'Mom',
        last_name_ar: 'طالب',
        last_name_en: 'Student',
        civil_id: civil,
        mobile: '91234568',
        email: 'mom@example.com',
      },
      emergencyContact: { fullName: 'Uncle', mobile: '91234569', relationship: 'uncle' },
    },
    address: { area: 'Muscat', housingType: 'house' },
    documents: { parentIdDocuments: [DOC], birthCertificate: DOC, childIdDocument: DOC },
  }
  const res = await fetch('http://127.0.0.1:3002/api/enrollments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  console.log('HTTP', res.status)
  console.log(text.slice(0, 1500))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

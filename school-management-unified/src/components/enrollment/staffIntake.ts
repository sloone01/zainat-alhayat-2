import type { Parent } from '@/services/parent.service'
import type { RegisterStudentInAppRequest } from '@/services/student.service'

export type StaffIntakeStudent = {
  fullName: string
  tribe: string
  idNumber: string
  gender: 'male' | 'female' | ''
  nationality: string
  religion: string
  dateOfBirth: Date | string | null
  age: number | null
  hasSiblings: boolean
  photo: File | string | null
}

export type StaffIntakeAcademic = {
  enrollmentStatus: 'new' | 'transfer'
  gradeLevel: string
  previousSchool: string
}

export type StaffIntakeHealth = {
  allergies: boolean
  allergiesDetails: string
  seizures: boolean
  seizuresDetails: string
  surgeries: boolean
  surgeriesDetails: string
  chronicDiseases: boolean
  chronicDiseasesDetails: string
  other: string
  medicalReports: (File | string)[]
}

export type StaffIntakePerson = {
  fullName: string
  tribe: string
  workplace: string
  workPhone: string
  mobile: string
  email: string
  maritalStatus: string
}

export type StaffIntakeGuardian = {
  type: 'father' | 'mother' | 'other'
  fatherInfo: StaffIntakePerson
  motherInfo: StaffIntakePerson
  otherInfo: {
    organizationName: string
    phone: string
    responsiblePerson: string
    responsiblePhone: string
  }
  emergencyContact: {
    fullName: string
    tribe: string
    workplace: string
    workPhone: string
    mobile: string
    relationship: string
  }
}

export type StaffIntakeAddress = {
  area: string
  village: string
  landmark: string
  streetNumber: string
  alleyNumber: string
  buildingNumber: string
  housingType: 'house' | 'apartment'
}

export type StaffIntakeForm = {
  student: StaffIntakeStudent
  academic: StaffIntakeAcademic
  health: StaffIntakeHealth
  guardian: StaffIntakeGuardian
  address: StaffIntakeAddress
}

function emptyPerson(): StaffIntakePerson {
  return {
    fullName: '',
    tribe: '',
    workplace: '',
    workPhone: '',
    mobile: '',
    email: '',
    maritalStatus: '',
  }
}

export function createEmptyStaffIntakeForm(): StaffIntakeForm {
  return {
    student: {
      fullName: '',
      tribe: '',
      idNumber: '',
      gender: 'male',
      nationality: '',
      religion: '',
      dateOfBirth: null,
      age: null,
      hasSiblings: false,
      photo: null,
    },
    academic: {
      enrollmentStatus: 'new',
      gradeLevel: '',
      previousSchool: '',
    },
    health: {
      allergies: false,
      allergiesDetails: '',
      seizures: false,
      seizuresDetails: '',
      surgeries: false,
      surgeriesDetails: '',
      chronicDiseases: false,
      chronicDiseasesDetails: '',
      other: '',
      medicalReports: [],
    },
    guardian: {
      type: 'father',
      fatherInfo: emptyPerson(),
      motherInfo: emptyPerson(),
      otherInfo: {
        organizationName: '',
        phone: '',
        responsiblePerson: '',
        responsiblePhone: '',
      },
      emergencyContact: {
        fullName: '',
        tribe: '',
        workplace: '',
        workPhone: '',
        mobile: '',
        relationship: '',
      },
    },
    address: {
      area: '',
      village: '',
      landmark: '',
      streetNumber: '',
      alleyNumber: '',
      buildingNumber: '',
      housingType: 'house',
    },
  }
}

export function splitFullName(fullName: string): {
  firstName: string
  lastName: string
  secondName?: string
  thirdName?: string
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] }
  if (parts.length === 2) return { firstName: parts[0], lastName: parts[1] }
  if (parts.length === 3) {
    return { firstName: parts[0], secondName: parts[1], lastName: parts[2] }
  }
  return {
    firstName: parts[0],
    secondName: parts[1],
    thirdName: parts[2],
    lastName: parts.slice(3).join(' '),
  }
}

export function formatStaffIntakeDate(value: Date | string | null): string {
  if (!value) return ''
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return ''
    return value.toISOString().split('T')[0]
  }
  const text = String(value)
  if (text.includes('T')) return text.split('T')[0]
  return text
}

export async function fileToDataUrl(file: File | string | null | undefined): Promise<string | undefined> {
  if (!file) return undefined
  if (typeof file === 'string') return file
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function composeMedicalInfo(health: StaffIntakeHealth): string | undefined {
  const parts: string[] = []
  if (health.allergies && health.allergiesDetails.trim()) {
    parts.push(`Allergies: ${health.allergiesDetails.trim()}`)
  }
  if (health.chronicDiseases && health.chronicDiseasesDetails.trim()) {
    parts.push(`Chronic: ${health.chronicDiseasesDetails.trim()}`)
  }
  if (health.surgeries && health.surgeriesDetails.trim()) {
    parts.push(`Surgeries: ${health.surgeriesDetails.trim()}`)
  }
  if (health.seizures && health.seizuresDetails.trim()) {
    parts.push(`Seizures: ${health.seizuresDetails.trim()}`)
  }
  if (health.other.trim()) parts.push(health.other.trim())
  return parts.length ? parts.join('; ') : undefined
}

function composeAddress(address: StaffIntakeAddress): string {
  const parts: string[] = []
  if (address.area.trim()) parts.push(address.area.trim())
  if (address.village.trim()) parts.push(address.village.trim())
  if (address.landmark.trim()) parts.push(address.landmark.trim())
  if (address.streetNumber.trim()) parts.push(address.streetNumber.trim())
  if (address.alleyNumber.trim()) parts.push(address.alleyNumber.trim())
  if (address.buildingNumber.trim()) parts.push(address.buildingNumber.trim())
  if (address.housingType) parts.push(address.housingType)
  return parts.join(', ') || '-'
}

function composeNotes(form: StaffIntakeForm): string | undefined {
  const parts: string[] = []
  if (form.student.tribe.trim()) parts.push(`Tribe: ${form.student.tribe.trim()}`)
  if (form.student.religion.trim()) parts.push(`Religion: ${form.student.religion.trim()}`)
  if (form.student.hasSiblings) parts.push('Has siblings at school')
  if (form.academic.enrollmentStatus) parts.push(`Status: ${form.academic.enrollmentStatus}`)
  if (form.academic.gradeLevel.trim()) parts.push(`Grade: ${form.academic.gradeLevel.trim()}`)
  if (form.academic.previousSchool.trim()) {
    parts.push(`Previous school: ${form.academic.previousSchool.trim()}`)
  }
  return parts.length ? parts.join(' · ') : undefined
}

function parentFullName(parent: Parent): string {
  return `${parent.firstName ?? ''} ${parent.lastName ?? ''}`.trim()
}

export function applyParentToGuardian(
  guardian: StaffIntakeGuardian,
  parent: Parent,
): StaffIntakeGuardian {
  const next = {
    ...guardian,
    fatherInfo: { ...guardian.fatherInfo },
    motherInfo: { ...guardian.motherInfo },
    otherInfo: { ...guardian.otherInfo },
    emergencyContact: { ...guardian.emergencyContact },
  }
  const fullName = parentFullName(parent)
  if (next.type === 'mother') {
    next.motherInfo.fullName = fullName || next.motherInfo.fullName
    next.motherInfo.mobile = parent.phone || next.motherInfo.mobile
    next.motherInfo.email = parent.email || next.motherInfo.email
    next.motherInfo.tribe = parent.tribe || next.motherInfo.tribe
    next.motherInfo.workplace = parent.workplace || next.motherInfo.workplace
    next.motherInfo.workPhone = parent.workPhone || next.motherInfo.workPhone
    next.motherInfo.maritalStatus = parent.maritalStatus || next.motherInfo.maritalStatus
  } else if (next.type === 'other') {
    next.otherInfo.organizationName = parent.organizationName || parentFullName(parent) || next.otherInfo.organizationName
    next.otherInfo.phone = parent.phone || next.otherInfo.phone
    next.otherInfo.responsiblePerson = parent.responsiblePerson || fullName || next.otherInfo.responsiblePerson
    next.otherInfo.responsiblePhone = parent.responsiblePhone || parent.phone || next.otherInfo.responsiblePhone
  } else {
    next.fatherInfo.fullName = fullName || next.fatherInfo.fullName
    next.fatherInfo.mobile = parent.phone || next.fatherInfo.mobile
    next.fatherInfo.email = parent.email || next.fatherInfo.email
    next.fatherInfo.tribe = parent.tribe || next.fatherInfo.tribe
    next.fatherInfo.workplace = parent.workplace || next.fatherInfo.workplace
    next.fatherInfo.workPhone = parent.workPhone || next.fatherInfo.workPhone
    next.fatherInfo.maritalStatus = parent.maritalStatus || next.fatherInfo.maritalStatus
  }
  return next
}

export async function mapStaffIntakeToRegisterRequest(options: {
  form: StaffIntakeForm
  groupId: string
  selectedParent: Parent | null
  createParentUser: boolean
  createStudentUser: boolean
  studentEmail: string
}): Promise<RegisterStudentInAppRequest> {
  const { form, groupId, selectedParent, createParentUser, createStudentUser, studentEmail } = options
  const names = splitFullName(form.student.fullName)
  const dateOfBirth = formatStaffIntakeDate(form.student.dateOfBirth)
  const photo = await fileToDataUrl(form.student.photo)
  const emergency = form.guardian.emergencyContact
  const relationship =
    form.guardian.type === 'other' ? 'guardian' : form.guardian.type

  const payload: RegisterStudentInAppRequest = {
    firstName: names.firstName,
    lastName: names.lastName,
    secondName: names.secondName,
    thirdName: names.thirdName,
    dateOfBirth,
    gender: (form.student.gender || 'male') as 'male' | 'female',
    address: composeAddress(form.address),
    emergencyContact: [emergency.fullName, emergency.mobile, emergency.relationship]
      .filter((part) => part.trim())
      .join(' · ') || undefined,
    medicalInfo: composeMedicalInfo(form.health),
    notes: composeNotes(form),
    nationality: form.student.nationality.trim() || undefined,
    studentId: form.student.idNumber.trim() || undefined,
    photo,
    groupId,
    createStudentUser,
    studentEmail: createStudentUser ? studentEmail.trim() : undefined,
  }

  if (selectedParent) {
    payload.parent = {
      existingParentId: Number(selectedParent.id),
      relationship,
    }
    return payload
  }

  if (form.guardian.type === 'other') {
    const org = form.guardian.otherInfo
    const responsible = splitFullName(org.responsiblePerson)
    payload.parent = {
      createNew: true,
      firstName: responsible.firstName || org.responsiblePerson.trim(),
      lastName: responsible.lastName || org.organizationName.trim() || responsible.firstName,
      phone: org.responsiblePhone.trim() || org.phone.trim() || undefined,
      createUser: false,
      relationship: 'guardian',
      organizationName: org.organizationName.trim() || undefined,
      responsiblePerson: org.responsiblePerson.trim() || undefined,
      responsiblePhone: org.responsiblePhone.trim() || undefined,
    }
    return payload
  }

  const info = form.guardian.type === 'mother' ? form.guardian.motherInfo : form.guardian.fatherInfo
  const parentNames = splitFullName(info.fullName)
  payload.parent = {
    createNew: true,
    firstName: parentNames.firstName,
    lastName: parentNames.lastName || parentNames.firstName,
    email: info.email.trim() || undefined,
    phone: info.mobile.trim() || undefined,
    createUser: createParentUser,
    relationship,
    tribe: info.tribe.trim() || undefined,
    workplace: info.workplace.trim() || undefined,
    workPhone: info.workPhone.trim() || undefined,
    maritalStatus: info.maritalStatus.trim() || undefined,
  }
  return payload
}

import type { Parent } from '@/services/parent.service'
import type {
  RegisterStudentInAppRequest,
  SaveStudentRegisterDraftParentsRequest,
  SaveStudentRegisterDraftRequest,
} from '@/services/student.service'
import { personFullName } from '@/utils/person-name'

export type StaffIntakeStudent = {
  fullName: string
  first_name_ar: string
  first_name_en: string
  secondName: string
  thirdName: string
  secondNameEn: string
  thirdNameEn: string
  last_name_ar: string
  last_name_en: string
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
  groupId: string
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
  first_name_ar: string
  first_name_en: string
  last_name_ar: string
  last_name_en: string
  civil_id: string
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

export type StaffIntakeDocuments = {
  parentIdDocuments: (File | string)[]
  birthCertificate: File | string | null
  childIdDocument: File | string | null
}

export type StaffIntakeForm = {
  student: StaffIntakeStudent
  academic: StaffIntakeAcademic
  health: StaffIntakeHealth
  guardian: StaffIntakeGuardian
  address: StaffIntakeAddress
  documents: StaffIntakeDocuments
}

function emptyPerson(): StaffIntakePerson {
  return {
    fullName: '',
    first_name_ar: '',
    first_name_en: '',
    last_name_ar: '',
    last_name_en: '',
    civil_id: '',
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
      first_name_ar: '',
      first_name_en: '',
      secondName: '',
      thirdName: '',
      secondNameEn: '',
      thirdNameEn: '',
      last_name_ar: '',
      last_name_en: '',
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
      groupId: '',
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
    documents: {
      parentIdDocuments: [],
      birthCertificate: null,
      childIdDocument: null,
    },
  }
}

export function composeBilingualFullName(person: {
  first_name_ar?: string
  secondName?: string
  thirdName?: string
  last_name_ar?: string
  first_name_en?: string
  secondNameEn?: string
  thirdNameEn?: string
  last_name_en?: string
}): string {
  const ar = [person.first_name_ar, person.secondName, person.thirdName, person.last_name_ar]
    .map((p) => (p ?? '').trim())
    .filter(Boolean)
    .join(' ')
  const en = [person.first_name_en, person.secondNameEn, person.thirdNameEn, person.last_name_en]
    .map((p) => (p ?? '').trim())
    .filter(Boolean)
    .join(' ')
  return ar || en
}

export function hasCompleteBilingualName(person: {
  first_name_ar?: string
  first_name_en?: string
  last_name_ar?: string
  last_name_en?: string
}): boolean {
  return Boolean(
    person.first_name_ar?.trim() &&
      person.first_name_en?.trim() &&
      person.last_name_ar?.trim() &&
      person.last_name_en?.trim(),
  )
}

function bilingualPayload(person: {
  first_name_ar?: string
  first_name_en?: string
  last_name_ar?: string
  last_name_en?: string
}) {
  const first_name_ar = person.first_name_ar?.trim() || ''
  const first_name_en = person.first_name_en?.trim() || ''
  const last_name_ar = person.last_name_ar?.trim() || ''
  const last_name_en = person.last_name_en?.trim() || ''
  return {
    first_name_ar,
    first_name_en,
    last_name_ar,
    last_name_en,
    firstName: first_name_ar || first_name_en,
    lastName: last_name_ar || last_name_en,
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
  if (form.student.religion.trim()) parts.push(`Religion: ${form.student.religion.trim()}`)
  if (form.student.hasSiblings) parts.push('Has siblings at school')
  if (form.academic.enrollmentStatus) parts.push(`Status: ${form.academic.enrollmentStatus}`)
  if (form.academic.gradeLevel.trim()) parts.push(`Grade: ${form.academic.gradeLevel.trim()}`)
  if (form.academic.previousSchool.trim()) {
    parts.push(`Previous school: ${form.academic.previousSchool.trim()}`)
  }
  return parts.length ? parts.join(' · ') : undefined
}

export function hasCompleteStudentIdentity(person: {
  first_name_ar?: string
  first_name_en?: string
  secondName?: string
  thirdName?: string
  secondNameEn?: string
  thirdNameEn?: string
  last_name_ar?: string
  last_name_en?: string
}): boolean {
  return Boolean(
    person.first_name_ar?.trim() &&
      person.secondName?.trim() &&
      person.thirdName?.trim() &&
      person.last_name_ar?.trim() &&
      person.first_name_en?.trim() &&
      person.secondNameEn?.trim() &&
      person.thirdNameEn?.trim() &&
      person.last_name_en?.trim(),
  )
}

function parentFullName(parent: Parent): string {
  return personFullName(parent, 'ar') || `${parent.firstName ?? ''} ${parent.lastName ?? ''}`.trim()
}

function applyPersonFromParent(info: StaffIntakePerson, parent: Parent): void {
  info.first_name_ar = parent.first_name_ar || parent.firstName || info.first_name_ar
  info.first_name_en = parent.first_name_en || info.first_name_en
  info.last_name_ar = parent.last_name_ar || parent.lastName || info.last_name_ar
  info.last_name_en = parent.last_name_en || info.last_name_en
  info.civil_id = parent.civil_id || info.civil_id
  info.fullName = composeBilingualFullName(info) || info.fullName
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
    applyPersonFromParent(next.motherInfo, parent)
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
    applyPersonFromParent(next.fatherInfo, parent)
    next.fatherInfo.mobile = parent.phone || next.fatherInfo.mobile
    next.fatherInfo.email = parent.email || next.fatherInfo.email
    next.fatherInfo.tribe = parent.tribe || next.fatherInfo.tribe
    next.fatherInfo.workplace = parent.workplace || next.fatherInfo.workplace
    next.fatherInfo.workPhone = parent.workPhone || next.fatherInfo.workPhone
    next.fatherInfo.maritalStatus = parent.maritalStatus || next.fatherInfo.maritalStatus
  }
  return next
}

export async function mapStaffIntakeToDraftRequest(options: {
  form: StaffIntakeForm
  draftStudentId?: string | null
}): Promise<SaveStudentRegisterDraftRequest> {
  const { form, draftStudentId } = options
  const names = bilingualPayload(form.student)
  const dateOfBirth = formatStaffIntakeDate(form.student.dateOfBirth)
  const photo = await fileToDataUrl(form.student.photo)
  const idNumber = form.student.idNumber.trim()
  const emergency = form.guardian.emergencyContact
  return {
    draftStudentId: draftStudentId || undefined,
    ...names,
    secondName: form.student.secondName.trim() || undefined,
    thirdName: form.student.thirdName.trim() || undefined,
    secondNameEn: form.student.secondNameEn.trim() || undefined,
    thirdNameEn: form.student.thirdNameEn.trim() || undefined,
    tribe: form.student.tribe.trim() || undefined,
    dateOfBirth,
    gender: (form.student.gender || 'male') as 'male' | 'female',
    nationality: form.student.nationality.trim() || undefined,
    studentId: idNumber || undefined,
    civil_id: idNumber || undefined,
    photo,
    notes: composeNotes(form),
    address: composeAddress(form.address),
    medicalInfo: composeMedicalInfo(form.health),
    emergencyContact: [emergency.fullName, emergency.mobile, emergency.relationship]
      .filter((part) => part.trim())
      .join(' · ') || undefined,
  }
}

export function mapStaffIntakeToDraftParentsRequest(options: {
  form: StaffIntakeForm
  draftStudentId: string
}): SaveStudentRegisterDraftParentsRequest {
  const { form, draftStudentId } = options
  const emergency = form.guardian.emergencyContact
  const parents: SaveStudentRegisterDraftParentsRequest['parents'] = []

  for (const role of ['father', 'mother'] as const) {
    const info = role === 'father' ? form.guardian.fatherInfo : form.guardian.motherInfo
    if (!hasCompleteBilingualName(info) && !info.civil_id?.trim()) continue
    if (!hasCompleteBilingualName(info)) continue
    parents.push({
      relationship: role,
      ...bilingualPayload(info),
      civil_id: info.civil_id.trim() || undefined,
      email: info.email.trim() || undefined,
      phone: info.mobile.trim() || undefined,
      tribe: info.tribe.trim() || undefined,
      workplace: info.workplace.trim() || undefined,
      workPhone: info.workPhone.trim() || undefined,
      maritalStatus: info.maritalStatus.trim() || undefined,
      createUser: form.guardian.type === role,
    })
  }

  return {
    draftStudentId,
    parents,
    emergencyContact: [emergency.fullName, emergency.mobile, emergency.relationship]
      .filter((part) => part.trim())
      .join(' · ') || undefined,
  }
}

export async function mapStaffIntakeToRegisterRequest(options: {
  form: StaffIntakeForm
  groupId: string
  selectedParent: Parent | null
  createParentUser: boolean
  createStudentUser: boolean
  studentEmail: string
  draftStudentId?: string | null
}): Promise<RegisterStudentInAppRequest> {
  const {
    form,
    groupId,
    selectedParent,
    createParentUser,
    createStudentUser,
    studentEmail,
    draftStudentId,
  } = options
  const names = bilingualPayload(form.student)
  const dateOfBirth = formatStaffIntakeDate(form.student.dateOfBirth)
  const photo = await fileToDataUrl(form.student.photo)
  const emergency = form.guardian.emergencyContact
  const relationship =
    form.guardian.type === 'other' ? 'guardian' : form.guardian.type

  const payload: RegisterStudentInAppRequest = {
    ...names,
    secondName: form.student.secondName.trim() || undefined,
    thirdName: form.student.thirdName.trim() || undefined,
    secondNameEn: form.student.secondNameEn.trim() || undefined,
    thirdNameEn: form.student.thirdNameEn.trim() || undefined,
    tribe: form.student.tribe.trim() || undefined,
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
    // The intake "Civil ID / Passport Number" also seeds the student's civil_id (used for the login).
    civil_id: form.student.idNumber.trim() || undefined,
    photo,
    groupId,
    draftStudentId: draftStudentId || undefined,
    createStudentUser,
    studentEmail: createStudentUser ? studentEmail.trim() : undefined,
  }

  if (selectedParent) {
    payload.parent = {
      existingParentId: String(selectedParent.id),
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
      first_name_ar: responsible.firstName || org.responsiblePerson.trim(),
      first_name_en: responsible.firstName || org.responsiblePerson.trim(),
      last_name_ar: responsible.lastName || org.organizationName.trim() || responsible.firstName,
      last_name_en: responsible.lastName || org.organizationName.trim() || responsible.firstName,
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
  payload.parent = {
    createNew: true,
    ...bilingualPayload(info),
    civil_id: info.civil_id.trim() || undefined,
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

function parseTaggedPart(raw: string, label: string): string {
  const re = new RegExp(`${label}:\\s*([^;]+)`, 'i')
  const m = raw.match(re)
  return m?.[1]?.trim() || ''
}

export function parseMedicalInfoToHealth(raw: string | null | undefined): StaffIntakeHealth {
  const text = (raw || '').trim()
  const allergiesDetails = parseTaggedPart(text, 'Allergies')
  const chronicDiseasesDetails = parseTaggedPart(text, 'Chronic')
  const surgeriesDetails = parseTaggedPart(text, 'Surgeries')
  const seizuresDetails = parseTaggedPart(text, 'Seizures')
  const known = [allergiesDetails, chronicDiseasesDetails, surgeriesDetails, seizuresDetails]
    .filter(Boolean)
    .join('; ')
  let other = text
  for (const label of ['Allergies', 'Chronic', 'Surgeries', 'Seizures']) {
    other = other.replace(new RegExp(`${label}:\\s*[^;]+;?\\s*`, 'ig'), '')
  }
  other = other.replace(/^;\s*|;\s*$/g, '').trim()
  if (!text) {
    return {
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
    }
  }
  // Unstructured medicalInfo (legacy edit textarea) → other
  if (!known && text) {
    return {
      allergies: false,
      allergiesDetails: '',
      seizures: false,
      seizuresDetails: '',
      surgeries: false,
      surgeriesDetails: '',
      chronicDiseases: false,
      chronicDiseasesDetails: '',
      other: text,
      medicalReports: [],
    }
  }
  return {
    allergies: !!allergiesDetails,
    allergiesDetails,
    seizures: !!seizuresDetails,
    seizuresDetails,
    surgeries: !!surgeriesDetails,
    surgeriesDetails,
    chronicDiseases: !!chronicDiseasesDetails,
    chronicDiseasesDetails,
    other,
    medicalReports: [],
  }
}

export function parseAddressString(raw: string | null | undefined): StaffIntakeAddress {
  const text = (raw || '').trim()
  if (!text || text === '-') {
    return {
      area: '',
      village: '',
      landmark: '',
      streetNumber: '',
      alleyNumber: '',
      buildingNumber: '',
      housingType: 'house',
    }
  }
  const parts = text.split(',').map((p) => p.trim()).filter(Boolean)
  const housing =
    parts[parts.length - 1] === 'apartment' || parts[parts.length - 1] === 'house'
      ? (parts.pop() as 'house' | 'apartment')
      : 'house'
  return {
    area: parts[0] || '',
    village: parts[1] || '',
    landmark: parts[2] || '',
    streetNumber: parts[3] || '',
    alleyNumber: parts[4] || '',
    buildingNumber: parts[5] || '',
    housingType: housing,
  }
}

function parseNotesMeta(notes: string | null | undefined): {
  religion: string
  hasSiblings: boolean
  enrollmentStatus: 'new' | 'transfer'
  gradeLevel: string
  previousSchool: string
} {
  const parts = (notes || '').split(' · ').map((p) => p.trim()).filter(Boolean)
  let religion = ''
  let hasSiblings = false
  let enrollmentStatus: 'new' | 'transfer' = 'new'
  let gradeLevel = ''
  let previousSchool = ''
  for (const part of parts) {
    if (part.startsWith('Religion:')) religion = part.slice('Religion:'.length).trim()
    else if (part === 'Has siblings at school') hasSiblings = true
    else if (part.startsWith('Status:')) {
      const s = part.slice('Status:'.length).trim()
      enrollmentStatus = s === 'transfer' ? 'transfer' : 'new'
    } else if (part.startsWith('Grade:')) gradeLevel = part.slice('Grade:'.length).trim()
    else if (part.startsWith('Previous school:')) {
      previousSchool = part.slice('Previous school:'.length).trim()
    }
  }
  return { religion, hasSiblings, enrollmentStatus, gradeLevel, previousSchool }
}

function parseEmergencyContact(raw: string | null | undefined): StaffIntakeGuardian['emergencyContact'] {
  const parts = (raw || '').split(' · ').map((p) => p.trim())
  return {
    fullName: parts[0] || '',
    tribe: '',
    workplace: '',
    workPhone: '',
    mobile: parts[1] || '',
    relationship: parts[2] || '',
  }
}

/** Fill a staff-intake form from an existing student (+ linked parents). */
export function applyStudentToStaffIntakeForm(
  student: {
    firstName?: string
    lastName?: string
    first_name_ar?: string | null
    first_name_en?: string | null
    last_name_ar?: string | null
    last_name_en?: string | null
    secondName?: string | null
    thirdName?: string | null
    secondNameEn?: string | null
    thirdNameEn?: string | null
    tribe?: string | null
    civil_id?: string | null
    studentId?: string | null
    gender?: string
    nationality?: string | null
    dateOfBirth?: string | Date
    photo?: string | null
    notes?: string | null
    medicalInfo?: string | null
    address?: string | null
    emergencyContact?: string | null
    paymentLevel?: { code?: string } | null
    groups?: Array<{ id: string; level?: { code?: string } | null }> | null
    parents?: Parent[] | null
  },
  form: StaffIntakeForm = createEmptyStaffIntakeForm(),
): StaffIntakeForm {
  const meta = parseNotesMeta(student.notes)
  const gradeFromLevel =
    student.paymentLevel?.code ||
    student.groups?.[0]?.level?.code ||
    meta.gradeLevel ||
    ''

  form.student = {
    ...form.student,
    first_name_ar: student.first_name_ar || student.firstName || '',
    first_name_en: student.first_name_en || '',
    secondName: student.secondName || '',
    thirdName: student.thirdName || '',
    secondNameEn: student.secondNameEn || '',
    thirdNameEn: student.thirdNameEn || '',
    last_name_ar: student.last_name_ar || student.lastName || '',
    last_name_en: student.last_name_en || '',
    tribe: student.tribe || '',
    idNumber: student.civil_id || student.studentId || '',
    gender: (student.gender === 'female' ? 'female' : 'male'),
    nationality: student.nationality || '',
    religion: meta.religion,
    dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
    age: null,
    hasSiblings: meta.hasSiblings,
    photo: student.photo || null,
    fullName: '',
  }
  form.student.fullName =
    composeBilingualFullName(form.student) ||
    `${form.student.first_name_ar} ${form.student.last_name_ar}`.trim()

  form.academic = {
    enrollmentStatus: meta.enrollmentStatus,
    gradeLevel: gradeFromLevel,
    groupId: student.groups?.[0]?.id || '',
    previousSchool: meta.previousSchool,
  }

  form.health = parseMedicalInfoToHealth(student.medicalInfo)
  form.address = parseAddressString(student.address)
  form.guardian.emergencyContact = parseEmergencyContact(student.emergencyContact)

  const parents = student.parents || []
  const father = parents.find((p) => p.relationship === 'father')
  const mother = parents.find((p) => p.relationship === 'mother')
  const guardianRow = parents.find((p) => p.relationship === 'guardian')

  if (father) {
    form.guardian = applyParentToGuardian({ ...form.guardian, type: 'father' }, father)
  }
  if (mother) {
    form.guardian = applyParentToGuardian({ ...form.guardian, type: 'mother' }, mother)
  }
  if (father) {
    form.guardian.type = 'father'
  } else if (mother) {
    form.guardian.type = 'mother'
  } else if (guardianRow) {
    form.guardian = applyParentToGuardian({ ...form.guardian, type: 'other' }, guardianRow)
    form.guardian.type = 'other'
  }

  return form
}

export async function mapStaffIntakeToStudentUpdate(form: StaffIntakeForm): Promise<{
  firstName: string
  lastName: string
  first_name_ar: string
  first_name_en: string
  last_name_ar: string
  last_name_en: string
  secondName?: string
  thirdName?: string
  secondNameEn?: string | null
  thirdNameEn?: string | null
  tribe?: string | null
  dateOfBirth: string
  gender: 'male' | 'female'
  nationality?: string
  civil_id?: string | null
  studentId?: string
  photo?: string
  notes?: string
  address: string
  medicalInfo?: string
  emergencyContact?: string
}> {
  const names = bilingualPayload(form.student)
  const photo = await fileToDataUrl(form.student.photo)
  const idNumber = form.student.idNumber.trim()
  const emergency = form.guardian.emergencyContact
  return {
    ...names,
    secondName: form.student.secondName.trim() || undefined,
    thirdName: form.student.thirdName.trim() || undefined,
    secondNameEn: form.student.secondNameEn.trim() || null,
    thirdNameEn: form.student.thirdNameEn.trim() || null,
    tribe: form.student.tribe.trim() || null,
    dateOfBirth: formatStaffIntakeDate(form.student.dateOfBirth),
    gender: (form.student.gender || 'male') as 'male' | 'female',
    nationality: form.student.nationality.trim() || undefined,
    civil_id: idNumber || null,
    studentId: idNumber || undefined,
    photo,
    notes: composeNotes(form),
    address: composeAddress(form.address),
    medicalInfo: composeMedicalInfo(form.health),
    emergencyContact: [emergency.fullName, emergency.mobile, emergency.relationship]
      .filter((part) => part.trim())
      .join(' · ') || undefined,
  }
}

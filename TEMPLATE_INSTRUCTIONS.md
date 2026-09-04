# Form Template Instructions

To use docxtemplater with the form.docx, you need to replace the underlined fields with template variables in curly braces.

## Required Template Variables to Add to form.docx:

**Student Information:**
- Replace student name field with: `{fullName}`
- Replace tribe field with: `{tribe}`
- Replace ID number field with: `{idNumber}`
- Replace gender checkboxes with: `{gender_male}` and `{gender_female}`
- Replace nationality field with: `{nationality}`
- Replace religion field with: `{religion}`

**Birth Date:**
- Replace day field with: `{birth_day}`
- Replace month field with: `{birth_month}`
- Replace year field with: `{birth_year}`
- Replace age field with: `{age}`

**Siblings:**
- Replace "Yes" checkbox with: `{hasSiblings_yes}`
- Replace "No" checkbox with: `{hasSiblings_no}`

**Academic Information:**
- Replace "New" checkbox with: `{enrollmentStatus_new}`
- Replace "Transfer" checkbox with: `{enrollmentStatus_transfer}`
- Replace grade level field with: `{gradeLevel}`
- Replace previous school field with: `{previousSchool}`

**Health Information:**
- Replace allergy checkbox with: `{allergies}`
- Replace seizure checkbox with: `{seizures}`
- Replace surgery checkbox with: `{surgeriesgit }`
- Replace chronic disease checkbox with: `{chronicDiseases}`
- Replace other health field with: `{otherHealthInfo}`
vqergq2
**Guardian Information:**
- Replace guardian type checkboxes with: `{guardianType_father}`, `{guardianType_mother}`, `{guardianType_other}`

**Father Details:**
- Replace father name with: `{fatherFullName}`
- Replace father tribe with: `{fatherTribe}`
- Replace father workplace with: `{fatherWorkplace}`
- Replace father work phone with: `{fatherWorkPhone}`
- Replace father mobile with: `{fatherMobile}`
- Replace father email with: `{fatherEmail}`
- Replace father marital status with: `{fatherMaritalStatus}`

**Mother Details:**
- Replace mother name with: `{motherFullName}`
- Replace mother tribe with: `{motherTribe}`
- Replace mother workplace with: `{motherWorkplace}`
- Replace mother work phone with: `{motherWorkPhone}`
- Replace mother mobile with: `{motherMobile}`
- Replace mother email with: `{motherEmail}`
- Replace mother marital status with: `{motherMaritalStatus}`

**Emergency Contact:**
- Replace emergency contact name with: `{emergencyContactName}`
- Replace emergency contact tribe with: `{emergencyContactTribe}`
- Replace emergency contact workplace with: `{emergencyContactWorkplace}`
- Replace emergency contact work phone with: `{emergencyContactWorkPhone}`
- Replace emergency contact mobile with: `{emergencyContactMobile}`
- Replace emergency contact relationship with: `{emergencyContactRelationship}`

**Address:**
- Replace area/state with: `{area}`
- Replace village with: `{village}`
- Replace landmark with: `{landmark}`
- Replace street number with: `{streetNumber}`
- Replace alley number with: `{alleyNumber}`
- Replace building number with: `{buildingNumber}`
- Replace housing type checkboxes with: `{housingType_house}`, `{housingType_apartment}`

**Signature:**
- Replace guardian name in signature section with: `{guardianName}`
- Replace current date with: `{currentDate}`
- Replace registration date with: `{registrationDate}`

## Instructions:
1. Open form.docx in Microsoft Word
2. Find each underlined field and replace with the corresponding template variable
3. For checkboxes, place the template variable where you want "X" to appear when selected
4. Save the document as form.docx
5. The backend will automatically fill these variables with actual enrollment data
import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import * as Docxtemplater from 'docxtemplater';
import * as PizZip from 'pizzip';

@Injectable()
export class DocumentGeneratorService {
  private templatePath = path.join(process.cwd(), '..', 'form.docx');

  async generateEnrollmentForm(enrollment: any): Promise<Buffer> {
    try {
      // Read the template file
      const content = fs.readFileSync(this.templatePath, 'binary');
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Prepare data for template
      const templateData = this.prepareTemplateData(enrollment);

      // Set the template variables
      doc.setData(templateData);

      try {
        doc.render();
      } catch (error) {
        console.error('Template rendering error:', error);
        throw new Error(`Template rendering failed: ${error.message}`);
      }

      // Generate the document buffer
      const buf = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
      });

      return buf;
    } catch (error) {
      console.error('Document generation error:', error);
      throw new Error(`Document generation failed: ${error.message}`);
    }
  }

  private prepareTemplateData(enrollment: any) {
    // Format date helper
    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-AE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // Format birth date components
    const formatBirthDate = (dateString: string, part: 'day' | 'month' | 'year') => {
      if (!dateString) return '';
      const date = new Date(dateString);
      switch (part) {
        case 'day':
          return date.getDate().toString().padStart(2, '0');
        case 'month':
          return (date.getMonth() + 1).toString().padStart(2, '0');
        case 'year':
          return date.getFullYear().toString();
        default:
          return '';
      }
    };

    return {
      // Student Information
      fullName: enrollment.fullName || '',
      tribe: enrollment.tribe || '',
      idNumber: enrollment.idNumber || '',
      gender_male: enrollment.gender === 'male' ? 'X' : '',
      gender_female: enrollment.gender === 'female' ? 'X' : '',
      nationality: enrollment.nationality || '',
      religion: enrollment.religion || '',

      // Birth date
      birth_day: formatBirthDate(enrollment.dateOfBirth, 'day'),
      birth_month: formatBirthDate(enrollment.dateOfBirth, 'month'),
      birth_year: formatBirthDate(enrollment.dateOfBirth, 'year'),
      age: enrollment.age || '',

      // Siblings
      hasSiblings_yes: enrollment.hasSiblings ? 'X' : '',
      hasSiblings_no: !enrollment.hasSiblings ? 'X' : '',

      // Academic Information
      enrollmentStatus_new: enrollment.enrollmentStatus === 'new' ? 'X' : '',
      enrollmentStatus_transfer: enrollment.enrollmentStatus === 'transfer' ? 'X' : '',
      gradeLevel: enrollment.gradeLevel || '',
      previousSchool: enrollment.previousSchool || '',

      // Health Information
      allergies: enrollment.allergies ? 'X' : '',
      seizures: enrollment.seizures ? 'X' : '',
      surgeries: enrollment.surgeries ? 'X' : '',
      chronicDiseases: enrollment.chronicDiseases ? 'X' : '',
      otherHealthInfo: enrollment.otherHealthInfo || '',
      allergiesDetails: enrollment.allergiesDetails || '',
      seizuresDetails: enrollment.seizuresDetails || '',
      surgeriesDetails: enrollment.surgeriesDetails || '',
      chronicDiseasesDetails: enrollment.chronicDiseasesDetails || '',

      // Guardian Information
      guardianType_father: enrollment.guardianType === 'father' ? 'X' : '',
      guardianType_mother: enrollment.guardianType === 'mother' ? 'X' : '',
      guardianType_other: enrollment.guardianType === 'other' ? 'X' : '',

      // Father Details
      fatherFullName: enrollment.fatherFullName || '',
      fatherTribe: enrollment.fatherTribe || '',
      fatherWorkplace: enrollment.fatherWorkplace || '',
      fatherWorkPhone: enrollment.fatherWorkPhone || '',
      fatherMobile: enrollment.fatherMobile || '',
      fatherEmail: enrollment.fatherEmail || '',
      fatherMaritalStatus: enrollment.fatherMaritalStatus || '',

      // Mother Details
      motherFullName: enrollment.motherFullName || '',
      motherTribe: enrollment.motherTribe || '',
      motherWorkplace: enrollment.motherWorkplace || '',
      motherWorkPhone: enrollment.motherWorkPhone || '',
      motherMobile: enrollment.motherMobile || '',
      motherEmail: enrollment.motherEmail || '',
      motherMaritalStatus: enrollment.motherMaritalStatus || '',

      // Organization Details (if guardian type is other)
      organizationName: enrollment.organizationName || '',
      organizationPhone: enrollment.organizationPhone || '',
      responsiblePerson: enrollment.responsiblePerson || '',
      responsiblePhone: enrollment.responsiblePhone || '',

      // Emergency Contact
      emergencyContactName: enrollment.emergencyContactName || '',
      emergencyContactTribe: enrollment.emergencyContactTribe || '',
      emergencyContactWorkplace: enrollment.emergencyContactWorkplace || '',
      emergencyContactWorkPhone: enrollment.emergencyContactWorkPhone || '',
      emergencyContactMobile: enrollment.emergencyContactMobile || '',
      emergencyContactRelationship: enrollment.emergencyContactRelationship || '',

      // Address Information
      area: enrollment.area || '',
      village: enrollment.village || '',
      landmark: enrollment.landmark || '',
      streetNumber: enrollment.streetNumber || '',
      alleyNumber: enrollment.alleyNumber || '',
      buildingNumber: enrollment.buildingNumber || '',
      housingType_house: enrollment.housingType === 'house' ? 'X' : '',
      housingType_apartment: enrollment.housingType === 'apartment' ? 'X' : '',

      // Guardian name for signature
      guardianName: enrollment.guardianType === 'father' ? enrollment.fatherFullName :
                   enrollment.guardianType === 'mother' ? enrollment.motherFullName :
                   enrollment.responsiblePerson || '',

      // Current date for printing
      currentDate: formatDate(new Date().toISOString()),
      registrationDate: formatDate(enrollment.createdAt),
    };
  }
}
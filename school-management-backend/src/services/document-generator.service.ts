import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';

@Injectable()
export class DocumentGeneratorService {
  private templatePath = path.join(process.cwd(), 'assets/form.docx');

  async generateEnrollmentForm(enrollment: any): Promise<Buffer> {
    try {
      // Check if original template file exists
      if (!fs.existsSync(this.templatePath)) {
        console.log('Original template not found, using programmatic generation');
        return this.generateSimpleTemplate(enrollment);
      }

      console.log('Using original form.docx as template with variable replacement');

      // Read the original form.docx file as a buffer
      const templateContent = fs.readFileSync(this.templatePath);

      // Create a new PizZip instance from the template
      const zip = new PizZip(templateContent);

      // Create a Docxtemplater instance
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Prepare template data with enrollment information
      const templateData = this.prepareTemplateData(enrollment);

      try {
        // Set the template data and render the document
        doc.render(templateData);
      } catch (error) {
        console.error('Error during template rendering:', error);
        throw error;
      }

      // Generate the document buffer
      const buffer = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
      });

      console.log('Template variables replaced successfully, document size:', buffer.length, 'bytes');
      return buffer;

    } catch (error) {
      console.error('Document generation error:', error);
      console.log('Falling back to programmatic generation');
      return this.generateSimpleTemplate(enrollment);
    }
  }

  private generateSimpleTemplate(enrollment: any): Buffer {
    // Create a minimal Word document structure using PizZip
    const zip = new PizZip();

    // Create document.xml content with enrollment data
    const documentXml = this.createDocumentXml(enrollment);

    // Add required files to the zip
    zip.file('word/document.xml', documentXml);
    zip.file('[Content_Types].xml', this.getContentTypesXml());
    zip.file('_rels/.rels', this.getRelationshipsXml());
    zip.file('word/_rels/document.xml.rels', this.getDocumentRelsXml());

    // Generate the buffer
    return zip.generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
  }

  private createDocumentXml(enrollment: any): string {
    const templateData = this.prepareTemplateData(enrollment);

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml">
  <w:body>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t>نموذج تسجيل الطالب</w:t></w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>

    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>بيانات الطالب:</w:t></w:r></w:p>
    <w:p><w:r><w:t>الاسم الكامل: ${templateData.fullName || 'غير محدد'}</w:t></w:r></w:p>
    <w:p><w:r><w:t>القبيلة: ${templateData.tribe || 'غير محدد'}</w:t></w:r></w:p>
    <w:p><w:r><w:t>رقم الهوية: ${templateData.idNumber || 'غير محدد'}</w:t></w:r></w:p>
    <w:p><w:r><w:t>الجنس: ${enrollment.gender === 'male' ? 'ذكر' : enrollment.gender === 'female' ? 'أنثى' : 'غير محدد'}</w:t></w:r></w:p>
    <w:p><w:r><w:t>الجنسية: ${templateData.nationality || 'غير محدد'}</w:t></w:r></w:p>
    <w:p><w:r><w:t>الديانة: ${templateData.religion || 'غير محدد'}</w:t></w:r></w:p>
    <w:p><w:r><w:t>العمر: ${templateData.age || 'غير محدد'}</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>

    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>معلومات ولي الأمر:</w:t></w:r></w:p>
    <w:p><w:r><w:t>اسم الأب: ${templateData.fatherFullName || 'غير محدد'}</w:t></w:r></w:p>
    <w:p><w:r><w:t>جوال الأب: ${templateData.fatherMobile || 'غير محدد'}</w:t></w:r></w:p>
    <w:p><w:r><w:t>اسم الأم: ${templateData.motherFullName || 'غير محدد'}</w:t></w:r></w:p>
    <w:p><w:r><w:t>جوال الأم: ${templateData.motherMobile || 'غير محدد'}</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>

    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>العنوان:</w:t></w:r></w:p>
    <w:p><w:r><w:t>المنطقة: ${templateData.area || 'غير محدد'}</w:t></w:r></w:p>
    <w:p><w:r><w:t>القرية: ${templateData.village || 'غير محدد'}</w:t></w:r></w:p>
    <w:p><w:r><w:t>العلامة المميزة: ${templateData.landmark || 'غير محدد'}</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>

    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>تواريخ:</w:t></w:r></w:p>
    <w:p><w:r><w:t>تاريخ التسجيل: ${templateData.registrationDate || 'غير محدد'}</w:t></w:r></w:p>
    <w:p><w:r><w:t>تاريخ الطباعة: ${templateData.currentDate}</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>

    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:t>روضة زينة الحياء للأطفال</w:t></w:r>
    </w:p>

    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;
  }

  private getContentTypesXml(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;
  }

  private getRelationshipsXml(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
  }

  private getDocumentRelsXml(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;
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

    // Calculate precise age in years/months/days
    const calculateAge = (dateOfBirth: string) => {
      if (!dateOfBirth) {
        console.log('No dateOfBirth provided');
        return {
          years: '0', months: '0', days: '0',
          yearsNumber: 0, monthsNumber: 0, daysNumber: 0,
          formatted: 'غير محدد'
        };
      }

      console.log('Calculating age for dateOfBirth:', dateOfBirth);
      const birthDate = new Date(dateOfBirth);
      const today = new Date();

      if (isNaN(birthDate.getTime())) {
        console.log('Invalid dateOfBirth:', dateOfBirth);
        return {
          years: '0', months: '0', days: '0',
          yearsNumber: 0, monthsNumber: 0, daysNumber: 0,
          formatted: 'تاريخ غير صحيح'
        };
      }

      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      let days = today.getDate() - birthDate.getDate();

      // Adjust for negative days
      if (days < 0) {
        months--;
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += lastMonth.getDate();
      }

      // Adjust for negative months
      if (months < 0) {
        years--;
        months += 12;
      }

      const yearsStr = years > 0 ? `${years} سنة` : '';
      const monthsStr = months > 0 ? `${months} شهر` : '';
      const daysStr = days > 0 ? `${days} يوم` : '';

      const parts = [yearsStr, monthsStr, daysStr].filter(Boolean);
      const formatted = parts.join(' و ') || 'حديث الولادة';

      return {
        years: years.toString(),
        months: months.toString(),
        days: days.toString(),
        yearsNumber: years,
        monthsNumber: months,
        daysNumber: days,
        formatted: formatted
      };
    };

    const ageData = calculateAge(enrollment.dateOfBirth || '2018-05-15');

    console.log('Template data prepared - age data:', ageData);
    console.log('enrollment.dateOfBirth:', enrollment.dateOfBirth);

    return {
      // Student Information
      fullName: enrollment.fullName || '',
      tribe: enrollment.tribe || '',
      idNumber: enrollment.idNumber || '',
      // Gender checkboxes - use ☒ for checked, ☐ for unchecked
      gender_male: enrollment.gender === 'male' ? '☒' : '☐',
      gender_female: enrollment.gender === 'female' ? '☒' : '☐',
      nationality: enrollment.nationality || '',
      religion: enrollment.religion || '',

      // Birth date
      birth_day: formatBirthDate(enrollment.dateOfBirth || '2018-05-15', 'day'),
      birth_month: formatBirthDate(enrollment.dateOfBirth || '2018-05-15', 'month'),
      birth_year: formatBirthDate(enrollment.dateOfBirth || '2018-05-15', 'year'),
      dateOfBirth: enrollment.dateOfBirth || '2018-05-15',

      // Age in multiple formats
      age: ageData.formatted,
      age_years: ageData.years,
      age_months: ageData.months,
      age_days: ageData.days,
      // Just the numbers for individual use
      years: ageData.yearsNumber || '0',
      months: ageData.monthsNumber || '0',
      days: ageData.daysNumber || '0',
      ageYearsOnly: ageData.yearsNumber || '0',
      ageMonthsOnly: ageData.monthsNumber || '0',
      ageDaysOnly: ageData.daysNumber || '0',

      // Siblings - separate yes/no checkboxes
      hasSiblings: enrollment.hasSiblings ? '☒' : '☐',
      hasSiblings_yes: enrollment.hasSiblings ? '☒' : '☐',
      hasSiblings_no: enrollment.hasSiblings ? '☐' : '☒',

      // Academic Information
      enrollmentStatus_new: enrollment.enrollmentStatus === 'new' ? '☒' : '☐',
      enrollmentStatus_transfer: enrollment.enrollmentStatus === 'transfer' ? '☒' : '☐',
      gradeLevel: enrollment.gradeLevel || '',
      previousSchool: enrollment.previousSchool || '',

      // Health Information - single checkbox per field
      allergies: enrollment.allergies ? '☒' : '☐',
      seizures: enrollment.seizures ? '☒' : '☐',
      surgeries: enrollment.surgeries ? '☒' : '☐',
      chronicDiseases: enrollment.chronicDiseases ? '☒' : '☐',

      // Direct enrollment field references for template
      'enrollment.allergies': enrollment.allergies ? '☒' : '☐',
      'enrollment.seizures': enrollment.seizures ? '☒' : '☐',
      'enrollment.surgeries': enrollment.surgeries ? '☒' : '☐',
      'enrollment.chronicDiseases': enrollment.chronicDiseases ? '☒' : '☐',

      // Other health info checkbox and details
      otherHealthInfo: enrollment.otherHealthInfo || '',
      hasOtherHealthInfo: enrollment.otherHealthInfo ? '☒' : '☐',
      'enrollment.hasOtherHealthInfo': enrollment.otherHealthInfo ? '☒' : '☐',
      'enrollment.otherHealthInfo': enrollment.otherHealthInfo || '',
      allergiesDetails: enrollment.allergiesDetails || '',
      seizuresDetails: enrollment.seizuresDetails || '',
      surgeriesDetails: enrollment.surgeriesDetails || '',
      chronicDiseasesDetails: enrollment.chronicDiseasesDetails || '',

      // Guardian Information
      guardianType_father: enrollment.guardianType === 'father' ? '☒' : '☐',
      guardianType_mother: enrollment.guardianType === 'mother' ? '☒' : '☐',
      guardianType_other: enrollment.guardianType === 'other' ? '☒' : '☐',

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
      housingType_house: enrollment.housingType === 'house' ? '☒' : '☐',
      housingType_apartment: enrollment.housingType === 'apartment' ? '☒' : '☐',

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
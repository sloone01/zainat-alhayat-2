import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../entities/enrollment.entity';
import { CreateEnrollmentDto, UpdateEnrollmentDto } from '../dto/enrollment.dto';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    const enrollment = new Enrollment();

    // Map student information
    enrollment.fullName = createEnrollmentDto.student.fullName;
    enrollment.tribe = createEnrollmentDto.student.tribe;
    enrollment.idNumber = createEnrollmentDto.student.idNumber;
    enrollment.gender = createEnrollmentDto.student.gender;
    enrollment.nationality = createEnrollmentDto.student.nationality;
    enrollment.religion = createEnrollmentDto.student.religion;
    enrollment.dateOfBirth = createEnrollmentDto.student.dateOfBirth;
    enrollment.age = createEnrollmentDto.student.age;
    enrollment.hasSiblings = createEnrollmentDto.student.hasSiblings || false;
    enrollment.photo = createEnrollmentDto.student.photo;

    // Map academic information
    enrollment.enrollmentStatus = createEnrollmentDto.academic.enrollmentStatus;
    enrollment.gradeLevel = createEnrollmentDto.academic.gradeLevel;
    enrollment.previousSchool = createEnrollmentDto.academic.previousSchool;

    // Map health information
    enrollment.allergies = createEnrollmentDto.health.allergies || false;
    enrollment.allergiesDetails = createEnrollmentDto.health.allergiesDetails;
    enrollment.seizures = createEnrollmentDto.health.seizures || false;
    enrollment.seizuresDetails = createEnrollmentDto.health.seizuresDetails;
    enrollment.surgeries = createEnrollmentDto.health.surgeries || false;
    enrollment.surgeriesDetails = createEnrollmentDto.health.surgeriesDetails;
    enrollment.chronicDiseases = createEnrollmentDto.health.chronicDiseases || false;
    enrollment.chronicDiseasesDetails = createEnrollmentDto.health.chronicDiseasesDetails;
    enrollment.otherHealthInfo = createEnrollmentDto.health.other;
    enrollment.medicalReports = createEnrollmentDto.health.medicalReports;

    // Map guardian information
    enrollment.guardianType = createEnrollmentDto.guardian.type;

    // Map father info
    if (createEnrollmentDto.guardian.fatherInfo) {
      enrollment.fatherFullName = createEnrollmentDto.guardian.fatherInfo.fullName;
      enrollment.fatherTribe = createEnrollmentDto.guardian.fatherInfo.tribe;
      enrollment.fatherWorkplace = createEnrollmentDto.guardian.fatherInfo.workplace;
      enrollment.fatherWorkPhone = createEnrollmentDto.guardian.fatherInfo.workPhone;
      enrollment.fatherMobile = createEnrollmentDto.guardian.fatherInfo.mobile;
      enrollment.fatherEmail = createEnrollmentDto.guardian.fatherInfo.email;
      enrollment.fatherMaritalStatus = createEnrollmentDto.guardian.fatherInfo.maritalStatus;
    }

    // Map mother info
    if (createEnrollmentDto.guardian.motherInfo) {
      enrollment.motherFullName = createEnrollmentDto.guardian.motherInfo.fullName;
      enrollment.motherTribe = createEnrollmentDto.guardian.motherInfo.tribe;
      enrollment.motherWorkplace = createEnrollmentDto.guardian.motherInfo.workplace;
      enrollment.motherWorkPhone = createEnrollmentDto.guardian.motherInfo.workPhone;
      enrollment.motherMobile = createEnrollmentDto.guardian.motherInfo.mobile;
      enrollment.motherEmail = createEnrollmentDto.guardian.motherInfo.email;
      enrollment.motherMaritalStatus = createEnrollmentDto.guardian.motherInfo.maritalStatus;
    }

    // Map other guardian info
    if (createEnrollmentDto.guardian.otherInfo) {
      enrollment.organizationName = createEnrollmentDto.guardian.otherInfo.organizationName;
      enrollment.organizationPhone = createEnrollmentDto.guardian.otherInfo.phone;
      enrollment.responsiblePerson = createEnrollmentDto.guardian.otherInfo.responsiblePerson;
      enrollment.responsiblePhone = createEnrollmentDto.guardian.otherInfo.responsiblePhone;
    }

    // Map emergency contact
    if (createEnrollmentDto.guardian.emergencyContact) {
      enrollment.emergencyContactName = createEnrollmentDto.guardian.emergencyContact.fullName;
      enrollment.emergencyContactTribe = createEnrollmentDto.guardian.emergencyContact.tribe;
      enrollment.emergencyContactWorkplace = createEnrollmentDto.guardian.emergencyContact.workplace;
      enrollment.emergencyContactWorkPhone = createEnrollmentDto.guardian.emergencyContact.workPhone;
      enrollment.emergencyContactMobile = createEnrollmentDto.guardian.emergencyContact.mobile;
      enrollment.emergencyContactRelationship = createEnrollmentDto.guardian.emergencyContact.relationship;
    }

    // Map address information
    enrollment.area = createEnrollmentDto.address.area;
    enrollment.village = createEnrollmentDto.address.village;
    enrollment.landmark = createEnrollmentDto.address.landmark;
    enrollment.streetNumber = createEnrollmentDto.address.streetNumber;
    enrollment.alleyNumber = createEnrollmentDto.address.alleyNumber;
    enrollment.buildingNumber = createEnrollmentDto.address.buildingNumber;
    enrollment.housingType = createEnrollmentDto.address.housingType;

    // Set initial status
    enrollment.status = 'pending';

    return this.enrollmentRepository.save(enrollment);
  }

  async findAll(): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id }
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    return enrollment;
  }

  async update(id: string, updateEnrollmentDto: UpdateEnrollmentDto): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    // Update student information
    if (updateEnrollmentDto.student) {
      Object.assign(enrollment, updateEnrollmentDto.student);
    }

    // Update academic information
    if (updateEnrollmentDto.academic) {
      Object.assign(enrollment, updateEnrollmentDto.academic);
    }

    // Update health information
    if (updateEnrollmentDto.health) {
      enrollment.allergies = updateEnrollmentDto.health.allergies ?? enrollment.allergies;
      enrollment.allergiesDetails = updateEnrollmentDto.health.allergiesDetails ?? enrollment.allergiesDetails;
      enrollment.seizures = updateEnrollmentDto.health.seizures ?? enrollment.seizures;
      enrollment.seizuresDetails = updateEnrollmentDto.health.seizuresDetails ?? enrollment.seizuresDetails;
      enrollment.surgeries = updateEnrollmentDto.health.surgeries ?? enrollment.surgeries;
      enrollment.surgeriesDetails = updateEnrollmentDto.health.surgeriesDetails ?? enrollment.surgeriesDetails;
      enrollment.chronicDiseases = updateEnrollmentDto.health.chronicDiseases ?? enrollment.chronicDiseases;
      enrollment.chronicDiseasesDetails = updateEnrollmentDto.health.chronicDiseasesDetails ?? enrollment.chronicDiseasesDetails;
      enrollment.otherHealthInfo = updateEnrollmentDto.health.other ?? enrollment.otherHealthInfo;
      enrollment.medicalReports = updateEnrollmentDto.health.medicalReports ?? enrollment.medicalReports;
    }

    // Update guardian information
    if (updateEnrollmentDto.guardian) {
      enrollment.guardianType = updateEnrollmentDto.guardian.type ?? enrollment.guardianType;

      if (updateEnrollmentDto.guardian.fatherInfo) {
        enrollment.fatherFullName = updateEnrollmentDto.guardian.fatherInfo.fullName ?? enrollment.fatherFullName;
        enrollment.fatherTribe = updateEnrollmentDto.guardian.fatherInfo.tribe ?? enrollment.fatherTribe;
        enrollment.fatherWorkplace = updateEnrollmentDto.guardian.fatherInfo.workplace ?? enrollment.fatherWorkplace;
        enrollment.fatherWorkPhone = updateEnrollmentDto.guardian.fatherInfo.workPhone ?? enrollment.fatherWorkPhone;
        enrollment.fatherMobile = updateEnrollmentDto.guardian.fatherInfo.mobile ?? enrollment.fatherMobile;
        enrollment.fatherEmail = updateEnrollmentDto.guardian.fatherInfo.email ?? enrollment.fatherEmail;
        enrollment.fatherMaritalStatus = updateEnrollmentDto.guardian.fatherInfo.maritalStatus ?? enrollment.fatherMaritalStatus;
      }

      if (updateEnrollmentDto.guardian.motherInfo) {
        enrollment.motherFullName = updateEnrollmentDto.guardian.motherInfo.fullName ?? enrollment.motherFullName;
        enrollment.motherTribe = updateEnrollmentDto.guardian.motherInfo.tribe ?? enrollment.motherTribe;
        enrollment.motherWorkplace = updateEnrollmentDto.guardian.motherInfo.workplace ?? enrollment.motherWorkplace;
        enrollment.motherWorkPhone = updateEnrollmentDto.guardian.motherInfo.workPhone ?? enrollment.motherWorkPhone;
        enrollment.motherMobile = updateEnrollmentDto.guardian.motherInfo.mobile ?? enrollment.motherMobile;
        enrollment.motherEmail = updateEnrollmentDto.guardian.motherInfo.email ?? enrollment.motherEmail;
        enrollment.motherMaritalStatus = updateEnrollmentDto.guardian.motherInfo.maritalStatus ?? enrollment.motherMaritalStatus;
      }

      if (updateEnrollmentDto.guardian.otherInfo) {
        enrollment.organizationName = updateEnrollmentDto.guardian.otherInfo.organizationName ?? enrollment.organizationName;
        enrollment.organizationPhone = updateEnrollmentDto.guardian.otherInfo.phone ?? enrollment.organizationPhone;
        enrollment.responsiblePerson = updateEnrollmentDto.guardian.otherInfo.responsiblePerson ?? enrollment.responsiblePerson;
        enrollment.responsiblePhone = updateEnrollmentDto.guardian.otherInfo.responsiblePhone ?? enrollment.responsiblePhone;
      }

      if (updateEnrollmentDto.guardian.emergencyContact) {
        enrollment.emergencyContactName = updateEnrollmentDto.guardian.emergencyContact.fullName ?? enrollment.emergencyContactName;
        enrollment.emergencyContactTribe = updateEnrollmentDto.guardian.emergencyContact.tribe ?? enrollment.emergencyContactTribe;
        enrollment.emergencyContactWorkplace = updateEnrollmentDto.guardian.emergencyContact.workplace ?? enrollment.emergencyContactWorkplace;
        enrollment.emergencyContactWorkPhone = updateEnrollmentDto.guardian.emergencyContact.workPhone ?? enrollment.emergencyContactWorkPhone;
        enrollment.emergencyContactMobile = updateEnrollmentDto.guardian.emergencyContact.mobile ?? enrollment.emergencyContactMobile;
        enrollment.emergencyContactRelationship = updateEnrollmentDto.guardian.emergencyContact.relationship ?? enrollment.emergencyContactRelationship;
      }
    }

    // Update address information
    if (updateEnrollmentDto.address) {
      Object.assign(enrollment, updateEnrollmentDto.address);
    }

    // Update status and notes
    if (updateEnrollmentDto.status) {
      enrollment.status = updateEnrollmentDto.status;
    }

    if (updateEnrollmentDto.notes) {
      enrollment.notes = updateEnrollmentDto.notes;
    }

    return this.enrollmentRepository.save(enrollment);
  }

  async remove(id: string): Promise<void> {
    const enrollment = await this.findOne(id);
    await this.enrollmentRepository.remove(enrollment);
  }

  async findByStatus(status: 'pending' | 'approved' | 'rejected' | 'enrolled'): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      where: { status },
      order: { createdAt: 'DESC' }
    });
  }

  async approveEnrollment(id: string, notes?: string): Promise<Enrollment> {
    const enrollment = await this.findOne(id);
    enrollment.status = 'approved';
    if (notes) {
      enrollment.notes = notes;
    }
    return this.enrollmentRepository.save(enrollment);
  }

  async rejectEnrollment(id: string, notes: string): Promise<Enrollment> {
    const enrollment = await this.findOne(id);
    enrollment.status = 'rejected';
    enrollment.notes = notes;
    return this.enrollmentRepository.save(enrollment);
  }
}
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateEnrollments1737475200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'enrollments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'fullName',
            type: 'varchar',
            length: '200',
          },
          {
            name: 'tribe',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'idNumber',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'gender',
            type: 'enum',
            enum: ['male', 'female'],
          },
          {
            name: 'nationality',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'religion',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'dateOfBirth',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'age',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'hasSiblings',
            type: 'boolean',
            default: false,
          },
          {
            name: 'photo',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'enrollmentStatus',
            type: 'enum',
            enum: ['new', 'transfer'],
            default: "'new'",
          },
          {
            name: 'gradeLevel',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'previousSchool',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'allergies',
            type: 'boolean',
            default: false,
          },
          {
            name: 'allergiesDetails',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'seizures',
            type: 'boolean',
            default: false,
          },
          {
            name: 'seizuresDetails',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'surgeries',
            type: 'boolean',
            default: false,
          },
          {
            name: 'surgeriesDetails',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'chronicDiseases',
            type: 'boolean',
            default: false,
          },
          {
            name: 'chronicDiseasesDetails',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'otherHealthInfo',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'medicalReports',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'guardianType',
            type: 'enum',
            enum: ['father', 'mother', 'other'],
            default: "'father'",
          },
          {
            name: 'fatherFullName',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'fatherTribe',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'fatherWorkplace',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'fatherWorkPhone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'fatherMobile',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'fatherEmail',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'fatherMaritalStatus',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'motherFullName',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'motherTribe',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'motherWorkplace',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'motherWorkPhone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'motherMobile',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'motherEmail',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'motherMaritalStatus',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'organizationName',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'organizationPhone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'responsiblePerson',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'responsiblePhone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'emergencyContactName',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'emergencyContactTribe',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'emergencyContactWorkplace',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'emergencyContactWorkPhone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'emergencyContactMobile',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'emergencyContactRelationship',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'area',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'village',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'landmark',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'streetNumber',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'alleyNumber',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'buildingNumber',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'housingType',
            type: 'enum',
            enum: ['house', 'apartment'],
            default: "'house'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'approved', 'rejected', 'enrolled'],
            default: "'pending'",
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'studentId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'parentId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('enrollments');
  }
}
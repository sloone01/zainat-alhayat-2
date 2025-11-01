import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1704067200000 implements MigrationInterface {
    name = 'InitialMigration1704067200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable UUID extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Create schools table
        await queryRunner.query(`
            CREATE TABLE "schools" (
                "id" SERIAL NOT NULL, 
                "name" character varying(200) NOT NULL, 
                "address" text, 
                "phone" character varying(20), 
                "email" character varying(100), 
                "website" character varying(200), 
                "logo_url" character varying(500), 
                "established_date" date, 
                "description" text, 
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_95b932e47ac129dd8e23a0db548" PRIMARY KEY ("id")
            )
        `);

        // Create users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "username" character varying(50) NOT NULL, 
                "email" character varying(100) NOT NULL, 
                "password" character varying(255) NOT NULL, 
                "firstName" character varying(100) NOT NULL, 
                "lastName" character varying(100) NOT NULL, 
                "role" character varying NOT NULL, 
                "phone" character varying(20), 
                "address" text, 
                "dateOfBirth" date, 
                "isActive" boolean NOT NULL DEFAULT true, 
                "lastLogin" TIMESTAMP, 
                "school_id" integer, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), 
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), 
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);

        // Create rooms table
        await queryRunner.query(`
            CREATE TABLE "rooms" (
                "id" SERIAL NOT NULL, 
                "name" character varying(100) NOT NULL, 
                "capacity" integer NOT NULL, 
                "room_type" character varying NOT NULL, 
                "description" text, 
                "equipment" text, 
                "is_active" boolean NOT NULL DEFAULT true, 
                "school_id" integer NOT NULL, 
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY ("id")
            )
        `);

        // Create groups table
        await queryRunner.query(`
            CREATE TABLE "groups" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "name" character varying(100) NOT NULL, 
                "description" text, 
                "age_range_min" integer, 
                "age_range_max" integer, 
                "capacity" integer NOT NULL DEFAULT 20, 
                "is_active" boolean NOT NULL DEFAULT true, 
                "school_id" integer NOT NULL, 
                "room_id" integer, 
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id")
            )
        `);

        // Create staff table
        await queryRunner.query(`
            CREATE TABLE "staff" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "employee_id" character varying(50), 
                "position" character varying(100) NOT NULL, 
                "department" character varying(100), 
                "hire_date" date NOT NULL, 
                "salary" numeric(10,2), 
                "is_active" boolean NOT NULL DEFAULT true, 
                "user_id" uuid NOT NULL, 
                "school_id" integer NOT NULL, 
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "UQ_staff_employee_id" UNIQUE ("employee_id"), 
                CONSTRAINT "REL_4c6e2c6b7f8b8c5e5f5e5f5e5f" UNIQUE ("user_id"), 
                CONSTRAINT "PK_e4ee98bb552756c180aec1e854a" PRIMARY KEY ("id")
            )
        `);

        // Create parents table
        await queryRunner.query(`
            CREATE TABLE "parents" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "relationship" character varying NOT NULL,
                "emergency_contact" boolean NOT NULL DEFAULT false,
                "work_phone" character varying(20),
                "work_address" text,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_b3e512b5d6b1b3b3b3b3b3b3b3b" PRIMARY KEY ("id")
            )
        `);

        // Create students table
        await queryRunner.query(`
            CREATE TABLE "students" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "firstName" character varying(100) NOT NULL,
                "lastName" character varying(100) NOT NULL,
                "dateOfBirth" date NOT NULL,
                "gender" character varying NOT NULL,
                "photo_url" character varying(500),
                "medical_info" text,
                "allergies" text,
                "emergency_contact_name" character varying(200),
                "emergency_contact_phone" character varying(20),
                "enrollment_date" date NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "school_id" integer NOT NULL,
                "group_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id")
            )
        `);

        // Create courses table
        await queryRunner.query(`
            CREATE TABLE "courses" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(200) NOT NULL,
                "description" text,
                "age_group_min" integer,
                "age_group_max" integer,
                "is_active" boolean NOT NULL DEFAULT true,
                "color_code" character varying(7),
                "icon" character varying(50),
                "send_notifications" boolean NOT NULL DEFAULT true,
                "estimated_duration_weeks" integer,
                "learning_objectives" text,
                "prerequisites" text,
                "materials_needed" text,
                "school_id" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id")
            )
        `);

        // Create phases table
        await queryRunner.query(`
            CREATE TABLE "phases" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(200) NOT NULL,
                "description" text,
                "order_index" integer NOT NULL,
                "estimated_duration_days" integer,
                "is_active" boolean NOT NULL DEFAULT true,
                "course_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_f56dfb0b8f4e0e0e0e0e0e0e0e0" PRIMARY KEY ("id")
            )
        `);

        // Create milestones table
        await queryRunner.query(`
            CREATE TABLE "milestones" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(200) NOT NULL,
                "description" text,
                "order_index" integer NOT NULL,
                "is_required" boolean NOT NULL DEFAULT true,
                "assessment_criteria" text,
                "is_active" boolean NOT NULL DEFAULT true,
                "phase_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_8f0b0b0b0b0b0b0b0b0b0b0b0b0" PRIMARY KEY ("id")
            )
        `);

        // Create schedules table
        await queryRunner.query(`
            CREATE TABLE "schedules" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "day_of_week" integer NOT NULL,
                "start_time" TIME NOT NULL,
                "end_time" TIME NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "course_id" uuid NOT NULL,
                "group_id" uuid NOT NULL,
                "room_id" integer,
                "teacher_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_7e33fc2ea755a5765e3564e66dd" PRIMARY KEY ("id")
            )
        `);

        // Create attendance table
        await queryRunner.query(`
            CREATE TABLE "attendance" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "date" date NOT NULL,
                "status" character varying NOT NULL,
                "check_in_time" TIME,
                "check_out_time" TIME,
                "notes" text,
                "student_id" uuid NOT NULL,
                "schedule_id" uuid,
                "marked_by" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ee0ffe58c60f3f75c9c1b7e8b5d" PRIMARY KEY ("id")
            )
        `);

        // Create student_progress table
        await queryRunner.query(`
            CREATE TABLE "student_progress" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "status" character varying NOT NULL,
                "completion_date" date,
                "notes" text,
                "assessment_score" integer,
                "teacher_feedback" text,
                "student_id" uuid NOT NULL,
                "milestone_id" uuid NOT NULL,
                "teacher_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_student_progress_unique" UNIQUE ("student_id", "milestone_id"),
                CONSTRAINT "PK_b8f8b8b8b8b8b8b8b8b8b8b8b8b" PRIMARY KEY ("id")
            )
        `);

        // Create class_settings table
        await queryRunner.query(`
            CREATE TABLE "class_settings" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "setting_key" character varying(100) NOT NULL,
                "setting_value" text,
                "description" text,
                "is_active" boolean NOT NULL DEFAULT true,
                "school_id" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_class_settings_key_school" UNIQUE ("setting_key", "school_id"),
                CONSTRAINT "PK_c8c8c8c8c8c8c8c8c8c8c8c8c8c" PRIMARY KEY ("id")
            )
        `);

        // Create activities table
        await queryRunner.query(`
            CREATE TABLE "activities" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(200) NOT NULL,
                "description" text,
                "activity_date" date NOT NULL,
                "start_time" TIME,
                "end_time" TIME,
                "location" character varying(200),
                "activity_type" character varying NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "school_id" integer NOT NULL,
                "group_id" uuid,
                "created_by" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_d8d8d8d8d8d8d8d8d8d8d8d8d8d" PRIMARY KEY ("id")
            )
        `);

        // Create reminders table
        await queryRunner.query(`
            CREATE TABLE "reminders" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(200) NOT NULL,
                "message" text NOT NULL,
                "reminder_date" TIMESTAMP NOT NULL,
                "is_sent" boolean NOT NULL DEFAULT false,
                "reminder_type" character varying NOT NULL,
                "recipient_type" character varying NOT NULL,
                "school_id" integer NOT NULL,
                "created_by" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_e8e8e8e8e8e8e8e8e8e8e8e8e8e" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_users_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rooms" ADD CONSTRAINT "FK_rooms_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_groups_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_groups_room" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "staff" ADD CONSTRAINT "FK_staff_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "staff" ADD CONSTRAINT "FK_staff_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "parents" ADD CONSTRAINT "FK_parents_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_students_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_students_group" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_courses_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "phases" ADD CONSTRAINT "FK_phases_course" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "milestones" ADD CONSTRAINT "FK_milestones_phase" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD CONSTRAINT "FK_schedules_course" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD CONSTRAINT "FK_schedules_group" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD CONSTRAINT "FK_schedules_room" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD CONSTRAINT "FK_schedules_teacher" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_attendance_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_attendance_schedule" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_attendance_marked_by" FOREIGN KEY ("marked_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_progress" ADD CONSTRAINT "FK_student_progress_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_progress" ADD CONSTRAINT "FK_student_progress_milestone" FOREIGN KEY ("milestone_id") REFERENCES "milestones"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_progress" ADD CONSTRAINT "FK_student_progress_teacher" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "class_settings" ADD CONSTRAINT "FK_class_settings_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_activities_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_activities_group" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_activities_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reminders" ADD CONSTRAINT "FK_reminders_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reminders" ADD CONSTRAINT "FK_reminders_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order to avoid foreign key constraint issues
        await queryRunner.query(`DROP TABLE "reminders"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`DROP TABLE "class_settings"`);
        await queryRunner.query(`DROP TABLE "student_progress"`);
        await queryRunner.query(`DROP TABLE "attendance"`);
        await queryRunner.query(`DROP TABLE "schedules"`);
        await queryRunner.query(`DROP TABLE "milestones"`);
        await queryRunner.query(`DROP TABLE "phases"`);
        await queryRunner.query(`DROP TABLE "courses"`);
        await queryRunner.query(`DROP TABLE "students"`);
        await queryRunner.query(`DROP TABLE "parents"`);
        await queryRunner.query(`DROP TABLE "staff"`);
        await queryRunner.query(`DROP TABLE "groups"`);
        await queryRunner.query(`DROP TABLE "rooms"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "schools"`);
        await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
    }
}

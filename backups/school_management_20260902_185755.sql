--
-- PostgreSQL database dump
--

\restrict 03ebwegav5A2lhkOipI0pJsSAhGhT3JNmaSCV00YsiylDu8kqQchHEYWz0Veoec

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: courses_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.courses_status_enum AS ENUM (
    'draft',
    'active',
    'published',
    'inactive',
    'archived'
);


--
-- Name: groups_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.groups_status_enum AS ENUM (
    'active',
    'inactive',
    'full'
);


--
-- Name: rbac_group_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.rbac_group_type_enum AS ENUM (
    'system',
    'staff',
    'parent',
    'student'
);


--
-- Name: students_gender_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.students_gender_enum AS ENUM (
    'male',
    'female'
);


--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.users_role_enum AS ENUM (
    'admin',
    'teacher',
    'student',
    'parent'
);


--
-- Name: users_user_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.users_user_type_enum AS ENUM (
    'staff',
    'parent',
    'student',
    'platform'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: academic_years; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.academic_years (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    year character varying(20) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    school_id integer,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    activity_date date NOT NULL,
    start_time time without time zone,
    end_time time without time zone,
    location character varying(200),
    activity_type character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    school_id integer NOT NULL,
    group_id uuid,
    created_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    requires_parent_approval boolean DEFAULT false NOT NULL
);


--
-- Name: activities_legacy_pre_align_1777620000000; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activities_legacy_pre_align_1777620000000 (
    id integer NOT NULL,
    student_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    data jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: activities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activities_id_seq OWNED BY public.activities_legacy_pre_align_1777620000000.id;


--
-- Name: attendances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendances (
    id integer NOT NULL,
    attendance_date date NOT NULL,
    status character varying(20) DEFAULT 'present'::character varying NOT NULL,
    check_in_time time without time zone,
    check_out_time time without time zone,
    notes text,
    reason text,
    is_excused boolean DEFAULT false NOT NULL,
    student_id uuid NOT NULL,
    group_id uuid NOT NULL,
    recorded_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: attendances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attendances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attendances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attendances_id_seq OWNED BY public.attendances.id;


--
-- Name: bus_fee_link_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bus_fee_link_lines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    link_id uuid NOT NULL,
    charge_type_id uuid NOT NULL,
    amount numeric(12,2) DEFAULT 0 NOT NULL
);


--
-- Name: bus_fee_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bus_fee_links (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    school_id integer NOT NULL,
    bus_id uuid NOT NULL,
    fee_package_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: bus_movement_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bus_movement_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    bus_id uuid NOT NULL,
    student_id uuid NOT NULL,
    event_type character varying(32) NOT NULL,
    logged_at timestamp with time zone DEFAULT now() NOT NULL,
    logged_by_user_id uuid,
    trip_type character varying(16) DEFAULT 'going'::character varying NOT NULL,
    trip_date date NOT NULL,
    CONSTRAINT "CHK_bus_movement_logs_event_type" CHECK (((event_type)::text = ANY ((ARRAY['boarded'::character varying, 'dropped_off'::character varying])::text[]))),
    CONSTRAINT "CHK_bus_movement_logs_trip_type" CHECK (((trip_type)::text = ANY ((ARRAY['going'::character varying, 'return'::character varying])::text[])))
);


--
-- Name: buses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.buses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    driver_name character varying(255) NOT NULL,
    capacity integer DEFAULT 40 NOT NULL,
    driver_contacts text,
    school_id integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: class_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.class_settings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    setting_type character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    duration_minutes integer,
    time_value time without time zone,
    is_default boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    color character varying(50),
    description text,
    order_index integer NOT NULL,
    additional_settings json,
    school_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: course_fee_link_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_fee_link_lines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    link_id uuid NOT NULL,
    charge_type_id uuid NOT NULL,
    amount numeric(12,2) DEFAULT 0 NOT NULL
);


--
-- Name: course_fee_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_fee_links (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    school_id integer NOT NULL,
    course_id uuid NOT NULL,
    fee_package_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: course_payment_charge_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_payment_charge_lines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    profile_id uuid NOT NULL,
    charge_type_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: course_payment_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_payment_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    school_id integer NOT NULL,
    course_id uuid NOT NULL,
    course_pricing_basis character varying(16) NOT NULL,
    currency character varying(3) DEFAULT 'OMR'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    fee_package_id uuid,
    CONSTRAINT "CHK_course_payment_profiles_basis" CHECK (((course_pricing_basis)::text = ANY ((ARRAY['grade'::character varying, 'phase'::character varying])::text[])))
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255),
    title character varying(255),
    category character varying(100),
    status public.courses_status_enum DEFAULT 'draft'::public.courses_status_enum NOT NULL,
    description text,
    age_group_min integer,
    age_group_max integer,
    is_active boolean DEFAULT true NOT NULL,
    color_code character varying(50),
    icon character varying(100),
    send_notifications boolean DEFAULT true NOT NULL,
    estimated_duration_weeks integer,
    learning_objectives text,
    prerequisites text,
    materials_needed text,
    school_id integer NOT NULL,
    academic_year_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    "totalDuration" integer,
    "createdDate" date,
    "lastModified" date,
    "targetAgeGroup" character varying(50),
    "difficultyLevel" character varying(50),
    "maxStudents" integer,
    course_kind character varying(32) DEFAULT 'milestone'::character varying NOT NULL
);


--
-- Name: direct_chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.direct_chat_messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    thread_id uuid NOT NULL,
    user_id uuid NOT NULL,
    body text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb
);


--
-- Name: direct_chat_threads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.direct_chat_threads (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_low_id uuid NOT NULL,
    user_high_id uuid NOT NULL,
    school_id integer,
    last_message_at timestamp with time zone,
    last_message_preview character varying(240),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "fullName" character varying(200) NOT NULL,
    tribe character varying(100),
    "idNumber" character varying(100),
    gender character varying(10) NOT NULL,
    nationality character varying(100),
    religion character varying(100),
    "dateOfBirth" date,
    age integer,
    "hasSiblings" boolean DEFAULT false,
    photo text,
    "enrollmentStatus" character varying(10) DEFAULT 'new'::character varying,
    "gradeLevel" character varying(100),
    "previousSchool" character varying(200),
    allergies boolean DEFAULT false,
    "allergiesDetails" text,
    seizures boolean DEFAULT false,
    "seizuresDetails" text,
    surgeries boolean DEFAULT false,
    "surgeriesDetails" text,
    "chronicDiseases" boolean DEFAULT false,
    "chronicDiseasesDetails" text,
    "otherHealthInfo" text,
    "medicalReports" json,
    "guardianType" character varying(10) DEFAULT 'father'::character varying,
    "fatherFullName" character varying(200),
    "fatherTribe" character varying(100),
    "fatherWorkplace" character varying(200),
    "fatherWorkPhone" character varying(20),
    "fatherMobile" character varying(20),
    "fatherEmail" character varying(200),
    "fatherMaritalStatus" character varying(50),
    "motherFullName" character varying(200),
    "motherTribe" character varying(100),
    "motherWorkplace" character varying(200),
    "motherWorkPhone" character varying(20),
    "motherMobile" character varying(20),
    "motherEmail" character varying(200),
    "motherMaritalStatus" character varying(50),
    "organizationName" character varying(200),
    "organizationPhone" character varying(20),
    "responsiblePerson" character varying(200),
    "responsiblePhone" character varying(20),
    "emergencyContactName" character varying(200),
    "emergencyContactTribe" character varying(100),
    "emergencyContactWorkplace" character varying(200),
    "emergencyContactWorkPhone" character varying(20),
    "emergencyContactMobile" character varying(20),
    "emergencyContactRelationship" character varying(100),
    area character varying(100),
    village character varying(100),
    landmark character varying(200),
    "streetNumber" character varying(50),
    "alleyNumber" character varying(50),
    "buildingNumber" character varying(50),
    "housingType" character varying(10) DEFAULT 'house'::character varying,
    status character varying(10) DEFAULT 'pending'::character varying,
    notes text,
    "studentId" uuid,
    "parentId" uuid,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    CONSTRAINT "enrollments_enrollmentStatus_check" CHECK ((("enrollmentStatus")::text = ANY ((ARRAY['new'::character varying, 'transfer'::character varying])::text[]))),
    CONSTRAINT enrollments_gender_check CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying])::text[]))),
    CONSTRAINT "enrollments_guardianType_check" CHECK ((("guardianType")::text = ANY ((ARRAY['father'::character varying, 'mother'::character varying, 'other'::character varying])::text[]))),
    CONSTRAINT "enrollments_housingType_check" CHECK ((("housingType")::text = ANY ((ARRAY['house'::character varying, 'apartment'::character varying])::text[]))),
    CONSTRAINT enrollments_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'enrolled'::character varying])::text[])))
);


--
-- Name: fee_package_charge_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fee_package_charge_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    package_id uuid NOT NULL,
    charge_type_id uuid NOT NULL,
    payment_timing character varying(16) DEFAULT 'installment'::character varying NOT NULL,
    billing_frequency character varying(16) DEFAULT 'per_year'::character varying NOT NULL,
    CONSTRAINT "CHK_fpkg_charge_billing_frequency" CHECK (((billing_frequency)::text = ANY ((ARRAY['per_year'::character varying, 'once_only'::character varying])::text[]))),
    CONSTRAINT "CHK_fpkg_charge_payment_timing" CHECK (((payment_timing)::text = ANY ((ARRAY['upfront'::character varying, 'installment'::character varying])::text[])))
);


--
-- Name: fee_package_course_amounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fee_package_course_amounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    package_id uuid NOT NULL,
    course_id uuid NOT NULL,
    charge_type_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL
);


--
-- Name: fee_package_discount_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fee_package_discount_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    package_id uuid NOT NULL,
    discount_type_id uuid NOT NULL
);


--
-- Name: fee_package_installments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fee_package_installments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    package_id uuid NOT NULL,
    sequence integer NOT NULL,
    month_number integer,
    label character varying(120),
    amount numeric(12,2) NOT NULL
);


--
-- Name: fee_package_level_amounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fee_package_level_amounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    package_id uuid NOT NULL,
    level_id uuid NOT NULL,
    charge_type_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    billing_period character varying(16) DEFAULT 'yearly'::character varying NOT NULL,
    CONSTRAINT "CHK_fee_package_level_amounts_billing_period" CHECK (((billing_period)::text = ANY ((ARRAY['monthly'::character varying, 'semester'::character varying, 'yearly'::character varying])::text[])))
);


--
-- Name: fee_package_level_period_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fee_package_level_period_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    package_id uuid NOT NULL,
    level_id uuid NOT NULL,
    billing_period character varying(16) NOT NULL,
    downpayment_amount numeric(12,2) DEFAULT 0 NOT NULL,
    installment_schedule_months jsonb
);


--
-- Name: fee_packages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fee_packages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    school_id integer NOT NULL,
    name character varying(200) NOT NULL,
    currency character varying(3) DEFAULT 'OMR'::character varying NOT NULL,
    year_payment_mode character varying(32),
    course_pricing_basis character varying(16),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: grade_fee_link_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grade_fee_link_lines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    link_id uuid NOT NULL,
    charge_type_id uuid NOT NULL,
    amount numeric(12,2) DEFAULT 0 NOT NULL
);


--
-- Name: grade_fee_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grade_fee_links (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    school_id integer NOT NULL,
    level_id uuid NOT NULL,
    fee_package_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: graded_assessment_schemes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.graded_assessment_schemes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    course_id uuid NOT NULL,
    total_marks numeric(10,2) NOT NULL,
    aggregation_method character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: graded_criteria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.graded_criteria (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    semester_config_id uuid NOT NULL,
    label character varying(255) NOT NULL,
    max_marks numeric(10,2) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: graded_criterion_task_student_marks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.graded_criterion_task_student_marks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    graded_criterion_teacher_task_id uuid NOT NULL,
    student_id uuid NOT NULL,
    mark numeric(10,2),
    updated_by_teacher_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: graded_criterion_teacher_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.graded_criterion_teacher_tasks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    graded_criterion_id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    group_id uuid NOT NULL,
    course_id uuid NOT NULL,
    description text,
    due_date date,
    sort_order integer DEFAULT 0 NOT NULL,
    is_system_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: graded_semester_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.graded_semester_configs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    scheme_id uuid NOT NULL,
    semester_index integer NOT NULL,
    title character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: grades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grades (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "nameEn" character varying(100) NOT NULL,
    "nameAr" character varying(100) NOT NULL,
    code character varying(50) NOT NULL,
    "displayOrder" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    description text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: group_chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_chat_messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    group_id uuid NOT NULL,
    user_id uuid NOT NULL,
    body text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    age_range_min integer,
    age_range_max integer,
    capacity integer DEFAULT 20 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    color character varying(50),
    status public.groups_status_enum DEFAULT 'active'::public.groups_status_enum NOT NULL,
    "studentCount" integer DEFAULT 0 NOT NULL,
    "teacherCount" integer DEFAULT 0 NOT NULL,
    school_id integer NOT NULL,
    room_id integer,
    academic_year_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    level_id uuid
);


--
-- Name: installment_plan_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.installment_plan_entries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    plan_id uuid NOT NULL,
    sequence integer NOT NULL,
    month_number integer,
    label character varying(120),
    weight numeric(8,4) DEFAULT 1 NOT NULL
);


--
-- Name: installment_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.installment_plans (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    school_id integer NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: level_payment_charge_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.level_payment_charge_lines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    profile_id uuid NOT NULL,
    charge_type_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    billing_period character varying(16) DEFAULT 'yearly'::character varying NOT NULL,
    CONSTRAINT "CHK_level_payment_charge_lines_billing_period" CHECK (((billing_period)::text = ANY ((ARRAY['monthly'::character varying, 'semester'::character varying, 'yearly'::character varying])::text[])))
);


--
-- Name: level_payment_installments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.level_payment_installments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    profile_id uuid NOT NULL,
    sequence integer NOT NULL,
    month_number smallint,
    label character varying(100),
    amount numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: level_payment_profile_discounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.level_payment_profile_discounts (
    profile_id uuid NOT NULL,
    discount_type_id uuid NOT NULL
);


--
-- Name: level_payment_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.level_payment_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    school_id integer NOT NULL,
    level_id uuid NOT NULL,
    pricing_model character varying(32) DEFAULT 'per_year'::character varying NOT NULL,
    year_payment_mode character varying(32),
    year_total_amount numeric(12,2),
    currency character varying(3) DEFAULT 'OMR'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    fee_package_id uuid,
    CONSTRAINT "CHK_level_payment_profiles_pricing_model" CHECK (((pricing_model)::text = 'per_year'::text)),
    CONSTRAINT "CHK_level_payment_profiles_year_mode" CHECK (((year_payment_mode IS NULL) OR ((year_payment_mode)::text = ANY ((ARRAY['one_time'::character varying, 'installments'::character varying, 'both'::character varying])::text[]))))
);


--
-- Name: meeting_room_invitees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_room_invitees (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    meeting_room_id uuid NOT NULL,
    user_id uuid NOT NULL
);


--
-- Name: meeting_rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_rooms (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    school_id integer NOT NULL,
    title character varying(255) NOT NULL,
    provider character varying(32) DEFAULT 'daily'::character varying NOT NULL,
    room_name character varying(128) NOT NULL,
    room_url text NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    scheduled_at timestamp with time zone
);


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: milestones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.milestones (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255),
    description text,
    order_index integer NOT NULL,
    is_required boolean DEFAULT true NOT NULL,
    points integer,
    phase_id uuid,
    title character varying(255),
    type character varying(50),
    target_week integer,
    weight numeric(5,2),
    difficulty_level character varying(50),
    estimated_duration_minutes integer,
    required_resources text,
    allow_late_submission boolean DEFAULT false NOT NULL,
    enable_peer_review boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: notification_template_definitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_template_definitions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    template_key character varying(120) NOT NULL,
    display_name character varying(200) NOT NULL,
    description text,
    channel character varying(20) NOT NULL,
    default_subject text,
    default_body_html text,
    default_body_sms text,
    variable_hints jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    default_subject_ar text,
    default_body_html_ar text,
    default_body_sms_ar text
);


--
-- Name: online_session_presence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.online_session_presence (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    online_session_id uuid NOT NULL,
    user_id uuid NOT NULL,
    display_name character varying(255),
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    left_at timestamp with time zone
);


--
-- Name: online_session_student_attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.online_session_student_attendance (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    online_session_id uuid NOT NULL,
    student_id uuid NOT NULL,
    status character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: online_video_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.online_video_sessions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    schedule_id uuid NOT NULL,
    week_start_date date NOT NULL,
    session_date date NOT NULL,
    provider character varying(32) DEFAULT 'daily'::character varying NOT NULL,
    room_name character varying(128) NOT NULL,
    room_url text NOT NULL,
    recording_id character varying(255),
    recording_url text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    attendance_finalized_at timestamp with time zone
);


--
-- Name: parents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parents (
    id integer NOT NULL,
    "firstName" character varying(100) NOT NULL,
    "lastName" character varying(100) NOT NULL,
    email character varying(255),
    phone character varying(20),
    address text,
    user_id uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    student_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: COLUMN parents.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.parents.user_id IS 'UUID reference to users table for parent login';


--
-- Name: parents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.parents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: parents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.parents_id_seq OWNED BY public.parents.id;


--
-- Name: payment_charge_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_charge_types (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    school_id integer NOT NULL,
    code character varying(64) NOT NULL,
    label character varying(255) NOT NULL,
    value character varying(255),
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    billing_occurrence character varying(32) DEFAULT 'per_year'::character varying NOT NULL,
    CONSTRAINT "CHK_payment_charge_types_billing_occurrence" CHECK (((billing_occurrence)::text = ANY ((ARRAY['per_year'::character varying, 'once_ever'::character varying, 'other'::character varying])::text[])))
);


--
-- Name: payment_discount_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_discount_types (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    school_id integer NOT NULL,
    code character varying(64) NOT NULL,
    label character varying(255) NOT NULL,
    value character varying(255),
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: payment_transaction_allocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_transaction_allocations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payment_transaction_id uuid NOT NULL,
    student_fee_charge_id uuid NOT NULL,
    charge_type_id uuid NOT NULL,
    level_payment_installment_id uuid,
    amount numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    school_id integer NOT NULL,
    student_payment_id uuid NOT NULL,
    academic_year_id uuid,
    total_amount numeric(12,2) NOT NULL,
    currency character varying(3) DEFAULT 'OMR'::character varying NOT NULL,
    paid_at timestamp with time zone NOT NULL,
    recorded_by_user_id uuid,
    remarks text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: phases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.phases (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255),
    description text,
    order_index integer NOT NULL,
    estimated_duration_days integer,
    is_active boolean DEFAULT true NOT NULL,
    course_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: platform_addons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_addons (
    id integer NOT NULL,
    code character varying(64) NOT NULL,
    name_en character varying(120) NOT NULL,
    name_ar character varying(120) NOT NULL,
    amount_omr numeric(12,3) NOT NULL,
    feature_key character varying(64),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: platform_addons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.platform_addons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: platform_addons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.platform_addons_id_seq OWNED BY public.platform_addons.id;


--
-- Name: platform_invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_invoices (
    id integer NOT NULL,
    school_id integer NOT NULL,
    subscription_id integer NOT NULL,
    billing_period character varying(32) NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    base_amount numeric(12,3) DEFAULT 0 NOT NULL,
    seats_included integer DEFAULT 0 NOT NULL,
    seats_used integer DEFAULT 0 NOT NULL,
    overage_amount numeric(12,3) DEFAULT 0 NOT NULL,
    addons_amount numeric(12,3) DEFAULT 0 NOT NULL,
    total_amount numeric(12,3) DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'issued'::character varying NOT NULL,
    paid_at timestamp with time zone,
    paid_note text,
    line_items jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "CHK_platform_invoices_period" CHECK (((billing_period)::text = ANY ((ARRAY['monthly'::character varying, 'semester'::character varying, 'yearly'::character varying, 'summer'::character varying])::text[]))),
    CONSTRAINT "CHK_platform_invoices_status" CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'issued'::character varying, 'paid'::character varying, 'void'::character varying])::text[])))
);


--
-- Name: platform_invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.platform_invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: platform_invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.platform_invoices_id_seq OWNED BY public.platform_invoices.id;


--
-- Name: platform_modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_modules (
    id integer NOT NULL,
    code character varying(64) NOT NULL,
    name_en character varying(120) NOT NULL,
    name_ar character varying(120) NOT NULL,
    description_en text,
    description_ar text,
    page_keys jsonb DEFAULT '[]'::jsonb NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    amount_omr numeric(12,3) DEFAULT 0 NOT NULL
);


--
-- Name: platform_modules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.platform_modules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: platform_modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.platform_modules_id_seq OWNED BY public.platform_modules.id;


--
-- Name: platform_plan_features; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_plan_features (
    id integer NOT NULL,
    plan_id integer NOT NULL,
    feature_key character varying(64) NOT NULL
);


--
-- Name: platform_plan_features_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.platform_plan_features_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: platform_plan_features_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.platform_plan_features_id_seq OWNED BY public.platform_plan_features.id;


--
-- Name: platform_plan_modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_plan_modules (
    id integer NOT NULL,
    plan_id integer NOT NULL,
    module_id integer NOT NULL
);


--
-- Name: platform_plan_modules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.platform_plan_modules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: platform_plan_modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.platform_plan_modules_id_seq OWNED BY public.platform_plan_modules.id;


--
-- Name: platform_plan_prices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_plan_prices (
    id integer NOT NULL,
    plan_id integer NOT NULL,
    billing_period character varying(32) NOT NULL,
    amount_omr numeric(12,3) NOT NULL,
    CONSTRAINT "CHK_platform_plan_prices_period" CHECK (((billing_period)::text = ANY ((ARRAY['monthly'::character varying, 'semester'::character varying, 'yearly'::character varying, 'summer'::character varying])::text[])))
);


--
-- Name: platform_plan_prices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.platform_plan_prices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: platform_plan_prices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.platform_plan_prices_id_seq OWNED BY public.platform_plan_prices.id;


--
-- Name: platform_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_plans (
    id integer NOT NULL,
    code character varying(64) NOT NULL,
    name_en character varying(120) NOT NULL,
    name_ar character varying(120) NOT NULL,
    description_en text,
    description_ar text,
    included_student_seats integer DEFAULT 50 NOT NULL,
    overage_per_student_omr numeric(10,3) DEFAULT 0 NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: platform_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.platform_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: platform_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.platform_plans_id_seq OWNED BY public.platform_plans.id;


--
-- Name: rbac_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rbac_actions (
    id integer NOT NULL,
    code character varying(32) NOT NULL,
    name character varying(100) NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


--
-- Name: rbac_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rbac_actions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rbac_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rbac_actions_id_seq OWNED BY public.rbac_actions.id;


--
-- Name: rbac_group_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rbac_group_permissions (
    "groupId" uuid NOT NULL,
    "pageId" integer NOT NULL,
    "actionId" integer NOT NULL
);


--
-- Name: rbac_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rbac_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(120) NOT NULL,
    description text,
    "schoolId" integer,
    "isSystem" boolean DEFAULT false NOT NULL,
    "systemKey" character varying(64),
    color character varying(32),
    "clonedFromId" uuid,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "groupType" public.rbac_group_type_enum DEFAULT 'staff'::public.rbac_group_type_enum NOT NULL,
    code character varying(64) NOT NULL
);


--
-- Name: rbac_page_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rbac_page_actions (
    "pageId" integer NOT NULL,
    "actionId" integer NOT NULL
);


--
-- Name: rbac_pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rbac_pages (
    id integer NOT NULL,
    key character varying(64) NOT NULL,
    route character varying(255) NOT NULL,
    "nameEn" character varying(120) NOT NULL,
    "nameAr" character varying(120) NOT NULL,
    scope character varying(16) DEFAULT 'school'::character varying NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


--
-- Name: rbac_pages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rbac_pages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rbac_pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rbac_pages_id_seq OWNED BY public.rbac_pages.id;


--
-- Name: rbac_role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rbac_role_permissions (
    "roleId" uuid NOT NULL,
    "pageId" integer NOT NULL,
    "actionId" integer NOT NULL
);


--
-- Name: rbac_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rbac_roles (
    id uuid NOT NULL,
    name character varying(120) NOT NULL,
    description text,
    "schoolId" integer,
    "isSystem" boolean DEFAULT false NOT NULL,
    "systemKey" character varying(64),
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    code character varying(64) NOT NULL
);


--
-- Name: rbac_user_group_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rbac_user_group_members (
    "userId" uuid NOT NULL,
    "groupId" uuid NOT NULL,
    "assignedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: rbac_user_group_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rbac_user_group_roles (
    "groupId" uuid NOT NULL,
    "roleId" uuid NOT NULL,
    "assignedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: rbac_user_permission_overrides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rbac_user_permission_overrides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "userId" uuid NOT NULL,
    "pageId" integer NOT NULL,
    "actionId" integer NOT NULL,
    effect character varying(8) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT "CHK_rbac_override_effect" CHECK (((effect)::text = ANY ((ARRAY['grant'::character varying, 'deny'::character varying])::text[])))
);


--
-- Name: reminders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reminders (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    due_date timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: reminders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reminders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reminders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reminders_id_seq OWNED BY public.reminders.id;


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rooms (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    capacity integer NOT NULL,
    room_type character varying NOT NULL,
    description text,
    equipment text,
    is_active boolean DEFAULT true NOT NULL,
    school_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: rooms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rooms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rooms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rooms_id_seq OWNED BY public.rooms.id;


--
-- Name: schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedules (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    day_of_week character varying(20) NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    duration_minutes integer NOT NULL,
    notes text,
    is_recurring boolean DEFAULT true NOT NULL,
    specific_date date,
    status character varying(50) DEFAULT 'active'::character varying NOT NULL,
    group_id uuid,
    course_id uuid,
    teacher_id uuid,
    room_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: school_landing_pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.school_landing_pages (
    id integer NOT NULL,
    school_id integer NOT NULL,
    logo_url text,
    hero_image_url text,
    brand_name_en character varying(200),
    brand_name_ar character varying(200),
    badge_en character varying(200),
    badge_ar character varying(200),
    hero_title_en character varying(300),
    hero_title_ar character varying(300),
    hero_subtitle_en text,
    hero_subtitle_ar text,
    cta_primary_en character varying(120),
    cta_primary_ar character varying(120),
    cta_secondary_en character varying(120),
    cta_secondary_ar character varying(120),
    features jsonb DEFAULT '[]'::jsonb NOT NULL,
    testimonials jsonb DEFAULT '[]'::jsonb NOT NULL,
    phone character varying(40),
    email character varying(120),
    address_en text,
    address_ar text,
    is_published boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: school_landing_pages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.school_landing_pages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: school_landing_pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.school_landing_pages_id_seq OWNED BY public.school_landing_pages.id;


--
-- Name: school_message_letters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.school_message_letters (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    school_id integer NOT NULL,
    title character varying(200) NOT NULL,
    audience jsonb DEFAULT '{}'::jsonb NOT NULL,
    subject_en text NOT NULL,
    subject_ar text NOT NULL,
    body_html_en text NOT NULL,
    body_html_ar text NOT NULL,
    body_sms_en text,
    body_sms_ar text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    activity_id uuid
);


--
-- Name: school_modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.school_modules (
    id integer NOT NULL,
    school_id integer NOT NULL,
    module_id integer NOT NULL,
    source character varying(16) DEFAULT 'plan'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: school_modules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.school_modules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: school_modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.school_modules_id_seq OWNED BY public.school_modules.id;


--
-- Name: school_notification_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.school_notification_templates (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    school_id integer NOT NULL,
    template_key character varying(120) NOT NULL,
    subject_override text,
    body_html_override text,
    body_sms_override text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    subject_override_ar text,
    body_html_override_ar text,
    body_sms_override_ar text
);


--
-- Name: school_payment_levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.school_payment_levels (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    school_id integer NOT NULL,
    code character varying(64) NOT NULL,
    name character varying(255) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: school_platform_subscription_addons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.school_platform_subscription_addons (
    id integer NOT NULL,
    subscription_id integer NOT NULL,
    addon_id integer NOT NULL
);


--
-- Name: school_platform_subscription_addons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.school_platform_subscription_addons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: school_platform_subscription_addons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.school_platform_subscription_addons_id_seq OWNED BY public.school_platform_subscription_addons.id;


--
-- Name: school_platform_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.school_platform_subscriptions (
    id integer NOT NULL,
    school_id integer NOT NULL,
    plan_id integer NOT NULL,
    billing_period character varying(32) NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    included_student_seats_override integer,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "CHK_school_platform_sub_period" CHECK (((billing_period)::text = ANY ((ARRAY['monthly'::character varying, 'semester'::character varying, 'yearly'::character varying, 'summer'::character varying])::text[]))),
    CONSTRAINT "CHK_school_platform_sub_status" CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'past_due'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- Name: school_platform_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.school_platform_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: school_platform_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.school_platform_subscriptions_id_seq OWNED BY public.school_platform_subscriptions.id;


--
-- Name: school_system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.school_system_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    school_id integer NOT NULL,
    setting_key character varying(200) NOT NULL,
    value_json jsonb NOT NULL,
    type character varying(20) DEFAULT 'string'::character varying NOT NULL,
    category character varying(100) NOT NULL,
    title character varying(255) DEFAULT ''::character varying NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    is_public boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schools (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    address text,
    phone character varying(20),
    email character varying(100),
    website character varying(200),
    logo_url character varying(500),
    established_date date,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    cr_document_url text,
    owner_id_document_url text,
    owner_legal_name character varying(255),
    payment_allow_admin_adjust_student_total boolean DEFAULT false NOT NULL,
    status character varying(32) DEFAULT 'active'::character varying NOT NULL,
    landing_slug character varying(80),
    CONSTRAINT "CHK_schools_status" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'active'::character varying, 'suspended'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: schools_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.schools_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: schools_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.schools_id_seq OWNED BY public.schools.id;


--
-- Name: semesters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.semesters (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(100) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    academic_year_id uuid NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: session_media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_media (
    id integer NOT NULL,
    session_plan_id uuid NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_type character varying(10) NOT NULL,
    file_size integer NOT NULL,
    mime_type character varying(100) NOT NULL,
    uploaded_by uuid NOT NULL,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT session_media_file_type_check CHECK (((file_type)::text = ANY ((ARRAY['photo'::character varying, 'video'::character varying])::text[])))
);


--
-- Name: session_media_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.session_media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: session_media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.session_media_id_seq OWNED BY public.session_media.id;


--
-- Name: staff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    school_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: staff_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.staff_id_seq OWNED BY public.staff.id;


--
-- Name: student_buses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_buses (
    student_id uuid NOT NULL,
    bus_id uuid NOT NULL
);


--
-- Name: student_charge_sheet_discount_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_charge_sheet_discount_lines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sheet_id uuid NOT NULL,
    discount_type_id uuid NOT NULL,
    amount numeric(12,2) DEFAULT 0 NOT NULL,
    remarks character varying(500),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: student_charge_sheet_installments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_charge_sheet_installments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sheet_id uuid NOT NULL,
    sequence integer NOT NULL,
    month_number integer,
    label character varying(120),
    amount_due numeric(12,2) DEFAULT 0 NOT NULL,
    amount_paid numeric(12,2) DEFAULT 0 NOT NULL,
    status character varying(16) DEFAULT 'pending'::character varying NOT NULL,
    CONSTRAINT "CHK_scsi_status" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'partial'::character varying])::text[])))
);


--
-- Name: student_charge_sheet_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_charge_sheet_lines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sheet_id uuid NOT NULL,
    charge_type_id uuid NOT NULL,
    source_type character varying(16) NOT NULL,
    source_ref_id uuid,
    charge_label character varying(255) NOT NULL,
    payment_timing character varying(16) DEFAULT 'installment'::character varying NOT NULL,
    billing_frequency character varying(16) DEFAULT 'per_year'::character varying NOT NULL,
    list_amount numeric(12,2) DEFAULT 0 NOT NULL,
    due_amount numeric(12,2) DEFAULT 0 NOT NULL,
    paid_amount numeric(12,2) DEFAULT 0 NOT NULL,
    status character varying(16) DEFAULT 'pending'::character varying NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    CONSTRAINT "CHK_scsl_source_type" CHECK (((source_type)::text = ANY ((ARRAY['grade'::character varying, 'bus'::character varying, 'course'::character varying])::text[]))),
    CONSTRAINT "CHK_scsl_status" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'waived'::character varying])::text[])))
);


--
-- Name: student_charge_sheets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_charge_sheets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    student_id uuid NOT NULL,
    school_id integer NOT NULL,
    academic_year_id uuid NOT NULL,
    installment_plan_id uuid,
    currency character varying(3) DEFAULT 'OMR'::character varying NOT NULL,
    list_total numeric(12,2) DEFAULT 0 NOT NULL,
    due_total numeric(12,2) DEFAULT 0 NOT NULL,
    paid_total numeric(12,2) DEFAULT 0 NOT NULL,
    discount_total numeric(12,2) DEFAULT 0 NOT NULL,
    upfront_due numeric(12,2) DEFAULT 0 NOT NULL,
    installment_due numeric(12,2) DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: student_course_enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_course_enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    course_id uuid NOT NULL,
    school_id integer NOT NULL,
    status character varying(24) DEFAULT 'active'::character varying NOT NULL,
    student_payment_id uuid,
    enrolled_by_user_id uuid,
    enrolled_at timestamp with time zone DEFAULT now() NOT NULL,
    dropped_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: student_fee_charges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_fee_charges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    school_id integer NOT NULL,
    student_payment_id uuid NOT NULL,
    academic_year_id uuid,
    charge_type_id uuid NOT NULL,
    billing_occurrence character varying(32) DEFAULT 'per_year'::character varying NOT NULL,
    amount_due numeric(12,2) DEFAULT 0 NOT NULL,
    amount_paid numeric(12,2) DEFAULT 0 NOT NULL,
    currency character varying(3) DEFAULT 'OMR'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "CHK_student_fee_charges_billing_occurrence" CHECK (((billing_occurrence)::text = ANY ((ARRAY['per_year'::character varying, 'once_ever'::character varying, 'other'::character varying])::text[])))
);


--
-- Name: student_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_groups (
    student_id uuid NOT NULL,
    group_id uuid NOT NULL
);


--
-- Name: student_parents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_parents (
    student_id uuid NOT NULL,
    parent_id integer NOT NULL
);


--
-- Name: student_payment_discount_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_payment_discount_lines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_payment_id uuid NOT NULL,
    discount_type_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    remarks text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: student_payment_installment_receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_payment_installment_receipts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_payment_id uuid NOT NULL,
    level_payment_installment_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    paid_at timestamp with time zone DEFAULT now() NOT NULL,
    remarks text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: student_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    school_id integer NOT NULL,
    level_id uuid,
    level_payment_profile_id uuid,
    base_total_amount numeric(12,2) DEFAULT 0 NOT NULL,
    admin_adjusted_total numeric(12,2),
    currency character varying(3) DEFAULT 'OMR'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    course_id uuid,
    course_payment_profile_id uuid
);


--
-- Name: student_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_progress (
    id integer NOT NULL,
    status character varying(50) DEFAULT 'not_started'::character varying NOT NULL,
    score numeric(5,2),
    points_earned integer,
    teacher_notes text,
    student_notes text,
    started_date date,
    completed_date date,
    due_date date,
    is_late_submission boolean DEFAULT false NOT NULL,
    attempts_count integer,
    feedback text,
    attachments json,
    student_id uuid NOT NULL,
    course_id uuid NOT NULL,
    milestone_id uuid NOT NULL,
    updated_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: student_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_progress_id_seq OWNED BY public.student_progress.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.students (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "firstName" character varying(100) NOT NULL,
    "lastName" character varying(100) NOT NULL,
    "dateOfBirth" date NOT NULL,
    gender public.students_gender_enum NOT NULL,
    address text NOT NULL,
    phone character varying(20),
    email character varying(255),
    "emergencyContact" character varying(255) NOT NULL,
    "medicalInfo" text,
    notes text,
    "secondName" character varying(100),
    "thirdName" character varying(100),
    nationality character varying(100),
    "studentId" character varying(50),
    photo text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    user_id uuid,
    school_id integer,
    room_id integer,
    first_name character varying(100),
    family_name character varying(100),
    date_of_birth date,
    medical_conditions character varying(255),
    allergies character varying(255),
    emergency_contact character varying(255),
    group_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    payment_level_id uuid
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(255),
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    "firstName" character varying(100) NOT NULL,
    "lastName" character varying(100) NOT NULL,
    role public.users_role_enum DEFAULT 'student'::public.users_role_enum NOT NULL,
    roles text,
    phone character varying(20),
    address text,
    "dateOfBirth" date,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastLogin" timestamp without time zone,
    school_id integer,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    is_system_user boolean DEFAULT false NOT NULL,
    is_super_admin boolean DEFAULT false NOT NULL,
    user_type public.users_user_type_enum DEFAULT 'student'::public.users_user_type_enum NOT NULL
);


--
-- Name: weekly_session_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weekly_session_plans (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    schedule_id uuid NOT NULL,
    week_start_date date NOT NULL,
    week_end_date date NOT NULL,
    task_title character varying(255) NOT NULL,
    task_description text,
    is_completed boolean DEFAULT false NOT NULL,
    completion_date timestamp without time zone,
    completion_notes text,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    session_status character varying(20) DEFAULT 'pending'::character varying,
    completion_description text,
    completed_by character varying(36),
    completed_at timestamp without time zone,
    CONSTRAINT weekly_session_plans_session_status_check CHECK (((session_status)::text = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- Name: activities_legacy_pre_align_1777620000000 id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities_legacy_pre_align_1777620000000 ALTER COLUMN id SET DEFAULT nextval('public.activities_id_seq'::regclass);


--
-- Name: attendances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances ALTER COLUMN id SET DEFAULT nextval('public.attendances_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: parents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parents ALTER COLUMN id SET DEFAULT nextval('public.parents_id_seq'::regclass);


--
-- Name: platform_addons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_addons ALTER COLUMN id SET DEFAULT nextval('public.platform_addons_id_seq'::regclass);


--
-- Name: platform_invoices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_invoices ALTER COLUMN id SET DEFAULT nextval('public.platform_invoices_id_seq'::regclass);


--
-- Name: platform_modules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_modules ALTER COLUMN id SET DEFAULT nextval('public.platform_modules_id_seq'::regclass);


--
-- Name: platform_plan_features id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_plan_features ALTER COLUMN id SET DEFAULT nextval('public.platform_plan_features_id_seq'::regclass);


--
-- Name: platform_plan_modules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_plan_modules ALTER COLUMN id SET DEFAULT nextval('public.platform_plan_modules_id_seq'::regclass);


--
-- Name: platform_plan_prices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_plan_prices ALTER COLUMN id SET DEFAULT nextval('public.platform_plan_prices_id_seq'::regclass);


--
-- Name: platform_plans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_plans ALTER COLUMN id SET DEFAULT nextval('public.platform_plans_id_seq'::regclass);


--
-- Name: rbac_actions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_actions ALTER COLUMN id SET DEFAULT nextval('public.rbac_actions_id_seq'::regclass);


--
-- Name: rbac_pages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_pages ALTER COLUMN id SET DEFAULT nextval('public.rbac_pages_id_seq'::regclass);


--
-- Name: reminders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminders ALTER COLUMN id SET DEFAULT nextval('public.reminders_id_seq'::regclass);


--
-- Name: rooms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms ALTER COLUMN id SET DEFAULT nextval('public.rooms_id_seq'::regclass);


--
-- Name: school_landing_pages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_landing_pages ALTER COLUMN id SET DEFAULT nextval('public.school_landing_pages_id_seq'::regclass);


--
-- Name: school_modules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_modules ALTER COLUMN id SET DEFAULT nextval('public.school_modules_id_seq'::regclass);


--
-- Name: school_platform_subscription_addons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_platform_subscription_addons ALTER COLUMN id SET DEFAULT nextval('public.school_platform_subscription_addons_id_seq'::regclass);


--
-- Name: school_platform_subscriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_platform_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.school_platform_subscriptions_id_seq'::regclass);


--
-- Name: schools id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schools ALTER COLUMN id SET DEFAULT nextval('public.schools_id_seq'::regclass);


--
-- Name: session_media id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_media ALTER COLUMN id SET DEFAULT nextval('public.session_media_id_seq'::regclass);


--
-- Name: staff id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff ALTER COLUMN id SET DEFAULT nextval('public.staff_id_seq'::regclass);


--
-- Name: student_progress id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_progress ALTER COLUMN id SET DEFAULT nextval('public.student_progress_id_seq'::regclass);


--
-- Data for Name: academic_years; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.academic_years (id, year, start_date, end_date, is_active, school_id, description, created_at, updated_at) FROM stdin;
3ba07103-ccb1-4cc6-924b-a41847115a8d	2025-2026	2025-09-01	2026-06-30	t	1	Current Academic Year	2025-10-27 22:32:01.377689	2025-10-27 22:32:01.377689
fb7888ee-191e-4f30-88dd-a6feca27065a	2024-2025	2024-09-01	2025-06-30	f	1	Previous Academic Year	2025-10-27 22:32:01.379683	2025-10-27 22:32:01.379683
\.


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activities (id, title, description, activity_date, start_time, end_time, location, activity_type, is_active, school_id, group_id, created_by, created_at, updated_at, requires_parent_approval) FROM stdin;
2365795a-0e01-4e75-90fc-cee0298f73c2	aerheqhrt	werhqerh	2026-05-01	\N	\N	\N	Project	t	1	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	2026-05-01 13:24:25.60744	2026-05-01 13:24:25.60744	f
1d61bf8a-ab88-45f1-a112-38a94202ba49	4rhw3rthrth	wrthwrthw	2026-05-01	\N	\N	wrthwrth	Homework	t	1	efe57fcd-e10d-489f-a79a-3d6b50535bdc	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	2026-05-01 22:10:49.182662	2026-05-01 22:10:49.182662	f
6c4784ed-b30d-49b9-937e-80e032e31ee4	rtjhwertjyw	rtjwrtjw	2026-05-16	10:43:00	00:44:00	wthwrth	Class Activity	t	1	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	2026-05-16 09:42:00.655017	2026-05-16 09:42:00.655017	t
a9bb5cc5-5cf0-4f95-8490-bdf23ea84399	ergqerg	qergqerg	2026-05-16	00:04:00	03:06:00	qwefqwef	Project	t	1	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	2026-05-16 10:01:42.906392	2026-05-16 10:01:42.906392	t
8554812d-3e45-42d0-b63a-497183909f90	aethwrth	wrthrwth	2026-05-16	19:31:00	19:35:00	rwtbwrt	Class Activity	t	1	\N	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	2026-05-16 19:29:13.447426	2026-05-16 19:29:13.447426	t
\.


--
-- Data for Name: activities_legacy_pre_align_1777620000000; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activities_legacy_pre_align_1777620000000 (id, student_id, type, data, created_at) FROM stdin;
\.


--
-- Data for Name: attendances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attendances (id, attendance_date, status, check_in_time, check_out_time, notes, reason, is_excused, student_id, group_id, recorded_by, created_at, updated_at) FROM stdin;
1	2025-11-15	present	\N	\N		\N	f	c76bba3f-89f1-4cfa-b05a-941ac34be80a	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2025-11-15 21:22:28.419173	2025-11-15 21:22:28.419173
2	2025-11-15	present	\N	\N		\N	f	750d1305-e3d5-4191-9cd6-1e7ea77c6363	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2025-11-15 21:22:28.428301	2025-11-15 21:22:28.428301
3	2025-11-15	present	\N	\N		\N	f	deb13f05-a38d-4910-a0c2-ee07e5c104f2	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2025-11-15 21:22:28.433317	2025-11-15 21:22:28.433317
4	2025-11-15	present	\N	\N		\N	f	14799b1a-9596-4204-9d75-29dc977fa4de	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2025-11-15 21:22:28.440936	2025-11-15 21:22:28.440936
5	2025-11-15	present	\N	\N		\N	f	dddbd098-3eec-46d4-b4f5-cdf7f15f1638	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2025-11-15 21:22:28.456679	2025-11-15 21:22:28.456679
6	2025-11-15	present	\N	\N		\N	f	fd56bf92-62e8-4bd3-b054-8e3e292d3a03	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2025-11-15 21:22:28.459384	2025-11-15 21:22:28.459384
7	2025-11-15	present	\N	\N		\N	f	b35d8a54-d260-4c40-a0ea-ea349ec7e454	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2025-11-15 21:22:28.463299	2025-11-15 21:22:28.463299
8	2025-11-15	present	\N	\N		\N	f	d1b3a827-b220-468e-aff0-b04b2e4a4e88	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2025-11-15 21:22:28.466578	2025-11-15 21:22:28.466578
9	2025-11-15	present	\N	\N		\N	f	6e138a6a-2343-480c-b09d-d734bd7eee24	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2025-11-15 21:22:28.478966	2025-11-15 21:22:28.478966
10	2025-11-15	present	\N	\N		\N	f	6c452cf2-3307-4c0e-a1b3-4f5baee9c3ce	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2025-11-15 21:22:28.482602	2025-11-15 21:22:28.482602
11	2025-11-15	present	\N	\N		\N	f	70845b1d-ca99-4e7e-ba57-bec4279d7f53	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2025-11-15 21:22:28.484857	2025-11-15 21:22:28.484857
12	2025-11-15	present	\N	\N		\N	f	13635de0-762e-44b8-965a-001571e1922c	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2025-11-15 21:22:28.488092	2025-11-15 21:22:28.488092
13	2025-11-15	present	\N	\N		\N	f	7e2c867d-e99e-4f27-8a4a-f2e33e98f6bc	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2025-11-15 21:22:28.490719	2025-11-15 21:22:28.490719
14	2025-11-15	present	\N	\N		\N	f	b9a1f103-744c-456e-99f6-d50c12aafc2d	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2025-11-15 21:22:28.493345	2025-11-15 21:22:28.493345
15	2025-11-15	present	\N	\N		\N	f	eee33dcb-803a-4d07-a7fe-fbc7e7c8b84e	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2025-11-15 21:22:28.496295	2025-11-15 21:22:28.496295
16	2025-11-15	present	\N	\N		\N	f	4a72ec48-b917-4f2e-8f98-4aea8c80a30b	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2025-11-15 21:22:28.500903	2025-11-15 21:22:28.500903
17	2025-11-15	present	\N	\N		\N	f	4a54b0f9-a722-46d9-b95f-28df549a33c7	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2025-11-15 21:22:28.503223	2025-11-15 21:22:28.503223
18	2025-11-15	present	\N	\N		\N	f	d09157a4-bff9-4106-a3ae-30292164f649	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2025-11-15 21:22:28.507778	2025-11-15 21:22:28.507778
19	2025-11-15	present	\N	\N		\N	f	ee6f4e7e-53c2-4d66-9220-8e8112c2347a	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2025-11-15 21:22:28.510174	2025-11-15 21:22:28.510174
20	2025-11-15	present	\N	\N		\N	f	3f897370-0f2b-4c0f-bb34-f748e542ce9d	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2025-11-15 21:22:28.511918	2025-11-15 21:22:28.511918
21	2026-04-20	absent	\N	\N		\N	f	7e2c867d-e99e-4f27-8a4a-f2e33e98f6bc	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-04-20 20:28:50.717054	2026-04-20 20:28:50.717054
22	2026-04-20	absent	\N	\N		\N	f	b9a1f103-744c-456e-99f6-d50c12aafc2d	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-04-20 20:28:50.732937	2026-04-20 20:28:50.732937
23	2026-05-01	absent	\N	\N		\N	f	6f28a8bf-0035-459b-90f5-47a45d52bc1e	efe57fcd-e10d-489f-a79a-3d6b50535bdc	\N	2026-05-01 14:24:58.464557	2026-05-01 14:24:58.464557
24	2026-05-10	absent	\N	\N	Online session (auto-absent)	\N	f	c76bba3f-89f1-4cfa-b05a-941ac34be80a	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-05-10 23:53:43.411582	2026-05-10 23:53:43.411582
25	2026-05-10	absent	\N	\N	Online session (auto-absent)	\N	f	750d1305-e3d5-4191-9cd6-1e7ea77c6363	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-05-10 23:53:43.421562	2026-05-10 23:53:43.421562
26	2026-05-10	absent	\N	\N	Online session (auto-absent)	\N	f	deb13f05-a38d-4910-a0c2-ee07e5c104f2	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-05-10 23:53:43.42805	2026-05-10 23:53:43.42805
27	2026-05-10	absent	\N	\N	Online session (auto-absent)	\N	f	14799b1a-9596-4204-9d75-29dc977fa4de	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-05-10 23:53:43.432637	2026-05-10 23:53:43.432637
28	2026-05-10	absent	\N	\N	Online session (auto-absent)	\N	f	dddbd098-3eec-46d4-b4f5-cdf7f15f1638	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-05-10 23:53:43.455527	2026-05-10 23:53:43.455527
29	2026-05-10	absent	\N	\N	Online session (auto-absent)	\N	f	fd56bf92-62e8-4bd3-b054-8e3e292d3a03	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-05-10 23:53:43.466486	2026-05-10 23:53:43.466486
30	2026-05-10	absent	\N	\N	Online session (auto-absent)	\N	f	b35d8a54-d260-4c40-a0ea-ea349ec7e454	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-05-10 23:53:43.474712	2026-05-10 23:53:43.474712
31	2026-05-10	absent	\N	\N	Online session (auto-absent)	\N	f	d1b3a827-b220-468e-aff0-b04b2e4a4e88	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-05-10 23:53:43.481213	2026-05-10 23:53:43.481213
32	2026-05-10	absent	\N	\N	Online session (auto-absent)	\N	f	6e138a6a-2343-480c-b09d-d734bd7eee24	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-05-10 23:53:43.490901	2026-05-10 23:53:43.490901
33	2026-05-10	absent	\N	\N	Online session (auto-absent)	\N	f	6c452cf2-3307-4c0e-a1b3-4f5baee9c3ce	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-05-10 23:53:43.498578	2026-05-10 23:53:43.498578
34	2026-05-10	absent	\N	\N	Online session (auto-absent)	\N	f	70845b1d-ca99-4e7e-ba57-bec4279d7f53	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-05-10 23:53:43.512312	2026-05-10 23:53:43.512312
35	2026-05-10	absent	\N	\N	Online session (auto-absent)	\N	f	13635de0-762e-44b8-965a-001571e1922c	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-05-10 23:53:43.530046	2026-05-10 23:53:43.530046
36	2026-05-10	absent	\N	\N	Online session (auto-absent)	\N	f	7e2c867d-e99e-4f27-8a4a-f2e33e98f6bc	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-05-10 23:53:43.542661	2026-05-10 23:53:43.542661
37	2026-05-10	absent	\N	\N	Online session (auto-absent)	\N	f	b9a1f103-744c-456e-99f6-d50c12aafc2d	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-05-10 23:53:43.562249	2026-05-10 23:53:43.562249
38	2026-05-10	absent	\N	\N	Online session (auto-absent)	\N	f	eee33dcb-803a-4d07-a7fe-fbc7e7c8b84e	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-05-10 23:53:43.589242	2026-05-10 23:53:43.589242
39	2026-05-10	absent	\N	\N	Online session (auto-absent)	\N	f	4a72ec48-b917-4f2e-8f98-4aea8c80a30b	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-05-10 23:53:43.692872	2026-05-10 23:53:43.692872
40	2026-05-10	absent	\N	\N	Online session (auto-absent)	\N	f	4a54b0f9-a722-46d9-b95f-28df549a33c7	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-05-10 23:53:45.147825	2026-05-10 23:53:45.147825
41	2026-05-10	absent	\N	\N	Online session (auto-absent)	\N	f	d09157a4-bff9-4106-a3ae-30292164f649	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-05-10 23:53:45.271852	2026-05-10 23:53:45.271852
42	2026-05-10	absent	\N	\N	Online session (auto-absent)	\N	f	ee6f4e7e-53c2-4d66-9220-8e8112c2347a	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-05-10 23:53:45.347215	2026-05-10 23:53:45.347215
43	2026-05-10	absent	\N	\N	Online session (auto-absent)	\N	f	3f897370-0f2b-4c0f-bb34-f748e542ce9d	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	\N	2026-05-10 23:53:50.658791	2026-05-10 23:53:50.658791
\.


--
-- Data for Name: bus_fee_link_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bus_fee_link_lines (id, link_id, charge_type_id, amount) FROM stdin;
\.


--
-- Data for Name: bus_fee_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bus_fee_links (id, school_id, bus_id, fee_package_id, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: bus_movement_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bus_movement_logs (id, bus_id, student_id, event_type, logged_at, logged_by_user_id, trip_type, trip_date) FROM stdin;
96bbe8bd-895c-412e-b8ce-702b967a0687	c89802b4-8e18-4ff3-8720-49aa1b48b1b2	06c6d5e1-51d3-47fe-80b9-7fec6903a58b	dropped_off	2026-05-12 22:43:41.168534+04	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	going	2026-05-12
0607a40e-3f77-421d-a0b0-b81a4579bb92	c89802b4-8e18-4ff3-8720-49aa1b48b1b2	06c6d5e1-51d3-47fe-80b9-7fec6903a58b	boarded	2026-05-12 22:43:42.468577+04	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	going	2026-05-12
d59fb4e6-ec21-402c-a6d4-8e19cec68920	c89802b4-8e18-4ff3-8720-49aa1b48b1b2	077b0c2f-701f-47e0-b998-03c374b3a520	boarded	2026-05-12 23:41:09.866483+04	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	going	2026-05-12
e5d5520c-8a07-47c7-a557-1ba37186a6cc	c89802b4-8e18-4ff3-8720-49aa1b48b1b2	10d89a77-fb38-4ccc-9948-77d8e1b62256	boarded	2026-05-12 23:41:13.721561+04	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	going	2026-05-12
9951e60f-421f-4b48-ab41-90dc5788c844	c89802b4-8e18-4ff3-8720-49aa1b48b1b2	122397f2-90ca-4e29-9842-82da66fbfcb9	boarded	2026-05-12 23:41:15.935814+04	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	going	2026-05-12
8a4537e3-fa3a-46d1-9808-3b1ddf32d242	c89802b4-8e18-4ff3-8720-49aa1b48b1b2	06c6d5e1-51d3-47fe-80b9-7fec6903a58b	dropped_off	2026-05-12 23:41:17.432637+04	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	going	2026-05-12
55446831-898f-4c97-b094-d17060acd9f2	c89802b4-8e18-4ff3-8720-49aa1b48b1b2	077b0c2f-701f-47e0-b998-03c374b3a520	dropped_off	2026-05-12 23:41:18.303022+04	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	going	2026-05-12
cf2e0bce-4232-4dd8-adbb-abf49c44dbfb	c89802b4-8e18-4ff3-8720-49aa1b48b1b2	10d89a77-fb38-4ccc-9948-77d8e1b62256	dropped_off	2026-05-12 23:41:19.051023+04	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	going	2026-05-12
e347a58b-5550-4a86-bafb-48b651236427	c89802b4-8e18-4ff3-8720-49aa1b48b1b2	122397f2-90ca-4e29-9842-82da66fbfcb9	dropped_off	2026-05-12 23:41:19.937277+04	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	going	2026-05-12
0cb39a90-b6eb-4041-9917-2d68622265e6	e9a2f7be-4b0c-4ba4-8a89-568d146ace83	00d19686-927d-410b-b746-23defff4953c	boarded	2026-05-12 23:42:29.535112+04	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	going	2026-05-12
ef796a4b-45e9-4d34-aeab-db94f5982376	e9a2f7be-4b0c-4ba4-8a89-568d146ace83	00d19686-927d-410b-b746-23defff4953c	dropped_off	2026-05-12 23:42:33.482679+04	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	going	2026-05-12
46bbdb05-ec11-4170-a1bf-fae35bb7790a	e9a2f7be-4b0c-4ba4-8a89-568d146ace83	00d19686-927d-410b-b746-23defff4953c	boarded	2026-05-12 23:42:53.639826+04	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	return	2026-05-12
d0a9cb52-5980-4e75-9962-963fa43d3323	e9a2f7be-4b0c-4ba4-8a89-568d146ace83	00d19686-927d-410b-b746-23defff4953c	dropped_off	2026-05-12 23:42:56.184886+04	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	return	2026-05-12
ae02a385-9f65-42ab-8980-6f1b152f750e	e9a2f7be-4b0c-4ba4-8a89-568d146ace83	00d19686-927d-410b-b746-23defff4953c	boarded	2026-05-16 21:06:33.040617+04	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	going	2026-05-16
0a1a3302-fe24-42be-896e-fd563a658c15	e9a2f7be-4b0c-4ba4-8a89-568d146ace83	00d19686-927d-410b-b746-23defff4953c	dropped_off	2026-05-16 21:06:34.997199+04	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	going	2026-05-16
899200f6-41ab-4a3f-aa78-00c333910955	e9a2f7be-4b0c-4ba4-8a89-568d146ace83	14799b1a-9596-4204-9d75-29dc977fa4de	boarded	2026-05-16 21:06:36.043723+04	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	going	2026-05-16
f18750ed-5fca-4851-87c3-9162827c2b68	e9a2f7be-4b0c-4ba4-8a89-568d146ace83	14799b1a-9596-4204-9d75-29dc977fa4de	dropped_off	2026-05-16 21:06:36.857611+04	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	going	2026-05-16
a1d937a6-77f4-49df-a8df-45a4e7752d2e	e9a2f7be-4b0c-4ba4-8a89-568d146ace83	142ce12d-9d92-4aea-842a-56b4bbea309a	boarded	2026-05-16 21:06:40.197463+04	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	going	2026-05-16
\.


--
-- Data for Name: buses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.buses (id, title, driver_name, capacity, driver_contacts, school_id, is_active, created_at, updated_at) FROM stdin;
c89802b4-8e18-4ff3-8720-49aa1b48b1b2	atrhwrth	wrthwrt	40	tyjtyjetyj	1	t	2026-05-12 22:41:07.781038+04	2026-05-12 22:41:07.781038+04
e9a2f7be-4b0c-4ba4-8a89-568d146ace83	rgqerg	qergqerg	40	ergqerg	1	t	2026-05-12 22:41:57.838044+04	2026-05-12 22:41:57.838044+04
\.


--
-- Data for Name: class_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.class_settings (id, setting_type, name, duration_minutes, time_value, is_default, is_active, color, description, order_index, additional_settings, school_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: course_fee_link_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.course_fee_link_lines (id, link_id, charge_type_id, amount) FROM stdin;
\.


--
-- Data for Name: course_fee_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.course_fee_links (id, school_id, course_id, fee_package_id, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: course_payment_charge_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.course_payment_charge_lines (id, profile_id, charge_type_id, amount, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: course_payment_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.course_payment_profiles (id, school_id, course_id, course_pricing_basis, currency, created_at, updated_at, fee_package_id) FROM stdin;
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.courses (id, name, title, category, status, description, age_group_min, age_group_max, is_active, color_code, icon, send_notifications, estimated_duration_weeks, learning_objectives, prerequisites, materials_needed, school_id, academic_year_id, created_at, updated_at, "totalDuration", "createdDate", "lastModified", "targetAgeGroup", "difficultyLevel", "maxStudents", course_kind) FROM stdin;
ba36f22d-3ed1-4f61-b2e4-069172c82db9	gwerg	\N	\N	draft	rwegewrg	\N	\N	t	\N	\N	t	\N	\N	\N	\N	1	3ba07103-ccb1-4cc6-924b-a41847115a8d	2025-11-15 21:26:08.459262	2025-11-15 21:26:08.459262	\N	\N	\N	\N	\N	\N	milestone
d9fa2c8b-8d28-4668-bfd2-2773aba38fc3	تطوير اللغة العربية	\N	\N	draft	منهج شامل لتطوير مهارات اللغة العربية للأطفال في سن الروضة، يشمل القراءة والكتابة والمحادثة	4	6	t	\N	\N	t	\N	\N	\N	\N	1	3ba07103-ccb1-4cc6-924b-a41847115a8d	2025-11-21 10:57:46.661382	2025-11-21 10:57:46.661382	\N	\N	\N	\N	\N	\N	milestone
7d9cc680-1a3d-4090-9f54-66bb2155981d	ergqerg	\N	\N	draft	ergqergq	\N	\N	t	\N	\N	t	\N	\N	\N	\N	1	3ba07103-ccb1-4cc6-924b-a41847115a8d	2026-04-19 21:05:08.635002	2026-04-19 21:05:08.635002	\N	\N	\N	\N	\N	\N	milestone
cc1a9c19-1909-4c0e-a869-d85cd685840a	يلاتسفغتفغت	\N	\N	draft	فغتثفغتثفغت	\N	\N	t	\N	\N	t	\N	\N	\N	\N	1	3ba07103-ccb1-4cc6-924b-a41847115a8d	2026-04-19 23:02:52.761631	2026-04-19 23:02:52.761631	\N	\N	\N	\N	\N	\N	milestone
20b474fc-ab14-413c-9fd5-1459d3342146	sthrthsw	sthrthsw	\N	active	wrthwrth	\N	\N	t	\N	\N	t	\N	\N	\N	\N	1	3ba07103-ccb1-4cc6-924b-a41847115a8d	2026-05-12 22:51:46.85465	2026-05-12 22:51:46.85465	\N	\N	\N	\N	\N	\N	graded
\.


--
-- Data for Name: direct_chat_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.direct_chat_messages (id, thread_id, user_id, body, created_at, metadata) FROM stdin;
5ab961e2-8114-4fc4-be24-30745f4dc3a5	87c10d52-afdf-4472-a6aa-b9e3752e3ca2	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	sending message	2026-05-14 00:01:09.774772+04	\N
32b5645d-836b-4607-9aeb-b91149da22df	46717ffd-6f8a-4c7d-a515-87ad23f41ffc	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.395097+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
3d11edd7-35b8-4537-a982-51b96b2c8913	e6a640de-daa9-4589-8dcc-ca1076dd6da1	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.413034+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
26ce6336-7ee2-4fac-bed8-1a6f9f6f1e04	bbfafefd-a961-4108-8a8c-d3847f566aff	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.422057+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
98adc279-97a2-4744-bb02-e1d0b1d1f417	c17468c9-cb6b-47ad-8c6b-dd3cc0cab4de	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.438072+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
7579c333-471c-461d-b18d-5365309bca4e	91c589dd-ad28-456f-8f46-ae49e9683fb5	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.44804+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
bd05f64a-1d15-48c8-bff4-719ceafd7e21	bdf0f818-a31a-488d-a1eb-839f0a5d97d4	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.469351+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
df06a052-c0b5-4287-8988-933a6327e48c	9519d27b-a291-4a8d-a4c5-81bb3b9b1fe9	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.478679+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
cca0eb98-238a-4327-bee3-5e9001248d5f	d798eaaf-6777-417b-8830-698bb24ddd0b	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.497053+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
724c4424-5e78-422d-9a64-b2a5a3dd0858	f553dc1d-4c22-4faf-bed0-c188380b3fef	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.505991+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
7f22e372-1821-4b26-bc0b-cab6c53f993e	0bfbdf2b-0348-4eb7-942d-815d96eb4267	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.518027+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
13c15570-2666-4488-9079-6f93dd0a3619	d6938513-d151-49dd-95f1-22600e5fb2a0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.535531+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
62a0c008-8b95-4c3c-897d-da7d9d6499bd	e828760e-dece-4796-8ab7-0fada3b9d825	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.544954+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
b7523c92-39d5-4bbb-b25f-c2757bc10c78	8e319eb8-f9e2-4af6-b472-2f1bb2d9ba62	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.55764+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
b1dc8a12-9d95-477f-b9c0-cb4446de8583	fedf243f-91e4-45b0-809a-7731c4cda89f	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.566358+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
f36f07c3-3cff-40b3-9236-88a978d09f99	966919d1-e2a9-40ce-8aa8-015170936436	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.574938+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
7e6bd0cb-9f87-4e03-8c39-6a9e005a4753	a27b820c-984a-41a3-a640-d6587e9a78cf	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.586239+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
4b9c5d4a-fc11-4b28-a521-e701135e8297	eb36be3c-acd9-4960-98b9-89deb1988324	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.600735+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
0e1a2923-72d3-470d-a708-24cadf21fc87	20aeef05-03ce-46a0-8e63-028a5bac0593	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.608915+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
e9b1d371-24f7-4f80-935e-26bc5efae854	7cdb51e6-d182-4385-b328-88e982a980f9	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.616475+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
e5db9453-159d-4344-8517-8baf5c556b6e	153ada6e-30b9-411e-a8d2-76c87ab3e660	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.630173+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
741c09fc-f073-42ee-9915-bc225d3a9127	0ac64aeb-987a-4bc0-800e-50d5eb7168d3	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.646049+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
2dbf926a-5b5a-4be8-8247-f4b2d4a2396e	402d6137-8be4-4ee4-9342-8a625f03d3f7	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.653444+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
103c389e-9362-47a1-be7c-c7a034ab35d8	8416a689-1045-4c1f-a3d9-ab2dec15dd5f	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.659986+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
e63818d3-b522-4f91-ad0a-d3964793b5b9	5d2ab1c2-49f6-4be9-a24d-f461c07c5ac3	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.668305+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
ece015f3-393a-43ab-a9d9-b9a7f463154c	6c4c8b46-f8fd-4ed0-aca5-5f6645165039	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.675089+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
1939bdfc-c64c-4eb6-b666-a650ef1efb17	af076151-4fb9-4ab5-9139-2b6a6633ba76	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.681939+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
ab619260-e521-4932-a1fb-54d0a4facdbf	e840e366-6255-42eb-9d3c-6f59d4dcc6f8	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.688091+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
b7253be3-3060-4b56-a41e-cb51c7398159	127287b1-9d5c-452f-830f-c9264f8dc523	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.703002+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
d8d2a000-7cd2-443b-81ac-240d18e85878	561ff853-4f6c-42ba-a7de-a5c461a1503c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.70941+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
a5ea413b-c29b-4d57-928d-8ee7a9bf30df	2b14ba21-8e91-470a-91b8-b75e065a14eb	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.717765+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
e29e29cb-d3ba-47e5-9f6e-c56941377cc6	2fa871e8-3cf1-4651-bbbe-83ffece43ac6	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.724867+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
a623d54b-47d0-45f7-9e06-e2de7c29e915	ef73dcd8-434f-4982-8424-e425643a1fa2	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.732585+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
808e420d-d128-491f-8947-8b9ac43ce2eb	1f33924c-cfad-4878-87c8-d8baaa9d38c4	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.742129+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
967a6b72-9144-4cc8-ab76-bbea4de38129	b7c1d61c-3182-46ed-b3d3-56ba5b3f7510	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.749413+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
57b7bd04-456b-4785-853a-e8674cc58492	fe0fa330-55db-4aeb-9432-7f2e30983449	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.756239+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
a6878a57-6531-42d7-9b1e-a5919ec13c62	b258137a-170b-4b4e-9e00-852601043e31	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.763427+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
9104f3f0-be07-4a9b-a671-bcc7ed81c18f	0fb34a47-3a75-48c8-b088-b24980804d1e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 ergqerg\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.770128+04	{"kind": "message_letter", "title": "ergqerg", "approval": {"status": "pending"}, "letterId": "9a701c96-a591-4974-bbe8-e7a60b32a6ab", "activityId": "a9bb5cc5-5cf0-4f95-8490-bdf23ea84399", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
9025c376-e001-4a16-baf5-0d10a9193ad7	951e41c6-e1cb-4bcd-9194-11f1713c0b84	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.32217+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
3c1ee046-1b1e-4f7b-a0f9-6a575616bef0	c0592948-c7bd-4fed-aafe-27df2783c81d	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.335765+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
de4aea5d-22b2-4c23-84c5-374a8903132c	0ce16eea-6228-4f7f-8b99-5f83438d81a8	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.346308+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
0d5a5858-1bd8-42a4-9e5f-4f641bf75944	cbad2650-282b-4e61-bfbd-3a4b5f0951b0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.419535+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
2b09d2a9-c716-4c02-8158-c840140c0458	855958eb-9e71-41f8-87ac-b99fc63d5521	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.435+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
6ad4dd00-7ff3-4efb-b971-fbda76aed113	62f1b3cb-86fb-4230-91b7-72b85b50ba51	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.444232+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
8c94e7d7-d6e9-4965-87b2-3ebedc613ba4	85cf3b6b-98db-4fa8-a558-50891a6985a3	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.458577+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
4df7b26f-f2bc-43c1-9a91-ca67b0e63d85	5bad86d6-3f49-4d79-bd6f-0a1c434826e3	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.46974+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
7607778f-28f0-487b-95d5-eecf8093f537	18d3cf4b-8c27-416b-9fe7-2c41bd6b3808	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.4839+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
00828fc9-ae6e-4814-a69b-3872d72fbbdd	886e9889-25e8-4f65-a449-f50312e2ece0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.490537+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
4b0a00b8-cea5-4a6a-bcde-1127d8aafb1c	2781ecd3-7310-47a1-90eb-82b082366e66	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.499818+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
a6f92164-9a81-45bf-bb3b-ae77287ef7f9	5fe9f4d0-c7f0-4ab1-b361-7c5471ec7d6e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.505999+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
74769ded-fc6b-40b0-8adb-6cbd4f670a3b	2f296727-9074-4b70-91bc-34e2d85fc464	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.513281+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
0daa44ae-d45c-4515-93e1-b91d9d9d2470	38518ded-4cfb-4b54-adb1-51c72a2d5a33	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.521589+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
d6284d00-9673-4340-9822-beb37de769e9	95ec5106-a330-4465-a573-04fd3a4e23ba	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.529831+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
b34cc2f8-9361-4242-aa61-1ec6faff198f	6d281119-0e9e-49a6-a9bf-51c5a040e3fd	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.539375+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
c0bdc7cd-0ca5-428a-8995-8f337519ca1c	0aef4543-2aac-49c4-bd19-f89e6881f8a3	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.548305+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
625c26ee-709b-4bed-a731-3c86e586f8c9	992cdd99-2c9f-4070-a862-1e920fe19663	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.555867+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
9547920f-4ab0-467f-9829-6687fd7ebff3	862fe804-b0cc-4ba8-a1d1-0d2445f91241	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.564843+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
d9db5401-abae-4250-9213-e377034dce17	f72d7f1d-a42e-4bae-8294-b54b549ffafa	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.577542+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
8b7194b7-e66e-485d-ab92-569b48dff923	94749b81-7bd8-4c58-8753-880e3d5d8fcb	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.586512+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
e725c634-3beb-4731-93b6-8faa2af9ba4a	9e0b5020-ceac-4fc9-bc4f-6112fcd3d01f	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.668851+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
e88e73a1-81da-4310-b024-7f62742c40d1	206e9599-b5e8-4bad-a031-f4f6de654a01	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.685522+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
30b5a4e4-b75b-44b3-a0f8-51a5c424f8eb	f7d24f9f-4af6-4a77-9c49-d3b15a85b13b	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.697183+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
4177b3c3-1b40-48e0-b041-0baaf1f7e222	82a8f41b-f495-429e-b488-39d2a1cc3dd4	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.70619+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
358bc99d-94ad-468b-acf2-724bb3a29f65	e7c51de5-1ee9-416f-ae0d-3d5384038219	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.71682+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
43ad1306-6df7-4d8c-8f72-0843f8c39798	9aaddbf3-9155-494c-8557-4a8c65eca9e6	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.727555+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
5a6ca9b3-6fb0-4147-a9fb-c4042ef3f0c5	02f30739-1198-46e5-98f0-73879a5f7fcc	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.747315+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
925ca755-3d14-4a1e-8418-deed4dc89d36	176a34c9-7857-4450-9421-de2f68ef8724	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.76213+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
5c3e12ae-150a-4bea-911c-ffaf13a0c156	6cbaf582-3ffb-4c57-b9c5-57c8beb10495	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.768891+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
65ab1a19-e3ea-4d71-8820-98c604707ed4	3bd218ee-6787-47f1-bc7c-00702278a6b2	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.776102+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
bf6f9ef6-f929-45b1-9b74-8c29faddff48	314dce21-043f-4a3c-b7bc-70f5c4ace5bc	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.784751+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
4a6aebb2-8cff-434a-9da1-c0f74f874277	0ea59adf-9f26-47ae-a6a6-3ad8795e804c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.791978+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
f2b53ac0-c48f-4fb1-a7e5-73b30fb4be36	e152bd8e-48a0-408d-b103-c94fbd99460a	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.798312+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
35081b2c-6e3b-4ace-aa33-1dd94c20c138	64889fa9-0d7f-4d99-81df-69c186648921	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.836462+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
6cabcf13-b29b-47d2-8991-caaddef4a16e	b9c0963b-2787-4768-9667-4047ece1fb3e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.843129+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
cd5510d1-1519-4a9f-ae1e-6a9898b4717a	64b60704-d5c5-4f05-95ea-d62da7e1f91c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.853272+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
c76d5023-b7b4-444d-95bc-0b47c9e90a6d	0ae2a2f4-32a6-409c-ab39-4fcc11677a7e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.86217+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
65175cac-847c-4e8f-a2f1-d6c78bb8482e	5439d38a-e612-40b4-bf9b-be02ee9f475a	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.870152+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
24007f6f-889b-476c-99b5-9e6070c18a91	169f6902-cb07-4746-bdf0-3d246e6345ac	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.891721+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
3f5c6bd6-9160-46d1-8386-b01d11b28238	fa4bc1bc-1d95-46b5-b5ef-a527fe3df578	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.901167+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
d0f0781c-3944-45d5-873c-6c638915eccf	30d016d4-86c5-4310-bd14-b2f8baa4a1c4	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.909272+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
8685e899-65c2-49d8-90ae-68e434987c3b	b0e623fc-75b7-49bb-86dc-33abb33d72b3	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.916147+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
93b51141-0f52-420e-8aba-7ff5bbc859a7	c1a86400-f6a8-4015-9cc5-5cc96ae486ed	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.923553+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
47dec1c0-e2e3-40d5-8f0a-215631a4f3b8	44092b6d-06a9-4d26-b67b-fa195c445e21	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.932261+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
665b9d78-e907-46ec-b774-a025f52623a6	6210548d-d9c7-43f0-a37e-edb5b70280e0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.940638+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
4733f49a-6132-47bf-a584-a3efcdf7c98f	97dbe07e-0e14-4be2-b58c-ab262fc37fa0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.954828+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
9814ee0e-1a54-4520-beae-acc4536ec631	7505eac2-21a3-424d-89e8-4f9e2fff2d5b	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.966436+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
0e23986c-ddfb-4f52-95e4-a8e2ee90adee	ce8b4cb1-d3c5-4cf4-aa1c-b17527824e09	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.98009+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
4b4b99b1-07d3-4c50-843c-e01e30f7668e	359e78a2-dd01-4b8d-a449-6fb07fe3a5fa	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.990558+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
6a3947dd-eec4-4d76-b89e-86fd9005c5b4	b5722208-52a1-46bd-a658-18f8d5abb5a5	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.008198+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
477ad0a5-df44-4d81-9072-332525ea4ea3	b242083b-d635-4e18-8149-df0d8645ea7c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.019389+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
7f35edae-861c-4584-9e01-1d24ffaa61bf	bd0f4ad5-433e-4b1e-853b-cd4807b01319	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.07139+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
540f36a7-1289-4d2b-b0bc-8c22422cdb31	aab3b318-23b1-430c-9560-3642d13182b4	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.082794+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
a39e5b66-8c0b-403b-9bad-71e90b88eaf2	0c572fc7-2db9-4d70-9217-397c25760531	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.090328+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
c2cbd6ad-97e2-4dbd-ba08-152d75623208	2aaa6b9b-d153-4d1d-b6fe-1027c45efccb	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.098306+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
e3ff681f-18de-4db0-b26a-f94e6beb392a	37cbfe79-d10a-4c42-a369-85d9cec697ea	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.11313+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
4ef3fe42-6f1e-4d29-92b9-10cd3ce55bf2	754caee8-d102-4362-84ff-bf5656ecf02c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.122187+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
481caf0c-675c-4bd3-8d78-f6b52a9c5804	63321b27-57d8-422e-8cb0-317d224f9466	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.131769+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
17ddb5ed-edc7-401f-8c92-61cd48d28894	c091f200-6647-4445-936e-e4e1305db465	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.14013+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
bd84cd69-2b4b-4d20-9aba-f08a2d11e1d0	2ce7cfe6-efd1-448c-a1e5-129718cc0a2e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.148152+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
2d548f7b-3959-4998-becd-cebd992dc837	e1ea7a9f-006d-4016-8b90-bdd8ceecfc0e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.155892+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
940985e0-b5f3-47c1-9c45-77e1754f505f	a9a593f9-17ac-494a-b2b8-c487f7603ad5	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.169065+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
045a03cf-8f4b-48da-bb39-a5a3eb0f9fb0	591c68e0-a730-465a-bd51-988a17ac096b	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.176145+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
80b88a2a-5abf-448e-b689-af2599d1c1c9	208d9fb4-03a0-4706-8a21-22cf0aef48a7	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.182894+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
81d8a642-3a16-4a02-b3de-6cc5c12765b8	35fb10ce-f8da-4c4a-af10-1f78bee865ab	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.191635+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
cc362e96-1c9d-4ecb-b3a1-3302bc82e453	74c37a45-9787-46a2-937a-f5bda31c4bb5	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.203117+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
38c8bf61-e539-4e37-9c0c-235cc7ab05f1	0735a9fc-81e1-49b7-9b14-e91796264f67	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.214965+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
0b6f4984-23f4-4dd0-b9b0-48c3cde2ad31	2a8d7fd9-0966-4540-9058-423b4eee194b	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.221128+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
69624e1b-63ff-4d6e-a2cc-3fc4d06cce57	9b36ad5a-4225-473c-b6ab-6dbd1a4fab4c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.228804+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
8597476d-fb7a-4be5-a93c-0b414d6d4512	b7f9da54-b8ca-4329-89e5-616b63d2bcc4	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.2372+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
063d9f1e-f97b-4e67-984c-57dae24e82f0	9aac49b1-d9ba-492b-945b-eb00d5aff525	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.252461+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
751381bc-7cf8-4e09-9988-502486d481e6	74b5a1f2-cf92-4cdc-bbc0-7c8ce35c90ac	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.261031+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
38b7996c-2804-4561-8801-441052411022	49ca247a-4915-4673-a75b-579184a1c2f5	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.278819+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
7db7a2a5-062e-4869-81c0-458c9c442dc5	7eb078d5-09eb-494b-a851-96c4f2fcb228	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.291184+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
23032388-3681-453e-8002-c93329d59832	5fb43d0c-a7ec-45e5-8431-39ffe778857c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.299111+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
b1fb5515-ecbb-4506-b85d-0d8f2c074bc1	8c5588cf-05e4-4f3a-a605-7fea38155a3c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.306347+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
bfef6fbe-bfe8-4aad-b7c8-8ebe59f04b3b	e4197126-2678-4e2d-8d42-9b53e4ab1b30	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.317418+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
a411480c-986c-4a00-af77-97c4aee83fa9	38d8de14-bf89-4bda-9acf-6e4a9cbd751c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.366028+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
a5faea06-091c-4d51-856a-d261fa6b444b	265793b0-2c0a-4126-920e-668be904751f	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.388678+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
7db0e6b2-9d8e-4159-b20e-609f9d0e11e6	c002d5dc-c7f9-4982-96b4-c55c6ec63597	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.396458+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
40834f48-3028-4392-9a00-560b4aed64be	f11c6a19-702b-4b71-8545-eb5c2e108dfc	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.404512+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
a3262796-0f07-434e-b77c-985ae012077f	42b0e642-5a07-49ef-97c9-213ec212f228	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.411857+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
5ea75c83-dc81-4f6b-9923-b4bb40ae15ab	8569d567-e5d5-45d9-85d1-ee82672a9524	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.419581+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
3f8a6c3d-1924-4ee9-a104-61f43e4b16e6	10d6cdd0-bada-4c76-be1d-c9c31bf235bf	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.426581+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
95fb3b65-da29-47c5-b07f-28560317f442	a859f159-e5f5-41d6-b00c-18cd338b6ff3	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.44128+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
13131088-8e38-4c60-a07f-aed24de293a1	360593ad-a53d-4c25-bb0d-525c655a1283	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.449895+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
b22017ad-7a6a-4226-b633-60ac4115a14f	0c8d7930-21a3-4570-9042-680db73607a1	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.457463+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
fcb10d83-c382-4ccb-be94-872245b1bf0e	0e93642e-d69c-46cd-8dd8-9fd28ad1326c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.46442+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
15b18a36-b0a8-440e-9f56-09805eec98a1	1a0f6002-c230-4a38-9f6f-16bc2107a8bd	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.47471+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
3ed6e66b-ac0a-4bc3-9248-a59d19158c97	8e1f2989-0ecc-4ad5-8b63-2b2850469277	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.482093+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
6fa9689e-7bc5-439d-acd5-809b861791eb	13622ae8-41ad-4ba6-a0ff-e886503d5363	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.491033+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
cefcf7b1-e8f0-4e92-a56c-0378a802a2bc	7b39774d-0715-4285-8b65-6b5b4a1387d0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.498505+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
c796c515-f559-4fe2-b6a8-1c21fa9ffb2a	e398a246-9c28-4973-b56e-b9a708732b2b	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.50585+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
57f88517-1fdd-421e-953e-a38fcb605c31	637101f8-7b2a-44fb-a7e4-f82677f3b7ab	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.512281+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
7ae72dd7-be77-4aec-a4ee-14dd430ecbb5	0ef23b10-439d-467d-8dad-6bc778242bf0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.525791+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
b65bd248-a25f-4203-a92b-c54808e14b38	faf8e644-051d-46cc-b1a2-0982e61f47db	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.531879+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
a593ce99-31d2-47d5-9ff9-7155ed24e0a5	929e21ee-d73c-472f-868e-aa43d38e59a2	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.538892+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
88a70da2-cee7-4609-80fb-fbb3f5023bda	e5bc13eb-9857-417a-aeeb-e18f042fda31	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.545495+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
70dd359f-581d-4dd5-80c1-e4a8c65e3b5a	d9beb9b6-9fec-4caf-a3d1-e390bd2ac026	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.551911+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
31c891b9-ebf6-4a33-ba30-72e633a20251	016cafb7-5b92-485f-9ebf-df2507c49ff3	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.558805+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
3192c3c2-d3b0-48ac-a0e2-68dfad18b516	58792f5a-9921-4a0e-ae1d-70c98ff8743a	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.566215+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
3261b50e-fb3f-4b17-92dc-4bb43574904a	ecd9eb33-ab54-4710-9ebe-7be282ef7428	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.650127+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
6e393ede-ccbf-457d-8085-f3477117f0e0	19cdd40b-e618-472e-bf70-6b345ea8bfd1	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.656158+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
ed002bff-c7d4-425e-a654-9b4567246e9d	ec2c7a48-d68f-4e15-8062-b7ec9d27d767	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.685815+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
fa10d69c-b212-417c-a261-d4e1ed44d8e4	ee87151a-6adc-4c00-afc5-052da4459c91	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.692123+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
2fb7264a-f87b-4aa4-81f5-7d9b0ee7b670	15f02ea8-25b8-4ecc-b97e-5940d7766c4d	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.698069+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
9f11fd3b-8607-4cd8-aea6-6bc188a9195d	87028737-633c-4915-9369-2e51bad0b824	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.705765+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
8dd78ad3-1b56-4f30-b4d9-444558c465ad	e98094ab-a964-4ddf-a6ff-49c385c2bff1	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.712986+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
b29423e7-2b4e-41f2-90b7-54e1d9836b8e	84f29c89-4436-49cd-8681-4594e320627d	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.719427+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
8161aadb-771e-4063-b2dd-e28cc3702b18	2fbc1070-b1a3-431c-8719-94f2b86cb58f	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.743695+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
895e9cba-5696-4b3c-998a-7adf87d13e2a	f94629f2-8915-4d3b-b138-0924fa0487c2	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.750962+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
b1bf1ff4-5e57-4066-a51f-38c14a1b8900	06973130-c08d-4268-9fbe-8246bfda7e4d	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.760662+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
4c789b27-32e4-414b-b067-f4454ef47cdc	f2c37fdf-5837-4ff9-a8f8-3b64784b24a6	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.768425+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
42bfdada-2552-4190-8e81-6678fc8a1f7a	adbe2498-3cca-4b04-b091-d5883bbf9e5e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.776041+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
8a99bc9b-c284-4e7f-a52c-d5c0081259a4	166fbade-2948-4f01-9908-5c87356e17f8	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.783874+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
62a05302-b5a4-4ade-b102-b6ee303acefa	5c7f4cc6-3878-414e-a0d5-3996a84b1b0e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.799643+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
7c20218a-639c-4314-bab9-1b5e7caea243	45fc6fb5-f1bb-40f6-afb7-c9cfb7db078a	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.806762+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
96813a57-73c2-497f-8e90-b6ad60673d30	f1141fa6-6404-48fc-b6ad-d5bcaeed3f4b	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.816153+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
6e0fa3ba-8587-4e62-9267-efe1d8e8bbd2	5bdac25c-96a9-48d1-8fcd-797e4d422197	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.822863+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
12c29117-26ad-4980-9e7f-752af45e1cd8	3acf38b7-de43-4667-9a33-957d30d12f1f	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.829277+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
4875aeff-dfca-4b10-93a1-7b1ff9d45fa5	8337fb78-7229-4176-b5c8-8addd35d40a4	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.838158+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
afa35cfb-62d9-4aea-b8e7-857775790eb7	ed32037b-49be-459f-ad8b-b6b613a869a4	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.849979+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
d197fc92-4de3-4a4e-b84a-5bea55d1eb13	6bcac6b2-8d37-4615-80a4-50a9b879082c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.858+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
bdc250ae-1807-4c0f-be87-eb2c5bd9e267	666f2d46-688e-4007-a07d-1efa37651f53	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.864388+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
8cfa4b72-4f52-4c2f-8abe-d59c00e501e5	4cf823a7-57b5-469c-9e4a-c7389170c6e6	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.872422+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
ff02ffeb-d37d-4b0f-8acb-88fe4c59c3eb	09e2d341-867b-4d42-8696-02a28fc4b02c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.878784+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
be334c07-b497-4860-b9da-89f8836670ff	dc582f95-5cf6-477c-9eb8-845ee388e959	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.886392+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
30a30672-458f-4b7d-b5af-65418f524611	6eb32be5-e792-4c7e-a4ff-e1afc3d05eb0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.893422+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
d50f1830-8eb4-42f7-97d3-13f4a03f1314	5571d91d-3d8b-4bf7-8356-f10b044906cb	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.899334+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
309c7d29-7dd3-476a-9c55-ec6b5ff7ee3d	d8f8750d-1c3b-4da9-bf33-930733987cb8	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.907872+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
0d94bf60-98b6-4557-8d9a-e724e1b627ee	b635ca50-adc1-4738-b586-7de621ccdcb1	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.918655+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
3849bdb7-036e-49e6-8d66-b46cd7ab5f8b	639b48a4-f431-407e-ad49-aba745c55781	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.926906+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
104cefb3-bdf3-47bf-bdda-00a7bf9d99cd	2fbeff00-5d81-43ed-a34f-7bf6b368fa01	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.935098+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
8d981821-193c-42cf-8505-bc9d8e65df30	e27bf061-1306-44e8-9a8f-e1fc8d74cbc2	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.943767+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
e9238408-1e96-47c3-8456-879addafe189	a03a55fe-d975-4f89-b1c2-59966151e8af	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.950812+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
eae5d17d-fda2-4ced-94fa-f8806204026f	057340ed-f57e-4a2d-bb58-5b08edb48207	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.959033+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
2a59fe49-30ac-4108-b297-49198594c6ea	d42eba99-bdfd-4059-b671-1f509810e0a7	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.968708+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
f09fd394-1f0d-4c3f-ad5c-d425d629caee	1d737cf8-919a-432e-aec8-50322eb098cf	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.975829+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
0ce165ea-5870-4a9a-ab54-6e588d1535dd	489a05dd-2795-4974-a160-fdc5c135a363	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.982707+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
f0ba08b8-0ea0-42a3-89ca-016900b5ee4e	867d82e0-30ef-47ea-9434-d544db879773	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.988506+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
a1104e4f-08ff-452b-8b1d-00e405d5c5ad	7e43bdf8-af77-4eae-b62d-e41beffad68e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.9987+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
ebf140bd-5654-45ef-8e35-2f9fe870fcdf	e6b18993-1f8d-4390-bb41-ece6d541bd7e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.005654+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
f1ce95cc-b7b3-4136-8e3f-144a4f0644f9	4a647290-008e-4caf-8e76-08a7911d7ed7	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.01203+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
4ac41564-7bbe-41eb-b344-e956d20cc0ba	13370378-53d7-4a61-afc5-e9d80b26098c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.055809+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
3d506174-4485-4e41-a0bc-f53b3a8144b3	2b3f6fc6-3636-4da8-b2fe-94e67be70b71	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.064005+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
d52e2e5b-d359-4fb7-b70e-0ca3a5dd91ee	3fd886a3-83b6-4b16-a778-ec653153db7b	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.071193+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
b445bd95-7440-4386-ac3e-2a75ce3d822d	36de95ce-381d-49ba-b716-755c605ed30d	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.078359+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
c4d67959-8f72-444c-866e-6f806502b0fd	19620734-23f8-4acd-a507-ae6f8bdf944a	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.083493+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
de2f6a30-e669-422b-ab0d-391e3f91a7d8	e33c92c3-33d3-4fb9-96d6-8562e6dd3c19	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.091123+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
9c3729a7-b81c-4173-b701-86f4073d5f89	7844fde5-7dac-4bd6-95a7-d2d13f46711b	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.098192+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
8dc41e94-b999-4a54-a33d-b34eb247f9d6	6b1c6171-1dc2-4ef8-95f7-e18a801f1e24	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.104804+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
3822d7b0-5401-493a-b337-c471a992d605	2d37a0eb-55b7-4104-b9ae-c34cd62c41a2	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.111583+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
e7881fa5-c31f-4823-b38c-ae60966441da	c0fd6c96-30a0-415f-a123-00c18e091b9d	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.117922+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
714cafff-559f-4d5e-836a-6a012ccfc61e	116cf39f-55ca-4817-95d9-52163375f271	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.131689+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
460396d6-841f-4118-9e75-169195611e99	06afa59a-db49-45b2-bcbf-2ea8c53722ca	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.1431+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
2e0bf771-0e66-4eaf-9658-20181d2ed931	b8289dad-6e1c-4435-80a2-6618060f016c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.149796+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
687e9bd0-f882-4c2a-a74f-4cc41a206a76	461a320a-e606-4ce0-bf20-6308676541e4	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.155547+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
3f7df581-14dd-451b-8ffd-41f556d8b5ff	ee086248-2c25-43bc-a50e-5f6047eb9371	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.16304+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
31709740-3b96-40dd-9dbc-12a416f3154e	43b6c9c0-1fea-4a69-87f7-91d859ea7905	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.171932+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
9bd83421-1f08-40bf-a1b8-9e2afc33e45a	c28568b7-9e59-45a7-8f7b-da5eed8dc52e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.185821+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
d3da9824-7235-4ccb-928d-39019b6a0c55	8071a840-b780-4fa8-b52c-1c9fd20eb890	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.193716+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
988a58c2-02aa-4b30-9c15-ebdeb08ed560	169ce7d8-7ea4-4279-9c8c-139f990a903d	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.200303+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
6038a3cf-8ea1-4c65-aad1-6f2be6b37c0f	40369df8-fce5-4336-8eb0-69bb592f72dd	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.206529+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
c6a9b53c-d1d6-405b-96ca-6c26115cc5d5	3b5d56ba-8c11-467d-bd5d-4f2edc204459	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.212132+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
0e563468-2dc9-43ea-a465-a4057d76aa2c	29ca7bf6-204f-411f-a2fc-098adfbaf80d	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.219604+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
9995e4d0-1708-4276-9a35-ba5fd75eb39b	1bdacaf7-c061-4c7d-894a-f399ba860455	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.226722+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
d45ee3d5-ec75-42f7-9b40-08e04aeb8e11	ea245d9a-4001-470a-bd82-7e8531f28796	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.236672+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
3c99c211-f428-4c95-9562-b44d2d3168dd	103b7114-aaee-42ed-8115-d3db54761f68	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.244461+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
266ec4c1-7b2a-4f45-8a49-c07130bb9667	99c15767-3354-41f1-8dd1-f32c2cba877a	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.250673+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
0e2a42d0-5337-4a0f-beea-2c7d2c49aac3	4c6460ac-1a01-4358-8cf5-4e8d9f059964	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.26777+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
5a150110-ab2d-4b96-8ab2-7c65b817c707	64585619-5359-4a41-af11-930b9781f135	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.274769+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
9ba2760e-4131-46f6-b339-2748233d319d	9b904f3f-309a-4f62-b956-399ee80dde0e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.281761+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
9e1f2ecd-63ab-45e5-b28b-9f4e1be34757	fbe7396b-f404-428c-b9d6-7c0cbea862b7	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.289058+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
756e0548-6d32-453d-8d6e-a6f4809f48a7	4b3e03c2-3d49-4a56-9477-07af13710627	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.340317+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
8089e86c-f98d-46cd-bc54-4ac11a0ec881	612e24f5-5783-4601-81de-d9d2360d29b7	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.357865+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
0856b8e2-1a10-4249-b221-52364e8a6bb9	38a6e6d2-b139-44d9-8542-119bcee6a723	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.364627+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
56c8b1d4-664c-4ee9-b011-0c813dfdbbb8	9580f375-2824-4fde-a00b-54bc8de777e8	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.375025+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
34314ae1-aaa2-45c3-ad63-81b6b3b735dd	f523c3d8-454c-4a83-adf8-5057481f3022	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.38217+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
50bc3e45-d47e-4c56-9d5b-879fd575d3d8	f553dc1d-4c22-4faf-bed0-c188380b3fef	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.387686+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
a6f02eb2-b2c2-488d-82b0-4c8e35a78123	e840e366-6255-42eb-9d3c-6f59d4dcc6f8	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.400981+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
14a0745c-0768-4688-8ffb-80f87cba42ce	402d6137-8be4-4ee4-9342-8a625f03d3f7	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.407477+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
589b99be-0cea-4260-a1b1-d804977e961d	0ac64aeb-987a-4bc0-800e-50d5eb7168d3	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.413126+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
88970b3f-1100-4a19-bea3-e443d73688c8	d798eaaf-6777-417b-8830-698bb24ddd0b	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.418571+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
18311ffb-5dc7-4083-a334-26cc1259fddb	9519d27b-a291-4a8d-a4c5-81bb3b9b1fe9	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.425639+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
57c8ac95-c8d4-4a7f-8721-06bd0145ebfb	e828760e-dece-4796-8ab7-0fada3b9d825	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.432236+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
2a04c3ed-c0bc-4b0c-a015-6278aeaa9dde	561ff853-4f6c-42ba-a7de-a5c461a1503c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.438795+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
62a5f51c-e556-4006-b0f0-80d43ac70357	eb36be3c-acd9-4960-98b9-89deb1988324	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.444059+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
073d5acf-9738-4d0d-89c9-1c0832f10892	bdf0f818-a31a-488d-a1eb-839f0a5d97d4	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.449193+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
f5db8733-9fe7-4cab-a625-e0828169ae46	2b14ba21-8e91-470a-91b8-b75e065a14eb	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.454703+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
6e2dff8c-038d-4f27-ad81-443918207634	ef73dcd8-434f-4982-8424-e425643a1fa2	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.461529+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
771e9c5f-49fa-430a-ad68-4297ceb98acd	6c4c8b46-f8fd-4ed0-aca5-5f6645165039	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.468569+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
e17118a3-11cd-4255-b44d-4c4a1d06ec24	127287b1-9d5c-452f-830f-c9264f8dc523	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.480273+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
3246606a-60e5-4377-ab80-c06f018970fa	d6938513-d151-49dd-95f1-22600e5fb2a0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.485929+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
a703bf19-c8d3-428a-93db-52ae45a06e22	20aeef05-03ce-46a0-8e63-028a5bac0593	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.491463+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
9c65fb61-8efb-4402-93c3-83c80351e970	153ada6e-30b9-411e-a8d2-76c87ab3e660	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.496706+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
5f6d2ff8-7198-4b4a-833f-fc6792bb89b7	8e319eb8-f9e2-4af6-b472-2f1bb2d9ba62	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.502813+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
950f1884-b5df-4c10-b918-5de034a73dd6	5d2ab1c2-49f6-4be9-a24d-f461c07c5ac3	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.508186+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
aaff3696-119b-4bbc-b90a-8d8f105b9e59	fedf243f-91e4-45b0-809a-7731c4cda89f	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.51372+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
a9f9f84b-2551-43ff-a21c-baf235a7e2da	fe0fa330-55db-4aeb-9432-7f2e30983449	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.519692+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
1982b867-5803-482b-be6f-7fb5f9c5f6a7	0bfbdf2b-0348-4eb7-942d-815d96eb4267	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.536546+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
1e03cd2d-494d-4dfb-88d4-5e66750fac1c	b7c1d61c-3182-46ed-b3d3-56ba5b3f7510	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.541393+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
49684c88-f182-4845-a61c-1cd252a9e75f	2fa871e8-3cf1-4651-bbbe-83ffece43ac6	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.547042+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
ac3cbfb2-67ff-401e-bda8-6ffc5d2cc9c3	e6a640de-daa9-4589-8dcc-ca1076dd6da1	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.551703+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
4c6260d3-f48d-4c90-b460-d7cf31ca2699	b258137a-170b-4b4e-9e00-852601043e31	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.558748+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
1f03baad-0bbc-442e-bbee-1844f1858ef8	1f33924c-cfad-4878-87c8-d8baaa9d38c4	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.564906+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
5f3df4c0-805b-4f6c-97ec-d48dbd1906e0	91c589dd-ad28-456f-8f46-ae49e9683fb5	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.57093+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
c6043e74-1fee-41dc-b41c-811e66a7377e	46717ffd-6f8a-4c7d-a515-87ad23f41ffc	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.576353+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
05335094-5c79-49c4-ab94-e19736f8b9c8	0fb34a47-3a75-48c8-b088-b24980804d1e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.583119+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
c4f3e62a-03ed-49f9-b231-1d6b07c9c1c8	af076151-4fb9-4ab5-9139-2b6a6633ba76	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.589392+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
55c02df8-2762-4369-8ef4-13c1df4377fd	c17468c9-cb6b-47ad-8c6b-dd3cc0cab4de	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.596878+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
09583391-c242-4766-aa05-b99053d0a2e1	a27b820c-984a-41a3-a640-d6587e9a78cf	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.601821+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
a0b4789b-862c-41f8-8be7-7bda1a1bac89	7cdb51e6-d182-4385-b328-88e982a980f9	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.607968+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
a8ed6a04-0165-453d-b80d-29e6b93f8519	966919d1-e2a9-40ce-8aa8-015170936436	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.613286+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
138d3f82-db6b-457a-b6fc-bd0147f94877	bbfafefd-a961-4108-8a8c-d3847f566aff	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.620374+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
7dfc04f7-beef-4f13-80bc-dff460c90a44	8416a689-1045-4c1f-a3d9-ab2dec15dd5f	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.656108+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
1784e0f3-5b26-4088-9e87-ac9b11921580	bed4a0b7-0bda-44b8-8cbf-5b41f7795b57	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.663161+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
e25911e4-f8c0-4531-a829-6ea458a4de4a	2d5b46fc-5fa9-4d64-b7c3-c826e7c51dab	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.671657+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
ff661397-c925-415e-a03a-31d6bc62d6f9	02b1d448-d16f-414d-9d85-39de03890748	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.679779+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
75ebfa36-2463-419a-ad7b-64ff39c957f1	9f96ef5d-3b5b-46bd-abeb-2b82076e745b	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.687105+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
b5d773e1-39e0-426a-a069-42c4a89f95a1	2b5dc19a-9626-4a2b-8fbb-f3f4ff365da7	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.694196+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
6d25e712-8ceb-487d-8186-701d029cd931	f73d8803-8a73-4d17-b42f-b1737adf7897	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.701425+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
268b0b91-59c5-4b59-b420-50bccc3a7e58	010e9908-bce4-485a-ae70-171395620d36	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.708788+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
af9f70c8-e390-441e-802d-0c4523869af7	a23448ea-029a-4d13-9a31-4e392a0b6bf9	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.717318+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
9cb34ba2-a257-4eb1-bb0b-b93a10d58feb	56d44284-3662-4d6c-98f6-7501bc310c11	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.724493+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
31280a5e-fd3f-465d-b9fd-d1541aee56cf	97631930-d757-483f-b883-07eb25901252	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.742318+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
d6e3c907-2de1-40c6-bf08-8be15ab4cc11	baaa449b-df67-4901-9afb-531754a4ade7	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.749525+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
274e036d-afdb-4a7b-9473-32da6e7f15d0	aaeab24b-fc88-4f09-9755-07cc5630a475	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.759092+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
a3a20b63-567e-4c06-883f-232dfd791399	2cd416ce-dd47-4201-b9bd-1210aff1fdfd	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.765117+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
3224e65e-4540-41be-9c65-505f2458ccbe	e8be961a-3b2b-4339-aa68-20e3d1c95693	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.771882+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
f2a289e9-d19c-4fac-b77a-c7df7ad275d2	6e1c9a21-593d-4e6a-a135-18aa81e73647	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.780041+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
8e70114b-02d7-4293-b055-8e9696579bb6	46ab6b2b-f79b-41b5-8ddd-f32161de35d8	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.787298+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
508f71db-03bd-49f9-af84-1737eee97a79	c00ebaa9-a7a3-45a1-a78b-ef1890551c93	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.793772+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
6ef493aa-a452-430e-9b11-fabdc004e073	452a12c3-4cbe-4526-990c-a0797a1d4062	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.804546+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
6c193a60-ca7b-409f-90ed-f1a00ab6a341	422d69c3-5262-4ffa-a34d-a21aaaf9784c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.811872+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
1e99efa0-9ef8-499f-a133-a8121a53c8a8	00ce55a3-9bf8-48de-92cd-364248adab7a	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.818721+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
b03bc423-8eed-4ce9-9dfd-db0c777f97b6	926f36d4-a421-4fc7-a5bd-cb04801e885d	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.826437+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
0f04b83f-0319-4685-bd17-eacbc7580417	efac0f1b-cd30-4927-a084-0d1ccb0ecd84	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.833766+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
3a702e54-31e1-4be2-9e31-293123f433bc	41b88d6a-f246-4cf8-8bc6-01f2e647efac	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.84201+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
747a5c7a-6ed2-4545-b9b8-543636b95bc2	3d6ebf47-1234-4fba-8882-ecdf1fd5253a	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.849438+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
0088ff97-9385-4006-8bd1-66f4195a327d	df387960-68b2-4eff-afe0-59e02ae5ddbd	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.859666+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
b93cab90-dd05-40e0-a95f-757faeff74ee	38dcf0ce-8ca5-44a8-9400-8099d2233d97	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.865966+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
79cb3cb7-591c-49b8-ade5-e9108d5664ba	38dc5d5d-8e1c-4211-ab3c-9e66643b107c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.872879+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
4a3bf74c-84cd-4910-b124-ea903a40c184	204d3251-3ae0-4147-b593-4b16ca89946c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.87941+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
162aabc4-ec3b-4ba2-9fc1-7e35de9fd6ce	2b380a82-bb89-47b5-8afc-6abdc8422706	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.886388+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "pending"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
3bc0c796-9a87-45e2-9c5a-21f14ee8d211	37c36ead-6e13-41ff-acd9-3f58373e8c69	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.426948+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "approved", "resolvedAt": "2026-05-16T16:00:15.250Z", "resolverUserId": "75fcf6ec-87f2-4721-8b36-82eb9e612246"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
b83d11df-826c-40f9-afd7-090193fe90f2	31606e41-6e35-4ec5-859d-dfaf5c705d79	75fcf6ec-87f2-4721-8b36-82eb9e612246	45y245y2	2026-05-16 20:15:36.792617+04	\N
8a78a782-17e4-4536-8378-dcd1e11cdf5e	d9e5493e-62ec-4931-8494-51902aa98797	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	wrthwthw	2026-05-16 21:07:37.759925+04	\N
d3ab01b0-2afc-417e-b341-31a293b4b447	e1ce7c98-4361-4ea8-be96-ec32046cb83d	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.676719+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "approved", "resolvedAt": "2026-05-16T17:17:49.470Z", "resolverUserId": "c95db9d4-76c2-44d6-9814-a6caaf8695e1"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
53b7663d-9def-4e3d-b91f-4e5c4126dab6	8d7e7aaf-9297-4e12-b779-e142c9b65bed	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.730093+04	{"kind": "message_letter", "title": "aethwrth", "approval": {"status": "rejected", "resolvedAt": "2026-05-18T19:28:01.541Z", "resolverUserId": "d2260ae9-931a-4e45-9fcd-e13a6930e7c1"}, "letterId": "94a2bf08-c7d8-472c-9264-032e267f3d32", "activityId": "8554812d-3e45-42d0-b63a-497183909f90", "previewText": "موافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}", "requiresApproval": true}
\.


--
-- Data for Name: direct_chat_threads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.direct_chat_threads (id, user_low_id, user_high_id, school_id, last_message_at, last_message_preview, created_at, updated_at) FROM stdin;
df6f003b-79e3-48f8-b834-f119318503cd	857e6bf6-96ad-4b62-a176-8222ef36cfb9	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	1	\N	\N	2026-05-13 23:39:55.187083+04	2026-05-13 23:39:55.187083+04
87c10d52-afdf-4472-a6aa-b9e3752e3ca2	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-14 00:01:09.789+04	sending message	2026-05-12 23:44:58.489744+04	2026-05-14 00:01:09.791225+04
31606e41-6e35-4ec5-859d-dfaf5c705d79	73036766-e77b-478c-a6d4-db63e401baaf	75fcf6ec-87f2-4721-8b36-82eb9e612246	1	2026-05-16 20:15:36.796+04	45y245y2	2026-05-16 20:15:31.683972+04	2026-05-16 20:15:36.798015+04
d9e5493e-62ec-4931-8494-51902aa98797	375cd22f-3159-405d-8a4f-c3d496602a5d	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	1	2026-05-16 21:07:37.773+04	wrthwthw	2026-05-13 23:40:14.040805+04	2026-05-16 21:07:37.777449+04
0ac64aeb-987a-4bc0-800e-50d5eb7168d3	abd5c148-d97c-4244-acdf-95e7cf92ed99	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.413+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.644528+04	2026-05-16 19:52:14.414045+04
d798eaaf-6777-417b-8830-698bb24ddd0b	d32b1825-75d6-444f-84ea-f855f1686006	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.42+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.487914+04	2026-05-16 19:52:14.420717+04
9519d27b-a291-4a8d-a4c5-81bb3b9b1fe9	67c95ba0-a344-456e-9fc4-afda775bf2b4	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.426+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.476504+04	2026-05-16 19:52:14.426992+04
e828760e-dece-4796-8ab7-0fada3b9d825	5949e018-3869-4bd4-a2f4-3856e8065e95	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.433+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.542311+04	2026-05-16 19:52:14.433747+04
eb36be3c-acd9-4960-98b9-89deb1988324	b4d86f70-82cd-4053-92f4-16efd5f1e6a7	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.444+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.599155+04	2026-05-16 19:52:14.445079+04
bdf0f818-a31a-488d-a1eb-839f0a5d97d4	4c5ddd4d-2a22-4d50-ba19-14283117f045	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.449+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.464188+04	2026-05-16 19:52:14.450168+04
d6938513-d151-49dd-95f1-22600e5fb2a0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	eeca9c82-7fcc-43d4-83f8-5503573ebebd	1	2026-05-16 19:52:14.487+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.533101+04	2026-05-16 19:52:14.487237+04
20aeef05-03ce-46a0-8e63-028a5bac0593	114998a2-d21a-445e-bd4d-05493e3a4590	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.492+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.607157+04	2026-05-16 19:52:14.492541+04
153ada6e-30b9-411e-a8d2-76c87ab3e660	0edffcf3-0623-4e71-9702-5e728f566d7f	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.497+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.627781+04	2026-05-16 19:52:14.497763+04
8e319eb8-f9e2-4af6-b472-2f1bb2d9ba62	679e94d1-0e8d-4842-beec-ab0329ea0e99	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.503+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.555995+04	2026-05-16 19:52:14.503893+04
fedf243f-91e4-45b0-809a-7731c4cda89f	5b10a206-fcdd-445c-b916-95ab72d1549b	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.514+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.564104+04	2026-05-16 19:52:14.51506+04
0bfbdf2b-0348-4eb7-942d-815d96eb4267	850eef0b-ff54-47e4-90d5-14a867833327	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.537+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.515207+04	2026-05-16 19:52:14.537681+04
e6a640de-daa9-4589-8dcc-ca1076dd6da1	0ecc2e97-e108-43ff-bc55-c742c3e1f8d4	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.552+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.410641+04	2026-05-16 19:52:14.552871+04
91c589dd-ad28-456f-8f46-ae49e9683fb5	33041e4b-f11a-4334-b4cd-0530433ae3ce	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.572+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.445358+04	2026-05-16 19:52:14.57226+04
46717ffd-6f8a-4c7d-a515-87ad23f41ffc	3fddc882-3807-4549-b6e3-82624ae80c58	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.577+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.377689+04	2026-05-16 19:52:14.577923+04
c17468c9-cb6b-47ad-8c6b-dd3cc0cab4de	61d74fbe-fa29-4c37-bf8b-fc3908f6f2a4	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.597+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.436058+04	2026-05-16 19:52:14.598069+04
a27b820c-984a-41a3-a640-d6587e9a78cf	62184b85-92d0-4605-b538-fbbba60f4686	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.602+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.584312+04	2026-05-16 19:52:14.602785+04
7cdb51e6-d182-4385-b328-88e982a980f9	82357b55-c762-4d51-800d-20ac2eb6f137	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.609+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.614308+04	2026-05-16 19:52:14.609451+04
966919d1-e2a9-40ce-8aa8-015170936436	a18db352-b86b-4daf-b0b9-65d7c71a7684	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.614+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.572849+04	2026-05-16 19:52:14.61488+04
bbfafefd-a961-4108-8a8c-d3847f566aff	a084f27d-50cb-4be5-bdb9-32b39ad36725	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.622+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.420234+04	2026-05-16 19:52:14.622737+04
951e41c6-e1cb-4bcd-9194-11f1713c0b84	dbe79c7f-6cf5-41df-8a05-0c84c4b46fa2	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.325+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.305344+04	2026-05-16 19:52:12.32681+04
c0592948-c7bd-4fed-aafe-27df2783c81d	de38fecd-032e-4f61-9002-30247874fe55	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.337+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.33406+04	2026-05-16 19:52:12.33747+04
0ce16eea-6228-4f7f-8b99-5f83438d81a8	938115b6-0d75-454f-b8e0-ecaea88086c3	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.348+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.343773+04	2026-05-16 19:52:12.40649+04
cbad2650-282b-4e61-bfbd-3a4b5f0951b0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	f435dd70-eba6-40e6-a0aa-d2931c981f97	1	2026-05-16 19:52:12.42+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.417431+04	2026-05-16 19:52:12.421096+04
37c36ead-6e13-41ff-acd9-3f58373e8c69	75fcf6ec-87f2-4721-8b36-82eb9e612246	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.428+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.425297+04	2026-05-16 19:52:12.42854+04
855958eb-9e71-41f8-87ac-b99fc63d5521	1b00d302-f024-4cc1-ac45-acf566c8b31a	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.436+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.432729+04	2026-05-16 19:52:12.436714+04
402d6137-8be4-4ee4-9342-8a625f03d3f7	58135a72-0ae8-40b6-8dff-9883f9c8ea20	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.409+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.651796+04	2026-05-16 19:52:14.409347+04
561ff853-4f6c-42ba-a7de-a5c461a1503c	560baa98-ab6a-4b02-977c-d43c311dc74f	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.439+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.707714+04	2026-05-16 19:52:14.4399+04
2b14ba21-8e91-470a-91b8-b75e065a14eb	08ca1d7d-f5a9-4b41-a20b-cb65f1b338b7	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.455+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.715788+04	2026-05-16 19:52:14.455765+04
ef73dcd8-434f-4982-8424-e425643a1fa2	1af68d72-ffff-4b22-9787-020bf14a8a22	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.462+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.730644+04	2026-05-16 19:52:14.462989+04
6c4c8b46-f8fd-4ed0-aca5-5f6645165039	3a28697b-13db-4fcf-b7af-d1a92a74f215	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.47+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.673408+04	2026-05-16 19:52:14.470352+04
127287b1-9d5c-452f-830f-c9264f8dc523	4d9da7c4-6b9a-45f2-82c6-8496ead3892f	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.481+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.692929+04	2026-05-16 19:52:14.481398+04
5d2ab1c2-49f6-4be9-a24d-f461c07c5ac3	0ad9739d-fd32-415b-8acc-2c156d88a1d8	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.509+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.666558+04	2026-05-16 19:52:14.509467+04
fe0fa330-55db-4aeb-9432-7f2e30983449	2d03e2c4-b0eb-4193-a161-6c88f0521d14	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.52+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.753891+04	2026-05-16 19:52:14.520828+04
b7c1d61c-3182-46ed-b3d3-56ba5b3f7510	1dba2988-dc5c-49e2-b610-5e71a7b801da	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.542+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.747998+04	2026-05-16 19:52:14.542671+04
2fa871e8-3cf1-4651-bbbe-83ffece43ac6	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	fc7beb60-80cb-4b79-b5fa-2d3d12a65b8e	1	2026-05-16 19:52:14.547+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.72333+04	2026-05-16 19:52:14.547989+04
b258137a-170b-4b4e-9e00-852601043e31	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	f40df012-0e7b-49d9-85bb-a49365c1984c	1	2026-05-16 19:52:14.559+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.76179+04	2026-05-16 19:52:14.560089+04
1f33924c-cfad-4878-87c8-d8baaa9d38c4	4e889507-748c-42a5-b7ab-bfb8d464b1da	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.566+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.740304+04	2026-05-16 19:52:14.56623+04
0fb34a47-3a75-48c8-b088-b24980804d1e	a0e1619d-9000-42ab-aaad-2fd52513ad5c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.584+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.768693+04	2026-05-16 19:52:14.584295+04
af076151-4fb9-4ab5-9139-2b6a6633ba76	2ca13efe-bcfc-4f76-b25d-ebd544a5c652	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.591+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.680261+04	2026-05-16 19:52:14.591542+04
8416a689-1045-4c1f-a3d9-ab2dec15dd5f	a5443406-8818-405e-8ff2-3e7692560d93	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.657+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.658659+04	2026-05-16 19:52:14.657174+04
62f1b3cb-86fb-4230-91b7-72b85b50ba51	600f55e1-95f4-4bdb-8c98-71b86010b490	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.451+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.441579+04	2026-05-16 19:52:12.451601+04
85cf3b6b-98db-4fa8-a558-50891a6985a3	a9736adb-8352-4788-ac6a-cdb95aa7be33	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.46+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.45638+04	2026-05-16 19:52:12.46116+04
5bad86d6-3f49-4d79-bd6f-0a1c434826e3	0617d532-4659-4d17-bf6f-94371eacfc5e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.471+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.467155+04	2026-05-16 19:52:12.472374+04
18d3cf4b-8c27-416b-9fe7-2c41bd6b3808	0ba67a91-840f-4fe8-bbcc-3c271e4a3dd0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.484+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.481994+04	2026-05-16 19:52:12.485186+04
886e9889-25e8-4f65-a449-f50312e2ece0	afc7892c-c0df-47a5-ab0c-b5250d44d88f	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.493+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.48887+04	2026-05-16 19:52:12.4935+04
2781ecd3-7310-47a1-90eb-82b082366e66	879b6aaf-da65-4109-85bd-d2cccab26c26	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.5+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.498305+04	2026-05-16 19:52:12.50081+04
5fe9f4d0-c7f0-4ab1-b361-7c5471ec7d6e	de826c1d-ba79-4ccf-96d0-f9bd52d4f7f2	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.506+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.504381+04	2026-05-16 19:52:12.507032+04
2f296727-9074-4b70-91bc-34e2d85fc464	2d05f4da-c71c-4763-9571-47e997a3041a	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.514+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.51107+04	2026-05-16 19:52:12.514501+04
38518ded-4cfb-4b54-adb1-51c72a2d5a33	112d118e-e69f-4e8b-9190-7f218789bc5c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.522+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.519564+04	2026-05-16 19:52:12.523014+04
95ec5106-a330-4465-a573-04fd3a4e23ba	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	fcd76a90-e1df-49fa-876c-3fd92ccb367b	1	2026-05-16 19:52:12.53+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.527568+04	2026-05-16 19:52:12.531324+04
6d281119-0e9e-49a6-a9bf-51c5a040e3fd	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	f239e4b6-8bff-4bbc-8af1-a454ea371107	1	2026-05-16 19:52:12.54+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.537336+04	2026-05-16 19:52:12.540589+04
0aef4543-2aac-49c4-bd19-f89e6881f8a3	6430eba5-0852-48d3-90ef-1c42e6174bae	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.549+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.546132+04	2026-05-16 19:52:12.549697+04
992cdd99-2c9f-4070-a862-1e920fe19663	83f3fea3-37aa-4f61-82d0-26a14d0d48a1	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.557+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.554002+04	2026-05-16 19:52:12.557472+04
862fe804-b0cc-4ba8-a1d1-0d2445f91241	9ee33166-a310-42d9-8d8f-c36c0a8be6ee	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.566+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.562938+04	2026-05-16 19:52:12.566793+04
f72d7f1d-a42e-4bae-8294-b54b549ffafa	9063b1a2-4622-4cd5-b971-0b0f2122d1cf	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.578+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.575926+04	2026-05-16 19:52:12.578633+04
94749b81-7bd8-4c58-8753-880e3d5d8fcb	d94fa1e6-5133-4e17-9089-f949d586c076	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.587+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.584945+04	2026-05-16 19:52:12.588+04
9e0b5020-ceac-4fc9-bc4f-6112fcd3d01f	7b6bbca4-3576-45f8-a101-f1a73bab7239	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.669+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.667184+04	2026-05-16 19:52:12.670196+04
e1ce7c98-4361-4ea8-be96-ec32046cb83d	c95db9d4-76c2-44d6-9814-a6caaf8695e1	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.679+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.674497+04	2026-05-16 19:52:12.679742+04
206e9599-b5e8-4bad-a031-f4f6de654a01	452a9aa1-ab9b-4c49-99a2-2ddcc91b12db	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.686+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.683792+04	2026-05-16 19:52:12.686756+04
f7d24f9f-4af6-4a77-9c49-d3b15a85b13b	74454788-828b-4d65-b6cf-e61739b72417	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.698+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.692074+04	2026-05-16 19:52:12.699137+04
82a8f41b-f495-429e-b488-39d2a1cc3dd4	c304b685-48cb-4b14-946a-6afa4fb8d3c2	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.707+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.703662+04	2026-05-16 19:52:12.707295+04
e7c51de5-1ee9-416f-ae0d-3d5384038219	1b1dfb2a-2a9e-4145-99b5-fa01d074060b	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.717+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.714779+04	2026-05-16 19:52:12.718045+04
9aaddbf3-9155-494c-8557-4a8c65eca9e6	cd319ad1-4954-4d6e-b270-ce4808338b86	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.73+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.725002+04	2026-05-16 19:52:12.730328+04
02f30739-1198-46e5-98f0-73879a5f7fcc	9fa0b1eb-e112-4480-8d27-1f434ea1b391	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.748+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.744+04	2026-05-16 19:52:12.748289+04
176a34c9-7857-4450-9421-de2f68ef8724	c585ec6e-602e-49f9-b973-061cfebeb083	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.763+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.759999+04	2026-05-16 19:52:12.763438+04
6cbaf582-3ffb-4c57-b9c5-57c8beb10495	871b0869-b82d-4278-906a-0ffc1c7b6db5	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.769+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.767027+04	2026-05-16 19:52:12.770279+04
3bd218ee-6787-47f1-bc7c-00702278a6b2	978799bd-f2b7-448f-8384-33c82730da65	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.777+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.773925+04	2026-05-16 19:52:12.777633+04
314dce21-043f-4a3c-b7bc-70f5c4ace5bc	75b33b28-3d13-404b-a27a-58339c31f8c6	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.785+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.782006+04	2026-05-16 19:52:12.786065+04
0ea59adf-9f26-47ae-a6a6-3ad8795e804c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	ef989278-af74-48fb-bcc4-b2416be1f2f2	1	2026-05-16 19:52:12.792+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.790044+04	2026-05-16 19:52:12.793131+04
e152bd8e-48a0-408d-b103-c94fbd99460a	adb2ced4-d127-453c-a5c4-60528ef7995a	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.799+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.796639+04	2026-05-16 19:52:12.799477+04
64889fa9-0d7f-4d99-81df-69c186648921	34a104b6-52dd-4202-b67c-99e7a577d8c2	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.837+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.834993+04	2026-05-16 19:52:12.837278+04
b9c0963b-2787-4768-9667-4047ece1fb3e	34e55b8c-9584-4dfa-8f8f-b4e27413519c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.844+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.841395+04	2026-05-16 19:52:12.845228+04
64b60704-d5c5-4f05-95ea-d62da7e1f91c	6b9f3d36-0dde-4dc4-8453-54bae112f094	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.855+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.850451+04	2026-05-16 19:52:12.855507+04
0ae2a2f4-32a6-409c-ab39-4fcc11677a7e	dd820099-23c3-42c8-a668-9165418ae1ce	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.863+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.859855+04	2026-05-16 19:52:12.8637+04
5439d38a-e612-40b4-bf9b-be02ee9f475a	9d68391c-8ce3-4729-b2da-1ac583aef255	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.871+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.868532+04	2026-05-16 19:52:12.871224+04
169f6902-cb07-4746-bdf0-3d246e6345ac	da45f482-cbee-4e21-9415-164a0028fde0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.893+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.889638+04	2026-05-16 19:52:12.893392+04
fa4bc1bc-1d95-46b5-b5ef-a527fe3df578	dfc1672e-32b8-4e00-a7b9-85f3d8e078ca	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.902+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.898918+04	2026-05-16 19:52:12.902663+04
30d016d4-86c5-4310-bd14-b2f8baa4a1c4	6fb1743f-b438-41e7-be5c-7c074ed9c539	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.91+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.907769+04	2026-05-16 19:52:12.910312+04
b0e623fc-75b7-49bb-86dc-33abb33d72b3	e075a638-515c-4f91-9f10-c813701674b6	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.917+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.913967+04	2026-05-16 19:52:12.917331+04
c1a86400-f6a8-4015-9cc5-5cc96ae486ed	95d46a63-c799-4f9b-87cf-c6ebf82d4229	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.924+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.921679+04	2026-05-16 19:52:12.924889+04
44092b6d-06a9-4d26-b67b-fa195c445e21	8087566b-4a9a-4ce8-98bf-e1b4d72dd91b	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.933+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.930203+04	2026-05-16 19:52:12.93345+04
6210548d-d9c7-43f0-a37e-edb5b70280e0	28356a57-ca29-4252-8493-1e64d7e8c2ec	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.942+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.938809+04	2026-05-16 19:52:12.943086+04
97dbe07e-0e14-4be2-b58c-ab262fc37fa0	81072d14-e408-486a-8703-cbce17c8e9b7	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.955+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.951806+04	2026-05-16 19:52:12.956054+04
7505eac2-21a3-424d-89e8-4f9e2fff2d5b	262e9678-3021-4d71-8b93-00c1572155c0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.967+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.964159+04	2026-05-16 19:52:12.967487+04
ce8b4cb1-d3c5-4cf4-aa1c-b17527824e09	aa089a54-35e2-4fb3-b31b-3536b031577e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.981+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.976603+04	2026-05-16 19:52:12.981652+04
359e78a2-dd01-4b8d-a449-6fb07fe3a5fa	4679ecd4-b2cc-4b44-a1db-e07a640c7cc2	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:12.991+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:12.988885+04	2026-05-16 19:52:12.991816+04
b5722208-52a1-46bd-a658-18f8d5abb5a5	e23da144-61b6-47d6-85eb-0347d8ccfc04	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.011+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.005753+04	2026-05-16 19:52:13.01232+04
b242083b-d635-4e18-8149-df0d8645ea7c	4db122e0-a9c2-4263-89b0-a4e1fa5a00d9	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.022+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.016898+04	2026-05-16 19:52:13.022729+04
bd0f4ad5-433e-4b1e-853b-cd4807b01319	b790f3a8-5211-4773-9733-2afb92592a12	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.073+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.069637+04	2026-05-16 19:52:13.073884+04
aab3b318-23b1-430c-9560-3642d13182b4	7690a1db-c675-4653-a6e7-a876383417f0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.083+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.080697+04	2026-05-16 19:52:13.084084+04
0c572fc7-2db9-4d70-9217-397c25760531	b0b49458-cc73-4197-9e94-2d47a1ee9e2e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.091+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.088479+04	2026-05-16 19:52:13.091816+04
2aaa6b9b-d153-4d1d-b6fe-1027c45efccb	14a0f1ad-46cd-4616-82f7-c51dbc9d1f40	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.099+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.095734+04	2026-05-16 19:52:13.099909+04
37cbfe79-d10a-4c42-a369-85d9cec697ea	8af83477-f92b-43ba-8b8b-d792b38f3e1d	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.114+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.111075+04	2026-05-16 19:52:13.114483+04
754caee8-d102-4362-84ff-bf5656ecf02c	3becfdfb-403a-4064-8d7b-b751900779ed	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.123+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.119788+04	2026-05-16 19:52:13.123795+04
63321b27-57d8-422e-8cb0-317d224f9466	5d186609-1aca-4c68-8960-c45362e4e674	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.133+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.129546+04	2026-05-16 19:52:13.133386+04
c091f200-6647-4445-936e-e4e1305db465	44b07cd5-c193-4d4d-9dc6-fe3149e6c469	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.141+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.138061+04	2026-05-16 19:52:13.141871+04
2ce7cfe6-efd1-448c-a1e5-129718cc0a2e	e2faee80-b7cf-41af-8e51-29912e644725	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.149+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.145916+04	2026-05-16 19:52:13.149532+04
e1ea7a9f-006d-4016-8b90-bdd8ceecfc0e	a34aec95-775f-4acf-9d30-53b16c918e20	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.156+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.153357+04	2026-05-16 19:52:13.157096+04
a9a593f9-17ac-494a-b2b8-c487f7603ad5	0bee4d3a-1379-4662-8934-f0e151a1f6f4	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.17+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.166828+04	2026-05-16 19:52:13.170221+04
591c68e0-a730-465a-bd51-988a17ac096b	c26ae68f-8ac3-4a0a-a0d7-322575220280	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.176+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.173652+04	2026-05-16 19:52:13.177103+04
208d9fb4-03a0-4706-8a21-22cf0aef48a7	c58764c9-873f-428c-ad82-29731174d143	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.184+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.181084+04	2026-05-16 19:52:13.184397+04
35fb10ce-f8da-4c4a-af10-1f78bee865ab	52f5fdc0-3d20-4a30-8337-245a7906aa7d	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.193+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.189165+04	2026-05-16 19:52:13.193579+04
74c37a45-9787-46a2-937a-f5bda31c4bb5	b0678766-eda8-4232-80db-719ee165f1ab	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.204+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.20118+04	2026-05-16 19:52:13.204502+04
0735a9fc-81e1-49b7-9b14-e91796264f67	c94a555b-7ce6-4e8e-a035-0b8e150c335b	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.215+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.213333+04	2026-05-16 19:52:13.216194+04
2a8d7fd9-0966-4540-9058-423b4eee194b	77c826d9-860a-4ffb-94c2-900c5979e60e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.222+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.219703+04	2026-05-16 19:52:13.222452+04
9b36ad5a-4225-473c-b6ab-6dbd1a4fab4c	960554b6-4e45-49c2-b3ed-ba49cef0495a	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.23+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.227339+04	2026-05-16 19:52:13.23047+04
b7f9da54-b8ca-4329-89e5-616b63d2bcc4	1c19719a-2950-4cb0-95ec-48ca660ce897	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.238+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.235436+04	2026-05-16 19:52:13.238773+04
9aac49b1-d9ba-492b-945b-eb00d5aff525	a5a1e1b3-6f98-4092-af08-0fc1e7676909	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.253+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.250493+04	2026-05-16 19:52:13.253833+04
74b5a1f2-cf92-4cdc-bbc0-7c8ce35c90ac	cf7efac9-da83-46e8-bca1-4261136da64f	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.261+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.258581+04	2026-05-16 19:52:13.262137+04
49ca247a-4915-4673-a75b-579184a1c2f5	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	fa079dd0-dffa-4cd7-82f6-4563844ca893	1	2026-05-16 19:52:13.28+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.269235+04	2026-05-16 19:52:13.280846+04
7eb078d5-09eb-494b-a851-96c4f2fcb228	82f57cbf-83c7-4262-a0f4-4163874bb7c9	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.292+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.288445+04	2026-05-16 19:52:13.292743+04
5fb43d0c-a7ec-45e5-8431-39ffe778857c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	f98939d3-9078-49b1-be7f-05d272efb230	1	2026-05-16 19:52:13.3+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.297249+04	2026-05-16 19:52:13.300225+04
8c5588cf-05e4-4f3a-a605-7fea38155a3c	d4db4df5-7b08-4df8-8875-9c81732d1f96	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.307+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.304473+04	2026-05-16 19:52:13.30762+04
e4197126-2678-4e2d-8d42-9b53e4ab1b30	c1ed771a-e271-426d-85d1-7eb549904a8e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.319+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.314687+04	2026-05-16 19:52:13.319562+04
38d8de14-bf89-4bda-9acf-6e4a9cbd751c	2f68f713-f89a-4ba9-a407-3f6e587ededb	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.38+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.323204+04	2026-05-16 19:52:13.38113+04
265793b0-2c0a-4126-920e-668be904751f	b999d881-15bb-42fb-a16a-62197a0dccd4	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.39+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.385247+04	2026-05-16 19:52:13.390659+04
c002d5dc-c7f9-4982-96b4-c55c6ec63597	9758dd51-d35c-45d1-905f-acdb17292d9e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.397+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.394721+04	2026-05-16 19:52:13.39759+04
f11c6a19-702b-4b71-8545-eb5c2e108dfc	a2676579-27f9-4771-90cc-0a550284502f	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.405+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.402772+04	2026-05-16 19:52:13.405473+04
42b0e642-5a07-49ef-97c9-213ec212f228	0c161026-ab1e-45f0-8b28-ed1fa84f26cd	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.413+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.410015+04	2026-05-16 19:52:13.413337+04
8569d567-e5d5-45d9-85d1-ee82672a9524	89784620-631d-4615-aabd-ec85e26b61c2	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.42+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.417744+04	2026-05-16 19:52:13.420696+04
10d6cdd0-bada-4c76-be1d-c9c31bf235bf	70923e92-670f-42f6-a47f-3bf4f4c85425	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.435+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.424574+04	2026-05-16 19:52:13.435421+04
a859f159-e5f5-41d6-b00c-18cd338b6ff3	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	ec2a0493-ed8f-4357-b077-f0c3b70cdf40	1	2026-05-16 19:52:13.442+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.44006+04	2026-05-16 19:52:13.442308+04
360593ad-a53d-4c25-bb0d-525c655a1283	4c386882-d5be-4780-ba79-9396865b92d9	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.451+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.447622+04	2026-05-16 19:52:13.45131+04
0c8d7930-21a3-4570-9042-680db73607a1	88dc95f1-bd76-410d-91db-a5a3b9124975	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.458+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.45574+04	2026-05-16 19:52:13.458788+04
0e93642e-d69c-46cd-8dd8-9fd28ad1326c	30c52579-2048-4d00-b1e5-955d2436386c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.467+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.462667+04	2026-05-16 19:52:13.467791+04
1a0f6002-c230-4a38-9f6f-16bc2107a8bd	8ade8c92-ffa3-4126-9463-f945be259718	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.476+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.472513+04	2026-05-16 19:52:13.476426+04
8e1f2989-0ecc-4ad5-8b63-2b2850469277	7ff7703f-e9bb-4a79-af8e-f2ee3be7d530	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.482+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.48061+04	2026-05-16 19:52:13.482974+04
13622ae8-41ad-4ba6-a0ff-e886503d5363	58bd1bf3-df9a-46f7-bc47-9bb3daf9b603	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.492+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.489516+04	2026-05-16 19:52:13.492206+04
7b39774d-0715-4285-8b65-6b5b4a1387d0	0c931304-9451-4e4f-b784-1979772b239b	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.499+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.496652+04	2026-05-16 19:52:13.499828+04
e398a246-9c28-4973-b56e-b9a708732b2b	062d39fb-b105-4151-ba0a-c734c2feebd0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.506+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.504075+04	2026-05-16 19:52:13.50699+04
637101f8-7b2a-44fb-a7e4-f82677f3b7ab	229e8ef1-2ae7-4b8b-b2cf-03b7580962fb	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.513+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.510771+04	2026-05-16 19:52:13.513718+04
0ef23b10-439d-467d-8dad-6bc778242bf0	d7608138-1bfd-4c3b-837e-1bc1e6198678	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.526+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.524111+04	2026-05-16 19:52:13.526641+04
faf8e644-051d-46cc-b1a2-0982e61f47db	38fa0944-0f83-4039-af56-7663e215f9db	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.532+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.530726+04	2026-05-16 19:52:13.533374+04
929e21ee-d73c-472f-868e-aa43d38e59a2	7da42408-4383-4450-b75b-e1a902cd9198	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.539+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.537223+04	2026-05-16 19:52:13.539988+04
e5bc13eb-9857-417a-aeeb-e18f042fda31	7a2ca9e6-c8f9-48c5-847d-2bc4edeee4d0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.546+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.544069+04	2026-05-16 19:52:13.546514+04
d9beb9b6-9fec-4caf-a3d1-e390bd2ac026	6121a9d2-4c88-491c-99fb-08afd85b9210	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.553+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.550294+04	2026-05-16 19:52:13.553439+04
016cafb7-5b92-485f-9ebf-df2507c49ff3	5889749c-2b89-4d94-bd3f-cfb988ff9725	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.559+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.557196+04	2026-05-16 19:52:13.560183+04
58792f5a-9921-4a0e-ae1d-70c98ff8743a	508ebed4-44cd-4ce1-9ac9-19c9835df0e3	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.566+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.564397+04	2026-05-16 19:52:13.567173+04
ecd9eb33-ab54-4710-9ebe-7be282ef7428	050396ff-a166-43ea-af3a-d87013ccab7f	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.651+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.648764+04	2026-05-16 19:52:13.651499+04
19cdd40b-e618-472e-bf70-6b345ea8bfd1	0450c32a-17de-48fd-b5da-7dbf49da1683	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.656+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.654945+04	2026-05-16 19:52:13.657163+04
ec2c7a48-d68f-4e15-8062-b7ec9d27d767	4692c087-d170-4cf4-81f6-3de91d9b66a9	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.686+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.661513+04	2026-05-16 19:52:13.686793+04
ee87151a-6adc-4c00-afc5-052da4459c91	daf4bcc1-321f-43e9-9027-4f5c0cc85e58	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.693+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.690206+04	2026-05-16 19:52:13.693186+04
15f02ea8-25b8-4ecc-b97e-5940d7766c4d	a0caa5c4-f27c-4130-b9c3-9fe505577fb3	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.698+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.696684+04	2026-05-16 19:52:13.699027+04
87028737-633c-4915-9369-2e51bad0b824	701a1dcd-a3d7-4794-b9f6-cfb379f7bba7	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.706+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.704185+04	2026-05-16 19:52:13.707147+04
e98094ab-a964-4ddf-a6ff-49c385c2bff1	78257e11-5697-4f25-9e33-22d643c058fd	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.713+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.711587+04	2026-05-16 19:52:13.713994+04
84f29c89-4436-49cd-8681-4594e320627d	92b1e7e2-d80f-45c6-82f4-35e3edfa345a	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.721+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.717057+04	2026-05-16 19:52:13.721831+04
8d7e7aaf-9297-4e12-b779-e142c9b65bed	29eebfaa-db31-44b5-8d5e-38e5e70b2773	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.737+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.725718+04	2026-05-16 19:52:13.738296+04
2fbc1070-b1a3-431c-8719-94f2b86cb58f	86b7ae18-1a5e-42ea-af70-06b3e2f52dbb	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.745+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.742554+04	2026-05-16 19:52:13.74537+04
f94629f2-8915-4d3b-b138-0924fa0487c2	e430974d-cf7f-4002-af49-206cfb6e9a33	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.752+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.749268+04	2026-05-16 19:52:13.752557+04
06973130-c08d-4268-9fbe-8246bfda7e4d	7fb7537c-d176-4193-97d6-a02181150732	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.763+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.757425+04	2026-05-16 19:52:13.763469+04
f2c37fdf-5837-4ff9-a8f8-3b64784b24a6	2d08436e-13c1-42a5-8141-e9fc1ce3977c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.769+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.767038+04	2026-05-16 19:52:13.769747+04
adbe2498-3cca-4b04-b091-d5883bbf9e5e	dd5cd6f6-ff8c-4388-bd9a-cfbad6de25e6	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.776+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.774416+04	2026-05-16 19:52:13.776966+04
166fbade-2948-4f01-9908-5c87356e17f8	d6081ae2-5945-4c1e-bfe2-b523c3bb9285	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.786+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.781533+04	2026-05-16 19:52:13.786693+04
5c7f4cc6-3878-414e-a0d5-3996a84b1b0e	206d0f37-cf5e-426b-b2d5-c4eb64270af4	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.801+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.797546+04	2026-05-16 19:52:13.801334+04
45fc6fb5-f1bb-40f6-afb7-c9cfb7db078a	d9c69096-cb9a-4659-bcf2-d77386e926f0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.808+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.804958+04	2026-05-16 19:52:13.808594+04
f1141fa6-6404-48fc-b6ad-d5bcaeed3f4b	589ef6b4-9221-4f84-a9c7-a501ab74fe94	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.817+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.814528+04	2026-05-16 19:52:13.81759+04
5bdac25c-96a9-48d1-8fcd-797e4d422197	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	fb90e8f7-8e77-4578-8aff-365b31e9aa14	1	2026-05-16 19:52:13.824+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.821125+04	2026-05-16 19:52:13.824248+04
3acf38b7-de43-4667-9a33-957d30d12f1f	4746f4e0-dba5-4709-b184-01dd81f8ce76	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.83+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.827457+04	2026-05-16 19:52:13.831115+04
8337fb78-7229-4176-b5c8-8addd35d40a4	dadcdf93-6389-4b02-aa21-395765100eb6	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.839+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.834847+04	2026-05-16 19:52:13.84014+04
ed32037b-49be-459f-ad8b-b6b613a869a4	340beb3c-09c9-4165-8e48-cbabb790c218	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.851+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.846908+04	2026-05-16 19:52:13.851208+04
6bcac6b2-8d37-4615-80a4-50a9b879082c	00cce789-c94a-4d7a-b902-b3b559b96221	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.858+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.856295+04	2026-05-16 19:52:13.859246+04
666f2d46-688e-4007-a07d-1efa37651f53	7d287a6a-6e67-406d-a8a4-c39ee5abfc8c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.865+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.862798+04	2026-05-16 19:52:13.865687+04
4cf823a7-57b5-469c-9e4a-c7389170c6e6	c75c9ee0-0542-4b29-9d28-228b9641a77e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.873+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.870686+04	2026-05-16 19:52:13.873533+04
09e2d341-867b-4d42-8696-02a28fc4b02c	6ab29946-2b34-4591-a28d-309a53965cf2	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.88+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.877425+04	2026-05-16 19:52:13.880739+04
dc582f95-5cf6-477c-9eb8-845ee388e959	8ea74c5d-e7e5-4c41-a70d-3516728ae3e5	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.887+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.88511+04	2026-05-16 19:52:13.887403+04
6eb32be5-e792-4c7e-a4ff-e1afc3d05eb0	8a872ed0-d70d-40e5-8bc4-6325d64efedf	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.894+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.891732+04	2026-05-16 19:52:13.894415+04
5571d91d-3d8b-4bf7-8356-f10b044906cb	16967956-6195-4ea4-8427-52389d8f0a02	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.9+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.898101+04	2026-05-16 19:52:13.900635+04
d8f8750d-1c3b-4da9-bf33-930733987cb8	79aedf0c-beee-4966-82a0-9cdf232b34d2	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.909+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.904434+04	2026-05-16 19:52:13.91019+04
b635ca50-adc1-4738-b586-7de621ccdcb1	d1bbc32c-63bd-4144-99b9-794f9302c851	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.92+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.916343+04	2026-05-16 19:52:13.920376+04
639b48a4-f431-407e-ad49-aba745c55781	447bb373-1d1a-486a-85e4-77d22fcf76f7	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.927+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.924996+04	2026-05-16 19:52:13.927992+04
2fbeff00-5d81-43ed-a34f-7bf6b368fa01	16b566b9-cfbe-4957-92e7-2b1abf9fc251	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.935+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.933707+04	2026-05-16 19:52:13.936213+04
e27bf061-1306-44e8-9a8f-e1fc8d74cbc2	9294319d-46a2-42cc-a7c4-aa67b4413d62	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.944+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.94167+04	2026-05-16 19:52:13.944798+04
a03a55fe-d975-4f89-b1c2-59966151e8af	8f30fce8-0f4f-4088-9b56-46a6d50878ef	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.952+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.948966+04	2026-05-16 19:52:13.953341+04
057340ed-f57e-4a2d-bb58-5b08edb48207	35f776d1-55da-4bb5-95fe-76814b898980	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.96+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.957516+04	2026-05-16 19:52:13.960229+04
d42eba99-bdfd-4059-b671-1f509810e0a7	3146ee4a-8028-4223-8ee4-8c31f1b89a47	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.971+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.965066+04	2026-05-16 19:52:13.971477+04
1d737cf8-919a-432e-aec8-50322eb098cf	2de1e070-a8ab-4848-8753-97103be25a4a	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.976+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.974751+04	2026-05-16 19:52:13.976678+04
489a05dd-2795-4974-a160-fdc5c135a363	e882c565-48d2-425b-874e-6f4b7062d156	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.983+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.980729+04	2026-05-16 19:52:13.983747+04
867d82e0-30ef-47ea-9434-d544db879773	7187b603-dde1-404a-b7aa-2fcfe9279d25	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:13.989+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.987254+04	2026-05-16 19:52:13.989446+04
7e43bdf8-af77-4eae-b62d-e41beffad68e	7469ffeb-d3e4-4bbc-ae92-42dfe2f65a5c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:13.993259+04	2026-05-16 19:52:14.000291+04
e6b18993-1f8d-4390-bb41-ece6d541bd7e	a3fee07a-837f-47c3-b51f-e0dc998ee761	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.006+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.00429+04	2026-05-16 19:52:14.006803+04
4a647290-008e-4caf-8e76-08a7911d7ed7	dfdad4c3-98f3-4a2f-8b83-feb612f9d698	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.013+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.0107+04	2026-05-16 19:52:14.013342+04
13370378-53d7-4a61-afc5-e9d80b26098c	026aeaee-3886-4ca7-bd42-adb69c4dcf88	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.056+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.054468+04	2026-05-16 19:52:14.057156+04
2b3f6fc6-3636-4da8-b2fe-94e67be70b71	c75126c3-5c9a-44d7-bf38-799fbc60f6c0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.065+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.062438+04	2026-05-16 19:52:14.065379+04
3fd886a3-83b6-4b16-a778-ec653153db7b	7b2b66c0-ce89-407f-93bc-e2b1c28187b0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.071+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.069602+04	2026-05-16 19:52:14.072147+04
36de95ce-381d-49ba-b716-755c605ed30d	25165b46-4d4a-4b60-8aa7-11d65d4b0b1c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.079+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.077013+04	2026-05-16 19:52:14.079235+04
19620734-23f8-4acd-a507-ae6f8bdf944a	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	fc529176-1092-4912-a248-9dfd4e46f543	1	2026-05-16 19:52:14.085+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.082363+04	2026-05-16 19:52:14.085433+04
e33c92c3-33d3-4fb9-96d6-8562e6dd3c19	5f2397c2-a60a-43b5-bc2d-0dbf2224f31e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.092+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.089192+04	2026-05-16 19:52:14.09253+04
7844fde5-7dac-4bd6-95a7-d2d13f46711b	6232fc09-1a6d-4567-a9e2-1a40320dec97	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.098+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.096349+04	2026-05-16 19:52:14.099161+04
6b1c6171-1dc2-4ef8-95f7-e18a801f1e24	67ccaa1b-c79d-4da7-a937-aeebb695197e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.105+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.103116+04	2026-05-16 19:52:14.106114+04
2d37a0eb-55b7-4104-b9ae-c34cd62c41a2	212a03cd-6439-4847-9825-6c26cd264402	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.112+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.10993+04	2026-05-16 19:52:14.112753+04
c0fd6c96-30a0-415f-a123-00c18e091b9d	7bda3396-5546-428b-b550-2be19e61f02e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.119+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.116547+04	2026-05-16 19:52:14.119201+04
116cf39f-55ca-4817-95d9-52163375f271	56563198-8357-4534-ab1d-f8734ea5482c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.132+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.129988+04	2026-05-16 19:52:14.134507+04
06afa59a-db49-45b2-bcbf-2ea8c53722ca	ae54bd88-6e62-4ff8-b7b1-4cf64083114d	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.144+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.141699+04	2026-05-16 19:52:14.144507+04
b8289dad-6e1c-4435-80a2-6618060f016c	626a3c4c-86b1-4ff4-a98d-b5a8aee34b69	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.15+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.148257+04	2026-05-16 19:52:14.150857+04
461a320a-e606-4ce0-bf20-6308676541e4	508d3d5d-67c0-4ca4-96c9-1a3b7483aec3	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.156+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.154094+04	2026-05-16 19:52:14.156812+04
ee086248-2c25-43bc-a50e-5f6047eb9371	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	f1e2e99d-f1b5-433a-bb1b-6d3ccacc9e9f	1	2026-05-16 19:52:14.164+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.161376+04	2026-05-16 19:52:14.164359+04
43b6c9c0-1fea-4a69-87f7-91d859ea7905	d8893906-52fd-4fd3-8a86-0a306aa9bb6d	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.178+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.169456+04	2026-05-16 19:52:14.179018+04
c28568b7-9e59-45a7-8f7b-da5eed8dc52e	c04ad6bc-da5e-475d-a17b-775b7922fc85	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.187+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.183658+04	2026-05-16 19:52:14.187241+04
8071a840-b780-4fa8-b52c-1c9fd20eb890	cbe77914-89c3-4da1-a502-ee24b5c40552	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.194+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.191917+04	2026-05-16 19:52:14.195133+04
169ce7d8-7ea4-4279-9c8c-139f990a903d	a7a68c5a-ba51-4601-ad54-d8953b2ac03b	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.201+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.19853+04	2026-05-16 19:52:14.201614+04
40369df8-fce5-4336-8eb0-69bb592f72dd	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	f08add49-b480-46d4-9147-8029804238fe	1	2026-05-16 19:52:14.207+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.205092+04	2026-05-16 19:52:14.207761+04
3b5d56ba-8c11-467d-bd5d-4f2edc204459	4bbcc292-15dd-40c8-b8e1-f4da9859e232	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.213+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.210966+04	2026-05-16 19:52:14.213203+04
29ca7bf6-204f-411f-a2fc-098adfbaf80d	7928e3f6-2fd7-44e7-a75a-05f5ae0184c4	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.22+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.217785+04	2026-05-16 19:52:14.220806+04
1bdacaf7-c061-4c7d-894a-f399ba860455	c1e32556-ed91-4b87-92de-6ebeb97a5954	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.228+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.224792+04	2026-05-16 19:52:14.228665+04
ea245d9a-4001-470a-bd82-7e8531f28796	6083c320-18c6-4eb8-b865-c9570e321761	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.237+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.235075+04	2026-05-16 19:52:14.237732+04
103b7114-aaee-42ed-8115-d3db54761f68	a2f434d3-383b-46e7-9162-f727890716e3	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.245+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.24234+04	2026-05-16 19:52:14.245679+04
99c15767-3354-41f1-8dd1-f32c2cba877a	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	ee815e9f-bd7f-4b66-a445-6c68e5f69c07	1	2026-05-16 19:52:14.251+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.249281+04	2026-05-16 19:52:14.251715+04
4c6460ac-1a01-4358-8cf5-4e8d9f059964	30fb87e9-61a0-4cb0-9efb-0c3ce40b6104	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.268+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.256936+04	2026-05-16 19:52:14.269078+04
64585619-5359-4a41-af11-930b9781f135	8e10ee08-86a5-485a-9262-58ff35a54fae	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.275+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.273233+04	2026-05-16 19:52:14.275823+04
9b904f3f-309a-4f62-b956-399ee80dde0e	66706916-0a1a-4864-842a-e8c5391e9833	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.282+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.280084+04	2026-05-16 19:52:14.283228+04
fbe7396b-f404-428c-b9d6-7c0cbea862b7	e84b4419-0154-4ba7-b904-ba15401694ff	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.29+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.28705+04	2026-05-16 19:52:14.290895+04
4b3e03c2-3d49-4a56-9477-07af13710627	418eff25-67e1-4c9a-a06c-a712fcc18dd7	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.341+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.296618+04	2026-05-16 19:52:14.341439+04
612e24f5-5783-4601-81de-d9d2360d29b7	8afb2012-6421-4ba4-be28-68f2b449c544	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.358+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.356164+04	2026-05-16 19:52:14.359246+04
38a6e6d2-b139-44d9-8542-119bcee6a723	a96d6cab-67dc-4179-8a49-7bb79f239a2f	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.365+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.362964+04	2026-05-16 19:52:14.36634+04
9580f375-2824-4fde-a00b-54bc8de777e8	9e214396-7060-4258-a3ea-c73cfd2e5cbf	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.376+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.371915+04	2026-05-16 19:52:14.376632+04
f523c3d8-454c-4a83-adf8-5057481f3022	320f0cdb-71ed-488b-96bb-3f87700dfc73	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.383+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.380404+04	2026-05-16 19:52:14.38352+04
f553dc1d-4c22-4faf-bed0-c188380b3fef	7ace12da-6a3f-44eb-a654-cca95bd15fec	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.389+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.503465+04	2026-05-16 19:52:14.396139+04
e840e366-6255-42eb-9d3c-6f59d4dcc6f8	3f8df0e2-0f57-452f-9cde-60d97127b9e5	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.401+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 10:59:15.686695+04	2026-05-16 19:52:14.402067+04
bed4a0b7-0bda-44b8-8cbf-5b41f7795b57	2c6a8996-3fc3-4b82-a28a-e0d09eb7e7e6	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.664+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.660888+04	2026-05-16 19:52:14.664533+04
2d5b46fc-5fa9-4d64-b7c3-c826e7c51dab	06eae867-7451-4928-b39c-efaf1d89cb97	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.672+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.668523+04	2026-05-16 19:52:14.673313+04
02b1d448-d16f-414d-9d85-39de03890748	5a29b8bd-5abd-457f-a88a-ea17da54bb5a	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.681+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.677328+04	2026-05-16 19:52:14.681896+04
9f96ef5d-3b5b-46bd-abeb-2b82076e745b	b3d25e2e-166b-4e16-963f-c7eb5dbd1a25	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.688+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.685824+04	2026-05-16 19:52:14.688333+04
2b5dc19a-9626-4a2b-8fbb-f3f4ff365da7	cd710bef-f94f-411e-95af-e41c25b6dfa4	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.695+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.692478+04	2026-05-16 19:52:14.695857+04
f73d8803-8a73-4d17-b42f-b1737adf7897	d1c5048d-c936-4428-b86c-389e8ef99f27	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.702+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.700171+04	2026-05-16 19:52:14.702362+04
010e9908-bce4-485a-ae70-171395620d36	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	fa1fbdb7-4a31-4ea2-ace0-0887be03ebdd	1	2026-05-16 19:52:14.709+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.707122+04	2026-05-16 19:52:14.710872+04
a23448ea-029a-4d13-9a31-4e392a0b6bf9	c99ea4b6-1226-40bb-ba4a-40bdb793a186	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.718+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.715508+04	2026-05-16 19:52:14.718397+04
56d44284-3662-4d6c-98f6-7501bc310c11	63e3f2ee-ebba-4448-9cf6-97034ef5de6e	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.725+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.722735+04	2026-05-16 19:52:14.725723+04
97631930-d757-483f-b883-07eb25901252	4e93ec2a-c5b9-4339-9641-e06b61c71235	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.743+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.73001+04	2026-05-16 19:52:14.743928+04
baaa449b-df67-4901-9afb-531754a4ade7	67c5764d-3226-495f-9c90-065fade5a635	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.751+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.747939+04	2026-05-16 19:52:14.752165+04
aaeab24b-fc88-4f09-9755-07cc5630a475	555b318d-1aeb-442e-8781-1d5debe0d95b	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.76+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.756218+04	2026-05-16 19:52:14.760171+04
2cd416ce-dd47-4201-b9bd-1210aff1fdfd	acce19fe-feec-45e7-86d5-a28e079fefad	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.766+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.763887+04	2026-05-16 19:52:14.766248+04
e8be961a-3b2b-4339-aa68-20e3d1c95693	b2508337-08de-4efa-b9ad-8e20efd1f855	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.773+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.769988+04	2026-05-16 19:52:14.773267+04
6e1c9a21-593d-4e6a-a135-18aa81e73647	857e6bf6-96ad-4b62-a176-8222ef36cfb9	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.781+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.777765+04	2026-05-16 19:52:14.781296+04
46ab6b2b-f79b-41b5-8ddd-f32161de35d8	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	f800de52-f824-4d47-adc1-af5f59850718	1	2026-05-16 19:52:14.788+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.78557+04	2026-05-16 19:52:14.788279+04
c00ebaa9-a7a3-45a1-a78b-ef1890551c93	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	f15cb2a9-6ca4-4a40-a5a3-515986a9b573	1	2026-05-16 19:52:14.798+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.792232+04	2026-05-16 19:52:14.79863+04
452a12c3-4cbe-4526-990c-a0797a1d4062	52908c20-159f-4544-a5c6-476dcdcc3da2	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.805+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.803291+04	2026-05-16 19:52:14.805521+04
422d69c3-5262-4ffa-a34d-a21aaaf9784c	649857de-a8a7-4d0a-8d2a-dd4f604c1178	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.812+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.81028+04	2026-05-16 19:52:14.813066+04
00ce55a3-9bf8-48de-92cd-364248adab7a	89327c1d-ad23-4064-89f6-1529bcec86c5	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.819+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.817123+04	2026-05-16 19:52:14.819849+04
926f36d4-a421-4fc7-a5bd-cb04801e885d	3c942acf-3b20-4274-b93e-2d6981184843	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.827+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.824663+04	2026-05-16 19:52:14.827757+04
efac0f1b-cd30-4927-a084-0d1ccb0ecd84	ae5c9f8d-7079-40e6-a84f-b24c2512195b	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.835+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.832104+04	2026-05-16 19:52:14.835326+04
41b88d6a-f246-4cf8-8bc6-01f2e647efac	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	fd5795fa-6777-4c76-b7a9-610efa0185cc	1	2026-05-16 19:52:14.843+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.839826+04	2026-05-16 19:52:14.843251+04
3d6ebf47-1234-4fba-8882-ecdf1fd5253a	4a26a14d-2415-41ff-97fa-fca1a858a5a2	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.85+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.847692+04	2026-05-16 19:52:14.851076+04
df387960-68b2-4eff-afe0-59e02ae5ddbd	4ca4a4ed-30d7-4ed1-b9e8-4c080082ef2a	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.86+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.857716+04	2026-05-16 19:52:14.860945+04
38dcf0ce-8ca5-44a8-9400-8099d2233d97	9b6410bd-9cea-4b0d-a95b-3174233a9ea0	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.867+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.864264+04	2026-05-16 19:52:14.867432+04
38dc5d5d-8e1c-4211-ab3c-9e66643b107c	c088677c-7f6b-4123-82f4-f9ceaf0f6fcb	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.873+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.871419+04	2026-05-16 19:52:14.874187+04
204d3251-3ae0-4147-b593-4b16ca89946c	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	f5ccd2fe-8571-4670-b418-64a0e36d976c	1	2026-05-16 19:52:14.88+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.878075+04	2026-05-16 19:52:14.881331+04
2b380a82-bb89-47b5-8afc-6abdc8422706	4bb98e15-1b98-42b8-bca4-bcd845dcb680	e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	1	2026-05-16 19:52:14.887+04	📨 aethwrth\n\nموافقة {{schoolName}} رسالة من المدرسة عزيزي/تي {{parentName}}، يرجى تأكيد المشاركة في هذا النشاط. البداية: {{activityStartDate}} النهاية: {{activityEndDate}}	2026-05-16 19:52:14.884844+04	2026-05-16 19:52:14.887515+04
\.


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.enrollments (id, "fullName", tribe, "idNumber", gender, nationality, religion, "dateOfBirth", age, "hasSiblings", photo, "enrollmentStatus", "gradeLevel", "previousSchool", allergies, "allergiesDetails", seizures, "seizuresDetails", surgeries, "surgeriesDetails", "chronicDiseases", "chronicDiseasesDetails", "otherHealthInfo", "medicalReports", "guardianType", "fatherFullName", "fatherTribe", "fatherWorkplace", "fatherWorkPhone", "fatherMobile", "fatherEmail", "fatherMaritalStatus", "motherFullName", "motherTribe", "motherWorkplace", "motherWorkPhone", "motherMobile", "motherEmail", "motherMaritalStatus", "organizationName", "organizationPhone", "responsiblePerson", "responsiblePhone", "emergencyContactName", "emergencyContactTribe", "emergencyContactWorkplace", "emergencyContactWorkPhone", "emergencyContactMobile", "emergencyContactRelationship", area, village, landmark, "streetNumber", "alleyNumber", "buildingNumber", "housingType", status, notes, "studentId", "parentId", "createdAt", "updatedAt") FROM stdin;
72c36bad-65f4-4c11-8afc-d08ef47b7784	محمد سعيد راشد الغافري	الغافري	12345678	male	عماني	مسلم	2018-05-15	7	t	\N	new	kg1		t	حساسية من الفول السوداني	f		t	عملية اللوزتين	f		لا توجد معلومات طبية أخرى	[]	father	سعيد راشد الغافري	الغافري	وزارة التربية والتعليم	24567890	96512345	saeed.alghafri@gmail.com	متزوج	عائشة محمد البوسعيدي	البوسعيدي	ربة منزل		96587654	aisha.albusaidi@gmail.com	متزوجة	دار الرعاية الاجتماعية	24888999	خديجة سالم الهنائي	96599888	مريم أحمد الغافري	الغافري	مستشفى السلطان قابوس	24445555	96598765	عمة	مسقط	الخوير	بجانب مسجد الإمام	123	4	12	house	pending	\N	\N	\N	2026-01-20 21:54:30.70816	2026-01-20 21:54:30.70816
257c3c14-fdfa-49c7-8c3d-9f68b5a3cc12	rtwhrthrweth	rthwrth	34523462	male	erwghwerth	werthwrth	2025-01-20	1	t	\N	new	kg1		t		t		f		f		rthwrthw	[]	other	rwthwrth	wrthwrth	wrthwrt	hwrth	wrthwrth	ss@gg.cc	divorced	wrthrth	thwth	wrthwtr	hwrthw	wrthwth	ss@gg.cc	divorced	thwrth	wrthwth	wtrehwrth	wrthwrth	wrthwrth	wrthwrt	hwrth	hwrthwrt	wrthwrth	wrth	rwthwrth	wrthwrth	wrthwrt	hwrth	rthwrth	wrthwrth	house	pending	\N	\N	\N	2026-01-20 22:04:26.142332	2026-01-20 22:04:26.142332
e3496f98-56be-4d66-adcb-1b71f4c2c374	rwthwrth	wrthwrth	4352346	male	gwrthwrth	wrthwrth	2023-06-20	2	t	\N	new	kg1		t		f		t		f		utyty	[]	mother	ikyuyf	kjgjkgf	kuyfuy		8768765876	ss@gg.cc	divorced	mkjftf		kgjhg	78876	768576567	ss@gg.cc	married	luyuyf	98798767	8769786	9870987	89678568	7556	7868765	76786	9769876	vkjhfdfjh	96990879876	8979786879					house	approved	\N	\N	\N	2026-01-20 22:11:10.729064	2026-01-20 22:31:11.636724
5bd6b5a2-d2de-47dd-aeb3-832a4cb97c50	Test Student	t	245625	male	OM	\N	2020-07-05	6	f	\N	new	kg1		f	\N	f	\N	f	\N	f	\N	\N	[]	father	Father Name	\N	\N	\N	356735673	ss@gg.vv	married	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Emergency	\N	\N	\N	456345	uncle	Area	Village	\N	\N	\N	\N	house	pending	\N	\N	\N	2026-07-05 20:03:35.871973	2026-07-05 20:03:35.871973
\.


--
-- Data for Name: fee_package_charge_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fee_package_charge_types (id, package_id, charge_type_id, payment_timing, billing_frequency) FROM stdin;
0f88a8b3-3b46-48f9-bb32-773a791a7447	8996bd79-65ad-4ad4-a913-34f5cad7cb12	65c33b41-4589-433c-b6a4-a3cb93ddf320	installment	per_year
e84e12aa-8774-45c4-ad8f-809c5a8ca5a6	8996bd79-65ad-4ad4-a913-34f5cad7cb12	11051f98-0b0a-4cb2-b028-c838f37418c6	installment	per_year
1a561a92-d84f-4cb1-9cfa-73d6b9149149	8996bd79-65ad-4ad4-a913-34f5cad7cb12	e8ffbcfd-bec0-4f63-81bb-ba07a1ebd1c0	installment	per_year
9b777585-ede0-4e11-bf49-da2b12c65776	8996bd79-65ad-4ad4-a913-34f5cad7cb12	342e1c55-1e49-46ee-8a01-f160367d6c41	installment	per_year
b6236e70-8568-4bac-8382-e432a33c82a2	8996bd79-65ad-4ad4-a913-34f5cad7cb12	e0340f56-5165-40e5-8853-34d756a83df1	installment	per_year
c84ed39d-614a-405b-8c38-2f06008c527e	7d1b607a-0d56-40fb-ae08-a042ab292fa3	65c33b41-4589-433c-b6a4-a3cb93ddf320	installment	per_year
db891a6f-e74c-4030-b7e8-d2cf2f63453c	7d1b607a-0d56-40fb-ae08-a042ab292fa3	11051f98-0b0a-4cb2-b028-c838f37418c6	installment	per_year
ec6429bb-967c-4b79-a3df-74c43cb43f07	7d1b607a-0d56-40fb-ae08-a042ab292fa3	e8ffbcfd-bec0-4f63-81bb-ba07a1ebd1c0	installment	per_year
7f1a2ece-71be-4646-a241-68551d4db22d	069f58e1-ffca-47ee-ac2a-7332464ee5ee	65c33b41-4589-433c-b6a4-a3cb93ddf320	installment	per_year
b7d0ce48-b645-4f8e-ac66-fdf4d21c9b78	069f58e1-ffca-47ee-ac2a-7332464ee5ee	50ab5c7a-dacf-45a0-8811-04d1aeee2de1	installment	per_year
\.


--
-- Data for Name: fee_package_course_amounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fee_package_course_amounts (id, package_id, course_id, charge_type_id, amount) FROM stdin;
\.


--
-- Data for Name: fee_package_discount_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fee_package_discount_types (id, package_id, discount_type_id) FROM stdin;
\.


--
-- Data for Name: fee_package_installments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fee_package_installments (id, package_id, sequence, month_number, label, amount) FROM stdin;
\.


--
-- Data for Name: fee_package_level_amounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fee_package_level_amounts (id, package_id, level_id, charge_type_id, amount, billing_period) FROM stdin;
3e12067a-2204-433e-a527-dac3d5ec34e1	8996bd79-65ad-4ad4-a913-34f5cad7cb12	a37141f3-3407-4750-b747-d05758a2d650	65c33b41-4589-433c-b6a4-a3cb93ddf320	345.00	monthly
f23170cf-7327-48ec-9618-d8003cd679e7	8996bd79-65ad-4ad4-a913-34f5cad7cb12	a37141f3-3407-4750-b747-d05758a2d650	65c33b41-4589-433c-b6a4-a3cb93ddf320	345.00	semester
c22ed3bf-e709-43aa-af2e-e826c868c366	8996bd79-65ad-4ad4-a913-34f5cad7cb12	a37141f3-3407-4750-b747-d05758a2d650	65c33b41-4589-433c-b6a4-a3cb93ddf320	345.00	yearly
a647ca02-6f23-4d07-b307-7699f1b08460	8996bd79-65ad-4ad4-a913-34f5cad7cb12	a37141f3-3407-4750-b747-d05758a2d650	11051f98-0b0a-4cb2-b028-c838f37418c6	4564.00	monthly
0a2f2638-1169-463d-856e-7dc89955e150	8996bd79-65ad-4ad4-a913-34f5cad7cb12	a37141f3-3407-4750-b747-d05758a2d650	11051f98-0b0a-4cb2-b028-c838f37418c6	54646.00	semester
66aabeb6-d682-4332-940b-54aded85301d	8996bd79-65ad-4ad4-a913-34f5cad7cb12	a37141f3-3407-4750-b747-d05758a2d650	11051f98-0b0a-4cb2-b028-c838f37418c6	45345.00	yearly
67ab49e5-0028-4e67-9313-6f2babfee75e	8996bd79-65ad-4ad4-a913-34f5cad7cb12	a37141f3-3407-4750-b747-d05758a2d650	e8ffbcfd-bec0-4f63-81bb-ba07a1ebd1c0	456.00	monthly
8ed19b51-531b-44d0-8378-4b4b9d8c482f	8996bd79-65ad-4ad4-a913-34f5cad7cb12	a37141f3-3407-4750-b747-d05758a2d650	e8ffbcfd-bec0-4f63-81bb-ba07a1ebd1c0	45645.00	semester
c8270b67-30da-43d3-8fe4-490c3b7987db	8996bd79-65ad-4ad4-a913-34f5cad7cb12	a37141f3-3407-4750-b747-d05758a2d650	342e1c55-1e49-46ee-8a01-f160367d6c41	5645.00	monthly
c9e8aeff-2436-42b7-9a7f-e9d4c4e04796	8996bd79-65ad-4ad4-a913-34f5cad7cb12	a37141f3-3407-4750-b747-d05758a2d650	342e1c55-1e49-46ee-8a01-f160367d6c41	546456.00	semester
ff7b2daa-d2fb-410e-a055-42c08012029f	8996bd79-65ad-4ad4-a913-34f5cad7cb12	a37141f3-3407-4750-b747-d05758a2d650	342e1c55-1e49-46ee-8a01-f160367d6c41	56456.00	yearly
465b5d1b-497a-4786-8d4f-960ce5e9a9dd	8996bd79-65ad-4ad4-a913-34f5cad7cb12	a37141f3-3407-4750-b747-d05758a2d650	e0340f56-5165-40e5-8853-34d756a83df1	456456.00	monthly
c9c004ff-a622-4d52-b7ea-80a05e8fac0f	8996bd79-65ad-4ad4-a913-34f5cad7cb12	a37141f3-3407-4750-b747-d05758a2d650	e0340f56-5165-40e5-8853-34d756a83df1	45645.00	semester
e0f77877-a623-477c-bba4-733d52fafb64	8996bd79-65ad-4ad4-a913-34f5cad7cb12	a37141f3-3407-4750-b747-d05758a2d650	e0340f56-5165-40e5-8853-34d756a83df1	456456.00	yearly
\.


--
-- Data for Name: fee_package_level_period_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fee_package_level_period_settings (id, package_id, level_id, billing_period, downpayment_amount, installment_schedule_months) FROM stdin;
9565736a-938e-4613-9878-44b338a93ba2	8996bd79-65ad-4ad4-a913-34f5cad7cb12	a37141f3-3407-4750-b747-d05758a2d650	monthly	700.00	[1]
a750bf83-0ce6-429a-8779-c6a7865e170e	8996bd79-65ad-4ad4-a913-34f5cad7cb12	a37141f3-3407-4750-b747-d05758a2d650	semester	700.00	[1, 2, 3, 4]
f0fccc7b-f961-47fd-9fa8-a20434581cc5	8996bd79-65ad-4ad4-a913-34f5cad7cb12	a37141f3-3407-4750-b747-d05758a2d650	yearly	700.00	[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
\.


--
-- Data for Name: fee_packages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fee_packages (id, school_id, name, currency, year_payment_mode, course_pricing_basis, is_active, created_at, updated_at) FROM stdin;
8996bd79-65ad-4ad4-a913-34f5cad7cb12	1	erthwerth	OMR	one_time	\N	t	2026-05-15 22:59:12.477307+04	2026-05-15 23:32:45.470135+04
7d1b607a-0d56-40fb-ae08-a042ab292fa3	1	رسوم الطالب	OMR	\N	\N	t	2026-07-30 21:54:10.593174+04	2026-07-30 21:54:10.593174+04
069f58e1-ffca-47ee-ac2a-7332464ee5ee	1	الرسوم الدراسية	OMR	\N	\N	t	2026-09-01 08:12:55.795603+04	2026-09-01 08:12:55.795603+04
\.


--
-- Data for Name: grade_fee_link_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.grade_fee_link_lines (id, link_id, charge_type_id, amount) FROM stdin;
\.


--
-- Data for Name: grade_fee_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.grade_fee_links (id, school_id, level_id, fee_package_id, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: graded_assessment_schemes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.graded_assessment_schemes (id, course_id, total_marks, aggregation_method, created_at, updated_at) FROM stdin;
ea3801f1-bdff-4e8d-889e-ff9515c467fd	20b474fc-ab14-413c-9fd5-1459d3342146	100.00	sum	2026-05-12 22:51:46.85465+04	2026-05-12 22:51:46.85465+04
\.


--
-- Data for Name: graded_criteria; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.graded_criteria (id, semester_config_id, label, max_marks, sort_order, created_at, updated_at) FROM stdin;
869ee62e-ca44-4b31-96e7-e351c849acd3	fdbd8f3a-5a15-49f0-9307-73f37a1eb487	wrthwth	100.00	0	2026-05-12 22:51:46.85465+04	2026-05-12 22:51:46.85465+04
9ab4a4dd-123e-4daf-8145-84316e9b2a33	2c57b034-21a1-474c-94ba-48792a66b6a8	4dgdg	100.00	0	2026-05-12 22:51:46.85465+04	2026-05-12 22:51:46.85465+04
\.


--
-- Data for Name: graded_criterion_task_student_marks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.graded_criterion_task_student_marks (id, graded_criterion_teacher_task_id, student_id, mark, updated_by_teacher_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: graded_criterion_teacher_tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.graded_criterion_teacher_tasks (id, graded_criterion_id, teacher_id, group_id, course_id, description, due_date, sort_order, is_system_default, created_at, updated_at) FROM stdin;
30da4d03-7307-4128-8489-cb0ff96d940c	869ee62e-ca44-4b31-96e7-e351c849acd3	0f851929-30b0-4b1c-8f64-779bd03dae03	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	20b474fc-ab14-413c-9fd5-1459d3342146	w4thwuw254u	2026-05-19	0	f	2026-05-12 23:49:07.612279+04	2026-05-12 23:49:07.612279+04
901aa3d6-7224-407d-aedf-c938dc3e7fc1	869ee62e-ca44-4b31-96e7-e351c849acd3	0f851929-30b0-4b1c-8f64-779bd03dae03	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	20b474fc-ab14-413c-9fd5-1459d3342146	rtwhwrth	2026-05-19	1	f	2026-05-12 23:58:07.670038+04	2026-05-12 23:58:07.670038+04
1c8cf2cd-751e-46ab-bee6-d4a1b0256963	9ab4a4dd-123e-4daf-8145-84316e9b2a33	0f851929-30b0-4b1c-8f64-779bd03dae03	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	20b474fc-ab14-413c-9fd5-1459d3342146	ertherthwq	2026-05-19	0	f	2026-05-12 23:58:21.188032+04	2026-05-12 23:58:21.188032+04
\.


--
-- Data for Name: graded_semester_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.graded_semester_configs (id, scheme_id, semester_index, title, created_at, updated_at) FROM stdin;
fdbd8f3a-5a15-49f0-9307-73f37a1eb487	ea3801f1-bdff-4e8d-889e-ff9515c467fd	0	\N	2026-05-12 22:51:46.85465+04	2026-05-12 22:51:46.85465+04
2c57b034-21a1-474c-94ba-48792a66b6a8	ea3801f1-bdff-4e8d-889e-ff9515c467fd	1	\N	2026-05-12 22:51:46.85465+04	2026-05-12 22:51:46.85465+04
\.


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.grades (id, "nameEn", "nameAr", code, "displayOrder", "isActive", description, "createdAt", "updatedAt") FROM stdin;
68ce49d7-fd2f-464c-a17a-9196324be4a0	Nursery	الحضانة	nursery	1	t	For children aged 2-3 years	2026-05-13 19:40:19.889624+04	2026-05-13 19:40:19.889624+04
3a8d6c9e-cfa0-4f84-bb5b-b36ddfe0b6f1	KG1	الروضة الأولى	kg1	2	t	For children aged 3-4 years	2026-05-13 19:40:19.902035+04	2026-05-13 19:40:19.902035+04
d74cf7a0-39be-496b-88e8-7b6e450d7e1f	KG2	الروضة الثانية	kg2	3	t	For children aged 4-5 years	2026-05-13 19:40:19.906649+04	2026-05-13 19:40:19.906649+04
6f13da5b-b97d-4d6b-ba62-d8a4678a937d	Preschool	التمهيدي	preschool	4	t	For children aged 5-6 years	2026-05-13 19:40:19.910141+04	2026-05-13 19:40:19.910141+04
\.


--
-- Data for Name: group_chat_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.group_chat_messages (id, group_id, user_id, body, created_at) FROM stdin;
25382eb0-e86a-442f-8b6f-b1a2d9c1204c	efe57fcd-e10d-489f-a79a-3d6b50535bdc	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	hwrhtw	2026-05-04 19:39:40.140719
f1915ac1-c1fc-47d2-9606-901254e7660a	efe57fcd-e10d-489f-a79a-3d6b50535bdc	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	teyjetyj	2026-05-04 19:39:44.084703
1003e4b2-babd-429f-ba89-ee75d2086356	efe57fcd-e10d-489f-a79a-3d6b50535bdc	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	hellow, how are you  doing	2026-05-04 19:45:37.189414
e4595f81-66c3-4d50-8c62-732cc1e1124f	efe57fcd-e10d-489f-a79a-3d6b50535bdc	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	rthwrthwrthwrth	2026-05-04 19:47:57.612997
09664cec-104f-4eec-9fe6-8ad7ef00bed2	efe57fcd-e10d-489f-a79a-3d6b50535bdc	c585ec6e-602e-49f9-b973-061cfebeb083	rwthwrhtwrhrthwrthwrthwrthwrthwrthwrth	2026-05-04 19:48:06.198649
110609f7-64c3-46d8-bd0c-fcb9f634d59c	198ff890-0654-4f21-b056-8ba3ec22e687	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	ergqergqerh	2026-05-04 19:55:36.573143
0880b275-0e64-42dd-b075-b4feef76fd9d	198ff890-0654-4f21-b056-8ba3ec22e687	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	rtjwrtj	2026-05-16 21:07:45.598092
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.groups (id, name, description, age_range_min, age_range_max, capacity, is_active, color, status, "studentCount", "teacherCount", school_id, room_id, academic_year_id, created_at, updated_at, level_id) FROM stdin;
198ff890-0654-4f21-b056-8ba3ec22e687	ابن الذهبي	Preparatory - Supervised by حميدة	2	4	25	t	\N	active	21	1	1	\N	fb7888ee-191e-4f30-88dd-a6feca27065a	2025-11-01 13:05:13.067017	2025-11-01 13:05:16.012773	\N
fc4ec62f-e19a-4443-8e44-18173552ac07	الفراهيدي	Kindergarten - Supervised by شمسة	4	6	25	t	\N	active	21	1	1	\N	fb7888ee-191e-4f30-88dd-a6feca27065a	2025-11-01 13:05:18.137191	2025-11-01 13:05:20.708593	\N
f3815444-5a11-479b-bd1f-a109adf8131e	البحار أحمد بن ماجد	Preparatory - Supervised by زيانة	2	4	25	t	\N	active	21	1	1	\N	fb7888ee-191e-4f30-88dd-a6feca27065a	2025-11-01 13:05:10.066391	2025-11-01 13:05:12.994957	\N
8475490d-e2b4-4d47-8425-6d93605140c1	عائشة الريامية	Preparatory - Supervised by نسيبة	2	4	25	t	\N	active	15	1	1	\N	fb7888ee-191e-4f30-88dd-a6feca27065a	2025-11-01 13:05:16.08357	2025-11-01 13:05:18.067012	\N
b892f8b1-43f5-4cc0-9082-56a932ce7c4a	جابر بن زيد	وصف المدرسةf	4	6	25	f	\N	active	20	1	1	\N	fb7888ee-191e-4f30-88dd-a6feca27065a	2025-11-01 13:05:23.552593	2026-05-14 00:31:37.574483	a37141f3-3407-4750-b747-d05758a2d650
ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf	هند بنت المهلب	Kindergarten - Supervised by أريام	4	6	25	f	\N	active	20	1	1	\N	fb7888ee-191e-4f30-88dd-a6feca27065a	2025-11-01 13:05:20.783746	2026-05-14 00:36:47.331983	a37141f3-3407-4750-b747-d05758a2d650
efe57fcd-e10d-489f-a79a-3d6b50535bdc	الزهراء السقطرية	Preparatory - Supervised by موزة	2	4	25	t	\N	active	21	1	1	\N	fb7888ee-191e-4f30-88dd-a6feca27065a	2025-11-01 13:05:07.055787	2026-05-14 00:44:00.528283	a37141f3-3407-4750-b747-d05758a2d650
\.


--
-- Data for Name: installment_plan_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.installment_plan_entries (id, plan_id, sequence, month_number, label, weight) FROM stdin;
c9601d9f-8dbf-45fd-bc75-837583e0772b	d60657e3-4b7d-420d-932a-e82b028f6fd5	1	9	القسط الآول	1.0000
6b10d4f3-6474-436d-ba2d-b2539f5352b5	d60657e3-4b7d-420d-932a-e82b028f6fd5	2	10	القسط الثاني	1.0000
c0c62ff4-f950-4e68-ab4e-ed96746c14ec	d60657e3-4b7d-420d-932a-e82b028f6fd5	3	11	القسط الثالث	1.0000
\.


--
-- Data for Name: installment_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.installment_plans (id, school_id, name, description, is_active, created_at, updated_at) FROM stdin;
d60657e3-4b7d-420d-932a-e82b028f6fd5	1	تقسيط ٤	اااا	t	2026-09-01 08:26:49.861744+04	2026-09-01 08:26:49.861744+04
\.


--
-- Data for Name: level_payment_charge_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.level_payment_charge_lines (id, profile_id, charge_type_id, amount, created_at, updated_at, billing_period) FROM stdin;
3058a1d1-2203-4e9e-afb1-bfbbdb1e1e3d	2541cd45-9d20-471d-8970-82ed831aa82b	65c33b41-4589-433c-b6a4-a3cb93ddf320	345.00	2026-05-16 22:09:50.788546+04	2026-05-16 22:09:50.788546+04	monthly
e9e81f2b-2ba1-4750-aceb-e7f578e3dc7e	2541cd45-9d20-471d-8970-82ed831aa82b	65c33b41-4589-433c-b6a4-a3cb93ddf320	345.00	2026-05-16 22:09:50.788546+04	2026-05-16 22:09:50.788546+04	semester
82fdea62-1e4a-45cf-9b31-c52cfa305bf1	2541cd45-9d20-471d-8970-82ed831aa82b	65c33b41-4589-433c-b6a4-a3cb93ddf320	345.00	2026-05-16 22:09:50.788546+04	2026-05-16 22:09:50.788546+04	yearly
b998b7b4-3147-4679-a6b5-ca9fba8f57dc	2541cd45-9d20-471d-8970-82ed831aa82b	11051f98-0b0a-4cb2-b028-c838f37418c6	4564.00	2026-05-16 22:09:50.788546+04	2026-05-16 22:09:50.788546+04	monthly
780702d8-f7a8-4577-9832-a93595c8ad8a	2541cd45-9d20-471d-8970-82ed831aa82b	11051f98-0b0a-4cb2-b028-c838f37418c6	54646.00	2026-05-16 22:09:50.788546+04	2026-05-16 22:09:50.788546+04	semester
7eaa1dd2-bf46-4afa-8371-e429e212978e	2541cd45-9d20-471d-8970-82ed831aa82b	11051f98-0b0a-4cb2-b028-c838f37418c6	45345.00	2026-05-16 22:09:50.788546+04	2026-05-16 22:09:50.788546+04	yearly
27f3ca77-9eb1-4c31-9e89-4ffe2f6b0542	2541cd45-9d20-471d-8970-82ed831aa82b	e8ffbcfd-bec0-4f63-81bb-ba07a1ebd1c0	456.00	2026-05-16 22:09:50.788546+04	2026-05-16 22:09:50.788546+04	monthly
146e66b5-5fa2-4a97-a808-f87ecd082632	2541cd45-9d20-471d-8970-82ed831aa82b	e8ffbcfd-bec0-4f63-81bb-ba07a1ebd1c0	45645.00	2026-05-16 22:09:50.788546+04	2026-05-16 22:09:50.788546+04	semester
a20dea94-5d9b-46a4-bcee-45343f10a2cb	2541cd45-9d20-471d-8970-82ed831aa82b	342e1c55-1e49-46ee-8a01-f160367d6c41	5645.00	2026-05-16 22:09:50.788546+04	2026-05-16 22:09:50.788546+04	monthly
0d1541e6-8e8b-4235-8291-8c5c75434cf4	2541cd45-9d20-471d-8970-82ed831aa82b	342e1c55-1e49-46ee-8a01-f160367d6c41	546456.00	2026-05-16 22:09:50.788546+04	2026-05-16 22:09:50.788546+04	semester
907f358f-5d2d-422c-beb0-c2cd19b594c4	2541cd45-9d20-471d-8970-82ed831aa82b	342e1c55-1e49-46ee-8a01-f160367d6c41	56456.00	2026-05-16 22:09:50.788546+04	2026-05-16 22:09:50.788546+04	yearly
8d13c500-8a68-4676-b9c5-f9ee14dfff51	2541cd45-9d20-471d-8970-82ed831aa82b	e0340f56-5165-40e5-8853-34d756a83df1	456456.00	2026-05-16 22:09:50.788546+04	2026-05-16 22:09:50.788546+04	monthly
8637902a-4e81-48e2-98c1-95d50d891142	2541cd45-9d20-471d-8970-82ed831aa82b	e0340f56-5165-40e5-8853-34d756a83df1	45645.00	2026-05-16 22:09:50.788546+04	2026-05-16 22:09:50.788546+04	semester
644224db-8a7a-41bd-ac0f-ac2876f73394	2541cd45-9d20-471d-8970-82ed831aa82b	e0340f56-5165-40e5-8853-34d756a83df1	456456.00	2026-05-16 22:09:50.788546+04	2026-05-16 22:09:50.788546+04	yearly
\.


--
-- Data for Name: level_payment_installments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.level_payment_installments (id, profile_id, sequence, month_number, label, amount, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: level_payment_profile_discounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.level_payment_profile_discounts (profile_id, discount_type_id) FROM stdin;
\.


--
-- Data for Name: level_payment_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.level_payment_profiles (id, school_id, level_id, pricing_model, year_payment_mode, year_total_amount, currency, created_at, updated_at, fee_package_id) FROM stdin;
2541cd45-9d20-471d-8970-82ed831aa82b	1	a37141f3-3407-4750-b747-d05758a2d650	per_year	one_time	558602.00	OMR	2026-05-14 00:34:48.814755+04	2026-05-16 22:09:50.788546+04	8996bd79-65ad-4ad4-a913-34f5cad7cb12
\.


--
-- Data for Name: meeting_room_invitees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.meeting_room_invitees (id, meeting_room_id, user_id) FROM stdin;
\.


--
-- Data for Name: meeting_rooms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.meeting_rooms (id, school_id, title, provider, room_name, room_url, created_by, created_at, scheduled_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
3	1704067200000	InitialMigration1704067200000
4	1704067250000	SafeSchemaAnalysis1704067250000
5	1704067300000	ComprehensiveSchemaFix1704067300000
6	1730462400000	CreateWeeklySessionPlans1730462400000
7	1731600000000	FixStaffUserIdType1731600000000
8	1737475200000	CreateEnrollments1737475200000
9	1757691788565	AddRolesColumnToUser1757691788565
10	1777620000000	AlignActivitiesTableWithEntity1777620000000
11	1780100000000	CreateGroupChatMessages1780100000000
12	1780200000000	CreateGradesTable1780200000000
13	1780300000000	EnsureActivitiesGroupId1780300000000
14	1780400000000	CreateOnlineVideoSessions1780400000000
15	1780500000000	OnlineSessionStudentAttendance1780500000000
16	1780600000000	GradedAssessmentCourses1780600000000
17	1780700000000	OnlineSessionParticipationStatuses1780700000000
18	1780800000000	CreateBuses1780800000000
19	1780900000000	GradedCriterionTeacherTasks1780900000000
20	1780900000000	BusMovementLogs1780900000000
21	1780910000000	OneBusPerStudent1780910000000
22	1780910000000	GradedCriterionTaskStudentMarks1780910000000
23	1780920000000	OneBusPerStudent1780920000000
24	1780930000000	DirectChatThreads1780930000000
25	1780930000000	BusMovementTripTypeAndDate1780930000000
26	1781000000000	MeetingRooms1781000000000
27	1781010000000	MeetingRoomScheduledAt1781010000000
28	1781020000000	SchoolSubscriptionDocuments1781020000000
29	1782000000000	PaymentFoundation1782000000000
30	1782100000000	StudentPaymentsAndLevel1782100000000
31	1781030000000	NotificationTemplates1781030000000
32	1782200000000	SchoolSystemSettings1782200000000
33	1781040000000	NotificationTemplateLocales1781040000000
34	1781050000000	ClearPaymentReceiptTemplateDescription1781050000000
35	1781060000000	SchoolMessageLetters1781060000000
36	1782110000000	StudentPaymentInstallmentReceipts1782110000000
37	1782300000000	PaymentReceiptDivEmailLayout1782300000000
38	1782400000000	CoursePaymentProfiles1782400000000
39	1782500000000	FeePackages1782500000000
40	1782600000000	YearPaymentModeBoth1782600000000
41	1782700000000	DirectChatMessageMetadata1782700000000
42	1782810000000	ActivityParentApprovalLetter1782810000000
43	1782900000000	ActivityMessageLetterUnified1782900000000
44	1783000000000	FeePackageLevelBillingPeriod1783000000000
45	1782820000000	FeePackageLevelPeriodSettings1782820000000
46	1783100000000	StudentCourseEnrollments1783100000000
49	1783200000000	PaymentChargeTypeBillingOccurrence1783200000000
50	1783300000000	StudentPaymentLedger1783300000000
51	1783310000000	FixPaymentTransactionRecordedByUuid1783310000000
52	1783400000000	CreateRbacTables1783400000000
53	1783500000000	AddSchoolStatus1783500000000
54	1783600000000	CreatePlatformBilling1783600000000
55	1783700000000	CreateSchoolLandingPages1783700000000
56	1783800000000	CreatePlatformModules1783800000000
57	1783900000000	SimplifyModulePricing1783900000000
58	1784000000000	AccessControlLayers1784000000000
59	1784100000000	UserGroupTypesAndCodes1784100000000
60	1784200000000	FeesModuleV21784200000000
61	1784300000000	FeesV2Completion1784300000000
\.


--
-- Data for Name: milestones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.milestones (id, name, description, order_index, is_required, points, phase_id, title, type, target_week, weight, difficulty_level, estimated_duration_minutes, required_resources, allow_late_submission, enable_peer_review, created_at, updated_at) FROM stdin;
de474214-b337-48f4-b320-e2df2be47630	معلم 1.1	معلم مهم يجب تحقيقه في المرحلة التأسيسية	1	t	10	f6765abf-9dd6-4b8d-b0fa-e04fe24ffd4d	إنجاز أساسي في المرحلة التأسيسية	assessment	\N	\N	\N	\N	\N	f	f	2025-11-21 10:57:46.697023	2025-11-21 10:57:46.697023
1f3b1ceb-c5f3-495d-bf9a-fecba51e5d85	معلم 1.2	معلم متقدم في المرحلة التأسيسية	2	f	15	f6765abf-9dd6-4b8d-b0fa-e04fe24ffd4d	إنجاز متقدم في المرحلة التأسيسية	project	\N	\N	\N	\N	\N	f	f	2025-11-21 10:57:46.70391	2025-11-21 10:57:46.70391
762a0fee-db64-4564-ae9f-ccb40bf276fd	معلم 2.1	معلم مهم يجب تحقيقه في مرحلة التطبيق	1	t	10	f52e7268-f920-4161-9f4c-324c9fdc27e2	إنجاز أساسي في مرحلة التطبيق	assessment	\N	\N	\N	\N	\N	f	f	2025-11-21 10:57:46.720357	2025-11-21 10:57:46.720357
fe388a88-a00c-4de2-aa92-c14e83778879	معلم 2.2	معلم متقدم في مرحلة التطبيق	2	f	15	f52e7268-f920-4161-9f4c-324c9fdc27e2	إنجاز متقدم في مرحلة التطبيق	project	\N	\N	\N	\N	\N	f	f	2025-11-21 10:57:46.725966	2025-11-21 10:57:46.725966
7b40e780-a8cb-46e5-b99b-5a99c95a5429	معلم 3.1	معلم مهم يجب تحقيقه في مرحلة الإتقان	1	t	10	2a9bd401-6974-4d7c-9c61-c58504b22d8d	إنجاز أساسي في مرحلة الإتقان	assessment	\N	\N	\N	\N	\N	f	f	2025-11-21 10:57:46.743605	2025-11-21 10:57:46.743605
45a24a05-50ce-4a4a-9bcb-b5df1568395e	معلم 3.2	معلم متقدم في مرحلة الإتقان	2	f	15	2a9bd401-6974-4d7c-9c61-c58504b22d8d	إنجاز متقدم في مرحلة الإتقان	project	\N	\N	\N	\N	\N	f	f	2025-11-21 10:57:46.752825	2025-11-21 10:57:46.752825
37f4272b-a209-419a-a74e-e572cf555498	dfgdfhs	sfhsfgh	1	t	0	abb4ea56-9160-4c36-a40e-fbf8b7e1bd21	\N	\N	\N	\N	\N	\N	\N	f	f	2026-04-19 21:05:32.816083	2026-04-19 21:05:32.816083
f654e0a2-fb85-4ad9-bb54-292aa28c48cf	sgdnrth	erhwerthw	2	t	0	abb4ea56-9160-4c36-a40e-fbf8b7e1bd21	\N	\N	\N	\N	\N	\N	\N	f	f	2026-04-19 21:09:42.604263	2026-04-19 21:09:42.604263
77bbfdc3-23f1-4b82-b107-0aac6ee15fdf	wrthw4h	th2w46hgh	3	t	0	abb4ea56-9160-4c36-a40e-fbf8b7e1bd21	\N	\N	\N	\N	\N	\N	\N	f	f	2026-04-19 21:09:49.559229	2026-04-19 21:09:49.559229
7516e459-389c-435f-bf72-2595ad34643f	لالالا	قفاصقفا	1	t	0	60ebd3dc-34f4-48c2-b80c-f026aee1b266	\N	\N	\N	\N	\N	\N	\N	f	f	2026-04-19 23:03:40.320381	2026-04-19 23:03:40.320381
8f4c0373-103d-4596-9925-5c6a7191e0f4	الالاقفاقصفاصس	سقفاصثقفا	2	t	0	60ebd3dc-34f4-48c2-b80c-f026aee1b266	\N	\N	\N	\N	\N	\N	\N	f	f	2026-04-19 23:03:49.497902	2026-04-19 23:03:49.497902
\.


--
-- Data for Name: notification_template_definitions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_template_definitions (id, template_key, display_name, description, channel, default_subject, default_body_html, default_body_sms, variable_hints, created_at, updated_at, default_subject_ar, default_body_html_ar, default_body_sms_ar) FROM stdin;
99eeb4c3-7336-4f5c-9fa3-18f59e0b0907	payment.receipt	Payment receipt	\N	both	Payment received — {{schoolName}}	<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>Payment receipt</title>\n</head>\n<body style="margin:0;padding:24px;background:#f3f4f6;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;">\n  <div class="nt-email-card" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">\n    <div style="padding:24px 28px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;">\n      <div style="font-size:18px;font-weight:700;">{{schoolName}}</div>\n      <div style="font-size:13px;opacity:.95;margin-top:4px;">Payment notification</div>\n    </div>\n    <div class="nt-email-body" style="padding:24px 28px;">\n      <p style="margin:0 0 12px;">Dear {{recipientName}},</p>\n      <p style="margin:0 0 16px;line-height:1.55;">We have recorded a payment for <strong>{{studentName}}</strong>.</p>\n      <p style="margin:0 0 8px;"><strong>Amount:</strong> {{amount}} {{currency}}</p>\n      <p style="margin:0 0 8px;"><strong>Date:</strong> {{date}}</p>\n      <p style="margin:0 0 16px;"><strong>Remarks:</strong> {{remarks}}</p>\n      <p style="margin:20px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">{{footerText}}</p>\n    </div>\n  </div>\n</body>\n</html>	Payment {{amount}} {{currency}} for {{studentName}} at {{schoolName}} on {{date}}. {{remarks}}	[{"name": "schoolName", "description": "School display name"}, {"name": "studentName", "description": "Student full name"}, {"name": "recipientName", "description": "Parent or payer name"}, {"name": "amount", "description": "Amount (formatted)"}, {"name": "currency", "description": "Currency code, e.g. OMR"}, {"name": "date", "description": "Payment date"}, {"name": "remarks", "description": "Note or reference"}, {"name": "footerText", "description": "Footer line (address, thank-you, etc.)"}]	2026-05-13 19:47:05.707719+04	2026-05-13 19:47:05.707719+04	تم استلام الدفعة — {{schoolName}}	<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>\n  <meta charset="utf-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>إيصال الدفع</title>\n</head>\n<body style="margin:0;padding:24px;background:#f3f4f6;font-family:system-ui,Tahoma,Segoe UI,sans-serif;color:#111827;">\n  <div class="nt-email-card" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">\n    <div style="padding:24px 28px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;">\n      <div style="font-size:18px;font-weight:700;">{{schoolName}}</div>\n      <div style="font-size:13px;opacity:.95;margin-top:4px;">إشعار بالدفع</div>\n    </div>\n    <div class="nt-email-body" style="padding:24px 28px;">\n      <p style="margin:0 0 12px;">عزيزي/عزيزتي {{recipientName}}،</p>\n      <p style="margin:0 0 16px;line-height:1.55;">تم تسجيل دفعة باسم <strong>{{studentName}}</strong>.</p>\n      <p style="margin:0 0 8px;"><strong>المبلغ:</strong> {{amount}} {{currency}}</p>\n      <p style="margin:0 0 8px;"><strong>التاريخ:</strong> {{date}}</p>\n      <p style="margin:0 0 16px;"><strong>ملاحظات:</strong> {{remarks}}</p>\n      <p style="margin:20px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">{{footerText}}</p>\n    </div>\n  </div>\n</body>\n</html>	دفعة {{amount}} {{currency}} للطالب {{studentName}} في {{schoolName}} بتاريخ {{date}}. {{remarks}}
\.


--
-- Data for Name: online_session_presence; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.online_session_presence (id, online_session_id, user_id, display_name, joined_at, left_at) FROM stdin;
c90cc753-83b3-4d04-9d36-ee3005930a19	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	0f851929-30b0-4b1c-8f64-779bd03dae03	موزة معلمة	2026-05-10 23:40:17.034+04	\N
7c5b817b-1465-4832-adcb-1765828cbb65	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	0f851929-30b0-4b1c-8f64-779bd03dae03	موزة معلمة	2026-05-10 23:42:21.392+04	\N
501f7329-3e0d-4d62-8400-6414ba7e8498	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	Zahra Administrator	2026-05-16 21:12:02.557+04	\N
\.


--
-- Data for Name: online_session_student_attendance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.online_session_student_attendance (id, online_session_id, student_id, status, created_at, updated_at) FROM stdin;
e1c1cf4c-957c-4e76-8f5e-058e3735e337	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	c76bba3f-89f1-4cfa-b05a-941ac34be80a	not_attended	2026-05-10 23:53:43.393742+04	2026-05-10 23:53:43.393742+04
f2960db0-4776-4f80-88f5-1cf27710e4c6	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	750d1305-e3d5-4191-9cd6-1e7ea77c6363	not_attended	2026-05-10 23:53:43.417591+04	2026-05-10 23:53:43.417591+04
f3d8223f-561d-4711-8796-c4c75b03f851	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	deb13f05-a38d-4910-a0c2-ee07e5c104f2	not_attended	2026-05-10 23:53:43.425099+04	2026-05-10 23:53:43.425099+04
36095b0a-edc8-4b95-b769-8710561a7787	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	14799b1a-9596-4204-9d75-29dc977fa4de	not_attended	2026-05-10 23:53:43.430188+04	2026-05-10 23:53:43.430188+04
79e13ec5-ad7c-4155-a18e-bb1f2f707517	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	dddbd098-3eec-46d4-b4f5-cdf7f15f1638	not_attended	2026-05-10 23:53:43.439516+04	2026-05-10 23:53:43.439516+04
9947fb41-3108-4e4e-b368-f4c472f5a999	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	fd56bf92-62e8-4bd3-b054-8e3e292d3a03	not_attended	2026-05-10 23:53:43.463538+04	2026-05-10 23:53:43.463538+04
67fac17b-a7cb-4d5a-8f68-5d035c0e757c	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	b35d8a54-d260-4c40-a0ea-ea349ec7e454	not_attended	2026-05-10 23:53:43.47056+04	2026-05-10 23:53:43.47056+04
0a4d3edc-4c9c-4814-bfb0-ca4073bb0d8f	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	d1b3a827-b220-468e-aff0-b04b2e4a4e88	not_attended	2026-05-10 23:53:43.478245+04	2026-05-10 23:53:43.478245+04
29f86dfd-7388-42b0-b191-f86596810e67	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	6e138a6a-2343-480c-b09d-d734bd7eee24	not_attended	2026-05-10 23:53:43.486827+04	2026-05-10 23:53:43.486827+04
f62ab535-566d-4068-9afb-942675ad6f85	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	6c452cf2-3307-4c0e-a1b3-4f5baee9c3ce	not_attended	2026-05-10 23:53:43.494588+04	2026-05-10 23:53:43.494588+04
6248b9d0-7387-4416-bd65-b05dade1412b	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	70845b1d-ca99-4e7e-ba57-bec4279d7f53	not_attended	2026-05-10 23:53:43.505162+04	2026-05-10 23:53:43.505162+04
32929b12-e635-427a-8c59-9c307ab8c58a	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	13635de0-762e-44b8-965a-001571e1922c	not_attended	2026-05-10 23:53:43.525535+04	2026-05-10 23:53:43.525535+04
fd8064a0-c618-4fc7-9a30-696e579c8d79	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	7e2c867d-e99e-4f27-8a4a-f2e33e98f6bc	not_attended	2026-05-10 23:53:43.537757+04	2026-05-10 23:53:43.537757+04
9f7828e1-2674-46bc-8036-929cc65bc9c6	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	b9a1f103-744c-456e-99f6-d50c12aafc2d	not_attended	2026-05-10 23:53:43.55526+04	2026-05-10 23:53:43.55526+04
cb293fd4-c000-4423-89b7-0c2ff748fa41	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	eee33dcb-803a-4d07-a7fe-fbc7e7c8b84e	not_attended	2026-05-10 23:53:43.573006+04	2026-05-10 23:53:43.573006+04
593f89be-27b2-4463-9504-9b22f8fff93e	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	4a72ec48-b917-4f2e-8f98-4aea8c80a30b	not_attended	2026-05-10 23:53:43.604765+04	2026-05-10 23:53:43.604765+04
bf52e102-8394-4d95-ab36-df109058f36a	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	4a54b0f9-a722-46d9-b95f-28df549a33c7	not_attended	2026-05-10 23:53:45.065287+04	2026-05-10 23:53:45.065287+04
52054866-8497-4474-9488-380267574a36	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	d09157a4-bff9-4106-a3ae-30292164f649	not_attended	2026-05-10 23:53:45.207599+04	2026-05-10 23:53:45.207599+04
ed992899-dd87-4cae-8119-f94e7e3b9db9	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	ee6f4e7e-53c2-4d66-9220-8e8112c2347a	not_attended	2026-05-10 23:53:45.289554+04	2026-05-10 23:53:45.289554+04
a8002778-b05a-4d5c-b84c-32ce58edd178	194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	3f897370-0f2b-4c0f-bb34-f748e542ce9d	not_attended	2026-05-10 23:53:50.293022+04	2026-05-10 23:53:50.293022+04
\.


--
-- Data for Name: online_video_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.online_video_sessions (id, schedule_id, week_start_date, session_date, provider, room_name, room_url, recording_id, recording_url, created_by, created_at, updated_at, attendance_finalized_at) FROM stdin;
194b4ff7-4aa8-4406-a7d8-ab36d3aa0230	736c1e5e-3659-40b0-82a0-70dd41814af7	2026-05-10	2026-05-10	daily	zinat7182d21506b84c1e8ff3	https://zinat-demo.daily.co/zinat7182d21506b84c1e8ff3	\N	\N	0f851929-30b0-4b1c-8f64-779bd03dae03	2026-05-10 23:06:38.364472+04	2026-05-10 23:53:52.323873+04	2026-05-10 23:53:50.661+04
\.


--
-- Data for Name: parents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.parents (id, "firstName", "lastName", email, phone, address, user_id, "createdAt", "updatedAt", student_id, created_at, updated_at) FROM stdin;
1	والدة	الطالب درر المسكرية	parent_94811096@zinat.local	94811096	عمان	9fa0b1eb-e112-4480-8d27-1f434ea1b391	2025-11-01 13:05:07.131502	2025-11-01 13:05:07.131502	1	2025-11-01 13:05:07.131502	2025-11-01 13:05:07.131502
2	والد	الطالب درر المسكرية	parent_95092335@zinat.local	95092335	عمان	c585ec6e-602e-49f9-b973-061cfebeb083	2025-11-01 13:05:07.202617	2025-11-01 13:05:07.202617	1	2025-11-01 13:05:07.202617	2025-11-01 13:05:07.202617
3	والدة	الطالب صالح المسكري	parent_96173736@zinat.local	96173736	عمان	600f55e1-95f4-4bdb-8c98-71b86010b490	2025-11-01 13:05:07.281598	2025-11-01 13:05:07.281598	1	2025-11-01 13:05:07.281598	2025-11-01 13:05:07.281598
4	والد	الطالب صالح المسكري	parent_95064063@zinat.local	95064063	عمان	dbe79c7f-6cf5-41df-8a05-0c84c4b46fa2	2025-11-01 13:05:07.352626	2025-11-01 13:05:07.352626	1	2025-11-01 13:05:07.352626	2025-11-01 13:05:07.352626
5	والدة	الطالب روان العويدي	parent_95464181@zinat.local	95464181	عمان	de38fecd-032e-4f61-9002-30247874fe55	2025-11-01 13:05:07.428814	2025-11-01 13:05:07.428814	1	2025-11-01 13:05:07.428814	2025-11-01 13:05:07.428814
6	والدة	الطالب ضياء المسكرية	parent_95932973@zinat.local	95932973	عمان	938115b6-0d75-454f-b8e0-ecaea88086c3	2025-11-01 13:05:07.504161	2025-11-01 13:05:07.504161	1	2025-11-01 13:05:07.504161	2025-11-01 13:05:07.504161
7	والد	الطالب ضياء المسكرية	parent_96970744@zinat.local	96970744	عمان	f435dd70-eba6-40e6-a0aa-d2931c981f97	2025-11-01 13:05:07.574883	2025-11-01 13:05:07.574883	1	2025-11-01 13:05:07.574883	2025-11-01 13:05:07.574883
8	والدة	الطالب سعيد الحارثي	parent_98885014@zinat.local	98885014	عمان	75fcf6ec-87f2-4721-8b36-82eb9e612246	2025-11-01 13:05:07.651302	2025-11-01 13:05:07.651302	1	2025-11-01 13:05:07.651302	2025-11-01 13:05:07.651302
9	والد	الطالب سعيد الحارثي	parent_93338334@zinat.local	93338334	عمان	1b00d302-f024-4cc1-ac45-acf566c8b31a	2025-11-01 13:05:07.723453	2025-11-01 13:05:07.723453	1	2025-11-01 13:05:07.723453	2025-11-01 13:05:07.723453
10	والدة	الطالب صفاء المسكرية	parent_95145009@zinat.local	95145009	عمان	a9736adb-8352-4788-ac6a-cdb95aa7be33	2025-11-01 13:05:07.80011	2025-11-01 13:05:07.80011	1	2025-11-01 13:05:07.80011	2025-11-01 13:05:07.80011
11	والد	الطالب صفاء المسكرية	parent_92135380@zinat.local	92135380	عمان	0617d532-4659-4d17-bf6f-94371eacfc5e	2025-11-01 13:05:07.871321	2025-11-01 13:05:07.871321	1	2025-11-01 13:05:07.871321	2025-11-01 13:05:07.871321
12	والدة	الطالب ناصر الرحبي	parent_98877226@zinat.local	98877226	عمان	0ba67a91-840f-4fe8-bbcc-3c271e4a3dd0	2025-11-01 13:05:07.946792	2025-11-01 13:05:07.946792	1	2025-11-01 13:05:07.946792	2025-11-01 13:05:07.946792
13	والد	الطالب ناصر الرحبي	parent_95454245@zinat.local	95454245	عمان	afc7892c-c0df-47a5-ab0c-b5250d44d88f	2025-11-01 13:05:08.018604	2025-11-01 13:05:08.018604	1	2025-11-01 13:05:08.018604	2025-11-01 13:05:08.018604
14	والدة	الطالب بدر الرحبي	parent_94622794@zinat.local	94622794	عمان	879b6aaf-da65-4109-85bd-d2cccab26c26	2025-11-01 13:05:08.093978	2025-11-01 13:05:08.093978	1	2025-11-01 13:05:08.093978	2025-11-01 13:05:08.093978
15	والد	الطالب بدر الرحبي	parent_99277483@zinat.local	99277483	عمان	de826c1d-ba79-4ccf-96d0-f9bd52d4f7f2	2025-11-01 13:05:08.164183	2025-11-01 13:05:08.164183	1	2025-11-01 13:05:08.164183	2025-11-01 13:05:08.164183
16	والدة	الطالب رؤى الحارثية	parent_96933177@zinat.local	96933177	عمان	2d05f4da-c71c-4763-9571-47e997a3041a	2025-11-01 13:05:08.240415	2025-11-01 13:05:08.240415	1	2025-11-01 13:05:08.240415	2025-11-01 13:05:08.240415
17	والد	الطالب رؤى الحارثية	parent_95088333@zinat.local	95088333	عمان	112d118e-e69f-4e8b-9190-7f218789bc5c	2025-11-01 13:05:08.311754	2025-11-01 13:05:08.311754	1	2025-11-01 13:05:08.311754	2025-11-01 13:05:08.311754
18	والدة	الطالب حسينة السعدية	parent_79070704@zinat.local	79070704	عمان	fcd76a90-e1df-49fa-876c-3fd92ccb367b	2025-11-01 13:05:08.386762	2025-11-01 13:05:08.386762	1	2025-11-01 13:05:08.386762	2025-11-01 13:05:08.386762
19	والد	الطالب حسينة السعدية	parent_97775099@zinat.local	97775099	عمان	f239e4b6-8bff-4bbc-8af1-a454ea371107	2025-11-01 13:05:08.457213	2025-11-01 13:05:08.457213	1	2025-11-01 13:05:08.457213	2025-11-01 13:05:08.457213
20	والدة	الطالب غيم اليزيدية	parent_97291529@zinat.local	97291529	عمان	6430eba5-0852-48d3-90ef-1c42e6174bae	2025-11-01 13:05:08.532623	2025-11-01 13:05:08.532623	1	2025-11-01 13:05:08.532623	2025-11-01 13:05:08.532623
21	والد	الطالب غيم اليزيدية	parent_92988234@zinat.local	92988234	عمان	83f3fea3-37aa-4f61-82d0-26a14d0d48a1	2025-11-01 13:05:08.604094	2025-11-01 13:05:08.604094	1	2025-11-01 13:05:08.604094	2025-11-01 13:05:08.604094
22	والدة	الطالب اليزن الكعبي	parent_71179339@zinat.local	71179339	عمان	9ee33166-a310-42d9-8d8f-c36c0a8be6ee	2025-11-01 13:05:08.680337	2025-11-01 13:05:08.680337	1	2025-11-01 13:05:08.680337	2025-11-01 13:05:08.680337
23	والد	الطالب اليزن الكعبي	parent_98488498@zinat.local	98488498	عمان	9063b1a2-4622-4cd5-b971-0b0f2122d1cf	2025-11-01 13:05:08.750317	2025-11-01 13:05:08.750317	1	2025-11-01 13:05:08.750317	2025-11-01 13:05:08.750317
24	والدة	الطالب ملاك المسكرية	parent_95054707@zinat.local	95054707	عمان	d94fa1e6-5133-4e17-9089-f949d586c076	2025-11-01 13:05:08.823855	2025-11-01 13:05:08.823855	1	2025-11-01 13:05:08.823855	2025-11-01 13:05:08.823855
25	والد	الطالب ملاك المسكرية	parent_92210194@zinat.local	92210194	عمان	7b6bbca4-3576-45f8-a101-f1a73bab7239	2025-11-01 13:05:08.896195	2025-11-01 13:05:08.896195	1	2025-11-01 13:05:08.896195	2025-11-01 13:05:08.896195
26	والدة	الطالب سما المغيرية	parent_99522564@zinat.local	99522564	عمان	c95db9d4-76c2-44d6-9814-a6caaf8695e1	2025-11-01 13:05:08.971777	2025-11-01 13:05:08.971777	1	2025-11-01 13:05:08.971777	2025-11-01 13:05:08.971777
27	والد	الطالب سما المغيرية	parent_99351065@zinat.local	99351065	عمان	452a9aa1-ab9b-4c49-99a2-2ddcc91b12db	2025-11-01 13:05:09.042838	2025-11-01 13:05:09.042838	1	2025-11-01 13:05:09.042838	2025-11-01 13:05:09.042838
28	والدة	الطالب رؤى البراشدية	parent_91200005@zinat.local	91200005	عمان	74454788-828b-4d65-b6cf-e61739b72417	2025-11-01 13:05:09.117478	2025-11-01 13:05:09.117478	1	2025-11-01 13:05:09.117478	2025-11-01 13:05:09.117478
29	والد	الطالب رؤى البراشدية	parent_96001443@zinat.local	96001443	عمان	c304b685-48cb-4b14-946a-6afa4fb8d3c2	2025-11-01 13:05:09.188271	2025-11-01 13:05:09.188271	1	2025-11-01 13:05:09.188271	2025-11-01 13:05:09.188271
30	والدة	الطالب محمد الحارثي	parent_92575676@zinat.local	92575676	عمان	1b1dfb2a-2a9e-4145-99b5-fa01d074060b	2025-11-01 13:05:09.262454	2025-11-01 13:05:09.262454	1	2025-11-01 13:05:09.262454	2025-11-01 13:05:09.262454
31	والد	الطالب محمد الحارثي	parent_95226040@zinat.local	95226040	عمان	cd319ad1-4954-4d6e-b270-ce4808338b86	2025-11-01 13:05:09.333469	2025-11-01 13:05:09.333469	1	2025-11-01 13:05:09.333469	2025-11-01 13:05:09.333469
32	والدة	الطالب أحمد الإسماعيلي	parent_97772831@zinat.local	97772831	عمان	871b0869-b82d-4278-906a-0ffc1c7b6db5	2025-11-01 13:05:09.409037	2025-11-01 13:05:09.409037	1	2025-11-01 13:05:09.409037	2025-11-01 13:05:09.409037
33	والد	الطالب أحمد الإسماعيلي	parent_99774412@zinat.local	99774412	عمان	978799bd-f2b7-448f-8384-33c82730da65	2025-11-01 13:05:09.480169	2025-11-01 13:05:09.480169	1	2025-11-01 13:05:09.480169	2025-11-01 13:05:09.480169
34	والدة	الطالب هيثم المسكري	parent_77265536@zinat.local	77265536	عمان	75b33b28-3d13-404b-a27a-58339c31f8c6	2025-11-01 13:05:09.555213	2025-11-01 13:05:09.555213	1	2025-11-01 13:05:09.555213	2025-11-01 13:05:09.555213
35	والد	الطالب هيثم المسكري	parent_99881807@zinat.local	99881807	عمان	ef989278-af74-48fb-bcc4-b2416be1f2f2	2025-11-01 13:05:09.626636	2025-11-01 13:05:09.626636	1	2025-11-01 13:05:09.626636	2025-11-01 13:05:09.626636
36	والدة	الطالب انسام الاسماعيلية	parent_95530331@zinat.local	95530331	عمان	adb2ced4-d127-453c-a5c4-60528ef7995a	2025-11-01 13:05:09.701921	2025-11-01 13:05:09.701921	1	2025-11-01 13:05:09.701921	2025-11-01 13:05:09.701921
37	والد	الطالب انسام الاسماعيلية	parent_92344674@zinat.local	92344674	عمان	34a104b6-52dd-4202-b67c-99e7a577d8c2	2025-11-01 13:05:09.772709	2025-11-01 13:05:09.772709	1	2025-11-01 13:05:09.772709	2025-11-01 13:05:09.772709
38	والدة	الطالب الحسن البرواني	parent_95056160@zinat.local	95056160	عمان	34e55b8c-9584-4dfa-8f8f-b4e27413519c	2025-11-01 13:05:09.84652	2025-11-01 13:05:09.84652	1	2025-11-01 13:05:09.84652	2025-11-01 13:05:09.84652
39	والد	الطالب الحسن البرواني	parent_99227235@zinat.local	99227235	عمان	6b9f3d36-0dde-4dc4-8453-54bae112f094	2025-11-01 13:05:09.917358	2025-11-01 13:05:09.917358	1	2025-11-01 13:05:09.917358	2025-11-01 13:05:09.917358
40	والدة	الطالب زكريا الإسماعيلي	parent_92909567@zinat.local	92909567	عمان	dd820099-23c3-42c8-a668-9165418ae1ce	2025-11-01 13:05:09.993335	2025-11-01 13:05:09.993335	1	2025-11-01 13:05:09.993335	2025-11-01 13:05:09.993335
41	والدة	الطالب عزام السعدي	parent_96609639@zinat.local	96609639	عمان	9d68391c-8ce3-4729-b2da-1ac583aef255	2025-11-01 13:05:10.139527	2025-11-01 13:05:10.139527	1	2025-11-01 13:05:10.139527	2025-11-01 13:05:10.139527
42	والد	الطالب عزام السعدي	parent_99071679@zinat.local	99071679	عمان	da45f482-cbee-4e21-9415-164a0028fde0	2025-11-01 13:05:10.20975	2025-11-01 13:05:10.20975	1	2025-11-01 13:05:10.20975	2025-11-01 13:05:10.20975
43	والدة	الطالب زياد الطوقي	parent_94291888@zinat.local	94291888	عمان	dfc1672e-32b8-4e00-a7b9-85f3d8e078ca	2025-11-01 13:05:10.284113	2025-11-01 13:05:10.284113	1	2025-11-01 13:05:10.284113	2025-11-01 13:05:10.284113
44	والد	الطالب زياد الطوقي	parent_98861108@zinat.local	98861108	عمان	6fb1743f-b438-41e7-be5c-7c074ed9c539	2025-11-01 13:05:10.354514	2025-11-01 13:05:10.354514	1	2025-11-01 13:05:10.354514	2025-11-01 13:05:10.354514
45	والدة	الطالب ماجد المسكري	parent_96252560@zinat.local	96252560	عمان	e075a638-515c-4f91-9f10-c813701674b6	2025-11-01 13:05:10.428765	2025-11-01 13:05:10.428765	1	2025-11-01 13:05:10.428765	2025-11-01 13:05:10.428765
46	والد	الطالب ماجد المسكري	parent_92531771@zinat.local	92531771	عمان	95d46a63-c799-4f9b-87cf-c6ebf82d4229	2025-11-01 13:05:10.499055	2025-11-01 13:05:10.499055	1	2025-11-01 13:05:10.499055	2025-11-01 13:05:10.499055
47	والدة	الطالب نور المصلحية	parent_99252117@zinat.local	99252117	عمان	8087566b-4a9a-4ce8-98bf-e1b4d72dd91b	2025-11-01 13:05:10.574073	2025-11-01 13:05:10.574073	1	2025-11-01 13:05:10.574073	2025-11-01 13:05:10.574073
48	والد	الطالب نور المصلحية	parent_99537070@zinat.local	99537070	عمان	28356a57-ca29-4252-8493-1e64d7e8c2ec	2025-11-01 13:05:10.644717	2025-11-01 13:05:10.644717	1	2025-11-01 13:05:10.644717	2025-11-01 13:05:10.644717
49	والدة	الطالب بندر السعدي	parent_99650307@zinat.local	99650307	عمان	81072d14-e408-486a-8703-cbce17c8e9b7	2025-11-01 13:05:10.721535	2025-11-01 13:05:10.721535	1	2025-11-01 13:05:10.721535	2025-11-01 13:05:10.721535
50	والدة	الطالب آية الحارثية	parent_92863313@zinat.local	92863313	عمان	262e9678-3021-4d71-8b93-00c1572155c0	2025-11-01 13:05:10.796241	2025-11-01 13:05:10.796241	1	2025-11-01 13:05:10.796241	2025-11-01 13:05:10.796241
51	والد	الطالب آية الحارثية	parent_95887887@zinat.local	95887887	عمان	aa089a54-35e2-4fb3-b31b-3536b031577e	2025-11-01 13:05:10.86708	2025-11-01 13:05:10.86708	1	2025-11-01 13:05:10.86708	2025-11-01 13:05:10.86708
52	والدة	الطالب طارق اليزيدي	parent_99432661@zinat.local	99432661	عمان	4679ecd4-b2cc-4b44-a1db-e07a640c7cc2	2025-11-01 13:05:10.944352	2025-11-01 13:05:10.944352	1	2025-11-01 13:05:10.944352	2025-11-01 13:05:10.944352
53	والدة	الطالب عهد المسكرية	parent_99277523@zinat.local	99277523	عمان	e23da144-61b6-47d6-85eb-0347d8ccfc04	2025-11-01 13:05:11.018448	2025-11-01 13:05:11.018448	1	2025-11-01 13:05:11.018448	2025-11-01 13:05:11.018448
54	والد	الطالب عهد المسكرية	parent_95383306@zinat.local	95383306	عمان	4db122e0-a9c2-4263-89b0-a4e1fa5a00d9	2025-11-01 13:05:11.088987	2025-11-01 13:05:11.088987	1	2025-11-01 13:05:11.088987	2025-11-01 13:05:11.088987
55	والدة	الطالب الخطاب المصلحي	parent_94050440@zinat.local	94050440	عمان	b790f3a8-5211-4773-9733-2afb92592a12	2025-11-01 13:05:11.163978	2025-11-01 13:05:11.163978	1	2025-11-01 13:05:11.163978	2025-11-01 13:05:11.163978
56	والد	الطالب الخطاب المصلحي	parent_91373337@zinat.local	91373337	عمان	7690a1db-c675-4653-a6e7-a876383417f0	2025-11-01 13:05:11.235067	2025-11-01 13:05:11.235067	1	2025-11-01 13:05:11.235067	2025-11-01 13:05:11.235067
57	والدة	الطالب لين السعدية	parent_94365977@zinat.local	94365977	عمان	b0b49458-cc73-4197-9e94-2d47a1ee9e2e	2025-11-01 13:05:11.309749	2025-11-01 13:05:11.309749	1	2025-11-01 13:05:11.309749	2025-11-01 13:05:11.309749
58	والد	الطالب لين السعدية	parent_94091267@zinat.local	94091267	عمان	14a0f1ad-46cd-4616-82f7-c51dbc9d1f40	2025-11-01 13:05:11.380843	2025-11-01 13:05:11.380843	1	2025-11-01 13:05:11.380843	2025-11-01 13:05:11.380843
59	والدة	الطالب أجوان المسكرية	parent_95177699@zinat.local	95177699	عمان	8af83477-f92b-43ba-8b8b-d792b38f3e1d	2025-11-01 13:05:11.457069	2025-11-01 13:05:11.457069	1	2025-11-01 13:05:11.457069	2025-11-01 13:05:11.457069
60	والد	الطالب أجوان المسكرية	parent_92344016@zinat.local	92344016	عمان	3becfdfb-403a-4064-8d7b-b751900779ed	2025-11-01 13:05:11.528406	2025-11-01 13:05:11.528406	1	2025-11-01 13:05:11.528406	2025-11-01 13:05:11.528406
61	والدة	الطالب القاسم الإسماعيلي	parent_92996869@zinat.local	92996869	عمان	5d186609-1aca-4c68-8960-c45362e4e674	2025-11-01 13:05:11.603078	2025-11-01 13:05:11.603078	1	2025-11-01 13:05:11.603078	2025-11-01 13:05:11.603078
62	والد	الطالب القاسم الإسماعيلي	parent_95148516@zinat.local	95148516	عمان	44b07cd5-c193-4d4d-9dc6-fe3149e6c469	2025-11-01 13:05:11.674428	2025-11-01 13:05:11.674428	1	2025-11-01 13:05:11.674428	2025-11-01 13:05:11.674428
63	والدة	الطالب سلطانة المسكرية	parent_78048099@zinat.local	78048099	عمان	e2faee80-b7cf-41af-8e51-29912e644725	2025-11-01 13:05:11.749163	2025-11-01 13:05:11.749163	1	2025-11-01 13:05:11.749163	2025-11-01 13:05:11.749163
64	والد	الطالب سلطانة المسكرية	parent_92255324@zinat.local	92255324	عمان	a34aec95-775f-4acf-9d30-53b16c918e20	2025-11-01 13:05:11.821007	2025-11-01 13:05:11.821007	1	2025-11-01 13:05:11.821007	2025-11-01 13:05:11.821007
65	والدة	الطالب ريما المسكرية	parent_91161333@zinat.local	91161333	عمان	0bee4d3a-1379-4662-8934-f0e151a1f6f4	2025-11-01 13:05:11.89708	2025-11-01 13:05:11.89708	1	2025-11-01 13:05:11.89708	2025-11-01 13:05:11.89708
66	والد	الطالب ريما المسكرية	parent_99840099@zinat.local	99840099	عمان	c26ae68f-8ac3-4a0a-a0d7-322575220280	2025-11-01 13:05:11.968576	2025-11-01 13:05:11.968576	1	2025-11-01 13:05:11.968576	2025-11-01 13:05:11.968576
67	والدة	الطالب جمانة الحارثية	parent_96988621@zinat.local	96988621	عمان	c58764c9-873f-428c-ad82-29731174d143	2025-11-01 13:05:12.042324	2025-11-01 13:05:12.042324	1	2025-11-01 13:05:12.042324	2025-11-01 13:05:12.042324
68	والد	الطالب جمانة الحارثية	parent_99728080@zinat.local	99728080	عمان	52f5fdc0-3d20-4a30-8337-245a7906aa7d	2025-11-01 13:05:12.112561	2025-11-01 13:05:12.112561	1	2025-11-01 13:05:12.112561	2025-11-01 13:05:12.112561
69	والدة	الطالب تسنيم المصلحية	parent_98000822@zinat.local	98000822	عمان	b0678766-eda8-4232-80db-719ee165f1ab	2025-11-01 13:05:12.188049	2025-11-01 13:05:12.188049	1	2025-11-01 13:05:12.188049	2025-11-01 13:05:12.188049
70	والد	الطالب تسنيم المصلحية	parent_94009966@zinat.local	94009966	عمان	c94a555b-7ce6-4e8e-a035-0b8e150c335b	2025-11-01 13:05:12.258907	2025-11-01 13:05:12.258907	1	2025-11-01 13:05:12.258907	2025-11-01 13:05:12.258907
71	والدة	الطالب الهنوف الحارثي	parent_99123363@zinat.local	99123363	عمان	77c826d9-860a-4ffb-94c2-900c5979e60e	2025-11-01 13:05:12.334318	2025-11-01 13:05:12.334318	1	2025-11-01 13:05:12.334318	2025-11-01 13:05:12.334318
72	والد	الطالب الهنوف الحارثي	parent_92082950@zinat.local	92082950	عمان	960554b6-4e45-49c2-b3ed-ba49cef0495a	2025-11-01 13:05:12.405603	2025-11-01 13:05:12.405603	1	2025-11-01 13:05:12.405603	2025-11-01 13:05:12.405603
73	والدة	الطالب سُلطان اليعرُبي	parent_95441993@zinat.local	95441993	عمان	1c19719a-2950-4cb0-95ec-48ca660ce897	2025-11-01 13:05:12.482315	2025-11-01 13:05:12.482315	1	2025-11-01 13:05:12.482315	2025-11-01 13:05:12.482315
74	والد	الطالب سُلطان اليعرُبي	parent_99478322@zinat.local	99478322	عمان	a5a1e1b3-6f98-4092-af08-0fc1e7676909	2025-11-01 13:05:12.553125	2025-11-01 13:05:12.553125	1	2025-11-01 13:05:12.553125	2025-11-01 13:05:12.553125
75	والدة	الطالب سالم المسكري	parent_95910310@zinat.local	95910310	عمان	cf7efac9-da83-46e8-bca1-4261136da64f	2025-11-01 13:05:12.62883	2025-11-01 13:05:12.62883	1	2025-11-01 13:05:12.62883	2025-11-01 13:05:12.62883
76	والد	الطالب سالم المسكري	parent_93500098@zinat.local	93500098	عمان	fa079dd0-dffa-4cd7-82f6-4563844ca893	2025-11-01 13:05:12.70356	2025-11-01 13:05:12.70356	1	2025-11-01 13:05:12.70356	2025-11-01 13:05:12.70356
77	والدة	الطالب عبدالله الغيثي	parent_91964112@zinat.local	91964112	عمان	82f57cbf-83c7-4262-a0f4-4163874bb7c9	2025-11-01 13:05:12.776895	2025-11-01 13:05:12.776895	1	2025-11-01 13:05:12.776895	2025-11-01 13:05:12.776895
78	والد	الطالب عبدالله الغيثي	parent_92814558@zinat.local	92814558	عمان	f98939d3-9078-49b1-be7f-05d272efb230	2025-11-01 13:05:12.847496	2025-11-01 13:05:12.847496	1	2025-11-01 13:05:12.847496	2025-11-01 13:05:12.847496
79	والدة	الطالب مزن المسكرية	parent_95239039@zinat.local	95239039	عمان	d4db4df5-7b08-4df8-8875-9c81732d1f96	2025-11-01 13:05:12.921497	2025-11-01 13:05:12.921497	1	2025-11-01 13:05:12.921497	2025-11-01 13:05:12.921497
80	والد	الطالب مزن المسكرية	parent_96777593@zinat.local	96777593	عمان	c1ed771a-e271-426d-85d1-7eb549904a8e	2025-11-01 13:05:12.99201	2025-11-01 13:05:12.99201	1	2025-11-01 13:05:12.99201	2025-11-01 13:05:12.99201
81	والدة	الطالب آية المغيرية	parent_96010653@zinat.local	96010653	عمان	2f68f713-f89a-4ba9-a407-3f6e587ededb	2025-11-01 13:05:13.139881	2025-11-01 13:05:13.139881	1	2025-11-01 13:05:13.139881	2025-11-01 13:05:13.139881
82	والد	الطالب آية المغيرية	parent_96706407@zinat.local	96706407	عمان	b999d881-15bb-42fb-a16a-62197a0dccd4	2025-11-01 13:05:13.209962	2025-11-01 13:05:13.209962	1	2025-11-01 13:05:13.209962	2025-11-01 13:05:13.209962
83	والدة	الطالب شبيب الغنيمي	parent_98532380@zinat.local	98532380	عمان	9758dd51-d35c-45d1-905f-acdb17292d9e	2025-11-01 13:05:13.283863	2025-11-01 13:05:13.283863	1	2025-11-01 13:05:13.283863	2025-11-01 13:05:13.283863
84	والد	الطالب شبيب الغنيمي	parent_96212441@zinat.local	96212441	عمان	a2676579-27f9-4771-90cc-0a550284502f	2025-11-01 13:05:13.354898	2025-11-01 13:05:13.354898	1	2025-11-01 13:05:13.354898	2025-11-01 13:05:13.354898
85	والدة	الطالب أنس السعدي	parent_95611424@zinat.local	95611424	عمان	0c161026-ab1e-45f0-8b28-ed1fa84f26cd	2025-11-01 13:05:13.429786	2025-11-01 13:05:13.429786	1	2025-11-01 13:05:13.429786	2025-11-01 13:05:13.429786
86	والدة	الطالب الآء الأبروية	parent_98888208@zinat.local	98888208	عمان	89784620-631d-4615-aabd-ec85e26b61c2	2025-11-01 13:05:13.504048	2025-11-01 13:05:13.504048	1	2025-11-01 13:05:13.504048	2025-11-01 13:05:13.504048
87	والد	الطالب الآء الأبروية	parent_99897769@zinat.local	99897769	عمان	70923e92-670f-42f6-a47f-3bf4f4c85425	2025-11-01 13:05:13.57443	2025-11-01 13:05:13.57443	1	2025-11-01 13:05:13.57443	2025-11-01 13:05:13.57443
88	والدة	الطالب سيف الغنيمي	parent_97390222@zinat.local	97390222	عمان	ec2a0493-ed8f-4357-b077-f0c3b70cdf40	2025-11-01 13:05:13.649465	2025-11-01 13:05:13.649465	1	2025-11-01 13:05:13.649465	2025-11-01 13:05:13.649465
89	والد	الطالب سيف الغنيمي	parent_95020222@zinat.local	95020222	عمان	4c386882-d5be-4780-ba79-9396865b92d9	2025-11-01 13:05:13.719971	2025-11-01 13:05:13.719971	1	2025-11-01 13:05:13.719971	2025-11-01 13:05:13.719971
90	والدة	الطالب أمنة المسكرية	parent_90197579@zinat.local	90197579	عمان	88dc95f1-bd76-410d-91db-a5a3b9124975	2025-11-01 13:05:13.795018	2025-11-01 13:05:13.795018	1	2025-11-01 13:05:13.795018	2025-11-01 13:05:13.795018
91	والدة	الطالب حلا اليزيدية	parent_91221290@zinat.local	91221290	عمان	30c52579-2048-4d00-b1e5-955d2436386c	2025-11-01 13:05:13.869005	2025-11-01 13:05:13.869005	1	2025-11-01 13:05:13.869005	2025-11-01 13:05:13.869005
92	والد	الطالب حلا اليزيدية	parent_99576843@zinat.local	99576843	عمان	8ade8c92-ffa3-4126-9463-f945be259718	2025-11-01 13:05:13.939787	2025-11-01 13:05:13.939787	1	2025-11-01 13:05:13.939787	2025-11-01 13:05:13.939787
93	والدة	الطالب هبة الأبروية	parent_91102383@zinat.local	91102383	عمان	7ff7703f-e9bb-4a79-af8e-f2ee3be7d530	2025-11-01 13:05:14.014076	2025-11-01 13:05:14.014076	1	2025-11-01 13:05:14.014076	2025-11-01 13:05:14.014076
94	والد	الطالب هبة الأبروية	parent_92223282@zinat.local	92223282	عمان	58bd1bf3-df9a-46f7-bc47-9bb3daf9b603	2025-11-01 13:05:14.084001	2025-11-01 13:05:14.084001	1	2025-11-01 13:05:14.084001	2025-11-01 13:05:14.084001
95	والدة	الطالب هيثم اليزيدي	parent_99898928@zinat.local	99898928	عمان	0c931304-9451-4e4f-b784-1979772b239b	2025-11-01 13:05:14.159137	2025-11-01 13:05:14.159137	1	2025-11-01 13:05:14.159137	2025-11-01 13:05:14.159137
96	والد	الطالب هيثم اليزيدي	parent_99347530@zinat.local	99347530	عمان	062d39fb-b105-4151-ba0a-c734c2feebd0	2025-11-01 13:05:14.232724	2025-11-01 13:05:14.232724	1	2025-11-01 13:05:14.232724	2025-11-01 13:05:14.232724
97	والدة	الطالب رهام الرحبية	parent_94499896@zinat.local	94499896	عمان	229e8ef1-2ae7-4b8b-b2cf-03b7580962fb	2025-11-01 13:05:14.312199	2025-11-01 13:05:14.312199	1	2025-11-01 13:05:14.312199	2025-11-01 13:05:14.312199
98	والد	الطالب رهام الرحبية	parent_92304811@zinat.local	92304811	عمان	d7608138-1bfd-4c3b-837e-1bc1e6198678	2025-11-01 13:05:14.386193	2025-11-01 13:05:14.386193	1	2025-11-01 13:05:14.386193	2025-11-01 13:05:14.386193
99	والدة	الطالب مريم السعدية	parent_92518477@zinat.local	92518477	عمان	38fa0944-0f83-4039-af56-7663e215f9db	2025-11-01 13:05:14.463222	2025-11-01 13:05:14.463222	1	2025-11-01 13:05:14.463222	2025-11-01 13:05:14.463222
100	والد	الطالب مريم السعدية	parent_92907478@zinat.local	92907478	عمان	7da42408-4383-4450-b75b-e1a902cd9198	2025-11-01 13:05:14.536103	2025-11-01 13:05:14.536103	1	2025-11-01 13:05:14.536103	2025-11-01 13:05:14.536103
101	والدة	الطالب الحسن المصلحي	parent_90946647@zinat.local	90946647	عمان	7a2ca9e6-c8f9-48c5-847d-2bc4edeee4d0	2025-11-01 13:05:14.611599	2025-11-01 13:05:14.611599	1	2025-11-01 13:05:14.611599	2025-11-01 13:05:14.611599
102	والد	الطالب الحسن المصلحي	parent_95908395@zinat.local	95908395	عمان	6121a9d2-4c88-491c-99fb-08afd85b9210	2025-11-01 13:05:14.681623	2025-11-01 13:05:14.681623	1	2025-11-01 13:05:14.681623	2025-11-01 13:05:14.681623
103	والدة	الطالب محمد اليزيدي	parent_96067035@zinat.local	96067035	عمان	5889749c-2b89-4d94-bd3f-cfb988ff9725	2025-11-01 13:05:14.755814	2025-11-01 13:05:14.755814	1	2025-11-01 13:05:14.755814	2025-11-01 13:05:14.755814
104	والد	الطالب محمد اليزيدي	parent_92296979@zinat.local	92296979	عمان	508ebed4-44cd-4ce1-9ac9-19c9835df0e3	2025-11-01 13:05:14.827157	2025-11-01 13:05:14.827157	1	2025-11-01 13:05:14.827157	2025-11-01 13:05:14.827157
105	والدة	الطالب نبراس الحارثي	parent_96433061@zinat.local	96433061	عمان	050396ff-a166-43ea-af3a-d87013ccab7f	2025-11-01 13:05:14.901444	2025-11-01 13:05:14.901444	1	2025-11-01 13:05:14.901444	2025-11-01 13:05:14.901444
106	والد	الطالب نبراس الحارثي	parent_95047783@zinat.local	95047783	عمان	0450c32a-17de-48fd-b5da-7dbf49da1683	2025-11-01 13:05:14.970815	2025-11-01 13:05:14.970815	1	2025-11-01 13:05:14.970815	2025-11-01 13:05:14.970815
107	والدة	الطالب هبة الغنيمية	parent_93251825@zinat.local	93251825	عمان	4692c087-d170-4cf4-81f6-3de91d9b66a9	2025-11-01 13:05:15.049561	2025-11-01 13:05:15.049561	1	2025-11-01 13:05:15.049561	2025-11-01 13:05:15.049561
108	والد	الطالب هبة الغنيمية	parent_99646261@zinat.local	99646261	عمان	daf4bcc1-321f-43e9-9027-4f5c0cc85e58	2025-11-01 13:05:15.12135	2025-11-01 13:05:15.12135	1	2025-11-01 13:05:15.12135	2025-11-01 13:05:15.12135
109	والدة	الطالب إيلاف النظيرية	parent_96927883@zinat.local	96927883	عمان	a0caa5c4-f27c-4130-b9c3-9fe505577fb3	2025-11-01 13:05:15.199672	2025-11-01 13:05:15.199672	1	2025-11-01 13:05:15.199672	2025-11-01 13:05:15.199672
110	والد	الطالب إيلاف النظيرية	parent_95822009@zinat.local	95822009	عمان	701a1dcd-a3d7-4794-b9f6-cfb379f7bba7	2025-11-01 13:05:15.270433	2025-11-01 13:05:15.270433	1	2025-11-01 13:05:15.270433	2025-11-01 13:05:15.270433
111	والدة	الطالب مسك المسكرية	parent_96448770@zinat.local	96448770	عمان	78257e11-5697-4f25-9e33-22d643c058fd	2025-11-01 13:05:15.346419	2025-11-01 13:05:15.346419	1	2025-11-01 13:05:15.346419	2025-11-01 13:05:15.346419
112	والد	الطالب مسك المسكرية	parent_98675050@zinat.local	98675050	عمان	92b1e7e2-d80f-45c6-82f4-35e3edfa345a	2025-11-01 13:05:15.417785	2025-11-01 13:05:15.417785	1	2025-11-01 13:05:15.417785	2025-11-01 13:05:15.417785
113	والدة	الطالب أمجد السابقي	parent_93555689@zinat.local	93555689	عمان	29eebfaa-db31-44b5-8d5e-38e5e70b2773	2025-11-01 13:05:15.492857	2025-11-01 13:05:15.492857	1	2025-11-01 13:05:15.492857	2025-11-01 13:05:15.492857
114	والد	الطالب أمجد السابقي	parent_92949543@zinat.local	92949543	عمان	86b7ae18-1a5e-42ea-af70-06b3e2f52dbb	2025-11-01 13:05:15.563752	2025-11-01 13:05:15.563752	1	2025-11-01 13:05:15.563752	2025-11-01 13:05:15.563752
115	والدة	الطالب فارس الغنيمي	parent_99262434@zinat.local	99262434	عمان	e430974d-cf7f-4002-af49-206cfb6e9a33	2025-11-01 13:05:15.64102	2025-11-01 13:05:15.64102	1	2025-11-01 13:05:15.64102	2025-11-01 13:05:15.64102
116	والد	الطالب فارس الغنيمي	parent_97149449@zinat.local	97149449	عمان	7fb7537c-d176-4193-97d6-a02181150732	2025-11-01 13:05:15.710958	2025-11-01 13:05:15.710958	1	2025-11-01 13:05:15.710958	2025-11-01 13:05:15.710958
117	والدة	الطالب عمر الحارثي	parent_97277795@zinat.local	97277795	عمان	2d08436e-13c1-42a5-8141-e9fc1ce3977c	2025-11-01 13:05:15.790185	2025-11-01 13:05:15.790185	1	2025-11-01 13:05:15.790185	2025-11-01 13:05:15.790185
118	والد	الطالب عمر الحارثي	parent_96162624@zinat.local	96162624	عمان	dd5cd6f6-ff8c-4388-bd9a-cfbad6de25e6	2025-11-01 13:05:15.861976	2025-11-01 13:05:15.861976	1	2025-11-01 13:05:15.861976	2025-11-01 13:05:15.861976
119	والدة	الطالب سارة الطوقية	parent_95426643@zinat.local	95426643	عمان	d6081ae2-5945-4c1e-bfe2-b523c3bb9285	2025-11-01 13:05:15.939241	2025-11-01 13:05:15.939241	1	2025-11-01 13:05:15.939241	2025-11-01 13:05:15.939241
120	والد	الطالب سارة الطوقية	parent_94738797@zinat.local	94738797	عمان	206d0f37-cf5e-426b-b2d5-c4eb64270af4	2025-11-01 13:05:16.010231	2025-11-01 13:05:16.010231	1	2025-11-01 13:05:16.010231	2025-11-01 13:05:16.010231
121	والدة	الطالب هاجر الأبروية	parent_99119220@zinat.local	99119220	عمان	d9c69096-cb9a-4659-bcf2-d77386e926f0	2025-11-01 13:05:16.155591	2025-11-01 13:05:16.155591	1	2025-11-01 13:05:16.155591	2025-11-01 13:05:16.155591
122	والد	الطالب هاجر الأبروية	parent_99343718@zinat.local	99343718	عمان	589ef6b4-9221-4f84-a9c7-a501ab74fe94	2025-11-01 13:05:16.226214	2025-11-01 13:05:16.226214	1	2025-11-01 13:05:16.226214	2025-11-01 13:05:16.226214
123	والدة	الطالب بشائر المسكرية	parent_98963964@zinat.local	98963964	عمان	fb90e8f7-8e77-4578-8aff-365b31e9aa14	2025-11-01 13:05:16.301678	2025-11-01 13:05:16.301678	1	2025-11-01 13:05:16.301678	2025-11-01 13:05:16.301678
124	والدة	الطالب هاجر المصلحية	parent_99113491@zinat.local	99113491	عمان	4746f4e0-dba5-4709-b184-01dd81f8ce76	2025-11-01 13:05:16.376218	2025-11-01 13:05:16.376218	1	2025-11-01 13:05:16.376218	2025-11-01 13:05:16.376218
125	والد	الطالب هاجر المصلحية	parent_95888218@zinat.local	95888218	عمان	dadcdf93-6389-4b02-aa21-395765100eb6	2025-11-01 13:05:16.447135	2025-11-01 13:05:16.447135	1	2025-11-01 13:05:16.447135	2025-11-01 13:05:16.447135
126	والدة	الطالب سلطان المغيري	parent_95967228@zinat.local	95967228	عمان	340beb3c-09c9-4165-8e48-cbabb790c218	2025-11-01 13:05:16.521891	2025-11-01 13:05:16.521891	1	2025-11-01 13:05:16.521891	2025-11-01 13:05:16.521891
127	والد	الطالب سلطان المغيري	parent_92466566@zinat.local	92466566	عمان	00cce789-c94a-4d7a-b902-b3b559b96221	2025-11-01 13:05:16.593159	2025-11-01 13:05:16.593159	1	2025-11-01 13:05:16.593159	2025-11-01 13:05:16.593159
128	والدة	الطالب مريم الريامية	parent_92929386@zinat.local	92929386	عمان	7d287a6a-6e67-406d-a8a4-c39ee5abfc8c	2025-11-01 13:05:16.667552	2025-11-01 13:05:16.667552	1	2025-11-01 13:05:16.667552	2025-11-01 13:05:16.667552
129	والد	الطالب مريم الريامية	parent_96010671@zinat.local	96010671	عمان	c75c9ee0-0542-4b29-9d28-228b9641a77e	2025-11-01 13:05:16.737729	2025-11-01 13:05:16.737729	1	2025-11-01 13:05:16.737729	2025-11-01 13:05:16.737729
130	والدة	الطالب البتول المصلحي	parent_92260170@zinat.local	92260170	عمان	6ab29946-2b34-4591-a28d-309a53965cf2	2025-11-01 13:05:16.812317	2025-11-01 13:05:16.812317	1	2025-11-01 13:05:16.812317	2025-11-01 13:05:16.812317
131	والد	الطالب البتول المصلحي	parent_98273385@zinat.local	98273385	عمان	8ea74c5d-e7e5-4c41-a70d-3516728ae3e5	2025-11-01 13:05:16.882879	2025-11-01 13:05:16.882879	1	2025-11-01 13:05:16.882879	2025-11-01 13:05:16.882879
132	والدة	الطالب محمد اليزيدي	parent_92933730@zinat.local	92933730	عمان	8a872ed0-d70d-40e5-8bc4-6325d64efedf	2025-11-01 13:05:16.957469	2025-11-01 13:05:16.957469	1	2025-11-01 13:05:16.957469	2025-11-01 13:05:16.957469
133	والد	الطالب محمد اليزيدي	parent_99024544@zinat.local	99024544	عمان	16967956-6195-4ea4-8427-52389d8f0a02	2025-11-01 13:05:17.028776	2025-11-01 13:05:17.028776	1	2025-11-01 13:05:17.028776	2025-11-01 13:05:17.028776
134	والدة	الطالب سليمان السعدي	parent_95128431@zinat.local	95128431	عمان	79aedf0c-beee-4966-82a0-9cdf232b34d2	2025-11-01 13:05:17.104302	2025-11-01 13:05:17.104302	1	2025-11-01 13:05:17.104302	2025-11-01 13:05:17.104302
135	والد	الطالب سليمان السعدي	parent_95480570@zinat.local	95480570	عمان	d1bbc32c-63bd-4144-99b9-794f9302c851	2025-11-01 13:05:17.176474	2025-11-01 13:05:17.176474	1	2025-11-01 13:05:17.176474	2025-11-01 13:05:17.176474
136	والدة	الطالب جمان الرحبية	parent_95924561@zinat.local	95924561	عمان	447bb373-1d1a-486a-85e4-77d22fcf76f7	2025-11-01 13:05:17.251996	2025-11-01 13:05:17.251996	1	2025-11-01 13:05:17.251996	2025-11-01 13:05:17.251996
137	والد	الطالب جمان الرحبية	parent_92677489@zinat.local	92677489	عمان	16b566b9-cfbe-4957-92e7-2b1abf9fc251	2025-11-01 13:05:17.323303	2025-11-01 13:05:17.323303	1	2025-11-01 13:05:17.323303	2025-11-01 13:05:17.323303
138	والدة	الطالب سارة السيابية	parent_92837305@zinat.local	92837305	عمان	9294319d-46a2-42cc-a7c4-aa67b4413d62	2025-11-01 13:05:17.398577	2025-11-01 13:05:17.398577	1	2025-11-01 13:05:17.398577	2025-11-01 13:05:17.398577
139	والد	الطالب سارة السيابية	parent_99790947@zinat.local	99790947	عمان	8f30fce8-0f4f-4088-9b56-46a6d50878ef	2025-11-01 13:05:17.469485	2025-11-01 13:05:17.469485	1	2025-11-01 13:05:17.469485	2025-11-01 13:05:17.469485
140	والدة	الطالب سعيد السيابي	parent_95266492@zinat.local	95266492	عمان	35f776d1-55da-4bb5-95fe-76814b898980	2025-11-01 13:05:17.552301	2025-11-01 13:05:17.552301	1	2025-11-01 13:05:17.552301	2025-11-01 13:05:17.552301
141	والد	الطالب سعيد السيابي	parent_99005499@zinat.local	99005499	عمان	3146ee4a-8028-4223-8ee4-8c31f1b89a47	2025-11-01 13:05:17.623452	2025-11-01 13:05:17.623452	1	2025-11-01 13:05:17.623452	2025-11-01 13:05:17.623452
142	والدة	الطالب يحيى البراشدي	parent_99899662@zinat.local	99899662	عمان	2de1e070-a8ab-4848-8753-97103be25a4a	2025-11-01 13:05:17.698303	2025-11-01 13:05:17.698303	1	2025-11-01 13:05:17.698303	2025-11-01 13:05:17.698303
143	والد	الطالب يحيى البراشدي	parent_99332992@zinat.local	99332992	عمان	e882c565-48d2-425b-874e-6f4b7062d156	2025-11-01 13:05:17.768884	2025-11-01 13:05:17.768884	1	2025-11-01 13:05:17.768884	2025-11-01 13:05:17.768884
144	والدة	الطالب تيمور المصلحي	parent_93336581@zinat.local	93336581	عمان	7187b603-dde1-404a-b7aa-2fcfe9279d25	2025-11-01 13:05:17.846224	2025-11-01 13:05:17.846224	1	2025-11-01 13:05:17.846224	2025-11-01 13:05:17.846224
145	والد	الطالب تيمور المصلحي	parent_99238295@zinat.local	99238295	عمان	7469ffeb-d3e4-4bbc-ae92-42dfe2f65a5c	2025-11-01 13:05:17.918127	2025-11-01 13:05:17.918127	1	2025-11-01 13:05:17.918127	2025-11-01 13:05:17.918127
146	والدة	الطالب نور السعدية	parent_93527457@zinat.local	93527457	عمان	a3fee07a-837f-47c3-b51f-e0dc998ee761	2025-11-01 13:05:17.994142	2025-11-01 13:05:17.994142	1	2025-11-01 13:05:17.994142	2025-11-01 13:05:17.994142
147	والد	الطالب نور السعدية	parent_99518145@zinat.local	99518145	عمان	dfdad4c3-98f3-4a2f-8b83-feb612f9d698	2025-11-01 13:05:18.064524	2025-11-01 13:05:18.064524	1	2025-11-01 13:05:18.064524	2025-11-01 13:05:18.064524
148	والدة	الطالب فرح الشحيمية	parent_99669597@zinat.local	99669597	عمان	026aeaee-3886-4ca7-bd42-adb69c4dcf88	2025-11-01 13:05:18.209927	2025-11-01 13:05:18.209927	1	2025-11-01 13:05:18.209927	2025-11-01 13:05:18.209927
149	والد	الطالب فرح الشحيمية	parent_92839030@zinat.local	92839030	عمان	c75126c3-5c9a-44d7-bf38-799fbc60f6c0	2025-11-01 13:05:18.280408	2025-11-01 13:05:18.280408	1	2025-11-01 13:05:18.280408	2025-11-01 13:05:18.280408
150	والدة	الطالب حمزة المسكري	parent_92311816@zinat.local	92311816	عمان	7b2b66c0-ce89-407f-93bc-e2b1c28187b0	2025-11-01 13:05:18.354293	2025-11-01 13:05:18.354293	1	2025-11-01 13:05:18.354293	2025-11-01 13:05:18.354293
151	والد	الطالب حمزة المسكري	parent_95464336@zinat.local	95464336	عمان	25165b46-4d4a-4b60-8aa7-11d65d4b0b1c	2025-11-01 13:05:18.425149	2025-11-01 13:05:18.425149	1	2025-11-01 13:05:18.425149	2025-11-01 13:05:18.425149
152	والدة	الطالب لتين المسكري	parent_95931443@zinat.local	95931443	عمان	fc529176-1092-4912-a248-9dfd4e46f543	2025-11-01 13:05:18.499461	2025-11-01 13:05:18.499461	1	2025-11-01 13:05:18.499461	2025-11-01 13:05:18.499461
153	والد	الطالب لتين المسكري	parent_96467667@zinat.local	96467667	عمان	5f2397c2-a60a-43b5-bc2d-0dbf2224f31e	2025-11-01 13:05:18.571556	2025-11-01 13:05:18.571556	1	2025-11-01 13:05:18.571556	2025-11-01 13:05:18.571556
154	والدة	الطالب ملاك العزري	parent_98200029@zinat.local	98200029	عمان	6232fc09-1a6d-4567-a9e2-1a40320dec97	2025-11-01 13:05:18.646553	2025-11-01 13:05:18.646553	1	2025-11-01 13:05:18.646553	2025-11-01 13:05:18.646553
155	والد	الطالب ملاك العزري	parent_93000045@zinat.local	93000045	عمان	67ccaa1b-c79d-4da7-a937-aeebb695197e	2025-11-01 13:05:18.717569	2025-11-01 13:05:18.717569	1	2025-11-01 13:05:18.717569	2025-11-01 13:05:18.717569
156	والدة	الطالب يوسف الصقري	parent_95215738@zinat.local	95215738	عمان	212a03cd-6439-4847-9825-6c26cd264402	2025-11-01 13:05:18.792167	2025-11-01 13:05:18.792167	1	2025-11-01 13:05:18.792167	2025-11-01 13:05:18.792167
157	والد	الطالب يوسف الصقري	parent_96641062@zinat.local	96641062	عمان	7bda3396-5546-428b-b550-2be19e61f02e	2025-11-01 13:05:18.862454	2025-11-01 13:05:18.862454	1	2025-11-01 13:05:18.862454	2025-11-01 13:05:18.862454
158	والدة	الطالب أنس الحارثي	parent_96402929@zinat.local	96402929	عمان	56563198-8357-4534-ab1d-f8734ea5482c	2025-11-01 13:05:18.94188	2025-11-01 13:05:18.94188	1	2025-11-01 13:05:18.94188	2025-11-01 13:05:18.94188
159	والدة	الطالب أنس الحارثي	parent_94484465@zinat.local	94484465	عمان	ae54bd88-6e62-4ff8-b7b1-4cf64083114d	2025-11-01 13:05:19.01664	2025-11-01 13:05:19.01664	1	2025-11-01 13:05:19.01664	2025-11-01 13:05:19.01664
160	والد	الطالب أنس الحارثي	parent_95397376@zinat.local	95397376	عمان	626a3c4c-86b1-4ff4-a98d-b5a8aee34b69	2025-11-01 13:05:19.087388	2025-11-01 13:05:19.087388	1	2025-11-01 13:05:19.087388	2025-11-01 13:05:19.087388
161	والدة	الطالب سدى البوسعيدية	parent_99378699@zinat.local	99378699	عمان	508d3d5d-67c0-4ca4-96c9-1a3b7483aec3	2025-11-01 13:05:19.162309	2025-11-01 13:05:19.162309	1	2025-11-01 13:05:19.162309	2025-11-01 13:05:19.162309
162	والد	الطالب سدى البوسعيدية	parent_94050678@zinat.local	94050678	عمان	f1e2e99d-f1b5-433a-bb1b-6d3ccacc9e9f	2025-11-01 13:05:19.233578	2025-11-01 13:05:19.233578	1	2025-11-01 13:05:19.233578	2025-11-01 13:05:19.233578
163	والدة	الطالب نسيبة الصوافية	parent_97126778@zinat.local	97126778	عمان	d8893906-52fd-4fd3-8a86-0a306aa9bb6d	2025-11-01 13:05:19.311022	2025-11-01 13:05:19.311022	1	2025-11-01 13:05:19.311022	2025-11-01 13:05:19.311022
164	والد	الطالب نسيبة الصوافية	parent_97791661@zinat.local	97791661	عمان	c04ad6bc-da5e-475d-a17b-775b7922fc85	2025-11-01 13:05:19.382778	2025-11-01 13:05:19.382778	1	2025-11-01 13:05:19.382778	2025-11-01 13:05:19.382778
165	والدة	الطالب صهيب الحارثي	parent_95175490@zinat.local	95175490	عمان	cbe77914-89c3-4da1-a502-ee24b5c40552	2025-11-01 13:05:19.457665	2025-11-01 13:05:19.457665	1	2025-11-01 13:05:19.457665	2025-11-01 13:05:19.457665
166	والدة	الطالب الحسن الطالعي	parent_94141523@zinat.local	94141523	عمان	a7a68c5a-ba51-4601-ad54-d8953b2ac03b	2025-11-01 13:05:19.532221	2025-11-01 13:05:19.532221	1	2025-11-01 13:05:19.532221	2025-11-01 13:05:19.532221
167	والد	الطالب الحسن الطالعي	parent_94881766@zinat.local	94881766	عمان	f08add49-b480-46d4-9147-8029804238fe	2025-11-01 13:05:19.603123	2025-11-01 13:05:19.603123	1	2025-11-01 13:05:19.603123	2025-11-01 13:05:19.603123
168	والدة	الطالب شمه الرحبية	parent_96063357@zinat.local	96063357	عمان	4bbcc292-15dd-40c8-b8e1-f4da9859e232	2025-11-01 13:05:19.679359	2025-11-01 13:05:19.679359	1	2025-11-01 13:05:19.679359	2025-11-01 13:05:19.679359
169	والد	الطالب شمه الرحبية	parent_77535302@zinat.local	77535302	عمان	7928e3f6-2fd7-44e7-a75a-05f5ae0184c4	2025-11-01 13:05:19.751129	2025-11-01 13:05:19.751129	1	2025-11-01 13:05:19.751129	2025-11-01 13:05:19.751129
170	والدة	الطالب شعيب المسكري	parent_92892110@zinat.local	92892110	عمان	c1e32556-ed91-4b87-92de-6ebeb97a5954	2025-11-01 13:05:19.825727	2025-11-01 13:05:19.825727	1	2025-11-01 13:05:19.825727	2025-11-01 13:05:19.825727
171	والد	الطالب شعيب المسكري	parent_96563080@zinat.local	96563080	عمان	6083c320-18c6-4eb8-b865-c9570e321761	2025-11-01 13:05:19.896266	2025-11-01 13:05:19.896266	1	2025-11-01 13:05:19.896266	2025-11-01 13:05:19.896266
172	والدة	الطالب سبأ الغزالية	parent_95677123@zinat.local	95677123	عمان	a2f434d3-383b-46e7-9162-f727890716e3	2025-11-01 13:05:19.97117	2025-11-01 13:05:19.97117	1	2025-11-01 13:05:19.97117	2025-11-01 13:05:19.97117
173	والد	الطالب سبأ الغزالية	parent_96035441@zinat.local	96035441	عمان	ee815e9f-bd7f-4b66-a445-6c68e5f69c07	2025-11-01 13:05:20.041402	2025-11-01 13:05:20.041402	1	2025-11-01 13:05:20.041402	2025-11-01 13:05:20.041402
174	والدة	الطالب جمان السعدية	parent_95412391@zinat.local	95412391	عمان	30fb87e9-61a0-4cb0-9efb-0c3ce40b6104	2025-11-01 13:05:20.117448	2025-11-01 13:05:20.117448	1	2025-11-01 13:05:20.117448	2025-11-01 13:05:20.117448
175	والد	الطالب جمان السعدية	parent_99071736@zinat.local	99071736	عمان	8e10ee08-86a5-485a-9262-58ff35a54fae	2025-11-01 13:05:20.189589	2025-11-01 13:05:20.189589	1	2025-11-01 13:05:20.189589	2025-11-01 13:05:20.189589
176	والدة	الطالب سعود الراشدي	parent_92891771@zinat.local	92891771	عمان	66706916-0a1a-4864-842a-e8c5391e9833	2025-11-01 13:05:20.264297	2025-11-01 13:05:20.264297	1	2025-11-01 13:05:20.264297	2025-11-01 13:05:20.264297
177	والد	الطالب سعود الراشدي	parent_92511613@zinat.local	92511613	عمان	e84b4419-0154-4ba7-b904-ba15401694ff	2025-11-01 13:05:20.335152	2025-11-01 13:05:20.335152	1	2025-11-01 13:05:20.335152	2025-11-01 13:05:20.335152
178	والدة	الطالب منذر الحارثي	parent_95343856@zinat.local	95343856	عمان	418eff25-67e1-4c9a-a06c-a712fcc18dd7	2025-11-01 13:05:20.410454	2025-11-01 13:05:20.410454	1	2025-11-01 13:05:20.410454	2025-11-01 13:05:20.410454
179	والد	الطالب منذر الحارثي	parent_95555857@zinat.local	95555857	عمان	8afb2012-6421-4ba4-be28-68f2b449c544	2025-11-01 13:05:20.480797	2025-11-01 13:05:20.480797	1	2025-11-01 13:05:20.480797	2025-11-01 13:05:20.480797
180	والدة	الطالب أحمد المسكري	parent_91480091@zinat.local	91480091	عمان	a96d6cab-67dc-4179-8a49-7bb79f239a2f	2025-11-01 13:05:20.559695	2025-11-01 13:05:20.559695	1	2025-11-01 13:05:20.559695	2025-11-01 13:05:20.559695
181	والدة	الطالب محمد المصلحي	parent_99884447@zinat.local	99884447	عمان	9e214396-7060-4258-a3ea-c73cfd2e5cbf	2025-11-01 13:05:20.634419	2025-11-01 13:05:20.634419	1	2025-11-01 13:05:20.634419	2025-11-01 13:05:20.634419
182	والد	الطالب محمد المصلحي	parent_99098811@zinat.local	99098811	عمان	320f0cdb-71ed-488b-96bb-3f87700dfc73	2025-11-01 13:05:20.706448	2025-11-01 13:05:20.706448	1	2025-11-01 13:05:20.706448	2025-11-01 13:05:20.706448
183	والدة	الطالب الفراهيد المسكري	parent_94440912@zinat.local	94440912	عمان	7ace12da-6a3f-44eb-a654-cca95bd15fec	2025-11-01 13:05:20.856952	2025-11-01 13:05:20.856952	1	2025-11-01 13:05:20.856952	2025-11-01 13:05:20.856952
184	والد	الطالب الفراهيد المسكري	parent_97040030@zinat.local	97040030	عمان	3f8df0e2-0f57-452f-9cde-60d97127b9e5	2025-11-01 13:05:20.927761	2025-11-01 13:05:20.927761	1	2025-11-01 13:05:20.927761	2025-11-01 13:05:20.927761
185	والدة	الطالب سعد السيابي	parent_91414109@zinat.local	91414109	عمان	58135a72-0ae8-40b6-8dff-9883f9c8ea20	2025-11-01 13:05:21.005226	2025-11-01 13:05:21.005226	1	2025-11-01 13:05:21.005226	2025-11-01 13:05:21.005226
186	والد	الطالب سعد السيابي	parent_96447447@zinat.local	96447447	عمان	abd5c148-d97c-4244-acdf-95e7cf92ed99	2025-11-01 13:05:21.076263	2025-11-01 13:05:21.076263	1	2025-11-01 13:05:21.076263	2025-11-01 13:05:21.076263
187	والدة	الطالب سندس البوسعيدي	parent_92343800@zinat.local	92343800	عمان	d32b1825-75d6-444f-84ea-f855f1686006	2025-11-01 13:05:21.152077	2025-11-01 13:05:21.152077	1	2025-11-01 13:05:21.152077	2025-11-01 13:05:21.152077
188	والد	الطالب سندس البوسعيدي	parent_0@zinat.local	0	عمان	67c95ba0-a344-456e-9fc4-afda775bf2b4	2025-11-01 13:05:21.222893	2025-11-01 13:05:21.222893	1	2025-11-01 13:05:21.222893	2025-11-01 13:05:21.222893
189	والدة	الطالب حور الكعبية	parent_96033203@zinat.local	96033203	عمان	5949e018-3869-4bd4-a2f4-3856e8065e95	2025-11-01 13:05:21.298595	2025-11-01 13:05:21.298595	1	2025-11-01 13:05:21.298595	2025-11-01 13:05:21.298595
190	والد	الطالب حور الكعبية	parent_97726332@zinat.local	97726332	عمان	560baa98-ab6a-4b02-977c-d43c311dc74f	2025-11-01 13:05:21.369329	2025-11-01 13:05:21.369329	1	2025-11-01 13:05:21.369329	2025-11-01 13:05:21.369329
191	والدة	الطالب سعيد الرحبي	parent_96120070@zinat.local	96120070	عمان	b4d86f70-82cd-4053-92f4-16efd5f1e6a7	2025-11-01 13:05:21.443539	2025-11-01 13:05:21.443539	1	2025-11-01 13:05:21.443539	2025-11-01 13:05:21.443539
192	والد	الطالب سعيد الرحبي	parent_96282216@zinat.local	96282216	عمان	4c5ddd4d-2a22-4d50-ba19-14283117f045	2025-11-01 13:05:21.513815	2025-11-01 13:05:21.513815	1	2025-11-01 13:05:21.513815	2025-11-01 13:05:21.513815
193	والدة	الطالب أمين الإسماعيلي	parent_96479736@zinat.local	96479736	عمان	08ca1d7d-f5a9-4b41-a20b-cb65f1b338b7	2025-11-01 13:05:21.589405	2025-11-01 13:05:21.589405	1	2025-11-01 13:05:21.589405	2025-11-01 13:05:21.589405
194	والد	الطالب أمين الإسماعيلي	parent_92788803@zinat.local	92788803	عمان	1af68d72-ffff-4b22-9787-020bf14a8a22	2025-11-01 13:05:21.659867	2025-11-01 13:05:21.659867	1	2025-11-01 13:05:21.659867	2025-11-01 13:05:21.659867
195	والدة	الطالب سديم الرحبية	parent_97609904@zinat.local	97609904	عمان	3a28697b-13db-4fcf-b7af-d1a92a74f215	2025-11-01 13:05:21.736408	2025-11-01 13:05:21.736408	1	2025-11-01 13:05:21.736408	2025-11-01 13:05:21.736408
196	والد	الطالب سديم الرحبية	parent_96754623@zinat.local	96754623	عمان	4d9da7c4-6b9a-45f2-82c6-8496ead3892f	2025-11-01 13:05:21.807965	2025-11-01 13:05:21.807965	1	2025-11-01 13:05:21.807965	2025-11-01 13:05:21.807965
197	والدة	الطالب آدم اليزيدي	parent_97466312@zinat.local	97466312	عمان	eeca9c82-7fcc-43d4-83f8-5503573ebebd	2025-11-01 13:05:21.882915	2025-11-01 13:05:21.882915	1	2025-11-01 13:05:21.882915	2025-11-01 13:05:21.882915
198	والد	الطالب آدم اليزيدي	parent_97966312@zinat.local	97966312	عمان	114998a2-d21a-445e-bd4d-05493e3a4590	2025-11-01 13:05:21.95362	2025-11-01 13:05:21.95362	1	2025-11-01 13:05:21.95362	2025-11-01 13:05:21.95362
199	والدة	الطالب فاطمة المسكرية	parent_98883020@zinat.local	98883020	عمان	0edffcf3-0623-4e71-9702-5e728f566d7f	2025-11-01 13:05:22.028336	2025-11-01 13:05:22.028336	1	2025-11-01 13:05:22.028336	2025-11-01 13:05:22.028336
200	والد	الطالب فاطمة المسكرية	parent_99459947@zinat.local	99459947	عمان	679e94d1-0e8d-4842-beec-ab0329ea0e99	2025-11-01 13:05:22.098334	2025-11-01 13:05:22.098334	1	2025-11-01 13:05:22.098334	2025-11-01 13:05:22.098334
201	والدة	الطالب فَلَكْ السعدية	parent_92230881@zinat.local	92230881	عمان	0ad9739d-fd32-415b-8acc-2c156d88a1d8	2025-11-01 13:05:22.172902	2025-11-01 13:05:22.172902	1	2025-11-01 13:05:22.172902	2025-11-01 13:05:22.172902
202	والد	الطالب فَلَكْ السعدية	parent_95395062@zinat.local	95395062	عمان	5b10a206-fcdd-445c-b916-95ab72d1549b	2025-11-01 13:05:22.243217	2025-11-01 13:05:22.243217	1	2025-11-01 13:05:22.243217	2025-11-01 13:05:22.243217
203	والدة	الطالب صالح المسكري	parent_99368119@zinat.local	99368119	عمان	2d03e2c4-b0eb-4193-a161-6c88f0521d14	2025-11-01 13:05:22.317502	2025-11-01 13:05:22.317502	1	2025-11-01 13:05:22.317502	2025-11-01 13:05:22.317502
204	والد	الطالب صالح المسكري	parent_99006071@zinat.local	99006071	عمان	850eef0b-ff54-47e4-90d5-14a867833327	2025-11-01 13:05:22.388497	2025-11-01 13:05:22.388497	1	2025-11-01 13:05:22.388497	2025-11-01 13:05:22.388497
205	والدة	الطالب أحمد الغنيمي	parent_92196942@zinat.local	92196942	عمان	1dba2988-dc5c-49e2-b610-5e71a7b801da	2025-11-01 13:05:22.463331	2025-11-01 13:05:22.463331	1	2025-11-01 13:05:22.463331	2025-11-01 13:05:22.463331
206	والد	الطالب أحمد الغنيمي	parent_97666325@zinat.local	97666325	عمان	fc7beb60-80cb-4b79-b5fa-2d3d12a65b8e	2025-11-01 13:05:22.533651	2025-11-01 13:05:22.533651	1	2025-11-01 13:05:22.533651	2025-11-01 13:05:22.533651
207	والدة	الطالب سالم الحارثي	parent_93913164@zinat.local	93913164	عمان	0ecc2e97-e108-43ff-bc55-c742c3e1f8d4	2025-11-01 13:05:22.607797	2025-11-01 13:05:22.607797	1	2025-11-01 13:05:22.607797	2025-11-01 13:05:22.607797
208	والد	الطالب سالم الحارثي	parent_92876168@zinat.local	92876168	عمان	f40df012-0e7b-49d9-85bb-a49365c1984c	2025-11-01 13:05:22.678752	2025-11-01 13:05:22.678752	1	2025-11-01 13:05:22.678752	2025-11-01 13:05:22.678752
209	والدة	الطالب قيس الرواحي	parent_95980543@zinat.local	95980543	عمان	4e889507-748c-42a5-b7ab-bfb8d464b1da	2025-11-01 13:05:22.752165	2025-11-01 13:05:22.752165	1	2025-11-01 13:05:22.752165	2025-11-01 13:05:22.752165
210	والد	الطالب قيس الرواحي	parent_95572958@zinat.local	95572958	عمان	33041e4b-f11a-4334-b4cd-0530433ae3ce	2025-11-01 13:05:22.822791	2025-11-01 13:05:22.822791	1	2025-11-01 13:05:22.822791	2025-11-01 13:05:22.822791
211	والدة	الطالب غزل المعمرية	parent_93834262@zinat.local	93834262	عمان	3fddc882-3807-4549-b6e3-82624ae80c58	2025-11-01 13:05:22.896258	2025-11-01 13:05:22.896258	1	2025-11-01 13:05:22.896258	2025-11-01 13:05:22.896258
212	والد	الطالب غزل المعمرية	parent_92527773@zinat.local	92527773	عمان	a0e1619d-9000-42ab-aaad-2fd52513ad5c	2025-11-01 13:05:22.965785	2025-11-01 13:05:22.965785	1	2025-11-01 13:05:22.965785	2025-11-01 13:05:22.965785
213	والدة	الطالب أثير الحارثية	parent_93377754@zinat.local	93377754	عمان	2ca13efe-bcfc-4f76-b25d-ebd544a5c652	2025-11-01 13:05:23.040292	2025-11-01 13:05:23.040292	1	2025-11-01 13:05:23.040292	2025-11-01 13:05:23.040292
214	والد	الطالب أثير الحارثية	parent_78423209@zinat.local	78423209	عمان	61d74fbe-fa29-4c37-bf8b-fc3908f6f2a4	2025-11-01 13:05:23.110474	2025-11-01 13:05:23.110474	1	2025-11-01 13:05:23.110474	2025-11-01 13:05:23.110474
215	والدة	الطالب عمر سعيدالسعدي	parent_95590378@zinat.local	95590378	عمان	62184b85-92d0-4605-b538-fbbba60f4686	2025-11-01 13:05:23.18545	2025-11-01 13:05:23.18545	1	2025-11-01 13:05:23.18545	2025-11-01 13:05:23.18545
216	والدة	الطالب غياث الرحبي	parent_95874762@zinat.local	95874762	عمان	82357b55-c762-4d51-800d-20ac2eb6f137	2025-11-01 13:05:23.260343	2025-11-01 13:05:23.260343	1	2025-11-01 13:05:23.260343	2025-11-01 13:05:23.260343
217	والدة	الطالب ناصر المغيري	parent_99247020@zinat.local	99247020	عمان	a18db352-b86b-4daf-b0b9-65d7c71a7684	2025-11-01 13:05:23.335569	2025-11-01 13:05:23.335569	1	2025-11-01 13:05:23.335569	2025-11-01 13:05:23.335569
218	والدة	الطالب أحمد الحارثي	parent_96643889@zinat.local	96643889	عمان	a084f27d-50cb-4be5-bdb9-32b39ad36725	2025-11-01 13:05:23.408792	2025-11-01 13:05:23.408792	1	2025-11-01 13:05:23.408792	2025-11-01 13:05:23.408792
219	والد	الطالب أحمد الحارثي	parent_99448812@zinat.local	99448812	عمان	a5443406-8818-405e-8ff2-3e7692560d93	2025-11-01 13:05:23.479329	2025-11-01 13:05:23.479329	1	2025-11-01 13:05:23.479329	2025-11-01 13:05:23.479329
220	والدة	الطالب سعيد المسكري	parent_96649677@zinat.local	96649677	عمان	2c6a8996-3fc3-4b82-a28a-e0d09eb7e7e6	2025-11-01 13:05:23.625164	2025-11-01 13:05:23.625164	1	2025-11-01 13:05:23.625164	2025-11-01 13:05:23.625164
221	والدة	الطالب أواب المغيري	parent_98881883@zinat.local	98881883	عمان	06eae867-7451-4928-b39c-efaf1d89cb97	2025-11-01 13:05:23.704763	2025-11-01 13:05:23.704763	1	2025-11-01 13:05:23.704763	2025-11-01 13:05:23.704763
222	والد	الطالب أواب المغيري	parent_92546618@zinat.local	92546618	عمان	5a29b8bd-5abd-457f-a88a-ea17da54bb5a	2025-11-01 13:05:23.774889	2025-11-01 13:05:23.774889	1	2025-11-01 13:05:23.774889	2025-11-01 13:05:23.774889
223	والدة	الطالب أحمد البوسعيدي	parent_91916066@zinat.local	91916066	عمان	b3d25e2e-166b-4e16-963f-c7eb5dbd1a25	2025-11-01 13:05:23.859567	2025-11-01 13:05:23.859567	1	2025-11-01 13:05:23.859567	2025-11-01 13:05:23.859567
224	والدة	الطالب حذام المغيرية	parent_92154206@zinat.local	92154206	عمان	cd710bef-f94f-411e-95af-e41c25b6dfa4	2025-11-01 13:05:23.935745	2025-11-01 13:05:23.935745	1	2025-11-01 13:05:23.935745	2025-11-01 13:05:23.935745
225	والد	الطالب حذام المغيرية	parent_99597217@zinat.local	99597217	عمان	d1c5048d-c936-4428-b86c-389e8ef99f27	2025-11-01 13:05:24.006375	2025-11-01 13:05:24.006375	1	2025-11-01 13:05:24.006375	2025-11-01 13:05:24.006375
226	والدة	الطالب رغد المقبالية	parent_93344100@zinat.local	93344100	عمان	fa1fbdb7-4a31-4ea2-ace0-0887be03ebdd	2025-11-01 13:05:24.082294	2025-11-01 13:05:24.082294	1	2025-11-01 13:05:24.082294	2025-11-01 13:05:24.082294
227	والد	الطالب رغد المقبالية	parent_99770060@zinat.local	99770060	عمان	c99ea4b6-1226-40bb-ba4a-40bdb793a186	2025-11-01 13:05:24.15231	2025-11-01 13:05:24.15231	1	2025-11-01 13:05:24.15231	2025-11-01 13:05:24.15231
228	والدة	الطالب ذياب المعمري	parent_95594241@zinat.local	95594241	عمان	63e3f2ee-ebba-4448-9cf6-97034ef5de6e	2025-11-01 13:05:24.225021	2025-11-01 13:05:24.225021	1	2025-11-01 13:05:24.225021	2025-11-01 13:05:24.225021
229	والد	الطالب ذياب المعمري	parent_91166850@zinat.local	91166850	عمان	4e93ec2a-c5b9-4339-9641-e06b61c71235	2025-11-01 13:05:24.295209	2025-11-01 13:05:24.295209	1	2025-11-01 13:05:24.295209	2025-11-01 13:05:24.295209
230	والدة	الطالب علي السعدي	parent_95402296@zinat.local	95402296	عمان	67c5764d-3226-495f-9c90-065fade5a635	2025-11-01 13:05:24.374612	2025-11-01 13:05:24.374612	1	2025-11-01 13:05:24.374612	2025-11-01 13:05:24.374612
231	والد	الطالب علي السعدي	parent_99232016@zinat.local	99232016	عمان	555b318d-1aeb-442e-8781-1d5debe0d95b	2025-11-01 13:05:24.44479	2025-11-01 13:05:24.44479	1	2025-11-01 13:05:24.44479	2025-11-01 13:05:24.44479
232	والدة	الطالب عبد الريامي	parent_99760666@zinat.local	99760666	عمان	acce19fe-feec-45e7-86d5-a28e079fefad	2025-11-01 13:05:24.520579	2025-11-01 13:05:24.520579	1	2025-11-01 13:05:24.520579	2025-11-01 13:05:24.520579
233	والد	الطالب عبد الريامي	parent_91112455@zinat.local	91112455	عمان	b2508337-08de-4efa-b9ad-8e20efd1f855	2025-11-01 13:05:24.590689	2025-11-01 13:05:24.590689	1	2025-11-01 13:05:24.590689	2025-11-01 13:05:24.590689
234	والدة	الطالب تميم المعمري	parent_92098917@zinat.local	92098917	عمان	f15cb2a9-6ca4-4a40-a5a3-515986a9b573	2025-11-01 13:05:24.663691	2025-11-01 13:05:24.663691	1	2025-11-01 13:05:24.663691	2025-11-01 13:05:24.663691
235	والد	الطالب تميم المعمري	parent_94000862@zinat.local	94000862	عمان	52908c20-159f-4544-a5c6-476dcdcc3da2	2025-11-01 13:05:24.733838	2025-11-01 13:05:24.733838	1	2025-11-01 13:05:24.733838	2025-11-01 13:05:24.733838
236	والدة	الطالب جنى الحارثية	parent_99797173@zinat.local	99797173	عمان	649857de-a8a7-4d0a-8d2a-dd4f604c1178	2025-11-01 13:05:24.808193	2025-11-01 13:05:24.808193	1	2025-11-01 13:05:24.808193	2025-11-01 13:05:24.808193
237	والد	الطالب جنى الحارثية	parent_95167988@zinat.local	95167988	عمان	89327c1d-ad23-4064-89f6-1529bcec86c5	2025-11-01 13:05:24.878733	2025-11-01 13:05:24.878733	1	2025-11-01 13:05:24.878733	2025-11-01 13:05:24.878733
238	والدة	الطالب حمود الحارثي	parent_99374116@zinat.local	99374116	عمان	3c942acf-3b20-4274-b93e-2d6981184843	2025-11-01 13:05:24.953886	2025-11-01 13:05:24.953886	1	2025-11-01 13:05:24.953886	2025-11-01 13:05:24.953886
239	والد	الطالب حمود الحارثي	parent_93238000@zinat.local	93238000	عمان	ae5c9f8d-7079-40e6-a84f-b24c2512195b	2025-11-01 13:05:25.024564	2025-11-01 13:05:25.024564	1	2025-11-01 13:05:25.024564	2025-11-01 13:05:25.024564
240	والدة	الطالب عهد السعدي	parent_91144364@zinat.local	91144364	عمان	fd5795fa-6777-4c76-b7a9-610efa0185cc	2025-11-01 13:05:25.098547	2025-11-01 13:05:25.098547	1	2025-11-01 13:05:25.098547	2025-11-01 13:05:25.098547
241	والد	الطالب عهد السعدي	parent_96026650@zinat.local	96026650	عمان	4a26a14d-2415-41ff-97fa-fca1a858a5a2	2025-11-01 13:05:25.168764	2025-11-01 13:05:25.168764	1	2025-11-01 13:05:25.168764	2025-11-01 13:05:25.168764
242	والدة	الطالب عفان السيابي	parent_97763603@zinat.local	97763603	عمان	4ca4a4ed-30d7-4ed1-b9e8-4c080082ef2a	2025-11-01 13:05:25.242842	2025-11-01 13:05:25.242842	1	2025-11-01 13:05:25.242842	2025-11-01 13:05:25.242842
243	والد	الطالب عفان السيابي	parent_96117377@zinat.local	96117377	عمان	9b6410bd-9cea-4b0d-a95b-3174233a9ea0	2025-11-01 13:05:25.313113	2025-11-01 13:05:25.313113	1	2025-11-01 13:05:25.313113	2025-11-01 13:05:25.313113
244	والدة	الطالب شيم المسكري	parent_98999149@zinat.local	98999149	عمان	c088677c-7f6b-4123-82f4-f9ceaf0f6fcb	2025-11-01 13:05:25.38725	2025-11-01 13:05:25.38725	1	2025-11-01 13:05:25.38725	2025-11-01 13:05:25.38725
245	والد	الطالب شيم المسكري	parent_93877877@zinat.local	93877877	عمان	f5ccd2fe-8571-4670-b418-64a0e36d976c	2025-11-01 13:05:25.457859	2025-11-01 13:05:25.457859	1	2025-11-01 13:05:25.457859	2025-11-01 13:05:25.457859
246	والدة	الطالب إيلاف الإسماعيلية	parent_97939293@zinat.local	97939293	عمان	4bb98e15-1b98-42b8-bca4-bcd845dcb680	2025-11-01 13:05:25.532993	2025-11-01 13:05:25.532993	1	2025-11-01 13:05:25.532993	2025-11-01 13:05:25.532993
247	والد	الطالب إيلاف الإسماعيلية	parent_91110090@zinat.local	91110090	عمان	f800de52-f824-4d47-adc1-af5f59850718	2025-11-01 13:05:25.604564	2025-11-01 13:05:25.604564	1	2025-11-01 13:05:25.604564	2025-11-01 13:05:25.604564
\.


--
-- Data for Name: payment_charge_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_charge_types (id, school_id, code, label, value, sort_order, is_active, created_at, updated_at, billing_occurrence) FROM stdin;
11051f98-0b0a-4cb2-b028-c838f37418c6	1	3452345	32452345	23452345	0	t	2026-05-13 21:40:05.327614+04	2026-05-13 21:40:05.327614+04	per_year
50ab5c7a-dacf-45a0-8811-04d1aeee2de1	1	345345	3451345	3452345	0	t	2026-05-13 21:39:57.864847+04	2026-05-13 21:40:07.723305+04	per_year
e8ffbcfd-bec0-4f63-81bb-ba07a1ebd1c0	1	AEHRTAERTHW	thwrth	\N	0	t	2026-05-16 11:21:14.566011+04	2026-05-16 11:21:14.566011+04	per_year
342e1c55-1e49-46ee-8a01-f160367d6c41	1	WRTHWRTH	wrthwrth	\N	0	t	2026-05-16 11:21:16.632158+04	2026-05-16 11:21:16.632158+04	per_year
e0340f56-5165-40e5-8853-34d756a83df1	1	EWTHQWTH	wthwth	\N	0	t	2026-05-16 11:21:22.406827+04	2026-05-16 11:21:22.406827+04	per_year
65c33b41-4589-433c-b6a4-a3cb93ddf320	1	CODE	رسوم تسجيل	\N	0	t	2026-05-16 21:21:35.140043+04	2026-05-16 21:21:35.140043+04	once_ever
\.


--
-- Data for Name: payment_discount_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_discount_types (id, school_id, code, label, value, sort_order, is_active, created_at, updated_at) FROM stdin;
ad242bf8-85b2-4327-bbbd-2bfc011d0918	1	RTGWRG	wrgwrg	\N	0	t	2026-05-14 06:50:45.558676+04	2026-05-14 06:50:45.558676+04
3c36a665-0a0c-4ebc-b642-0de0d915cec5	1	سيبزسص	خصم دفعة وحدة	زقفقف	0	t	2026-05-16 21:22:32.192532+04	2026-05-16 21:22:32.192532+04
da9c931b-bc5a-4b81-bc98-a588d41294f3	1	فغتثغت	رسم الاخوة	ثغفتثفغت	0	t	2026-05-16 21:22:41.063625+04	2026-05-16 21:22:41.063625+04
7344ef08-9c63-4962-a0e1-b0b73eb0acbd	1	٤٥٦٣٤٥٦	تخفيض الاستمرار	\N	0	t	2026-05-16 21:22:54.825117+04	2026-05-16 21:22:54.825117+04
\.


--
-- Data for Name: payment_transaction_allocations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_transaction_allocations (id, payment_transaction_id, student_fee_charge_id, charge_type_id, level_payment_installment_id, amount, created_at) FROM stdin;
\.


--
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_transactions (id, student_id, school_id, student_payment_id, academic_year_id, total_amount, currency, paid_at, recorded_by_user_id, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: phases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.phases (id, name, description, order_index, estimated_duration_days, is_active, course_id, created_at, updated_at) FROM stdin;
328067b4-be04-4fb0-9628-fa38df5cdc54	46345	4563456	1	\N	t	ba36f22d-3ed1-4f61-b2e4-069172c82db9	2025-11-15 21:26:08.487334	2025-11-15 21:26:08.487334
f6765abf-9dd6-4b8d-b0fa-e04fe24ffd4d	المرحلة التأسيسية	تعلم الحروف الأساسية والأصوات	1	\N	t	d9fa2c8b-8d28-4668-bfd2-2773aba38fc3	2025-11-21 10:57:46.689956	2025-11-21 10:57:46.689956
f52e7268-f920-4161-9f4c-324c9fdc27e2	مرحلة التطبيق	تطبيق المهارات المكتسبة في تكوين الكلمات	2	\N	t	d9fa2c8b-8d28-4668-bfd2-2773aba38fc3	2025-11-21 10:57:46.712633	2025-11-21 10:57:46.712633
2a9bd401-6974-4d7c-9c61-c58504b22d8d	مرحلة الإتقان	إتقان القراءة والكتابة البسيطة	3	\N	t	d9fa2c8b-8d28-4668-bfd2-2773aba38fc3	2025-11-21 10:57:46.731996	2025-11-21 10:57:46.731996
abb4ea56-9160-4c36-a40e-fbf8b7e1bd21	ffff	wefwefw	1	\N	t	7d9cc680-1a3d-4090-9f54-66bb2155981d	2026-04-19 21:05:08.708462	2026-04-19 21:05:08.708462
60ebd3dc-34f4-48c2-b80c-f026aee1b266	مرحلة	قفاثفا	1	\N	t	cc1a9c19-1909-4c0e-a869-d85cd685840a	2026-04-19 23:02:52.828232	2026-04-19 23:02:52.828232
\.


--
-- Data for Name: platform_addons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.platform_addons (id, code, name_en, name_ar, amount_omr, feature_key, is_active, created_at, updated_at) FROM stdin;
1	transportation	Transportation	النقل المدرسي	15.000	transportation	t	2026-07-31 10:37:11.020352+04	2026-07-31 10:37:11.020352+04
2	video_sessions	Video sessions	جلسات الفيديو	25.000	video_sessions	t	2026-07-31 10:37:11.020352+04	2026-07-31 10:37:11.020352+04
3	sms	SMS notifications	إشعارات الرسائل النصية	20.000	sms	t	2026-07-31 10:37:11.020352+04	2026-07-31 10:37:11.020352+04
\.


--
-- Data for Name: platform_invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.platform_invoices (id, school_id, subscription_id, billing_period, period_start, period_end, base_amount, seats_included, seats_used, overage_amount, addons_amount, total_amount, status, paid_at, paid_note, line_items, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: platform_modules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.platform_modules (id, code, name_en, name_ar, description_en, description_ar, page_keys, sort_order, is_active, created_at, updated_at, amount_omr) FROM stdin;
1	dashboard	Dashboard	لوحة التحكم	School and mobile dashboards.	لوحات التحكم للمدرسة والجوال.	["dashboard", "mobile_dashboard"]	1	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	3.000
2	users_roles	Users & roles	المستخدمون والأدوار	Staff accounts and permission groups.	حسابات الموظفين ومجموعات الصلاحيات.	["users", "user_groups"]	2	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	5.000
3	students	Students	الطلاب	Student roster and registration.	قائمة الطلاب والتسجيل.	["students", "student_register"]	3	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	8.000
4	class_groups	Class groups	مجموعات الصفوف	Class / group management.	إدارة المجموعات والصفوف.	["groups"]	4	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	4.000
5	attendance	Attendance	الحضور	Daily and session attendance.	الحضور اليومي وحضور الجلسات.	["attendance", "attendance_sessions"]	5	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	6.000
6	schedules	Schedules	الجداول	Class and teacher schedules.	جداول الصفوف والمعلمين.	["schedules", "teacher_schedule"]	6	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	5.000
7	parent_portal	Parent portal	بوابة أولياء الأمور	Parent dashboard, schedule, attendance, progress, activities.	لوحة ولي الأمر والجداول والحضور والتقدم والأنشطة.	["parent_dashboard", "parent_schedule", "parent_attendance", "parent_progress", "parent_activities"]	7	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	8.000
8	school_settings	School settings	إعدادات المدرسة	School settings and landing page.	إعدادات المدرسة وصفحة الهبوط.	["settings"]	8	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	3.000
9	messaging	Messaging & chat	الرسائل والمحادثة	Group chat, direct messages, and formal letters.	محادثة المجموعة والرسائل المباشرة والرسائل الرسمية.	["chat", "messages", "message_letters"]	9	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	7.000
10	notifications	Notifications	الإشعارات	Notification templates.	قوالب الإشعارات.	["notification_templates"]	10	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	3.000
11	courses	Courses	المقررات	Courses and course enrollments.	المقررات وتسجيل المقررات.	["courses", "course_enrollments"]	11	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	7.000
13	progress	Progress tracking	تتبع التقدم	Student progress tracking.	تتبع تقدم الطلاب.	["progress"]	13	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	4.000
12	graded_courses	Graded courses	مقررات التقييم	Graded schemes, tasks, and marks.	مخططات التقييم والمهام والدرجات.	["graded_courses", "teacher_graded_tasks", "teacher_graded_marks"]	12	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	9.000
14	activities	Activities & approvals	الأنشطة والموافقات	Activities workflow and approvals.	مسار الأنشطة والموافقات.	["activities", "approvals"]	14	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	5.000
15	reports	Reports	التقارير	Operational reports and export.	التقارير التشغيلية والتصدير.	["reports"]	15	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	4.000
16	transportation	Transportation	النقل المدرسي	Buses and daily bus log.	الحافلات وسجل الحافلات اليومي.	["transportation", "transportation_daily_log"]	16	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	10.000
17	student_fees	Student fees	رسوم الطلاب	Student payments and fee configuration.	مدفوعات الطلاب وإعداد الرسوم.	["student_payments", "payment_levels", "payment_courses", "payment_packages", "payment_catalog_charges", "payment_catalog_discounts", "parent_fees"]	17	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	10.000
18	enrollments	Enrollment applications	طلبات التسجيل	Public enrollment applications workflow.	مسار طلبات التسجيل العامة.	["enrollments"]	18	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	6.000
19	meeting_rooms	Video meeting rooms	غرف الاجتماعات	Admin and personal meeting rooms.	غرف الاجتماعات الإدارية والشخصية.	["admin_meeting_rooms", "my_meeting_rooms"]	19	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	12.000
20	weekly_plans	Weekly session plans	خطط الجلسات الأسبوعية	Weekly plans and teacher weekly sessions.	الخطط الأسبوعية وجلسات المعلم.	["weekly_session_plans", "teacher_weekly_sessions"]	20	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	5.000
21	system_settings	System settings	إعدادات النظام	Years, grades, and system configuration.	السنوات والصفوف وإعدادات النظام.	["system_settings"]	21	t	2026-07-31 15:20:27.428933+04	2026-07-31 15:20:27.428933+04	3.000
\.


--
-- Data for Name: platform_plan_features; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.platform_plan_features (id, plan_id, feature_key) FROM stdin;
1	1	parent_portal
2	1	schedules
3	1	attendance
4	1	roster
5	2	photo_sharing
6	2	transportation
7	2	graded_courses
8	2	messaging
9	2	parent_portal
10	2	schedules
11	2	attendance
12	2	roster
13	3	group_chat
14	3	enrollment
15	3	video_sessions
16	3	photo_sharing
17	3	transportation
18	3	graded_courses
19	3	messaging
20	3	parent_portal
21	3	schedules
22	3	attendance
23	3	roster
\.


--
-- Data for Name: platform_plan_modules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.platform_plan_modules (id, plan_id, module_id) FROM stdin;
2	2	1
3	3	1
5	2	2
6	3	2
8	2	3
9	3	3
11	2	4
12	3	4
14	2	5
15	3	5
17	2	6
18	3	6
20	2	7
21	3	7
23	2	8
24	3	8
25	2	9
26	3	9
27	2	10
28	3	10
29	2	11
30	3	11
31	2	12
32	3	12
33	2	13
34	3	13
35	2	14
36	3	14
37	2	15
38	3	15
39	2	16
40	3	16
41	2	17
42	3	17
43	3	18
44	3	19
45	3	20
46	3	21
47	1	1
48	1	2
49	1	3
50	1	4
51	1	5
52	1	6
53	1	7
54	1	8
55	1	11
\.


--
-- Data for Name: platform_plan_prices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.platform_plan_prices (id, plan_id, billing_period, amount_omr) FROM stdin;
1	1	summer	135.000
2	1	yearly	450.000
3	1	semester	225.000
4	1	monthly	45.000
5	2	summer	240.000
6	2	yearly	800.000
7	2	semester	400.000
8	2	monthly	80.000
9	3	summer	375.000
10	3	yearly	1250.000
11	3	semester	625.000
12	3	monthly	125.000
\.


--
-- Data for Name: platform_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.platform_plans (id, code, name_en, name_ar, description_en, description_ar, included_student_seats, overage_per_student_omr, sort_order, is_active, created_at, updated_at) FROM stdin;
1	essential	Essential	الأساسية	Core records, attendance, and parent updates.	السجلات الأساسية والحضور وتحديثات أولياء الأمور.	50	0.500	1	t	2026-07-31 10:37:11.020352+04	2026-07-31 10:37:11.020352+04
2	standard	Standard	القياسية	Rich communication and academic tracking — best fit for most kindergartens.	تواصل غني وتتبع أكاديمي — الأنسب لمعظم الروضات.	150	0.400	2	t	2026-07-31 10:37:11.020352+04	2026-07-31 10:37:11.020352+04
3	complete	Complete	المتكاملة	Video sessions, enrollment tools, and priority support.	جلسات فيديو وأدوات تسجيل ودعم ذو أولوية.	500	0.300	3	t	2026-07-31 10:37:11.020352+04	2026-07-31 10:37:11.020352+04
\.


--
-- Data for Name: rbac_actions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rbac_actions (id, code, name, "sortOrder") FROM stdin;
1	view	View	1
2	search	Search	2
3	create	Create	3
4	edit	Edit	4
5	delete	Delete	5
6	approve	Approve	6
7	export	Export	7
8	manage	Manage	8
\.


--
-- Data for Name: rbac_group_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rbac_group_permissions ("groupId", "pageId", "actionId") FROM stdin;
6deb3801-5483-4502-80fc-e878eaa87097	1	1
6deb3801-5483-4502-80fc-e878eaa87097	1	2
6deb3801-5483-4502-80fc-e878eaa87097	1	3
6deb3801-5483-4502-80fc-e878eaa87097	1	4
6deb3801-5483-4502-80fc-e878eaa87097	1	5
6deb3801-5483-4502-80fc-e878eaa87097	1	8
6deb3801-5483-4502-80fc-e878eaa87097	2	1
6deb3801-5483-4502-80fc-e878eaa87097	2	2
6deb3801-5483-4502-80fc-e878eaa87097	2	4
6deb3801-5483-4502-80fc-e878eaa87097	2	6
6deb3801-5483-4502-80fc-e878eaa87097	2	8
6deb3801-5483-4502-80fc-e878eaa87097	3	1
6deb3801-5483-4502-80fc-e878eaa87097	3	2
6deb3801-5483-4502-80fc-e878eaa87097	3	4
6deb3801-5483-4502-80fc-e878eaa87097	3	7
6deb3801-5483-4502-80fc-e878eaa87097	3	8
6deb3801-5483-4502-80fc-e878eaa87097	4	1
6deb3801-5483-4502-80fc-e878eaa87097	4	2
6deb3801-5483-4502-80fc-e878eaa87097	4	3
6deb3801-5483-4502-80fc-e878eaa87097	4	4
6deb3801-5483-4502-80fc-e878eaa87097	4	5
6deb3801-5483-4502-80fc-e878eaa87097	4	8
6deb3801-5483-4502-80fc-e878eaa87097	5	1
6deb3801-5483-4502-80fc-e878eaa87097	5	2
6deb3801-5483-4502-80fc-e878eaa87097	5	3
6deb3801-5483-4502-80fc-e878eaa87097	5	4
6deb3801-5483-4502-80fc-e878eaa87097	5	5
6deb3801-5483-4502-80fc-e878eaa87097	5	8
6deb3801-5483-4502-80fc-e878eaa87097	6	1
6deb3801-5483-4502-80fc-e878eaa87097	7	1
6deb3801-5483-4502-80fc-e878eaa87097	8	1
6deb3801-5483-4502-80fc-e878eaa87097	8	2
6deb3801-5483-4502-80fc-e878eaa87097	8	3
6deb3801-5483-4502-80fc-e878eaa87097	8	4
6deb3801-5483-4502-80fc-e878eaa87097	8	5
6deb3801-5483-4502-80fc-e878eaa87097	8	8
6deb3801-5483-4502-80fc-e878eaa87097	9	1
6deb3801-5483-4502-80fc-e878eaa87097	9	2
6deb3801-5483-4502-80fc-e878eaa87097	9	3
6deb3801-5483-4502-80fc-e878eaa87097	9	4
6deb3801-5483-4502-80fc-e878eaa87097	9	5
6deb3801-5483-4502-80fc-e878eaa87097	9	8
6deb3801-5483-4502-80fc-e878eaa87097	10	1
6deb3801-5483-4502-80fc-e878eaa87097	10	2
6deb3801-5483-4502-80fc-e878eaa87097	10	3
6deb3801-5483-4502-80fc-e878eaa87097	10	4
6deb3801-5483-4502-80fc-e878eaa87097	10	5
6deb3801-5483-4502-80fc-e878eaa87097	11	1
6deb3801-5483-4502-80fc-e878eaa87097	11	2
6deb3801-5483-4502-80fc-e878eaa87097	11	3
6deb3801-5483-4502-80fc-e878eaa87097	11	4
6deb3801-5483-4502-80fc-e878eaa87097	11	5
6deb3801-5483-4502-80fc-e878eaa87097	12	1
6deb3801-5483-4502-80fc-e878eaa87097	12	3
6deb3801-5483-4502-80fc-e878eaa87097	13	1
6deb3801-5483-4502-80fc-e878eaa87097	13	2
6deb3801-5483-4502-80fc-e878eaa87097	13	3
6deb3801-5483-4502-80fc-e878eaa87097	13	4
6deb3801-5483-4502-80fc-e878eaa87097	13	7
6deb3801-5483-4502-80fc-e878eaa87097	14	1
6deb3801-5483-4502-80fc-e878eaa87097	14	4
6deb3801-5483-4502-80fc-e878eaa87097	14	8
6deb3801-5483-4502-80fc-e878eaa87097	15	1
6deb3801-5483-4502-80fc-e878eaa87097	15	4
6deb3801-5483-4502-80fc-e878eaa87097	15	8
6deb3801-5483-4502-80fc-e878eaa87097	16	1
6deb3801-5483-4502-80fc-e878eaa87097	16	2
6deb3801-5483-4502-80fc-e878eaa87097	16	3
6deb3801-5483-4502-80fc-e878eaa87097	16	4
6deb3801-5483-4502-80fc-e878eaa87097	16	5
6deb3801-5483-4502-80fc-e878eaa87097	17	1
6deb3801-5483-4502-80fc-e878eaa87097	17	2
6deb3801-5483-4502-80fc-e878eaa87097	17	3
6deb3801-5483-4502-80fc-e878eaa87097	17	4
6deb3801-5483-4502-80fc-e878eaa87097	18	1
6deb3801-5483-4502-80fc-e878eaa87097	18	2
6deb3801-5483-4502-80fc-e878eaa87097	18	3
6deb3801-5483-4502-80fc-e878eaa87097	18	4
6deb3801-5483-4502-80fc-e878eaa87097	18	5
6deb3801-5483-4502-80fc-e878eaa87097	19	1
6deb3801-5483-4502-80fc-e878eaa87097	19	2
6deb3801-5483-4502-80fc-e878eaa87097	19	4
6deb3801-5483-4502-80fc-e878eaa87097	19	3
6deb3801-5483-4502-80fc-e878eaa87097	19	5
6deb3801-5483-4502-80fc-e878eaa87097	20	1
6deb3801-5483-4502-80fc-e878eaa87097	20	2
6deb3801-5483-4502-80fc-e878eaa87097	20	3
6deb3801-5483-4502-80fc-e878eaa87097	20	4
6deb3801-5483-4502-80fc-e878eaa87097	20	5
6deb3801-5483-4502-80fc-e878eaa87097	21	1
6deb3801-5483-4502-80fc-e878eaa87097	21	2
6deb3801-5483-4502-80fc-e878eaa87097	21	3
6deb3801-5483-4502-80fc-e878eaa87097	21	4
6deb3801-5483-4502-80fc-e878eaa87097	21	5
6deb3801-5483-4502-80fc-e878eaa87097	22	1
6deb3801-5483-4502-80fc-e878eaa87097	22	2
6deb3801-5483-4502-80fc-e878eaa87097	22	3
6deb3801-5483-4502-80fc-e878eaa87097	22	4
6deb3801-5483-4502-80fc-e878eaa87097	23	1
6deb3801-5483-4502-80fc-e878eaa87097	23	2
6deb3801-5483-4502-80fc-e878eaa87097	23	3
6deb3801-5483-4502-80fc-e878eaa87097	23	4
6deb3801-5483-4502-80fc-e878eaa87097	24	1
6deb3801-5483-4502-80fc-e878eaa87097	24	2
6deb3801-5483-4502-80fc-e878eaa87097	24	4
6deb3801-5483-4502-80fc-e878eaa87097	25	1
6deb3801-5483-4502-80fc-e878eaa87097	25	2
6deb3801-5483-4502-80fc-e878eaa87097	25	3
6deb3801-5483-4502-80fc-e878eaa87097	25	4
6deb3801-5483-4502-80fc-e878eaa87097	25	5
6deb3801-5483-4502-80fc-e878eaa87097	25	6
6deb3801-5483-4502-80fc-e878eaa87097	26	1
6deb3801-5483-4502-80fc-e878eaa87097	26	2
6deb3801-5483-4502-80fc-e878eaa87097	26	6
6deb3801-5483-4502-80fc-e878eaa87097	27	1
6deb3801-5483-4502-80fc-e878eaa87097	27	2
6deb3801-5483-4502-80fc-e878eaa87097	27	7
6deb3801-5483-4502-80fc-e878eaa87097	28	1
6deb3801-5483-4502-80fc-e878eaa87097	28	2
6deb3801-5483-4502-80fc-e878eaa87097	28	4
6deb3801-5483-4502-80fc-e878eaa87097	28	6
6deb3801-5483-4502-80fc-e878eaa87097	28	7
6deb3801-5483-4502-80fc-e878eaa87097	28	5
6deb3801-5483-4502-80fc-e878eaa87097	29	1
6deb3801-5483-4502-80fc-e878eaa87097	29	3
6deb3801-5483-4502-80fc-e878eaa87097	30	1
6deb3801-5483-4502-80fc-e878eaa87097	30	3
6deb3801-5483-4502-80fc-e878eaa87097	31	1
6deb3801-5483-4502-80fc-e878eaa87097	31	2
6deb3801-5483-4502-80fc-e878eaa87097	31	3
6deb3801-5483-4502-80fc-e878eaa87097	31	4
6deb3801-5483-4502-80fc-e878eaa87097	31	5
6deb3801-5483-4502-80fc-e878eaa87097	32	1
6deb3801-5483-4502-80fc-e878eaa87097	32	2
6deb3801-5483-4502-80fc-e878eaa87097	32	4
6deb3801-5483-4502-80fc-e878eaa87097	33	1
6deb3801-5483-4502-80fc-e878eaa87097	34	1
6deb3801-5483-4502-80fc-e878eaa87097	34	3
6deb3801-5483-4502-80fc-e878eaa87097	34	4
6deb3801-5483-4502-80fc-e878eaa87097	34	5
6deb3801-5483-4502-80fc-e878eaa87097	35	1
6deb3801-5483-4502-80fc-e878eaa87097	35	4
6deb3801-5483-4502-80fc-e878eaa87097	36	1
6deb3801-5483-4502-80fc-e878eaa87097	36	2
6deb3801-5483-4502-80fc-e878eaa87097	36	3
6deb3801-5483-4502-80fc-e878eaa87097	36	4
6deb3801-5483-4502-80fc-e878eaa87097	36	5
6deb3801-5483-4502-80fc-e878eaa87097	37	1
6deb3801-5483-4502-80fc-e878eaa87097	37	3
6deb3801-5483-4502-80fc-e878eaa87097	38	1
6deb3801-5483-4502-80fc-e878eaa87097	38	2
6deb3801-5483-4502-80fc-e878eaa87097	38	3
6deb3801-5483-4502-80fc-e878eaa87097	38	4
6deb3801-5483-4502-80fc-e878eaa87097	38	5
6deb3801-5483-4502-80fc-e878eaa87097	39	1
6deb3801-5483-4502-80fc-e878eaa87097	39	2
6deb3801-5483-4502-80fc-e878eaa87097	39	3
6deb3801-5483-4502-80fc-e878eaa87097	39	4
6deb3801-5483-4502-80fc-e878eaa87097	39	5
6deb3801-5483-4502-80fc-e878eaa87097	40	1
6deb3801-5483-4502-80fc-e878eaa87097	40	2
6deb3801-5483-4502-80fc-e878eaa87097	40	3
6deb3801-5483-4502-80fc-e878eaa87097	40	4
6deb3801-5483-4502-80fc-e878eaa87097	40	5
6deb3801-5483-4502-80fc-e878eaa87097	41	1
6deb3801-5483-4502-80fc-e878eaa87097	41	2
6deb3801-5483-4502-80fc-e878eaa87097	41	3
6deb3801-5483-4502-80fc-e878eaa87097	41	4
6deb3801-5483-4502-80fc-e878eaa87097	41	5
6deb3801-5483-4502-80fc-e878eaa87097	42	1
6deb3801-5483-4502-80fc-e878eaa87097	42	2
6deb3801-5483-4502-80fc-e878eaa87097	42	3
6deb3801-5483-4502-80fc-e878eaa87097	42	4
6deb3801-5483-4502-80fc-e878eaa87097	42	5
6deb3801-5483-4502-80fc-e878eaa87097	43	1
6deb3801-5483-4502-80fc-e878eaa87097	43	4
6deb3801-5483-4502-80fc-e878eaa87097	43	8
6deb3801-5483-4502-80fc-e878eaa87097	44	1
6deb3801-5483-4502-80fc-e878eaa87097	44	2
6deb3801-5483-4502-80fc-e878eaa87097	44	3
6deb3801-5483-4502-80fc-e878eaa87097	44	4
6deb3801-5483-4502-80fc-e878eaa87097	44	5
6deb3801-5483-4502-80fc-e878eaa87097	44	6
6deb3801-5483-4502-80fc-e878eaa87097	45	1
6deb3801-5483-4502-80fc-e878eaa87097	46	1
6deb3801-5483-4502-80fc-e878eaa87097	47	1
6deb3801-5483-4502-80fc-e878eaa87097	48	1
6deb3801-5483-4502-80fc-e878eaa87097	48	3
6deb3801-5483-4502-80fc-e878eaa87097	49	1
6deb3801-5483-4502-80fc-e878eaa87097	50	1
6deb3801-5483-4502-80fc-e878eaa87097	50	6
629eb656-50d7-411c-b82d-e4d7aacaa676	1	1
629eb656-50d7-411c-b82d-e4d7aacaa676	1	2
629eb656-50d7-411c-b82d-e4d7aacaa676	1	3
629eb656-50d7-411c-b82d-e4d7aacaa676	1	4
629eb656-50d7-411c-b82d-e4d7aacaa676	1	5
629eb656-50d7-411c-b82d-e4d7aacaa676	1	8
629eb656-50d7-411c-b82d-e4d7aacaa676	2	1
629eb656-50d7-411c-b82d-e4d7aacaa676	2	2
629eb656-50d7-411c-b82d-e4d7aacaa676	2	4
629eb656-50d7-411c-b82d-e4d7aacaa676	2	6
629eb656-50d7-411c-b82d-e4d7aacaa676	2	8
629eb656-50d7-411c-b82d-e4d7aacaa676	3	1
629eb656-50d7-411c-b82d-e4d7aacaa676	3	2
629eb656-50d7-411c-b82d-e4d7aacaa676	3	4
629eb656-50d7-411c-b82d-e4d7aacaa676	3	7
629eb656-50d7-411c-b82d-e4d7aacaa676	3	8
629eb656-50d7-411c-b82d-e4d7aacaa676	4	1
629eb656-50d7-411c-b82d-e4d7aacaa676	4	2
629eb656-50d7-411c-b82d-e4d7aacaa676	4	3
629eb656-50d7-411c-b82d-e4d7aacaa676	4	4
629eb656-50d7-411c-b82d-e4d7aacaa676	4	5
629eb656-50d7-411c-b82d-e4d7aacaa676	4	8
629eb656-50d7-411c-b82d-e4d7aacaa676	5	1
629eb656-50d7-411c-b82d-e4d7aacaa676	5	2
629eb656-50d7-411c-b82d-e4d7aacaa676	5	3
629eb656-50d7-411c-b82d-e4d7aacaa676	5	4
629eb656-50d7-411c-b82d-e4d7aacaa676	5	5
629eb656-50d7-411c-b82d-e4d7aacaa676	5	8
ecab4080-b0c3-4982-bd83-82c0935d13ef	3	1
ecab4080-b0c3-4982-bd83-82c0935d13ef	3	2
ecab4080-b0c3-4982-bd83-82c0935d13ef	3	4
ecab4080-b0c3-4982-bd83-82c0935d13ef	3	7
ecab4080-b0c3-4982-bd83-82c0935d13ef	3	8
ecab4080-b0c3-4982-bd83-82c0935d13ef	13	1
ecab4080-b0c3-4982-bd83-82c0935d13ef	13	2
ecab4080-b0c3-4982-bd83-82c0935d13ef	13	3
ecab4080-b0c3-4982-bd83-82c0935d13ef	13	4
ecab4080-b0c3-4982-bd83-82c0935d13ef	13	7
ecab4080-b0c3-4982-bd83-82c0935d13ef	38	1
ecab4080-b0c3-4982-bd83-82c0935d13ef	38	2
ecab4080-b0c3-4982-bd83-82c0935d13ef	38	3
ecab4080-b0c3-4982-bd83-82c0935d13ef	38	4
ecab4080-b0c3-4982-bd83-82c0935d13ef	38	5
ecab4080-b0c3-4982-bd83-82c0935d13ef	39	1
ecab4080-b0c3-4982-bd83-82c0935d13ef	39	2
ecab4080-b0c3-4982-bd83-82c0935d13ef	39	3
ecab4080-b0c3-4982-bd83-82c0935d13ef	39	4
ecab4080-b0c3-4982-bd83-82c0935d13ef	39	5
ecab4080-b0c3-4982-bd83-82c0935d13ef	40	1
ecab4080-b0c3-4982-bd83-82c0935d13ef	40	2
ecab4080-b0c3-4982-bd83-82c0935d13ef	40	3
ecab4080-b0c3-4982-bd83-82c0935d13ef	40	4
ecab4080-b0c3-4982-bd83-82c0935d13ef	40	5
ecab4080-b0c3-4982-bd83-82c0935d13ef	41	1
ecab4080-b0c3-4982-bd83-82c0935d13ef	41	2
ecab4080-b0c3-4982-bd83-82c0935d13ef	41	3
ecab4080-b0c3-4982-bd83-82c0935d13ef	41	4
ecab4080-b0c3-4982-bd83-82c0935d13ef	41	5
ecab4080-b0c3-4982-bd83-82c0935d13ef	42	1
ecab4080-b0c3-4982-bd83-82c0935d13ef	42	2
ecab4080-b0c3-4982-bd83-82c0935d13ef	42	3
ecab4080-b0c3-4982-bd83-82c0935d13ef	42	4
ecab4080-b0c3-4982-bd83-82c0935d13ef	42	5
20e0ed67-ffd5-4cde-a297-23f7b8d03fb7	6	1
21b16854-f420-4fdc-8ca6-f4d7ad10943c	45	1
21b16854-f420-4fdc-8ca6-f4d7ad10943c	46	1
21b16854-f420-4fdc-8ca6-f4d7ad10943c	47	1
21b16854-f420-4fdc-8ca6-f4d7ad10943c	48	1
21b16854-f420-4fdc-8ca6-f4d7ad10943c	48	3
21b16854-f420-4fdc-8ca6-f4d7ad10943c	49	1
21b16854-f420-4fdc-8ca6-f4d7ad10943c	50	1
21b16854-f420-4fdc-8ca6-f4d7ad10943c	50	6
32f85004-2a45-4142-ab3b-790390a240e2	6	1
32f85004-2a45-4142-ab3b-790390a240e2	7	1
32f85004-2a45-4142-ab3b-790390a240e2	8	3
32f85004-2a45-4142-ab3b-790390a240e2	8	5
32f85004-2a45-4142-ab3b-790390a240e2	8	4
32f85004-2a45-4142-ab3b-790390a240e2	8	8
32f85004-2a45-4142-ab3b-790390a240e2	8	2
32f85004-2a45-4142-ab3b-790390a240e2	8	1
32f85004-2a45-4142-ab3b-790390a240e2	9	3
32f85004-2a45-4142-ab3b-790390a240e2	9	5
32f85004-2a45-4142-ab3b-790390a240e2	9	4
32f85004-2a45-4142-ab3b-790390a240e2	9	8
32f85004-2a45-4142-ab3b-790390a240e2	9	2
32f85004-2a45-4142-ab3b-790390a240e2	9	1
32f85004-2a45-4142-ab3b-790390a240e2	10	3
32f85004-2a45-4142-ab3b-790390a240e2	10	5
32f85004-2a45-4142-ab3b-790390a240e2	10	4
32f85004-2a45-4142-ab3b-790390a240e2	10	2
32f85004-2a45-4142-ab3b-790390a240e2	10	1
32f85004-2a45-4142-ab3b-790390a240e2	11	3
32f85004-2a45-4142-ab3b-790390a240e2	11	5
32f85004-2a45-4142-ab3b-790390a240e2	11	4
32f85004-2a45-4142-ab3b-790390a240e2	11	2
32f85004-2a45-4142-ab3b-790390a240e2	11	1
32f85004-2a45-4142-ab3b-790390a240e2	12	3
32f85004-2a45-4142-ab3b-790390a240e2	12	1
32f85004-2a45-4142-ab3b-790390a240e2	13	3
32f85004-2a45-4142-ab3b-790390a240e2	13	4
32f85004-2a45-4142-ab3b-790390a240e2	13	7
32f85004-2a45-4142-ab3b-790390a240e2	13	2
32f85004-2a45-4142-ab3b-790390a240e2	13	1
32f85004-2a45-4142-ab3b-790390a240e2	14	4
32f85004-2a45-4142-ab3b-790390a240e2	14	8
32f85004-2a45-4142-ab3b-790390a240e2	14	1
32f85004-2a45-4142-ab3b-790390a240e2	15	4
32f85004-2a45-4142-ab3b-790390a240e2	15	8
32f85004-2a45-4142-ab3b-790390a240e2	15	1
32f85004-2a45-4142-ab3b-790390a240e2	16	3
32f85004-2a45-4142-ab3b-790390a240e2	16	5
32f85004-2a45-4142-ab3b-790390a240e2	16	4
32f85004-2a45-4142-ab3b-790390a240e2	16	2
32f85004-2a45-4142-ab3b-790390a240e2	16	1
32f85004-2a45-4142-ab3b-790390a240e2	17	3
32f85004-2a45-4142-ab3b-790390a240e2	17	4
32f85004-2a45-4142-ab3b-790390a240e2	17	2
32f85004-2a45-4142-ab3b-790390a240e2	17	1
32f85004-2a45-4142-ab3b-790390a240e2	18	3
32f85004-2a45-4142-ab3b-790390a240e2	18	5
32f85004-2a45-4142-ab3b-790390a240e2	18	4
32f85004-2a45-4142-ab3b-790390a240e2	18	2
32f85004-2a45-4142-ab3b-790390a240e2	18	1
32f85004-2a45-4142-ab3b-790390a240e2	19	3
32f85004-2a45-4142-ab3b-790390a240e2	19	5
32f85004-2a45-4142-ab3b-790390a240e2	19	4
32f85004-2a45-4142-ab3b-790390a240e2	19	2
32f85004-2a45-4142-ab3b-790390a240e2	19	1
32f85004-2a45-4142-ab3b-790390a240e2	20	3
32f85004-2a45-4142-ab3b-790390a240e2	20	5
32f85004-2a45-4142-ab3b-790390a240e2	20	4
32f85004-2a45-4142-ab3b-790390a240e2	20	2
32f85004-2a45-4142-ab3b-790390a240e2	20	1
32f85004-2a45-4142-ab3b-790390a240e2	21	3
32f85004-2a45-4142-ab3b-790390a240e2	21	5
32f85004-2a45-4142-ab3b-790390a240e2	21	4
32f85004-2a45-4142-ab3b-790390a240e2	21	2
32f85004-2a45-4142-ab3b-790390a240e2	21	1
32f85004-2a45-4142-ab3b-790390a240e2	22	3
32f85004-2a45-4142-ab3b-790390a240e2	22	4
32f85004-2a45-4142-ab3b-790390a240e2	22	2
32f85004-2a45-4142-ab3b-790390a240e2	22	1
32f85004-2a45-4142-ab3b-790390a240e2	23	3
32f85004-2a45-4142-ab3b-790390a240e2	23	4
32f85004-2a45-4142-ab3b-790390a240e2	23	2
32f85004-2a45-4142-ab3b-790390a240e2	23	1
32f85004-2a45-4142-ab3b-790390a240e2	24	4
32f85004-2a45-4142-ab3b-790390a240e2	24	2
32f85004-2a45-4142-ab3b-790390a240e2	24	1
32f85004-2a45-4142-ab3b-790390a240e2	25	6
32f85004-2a45-4142-ab3b-790390a240e2	25	3
32f85004-2a45-4142-ab3b-790390a240e2	25	5
32f85004-2a45-4142-ab3b-790390a240e2	25	4
32f85004-2a45-4142-ab3b-790390a240e2	25	2
32f85004-2a45-4142-ab3b-790390a240e2	25	1
32f85004-2a45-4142-ab3b-790390a240e2	26	6
32f85004-2a45-4142-ab3b-790390a240e2	26	2
32f85004-2a45-4142-ab3b-790390a240e2	26	1
32f85004-2a45-4142-ab3b-790390a240e2	27	7
32f85004-2a45-4142-ab3b-790390a240e2	27	2
32f85004-2a45-4142-ab3b-790390a240e2	27	1
32f85004-2a45-4142-ab3b-790390a240e2	28	6
32f85004-2a45-4142-ab3b-790390a240e2	28	5
32f85004-2a45-4142-ab3b-790390a240e2	28	4
32f85004-2a45-4142-ab3b-790390a240e2	28	7
32f85004-2a45-4142-ab3b-790390a240e2	28	2
32f85004-2a45-4142-ab3b-790390a240e2	28	1
32f85004-2a45-4142-ab3b-790390a240e2	29	3
32f85004-2a45-4142-ab3b-790390a240e2	29	1
32f85004-2a45-4142-ab3b-790390a240e2	30	3
32f85004-2a45-4142-ab3b-790390a240e2	30	1
32f85004-2a45-4142-ab3b-790390a240e2	31	3
32f85004-2a45-4142-ab3b-790390a240e2	31	5
32f85004-2a45-4142-ab3b-790390a240e2	31	4
32f85004-2a45-4142-ab3b-790390a240e2	31	2
32f85004-2a45-4142-ab3b-790390a240e2	31	1
32f85004-2a45-4142-ab3b-790390a240e2	32	4
32f85004-2a45-4142-ab3b-790390a240e2	32	2
32f85004-2a45-4142-ab3b-790390a240e2	32	1
32f85004-2a45-4142-ab3b-790390a240e2	33	1
32f85004-2a45-4142-ab3b-790390a240e2	34	3
32f85004-2a45-4142-ab3b-790390a240e2	34	5
32f85004-2a45-4142-ab3b-790390a240e2	34	4
32f85004-2a45-4142-ab3b-790390a240e2	34	1
32f85004-2a45-4142-ab3b-790390a240e2	35	4
32f85004-2a45-4142-ab3b-790390a240e2	35	1
32f85004-2a45-4142-ab3b-790390a240e2	36	3
32f85004-2a45-4142-ab3b-790390a240e2	36	5
32f85004-2a45-4142-ab3b-790390a240e2	36	4
32f85004-2a45-4142-ab3b-790390a240e2	36	2
32f85004-2a45-4142-ab3b-790390a240e2	36	1
32f85004-2a45-4142-ab3b-790390a240e2	37	3
32f85004-2a45-4142-ab3b-790390a240e2	37	1
32f85004-2a45-4142-ab3b-790390a240e2	38	3
32f85004-2a45-4142-ab3b-790390a240e2	38	5
32f85004-2a45-4142-ab3b-790390a240e2	38	4
32f85004-2a45-4142-ab3b-790390a240e2	38	2
32f85004-2a45-4142-ab3b-790390a240e2	38	1
32f85004-2a45-4142-ab3b-790390a240e2	39	3
32f85004-2a45-4142-ab3b-790390a240e2	39	5
32f85004-2a45-4142-ab3b-790390a240e2	39	4
32f85004-2a45-4142-ab3b-790390a240e2	39	2
32f85004-2a45-4142-ab3b-790390a240e2	39	1
32f85004-2a45-4142-ab3b-790390a240e2	40	3
32f85004-2a45-4142-ab3b-790390a240e2	40	5
32f85004-2a45-4142-ab3b-790390a240e2	40	4
32f85004-2a45-4142-ab3b-790390a240e2	40	2
32f85004-2a45-4142-ab3b-790390a240e2	40	1
32f85004-2a45-4142-ab3b-790390a240e2	41	3
32f85004-2a45-4142-ab3b-790390a240e2	41	5
32f85004-2a45-4142-ab3b-790390a240e2	41	4
32f85004-2a45-4142-ab3b-790390a240e2	41	2
32f85004-2a45-4142-ab3b-790390a240e2	41	1
32f85004-2a45-4142-ab3b-790390a240e2	42	3
32f85004-2a45-4142-ab3b-790390a240e2	42	5
32f85004-2a45-4142-ab3b-790390a240e2	42	4
32f85004-2a45-4142-ab3b-790390a240e2	42	2
32f85004-2a45-4142-ab3b-790390a240e2	42	1
32f85004-2a45-4142-ab3b-790390a240e2	43	4
32f85004-2a45-4142-ab3b-790390a240e2	43	8
32f85004-2a45-4142-ab3b-790390a240e2	43	1
32f85004-2a45-4142-ab3b-790390a240e2	44	6
32f85004-2a45-4142-ab3b-790390a240e2	44	3
32f85004-2a45-4142-ab3b-790390a240e2	44	5
32f85004-2a45-4142-ab3b-790390a240e2	44	4
32f85004-2a45-4142-ab3b-790390a240e2	44	2
32f85004-2a45-4142-ab3b-790390a240e2	44	1
32f85004-2a45-4142-ab3b-790390a240e2	45	1
32f85004-2a45-4142-ab3b-790390a240e2	46	1
4cd009fa-be79-4a3f-a63a-f419da20e241	6	1
4cd009fa-be79-4a3f-a63a-f419da20e241	10	1
4cd009fa-be79-4a3f-a63a-f419da20e241	10	2
4cd009fa-be79-4a3f-a63a-f419da20e241	10	3
4cd009fa-be79-4a3f-a63a-f419da20e241	10	4
4cd009fa-be79-4a3f-a63a-f419da20e241	10	5
4cd009fa-be79-4a3f-a63a-f419da20e241	11	1
4cd009fa-be79-4a3f-a63a-f419da20e241	11	2
4cd009fa-be79-4a3f-a63a-f419da20e241	11	3
4cd009fa-be79-4a3f-a63a-f419da20e241	11	4
4cd009fa-be79-4a3f-a63a-f419da20e241	11	5
4cd009fa-be79-4a3f-a63a-f419da20e241	21	1
32f85004-2a45-4142-ab3b-790390a240e2	47	1
32f85004-2a45-4142-ab3b-790390a240e2	48	3
32f85004-2a45-4142-ab3b-790390a240e2	48	1
32f85004-2a45-4142-ab3b-790390a240e2	49	1
32f85004-2a45-4142-ab3b-790390a240e2	50	6
32f85004-2a45-4142-ab3b-790390a240e2	50	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	6	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	7	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	8	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	8	5
8789fa4c-ef44-49f1-8fa3-1de925cf849e	8	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	8	8
8789fa4c-ef44-49f1-8fa3-1de925cf849e	8	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	8	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	9	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	9	5
8789fa4c-ef44-49f1-8fa3-1de925cf849e	9	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	9	8
8789fa4c-ef44-49f1-8fa3-1de925cf849e	9	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	9	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	10	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	10	5
8789fa4c-ef44-49f1-8fa3-1de925cf849e	10	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	10	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	10	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	11	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	11	5
8789fa4c-ef44-49f1-8fa3-1de925cf849e	11	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	11	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	11	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	12	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	12	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	13	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	13	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	13	7
8789fa4c-ef44-49f1-8fa3-1de925cf849e	13	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	13	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	14	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	14	8
8789fa4c-ef44-49f1-8fa3-1de925cf849e	14	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	15	4
4cd009fa-be79-4a3f-a63a-f419da20e241	21	2
4cd009fa-be79-4a3f-a63a-f419da20e241	21	3
4cd009fa-be79-4a3f-a63a-f419da20e241	21	4
4cd009fa-be79-4a3f-a63a-f419da20e241	21	5
4cd009fa-be79-4a3f-a63a-f419da20e241	22	1
4cd009fa-be79-4a3f-a63a-f419da20e241	22	2
4cd009fa-be79-4a3f-a63a-f419da20e241	22	3
4cd009fa-be79-4a3f-a63a-f419da20e241	22	4
4cd009fa-be79-4a3f-a63a-f419da20e241	23	1
4cd009fa-be79-4a3f-a63a-f419da20e241	23	2
4cd009fa-be79-4a3f-a63a-f419da20e241	23	3
4cd009fa-be79-4a3f-a63a-f419da20e241	23	4
4cd009fa-be79-4a3f-a63a-f419da20e241	24	1
4cd009fa-be79-4a3f-a63a-f419da20e241	24	2
4cd009fa-be79-4a3f-a63a-f419da20e241	24	4
4cd009fa-be79-4a3f-a63a-f419da20e241	25	1
4cd009fa-be79-4a3f-a63a-f419da20e241	25	2
4cd009fa-be79-4a3f-a63a-f419da20e241	25	3
4cd009fa-be79-4a3f-a63a-f419da20e241	25	4
4cd009fa-be79-4a3f-a63a-f419da20e241	25	5
4cd009fa-be79-4a3f-a63a-f419da20e241	25	6
4cd009fa-be79-4a3f-a63a-f419da20e241	29	1
4cd009fa-be79-4a3f-a63a-f419da20e241	29	3
4cd009fa-be79-4a3f-a63a-f419da20e241	30	1
4cd009fa-be79-4a3f-a63a-f419da20e241	30	3
4cd009fa-be79-4a3f-a63a-f419da20e241	31	1
4cd009fa-be79-4a3f-a63a-f419da20e241	31	2
4cd009fa-be79-4a3f-a63a-f419da20e241	31	3
4cd009fa-be79-4a3f-a63a-f419da20e241	31	4
4cd009fa-be79-4a3f-a63a-f419da20e241	31	5
4cd009fa-be79-4a3f-a63a-f419da20e241	32	1
4cd009fa-be79-4a3f-a63a-f419da20e241	32	2
4cd009fa-be79-4a3f-a63a-f419da20e241	32	4
4cd009fa-be79-4a3f-a63a-f419da20e241	33	1
4cd009fa-be79-4a3f-a63a-f419da20e241	34	1
4cd009fa-be79-4a3f-a63a-f419da20e241	34	3
4cd009fa-be79-4a3f-a63a-f419da20e241	34	4
4cd009fa-be79-4a3f-a63a-f419da20e241	34	5
4cd009fa-be79-4a3f-a63a-f419da20e241	35	1
4cd009fa-be79-4a3f-a63a-f419da20e241	35	4
4cd009fa-be79-4a3f-a63a-f419da20e241	37	1
4cd009fa-be79-4a3f-a63a-f419da20e241	37	3
45619fce-6554-4102-80c8-4b629e1d66b1	6	1
45619fce-6554-4102-80c8-4b629e1d66b1	10	1
45619fce-6554-4102-80c8-4b629e1d66b1	10	2
45619fce-6554-4102-80c8-4b629e1d66b1	10	3
45619fce-6554-4102-80c8-4b629e1d66b1	10	4
45619fce-6554-4102-80c8-4b629e1d66b1	10	5
45619fce-6554-4102-80c8-4b629e1d66b1	11	1
45619fce-6554-4102-80c8-4b629e1d66b1	11	2
45619fce-6554-4102-80c8-4b629e1d66b1	11	3
45619fce-6554-4102-80c8-4b629e1d66b1	11	4
45619fce-6554-4102-80c8-4b629e1d66b1	11	5
45619fce-6554-4102-80c8-4b629e1d66b1	21	1
45619fce-6554-4102-80c8-4b629e1d66b1	21	2
45619fce-6554-4102-80c8-4b629e1d66b1	21	3
45619fce-6554-4102-80c8-4b629e1d66b1	21	4
45619fce-6554-4102-80c8-4b629e1d66b1	21	5
45619fce-6554-4102-80c8-4b629e1d66b1	22	1
45619fce-6554-4102-80c8-4b629e1d66b1	22	2
45619fce-6554-4102-80c8-4b629e1d66b1	22	3
45619fce-6554-4102-80c8-4b629e1d66b1	22	4
45619fce-6554-4102-80c8-4b629e1d66b1	23	1
45619fce-6554-4102-80c8-4b629e1d66b1	23	2
45619fce-6554-4102-80c8-4b629e1d66b1	23	3
45619fce-6554-4102-80c8-4b629e1d66b1	23	4
45619fce-6554-4102-80c8-4b629e1d66b1	24	1
45619fce-6554-4102-80c8-4b629e1d66b1	24	2
45619fce-6554-4102-80c8-4b629e1d66b1	24	4
45619fce-6554-4102-80c8-4b629e1d66b1	25	1
45619fce-6554-4102-80c8-4b629e1d66b1	25	2
45619fce-6554-4102-80c8-4b629e1d66b1	25	3
45619fce-6554-4102-80c8-4b629e1d66b1	25	4
45619fce-6554-4102-80c8-4b629e1d66b1	25	5
45619fce-6554-4102-80c8-4b629e1d66b1	25	6
45619fce-6554-4102-80c8-4b629e1d66b1	29	1
45619fce-6554-4102-80c8-4b629e1d66b1	29	3
45619fce-6554-4102-80c8-4b629e1d66b1	30	1
45619fce-6554-4102-80c8-4b629e1d66b1	30	3
45619fce-6554-4102-80c8-4b629e1d66b1	31	1
45619fce-6554-4102-80c8-4b629e1d66b1	31	2
45619fce-6554-4102-80c8-4b629e1d66b1	31	3
45619fce-6554-4102-80c8-4b629e1d66b1	31	4
45619fce-6554-4102-80c8-4b629e1d66b1	31	5
45619fce-6554-4102-80c8-4b629e1d66b1	32	1
45619fce-6554-4102-80c8-4b629e1d66b1	32	2
45619fce-6554-4102-80c8-4b629e1d66b1	32	4
45619fce-6554-4102-80c8-4b629e1d66b1	33	1
45619fce-6554-4102-80c8-4b629e1d66b1	34	1
45619fce-6554-4102-80c8-4b629e1d66b1	34	3
45619fce-6554-4102-80c8-4b629e1d66b1	34	4
45619fce-6554-4102-80c8-4b629e1d66b1	34	5
45619fce-6554-4102-80c8-4b629e1d66b1	35	1
45619fce-6554-4102-80c8-4b629e1d66b1	35	4
45619fce-6554-4102-80c8-4b629e1d66b1	37	1
45619fce-6554-4102-80c8-4b629e1d66b1	37	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	15	8
8789fa4c-ef44-49f1-8fa3-1de925cf849e	15	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	16	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	16	5
8789fa4c-ef44-49f1-8fa3-1de925cf849e	16	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	16	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	16	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	17	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	17	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	17	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	17	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	18	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	18	5
8789fa4c-ef44-49f1-8fa3-1de925cf849e	18	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	18	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	18	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	19	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	19	5
8789fa4c-ef44-49f1-8fa3-1de925cf849e	19	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	19	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	19	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	20	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	20	5
8789fa4c-ef44-49f1-8fa3-1de925cf849e	20	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	20	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	20	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	21	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	21	5
8789fa4c-ef44-49f1-8fa3-1de925cf849e	21	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	21	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	21	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	22	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	22	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	22	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	22	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	23	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	23	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	23	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	23	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	24	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	24	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	24	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	25	6
8789fa4c-ef44-49f1-8fa3-1de925cf849e	25	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	25	5
8789fa4c-ef44-49f1-8fa3-1de925cf849e	25	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	25	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	25	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	26	6
8789fa4c-ef44-49f1-8fa3-1de925cf849e	26	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	26	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	27	7
8789fa4c-ef44-49f1-8fa3-1de925cf849e	27	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	27	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	28	6
8789fa4c-ef44-49f1-8fa3-1de925cf849e	28	5
8789fa4c-ef44-49f1-8fa3-1de925cf849e	28	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	28	7
8789fa4c-ef44-49f1-8fa3-1de925cf849e	28	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	28	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	29	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	29	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	30	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	30	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	31	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	31	5
8789fa4c-ef44-49f1-8fa3-1de925cf849e	31	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	31	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	31	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	32	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	32	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	32	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	33	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	34	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	34	5
8789fa4c-ef44-49f1-8fa3-1de925cf849e	34	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	34	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	35	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	35	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	36	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	36	5
8789fa4c-ef44-49f1-8fa3-1de925cf849e	36	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	36	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	36	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	37	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	37	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	38	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	38	5
8789fa4c-ef44-49f1-8fa3-1de925cf849e	38	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	38	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	38	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	39	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	39	5
8789fa4c-ef44-49f1-8fa3-1de925cf849e	39	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	39	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	39	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	40	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	40	5
8789fa4c-ef44-49f1-8fa3-1de925cf849e	40	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	40	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	40	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	41	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	41	5
8789fa4c-ef44-49f1-8fa3-1de925cf849e	41	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	41	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	41	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	42	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	42	5
8789fa4c-ef44-49f1-8fa3-1de925cf849e	42	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	42	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	42	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	43	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	43	8
8789fa4c-ef44-49f1-8fa3-1de925cf849e	43	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	44	6
8789fa4c-ef44-49f1-8fa3-1de925cf849e	44	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	44	5
8789fa4c-ef44-49f1-8fa3-1de925cf849e	44	4
8789fa4c-ef44-49f1-8fa3-1de925cf849e	44	2
8789fa4c-ef44-49f1-8fa3-1de925cf849e	44	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	45	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	46	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	47	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	48	3
8789fa4c-ef44-49f1-8fa3-1de925cf849e	48	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	49	1
8789fa4c-ef44-49f1-8fa3-1de925cf849e	50	6
8789fa4c-ef44-49f1-8fa3-1de925cf849e	50	1
\.


--
-- Data for Name: rbac_groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rbac_groups (id, name, description, "schoolId", "isSystem", "systemKey", color, "clonedFromId", "isActive", "createdAt", "updatedAt", "groupType", code) FROM stdin;
6deb3801-5483-4502-80fc-e878eaa87097	Super Admin	Full platform access	\N	t	super_admin	#7c3aed	\N	t	2026-07-31 09:10:05.60511	2026-07-31 09:10:05.60511	system	super_admin
629eb656-50d7-411c-b82d-e4d7aacaa676	School Manager	Manage schools and subscriptions	\N	t	school_manager	#2563eb	\N	t	2026-07-31 09:10:05.60511	2026-07-31 09:10:05.60511	system	school_manager
ecab4080-b0c3-4982-bd83-82c0935d13ef	Payment Manager	Manage platform and school payment configs	\N	t	payment_manager	#059669	\N	t	2026-07-31 09:10:05.60511	2026-07-31 09:10:05.60511	system	payment_manager
736d0976-81b9-4fbb-a539-3f8028ddaaed	dafgdfga	dfgadga	1	f	\N	\N	\N	t	2026-07-31 23:40:37.68921	2026-07-31 23:40:37.68921	staff	dafgdfga
20e0ed67-ffd5-4cde-a297-23f7b8d03fb7	Student	Static student portal access	\N	t	student	#64748b	\N	t	2026-08-01 00:03:44.204299	2026-08-01 00:03:44.204299	student	student
21b16854-f420-4fdc-8ca6-f4d7ad10943c	Parent	Static parent portal access	\N	t	parent	#0ea5e9	\N	t	2026-08-01 00:03:44.204299	2026-08-01 00:03:44.204299	parent	parent
4cd009fa-be79-4a3f-a63a-f419da20e241	Teacher (template)	Default teacher claim pack; cloned per school	\N	t	teacher_template	#059669	\N	t	2026-08-01 00:22:03.182239	2026-08-01 00:22:03.182239	staff	teacher_template
32f85004-2a45-4142-ab3b-790390a240e2	School Admin (template)	Default full school admin; clone per school	\N	t	school_admin_template	#0f766e	\N	t	2026-07-31 09:10:05.60511	2026-07-31 09:10:05.60511	staff	school_admin_template
45619fce-6554-4102-80c8-4b629e1d66b1	Teacher	School teacher access	1	f	\N	#059669	4cd009fa-be79-4a3f-a63a-f419da20e241	t	2026-08-01 00:22:03.182239	2026-08-01 00:22:03.182239	staff	teacher
8789fa4c-ef44-49f1-8fa3-1de925cf849e	School Admin	Full school access	1	f	\N	#0f766e	32f85004-2a45-4142-ab3b-790390a240e2	t	2026-07-31 09:10:05.60511	2026-07-31 09:10:05.60511	staff	school_admin
\.


--
-- Data for Name: rbac_page_actions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rbac_page_actions ("pageId", "actionId") FROM stdin;
1	1
1	2
1	3
1	4
1	5
1	8
2	1
2	2
2	4
2	6
2	8
3	1
3	2
3	4
3	7
3	8
4	1
4	2
4	3
4	4
4	5
4	8
5	1
5	2
5	3
5	4
5	5
5	8
6	1
7	1
8	1
8	2
8	3
8	4
8	5
8	8
9	1
9	2
9	3
9	4
9	5
9	8
10	1
10	2
10	3
10	4
10	5
11	1
11	2
11	3
11	4
11	5
12	1
12	3
13	1
13	2
13	3
13	4
13	7
14	1
14	4
14	8
15	1
15	4
15	8
16	1
16	2
16	3
16	4
16	5
17	1
17	2
17	3
17	4
18	1
18	2
18	3
18	4
18	5
19	1
19	2
19	4
19	3
19	5
20	1
20	2
20	3
20	4
20	5
21	1
21	2
21	3
21	4
21	5
22	1
22	2
22	3
22	4
23	1
23	2
23	3
23	4
24	1
24	2
24	4
25	1
25	2
25	3
25	4
25	5
25	6
26	1
26	2
26	6
27	1
27	2
27	7
28	1
28	2
28	4
28	6
28	7
28	5
29	1
29	3
30	1
30	3
31	1
31	2
31	3
31	4
31	5
32	1
32	2
32	4
33	1
34	1
34	3
34	4
34	5
35	1
35	4
36	1
36	2
36	3
36	4
36	5
37	1
37	3
38	1
38	2
38	3
38	4
38	5
39	1
39	2
39	3
39	4
39	5
40	1
40	2
40	3
40	4
40	5
41	1
41	2
41	3
41	4
41	5
42	1
42	2
42	3
42	4
42	5
43	1
43	4
43	8
44	1
44	2
44	3
44	4
44	5
44	6
45	1
46	1
47	1
48	1
48	3
49	1
50	1
50	6
\.


--
-- Data for Name: rbac_pages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rbac_pages (id, key, route, "nameEn", "nameAr", scope, "sortOrder", "isActive") FROM stdin;
1	platform_schools	/platform/schools	Schools	المدارس	platform	1	t
2	platform_subscriptions	/platform/subscriptions	Subscriptions	الاشتراكات	platform	2	t
3	platform_payments	/platform/payments	Platform Payments	مدفوعات المنصة	platform	3	t
4	platform_system_users	/platform/users	System Users	مستخدمو النظام	platform	4	t
5	platform_user_groups	/platform/user-groups	Platform User Groups	مجموعات المنصة	platform	5	t
6	dashboard	/dashboard	Dashboard	لوحة التحكم	school	10	t
7	mobile_dashboard	/mobile-dashboard	Mobile Dashboard	لوحة الجوال	school	11	t
8	users	/users	Users	المستخدمون	school	12	t
9	user_groups	/roles	User Groups	مجموعات المستخدمين	school	13	t
10	groups	/groups	Class Groups	المجموعات	school	14	t
11	students	/students	Students	الطلاب	school	15	t
12	student_register	/students/register	Student Registration	تسجيل طالب	school	16	t
13	student_payments	/students/payments	Student Payments	مدفوعات الطلاب	school	17	t
14	settings	/settings	School Settings	إعدادات المدرسة	school	18	t
15	system_settings	/system-settings	System Settings	إعدادات النظام	both	19	t
16	transportation	/transportation	Transportation	النقل	school	20	t
17	transportation_daily_log	/transportation/daily-log	Bus Daily Log	سجل الحافلات	school	21	t
18	courses	/courses	Courses	المقررات	school	30	t
19	course_enrollments	/course-enrollments	Course Enrollments	تسجيل المقررات	school	31	t
20	graded_courses	/graded-courses	Graded Courses	مقررات التقييم	school	32	t
21	schedules	/schedules	Schedules	الجداول	school	33	t
22	attendance	/attendance	Attendance	الحضور	school	34	t
23	attendance_sessions	/attendance/sessions	Session Attendance	حضور الجلسات	school	35	t
24	progress	/progress	Progress	التقدم	school	36	t
25	activities	/activities	Activities	الأنشطة	school	37	t
26	approvals	/approvals	Approvals	الموافقات	school	38	t
27	reports	/reports	Reports	التقارير	school	39	t
28	enrollments	/enrollments	Enrollments	طلبات التسجيل	school	40	t
29	chat	/chat	Group Chat	محادثة المجموعة	school	41	t
30	messages	/messages	Direct Messages	الرسائل	school	42	t
31	weekly_session_plans	/weekly-session-plans	Weekly Session Plans	خطط الجلسات	school	43	t
32	teacher_weekly_sessions	/teacher-weekly-sessions	Teacher Weekly Sessions	جلسات المعلم	school	44	t
33	teacher_schedule	/teacher/schedule	Teacher Schedule	جدول المعلم	school	45	t
34	teacher_graded_tasks	/teacher/graded-criterion-tasks	Graded Tasks	مهام التقييم	school	46	t
35	teacher_graded_marks	/teacher/graded-marks	Graded Marks	درجات التقييم	school	47	t
36	admin_meeting_rooms	/admin/meeting-rooms	Meeting Rooms	غرف الاجتماعات	school	48	t
37	my_meeting_rooms	/my-meeting-rooms	My Meeting Rooms	اجتماعاتي	school	49	t
38	payment_levels	/settings/payments/levels	Payment Levels	مستويات الرسوم	school	50	t
39	payment_courses	/settings/payments/courses	Payment Courses	رسوم المقررات	school	51	t
40	payment_packages	/settings/payments/packages	Fee Packages	باقات الرسوم	school	52	t
41	payment_catalog_charges	/settings/payments/catalog/charges	Charge Catalog	كتالوج الرسوم	school	53	t
42	payment_catalog_discounts	/settings/payments/catalog/discounts	Discount Catalog	كتالوج الخصومات	school	54	t
43	notification_templates	/settings/notification-templates	Notification Templates	قوالب الإشعارات	school	55	t
44	message_letters	/settings/message-letters	Message Letters	الرسائل الرسمية	school	56	t
45	parent_dashboard	/parent/dashboard	Parent Dashboard	لوحة ولي الأمر	school	70	t
46	parent_schedule	/parent/schedule	Parent Schedule	جدول ولي الأمر	school	71	t
47	parent_attendance	/parent/attendance	Parent Attendance	حضور ولي الأمر	school	72	t
48	parent_fees	/parent/fees	Parent Fees	رسوم ولي الأمر	school	73	t
49	parent_progress	/parent/progress	Parent Progress	تقدم ولي الأمر	school	74	t
50	parent_activities	/parent/weekly-activities	Parent Activities	أنشطة ولي الأمر	school	75	t
\.


--
-- Data for Name: rbac_role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rbac_role_permissions ("roleId", "pageId", "actionId") FROM stdin;
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	1	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	1	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	1	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	1	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	1	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	1	8
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	2	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	2	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	2	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	2	6
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	2	8
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	3	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	3	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	3	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	3	7
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	3	8
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	4	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	4	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	4	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	4	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	4	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	4	8
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	5	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	5	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	5	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	5	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	5	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	5	8
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	6	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	7	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	8	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	8	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	8	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	8	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	8	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	8	8
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	9	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	9	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	9	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	9	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	9	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	9	8
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	10	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	10	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	10	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	10	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	10	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	11	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	11	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	11	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	11	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	11	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	12	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	12	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	13	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	13	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	13	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	13	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	13	7
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	14	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	14	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	14	8
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	15	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	15	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	15	8
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	16	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	16	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	16	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	16	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	16	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	17	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	17	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	17	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	17	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	18	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	18	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	18	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	18	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	18	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	19	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	19	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	19	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	19	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	19	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	20	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	20	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	20	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	20	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	20	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	21	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	21	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	21	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	21	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	21	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	22	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	22	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	22	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	22	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	23	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	23	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	23	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	23	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	24	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	24	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	24	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	25	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	25	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	25	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	25	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	25	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	25	6
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	26	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	26	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	26	6
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	27	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	27	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	27	7
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	28	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	28	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	28	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	28	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	28	6
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	28	7
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	29	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	29	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	30	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	30	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	31	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	31	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	31	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	31	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	31	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	32	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	32	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	32	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	33	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	34	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	34	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	34	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	34	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	35	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	35	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	36	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	36	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	36	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	36	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	36	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	37	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	37	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	38	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	38	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	38	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	38	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	38	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	39	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	39	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	39	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	39	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	39	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	40	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	40	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	40	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	40	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	40	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	41	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	41	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	41	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	41	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	41	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	42	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	42	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	42	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	42	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	42	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	43	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	43	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	43	8
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	44	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	44	2
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	44	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	44	4
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	44	5
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	44	6
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	45	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	46	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	47	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	48	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	48	3
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	49	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	50	1
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	50	6
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	1	1
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	1	2
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	1	3
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	1	4
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	1	5
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	1	8
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	2	1
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	2	2
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	2	4
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	2	6
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	2	8
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	3	1
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	3	2
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	3	4
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	3	7
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	3	8
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	4	1
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	4	2
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	4	3
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	4	4
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	4	5
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	4	8
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	5	1
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	5	2
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	5	3
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	5	4
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	5	5
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	5	8
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	3	1
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	3	2
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	3	4
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	3	7
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	3	8
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	13	1
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	13	2
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	13	3
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	13	4
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	13	7
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	38	1
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	38	2
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	38	3
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	38	4
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	38	5
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	39	1
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	39	2
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	39	3
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	39	4
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	39	5
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	40	1
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	40	2
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	40	3
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	40	4
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	40	5
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	41	1
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	41	2
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	41	3
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	41	4
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	41	5
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	42	1
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	42	2
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	42	3
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	42	4
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	42	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	6	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	7	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	8	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	8	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	8	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	8	8
942fc58a-cedc-4a50-b91a-935ded5c7b4b	8	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	8	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	9	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	9	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	9	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	9	8
942fc58a-cedc-4a50-b91a-935ded5c7b4b	9	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	9	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	10	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	10	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	10	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	10	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	10	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	11	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	11	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	11	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	11	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	11	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	12	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	12	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	13	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	13	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	13	7
942fc58a-cedc-4a50-b91a-935ded5c7b4b	13	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	13	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	14	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	14	8
942fc58a-cedc-4a50-b91a-935ded5c7b4b	14	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	15	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	15	8
942fc58a-cedc-4a50-b91a-935ded5c7b4b	15	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	16	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	16	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	16	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	16	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	16	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	17	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	17	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	17	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	17	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	18	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	18	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	18	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	18	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	18	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	19	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	19	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	19	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	19	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	19	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	20	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	20	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	20	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	20	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	20	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	21	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	21	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	21	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	21	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	21	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	22	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	22	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	22	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	22	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	23	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	23	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	23	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	23	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	24	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	24	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	24	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	25	6
942fc58a-cedc-4a50-b91a-935ded5c7b4b	25	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	25	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	25	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	25	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	25	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	26	6
942fc58a-cedc-4a50-b91a-935ded5c7b4b	26	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	26	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	27	7
942fc58a-cedc-4a50-b91a-935ded5c7b4b	27	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	27	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	28	6
942fc58a-cedc-4a50-b91a-935ded5c7b4b	28	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	28	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	28	7
942fc58a-cedc-4a50-b91a-935ded5c7b4b	28	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	28	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	29	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	29	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	30	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	30	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	31	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	31	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	31	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	31	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	31	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	32	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	32	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	32	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	33	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	34	3
3b094696-6dda-49dc-b82c-f9dbde5c2aca	6	1
411854c4-8cf7-4171-88d3-5cb609fa34ae	45	1
411854c4-8cf7-4171-88d3-5cb609fa34ae	46	1
411854c4-8cf7-4171-88d3-5cb609fa34ae	47	1
411854c4-8cf7-4171-88d3-5cb609fa34ae	48	1
411854c4-8cf7-4171-88d3-5cb609fa34ae	48	3
411854c4-8cf7-4171-88d3-5cb609fa34ae	49	1
411854c4-8cf7-4171-88d3-5cb609fa34ae	50	1
411854c4-8cf7-4171-88d3-5cb609fa34ae	50	6
969f75f9-10b5-4770-8ade-e851c86f2c90	6	1
969f75f9-10b5-4770-8ade-e851c86f2c90	10	1
969f75f9-10b5-4770-8ade-e851c86f2c90	10	2
969f75f9-10b5-4770-8ade-e851c86f2c90	10	3
969f75f9-10b5-4770-8ade-e851c86f2c90	10	4
969f75f9-10b5-4770-8ade-e851c86f2c90	10	5
969f75f9-10b5-4770-8ade-e851c86f2c90	11	1
969f75f9-10b5-4770-8ade-e851c86f2c90	11	2
969f75f9-10b5-4770-8ade-e851c86f2c90	11	3
969f75f9-10b5-4770-8ade-e851c86f2c90	11	4
969f75f9-10b5-4770-8ade-e851c86f2c90	11	5
969f75f9-10b5-4770-8ade-e851c86f2c90	21	1
969f75f9-10b5-4770-8ade-e851c86f2c90	21	2
969f75f9-10b5-4770-8ade-e851c86f2c90	21	3
969f75f9-10b5-4770-8ade-e851c86f2c90	21	4
969f75f9-10b5-4770-8ade-e851c86f2c90	21	5
969f75f9-10b5-4770-8ade-e851c86f2c90	22	1
969f75f9-10b5-4770-8ade-e851c86f2c90	22	2
969f75f9-10b5-4770-8ade-e851c86f2c90	22	3
969f75f9-10b5-4770-8ade-e851c86f2c90	22	4
969f75f9-10b5-4770-8ade-e851c86f2c90	23	1
969f75f9-10b5-4770-8ade-e851c86f2c90	23	2
969f75f9-10b5-4770-8ade-e851c86f2c90	23	3
969f75f9-10b5-4770-8ade-e851c86f2c90	23	4
969f75f9-10b5-4770-8ade-e851c86f2c90	24	1
969f75f9-10b5-4770-8ade-e851c86f2c90	24	2
969f75f9-10b5-4770-8ade-e851c86f2c90	24	4
969f75f9-10b5-4770-8ade-e851c86f2c90	25	1
969f75f9-10b5-4770-8ade-e851c86f2c90	25	2
969f75f9-10b5-4770-8ade-e851c86f2c90	25	3
969f75f9-10b5-4770-8ade-e851c86f2c90	25	4
969f75f9-10b5-4770-8ade-e851c86f2c90	25	5
969f75f9-10b5-4770-8ade-e851c86f2c90	25	6
969f75f9-10b5-4770-8ade-e851c86f2c90	29	1
969f75f9-10b5-4770-8ade-e851c86f2c90	29	3
969f75f9-10b5-4770-8ade-e851c86f2c90	30	1
969f75f9-10b5-4770-8ade-e851c86f2c90	30	3
969f75f9-10b5-4770-8ade-e851c86f2c90	31	1
969f75f9-10b5-4770-8ade-e851c86f2c90	31	2
969f75f9-10b5-4770-8ade-e851c86f2c90	31	3
969f75f9-10b5-4770-8ade-e851c86f2c90	31	4
969f75f9-10b5-4770-8ade-e851c86f2c90	31	5
969f75f9-10b5-4770-8ade-e851c86f2c90	32	1
969f75f9-10b5-4770-8ade-e851c86f2c90	32	2
969f75f9-10b5-4770-8ade-e851c86f2c90	32	4
969f75f9-10b5-4770-8ade-e851c86f2c90	33	1
969f75f9-10b5-4770-8ade-e851c86f2c90	34	1
969f75f9-10b5-4770-8ade-e851c86f2c90	34	3
969f75f9-10b5-4770-8ade-e851c86f2c90	34	4
969f75f9-10b5-4770-8ade-e851c86f2c90	34	5
969f75f9-10b5-4770-8ade-e851c86f2c90	35	1
969f75f9-10b5-4770-8ade-e851c86f2c90	35	4
969f75f9-10b5-4770-8ade-e851c86f2c90	37	1
969f75f9-10b5-4770-8ade-e851c86f2c90	37	3
862145dd-d370-415a-adf7-a1d49e6925f7	6	1
862145dd-d370-415a-adf7-a1d49e6925f7	10	1
862145dd-d370-415a-adf7-a1d49e6925f7	10	2
862145dd-d370-415a-adf7-a1d49e6925f7	10	3
862145dd-d370-415a-adf7-a1d49e6925f7	10	4
862145dd-d370-415a-adf7-a1d49e6925f7	10	5
862145dd-d370-415a-adf7-a1d49e6925f7	11	1
862145dd-d370-415a-adf7-a1d49e6925f7	11	2
862145dd-d370-415a-adf7-a1d49e6925f7	11	3
862145dd-d370-415a-adf7-a1d49e6925f7	11	4
862145dd-d370-415a-adf7-a1d49e6925f7	11	5
862145dd-d370-415a-adf7-a1d49e6925f7	21	1
862145dd-d370-415a-adf7-a1d49e6925f7	21	2
862145dd-d370-415a-adf7-a1d49e6925f7	21	3
862145dd-d370-415a-adf7-a1d49e6925f7	21	4
862145dd-d370-415a-adf7-a1d49e6925f7	21	5
862145dd-d370-415a-adf7-a1d49e6925f7	22	1
862145dd-d370-415a-adf7-a1d49e6925f7	22	2
862145dd-d370-415a-adf7-a1d49e6925f7	22	3
862145dd-d370-415a-adf7-a1d49e6925f7	22	4
862145dd-d370-415a-adf7-a1d49e6925f7	23	1
862145dd-d370-415a-adf7-a1d49e6925f7	23	2
862145dd-d370-415a-adf7-a1d49e6925f7	23	3
862145dd-d370-415a-adf7-a1d49e6925f7	23	4
862145dd-d370-415a-adf7-a1d49e6925f7	24	1
862145dd-d370-415a-adf7-a1d49e6925f7	24	2
862145dd-d370-415a-adf7-a1d49e6925f7	24	4
862145dd-d370-415a-adf7-a1d49e6925f7	25	1
862145dd-d370-415a-adf7-a1d49e6925f7	25	2
862145dd-d370-415a-adf7-a1d49e6925f7	25	3
862145dd-d370-415a-adf7-a1d49e6925f7	25	4
862145dd-d370-415a-adf7-a1d49e6925f7	25	5
862145dd-d370-415a-adf7-a1d49e6925f7	25	6
862145dd-d370-415a-adf7-a1d49e6925f7	29	1
862145dd-d370-415a-adf7-a1d49e6925f7	29	3
862145dd-d370-415a-adf7-a1d49e6925f7	30	1
862145dd-d370-415a-adf7-a1d49e6925f7	30	3
862145dd-d370-415a-adf7-a1d49e6925f7	31	1
862145dd-d370-415a-adf7-a1d49e6925f7	31	2
862145dd-d370-415a-adf7-a1d49e6925f7	31	3
862145dd-d370-415a-adf7-a1d49e6925f7	31	4
862145dd-d370-415a-adf7-a1d49e6925f7	31	5
862145dd-d370-415a-adf7-a1d49e6925f7	32	1
862145dd-d370-415a-adf7-a1d49e6925f7	32	2
862145dd-d370-415a-adf7-a1d49e6925f7	32	4
862145dd-d370-415a-adf7-a1d49e6925f7	33	1
862145dd-d370-415a-adf7-a1d49e6925f7	34	1
862145dd-d370-415a-adf7-a1d49e6925f7	34	3
862145dd-d370-415a-adf7-a1d49e6925f7	34	4
862145dd-d370-415a-adf7-a1d49e6925f7	34	5
862145dd-d370-415a-adf7-a1d49e6925f7	35	1
862145dd-d370-415a-adf7-a1d49e6925f7	35	4
862145dd-d370-415a-adf7-a1d49e6925f7	37	1
862145dd-d370-415a-adf7-a1d49e6925f7	37	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	34	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	34	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	34	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	35	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	35	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	36	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	36	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	36	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	36	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	36	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	37	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	37	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	38	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	38	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	38	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	38	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	38	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	39	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	39	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	39	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	39	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	39	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	40	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	40	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	40	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	40	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	40	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	41	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	41	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	41	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	41	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	41	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	42	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	42	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	42	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	42	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	42	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	43	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	43	8
942fc58a-cedc-4a50-b91a-935ded5c7b4b	43	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	44	6
942fc58a-cedc-4a50-b91a-935ded5c7b4b	44	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	44	5
942fc58a-cedc-4a50-b91a-935ded5c7b4b	44	4
942fc58a-cedc-4a50-b91a-935ded5c7b4b	44	2
942fc58a-cedc-4a50-b91a-935ded5c7b4b	44	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	45	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	46	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	47	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	48	3
942fc58a-cedc-4a50-b91a-935ded5c7b4b	48	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	49	1
942fc58a-cedc-4a50-b91a-935ded5c7b4b	50	6
942fc58a-cedc-4a50-b91a-935ded5c7b4b	50	1
d576897b-17e0-4362-b911-27121ac8fc38	6	1
d576897b-17e0-4362-b911-27121ac8fc38	7	1
d576897b-17e0-4362-b911-27121ac8fc38	8	3
d576897b-17e0-4362-b911-27121ac8fc38	8	5
d576897b-17e0-4362-b911-27121ac8fc38	8	4
d576897b-17e0-4362-b911-27121ac8fc38	8	8
d576897b-17e0-4362-b911-27121ac8fc38	8	2
d576897b-17e0-4362-b911-27121ac8fc38	8	1
d576897b-17e0-4362-b911-27121ac8fc38	9	3
d576897b-17e0-4362-b911-27121ac8fc38	9	5
d576897b-17e0-4362-b911-27121ac8fc38	9	4
d576897b-17e0-4362-b911-27121ac8fc38	9	8
d576897b-17e0-4362-b911-27121ac8fc38	9	2
d576897b-17e0-4362-b911-27121ac8fc38	9	1
d576897b-17e0-4362-b911-27121ac8fc38	10	3
d576897b-17e0-4362-b911-27121ac8fc38	10	5
d576897b-17e0-4362-b911-27121ac8fc38	10	4
d576897b-17e0-4362-b911-27121ac8fc38	10	2
d576897b-17e0-4362-b911-27121ac8fc38	10	1
d576897b-17e0-4362-b911-27121ac8fc38	11	3
d576897b-17e0-4362-b911-27121ac8fc38	11	5
d576897b-17e0-4362-b911-27121ac8fc38	11	4
d576897b-17e0-4362-b911-27121ac8fc38	11	2
d576897b-17e0-4362-b911-27121ac8fc38	11	1
d576897b-17e0-4362-b911-27121ac8fc38	12	3
d576897b-17e0-4362-b911-27121ac8fc38	12	1
d576897b-17e0-4362-b911-27121ac8fc38	13	3
d576897b-17e0-4362-b911-27121ac8fc38	13	4
d576897b-17e0-4362-b911-27121ac8fc38	13	7
d576897b-17e0-4362-b911-27121ac8fc38	13	2
d576897b-17e0-4362-b911-27121ac8fc38	13	1
d576897b-17e0-4362-b911-27121ac8fc38	14	4
d576897b-17e0-4362-b911-27121ac8fc38	14	8
d576897b-17e0-4362-b911-27121ac8fc38	14	1
d576897b-17e0-4362-b911-27121ac8fc38	15	4
d576897b-17e0-4362-b911-27121ac8fc38	15	8
d576897b-17e0-4362-b911-27121ac8fc38	15	1
d576897b-17e0-4362-b911-27121ac8fc38	16	3
d576897b-17e0-4362-b911-27121ac8fc38	16	5
d576897b-17e0-4362-b911-27121ac8fc38	16	4
d576897b-17e0-4362-b911-27121ac8fc38	16	2
d576897b-17e0-4362-b911-27121ac8fc38	16	1
d576897b-17e0-4362-b911-27121ac8fc38	17	3
d576897b-17e0-4362-b911-27121ac8fc38	17	4
d576897b-17e0-4362-b911-27121ac8fc38	17	2
d576897b-17e0-4362-b911-27121ac8fc38	17	1
d576897b-17e0-4362-b911-27121ac8fc38	18	3
d576897b-17e0-4362-b911-27121ac8fc38	18	5
d576897b-17e0-4362-b911-27121ac8fc38	18	4
d576897b-17e0-4362-b911-27121ac8fc38	18	2
d576897b-17e0-4362-b911-27121ac8fc38	18	1
d576897b-17e0-4362-b911-27121ac8fc38	19	3
d576897b-17e0-4362-b911-27121ac8fc38	19	5
d576897b-17e0-4362-b911-27121ac8fc38	19	4
d576897b-17e0-4362-b911-27121ac8fc38	19	2
d576897b-17e0-4362-b911-27121ac8fc38	19	1
d576897b-17e0-4362-b911-27121ac8fc38	20	3
d576897b-17e0-4362-b911-27121ac8fc38	20	5
d576897b-17e0-4362-b911-27121ac8fc38	20	4
d576897b-17e0-4362-b911-27121ac8fc38	20	2
d576897b-17e0-4362-b911-27121ac8fc38	20	1
d576897b-17e0-4362-b911-27121ac8fc38	21	3
d576897b-17e0-4362-b911-27121ac8fc38	21	5
d576897b-17e0-4362-b911-27121ac8fc38	21	4
d576897b-17e0-4362-b911-27121ac8fc38	21	2
d576897b-17e0-4362-b911-27121ac8fc38	21	1
d576897b-17e0-4362-b911-27121ac8fc38	22	3
d576897b-17e0-4362-b911-27121ac8fc38	22	4
d576897b-17e0-4362-b911-27121ac8fc38	22	2
d576897b-17e0-4362-b911-27121ac8fc38	22	1
d576897b-17e0-4362-b911-27121ac8fc38	23	3
d576897b-17e0-4362-b911-27121ac8fc38	23	4
d576897b-17e0-4362-b911-27121ac8fc38	23	2
d576897b-17e0-4362-b911-27121ac8fc38	23	1
d576897b-17e0-4362-b911-27121ac8fc38	24	4
d576897b-17e0-4362-b911-27121ac8fc38	24	2
d576897b-17e0-4362-b911-27121ac8fc38	24	1
d576897b-17e0-4362-b911-27121ac8fc38	25	6
d576897b-17e0-4362-b911-27121ac8fc38	25	3
d576897b-17e0-4362-b911-27121ac8fc38	25	5
d576897b-17e0-4362-b911-27121ac8fc38	25	4
d576897b-17e0-4362-b911-27121ac8fc38	25	2
d576897b-17e0-4362-b911-27121ac8fc38	25	1
d576897b-17e0-4362-b911-27121ac8fc38	26	6
d576897b-17e0-4362-b911-27121ac8fc38	26	2
d576897b-17e0-4362-b911-27121ac8fc38	26	1
d576897b-17e0-4362-b911-27121ac8fc38	27	7
d576897b-17e0-4362-b911-27121ac8fc38	27	2
d576897b-17e0-4362-b911-27121ac8fc38	27	1
d576897b-17e0-4362-b911-27121ac8fc38	28	6
d576897b-17e0-4362-b911-27121ac8fc38	28	5
d576897b-17e0-4362-b911-27121ac8fc38	28	4
d576897b-17e0-4362-b911-27121ac8fc38	28	7
d576897b-17e0-4362-b911-27121ac8fc38	28	2
d576897b-17e0-4362-b911-27121ac8fc38	28	1
d576897b-17e0-4362-b911-27121ac8fc38	29	3
d576897b-17e0-4362-b911-27121ac8fc38	29	1
d576897b-17e0-4362-b911-27121ac8fc38	30	3
d576897b-17e0-4362-b911-27121ac8fc38	30	1
d576897b-17e0-4362-b911-27121ac8fc38	31	3
d576897b-17e0-4362-b911-27121ac8fc38	31	5
d576897b-17e0-4362-b911-27121ac8fc38	31	4
d576897b-17e0-4362-b911-27121ac8fc38	31	2
d576897b-17e0-4362-b911-27121ac8fc38	31	1
d576897b-17e0-4362-b911-27121ac8fc38	32	4
d576897b-17e0-4362-b911-27121ac8fc38	32	2
d576897b-17e0-4362-b911-27121ac8fc38	32	1
d576897b-17e0-4362-b911-27121ac8fc38	33	1
d576897b-17e0-4362-b911-27121ac8fc38	34	3
d576897b-17e0-4362-b911-27121ac8fc38	34	5
d576897b-17e0-4362-b911-27121ac8fc38	34	4
d576897b-17e0-4362-b911-27121ac8fc38	34	1
d576897b-17e0-4362-b911-27121ac8fc38	35	4
d576897b-17e0-4362-b911-27121ac8fc38	35	1
d576897b-17e0-4362-b911-27121ac8fc38	36	3
d576897b-17e0-4362-b911-27121ac8fc38	36	5
d576897b-17e0-4362-b911-27121ac8fc38	36	4
d576897b-17e0-4362-b911-27121ac8fc38	36	2
d576897b-17e0-4362-b911-27121ac8fc38	36	1
d576897b-17e0-4362-b911-27121ac8fc38	37	3
d576897b-17e0-4362-b911-27121ac8fc38	37	1
d576897b-17e0-4362-b911-27121ac8fc38	38	3
d576897b-17e0-4362-b911-27121ac8fc38	38	5
d576897b-17e0-4362-b911-27121ac8fc38	38	4
d576897b-17e0-4362-b911-27121ac8fc38	38	2
d576897b-17e0-4362-b911-27121ac8fc38	38	1
d576897b-17e0-4362-b911-27121ac8fc38	39	3
d576897b-17e0-4362-b911-27121ac8fc38	39	5
d576897b-17e0-4362-b911-27121ac8fc38	39	4
d576897b-17e0-4362-b911-27121ac8fc38	39	2
d576897b-17e0-4362-b911-27121ac8fc38	39	1
d576897b-17e0-4362-b911-27121ac8fc38	40	3
d576897b-17e0-4362-b911-27121ac8fc38	40	5
d576897b-17e0-4362-b911-27121ac8fc38	40	4
d576897b-17e0-4362-b911-27121ac8fc38	40	2
d576897b-17e0-4362-b911-27121ac8fc38	40	1
d576897b-17e0-4362-b911-27121ac8fc38	41	3
d576897b-17e0-4362-b911-27121ac8fc38	41	5
d576897b-17e0-4362-b911-27121ac8fc38	41	4
d576897b-17e0-4362-b911-27121ac8fc38	41	2
d576897b-17e0-4362-b911-27121ac8fc38	41	1
d576897b-17e0-4362-b911-27121ac8fc38	42	3
d576897b-17e0-4362-b911-27121ac8fc38	42	5
d576897b-17e0-4362-b911-27121ac8fc38	42	4
d576897b-17e0-4362-b911-27121ac8fc38	42	2
d576897b-17e0-4362-b911-27121ac8fc38	42	1
d576897b-17e0-4362-b911-27121ac8fc38	43	4
d576897b-17e0-4362-b911-27121ac8fc38	43	8
d576897b-17e0-4362-b911-27121ac8fc38	43	1
d576897b-17e0-4362-b911-27121ac8fc38	44	6
d576897b-17e0-4362-b911-27121ac8fc38	44	3
d576897b-17e0-4362-b911-27121ac8fc38	44	5
d576897b-17e0-4362-b911-27121ac8fc38	44	4
d576897b-17e0-4362-b911-27121ac8fc38	44	2
d576897b-17e0-4362-b911-27121ac8fc38	44	1
d576897b-17e0-4362-b911-27121ac8fc38	45	1
d576897b-17e0-4362-b911-27121ac8fc38	46	1
d576897b-17e0-4362-b911-27121ac8fc38	47	1
d576897b-17e0-4362-b911-27121ac8fc38	48	3
d576897b-17e0-4362-b911-27121ac8fc38	48	1
d576897b-17e0-4362-b911-27121ac8fc38	49	1
d576897b-17e0-4362-b911-27121ac8fc38	50	6
d576897b-17e0-4362-b911-27121ac8fc38	50	1
\.


--
-- Data for Name: rbac_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rbac_roles (id, name, description, "schoolId", "isSystem", "systemKey", "isActive", "createdAt", "updatedAt", code) FROM stdin;
f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	Super Admin Role	Claim pack for user group Super Admin	\N	t	role_from_super_admin	t	2026-08-01 00:03:44.204299	2026-08-01 00:03:44.204299	role_from_super_admin
7f3e826d-d0a0-49d3-abd7-e7b6af734f42	School Manager Role	Claim pack for user group School Manager	\N	t	role_from_school_manager	t	2026-08-01 00:03:44.204299	2026-08-01 00:03:44.204299	role_from_school_manager
b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	Payment Manager Role	Claim pack for user group Payment Manager	\N	t	role_from_payment_manager	t	2026-08-01 00:03:44.204299	2026-08-01 00:03:44.204299	role_from_payment_manager
942fc58a-cedc-4a50-b91a-935ded5c7b4b	School Admin (template) Role	Claim pack for user group School Admin (template)	\N	t	role_from_school_admin_template	t	2026-08-01 00:03:44.204299	2026-08-01 00:03:44.204299	role_from_school_admin_template
d576897b-17e0-4362-b911-27121ac8fc38	School Admin Role	Claim pack for user group School Admin	1	f	\N	t	2026-08-01 00:03:44.204299	2026-08-01 00:03:44.204299	school_admin_role
b06f4cb8-bdd4-4be0-9b20-4cf59074d54b	dafgdfga Role	Claim pack for user group dafgdfga	1	f	\N	t	2026-08-01 00:03:44.204299	2026-08-01 00:03:44.204299	dafgdfga_role
3b094696-6dda-49dc-b82c-f9dbde5c2aca	Student Role	Static student portal access	\N	t	role_student	t	2026-08-01 00:03:44.204299	2026-08-01 00:03:44.204299	role_student
411854c4-8cf7-4171-88d3-5cb609fa34ae	Parent Role	Static parent portal access	\N	t	role_parent	t	2026-08-01 00:03:44.204299	2026-08-01 00:03:44.204299	role_parent
969f75f9-10b5-4770-8ade-e851c86f2c90	Teacher Role	Default teacher claims	\N	t	role_teacher_template	t	2026-08-01 00:22:03.182239	2026-08-01 00:22:03.182239	role_teacher_template
862145dd-d370-415a-adf7-a1d49e6925f7	Teacher Role	School teacher claims	1	f	\N	t	2026-08-01 00:22:03.182239	2026-08-01 00:22:03.182239	teacher
\.


--
-- Data for Name: rbac_user_group_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rbac_user_group_members ("userId", "groupId", "assignedAt") FROM stdin;
a7b115cb-b4a8-4e6f-9027-2b1d84fe80b9	6deb3801-5483-4502-80fc-e878eaa87097	2026-07-31 09:10:05.60511
e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	8789fa4c-ef44-49f1-8fa3-1de925cf849e	2026-07-31 09:10:05.60511
d2260ae9-931a-4e45-9fcd-e13a6930e7c1	8789fa4c-ef44-49f1-8fa3-1de925cf849e	2026-07-31 09:10:05.60511
626a3c4c-86b1-4ff4-a98d-b5a8aee34b69	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
08ca1d7d-f5a9-4b41-a20b-cb65f1b338b7	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
cd710bef-f94f-411e-95af-e41c25b6dfa4	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
d1c5048d-c936-4428-b86c-389e8ef99f27	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
fa1fbdb7-4a31-4ea2-ace0-0887be03ebdd	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
c99ea4b6-1226-40bb-ba4a-40bdb793a186	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
63e3f2ee-ebba-4448-9cf6-97034ef5de6e	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
4e93ec2a-c5b9-4339-9641-e06b61c71235	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
67c5764d-3226-495f-9c90-065fade5a635	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
555b318d-1aeb-442e-8781-1d5debe0d95b	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
acce19fe-feec-45e7-86d5-a28e079fefad	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
b2508337-08de-4efa-b9ad-8e20efd1f855	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
58135a72-0ae8-40b6-8dff-9883f9c8ea20	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
938115b6-0d75-454f-b8e0-ecaea88086c3	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
f435dd70-eba6-40e6-a0aa-d2931c981f97	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
1b00d302-f024-4cc1-ac45-acf566c8b31a	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
600f55e1-95f4-4bdb-8c98-71b86010b490	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
4c5ddd4d-2a22-4d50-ba19-14283117f045	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
a9736adb-8352-4788-ac6a-cdb95aa7be33	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
0617d532-4659-4d17-bf6f-94371eacfc5e	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
0ba67a91-840f-4fe8-bbcc-3c271e4a3dd0	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
afc7892c-c0df-47a5-ab0c-b5250d44d88f	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
879b6aaf-da65-4109-85bd-d2cccab26c26	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
de826c1d-ba79-4ccf-96d0-f9bd52d4f7f2	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
2d05f4da-c71c-4763-9571-47e997a3041a	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
112d118e-e69f-4e8b-9190-7f218789bc5c	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
fcd76a90-e1df-49fa-876c-3fd92ccb367b	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
f239e4b6-8bff-4bbc-8af1-a454ea371107	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
6430eba5-0852-48d3-90ef-1c42e6174bae	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
83f3fea3-37aa-4f61-82d0-26a14d0d48a1	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
9ee33166-a310-42d9-8d8f-c36c0a8be6ee	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
9063b1a2-4622-4cd5-b971-0b0f2122d1cf	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
d94fa1e6-5133-4e17-9089-f949d586c076	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
7b6bbca4-3576-45f8-a101-f1a73bab7239	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
452a9aa1-ab9b-4c49-99a2-2ddcc91b12db	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
74454788-828b-4d65-b6cf-e61739b72417	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
c304b685-48cb-4b14-946a-6afa4fb8d3c2	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
1b1dfb2a-2a9e-4145-99b5-fa01d074060b	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
cd319ad1-4954-4d6e-b270-ce4808338b86	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
9fa0b1eb-e112-4480-8d27-1f434ea1b391	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
c585ec6e-602e-49f9-b973-061cfebeb083	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
75fcf6ec-87f2-4721-8b36-82eb9e612246	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
c95db9d4-76c2-44d6-9814-a6caaf8695e1	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
871b0869-b82d-4278-906a-0ffc1c7b6db5	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
978799bd-f2b7-448f-8384-33c82730da65	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
75b33b28-3d13-404b-a27a-58339c31f8c6	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
ef989278-af74-48fb-bcc4-b2416be1f2f2	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
adb2ced4-d127-453c-a5c4-60528ef7995a	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
34a104b6-52dd-4202-b67c-99e7a577d8c2	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
34e55b8c-9584-4dfa-8f8f-b4e27413519c	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
6b9f3d36-0dde-4dc4-8453-54bae112f094	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
dd820099-23c3-42c8-a668-9165418ae1ce	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
9d68391c-8ce3-4729-b2da-1ac583aef255	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
da45f482-cbee-4e21-9415-164a0028fde0	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
dfc1672e-32b8-4e00-a7b9-85f3d8e078ca	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
6fb1743f-b438-41e7-be5c-7c074ed9c539	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
e075a638-515c-4f91-9f10-c813701674b6	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
95d46a63-c799-4f9b-87cf-c6ebf82d4229	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
8087566b-4a9a-4ce8-98bf-e1b4d72dd91b	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
28356a57-ca29-4252-8493-1e64d7e8c2ec	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
81072d14-e408-486a-8703-cbce17c8e9b7	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
262e9678-3021-4d71-8b93-00c1572155c0	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
aa089a54-35e2-4fb3-b31b-3536b031577e	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
4679ecd4-b2cc-4b44-a1db-e07a640c7cc2	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
e23da144-61b6-47d6-85eb-0347d8ccfc04	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
4db122e0-a9c2-4263-89b0-a4e1fa5a00d9	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
b790f3a8-5211-4773-9733-2afb92592a12	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
7690a1db-c675-4653-a6e7-a876383417f0	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
b0b49458-cc73-4197-9e94-2d47a1ee9e2e	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
14a0f1ad-46cd-4616-82f7-c51dbc9d1f40	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
8af83477-f92b-43ba-8b8b-d792b38f3e1d	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
3becfdfb-403a-4064-8d7b-b751900779ed	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
5d186609-1aca-4c68-8960-c45362e4e674	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
44b07cd5-c193-4d4d-9dc6-fe3149e6c469	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
e2faee80-b7cf-41af-8e51-29912e644725	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
a34aec95-775f-4acf-9d30-53b16c918e20	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
0bee4d3a-1379-4662-8934-f0e151a1f6f4	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
c26ae68f-8ac3-4a0a-a0d7-322575220280	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
c58764c9-873f-428c-ad82-29731174d143	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
52f5fdc0-3d20-4a30-8337-245a7906aa7d	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
b0678766-eda8-4232-80db-719ee165f1ab	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
c94a555b-7ce6-4e8e-a035-0b8e150c335b	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
77c826d9-860a-4ffb-94c2-900c5979e60e	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
960554b6-4e45-49c2-b3ed-ba49cef0495a	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
1c19719a-2950-4cb0-95ec-48ca660ce897	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
a5a1e1b3-6f98-4092-af08-0fc1e7676909	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
cf7efac9-da83-46e8-bca1-4261136da64f	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
fa079dd0-dffa-4cd7-82f6-4563844ca893	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
82f57cbf-83c7-4262-a0f4-4163874bb7c9	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
f98939d3-9078-49b1-be7f-05d272efb230	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
d4db4df5-7b08-4df8-8875-9c81732d1f96	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
c1ed771a-e271-426d-85d1-7eb549904a8e	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
2f68f713-f89a-4ba9-a407-3f6e587ededb	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
b999d881-15bb-42fb-a16a-62197a0dccd4	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
9758dd51-d35c-45d1-905f-acdb17292d9e	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
a2676579-27f9-4771-90cc-0a550284502f	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
0c161026-ab1e-45f0-8b28-ed1fa84f26cd	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
89784620-631d-4615-aabd-ec85e26b61c2	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
70923e92-670f-42f6-a47f-3bf4f4c85425	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
ec2a0493-ed8f-4357-b077-f0c3b70cdf40	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
4c386882-d5be-4780-ba79-9396865b92d9	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
88dc95f1-bd76-410d-91db-a5a3b9124975	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
30c52579-2048-4d00-b1e5-955d2436386c	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
8ade8c92-ffa3-4126-9463-f945be259718	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
7ff7703f-e9bb-4a79-af8e-f2ee3be7d530	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
58bd1bf3-df9a-46f7-bc47-9bb3daf9b603	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
0c931304-9451-4e4f-b784-1979772b239b	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
062d39fb-b105-4151-ba0a-c734c2feebd0	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
229e8ef1-2ae7-4b8b-b2cf-03b7580962fb	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
d7608138-1bfd-4c3b-837e-1bc1e6198678	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
38fa0944-0f83-4039-af56-7663e215f9db	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
7da42408-4383-4450-b75b-e1a902cd9198	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
7a2ca9e6-c8f9-48c5-847d-2bc4edeee4d0	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
6121a9d2-4c88-491c-99fb-08afd85b9210	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
5889749c-2b89-4d94-bd3f-cfb988ff9725	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
508ebed4-44cd-4ce1-9ac9-19c9835df0e3	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
050396ff-a166-43ea-af3a-d87013ccab7f	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
0450c32a-17de-48fd-b5da-7dbf49da1683	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
4692c087-d170-4cf4-81f6-3de91d9b66a9	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
daf4bcc1-321f-43e9-9027-4f5c0cc85e58	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
a0caa5c4-f27c-4130-b9c3-9fe505577fb3	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
701a1dcd-a3d7-4794-b9f6-cfb379f7bba7	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
78257e11-5697-4f25-9e33-22d643c058fd	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
92b1e7e2-d80f-45c6-82f4-35e3edfa345a	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
29eebfaa-db31-44b5-8d5e-38e5e70b2773	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
86b7ae18-1a5e-42ea-af70-06b3e2f52dbb	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
e430974d-cf7f-4002-af49-206cfb6e9a33	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
7fb7537c-d176-4193-97d6-a02181150732	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
2d08436e-13c1-42a5-8141-e9fc1ce3977c	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
dd5cd6f6-ff8c-4388-bd9a-cfbad6de25e6	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
d6081ae2-5945-4c1e-bfe2-b523c3bb9285	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
206d0f37-cf5e-426b-b2d5-c4eb64270af4	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
d9c69096-cb9a-4659-bcf2-d77386e926f0	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
589ef6b4-9221-4f84-a9c7-a501ab74fe94	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
fb90e8f7-8e77-4578-8aff-365b31e9aa14	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
4746f4e0-dba5-4709-b184-01dd81f8ce76	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
dadcdf93-6389-4b02-aa21-395765100eb6	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
340beb3c-09c9-4165-8e48-cbabb790c218	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
00cce789-c94a-4d7a-b902-b3b559b96221	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
7d287a6a-6e67-406d-a8a4-c39ee5abfc8c	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
c75c9ee0-0542-4b29-9d28-228b9641a77e	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
6ab29946-2b34-4591-a28d-309a53965cf2	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
8ea74c5d-e7e5-4c41-a70d-3516728ae3e5	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
8a872ed0-d70d-40e5-8bc4-6325d64efedf	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
16967956-6195-4ea4-8427-52389d8f0a02	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
79aedf0c-beee-4966-82a0-9cdf232b34d2	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
d1bbc32c-63bd-4144-99b9-794f9302c851	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
447bb373-1d1a-486a-85e4-77d22fcf76f7	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
16b566b9-cfbe-4957-92e7-2b1abf9fc251	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
9294319d-46a2-42cc-a7c4-aa67b4413d62	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
8f30fce8-0f4f-4088-9b56-46a6d50878ef	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
35f776d1-55da-4bb5-95fe-76814b898980	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
3146ee4a-8028-4223-8ee4-8c31f1b89a47	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
2de1e070-a8ab-4848-8753-97103be25a4a	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
e882c565-48d2-425b-874e-6f4b7062d156	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
7187b603-dde1-404a-b7aa-2fcfe9279d25	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
7469ffeb-d3e4-4bbc-ae92-42dfe2f65a5c	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
a3fee07a-837f-47c3-b51f-e0dc998ee761	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
dfdad4c3-98f3-4a2f-8b83-feb612f9d698	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
026aeaee-3886-4ca7-bd42-adb69c4dcf88	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
c75126c3-5c9a-44d7-bf38-799fbc60f6c0	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
7b2b66c0-ce89-407f-93bc-e2b1c28187b0	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
25165b46-4d4a-4b60-8aa7-11d65d4b0b1c	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
fc529176-1092-4912-a248-9dfd4e46f543	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
5f2397c2-a60a-43b5-bc2d-0dbf2224f31e	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
6232fc09-1a6d-4567-a9e2-1a40320dec97	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
67ccaa1b-c79d-4da7-a937-aeebb695197e	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
212a03cd-6439-4847-9825-6c26cd264402	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
7bda3396-5546-428b-b550-2be19e61f02e	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
56563198-8357-4534-ab1d-f8734ea5482c	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
ae54bd88-6e62-4ff8-b7b1-4cf64083114d	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
508d3d5d-67c0-4ca4-96c9-1a3b7483aec3	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
f1e2e99d-f1b5-433a-bb1b-6d3ccacc9e9f	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
d8893906-52fd-4fd3-8a86-0a306aa9bb6d	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
c04ad6bc-da5e-475d-a17b-775b7922fc85	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
cbe77914-89c3-4da1-a502-ee24b5c40552	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
a7a68c5a-ba51-4601-ad54-d8953b2ac03b	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
f08add49-b480-46d4-9147-8029804238fe	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
4bbcc292-15dd-40c8-b8e1-f4da9859e232	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
7928e3f6-2fd7-44e7-a75a-05f5ae0184c4	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
c1e32556-ed91-4b87-92de-6ebeb97a5954	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
6083c320-18c6-4eb8-b865-c9570e321761	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
a2f434d3-383b-46e7-9162-f727890716e3	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
ee815e9f-bd7f-4b66-a445-6c68e5f69c07	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
30fb87e9-61a0-4cb0-9efb-0c3ce40b6104	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
8e10ee08-86a5-485a-9262-58ff35a54fae	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
66706916-0a1a-4864-842a-e8c5391e9833	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
e84b4419-0154-4ba7-b904-ba15401694ff	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
418eff25-67e1-4c9a-a06c-a712fcc18dd7	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
8afb2012-6421-4ba4-be28-68f2b449c544	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
a96d6cab-67dc-4179-8a49-7bb79f239a2f	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
9e214396-7060-4258-a3ea-c73cfd2e5cbf	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
320f0cdb-71ed-488b-96bb-3f87700dfc73	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
abd5c148-d97c-4244-acdf-95e7cf92ed99	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
d32b1825-75d6-444f-84ea-f855f1686006	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
67c95ba0-a344-456e-9fc4-afda775bf2b4	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
5949e018-3869-4bd4-a2f4-3856e8065e95	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
560baa98-ab6a-4b02-977c-d43c311dc74f	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
f800de52-f824-4d47-adc1-af5f59850718	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
b4d86f70-82cd-4053-92f4-16efd5f1e6a7	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
7ace12da-6a3f-44eb-a654-cca95bd15fec	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
3f8df0e2-0f57-452f-9cde-60d97127b9e5	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
1af68d72-ffff-4b22-9787-020bf14a8a22	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
3a28697b-13db-4fcf-b7af-d1a92a74f215	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
4d9da7c4-6b9a-45f2-82c6-8496ead3892f	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
eeca9c82-7fcc-43d4-83f8-5503573ebebd	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
114998a2-d21a-445e-bd4d-05493e3a4590	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
0edffcf3-0623-4e71-9702-5e728f566d7f	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
679e94d1-0e8d-4842-beec-ab0329ea0e99	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
0ad9739d-fd32-415b-8acc-2c156d88a1d8	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
5b10a206-fcdd-445c-b916-95ab72d1549b	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
2d03e2c4-b0eb-4193-a161-6c88f0521d14	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
850eef0b-ff54-47e4-90d5-14a867833327	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
1dba2988-dc5c-49e2-b610-5e71a7b801da	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
fc7beb60-80cb-4b79-b5fa-2d3d12a65b8e	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
0ecc2e97-e108-43ff-bc55-c742c3e1f8d4	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
f40df012-0e7b-49d9-85bb-a49365c1984c	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
4e889507-748c-42a5-b7ab-bfb8d464b1da	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
33041e4b-f11a-4334-b4cd-0530433ae3ce	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
3fddc882-3807-4549-b6e3-82624ae80c58	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
2ca13efe-bcfc-4f76-b25d-ebd544a5c652	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
61d74fbe-fa29-4c37-bf8b-fc3908f6f2a4	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
62184b85-92d0-4605-b538-fbbba60f4686	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
82357b55-c762-4d51-800d-20ac2eb6f137	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
a18db352-b86b-4daf-b0b9-65d7c71a7684	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
a084f27d-50cb-4be5-bdb9-32b39ad36725	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
a5443406-8818-405e-8ff2-3e7692560d93	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
2c6a8996-3fc3-4b82-a28a-e0d09eb7e7e6	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
06eae867-7451-4928-b39c-efaf1d89cb97	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
5a29b8bd-5abd-457f-a88a-ea17da54bb5a	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
b3d25e2e-166b-4e16-963f-c7eb5dbd1a25	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
a0e1619d-9000-42ab-aaad-2fd52513ad5c	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
f15cb2a9-6ca4-4a40-a5a3-515986a9b573	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
52908c20-159f-4544-a5c6-476dcdcc3da2	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
649857de-a8a7-4d0a-8d2a-dd4f604c1178	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
89327c1d-ad23-4064-89f6-1529bcec86c5	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
3c942acf-3b20-4274-b93e-2d6981184843	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
ae5c9f8d-7079-40e6-a84f-b24c2512195b	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
fd5795fa-6777-4c76-b7a9-610efa0185cc	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
4a26a14d-2415-41ff-97fa-fca1a858a5a2	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
4ca4a4ed-30d7-4ed1-b9e8-4c080082ef2a	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
9b6410bd-9cea-4b0d-a95b-3174233a9ea0	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
c088677c-7f6b-4123-82f4-f9ceaf0f6fcb	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
f5ccd2fe-8571-4670-b418-64a0e36d976c	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
4bb98e15-1b98-42b8-bca4-bcd845dcb680	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-08-01 00:03:44.204299
de38fecd-032e-4f61-9002-30247874fe55	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-09-02 18:57:44.439196
dbe79c7f-6cf5-41df-8a05-0c84c4b46fa2	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-09-02 18:57:44.532521
857e6bf6-96ad-4b62-a176-8222ef36cfb9	21b16854-f420-4fdc-8ca6-f4d7ad10943c	2026-09-02 18:57:44.6159
\.


--
-- Data for Name: rbac_user_group_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rbac_user_group_roles ("groupId", "roleId", "assignedAt") FROM stdin;
6deb3801-5483-4502-80fc-e878eaa87097	f5f7ff23-c968-4b30-9ce6-c34bbb9f9959	2026-08-01 00:03:44.204299
629eb656-50d7-411c-b82d-e4d7aacaa676	7f3e826d-d0a0-49d3-abd7-e7b6af734f42	2026-08-01 00:03:44.204299
ecab4080-b0c3-4982-bd83-82c0935d13ef	b5ec43a5-4cdb-444f-a2d0-7d0f5aa80c06	2026-08-01 00:03:44.204299
32f85004-2a45-4142-ab3b-790390a240e2	942fc58a-cedc-4a50-b91a-935ded5c7b4b	2026-08-01 00:03:44.204299
8789fa4c-ef44-49f1-8fa3-1de925cf849e	d576897b-17e0-4362-b911-27121ac8fc38	2026-08-01 00:03:44.204299
736d0976-81b9-4fbb-a539-3f8028ddaaed	b06f4cb8-bdd4-4be0-9b20-4cf59074d54b	2026-08-01 00:03:44.204299
20e0ed67-ffd5-4cde-a297-23f7b8d03fb7	3b094696-6dda-49dc-b82c-f9dbde5c2aca	2026-08-01 00:03:44.204299
21b16854-f420-4fdc-8ca6-f4d7ad10943c	411854c4-8cf7-4171-88d3-5cb609fa34ae	2026-08-01 00:03:44.204299
4cd009fa-be79-4a3f-a63a-f419da20e241	969f75f9-10b5-4770-8ade-e851c86f2c90	2026-08-01 00:22:03.182239
45619fce-6554-4102-80c8-4b629e1d66b1	862145dd-d370-415a-adf7-a1d49e6925f7	2026-08-01 00:22:03.182239
\.


--
-- Data for Name: rbac_user_permission_overrides; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rbac_user_permission_overrides (id, "userId", "pageId", "actionId", effect, "createdAt") FROM stdin;
\.


--
-- Data for Name: reminders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reminders (id, user_id, title, description, due_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rooms (id, name, capacity, room_type, description, equipment, is_active, school_id, created_at, updated_at) FROM stdin;
1	Sunshine Room	15	classroom	Bright and cheerful room for toddlers	\N	t	1	2025-10-27 22:32:00.563852	2025-10-27 22:32:00.563852
2	Rainbow Room	18	classroom	Colorful learning space for preschoolers	\N	t	1	2025-10-27 22:32:00.57347	2025-10-27 22:32:00.57347
3	Garden Room	20	classroom	Nature-themed room for kindergarten students	\N	t	1	2025-10-27 22:32:00.575809	2025-10-27 22:32:00.575809
4	Star Room	16	classroom	Space-themed room for advanced learners	\N	t	1	2025-10-27 22:32:00.578083	2025-10-27 22:32:00.578083
5	Art Studio	12	activity	Creative space for art and crafts	\N	t	1	2025-10-27 22:32:00.581035	2025-10-27 22:32:00.581035
6	Music Room	25	activity	Musical activities and performances	\N	t	1	2025-10-27 22:32:00.583186	2025-10-27 22:32:00.583186
\.


--
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, teacher_id, room_id, created_at, updated_at) FROM stdin;
f56d5330-ba08-4afa-a5af-b8d28cfc14d4	sunday	08:00:00	08:45:00	45	,klhkjh	t	\N	active	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	7d9cc680-1a3d-4090-9f54-66bb2155981d	6851375a-78ad-4b8d-a75d-f440e25cd8ab	\N	2026-04-19 21:07:29.595484	2026-04-19 21:07:29.595484
40a7eae0-7b7e-45f2-8fb7-ac82ad829de1	sunday	08:45:00	09:30:00	45		t	\N	active	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	cc1a9c19-1909-4c0e-a869-d85cd685840a	0f851929-30b0-4b1c-8f64-779bd03dae03	\N	2026-04-19 23:05:31.00908	2026-04-19 23:05:31.00908
7b62d443-27d3-4277-a270-199fcd68948a	sunday	08:00:00	08:45:00	45	eqrhqerh	t	\N	active	efe57fcd-e10d-489f-a79a-3d6b50535bdc	cc1a9c19-1909-4c0e-a869-d85cd685840a	73036766-e77b-478c-a6d4-db63e401baaf	\N	2026-05-01 14:01:30.407697	2026-05-01 14:01:30.407697
9ebf08d1-afb8-4d7a-969e-0332e6d71151	monday	08:00:00	08:45:00	45	qergqerg	t	\N	active	efe57fcd-e10d-489f-a79a-3d6b50535bdc	cc1a9c19-1909-4c0e-a869-d85cd685840a	73036766-e77b-478c-a6d4-db63e401baaf	\N	2026-05-01 14:02:41.059808	2026-05-01 14:02:41.059808
736c1e5e-3659-40b0-82a0-70dd41814af7	sunday	09:30:00	10:15:00	45		t	\N	active	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	cc1a9c19-1909-4c0e-a869-d85cd685840a	0f851929-30b0-4b1c-8f64-779bd03dae03	\N	2026-05-10 22:20:49.768801	2026-05-10 22:20:49.768801
48989c93-c617-434d-9661-7ccf7e5d6539	sunday	11:00:00	11:45:00	45	wrthwtrh	t	\N	active	b892f8b1-43f5-4cc0-9082-56a932ce7c4a	20b474fc-ab14-413c-9fd5-1459d3342146	0f851929-30b0-4b1c-8f64-779bd03dae03	\N	2026-05-12 23:48:00.963319	2026-05-12 23:48:00.963319
\.


--
-- Data for Name: school_landing_pages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.school_landing_pages (id, school_id, logo_url, hero_image_url, brand_name_en, brand_name_ar, badge_en, badge_ar, hero_title_en, hero_title_ar, hero_subtitle_en, hero_subtitle_ar, cta_primary_en, cta_primary_ar, cta_secondary_en, cta_secondary_ar, features, testimonials, phone, email, address_en, address_ar, is_published, created_at, updated_at) FROM stdin;
1	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	[]	\N	\N	\N	\N	t	2026-07-31 13:54:59.977403+04	2026-07-31 13:54:59.977403+04
\.


--
-- Data for Name: school_message_letters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.school_message_letters (id, school_id, title, audience, subject_en, subject_ar, body_html_en, body_html_ar, body_sms_en, body_sms_ar, created_at, updated_at, activity_id) FROM stdin;
ffb076e7-9a98-46f9-8bc7-db1b3f0ecb89	1	رسالة بلا عنوان	{"groupIds": ["b892f8b1-43f5-4cc0-9082-56a932ce7c4a", "ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf", "fc4ec62f-e19a-4443-8e44-18173552ac07"]}	Message from {{schoolName}}	رسالة من {{schoolName}}	<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="utf-8" /></head>\n<body style="margin:0;padding:24px;font-family:system-ui,sans-serif;color:#111827;">\n<p>Dear {{parentName}},</p>\n<p>This message concerns <strong>{{studentName}}</strong>.</p>\n<p>Teacher: {{teacherName}}</p>\n<p>Regards,<br/>{{schoolName}}</p>\n</body></html>	<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head><meta charset="utf-8" /></head>\n<body style="margin:0;padding:24px;font-family:system-ui,sans-serif;color:#111827;">\n<p>عزيزي/تي {{parentName}}،</p>\n<p>نود إفادتكم بخصوص الطالب/ة <strong>{{studentName}}</strong>.</p>\n<p>المعلم: {{teacherName}}</p>\n<p>مع التحية،<br/>{{schoolName}}</p>\n</body></html>	{{schoolName}}: Hello {{parentName}}, regarding {{studentName}} ({{teacherName}}).	{{schoolName}}: تحية لـ {{parentName}} بخصوص {{studentName}} ({{teacherName}}).	2026-05-14 00:13:59.049623+04	2026-05-14 00:13:59.049623+04	\N
e472faf4-2a68-41b0-ae27-9d01df3f7f18	1	رسالة بلا عنوان	{}	Message from {{schoolName}}	رسالة من {{schoolName}}	<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="utf-8" /></head>\n<body style="margin:0;padding:24px;font-family:system-ui,sans-serif;color:#111827;"><p>Dear {{parentName}},</p><p>This message concerns <strong>{{studentName}}</strong>.</p><p>Teacher: {{teacherName}}</p><p>Regards,<br>{{schoolName}}</p></body></html>	<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head><meta charset="utf-8" /></head>\n<body style="margin:0;padding:24px;font-family:system-ui,sans-serif;color:#111827;"><p>عزيزي/تي {{parentName}}،</p><p>نود إفادتكم بخصوص الطالب/ة <strong>{{studentName}}</strong>.</p><p>المعلم: {{teacherName}}</p><p>مع التحية،<br>{{schoolName}}</p></body></html>	{{schoolName}}: Hello {{parentName}}, regarding {{studentName}} ({{teacherName}}).	{{schoolName}}: تحية لـ {{parentName}} بخصوص {{studentName}} ({{teacherName}}).	2026-05-14 00:19:50.842325+04	2026-05-14 00:19:50.842325+04	\N
808cfe3f-115d-4e8a-83ac-dc83ac9a7b1f	1	rtjhwertjyw	{"groupIds": ["b892f8b1-43f5-4cc0-9082-56a932ce7c4a"]}	Parent approval: rtjhwertjyw	موافقة ولي الأمر: rtjhwertjyw	<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>Approval</title>\n</head>\n<body style="margin:0;padding:24px;background:#f3f4f6;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;"><div class="nt-email-card" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">\n    <div style="padding:24px 28px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;">\n      <div style="font-size:18px;font-weight:700;">{{schoolName}}</div>\n      <div style="font-size:13px;opacity:.95;margin-top:4px;">School message</div>\n    </div>\n    <div class="nt-email-body" style="padding:24px 28px;">\n      <p style="margin:0 0 12px;">Dear {{parentName}},</p>\n<p style="margin:0 0 14px;line-height:1.55;">Please confirm participation in this activity.</p>\n<p style="margin:0 0 6px;"><strong>Starts:</strong> {{activityStartDate}}</p>\n<p style="margin:0 0 6px;"><strong>Ends:</strong> {{activityEndDate}}</p>\n    </div>\n  </div></body>\n</html>	<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>\n  <meta charset="utf-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>موافقة</title>\n</head>\n<body style="margin:0;padding:24px;background:#f3f4f6;font-family:system-ui,Tahoma,Segoe UI,sans-serif;color:#111827;"><div class="nt-email-card" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">\n    <div style="padding:24px 28px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;">\n      <div style="font-size:18px;font-weight:700;">{{schoolName}}</div>\n      <div style="font-size:13px;opacity:.95;margin-top:4px;">رسالة من المدرسة</div>\n    </div>\n    <div class="nt-email-body" style="padding:24px 28px;"><p>عزيزي/تي {{parentName}}،</p><p>يرجى تأكيد المشاركة في هذا النشاط.</p><p><strong>البداية:</strong> {{activityStartDate}}</p><p><strong>النهاية:</strong> {{activityEndDate}}</p></div>\n  </div></body>\n</html>	Hi {{parentName}}, please confirm participation. {{activityStartDate}} – {{activityEndDate}}	مرحبًا {{parentName}}، يرجى تأكيد المشاركة. {{activityStartDate}} – {{activityEndDate}}	2026-05-16 09:58:03.036726+04	2026-05-16 09:58:03.036726+04	6c4784ed-b30d-49b9-937e-80e032e31ee4
9a701c96-a591-4974-bbe8-e7a60b32a6ab	1	ergqerg	{"groupIds": ["ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf"]}	Parent approval: ergqerg	موافقة ولي الأمر: ergqerg	<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>Approval</title>\n</head>\n<body style="margin:0;padding:24px;background:#f3f4f6;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;"><div class="nt-email-card" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">\n    <div style="padding:24px 28px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;">\n      <div style="font-size:18px;font-weight:700;">{{schoolName}}</div>\n      <div style="font-size:13px;opacity:.95;margin-top:4px;">School message</div>\n    </div>\n    <div class="nt-email-body" style="padding:24px 28px;">\n      <p style="margin:0 0 12px;">Dear {{parentName}},</p>\n<p style="margin:0 0 14px;line-height:1.55;">Please confirm participation in this activity.</p>\n<p style="margin:0 0 6px;"><strong>Starts:</strong> {{activityStartDate}}</p>\n<p style="margin:0 0 6px;"><strong>Ends:</strong> {{activityEndDate}}</p>\n    </div>\n  </div></body>\n</html>	<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>\n  <meta charset="utf-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>موافقة</title>\n</head>\n<body style="margin:0;padding:24px;background:#f3f4f6;font-family:system-ui,Tahoma,Segoe UI,sans-serif;color:#111827;"><div class="nt-email-card" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">\n    <div style="padding:24px 28px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;">\n      <div style="font-size:18px;font-weight:700;">{{schoolName}}</div>\n      <div style="font-size:13px;opacity:.95;margin-top:4px;">رسالة من المدرسة</div>\n    </div>\n    <div class="nt-email-body" style="padding:24px 28px;"><p>عزيزي/تي {{parentName}}،</p><p>يرجى تأكيد المشاركة في هذا النشاط.</p><p><strong>البداية:</strong> {{activityStartDate}}</p><p><strong>النهاية:</strong> {{activityEndDate}}</p></div>\n  </div></body>\n</html>	Hi {{parentName}}, please confirm participation. {{activityStartDate}} – {{activityEndDate}}	مرحبًا {{parentName}}، يرجى تأكيد المشاركة. {{activityStartDate}} – {{activityEndDate}}	2026-05-16 10:01:42.924111+04	2026-05-16 10:01:42.924111+04	a9bb5cc5-5cf0-4f95-8490-bdf23ea84399
94a2bf08-c7d8-472c-9264-032e267f3d32	1	aethwrth	{"allParents": true}	Parent approval: aethwrth	موافقة ولي الأمر: aethwrth	<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>Approval</title>\n</head>\n<body style="margin:0;padding:24px;background:#f3f4f6;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;"><div class="nt-email-card" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">\n    <div style="padding:24px 28px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;">\n      <div style="font-size:18px;font-weight:700;">{{schoolName}}</div>\n      <div style="font-size:13px;opacity:.95;margin-top:4px;">School message</div>\n    </div>\n    <div class="nt-email-body" style="padding:24px 28px;">\n      <p style="margin:0 0 12px;">Dear {{parentName}},</p>\n<p style="margin:0 0 14px;line-height:1.55;">Please confirm participation in this activity.</p>\n<p style="margin:0 0 6px;"><strong>Starts:</strong> {{activityStartDate}}</p>\n<p style="margin:0 0 6px;"><strong>Ends:</strong> {{activityEndDate}}</p>\n    </div>\n  </div></body>\n</html>	<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>\n  <meta charset="utf-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>موافقة</title>\n</head>\n<body style="margin:0;padding:24px;background:#f3f4f6;font-family:system-ui,Tahoma,Segoe UI,sans-serif;color:#111827;"><div class="nt-email-card" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">\n    <div style="padding:24px 28px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;">\n      <div style="font-size:18px;font-weight:700;">{{schoolName}}</div>\n      <div style="font-size:13px;opacity:.95;margin-top:4px;">رسالة من المدرسة</div>\n    </div>\n    <div class="nt-email-body" style="padding:24px 28px;"><p>عزيزي/تي {{parentName}}،</p><p>يرجى تأكيد المشاركة في هذا النشاط.</p><p><strong>البداية:</strong> {{activityStartDate}}</p><p><strong>النهاية:</strong> {{activityEndDate}}</p></div>\n  </div></body>\n</html>	Hi {{parentName}}, please confirm participation. {{activityStartDate}} – {{activityEndDate}}	مرحبًا {{parentName}}، يرجى تأكيد المشاركة. {{activityStartDate}} – {{activityEndDate}}	2026-05-16 19:29:13.475826+04	2026-05-16 19:29:13.475826+04	8554812d-3e45-42d0-b63a-497183909f90
f4a96c0d-14b3-4183-b20a-1e65579ef4e1	1	رسالة بلا عنوان	{"userIds": ["7ace12da-6a3f-44eb-a654-cca95bd15fec", "3f8df0e2-0f57-452f-9cde-60d97127b9e5", "a0e1619d-9000-42ab-aaad-2fd52513ad5c"]}	Message from {{schoolName}}	رسالة من {{schoolName}}	<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>Message</title>\n</head>\n<body style="margin:0;padding:24px;background:#f3f4f6;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;"><div class="nt-email-card" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">\n    <div style="padding:24px 28px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;">\n      <div style="font-size:18px;font-weight:700;">{{schoolName}}</div>\n      <div style="font-size:13px;opacity:.95;margin-top:4px;">School message</div>\n    </div>\n    <div class="nt-email-body" style="padding:24px 28px;">\n      <p style="margin:0 0 12px;">Dear {{parentName}},</p>\n<p style="margin:0 0 16px;line-height:1.55;">This message concerns <strong>{{studentName}}</strong>.</p>\n<p style="margin:0 0 8px;"><strong>Teacher:</strong> {{teacherName}}</p>\n<p style="margin:20px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">Regards,<br>{{schoolName}}</p>\n    </div>\n  </div></body>\n</html>	<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>\n  <meta charset="utf-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>رسالة</title>\n</head>\n<body style="margin:0;padding:24px;background:#f3f4f6;font-family:system-ui,Tahoma,Segoe UI,sans-serif;color:#111827;"><div class="nt-email-card" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">\n    <div style="padding:24px 28px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;">\n      <div style="font-size:18px;font-weight:700;">{{schoolName}}</div>\n      <div style="font-size:13px;opacity:.95;margin-top:4px;">رسالة من المدرسة</div>\n    </div>\n    <div class="nt-email-body" style="padding:24px 28px;"><p>عزيزي/تي {{parentName}}،</p><p>نود إفادتكم بخصوص الطالب/ة <strong>{{studentName}}</strong>.</p><p></p><p style="color: rgb(107, 114, 128);">مع التحية،<br>{{schoolName}}</p></div>\n  </div></body>\n</html>	{{schoolName}}: Hello {{parentName}}, regarding {{studentName}} ({{teacherName}}).	{{schoolName}}: تحية لـ {{parentName}} بخصوص {{studentName}} ({{teacherName}}).	2026-05-16 23:05:04.962968+04	2026-05-16 23:20:52.359902+04	\N
\.


--
-- Data for Name: school_modules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.school_modules (id, school_id, module_id, source, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: school_notification_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.school_notification_templates (id, school_id, template_key, subject_override, body_html_override, body_sms_override, created_at, updated_at, subject_override_ar, body_html_override_ar, body_sms_override_ar) FROM stdin;
\.


--
-- Data for Name: school_payment_levels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.school_payment_levels (id, school_id, code, name, sort_order, is_active, created_at, updated_at) FROM stdin;
a37141f3-3407-4750-b747-d05758a2d650	1	NURSERY	Nursery	1	t	2026-05-13 20:26:23.254997+04	2026-05-13 20:26:23.254997+04
803353d9-dec3-40fd-a22a-d08bce9a42e1	1	KG1	KG1	2	t	2026-05-13 20:26:23.305927+04	2026-05-13 20:26:23.305927+04
1f8021d0-aa99-4a08-b3dc-ad11404b4d6a	1	KG2	KG2	3	t	2026-05-13 20:26:23.309248+04	2026-05-13 20:26:23.309248+04
6adb1942-c18b-4fce-8d81-348fa53348ce	1	PRESCHOOL	Preschool	4	t	2026-05-13 20:26:23.311794+04	2026-05-13 20:26:23.311794+04
\.


--
-- Data for Name: school_platform_subscription_addons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.school_platform_subscription_addons (id, subscription_id, addon_id) FROM stdin;
\.


--
-- Data for Name: school_platform_subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.school_platform_subscriptions (id, school_id, plan_id, billing_period, status, period_start, period_end, included_student_seats_override, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: school_system_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.school_system_settings (id, school_id, setting_key, value_json, type, category, title, description, is_public, created_at, updated_at) FROM stdin;
fcf69eb6-3293-482b-9617-680005034d0c	1	attendance.allowAllUsersToTakeAttendance	true	boolean	attendance	Allow All Users to Take Attendance	When enabled, all users can take attendance for any group. When disabled, only supervisors can take attendance for their assigned groups.	f	2026-05-13 20:45:57.706891+04	2026-05-13 20:45:57.706891+04
287b2fa2-0c1d-4afb-a96a-d0af7da077b3	1	attendance.requireSupervisorApproval	false	boolean	attendance	Require Supervisor Approval	Require supervisor approval before attendance is finalized	f	2026-05-13 20:45:57.720507+04	2026-05-13 20:45:57.720507+04
00a3d585-6bec-4366-b414-94c0b24e12f3	1	attendance.allowRetroactiveAttendance	true	boolean	attendance	Allow Retroactive Attendance	Allow users to mark attendance for past dates	f	2026-05-13 20:45:57.723907+04	2026-05-13 20:45:57.723907+04
edaf959a-6e7b-4da3-9406-8cc3ae7d53bf	1	attendance.maxRetroactiveDays	7	number	attendance	Max Retroactive Days	Maximum number of days in the past that attendance can be marked	f	2026-05-13 20:45:57.725768+04	2026-05-13 20:45:57.725768+04
c812627e-3281-40c9-8ee3-d07d6f22530c	1	userPermissions.teacherCanViewAllGroups	true	boolean	userPermissions	Teachers Can View All Groups	Allow teachers to view and manage all groups, not just their assigned ones	f	2026-05-13 20:45:57.727606+04	2026-05-13 20:45:57.727606+04
46d8a216-39c9-47f8-bb2d-f4b8c5bb8042	1	userPermissions.parentCanViewOtherStudents	false	boolean	userPermissions	Parents Can View Other Students	Allow parents to see information about other students in the same group	f	2026-05-13 20:45:57.729201+04	2026-05-13 20:45:57.729201+04
ae4dc5f5-293a-4ea9-9e69-b142883f0dc3	1	userPermissions.adminRequiresTwoFactorAuth	false	boolean	userPermissions	Admin Requires Two-Factor Auth	Require administrators to use two-factor authentication	f	2026-05-13 20:45:57.730363+04	2026-05-13 20:45:57.730363+04
877d6c61-21ad-4278-b1d1-9db09c3010ff	1	schoolInfo.name	"زهرة الحياة للأطفال"	string	schoolInfo	School Name		t	2026-05-13 20:45:57.731432+04	2026-05-13 20:45:57.731432+04
a2eb467d-c596-492b-b55c-e2cf87269522	1	schoolInfo.address	"مسقط، سلطنة عمان"	string	schoolInfo	School Address		t	2026-05-13 20:45:57.733903+04	2026-05-13 20:45:57.733903+04
44c73570-7678-4533-9be3-c50b49bd5150	1	schoolInfo.phone	"+968 1234 5678"	string	schoolInfo	Phone Number		t	2026-05-13 20:45:57.735626+04	2026-05-13 20:45:57.735626+04
61680d86-5a16-4a3b-af59-b17f5aff8a95	1	schoolInfo.email	"info@zahratalhayat.om"	string	schoolInfo	Email Address		t	2026-05-13 20:45:57.73747+04	2026-05-13 20:45:57.73747+04
9008297e-4779-441e-950f-58ee39f471d5	1	schoolInfo.website	"www.zahratalhayat.om"	string	schoolInfo	Website		t	2026-05-13 20:45:57.740196+04	2026-05-13 20:45:57.740196+04
8041e24a-295e-4d82-bca9-1489ca8c5f3c	1	academic.currentAcademicYear	"2024-2025"	string	academic	Current Academic Year		f	2026-05-13 20:45:57.742246+04	2026-05-13 20:45:57.742246+04
fc9630ce-72ec-42b6-9090-48ef403d0584	1	academic.termStartDate	"2024-09-01"	string	academic	Term Start Date		f	2026-05-13 20:45:57.743928+04	2026-05-13 20:45:57.743928+04
db4f1985-a44e-48e6-bfd3-8116d01d21a7	1	academic.termEndDate	"2025-06-30"	string	academic	Term End Date		f	2026-05-13 20:45:57.745724+04	2026-05-13 20:45:57.745724+04
\.


--
-- Data for Name: schools; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.schools (id, name, address, phone, email, website, logo_url, established_date, description, created_at, updated_at, cr_document_url, owner_id_document_url, owner_legal_name, payment_allow_admin_adjust_student_total, status, landing_slug) FROM stdin;
1	Zinat Al-Haya Kindergarten	\N	\N	\N	\N	\N	\N	Bilingual kindergarten school management system	2025-10-19 21:08:56.586817	2026-05-13 19:22:23.457901	\N	\N	\N	t	active	zinat-al-haya
\.


--
-- Data for Name: semesters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.semesters (id, title, start_date, end_date, academic_year_id, description, is_active, created_at, updated_at) FROM stdin;
65cd33c6-e288-4858-b9ad-9858c8ca02f2	First Semester	2025-09-01	2026-01-15	3ba07103-ccb1-4cc6-924b-a41847115a8d	Fall semester focusing on foundational skills	t	2025-10-27 22:32:01.38361	2025-10-27 22:32:01.38361
a4b1719a-f0e5-43b6-89c5-544c0bdac1f6	Second Semester	2026-01-16	2026-06-30	3ba07103-ccb1-4cc6-924b-a41847115a8d	Spring semester with advanced learning activities	f	2025-10-27 22:32:01.387334	2025-10-27 22:32:01.387334
27f7ebbe-274e-4031-ac26-41fdb1e851bf	First Semester	2024-09-01	2025-01-31	fb7888ee-191e-4f30-88dd-a6feca27065a	\N	t	2025-11-01 12:46:08.271294	2025-11-01 12:46:08.271294
54734245-6bf5-4739-abd8-c741642b27b2	Second Semester	2025-02-01	2025-06-30	fb7888ee-191e-4f30-88dd-a6feca27065a	\N	t	2025-11-01 12:46:08.29811	2025-11-01 12:46:08.29811
\.


--
-- Data for Name: session_media; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session_media (id, session_plan_id, file_name, file_path, file_type, file_size, mime_type, uploaded_by, uploaded_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff (id, user_id, school_id, created_at, updated_at) FROM stdin;
1	0f851929-30b0-4b1c-8f64-779bd03dae03	1	2025-11-14 10:00:47.462743	2025-11-14 10:00:47.462743
\.


--
-- Data for Name: student_buses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_buses (student_id, bus_id) FROM stdin;
06c6d5e1-51d3-47fe-80b9-7fec6903a58b	c89802b4-8e18-4ff3-8720-49aa1b48b1b2
077b0c2f-701f-47e0-b998-03c374b3a520	c89802b4-8e18-4ff3-8720-49aa1b48b1b2
10d89a77-fb38-4ccc-9948-77d8e1b62256	c89802b4-8e18-4ff3-8720-49aa1b48b1b2
122397f2-90ca-4e29-9842-82da66fbfcb9	c89802b4-8e18-4ff3-8720-49aa1b48b1b2
00d19686-927d-410b-b746-23defff4953c	e9a2f7be-4b0c-4ba4-8a89-568d146ace83
1163e767-bf73-4502-b509-4c08e03f546a	c89802b4-8e18-4ff3-8720-49aa1b48b1b2
14799b1a-9596-4204-9d75-29dc977fa4de	e9a2f7be-4b0c-4ba4-8a89-568d146ace83
142ce12d-9d92-4aea-842a-56b4bbea309a	e9a2f7be-4b0c-4ba4-8a89-568d146ace83
1a25f905-bddc-4111-8a8e-7c315368d66f	e9a2f7be-4b0c-4ba4-8a89-568d146ace83
20643aff-44ac-4656-bdff-a9a184d3a308	e9a2f7be-4b0c-4ba4-8a89-568d146ace83
\.


--
-- Data for Name: student_charge_sheet_discount_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_charge_sheet_discount_lines (id, sheet_id, discount_type_id, amount, remarks, created_at) FROM stdin;
\.


--
-- Data for Name: student_charge_sheet_installments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_charge_sheet_installments (id, sheet_id, sequence, month_number, label, amount_due, amount_paid, status) FROM stdin;
\.


--
-- Data for Name: student_charge_sheet_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_charge_sheet_lines (id, sheet_id, charge_type_id, source_type, source_ref_id, charge_label, payment_timing, billing_frequency, list_amount, due_amount, paid_amount, status, sort_order) FROM stdin;
\.


--
-- Data for Name: student_charge_sheets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_charge_sheets (id, student_id, school_id, academic_year_id, installment_plan_id, currency, list_total, due_total, paid_total, discount_total, upfront_due, installment_due, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_course_enrollments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_course_enrollments (id, student_id, course_id, school_id, status, student_payment_id, enrolled_by_user_id, enrolled_at, dropped_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_fee_charges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_fee_charges (id, student_id, school_id, student_payment_id, academic_year_id, charge_type_id, billing_occurrence, amount_due, amount_paid, currency, created_at, updated_at) FROM stdin;
e454246f-f677-4a54-a341-e16cf868fe83	38a95e78-80bb-4119-9e37-1568613fe864	1	a2b2e484-8178-4528-9ee9-b7cdbd0f14c3	3ba07103-ccb1-4cc6-924b-a41847115a8d	50ab5c7a-dacf-45a0-8811-04d1aeee2de1	per_year	34534.00	0.00	OMR	2026-05-16 21:29:09.364024+04	2026-05-16 21:29:09.364024+04
c0f5adbe-77b9-4135-80f4-601100258c81	38a95e78-80bb-4119-9e37-1568613fe864	1	a2b2e484-8178-4528-9ee9-b7cdbd0f14c3	3ba07103-ccb1-4cc6-924b-a41847115a8d	11051f98-0b0a-4cb2-b028-c838f37418c6	per_year	45345.00	0.00	OMR	2026-05-16 21:29:09.370124+04	2026-05-16 21:29:09.370124+04
7595bc12-6dd6-41fb-b49d-b0243041b9dc	38a95e78-80bb-4119-9e37-1568613fe864	1	a2b2e484-8178-4528-9ee9-b7cdbd0f14c3	3ba07103-ccb1-4cc6-924b-a41847115a8d	342e1c55-1e49-46ee-8a01-f160367d6c41	per_year	56456.00	0.00	OMR	2026-05-16 21:29:09.373718+04	2026-05-16 21:29:09.373718+04
5253022e-100a-4ab2-a303-c19e64722347	38a95e78-80bb-4119-9e37-1568613fe864	1	a2b2e484-8178-4528-9ee9-b7cdbd0f14c3	3ba07103-ccb1-4cc6-924b-a41847115a8d	e0340f56-5165-40e5-8853-34d756a83df1	per_year	456456.00	0.00	OMR	2026-05-16 21:29:09.378841+04	2026-05-16 21:29:09.378841+04
4150dc58-daa2-44ea-9435-2b89215f5b52	1163e767-bf73-4502-b509-4c08e03f546a	1	d6086e37-f0ad-4be7-ac90-ff5ecc627668	3ba07103-ccb1-4cc6-924b-a41847115a8d	65c33b41-4589-433c-b6a4-a3cb93ddf320	once_ever	345.00	0.00	OMR	2026-05-16 22:11:23.896181+04	2026-05-16 22:11:23.896181+04
2a63c700-cb70-470e-a896-b620feed7f59	1163e767-bf73-4502-b509-4c08e03f546a	1	d6086e37-f0ad-4be7-ac90-ff5ecc627668	3ba07103-ccb1-4cc6-924b-a41847115a8d	11051f98-0b0a-4cb2-b028-c838f37418c6	per_year	45345.00	0.00	OMR	2026-05-16 22:11:23.906261+04	2026-05-16 22:11:23.906261+04
1068c87c-55bd-4e50-9ac6-66241c03a7e8	1163e767-bf73-4502-b509-4c08e03f546a	1	d6086e37-f0ad-4be7-ac90-ff5ecc627668	3ba07103-ccb1-4cc6-924b-a41847115a8d	342e1c55-1e49-46ee-8a01-f160367d6c41	per_year	56456.00	0.00	OMR	2026-05-16 22:11:23.909948+04	2026-05-16 22:11:23.909948+04
53565e2b-9865-40be-bef2-ea4da7b6ff46	1163e767-bf73-4502-b509-4c08e03f546a	1	d6086e37-f0ad-4be7-ac90-ff5ecc627668	3ba07103-ccb1-4cc6-924b-a41847115a8d	e0340f56-5165-40e5-8853-34d756a83df1	per_year	456456.00	0.00	OMR	2026-05-16 22:11:23.913096+04	2026-05-16 22:11:23.913096+04
64bbe2f5-bbc2-4c09-9546-3246880491e3	29cbcf5b-0f18-47c0-b152-e6b3d6f67ca8	1	60fb10b3-77b1-440b-972c-905b521b8ab5	3ba07103-ccb1-4cc6-924b-a41847115a8d	65c33b41-4589-433c-b6a4-a3cb93ddf320	once_ever	345.00	0.00	OMR	2026-05-29 11:40:25.167353+04	2026-05-29 11:40:25.167353+04
ec5f1f3e-c071-4b21-bd57-7b3a475ecd82	21c9654d-e11f-41a8-9163-381f573665fb	1	3385dec9-a7e0-4f1b-822b-5876a00b8d35	3ba07103-ccb1-4cc6-924b-a41847115a8d	65c33b41-4589-433c-b6a4-a3cb93ddf320	once_ever	345.00	0.00	OMR	2026-05-29 11:40:25.186537+04	2026-05-29 11:40:25.186537+04
aae6c657-bcc0-4d11-b407-2517526b4b13	38a95e78-80bb-4119-9e37-1568613fe864	1	a2b2e484-8178-4528-9ee9-b7cdbd0f14c3	3ba07103-ccb1-4cc6-924b-a41847115a8d	65c33b41-4589-433c-b6a4-a3cb93ddf320	once_ever	345.00	0.00	OMR	2026-05-29 11:40:25.186723+04	2026-05-29 11:40:25.186723+04
2270c648-23ac-484f-9cd4-5016ad979ddc	4a54b0f9-a722-46d9-b95f-28df549a33c7	1	1a78e794-3670-4016-9330-a4f23bf87c3a	3ba07103-ccb1-4cc6-924b-a41847115a8d	65c33b41-4589-433c-b6a4-a3cb93ddf320	once_ever	345.00	0.00	OMR	2026-05-29 11:40:25.187589+04	2026-05-29 11:40:25.187589+04
acdcb7f6-f34c-4297-b2eb-53336718a681	fdd4c303-ea1d-4a8d-bf18-172f6f408e74	1	9fe8f8b0-d066-4edb-b311-6e05cbf2af6f	3ba07103-ccb1-4cc6-924b-a41847115a8d	65c33b41-4589-433c-b6a4-a3cb93ddf320	once_ever	345.00	0.00	OMR	2026-05-29 11:40:25.196515+04	2026-05-29 11:40:25.196515+04
6645d361-eb33-400b-b4e2-4428d597383a	3cedb1c4-c377-46ac-8ce4-065316c2e638	1	9715f383-64c3-41c4-8c10-4518278ad8db	3ba07103-ccb1-4cc6-924b-a41847115a8d	65c33b41-4589-433c-b6a4-a3cb93ddf320	once_ever	345.00	0.00	OMR	2026-05-29 11:40:25.203317+04	2026-05-29 11:40:25.203317+04
a515b8c4-e926-4162-82dd-77dd004b6f61	ab3e3706-5b1d-4e9f-a4b2-4f435e7f8067	1	8089e593-70ad-48fc-a131-2b958b01f361	3ba07103-ccb1-4cc6-924b-a41847115a8d	65c33b41-4589-433c-b6a4-a3cb93ddf320	once_ever	345.00	0.00	OMR	2026-05-29 11:40:25.223972+04	2026-05-29 11:40:25.223972+04
48353664-6e9b-49de-911e-39350972fab1	286c72aa-0194-4eb0-a4a6-0fa7a3d9788d	1	1317328f-43af-4145-87ad-58979428d279	3ba07103-ccb1-4cc6-924b-a41847115a8d	65c33b41-4589-433c-b6a4-a3cb93ddf320	once_ever	345.00	0.00	OMR	2026-05-29 11:40:25.223999+04	2026-05-29 11:40:25.223999+04
f9a85d28-d1a3-4c37-b58f-8d8a1aa00536	9b11fbfa-e958-459f-a7f1-7df4bc0bc07e	1	d2e88a17-c26c-486f-86c9-52bc102564b4	3ba07103-ccb1-4cc6-924b-a41847115a8d	65c33b41-4589-433c-b6a4-a3cb93ddf320	once_ever	345.00	0.00	OMR	2026-05-29 11:40:25.23912+04	2026-05-29 11:40:25.23912+04
c52c22f7-e14f-476a-b2ea-12adff7b7d73	ee6f4e7e-53c2-4d66-9220-8e8112c2347a	1	f9b99065-0bb6-4866-ad45-65cfe59eff63	3ba07103-ccb1-4cc6-924b-a41847115a8d	65c33b41-4589-433c-b6a4-a3cb93ddf320	once_ever	345.00	0.00	OMR	2026-05-29 11:40:25.392023+04	2026-05-29 11:40:25.392023+04
6562e5cc-832b-43e9-980f-4d392920d483	00d19686-927d-410b-b746-23defff4953c	1	a378a4a5-2db7-4557-8887-e0bc938653a7	3ba07103-ccb1-4cc6-924b-a41847115a8d	65c33b41-4589-433c-b6a4-a3cb93ddf320	once_ever	345.00	0.00	OMR	2026-05-29 11:40:25.392086+04	2026-05-29 11:40:25.392086+04
3b610479-fe60-47b9-a1f0-e143fd6e3898	70845b1d-ca99-4e7e-ba57-bec4279d7f53	1	10d7dd2b-5f83-4438-acb8-dd72bd360520	3ba07103-ccb1-4cc6-924b-a41847115a8d	65c33b41-4589-433c-b6a4-a3cb93ddf320	once_ever	345.00	0.00	OMR	2026-05-29 11:40:25.390945+04	2026-05-29 11:40:25.390945+04
0278468b-c7d5-4509-be1a-d5aafa5e72ca	750d1305-e3d5-4191-9cd6-1e7ea77c6363	1	04fa7c60-d4d6-4b6b-9706-3b89fae2b6ec	3ba07103-ccb1-4cc6-924b-a41847115a8d	65c33b41-4589-433c-b6a4-a3cb93ddf320	once_ever	345.00	0.00	OMR	2026-05-29 11:40:25.496192+04	2026-05-29 11:40:25.496192+04
4163c093-15d3-4cf8-b196-2d8b06c411a9	73345285-ac18-4ad5-8901-894c1542e65e	1	abd4fc56-f7d1-439c-9d00-d3cd50bfbdb0	3ba07103-ccb1-4cc6-924b-a41847115a8d	65c33b41-4589-433c-b6a4-a3cb93ddf320	once_ever	345.00	0.00	OMR	2026-05-29 11:40:25.556565+04	2026-05-29 11:40:25.556565+04
26e27928-9f8a-4815-bca6-4ea908937d2e	fdd4c303-ea1d-4a8d-bf18-172f6f408e74	1	9fe8f8b0-d066-4edb-b311-6e05cbf2af6f	3ba07103-ccb1-4cc6-924b-a41847115a8d	11051f98-0b0a-4cb2-b028-c838f37418c6	per_year	45345.00	0.00	OMR	2026-05-29 11:40:25.557491+04	2026-05-29 11:40:25.557491+04
383462f1-6236-4725-9c5a-5171dc3d3348	21c9654d-e11f-41a8-9163-381f573665fb	1	3385dec9-a7e0-4f1b-822b-5876a00b8d35	3ba07103-ccb1-4cc6-924b-a41847115a8d	11051f98-0b0a-4cb2-b028-c838f37418c6	per_year	45345.00	0.00	OMR	2026-05-29 11:40:25.557681+04	2026-05-29 11:40:25.557681+04
7e72c2ba-567a-4ffd-bf1f-55bf274cebfe	ab3e3706-5b1d-4e9f-a4b2-4f435e7f8067	1	8089e593-70ad-48fc-a131-2b958b01f361	3ba07103-ccb1-4cc6-924b-a41847115a8d	11051f98-0b0a-4cb2-b028-c838f37418c6	per_year	45345.00	0.00	OMR	2026-05-29 11:40:25.56512+04	2026-05-29 11:40:25.56512+04
930fb6dc-be02-400e-941d-8168e99a26e3	29cbcf5b-0f18-47c0-b152-e6b3d6f67ca8	1	60fb10b3-77b1-440b-972c-905b521b8ab5	3ba07103-ccb1-4cc6-924b-a41847115a8d	11051f98-0b0a-4cb2-b028-c838f37418c6	per_year	45345.00	0.00	OMR	2026-05-29 11:40:25.556254+04	2026-05-29 11:40:25.556254+04
ea5cca2f-d7d6-4e2c-bbf7-0628b11a51bc	286c72aa-0194-4eb0-a4a6-0fa7a3d9788d	1	1317328f-43af-4145-87ad-58979428d279	3ba07103-ccb1-4cc6-924b-a41847115a8d	11051f98-0b0a-4cb2-b028-c838f37418c6	per_year	45345.00	0.00	OMR	2026-05-29 11:40:25.71207+04	2026-05-29 11:40:25.71207+04
b26089ae-edc6-429b-a048-dd8a379b15e9	4a54b0f9-a722-46d9-b95f-28df549a33c7	1	1a78e794-3670-4016-9330-a4f23bf87c3a	3ba07103-ccb1-4cc6-924b-a41847115a8d	11051f98-0b0a-4cb2-b028-c838f37418c6	per_year	45345.00	0.00	OMR	2026-05-29 11:40:25.790888+04	2026-05-29 11:40:25.790888+04
209f351f-f6da-4b2d-835b-ad54c56bd9ca	00d19686-927d-410b-b746-23defff4953c	1	a378a4a5-2db7-4557-8887-e0bc938653a7	3ba07103-ccb1-4cc6-924b-a41847115a8d	11051f98-0b0a-4cb2-b028-c838f37418c6	per_year	45345.00	0.00	OMR	2026-05-29 11:40:25.799052+04	2026-05-29 11:40:25.799052+04
ecc3e0f7-c8a6-4a62-b743-6fc83e6b2ca9	70845b1d-ca99-4e7e-ba57-bec4279d7f53	1	10d7dd2b-5f83-4438-acb8-dd72bd360520	3ba07103-ccb1-4cc6-924b-a41847115a8d	11051f98-0b0a-4cb2-b028-c838f37418c6	per_year	45345.00	0.00	OMR	2026-05-29 11:40:25.799249+04	2026-05-29 11:40:25.799249+04
357ca762-1291-46c4-98b2-9b74af6184b7	9b11fbfa-e958-459f-a7f1-7df4bc0bc07e	1	d2e88a17-c26c-486f-86c9-52bc102564b4	3ba07103-ccb1-4cc6-924b-a41847115a8d	11051f98-0b0a-4cb2-b028-c838f37418c6	per_year	45345.00	0.00	OMR	2026-05-29 11:40:25.799415+04	2026-05-29 11:40:25.799415+04
391c031f-276f-4047-847e-4e679a179d88	ee6f4e7e-53c2-4d66-9220-8e8112c2347a	1	f9b99065-0bb6-4866-ad45-65cfe59eff63	3ba07103-ccb1-4cc6-924b-a41847115a8d	11051f98-0b0a-4cb2-b028-c838f37418c6	per_year	45345.00	0.00	OMR	2026-05-29 11:40:25.799611+04	2026-05-29 11:40:25.799611+04
567b7784-b023-45ee-82f6-85c5884f9e27	3cedb1c4-c377-46ac-8ce4-065316c2e638	1	9715f383-64c3-41c4-8c10-4518278ad8db	3ba07103-ccb1-4cc6-924b-a41847115a8d	11051f98-0b0a-4cb2-b028-c838f37418c6	per_year	45345.00	0.00	OMR	2026-05-29 11:40:25.797101+04	2026-05-29 11:40:25.797101+04
00640972-8d73-4349-b1ff-b123f993f6fd	750d1305-e3d5-4191-9cd6-1e7ea77c6363	1	04fa7c60-d4d6-4b6b-9706-3b89fae2b6ec	3ba07103-ccb1-4cc6-924b-a41847115a8d	11051f98-0b0a-4cb2-b028-c838f37418c6	per_year	45345.00	0.00	OMR	2026-05-29 11:40:26.045143+04	2026-05-29 11:40:26.045143+04
c68c27c5-8f98-470c-9b76-8252c5d010f7	73345285-ac18-4ad5-8901-894c1542e65e	1	abd4fc56-f7d1-439c-9d00-d3cd50bfbdb0	3ba07103-ccb1-4cc6-924b-a41847115a8d	11051f98-0b0a-4cb2-b028-c838f37418c6	per_year	45345.00	0.00	OMR	2026-05-29 11:40:26.047461+04	2026-05-29 11:40:26.047461+04
2b33576c-73e3-45f2-b4ef-236f01f1ea00	21c9654d-e11f-41a8-9163-381f573665fb	1	3385dec9-a7e0-4f1b-822b-5876a00b8d35	3ba07103-ccb1-4cc6-924b-a41847115a8d	342e1c55-1e49-46ee-8a01-f160367d6c41	per_year	56456.00	0.00	OMR	2026-05-29 11:40:26.049981+04	2026-05-29 11:40:26.049981+04
a23e0ec8-5694-4e2d-8119-690bf67f712f	fdd4c303-ea1d-4a8d-bf18-172f6f408e74	1	9fe8f8b0-d066-4edb-b311-6e05cbf2af6f	3ba07103-ccb1-4cc6-924b-a41847115a8d	342e1c55-1e49-46ee-8a01-f160367d6c41	per_year	56456.00	0.00	OMR	2026-05-29 11:40:26.091861+04	2026-05-29 11:40:26.091861+04
ad5d0825-b45c-4899-9c51-fb22498eb72f	ab3e3706-5b1d-4e9f-a4b2-4f435e7f8067	1	8089e593-70ad-48fc-a131-2b958b01f361	3ba07103-ccb1-4cc6-924b-a41847115a8d	342e1c55-1e49-46ee-8a01-f160367d6c41	per_year	56456.00	0.00	OMR	2026-05-29 11:40:26.098208+04	2026-05-29 11:40:26.098208+04
6677d46a-5d42-4f00-a695-0bb557867044	4a54b0f9-a722-46d9-b95f-28df549a33c7	1	1a78e794-3670-4016-9330-a4f23bf87c3a	3ba07103-ccb1-4cc6-924b-a41847115a8d	342e1c55-1e49-46ee-8a01-f160367d6c41	per_year	56456.00	0.00	OMR	2026-05-29 11:40:26.098911+04	2026-05-29 11:40:26.098911+04
3c3a39c7-0332-4d69-9111-bf1a498cb866	29cbcf5b-0f18-47c0-b152-e6b3d6f67ca8	1	60fb10b3-77b1-440b-972c-905b521b8ab5	3ba07103-ccb1-4cc6-924b-a41847115a8d	342e1c55-1e49-46ee-8a01-f160367d6c41	per_year	56456.00	0.00	OMR	2026-05-29 11:40:26.099538+04	2026-05-29 11:40:26.099538+04
fe7a4912-b115-4a12-8ca3-bb8b119c5bce	286c72aa-0194-4eb0-a4a6-0fa7a3d9788d	1	1317328f-43af-4145-87ad-58979428d279	3ba07103-ccb1-4cc6-924b-a41847115a8d	342e1c55-1e49-46ee-8a01-f160367d6c41	per_year	56456.00	0.00	OMR	2026-05-29 11:40:26.099332+04	2026-05-29 11:40:26.099332+04
5f5f258f-4fef-4d5e-8aa3-d3a26fd31f31	70845b1d-ca99-4e7e-ba57-bec4279d7f53	1	10d7dd2b-5f83-4438-acb8-dd72bd360520	3ba07103-ccb1-4cc6-924b-a41847115a8d	342e1c55-1e49-46ee-8a01-f160367d6c41	per_year	56456.00	0.00	OMR	2026-05-29 11:40:26.103716+04	2026-05-29 11:40:26.103716+04
5ab51548-e0c5-42ce-9abd-5bc7a487f428	9b11fbfa-e958-459f-a7f1-7df4bc0bc07e	1	d2e88a17-c26c-486f-86c9-52bc102564b4	3ba07103-ccb1-4cc6-924b-a41847115a8d	342e1c55-1e49-46ee-8a01-f160367d6c41	per_year	56456.00	0.00	OMR	2026-05-29 11:40:26.103755+04	2026-05-29 11:40:26.103755+04
c46220e1-265d-474a-a4be-b798c25e17bd	ee6f4e7e-53c2-4d66-9220-8e8112c2347a	1	f9b99065-0bb6-4866-ad45-65cfe59eff63	3ba07103-ccb1-4cc6-924b-a41847115a8d	342e1c55-1e49-46ee-8a01-f160367d6c41	per_year	56456.00	0.00	OMR	2026-05-29 11:40:26.103821+04	2026-05-29 11:40:26.103821+04
5526bffa-02e4-4977-81fe-6eaf7d3b6dc8	3cedb1c4-c377-46ac-8ce4-065316c2e638	1	9715f383-64c3-41c4-8c10-4518278ad8db	3ba07103-ccb1-4cc6-924b-a41847115a8d	342e1c55-1e49-46ee-8a01-f160367d6c41	per_year	56456.00	0.00	OMR	2026-05-29 11:40:26.103886+04	2026-05-29 11:40:26.103886+04
3dbcb279-8aa8-48fd-9eba-1b6a39a1cc1b	00d19686-927d-410b-b746-23defff4953c	1	a378a4a5-2db7-4557-8887-e0bc938653a7	3ba07103-ccb1-4cc6-924b-a41847115a8d	342e1c55-1e49-46ee-8a01-f160367d6c41	per_year	56456.00	0.00	OMR	2026-05-29 11:40:26.104058+04	2026-05-29 11:40:26.104058+04
a81aa44e-29cc-42ac-bbba-1bb387a5ccda	750d1305-e3d5-4191-9cd6-1e7ea77c6363	1	04fa7c60-d4d6-4b6b-9706-3b89fae2b6ec	3ba07103-ccb1-4cc6-924b-a41847115a8d	342e1c55-1e49-46ee-8a01-f160367d6c41	per_year	56456.00	0.00	OMR	2026-05-29 11:40:26.116023+04	2026-05-29 11:40:26.116023+04
597f47e1-e14c-4f1a-8a56-db20b93ac299	21c9654d-e11f-41a8-9163-381f573665fb	1	3385dec9-a7e0-4f1b-822b-5876a00b8d35	3ba07103-ccb1-4cc6-924b-a41847115a8d	e0340f56-5165-40e5-8853-34d756a83df1	per_year	456456.00	0.00	OMR	2026-05-29 11:40:26.116085+04	2026-05-29 11:40:26.116085+04
6cabd3d0-d583-4433-9170-c3f3595259e2	73345285-ac18-4ad5-8901-894c1542e65e	1	abd4fc56-f7d1-439c-9d00-d3cd50bfbdb0	3ba07103-ccb1-4cc6-924b-a41847115a8d	342e1c55-1e49-46ee-8a01-f160367d6c41	per_year	56456.00	0.00	OMR	2026-05-29 11:40:26.116196+04	2026-05-29 11:40:26.116196+04
504e81c0-8738-482f-b816-70a58eb770c0	29cbcf5b-0f18-47c0-b152-e6b3d6f67ca8	1	60fb10b3-77b1-440b-972c-905b521b8ab5	3ba07103-ccb1-4cc6-924b-a41847115a8d	e0340f56-5165-40e5-8853-34d756a83df1	per_year	456456.00	0.00	OMR	2026-05-29 11:40:26.116763+04	2026-05-29 11:40:26.116763+04
271dcb92-3afe-4a2b-af39-6d9e263db575	fdd4c303-ea1d-4a8d-bf18-172f6f408e74	1	9fe8f8b0-d066-4edb-b311-6e05cbf2af6f	3ba07103-ccb1-4cc6-924b-a41847115a8d	e0340f56-5165-40e5-8853-34d756a83df1	per_year	456456.00	0.00	OMR	2026-05-29 11:40:26.116854+04	2026-05-29 11:40:26.116854+04
611bda8f-e138-4acf-980b-7194c993c1c8	ab3e3706-5b1d-4e9f-a4b2-4f435e7f8067	1	8089e593-70ad-48fc-a131-2b958b01f361	3ba07103-ccb1-4cc6-924b-a41847115a8d	e0340f56-5165-40e5-8853-34d756a83df1	per_year	456456.00	0.00	OMR	2026-05-29 11:40:26.117762+04	2026-05-29 11:40:26.117762+04
8a4e3b29-5209-47f4-9838-90b5626b9687	3cedb1c4-c377-46ac-8ce4-065316c2e638	1	9715f383-64c3-41c4-8c10-4518278ad8db	3ba07103-ccb1-4cc6-924b-a41847115a8d	e0340f56-5165-40e5-8853-34d756a83df1	per_year	456456.00	0.00	OMR	2026-05-29 11:40:26.120805+04	2026-05-29 11:40:26.120805+04
08263bb7-d7d9-4623-8980-a222d8b73a8d	286c72aa-0194-4eb0-a4a6-0fa7a3d9788d	1	1317328f-43af-4145-87ad-58979428d279	3ba07103-ccb1-4cc6-924b-a41847115a8d	e0340f56-5165-40e5-8853-34d756a83df1	per_year	456456.00	0.00	OMR	2026-05-29 11:40:26.120262+04	2026-05-29 11:40:26.120262+04
8b12c3a9-c86b-43c4-8acb-dbaaf6e71482	750d1305-e3d5-4191-9cd6-1e7ea77c6363	1	04fa7c60-d4d6-4b6b-9706-3b89fae2b6ec	3ba07103-ccb1-4cc6-924b-a41847115a8d	e0340f56-5165-40e5-8853-34d756a83df1	per_year	456456.00	0.00	OMR	2026-05-29 11:40:26.138326+04	2026-05-29 11:40:26.138326+04
9e288eeb-39b6-4fe5-8a19-ad339e1255d8	70845b1d-ca99-4e7e-ba57-bec4279d7f53	1	10d7dd2b-5f83-4438-acb8-dd72bd360520	3ba07103-ccb1-4cc6-924b-a41847115a8d	e0340f56-5165-40e5-8853-34d756a83df1	per_year	456456.00	0.00	OMR	2026-05-29 11:40:26.12488+04	2026-05-29 11:40:26.12488+04
235d262c-31a8-4b32-92f1-a18d9ec0f708	00d19686-927d-410b-b746-23defff4953c	1	a378a4a5-2db7-4557-8887-e0bc938653a7	3ba07103-ccb1-4cc6-924b-a41847115a8d	e0340f56-5165-40e5-8853-34d756a83df1	per_year	456456.00	0.00	OMR	2026-05-29 11:40:26.124937+04	2026-05-29 11:40:26.124937+04
7ea45efe-4930-4f36-aa47-a8c167046f10	73345285-ac18-4ad5-8901-894c1542e65e	1	abd4fc56-f7d1-439c-9d00-d3cd50bfbdb0	3ba07103-ccb1-4cc6-924b-a41847115a8d	e0340f56-5165-40e5-8853-34d756a83df1	per_year	456456.00	0.00	OMR	2026-05-29 11:40:26.139948+04	2026-05-29 11:40:26.139948+04
9f8e4d90-7599-4ea2-b380-a238ad5011f4	9b11fbfa-e958-459f-a7f1-7df4bc0bc07e	1	d2e88a17-c26c-486f-86c9-52bc102564b4	3ba07103-ccb1-4cc6-924b-a41847115a8d	e0340f56-5165-40e5-8853-34d756a83df1	per_year	456456.00	0.00	OMR	2026-05-29 11:40:26.124954+04	2026-05-29 11:40:26.124954+04
5e500384-199c-439f-b65e-f287b0e98a2d	ee6f4e7e-53c2-4d66-9220-8e8112c2347a	1	f9b99065-0bb6-4866-ad45-65cfe59eff63	3ba07103-ccb1-4cc6-924b-a41847115a8d	e0340f56-5165-40e5-8853-34d756a83df1	per_year	456456.00	0.00	OMR	2026-05-29 11:40:26.130889+04	2026-05-29 11:40:26.130889+04
e51a8705-1f30-43e9-8397-85b96e3a67c7	4a54b0f9-a722-46d9-b95f-28df549a33c7	1	1a78e794-3670-4016-9330-a4f23bf87c3a	3ba07103-ccb1-4cc6-924b-a41847115a8d	e0340f56-5165-40e5-8853-34d756a83df1	per_year	456456.00	0.00	OMR	2026-05-29 11:40:26.119393+04	2026-05-29 11:40:26.119393+04
\.


--
-- Data for Name: student_groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_groups (student_id, group_id) FROM stdin;
6f28a8bf-0035-459b-90f5-47a45d52bc1e	efe57fcd-e10d-489f-a79a-3d6b50535bdc
ab3e3706-5b1d-4e9f-a4b2-4f435e7f8067	efe57fcd-e10d-489f-a79a-3d6b50535bdc
273933e4-0027-4a0a-8fd3-eb29449897fc	efe57fcd-e10d-489f-a79a-3d6b50535bdc
1f9ddabb-62de-4485-a1c9-c3f2a445bddd	efe57fcd-e10d-489f-a79a-3d6b50535bdc
fdd4c303-ea1d-4a8d-bf18-172f6f408e74	efe57fcd-e10d-489f-a79a-3d6b50535bdc
9cc2ae8c-60c5-4bc8-b5c2-2b881c182bd1	efe57fcd-e10d-489f-a79a-3d6b50535bdc
9fec0ef1-5280-4ab7-bb2d-4d4099fef70b	efe57fcd-e10d-489f-a79a-3d6b50535bdc
d6683690-f47a-4c87-bfff-494e0955c2ac	efe57fcd-e10d-489f-a79a-3d6b50535bdc
8d5a3b08-eff9-49ef-9725-23bcf4ae91e8	efe57fcd-e10d-489f-a79a-3d6b50535bdc
f9b40636-6be2-49cf-86b1-1c912183b399	efe57fcd-e10d-489f-a79a-3d6b50535bdc
d8dabcc8-0225-4331-882e-e21e3a27111d	efe57fcd-e10d-489f-a79a-3d6b50535bdc
06c6d5e1-51d3-47fe-80b9-7fec6903a58b	efe57fcd-e10d-489f-a79a-3d6b50535bdc
b55d86fe-2938-4aba-872c-07d32c0f90d0	efe57fcd-e10d-489f-a79a-3d6b50535bdc
93924917-415a-41fb-84c6-931b74716d89	efe57fcd-e10d-489f-a79a-3d6b50535bdc
5c0ae62c-8be3-4532-b4ae-24e54be47012	efe57fcd-e10d-489f-a79a-3d6b50535bdc
82605502-5a52-4dae-a571-3646385039df	efe57fcd-e10d-489f-a79a-3d6b50535bdc
21c9654d-e11f-41a8-9163-381f573665fb	efe57fcd-e10d-489f-a79a-3d6b50535bdc
2560128e-92c2-483a-8aaa-3ec0daec14cd	efe57fcd-e10d-489f-a79a-3d6b50535bdc
00d19686-927d-410b-b746-23defff4953c	efe57fcd-e10d-489f-a79a-3d6b50535bdc
f4d8147f-5ace-4bf3-a94c-e90cde759011	efe57fcd-e10d-489f-a79a-3d6b50535bdc
84511774-806e-4cca-8475-d87f752fa0a0	efe57fcd-e10d-489f-a79a-3d6b50535bdc
f20c7070-3678-46ba-8dfb-d22c230907fb	f3815444-5a11-479b-bd1f-a109adf8131e
1a25f905-bddc-4111-8a8e-7c315368d66f	f3815444-5a11-479b-bd1f-a109adf8131e
d2d06916-e1c6-4082-b675-a0fd0ab6dae2	f3815444-5a11-479b-bd1f-a109adf8131e
34d84d32-e346-4297-9d8b-5e9af86ac67b	f3815444-5a11-479b-bd1f-a109adf8131e
af7ce97b-f4a3-45d4-8e0d-6663b5840a51	f3815444-5a11-479b-bd1f-a109adf8131e
31c1b475-e8a3-4ad4-9a12-e7efd67d6b48	f3815444-5a11-479b-bd1f-a109adf8131e
fd380b77-5060-47b4-bea8-edc28b2f560b	f3815444-5a11-479b-bd1f-a109adf8131e
798a0783-aec2-4bb4-a505-7e2f20a0b0b2	f3815444-5a11-479b-bd1f-a109adf8131e
8cb5b8aa-4135-4b0a-9d09-ad10ad56b474	f3815444-5a11-479b-bd1f-a109adf8131e
5d0b7ad2-721d-4dfb-b9ed-ab7bc21de1da	f3815444-5a11-479b-bd1f-a109adf8131e
447c544a-6465-45e2-82dd-6b72f2368f8b	f3815444-5a11-479b-bd1f-a109adf8131e
e603f1ee-e980-45f3-81b4-dd49e541cf18	f3815444-5a11-479b-bd1f-a109adf8131e
fd481261-2ee1-48c5-883f-589cb0e8ce4c	f3815444-5a11-479b-bd1f-a109adf8131e
875145fb-a188-4f61-ae92-01e1e620ef1e	f3815444-5a11-479b-bd1f-a109adf8131e
68a4d177-11c9-4cf5-a25b-fc893111e9fb	f3815444-5a11-479b-bd1f-a109adf8131e
4f25cf38-e7ce-49e9-8a32-b45ae733a39b	f3815444-5a11-479b-bd1f-a109adf8131e
eac7f899-2803-4296-8ffc-7267b0b2f6f3	f3815444-5a11-479b-bd1f-a109adf8131e
8ced0986-1117-4be9-b652-65b7ab004522	f3815444-5a11-479b-bd1f-a109adf8131e
142ce12d-9d92-4aea-842a-56b4bbea309a	f3815444-5a11-479b-bd1f-a109adf8131e
2f617295-b6ba-46e6-a983-8f122f9611f6	f3815444-5a11-479b-bd1f-a109adf8131e
dd884bc0-6c5d-4d1c-b01d-8aba0edef939	f3815444-5a11-479b-bd1f-a109adf8131e
12f008f5-3c09-427b-99a1-046d01b9aa22	198ff890-0654-4f21-b056-8ba3ec22e687
3b44d995-bbe5-409b-99c8-cf56c6572329	198ff890-0654-4f21-b056-8ba3ec22e687
620da0bb-316d-412a-985b-0d59da373767	198ff890-0654-4f21-b056-8ba3ec22e687
1bac2363-ee0c-448f-840e-c7cbcf69e51a	198ff890-0654-4f21-b056-8ba3ec22e687
f2e6f1a8-0b53-4854-9907-5154094f501f	198ff890-0654-4f21-b056-8ba3ec22e687
b372f4f6-2c67-4b92-a632-52ba15173f5e	198ff890-0654-4f21-b056-8ba3ec22e687
1f9b37e7-f2f3-4ddc-91f0-9c3151052b1d	198ff890-0654-4f21-b056-8ba3ec22e687
b50c76bf-ae6c-4b7c-bbfe-7b91a0776d04	198ff890-0654-4f21-b056-8ba3ec22e687
b20b45f8-eaa5-4a6f-b4dc-0b017fdb7cf5	198ff890-0654-4f21-b056-8ba3ec22e687
1c4e4ef1-5edd-4082-bd90-1889168f6818	198ff890-0654-4f21-b056-8ba3ec22e687
96a09961-64a3-453d-b318-0a7c47a42b71	198ff890-0654-4f21-b056-8ba3ec22e687
65e608d9-c8d8-4e88-a729-b10fad23c4c8	198ff890-0654-4f21-b056-8ba3ec22e687
acae4d85-10c5-480e-906a-69e2af60779e	198ff890-0654-4f21-b056-8ba3ec22e687
e4051ccc-1720-468e-8f81-3809ebedfe58	198ff890-0654-4f21-b056-8ba3ec22e687
84cb261c-a97f-4625-9abe-87516899cc31	198ff890-0654-4f21-b056-8ba3ec22e687
75a36195-4911-4ef0-ad5a-312d3a11adc3	198ff890-0654-4f21-b056-8ba3ec22e687
c5ce6fb7-3506-405d-9381-e1d23f621704	198ff890-0654-4f21-b056-8ba3ec22e687
5d916c68-9c95-486f-aef3-63fe3b48a73e	198ff890-0654-4f21-b056-8ba3ec22e687
d54fab4b-65c0-47c7-b05e-bcdef292c47f	198ff890-0654-4f21-b056-8ba3ec22e687
342f159b-a528-43a7-ae19-686f5895c414	198ff890-0654-4f21-b056-8ba3ec22e687
effb9ddd-9c49-43d7-b5d9-d6ce83e397a7	198ff890-0654-4f21-b056-8ba3ec22e687
167a1a3c-ddf6-4347-a245-21ea9e2c1593	8475490d-e2b4-4d47-8425-6d93605140c1
284c5ad3-fbf3-436d-9357-0ab076088574	8475490d-e2b4-4d47-8425-6d93605140c1
b7c7c41e-12c7-426b-93ee-e3d2e1f2fec4	8475490d-e2b4-4d47-8425-6d93605140c1
d98ded37-284d-4221-a233-d2020c2f934f	8475490d-e2b4-4d47-8425-6d93605140c1
40daff7b-c404-45fe-ae84-f40fe759df5d	8475490d-e2b4-4d47-8425-6d93605140c1
73149a02-28b0-4202-b599-1c09d2dccbbb	8475490d-e2b4-4d47-8425-6d93605140c1
75422e0c-6dc4-470c-b371-e695f7551489	8475490d-e2b4-4d47-8425-6d93605140c1
d38b824e-7f64-4477-b8cf-ecb0212719f8	8475490d-e2b4-4d47-8425-6d93605140c1
a0798db0-9503-4ce7-8d0a-b0ccd1e6cbf6	8475490d-e2b4-4d47-8425-6d93605140c1
49470ee9-c31c-487f-bdbb-cb93224057ec	8475490d-e2b4-4d47-8425-6d93605140c1
89198a78-8926-457a-b54d-6a88db4358a0	8475490d-e2b4-4d47-8425-6d93605140c1
730d1155-8080-4b34-8fda-c9ddce4371dd	8475490d-e2b4-4d47-8425-6d93605140c1
20643aff-44ac-4656-bdff-a9a184d3a308	8475490d-e2b4-4d47-8425-6d93605140c1
8e517f61-8868-4914-8ac8-bca125ad5cf5	8475490d-e2b4-4d47-8425-6d93605140c1
cdc7465e-bb88-4e4d-97c6-190cc66fec5b	8475490d-e2b4-4d47-8425-6d93605140c1
e96df5fb-d579-4b35-a87b-0d966fa41adf	fc4ec62f-e19a-4443-8e44-18173552ac07
122397f2-90ca-4e29-9842-82da66fbfcb9	fc4ec62f-e19a-4443-8e44-18173552ac07
c67056bd-578b-427d-a29c-d6b029514f63	fc4ec62f-e19a-4443-8e44-18173552ac07
4120567e-4999-43e8-9e67-809d1e22db88	fc4ec62f-e19a-4443-8e44-18173552ac07
d6fb6955-d01c-4d54-a9c8-3f1e8ca33ac4	fc4ec62f-e19a-4443-8e44-18173552ac07
a5030e1a-8c45-4ae4-bbb5-12009621ed8b	fc4ec62f-e19a-4443-8e44-18173552ac07
bb41a8b0-3010-488d-8533-22de63e8d4c9	fc4ec62f-e19a-4443-8e44-18173552ac07
b32b6c95-0e68-4a16-9c50-f54f79cbd9c9	fc4ec62f-e19a-4443-8e44-18173552ac07
ebf9e567-01f0-477f-8abc-d0724fcb64d8	fc4ec62f-e19a-4443-8e44-18173552ac07
dd8f5ad2-737d-44b3-9c49-ce65edbee9c4	fc4ec62f-e19a-4443-8e44-18173552ac07
f2d47fb4-bb48-4c8b-ab2b-4fe98dbf2d78	fc4ec62f-e19a-4443-8e44-18173552ac07
cd5bc435-a351-4992-8c04-cb25dc003732	fc4ec62f-e19a-4443-8e44-18173552ac07
077b0c2f-701f-47e0-b998-03c374b3a520	fc4ec62f-e19a-4443-8e44-18173552ac07
c74b988d-6873-4fb8-92a0-be63e455dc6f	fc4ec62f-e19a-4443-8e44-18173552ac07
496e7983-a53f-4ea3-b95f-e8595fd7b4e7	fc4ec62f-e19a-4443-8e44-18173552ac07
7ee64061-33b2-42a0-973b-955f89d5d92f	fc4ec62f-e19a-4443-8e44-18173552ac07
573e09f1-1537-47b4-9c97-24ad65ba74e8	fc4ec62f-e19a-4443-8e44-18173552ac07
6af3f351-fcad-471e-9a3d-72772e3c1bfd	fc4ec62f-e19a-4443-8e44-18173552ac07
2d5c9999-85d7-4b08-aa6e-fc5513c1debb	fc4ec62f-e19a-4443-8e44-18173552ac07
ee57c14b-bd54-488f-98f5-3ea4cb94554a	fc4ec62f-e19a-4443-8e44-18173552ac07
59407267-f1b1-4087-a711-7746f509304a	fc4ec62f-e19a-4443-8e44-18173552ac07
3cedb1c4-c377-46ac-8ce4-065316c2e638	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf
38a95e78-80bb-4119-9e37-1568613fe864	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf
1b165422-1eaf-42f6-add1-f0bffb3607f8	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf
5ff9fe06-bdd1-43f9-b921-86ebc0dcc868	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf
1163e767-bf73-4502-b509-4c08e03f546a	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf
4b9061ca-0c4a-425b-be9a-6ce9b2a0e0f3	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf
73345285-ac18-4ad5-8901-894c1542e65e	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf
85d8b3a6-64bc-4751-aa7c-9b56eb1c3f2d	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf
a863d554-3a02-48c9-9f4c-df22b41ed666	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf
29cbcf5b-0f18-47c0-b152-e6b3d6f67ca8	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf
9b11fbfa-e958-459f-a7f1-7df4bc0bc07e	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf
46e7bc94-f3cb-4a64-a787-914ee1225bc4	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf
d731abae-20dc-4e88-8d3d-a4a2a18ff01a	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf
286c72aa-0194-4eb0-a4a6-0fa7a3d9788d	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf
f947a8e8-3303-4d59-9372-520137ddac05	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf
a3227bae-c230-46ae-a1fe-f1a4fdb13c67	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf
31f8261e-809e-45eb-9ef8-125b68102f55	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf
cdb6fdc0-44ae-478c-aff3-49f58f67cfcf	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf
10d89a77-fb38-4ccc-9948-77d8e1b62256	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf
82ecff62-23c0-468d-8e87-a1b4e342db1a	ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf
c76bba3f-89f1-4cfa-b05a-941ac34be80a	b892f8b1-43f5-4cc0-9082-56a932ce7c4a
750d1305-e3d5-4191-9cd6-1e7ea77c6363	b892f8b1-43f5-4cc0-9082-56a932ce7c4a
deb13f05-a38d-4910-a0c2-ee07e5c104f2	b892f8b1-43f5-4cc0-9082-56a932ce7c4a
14799b1a-9596-4204-9d75-29dc977fa4de	b892f8b1-43f5-4cc0-9082-56a932ce7c4a
dddbd098-3eec-46d4-b4f5-cdf7f15f1638	b892f8b1-43f5-4cc0-9082-56a932ce7c4a
fd56bf92-62e8-4bd3-b054-8e3e292d3a03	b892f8b1-43f5-4cc0-9082-56a932ce7c4a
b35d8a54-d260-4c40-a0ea-ea349ec7e454	b892f8b1-43f5-4cc0-9082-56a932ce7c4a
d1b3a827-b220-468e-aff0-b04b2e4a4e88	b892f8b1-43f5-4cc0-9082-56a932ce7c4a
6e138a6a-2343-480c-b09d-d734bd7eee24	b892f8b1-43f5-4cc0-9082-56a932ce7c4a
6c452cf2-3307-4c0e-a1b3-4f5baee9c3ce	b892f8b1-43f5-4cc0-9082-56a932ce7c4a
70845b1d-ca99-4e7e-ba57-bec4279d7f53	b892f8b1-43f5-4cc0-9082-56a932ce7c4a
13635de0-762e-44b8-965a-001571e1922c	b892f8b1-43f5-4cc0-9082-56a932ce7c4a
7e2c867d-e99e-4f27-8a4a-f2e33e98f6bc	b892f8b1-43f5-4cc0-9082-56a932ce7c4a
b9a1f103-744c-456e-99f6-d50c12aafc2d	b892f8b1-43f5-4cc0-9082-56a932ce7c4a
eee33dcb-803a-4d07-a7fe-fbc7e7c8b84e	b892f8b1-43f5-4cc0-9082-56a932ce7c4a
4a72ec48-b917-4f2e-8f98-4aea8c80a30b	b892f8b1-43f5-4cc0-9082-56a932ce7c4a
4a54b0f9-a722-46d9-b95f-28df549a33c7	b892f8b1-43f5-4cc0-9082-56a932ce7c4a
d09157a4-bff9-4106-a3ae-30292164f649	b892f8b1-43f5-4cc0-9082-56a932ce7c4a
ee6f4e7e-53c2-4d66-9220-8e8112c2347a	b892f8b1-43f5-4cc0-9082-56a932ce7c4a
3f897370-0f2b-4c0f-bb34-f748e542ce9d	b892f8b1-43f5-4cc0-9082-56a932ce7c4a
\.


--
-- Data for Name: student_parents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_parents (student_id, parent_id) FROM stdin;
6f28a8bf-0035-459b-90f5-47a45d52bc1e	1
6f28a8bf-0035-459b-90f5-47a45d52bc1e	2
ab3e3706-5b1d-4e9f-a4b2-4f435e7f8067	3
ab3e3706-5b1d-4e9f-a4b2-4f435e7f8067	4
273933e4-0027-4a0a-8fd3-eb29449897fc	5
1f9ddabb-62de-4485-a1c9-c3f2a445bddd	6
1f9ddabb-62de-4485-a1c9-c3f2a445bddd	7
fdd4c303-ea1d-4a8d-bf18-172f6f408e74	8
fdd4c303-ea1d-4a8d-bf18-172f6f408e74	9
9cc2ae8c-60c5-4bc8-b5c2-2b881c182bd1	10
9cc2ae8c-60c5-4bc8-b5c2-2b881c182bd1	11
9fec0ef1-5280-4ab7-bb2d-4d4099fef70b	12
9fec0ef1-5280-4ab7-bb2d-4d4099fef70b	13
d6683690-f47a-4c87-bfff-494e0955c2ac	14
d6683690-f47a-4c87-bfff-494e0955c2ac	15
8d5a3b08-eff9-49ef-9725-23bcf4ae91e8	16
8d5a3b08-eff9-49ef-9725-23bcf4ae91e8	17
f9b40636-6be2-49cf-86b1-1c912183b399	18
f9b40636-6be2-49cf-86b1-1c912183b399	19
d8dabcc8-0225-4331-882e-e21e3a27111d	20
d8dabcc8-0225-4331-882e-e21e3a27111d	21
06c6d5e1-51d3-47fe-80b9-7fec6903a58b	22
06c6d5e1-51d3-47fe-80b9-7fec6903a58b	23
b55d86fe-2938-4aba-872c-07d32c0f90d0	24
b55d86fe-2938-4aba-872c-07d32c0f90d0	25
93924917-415a-41fb-84c6-931b74716d89	26
93924917-415a-41fb-84c6-931b74716d89	27
5c0ae62c-8be3-4532-b4ae-24e54be47012	28
5c0ae62c-8be3-4532-b4ae-24e54be47012	29
82605502-5a52-4dae-a571-3646385039df	30
82605502-5a52-4dae-a571-3646385039df	31
21c9654d-e11f-41a8-9163-381f573665fb	32
21c9654d-e11f-41a8-9163-381f573665fb	33
2560128e-92c2-483a-8aaa-3ec0daec14cd	34
2560128e-92c2-483a-8aaa-3ec0daec14cd	35
00d19686-927d-410b-b746-23defff4953c	36
00d19686-927d-410b-b746-23defff4953c	37
f4d8147f-5ace-4bf3-a94c-e90cde759011	38
f4d8147f-5ace-4bf3-a94c-e90cde759011	39
84511774-806e-4cca-8475-d87f752fa0a0	40
f20c7070-3678-46ba-8dfb-d22c230907fb	41
f20c7070-3678-46ba-8dfb-d22c230907fb	42
1a25f905-bddc-4111-8a8e-7c315368d66f	43
1a25f905-bddc-4111-8a8e-7c315368d66f	44
d2d06916-e1c6-4082-b675-a0fd0ab6dae2	45
d2d06916-e1c6-4082-b675-a0fd0ab6dae2	46
34d84d32-e346-4297-9d8b-5e9af86ac67b	47
34d84d32-e346-4297-9d8b-5e9af86ac67b	48
af7ce97b-f4a3-45d4-8e0d-6663b5840a51	49
31c1b475-e8a3-4ad4-9a12-e7efd67d6b48	50
31c1b475-e8a3-4ad4-9a12-e7efd67d6b48	51
fd380b77-5060-47b4-bea8-edc28b2f560b	52
798a0783-aec2-4bb4-a505-7e2f20a0b0b2	53
798a0783-aec2-4bb4-a505-7e2f20a0b0b2	54
8cb5b8aa-4135-4b0a-9d09-ad10ad56b474	55
8cb5b8aa-4135-4b0a-9d09-ad10ad56b474	56
5d0b7ad2-721d-4dfb-b9ed-ab7bc21de1da	57
5d0b7ad2-721d-4dfb-b9ed-ab7bc21de1da	58
447c544a-6465-45e2-82dd-6b72f2368f8b	59
447c544a-6465-45e2-82dd-6b72f2368f8b	60
e603f1ee-e980-45f3-81b4-dd49e541cf18	61
e603f1ee-e980-45f3-81b4-dd49e541cf18	62
fd481261-2ee1-48c5-883f-589cb0e8ce4c	63
fd481261-2ee1-48c5-883f-589cb0e8ce4c	64
875145fb-a188-4f61-ae92-01e1e620ef1e	65
875145fb-a188-4f61-ae92-01e1e620ef1e	66
68a4d177-11c9-4cf5-a25b-fc893111e9fb	67
68a4d177-11c9-4cf5-a25b-fc893111e9fb	68
4f25cf38-e7ce-49e9-8a32-b45ae733a39b	69
4f25cf38-e7ce-49e9-8a32-b45ae733a39b	70
eac7f899-2803-4296-8ffc-7267b0b2f6f3	71
eac7f899-2803-4296-8ffc-7267b0b2f6f3	72
8ced0986-1117-4be9-b652-65b7ab004522	73
8ced0986-1117-4be9-b652-65b7ab004522	74
142ce12d-9d92-4aea-842a-56b4bbea309a	75
142ce12d-9d92-4aea-842a-56b4bbea309a	76
2f617295-b6ba-46e6-a983-8f122f9611f6	77
2f617295-b6ba-46e6-a983-8f122f9611f6	78
dd884bc0-6c5d-4d1c-b01d-8aba0edef939	79
dd884bc0-6c5d-4d1c-b01d-8aba0edef939	80
12f008f5-3c09-427b-99a1-046d01b9aa22	81
12f008f5-3c09-427b-99a1-046d01b9aa22	82
3b44d995-bbe5-409b-99c8-cf56c6572329	83
3b44d995-bbe5-409b-99c8-cf56c6572329	84
620da0bb-316d-412a-985b-0d59da373767	85
1bac2363-ee0c-448f-840e-c7cbcf69e51a	86
1bac2363-ee0c-448f-840e-c7cbcf69e51a	87
f2e6f1a8-0b53-4854-9907-5154094f501f	88
f2e6f1a8-0b53-4854-9907-5154094f501f	89
b372f4f6-2c67-4b92-a632-52ba15173f5e	90
b372f4f6-2c67-4b92-a632-52ba15173f5e	54
1f9b37e7-f2f3-4ddc-91f0-9c3151052b1d	91
1f9b37e7-f2f3-4ddc-91f0-9c3151052b1d	92
b50c76bf-ae6c-4b7c-bbfe-7b91a0776d04	93
b50c76bf-ae6c-4b7c-bbfe-7b91a0776d04	94
b20b45f8-eaa5-4a6f-b4dc-0b017fdb7cf5	95
b20b45f8-eaa5-4a6f-b4dc-0b017fdb7cf5	96
1c4e4ef1-5edd-4082-bd90-1889168f6818	97
1c4e4ef1-5edd-4082-bd90-1889168f6818	98
96a09961-64a3-453d-b318-0a7c47a42b71	99
96a09961-64a3-453d-b318-0a7c47a42b71	100
65e608d9-c8d8-4e88-a729-b10fad23c4c8	101
65e608d9-c8d8-4e88-a729-b10fad23c4c8	102
acae4d85-10c5-480e-906a-69e2af60779e	103
acae4d85-10c5-480e-906a-69e2af60779e	104
e4051ccc-1720-468e-8f81-3809ebedfe58	105
e4051ccc-1720-468e-8f81-3809ebedfe58	106
84cb261c-a97f-4625-9abe-87516899cc31	107
84cb261c-a97f-4625-9abe-87516899cc31	108
75a36195-4911-4ef0-ad5a-312d3a11adc3	109
75a36195-4911-4ef0-ad5a-312d3a11adc3	110
c5ce6fb7-3506-405d-9381-e1d23f621704	111
c5ce6fb7-3506-405d-9381-e1d23f621704	112
5d916c68-9c95-486f-aef3-63fe3b48a73e	113
5d916c68-9c95-486f-aef3-63fe3b48a73e	114
d54fab4b-65c0-47c7-b05e-bcdef292c47f	115
d54fab4b-65c0-47c7-b05e-bcdef292c47f	116
342f159b-a528-43a7-ae19-686f5895c414	117
342f159b-a528-43a7-ae19-686f5895c414	118
effb9ddd-9c49-43d7-b5d9-d6ce83e397a7	119
effb9ddd-9c49-43d7-b5d9-d6ce83e397a7	120
167a1a3c-ddf6-4347-a245-21ea9e2c1593	121
167a1a3c-ddf6-4347-a245-21ea9e2c1593	122
284c5ad3-fbf3-436d-9357-0ab076088574	123
284c5ad3-fbf3-436d-9357-0ab076088574	64
b7c7c41e-12c7-426b-93ee-e3d2e1f2fec4	124
b7c7c41e-12c7-426b-93ee-e3d2e1f2fec4	125
d98ded37-284d-4221-a233-d2020c2f934f	126
d98ded37-284d-4221-a233-d2020c2f934f	127
40daff7b-c404-45fe-ae84-f40fe759df5d	128
40daff7b-c404-45fe-ae84-f40fe759df5d	129
73149a02-28b0-4202-b599-1c09d2dccbbb	130
73149a02-28b0-4202-b599-1c09d2dccbbb	131
75422e0c-6dc4-470c-b371-e695f7551489	132
75422e0c-6dc4-470c-b371-e695f7551489	133
d38b824e-7f64-4477-b8cf-ecb0212719f8	134
d38b824e-7f64-4477-b8cf-ecb0212719f8	135
a0798db0-9503-4ce7-8d0a-b0ccd1e6cbf6	136
a0798db0-9503-4ce7-8d0a-b0ccd1e6cbf6	137
49470ee9-c31c-487f-bdbb-cb93224057ec	138
49470ee9-c31c-487f-bdbb-cb93224057ec	139
89198a78-8926-457a-b54d-6a88db4358a0	138
89198a78-8926-457a-b54d-6a88db4358a0	139
730d1155-8080-4b34-8fda-c9ddce4371dd	140
730d1155-8080-4b34-8fda-c9ddce4371dd	141
20643aff-44ac-4656-bdff-a9a184d3a308	142
20643aff-44ac-4656-bdff-a9a184d3a308	143
8e517f61-8868-4914-8ac8-bca125ad5cf5	144
8e517f61-8868-4914-8ac8-bca125ad5cf5	145
cdc7465e-bb88-4e4d-97c6-190cc66fec5b	146
cdc7465e-bb88-4e4d-97c6-190cc66fec5b	147
e96df5fb-d579-4b35-a87b-0d966fa41adf	148
e96df5fb-d579-4b35-a87b-0d966fa41adf	149
122397f2-90ca-4e29-9842-82da66fbfcb9	150
122397f2-90ca-4e29-9842-82da66fbfcb9	151
c67056bd-578b-427d-a29c-d6b029514f63	152
c67056bd-578b-427d-a29c-d6b029514f63	153
4120567e-4999-43e8-9e67-809d1e22db88	154
4120567e-4999-43e8-9e67-809d1e22db88	155
d6fb6955-d01c-4d54-a9c8-3f1e8ca33ac4	156
d6fb6955-d01c-4d54-a9c8-3f1e8ca33ac4	157
a5030e1a-8c45-4ae4-bbb5-12009621ed8b	14
a5030e1a-8c45-4ae4-bbb5-12009621ed8b	15
bb41a8b0-3010-488d-8533-22de63e8d4c9	158
b32b6c95-0e68-4a16-9c50-f54f79cbd9c9	159
b32b6c95-0e68-4a16-9c50-f54f79cbd9c9	160
ebf9e567-01f0-477f-8abc-d0724fcb64d8	161
ebf9e567-01f0-477f-8abc-d0724fcb64d8	162
dd8f5ad2-737d-44b3-9c49-ce65edbee9c4	163
dd8f5ad2-737d-44b3-9c49-ce65edbee9c4	164
f2d47fb4-bb48-4c8b-ab2b-4fe98dbf2d78	165
cd5bc435-a351-4992-8c04-cb25dc003732	166
cd5bc435-a351-4992-8c04-cb25dc003732	167
077b0c2f-701f-47e0-b998-03c374b3a520	168
077b0c2f-701f-47e0-b998-03c374b3a520	169
c74b988d-6873-4fb8-92a0-be63e455dc6f	170
c74b988d-6873-4fb8-92a0-be63e455dc6f	171
496e7983-a53f-4ea3-b95f-e8595fd7b4e7	172
496e7983-a53f-4ea3-b95f-e8595fd7b4e7	173
7ee64061-33b2-42a0-973b-955f89d5d92f	174
7ee64061-33b2-42a0-973b-955f89d5d92f	175
573e09f1-1537-47b4-9c97-24ad65ba74e8	176
573e09f1-1537-47b4-9c97-24ad65ba74e8	177
6af3f351-fcad-471e-9a3d-72772e3c1bfd	178
6af3f351-fcad-471e-9a3d-72772e3c1bfd	179
2d5c9999-85d7-4b08-aa6e-fc5513c1debb	73
2d5c9999-85d7-4b08-aa6e-fc5513c1debb	74
ee57c14b-bd54-488f-98f5-3ea4cb94554a	180
59407267-f1b1-4087-a711-7746f509304a	181
59407267-f1b1-4087-a711-7746f509304a	182
3cedb1c4-c377-46ac-8ce4-065316c2e638	183
3cedb1c4-c377-46ac-8ce4-065316c2e638	184
38a95e78-80bb-4119-9e37-1568613fe864	185
38a95e78-80bb-4119-9e37-1568613fe864	186
1b165422-1eaf-42f6-add1-f0bffb3607f8	187
1b165422-1eaf-42f6-add1-f0bffb3607f8	188
5ff9fe06-bdd1-43f9-b921-86ebc0dcc868	189
5ff9fe06-bdd1-43f9-b921-86ebc0dcc868	190
1163e767-bf73-4502-b509-4c08e03f546a	191
1163e767-bf73-4502-b509-4c08e03f546a	192
4b9061ca-0c4a-425b-be9a-6ce9b2a0e0f3	193
4b9061ca-0c4a-425b-be9a-6ce9b2a0e0f3	194
73345285-ac18-4ad5-8901-894c1542e65e	195
73345285-ac18-4ad5-8901-894c1542e65e	196
85d8b3a6-64bc-4751-aa7c-9b56eb1c3f2d	197
85d8b3a6-64bc-4751-aa7c-9b56eb1c3f2d	198
a863d554-3a02-48c9-9f4c-df22b41ed666	199
a863d554-3a02-48c9-9f4c-df22b41ed666	200
29cbcf5b-0f18-47c0-b152-e6b3d6f67ca8	201
29cbcf5b-0f18-47c0-b152-e6b3d6f67ca8	202
9b11fbfa-e958-459f-a7f1-7df4bc0bc07e	203
9b11fbfa-e958-459f-a7f1-7df4bc0bc07e	204
46e7bc94-f3cb-4a64-a787-914ee1225bc4	205
46e7bc94-f3cb-4a64-a787-914ee1225bc4	206
d731abae-20dc-4e88-8d3d-a4a2a18ff01a	207
d731abae-20dc-4e88-8d3d-a4a2a18ff01a	208
286c72aa-0194-4eb0-a4a6-0fa7a3d9788d	209
286c72aa-0194-4eb0-a4a6-0fa7a3d9788d	210
f947a8e8-3303-4d59-9372-520137ddac05	211
f947a8e8-3303-4d59-9372-520137ddac05	212
a3227bae-c230-46ae-a1fe-f1a4fdb13c67	213
a3227bae-c230-46ae-a1fe-f1a4fdb13c67	214
31f8261e-809e-45eb-9ef8-125b68102f55	215
cdb6fdc0-44ae-478c-aff3-49f58f67cfcf	216
10d89a77-fb38-4ccc-9948-77d8e1b62256	217
82ecff62-23c0-468d-8e87-a1b4e342db1a	218
82ecff62-23c0-468d-8e87-a1b4e342db1a	219
c76bba3f-89f1-4cfa-b05a-941ac34be80a	220
750d1305-e3d5-4191-9cd6-1e7ea77c6363	183
750d1305-e3d5-4191-9cd6-1e7ea77c6363	184
deb13f05-a38d-4910-a0c2-ee07e5c104f2	221
deb13f05-a38d-4910-a0c2-ee07e5c104f2	222
14799b1a-9596-4204-9d75-29dc977fa4de	61
14799b1a-9596-4204-9d75-29dc977fa4de	62
dddbd098-3eec-46d4-b4f5-cdf7f15f1638	109
dddbd098-3eec-46d4-b4f5-cdf7f15f1638	110
fd56bf92-62e8-4bd3-b054-8e3e292d3a03	223
b35d8a54-d260-4c40-a0ea-ea349ec7e454	224
b35d8a54-d260-4c40-a0ea-ea349ec7e454	225
d1b3a827-b220-468e-aff0-b04b2e4a4e88	226
d1b3a827-b220-468e-aff0-b04b2e4a4e88	227
6e138a6a-2343-480c-b09d-d734bd7eee24	228
6e138a6a-2343-480c-b09d-d734bd7eee24	229
6c452cf2-3307-4c0e-a1b3-4f5baee9c3ce	230
6c452cf2-3307-4c0e-a1b3-4f5baee9c3ce	231
70845b1d-ca99-4e7e-ba57-bec4279d7f53	232
70845b1d-ca99-4e7e-ba57-bec4279d7f53	233
13635de0-762e-44b8-965a-001571e1922c	234
13635de0-762e-44b8-965a-001571e1922c	235
7e2c867d-e99e-4f27-8a4a-f2e33e98f6bc	236
7e2c867d-e99e-4f27-8a4a-f2e33e98f6bc	237
b9a1f103-744c-456e-99f6-d50c12aafc2d	238
b9a1f103-744c-456e-99f6-d50c12aafc2d	239
eee33dcb-803a-4d07-a7fe-fbc7e7c8b84e	240
eee33dcb-803a-4d07-a7fe-fbc7e7c8b84e	241
4a72ec48-b917-4f2e-8f98-4aea8c80a30b	242
4a72ec48-b917-4f2e-8f98-4aea8c80a30b	243
4a54b0f9-a722-46d9-b95f-28df549a33c7	244
4a54b0f9-a722-46d9-b95f-28df549a33c7	245
d09157a4-bff9-4106-a3ae-30292164f649	246
d09157a4-bff9-4106-a3ae-30292164f649	247
ee6f4e7e-53c2-4d66-9220-8e8112c2347a	10
ee6f4e7e-53c2-4d66-9220-8e8112c2347a	11
3f897370-0f2b-4c0f-bb34-f748e542ce9d	132
\.


--
-- Data for Name: student_payment_discount_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_payment_discount_lines (id, student_payment_id, discount_type_id, amount, remarks, created_at) FROM stdin;
e1f5b640-3f7e-4bef-9019-34f7f9387b10	3385dec9-a7e0-4f1b-822b-5876a00b8d35	ad242bf8-85b2-4327-bbbd-2bfc011d0918	100.00	arthwth	2026-05-14 07:07:20.56784+04
\.


--
-- Data for Name: student_payment_installment_receipts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_payment_installment_receipts (id, student_payment_id, level_payment_installment_id, amount, paid_at, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_payments (id, student_id, school_id, level_id, level_payment_profile_id, base_total_amount, admin_adjusted_total, currency, created_at, updated_at, course_id, course_payment_profile_id) FROM stdin;
abd4fc56-f7d1-439c-9d00-d3cd50bfbdb0	73345285-ac18-4ad5-8901-894c1542e65e	1	a37141f3-3407-4750-b747-d05758a2d650	2541cd45-9d20-471d-8970-82ed831aa82b	200.00	200.00	OMR	2026-05-14 00:39:06.756666+04	2026-05-14 00:39:17.729349+04	\N	\N
1317328f-43af-4145-87ad-58979428d279	286c72aa-0194-4eb0-a4a6-0fa7a3d9788d	1	a37141f3-3407-4750-b747-d05758a2d650	2541cd45-9d20-471d-8970-82ed831aa82b	200.00	\N	OMR	2026-05-14 00:39:36.928838+04	2026-05-14 00:39:36.928838+04	\N	\N
10d7dd2b-5f83-4438-acb8-dd72bd360520	70845b1d-ca99-4e7e-ba57-bec4279d7f53	1	a37141f3-3407-4750-b747-d05758a2d650	2541cd45-9d20-471d-8970-82ed831aa82b	200.00	\N	OMR	2026-05-14 00:39:40.316314+04	2026-05-14 00:39:40.316314+04	\N	\N
60fb10b3-77b1-440b-972c-905b521b8ab5	29cbcf5b-0f18-47c0-b152-e6b3d6f67ca8	1	a37141f3-3407-4750-b747-d05758a2d650	2541cd45-9d20-471d-8970-82ed831aa82b	200.00	\N	OMR	2026-05-14 00:39:43.032776+04	2026-05-14 00:39:43.032776+04	\N	\N
9715f383-64c3-41c4-8c10-4518278ad8db	3cedb1c4-c377-46ac-8ce4-065316c2e638	1	a37141f3-3407-4750-b747-d05758a2d650	2541cd45-9d20-471d-8970-82ed831aa82b	200.00	\N	OMR	2026-05-14 00:39:55.561232+04	2026-05-14 00:39:55.561232+04	\N	\N
04fa7c60-d4d6-4b6b-9706-3b89fae2b6ec	750d1305-e3d5-4191-9cd6-1e7ea77c6363	1	a37141f3-3407-4750-b747-d05758a2d650	2541cd45-9d20-471d-8970-82ed831aa82b	200.00	\N	OMR	2026-05-14 00:39:56.811344+04	2026-05-14 00:39:56.811344+04	\N	\N
1a78e794-3670-4016-9330-a4f23bf87c3a	4a54b0f9-a722-46d9-b95f-28df549a33c7	1	a37141f3-3407-4750-b747-d05758a2d650	2541cd45-9d20-471d-8970-82ed831aa82b	200.00	\N	OMR	2026-05-14 00:40:00.99253+04	2026-05-14 00:40:00.99253+04	\N	\N
d2e88a17-c26c-486f-86c9-52bc102564b4	9b11fbfa-e958-459f-a7f1-7df4bc0bc07e	1	a37141f3-3407-4750-b747-d05758a2d650	2541cd45-9d20-471d-8970-82ed831aa82b	200.00	\N	OMR	2026-05-14 00:40:01.5752+04	2026-05-14 00:40:01.5752+04	\N	\N
f9b99065-0bb6-4866-ad45-65cfe59eff63	ee6f4e7e-53c2-4d66-9220-8e8112c2347a	1	a37141f3-3407-4750-b747-d05758a2d650	2541cd45-9d20-471d-8970-82ed831aa82b	200.00	200.00	OMR	2026-05-14 00:40:06.834379+04	2026-05-14 00:40:09.353194+04	\N	\N
a378a4a5-2db7-4557-8887-e0bc938653a7	00d19686-927d-410b-b746-23defff4953c	1	a37141f3-3407-4750-b747-d05758a2d650	2541cd45-9d20-471d-8970-82ed831aa82b	200.00	\N	OMR	2026-05-14 00:44:42.808148+04	2026-05-14 00:44:42.808148+04	\N	\N
3385dec9-a7e0-4f1b-822b-5876a00b8d35	21c9654d-e11f-41a8-9163-381f573665fb	1	a37141f3-3407-4750-b747-d05758a2d650	2541cd45-9d20-471d-8970-82ed831aa82b	200.00	\N	OMR	2026-05-14 06:43:13.482717+04	2026-05-14 06:43:13.482717+04	\N	\N
8089e593-70ad-48fc-a131-2b958b01f361	ab3e3706-5b1d-4e9f-a4b2-4f435e7f8067	1	a37141f3-3407-4750-b747-d05758a2d650	2541cd45-9d20-471d-8970-82ed831aa82b	79879.00	\N	OMR	2026-05-16 11:36:25.682108+04	2026-05-16 11:36:25.682108+04	\N	\N
9fe8f8b0-d066-4edb-b311-6e05cbf2af6f	fdd4c303-ea1d-4a8d-bf18-172f6f408e74	1	a37141f3-3407-4750-b747-d05758a2d650	2541cd45-9d20-471d-8970-82ed831aa82b	592791.00	\N	OMR	2026-05-16 19:52:53.570617+04	2026-05-16 19:52:53.570617+04	\N	\N
a2b2e484-8178-4528-9ee9-b7cdbd0f14c3	38a95e78-80bb-4119-9e37-1568613fe864	1	a37141f3-3407-4750-b747-d05758a2d650	2541cd45-9d20-471d-8970-82ed831aa82b	592791.00	\N	OMR	2026-05-16 21:29:09.342902+04	2026-05-16 21:29:09.342902+04	\N	\N
d6086e37-f0ad-4be7-ac90-ff5ecc627668	1163e767-bf73-4502-b509-4c08e03f546a	1	a37141f3-3407-4750-b747-d05758a2d650	2541cd45-9d20-471d-8970-82ed831aa82b	558602.00	\N	OMR	2026-05-16 22:11:23.864053+04	2026-05-16 22:11:23.864053+04	\N	\N
\.


--
-- Data for Name: student_progress; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_progress (id, status, score, points_earned, teacher_notes, student_notes, started_date, completed_date, due_date, is_late_submission, attempts_count, feedback, attachments, student_id, course_id, milestone_id, updated_by, created_at, updated_at) FROM stdin;
5	postponed	\N	\N	aertdhaqerth	\N	\N	\N	\N	f	\N	\N	\N	ee6f4e7e-53c2-4d66-9220-8e8112c2347a	7d9cc680-1a3d-4090-9f54-66bb2155981d	77bbfdc3-23f1-4b82-b107-0aac6ee15fdf	1	2026-04-19 21:10:06.904463	2026-04-19 21:10:06.904463
6	completed	\N	\N		\N	2026-04-19	2026-04-26	\N	f	\N	\N	\N	ee6f4e7e-53c2-4d66-9220-8e8112c2347a	7d9cc680-1a3d-4090-9f54-66bb2155981d	f654e0a2-fb85-4ad9-bb54-292aa28c48cf	1	2026-04-19 21:10:19.954516	2026-04-19 21:10:19.954516
7	postponed	\N	\N	تغلغل	\N	\N	\N	\N	f	\N	\N	\N	ee6f4e7e-53c2-4d66-9220-8e8112c2347a	cc1a9c19-1909-4c0e-a869-d85cd685840a	7516e459-389c-435f-bf72-2595ad34643f	1	2026-04-19 23:12:07.486649	2026-04-19 23:12:07.486649
8	completed	\N	\N		\N	2026-04-18	2026-04-19	\N	f	\N	\N	\N	14799b1a-9596-4204-9d75-29dc977fa4de	cc1a9c19-1909-4c0e-a869-d85cd685840a	7516e459-389c-435f-bf72-2595ad34643f	1	2026-04-19 23:12:21.442477	2026-04-19 23:12:21.442477
9	completed	\N	\N	لا توجد ملاحظات	\N	2026-05-01	2026-05-02	\N	f	\N	\N	\N	6f28a8bf-0035-459b-90f5-47a45d52bc1e	cc1a9c19-1909-4c0e-a869-d85cd685840a	7516e459-389c-435f-bf72-2595ad34643f	1	2026-05-01 22:12:07.703834	2026-05-01 22:12:07.703834
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.students (id, "firstName", "lastName", "dateOfBirth", gender, address, phone, email, "emergencyContact", "medicalInfo", notes, "secondName", "thirdName", nationality, "studentId", photo, "createdAt", "updatedAt", user_id, school_id, room_id, first_name, family_name, date_of_birth, medical_conditions, allergies, emergency_contact, group_id, created_at, updated_at, payment_level_id) FROM stdin;
6f28a8bf-0035-459b-90f5-47a45d52bc1e	درر	المسكرية	2020-11-01	female	علاية	\N	\N	94811096	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:07.058765	2025-11-01 13:05:07.058765	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:07.058765	2025-11-01 13:05:07.058765	\N
273933e4-0027-4a0a-8fd3-eb29449897fc	روان	العويدي	2020-08-24	female	الشخابيط	\N	\N	95464181	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:07.35692	2025-11-01 13:05:07.35692	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:07.35692	2025-11-01 13:05:07.35692	\N
1f9ddabb-62de-4485-a1c9-c3f2a445bddd	ضياء	المسكرية	2020-04-27	female	اليحمدي	\N	\N	95932973	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:07.432934	2025-11-01 13:05:07.432934	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:07.432934	2025-11-01 13:05:07.432934	\N
9cc2ae8c-60c5-4bc8-b5c2-2b881c182bd1	صفاء	المسكرية	2020-05-10	female	علاية السيح الجديد	\N	\N	95145009	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:07.727782	2025-11-01 13:05:07.727782	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:07.727782	2025-11-01 13:05:07.727782	\N
9fec0ef1-5280-4ab7-bb2d-4d4099fef70b	ناصر	الرحبي	2020-04-05	male	اليحمدي	\N	\N	98877226	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:07.876096	2025-11-01 13:05:07.876096	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:07.876096	2025-11-01 13:05:07.876096	\N
d6683690-f47a-4c87-bfff-494e0955c2ac	بدر	الرحبي	2020-08-03	male	مصرون	\N	\N	94622794	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:08.023791	2025-11-01 13:05:08.023791	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:08.023791	2025-11-01 13:05:08.023791	\N
8d5a3b08-eff9-49ef-9725-23bcf4ae91e8	رؤى	الحارثية	2020-05-14	female	القابل \\ عز	\N	\N	96933177	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:08.169283	2025-11-01 13:05:08.169283	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:08.169283	2025-11-01 13:05:08.169283	\N
f9b40636-6be2-49cf-86b1-1c912183b399	حسينة	السعدية	2020-04-01	female	وادي نام\\ النبأ	\N	\N	79070704	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:08.315739	2025-11-01 13:05:08.315739	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:08.315739	2025-11-01 13:05:08.315739	\N
d8dabcc8-0225-4331-882e-e21e3a27111d	غيم	اليزيدية	2020-07-25	female	الثابتي	\N	\N	97291529	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:08.461905	2025-11-01 13:05:08.461905	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:08.461905	2025-11-01 13:05:08.461905	\N
06c6d5e1-51d3-47fe-80b9-7fec6903a58b	اليزن	الكعبي	2020-07-24	male	وادي نام\\ النبأ	\N	\N	71179339	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:08.609257	2025-11-01 13:05:08.609257	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:08.609257	2025-11-01 13:05:08.609257	\N
b55d86fe-2938-4aba-872c-07d32c0f90d0	ملاك	المسكرية	2020-07-01	female	علاية	\N	\N	95054707	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:08.75341	2025-11-01 13:05:08.75341	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:08.75341	2025-11-01 13:05:08.75341	\N
93924917-415a-41fb-84c6-931b74716d89	سما	المغيرية	2020-07-07	female	اليحمدي	\N	\N	99522564	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:08.900577	2025-11-01 13:05:08.900577	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:08.900577	2025-11-01 13:05:08.900577	\N
5c0ae62c-8be3-4532-b4ae-24e54be47012	رؤى	البراشدية	2020-05-09	female	المنجرد	\N	\N	91200005	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:09.046136	2025-11-01 13:05:09.046136	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:09.046136	2025-11-01 13:05:09.046136	\N
82605502-5a52-4dae-a571-3646385039df	محمد	الحارثي	2020-03-29	male	القلة\\سفالة	\N	\N	92575676	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:09.192027	2025-11-01 13:05:09.192027	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:09.192027	2025-11-01 13:05:09.192027	\N
2560128e-92c2-483a-8aaa-3ec0daec14cd	هيثم	المسكري	2019-11-30	male	النصيب	\N	\N	77265536	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:09.484418	2025-11-01 13:05:09.484418	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:09.484418	2025-11-01 13:05:09.484418	\N
f4d8147f-5ace-4bf3-a94c-e90cde759011	الحسن	البرواني	2020-09-11	male	القابل\\الدريز	\N	\N	95056160	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:09.775767	2025-11-01 13:05:09.775767	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:09.775767	2025-11-01 13:05:09.775767	\N
84511774-806e-4cca-8475-d87f752fa0a0	زكريا	الإسماعيلي	2020-02-15	male	الحزم	\N	\N	92909567	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:09.922151	2025-11-01 13:05:09.922151	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:09.922151	2025-11-01 13:05:09.922151	\N
f20c7070-3678-46ba-8dfb-d22c230907fb	عزام	السعدي	2020-06-08	male	النبأ \\ حلة السعديين	\N	\N	96609639	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:10.068607	2025-11-01 13:05:10.068607	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:10.068607	2025-11-01 13:05:10.068607	\N
1a25f905-bddc-4111-8a8e-7c315368d66f	زياد	الطوقي	2020-07-28	male	شخابيط\\سيح العافية	\N	\N	94291888	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:10.21353	2025-11-01 13:05:10.21353	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:10.21353	2025-11-01 13:05:10.21353	\N
d2d06916-e1c6-4082-b675-a0fd0ab6dae2	ماجد	المسكري	2020-05-08	male	الطرق	\N	\N	96252560	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:10.357847	2025-11-01 13:05:10.357847	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:10.357847	2025-11-01 13:05:10.357847	\N
34d84d32-e346-4297-9d8b-5e9af86ac67b	نور	المصلحية	2020-03-04	female	علاية	\N	\N	99252117	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:10.502111	2025-11-01 13:05:10.502111	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:10.502111	2025-11-01 13:05:10.502111	\N
af7ce97b-f4a3-45d4-8e0d-6663b5840a51	بندر	السعدي	2020-05-02	male	النبأ \\ حلة السعديين	\N	\N	99650307	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:10.649691	2025-11-01 13:05:10.649691	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:10.649691	2025-11-01 13:05:10.649691	\N
31c1b475-e8a3-4ad4-9a12-e7efd67d6b48	آية	الحارثية	2019-11-17	female	السفالة	\N	\N	92863313	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:10.725332	2025-11-01 13:05:10.725332	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:10.725332	2025-11-01 13:05:10.725332	\N
fd380b77-5060-47b4-bea8-edc28b2f560b	طارق	اليزيدي	2020-02-20	male	الثابتي	\N	\N	99432661	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:10.871876	2025-11-01 13:05:10.871876	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:10.871876	2025-11-01 13:05:10.871876	\N
798a0783-aec2-4bb4-a505-7e2f20a0b0b2	عهد	المسكرية	2020-11-02	female	اليحمدي	\N	\N	99277523	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:10.947359	2025-11-01 13:05:10.947359	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:10.947359	2025-11-01 13:05:10.947359	\N
8cb5b8aa-4135-4b0a-9d09-ad10ad56b474	الخطاب	المصلحي	2020-01-18	male	اليحمدي	\N	\N	94050440	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:11.093222	2025-11-01 13:05:11.093222	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:11.093222	2025-11-01 13:05:11.093222	\N
5d0b7ad2-721d-4dfb-b9ed-ab7bc21de1da	لين	السعدية	2020-06-21	female	وادي نام \\النبأ	\N	\N	94365977	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:11.238629	2025-11-01 13:05:11.238629	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:11.238629	2025-11-01 13:05:11.238629	\N
447c544a-6465-45e2-82dd-6b72f2368f8b	أجوان	المسكرية	2020-04-16	female	اليحمدي	\N	\N	95177699	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:11.385344	2025-11-01 13:05:11.385344	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:11.385344	2025-11-01 13:05:11.385344	\N
e603f1ee-e980-45f3-81b4-dd49e541cf18	القاسم	الإسماعيلي	2020-08-25	male	النصيب	\N	\N	92996869	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:11.532576	2025-11-01 13:05:11.532576	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:11.532576	2025-11-01 13:05:11.532576	\N
fd481261-2ee1-48c5-883f-589cb0e8ce4c	سلطانة	المسكرية	2020-07-26	female	علاية	\N	\N	78048099	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:11.677761	2025-11-01 13:05:11.677761	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:11.677761	2025-11-01 13:05:11.677761	\N
875145fb-a188-4f61-ae92-01e1e620ef1e	ريما	المسكرية	2019-12-26	female	اليحمدي	\N	\N	91161333	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:11.826081	2025-11-01 13:05:11.826081	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:11.826081	2025-11-01 13:05:11.826081	\N
68a4d177-11c9-4cf5-a25b-fc893111e9fb	جمانة	الحارثية	2020-10-11	female	سيح العافية	\N	\N	96988621	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:11.971833	2025-11-01 13:05:11.971833	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:11.971833	2025-11-01 13:05:11.971833	\N
4f25cf38-e7ce-49e9-8a32-b45ae733a39b	تسنيم	المصلحية	2020-12-24	female	علاية \\السياح	\N	\N	98000822	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:12.116732	2025-11-01 13:05:12.116732	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:12.116732	2025-11-01 13:05:12.116732	\N
eac7f899-2803-4296-8ffc-7267b0b2f6f3	الهنوف	الحارثي	2020-06-19	female	القفيصي	\N	\N	99123363	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:12.263122	2025-11-01 13:05:12.263122	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:12.263122	2025-11-01 13:05:12.263122	\N
8ced0986-1117-4be9-b652-65b7ab004522	سُلطان	اليعرُبي	2020-04-01	male	الثابتي	\N	\N	95441993	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:12.40927	2025-11-01 13:05:12.40927	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:12.40927	2025-11-01 13:05:12.40927	\N
142ce12d-9d92-4aea-842a-56b4bbea309a	سالم	المسكري	2020-12-12	male	اليحمدي	\N	\N	95910310	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:12.557717	2025-11-01 13:05:12.557717	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:12.557717	2025-11-01 13:05:12.557717	\N
2f617295-b6ba-46e6-a983-8f122f9611f6	عبدالله	الغيثي	2020-10-08	male	نقل خاص	\N	\N	91964112	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:12.706586	2025-11-01 13:05:12.706586	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:12.706586	2025-11-01 13:05:12.706586	\N
dd884bc0-6c5d-4d1c-b01d-8aba0edef939	مزن	المسكرية	2020-04-03	female	اليحمدي	\N	\N	95239039	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:12.851022	2025-11-01 13:05:12.851022	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:12.851022	2025-11-01 13:05:12.851022	\N
12f008f5-3c09-427b-99a1-046d01b9aa22	آية	المغيرية	2020-10-19	female	سيح الشخابيط	\N	\N	96010653	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:13.06918	2025-11-01 13:05:13.06918	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:13.06918	2025-11-01 13:05:13.06918	\N
3b44d995-bbe5-409b-99c8-cf56c6572329	شبيب	الغنيمي	2020-09-06	male	وادي نام \\النبأ	\N	\N	98532380	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:13.213712	2025-11-01 13:05:13.213712	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:13.213712	2025-11-01 13:05:13.213712	\N
620da0bb-316d-412a-985b-0d59da373767	أنس	السعدي	2020-03-07	male	الشخابيط	\N	\N	95611424	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:13.359249	2025-11-01 13:05:13.359249	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:13.359249	2025-11-01 13:05:13.359249	\N
1bac2363-ee0c-448f-840e-c7cbcf69e51a	الآء	الأبروية	2020-11-21	female	القفيصي	\N	\N	98888208	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:13.433954	2025-11-01 13:05:13.433954	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:13.433954	2025-11-01 13:05:13.433954	\N
f2e6f1a8-0b53-4854-9907-5154094f501f	سيف	الغنيمي	2020-02-10	male	وادي نام \\النبأ	\N	\N	97390222	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:13.578561	2025-11-01 13:05:13.578561	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:13.578561	2025-11-01 13:05:13.578561	\N
b372f4f6-2c67-4b92-a632-52ba15173f5e	أمنة	المسكرية	2020-01-03	female	اليحمدي	\N	\N	90197579	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:13.724433	2025-11-01 13:05:13.724433	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:13.724433	2025-11-01 13:05:13.724433	\N
21c9654d-e11f-41a8-9163-381f573665fb	أحمد	الإسماعيلي	2020-08-17	male	النصيب	\N	\N	97772831	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:09.337498	2026-05-14 06:43:13.472258	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:09.337498	2025-11-01 13:05:09.337498	a37141f3-3407-4750-b747-d05758a2d650
ab3e3706-5b1d-4e9f-a4b2-4f435e7f8067	صالح	المسكري	2020-10-13	male	اليحمدي	\N	\N	96173736	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:07.209418	2026-05-16 11:36:25.662701	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:07.209418	2025-11-01 13:05:07.209418	a37141f3-3407-4750-b747-d05758a2d650
fdd4c303-ea1d-4a8d-bf18-172f6f408e74	سعيد	الحارثي	2020-08-24	male	سيح العافية	\N	\N	98885014	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:07.579718	2026-05-16 19:52:53.562124	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:07.579718	2025-11-01 13:05:07.579718	a37141f3-3407-4750-b747-d05758a2d650
1f9b37e7-f2f3-4ddc-91f0-9c3151052b1d	حلا	اليزيدية	2020-03-19	female	الثابتي	\N	\N	91221290	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:13.798204	2025-11-01 13:05:13.798204	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:13.798204	2025-11-01 13:05:13.798204	\N
b50c76bf-ae6c-4b7c-bbfe-7b91a0776d04	هبة	الأبروية	2020-10-05	female	النصيب	\N	\N	91102383	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:13.943533	2025-11-01 13:05:13.943533	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:13.943533	2025-11-01 13:05:13.943533	\N
b20b45f8-eaa5-4a6f-b4dc-0b017fdb7cf5	هيثم	اليزيدي	2020-06-09	male	الثابتي	\N	\N	99898928	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:14.087962	2025-11-01 13:05:14.087962	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:14.087962	2025-11-01 13:05:14.087962	\N
1c4e4ef1-5edd-4082-bd90-1889168f6818	رهام	الرحبية	2020-03-10	female	اليحمدي	\N	\N	94499896	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:14.236546	2025-11-01 13:05:14.236546	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:14.236546	2025-11-01 13:05:14.236546	\N
96a09961-64a3-453d-b318-0a7c47a42b71	مريم	السعدية	2020-01-22	female	الشخابيط	\N	\N	92518477	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:14.389937	2025-11-01 13:05:14.389937	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:14.389937	2025-11-01 13:05:14.389937	\N
65e608d9-c8d8-4e88-a729-b10fad23c4c8	الحسن	المصلحي	2020-07-08	male	النبأ	\N	\N	90946647	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:14.54151	2025-11-01 13:05:14.54151	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:14.54151	2025-11-01 13:05:14.54151	\N
acae4d85-10c5-480e-906a-69e2af60779e	محمد	اليزيدي	2020-06-26	male	الثابتي	\N	\N	96067035	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:14.685293	2025-11-01 13:05:14.685293	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:14.685293	2025-11-01 13:05:14.685293	\N
e4051ccc-1720-468e-8f81-3809ebedfe58	نبراس	الحارثي	2020-04-18	male	سيح الشخابيط	\N	\N	96433061	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:14.830551	2025-11-01 13:05:14.830551	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:14.830551	2025-11-01 13:05:14.830551	\N
84cb261c-a97f-4625-9abe-87516899cc31	هبة	الغنيمية	2020-04-08	female	النبأ حلة الغنيمي	\N	\N	93251825	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:14.975782	2025-11-01 13:05:14.975782	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:14.975782	2025-11-01 13:05:14.975782	\N
75a36195-4911-4ef0-ad5a-312d3a11adc3	إيلاف	النظيرية	2020-01-24	female	السفالة	\N	\N	96927883	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:15.12624	2025-11-01 13:05:15.12624	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:15.12624	2025-11-01 13:05:15.12624	\N
c5ce6fb7-3506-405d-9381-e1d23f621704	مسك	المسكرية	2020-10-30	female	الدكيك	\N	\N	96448770	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:15.275227	2025-11-01 13:05:15.275227	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:15.275227	2025-11-01 13:05:15.275227	\N
5d916c68-9c95-486f-aef3-63fe3b48a73e	أمجد	السابقي	2020-11-16	male	عمان	\N	\N	93555689	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:15.421964	2025-11-01 13:05:15.421964	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:15.421964	2025-11-01 13:05:15.421964	\N
d54fab4b-65c0-47c7-b05e-bcdef292c47f	فارس	الغنيمي	2020-10-02	male	الصرم	\N	\N	99262434	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:15.568476	2025-11-01 13:05:15.568476	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:15.568476	2025-11-01 13:05:15.568476	\N
342f159b-a528-43a7-ae19-686f5895c414	عمر	الحارثي	2020-07-16	male	عمان	\N	\N	97277795	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:15.714723	2025-11-01 13:05:15.714723	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:15.714723	2025-11-01 13:05:15.714723	\N
effb9ddd-9c49-43d7-b5d9-d6ce83e397a7	سارة	الطوقية	2020-03-24	female	المويلح	\N	\N	95426643	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:15.867039	2025-11-01 13:05:15.867039	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:15.867039	2025-11-01 13:05:15.867039	\N
167a1a3c-ddf6-4347-a245-21ea9e2c1593	هاجر	الأبروية	2020-10-25	female	علاية \\السياح	\N	\N	99119220	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:16.085428	2025-11-01 13:05:16.085428	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:16.085428	2025-11-01 13:05:16.085428	\N
284c5ad3-fbf3-436d-9357-0ab076088574	بشائر	المسكرية	2020-03-03	female	علاية	\N	\N	98963964	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:16.230701	2025-11-01 13:05:16.230701	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:16.230701	2025-11-01 13:05:16.230701	\N
b7c7c41e-12c7-426b-93ee-e3d2e1f2fec4	هاجر	المصلحية	2020-09-29	female	وادي نام \\النبأ	\N	\N	99113491	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:16.305153	2025-11-01 13:05:16.305153	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:16.305153	2025-11-01 13:05:16.305153	\N
d98ded37-284d-4221-a233-d2020c2f934f	سلطان	المغيري	2020-08-09	male	سيح الشخابيط	\N	\N	95967228	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:16.451522	2025-11-01 13:05:16.451522	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:16.451522	2025-11-01 13:05:16.451522	\N
40daff7b-c404-45fe-ae84-f40fe759df5d	مريم	الريامية	2020-03-20	female	الثابتي	\N	\N	92929386	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:16.597149	2025-11-01 13:05:16.597149	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:16.597149	2025-11-01 13:05:16.597149	\N
73149a02-28b0-4202-b599-1c09d2dccbbb	البتول	المصلحي	2020-03-13	female	وادي نام \\النبأ	\N	\N	92260170	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:16.741305	2025-11-01 13:05:16.741305	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:16.741305	2025-11-01 13:05:16.741305	\N
75422e0c-6dc4-470c-b371-e695f7551489	محمد	اليزيدي	2021-02-03	male	الثابتي	\N	\N	92933730	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:16.886685	2025-11-01 13:05:16.886685	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:16.886685	2025-11-01 13:05:16.886685	\N
d38b824e-7f64-4477-b8cf-ecb0212719f8	سليمان	السعدي	2020-12-09	male	وادي نام \\النبأ	\N	\N	95128431	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:17.033224	2025-11-01 13:05:17.033224	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:17.033224	2025-11-01 13:05:17.033224	\N
a0798db0-9503-4ce7-8d0a-b0ccd1e6cbf6	جمان	الرحبية	2020-01-10	female	اليحمدي	\N	\N	95924561	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:17.181096	2025-11-01 13:05:17.181096	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:17.181096	2025-11-01 13:05:17.181096	\N
49470ee9-c31c-487f-bdbb-cb93224057ec	سارة	السيابية	2020-05-04	female	القفيصي	\N	\N	92837305	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:17.327121	2025-11-01 13:05:17.327121	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:17.327121	2025-11-01 13:05:17.327121	\N
89198a78-8926-457a-b54d-6a88db4358a0	حمد	السيابي	2020-05-04	male	القفيصي	\N	\N	92837305	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:17.474447	2025-11-01 13:05:17.474447	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:17.474447	2025-11-01 13:05:17.474447	\N
730d1155-8080-4b34-8fda-c9ddce4371dd	سعيد	السيابي	2020-09-22	male	القفيصي	\N	\N	95266492	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:17.48155	2025-11-01 13:05:17.48155	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:17.48155	2025-11-01 13:05:17.48155	\N
20643aff-44ac-4656-bdff-a9a184d3a308	يحيى	البراشدي	2021-02-20	male	السفالة	\N	\N	99899662	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:17.627574	2025-11-01 13:05:17.627574	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:17.627574	2025-11-01 13:05:17.627574	\N
8e517f61-8868-4914-8ac8-bca125ad5cf5	تيمور	المصلحي	2020-06-08	male	وادي نام \\النبأ	\N	\N	93336581	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:17.774324	2025-11-01 13:05:17.774324	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:17.774324	2025-11-01 13:05:17.774324	\N
cdc7465e-bb88-4e4d-97c6-190cc66fec5b	نور	السعدية	2020-11-11	female	الشخابيط	\N	\N	93527457	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:17.922571	2025-11-01 13:05:17.922571	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:17.922571	2025-11-01 13:05:17.922571	\N
e96df5fb-d579-4b35-a87b-0d966fa41adf	فرح	الشحيمية	2022-02-07	female	القلة	\N	\N	99669597	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:18.139505	2025-11-01 13:05:18.139505	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:18.139505	2025-11-01 13:05:18.139505	\N
122397f2-90ca-4e29-9842-82da66fbfcb9	حمزة	المسكري	2021-01-12	male	اليحمدي	\N	\N	92311816	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:18.283941	2025-11-01 13:05:18.283941	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:18.283941	2025-11-01 13:05:18.283941	\N
c67056bd-578b-427d-a29c-d6b029514f63	لتين	المسكري	2021-01-01	female	اليحمدي	\N	\N	95931443	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:18.42931	2025-11-01 13:05:18.42931	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:18.42931	2025-11-01 13:05:18.42931	\N
4120567e-4999-43e8-9e67-809d1e22db88	ملاك	العزري	2021-12-05	female	القابل	\N	\N	98200029	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:18.575994	2025-11-01 13:05:18.575994	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:18.575994	2025-11-01 13:05:18.575994	\N
d6fb6955-d01c-4d54-a9c8-3f1e8ca33ac4	يوسف	الصقري	2022-01-01	male	القابل	\N	\N	95215738	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:18.720815	2025-11-01 13:05:18.720815	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:18.720815	2025-11-01 13:05:18.720815	\N
a5030e1a-8c45-4ae4-bbb5-12009621ed8b	سامي	الرحبي	2022-01-04	male	مصرون	\N	\N	94622794	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:18.866397	2025-11-01 13:05:18.866397	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:18.866397	2025-11-01 13:05:18.866397	\N
bb41a8b0-3010-488d-8533-22de63e8d4c9	أنس	الحارثي	2022-02-02	male	السفالة	\N	\N	96402929	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:18.871284	2025-11-01 13:05:18.871284	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:18.871284	2025-11-01 13:05:18.871284	\N
b32b6c95-0e68-4a16-9c50-f54f79cbd9c9	أنس	الحارثي	2021-03-13	male	السفالة	\N	\N	94484465	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:18.946476	2025-11-01 13:05:18.946476	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:18.946476	2025-11-01 13:05:18.946476	\N
ebf9e567-01f0-477f-8abc-d0724fcb64d8	سدى	البوسعيدية	2021-04-02	female	علاية	\N	\N	99378699	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:19.091681	2025-11-01 13:05:19.091681	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:19.091681	2025-11-01 13:05:19.091681	\N
dd8f5ad2-737d-44b3-9c49-ce65edbee9c4	نسيبة	الصوافية	2021-02-22	female	سيح الشخابيط	\N	\N	97126778	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:19.236333	2025-11-01 13:05:19.236333	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:19.236333	2025-11-01 13:05:19.236333	\N
f2d47fb4-bb48-4c8b-ab2b-4fe98dbf2d78	صهيب	الحارثي	2021-08-05	male	سيح العافية	\N	\N	95175490	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:19.386634	2025-11-01 13:05:19.386634	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:19.386634	2025-11-01 13:05:19.386634	\N
cd5bc435-a351-4992-8c04-cb25dc003732	الحسن	الطالعي	2021-08-26	male	الدكيك	\N	\N	94141523	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:19.461109	2025-11-01 13:05:19.461109	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:19.461109	2025-11-01 13:05:19.461109	\N
077b0c2f-701f-47e0-b998-03c374b3a520	شمه	الرحبية	2021-05-21	female	جديا	\N	\N	96063357	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:19.607045	2025-11-01 13:05:19.607045	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:19.607045	2025-11-01 13:05:19.607045	\N
c74b988d-6873-4fb8-92a0-be63e455dc6f	شعيب	المسكري	2021-04-11	male	اليحمدي	\N	\N	92892110	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:19.754525	2025-11-01 13:05:19.754525	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:19.754525	2025-11-01 13:05:19.754525	\N
496e7983-a53f-4ea3-b95f-e8595fd7b4e7	سبأ	الغزالية	2021-03-08	female	القابل	\N	\N	95677123	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:19.899679	2025-11-01 13:05:19.899679	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:19.899679	2025-11-01 13:05:19.899679	\N
7ee64061-33b2-42a0-973b-955f89d5d92f	جمان	السعدية	2021-03-10	female	النبأ	\N	\N	95412391	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:20.045504	2025-11-01 13:05:20.045504	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:20.045504	2025-11-01 13:05:20.045504	\N
573e09f1-1537-47b4-9c97-24ad65ba74e8	سعود	الراشدي	2021-02-10	male	الطرق	\N	\N	92891771	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:20.192891	2025-11-01 13:05:20.192891	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:20.192891	2025-11-01 13:05:20.192891	\N
6af3f351-fcad-471e-9a3d-72772e3c1bfd	منذر	الحارثي	2021-04-04	male	القابل\\عز	\N	\N	95343856	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:20.339563	2025-11-01 13:05:20.339563	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:20.339563	2025-11-01 13:05:20.339563	\N
2d5c9999-85d7-4b08-aa6e-fc5513c1debb	الجُلندى	اليعرُبي	2021-12-02	male	الثابتي	\N	\N	95441993	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:20.484807	2025-11-01 13:05:20.484807	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:20.484807	2025-11-01 13:05:20.484807	\N
00d19686-927d-410b-b746-23defff4953c	انسام	الاسماعيلية	2020-07-14	female	الحزم	\N	\N	95530331	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:09.631233	2026-05-14 00:55:13.857335	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:09.631233	2025-11-01 13:05:09.631233	a37141f3-3407-4750-b747-d05758a2d650
f9bda06e-75f3-4c50-8ab8-c51b5988ab62	egewrth	ethwerth	2026-05-17	female	Default Address	\N	\N	No emergency contact	wetrhweth	Registered on 2026-05-16T15:24:14.887Z	\N	\N	\N	\N	\N	2026-05-16 19:24:14.956321	2026-05-16 19:24:14.956321	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-16 19:24:14.956321	2026-05-16 19:24:14.956321	\N
38a95e78-80bb-4119-9e37-1568613fe864	سعد	السيابي	2022-05-01	male	عمان	\N	\N	91414109	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:20.933078	2026-05-16 21:29:09.332273	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:20.933078	2025-11-01 13:05:20.933078	a37141f3-3407-4750-b747-d05758a2d650
1163e767-bf73-4502-b509-4c08e03f546a	سعيد	الرحبي	2021-03-06	male	عمان	\N	\N	96120070	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:21.373229	2026-05-16 22:11:23.855782	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:21.373229	2025-11-01 13:05:21.373229	a37141f3-3407-4750-b747-d05758a2d650
ee57c14b-bd54-488f-98f5-3ea4cb94554a	أحمد	المسكري	2021-02-23	male	نقل خاص	\N	\N	91480091	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:20.489867	2025-11-01 13:05:20.489867	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:20.489867	2025-11-01 13:05:20.489867	\N
59407267-f1b1-4087-a711-7746f509304a	محمد	المصلحي	1932-11-10	male	علاية	\N	\N	99884447	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:20.562276	2025-11-01 13:05:20.562276	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:20.562276	2025-11-01 13:05:20.562276	\N
3cedb1c4-c377-46ac-8ce4-065316c2e638	الفراهيد	المسكري	2021-02-02	male	النصيب	\N	\N	94440912	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:20.785557	2025-11-01 13:05:20.785557	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:20.785557	2025-11-01 13:05:20.785557	\N
1b165422-1eaf-42f6-add1-f0bffb3607f8	سندس	البوسعيدي	2022-03-03	male	عمان	\N	\N	92343800	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:21.080858	2025-11-01 13:05:21.080858	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:21.080858	2025-11-01 13:05:21.080858	\N
5ff9fe06-bdd1-43f9-b921-86ebc0dcc868	حور	الكعبية	2021-10-14	female	عمان	\N	\N	96033203	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:21.227792	2025-11-01 13:05:21.227792	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:21.227792	2025-11-01 13:05:21.227792	\N
4b9061ca-0c4a-425b-be9a-6ce9b2a0e0f3	أمين	الإسماعيلي	2022-01-04	male	عمان	\N	\N	96479736	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:21.518389	2025-11-01 13:05:21.518389	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:21.518389	2025-11-01 13:05:21.518389	\N
73345285-ac18-4ad5-8901-894c1542e65e	سديم	الرحبية	2021-03-03	female	عمان	\N	\N	97609904	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:21.664208	2025-11-01 13:05:21.664208	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:21.664208	2025-11-01 13:05:21.664208	\N
85d8b3a6-64bc-4751-aa7c-9b56eb1c3f2d	آدم	اليزيدي	2021-05-28	male	عمان	\N	\N	97466312	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:21.81214	2025-11-01 13:05:21.81214	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:21.81214	2025-11-01 13:05:21.81214	\N
a863d554-3a02-48c9-9f4c-df22b41ed666	فاطمة	المسكرية	2021-09-08	female	عمان	\N	\N	98883020	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:21.957794	2025-11-01 13:05:21.957794	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:21.957794	2025-11-01 13:05:21.957794	\N
29cbcf5b-0f18-47c0-b152-e6b3d6f67ca8	فَلَكْ	السعدية	2021-11-13	female	عمان	\N	\N	92230881	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:22.101921	2025-11-01 13:05:22.101921	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:22.101921	2025-11-01 13:05:22.101921	\N
9b11fbfa-e958-459f-a7f1-7df4bc0bc07e	صالح	المسكري	2021-10-15	male	عمان	\N	\N	99368119	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:22.24701	2025-11-01 13:05:22.24701	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:22.24701	2025-11-01 13:05:22.24701	\N
46e7bc94-f3cb-4a64-a787-914ee1225bc4	أحمد	الغنيمي	2022-05-24	male	عمان	\N	\N	92196942	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:22.39242	2025-11-01 13:05:22.39242	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:22.39242	2025-11-01 13:05:22.39242	\N
d731abae-20dc-4e88-8d3d-a4a2a18ff01a	سالم	الحارثي	2021-08-19	male	عمان	\N	\N	93913164	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:22.537324	2025-11-01 13:05:22.537324	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:22.537324	2025-11-01 13:05:22.537324	\N
286c72aa-0194-4eb0-a4a6-0fa7a3d9788d	قيس	الرواحي	2021-06-17	male	عمان	\N	\N	95980543	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:22.682126	2025-11-01 13:05:22.682126	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:22.682126	2025-11-01 13:05:22.682126	\N
f947a8e8-3303-4d59-9372-520137ddac05	غزل	المعمرية	2022-01-27	female	عمان	\N	\N	93834262	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:22.826189	2025-11-01 13:05:22.826189	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:22.826189	2025-11-01 13:05:22.826189	\N
a3227bae-c230-46ae-a1fe-f1a4fdb13c67	أثير	الحارثية	2021-01-09	female	القابل\\عز	\N	\N	93377754	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:22.969428	2025-11-01 13:05:22.969428	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:22.969428	2025-11-01 13:05:22.969428	\N
31f8261e-809e-45eb-9ef8-125b68102f55	عمر	سعيدالسعدي	2020-01-01	male	وادي نام \\ النبأ	\N	\N	95590378	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.113917	2025-11-01 13:05:23.113917	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.113917	2025-11-01 13:05:23.113917	\N
cdb6fdc0-44ae-478c-aff3-49f58f67cfcf	غياث	الرحبي	2021-08-03	male	جديا	\N	\N	95874762	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.189034	2025-11-01 13:05:23.189034	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.189034	2025-11-01 13:05:23.189034	\N
10d89a77-fb38-4ccc-9948-77d8e1b62256	ناصر	المغيري	2021-10-07	male	علاية	\N	\N	99247020	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.263959	2025-11-01 13:05:23.263959	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.263959	2025-11-01 13:05:23.263959	\N
82ecff62-23c0-468d-8e87-a1b4e342db1a	أحمد	الحارثي	2021-11-09	male	خلف سمية	\N	\N	96643889	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.338637	2025-11-01 13:05:23.338637	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.338637	2025-11-01 13:05:23.338637	\N
c76bba3f-89f1-4cfa-b05a-941ac34be80a	سعيد	المسكري	2022-01-01	male	اليحمدي	\N	\N	96649677	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.554349	2025-11-01 13:05:23.554349	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.554349	2025-11-01 13:05:23.554349	\N
750d1305-e3d5-4191-9cd6-1e7ea77c6363	اليقظان	المسكري	2022-01-01	male	النصيب	\N	\N	94440912	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.628582	2025-11-01 13:05:23.628582	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.628582	2025-11-01 13:05:23.628582	\N
deb13f05-a38d-4910-a0c2-ee07e5c104f2	أواب	المغيري	2022-01-01	male	علاية	\N	\N	98881883	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.633828	2025-11-01 13:05:23.633828	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.633828	2025-11-01 13:05:23.633828	\N
14799b1a-9596-4204-9d75-29dc977fa4de	علا	الاسماعيلية	2022-01-01	female	النصيب	\N	\N	92996869	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.778866	2025-11-01 13:05:23.778866	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.778866	2025-11-01 13:05:23.778866	\N
dddbd098-3eec-46d4-b4f5-cdf7f15f1638	ألين	النظيرية	2021-02-23	female	السفالة	\N	\N	96927883	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.784642	2025-11-01 13:05:23.784642	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.784642	2025-11-01 13:05:23.784642	\N
fd56bf92-62e8-4bd3-b054-8e3e292d3a03	أحمد	البوسعيدي	2021-10-29	male	علاية	\N	\N	91916066	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.789087	2025-11-01 13:05:23.789087	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.789087	2025-11-01 13:05:23.789087	\N
b35d8a54-d260-4c40-a0ea-ea349ec7e454	حذام	المغيرية	2021-04-05	female	القابل/القابل	\N	\N	92154206	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.863794	2025-11-01 13:05:23.863794	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.863794	2025-11-01 13:05:23.863794	\N
d1b3a827-b220-468e-aff0-b04b2e4a4e88	رغد	المقبالية	2021-10-25	female	عمان	\N	\N	93344100	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:24.010929	2025-11-01 13:05:24.010929	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:24.010929	2025-11-01 13:05:24.010929	\N
6e138a6a-2343-480c-b09d-d734bd7eee24	ذياب	المعمري	2021-09-27	male	عمان	\N	\N	95594241	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:24.155394	2025-11-01 13:05:24.155394	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:24.155394	2025-11-01 13:05:24.155394	\N
6c452cf2-3307-4c0e-a1b3-4f5baee9c3ce	علي	السعدي	2021-05-19	male	عمان	\N	\N	95402296	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:24.299913	2025-11-01 13:05:24.299913	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:24.299913	2025-11-01 13:05:24.299913	\N
70845b1d-ca99-4e7e-ba57-bec4279d7f53	عبد	الريامي	2021-09-04	male	عمان	\N	\N	99760666	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:24.448924	2025-11-01 13:05:24.448924	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:24.448924	2025-11-01 13:05:24.448924	\N
13635de0-762e-44b8-965a-001571e1922c	تميم	المعمري	2021-12-13	male	عمان	\N	\N	92098917	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:24.59403	2025-11-01 13:05:24.59403	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:24.59403	2025-11-01 13:05:24.59403	\N
7e2c867d-e99e-4f27-8a4a-f2e33e98f6bc	جنى	الحارثية	2021-03-08	female	سيح العافية	\N	\N	99797173	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:24.737967	2025-11-01 13:05:24.737967	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:24.737967	2025-11-01 13:05:24.737967	\N
b9a1f103-744c-456e-99f6-d50c12aafc2d	حمود	الحارثي	2021-09-04	male	القابل	\N	\N	99374116	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:24.882759	2025-11-01 13:05:24.882759	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:24.882759	2025-11-01 13:05:24.882759	\N
eee33dcb-803a-4d07-a7fe-fbc7e7c8b84e	عهد	السعدي	2021-08-11	female	عمان	\N	\N	91144364	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:25.028538	2025-11-01 13:05:25.028538	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:25.028538	2025-11-01 13:05:25.028538	\N
4a72ec48-b917-4f2e-8f98-4aea8c80a30b	عفان	السيابي	2021-12-28	male	عمان	\N	\N	97763603	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:25.172595	2025-11-01 13:05:25.172595	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:25.172595	2025-11-01 13:05:25.172595	\N
4a54b0f9-a722-46d9-b95f-28df549a33c7	شيم	المسكري	2022-05-18	female	عمان	\N	\N	98999149	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:25.31641	2025-11-01 13:05:25.31641	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:25.31641	2025-11-01 13:05:25.31641	\N
d09157a4-bff9-4106-a3ae-30292164f649	إيلاف	الإسماعيلية	2021-08-24	female	اليحمدي	\N	\N	97939293	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:25.462037	2025-11-01 13:05:25.462037	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:25.462037	2025-11-01 13:05:25.462037	\N
ee6f4e7e-53c2-4d66-9220-8e8112c2347a	درة	المسكرية	2021-08-29	female	علاية السيح الجديد	\N	\N	95145009	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:25.608757	2025-11-01 13:05:25.608757	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:25.608757	2025-11-01 13:05:25.608757	\N
3f897370-0f2b-4c0f-bb34-f748e542ce9d	أحمد	اليزيدي	2020-01-01	male	الثابتي	\N	\N	92933730	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:25.614394	2025-11-01 13:05:25.614394	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:25.614394	2025-11-01 13:05:25.614394	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, email, password, "firstName", "lastName", role, roles, phone, address, "dateOfBirth", "isActive", "lastLogin", school_id, "createdAt", "updatedAt", is_system_user, is_super_admin, user_type) FROM stdin;
de38fecd-032e-4f61-9002-30247874fe55	parent_95464181	parent_95464181@zinat.local	$2b$10$vVp8IByRJzH1JJIaLveegeYF2QClU8/Uw9WOKlxYJibQ0tUVMQl.C	والدة	الطالب روان العويدي	parent	\N	95464181	\N	\N	t	2026-09-02 18:57:44.432	1	2025-11-01 13:05:07.426092	2026-09-02 18:57:44.433795	f	f	parent
626a3c4c-86b1-4ff4-a98d-b5a8aee34b69	parent_95397376	parent_95397376@zinat.local	$2b$10$vpnDHFWVvKQ9Zs2PT.TsuOC0sbdnK2ryXYnmHFM71o6XLzriXtONC	والد	الطالب أنس الحارثي	parent	\N	95397376	\N	\N	t	\N	1	2025-11-01 13:05:19.085241	2025-11-01 13:05:19.085241	f	f	parent
08ca1d7d-f5a9-4b41-a20b-cb65f1b338b7	parent_96479736	parent_96479736@zinat.local	$2b$10$oand6QwJwMO5So5QLEsD/OjlKdyWaXh0MdurKCe/mjWzs34Uu4LdC	والدة	الطالب أمين الإسماعيلي	parent	\N	96479736	\N	\N	t	\N	1	2025-11-01 13:05:21.586842	2025-11-01 13:05:21.586842	f	f	parent
cd710bef-f94f-411e-95af-e41c25b6dfa4	parent_92154206	parent_92154206@zinat.local	$2b$10$SVFXIQSeV.8MIyRh443PwOYHA7vUtex/EwARkGcFsYs1aS7M1UZJa	والدة	الطالب حذام المغيرية	parent	\N	92154206	\N	\N	t	\N	1	2025-11-01 13:05:23.932503	2025-11-01 13:05:23.932503	f	f	parent
d1c5048d-c936-4428-b86c-389e8ef99f27	parent_99597217	parent_99597217@zinat.local	$2b$10$VSyNdIvu/wI54WzIOOqFH.ZANWImvmiGOuuFg23O8sw5wDLIjCxuy	والد	الطالب حذام المغيرية	parent	\N	99597217	\N	\N	t	\N	1	2025-11-01 13:05:24.00419	2025-11-01 13:05:24.00419	f	f	parent
fa1fbdb7-4a31-4ea2-ace0-0887be03ebdd	parent_93344100	parent_93344100@zinat.local	$2b$10$385Hw.wLjkZSWte0n3IJIuCQDMMsfxf/Wa7Xif62DF3Uj6u0y1Gbi	والدة	الطالب رغد المقبالية	parent	\N	93344100	\N	\N	t	\N	1	2025-11-01 13:05:24.079856	2025-11-01 13:05:24.079856	f	f	parent
c99ea4b6-1226-40bb-ba4a-40bdb793a186	parent_99770060	parent_99770060@zinat.local	$2b$10$rRV8VFf6ZjvBIZ.qYeY1eOfrUc3hnciws6yVGeLPgysKk7bWWG2bO	والد	الطالب رغد المقبالية	parent	\N	99770060	\N	\N	t	\N	1	2025-11-01 13:05:24.150674	2025-11-01 13:05:24.150674	f	f	parent
63e3f2ee-ebba-4448-9cf6-97034ef5de6e	parent_95594241	parent_95594241@zinat.local	$2b$10$xdmyMM4GAifyBGOtXDCQLe5.bVFcdb9FnDmRMZ2RLn1xTNsrrIIQm	والدة	الطالب ذياب المعمري	parent	\N	95594241	\N	\N	t	\N	1	2025-11-01 13:05:24.223286	2025-11-01 13:05:24.223286	f	f	parent
4e93ec2a-c5b9-4339-9641-e06b61c71235	parent_91166850	parent_91166850@zinat.local	$2b$10$9sR6cEHv0HSky.oGKMYvxOtT5UBkeYDlNqMIj1pJp3gnUvyiU.6iW	والد	الطالب ذياب المعمري	parent	\N	91166850	\N	\N	t	\N	1	2025-11-01 13:05:24.293646	2025-11-01 13:05:24.293646	f	f	parent
67c5764d-3226-495f-9c90-065fade5a635	parent_95402296	parent_95402296@zinat.local	$2b$10$ie2w4iJwIClaVQ2LX72kWOHntwEpiw5E0Ia1wRYCfmw4jKM8v5Lhe	والدة	الطالب علي السعدي	parent	\N	95402296	\N	\N	t	\N	1	2025-11-01 13:05:24.372194	2025-11-01 13:05:24.372194	f	f	parent
555b318d-1aeb-442e-8781-1d5debe0d95b	parent_99232016	parent_99232016@zinat.local	$2b$10$3mOq3KvhW2CdupOTrjsdCuMGrV0OB/DFRe79RztqsMwuSnrqsAMYW	والد	الطالب علي السعدي	parent	\N	99232016	\N	\N	t	\N	1	2025-11-01 13:05:24.442969	2025-11-01 13:05:24.442969	f	f	parent
acce19fe-feec-45e7-86d5-a28e079fefad	parent_99760666	parent_99760666@zinat.local	$2b$10$a0rqm1QvDAas2Yp.7a4ajuhXzIGWM6XoVbVeRRR4J6D.bupBMNXpW	والدة	الطالب عبد الريامي	parent	\N	99760666	\N	\N	t	\N	1	2025-11-01 13:05:24.518738	2025-11-01 13:05:24.518738	f	f	parent
b2508337-08de-4efa-b9ad-8e20efd1f855	parent_91112455	parent_91112455@zinat.local	$2b$10$VDQ1IkOnzbw8kPfO84X2wOCvhxmihWbNai8ChzpJi0v4mNrIreZSi	والد	الطالب عبد الريامي	parent	\N	91112455	\N	\N	t	\N	1	2025-11-01 13:05:24.589141	2025-11-01 13:05:24.589141	f	f	parent
58135a72-0ae8-40b6-8dff-9883f9c8ea20	parent_91414109	parent_91414109@zinat.local	$2b$10$L4.C.unO8nEhtsxnxt9Ca.KsZjVDtZDYzC//YSmwXOMGt1eMa/nsW	والدة	الطالب سعد السيابي	parent	\N	91414109	\N	\N	t	2026-05-16 21:28:48.219	1	2025-11-01 13:05:21.003725	2026-05-16 21:28:48.221407	f	f	parent
938115b6-0d75-454f-b8e0-ecaea88086c3	parent_95932973	parent_95932973@zinat.local	$2b$10$Z9PRBIvkzPHU5cLBsHo.GeUFQL7VsqAFPGpOa9rRdNhXIlpxxTfz.	والدة	الطالب ضياء المسكرية	parent	\N	95932973	\N	\N	t	\N	1	2025-11-01 13:05:07.501488	2025-11-01 13:05:07.501488	f	f	parent
f435dd70-eba6-40e6-a0aa-d2931c981f97	parent_96970744	parent_96970744@zinat.local	$2b$10$rYDZiEdk0C8CXKRjGvopw.R7t4H5DQtrTs.6DWN5bn/FemGgrpz2u	والد	الطالب ضياء المسكرية	parent	\N	96970744	\N	\N	t	\N	1	2025-11-01 13:05:07.572998	2025-11-01 13:05:07.572998	f	f	parent
1b00d302-f024-4cc1-ac45-acf566c8b31a	parent_93338334	parent_93338334@zinat.local	$2b$10$Y2vtP7v75r/fBwp8aYIxm.NAh1s5wk2ggnEL8ixnwdIx14VX9Lbdm	والد	الطالب سعيد الحارثي	parent	\N	93338334	\N	\N	t	\N	1	2025-11-01 13:05:07.72093	2025-11-01 13:05:07.72093	f	f	parent
600f55e1-95f4-4bdb-8c98-71b86010b490	parent_96173736	parent_96173736@zinat.local	$2b$10$LPARiC6AJyZuP7N9eKa93eLc7Ypa.V6SH8LyCNB3mItvmoEBQkXo6	والدة	الطالب صالح المسكري	parent	\N	96173736	\N	\N	t	2026-05-16 11:36:21.438	1	2025-11-01 13:05:07.278668	2026-05-16 11:36:21.442487	f	f	parent
a7b115cb-b4a8-4e6f-9027-2b1d84fe80b9	superadmin	superadmin@zinat.platform	$2b$10$nsZEknT0h7ZcpzHRnIdUG./W4vj5eXXmSfbKIZ0RRLERlDzONoSGS	Super	Admin	admin	\N	\N	\N	\N	t	2026-09-02 18:57:21.823	\N	2026-07-31 09:10:05.60511	2026-09-02 18:57:21.826379	t	t	platform
e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	admin	admin@zinatalhaykindergarten.com	$2b$10$fsTgvjtE9fVv58rm.q4AZecctEMkED41kOIhXf/invBEcFJu9gStC	System	Administrator	admin	\N	+966-11-123-4567	Main Office, Zinat Al-Haya Kindergarten	\N	t	2026-09-02 18:57:43.911	1	2025-10-27 22:32:01.334252	2026-09-02 18:57:43.913912	f	f	staff
4c5ddd4d-2a22-4d50-ba19-14283117f045	parent_96282216	parent_96282216@zinat.local	$2b$10$4tV2xm1CwDhjlwVWicuyTeldZZf0kKojk9nae9PuN0AAmzY1DlUlG	والد	الطالب سعيد الرحبي	parent	\N	96282216	\N	\N	t	2026-05-16 22:11:16.76	1	2025-11-01 13:05:21.511999	2026-05-16 22:11:16.762961	f	f	parent
d2260ae9-931a-4e45-9fcd-e13a6930e7c1	\N	Zahra@gmail.com	$2b$12$N5PX61ktK4L4nJmszTwuH.nQXfptyq6TDmVSYwRfGQhUfpvLfo9KG	Zahra	Administrator	admin	\N	+968 9999 0000	\N	\N	t	2026-09-02 18:57:22.215	1	2025-11-21 09:54:33.412	2026-09-02 18:57:22.219772	f	f	staff
a9736adb-8352-4788-ac6a-cdb95aa7be33	parent_95145009	parent_95145009@zinat.local	$2b$10$iAEtZWquA5ntiWlbYk0wYuD.eK8Di.xX1gx98OvANlcrdvGV2hScC	والدة	الطالب صفاء المسكرية	parent	\N	95145009	\N	\N	t	\N	1	2025-11-01 13:05:07.796618	2025-11-01 13:05:07.796618	f	f	parent
0617d532-4659-4d17-bf6f-94371eacfc5e	parent_92135380	parent_92135380@zinat.local	$2b$10$TuN3cyra1FZOtiE3rQeRZuuYQONIXqTTHzHMX6wobu/IqIYjzi0CO	والد	الطالب صفاء المسكرية	parent	\N	92135380	\N	\N	t	\N	1	2025-11-01 13:05:07.869035	2025-11-01 13:05:07.869035	f	f	parent
0ba67a91-840f-4fe8-bbcc-3c271e4a3dd0	parent_98877226	parent_98877226@zinat.local	$2b$10$JAE2F4tApbIqDtg28bpGney/Psd4n6nXOtffSpp1SnoKTujIzn9uS	والدة	الطالب ناصر الرحبي	parent	\N	98877226	\N	\N	t	\N	1	2025-11-01 13:05:07.944684	2025-11-01 13:05:07.944684	f	f	parent
afc7892c-c0df-47a5-ab0c-b5250d44d88f	parent_95454245	parent_95454245@zinat.local	$2b$10$f8AUtfr1CGr2ttaf1v8Rd.fqv5SicasLmCsl2vQIJwQpjh5vQ0bvy	والد	الطالب ناصر الرحبي	parent	\N	95454245	\N	\N	t	\N	1	2025-11-01 13:05:08.015123	2025-11-01 13:05:08.015123	f	f	parent
879b6aaf-da65-4109-85bd-d2cccab26c26	parent_94622794	parent_94622794@zinat.local	$2b$10$j3rt0Fn2poJaytzQ9OGmwOn0yTgHuuKD35a3iif9RoxXE1p.ehxQe	والدة	الطالب بدر الرحبي	parent	\N	94622794	\N	\N	t	\N	1	2025-11-01 13:05:08.092446	2025-11-01 13:05:08.092446	f	f	parent
de826c1d-ba79-4ccf-96d0-f9bd52d4f7f2	parent_99277483	parent_99277483@zinat.local	$2b$10$VdMiQT9NGfeQSy9Alcb9seJ/CXn0JyCx1TS5gexcs8pHfbTDf7RKW	والد	الطالب بدر الرحبي	parent	\N	99277483	\N	\N	t	\N	1	2025-11-01 13:05:08.16225	2025-11-01 13:05:08.16225	f	f	parent
2d05f4da-c71c-4763-9571-47e997a3041a	parent_96933177	parent_96933177@zinat.local	$2b$10$b0IzEuILbQU7hWkBXGmbE.u3S9F8nZO6/AiLrQmd9ijXOgZ.Dw3JS	والدة	الطالب رؤى الحارثية	parent	\N	96933177	\N	\N	t	\N	1	2025-11-01 13:05:08.238242	2025-11-01 13:05:08.238242	f	f	parent
112d118e-e69f-4e8b-9190-7f218789bc5c	parent_95088333	parent_95088333@zinat.local	$2b$10$MQXSNNJa1ZnvgFUDrSFOUOIV1SGBPHzxCJRrikP3cZI8guf25SmNq	والد	الطالب رؤى الحارثية	parent	\N	95088333	\N	\N	t	\N	1	2025-11-01 13:05:08.309654	2025-11-01 13:05:08.309654	f	f	parent
fcd76a90-e1df-49fa-876c-3fd92ccb367b	parent_79070704	parent_79070704@zinat.local	$2b$10$pnz19bEdlCZ.GJsTUDHY2OZvLoLx3L054mOPLL56X2YwZWmnFhS/O	والدة	الطالب حسينة السعدية	parent	\N	79070704	\N	\N	t	\N	1	2025-11-01 13:05:08.384534	2025-11-01 13:05:08.384534	f	f	parent
f239e4b6-8bff-4bbc-8af1-a454ea371107	parent_97775099	parent_97775099@zinat.local	$2b$10$Yicj.SbEQrqESGYCEaYA.eKzelT25oltuvI0POJ9Xz.CZQEA/W0eC	والد	الطالب حسينة السعدية	parent	\N	97775099	\N	\N	t	\N	1	2025-11-01 13:05:08.455399	2025-11-01 13:05:08.455399	f	f	parent
6430eba5-0852-48d3-90ef-1c42e6174bae	parent_97291529	parent_97291529@zinat.local	$2b$10$SWFnbpaEwPeKNda1GSgImukHthf8EheSkfVBYRSdmbnUTaIV67vfS	والدة	الطالب غيم اليزيدية	parent	\N	97291529	\N	\N	t	\N	1	2025-11-01 13:05:08.530689	2025-11-01 13:05:08.530689	f	f	parent
83f3fea3-37aa-4f61-82d0-26a14d0d48a1	parent_92988234	parent_92988234@zinat.local	$2b$10$TtPPMyr2lEUM/4/0.S58l.ak/JoKO.Yqxb2Y6C/CdE1hN/V/EZsay	والد	الطالب غيم اليزيدية	parent	\N	92988234	\N	\N	t	\N	1	2025-11-01 13:05:08.600954	2025-11-01 13:05:08.600954	f	f	parent
9ee33166-a310-42d9-8d8f-c36c0a8be6ee	parent_71179339	parent_71179339@zinat.local	$2b$10$dfsGFmTOgxIiFsXlu0rH1uvXn3f6bOscKDT/7R6chDxp.VBwifBA.	والدة	الطالب اليزن الكعبي	parent	\N	71179339	\N	\N	t	\N	1	2025-11-01 13:05:08.678257	2025-11-01 13:05:08.678257	f	f	parent
9063b1a2-4622-4cd5-b971-0b0f2122d1cf	parent_98488498	parent_98488498@zinat.local	$2b$10$4OsqG3pAccWgRMrf9f/DOOuhizMxhdyf6tefCq1L0y009aoXyYMyC	والد	الطالب اليزن الكعبي	parent	\N	98488498	\N	\N	t	\N	1	2025-11-01 13:05:08.748685	2025-11-01 13:05:08.748685	f	f	parent
d94fa1e6-5133-4e17-9089-f949d586c076	parent_95054707	parent_95054707@zinat.local	$2b$10$mqxtu9Hp3mT5T.7Mbj0rGeBX4mCkyXyd/7BJ7JjI9ecdASnErj/Ee	والدة	الطالب ملاك المسكرية	parent	\N	95054707	\N	\N	t	\N	1	2025-11-01 13:05:08.821641	2025-11-01 13:05:08.821641	f	f	parent
7b6bbca4-3576-45f8-a101-f1a73bab7239	parent_92210194	parent_92210194@zinat.local	$2b$10$w7Gco1Pix0COyjxQVOjXOeojD9Unv28SXbk.OeYv5QTApLFmOh9Gu	والد	الطالب ملاك المسكرية	parent	\N	92210194	\N	\N	t	\N	1	2025-11-01 13:05:08.893705	2025-11-01 13:05:08.893705	f	f	parent
452a9aa1-ab9b-4c49-99a2-2ddcc91b12db	parent_99351065	parent_99351065@zinat.local	$2b$10$rK9LIal0g.cPZjwBLS5X6uX7focY3k.ZtS/4nm0rc4eBuhrnEVvu6	والد	الطالب سما المغيرية	parent	\N	99351065	\N	\N	t	\N	1	2025-11-01 13:05:09.04045	2025-11-01 13:05:09.04045	f	f	parent
74454788-828b-4d65-b6cf-e61739b72417	parent_91200005	parent_91200005@zinat.local	$2b$10$thlV09rwd3NhYhYqx4O94epfZlL2.Y5Hf52f/wiPY1/D8sDLVI0QO	والدة	الطالب رؤى البراشدية	parent	\N	91200005	\N	\N	t	\N	1	2025-11-01 13:05:09.115205	2025-11-01 13:05:09.115205	f	f	parent
c304b685-48cb-4b14-946a-6afa4fb8d3c2	parent_96001443	parent_96001443@zinat.local	$2b$10$.GCG3T5hb3zYtVgV84mPBOlcp6JcAB4LhIEDev3Xc5CYFWsWTj32G	والد	الطالب رؤى البراشدية	parent	\N	96001443	\N	\N	t	\N	1	2025-11-01 13:05:09.185887	2025-11-01 13:05:09.185887	f	f	parent
1b1dfb2a-2a9e-4145-99b5-fa01d074060b	parent_92575676	parent_92575676@zinat.local	$2b$10$K.FqmKcRfFS8Vl1CPJOiPu6YLRHsZs0m7A5pN958a2.Z3qJ5p4SAm	والدة	الطالب محمد الحارثي	parent	\N	92575676	\N	\N	t	\N	1	2025-11-01 13:05:09.260309	2025-11-01 13:05:09.260309	f	f	parent
cd319ad1-4954-4d6e-b270-ce4808338b86	parent_95226040	parent_95226040@zinat.local	$2b$10$pPA7uDwulFdZQ3fa88ikc.qGV0MMyueIAFiypoLGPTWloDCDt1/5K	والد	الطالب محمد الحارثي	parent	\N	95226040	\N	\N	t	\N	1	2025-11-01 13:05:09.331156	2025-11-01 13:05:09.331156	f	f	parent
9fa0b1eb-e112-4480-8d27-1f434ea1b391	parent_94811096	parent_94811096@zinat.local	$2b$10$ZM9NGVK7/6RwM0MHWV3faudGzc1Q0Q49CVdMtmrZr3YajQGTfl0PC	والدة	الطالب درر المسكرية	parent	\N	94811096	\N	\N	t	2026-05-01 14:00:31.667	1	2025-11-01 13:05:07.12877	2026-05-01 14:00:31.671386	f	f	parent
c585ec6e-602e-49f9-b973-061cfebeb083	parent_95092335	parent_95092335@zinat.local	$2b$10$7ms8MImGNUb6Nu3un0VO1OU.Xlc44D6Meir9g9td7ybaHsaL2RJle	والد	الطالب درر المسكرية	parent	\N	95092335	\N	\N	t	2026-05-04 19:39:07.849	1	2025-11-01 13:05:07.200284	2026-05-04 19:39:07.851497	f	f	parent
75fcf6ec-87f2-4721-8b36-82eb9e612246	parent_98885014	parent_98885014@zinat.local	$2b$10$NJKrp0OI9V26f/qzP2XSJuvpATPmLdclFsYa/luVRdmyNICoLh8R2	والدة	الطالب سعيد الحارثي	parent	\N	98885014	\N	\N	t	2026-05-16 19:52:50.557	1	2025-11-01 13:05:07.649225	2026-05-16 19:52:50.560104	f	f	parent
c95db9d4-76c2-44d6-9814-a6caaf8695e1	parent_99522564	parent_99522564@zinat.local	$2b$10$Frn8pm3CaxEz/3GBu9.8eemvxGrL3lU0tMm2gZ/LRGYu.K38nGiAW	والدة	الطالب سما المغيرية	parent	\N	99522564	\N	\N	t	2026-05-16 21:17:00.381	1	2025-11-01 13:05:08.969364	2026-05-16 21:17:00.402726	f	f	parent
871b0869-b82d-4278-906a-0ffc1c7b6db5	parent_97772831	parent_97772831@zinat.local	$2b$10$62UdRy0tNwAz04KLlGtnpeIeZD78804zv/8j51mVZSrhlxlpOaLWu	والدة	الطالب أحمد الإسماعيلي	parent	\N	97772831	\N	\N	t	\N	1	2025-11-01 13:05:09.405657	2025-11-01 13:05:09.405657	f	f	parent
978799bd-f2b7-448f-8384-33c82730da65	parent_99774412	parent_99774412@zinat.local	$2b$10$fpOXS0TjqeitpNpRXWBI0eVk5k2hD2Ms8RiN1dpGmdXYPMPffGIWu	والد	الطالب أحمد الإسماعيلي	parent	\N	99774412	\N	\N	t	\N	1	2025-11-01 13:05:09.477859	2025-11-01 13:05:09.477859	f	f	parent
75b33b28-3d13-404b-a27a-58339c31f8c6	parent_77265536	parent_77265536@zinat.local	$2b$10$7nzwvIdZf3ow1hb9BreANOteyrGUXEx.ix.nywe0kwWumArqXMUS2	والدة	الطالب هيثم المسكري	parent	\N	77265536	\N	\N	t	\N	1	2025-11-01 13:05:09.553014	2025-11-01 13:05:09.553014	f	f	parent
ef989278-af74-48fb-bcc4-b2416be1f2f2	parent_99881807	parent_99881807@zinat.local	$2b$10$X5/GhjJYPQeE6BI8rZrlSO6AcJvn/GLVUrXcQ4BgdT7jUDdH5JoJ.	والد	الطالب هيثم المسكري	parent	\N	99881807	\N	\N	t	\N	1	2025-11-01 13:05:09.623875	2025-11-01 13:05:09.623875	f	f	parent
adb2ced4-d127-453c-a5c4-60528ef7995a	parent_95530331	parent_95530331@zinat.local	$2b$10$vE.rV0jIfmGP9AWQKDOB4eDrpaE6AHb5hvVgL8xEdGN4cdQgtEc7m	والدة	الطالب انسام الاسماعيلية	parent	\N	95530331	\N	\N	t	\N	1	2025-11-01 13:05:09.699819	2025-11-01 13:05:09.699819	f	f	parent
34a104b6-52dd-4202-b67c-99e7a577d8c2	parent_92344674	parent_92344674@zinat.local	$2b$10$mHkllNNotuwBDpumF/veZeNEvABigKv.H3OMthSHrwKsq5zvz8URq	والد	الطالب انسام الاسماعيلية	parent	\N	92344674	\N	\N	t	\N	1	2025-11-01 13:05:09.770423	2025-11-01 13:05:09.770423	f	f	parent
34e55b8c-9584-4dfa-8f8f-b4e27413519c	parent_95056160	parent_95056160@zinat.local	$2b$10$1Y6pjGFunSVSAz0MQ6dj7OmMDLEOMqzeI4ALnenELwYcXzdXSlTE6	والدة	الطالب الحسن البرواني	parent	\N	95056160	\N	\N	t	\N	1	2025-11-01 13:05:09.844352	2025-11-01 13:05:09.844352	f	f	parent
6b9f3d36-0dde-4dc4-8453-54bae112f094	parent_99227235	parent_99227235@zinat.local	$2b$10$fL/KTOVKIORFvyvPYmT/J.Ra5C0DtXy84CmD0bUdoTJJJghuSmf6y	والد	الطالب الحسن البرواني	parent	\N	99227235	\N	\N	t	\N	1	2025-11-01 13:05:09.915466	2025-11-01 13:05:09.915466	f	f	parent
dd820099-23c3-42c8-a668-9165418ae1ce	parent_92909567	parent_92909567@zinat.local	$2b$10$iTzJw5HpFsv/JerCQ.BSseWkeHpec.A/9mB/klm/pAUPXkNpS.oPC	والدة	الطالب زكريا الإسماعيلي	parent	\N	92909567	\N	\N	t	\N	1	2025-11-01 13:05:09.991145	2025-11-01 13:05:09.991145	f	f	parent
73036766-e77b-478c-a6d4-db63e401baaf	teacher_زيانة	زيانة@zinat.local	$2b$10$DHY8oabT1be9qi38Ud6QSuag612CkrEGacV77b9p7GUEAQQNEhnIm	زيانة	معلمة	teacher	\N	\N	\N	\N	t	\N	1	2025-11-01 13:05:10.063743	2025-11-01 13:05:10.063743	f	f	staff
9d68391c-8ce3-4729-b2da-1ac583aef255	parent_96609639	parent_96609639@zinat.local	$2b$10$v8LJC0Ppg4aEvBpMSTVRd.skj6lamFkt3oDMwjevk7bCQP6S9.mAS	والدة	الطالب عزام السعدي	parent	\N	96609639	\N	\N	t	\N	1	2025-11-01 13:05:10.137263	2025-11-01 13:05:10.137263	f	f	parent
da45f482-cbee-4e21-9415-164a0028fde0	parent_99071679	parent_99071679@zinat.local	$2b$10$RdCiVo1XRq4rkg9KI3jgVuCghmYNzmPBClZtFeFuxnQfQoEtEjPjC	والد	الطالب عزام السعدي	parent	\N	99071679	\N	\N	t	\N	1	2025-11-01 13:05:10.207855	2025-11-01 13:05:10.207855	f	f	parent
dfc1672e-32b8-4e00-a7b9-85f3d8e078ca	parent_94291888	parent_94291888@zinat.local	$2b$10$GOOzqUHryz71Q4NGmhIAGuQlbIA2WhrueLUFVvTsooWPfxNB.8Cs2	والدة	الطالب زياد الطوقي	parent	\N	94291888	\N	\N	t	\N	1	2025-11-01 13:05:10.28185	2025-11-01 13:05:10.28185	f	f	parent
6fb1743f-b438-41e7-be5c-7c074ed9c539	parent_98861108	parent_98861108@zinat.local	$2b$10$0dkbXctPv4KzBHmnJEtx.OX6UtsauwufXBrP3uL8/Znok88snUhGu	والد	الطالب زياد الطوقي	parent	\N	98861108	\N	\N	t	\N	1	2025-11-01 13:05:10.352239	2025-11-01 13:05:10.352239	f	f	parent
e075a638-515c-4f91-9f10-c813701674b6	parent_96252560	parent_96252560@zinat.local	$2b$10$3/kiSWDLfm3eH5QI6v1CDOxii8MvsepmOB.rqGekV8ezhmoiEyHEy	والدة	الطالب ماجد المسكري	parent	\N	96252560	\N	\N	t	\N	1	2025-11-01 13:05:10.426771	2025-11-01 13:05:10.426771	f	f	parent
0f851929-30b0-4b1c-8f64-779bd03dae03	teacher_موزة	moza@zinat.local	$2b$10$c556yJOKDfWnNVJFWbkMTOAbOI.niP6WUQ4D/gr13Xp6SyMmfeNWK	موزة	معلمة	teacher	\N	\N	\N	\N	t	2026-09-02 18:57:44.346	1	2025-11-01 13:05:07.046033	2026-09-02 18:57:44.350935	f	f	staff
dbe79c7f-6cf5-41df-8a05-0c84c4b46fa2	parent_95064063	parent_95064063@zinat.local	$2b$10$0VrPh8z0wMwRBYSKjGEb3.rB7a46sDZbf19.ia4dUsvfYNKrqIv2O	والد	الطالب صالح المسكري	parent	\N	95064063	\N	\N	t	2026-09-02 18:57:44.527	1	2025-11-01 13:05:07.350477	2026-09-02 18:57:44.529574	f	f	parent
95d46a63-c799-4f9b-87cf-c6ebf82d4229	parent_92531771	parent_92531771@zinat.local	$2b$10$Rov7pWNMwWOLFZNF1aIYke3vpWxfXKbOhFZuX6SYl0NRkZ.oxKQfu	والد	الطالب ماجد المسكري	parent	\N	92531771	\N	\N	t	\N	1	2025-11-01 13:05:10.496669	2025-11-01 13:05:10.496669	f	f	parent
8087566b-4a9a-4ce8-98bf-e1b4d72dd91b	parent_99252117	parent_99252117@zinat.local	$2b$10$9ViTOmy2uaZhga6BeCX6ge.Awhb3r8i90wvzIcxYvXxxoBBNd835K	والدة	الطالب نور المصلحية	parent	\N	99252117	\N	\N	t	\N	1	2025-11-01 13:05:10.572274	2025-11-01 13:05:10.572274	f	f	parent
28356a57-ca29-4252-8493-1e64d7e8c2ec	parent_99537070	parent_99537070@zinat.local	$2b$10$wV338uybK1CntX2lb081tOEvczsrogAkEdxObm4qzex1eQRr.trLS	والد	الطالب نور المصلحية	parent	\N	99537070	\N	\N	t	\N	1	2025-11-01 13:05:10.642806	2025-11-01 13:05:10.642806	f	f	parent
81072d14-e408-486a-8703-cbce17c8e9b7	parent_99650307	parent_99650307@zinat.local	$2b$10$rxVXfcAoMOkfhN68H8w1UOCM35L4XLgn31oVJSz.dj.l5xrW98em2	والدة	الطالب بندر السعدي	parent	\N	99650307	\N	\N	t	\N	1	2025-11-01 13:05:10.71866	2025-11-01 13:05:10.71866	f	f	parent
262e9678-3021-4d71-8b93-00c1572155c0	parent_92863313	parent_92863313@zinat.local	$2b$10$7kopsQySqzzzSFIUjXVabOf/DMjQj.6yFlRGo3LA2Ru9QBMa6/.di	والدة	الطالب آية الحارثية	parent	\N	92863313	\N	\N	t	\N	1	2025-11-01 13:05:10.794028	2025-11-01 13:05:10.794028	f	f	parent
aa089a54-35e2-4fb3-b31b-3536b031577e	parent_95887887	parent_95887887@zinat.local	$2b$10$cEFaKTkMpphFLLp/fiBA5.YVh3ZVviX7eSsg.K03BRh6qhWLw2xKu	والد	الطالب آية الحارثية	parent	\N	95887887	\N	\N	t	\N	1	2025-11-01 13:05:10.864912	2025-11-01 13:05:10.864912	f	f	parent
4679ecd4-b2cc-4b44-a1db-e07a640c7cc2	parent_99432661	parent_99432661@zinat.local	$2b$10$.xH4ArfFaDoe4tOPdUw9KuoIgWdFVgyEMw7g.nccLGfQ0GgnlIYwi	والدة	الطالب طارق اليزيدي	parent	\N	99432661	\N	\N	t	\N	1	2025-11-01 13:05:10.941284	2025-11-01 13:05:10.941284	f	f	parent
e23da144-61b6-47d6-85eb-0347d8ccfc04	parent_99277523	parent_99277523@zinat.local	$2b$10$1.cx57YTGoThkGLGonnEK.L19RbILRnoSqTjJoqOJ0p6G2u06xehG	والدة	الطالب عهد المسكرية	parent	\N	99277523	\N	\N	t	\N	1	2025-11-01 13:05:11.01637	2025-11-01 13:05:11.01637	f	f	parent
4db122e0-a9c2-4263-89b0-a4e1fa5a00d9	parent_95383306	parent_95383306@zinat.local	$2b$10$3UUB0qdpSUworcTPSjDKMec2d9lUMkkCfYFZnDleQu2AT/J1.NQHG	والد	الطالب عهد المسكرية	parent	\N	95383306	\N	\N	t	\N	1	2025-11-01 13:05:11.087016	2025-11-01 13:05:11.087016	f	f	parent
b790f3a8-5211-4773-9733-2afb92592a12	parent_94050440	parent_94050440@zinat.local	$2b$10$Y6eLqVAQlXpUaq0cyhShievxtnKPyWGqTsDWwottuxAj4Onh0l84K	والدة	الطالب الخطاب المصلحي	parent	\N	94050440	\N	\N	t	\N	1	2025-11-01 13:05:11.162173	2025-11-01 13:05:11.162173	f	f	parent
7690a1db-c675-4653-a6e7-a876383417f0	parent_91373337	parent_91373337@zinat.local	$2b$10$lUV3RqSwFyqdKJzut11l3ex6Sa6.tXsTjQwatTD1nwTQAgaIIhite	والد	الطالب الخطاب المصلحي	parent	\N	91373337	\N	\N	t	\N	1	2025-11-01 13:05:11.232986	2025-11-01 13:05:11.232986	f	f	parent
b0b49458-cc73-4197-9e94-2d47a1ee9e2e	parent_94365977	parent_94365977@zinat.local	$2b$10$qhVpjTdAekFSNfcLJJzizeZEJ6IUWrAsR7K7L02cRh43N4RREYul2	والدة	الطالب لين السعدية	parent	\N	94365977	\N	\N	t	\N	1	2025-11-01 13:05:11.307374	2025-11-01 13:05:11.307374	f	f	parent
14a0f1ad-46cd-4616-82f7-c51dbc9d1f40	parent_94091267	parent_94091267@zinat.local	$2b$10$Aunogq7Em.XBOQ4TNOrot.u7DCGzKgIcF6x1xasJHfRH73iUiTh6G	والد	الطالب لين السعدية	parent	\N	94091267	\N	\N	t	\N	1	2025-11-01 13:05:11.378641	2025-11-01 13:05:11.378641	f	f	parent
8af83477-f92b-43ba-8b8b-d792b38f3e1d	parent_95177699	parent_95177699@zinat.local	$2b$10$Jpl0FslExUqRAnlqCGmO7ugIHrj54TlXDbhK7RDrZcLlmDVRs8VUC	والدة	الطالب أجوان المسكرية	parent	\N	95177699	\N	\N	t	\N	1	2025-11-01 13:05:11.454642	2025-11-01 13:05:11.454642	f	f	parent
3becfdfb-403a-4064-8d7b-b751900779ed	parent_92344016	parent_92344016@zinat.local	$2b$10$ac1tsq.RL0Q86rrJHt1EiuiO.7lBGL/sCLPxNTVgLE9dqlXzAjzfC	والد	الطالب أجوان المسكرية	parent	\N	92344016	\N	\N	t	\N	1	2025-11-01 13:05:11.525529	2025-11-01 13:05:11.525529	f	f	parent
5d186609-1aca-4c68-8960-c45362e4e674	parent_92996869	parent_92996869@zinat.local	$2b$10$6docXKgN5S.w1D.7CU710.BYUsuZULEVkokV9YWuCkgWqKd9WzeIu	والدة	الطالب القاسم الإسماعيلي	parent	\N	92996869	\N	\N	t	\N	1	2025-11-01 13:05:11.601014	2025-11-01 13:05:11.601014	f	f	parent
44b07cd5-c193-4d4d-9dc6-fe3149e6c469	parent_95148516	parent_95148516@zinat.local	$2b$10$xKD5WEVQf3BOdhrJFTU1xO/yOksiqzFhdHAREPg5GIrO1eSAlbTgS	والد	الطالب القاسم الإسماعيلي	parent	\N	95148516	\N	\N	t	\N	1	2025-11-01 13:05:11.672102	2025-11-01 13:05:11.672102	f	f	parent
e2faee80-b7cf-41af-8e51-29912e644725	parent_78048099	parent_78048099@zinat.local	$2b$10$WUlSXuOvs9KjphUvr71Cm.e8u5GorQ9Ba07qIaSPKPpLoia9nm7zy	والدة	الطالب سلطانة المسكرية	parent	\N	78048099	\N	\N	t	\N	1	2025-11-01 13:05:11.747059	2025-11-01 13:05:11.747059	f	f	parent
a34aec95-775f-4acf-9d30-53b16c918e20	parent_92255324	parent_92255324@zinat.local	$2b$10$9vs0Ltqiq0igCF6LqKx9U.f4G/hGmkwV4k9YDmunVzqnIYNViBsQG	والد	الطالب سلطانة المسكرية	parent	\N	92255324	\N	\N	t	\N	1	2025-11-01 13:05:11.817602	2025-11-01 13:05:11.817602	f	f	parent
0bee4d3a-1379-4662-8934-f0e151a1f6f4	parent_91161333	parent_91161333@zinat.local	$2b$10$iFv6BSj2H/dH7V8dN/I2iul9N3oVpraDIlMSwzDwE1OsNvgOeB4B2	والدة	الطالب ريما المسكرية	parent	\N	91161333	\N	\N	t	\N	1	2025-11-01 13:05:11.89484	2025-11-01 13:05:11.89484	f	f	parent
c26ae68f-8ac3-4a0a-a0d7-322575220280	parent_99840099	parent_99840099@zinat.local	$2b$10$1ctnTOXYL.gSfcF61QpHsOVg.NUrcg.4K6P27tFu19VG3jflZPq6e	والد	الطالب ريما المسكرية	parent	\N	99840099	\N	\N	t	\N	1	2025-11-01 13:05:11.966972	2025-11-01 13:05:11.966972	f	f	parent
c58764c9-873f-428c-ad82-29731174d143	parent_96988621	parent_96988621@zinat.local	$2b$10$UoS5eWH7jAqBObTM/Ofxz.anXkC0SZTtFQu90UCIWDnUEbBmEwUzy	والدة	الطالب جمانة الحارثية	parent	\N	96988621	\N	\N	t	\N	1	2025-11-01 13:05:12.039971	2025-11-01 13:05:12.039971	f	f	parent
52f5fdc0-3d20-4a30-8337-245a7906aa7d	parent_99728080	parent_99728080@zinat.local	$2b$10$wYFcG55R3oqxGMKMzVg1iu9K9UP3/Ed.pOcMTmuzY0K0LVpujzou.	والد	الطالب جمانة الحارثية	parent	\N	99728080	\N	\N	t	\N	1	2025-11-01 13:05:12.110391	2025-11-01 13:05:12.110391	f	f	parent
b0678766-eda8-4232-80db-719ee165f1ab	parent_98000822	parent_98000822@zinat.local	$2b$10$Nf/EHqV/cP3.QIAV01It.ewUsg.2ss6Y93tpEXj5aW2MZR6jZk7u2	والدة	الطالب تسنيم المصلحية	parent	\N	98000822	\N	\N	t	\N	1	2025-11-01 13:05:12.185842	2025-11-01 13:05:12.185842	f	f	parent
c94a555b-7ce6-4e8e-a035-0b8e150c335b	parent_94009966	parent_94009966@zinat.local	$2b$10$DOcpTTYzYPngjmDWOGGqGuAqUtzzXs6MxGXRgRJu6ii0SS3GAibIW	والد	الطالب تسنيم المصلحية	parent	\N	94009966	\N	\N	t	\N	1	2025-11-01 13:05:12.256736	2025-11-01 13:05:12.256736	f	f	parent
77c826d9-860a-4ffb-94c2-900c5979e60e	parent_99123363	parent_99123363@zinat.local	$2b$10$GU7UClV4NcJzudSWV7VGLOxKdEip8FuBq10RHCNIh9coaOlmciRra	والدة	الطالب الهنوف الحارثي	parent	\N	99123363	\N	\N	t	\N	1	2025-11-01 13:05:12.332011	2025-11-01 13:05:12.332011	f	f	parent
960554b6-4e45-49c2-b3ed-ba49cef0495a	parent_92082950	parent_92082950@zinat.local	$2b$10$acoA7GhTFD6jWjN/uAU0XuiQhL.2IPEeV7hz8hWu7jzx4TxgQy8Su	والد	الطالب الهنوف الحارثي	parent	\N	92082950	\N	\N	t	\N	1	2025-11-01 13:05:12.403403	2025-11-01 13:05:12.403403	f	f	parent
1c19719a-2950-4cb0-95ec-48ca660ce897	parent_95441993	parent_95441993@zinat.local	$2b$10$yGGjao2m6oyZmnmExqXbi.2mX2iW.oLwsE.gYRegD2HC7BD1TeYki	والدة	الطالب سُلطان اليعرُبي	parent	\N	95441993	\N	\N	t	\N	1	2025-11-01 13:05:12.479997	2025-11-01 13:05:12.479997	f	f	parent
a5a1e1b3-6f98-4092-af08-0fc1e7676909	parent_99478322	parent_99478322@zinat.local	$2b$10$dlZr1Vi.j7KWhMXzDZqWiOZgqAMHC.ugp9/n8ANwh9/8oLF827Fr.	والد	الطالب سُلطان اليعرُبي	parent	\N	99478322	\N	\N	t	\N	1	2025-11-01 13:05:12.550992	2025-11-01 13:05:12.550992	f	f	parent
cf7efac9-da83-46e8-bca1-4261136da64f	parent_95910310	parent_95910310@zinat.local	$2b$10$UDw9SbtzXjxaYswwOHORneePZIPgedSlXYr2A2tP/osle84wF5elO	والدة	الطالب سالم المسكري	parent	\N	95910310	\N	\N	t	\N	1	2025-11-01 13:05:12.62649	2025-11-01 13:05:12.62649	f	f	parent
fa079dd0-dffa-4cd7-82f6-4563844ca893	parent_93500098	parent_93500098@zinat.local	$2b$10$hBR8IpHN7Bf4/3OANVIVJ..8Fc8m8kdUZ5xBmG9q8Tm9L3eu9R7YW	والد	الطالب سالم المسكري	parent	\N	93500098	\N	\N	t	\N	1	2025-11-01 13:05:12.698928	2025-11-01 13:05:12.698928	f	f	parent
82f57cbf-83c7-4262-a0f4-4163874bb7c9	parent_91964112	parent_91964112@zinat.local	$2b$10$Mc.4SCoo6uxZr4L2ZXgUve//OjFkHZna2QcsTWhBcRVtlGoMr8aVm	والدة	الطالب عبدالله الغيثي	parent	\N	91964112	\N	\N	t	\N	1	2025-11-01 13:05:12.774816	2025-11-01 13:05:12.774816	f	f	parent
f98939d3-9078-49b1-be7f-05d272efb230	parent_92814558	parent_92814558@zinat.local	$2b$10$3NJ9X1p9FGi/NHsOLTi6cuVIK2NXadHVQL6XiLO0jx6/cXB3L/gUC	والد	الطالب عبدالله الغيثي	parent	\N	92814558	\N	\N	t	\N	1	2025-11-01 13:05:12.84523	2025-11-01 13:05:12.84523	f	f	parent
d4db4df5-7b08-4df8-8875-9c81732d1f96	parent_95239039	parent_95239039@zinat.local	$2b$10$w5a7FZNkpXM5CbHbAHSBDOXNmZMH1hvtt8cR6Crm979XEydVTteSS	والدة	الطالب مزن المسكرية	parent	\N	95239039	\N	\N	t	\N	1	2025-11-01 13:05:12.91939	2025-11-01 13:05:12.91939	f	f	parent
c1ed771a-e271-426d-85d1-7eb549904a8e	parent_96777593	parent_96777593@zinat.local	$2b$10$km.XhgZ050rY1W9wUxD4nekjGXD7.tSqxnvzTc8NETjpbh.4CbRLW	والد	الطالب مزن المسكرية	parent	\N	96777593	\N	\N	t	\N	1	2025-11-01 13:05:12.98996	2025-11-01 13:05:12.98996	f	f	parent
6851375a-78ad-4b8d-a75d-f440e25cd8ab	teacher_حميدة	حميدة@zinat.local	$2b$10$m9Xj.WosMZOCtWomd5zs/umqlAh5vNMC0owVU8srojXpOGzJQqeFK	حميدة	معلمة	teacher	\N	\N	\N	\N	t	\N	1	2025-11-01 13:05:13.063179	2025-11-01 13:05:13.063179	f	f	staff
2f68f713-f89a-4ba9-a407-3f6e587ededb	parent_96010653	parent_96010653@zinat.local	$2b$10$5AfNbgDEzKlCO/MwOBog3Oht2w7CLTa8zPeI4q5I3N8eZtmCvMxlS	والدة	الطالب آية المغيرية	parent	\N	96010653	\N	\N	t	\N	1	2025-11-01 13:05:13.137792	2025-11-01 13:05:13.137792	f	f	parent
b999d881-15bb-42fb-a16a-62197a0dccd4	parent_96706407	parent_96706407@zinat.local	$2b$10$E5aUUthmuBD4jUM2F0HrNu47Y0nxzYLjBtat4s376xUf01z2ZFdZW	والد	الطالب آية المغيرية	parent	\N	96706407	\N	\N	t	\N	1	2025-11-01 13:05:13.20845	2025-11-01 13:05:13.20845	f	f	parent
9758dd51-d35c-45d1-905f-acdb17292d9e	parent_98532380	parent_98532380@zinat.local	$2b$10$e/ZUTVTGvpRT/yKdQ32V5uaqoR.yyIyezlhCWspHhrimXn.Sj0Ima	والدة	الطالب شبيب الغنيمي	parent	\N	98532380	\N	\N	t	\N	1	2025-11-01 13:05:13.281985	2025-11-01 13:05:13.281985	f	f	parent
a2676579-27f9-4771-90cc-0a550284502f	parent_96212441	parent_96212441@zinat.local	$2b$10$E1qLFhFIxt6TXF0v.nJDfe3aXqby/SuuxAY4pzbkFfTdNj9t5lHoy	والد	الطالب شبيب الغنيمي	parent	\N	96212441	\N	\N	t	\N	1	2025-11-01 13:05:13.352355	2025-11-01 13:05:13.352355	f	f	parent
0c161026-ab1e-45f0-8b28-ed1fa84f26cd	parent_95611424	parent_95611424@zinat.local	$2b$10$/LB/17o6/f3E3WgmUF.s5uv4lYDZ2R3noVgqCJYqzarGHnWSQjA4e	والدة	الطالب أنس السعدي	parent	\N	95611424	\N	\N	t	\N	1	2025-11-01 13:05:13.427758	2025-11-01 13:05:13.427758	f	f	parent
89784620-631d-4615-aabd-ec85e26b61c2	parent_98888208	parent_98888208@zinat.local	$2b$10$D9jVzQubv1kwgvMEvFLK/ul.L4lC7yHF5u/ZNtAn.mY21bjJtAXXS	والدة	الطالب الآء الأبروية	parent	\N	98888208	\N	\N	t	\N	1	2025-11-01 13:05:13.501984	2025-11-01 13:05:13.501984	f	f	parent
70923e92-670f-42f6-a47f-3bf4f4c85425	parent_99897769	parent_99897769@zinat.local	$2b$10$ebK5jhZxq/EDeDwpMWhoYu3WK/r6GHrXNfdVrgDSg7r6/617FP2VW	والد	الطالب الآء الأبروية	parent	\N	99897769	\N	\N	t	\N	1	2025-11-01 13:05:13.572233	2025-11-01 13:05:13.572233	f	f	parent
ec2a0493-ed8f-4357-b077-f0c3b70cdf40	parent_97390222	parent_97390222@zinat.local	$2b$10$vqVaxOyO9IJ0kKI2w12bAO0Slw/3B1SNMVruwfFbBsSP.HDhuYpqS	والدة	الطالب سيف الغنيمي	parent	\N	97390222	\N	\N	t	\N	1	2025-11-01 13:05:13.647304	2025-11-01 13:05:13.647304	f	f	parent
4c386882-d5be-4780-ba79-9396865b92d9	parent_95020222	parent_95020222@zinat.local	$2b$10$qgiCVX2g0KgQq1r8HPnDZeCJV6oWuy8BUtUDr4nGZPB1gxTMYd7tq	والد	الطالب سيف الغنيمي	parent	\N	95020222	\N	\N	t	\N	1	2025-11-01 13:05:13.717511	2025-11-01 13:05:13.717511	f	f	parent
88dc95f1-bd76-410d-91db-a5a3b9124975	parent_90197579	parent_90197579@zinat.local	$2b$10$zLi7HYl5k2X6w7ww8a6XaOSW9IEJnik1qtG7QCPeowWGYbw5GizXS	والدة	الطالب أمنة المسكرية	parent	\N	90197579	\N	\N	t	\N	1	2025-11-01 13:05:13.793116	2025-11-01 13:05:13.793116	f	f	parent
30c52579-2048-4d00-b1e5-955d2436386c	parent_91221290	parent_91221290@zinat.local	$2b$10$za56UzWeTbgNzfvo7JTpS.IM7AyV44CeCtFHW.tsU6NZA56oca9BG	والدة	الطالب حلا اليزيدية	parent	\N	91221290	\N	\N	t	\N	1	2025-11-01 13:05:13.866824	2025-11-01 13:05:13.866824	f	f	parent
8ade8c92-ffa3-4126-9463-f945be259718	parent_99576843	parent_99576843@zinat.local	$2b$10$TQZf.dGShO1RB67QzoWXoOYJ4caMZmUoOYrj.qZ8Jt7VhyKnuHfRe	والد	الطالب حلا اليزيدية	parent	\N	99576843	\N	\N	t	\N	1	2025-11-01 13:05:13.937868	2025-11-01 13:05:13.937868	f	f	parent
7ff7703f-e9bb-4a79-af8e-f2ee3be7d530	parent_91102383	parent_91102383@zinat.local	$2b$10$nNQOQyvmn1eT.kRyrr0IRu52xWeSX39S5opu3hNamI0B/3HjHuUQa	والدة	الطالب هبة الأبروية	parent	\N	91102383	\N	\N	t	\N	1	2025-11-01 13:05:14.01223	2025-11-01 13:05:14.01223	f	f	parent
58bd1bf3-df9a-46f7-bc47-9bb3daf9b603	parent_92223282	parent_92223282@zinat.local	$2b$10$fWgOw4gPYkfanCCnBvnRsO03LniChjSZJ8iDf/jt2GcRtHgge/MZ.	والد	الطالب هبة الأبروية	parent	\N	92223282	\N	\N	t	\N	1	2025-11-01 13:05:14.082405	2025-11-01 13:05:14.082405	f	f	parent
0c931304-9451-4e4f-b784-1979772b239b	parent_99898928	parent_99898928@zinat.local	$2b$10$/fqzABaaIz20LamPb5bOZe3vPX6dzqWzUomSnzggxgT3Qc3aBWCni	والدة	الطالب هيثم اليزيدي	parent	\N	99898928	\N	\N	t	\N	1	2025-11-01 13:05:14.156746	2025-11-01 13:05:14.156746	f	f	parent
062d39fb-b105-4151-ba0a-c734c2feebd0	parent_99347530	parent_99347530@zinat.local	$2b$10$4Aw4bBOkKHuLl3vps7awROOYeh5HL.xeaj84zwb/NVe2yNCyrzjXG	والد	الطالب هيثم اليزيدي	parent	\N	99347530	\N	\N	t	\N	1	2025-11-01 13:05:14.230409	2025-11-01 13:05:14.230409	f	f	parent
229e8ef1-2ae7-4b8b-b2cf-03b7580962fb	parent_94499896	parent_94499896@zinat.local	$2b$10$D6JIuqwnqgw2DaZyOR66ueJ0lE7MQyigOWE8qJRqKhp2y2EjSjtze	والدة	الطالب رهام الرحبية	parent	\N	94499896	\N	\N	t	\N	1	2025-11-01 13:05:14.310269	2025-11-01 13:05:14.310269	f	f	parent
d7608138-1bfd-4c3b-837e-1bc1e6198678	parent_92304811	parent_92304811@zinat.local	$2b$10$yU9mNS.BUYBkKi.9oSDJwuRgqHhMReXJOGhMM.DBHUp7bANBtUD.O	والد	الطالب رهام الرحبية	parent	\N	92304811	\N	\N	t	\N	1	2025-11-01 13:05:14.383935	2025-11-01 13:05:14.383935	f	f	parent
38fa0944-0f83-4039-af56-7663e215f9db	parent_92518477	parent_92518477@zinat.local	$2b$10$ExoLrYQNfHz7lqbb7OZyLeXAsin0wyxTZxS18vFhJqJl5D8HbBqoS	والدة	الطالب مريم السعدية	parent	\N	92518477	\N	\N	t	\N	1	2025-11-01 13:05:14.459724	2025-11-01 13:05:14.459724	f	f	parent
7da42408-4383-4450-b75b-e1a902cd9198	parent_92907478	parent_92907478@zinat.local	$2b$10$Gy0hLdLNffne6auSvTnyAeqKa6qW59qE2lXTsNSXPDUQ1exibGMfi	والد	الطالب مريم السعدية	parent	\N	92907478	\N	\N	t	\N	1	2025-11-01 13:05:14.53418	2025-11-01 13:05:14.53418	f	f	parent
7a2ca9e6-c8f9-48c5-847d-2bc4edeee4d0	parent_90946647	parent_90946647@zinat.local	$2b$10$onfX92R9G0Vypq8Wn01LM.klgPfJKwbJ5LD3v6Ga6j98G.nAyV5SK	والدة	الطالب الحسن المصلحي	parent	\N	90946647	\N	\N	t	\N	1	2025-11-01 13:05:14.610306	2025-11-01 13:05:14.610306	f	f	parent
6121a9d2-4c88-491c-99fb-08afd85b9210	parent_95908395	parent_95908395@zinat.local	$2b$10$uPjnwCOSNSLMwcOjJuiFcuttd6o9UUUKVL2VRxzVw6.Wa9VP6oVUy	والد	الطالب الحسن المصلحي	parent	\N	95908395	\N	\N	t	\N	1	2025-11-01 13:05:14.679974	2025-11-01 13:05:14.679974	f	f	parent
5889749c-2b89-4d94-bd3f-cfb988ff9725	parent_96067035	parent_96067035@zinat.local	$2b$10$TcFW3Te3bknrCrfbP/.xfe1JM7cJaNiT17Z6RtXk9KNuWfbSpcV3y	والدة	الطالب محمد اليزيدي	parent	\N	96067035	\N	\N	t	\N	1	2025-11-01 13:05:14.753674	2025-11-01 13:05:14.753674	f	f	parent
508ebed4-44cd-4ce1-9ac9-19c9835df0e3	parent_92296979	parent_92296979@zinat.local	$2b$10$sHCdWiDFFdil1tJRdV678ua7JOvueIfKocdpN8oTjuH2vhf7XlgEq	والد	الطالب محمد اليزيدي	parent	\N	92296979	\N	\N	t	\N	1	2025-11-01 13:05:14.825126	2025-11-01 13:05:14.825126	f	f	parent
050396ff-a166-43ea-af3a-d87013ccab7f	parent_96433061	parent_96433061@zinat.local	$2b$10$CaEMHXdR.C84WxT6O0oOc.z7WpUsh2S3g6TidFnZjiMG7QNlyQjXS	والدة	الطالب نبراس الحارثي	parent	\N	96433061	\N	\N	t	\N	1	2025-11-01 13:05:14.899006	2025-11-01 13:05:14.899006	f	f	parent
0450c32a-17de-48fd-b5da-7dbf49da1683	parent_95047783	parent_95047783@zinat.local	$2b$10$vu5d6q9GIgkblWCHAvaCH.N5UbcP/JhWQUS1qzezi/crvW34Bp5zC	والد	الطالب نبراس الحارثي	parent	\N	95047783	\N	\N	t	\N	1	2025-11-01 13:05:14.969408	2025-11-01 13:05:14.969408	f	f	parent
4692c087-d170-4cf4-81f6-3de91d9b66a9	parent_93251825	parent_93251825@zinat.local	$2b$10$x/pWZW1u2wxzfzpqBTRl.O.o7N/aJh9FbtcEPkwgZqlb5A3jNhzU.	والدة	الطالب هبة الغنيمية	parent	\N	93251825	\N	\N	t	\N	1	2025-11-01 13:05:15.047496	2025-11-01 13:05:15.047496	f	f	parent
daf4bcc1-321f-43e9-9027-4f5c0cc85e58	parent_99646261	parent_99646261@zinat.local	$2b$10$G5o83EEtJLngoJJte2VqGOl93vmavTNnZFe93xi2N7KGUp9IREyKi	والد	الطالب هبة الغنيمية	parent	\N	99646261	\N	\N	t	\N	1	2025-11-01 13:05:15.118552	2025-11-01 13:05:15.118552	f	f	parent
a0caa5c4-f27c-4130-b9c3-9fe505577fb3	parent_96927883	parent_96927883@zinat.local	$2b$10$0BU5VeiNu/nx0qHEgpY4Wu1WtlbX5mP8DL4cMbi0WDX4xd0y6/m66	والدة	الطالب إيلاف النظيرية	parent	\N	96927883	\N	\N	t	\N	1	2025-11-01 13:05:15.197708	2025-11-01 13:05:15.197708	f	f	parent
701a1dcd-a3d7-4794-b9f6-cfb379f7bba7	parent_95822009	parent_95822009@zinat.local	$2b$10$Y6f4S6nDG5bzh8qi6lGuI.1f3HM6m9/qTr4QGqFrCz9JzDgKJDeM2	والد	الطالب إيلاف النظيرية	parent	\N	95822009	\N	\N	t	\N	1	2025-11-01 13:05:15.268309	2025-11-01 13:05:15.268309	f	f	parent
78257e11-5697-4f25-9e33-22d643c058fd	parent_96448770	parent_96448770@zinat.local	$2b$10$HMKnNFlnVYnTu02VHz3dQ.nC4R1b/aVZ4uDInc/wbPPpepvDoawB2	والدة	الطالب مسك المسكرية	parent	\N	96448770	\N	\N	t	\N	1	2025-11-01 13:05:15.344354	2025-11-01 13:05:15.344354	f	f	parent
92b1e7e2-d80f-45c6-82f4-35e3edfa345a	parent_98675050	parent_98675050@zinat.local	$2b$10$PQUWa2034zLK6QTjS6WZNexx5eZo3T4xkpaXFENrV43d6oTJYapPu	والد	الطالب مسك المسكرية	parent	\N	98675050	\N	\N	t	\N	1	2025-11-01 13:05:15.414836	2025-11-01 13:05:15.414836	f	f	parent
29eebfaa-db31-44b5-8d5e-38e5e70b2773	parent_93555689	parent_93555689@zinat.local	$2b$10$t7r9dl1wHwT8/X0wKU6V1.s0lXnzaI7H0KXSaKsJ1Ud6ITTtiuirW	والدة	الطالب أمجد السابقي	parent	\N	93555689	\N	\N	t	\N	1	2025-11-01 13:05:15.490691	2025-11-01 13:05:15.490691	f	f	parent
86b7ae18-1a5e-42ea-af70-06b3e2f52dbb	parent_92949543	parent_92949543@zinat.local	$2b$10$n.sBVjitzcq3wgDsUFMCVeuTTJO4gU8edOm66fnNbKM2bJ8QoL/Xu	والد	الطالب أمجد السابقي	parent	\N	92949543	\N	\N	t	\N	1	2025-11-01 13:05:15.561694	2025-11-01 13:05:15.561694	f	f	parent
e430974d-cf7f-4002-af49-206cfb6e9a33	parent_99262434	parent_99262434@zinat.local	$2b$10$iTfmwzc3oBLdWI.HhO.IZ.RNxHxQbEfX2gWMtOeneWaqjcCuFjxci	والدة	الطالب فارس الغنيمي	parent	\N	99262434	\N	\N	t	\N	1	2025-11-01 13:05:15.638347	2025-11-01 13:05:15.638347	f	f	parent
7fb7537c-d176-4193-97d6-a02181150732	parent_97149449	parent_97149449@zinat.local	$2b$10$13BI.RJw1RuCVM1R2vk6g.9LMAM0mCs46YcSmsDQP0jupJHSaorkC	والد	الطالب فارس الغنيمي	parent	\N	97149449	\N	\N	t	\N	1	2025-11-01 13:05:15.709374	2025-11-01 13:05:15.709374	f	f	parent
2d08436e-13c1-42a5-8141-e9fc1ce3977c	parent_97277795	parent_97277795@zinat.local	$2b$10$ZTW2.crrQQ7ORGd04otp8.342kTZxfnKcDipTWsQsQy7/.SCZ47Ry	والدة	الطالب عمر الحارثي	parent	\N	97277795	\N	\N	t	\N	1	2025-11-01 13:05:15.784436	2025-11-01 13:05:15.784436	f	f	parent
dd5cd6f6-ff8c-4388-bd9a-cfbad6de25e6	parent_96162624	parent_96162624@zinat.local	$2b$10$ay/A4epzMYhC1b1jRDcIwuTgusuMzok7GrX/CoI3tyfG7rdrjvGSK	والد	الطالب عمر الحارثي	parent	\N	96162624	\N	\N	t	\N	1	2025-11-01 13:05:15.859854	2025-11-01 13:05:15.859854	f	f	parent
d6081ae2-5945-4c1e-bfe2-b523c3bb9285	parent_95426643	parent_95426643@zinat.local	$2b$10$mNc8GmRdzAn7Ei2CwAAGeeA3c3HW3nR8vxqG7VVp0HB3V5rWiLMji	والدة	الطالب سارة الطوقية	parent	\N	95426643	\N	\N	t	\N	1	2025-11-01 13:05:15.936323	2025-11-01 13:05:15.936323	f	f	parent
206d0f37-cf5e-426b-b2d5-c4eb64270af4	parent_94738797	parent_94738797@zinat.local	$2b$10$hNDeR5x3iyYsXYQeB3mkouVNXTdM5KvoVVVz04agCNUgmGXSsZ032	والد	الطالب سارة الطوقية	parent	\N	94738797	\N	\N	t	\N	1	2025-11-01 13:05:16.007558	2025-11-01 13:05:16.007558	f	f	parent
721d5d7b-13fc-47dc-b5ba-f5414c2a5f4a	teacher_نسيبة	نسيبة@zinat.local	$2b$10$FnPFXkFvkWgoFb1NKeSNZuG1CwvDi8RImdV64.2hm044RCUQ2MStS	نسيبة	معلمة	teacher	\N	\N	\N	\N	t	\N	1	2025-11-01 13:05:16.080897	2025-11-01 13:05:16.080897	f	f	staff
d9c69096-cb9a-4659-bcf2-d77386e926f0	parent_99119220	parent_99119220@zinat.local	$2b$10$BlWX6tlhcNC5njsLIJzX6O/3gNj9L5.gZes5MKU3epliAr7KP8z0.	والدة	الطالب هاجر الأبروية	parent	\N	99119220	\N	\N	t	\N	1	2025-11-01 13:05:16.153423	2025-11-01 13:05:16.153423	f	f	parent
589ef6b4-9221-4f84-a9c7-a501ab74fe94	parent_99343718	parent_99343718@zinat.local	$2b$10$3bc/85Rd43eit4dwx2GTuutsSVF0L15xkEnt0Y5wexOnJyA.jCyqW	والد	الطالب هاجر الأبروية	parent	\N	99343718	\N	\N	t	\N	1	2025-11-01 13:05:16.223999	2025-11-01 13:05:16.223999	f	f	parent
fb90e8f7-8e77-4578-8aff-365b31e9aa14	parent_98963964	parent_98963964@zinat.local	$2b$10$B6IeE99NUvDIjXxkXuHZAekfPaCJpodDBQsXF1nFJSoocVidzehWi	والدة	الطالب بشائر المسكرية	parent	\N	98963964	\N	\N	t	\N	1	2025-11-01 13:05:16.299451	2025-11-01 13:05:16.299451	f	f	parent
4746f4e0-dba5-4709-b184-01dd81f8ce76	parent_99113491	parent_99113491@zinat.local	$2b$10$L3mo55D9QNXlgZcxcyNKqOjgES1GoisQg6jil6pv2cTlNQkyU4nfa	والدة	الطالب هاجر المصلحية	parent	\N	99113491	\N	\N	t	\N	1	2025-11-01 13:05:16.373435	2025-11-01 13:05:16.373435	f	f	parent
dadcdf93-6389-4b02-aa21-395765100eb6	parent_95888218	parent_95888218@zinat.local	$2b$10$QMW0Ns6v4XLKt/TEsBrptukNr8nYlVr6csEgEduRMGx3GUObzZ326	والد	الطالب هاجر المصلحية	parent	\N	95888218	\N	\N	t	\N	1	2025-11-01 13:05:16.444793	2025-11-01 13:05:16.444793	f	f	parent
340beb3c-09c9-4165-8e48-cbabb790c218	parent_95967228	parent_95967228@zinat.local	$2b$10$GqhzxPunUHuMgKC3Bz8ED.e8imglzJHBOeJt7pPbFcBkhD1u1h5qq	والدة	الطالب سلطان المغيري	parent	\N	95967228	\N	\N	t	\N	1	2025-11-01 13:05:16.519961	2025-11-01 13:05:16.519961	f	f	parent
00cce789-c94a-4d7a-b902-b3b559b96221	parent_92466566	parent_92466566@zinat.local	$2b$10$Brkn/KUtQ9goQybf/byA0Ow3iHdfATDwxSUXdwA0nSFamc.S30ZnO	والد	الطالب سلطان المغيري	parent	\N	92466566	\N	\N	t	\N	1	2025-11-01 13:05:16.590254	2025-11-01 13:05:16.590254	f	f	parent
7d287a6a-6e67-406d-a8a4-c39ee5abfc8c	parent_92929386	parent_92929386@zinat.local	$2b$10$yVU4LgSFDOC0wEbZm7xQue8oaXSlnaH7y6z.obsmKmtX7gaGTiSZ2	والدة	الطالب مريم الريامية	parent	\N	92929386	\N	\N	t	\N	1	2025-11-01 13:05:16.665601	2025-11-01 13:05:16.665601	f	f	parent
c75c9ee0-0542-4b29-9d28-228b9641a77e	parent_96010671	parent_96010671@zinat.local	$2b$10$LLk3A0TiUlPS9Z.I7QD/0uzRPlK0YYOSQJxsTSk2kUey.YViMxFvW	والد	الطالب مريم الريامية	parent	\N	96010671	\N	\N	t	\N	1	2025-11-01 13:05:16.735709	2025-11-01 13:05:16.735709	f	f	parent
6ab29946-2b34-4591-a28d-309a53965cf2	parent_92260170	parent_92260170@zinat.local	$2b$10$dj/OQAFUa2YaCKqdIlkleuVxfcdaAaQ5eIyR3W/wZbOWSvCZ8VlOK	والدة	الطالب البتول المصلحي	parent	\N	92260170	\N	\N	t	\N	1	2025-11-01 13:05:16.810365	2025-11-01 13:05:16.810365	f	f	parent
8ea74c5d-e7e5-4c41-a70d-3516728ae3e5	parent_98273385	parent_98273385@zinat.local	$2b$10$.vHmD8a3X51StqnCEkw.N.ybv.UCIJpN3FQO9RO0DkiVsYP6JVx4m	والد	الطالب البتول المصلحي	parent	\N	98273385	\N	\N	t	\N	1	2025-11-01 13:05:16.881158	2025-11-01 13:05:16.881158	f	f	parent
8a872ed0-d70d-40e5-8bc4-6325d64efedf	parent_92933730	parent_92933730@zinat.local	$2b$10$.HyeP/Oj9EiYG9A8ZlPoReNhXPfhPB2Qajt4X6.gUVCeFV4BTMy2i	والدة	الطالب محمد اليزيدي	parent	\N	92933730	\N	\N	t	\N	1	2025-11-01 13:05:16.955015	2025-11-01 13:05:16.955015	f	f	parent
16967956-6195-4ea4-8427-52389d8f0a02	parent_99024544	parent_99024544@zinat.local	$2b$10$7n/GT63q0m.ISlO0ndoV2uwFi5naGZw6s0KA3M7Xsjm4z6qdjhTum	والد	الطالب محمد اليزيدي	parent	\N	99024544	\N	\N	t	\N	1	2025-11-01 13:05:17.026553	2025-11-01 13:05:17.026553	f	f	parent
79aedf0c-beee-4966-82a0-9cdf232b34d2	parent_95128431	parent_95128431@zinat.local	$2b$10$wtin2PASEm7uk5jqkRQbbemkF6ddG.x1K849kASWbPDZK.4yfa.jO	والدة	الطالب سليمان السعدي	parent	\N	95128431	\N	\N	t	\N	1	2025-11-01 13:05:17.101879	2025-11-01 13:05:17.101879	f	f	parent
d1bbc32c-63bd-4144-99b9-794f9302c851	parent_95480570	parent_95480570@zinat.local	$2b$10$hPPBakK3PiW07KxR3blCKu11o5DojRmVNXg/O5FeKf6DYB5iG.5K2	والد	الطالب سليمان السعدي	parent	\N	95480570	\N	\N	t	\N	1	2025-11-01 13:05:17.172797	2025-11-01 13:05:17.172797	f	f	parent
447bb373-1d1a-486a-85e4-77d22fcf76f7	parent_95924561	parent_95924561@zinat.local	$2b$10$EXsrV28/h4w3mDB4MWHvduvvrz1OS8PTICaN0GTZB4OfIaHRrDmRS	والدة	الطالب جمان الرحبية	parent	\N	95924561	\N	\N	t	\N	1	2025-11-01 13:05:17.24973	2025-11-01 13:05:17.24973	f	f	parent
16b566b9-cfbe-4957-92e7-2b1abf9fc251	parent_92677489	parent_92677489@zinat.local	$2b$10$Bpmu3yFW5tD9J2lof.RKCeKAPnxxZ.upA/xJbL.slV9txvxx/PBK.	والد	الطالب جمان الرحبية	parent	\N	92677489	\N	\N	t	\N	1	2025-11-01 13:05:17.320757	2025-11-01 13:05:17.320757	f	f	parent
9294319d-46a2-42cc-a7c4-aa67b4413d62	parent_92837305	parent_92837305@zinat.local	$2b$10$yWQf4VRPBWvju.fOxkp3HOpqf5v7n.Da7tIhf7K7Kn1zD3OKefodG	والدة	الطالب سارة السيابية	parent	\N	92837305	\N	\N	t	\N	1	2025-11-01 13:05:17.395999	2025-11-01 13:05:17.395999	f	f	parent
8f30fce8-0f4f-4088-9b56-46a6d50878ef	parent_99790947	parent_99790947@zinat.local	$2b$10$CAhNqoM52yAQzA2SfTPiPOWj9bKYW4ofvXoraRQJnLZc02CTRNX/O	والد	الطالب سارة السيابية	parent	\N	99790947	\N	\N	t	\N	1	2025-11-01 13:05:17.467143	2025-11-01 13:05:17.467143	f	f	parent
35f776d1-55da-4bb5-95fe-76814b898980	parent_95266492	parent_95266492@zinat.local	$2b$10$tnQcpGY2/sQ3I.0E6J84Ie0v.yS/gQBVZ9dJrYeX/XHRft2rCcIhm	والدة	الطالب سعيد السيابي	parent	\N	95266492	\N	\N	t	\N	1	2025-11-01 13:05:17.550012	2025-11-01 13:05:17.550012	f	f	parent
3146ee4a-8028-4223-8ee4-8c31f1b89a47	parent_99005499	parent_99005499@zinat.local	$2b$10$0Ql7eUyf9EoCALOfjxFBKeU1NxzfTwePYhZ8atYey0kpe5tEC0qL.	والد	الطالب سعيد السيابي	parent	\N	99005499	\N	\N	t	\N	1	2025-11-01 13:05:17.621842	2025-11-01 13:05:17.621842	f	f	parent
2de1e070-a8ab-4848-8753-97103be25a4a	parent_99899662	parent_99899662@zinat.local	$2b$10$UZgrX9nvpaYq59F4d0vvvuI3CgOm5VUQowLDAl8EK.IAXwVa7Hi52	والدة	الطالب يحيى البراشدي	parent	\N	99899662	\N	\N	t	\N	1	2025-11-01 13:05:17.696275	2025-11-01 13:05:17.696275	f	f	parent
e882c565-48d2-425b-874e-6f4b7062d156	parent_99332992	parent_99332992@zinat.local	$2b$10$2mnRG54M/1GvaxBTHQvxcOGt/n9e9/i3Zb2xIZes27EDE6y7rEfwK	والد	الطالب يحيى البراشدي	parent	\N	99332992	\N	\N	t	\N	1	2025-11-01 13:05:17.766802	2025-11-01 13:05:17.766802	f	f	parent
7187b603-dde1-404a-b7aa-2fcfe9279d25	parent_93336581	parent_93336581@zinat.local	$2b$10$yn.qnrXN3aM33bSDy2XzjOrC94Jh42.UJHanM0Eg9WQnEy6ty3i.W	والدة	الطالب تيمور المصلحي	parent	\N	93336581	\N	\N	t	\N	1	2025-11-01 13:05:17.843484	2025-11-01 13:05:17.843484	f	f	parent
7469ffeb-d3e4-4bbc-ae92-42dfe2f65a5c	parent_99238295	parent_99238295@zinat.local	$2b$10$3zCyi77rzFPyJth3xSibuu6gASArFGJr4Ok8ufWyToOHN300mrDAC	والد	الطالب تيمور المصلحي	parent	\N	99238295	\N	\N	t	\N	1	2025-11-01 13:05:17.915836	2025-11-01 13:05:17.915836	f	f	parent
a3fee07a-837f-47c3-b51f-e0dc998ee761	parent_93527457	parent_93527457@zinat.local	$2b$10$z8OCus3Q3eZsrPJSagd0ceiaUijMgk.k.u.c48Pv3qSCcGkje8Wqy	والدة	الطالب نور السعدية	parent	\N	93527457	\N	\N	t	\N	1	2025-11-01 13:05:17.991879	2025-11-01 13:05:17.991879	f	f	parent
dfdad4c3-98f3-4a2f-8b83-feb612f9d698	parent_99518145	parent_99518145@zinat.local	$2b$10$CQDF4qPBPZ3QNO3B37vNAeGjqGbdG9E2i5IC//Zewa.XfYlQqtebi	والد	الطالب نور السعدية	parent	\N	99518145	\N	\N	t	\N	1	2025-11-01 13:05:18.062617	2025-11-01 13:05:18.062617	f	f	parent
4f408358-e42c-4ad1-b455-484126e71dd4	teacher_شمسة	شمسة@zinat.local	$2b$10$QvKlLXwfjLESh0L9hYv9MutHAcmquTBqQWmRAwFmNaEYpR2kwa34q	شمسة	معلمة	teacher	\N	\N	\N	\N	t	\N	1	2025-11-01 13:05:18.134646	2025-11-01 13:05:18.134646	f	f	staff
026aeaee-3886-4ca7-bd42-adb69c4dcf88	parent_99669597	parent_99669597@zinat.local	$2b$10$eSKipVjzR5Cu2O.awIu3OOKx7xEWbXYyN/3zdWyU6sHN6qjH/hJYm	والدة	الطالب فرح الشحيمية	parent	\N	99669597	\N	\N	t	\N	1	2025-11-01 13:05:18.207995	2025-11-01 13:05:18.207995	f	f	parent
c75126c3-5c9a-44d7-bf38-799fbc60f6c0	parent_92839030	parent_92839030@zinat.local	$2b$10$ydl6v.9ExWP5bo0rcc6nH.popn0ToLQTA2dQx0rkwylopNN8L5ThS	والد	الطالب فرح الشحيمية	parent	\N	92839030	\N	\N	t	\N	1	2025-11-01 13:05:18.278057	2025-11-01 13:05:18.278057	f	f	parent
7b2b66c0-ce89-407f-93bc-e2b1c28187b0	parent_92311816	parent_92311816@zinat.local	$2b$10$Tvgg7UGgA3z0f6BYeSANxesaO4Y7dfB635R80k6PfspRbYLaRo0pO	والدة	الطالب حمزة المسكري	parent	\N	92311816	\N	\N	t	\N	1	2025-11-01 13:05:18.352118	2025-11-01 13:05:18.352118	f	f	parent
25165b46-4d4a-4b60-8aa7-11d65d4b0b1c	parent_95464336	parent_95464336@zinat.local	$2b$10$w8Z1mBwKL4OFA3u11HBU1OYOs/rt3T.kFyo3TTKF5MvaMGzQ3afUi	والد	الطالب حمزة المسكري	parent	\N	95464336	\N	\N	t	\N	1	2025-11-01 13:05:18.422872	2025-11-01 13:05:18.422872	f	f	parent
fc529176-1092-4912-a248-9dfd4e46f543	parent_95931443	parent_95931443@zinat.local	$2b$10$ge9RhJPDwSOAoAlLhXOPaOoVe6NgzfY7VjygSSdAtSKq2XjKlo7nq	والدة	الطالب لتين المسكري	parent	\N	95931443	\N	\N	t	\N	1	2025-11-01 13:05:18.497269	2025-11-01 13:05:18.497269	f	f	parent
5f2397c2-a60a-43b5-bc2d-0dbf2224f31e	parent_96467667	parent_96467667@zinat.local	$2b$10$vsyMtUNGwc3Nh/7P0MpsH.lZI6fr3KO.BVzVxOKFhXlAGNZthfjPu	والد	الطالب لتين المسكري	parent	\N	96467667	\N	\N	t	\N	1	2025-11-01 13:05:18.56869	2025-11-01 13:05:18.56869	f	f	parent
6232fc09-1a6d-4567-a9e2-1a40320dec97	parent_98200029	parent_98200029@zinat.local	$2b$10$ypyWPa1JLo7luQW/D0EAeeivNb.s1C2knomF5LIm30EfUg5V4jgqK	والدة	الطالب ملاك العزري	parent	\N	98200029	\N	\N	t	\N	1	2025-11-01 13:05:18.644698	2025-11-01 13:05:18.644698	f	f	parent
67ccaa1b-c79d-4da7-a937-aeebb695197e	parent_93000045	parent_93000045@zinat.local	$2b$10$V7P7Le99EaSCPtpeDC3TPOcSUIl8ngUK/RZddUy2ZsTjaOgq7qXs2	والد	الطالب ملاك العزري	parent	\N	93000045	\N	\N	t	\N	1	2025-11-01 13:05:18.715254	2025-11-01 13:05:18.715254	f	f	parent
212a03cd-6439-4847-9825-6c26cd264402	parent_95215738	parent_95215738@zinat.local	$2b$10$qbuk7BnV0zsOk9I1B1v3ReHvNsPsXwo3XaQ4k2Z1PiJSKJfXs0XyK	والدة	الطالب يوسف الصقري	parent	\N	95215738	\N	\N	t	\N	1	2025-11-01 13:05:18.789231	2025-11-01 13:05:18.789231	f	f	parent
7bda3396-5546-428b-b550-2be19e61f02e	parent_96641062	parent_96641062@zinat.local	$2b$10$.9OnjDdFD5VvKK0bCAzJneV4YSVUqE86iSR3HCq/lYLSD68Pu98m.	والد	الطالب يوسف الصقري	parent	\N	96641062	\N	\N	t	\N	1	2025-11-01 13:05:18.860704	2025-11-01 13:05:18.860704	f	f	parent
56563198-8357-4534-ab1d-f8734ea5482c	parent_96402929	parent_96402929@zinat.local	$2b$10$qdEAXwB2NUUBeNXFgQ63n.R/AXADNxa5rKjK0.T3ZXf9T7L2tANZ.	والدة	الطالب أنس الحارثي	parent	\N	96402929	\N	\N	t	\N	1	2025-11-01 13:05:18.939458	2025-11-01 13:05:18.939458	f	f	parent
ae54bd88-6e62-4ff8-b7b1-4cf64083114d	parent_94484465	parent_94484465@zinat.local	$2b$10$UnXdCy9UPNocf6S234kwJ.us.U4Dtkc4Amn9DUUpHcBAS4AV0Bcii	والدة	الطالب أنس الحارثي	parent	\N	94484465	\N	\N	t	\N	1	2025-11-01 13:05:19.014753	2025-11-01 13:05:19.014753	f	f	parent
508d3d5d-67c0-4ca4-96c9-1a3b7483aec3	parent_99378699	parent_99378699@zinat.local	$2b$10$7pzsHvtvU2VqUNjRXckI/OacACQ/KqTfbJXngMQjcHLz8uXCLz0SK	والدة	الطالب سدى البوسعيدية	parent	\N	99378699	\N	\N	t	\N	1	2025-11-01 13:05:19.160489	2025-11-01 13:05:19.160489	f	f	parent
f1e2e99d-f1b5-433a-bb1b-6d3ccacc9e9f	parent_94050678	parent_94050678@zinat.local	$2b$10$MloV3r6ltlifCgC2KQVDEOaBqJu08F6PRE3OXg2ARs/.4XmYV/D5m	والد	الطالب سدى البوسعيدية	parent	\N	94050678	\N	\N	t	\N	1	2025-11-01 13:05:19.231488	2025-11-01 13:05:19.231488	f	f	parent
d8893906-52fd-4fd3-8a86-0a306aa9bb6d	parent_97126778	parent_97126778@zinat.local	$2b$10$69qLjvqqPQgtDrbdxyA6Zutql2s51n2OFDHDpThKjxsqogt9txeF2	والدة	الطالب نسيبة الصوافية	parent	\N	97126778	\N	\N	t	\N	1	2025-11-01 13:05:19.304412	2025-11-01 13:05:19.304412	f	f	parent
c04ad6bc-da5e-475d-a17b-775b7922fc85	parent_97791661	parent_97791661@zinat.local	$2b$10$8bCpa99fbai14n39sou/O.mk3ufD5po4v4xqbXtIZcZqO2Mp7hG.y	والد	الطالب نسيبة الصوافية	parent	\N	97791661	\N	\N	t	\N	1	2025-11-01 13:05:19.380367	2025-11-01 13:05:19.380367	f	f	parent
cbe77914-89c3-4da1-a502-ee24b5c40552	parent_95175490	parent_95175490@zinat.local	$2b$10$N1b6Fz/3ILdSFrhOWb5SF.Ik2c8khcmYJg7uDrvFhN.UiU8qoJJsy	والدة	الطالب صهيب الحارثي	parent	\N	95175490	\N	\N	t	\N	1	2025-11-01 13:05:19.455261	2025-11-01 13:05:19.455261	f	f	parent
a7a68c5a-ba51-4601-ad54-d8953b2ac03b	parent_94141523	parent_94141523@zinat.local	$2b$10$J.l1dy7LZH1Qg8YDXQvrR.BYIC73fhNtgPx2nmQgYYlL5cA6biFoW	والدة	الطالب الحسن الطالعي	parent	\N	94141523	\N	\N	t	\N	1	2025-11-01 13:05:19.529749	2025-11-01 13:05:19.529749	f	f	parent
f08add49-b480-46d4-9147-8029804238fe	parent_94881766	parent_94881766@zinat.local	$2b$10$M6BTMAea9JBDtiiYsXnaqeE7wzgLgecRdtuqQvJEWYYMYESDWOINe	والد	الطالب الحسن الطالعي	parent	\N	94881766	\N	\N	t	\N	1	2025-11-01 13:05:19.601127	2025-11-01 13:05:19.601127	f	f	parent
4bbcc292-15dd-40c8-b8e1-f4da9859e232	parent_96063357	parent_96063357@zinat.local	$2b$10$daB/Ep1YQenN58XCgWvpieie0Nn6WI5WRdoU/lfvfw6Y6u9HnrEwW	والدة	الطالب شمه الرحبية	parent	\N	96063357	\N	\N	t	\N	1	2025-11-01 13:05:19.676371	2025-11-01 13:05:19.676371	f	f	parent
7928e3f6-2fd7-44e7-a75a-05f5ae0184c4	parent_77535302	parent_77535302@zinat.local	$2b$10$.m6DpHJjJphQF4Y3.zoJ.ed4IZDOFgbBKbN0oBv4Ug1Py1b/QjC.2	والد	الطالب شمه الرحبية	parent	\N	77535302	\N	\N	t	\N	1	2025-11-01 13:05:19.747998	2025-11-01 13:05:19.747998	f	f	parent
c1e32556-ed91-4b87-92de-6ebeb97a5954	parent_92892110	parent_92892110@zinat.local	$2b$10$RG4vc8iAMiShvZwgHL.1puS2SDzC.JxjfN4NC0MLjxChLiGmKhq4W	والدة	الطالب شعيب المسكري	parent	\N	92892110	\N	\N	t	\N	1	2025-11-01 13:05:19.823563	2025-11-01 13:05:19.823563	f	f	parent
6083c320-18c6-4eb8-b865-c9570e321761	parent_96563080	parent_96563080@zinat.local	$2b$10$w.Oi6ns8kDABXDP3JO8XBu0vCkmBMK6O.RwG5fVwwKYo1.otk8JYa	والد	الطالب شعيب المسكري	parent	\N	96563080	\N	\N	t	\N	1	2025-11-01 13:05:19.894231	2025-11-01 13:05:19.894231	f	f	parent
a2f434d3-383b-46e7-9162-f727890716e3	parent_95677123	parent_95677123@zinat.local	$2b$10$YSR5YtWIpTxSmn3s7DWYmuPgmX/zrUm9456uIEBfHTg0SvsGEdYk.	والدة	الطالب سبأ الغزالية	parent	\N	95677123	\N	\N	t	\N	1	2025-11-01 13:05:19.96895	2025-11-01 13:05:19.96895	f	f	parent
ee815e9f-bd7f-4b66-a445-6c68e5f69c07	parent_96035441	parent_96035441@zinat.local	$2b$10$VUbty3Eos6roAecIdmzZyuwqBPuc3yDSdCJeR6HgJaHlK.ZGETspO	والد	الطالب سبأ الغزالية	parent	\N	96035441	\N	\N	t	\N	1	2025-11-01 13:05:20.03921	2025-11-01 13:05:20.03921	f	f	parent
30fb87e9-61a0-4cb0-9efb-0c3ce40b6104	parent_95412391	parent_95412391@zinat.local	$2b$10$6m6uWOAAoEephLmCR9rVOe7OrnIIUP3SJZHp1FrIwpbAsKHaG.Mbq	والدة	الطالب جمان السعدية	parent	\N	95412391	\N	\N	t	\N	1	2025-11-01 13:05:20.115405	2025-11-01 13:05:20.115405	f	f	parent
8e10ee08-86a5-485a-9262-58ff35a54fae	parent_99071736	parent_99071736@zinat.local	$2b$10$Gzww.hujNYhgFcnlcdj.TeZnhsQRyEEUjQ2f8orPdl2dwJHHuSoo6	والد	الطالب جمان السعدية	parent	\N	99071736	\N	\N	t	\N	1	2025-11-01 13:05:20.187406	2025-11-01 13:05:20.187406	f	f	parent
66706916-0a1a-4864-842a-e8c5391e9833	parent_92891771	parent_92891771@zinat.local	$2b$10$btC1g95H3mxEEW1SuRBuNu5MTUswmdMCdvVLGSdwPGqUohieSy6z.	والدة	الطالب سعود الراشدي	parent	\N	92891771	\N	\N	t	\N	1	2025-11-01 13:05:20.262047	2025-11-01 13:05:20.262047	f	f	parent
e84b4419-0154-4ba7-b904-ba15401694ff	parent_92511613	parent_92511613@zinat.local	$2b$10$YDnq4r4Z0S3DPhQvL4wjberj3aMkNyzREcPiJ.2OnTPVs9e/.gPdS	والد	الطالب سعود الراشدي	parent	\N	92511613	\N	\N	t	\N	1	2025-11-01 13:05:20.333235	2025-11-01 13:05:20.333235	f	f	parent
418eff25-67e1-4c9a-a06c-a712fcc18dd7	parent_95343856	parent_95343856@zinat.local	$2b$10$Q2838a57VefotUiYbMOCP.OR1eFW3BwFp1Y.KVekhI6Tk3RXpYjde	والدة	الطالب منذر الحارثي	parent	\N	95343856	\N	\N	t	\N	1	2025-11-01 13:05:20.408055	2025-11-01 13:05:20.408055	f	f	parent
8afb2012-6421-4ba4-be28-68f2b449c544	parent_95555857	parent_95555857@zinat.local	$2b$10$U9UwOfUTXrxLj1LjDFdp7.YMQ1GCmVr38mlH6sII3/QWPbYrcaO4W	والد	الطالب منذر الحارثي	parent	\N	95555857	\N	\N	t	\N	1	2025-11-01 13:05:20.479162	2025-11-01 13:05:20.479162	f	f	parent
a96d6cab-67dc-4179-8a49-7bb79f239a2f	parent_91480091	parent_91480091@zinat.local	$2b$10$XnBvvPTICkqiEb9iu/1gyOnoy/7Re/NlfEwH0WqklN7J2xHgZI6ta	والدة	الطالب أحمد المسكري	parent	\N	91480091	\N	\N	t	\N	1	2025-11-01 13:05:20.558559	2025-11-01 13:05:20.558559	f	f	parent
9e214396-7060-4258-a3ea-c73cfd2e5cbf	parent_99884447	parent_99884447@zinat.local	$2b$10$5Jg4.Xjnf2BshJIjk6dUteccSafR7i1fEuCxW/1pKCdr5ujfgjr2y	والدة	الطالب محمد المصلحي	parent	\N	99884447	\N	\N	t	\N	1	2025-11-01 13:05:20.633116	2025-11-01 13:05:20.633116	f	f	parent
320f0cdb-71ed-488b-96bb-3f87700dfc73	parent_99098811	parent_99098811@zinat.local	$2b$10$cJvtJ6x95yPo1wiEwcs2d.BTv0F8uLyYgTFq9EDzLOo9vMqaGMEBW	والد	الطالب محمد المصلحي	parent	\N	99098811	\N	\N	t	\N	1	2025-11-01 13:05:20.704345	2025-11-01 13:05:20.704345	f	f	parent
375cd22f-3159-405d-8a4f-c3d496602a5d	teacher_أريام	أريام@zinat.local	$2b$10$esfM2JwKQPrLWafRDJe5FeucUM82Sz7SyFlZxqhJrsClTA/gyMqve	أريام	معلمة	teacher	\N	\N	\N	\N	t	\N	1	2025-11-01 13:05:20.78087	2025-11-01 13:05:20.78087	f	f	staff
abd5c148-d97c-4244-acdf-95e7cf92ed99	parent_96447447	parent_96447447@zinat.local	$2b$10$ZMybKQem0xi3mujzQdoJI.TiKX7Nuo3x7tkX2tZ0Uejfq8H/6Zj0S	والد	الطالب سعد السيابي	parent	\N	96447447	\N	\N	t	\N	1	2025-11-01 13:05:21.074232	2025-11-01 13:05:21.074232	f	f	parent
d32b1825-75d6-444f-84ea-f855f1686006	parent_92343800	parent_92343800@zinat.local	$2b$10$aWzshpd3lt3NtW9kWTp.VOB/PltueXS57BDy57NTcHMuwVWcA3aaO	والدة	الطالب سندس البوسعيدي	parent	\N	92343800	\N	\N	t	\N	1	2025-11-01 13:05:21.149967	2025-11-01 13:05:21.149967	f	f	parent
67c95ba0-a344-456e-9fc4-afda775bf2b4	parent_0	parent_0@zinat.local	$2b$10$XLkT.UheMkB8TZs3/nOhae/J8aCTaBwzwZLrouva8NZUQeuR2HTne	والد	الطالب سندس البوسعيدي	parent	\N	0	\N	\N	t	\N	1	2025-11-01 13:05:21.220705	2025-11-01 13:05:21.220705	f	f	parent
5949e018-3869-4bd4-a2f4-3856e8065e95	parent_96033203	parent_96033203@zinat.local	$2b$10$N4fK7heySWl3NBHgxpjifOp6I9H2yz7j.5NcqQtSRZhHt.c0yg50a	والدة	الطالب حور الكعبية	parent	\N	96033203	\N	\N	t	\N	1	2025-11-01 13:05:21.296475	2025-11-01 13:05:21.296475	f	f	parent
560baa98-ab6a-4b02-977c-d43c311dc74f	parent_97726332	parent_97726332@zinat.local	$2b$10$9VWtm4r4DNFyO39vfb2i3u7v0Ecah6Wy7LpHvo91aopiK4RJ.Kik.	والد	الطالب حور الكعبية	parent	\N	97726332	\N	\N	t	\N	1	2025-11-01 13:05:21.367191	2025-11-01 13:05:21.367191	f	f	parent
f800de52-f824-4d47-adc1-af5f59850718	parent_91110090	parent_91110090@zinat.local	$2b$10$82H7SI6A2b4zPo7EbbenrONZV1TrgjjA/IjAXWiKc8301nBguCd3G	والد	الطالب إيلاف الإسماعيلية	parent	\N	91110090	\N	\N	t	2025-11-21 13:22:53.777	1	2025-11-01 13:05:25.602437	2025-11-21 13:22:53.780849	f	f	parent
b4d86f70-82cd-4053-92f4-16efd5f1e6a7	parent_96120070	parent_96120070@zinat.local	$2b$10$lfTuE92N2RFbM5OaxEb0xOB/LDS/XP4UqsROa4EWtrWayqhWlXHUy	والدة	الطالب سعيد الرحبي	parent	\N	96120070	\N	\N	t	\N	1	2025-11-01 13:05:21.441868	2025-11-01 13:05:21.441868	f	f	parent
7ace12da-6a3f-44eb-a654-cca95bd15fec	parent_94440912	ssam92gen@gmail.com	$2b$10$f9iKQhy2Ksnc6/K6rIoOTeC0h3EZKq7ne2LxnycdyNvfM4zIj3Rse	والدة	الطالب الفراهيد المسكري	parent	\N	94440912	\N	\N	t	\N	1	2025-11-01 13:05:20.855191	2025-11-01 13:05:20.855191	f	f	parent
3f8df0e2-0f57-452f-9cde-60d97127b9e5	parent_97040030	ssam0072@hotmail.com	$2b$10$taF7f7heniyPaZpC6wK8.O9ny5x9y9AYLOtTyPhqWWSFFNdGscqJO	والد	الطالب الفراهيد المسكري	parent	\N	97040030	\N	\N	t	\N	1	2025-11-01 13:05:20.925722	2025-11-01 13:05:20.925722	f	f	parent
1af68d72-ffff-4b22-9787-020bf14a8a22	parent_92788803	parent_92788803@zinat.local	$2b$10$AM0qBWfFdp0rLpZPFs/ClO8Aa6btTtQXI3cndifKlDGaav/sVjgmO	والد	الطالب أمين الإسماعيلي	parent	\N	92788803	\N	\N	t	\N	1	2025-11-01 13:05:21.658006	2025-11-01 13:05:21.658006	f	f	parent
3a28697b-13db-4fcf-b7af-d1a92a74f215	parent_97609904	parent_97609904@zinat.local	$2b$10$HfvekQ/mqzFXAoYkUjPqr.O1GI8h26cPppo/kaJSjyItHpf4F2Ql.	والدة	الطالب سديم الرحبية	parent	\N	97609904	\N	\N	t	\N	1	2025-11-01 13:05:21.734285	2025-11-01 13:05:21.734285	f	f	parent
4d9da7c4-6b9a-45f2-82c6-8496ead3892f	parent_96754623	parent_96754623@zinat.local	$2b$10$t0kdMdWPf2KYAHOz4n1c.OkdyqJh0pt9jiej1vqJ3gvS9n8JSSCZC	والد	الطالب سديم الرحبية	parent	\N	96754623	\N	\N	t	\N	1	2025-11-01 13:05:21.805117	2025-11-01 13:05:21.805117	f	f	parent
eeca9c82-7fcc-43d4-83f8-5503573ebebd	parent_97466312	parent_97466312@zinat.local	$2b$10$w6AlSnGotQyQ2CQvRXyX.eHLZE.fRfJax96rzKcxFg043A58u7AdC	والدة	الطالب آدم اليزيدي	parent	\N	97466312	\N	\N	t	\N	1	2025-11-01 13:05:21.881058	2025-11-01 13:05:21.881058	f	f	parent
114998a2-d21a-445e-bd4d-05493e3a4590	parent_97966312	parent_97966312@zinat.local	$2b$10$pCinhN9M5oiXDTmw8S.42uz0HNAY7irZdGBdDhowF5DpI11ao3Dti	والد	الطالب آدم اليزيدي	parent	\N	97966312	\N	\N	t	\N	1	2025-11-01 13:05:21.951468	2025-11-01 13:05:21.951468	f	f	parent
0edffcf3-0623-4e71-9702-5e728f566d7f	parent_98883020	parent_98883020@zinat.local	$2b$10$TAn.MljoRfQrOT1RK6T.SuvMm/IeHOq26tYXluyUqetOd9ZO0qCMO	والدة	الطالب فاطمة المسكرية	parent	\N	98883020	\N	\N	t	\N	1	2025-11-01 13:05:22.026573	2025-11-01 13:05:22.026573	f	f	parent
679e94d1-0e8d-4842-beec-ab0329ea0e99	parent_99459947	parent_99459947@zinat.local	$2b$10$5qoS76ypxFmaeNx.D3CRde3AjR.OJWRSbqlFlm0vixbg0lQQgh6Fy	والد	الطالب فاطمة المسكرية	parent	\N	99459947	\N	\N	t	\N	1	2025-11-01 13:05:22.09613	2025-11-01 13:05:22.09613	f	f	parent
0ad9739d-fd32-415b-8acc-2c156d88a1d8	parent_92230881	parent_92230881@zinat.local	$2b$10$PqbE/qT.yOWdqACMzCemuON6c/Mg34Tfp2DmovWRffn.JMcdbhJGm	والدة	الطالب فَلَكْ السعدية	parent	\N	92230881	\N	\N	t	\N	1	2025-11-01 13:05:22.170503	2025-11-01 13:05:22.170503	f	f	parent
5b10a206-fcdd-445c-b916-95ab72d1549b	parent_95395062	parent_95395062@zinat.local	$2b$10$ushQkbuBlBV6C4iPgIHBg.DFRicbRadj9KNzQL160vZ7IC/UdW4WK	والد	الطالب فَلَكْ السعدية	parent	\N	95395062	\N	\N	t	\N	1	2025-11-01 13:05:22.241204	2025-11-01 13:05:22.241204	f	f	parent
2d03e2c4-b0eb-4193-a161-6c88f0521d14	parent_99368119	parent_99368119@zinat.local	$2b$10$8E/PsmSiG/YhrQ1djGwdSuDr4rG8E.BoQE7kmJiJ8XWzOKgTy9Cdi	والدة	الطالب صالح المسكري	parent	\N	99368119	\N	\N	t	\N	1	2025-11-01 13:05:22.315194	2025-11-01 13:05:22.315194	f	f	parent
850eef0b-ff54-47e4-90d5-14a867833327	parent_99006071	parent_99006071@zinat.local	$2b$10$Zumgzl.nF8JX8qDHlmoJIunH689Lb8VYlem04JFiva2uZ2i.jOeb6	والد	الطالب صالح المسكري	parent	\N	99006071	\N	\N	t	\N	1	2025-11-01 13:05:22.386195	2025-11-01 13:05:22.386195	f	f	parent
1dba2988-dc5c-49e2-b610-5e71a7b801da	parent_92196942	parent_92196942@zinat.local	$2b$10$iT16ff1Jccc0vZjFxpKBjOVyJPI6TIYGXNehe4UmcqtGE9izQQA5m	والدة	الطالب أحمد الغنيمي	parent	\N	92196942	\N	\N	t	\N	1	2025-11-01 13:05:22.461154	2025-11-01 13:05:22.461154	f	f	parent
fc7beb60-80cb-4b79-b5fa-2d3d12a65b8e	parent_97666325	parent_97666325@zinat.local	$2b$10$WNPgget.FoYCPFNUgs38n.uDDD.sjw.5BWyoEn53ukUgGa0ofw8RO	والد	الطالب أحمد الغنيمي	parent	\N	97666325	\N	\N	t	\N	1	2025-11-01 13:05:22.531655	2025-11-01 13:05:22.531655	f	f	parent
0ecc2e97-e108-43ff-bc55-c742c3e1f8d4	parent_93913164	parent_93913164@zinat.local	$2b$10$UyUc/eJx10v.TwEJ6NPoxeh2GVaIYm102vWdOnEaf8w1C2vX3yntW	والدة	الطالب سالم الحارثي	parent	\N	93913164	\N	\N	t	\N	1	2025-11-01 13:05:22.605685	2025-11-01 13:05:22.605685	f	f	parent
f40df012-0e7b-49d9-85bb-a49365c1984c	parent_92876168	parent_92876168@zinat.local	$2b$10$xvmRk3EpkbgxY6foVahYeuaVUYUMmDPU1Qa.iBiWaOeQyqiBsuMga	والد	الطالب سالم الحارثي	parent	\N	92876168	\N	\N	t	\N	1	2025-11-01 13:05:22.676588	2025-11-01 13:05:22.676588	f	f	parent
4e889507-748c-42a5-b7ab-bfb8d464b1da	parent_95980543	parent_95980543@zinat.local	$2b$10$v6rHCXiYx.IlDbOMceE7xuvYHylmBZQcFDk1HyTU7lKDfxM3/KNOK	والدة	الطالب قيس الرواحي	parent	\N	95980543	\N	\N	t	\N	1	2025-11-01 13:05:22.750407	2025-11-01 13:05:22.750407	f	f	parent
33041e4b-f11a-4334-b4cd-0530433ae3ce	parent_95572958	parent_95572958@zinat.local	$2b$10$tGwjUdfY8buxhUw.QJccEuDZ8fDppA6SujT1ZtKWAjqPXa.ytx4g2	والد	الطالب قيس الرواحي	parent	\N	95572958	\N	\N	t	\N	1	2025-11-01 13:05:22.820396	2025-11-01 13:05:22.820396	f	f	parent
3fddc882-3807-4549-b6e3-82624ae80c58	parent_93834262	parent_93834262@zinat.local	$2b$10$nK7T3jhh6LHc.u4jqMVnyO5o.ULOchY/O4cSThp5Kzysnl1emqGzm	والدة	الطالب غزل المعمرية	parent	\N	93834262	\N	\N	t	\N	1	2025-11-01 13:05:22.894388	2025-11-01 13:05:22.894388	f	f	parent
2ca13efe-bcfc-4f76-b25d-ebd544a5c652	parent_93377754	parent_93377754@zinat.local	$2b$10$.NfbEchIlRXVuMN58C0NPe6j0l10Lmy4oJ/FtXJ9GRtiCjJxdJXIK	والدة	الطالب أثير الحارثية	parent	\N	93377754	\N	\N	t	\N	1	2025-11-01 13:05:23.038268	2025-11-01 13:05:23.038268	f	f	parent
61d74fbe-fa29-4c37-bf8b-fc3908f6f2a4	parent_78423209	parent_78423209@zinat.local	$2b$10$Vg62udEYLGDy0dsXub3wRuyo3zYDiOfGJDS8N0eH.QhmZKZcpMc/S	والد	الطالب أثير الحارثية	parent	\N	78423209	\N	\N	t	\N	1	2025-11-01 13:05:23.108404	2025-11-01 13:05:23.108404	f	f	parent
62184b85-92d0-4605-b538-fbbba60f4686	parent_95590378	parent_95590378@zinat.local	$2b$10$maRW4hPOGmIp2E8eEeeGjewzZFuUdAl9gIkkxQ8SO9rEdDdZN.QSa	والدة	الطالب عمر سعيدالسعدي	parent	\N	95590378	\N	\N	t	\N	1	2025-11-01 13:05:23.183072	2025-11-01 13:05:23.183072	f	f	parent
82357b55-c762-4d51-800d-20ac2eb6f137	parent_95874762	parent_95874762@zinat.local	$2b$10$qkft8VtgFrwSwr2rf/SpweH98Ne0Fa4oaMKFMuUaIBxzn1GNOU1lK	والدة	الطالب غياث الرحبي	parent	\N	95874762	\N	\N	t	\N	1	2025-11-01 13:05:23.258195	2025-11-01 13:05:23.258195	f	f	parent
a18db352-b86b-4daf-b0b9-65d7c71a7684	parent_99247020	parent_99247020@zinat.local	$2b$10$xp1.gPfzBMXNh4H7CNCJ.uq9G05duX9P7PpPg7q4R8GKdjJtRJmS.	والدة	الطالب ناصر المغيري	parent	\N	99247020	\N	\N	t	\N	1	2025-11-01 13:05:23.332803	2025-11-01 13:05:23.332803	f	f	parent
a084f27d-50cb-4be5-bdb9-32b39ad36725	parent_96643889	parent_96643889@zinat.local	$2b$10$4.g6ARMJ8.WWXnOJDldI4.A3xEyoTCUOJuSkNw/t6Sbsi8VD0fHpm	والدة	الطالب أحمد الحارثي	parent	\N	96643889	\N	\N	t	\N	1	2025-11-01 13:05:23.406664	2025-11-01 13:05:23.406664	f	f	parent
a5443406-8818-405e-8ff2-3e7692560d93	parent_99448812	parent_99448812@zinat.local	$2b$10$ufd/2SIfJo8WFyXD5R8QJeHI4JzV6LNKoug8pOgPXnz1RGceYOBO.	والد	الطالب أحمد الحارثي	parent	\N	99448812	\N	\N	t	\N	1	2025-11-01 13:05:23.477368	2025-11-01 13:05:23.477368	f	f	parent
80b3437c-5776-47c8-bf15-dfc61406704f	teacher_هاجر	هاجر@zinat.local	$2b$10$GHMtEAT2gEabv3dpgvFGOOSihmWA.JJ.aWyzixSXogzd9MHV0W2O.	هاجر	معلمة	teacher	\N	\N	\N	\N	t	\N	1	2025-11-01 13:05:23.550162	2025-11-01 13:05:23.550162	f	f	staff
2c6a8996-3fc3-4b82-a28a-e0d09eb7e7e6	parent_96649677	parent_96649677@zinat.local	$2b$10$mJpblkyUmKnTo4o/q.q0culfSqEdcO7Pu5vBZxGm9jOxKhZXWLgNG	والدة	الطالب سعيد المسكري	parent	\N	96649677	\N	\N	t	\N	1	2025-11-01 13:05:23.623107	2025-11-01 13:05:23.623107	f	f	parent
06eae867-7451-4928-b39c-efaf1d89cb97	parent_98881883	parent_98881883@zinat.local	$2b$10$kheMZYZ7w66vqVQRGjejkOXnWyHuVOa9oKhaDqFWkzKuUTumUJtXW	والدة	الطالب أواب المغيري	parent	\N	98881883	\N	\N	t	\N	1	2025-11-01 13:05:23.702837	2025-11-01 13:05:23.702837	f	f	parent
5a29b8bd-5abd-457f-a88a-ea17da54bb5a	parent_92546618	parent_92546618@zinat.local	$2b$10$SZ1ZMm3guBk.UF52B0QI8uFJlVc6.y/BR.dNxQf9qumUOaHsxpBmm	والد	الطالب أواب المغيري	parent	\N	92546618	\N	\N	t	\N	1	2025-11-01 13:05:23.773256	2025-11-01 13:05:23.773256	f	f	parent
b3d25e2e-166b-4e16-963f-c7eb5dbd1a25	parent_91916066	parent_91916066@zinat.local	$2b$10$WSHnKxqP0qqukEfExbfaAOVCrVnfEdEIZtgCJHlsmOxwAd5NRlqgC	والدة	الطالب أحمد البوسعيدي	parent	\N	91916066	\N	\N	t	\N	1	2025-11-01 13:05:23.857298	2025-11-01 13:05:23.857298	f	f	parent
a0e1619d-9000-42ab-aaad-2fd52513ad5c	parent_92527773	ssam007@hotmail.com	$2b$10$i2kgcx7XOECd7uSUdD5Qmuxi2OrXfTMNIZLFAZ5qNQbOF2nVtq15K	والد	الطالب غزل المعمرية	parent	\N	92527773	\N	\N	t	\N	1	2025-11-01 13:05:22.964257	2025-11-01 13:05:22.964257	f	f	parent
f15cb2a9-6ca4-4a40-a5a3-515986a9b573	parent_92098917	parent_92098917@zinat.local	$2b$10$Llsn//FPbCTg8l7UEHNZMOXMzPNdHOJi5oO8kmT7lq8tMAJgniGfK	والدة	الطالب تميم المعمري	parent	\N	92098917	\N	\N	t	\N	1	2025-11-01 13:05:24.66191	2025-11-01 13:05:24.66191	f	f	parent
52908c20-159f-4544-a5c6-476dcdcc3da2	parent_94000862	parent_94000862@zinat.local	$2b$10$8eX9PhOOfH9ehT.bPPPT5.XgEnoT5LA8UTfMgVxecxqyIwDGmkUjq	والد	الطالب تميم المعمري	parent	\N	94000862	\N	\N	t	\N	1	2025-11-01 13:05:24.732235	2025-11-01 13:05:24.732235	f	f	parent
649857de-a8a7-4d0a-8d2a-dd4f604c1178	parent_99797173	parent_99797173@zinat.local	$2b$10$heHEK9/F1R5BUwPUi.LuK.jsEkwN4y8WPKI1X6fbmh9G5J9f6Tpn.	والدة	الطالب جنى الحارثية	parent	\N	99797173	\N	\N	t	\N	1	2025-11-01 13:05:24.806485	2025-11-01 13:05:24.806485	f	f	parent
89327c1d-ad23-4064-89f6-1529bcec86c5	parent_95167988	parent_95167988@zinat.local	$2b$10$cZAhIB7JyX3AYAN1q/tAI.mdwIo2fbM.umBEPJcnCfc5G5c76IpCW	والد	الطالب جنى الحارثية	parent	\N	95167988	\N	\N	t	\N	1	2025-11-01 13:05:24.877061	2025-11-01 13:05:24.877061	f	f	parent
3c942acf-3b20-4274-b93e-2d6981184843	parent_99374116	parent_99374116@zinat.local	$2b$10$H63ptZfYhYBUqQ2m40JmN.OnjfHVO4r3d/R/.7sQMgkPF7Y43kJ7K	والدة	الطالب حمود الحارثي	parent	\N	99374116	\N	\N	t	\N	1	2025-11-01 13:05:24.951389	2025-11-01 13:05:24.951389	f	f	parent
ae5c9f8d-7079-40e6-a84f-b24c2512195b	parent_93238000	parent_93238000@zinat.local	$2b$10$HzxVUfJXVFNitXfvCbWfz.XKaYNG4Fxxm4BvQQuW/MuDrprjBahwi	والد	الطالب حمود الحارثي	parent	\N	93238000	\N	\N	t	\N	1	2025-11-01 13:05:25.022553	2025-11-01 13:05:25.022553	f	f	parent
fd5795fa-6777-4c76-b7a9-610efa0185cc	parent_91144364	parent_91144364@zinat.local	$2b$10$4HoW7WvFP6fxwnGhER4JUe9SLmWOkx68VjM6Q18O/adVxX3f35yue	والدة	الطالب عهد السعدي	parent	\N	91144364	\N	\N	t	\N	1	2025-11-01 13:05:25.097023	2025-11-01 13:05:25.097023	f	f	parent
4a26a14d-2415-41ff-97fa-fca1a858a5a2	parent_96026650	parent_96026650@zinat.local	$2b$10$DifaSy0a4drKwA0mp9KPZuAY8dhJ86uqTuWXXlJ.9bVr6TnlUAyt6	والد	الطالب عهد السعدي	parent	\N	96026650	\N	\N	t	\N	1	2025-11-01 13:05:25.166798	2025-11-01 13:05:25.166798	f	f	parent
4ca4a4ed-30d7-4ed1-b9e8-4c080082ef2a	parent_97763603	parent_97763603@zinat.local	$2b$10$e3.LkrLmjeJ37Oc0tAxdbekQcIXrlz5lRfDVihSFGpWI4pKu9u1r.	والدة	الطالب عفان السيابي	parent	\N	97763603	\N	\N	t	\N	1	2025-11-01 13:05:25.241008	2025-11-01 13:05:25.241008	f	f	parent
9b6410bd-9cea-4b0d-a95b-3174233a9ea0	parent_96117377	parent_96117377@zinat.local	$2b$10$ztVwss2zg5FSN/eFYQbzN.40Iib29rd/Z.S10S5H0ULpO.xDJmewK	والد	الطالب عفان السيابي	parent	\N	96117377	\N	\N	t	\N	1	2025-11-01 13:05:25.311126	2025-11-01 13:05:25.311126	f	f	parent
c088677c-7f6b-4123-82f4-f9ceaf0f6fcb	parent_98999149	parent_98999149@zinat.local	$2b$10$aMThrFbwezMZmNKiioy8CuBTVv8vZbSmtdrA7R/0GTmZFV3iLysn6	والدة	الطالب شيم المسكري	parent	\N	98999149	\N	\N	t	\N	1	2025-11-01 13:05:25.385577	2025-11-01 13:05:25.385577	f	f	parent
f5ccd2fe-8571-4670-b418-64a0e36d976c	parent_93877877	parent_93877877@zinat.local	$2b$10$WVleBubI4L71EONFLgfffORAI18Braz0eIYlG0C1GRab.QL5FW5y.	والد	الطالب شيم المسكري	parent	\N	93877877	\N	\N	t	\N	1	2025-11-01 13:05:25.455715	2025-11-01 13:05:25.455715	f	f	parent
4bb98e15-1b98-42b8-bca4-bcd845dcb680	parent_97939293	parent_97939293@zinat.local	$2b$10$1SUOqpD.VqvD2rhbpBRGTO5a3gzAM4CGNxtCpOOdgZsRkyAf6B6Ha	والدة	الطالب إيلاف الإسماعيلية	parent	\N	97939293	\N	\N	t	\N	1	2025-11-01 13:05:25.530895	2025-11-01 13:05:25.530895	f	f	parent
857e6bf6-96ad-4b62-a176-8222ef36cfb9	\N	parent.test@zinat.local	$2b$10$8d37J9hbd2JiAg511RVxaeckvjU9x.udFE5n.Aq4.wI4zdov9GQcy	أحمد	المحمدي	parent	\N	+968 9123 4567	\N	\N	t	2026-09-02 18:57:44.61	1	2025-11-21 11:15:33.084993	2026-09-02 18:57:44.612607	f	f	parent
\.


--
-- Data for Name: weekly_session_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.weekly_session_plans (id, schedule_id, week_start_date, week_end_date, task_title, task_description, is_completed, completion_date, completion_notes, created_by, created_at, updated_at, session_status, completion_description, completed_by, completed_at) FROM stdin;
724fa675-4d2d-4321-9912-ac1f3e711d2a	f56d5330-ba08-4afa-a5af-b8d28cfc14d4	2026-04-19	2026-04-25	لالباب	قفاقفا	f	\N	\N	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	2026-04-19 23:08:08.221112	2026-04-19 23:08:08.221112	pending	\N	\N	\N
9fe26d44-671f-4a95-84db-9332c44bc205	f56d5330-ba08-4afa-a5af-b8d28cfc14d4	2026-04-19	2026-04-25	قفاقفا	قفاقفا	f	\N	\N	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	2026-04-19 23:08:08.260532	2026-04-19 23:08:08.260532	pending	\N	\N	\N
8ab60d67-56b8-4867-ae0b-0ab43f2dd1fd	7b62d443-27d3-4277-a270-199fcd68948a	2026-04-26	2026-05-02	regwerhtrh	wrthwrth	f	\N	\N	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	2026-05-01 14:25:57.129109	2026-05-01 14:25:57.129109	pending	\N	\N	\N
6ee7f12a-3333-44e5-9486-baa81a1fbd6b	7b62d443-27d3-4277-a270-199fcd68948a	2026-04-26	2026-05-02	wrthwrth	wrthwrth	f	\N	\N	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	2026-05-01 14:25:57.150675	2026-05-01 14:25:57.150675	pending	\N	\N	\N
5de9c1ca-b210-4c86-b9ed-c62b5a24ae60	736c1e5e-3659-40b0-82a0-70dd41814af7	2026-05-10	2026-05-16	shsth	rwthwrth	f	\N	\N	d2260ae9-931a-4e45-9fcd-e13a6930e7c1	2026-05-10 22:27:48.673655	2026-05-10 22:27:48.673655	pending	\N	\N	\N
\.


--
-- Name: activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activities_id_seq', 1, false);


--
-- Name: attendances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.attendances_id_seq', 43, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 61, true);


--
-- Name: parents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.parents_id_seq', 247, true);


--
-- Name: platform_addons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.platform_addons_id_seq', 3, true);


--
-- Name: platform_invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.platform_invoices_id_seq', 1, false);


--
-- Name: platform_modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.platform_modules_id_seq', 21, true);


--
-- Name: platform_plan_features_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.platform_plan_features_id_seq', 23, true);


--
-- Name: platform_plan_modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.platform_plan_modules_id_seq', 55, true);


--
-- Name: platform_plan_prices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.platform_plan_prices_id_seq', 36, true);


--
-- Name: platform_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.platform_plans_id_seq', 3, true);


--
-- Name: rbac_actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rbac_actions_id_seq', 8, true);


--
-- Name: rbac_pages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rbac_pages_id_seq', 50, true);


--
-- Name: reminders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reminders_id_seq', 1, false);


--
-- Name: rooms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rooms_id_seq', 6, true);


--
-- Name: school_landing_pages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.school_landing_pages_id_seq', 1, true);


--
-- Name: school_modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.school_modules_id_seq', 1, false);


--
-- Name: school_platform_subscription_addons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.school_platform_subscription_addons_id_seq', 1, false);


--
-- Name: school_platform_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.school_platform_subscriptions_id_seq', 1, false);


--
-- Name: schools_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.schools_id_seq', 1, true);


--
-- Name: session_media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.session_media_id_seq', 15, true);


--
-- Name: staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.staff_id_seq', 1, true);


--
-- Name: student_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_progress_id_seq', 9, true);


--
-- Name: rooms PK_0368a2d7c215f2d0458a54933f2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY (id);


--
-- Name: milestones PK_0bdbfe399c777a6a8520ff902d9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT "PK_0bdbfe399c777a6a8520ff902d9" PRIMARY KEY (id);


--
-- Name: academic_years PK_2021b90bfbfa6c9da7df34ca1cf; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.academic_years
    ADD CONSTRAINT "PK_2021b90bfbfa6c9da7df34ca1cf" PRIMARY KEY (id);


--
-- Name: semesters PK_25c393e2e76b3e32e87a79b1dc2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT "PK_25c393e2e76b3e32e87a79b1dc2" PRIMARY KEY (id);


--
-- Name: reminders PK_38715fec7f634b72c6cf7ea4893; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT "PK_38715fec7f634b72c6cf7ea4893" PRIMARY KEY (id);


--
-- Name: courses PK_3f70a487cc718ad8eda4e6d58c9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY (id);


--
-- Name: attendances PK_483ed97cd4cd43ab4a117516b69; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "PK_483ed97cd4cd43ab4a117516b69" PRIMARY KEY (id);


--
-- Name: groups PK_659d1483316afb28afd3a90646e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY (id);


--
-- Name: students PK_7d7f07271ad4ce999880713f05e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY (id);


--
-- Name: schedules PK_7e33fc2ea755a5765e3564e66dd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT "PK_7e33fc2ea755a5765e3564e66dd" PRIMARY KEY (id);


--
-- Name: activities_legacy_pre_align_1777620000000 PK_7f4004429f731ffb9c88eb486a8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities_legacy_pre_align_1777620000000
    ADD CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: schools PK_95b932e47ac129dd8e23a0db548; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT "PK_95b932e47ac129dd8e23a0db548" PRIMARY KEY (id);


--
-- Name: parents PK_9a4dc67c7b8e6a9cb918938d353; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parents
    ADD CONSTRAINT "PK_9a4dc67c7b8e6a9cb918938d353" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: student_parents PK_ad07904dc74a079fb1d7d82825c; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_parents
    ADD CONSTRAINT "PK_ad07904dc74a079fb1d7d82825c" PRIMARY KEY (student_id, parent_id);


--
-- Name: class_settings PK_b0297a43420f60073c0eab523a3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_settings
    ADD CONSTRAINT "PK_b0297a43420f60073c0eab523a3" PRIMARY KEY (id);


--
-- Name: bus_fee_link_lines PK_bus_fee_link_lines; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus_fee_link_lines
    ADD CONSTRAINT "PK_bus_fee_link_lines" PRIMARY KEY (id);


--
-- Name: bus_fee_links PK_bus_fee_links; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus_fee_links
    ADD CONSTRAINT "PK_bus_fee_links" PRIMARY KEY (id);


--
-- Name: bus_movement_logs PK_bus_movement_logs; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus_movement_logs
    ADD CONSTRAINT "PK_bus_movement_logs" PRIMARY KEY (id);


--
-- Name: buses PK_buses; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buses
    ADD CONSTRAINT "PK_buses" PRIMARY KEY (id);


--
-- Name: course_fee_link_lines PK_course_fee_link_lines; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_fee_link_lines
    ADD CONSTRAINT "PK_course_fee_link_lines" PRIMARY KEY (id);


--
-- Name: course_fee_links PK_course_fee_links; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_fee_links
    ADD CONSTRAINT "PK_course_fee_links" PRIMARY KEY (id);


--
-- Name: course_payment_charge_lines PK_course_payment_charge_lines; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_payment_charge_lines
    ADD CONSTRAINT "PK_course_payment_charge_lines" PRIMARY KEY (id);


--
-- Name: course_payment_profiles PK_course_payment_profiles; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_payment_profiles
    ADD CONSTRAINT "PK_course_payment_profiles" PRIMARY KEY (id);


--
-- Name: activities PK_d8d8d8d8d8d8d8d8d8d8d8d8d8d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "PK_d8d8d8d8d8d8d8d8d8d8d8d8d8d" PRIMARY KEY (id);


--
-- Name: direct_chat_messages PK_direct_chat_messages; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.direct_chat_messages
    ADD CONSTRAINT "PK_direct_chat_messages" PRIMARY KEY (id);


--
-- Name: direct_chat_threads PK_direct_chat_threads; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.direct_chat_threads
    ADD CONSTRAINT "PK_direct_chat_threads" PRIMARY KEY (id);


--
-- Name: staff PK_e4ee98bb552756c180aec1e854a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "PK_e4ee98bb552756c180aec1e854a" PRIMARY KEY (id);


--
-- Name: student_progress PK_e7df7ebbbab37cc250594423a38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_progress
    ADD CONSTRAINT "PK_e7df7ebbbab37cc250594423a38" PRIMARY KEY (id);


--
-- Name: phases PK_e93bb53460b28d4daf72735d5d3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phases
    ADD CONSTRAINT "PK_e93bb53460b28d4daf72735d5d3" PRIMARY KEY (id);


--
-- Name: student_groups PK_ed5bb94d166be2eb02a40701460; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_groups
    ADD CONSTRAINT "PK_ed5bb94d166be2eb02a40701460" PRIMARY KEY (student_id, group_id);


--
-- Name: fee_package_charge_types PK_fee_package_charge_types; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_charge_types
    ADD CONSTRAINT "PK_fee_package_charge_types" PRIMARY KEY (id);


--
-- Name: fee_package_course_amounts PK_fee_package_course_amounts; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_course_amounts
    ADD CONSTRAINT "PK_fee_package_course_amounts" PRIMARY KEY (id);


--
-- Name: fee_package_discount_types PK_fee_package_discount_types; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_discount_types
    ADD CONSTRAINT "PK_fee_package_discount_types" PRIMARY KEY (id);


--
-- Name: fee_package_installments PK_fee_package_installments; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_installments
    ADD CONSTRAINT "PK_fee_package_installments" PRIMARY KEY (id);


--
-- Name: fee_package_level_amounts PK_fee_package_level_amounts; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_level_amounts
    ADD CONSTRAINT "PK_fee_package_level_amounts" PRIMARY KEY (id);


--
-- Name: fee_package_level_period_settings PK_fee_package_level_period_settings; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_level_period_settings
    ADD CONSTRAINT "PK_fee_package_level_period_settings" PRIMARY KEY (id);


--
-- Name: fee_packages PK_fee_packages; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_packages
    ADD CONSTRAINT "PK_fee_packages" PRIMARY KEY (id);


--
-- Name: grade_fee_link_lines PK_grade_fee_link_lines; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_fee_link_lines
    ADD CONSTRAINT "PK_grade_fee_link_lines" PRIMARY KEY (id);


--
-- Name: grade_fee_links PK_grade_fee_links; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_fee_links
    ADD CONSTRAINT "PK_grade_fee_links" PRIMARY KEY (id);


--
-- Name: graded_assessment_schemes PK_graded_assessment_schemes; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graded_assessment_schemes
    ADD CONSTRAINT "PK_graded_assessment_schemes" PRIMARY KEY (id);


--
-- Name: graded_criteria PK_graded_criteria; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graded_criteria
    ADD CONSTRAINT "PK_graded_criteria" PRIMARY KEY (id);


--
-- Name: graded_criterion_task_student_marks PK_graded_criterion_task_student_marks; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graded_criterion_task_student_marks
    ADD CONSTRAINT "PK_graded_criterion_task_student_marks" PRIMARY KEY (id);


--
-- Name: graded_criterion_teacher_tasks PK_graded_criterion_teacher_tasks; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graded_criterion_teacher_tasks
    ADD CONSTRAINT "PK_graded_criterion_teacher_tasks" PRIMARY KEY (id);


--
-- Name: graded_semester_configs PK_graded_semester_configs; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graded_semester_configs
    ADD CONSTRAINT "PK_graded_semester_configs" PRIMARY KEY (id);


--
-- Name: grades PK_grades; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT "PK_grades" PRIMARY KEY (id);


--
-- Name: group_chat_messages PK_group_chat_messages; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_chat_messages
    ADD CONSTRAINT "PK_group_chat_messages" PRIMARY KEY (id);


--
-- Name: installment_plan_entries PK_installment_plan_entries; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_plan_entries
    ADD CONSTRAINT "PK_installment_plan_entries" PRIMARY KEY (id);


--
-- Name: installment_plans PK_installment_plans; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_plans
    ADD CONSTRAINT "PK_installment_plans" PRIMARY KEY (id);


--
-- Name: level_payment_charge_lines PK_level_payment_charge_lines; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_payment_charge_lines
    ADD CONSTRAINT "PK_level_payment_charge_lines" PRIMARY KEY (id);


--
-- Name: level_payment_installments PK_level_payment_installments; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_payment_installments
    ADD CONSTRAINT "PK_level_payment_installments" PRIMARY KEY (id);


--
-- Name: level_payment_profile_discounts PK_level_payment_profile_discounts; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_payment_profile_discounts
    ADD CONSTRAINT "PK_level_payment_profile_discounts" PRIMARY KEY (profile_id, discount_type_id);


--
-- Name: level_payment_profiles PK_level_payment_profiles; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_payment_profiles
    ADD CONSTRAINT "PK_level_payment_profiles" PRIMARY KEY (id);


--
-- Name: meeting_room_invitees PK_meeting_room_invitees; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_room_invitees
    ADD CONSTRAINT "PK_meeting_room_invitees" PRIMARY KEY (id);


--
-- Name: meeting_rooms PK_meeting_rooms; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_rooms
    ADD CONSTRAINT "PK_meeting_rooms" PRIMARY KEY (id);


--
-- Name: notification_template_definitions PK_notification_template_definitions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_template_definitions
    ADD CONSTRAINT "PK_notification_template_definitions" PRIMARY KEY (id);


--
-- Name: online_session_presence PK_online_session_presence; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_session_presence
    ADD CONSTRAINT "PK_online_session_presence" PRIMARY KEY (id);


--
-- Name: online_session_student_attendance PK_online_session_student_attendance; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_session_student_attendance
    ADD CONSTRAINT "PK_online_session_student_attendance" PRIMARY KEY (id);


--
-- Name: online_video_sessions PK_online_video_sessions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_video_sessions
    ADD CONSTRAINT "PK_online_video_sessions" PRIMARY KEY (id);


--
-- Name: payment_charge_types PK_payment_charge_types; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_charge_types
    ADD CONSTRAINT "PK_payment_charge_types" PRIMARY KEY (id);


--
-- Name: payment_discount_types PK_payment_discount_types; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_discount_types
    ADD CONSTRAINT "PK_payment_discount_types" PRIMARY KEY (id);


--
-- Name: payment_transaction_allocations PK_payment_transaction_allocations; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transaction_allocations
    ADD CONSTRAINT "PK_payment_transaction_allocations" PRIMARY KEY (id);


--
-- Name: payment_transactions PK_payment_transactions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT "PK_payment_transactions" PRIMARY KEY (id);


--
-- Name: school_message_letters PK_school_message_letters; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_message_letters
    ADD CONSTRAINT "PK_school_message_letters" PRIMARY KEY (id);


--
-- Name: school_notification_templates PK_school_notification_templates; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_notification_templates
    ADD CONSTRAINT "PK_school_notification_templates" PRIMARY KEY (id);


--
-- Name: school_payment_levels PK_school_payment_levels; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_payment_levels
    ADD CONSTRAINT "PK_school_payment_levels" PRIMARY KEY (id);


--
-- Name: school_system_settings PK_school_system_settings; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_system_settings
    ADD CONSTRAINT "PK_school_system_settings" PRIMARY KEY (id);


--
-- Name: student_buses PK_student_buses; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_buses
    ADD CONSTRAINT "PK_student_buses" PRIMARY KEY (student_id, bus_id);


--
-- Name: student_charge_sheet_discount_lines PK_student_charge_sheet_discount_lines; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_charge_sheet_discount_lines
    ADD CONSTRAINT "PK_student_charge_sheet_discount_lines" PRIMARY KEY (id);


--
-- Name: student_charge_sheet_installments PK_student_charge_sheet_installments; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_charge_sheet_installments
    ADD CONSTRAINT "PK_student_charge_sheet_installments" PRIMARY KEY (id);


--
-- Name: student_charge_sheet_lines PK_student_charge_sheet_lines; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_charge_sheet_lines
    ADD CONSTRAINT "PK_student_charge_sheet_lines" PRIMARY KEY (id);


--
-- Name: student_charge_sheets PK_student_charge_sheets; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_charge_sheets
    ADD CONSTRAINT "PK_student_charge_sheets" PRIMARY KEY (id);


--
-- Name: student_course_enrollments PK_student_course_enrollments; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_course_enrollments
    ADD CONSTRAINT "PK_student_course_enrollments" PRIMARY KEY (id);


--
-- Name: student_fee_charges PK_student_fee_charges; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_fee_charges
    ADD CONSTRAINT "PK_student_fee_charges" PRIMARY KEY (id);


--
-- Name: student_payment_discount_lines PK_student_payment_discount_lines; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_payment_discount_lines
    ADD CONSTRAINT "PK_student_payment_discount_lines" PRIMARY KEY (id);


--
-- Name: student_payment_installment_receipts PK_student_payment_installment_receipts; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_payment_installment_receipts
    ADD CONSTRAINT "PK_student_payment_installment_receipts" PRIMARY KEY (id);


--
-- Name: student_payments PK_student_payments; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_payments
    ADD CONSTRAINT "PK_student_payments" PRIMARY KEY (id);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: bus_fee_link_lines UQ_bus_fee_link_lines; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus_fee_link_lines
    ADD CONSTRAINT "UQ_bus_fee_link_lines" UNIQUE (link_id, charge_type_id);


--
-- Name: bus_fee_links UQ_bus_fee_links_bus; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus_fee_links
    ADD CONSTRAINT "UQ_bus_fee_links_bus" UNIQUE (school_id, bus_id);


--
-- Name: course_fee_link_lines UQ_course_fee_link_lines; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_fee_link_lines
    ADD CONSTRAINT "UQ_course_fee_link_lines" UNIQUE (link_id, charge_type_id);


--
-- Name: course_fee_links UQ_course_fee_links_course; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_fee_links
    ADD CONSTRAINT "UQ_course_fee_links_course" UNIQUE (school_id, course_id);


--
-- Name: course_payment_charge_lines UQ_course_payment_charge_lines_profile_type; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_payment_charge_lines
    ADD CONSTRAINT "UQ_course_payment_charge_lines_profile_type" UNIQUE (profile_id, charge_type_id);


--
-- Name: course_payment_profiles UQ_course_payment_profiles_school_course; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_payment_profiles
    ADD CONSTRAINT "UQ_course_payment_profiles_school_course" UNIQUE (school_id, course_id);


--
-- Name: direct_chat_threads UQ_direct_chat_threads_pair; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.direct_chat_threads
    ADD CONSTRAINT "UQ_direct_chat_threads_pair" UNIQUE (user_low_id, user_high_id);


--
-- Name: users UQ_fe0bb3f6520ee0469504521e710; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE (username);


--
-- Name: fee_package_charge_types UQ_fee_package_charge_types; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_charge_types
    ADD CONSTRAINT "UQ_fee_package_charge_types" UNIQUE (package_id, charge_type_id);


--
-- Name: fee_package_course_amounts UQ_fee_package_course_amounts; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_course_amounts
    ADD CONSTRAINT "UQ_fee_package_course_amounts" UNIQUE (package_id, course_id, charge_type_id);


--
-- Name: fee_package_discount_types UQ_fee_package_discount_types; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_discount_types
    ADD CONSTRAINT "UQ_fee_package_discount_types" UNIQUE (package_id, discount_type_id);


--
-- Name: fee_package_level_amounts UQ_fee_package_level_amounts; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_level_amounts
    ADD CONSTRAINT "UQ_fee_package_level_amounts" UNIQUE (package_id, level_id, charge_type_id, billing_period);


--
-- Name: fee_package_level_period_settings UQ_fee_package_level_period_settings; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_level_period_settings
    ADD CONSTRAINT "UQ_fee_package_level_period_settings" UNIQUE (package_id, level_id, billing_period);


--
-- Name: graded_criterion_task_student_marks UQ_gctsm_task_student; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graded_criterion_task_student_marks
    ADD CONSTRAINT "UQ_gctsm_task_student" UNIQUE (graded_criterion_teacher_task_id, student_id);


--
-- Name: grade_fee_link_lines UQ_grade_fee_link_lines; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_fee_link_lines
    ADD CONSTRAINT "UQ_grade_fee_link_lines" UNIQUE (link_id, charge_type_id);


--
-- Name: grade_fee_links UQ_grade_fee_links_level; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_fee_links
    ADD CONSTRAINT "UQ_grade_fee_links_level" UNIQUE (school_id, level_id);


--
-- Name: graded_assessment_schemes UQ_graded_assessment_schemes_course; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graded_assessment_schemes
    ADD CONSTRAINT "UQ_graded_assessment_schemes_course" UNIQUE (course_id);


--
-- Name: graded_semester_configs UQ_graded_semester_scheme_index; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graded_semester_configs
    ADD CONSTRAINT "UQ_graded_semester_scheme_index" UNIQUE (scheme_id, semester_index);


--
-- Name: grades UQ_grades_code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT "UQ_grades_code" UNIQUE (code);


--
-- Name: installment_plan_entries UQ_installment_plan_entries_seq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_plan_entries
    ADD CONSTRAINT "UQ_installment_plan_entries_seq" UNIQUE (plan_id, sequence);


--
-- Name: level_payment_charge_lines UQ_level_payment_charge_lines_profile_type_period; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_payment_charge_lines
    ADD CONSTRAINT "UQ_level_payment_charge_lines_profile_type_period" UNIQUE (profile_id, charge_type_id, billing_period);


--
-- Name: level_payment_installments UQ_level_payment_installments_profile_sequence; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_payment_installments
    ADD CONSTRAINT "UQ_level_payment_installments_profile_sequence" UNIQUE (profile_id, sequence);


--
-- Name: level_payment_profiles UQ_level_payment_profiles_school_level; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_payment_profiles
    ADD CONSTRAINT "UQ_level_payment_profiles_school_level" UNIQUE (school_id, level_id);


--
-- Name: meeting_room_invitees UQ_meeting_room_invitee_room_user; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_room_invitees
    ADD CONSTRAINT "UQ_meeting_room_invitee_room_user" UNIQUE (meeting_room_id, user_id);


--
-- Name: notification_template_definitions UQ_notification_template_definitions_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_template_definitions
    ADD CONSTRAINT "UQ_notification_template_definitions_key" UNIQUE (template_key);


--
-- Name: online_session_student_attendance UQ_online_session_student_attendance_session_student; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_session_student_attendance
    ADD CONSTRAINT "UQ_online_session_student_attendance_session_student" UNIQUE (online_session_id, student_id);


--
-- Name: online_video_sessions UQ_online_video_sessions_schedule_session_date; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_video_sessions
    ADD CONSTRAINT "UQ_online_video_sessions_schedule_session_date" UNIQUE (schedule_id, session_date);


--
-- Name: payment_charge_types UQ_payment_charge_types_school_code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_charge_types
    ADD CONSTRAINT "UQ_payment_charge_types_school_code" UNIQUE (school_id, code);


--
-- Name: payment_discount_types UQ_payment_discount_types_school_code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_discount_types
    ADD CONSTRAINT "UQ_payment_discount_types_school_code" UNIQUE (school_id, code);


--
-- Name: platform_plan_features UQ_platform_plan_features_plan_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_plan_features
    ADD CONSTRAINT "UQ_platform_plan_features_plan_key" UNIQUE (plan_id, feature_key);


--
-- Name: platform_plan_modules UQ_platform_plan_modules_plan_module; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_plan_modules
    ADD CONSTRAINT "UQ_platform_plan_modules_plan_module" UNIQUE (plan_id, module_id);


--
-- Name: platform_plan_prices UQ_platform_plan_prices_plan_period; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_plan_prices
    ADD CONSTRAINT "UQ_platform_plan_prices_plan_period" UNIQUE (plan_id, billing_period);


--
-- Name: rbac_user_permission_overrides UQ_rbac_user_override; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_user_permission_overrides
    ADD CONSTRAINT "UQ_rbac_user_override" UNIQUE ("userId", "pageId", "actionId");


--
-- Name: school_modules UQ_school_modules_school_module; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_modules
    ADD CONSTRAINT "UQ_school_modules_school_module" UNIQUE (school_id, module_id);


--
-- Name: school_notification_templates UQ_school_notification_templates_school_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_notification_templates
    ADD CONSTRAINT "UQ_school_notification_templates_school_key" UNIQUE (school_id, template_key);


--
-- Name: school_payment_levels UQ_school_payment_levels_school_code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_payment_levels
    ADD CONSTRAINT "UQ_school_payment_levels_school_code" UNIQUE (school_id, code);


--
-- Name: school_platform_subscription_addons UQ_school_platform_sub_addon; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_platform_subscription_addons
    ADD CONSTRAINT "UQ_school_platform_sub_addon" UNIQUE (subscription_id, addon_id);


--
-- Name: school_system_settings UQ_school_system_settings_school_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_system_settings
    ADD CONSTRAINT "UQ_school_system_settings_school_key" UNIQUE (school_id, setting_key);


--
-- Name: schools UQ_schools_landing_slug; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT "UQ_schools_landing_slug" UNIQUE (landing_slug);


--
-- Name: student_payment_installment_receipts UQ_spir_payment_installment; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_payment_installment_receipts
    ADD CONSTRAINT "UQ_spir_payment_installment" UNIQUE (student_payment_id, level_payment_installment_id);


--
-- Name: student_charge_sheet_installments UQ_student_charge_sheet_installments_seq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_charge_sheet_installments
    ADD CONSTRAINT "UQ_student_charge_sheet_installments_seq" UNIQUE (sheet_id, sequence);


--
-- Name: student_charge_sheets UQ_student_charge_sheets_student_year; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_charge_sheets
    ADD CONSTRAINT "UQ_student_charge_sheets_student_year" UNIQUE (student_id, academic_year_id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: weekly_session_plans pk_weekly_session_plans; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_session_plans
    ADD CONSTRAINT pk_weekly_session_plans PRIMARY KEY (id);


--
-- Name: platform_addons platform_addons_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_addons
    ADD CONSTRAINT platform_addons_code_key UNIQUE (code);


--
-- Name: platform_addons platform_addons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_addons
    ADD CONSTRAINT platform_addons_pkey PRIMARY KEY (id);


--
-- Name: platform_invoices platform_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_invoices
    ADD CONSTRAINT platform_invoices_pkey PRIMARY KEY (id);


--
-- Name: platform_modules platform_modules_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_modules
    ADD CONSTRAINT platform_modules_code_key UNIQUE (code);


--
-- Name: platform_modules platform_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_modules
    ADD CONSTRAINT platform_modules_pkey PRIMARY KEY (id);


--
-- Name: platform_plan_features platform_plan_features_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_plan_features
    ADD CONSTRAINT platform_plan_features_pkey PRIMARY KEY (id);


--
-- Name: platform_plan_modules platform_plan_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_plan_modules
    ADD CONSTRAINT platform_plan_modules_pkey PRIMARY KEY (id);


--
-- Name: platform_plan_prices platform_plan_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_plan_prices
    ADD CONSTRAINT platform_plan_prices_pkey PRIMARY KEY (id);


--
-- Name: platform_plans platform_plans_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_plans
    ADD CONSTRAINT platform_plans_code_key UNIQUE (code);


--
-- Name: platform_plans platform_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_plans
    ADD CONSTRAINT platform_plans_pkey PRIMARY KEY (id);


--
-- Name: rbac_actions rbac_actions_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_actions
    ADD CONSTRAINT rbac_actions_code_key UNIQUE (code);


--
-- Name: rbac_actions rbac_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_actions
    ADD CONSTRAINT rbac_actions_pkey PRIMARY KEY (id);


--
-- Name: rbac_group_permissions rbac_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_group_permissions
    ADD CONSTRAINT rbac_group_permissions_pkey PRIMARY KEY ("groupId", "pageId", "actionId");


--
-- Name: rbac_groups rbac_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_groups
    ADD CONSTRAINT rbac_groups_pkey PRIMARY KEY (id);


--
-- Name: rbac_groups rbac_groups_systemKey_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_groups
    ADD CONSTRAINT "rbac_groups_systemKey_key" UNIQUE ("systemKey");


--
-- Name: rbac_page_actions rbac_page_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_page_actions
    ADD CONSTRAINT rbac_page_actions_pkey PRIMARY KEY ("pageId", "actionId");


--
-- Name: rbac_pages rbac_pages_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_pages
    ADD CONSTRAINT rbac_pages_key_key UNIQUE (key);


--
-- Name: rbac_pages rbac_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_pages
    ADD CONSTRAINT rbac_pages_pkey PRIMARY KEY (id);


--
-- Name: rbac_role_permissions rbac_role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_role_permissions
    ADD CONSTRAINT rbac_role_permissions_pkey PRIMARY KEY ("roleId", "pageId", "actionId");


--
-- Name: rbac_roles rbac_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_roles
    ADD CONSTRAINT rbac_roles_pkey PRIMARY KEY (id);


--
-- Name: rbac_roles rbac_roles_systemKey_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_roles
    ADD CONSTRAINT "rbac_roles_systemKey_key" UNIQUE ("systemKey");


--
-- Name: rbac_user_group_members rbac_user_group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_user_group_members
    ADD CONSTRAINT rbac_user_group_members_pkey PRIMARY KEY ("userId", "groupId");


--
-- Name: rbac_user_group_roles rbac_user_group_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_user_group_roles
    ADD CONSTRAINT rbac_user_group_roles_pkey PRIMARY KEY ("groupId", "roleId");


--
-- Name: rbac_user_permission_overrides rbac_user_permission_overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_user_permission_overrides
    ADD CONSTRAINT rbac_user_permission_overrides_pkey PRIMARY KEY (id);


--
-- Name: school_landing_pages school_landing_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_landing_pages
    ADD CONSTRAINT school_landing_pages_pkey PRIMARY KEY (id);


--
-- Name: school_landing_pages school_landing_pages_school_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_landing_pages
    ADD CONSTRAINT school_landing_pages_school_id_key UNIQUE (school_id);


--
-- Name: school_modules school_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_modules
    ADD CONSTRAINT school_modules_pkey PRIMARY KEY (id);


--
-- Name: school_platform_subscription_addons school_platform_subscription_addons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_platform_subscription_addons
    ADD CONSTRAINT school_platform_subscription_addons_pkey PRIMARY KEY (id);


--
-- Name: school_platform_subscriptions school_platform_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_platform_subscriptions
    ADD CONSTRAINT school_platform_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: school_platform_subscriptions school_platform_subscriptions_school_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_platform_subscriptions
    ADD CONSTRAINT school_platform_subscriptions_school_id_key UNIQUE (school_id);


--
-- Name: session_media session_media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_media
    ADD CONSTRAINT session_media_pkey PRIMARY KEY (id);


--
-- Name: IDX_26f5abac21d5008e18949f7e1a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_26f5abac21d5008e18949f7e1a" ON public.student_groups USING btree (student_id);


--
-- Name: IDX_3b25a982c6e8629dcb6fdcca68; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_3b25a982c6e8629dcb6fdcca68" ON public.student_groups USING btree (group_id);


--
-- Name: IDX_ab5687be754283635fffe3692e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_ab5687be754283635fffe3692e" ON public.student_parents USING btree (student_id);


--
-- Name: IDX_bus_movement_logs_bus_logged_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_bus_movement_logs_bus_logged_at" ON public.bus_movement_logs USING btree (bus_id, logged_at);


--
-- Name: IDX_bus_movement_logs_bus_trip_day; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_bus_movement_logs_bus_trip_day" ON public.bus_movement_logs USING btree (bus_id, trip_date, trip_type, student_id, logged_at);


--
-- Name: IDX_buses_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_buses_school_id" ON public.buses USING btree (school_id);


--
-- Name: IDX_course_payment_profiles_school; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_course_payment_profiles_school" ON public.course_payment_profiles USING btree (school_id);


--
-- Name: IDX_d4d691ddbc51607ae462b68e16; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_d4d691ddbc51607ae462b68e16" ON public.student_parents USING btree (parent_id);


--
-- Name: IDX_direct_chat_messages_thread_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_direct_chat_messages_thread_created" ON public.direct_chat_messages USING btree (thread_id, created_at);


--
-- Name: IDX_direct_chat_threads_last_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_direct_chat_threads_last_at" ON public.direct_chat_threads USING btree (last_message_at DESC);


--
-- Name: IDX_fee_packages_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fee_packages_school_id" ON public.fee_packages USING btree (school_id);


--
-- Name: IDX_fpca_package_course; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fpca_package_course" ON public.fee_package_course_amounts USING btree (package_id, course_id);


--
-- Name: IDX_fpi_package_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fpi_package_id" ON public.fee_package_installments USING btree (package_id);


--
-- Name: IDX_fpla_package_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fpla_package_level" ON public.fee_package_level_amounts USING btree (package_id, level_id);


--
-- Name: IDX_fplps_package_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fplps_package_level" ON public.fee_package_level_period_settings USING btree (package_id, level_id);


--
-- Name: IDX_gctsm_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_gctsm_student" ON public.graded_criterion_task_student_marks USING btree (student_id);


--
-- Name: IDX_gctsm_task; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_gctsm_task" ON public.graded_criterion_task_student_marks USING btree (graded_criterion_teacher_task_id);


--
-- Name: IDX_gctt_criterion_group; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_gctt_criterion_group" ON public.graded_criterion_teacher_tasks USING btree (graded_criterion_id, group_id);


--
-- Name: IDX_gctt_teacher_course; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_gctt_teacher_course" ON public.graded_criterion_teacher_tasks USING btree (teacher_id, course_id);


--
-- Name: IDX_graded_criteria_semester; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_graded_criteria_semester" ON public.graded_criteria USING btree (semester_config_id);


--
-- Name: IDX_grades_display_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_grades_display_order" ON public.grades USING btree ("displayOrder");


--
-- Name: IDX_group_chat_messages_group_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_group_chat_messages_group_created" ON public.group_chat_messages USING btree (group_id, created_at);


--
-- Name: IDX_groups_level_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_groups_level_id" ON public.groups USING btree (level_id);


--
-- Name: IDX_meeting_room_invitees_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_meeting_room_invitees_user" ON public.meeting_room_invitees USING btree (user_id);


--
-- Name: IDX_meeting_rooms_school_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_meeting_rooms_school_created" ON public.meeting_rooms USING btree (school_id, created_at DESC);


--
-- Name: IDX_online_session_presence_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_online_session_presence_session" ON public.online_session_presence USING btree (online_session_id);


--
-- Name: IDX_online_video_sessions_session_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_online_video_sessions_session_date" ON public.online_video_sessions USING btree (session_date);


--
-- Name: IDX_ossa_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_ossa_session" ON public.online_session_student_attendance USING btree (online_session_id);


--
-- Name: IDX_payment_charge_types_school; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_charge_types_school" ON public.payment_charge_types USING btree (school_id, is_active);


--
-- Name: IDX_payment_discount_types_school; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_discount_types_school" ON public.payment_discount_types USING btree (school_id, is_active);


--
-- Name: IDX_pt_student_paid_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_pt_student_paid_at" ON public.payment_transactions USING btree (student_id, paid_at DESC);


--
-- Name: IDX_pta_fee_charge; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_pta_fee_charge" ON public.payment_transaction_allocations USING btree (student_fee_charge_id);


--
-- Name: IDX_pta_transaction; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_pta_transaction" ON public.payment_transaction_allocations USING btree (payment_transaction_id);


--
-- Name: IDX_rbac_groups_school; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_rbac_groups_school" ON public.rbac_groups USING btree ("schoolId");


--
-- Name: IDX_sce_course_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_sce_course_status" ON public.student_course_enrollments USING btree (course_id, status);


--
-- Name: IDX_sce_student_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_sce_student_status" ON public.student_course_enrollments USING btree (student_id, status);


--
-- Name: IDX_school_message_letters_school; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_school_message_letters_school" ON public.school_message_letters USING btree (school_id);


--
-- Name: IDX_school_modules_school; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_school_modules_school" ON public.school_modules USING btree (school_id);


--
-- Name: IDX_school_payment_levels_school; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_school_payment_levels_school" ON public.school_payment_levels USING btree (school_id, is_active, sort_order);


--
-- Name: IDX_school_system_settings_school_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_school_system_settings_school_category" ON public.school_system_settings USING btree (school_id, category);


--
-- Name: IDX_sfc_student_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_sfc_student_year" ON public.student_fee_charges USING btree (student_id, academic_year_id);


--
-- Name: IDX_spdl_student_payment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_spdl_student_payment_id" ON public.student_payment_discount_lines USING btree (student_payment_id);


--
-- Name: IDX_spir_student_payment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_spir_student_payment_id" ON public.student_payment_installment_receipts USING btree (student_payment_id);


--
-- Name: IDX_student_charge_sheets_school; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_student_charge_sheets_school" ON public.student_charge_sheets USING btree (school_id, academic_year_id);


--
-- Name: UQ_rbac_groups_school_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UQ_rbac_groups_school_code" ON public.rbac_groups USING btree (COALESCE("schoolId", 0), code);


--
-- Name: UQ_rbac_roles_school_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UQ_rbac_roles_school_code" ON public.rbac_roles USING btree (COALESCE("schoolId", 0), code);


--
-- Name: UQ_school_message_letters_activity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UQ_school_message_letters_activity_id" ON public.school_message_letters USING btree (activity_id) WHERE (activity_id IS NOT NULL);


--
-- Name: UQ_sfc_once_ever; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UQ_sfc_once_ever" ON public.student_fee_charges USING btree (student_payment_id, charge_type_id) WHERE ((billing_occurrence)::text = 'once_ever'::text);


--
-- Name: UQ_sfc_per_year; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UQ_sfc_per_year" ON public.student_fee_charges USING btree (student_payment_id, charge_type_id, academic_year_id) WHERE ((billing_occurrence)::text = ANY ((ARRAY['per_year'::character varying, 'other'::character varying])::text[]));


--
-- Name: UQ_student_buses_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UQ_student_buses_student_id" ON public.student_buses USING btree (student_id);


--
-- Name: UQ_student_course_enrollments_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UQ_student_course_enrollments_active" ON public.student_course_enrollments USING btree (student_id, course_id) WHERE ((status)::text = 'active'::text);


--
-- Name: UQ_student_payments_course; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UQ_student_payments_course" ON public.student_payments USING btree (student_id, course_id) WHERE (course_id IS NOT NULL);


--
-- Name: UQ_student_payments_level; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UQ_student_payments_level" ON public.student_payments USING btree (student_id) WHERE (course_id IS NULL);


--
-- Name: idx_parents_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parents_user_id ON public.parents USING btree (user_id);


--
-- Name: idx_schedules_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_schedules_group_id ON public.schedules USING btree (group_id);


--
-- Name: idx_session_media_file_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_media_file_type ON public.session_media USING btree (file_type);


--
-- Name: idx_session_media_session_plan_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_media_session_plan_id ON public.session_media USING btree (session_plan_id);


--
-- Name: idx_session_media_uploaded_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_media_uploaded_by ON public.session_media USING btree (uploaded_by);


--
-- Name: idx_student_parents_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_parents_parent_id ON public.student_parents USING btree (parent_id);


--
-- Name: idx_student_parents_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_parents_student_id ON public.student_parents USING btree (student_id);


--
-- Name: idx_student_progress_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_progress_student_id ON public.student_progress USING btree (student_id);


--
-- Name: idx_weekly_session_plans_completed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_session_plans_completed_at ON public.weekly_session_plans USING btree (completed_at);


--
-- Name: idx_weekly_session_plans_completed_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_session_plans_completed_by ON public.weekly_session_plans USING btree (completed_by);


--
-- Name: idx_weekly_session_plans_schedule_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_session_plans_schedule_id ON public.weekly_session_plans USING btree (schedule_id);


--
-- Name: idx_weekly_session_plans_schedule_week; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_session_plans_schedule_week ON public.weekly_session_plans USING btree (schedule_id, week_start_date);


--
-- Name: idx_weekly_session_plans_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_session_plans_status ON public.weekly_session_plans USING btree (session_status);


--
-- Name: idx_weekly_session_plans_week_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_session_plans_week_dates ON public.weekly_session_plans USING btree (week_start_date, week_end_date);


--
-- Name: student_progress FK_0e6ffb6e4b3e62948d2cd8f9d25; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_progress
    ADD CONSTRAINT "FK_0e6ffb6e4b3e62948d2cd8f9d25" FOREIGN KEY (milestone_id) REFERENCES public.milestones(id);


--
-- Name: users FK_25e1cf8f41bae2f3d11f3c2a028; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_25e1cf8f41bae2f3d11f3c2a028" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: student_groups FK_26f5abac21d5008e18949f7e1af; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_groups
    ADD CONSTRAINT "FK_26f5abac21d5008e18949f7e1af" FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: schedules FK_2b9a68c93adbc74afa109bb2a73; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT "FK_2b9a68c93adbc74afa109bb2a73" FOREIGN KEY (room_id) REFERENCES public.rooms(id);


--
-- Name: schedules FK_2c027020a88187efddd0dbb8421; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT "FK_2c027020a88187efddd0dbb8421" FOREIGN KEY (teacher_id) REFERENCES public.users(id);


--
-- Name: schedules FK_330dc11fecc87ead6c8464d9552; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT "FK_330dc11fecc87ead6c8464d9552" FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: staff FK_351341ffb6055ef0907b18e28b9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "FK_351341ffb6055ef0907b18e28b9" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: student_groups FK_3b25a982c6e8629dcb6fdcca68c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_groups
    ADD CONSTRAINT "FK_3b25a982c6e8629dcb6fdcca68c" FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: class_settings FK_44ada01d1f189a02fec88613fc4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_settings
    ADD CONSTRAINT "FK_44ada01d1f189a02fec88613fc4" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: reminders FK_586e0b8e419125be507701cee2a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT "FK_586e0b8e419125be507701cee2a" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: courses FK_5d36fddafdb9cabd2df4178160d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "FK_5d36fddafdb9cabd2df4178160d" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: student_progress FK_5fb6e1954cc0ffbaa4c57440aeb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_progress
    ADD CONSTRAINT "FK_5fb6e1954cc0ffbaa4c57440aeb" FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: groups FK_733c97836a6a5575a5d1c70826b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "FK_733c97836a6a5575a5d1c70826b" FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id);


--
-- Name: student_progress FK_760b6a9d017ba81f2a33b1bddee; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_progress
    ADD CONSTRAINT "FK_760b6a9d017ba81f2a33b1bddee" FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: attendances FK_7874d0af5c1371ad4ea2152e266; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "FK_7874d0af5c1371ad4ea2152e266" FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: student_progress FK_7b7df703b978daed31977bcdd0e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_progress
    ADD CONSTRAINT "FK_7b7df703b978daed31977bcdd0e" FOREIGN KEY (updated_by) REFERENCES public.staff(id);


--
-- Name: courses FK_7f099cebb2ad6533754207a949b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "FK_7f099cebb2ad6533754207a949b" FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id);


--
-- Name: activities_legacy_pre_align_1777620000000 FK_93af199b643c30e2bc55561d306; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities_legacy_pre_align_1777620000000
    ADD CONSTRAINT "FK_93af199b643c30e2bc55561d306" FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: phases FK_9d14336cfb8bc056f1b8271b094; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phases
    ADD CONSTRAINT "FK_9d14336cfb8bc056f1b8271b094" FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: semesters FK_a2d5014975f0e10189e2dc45820; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT "FK_a2d5014975f0e10189e2dc45820" FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id);


--
-- Name: students FK_aa8edc7905ad764f85924569647; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_aa8edc7905ad764f85924569647" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: student_parents FK_ab5687be754283635fffe3692ee; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_parents
    ADD CONSTRAINT "FK_ab5687be754283635fffe3692ee" FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: activities FK_activities_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "FK_activities_created_by" FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: activities FK_activities_group; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "FK_activities_group" FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE SET NULL;


--
-- Name: activities FK_activities_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "FK_activities_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: groups FK_b0bae95e6d3f33ec73b599c418d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "FK_b0bae95e6d3f33ec73b599c418d" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: schedules FK_b1e10ac4dc72412af1c3f4d736d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT "FK_b1e10ac4dc72412af1c3f4d736d" FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: academic_years FK_b293eb7909d2a3aae86c4380713; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.academic_years
    ADD CONSTRAINT "FK_b293eb7909d2a3aae86c4380713" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: bus_fee_link_lines FK_bus_fee_link_lines_charge; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus_fee_link_lines
    ADD CONSTRAINT "FK_bus_fee_link_lines_charge" FOREIGN KEY (charge_type_id) REFERENCES public.payment_charge_types(id) ON DELETE RESTRICT;


--
-- Name: bus_fee_link_lines FK_bus_fee_link_lines_link; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus_fee_link_lines
    ADD CONSTRAINT "FK_bus_fee_link_lines_link" FOREIGN KEY (link_id) REFERENCES public.bus_fee_links(id) ON DELETE CASCADE;


--
-- Name: bus_fee_links FK_bus_fee_links_bus; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus_fee_links
    ADD CONSTRAINT "FK_bus_fee_links_bus" FOREIGN KEY (bus_id) REFERENCES public.buses(id) ON DELETE CASCADE;


--
-- Name: bus_fee_links FK_bus_fee_links_package; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus_fee_links
    ADD CONSTRAINT "FK_bus_fee_links_package" FOREIGN KEY (fee_package_id) REFERENCES public.fee_packages(id) ON DELETE RESTRICT;


--
-- Name: bus_fee_links FK_bus_fee_links_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus_fee_links
    ADD CONSTRAINT "FK_bus_fee_links_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: bus_movement_logs FK_bus_movement_logs_bus; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus_movement_logs
    ADD CONSTRAINT "FK_bus_movement_logs_bus" FOREIGN KEY (bus_id) REFERENCES public.buses(id) ON DELETE CASCADE;


--
-- Name: bus_movement_logs FK_bus_movement_logs_student; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus_movement_logs
    ADD CONSTRAINT "FK_bus_movement_logs_student" FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: bus_movement_logs FK_bus_movement_logs_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus_movement_logs
    ADD CONSTRAINT "FK_bus_movement_logs_user" FOREIGN KEY (logged_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: buses FK_buses_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buses
    ADD CONSTRAINT "FK_buses_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: parents FK_c94c3cea9b43a18c81269ded41d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parents
    ADD CONSTRAINT "FK_c94c3cea9b43a18c81269ded41d" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: staff FK_cec9365d9fc3a3409158b645f2e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "FK_cec9365d9fc3a3409158b645f2e" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: course_fee_link_lines FK_course_fee_link_lines_charge; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_fee_link_lines
    ADD CONSTRAINT "FK_course_fee_link_lines_charge" FOREIGN KEY (charge_type_id) REFERENCES public.payment_charge_types(id) ON DELETE RESTRICT;


--
-- Name: course_fee_link_lines FK_course_fee_link_lines_link; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_fee_link_lines
    ADD CONSTRAINT "FK_course_fee_link_lines_link" FOREIGN KEY (link_id) REFERENCES public.course_fee_links(id) ON DELETE CASCADE;


--
-- Name: course_fee_links FK_course_fee_links_course; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_fee_links
    ADD CONSTRAINT "FK_course_fee_links_course" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: course_fee_links FK_course_fee_links_package; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_fee_links
    ADD CONSTRAINT "FK_course_fee_links_package" FOREIGN KEY (fee_package_id) REFERENCES public.fee_packages(id) ON DELETE RESTRICT;


--
-- Name: course_fee_links FK_course_fee_links_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_fee_links
    ADD CONSTRAINT "FK_course_fee_links_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: course_payment_charge_lines FK_course_payment_charge_lines_charge_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_payment_charge_lines
    ADD CONSTRAINT "FK_course_payment_charge_lines_charge_type" FOREIGN KEY (charge_type_id) REFERENCES public.payment_charge_types(id) ON DELETE RESTRICT;


--
-- Name: course_payment_charge_lines FK_course_payment_charge_lines_profile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_payment_charge_lines
    ADD CONSTRAINT "FK_course_payment_charge_lines_profile" FOREIGN KEY (profile_id) REFERENCES public.course_payment_profiles(id) ON DELETE CASCADE;


--
-- Name: course_payment_profiles FK_course_payment_profiles_course; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_payment_profiles
    ADD CONSTRAINT "FK_course_payment_profiles_course" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: course_payment_profiles FK_course_payment_profiles_fee_package; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_payment_profiles
    ADD CONSTRAINT "FK_course_payment_profiles_fee_package" FOREIGN KEY (fee_package_id) REFERENCES public.fee_packages(id) ON DELETE SET NULL;


--
-- Name: course_payment_profiles FK_course_payment_profiles_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_payment_profiles
    ADD CONSTRAINT "FK_course_payment_profiles_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: student_parents FK_d4d691ddbc51607ae462b68e16c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_parents
    ADD CONSTRAINT "FK_d4d691ddbc51607ae462b68e16c" FOREIGN KEY (parent_id) REFERENCES public.parents(id);


--
-- Name: direct_chat_messages FK_dcm_thread; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.direct_chat_messages
    ADD CONSTRAINT "FK_dcm_thread" FOREIGN KEY (thread_id) REFERENCES public.direct_chat_threads(id) ON DELETE CASCADE;


--
-- Name: direct_chat_messages FK_dcm_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.direct_chat_messages
    ADD CONSTRAINT "FK_dcm_user" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: direct_chat_threads FK_dct_user_high; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.direct_chat_threads
    ADD CONSTRAINT "FK_dct_user_high" FOREIGN KEY (user_high_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: direct_chat_threads FK_dct_user_low; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.direct_chat_threads
    ADD CONSTRAINT "FK_dct_user_low" FOREIGN KEY (user_low_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: attendances FK_ddb8f8852fc45bebff80106035c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "FK_ddb8f8852fc45bebff80106035c" FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: attendances FK_e0ff1c3c262fb8b55222e4d8329; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "FK_e0ff1c3c262fb8b55222e4d8329" FOREIGN KEY (recorded_by) REFERENCES public.staff(id);


--
-- Name: milestones FK_ecc11da5b97746ab136a904626f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT "FK_ecc11da5b97746ab136a904626f" FOREIGN KEY (phase_id) REFERENCES public.phases(id);


--
-- Name: students FK_f8c241265ea322470a2897ce0cd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_f8c241265ea322470a2897ce0cd" FOREIGN KEY (room_id) REFERENCES public.rooms(id);


--
-- Name: students FK_fb3eff90b11bddf7285f9b4e281; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_fb3eff90b11bddf7285f9b4e281" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: fee_packages FK_fee_packages_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_packages
    ADD CONSTRAINT "FK_fee_packages_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: rooms FK_ffaac60590923112dad474b21dc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT "FK_ffaac60590923112dad474b21dc" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: fee_package_course_amounts FK_fpca_charge_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_course_amounts
    ADD CONSTRAINT "FK_fpca_charge_type" FOREIGN KEY (charge_type_id) REFERENCES public.payment_charge_types(id) ON DELETE RESTRICT;


--
-- Name: fee_package_course_amounts FK_fpca_course; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_course_amounts
    ADD CONSTRAINT "FK_fpca_course" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: fee_package_course_amounts FK_fpca_package; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_course_amounts
    ADD CONSTRAINT "FK_fpca_package" FOREIGN KEY (package_id) REFERENCES public.fee_packages(id) ON DELETE CASCADE;


--
-- Name: fee_package_charge_types FK_fpct_charge_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_charge_types
    ADD CONSTRAINT "FK_fpct_charge_type" FOREIGN KEY (charge_type_id) REFERENCES public.payment_charge_types(id) ON DELETE RESTRICT;


--
-- Name: fee_package_charge_types FK_fpct_package; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_charge_types
    ADD CONSTRAINT "FK_fpct_package" FOREIGN KEY (package_id) REFERENCES public.fee_packages(id) ON DELETE CASCADE;


--
-- Name: fee_package_discount_types FK_fpdt_discount_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_discount_types
    ADD CONSTRAINT "FK_fpdt_discount_type" FOREIGN KEY (discount_type_id) REFERENCES public.payment_discount_types(id) ON DELETE RESTRICT;


--
-- Name: fee_package_discount_types FK_fpdt_package; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_discount_types
    ADD CONSTRAINT "FK_fpdt_package" FOREIGN KEY (package_id) REFERENCES public.fee_packages(id) ON DELETE CASCADE;


--
-- Name: fee_package_installments FK_fpi_package; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_installments
    ADD CONSTRAINT "FK_fpi_package" FOREIGN KEY (package_id) REFERENCES public.fee_packages(id) ON DELETE CASCADE;


--
-- Name: fee_package_level_amounts FK_fpla_charge_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_level_amounts
    ADD CONSTRAINT "FK_fpla_charge_type" FOREIGN KEY (charge_type_id) REFERENCES public.payment_charge_types(id) ON DELETE RESTRICT;


--
-- Name: fee_package_level_amounts FK_fpla_level; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_level_amounts
    ADD CONSTRAINT "FK_fpla_level" FOREIGN KEY (level_id) REFERENCES public.school_payment_levels(id) ON DELETE CASCADE;


--
-- Name: fee_package_level_amounts FK_fpla_package; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_level_amounts
    ADD CONSTRAINT "FK_fpla_package" FOREIGN KEY (package_id) REFERENCES public.fee_packages(id) ON DELETE CASCADE;


--
-- Name: fee_package_level_period_settings FK_fplps_level; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_level_period_settings
    ADD CONSTRAINT "FK_fplps_level" FOREIGN KEY (level_id) REFERENCES public.school_payment_levels(id) ON DELETE CASCADE;


--
-- Name: fee_package_level_period_settings FK_fplps_package; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_package_level_period_settings
    ADD CONSTRAINT "FK_fplps_package" FOREIGN KEY (package_id) REFERENCES public.fee_packages(id) ON DELETE CASCADE;


--
-- Name: graded_criterion_task_student_marks FK_gctsm_student; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graded_criterion_task_student_marks
    ADD CONSTRAINT "FK_gctsm_student" FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: graded_criterion_task_student_marks FK_gctsm_task; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graded_criterion_task_student_marks
    ADD CONSTRAINT "FK_gctsm_task" FOREIGN KEY (graded_criterion_teacher_task_id) REFERENCES public.graded_criterion_teacher_tasks(id) ON DELETE CASCADE;


--
-- Name: graded_criterion_task_student_marks FK_gctsm_teacher; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graded_criterion_task_student_marks
    ADD CONSTRAINT "FK_gctsm_teacher" FOREIGN KEY (updated_by_teacher_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: graded_criterion_teacher_tasks FK_gctt_course; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graded_criterion_teacher_tasks
    ADD CONSTRAINT "FK_gctt_course" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: graded_criterion_teacher_tasks FK_gctt_criterion; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graded_criterion_teacher_tasks
    ADD CONSTRAINT "FK_gctt_criterion" FOREIGN KEY (graded_criterion_id) REFERENCES public.graded_criteria(id) ON DELETE CASCADE;


--
-- Name: graded_criterion_teacher_tasks FK_gctt_group; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graded_criterion_teacher_tasks
    ADD CONSTRAINT "FK_gctt_group" FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: graded_criterion_teacher_tasks FK_gctt_teacher; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graded_criterion_teacher_tasks
    ADD CONSTRAINT "FK_gctt_teacher" FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: grade_fee_link_lines FK_grade_fee_link_lines_charge; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_fee_link_lines
    ADD CONSTRAINT "FK_grade_fee_link_lines_charge" FOREIGN KEY (charge_type_id) REFERENCES public.payment_charge_types(id) ON DELETE RESTRICT;


--
-- Name: grade_fee_link_lines FK_grade_fee_link_lines_link; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_fee_link_lines
    ADD CONSTRAINT "FK_grade_fee_link_lines_link" FOREIGN KEY (link_id) REFERENCES public.grade_fee_links(id) ON DELETE CASCADE;


--
-- Name: grade_fee_links FK_grade_fee_links_level; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_fee_links
    ADD CONSTRAINT "FK_grade_fee_links_level" FOREIGN KEY (level_id) REFERENCES public.school_payment_levels(id) ON DELETE CASCADE;


--
-- Name: grade_fee_links FK_grade_fee_links_package; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_fee_links
    ADD CONSTRAINT "FK_grade_fee_links_package" FOREIGN KEY (fee_package_id) REFERENCES public.fee_packages(id) ON DELETE RESTRICT;


--
-- Name: grade_fee_links FK_grade_fee_links_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_fee_links
    ADD CONSTRAINT "FK_grade_fee_links_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: graded_criteria FK_graded_criterion_semester; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graded_criteria
    ADD CONSTRAINT "FK_graded_criterion_semester" FOREIGN KEY (semester_config_id) REFERENCES public.graded_semester_configs(id) ON DELETE CASCADE;


--
-- Name: graded_assessment_schemes FK_graded_scheme_course; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graded_assessment_schemes
    ADD CONSTRAINT "FK_graded_scheme_course" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: graded_semester_configs FK_graded_semester_scheme; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graded_semester_configs
    ADD CONSTRAINT "FK_graded_semester_scheme" FOREIGN KEY (scheme_id) REFERENCES public.graded_assessment_schemes(id) ON DELETE CASCADE;


--
-- Name: group_chat_messages FK_group_chat_messages_group; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_chat_messages
    ADD CONSTRAINT "FK_group_chat_messages_group" FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_chat_messages FK_group_chat_messages_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_chat_messages
    ADD CONSTRAINT "FK_group_chat_messages_user" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: groups FK_groups_school_payment_level; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "FK_groups_school_payment_level" FOREIGN KEY (level_id) REFERENCES public.school_payment_levels(id) ON DELETE SET NULL;


--
-- Name: installment_plan_entries FK_installment_plan_entries_plan; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_plan_entries
    ADD CONSTRAINT "FK_installment_plan_entries_plan" FOREIGN KEY (plan_id) REFERENCES public.installment_plans(id) ON DELETE CASCADE;


--
-- Name: installment_plans FK_installment_plans_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_plans
    ADD CONSTRAINT "FK_installment_plans_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: level_payment_charge_lines FK_level_payment_charge_lines_charge_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_payment_charge_lines
    ADD CONSTRAINT "FK_level_payment_charge_lines_charge_type" FOREIGN KEY (charge_type_id) REFERENCES public.payment_charge_types(id) ON DELETE RESTRICT;


--
-- Name: level_payment_charge_lines FK_level_payment_charge_lines_profile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_payment_charge_lines
    ADD CONSTRAINT "FK_level_payment_charge_lines_profile" FOREIGN KEY (profile_id) REFERENCES public.level_payment_profiles(id) ON DELETE CASCADE;


--
-- Name: level_payment_installments FK_level_payment_installments_profile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_payment_installments
    ADD CONSTRAINT "FK_level_payment_installments_profile" FOREIGN KEY (profile_id) REFERENCES public.level_payment_profiles(id) ON DELETE CASCADE;


--
-- Name: level_payment_profiles FK_level_payment_profiles_fee_package; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_payment_profiles
    ADD CONSTRAINT "FK_level_payment_profiles_fee_package" FOREIGN KEY (fee_package_id) REFERENCES public.fee_packages(id) ON DELETE SET NULL;


--
-- Name: level_payment_profiles FK_level_payment_profiles_level; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_payment_profiles
    ADD CONSTRAINT "FK_level_payment_profiles_level" FOREIGN KEY (level_id) REFERENCES public.school_payment_levels(id) ON DELETE CASCADE;


--
-- Name: level_payment_profiles FK_level_payment_profiles_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_payment_profiles
    ADD CONSTRAINT "FK_level_payment_profiles_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: level_payment_profile_discounts FK_lppd_discount; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_payment_profile_discounts
    ADD CONSTRAINT "FK_lppd_discount" FOREIGN KEY (discount_type_id) REFERENCES public.payment_discount_types(id) ON DELETE CASCADE;


--
-- Name: level_payment_profile_discounts FK_lppd_profile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_payment_profile_discounts
    ADD CONSTRAINT "FK_lppd_profile" FOREIGN KEY (profile_id) REFERENCES public.level_payment_profiles(id) ON DELETE CASCADE;


--
-- Name: meeting_room_invitees FK_meeting_room_invitees_room; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_room_invitees
    ADD CONSTRAINT "FK_meeting_room_invitees_room" FOREIGN KEY (meeting_room_id) REFERENCES public.meeting_rooms(id) ON DELETE CASCADE;


--
-- Name: meeting_room_invitees FK_meeting_room_invitees_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_room_invitees
    ADD CONSTRAINT "FK_meeting_room_invitees_user" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: meeting_rooms FK_meeting_rooms_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_rooms
    ADD CONSTRAINT "FK_meeting_rooms_created_by" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: meeting_rooms FK_meeting_rooms_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_rooms
    ADD CONSTRAINT "FK_meeting_rooms_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: online_session_presence FK_online_session_presence_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_session_presence
    ADD CONSTRAINT "FK_online_session_presence_session" FOREIGN KEY (online_session_id) REFERENCES public.online_video_sessions(id) ON DELETE CASCADE;


--
-- Name: online_session_presence FK_online_session_presence_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_session_presence
    ADD CONSTRAINT "FK_online_session_presence_user" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: online_video_sessions FK_online_video_sessions_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_video_sessions
    ADD CONSTRAINT "FK_online_video_sessions_created_by" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: online_video_sessions FK_online_video_sessions_schedule; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_video_sessions
    ADD CONSTRAINT "FK_online_video_sessions_schedule" FOREIGN KEY (schedule_id) REFERENCES public.schedules(id) ON DELETE CASCADE;


--
-- Name: online_session_student_attendance FK_ossa_session; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_session_student_attendance
    ADD CONSTRAINT "FK_ossa_session" FOREIGN KEY (online_session_id) REFERENCES public.online_video_sessions(id) ON DELETE CASCADE;


--
-- Name: online_session_student_attendance FK_ossa_student; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_session_student_attendance
    ADD CONSTRAINT "FK_ossa_student" FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: payment_charge_types FK_payment_charge_types_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_charge_types
    ADD CONSTRAINT "FK_payment_charge_types_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: payment_discount_types FK_payment_discount_types_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_discount_types
    ADD CONSTRAINT "FK_payment_discount_types_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: payment_transactions FK_pt_academic_year; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT "FK_pt_academic_year" FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) ON DELETE SET NULL;


--
-- Name: payment_transactions FK_pt_recorded_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT "FK_pt_recorded_by" FOREIGN KEY (recorded_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: payment_transactions FK_pt_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT "FK_pt_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: payment_transactions FK_pt_student; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT "FK_pt_student" FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: payment_transactions FK_pt_student_payment; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT "FK_pt_student_payment" FOREIGN KEY (student_payment_id) REFERENCES public.student_payments(id) ON DELETE CASCADE;


--
-- Name: payment_transaction_allocations FK_pta_charge_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transaction_allocations
    ADD CONSTRAINT "FK_pta_charge_type" FOREIGN KEY (charge_type_id) REFERENCES public.payment_charge_types(id) ON DELETE RESTRICT;


--
-- Name: payment_transaction_allocations FK_pta_fee_charge; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transaction_allocations
    ADD CONSTRAINT "FK_pta_fee_charge" FOREIGN KEY (student_fee_charge_id) REFERENCES public.student_fee_charges(id) ON DELETE RESTRICT;


--
-- Name: payment_transaction_allocations FK_pta_installment; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transaction_allocations
    ADD CONSTRAINT "FK_pta_installment" FOREIGN KEY (level_payment_installment_id) REFERENCES public.level_payment_installments(id) ON DELETE SET NULL;


--
-- Name: payment_transaction_allocations FK_pta_transaction; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transaction_allocations
    ADD CONSTRAINT "FK_pta_transaction" FOREIGN KEY (payment_transaction_id) REFERENCES public.payment_transactions(id) ON DELETE CASCADE;


--
-- Name: student_course_enrollments FK_sce_course; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_course_enrollments
    ADD CONSTRAINT "FK_sce_course" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: student_course_enrollments FK_sce_enrolled_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_course_enrollments
    ADD CONSTRAINT "FK_sce_enrolled_by" FOREIGN KEY (enrolled_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: student_course_enrollments FK_sce_payment; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_course_enrollments
    ADD CONSTRAINT "FK_sce_payment" FOREIGN KEY (student_payment_id) REFERENCES public.student_payments(id) ON DELETE SET NULL;


--
-- Name: student_course_enrollments FK_sce_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_course_enrollments
    ADD CONSTRAINT "FK_sce_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: student_course_enrollments FK_sce_student; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_course_enrollments
    ADD CONSTRAINT "FK_sce_student" FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: school_message_letters FK_school_message_letters_activity; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_message_letters
    ADD CONSTRAINT "FK_school_message_letters_activity" FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE;


--
-- Name: school_message_letters FK_school_message_letters_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_message_letters
    ADD CONSTRAINT "FK_school_message_letters_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: school_notification_templates FK_school_notification_templates_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_notification_templates
    ADD CONSTRAINT "FK_school_notification_templates_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: school_payment_levels FK_school_payment_levels_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_payment_levels
    ADD CONSTRAINT "FK_school_payment_levels_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: school_system_settings FK_school_system_settings_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_system_settings
    ADD CONSTRAINT "FK_school_system_settings_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: student_charge_sheet_discount_lines FK_scsdl_discount; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_charge_sheet_discount_lines
    ADD CONSTRAINT "FK_scsdl_discount" FOREIGN KEY (discount_type_id) REFERENCES public.payment_discount_types(id) ON DELETE RESTRICT;


--
-- Name: student_charge_sheet_discount_lines FK_scsdl_sheet; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_charge_sheet_discount_lines
    ADD CONSTRAINT "FK_scsdl_sheet" FOREIGN KEY (sheet_id) REFERENCES public.student_charge_sheets(id) ON DELETE CASCADE;


--
-- Name: student_fee_charges FK_sfc_academic_year; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_fee_charges
    ADD CONSTRAINT "FK_sfc_academic_year" FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) ON DELETE SET NULL;


--
-- Name: student_fee_charges FK_sfc_charge_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_fee_charges
    ADD CONSTRAINT "FK_sfc_charge_type" FOREIGN KEY (charge_type_id) REFERENCES public.payment_charge_types(id) ON DELETE RESTRICT;


--
-- Name: student_fee_charges FK_sfc_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_fee_charges
    ADD CONSTRAINT "FK_sfc_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: student_fee_charges FK_sfc_student; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_fee_charges
    ADD CONSTRAINT "FK_sfc_student" FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: student_fee_charges FK_sfc_student_payment; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_fee_charges
    ADD CONSTRAINT "FK_sfc_student_payment" FOREIGN KEY (student_payment_id) REFERENCES public.student_payments(id) ON DELETE CASCADE;


--
-- Name: student_payment_discount_lines FK_spdl_discount_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_payment_discount_lines
    ADD CONSTRAINT "FK_spdl_discount_type" FOREIGN KEY (discount_type_id) REFERENCES public.payment_discount_types(id) ON DELETE RESTRICT;


--
-- Name: student_payment_discount_lines FK_spdl_payment; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_payment_discount_lines
    ADD CONSTRAINT "FK_spdl_payment" FOREIGN KEY (student_payment_id) REFERENCES public.student_payments(id) ON DELETE CASCADE;


--
-- Name: student_payment_installment_receipts FK_spir_installment; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_payment_installment_receipts
    ADD CONSTRAINT "FK_spir_installment" FOREIGN KEY (level_payment_installment_id) REFERENCES public.level_payment_installments(id) ON DELETE CASCADE;


--
-- Name: student_payment_installment_receipts FK_spir_payment; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_payment_installment_receipts
    ADD CONSTRAINT "FK_spir_payment" FOREIGN KEY (student_payment_id) REFERENCES public.student_payments(id) ON DELETE CASCADE;


--
-- Name: student_buses FK_student_buses_bus; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_buses
    ADD CONSTRAINT "FK_student_buses_bus" FOREIGN KEY (bus_id) REFERENCES public.buses(id) ON DELETE CASCADE;


--
-- Name: student_buses FK_student_buses_student; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_buses
    ADD CONSTRAINT "FK_student_buses_student" FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: student_charge_sheet_installments FK_student_charge_sheet_installments_sheet; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_charge_sheet_installments
    ADD CONSTRAINT "FK_student_charge_sheet_installments_sheet" FOREIGN KEY (sheet_id) REFERENCES public.student_charge_sheets(id) ON DELETE CASCADE;


--
-- Name: student_charge_sheet_lines FK_student_charge_sheet_lines_charge; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_charge_sheet_lines
    ADD CONSTRAINT "FK_student_charge_sheet_lines_charge" FOREIGN KEY (charge_type_id) REFERENCES public.payment_charge_types(id) ON DELETE RESTRICT;


--
-- Name: student_charge_sheet_lines FK_student_charge_sheet_lines_sheet; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_charge_sheet_lines
    ADD CONSTRAINT "FK_student_charge_sheet_lines_sheet" FOREIGN KEY (sheet_id) REFERENCES public.student_charge_sheets(id) ON DELETE CASCADE;


--
-- Name: student_charge_sheets FK_student_charge_sheets_plan; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_charge_sheets
    ADD CONSTRAINT "FK_student_charge_sheets_plan" FOREIGN KEY (installment_plan_id) REFERENCES public.installment_plans(id) ON DELETE SET NULL;


--
-- Name: student_charge_sheets FK_student_charge_sheets_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_charge_sheets
    ADD CONSTRAINT "FK_student_charge_sheets_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: student_charge_sheets FK_student_charge_sheets_student; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_charge_sheets
    ADD CONSTRAINT "FK_student_charge_sheets_student" FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: student_charge_sheets FK_student_charge_sheets_year; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_charge_sheets
    ADD CONSTRAINT "FK_student_charge_sheets_year" FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) ON DELETE RESTRICT;


--
-- Name: student_payments FK_student_payments_course; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_payments
    ADD CONSTRAINT "FK_student_payments_course" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: student_payments FK_student_payments_course_profile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_payments
    ADD CONSTRAINT "FK_student_payments_course_profile" FOREIGN KEY (course_payment_profile_id) REFERENCES public.course_payment_profiles(id) ON DELETE SET NULL;


--
-- Name: student_payments FK_student_payments_level; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_payments
    ADD CONSTRAINT "FK_student_payments_level" FOREIGN KEY (level_id) REFERENCES public.school_payment_levels(id) ON DELETE SET NULL;


--
-- Name: student_payments FK_student_payments_profile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_payments
    ADD CONSTRAINT "FK_student_payments_profile" FOREIGN KEY (level_payment_profile_id) REFERENCES public.level_payment_profiles(id) ON DELETE SET NULL;


--
-- Name: student_payments FK_student_payments_school; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_payments
    ADD CONSTRAINT "FK_student_payments_school" FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: student_payments FK_student_payments_student; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_payments
    ADD CONSTRAINT "FK_student_payments_student" FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: students FK_students_payment_level; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_students_payment_level" FOREIGN KEY (payment_level_id) REFERENCES public.school_payment_levels(id) ON DELETE SET NULL;


--
-- Name: parents fk_parents_user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parents
    ADD CONSTRAINT fk_parents_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: staff fk_staff_user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT fk_staff_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: weekly_session_plans fk_weekly_session_plans_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_session_plans
    ADD CONSTRAINT fk_weekly_session_plans_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: weekly_session_plans fk_weekly_session_plans_schedule; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_session_plans
    ADD CONSTRAINT fk_weekly_session_plans_schedule FOREIGN KEY (schedule_id) REFERENCES public.schedules(id) ON DELETE CASCADE;


--
-- Name: platform_invoices platform_invoices_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_invoices
    ADD CONSTRAINT platform_invoices_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: platform_invoices platform_invoices_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_invoices
    ADD CONSTRAINT platform_invoices_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.school_platform_subscriptions(id) ON DELETE CASCADE;


--
-- Name: platform_plan_features platform_plan_features_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_plan_features
    ADD CONSTRAINT platform_plan_features_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.platform_plans(id) ON DELETE CASCADE;


--
-- Name: platform_plan_modules platform_plan_modules_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_plan_modules
    ADD CONSTRAINT platform_plan_modules_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.platform_modules(id) ON DELETE CASCADE;


--
-- Name: platform_plan_modules platform_plan_modules_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_plan_modules
    ADD CONSTRAINT platform_plan_modules_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.platform_plans(id) ON DELETE CASCADE;


--
-- Name: platform_plan_prices platform_plan_prices_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_plan_prices
    ADD CONSTRAINT platform_plan_prices_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.platform_plans(id) ON DELETE CASCADE;


--
-- Name: rbac_group_permissions rbac_group_permissions_actionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_group_permissions
    ADD CONSTRAINT "rbac_group_permissions_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES public.rbac_actions(id) ON DELETE CASCADE;


--
-- Name: rbac_group_permissions rbac_group_permissions_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_group_permissions
    ADD CONSTRAINT "rbac_group_permissions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public.rbac_groups(id) ON DELETE CASCADE;


--
-- Name: rbac_group_permissions rbac_group_permissions_pageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_group_permissions
    ADD CONSTRAINT "rbac_group_permissions_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES public.rbac_pages(id) ON DELETE CASCADE;


--
-- Name: rbac_groups rbac_groups_clonedFromId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_groups
    ADD CONSTRAINT "rbac_groups_clonedFromId_fkey" FOREIGN KEY ("clonedFromId") REFERENCES public.rbac_groups(id) ON DELETE SET NULL;


--
-- Name: rbac_groups rbac_groups_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_groups
    ADD CONSTRAINT "rbac_groups_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: rbac_page_actions rbac_page_actions_actionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_page_actions
    ADD CONSTRAINT "rbac_page_actions_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES public.rbac_actions(id) ON DELETE CASCADE;


--
-- Name: rbac_page_actions rbac_page_actions_pageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_page_actions
    ADD CONSTRAINT "rbac_page_actions_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES public.rbac_pages(id) ON DELETE CASCADE;


--
-- Name: rbac_role_permissions rbac_role_permissions_actionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_role_permissions
    ADD CONSTRAINT "rbac_role_permissions_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES public.rbac_actions(id) ON DELETE CASCADE;


--
-- Name: rbac_role_permissions rbac_role_permissions_pageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_role_permissions
    ADD CONSTRAINT "rbac_role_permissions_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES public.rbac_pages(id) ON DELETE CASCADE;


--
-- Name: rbac_role_permissions rbac_role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_role_permissions
    ADD CONSTRAINT "rbac_role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.rbac_roles(id) ON DELETE CASCADE;


--
-- Name: rbac_roles rbac_roles_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_roles
    ADD CONSTRAINT "rbac_roles_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: rbac_user_group_members rbac_user_group_members_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_user_group_members
    ADD CONSTRAINT "rbac_user_group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public.rbac_groups(id) ON DELETE CASCADE;


--
-- Name: rbac_user_group_members rbac_user_group_members_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_user_group_members
    ADD CONSTRAINT "rbac_user_group_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: rbac_user_group_roles rbac_user_group_roles_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_user_group_roles
    ADD CONSTRAINT "rbac_user_group_roles_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public.rbac_groups(id) ON DELETE CASCADE;


--
-- Name: rbac_user_group_roles rbac_user_group_roles_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_user_group_roles
    ADD CONSTRAINT "rbac_user_group_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.rbac_roles(id) ON DELETE CASCADE;


--
-- Name: rbac_user_permission_overrides rbac_user_permission_overrides_actionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_user_permission_overrides
    ADD CONSTRAINT "rbac_user_permission_overrides_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES public.rbac_actions(id) ON DELETE CASCADE;


--
-- Name: rbac_user_permission_overrides rbac_user_permission_overrides_pageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_user_permission_overrides
    ADD CONSTRAINT "rbac_user_permission_overrides_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES public.rbac_pages(id) ON DELETE CASCADE;


--
-- Name: rbac_user_permission_overrides rbac_user_permission_overrides_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rbac_user_permission_overrides
    ADD CONSTRAINT "rbac_user_permission_overrides_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: school_landing_pages school_landing_pages_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_landing_pages
    ADD CONSTRAINT school_landing_pages_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: school_modules school_modules_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_modules
    ADD CONSTRAINT school_modules_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.platform_modules(id) ON DELETE CASCADE;


--
-- Name: school_modules school_modules_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_modules
    ADD CONSTRAINT school_modules_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: school_platform_subscription_addons school_platform_subscription_addons_addon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_platform_subscription_addons
    ADD CONSTRAINT school_platform_subscription_addons_addon_id_fkey FOREIGN KEY (addon_id) REFERENCES public.platform_addons(id) ON DELETE CASCADE;


--
-- Name: school_platform_subscription_addons school_platform_subscription_addons_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_platform_subscription_addons
    ADD CONSTRAINT school_platform_subscription_addons_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.school_platform_subscriptions(id) ON DELETE CASCADE;


--
-- Name: school_platform_subscriptions school_platform_subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_platform_subscriptions
    ADD CONSTRAINT school_platform_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.platform_plans(id) ON DELETE RESTRICT;


--
-- Name: school_platform_subscriptions school_platform_subscriptions_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_platform_subscriptions
    ADD CONSTRAINT school_platform_subscriptions_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: session_media session_media_session_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_media
    ADD CONSTRAINT session_media_session_plan_id_fkey FOREIGN KEY (session_plan_id) REFERENCES public.weekly_session_plans(id) ON DELETE CASCADE;


--
-- Name: session_media session_media_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_media
    ADD CONSTRAINT session_media_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict 03ebwegav5A2lhkOipI0pJsSAhGhT3JNmaSCV00YsiylDu8kqQchHEYWz0Veoec


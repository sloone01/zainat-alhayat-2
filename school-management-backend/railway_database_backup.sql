--
-- PostgreSQL database dump
--

\restrict r1KdYmbiNLG1hToXSGOc74y5Kcni2u9lyUUFfG0YufH4X99XanTMWiplfSuGtBY

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
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: courses_status_enum; Type: TYPE; Schema: public; Owner: school_admin
--

CREATE TYPE public.courses_status_enum AS ENUM (
    'draft',
    'active',
    'published',
    'inactive',
    'archived'
);


ALTER TYPE public.courses_status_enum OWNER TO school_admin;

--
-- Name: groups_status_enum; Type: TYPE; Schema: public; Owner: school_admin
--

CREATE TYPE public.groups_status_enum AS ENUM (
    'active',
    'inactive',
    'full'
);


ALTER TYPE public.groups_status_enum OWNER TO school_admin;

--
-- Name: students_gender_enum; Type: TYPE; Schema: public; Owner: school_admin
--

CREATE TYPE public.students_gender_enum AS ENUM (
    'male',
    'female'
);


ALTER TYPE public.students_gender_enum OWNER TO school_admin;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: school_admin
--

CREATE TYPE public.users_role_enum AS ENUM (
    'admin',
    'teacher',
    'student',
    'parent'
);


ALTER TYPE public.users_role_enum OWNER TO school_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: academic_years; Type: TABLE; Schema: public; Owner: school_admin
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


ALTER TABLE public.academic_years OWNER TO school_admin;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: school_admin
--

CREATE TABLE public.activities (
    id integer NOT NULL,
    student_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    data jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.activities OWNER TO school_admin;

--
-- Name: activities_id_seq; Type: SEQUENCE; Schema: public; Owner: school_admin
--

CREATE SEQUENCE public.activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activities_id_seq OWNER TO school_admin;

--
-- Name: activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: school_admin
--

ALTER SEQUENCE public.activities_id_seq OWNED BY public.activities.id;


--
-- Name: attendances; Type: TABLE; Schema: public; Owner: school_admin
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


ALTER TABLE public.attendances OWNER TO school_admin;

--
-- Name: attendances_id_seq; Type: SEQUENCE; Schema: public; Owner: school_admin
--

CREATE SEQUENCE public.attendances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.attendances_id_seq OWNER TO school_admin;

--
-- Name: attendances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: school_admin
--

ALTER SEQUENCE public.attendances_id_seq OWNED BY public.attendances.id;


--
-- Name: class_settings; Type: TABLE; Schema: public; Owner: school_admin
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


ALTER TABLE public.class_settings OWNER TO school_admin;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: school_admin
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
    "maxStudents" integer
);


ALTER TABLE public.courses OWNER TO school_admin;

--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: school_admin
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


ALTER TABLE public.enrollments OWNER TO school_admin;

--
-- Name: groups; Type: TABLE; Schema: public; Owner: school_admin
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
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.groups OWNER TO school_admin;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: school_admin
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO school_admin;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: school_admin
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO school_admin;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: school_admin
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: milestones; Type: TABLE; Schema: public; Owner: school_admin
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


ALTER TABLE public.milestones OWNER TO school_admin;

--
-- Name: parents; Type: TABLE; Schema: public; Owner: school_admin
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


ALTER TABLE public.parents OWNER TO school_admin;

--
-- Name: COLUMN parents.user_id; Type: COMMENT; Schema: public; Owner: school_admin
--

COMMENT ON COLUMN public.parents.user_id IS 'UUID reference to users table for parent login';


--
-- Name: parents_id_seq; Type: SEQUENCE; Schema: public; Owner: school_admin
--

CREATE SEQUENCE public.parents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.parents_id_seq OWNER TO school_admin;

--
-- Name: parents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: school_admin
--

ALTER SEQUENCE public.parents_id_seq OWNED BY public.parents.id;


--
-- Name: phases; Type: TABLE; Schema: public; Owner: school_admin
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


ALTER TABLE public.phases OWNER TO school_admin;

--
-- Name: reminders; Type: TABLE; Schema: public; Owner: school_admin
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


ALTER TABLE public.reminders OWNER TO school_admin;

--
-- Name: reminders_id_seq; Type: SEQUENCE; Schema: public; Owner: school_admin
--

CREATE SEQUENCE public.reminders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reminders_id_seq OWNER TO school_admin;

--
-- Name: reminders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: school_admin
--

ALTER SEQUENCE public.reminders_id_seq OWNED BY public.reminders.id;


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: school_admin
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


ALTER TABLE public.rooms OWNER TO school_admin;

--
-- Name: rooms_id_seq; Type: SEQUENCE; Schema: public; Owner: school_admin
--

CREATE SEQUENCE public.rooms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rooms_id_seq OWNER TO school_admin;

--
-- Name: rooms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: school_admin
--

ALTER SEQUENCE public.rooms_id_seq OWNED BY public.rooms.id;


--
-- Name: schedules; Type: TABLE; Schema: public; Owner: school_admin
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


ALTER TABLE public.schedules OWNER TO school_admin;

--
-- Name: schools; Type: TABLE; Schema: public; Owner: school_admin
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
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.schools OWNER TO school_admin;

--
-- Name: schools_id_seq; Type: SEQUENCE; Schema: public; Owner: school_admin
--

CREATE SEQUENCE public.schools_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.schools_id_seq OWNER TO school_admin;

--
-- Name: schools_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: school_admin
--

ALTER SEQUENCE public.schools_id_seq OWNED BY public.schools.id;


--
-- Name: semesters; Type: TABLE; Schema: public; Owner: school_admin
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


ALTER TABLE public.semesters OWNER TO school_admin;

--
-- Name: session_media; Type: TABLE; Schema: public; Owner: school_admin
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


ALTER TABLE public.session_media OWNER TO school_admin;

--
-- Name: session_media_id_seq; Type: SEQUENCE; Schema: public; Owner: school_admin
--

CREATE SEQUENCE public.session_media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.session_media_id_seq OWNER TO school_admin;

--
-- Name: session_media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: school_admin
--

ALTER SEQUENCE public.session_media_id_seq OWNED BY public.session_media.id;


--
-- Name: staff; Type: TABLE; Schema: public; Owner: school_admin
--

CREATE TABLE public.staff (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    school_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.staff OWNER TO school_admin;

--
-- Name: staff_id_seq; Type: SEQUENCE; Schema: public; Owner: school_admin
--

CREATE SEQUENCE public.staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.staff_id_seq OWNER TO school_admin;

--
-- Name: staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: school_admin
--

ALTER SEQUENCE public.staff_id_seq OWNED BY public.staff.id;


--
-- Name: student_groups; Type: TABLE; Schema: public; Owner: school_admin
--

CREATE TABLE public.student_groups (
    student_id uuid NOT NULL,
    group_id uuid NOT NULL
);


ALTER TABLE public.student_groups OWNER TO school_admin;

--
-- Name: student_parents; Type: TABLE; Schema: public; Owner: school_admin
--

CREATE TABLE public.student_parents (
    student_id uuid NOT NULL,
    parent_id integer NOT NULL
);


ALTER TABLE public.student_parents OWNER TO school_admin;

--
-- Name: student_progress; Type: TABLE; Schema: public; Owner: school_admin
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


ALTER TABLE public.student_progress OWNER TO school_admin;

--
-- Name: student_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: school_admin
--

CREATE SEQUENCE public.student_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.student_progress_id_seq OWNER TO school_admin;

--
-- Name: student_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: school_admin
--

ALTER SEQUENCE public.student_progress_id_seq OWNED BY public.student_progress.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: school_admin
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
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.students OWNER TO school_admin;

--
-- Name: users; Type: TABLE; Schema: public; Owner: school_admin
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
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO school_admin;

--
-- Name: weekly_session_plans; Type: TABLE; Schema: public; Owner: school_admin
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


ALTER TABLE public.weekly_session_plans OWNER TO school_admin;

--
-- Name: activities id; Type: DEFAULT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.activities ALTER COLUMN id SET DEFAULT nextval('public.activities_id_seq'::regclass);


--
-- Name: attendances id; Type: DEFAULT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.attendances ALTER COLUMN id SET DEFAULT nextval('public.attendances_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: parents id; Type: DEFAULT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.parents ALTER COLUMN id SET DEFAULT nextval('public.parents_id_seq'::regclass);


--
-- Name: reminders id; Type: DEFAULT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.reminders ALTER COLUMN id SET DEFAULT nextval('public.reminders_id_seq'::regclass);


--
-- Name: rooms id; Type: DEFAULT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.rooms ALTER COLUMN id SET DEFAULT nextval('public.rooms_id_seq'::regclass);


--
-- Name: schools id; Type: DEFAULT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.schools ALTER COLUMN id SET DEFAULT nextval('public.schools_id_seq'::regclass);


--
-- Name: session_media id; Type: DEFAULT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.session_media ALTER COLUMN id SET DEFAULT nextval('public.session_media_id_seq'::regclass);


--
-- Name: staff id; Type: DEFAULT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.staff ALTER COLUMN id SET DEFAULT nextval('public.staff_id_seq'::regclass);


--
-- Name: student_progress id; Type: DEFAULT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.student_progress ALTER COLUMN id SET DEFAULT nextval('public.student_progress_id_seq'::regclass);


--
-- Data for Name: academic_years; Type: TABLE DATA; Schema: public; Owner: school_admin
--

COPY public.academic_years (id, year, start_date, end_date, is_active, school_id, description, created_at, updated_at) FROM stdin;
3ba07103-ccb1-4cc6-924b-a41847115a8d	2025-2026	2025-09-01	2026-06-30	t	1	Current Academic Year	2025-10-27 22:32:01.377689	2025-10-27 22:32:01.377689
fb7888ee-191e-4f30-88dd-a6feca27065a	2024-2025	2024-09-01	2025-06-30	f	1	Previous Academic Year	2025-10-27 22:32:01.379683	2025-10-27 22:32:01.379683
\.


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: school_admin
--

COPY public.activities (id, student_id, type, data, created_at) FROM stdin;
\.


--
-- Data for Name: attendances; Type: TABLE DATA; Schema: public; Owner: school_admin
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
\.


--
-- Data for Name: class_settings; Type: TABLE DATA; Schema: public; Owner: school_admin
--

COPY public.class_settings (id, setting_type, name, duration_minutes, time_value, is_default, is_active, color, description, order_index, additional_settings, school_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: school_admin
--

COPY public.courses (id, name, title, category, status, description, age_group_min, age_group_max, is_active, color_code, icon, send_notifications, estimated_duration_weeks, learning_objectives, prerequisites, materials_needed, school_id, academic_year_id, created_at, updated_at, "totalDuration", "createdDate", "lastModified", "targetAgeGroup", "difficultyLevel", "maxStudents") FROM stdin;
ba36f22d-3ed1-4f61-b2e4-069172c82db9	gwerg	\N	\N	draft	rwegewrg	\N	\N	t	\N	\N	t	\N	\N	\N	\N	1	3ba07103-ccb1-4cc6-924b-a41847115a8d	2025-11-15 21:26:08.459262	2025-11-15 21:26:08.459262	\N	\N	\N	\N	\N	\N
d9fa2c8b-8d28-4668-bfd2-2773aba38fc3	تطوير اللغة العربية	\N	\N	draft	منهج شامل لتطوير مهارات اللغة العربية للأطفال في سن الروضة، يشمل القراءة والكتابة والمحادثة	4	6	t	\N	\N	t	\N	\N	\N	\N	1	3ba07103-ccb1-4cc6-924b-a41847115a8d	2025-11-21 10:57:46.661382	2025-11-21 10:57:46.661382	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: school_admin
--

COPY public.enrollments (id, "fullName", tribe, "idNumber", gender, nationality, religion, "dateOfBirth", age, "hasSiblings", photo, "enrollmentStatus", "gradeLevel", "previousSchool", allergies, "allergiesDetails", seizures, "seizuresDetails", surgeries, "surgeriesDetails", "chronicDiseases", "chronicDiseasesDetails", "otherHealthInfo", "medicalReports", "guardianType", "fatherFullName", "fatherTribe", "fatherWorkplace", "fatherWorkPhone", "fatherMobile", "fatherEmail", "fatherMaritalStatus", "motherFullName", "motherTribe", "motherWorkplace", "motherWorkPhone", "motherMobile", "motherEmail", "motherMaritalStatus", "organizationName", "organizationPhone", "responsiblePerson", "responsiblePhone", "emergencyContactName", "emergencyContactTribe", "emergencyContactWorkplace", "emergencyContactWorkPhone", "emergencyContactMobile", "emergencyContactRelationship", area, village, landmark, "streetNumber", "alleyNumber", "buildingNumber", "housingType", status, notes, "studentId", "parentId", "createdAt", "updatedAt") FROM stdin;
d6b14a00-6b02-479c-b66d-1d5c2f801d89	أحمد محمد علي	\N	\N	male	\N	\N	\N	4	t	\N	new	KG1	\N	f	\N	f	\N	f	\N	f	\N	\N	\N	father	محمد علي أحمد	\N	\N	\N	99123456	mohamed.ali@example.com	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	الخوير	\N	\N	\N	\N	\N	house	pending	\N	\N	\N	2026-01-16 00:21:49.777973	2026-01-16 00:21:49.777973
361b25b1-74e3-435a-a856-0bab928e7c63	سارة أحمد محمد	البلوشي	12345678	female	عماني	الإسلام	\N	4	t	\N	new	KG1	\N	t	حساسية من الفول السوداني	f	\N	f	\N	f	\N	الطفل بحالة صحية جيدة بشكل عام	\N	father	أحمد محمد علي البلوشي	البلوشي	وزارة الصحة	+968 24123456	+968 99123456	ahmed.mohamed@gmail.com	متزوج	فاطمة سالم أحمد	المعشني	وزارة التربية والتعليم	+968 24987654	+968 99987654	fatima.salem@gmail.com	متزوجة	\N	\N	\N	\N	سالم أحمد محمد	البلوشي	شركة تنمية نفط عمان	+968 24555666	+968 99555666	العم	الخوير	الخوير الأولى	بجوار مسجد الإمام	123	45	67	house	pending	\N	\N	\N	2026-01-16 00:24:26.91877	2026-01-16 00:24:26.91877
49d6b197-48ee-4893-a8c0-60e002b74efb	يوسف عبدالله سليم	الحراصي	55667788	male	عماني	الإسلام	\N	3	f	\N	transfer	Nursery	روضة النور	f	\N	f	\N	f	\N	t	الربو البسيط - يحتاج بخاخ احتياطي	يتابع مع طبيب الأطفال بانتظام	\N	mother	عبدالله سليم الحراصي	الحراصي	بنك مسقط	\N	+968 99777888	abdullah.harasi@bankmuscat.com	\N	أسماء محمد الغافري	الغافري	مؤسسة البريد العماني	\N	+968 99666777	asma.ghafri@omanpost.om	\N	\N	\N	\N	\N	محمد سليم الحراصي	\N	\N	\N	+968 99444555	الخال	الموالح	الموالح الجنوبي	خلف مسجد الإمام الشافعي	456	\N	\N	house	pending	\N	\N	\N	2026-01-16 00:25:38.413723	2026-01-16 00:25:38.413723
2e5611e3-cc99-4cd4-a9d8-a7d0582ae39f	سارة أحمد محمد الزدجالية	الزدجالي	87654321	female	عماني	الإسلام	\N	5	f	\N	new	KG2	\N	f	\N	f	\N	t	عملية اللوزتين في عام 2023	f	\N	حالة صحية ممتازة	\N	father	أحمد محمد الزدجالي	الزدجالي	شركة النفط العمانية	+968 24111222	+968 99111222	ahmed.alzadjali@gmail.com	متزوج	خديجة سليم المقبالي	المقبالي	مستشفى السلطان قابوس	+968 24333444	+968 99333444	khadija.almaqbali@gmail.com	متزوجة	\N	\N	\N	\N	محمد أحمد الزدجالي	الزدجالي	جامعة السلطان قابوس	+968 24555777	+968 99555777	الجد	القرم	القرم الشرقي	قرب مجمع القرم التجاري	789	12	34	apartment	pending	\N	\N	\N	2026-01-16 00:25:54.44851	2026-01-16 00:25:54.44851
94315b03-9f15-4cc9-8c9f-12eeb755c87e	Test Student	\N	\N	male	عماني	\N	\N	5	f	\N	new	\N	\N	f	\N	f	\N	f	\N	f	\N	\N	\N	father	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	house	pending	\N	\N	\N	2026-01-20 20:26:41.559406	2026-01-20 20:26:41.559406
12d64049-abe1-41eb-b976-caaa8766e125	Test Student	\N	\N	male	عماني	\N	\N	5	f	\N	new	\N	\N	f	\N	f	\N	f	\N	f	\N	\N	\N	father	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	house	pending	\N	\N	\N	2026-01-20 20:27:11.41312	2026-01-20 20:27:11.41312
96d275d4-70d5-46c9-8a93-8d20df075b7e	محمد سعيد راشد الغافري	الغافري	12345678	male	عماني	مسلم	\N	7	t	\N	new	الروضة الأولى		t	حساسية من الفول السوداني	f		f		f		لا توجد معلومات طبية أخرى	[]	father	سعيد راشد الغافري	الغافري	وزارة التربية والتعليم	24567890	96512345	saeed.alghafri@gmail.com	متزوج	عائشة محمد البوسعيدي	البوسعيدي	ربة منزل		96587654	aisha.albusaidi@gmail.com	متزوجة	دار الرعاية الاجتماعية	24888999	خديجة سالم الهنائي	96599888	مريم أحمد الغافري	الغافري	مستشفى السلطان قابوس	24445555	96598765	عمة	مسقط	الخوير	بجانب مسجد الإمام	123	4	12	house	pending	\N	\N	\N	2026-01-20 20:29:32.900452	2026-01-20 20:29:32.900452
0b5d1255-c47e-4e44-9b45-74b4ed5541a7	Test Student	\N	\N	male	عماني	\N	2018-05-15	5	f	\N	new	\N	\N	f	\N	f	\N	f	\N	f	\N	\N	\N	father	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	house	pending	\N	\N	\N	2026-01-20 20:37:26.451087	2026-01-20 20:37:26.451087
330942be-cb7b-43aa-b2ec-735cf3ef13b1	محمد سعيد راشد الغافري	الغافري	12345678	male	عماني	مسلم	2018-05-15	7	t	\N	new	kg2		t	حساسية من الفول السوداني	f		f		f		لا توجد معلومات طبية أخرى	[]	father	سعيد راشد الغافري	الغافري	وزارة التربية والتعليم	24567890	96512345	saeed.alghafri@gmail.com	متزوج	عائشة محمد البوسعيدي	البوسعيدي	ربة منزل		96587654	aisha.albusaidi@gmail.com	متزوجة	دار الرعاية الاجتماعية	24888999	خديجة سالم الهنائي	96599888	مريم أحمد الغافري	الغافري	مستشفى السلطان قابوس	24445555	96598765	عمة	مسقط	الخوير	بجانب مسجد الإمام	123	4	12	house	pending	\N	\N	\N	2026-01-20 20:38:32.663518	2026-01-20 20:38:32.663518
857b48aa-2a11-46ce-bb3d-5c632376c42c	خالد سعيد احمد	الغافري	12345678	male	عماني	مسلم	2018-05-15	7	t	\N	new	kg1		t	حساسية من الفول السوداني	t		t	عملية اللوزتين	t		لا توجد معلومات طبية أخرى	[]	father	سعيد راشد الغافري	الغافري	وزارة التربية والتعليم	24567890	96512345	saeed.alghafri@gmail.com	متزوج	عائشة محمد البوسعيدي	البوسعيدي	ربة منزل		96587654	aisha.albusaidi@gmail.com	متزوجة	دار الرعاية الاجتماعية	24888999	خديجة سالم الهنائي	96599888	مريم أحمد الغافري	الغافري	مستشفى السلطان قابوس	24445555	96598765	عمة	مسقط	الخوير	بجانب مسجد الإمام	123	4	12	house	pending	\N	\N	\N	2026-01-20 20:44:06.354356	2026-01-20 21:07:46.669722
df37a63b-f1ff-418c-97f7-d8351d3c179b	محمد سعيد راشد الغافري	الغافري	12345678	male	عماني	مسلم	2018-05-15	7	t	\N	new	kg1		t	حساسية من الفول السوداني	f		t	عملية اللوزتين	f		لا توجد معلومات طبية أخرى	[]	father	سعيد راشد الغافري	الغافري	وزارة التربية والتعليم	24567890	96512345	saeed.alghafri@gmail.com	متزوج	عائشة محمد البوسعيدي	البوسعيدي	ربة منزل		96587654	aisha.albusaidi@gmail.com	متزوجة	دار الرعاية الاجتماعية	24888999	خديجة سالم الهنائي	96599888	مريم أحمد الغافري	الغافري	مستشفى السلطان قابوس	24445555	96598765	عمة	مسقط	الخوير	بجانب مسجد الإمام	123	4	12	house	pending	\N	\N	\N	2026-01-20 21:17:20.044841	2026-01-20 21:17:20.044841
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: school_admin
--

COPY public.groups (id, name, description, age_range_min, age_range_max, capacity, is_active, color, status, "studentCount", "teacherCount", school_id, room_id, academic_year_id, created_at, updated_at) FROM stdin;
efe57fcd-e10d-489f-a79a-3d6b50535bdc	الزهراء السقطرية	Preparatory - Supervised by موزة	2	4	25	t	\N	active	21	1	1	\N	fb7888ee-191e-4f30-88dd-a6feca27065a	2025-11-01 13:05:07.055787	2025-11-01 13:05:09.995535
198ff890-0654-4f21-b056-8ba3ec22e687	ابن الذهبي	Preparatory - Supervised by حميدة	2	4	25	t	\N	active	21	1	1	\N	fb7888ee-191e-4f30-88dd-a6feca27065a	2025-11-01 13:05:13.067017	2025-11-01 13:05:16.012773
fc4ec62f-e19a-4443-8e44-18173552ac07	الفراهيدي	Kindergarten - Supervised by شمسة	4	6	25	t	\N	active	21	1	1	\N	fb7888ee-191e-4f30-88dd-a6feca27065a	2025-11-01 13:05:18.137191	2025-11-01 13:05:20.708593
b892f8b1-43f5-4cc0-9082-56a932ce7c4a	جابر بن زيد	Kindergarten - Supervised by هاجر	4	6	25	t	\N	active	20	1	1	\N	fb7888ee-191e-4f30-88dd-a6feca27065a	2025-11-01 13:05:23.552593	2025-11-01 13:05:25.6168
f3815444-5a11-479b-bd1f-a109adf8131e	البحار أحمد بن ماجد	Preparatory - Supervised by زيانة	2	4	25	t	\N	active	21	1	1	\N	fb7888ee-191e-4f30-88dd-a6feca27065a	2025-11-01 13:05:10.066391	2025-11-01 13:05:12.994957
8475490d-e2b4-4d47-8425-6d93605140c1	عائشة الريامية	Preparatory - Supervised by نسيبة	2	4	25	t	\N	active	15	1	1	\N	fb7888ee-191e-4f30-88dd-a6feca27065a	2025-11-01 13:05:16.08357	2025-11-01 13:05:18.067012
ab75b0b1-3a5e-4360-9f63-2bcd0b1fd3cf	هند بنت المهلب	Kindergarten - Supervised by أريام	4	6	25	t	\N	active	20	1	1	\N	fb7888ee-191e-4f30-88dd-a6feca27065a	2025-11-01 13:05:20.783746	2025-11-01 13:05:23.482284
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: school_admin
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
\.


--
-- Data for Name: milestones; Type: TABLE DATA; Schema: public; Owner: school_admin
--

COPY public.milestones (id, name, description, order_index, is_required, points, phase_id, title, type, target_week, weight, difficulty_level, estimated_duration_minutes, required_resources, allow_late_submission, enable_peer_review, created_at, updated_at) FROM stdin;
de474214-b337-48f4-b320-e2df2be47630	معلم 1.1	معلم مهم يجب تحقيقه في المرحلة التأسيسية	1	t	10	f6765abf-9dd6-4b8d-b0fa-e04fe24ffd4d	إنجاز أساسي في المرحلة التأسيسية	assessment	\N	\N	\N	\N	\N	f	f	2025-11-21 10:57:46.697023	2025-11-21 10:57:46.697023
1f3b1ceb-c5f3-495d-bf9a-fecba51e5d85	معلم 1.2	معلم متقدم في المرحلة التأسيسية	2	f	15	f6765abf-9dd6-4b8d-b0fa-e04fe24ffd4d	إنجاز متقدم في المرحلة التأسيسية	project	\N	\N	\N	\N	\N	f	f	2025-11-21 10:57:46.70391	2025-11-21 10:57:46.70391
762a0fee-db64-4564-ae9f-ccb40bf276fd	معلم 2.1	معلم مهم يجب تحقيقه في مرحلة التطبيق	1	t	10	f52e7268-f920-4161-9f4c-324c9fdc27e2	إنجاز أساسي في مرحلة التطبيق	assessment	\N	\N	\N	\N	\N	f	f	2025-11-21 10:57:46.720357	2025-11-21 10:57:46.720357
fe388a88-a00c-4de2-aa92-c14e83778879	معلم 2.2	معلم متقدم في مرحلة التطبيق	2	f	15	f52e7268-f920-4161-9f4c-324c9fdc27e2	إنجاز متقدم في مرحلة التطبيق	project	\N	\N	\N	\N	\N	f	f	2025-11-21 10:57:46.725966	2025-11-21 10:57:46.725966
7b40e780-a8cb-46e5-b99b-5a99c95a5429	معلم 3.1	معلم مهم يجب تحقيقه في مرحلة الإتقان	1	t	10	2a9bd401-6974-4d7c-9c61-c58504b22d8d	إنجاز أساسي في مرحلة الإتقان	assessment	\N	\N	\N	\N	\N	f	f	2025-11-21 10:57:46.743605	2025-11-21 10:57:46.743605
45a24a05-50ce-4a4a-9bcb-b5df1568395e	معلم 3.2	معلم متقدم في مرحلة الإتقان	2	f	15	2a9bd401-6974-4d7c-9c61-c58504b22d8d	إنجاز متقدم في مرحلة الإتقان	project	\N	\N	\N	\N	\N	f	f	2025-11-21 10:57:46.752825	2025-11-21 10:57:46.752825
\.


--
-- Data for Name: parents; Type: TABLE DATA; Schema: public; Owner: school_admin
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
-- Data for Name: phases; Type: TABLE DATA; Schema: public; Owner: school_admin
--

COPY public.phases (id, name, description, order_index, estimated_duration_days, is_active, course_id, created_at, updated_at) FROM stdin;
328067b4-be04-4fb0-9628-fa38df5cdc54	46345	4563456	1	\N	t	ba36f22d-3ed1-4f61-b2e4-069172c82db9	2025-11-15 21:26:08.487334	2025-11-15 21:26:08.487334
f6765abf-9dd6-4b8d-b0fa-e04fe24ffd4d	المرحلة التأسيسية	تعلم الحروف الأساسية والأصوات	1	\N	t	d9fa2c8b-8d28-4668-bfd2-2773aba38fc3	2025-11-21 10:57:46.689956	2025-11-21 10:57:46.689956
f52e7268-f920-4161-9f4c-324c9fdc27e2	مرحلة التطبيق	تطبيق المهارات المكتسبة في تكوين الكلمات	2	\N	t	d9fa2c8b-8d28-4668-bfd2-2773aba38fc3	2025-11-21 10:57:46.712633	2025-11-21 10:57:46.712633
2a9bd401-6974-4d7c-9c61-c58504b22d8d	مرحلة الإتقان	إتقان القراءة والكتابة البسيطة	3	\N	t	d9fa2c8b-8d28-4668-bfd2-2773aba38fc3	2025-11-21 10:57:46.731996	2025-11-21 10:57:46.731996
\.


--
-- Data for Name: reminders; Type: TABLE DATA; Schema: public; Owner: school_admin
--

COPY public.reminders (id, user_id, title, description, due_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: school_admin
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
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: school_admin
--

COPY public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, teacher_id, room_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: schools; Type: TABLE DATA; Schema: public; Owner: school_admin
--

COPY public.schools (id, name, address, phone, email, website, logo_url, established_date, description, created_at, updated_at) FROM stdin;
1	Zinat Al-Haya Kindergarten	\N	\N	\N	\N	\N	\N	Bilingual kindergarten school management system	2025-10-19 21:08:56.586817	2025-10-19 21:08:56.586817
\.


--
-- Data for Name: semesters; Type: TABLE DATA; Schema: public; Owner: school_admin
--

COPY public.semesters (id, title, start_date, end_date, academic_year_id, description, is_active, created_at, updated_at) FROM stdin;
65cd33c6-e288-4858-b9ad-9858c8ca02f2	First Semester	2025-09-01	2026-01-15	3ba07103-ccb1-4cc6-924b-a41847115a8d	Fall semester focusing on foundational skills	t	2025-10-27 22:32:01.38361	2025-10-27 22:32:01.38361
a4b1719a-f0e5-43b6-89c5-544c0bdac1f6	Second Semester	2026-01-16	2026-06-30	3ba07103-ccb1-4cc6-924b-a41847115a8d	Spring semester with advanced learning activities	f	2025-10-27 22:32:01.387334	2025-10-27 22:32:01.387334
27f7ebbe-274e-4031-ac26-41fdb1e851bf	First Semester	2024-09-01	2025-01-31	fb7888ee-191e-4f30-88dd-a6feca27065a	\N	t	2025-11-01 12:46:08.271294	2025-11-01 12:46:08.271294
54734245-6bf5-4739-abd8-c741642b27b2	Second Semester	2025-02-01	2025-06-30	fb7888ee-191e-4f30-88dd-a6feca27065a	\N	t	2025-11-01 12:46:08.29811	2025-11-01 12:46:08.29811
\.


--
-- Data for Name: session_media; Type: TABLE DATA; Schema: public; Owner: school_admin
--

COPY public.session_media (id, session_plan_id, file_name, file_path, file_type, file_size, mime_type, uploaded_by, uploaded_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: school_admin
--

COPY public.staff (id, user_id, school_id, created_at, updated_at) FROM stdin;
1	0f851929-30b0-4b1c-8f64-779bd03dae03	1	2025-11-14 10:00:47.462743	2025-11-14 10:00:47.462743
\.


--
-- Data for Name: student_groups; Type: TABLE DATA; Schema: public; Owner: school_admin
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
-- Data for Name: student_parents; Type: TABLE DATA; Schema: public; Owner: school_admin
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
-- Data for Name: student_progress; Type: TABLE DATA; Schema: public; Owner: school_admin
--

COPY public.student_progress (id, status, score, points_earned, teacher_notes, student_notes, started_date, completed_date, due_date, is_late_submission, attempts_count, feedback, attachments, student_id, course_id, milestone_id, updated_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: school_admin
--

COPY public.students (id, "firstName", "lastName", "dateOfBirth", gender, address, phone, email, "emergencyContact", "medicalInfo", notes, "secondName", "thirdName", nationality, "studentId", photo, "createdAt", "updatedAt", user_id, school_id, room_id, first_name, family_name, date_of_birth, medical_conditions, allergies, emergency_contact, group_id, created_at, updated_at) FROM stdin;
6f28a8bf-0035-459b-90f5-47a45d52bc1e	درر	المسكرية	2020-11-01	female	علاية	\N	\N	94811096	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:07.058765	2025-11-01 13:05:07.058765	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:07.058765	2025-11-01 13:05:07.058765
ab3e3706-5b1d-4e9f-a4b2-4f435e7f8067	صالح	المسكري	2020-10-13	male	اليحمدي	\N	\N	96173736	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:07.209418	2025-11-01 13:05:07.209418	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:07.209418	2025-11-01 13:05:07.209418
273933e4-0027-4a0a-8fd3-eb29449897fc	روان	العويدي	2020-08-24	female	الشخابيط	\N	\N	95464181	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:07.35692	2025-11-01 13:05:07.35692	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:07.35692	2025-11-01 13:05:07.35692
1f9ddabb-62de-4485-a1c9-c3f2a445bddd	ضياء	المسكرية	2020-04-27	female	اليحمدي	\N	\N	95932973	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:07.432934	2025-11-01 13:05:07.432934	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:07.432934	2025-11-01 13:05:07.432934
fdd4c303-ea1d-4a8d-bf18-172f6f408e74	سعيد	الحارثي	2020-08-24	male	سيح العافية	\N	\N	98885014	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:07.579718	2025-11-01 13:05:07.579718	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:07.579718	2025-11-01 13:05:07.579718
9cc2ae8c-60c5-4bc8-b5c2-2b881c182bd1	صفاء	المسكرية	2020-05-10	female	علاية السيح الجديد	\N	\N	95145009	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:07.727782	2025-11-01 13:05:07.727782	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:07.727782	2025-11-01 13:05:07.727782
9fec0ef1-5280-4ab7-bb2d-4d4099fef70b	ناصر	الرحبي	2020-04-05	male	اليحمدي	\N	\N	98877226	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:07.876096	2025-11-01 13:05:07.876096	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:07.876096	2025-11-01 13:05:07.876096
d6683690-f47a-4c87-bfff-494e0955c2ac	بدر	الرحبي	2020-08-03	male	مصرون	\N	\N	94622794	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:08.023791	2025-11-01 13:05:08.023791	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:08.023791	2025-11-01 13:05:08.023791
8d5a3b08-eff9-49ef-9725-23bcf4ae91e8	رؤى	الحارثية	2020-05-14	female	القابل \\ عز	\N	\N	96933177	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:08.169283	2025-11-01 13:05:08.169283	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:08.169283	2025-11-01 13:05:08.169283
f9b40636-6be2-49cf-86b1-1c912183b399	حسينة	السعدية	2020-04-01	female	وادي نام\\ النبأ	\N	\N	79070704	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:08.315739	2025-11-01 13:05:08.315739	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:08.315739	2025-11-01 13:05:08.315739
d8dabcc8-0225-4331-882e-e21e3a27111d	غيم	اليزيدية	2020-07-25	female	الثابتي	\N	\N	97291529	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:08.461905	2025-11-01 13:05:08.461905	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:08.461905	2025-11-01 13:05:08.461905
06c6d5e1-51d3-47fe-80b9-7fec6903a58b	اليزن	الكعبي	2020-07-24	male	وادي نام\\ النبأ	\N	\N	71179339	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:08.609257	2025-11-01 13:05:08.609257	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:08.609257	2025-11-01 13:05:08.609257
b55d86fe-2938-4aba-872c-07d32c0f90d0	ملاك	المسكرية	2020-07-01	female	علاية	\N	\N	95054707	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:08.75341	2025-11-01 13:05:08.75341	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:08.75341	2025-11-01 13:05:08.75341
93924917-415a-41fb-84c6-931b74716d89	سما	المغيرية	2020-07-07	female	اليحمدي	\N	\N	99522564	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:08.900577	2025-11-01 13:05:08.900577	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:08.900577	2025-11-01 13:05:08.900577
5c0ae62c-8be3-4532-b4ae-24e54be47012	رؤى	البراشدية	2020-05-09	female	المنجرد	\N	\N	91200005	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:09.046136	2025-11-01 13:05:09.046136	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:09.046136	2025-11-01 13:05:09.046136
82605502-5a52-4dae-a571-3646385039df	محمد	الحارثي	2020-03-29	male	القلة\\سفالة	\N	\N	92575676	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:09.192027	2025-11-01 13:05:09.192027	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:09.192027	2025-11-01 13:05:09.192027
21c9654d-e11f-41a8-9163-381f573665fb	أحمد	الإسماعيلي	2020-08-17	male	النصيب	\N	\N	97772831	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:09.337498	2025-11-01 13:05:09.337498	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:09.337498	2025-11-01 13:05:09.337498
2560128e-92c2-483a-8aaa-3ec0daec14cd	هيثم	المسكري	2019-11-30	male	النصيب	\N	\N	77265536	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:09.484418	2025-11-01 13:05:09.484418	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:09.484418	2025-11-01 13:05:09.484418
00d19686-927d-410b-b746-23defff4953c	انسام	الاسماعيلية	2020-07-14	female	الحزم	\N	\N	95530331	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:09.631233	2025-11-01 13:05:09.631233	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:09.631233	2025-11-01 13:05:09.631233
f4d8147f-5ace-4bf3-a94c-e90cde759011	الحسن	البرواني	2020-09-11	male	القابل\\الدريز	\N	\N	95056160	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:09.775767	2025-11-01 13:05:09.775767	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:09.775767	2025-11-01 13:05:09.775767
84511774-806e-4cca-8475-d87f752fa0a0	زكريا	الإسماعيلي	2020-02-15	male	الحزم	\N	\N	92909567	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:09.922151	2025-11-01 13:05:09.922151	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:09.922151	2025-11-01 13:05:09.922151
f20c7070-3678-46ba-8dfb-d22c230907fb	عزام	السعدي	2020-06-08	male	النبأ \\ حلة السعديين	\N	\N	96609639	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:10.068607	2025-11-01 13:05:10.068607	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:10.068607	2025-11-01 13:05:10.068607
1a25f905-bddc-4111-8a8e-7c315368d66f	زياد	الطوقي	2020-07-28	male	شخابيط\\سيح العافية	\N	\N	94291888	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:10.21353	2025-11-01 13:05:10.21353	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:10.21353	2025-11-01 13:05:10.21353
d2d06916-e1c6-4082-b675-a0fd0ab6dae2	ماجد	المسكري	2020-05-08	male	الطرق	\N	\N	96252560	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:10.357847	2025-11-01 13:05:10.357847	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:10.357847	2025-11-01 13:05:10.357847
34d84d32-e346-4297-9d8b-5e9af86ac67b	نور	المصلحية	2020-03-04	female	علاية	\N	\N	99252117	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:10.502111	2025-11-01 13:05:10.502111	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:10.502111	2025-11-01 13:05:10.502111
af7ce97b-f4a3-45d4-8e0d-6663b5840a51	بندر	السعدي	2020-05-02	male	النبأ \\ حلة السعديين	\N	\N	99650307	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:10.649691	2025-11-01 13:05:10.649691	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:10.649691	2025-11-01 13:05:10.649691
31c1b475-e8a3-4ad4-9a12-e7efd67d6b48	آية	الحارثية	2019-11-17	female	السفالة	\N	\N	92863313	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:10.725332	2025-11-01 13:05:10.725332	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:10.725332	2025-11-01 13:05:10.725332
fd380b77-5060-47b4-bea8-edc28b2f560b	طارق	اليزيدي	2020-02-20	male	الثابتي	\N	\N	99432661	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:10.871876	2025-11-01 13:05:10.871876	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:10.871876	2025-11-01 13:05:10.871876
798a0783-aec2-4bb4-a505-7e2f20a0b0b2	عهد	المسكرية	2020-11-02	female	اليحمدي	\N	\N	99277523	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:10.947359	2025-11-01 13:05:10.947359	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:10.947359	2025-11-01 13:05:10.947359
8cb5b8aa-4135-4b0a-9d09-ad10ad56b474	الخطاب	المصلحي	2020-01-18	male	اليحمدي	\N	\N	94050440	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:11.093222	2025-11-01 13:05:11.093222	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:11.093222	2025-11-01 13:05:11.093222
5d0b7ad2-721d-4dfb-b9ed-ab7bc21de1da	لين	السعدية	2020-06-21	female	وادي نام \\النبأ	\N	\N	94365977	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:11.238629	2025-11-01 13:05:11.238629	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:11.238629	2025-11-01 13:05:11.238629
447c544a-6465-45e2-82dd-6b72f2368f8b	أجوان	المسكرية	2020-04-16	female	اليحمدي	\N	\N	95177699	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:11.385344	2025-11-01 13:05:11.385344	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:11.385344	2025-11-01 13:05:11.385344
e603f1ee-e980-45f3-81b4-dd49e541cf18	القاسم	الإسماعيلي	2020-08-25	male	النصيب	\N	\N	92996869	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:11.532576	2025-11-01 13:05:11.532576	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:11.532576	2025-11-01 13:05:11.532576
fd481261-2ee1-48c5-883f-589cb0e8ce4c	سلطانة	المسكرية	2020-07-26	female	علاية	\N	\N	78048099	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:11.677761	2025-11-01 13:05:11.677761	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:11.677761	2025-11-01 13:05:11.677761
875145fb-a188-4f61-ae92-01e1e620ef1e	ريما	المسكرية	2019-12-26	female	اليحمدي	\N	\N	91161333	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:11.826081	2025-11-01 13:05:11.826081	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:11.826081	2025-11-01 13:05:11.826081
68a4d177-11c9-4cf5-a25b-fc893111e9fb	جمانة	الحارثية	2020-10-11	female	سيح العافية	\N	\N	96988621	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:11.971833	2025-11-01 13:05:11.971833	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:11.971833	2025-11-01 13:05:11.971833
4f25cf38-e7ce-49e9-8a32-b45ae733a39b	تسنيم	المصلحية	2020-12-24	female	علاية \\السياح	\N	\N	98000822	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:12.116732	2025-11-01 13:05:12.116732	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:12.116732	2025-11-01 13:05:12.116732
eac7f899-2803-4296-8ffc-7267b0b2f6f3	الهنوف	الحارثي	2020-06-19	female	القفيصي	\N	\N	99123363	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:12.263122	2025-11-01 13:05:12.263122	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:12.263122	2025-11-01 13:05:12.263122
8ced0986-1117-4be9-b652-65b7ab004522	سُلطان	اليعرُبي	2020-04-01	male	الثابتي	\N	\N	95441993	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:12.40927	2025-11-01 13:05:12.40927	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:12.40927	2025-11-01 13:05:12.40927
142ce12d-9d92-4aea-842a-56b4bbea309a	سالم	المسكري	2020-12-12	male	اليحمدي	\N	\N	95910310	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:12.557717	2025-11-01 13:05:12.557717	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:12.557717	2025-11-01 13:05:12.557717
2f617295-b6ba-46e6-a983-8f122f9611f6	عبدالله	الغيثي	2020-10-08	male	نقل خاص	\N	\N	91964112	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:12.706586	2025-11-01 13:05:12.706586	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:12.706586	2025-11-01 13:05:12.706586
dd884bc0-6c5d-4d1c-b01d-8aba0edef939	مزن	المسكرية	2020-04-03	female	اليحمدي	\N	\N	95239039	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:12.851022	2025-11-01 13:05:12.851022	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:12.851022	2025-11-01 13:05:12.851022
12f008f5-3c09-427b-99a1-046d01b9aa22	آية	المغيرية	2020-10-19	female	سيح الشخابيط	\N	\N	96010653	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:13.06918	2025-11-01 13:05:13.06918	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:13.06918	2025-11-01 13:05:13.06918
3b44d995-bbe5-409b-99c8-cf56c6572329	شبيب	الغنيمي	2020-09-06	male	وادي نام \\النبأ	\N	\N	98532380	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:13.213712	2025-11-01 13:05:13.213712	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:13.213712	2025-11-01 13:05:13.213712
620da0bb-316d-412a-985b-0d59da373767	أنس	السعدي	2020-03-07	male	الشخابيط	\N	\N	95611424	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:13.359249	2025-11-01 13:05:13.359249	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:13.359249	2025-11-01 13:05:13.359249
1bac2363-ee0c-448f-840e-c7cbcf69e51a	الآء	الأبروية	2020-11-21	female	القفيصي	\N	\N	98888208	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:13.433954	2025-11-01 13:05:13.433954	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:13.433954	2025-11-01 13:05:13.433954
f2e6f1a8-0b53-4854-9907-5154094f501f	سيف	الغنيمي	2020-02-10	male	وادي نام \\النبأ	\N	\N	97390222	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:13.578561	2025-11-01 13:05:13.578561	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:13.578561	2025-11-01 13:05:13.578561
b372f4f6-2c67-4b92-a632-52ba15173f5e	أمنة	المسكرية	2020-01-03	female	اليحمدي	\N	\N	90197579	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:13.724433	2025-11-01 13:05:13.724433	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:13.724433	2025-11-01 13:05:13.724433
1f9b37e7-f2f3-4ddc-91f0-9c3151052b1d	حلا	اليزيدية	2020-03-19	female	الثابتي	\N	\N	91221290	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:13.798204	2025-11-01 13:05:13.798204	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:13.798204	2025-11-01 13:05:13.798204
b50c76bf-ae6c-4b7c-bbfe-7b91a0776d04	هبة	الأبروية	2020-10-05	female	النصيب	\N	\N	91102383	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:13.943533	2025-11-01 13:05:13.943533	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:13.943533	2025-11-01 13:05:13.943533
b20b45f8-eaa5-4a6f-b4dc-0b017fdb7cf5	هيثم	اليزيدي	2020-06-09	male	الثابتي	\N	\N	99898928	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:14.087962	2025-11-01 13:05:14.087962	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:14.087962	2025-11-01 13:05:14.087962
1c4e4ef1-5edd-4082-bd90-1889168f6818	رهام	الرحبية	2020-03-10	female	اليحمدي	\N	\N	94499896	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:14.236546	2025-11-01 13:05:14.236546	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:14.236546	2025-11-01 13:05:14.236546
96a09961-64a3-453d-b318-0a7c47a42b71	مريم	السعدية	2020-01-22	female	الشخابيط	\N	\N	92518477	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:14.389937	2025-11-01 13:05:14.389937	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:14.389937	2025-11-01 13:05:14.389937
65e608d9-c8d8-4e88-a729-b10fad23c4c8	الحسن	المصلحي	2020-07-08	male	النبأ	\N	\N	90946647	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:14.54151	2025-11-01 13:05:14.54151	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:14.54151	2025-11-01 13:05:14.54151
acae4d85-10c5-480e-906a-69e2af60779e	محمد	اليزيدي	2020-06-26	male	الثابتي	\N	\N	96067035	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:14.685293	2025-11-01 13:05:14.685293	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:14.685293	2025-11-01 13:05:14.685293
e4051ccc-1720-468e-8f81-3809ebedfe58	نبراس	الحارثي	2020-04-18	male	سيح الشخابيط	\N	\N	96433061	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:14.830551	2025-11-01 13:05:14.830551	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:14.830551	2025-11-01 13:05:14.830551
84cb261c-a97f-4625-9abe-87516899cc31	هبة	الغنيمية	2020-04-08	female	النبأ حلة الغنيمي	\N	\N	93251825	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:14.975782	2025-11-01 13:05:14.975782	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:14.975782	2025-11-01 13:05:14.975782
75a36195-4911-4ef0-ad5a-312d3a11adc3	إيلاف	النظيرية	2020-01-24	female	السفالة	\N	\N	96927883	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:15.12624	2025-11-01 13:05:15.12624	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:15.12624	2025-11-01 13:05:15.12624
c5ce6fb7-3506-405d-9381-e1d23f621704	مسك	المسكرية	2020-10-30	female	الدكيك	\N	\N	96448770	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:15.275227	2025-11-01 13:05:15.275227	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:15.275227	2025-11-01 13:05:15.275227
5d916c68-9c95-486f-aef3-63fe3b48a73e	أمجد	السابقي	2020-11-16	male	عمان	\N	\N	93555689	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:15.421964	2025-11-01 13:05:15.421964	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:15.421964	2025-11-01 13:05:15.421964
d54fab4b-65c0-47c7-b05e-bcdef292c47f	فارس	الغنيمي	2020-10-02	male	الصرم	\N	\N	99262434	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:15.568476	2025-11-01 13:05:15.568476	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:15.568476	2025-11-01 13:05:15.568476
342f159b-a528-43a7-ae19-686f5895c414	عمر	الحارثي	2020-07-16	male	عمان	\N	\N	97277795	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:15.714723	2025-11-01 13:05:15.714723	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:15.714723	2025-11-01 13:05:15.714723
effb9ddd-9c49-43d7-b5d9-d6ce83e397a7	سارة	الطوقية	2020-03-24	female	المويلح	\N	\N	95426643	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:15.867039	2025-11-01 13:05:15.867039	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:15.867039	2025-11-01 13:05:15.867039
167a1a3c-ddf6-4347-a245-21ea9e2c1593	هاجر	الأبروية	2020-10-25	female	علاية \\السياح	\N	\N	99119220	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:16.085428	2025-11-01 13:05:16.085428	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:16.085428	2025-11-01 13:05:16.085428
284c5ad3-fbf3-436d-9357-0ab076088574	بشائر	المسكرية	2020-03-03	female	علاية	\N	\N	98963964	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:16.230701	2025-11-01 13:05:16.230701	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:16.230701	2025-11-01 13:05:16.230701
b7c7c41e-12c7-426b-93ee-e3d2e1f2fec4	هاجر	المصلحية	2020-09-29	female	وادي نام \\النبأ	\N	\N	99113491	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:16.305153	2025-11-01 13:05:16.305153	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:16.305153	2025-11-01 13:05:16.305153
d98ded37-284d-4221-a233-d2020c2f934f	سلطان	المغيري	2020-08-09	male	سيح الشخابيط	\N	\N	95967228	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:16.451522	2025-11-01 13:05:16.451522	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:16.451522	2025-11-01 13:05:16.451522
40daff7b-c404-45fe-ae84-f40fe759df5d	مريم	الريامية	2020-03-20	female	الثابتي	\N	\N	92929386	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:16.597149	2025-11-01 13:05:16.597149	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:16.597149	2025-11-01 13:05:16.597149
73149a02-28b0-4202-b599-1c09d2dccbbb	البتول	المصلحي	2020-03-13	female	وادي نام \\النبأ	\N	\N	92260170	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:16.741305	2025-11-01 13:05:16.741305	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:16.741305	2025-11-01 13:05:16.741305
75422e0c-6dc4-470c-b371-e695f7551489	محمد	اليزيدي	2021-02-03	male	الثابتي	\N	\N	92933730	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:16.886685	2025-11-01 13:05:16.886685	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:16.886685	2025-11-01 13:05:16.886685
d38b824e-7f64-4477-b8cf-ecb0212719f8	سليمان	السعدي	2020-12-09	male	وادي نام \\النبأ	\N	\N	95128431	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:17.033224	2025-11-01 13:05:17.033224	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:17.033224	2025-11-01 13:05:17.033224
a0798db0-9503-4ce7-8d0a-b0ccd1e6cbf6	جمان	الرحبية	2020-01-10	female	اليحمدي	\N	\N	95924561	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:17.181096	2025-11-01 13:05:17.181096	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:17.181096	2025-11-01 13:05:17.181096
49470ee9-c31c-487f-bdbb-cb93224057ec	سارة	السيابية	2020-05-04	female	القفيصي	\N	\N	92837305	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:17.327121	2025-11-01 13:05:17.327121	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:17.327121	2025-11-01 13:05:17.327121
89198a78-8926-457a-b54d-6a88db4358a0	حمد	السيابي	2020-05-04	male	القفيصي	\N	\N	92837305	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:17.474447	2025-11-01 13:05:17.474447	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:17.474447	2025-11-01 13:05:17.474447
730d1155-8080-4b34-8fda-c9ddce4371dd	سعيد	السيابي	2020-09-22	male	القفيصي	\N	\N	95266492	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:17.48155	2025-11-01 13:05:17.48155	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:17.48155	2025-11-01 13:05:17.48155
20643aff-44ac-4656-bdff-a9a184d3a308	يحيى	البراشدي	2021-02-20	male	السفالة	\N	\N	99899662	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:17.627574	2025-11-01 13:05:17.627574	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:17.627574	2025-11-01 13:05:17.627574
8e517f61-8868-4914-8ac8-bca125ad5cf5	تيمور	المصلحي	2020-06-08	male	وادي نام \\النبأ	\N	\N	93336581	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:17.774324	2025-11-01 13:05:17.774324	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:17.774324	2025-11-01 13:05:17.774324
cdc7465e-bb88-4e4d-97c6-190cc66fec5b	نور	السعدية	2020-11-11	female	الشخابيط	\N	\N	93527457	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:17.922571	2025-11-01 13:05:17.922571	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:17.922571	2025-11-01 13:05:17.922571
e96df5fb-d579-4b35-a87b-0d966fa41adf	فرح	الشحيمية	2022-02-07	female	القلة	\N	\N	99669597	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:18.139505	2025-11-01 13:05:18.139505	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:18.139505	2025-11-01 13:05:18.139505
122397f2-90ca-4e29-9842-82da66fbfcb9	حمزة	المسكري	2021-01-12	male	اليحمدي	\N	\N	92311816	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:18.283941	2025-11-01 13:05:18.283941	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:18.283941	2025-11-01 13:05:18.283941
c67056bd-578b-427d-a29c-d6b029514f63	لتين	المسكري	2021-01-01	female	اليحمدي	\N	\N	95931443	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:18.42931	2025-11-01 13:05:18.42931	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:18.42931	2025-11-01 13:05:18.42931
4120567e-4999-43e8-9e67-809d1e22db88	ملاك	العزري	2021-12-05	female	القابل	\N	\N	98200029	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:18.575994	2025-11-01 13:05:18.575994	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:18.575994	2025-11-01 13:05:18.575994
d6fb6955-d01c-4d54-a9c8-3f1e8ca33ac4	يوسف	الصقري	2022-01-01	male	القابل	\N	\N	95215738	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:18.720815	2025-11-01 13:05:18.720815	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:18.720815	2025-11-01 13:05:18.720815
a5030e1a-8c45-4ae4-bbb5-12009621ed8b	سامي	الرحبي	2022-01-04	male	مصرون	\N	\N	94622794	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:18.866397	2025-11-01 13:05:18.866397	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:18.866397	2025-11-01 13:05:18.866397
bb41a8b0-3010-488d-8533-22de63e8d4c9	أنس	الحارثي	2022-02-02	male	السفالة	\N	\N	96402929	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:18.871284	2025-11-01 13:05:18.871284	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:18.871284	2025-11-01 13:05:18.871284
b32b6c95-0e68-4a16-9c50-f54f79cbd9c9	أنس	الحارثي	2021-03-13	male	السفالة	\N	\N	94484465	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:18.946476	2025-11-01 13:05:18.946476	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:18.946476	2025-11-01 13:05:18.946476
ebf9e567-01f0-477f-8abc-d0724fcb64d8	سدى	البوسعيدية	2021-04-02	female	علاية	\N	\N	99378699	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:19.091681	2025-11-01 13:05:19.091681	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:19.091681	2025-11-01 13:05:19.091681
dd8f5ad2-737d-44b3-9c49-ce65edbee9c4	نسيبة	الصوافية	2021-02-22	female	سيح الشخابيط	\N	\N	97126778	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:19.236333	2025-11-01 13:05:19.236333	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:19.236333	2025-11-01 13:05:19.236333
f2d47fb4-bb48-4c8b-ab2b-4fe98dbf2d78	صهيب	الحارثي	2021-08-05	male	سيح العافية	\N	\N	95175490	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:19.386634	2025-11-01 13:05:19.386634	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:19.386634	2025-11-01 13:05:19.386634
cd5bc435-a351-4992-8c04-cb25dc003732	الحسن	الطالعي	2021-08-26	male	الدكيك	\N	\N	94141523	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:19.461109	2025-11-01 13:05:19.461109	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:19.461109	2025-11-01 13:05:19.461109
077b0c2f-701f-47e0-b998-03c374b3a520	شمه	الرحبية	2021-05-21	female	جديا	\N	\N	96063357	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:19.607045	2025-11-01 13:05:19.607045	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:19.607045	2025-11-01 13:05:19.607045
c74b988d-6873-4fb8-92a0-be63e455dc6f	شعيب	المسكري	2021-04-11	male	اليحمدي	\N	\N	92892110	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:19.754525	2025-11-01 13:05:19.754525	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:19.754525	2025-11-01 13:05:19.754525
496e7983-a53f-4ea3-b95f-e8595fd7b4e7	سبأ	الغزالية	2021-03-08	female	القابل	\N	\N	95677123	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:19.899679	2025-11-01 13:05:19.899679	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:19.899679	2025-11-01 13:05:19.899679
7ee64061-33b2-42a0-973b-955f89d5d92f	جمان	السعدية	2021-03-10	female	النبأ	\N	\N	95412391	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:20.045504	2025-11-01 13:05:20.045504	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:20.045504	2025-11-01 13:05:20.045504
573e09f1-1537-47b4-9c97-24ad65ba74e8	سعود	الراشدي	2021-02-10	male	الطرق	\N	\N	92891771	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:20.192891	2025-11-01 13:05:20.192891	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:20.192891	2025-11-01 13:05:20.192891
6af3f351-fcad-471e-9a3d-72772e3c1bfd	منذر	الحارثي	2021-04-04	male	القابل\\عز	\N	\N	95343856	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:20.339563	2025-11-01 13:05:20.339563	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:20.339563	2025-11-01 13:05:20.339563
2d5c9999-85d7-4b08-aa6e-fc5513c1debb	الجُلندى	اليعرُبي	2021-12-02	male	الثابتي	\N	\N	95441993	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:20.484807	2025-11-01 13:05:20.484807	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:20.484807	2025-11-01 13:05:20.484807
ee57c14b-bd54-488f-98f5-3ea4cb94554a	أحمد	المسكري	2021-02-23	male	نقل خاص	\N	\N	91480091	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:20.489867	2025-11-01 13:05:20.489867	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:20.489867	2025-11-01 13:05:20.489867
59407267-f1b1-4087-a711-7746f509304a	محمد	المصلحي	1932-11-10	male	علاية	\N	\N	99884447	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:20.562276	2025-11-01 13:05:20.562276	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:20.562276	2025-11-01 13:05:20.562276
3cedb1c4-c377-46ac-8ce4-065316c2e638	الفراهيد	المسكري	2021-02-02	male	النصيب	\N	\N	94440912	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:20.785557	2025-11-01 13:05:20.785557	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:20.785557	2025-11-01 13:05:20.785557
38a95e78-80bb-4119-9e37-1568613fe864	سعد	السيابي	2022-05-01	male	عمان	\N	\N	91414109	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:20.933078	2025-11-01 13:05:20.933078	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:20.933078	2025-11-01 13:05:20.933078
1b165422-1eaf-42f6-add1-f0bffb3607f8	سندس	البوسعيدي	2022-03-03	male	عمان	\N	\N	92343800	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:21.080858	2025-11-01 13:05:21.080858	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:21.080858	2025-11-01 13:05:21.080858
5ff9fe06-bdd1-43f9-b921-86ebc0dcc868	حور	الكعبية	2021-10-14	female	عمان	\N	\N	96033203	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:21.227792	2025-11-01 13:05:21.227792	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:21.227792	2025-11-01 13:05:21.227792
1163e767-bf73-4502-b509-4c08e03f546a	سعيد	الرحبي	2021-03-06	male	عمان	\N	\N	96120070	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:21.373229	2025-11-01 13:05:21.373229	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:21.373229	2025-11-01 13:05:21.373229
4b9061ca-0c4a-425b-be9a-6ce9b2a0e0f3	أمين	الإسماعيلي	2022-01-04	male	عمان	\N	\N	96479736	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:21.518389	2025-11-01 13:05:21.518389	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:21.518389	2025-11-01 13:05:21.518389
73345285-ac18-4ad5-8901-894c1542e65e	سديم	الرحبية	2021-03-03	female	عمان	\N	\N	97609904	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:21.664208	2025-11-01 13:05:21.664208	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:21.664208	2025-11-01 13:05:21.664208
85d8b3a6-64bc-4751-aa7c-9b56eb1c3f2d	آدم	اليزيدي	2021-05-28	male	عمان	\N	\N	97466312	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:21.81214	2025-11-01 13:05:21.81214	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:21.81214	2025-11-01 13:05:21.81214
a863d554-3a02-48c9-9f4c-df22b41ed666	فاطمة	المسكرية	2021-09-08	female	عمان	\N	\N	98883020	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:21.957794	2025-11-01 13:05:21.957794	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:21.957794	2025-11-01 13:05:21.957794
29cbcf5b-0f18-47c0-b152-e6b3d6f67ca8	فَلَكْ	السعدية	2021-11-13	female	عمان	\N	\N	92230881	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:22.101921	2025-11-01 13:05:22.101921	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:22.101921	2025-11-01 13:05:22.101921
9b11fbfa-e958-459f-a7f1-7df4bc0bc07e	صالح	المسكري	2021-10-15	male	عمان	\N	\N	99368119	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:22.24701	2025-11-01 13:05:22.24701	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:22.24701	2025-11-01 13:05:22.24701
46e7bc94-f3cb-4a64-a787-914ee1225bc4	أحمد	الغنيمي	2022-05-24	male	عمان	\N	\N	92196942	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:22.39242	2025-11-01 13:05:22.39242	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:22.39242	2025-11-01 13:05:22.39242
d731abae-20dc-4e88-8d3d-a4a2a18ff01a	سالم	الحارثي	2021-08-19	male	عمان	\N	\N	93913164	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:22.537324	2025-11-01 13:05:22.537324	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:22.537324	2025-11-01 13:05:22.537324
286c72aa-0194-4eb0-a4a6-0fa7a3d9788d	قيس	الرواحي	2021-06-17	male	عمان	\N	\N	95980543	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:22.682126	2025-11-01 13:05:22.682126	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:22.682126	2025-11-01 13:05:22.682126
f947a8e8-3303-4d59-9372-520137ddac05	غزل	المعمرية	2022-01-27	female	عمان	\N	\N	93834262	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:22.826189	2025-11-01 13:05:22.826189	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:22.826189	2025-11-01 13:05:22.826189
a3227bae-c230-46ae-a1fe-f1a4fdb13c67	أثير	الحارثية	2021-01-09	female	القابل\\عز	\N	\N	93377754	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:22.969428	2025-11-01 13:05:22.969428	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:22.969428	2025-11-01 13:05:22.969428
31f8261e-809e-45eb-9ef8-125b68102f55	عمر	سعيدالسعدي	2020-01-01	male	وادي نام \\ النبأ	\N	\N	95590378	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.113917	2025-11-01 13:05:23.113917	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.113917	2025-11-01 13:05:23.113917
cdb6fdc0-44ae-478c-aff3-49f58f67cfcf	غياث	الرحبي	2021-08-03	male	جديا	\N	\N	95874762	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.189034	2025-11-01 13:05:23.189034	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.189034	2025-11-01 13:05:23.189034
10d89a77-fb38-4ccc-9948-77d8e1b62256	ناصر	المغيري	2021-10-07	male	علاية	\N	\N	99247020	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.263959	2025-11-01 13:05:23.263959	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.263959	2025-11-01 13:05:23.263959
82ecff62-23c0-468d-8e87-a1b4e342db1a	أحمد	الحارثي	2021-11-09	male	خلف سمية	\N	\N	96643889	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.338637	2025-11-01 13:05:23.338637	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.338637	2025-11-01 13:05:23.338637
c76bba3f-89f1-4cfa-b05a-941ac34be80a	سعيد	المسكري	2022-01-01	male	اليحمدي	\N	\N	96649677	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.554349	2025-11-01 13:05:23.554349	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.554349	2025-11-01 13:05:23.554349
750d1305-e3d5-4191-9cd6-1e7ea77c6363	اليقظان	المسكري	2022-01-01	male	النصيب	\N	\N	94440912	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.628582	2025-11-01 13:05:23.628582	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.628582	2025-11-01 13:05:23.628582
deb13f05-a38d-4910-a0c2-ee07e5c104f2	أواب	المغيري	2022-01-01	male	علاية	\N	\N	98881883	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.633828	2025-11-01 13:05:23.633828	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.633828	2025-11-01 13:05:23.633828
14799b1a-9596-4204-9d75-29dc977fa4de	علا	الاسماعيلية	2022-01-01	female	النصيب	\N	\N	92996869	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.778866	2025-11-01 13:05:23.778866	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.778866	2025-11-01 13:05:23.778866
dddbd098-3eec-46d4-b4f5-cdf7f15f1638	ألين	النظيرية	2021-02-23	female	السفالة	\N	\N	96927883	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.784642	2025-11-01 13:05:23.784642	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.784642	2025-11-01 13:05:23.784642
fd56bf92-62e8-4bd3-b054-8e3e292d3a03	أحمد	البوسعيدي	2021-10-29	male	علاية	\N	\N	91916066	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.789087	2025-11-01 13:05:23.789087	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.789087	2025-11-01 13:05:23.789087
b35d8a54-d260-4c40-a0ea-ea349ec7e454	حذام	المغيرية	2021-04-05	female	القابل/القابل	\N	\N	92154206	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:23.863794	2025-11-01 13:05:23.863794	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:23.863794	2025-11-01 13:05:23.863794
d1b3a827-b220-468e-aff0-b04b2e4a4e88	رغد	المقبالية	2021-10-25	female	عمان	\N	\N	93344100	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:24.010929	2025-11-01 13:05:24.010929	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:24.010929	2025-11-01 13:05:24.010929
6e138a6a-2343-480c-b09d-d734bd7eee24	ذياب	المعمري	2021-09-27	male	عمان	\N	\N	95594241	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:24.155394	2025-11-01 13:05:24.155394	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:24.155394	2025-11-01 13:05:24.155394
6c452cf2-3307-4c0e-a1b3-4f5baee9c3ce	علي	السعدي	2021-05-19	male	عمان	\N	\N	95402296	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:24.299913	2025-11-01 13:05:24.299913	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:24.299913	2025-11-01 13:05:24.299913
70845b1d-ca99-4e7e-ba57-bec4279d7f53	عبد	الريامي	2021-09-04	male	عمان	\N	\N	99760666	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:24.448924	2025-11-01 13:05:24.448924	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:24.448924	2025-11-01 13:05:24.448924
13635de0-762e-44b8-965a-001571e1922c	تميم	المعمري	2021-12-13	male	عمان	\N	\N	92098917	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:24.59403	2025-11-01 13:05:24.59403	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:24.59403	2025-11-01 13:05:24.59403
7e2c867d-e99e-4f27-8a4a-f2e33e98f6bc	جنى	الحارثية	2021-03-08	female	سيح العافية	\N	\N	99797173	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:24.737967	2025-11-01 13:05:24.737967	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:24.737967	2025-11-01 13:05:24.737967
b9a1f103-744c-456e-99f6-d50c12aafc2d	حمود	الحارثي	2021-09-04	male	القابل	\N	\N	99374116	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:24.882759	2025-11-01 13:05:24.882759	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:24.882759	2025-11-01 13:05:24.882759
eee33dcb-803a-4d07-a7fe-fbc7e7c8b84e	عهد	السعدي	2021-08-11	female	عمان	\N	\N	91144364	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:25.028538	2025-11-01 13:05:25.028538	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:25.028538	2025-11-01 13:05:25.028538
4a72ec48-b917-4f2e-8f98-4aea8c80a30b	عفان	السيابي	2021-12-28	male	عمان	\N	\N	97763603	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:25.172595	2025-11-01 13:05:25.172595	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:25.172595	2025-11-01 13:05:25.172595
4a54b0f9-a722-46d9-b95f-28df549a33c7	شيم	المسكري	2022-05-18	female	عمان	\N	\N	98999149	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:25.31641	2025-11-01 13:05:25.31641	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:25.31641	2025-11-01 13:05:25.31641
d09157a4-bff9-4106-a3ae-30292164f649	إيلاف	الإسماعيلية	2021-08-24	female	اليحمدي	\N	\N	97939293	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:25.462037	2025-11-01 13:05:25.462037	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:25.462037	2025-11-01 13:05:25.462037
ee6f4e7e-53c2-4d66-9220-8e8112c2347a	درة	المسكرية	2021-08-29	female	علاية السيح الجديد	\N	\N	95145009	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:25.608757	2025-11-01 13:05:25.608757	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:25.608757	2025-11-01 13:05:25.608757
3f897370-0f2b-4c0f-bb34-f748e542ce9d	أحمد	اليزيدي	2020-01-01	male	الثابتي	\N	\N	92933730	\N	\N	\N	\N	عماني	\N	\N	2025-11-01 13:05:25.614394	2025-11-01 13:05:25.614394	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-01 13:05:25.614394	2025-11-01 13:05:25.614394
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: school_admin
--

COPY public.users (id, username, email, password, "firstName", "lastName", role, roles, phone, address, "dateOfBirth", "isActive", "lastLogin", school_id, "createdAt", "updatedAt") FROM stdin;
0f851929-30b0-4b1c-8f64-779bd03dae03	teacher_موزة	موزة@zinat.local	$2b$10$5j26fJd1LDqctuQx/20d4e5S72PZDDN/KNWLldGuwOibiN9UKCDkS	موزة	معلمة	teacher	\N	\N	\N	\N	t	\N	1	2025-11-01 13:05:07.046033	2025-11-01 13:05:07.046033
9fa0b1eb-e112-4480-8d27-1f434ea1b391	parent_94811096	parent_94811096@zinat.local	$2b$10$ZM9NGVK7/6RwM0MHWV3faudGzc1Q0Q49CVdMtmrZr3YajQGTfl0PC	والدة	الطالب درر المسكرية	parent	\N	94811096	\N	\N	t	\N	1	2025-11-01 13:05:07.12877	2025-11-01 13:05:07.12877
c585ec6e-602e-49f9-b973-061cfebeb083	parent_95092335	parent_95092335@zinat.local	$2b$10$7ms8MImGNUb6Nu3un0VO1OU.Xlc44D6Meir9g9td7ybaHsaL2RJle	والد	الطالب درر المسكرية	parent	\N	95092335	\N	\N	t	\N	1	2025-11-01 13:05:07.200284	2025-11-01 13:05:07.200284
600f55e1-95f4-4bdb-8c98-71b86010b490	parent_96173736	parent_96173736@zinat.local	$2b$10$LPARiC6AJyZuP7N9eKa93eLc7Ypa.V6SH8LyCNB3mItvmoEBQkXo6	والدة	الطالب صالح المسكري	parent	\N	96173736	\N	\N	t	\N	1	2025-11-01 13:05:07.278668	2025-11-01 13:05:07.278668
dbe79c7f-6cf5-41df-8a05-0c84c4b46fa2	parent_95064063	parent_95064063@zinat.local	$2b$10$zlyEqmoybz.3WXg7OO1Eeec5aUCVWqz5gqFUbWnTjs43JRd9zQWPG	والد	الطالب صالح المسكري	parent	\N	95064063	\N	\N	t	\N	1	2025-11-01 13:05:07.350477	2025-11-01 13:05:07.350477
de38fecd-032e-4f61-9002-30247874fe55	parent_95464181	parent_95464181@zinat.local	$2b$10$KnfBn7eyJgLfAasfAALP3.x/QrEjVDhmd46OhWhIfGj9BHgUeFMF2	والدة	الطالب روان العويدي	parent	\N	95464181	\N	\N	t	\N	1	2025-11-01 13:05:07.426092	2025-11-01 13:05:07.426092
938115b6-0d75-454f-b8e0-ecaea88086c3	parent_95932973	parent_95932973@zinat.local	$2b$10$Z9PRBIvkzPHU5cLBsHo.GeUFQL7VsqAFPGpOa9rRdNhXIlpxxTfz.	والدة	الطالب ضياء المسكرية	parent	\N	95932973	\N	\N	t	\N	1	2025-11-01 13:05:07.501488	2025-11-01 13:05:07.501488
f435dd70-eba6-40e6-a0aa-d2931c981f97	parent_96970744	parent_96970744@zinat.local	$2b$10$rYDZiEdk0C8CXKRjGvopw.R7t4H5DQtrTs.6DWN5bn/FemGgrpz2u	والد	الطالب ضياء المسكرية	parent	\N	96970744	\N	\N	t	\N	1	2025-11-01 13:05:07.572998	2025-11-01 13:05:07.572998
75fcf6ec-87f2-4721-8b36-82eb9e612246	parent_98885014	parent_98885014@zinat.local	$2b$10$NJKrp0OI9V26f/qzP2XSJuvpATPmLdclFsYa/luVRdmyNICoLh8R2	والدة	الطالب سعيد الحارثي	parent	\N	98885014	\N	\N	t	\N	1	2025-11-01 13:05:07.649225	2025-11-01 13:05:07.649225
1b00d302-f024-4cc1-ac45-acf566c8b31a	parent_93338334	parent_93338334@zinat.local	$2b$10$Y2vtP7v75r/fBwp8aYIxm.NAh1s5wk2ggnEL8ixnwdIx14VX9Lbdm	والد	الطالب سعيد الحارثي	parent	\N	93338334	\N	\N	t	\N	1	2025-11-01 13:05:07.72093	2025-11-01 13:05:07.72093
a9736adb-8352-4788-ac6a-cdb95aa7be33	parent_95145009	parent_95145009@zinat.local	$2b$10$iAEtZWquA5ntiWlbYk0wYuD.eK8Di.xX1gx98OvANlcrdvGV2hScC	والدة	الطالب صفاء المسكرية	parent	\N	95145009	\N	\N	t	\N	1	2025-11-01 13:05:07.796618	2025-11-01 13:05:07.796618
0617d532-4659-4d17-bf6f-94371eacfc5e	parent_92135380	parent_92135380@zinat.local	$2b$10$TuN3cyra1FZOtiE3rQeRZuuYQONIXqTTHzHMX6wobu/IqIYjzi0CO	والد	الطالب صفاء المسكرية	parent	\N	92135380	\N	\N	t	\N	1	2025-11-01 13:05:07.869035	2025-11-01 13:05:07.869035
0ba67a91-840f-4fe8-bbcc-3c271e4a3dd0	parent_98877226	parent_98877226@zinat.local	$2b$10$JAE2F4tApbIqDtg28bpGney/Psd4n6nXOtffSpp1SnoKTujIzn9uS	والدة	الطالب ناصر الرحبي	parent	\N	98877226	\N	\N	t	\N	1	2025-11-01 13:05:07.944684	2025-11-01 13:05:07.944684
afc7892c-c0df-47a5-ab0c-b5250d44d88f	parent_95454245	parent_95454245@zinat.local	$2b$10$f8AUtfr1CGr2ttaf1v8Rd.fqv5SicasLmCsl2vQIJwQpjh5vQ0bvy	والد	الطالب ناصر الرحبي	parent	\N	95454245	\N	\N	t	\N	1	2025-11-01 13:05:08.015123	2025-11-01 13:05:08.015123
879b6aaf-da65-4109-85bd-d2cccab26c26	parent_94622794	parent_94622794@zinat.local	$2b$10$j3rt0Fn2poJaytzQ9OGmwOn0yTgHuuKD35a3iif9RoxXE1p.ehxQe	والدة	الطالب بدر الرحبي	parent	\N	94622794	\N	\N	t	\N	1	2025-11-01 13:05:08.092446	2025-11-01 13:05:08.092446
de826c1d-ba79-4ccf-96d0-f9bd52d4f7f2	parent_99277483	parent_99277483@zinat.local	$2b$10$VdMiQT9NGfeQSy9Alcb9seJ/CXn0JyCx1TS5gexcs8pHfbTDf7RKW	والد	الطالب بدر الرحبي	parent	\N	99277483	\N	\N	t	\N	1	2025-11-01 13:05:08.16225	2025-11-01 13:05:08.16225
2d05f4da-c71c-4763-9571-47e997a3041a	parent_96933177	parent_96933177@zinat.local	$2b$10$b0IzEuILbQU7hWkBXGmbE.u3S9F8nZO6/AiLrQmd9ijXOgZ.Dw3JS	والدة	الطالب رؤى الحارثية	parent	\N	96933177	\N	\N	t	\N	1	2025-11-01 13:05:08.238242	2025-11-01 13:05:08.238242
112d118e-e69f-4e8b-9190-7f218789bc5c	parent_95088333	parent_95088333@zinat.local	$2b$10$MQXSNNJa1ZnvgFUDrSFOUOIV1SGBPHzxCJRrikP3cZI8guf25SmNq	والد	الطالب رؤى الحارثية	parent	\N	95088333	\N	\N	t	\N	1	2025-11-01 13:05:08.309654	2025-11-01 13:05:08.309654
fcd76a90-e1df-49fa-876c-3fd92ccb367b	parent_79070704	parent_79070704@zinat.local	$2b$10$pnz19bEdlCZ.GJsTUDHY2OZvLoLx3L054mOPLL56X2YwZWmnFhS/O	والدة	الطالب حسينة السعدية	parent	\N	79070704	\N	\N	t	\N	1	2025-11-01 13:05:08.384534	2025-11-01 13:05:08.384534
f239e4b6-8bff-4bbc-8af1-a454ea371107	parent_97775099	parent_97775099@zinat.local	$2b$10$Yicj.SbEQrqESGYCEaYA.eKzelT25oltuvI0POJ9Xz.CZQEA/W0eC	والد	الطالب حسينة السعدية	parent	\N	97775099	\N	\N	t	\N	1	2025-11-01 13:05:08.455399	2025-11-01 13:05:08.455399
6430eba5-0852-48d3-90ef-1c42e6174bae	parent_97291529	parent_97291529@zinat.local	$2b$10$SWFnbpaEwPeKNda1GSgImukHthf8EheSkfVBYRSdmbnUTaIV67vfS	والدة	الطالب غيم اليزيدية	parent	\N	97291529	\N	\N	t	\N	1	2025-11-01 13:05:08.530689	2025-11-01 13:05:08.530689
83f3fea3-37aa-4f61-82d0-26a14d0d48a1	parent_92988234	parent_92988234@zinat.local	$2b$10$TtPPMyr2lEUM/4/0.S58l.ak/JoKO.Yqxb2Y6C/CdE1hN/V/EZsay	والد	الطالب غيم اليزيدية	parent	\N	92988234	\N	\N	t	\N	1	2025-11-01 13:05:08.600954	2025-11-01 13:05:08.600954
9ee33166-a310-42d9-8d8f-c36c0a8be6ee	parent_71179339	parent_71179339@zinat.local	$2b$10$dfsGFmTOgxIiFsXlu0rH1uvXn3f6bOscKDT/7R6chDxp.VBwifBA.	والدة	الطالب اليزن الكعبي	parent	\N	71179339	\N	\N	t	\N	1	2025-11-01 13:05:08.678257	2025-11-01 13:05:08.678257
9063b1a2-4622-4cd5-b971-0b0f2122d1cf	parent_98488498	parent_98488498@zinat.local	$2b$10$4OsqG3pAccWgRMrf9f/DOOuhizMxhdyf6tefCq1L0y009aoXyYMyC	والد	الطالب اليزن الكعبي	parent	\N	98488498	\N	\N	t	\N	1	2025-11-01 13:05:08.748685	2025-11-01 13:05:08.748685
d94fa1e6-5133-4e17-9089-f949d586c076	parent_95054707	parent_95054707@zinat.local	$2b$10$mqxtu9Hp3mT5T.7Mbj0rGeBX4mCkyXyd/7BJ7JjI9ecdASnErj/Ee	والدة	الطالب ملاك المسكرية	parent	\N	95054707	\N	\N	t	\N	1	2025-11-01 13:05:08.821641	2025-11-01 13:05:08.821641
7b6bbca4-3576-45f8-a101-f1a73bab7239	parent_92210194	parent_92210194@zinat.local	$2b$10$w7Gco1Pix0COyjxQVOjXOeojD9Unv28SXbk.OeYv5QTApLFmOh9Gu	والد	الطالب ملاك المسكرية	parent	\N	92210194	\N	\N	t	\N	1	2025-11-01 13:05:08.893705	2025-11-01 13:05:08.893705
c95db9d4-76c2-44d6-9814-a6caaf8695e1	parent_99522564	parent_99522564@zinat.local	$2b$10$Frn8pm3CaxEz/3GBu9.8eemvxGrL3lU0tMm2gZ/LRGYu.K38nGiAW	والدة	الطالب سما المغيرية	parent	\N	99522564	\N	\N	t	\N	1	2025-11-01 13:05:08.969364	2025-11-01 13:05:08.969364
452a9aa1-ab9b-4c49-99a2-2ddcc91b12db	parent_99351065	parent_99351065@zinat.local	$2b$10$rK9LIal0g.cPZjwBLS5X6uX7focY3k.ZtS/4nm0rc4eBuhrnEVvu6	والد	الطالب سما المغيرية	parent	\N	99351065	\N	\N	t	\N	1	2025-11-01 13:05:09.04045	2025-11-01 13:05:09.04045
74454788-828b-4d65-b6cf-e61739b72417	parent_91200005	parent_91200005@zinat.local	$2b$10$thlV09rwd3NhYhYqx4O94epfZlL2.Y5Hf52f/wiPY1/D8sDLVI0QO	والدة	الطالب رؤى البراشدية	parent	\N	91200005	\N	\N	t	\N	1	2025-11-01 13:05:09.115205	2025-11-01 13:05:09.115205
c304b685-48cb-4b14-946a-6afa4fb8d3c2	parent_96001443	parent_96001443@zinat.local	$2b$10$.GCG3T5hb3zYtVgV84mPBOlcp6JcAB4LhIEDev3Xc5CYFWsWTj32G	والد	الطالب رؤى البراشدية	parent	\N	96001443	\N	\N	t	\N	1	2025-11-01 13:05:09.185887	2025-11-01 13:05:09.185887
1b1dfb2a-2a9e-4145-99b5-fa01d074060b	parent_92575676	parent_92575676@zinat.local	$2b$10$K.FqmKcRfFS8Vl1CPJOiPu6YLRHsZs0m7A5pN958a2.Z3qJ5p4SAm	والدة	الطالب محمد الحارثي	parent	\N	92575676	\N	\N	t	\N	1	2025-11-01 13:05:09.260309	2025-11-01 13:05:09.260309
cd319ad1-4954-4d6e-b270-ce4808338b86	parent_95226040	parent_95226040@zinat.local	$2b$10$pPA7uDwulFdZQ3fa88ikc.qGV0MMyueIAFiypoLGPTWloDCDt1/5K	والد	الطالب محمد الحارثي	parent	\N	95226040	\N	\N	t	\N	1	2025-11-01 13:05:09.331156	2025-11-01 13:05:09.331156
871b0869-b82d-4278-906a-0ffc1c7b6db5	parent_97772831	parent_97772831@zinat.local	$2b$10$62UdRy0tNwAz04KLlGtnpeIeZD78804zv/8j51mVZSrhlxlpOaLWu	والدة	الطالب أحمد الإسماعيلي	parent	\N	97772831	\N	\N	t	\N	1	2025-11-01 13:05:09.405657	2025-11-01 13:05:09.405657
978799bd-f2b7-448f-8384-33c82730da65	parent_99774412	parent_99774412@zinat.local	$2b$10$fpOXS0TjqeitpNpRXWBI0eVk5k2hD2Ms8RiN1dpGmdXYPMPffGIWu	والد	الطالب أحمد الإسماعيلي	parent	\N	99774412	\N	\N	t	\N	1	2025-11-01 13:05:09.477859	2025-11-01 13:05:09.477859
75b33b28-3d13-404b-a27a-58339c31f8c6	parent_77265536	parent_77265536@zinat.local	$2b$10$7nzwvIdZf3ow1hb9BreANOteyrGUXEx.ix.nywe0kwWumArqXMUS2	والدة	الطالب هيثم المسكري	parent	\N	77265536	\N	\N	t	\N	1	2025-11-01 13:05:09.553014	2025-11-01 13:05:09.553014
ef989278-af74-48fb-bcc4-b2416be1f2f2	parent_99881807	parent_99881807@zinat.local	$2b$10$X5/GhjJYPQeE6BI8rZrlSO6AcJvn/GLVUrXcQ4BgdT7jUDdH5JoJ.	والد	الطالب هيثم المسكري	parent	\N	99881807	\N	\N	t	\N	1	2025-11-01 13:05:09.623875	2025-11-01 13:05:09.623875
adb2ced4-d127-453c-a5c4-60528ef7995a	parent_95530331	parent_95530331@zinat.local	$2b$10$vE.rV0jIfmGP9AWQKDOB4eDrpaE6AHb5hvVgL8xEdGN4cdQgtEc7m	والدة	الطالب انسام الاسماعيلية	parent	\N	95530331	\N	\N	t	\N	1	2025-11-01 13:05:09.699819	2025-11-01 13:05:09.699819
34a104b6-52dd-4202-b67c-99e7a577d8c2	parent_92344674	parent_92344674@zinat.local	$2b$10$mHkllNNotuwBDpumF/veZeNEvABigKv.H3OMthSHrwKsq5zvz8URq	والد	الطالب انسام الاسماعيلية	parent	\N	92344674	\N	\N	t	\N	1	2025-11-01 13:05:09.770423	2025-11-01 13:05:09.770423
34e55b8c-9584-4dfa-8f8f-b4e27413519c	parent_95056160	parent_95056160@zinat.local	$2b$10$1Y6pjGFunSVSAz0MQ6dj7OmMDLEOMqzeI4ALnenELwYcXzdXSlTE6	والدة	الطالب الحسن البرواني	parent	\N	95056160	\N	\N	t	\N	1	2025-11-01 13:05:09.844352	2025-11-01 13:05:09.844352
6b9f3d36-0dde-4dc4-8453-54bae112f094	parent_99227235	parent_99227235@zinat.local	$2b$10$fL/KTOVKIORFvyvPYmT/J.Ra5C0DtXy84CmD0bUdoTJJJghuSmf6y	والد	الطالب الحسن البرواني	parent	\N	99227235	\N	\N	t	\N	1	2025-11-01 13:05:09.915466	2025-11-01 13:05:09.915466
dd820099-23c3-42c8-a668-9165418ae1ce	parent_92909567	parent_92909567@zinat.local	$2b$10$iTzJw5HpFsv/JerCQ.BSseWkeHpec.A/9mB/klm/pAUPXkNpS.oPC	والدة	الطالب زكريا الإسماعيلي	parent	\N	92909567	\N	\N	t	\N	1	2025-11-01 13:05:09.991145	2025-11-01 13:05:09.991145
73036766-e77b-478c-a6d4-db63e401baaf	teacher_زيانة	زيانة@zinat.local	$2b$10$DHY8oabT1be9qi38Ud6QSuag612CkrEGacV77b9p7GUEAQQNEhnIm	زيانة	معلمة	teacher	\N	\N	\N	\N	t	\N	1	2025-11-01 13:05:10.063743	2025-11-01 13:05:10.063743
9d68391c-8ce3-4729-b2da-1ac583aef255	parent_96609639	parent_96609639@zinat.local	$2b$10$v8LJC0Ppg4aEvBpMSTVRd.skj6lamFkt3oDMwjevk7bCQP6S9.mAS	والدة	الطالب عزام السعدي	parent	\N	96609639	\N	\N	t	\N	1	2025-11-01 13:05:10.137263	2025-11-01 13:05:10.137263
da45f482-cbee-4e21-9415-164a0028fde0	parent_99071679	parent_99071679@zinat.local	$2b$10$RdCiVo1XRq4rkg9KI3jgVuCghmYNzmPBClZtFeFuxnQfQoEtEjPjC	والد	الطالب عزام السعدي	parent	\N	99071679	\N	\N	t	\N	1	2025-11-01 13:05:10.207855	2025-11-01 13:05:10.207855
dfc1672e-32b8-4e00-a7b9-85f3d8e078ca	parent_94291888	parent_94291888@zinat.local	$2b$10$GOOzqUHryz71Q4NGmhIAGuQlbIA2WhrueLUFVvTsooWPfxNB.8Cs2	والدة	الطالب زياد الطوقي	parent	\N	94291888	\N	\N	t	\N	1	2025-11-01 13:05:10.28185	2025-11-01 13:05:10.28185
6fb1743f-b438-41e7-be5c-7c074ed9c539	parent_98861108	parent_98861108@zinat.local	$2b$10$0dkbXctPv4KzBHmnJEtx.OX6UtsauwufXBrP3uL8/Znok88snUhGu	والد	الطالب زياد الطوقي	parent	\N	98861108	\N	\N	t	\N	1	2025-11-01 13:05:10.352239	2025-11-01 13:05:10.352239
e075a638-515c-4f91-9f10-c813701674b6	parent_96252560	parent_96252560@zinat.local	$2b$10$3/kiSWDLfm3eH5QI6v1CDOxii8MvsepmOB.rqGekV8ezhmoiEyHEy	والدة	الطالب ماجد المسكري	parent	\N	96252560	\N	\N	t	\N	1	2025-11-01 13:05:10.426771	2025-11-01 13:05:10.426771
95d46a63-c799-4f9b-87cf-c6ebf82d4229	parent_92531771	parent_92531771@zinat.local	$2b$10$Rov7pWNMwWOLFZNF1aIYke3vpWxfXKbOhFZuX6SYl0NRkZ.oxKQfu	والد	الطالب ماجد المسكري	parent	\N	92531771	\N	\N	t	\N	1	2025-11-01 13:05:10.496669	2025-11-01 13:05:10.496669
8087566b-4a9a-4ce8-98bf-e1b4d72dd91b	parent_99252117	parent_99252117@zinat.local	$2b$10$9ViTOmy2uaZhga6BeCX6ge.Awhb3r8i90wvzIcxYvXxxoBBNd835K	والدة	الطالب نور المصلحية	parent	\N	99252117	\N	\N	t	\N	1	2025-11-01 13:05:10.572274	2025-11-01 13:05:10.572274
28356a57-ca29-4252-8493-1e64d7e8c2ec	parent_99537070	parent_99537070@zinat.local	$2b$10$wV338uybK1CntX2lb081tOEvczsrogAkEdxObm4qzex1eQRr.trLS	والد	الطالب نور المصلحية	parent	\N	99537070	\N	\N	t	\N	1	2025-11-01 13:05:10.642806	2025-11-01 13:05:10.642806
81072d14-e408-486a-8703-cbce17c8e9b7	parent_99650307	parent_99650307@zinat.local	$2b$10$rxVXfcAoMOkfhN68H8w1UOCM35L4XLgn31oVJSz.dj.l5xrW98em2	والدة	الطالب بندر السعدي	parent	\N	99650307	\N	\N	t	\N	1	2025-11-01 13:05:10.71866	2025-11-01 13:05:10.71866
262e9678-3021-4d71-8b93-00c1572155c0	parent_92863313	parent_92863313@zinat.local	$2b$10$7kopsQySqzzzSFIUjXVabOf/DMjQj.6yFlRGo3LA2Ru9QBMa6/.di	والدة	الطالب آية الحارثية	parent	\N	92863313	\N	\N	t	\N	1	2025-11-01 13:05:10.794028	2025-11-01 13:05:10.794028
aa089a54-35e2-4fb3-b31b-3536b031577e	parent_95887887	parent_95887887@zinat.local	$2b$10$cEFaKTkMpphFLLp/fiBA5.YVh3ZVviX7eSsg.K03BRh6qhWLw2xKu	والد	الطالب آية الحارثية	parent	\N	95887887	\N	\N	t	\N	1	2025-11-01 13:05:10.864912	2025-11-01 13:05:10.864912
4679ecd4-b2cc-4b44-a1db-e07a640c7cc2	parent_99432661	parent_99432661@zinat.local	$2b$10$.xH4ArfFaDoe4tOPdUw9KuoIgWdFVgyEMw7g.nccLGfQ0GgnlIYwi	والدة	الطالب طارق اليزيدي	parent	\N	99432661	\N	\N	t	\N	1	2025-11-01 13:05:10.941284	2025-11-01 13:05:10.941284
e23da144-61b6-47d6-85eb-0347d8ccfc04	parent_99277523	parent_99277523@zinat.local	$2b$10$1.cx57YTGoThkGLGonnEK.L19RbILRnoSqTjJoqOJ0p6G2u06xehG	والدة	الطالب عهد المسكرية	parent	\N	99277523	\N	\N	t	\N	1	2025-11-01 13:05:11.01637	2025-11-01 13:05:11.01637
4db122e0-a9c2-4263-89b0-a4e1fa5a00d9	parent_95383306	parent_95383306@zinat.local	$2b$10$3UUB0qdpSUworcTPSjDKMec2d9lUMkkCfYFZnDleQu2AT/J1.NQHG	والد	الطالب عهد المسكرية	parent	\N	95383306	\N	\N	t	\N	1	2025-11-01 13:05:11.087016	2025-11-01 13:05:11.087016
b790f3a8-5211-4773-9733-2afb92592a12	parent_94050440	parent_94050440@zinat.local	$2b$10$Y6eLqVAQlXpUaq0cyhShievxtnKPyWGqTsDWwottuxAj4Onh0l84K	والدة	الطالب الخطاب المصلحي	parent	\N	94050440	\N	\N	t	\N	1	2025-11-01 13:05:11.162173	2025-11-01 13:05:11.162173
7690a1db-c675-4653-a6e7-a876383417f0	parent_91373337	parent_91373337@zinat.local	$2b$10$lUV3RqSwFyqdKJzut11l3ex6Sa6.tXsTjQwatTD1nwTQAgaIIhite	والد	الطالب الخطاب المصلحي	parent	\N	91373337	\N	\N	t	\N	1	2025-11-01 13:05:11.232986	2025-11-01 13:05:11.232986
b0b49458-cc73-4197-9e94-2d47a1ee9e2e	parent_94365977	parent_94365977@zinat.local	$2b$10$qhVpjTdAekFSNfcLJJzizeZEJ6IUWrAsR7K7L02cRh43N4RREYul2	والدة	الطالب لين السعدية	parent	\N	94365977	\N	\N	t	\N	1	2025-11-01 13:05:11.307374	2025-11-01 13:05:11.307374
14a0f1ad-46cd-4616-82f7-c51dbc9d1f40	parent_94091267	parent_94091267@zinat.local	$2b$10$Aunogq7Em.XBOQ4TNOrot.u7DCGzKgIcF6x1xasJHfRH73iUiTh6G	والد	الطالب لين السعدية	parent	\N	94091267	\N	\N	t	\N	1	2025-11-01 13:05:11.378641	2025-11-01 13:05:11.378641
8af83477-f92b-43ba-8b8b-d792b38f3e1d	parent_95177699	parent_95177699@zinat.local	$2b$10$Jpl0FslExUqRAnlqCGmO7ugIHrj54TlXDbhK7RDrZcLlmDVRs8VUC	والدة	الطالب أجوان المسكرية	parent	\N	95177699	\N	\N	t	\N	1	2025-11-01 13:05:11.454642	2025-11-01 13:05:11.454642
3becfdfb-403a-4064-8d7b-b751900779ed	parent_92344016	parent_92344016@zinat.local	$2b$10$ac1tsq.RL0Q86rrJHt1EiuiO.7lBGL/sCLPxNTVgLE9dqlXzAjzfC	والد	الطالب أجوان المسكرية	parent	\N	92344016	\N	\N	t	\N	1	2025-11-01 13:05:11.525529	2025-11-01 13:05:11.525529
5d186609-1aca-4c68-8960-c45362e4e674	parent_92996869	parent_92996869@zinat.local	$2b$10$6docXKgN5S.w1D.7CU710.BYUsuZULEVkokV9YWuCkgWqKd9WzeIu	والدة	الطالب القاسم الإسماعيلي	parent	\N	92996869	\N	\N	t	\N	1	2025-11-01 13:05:11.601014	2025-11-01 13:05:11.601014
44b07cd5-c193-4d4d-9dc6-fe3149e6c469	parent_95148516	parent_95148516@zinat.local	$2b$10$xKD5WEVQf3BOdhrJFTU1xO/yOksiqzFhdHAREPg5GIrO1eSAlbTgS	والد	الطالب القاسم الإسماعيلي	parent	\N	95148516	\N	\N	t	\N	1	2025-11-01 13:05:11.672102	2025-11-01 13:05:11.672102
e2faee80-b7cf-41af-8e51-29912e644725	parent_78048099	parent_78048099@zinat.local	$2b$10$WUlSXuOvs9KjphUvr71Cm.e8u5GorQ9Ba07qIaSPKPpLoia9nm7zy	والدة	الطالب سلطانة المسكرية	parent	\N	78048099	\N	\N	t	\N	1	2025-11-01 13:05:11.747059	2025-11-01 13:05:11.747059
a34aec95-775f-4acf-9d30-53b16c918e20	parent_92255324	parent_92255324@zinat.local	$2b$10$9vs0Ltqiq0igCF6LqKx9U.f4G/hGmkwV4k9YDmunVzqnIYNViBsQG	والد	الطالب سلطانة المسكرية	parent	\N	92255324	\N	\N	t	\N	1	2025-11-01 13:05:11.817602	2025-11-01 13:05:11.817602
0bee4d3a-1379-4662-8934-f0e151a1f6f4	parent_91161333	parent_91161333@zinat.local	$2b$10$iFv6BSj2H/dH7V8dN/I2iul9N3oVpraDIlMSwzDwE1OsNvgOeB4B2	والدة	الطالب ريما المسكرية	parent	\N	91161333	\N	\N	t	\N	1	2025-11-01 13:05:11.89484	2025-11-01 13:05:11.89484
c26ae68f-8ac3-4a0a-a0d7-322575220280	parent_99840099	parent_99840099@zinat.local	$2b$10$1ctnTOXYL.gSfcF61QpHsOVg.NUrcg.4K6P27tFu19VG3jflZPq6e	والد	الطالب ريما المسكرية	parent	\N	99840099	\N	\N	t	\N	1	2025-11-01 13:05:11.966972	2025-11-01 13:05:11.966972
c58764c9-873f-428c-ad82-29731174d143	parent_96988621	parent_96988621@zinat.local	$2b$10$UoS5eWH7jAqBObTM/Ofxz.anXkC0SZTtFQu90UCIWDnUEbBmEwUzy	والدة	الطالب جمانة الحارثية	parent	\N	96988621	\N	\N	t	\N	1	2025-11-01 13:05:12.039971	2025-11-01 13:05:12.039971
52f5fdc0-3d20-4a30-8337-245a7906aa7d	parent_99728080	parent_99728080@zinat.local	$2b$10$wYFcG55R3oqxGMKMzVg1iu9K9UP3/Ed.pOcMTmuzY0K0LVpujzou.	والد	الطالب جمانة الحارثية	parent	\N	99728080	\N	\N	t	\N	1	2025-11-01 13:05:12.110391	2025-11-01 13:05:12.110391
b0678766-eda8-4232-80db-719ee165f1ab	parent_98000822	parent_98000822@zinat.local	$2b$10$Nf/EHqV/cP3.QIAV01It.ewUsg.2ss6Y93tpEXj5aW2MZR6jZk7u2	والدة	الطالب تسنيم المصلحية	parent	\N	98000822	\N	\N	t	\N	1	2025-11-01 13:05:12.185842	2025-11-01 13:05:12.185842
c94a555b-7ce6-4e8e-a035-0b8e150c335b	parent_94009966	parent_94009966@zinat.local	$2b$10$DOcpTTYzYPngjmDWOGGqGuAqUtzzXs6MxGXRgRJu6ii0SS3GAibIW	والد	الطالب تسنيم المصلحية	parent	\N	94009966	\N	\N	t	\N	1	2025-11-01 13:05:12.256736	2025-11-01 13:05:12.256736
77c826d9-860a-4ffb-94c2-900c5979e60e	parent_99123363	parent_99123363@zinat.local	$2b$10$GU7UClV4NcJzudSWV7VGLOxKdEip8FuBq10RHCNIh9coaOlmciRra	والدة	الطالب الهنوف الحارثي	parent	\N	99123363	\N	\N	t	\N	1	2025-11-01 13:05:12.332011	2025-11-01 13:05:12.332011
960554b6-4e45-49c2-b3ed-ba49cef0495a	parent_92082950	parent_92082950@zinat.local	$2b$10$acoA7GhTFD6jWjN/uAU0XuiQhL.2IPEeV7hz8hWu7jzx4TxgQy8Su	والد	الطالب الهنوف الحارثي	parent	\N	92082950	\N	\N	t	\N	1	2025-11-01 13:05:12.403403	2025-11-01 13:05:12.403403
1c19719a-2950-4cb0-95ec-48ca660ce897	parent_95441993	parent_95441993@zinat.local	$2b$10$yGGjao2m6oyZmnmExqXbi.2mX2iW.oLwsE.gYRegD2HC7BD1TeYki	والدة	الطالب سُلطان اليعرُبي	parent	\N	95441993	\N	\N	t	\N	1	2025-11-01 13:05:12.479997	2025-11-01 13:05:12.479997
a5a1e1b3-6f98-4092-af08-0fc1e7676909	parent_99478322	parent_99478322@zinat.local	$2b$10$dlZr1Vi.j7KWhMXzDZqWiOZgqAMHC.ugp9/n8ANwh9/8oLF827Fr.	والد	الطالب سُلطان اليعرُبي	parent	\N	99478322	\N	\N	t	\N	1	2025-11-01 13:05:12.550992	2025-11-01 13:05:12.550992
cf7efac9-da83-46e8-bca1-4261136da64f	parent_95910310	parent_95910310@zinat.local	$2b$10$UDw9SbtzXjxaYswwOHORneePZIPgedSlXYr2A2tP/osle84wF5elO	والدة	الطالب سالم المسكري	parent	\N	95910310	\N	\N	t	\N	1	2025-11-01 13:05:12.62649	2025-11-01 13:05:12.62649
fa079dd0-dffa-4cd7-82f6-4563844ca893	parent_93500098	parent_93500098@zinat.local	$2b$10$hBR8IpHN7Bf4/3OANVIVJ..8Fc8m8kdUZ5xBmG9q8Tm9L3eu9R7YW	والد	الطالب سالم المسكري	parent	\N	93500098	\N	\N	t	\N	1	2025-11-01 13:05:12.698928	2025-11-01 13:05:12.698928
82f57cbf-83c7-4262-a0f4-4163874bb7c9	parent_91964112	parent_91964112@zinat.local	$2b$10$Mc.4SCoo6uxZr4L2ZXgUve//OjFkHZna2QcsTWhBcRVtlGoMr8aVm	والدة	الطالب عبدالله الغيثي	parent	\N	91964112	\N	\N	t	\N	1	2025-11-01 13:05:12.774816	2025-11-01 13:05:12.774816
f98939d3-9078-49b1-be7f-05d272efb230	parent_92814558	parent_92814558@zinat.local	$2b$10$3NJ9X1p9FGi/NHsOLTi6cuVIK2NXadHVQL6XiLO0jx6/cXB3L/gUC	والد	الطالب عبدالله الغيثي	parent	\N	92814558	\N	\N	t	\N	1	2025-11-01 13:05:12.84523	2025-11-01 13:05:12.84523
d4db4df5-7b08-4df8-8875-9c81732d1f96	parent_95239039	parent_95239039@zinat.local	$2b$10$w5a7FZNkpXM5CbHbAHSBDOXNmZMH1hvtt8cR6Crm979XEydVTteSS	والدة	الطالب مزن المسكرية	parent	\N	95239039	\N	\N	t	\N	1	2025-11-01 13:05:12.91939	2025-11-01 13:05:12.91939
c1ed771a-e271-426d-85d1-7eb549904a8e	parent_96777593	parent_96777593@zinat.local	$2b$10$km.XhgZ050rY1W9wUxD4nekjGXD7.tSqxnvzTc8NETjpbh.4CbRLW	والد	الطالب مزن المسكرية	parent	\N	96777593	\N	\N	t	\N	1	2025-11-01 13:05:12.98996	2025-11-01 13:05:12.98996
6851375a-78ad-4b8d-a75d-f440e25cd8ab	teacher_حميدة	حميدة@zinat.local	$2b$10$m9Xj.WosMZOCtWomd5zs/umqlAh5vNMC0owVU8srojXpOGzJQqeFK	حميدة	معلمة	teacher	\N	\N	\N	\N	t	\N	1	2025-11-01 13:05:13.063179	2025-11-01 13:05:13.063179
2f68f713-f89a-4ba9-a407-3f6e587ededb	parent_96010653	parent_96010653@zinat.local	$2b$10$5AfNbgDEzKlCO/MwOBog3Oht2w7CLTa8zPeI4q5I3N8eZtmCvMxlS	والدة	الطالب آية المغيرية	parent	\N	96010653	\N	\N	t	\N	1	2025-11-01 13:05:13.137792	2025-11-01 13:05:13.137792
b999d881-15bb-42fb-a16a-62197a0dccd4	parent_96706407	parent_96706407@zinat.local	$2b$10$E5aUUthmuBD4jUM2F0HrNu47Y0nxzYLjBtat4s376xUf01z2ZFdZW	والد	الطالب آية المغيرية	parent	\N	96706407	\N	\N	t	\N	1	2025-11-01 13:05:13.20845	2025-11-01 13:05:13.20845
9758dd51-d35c-45d1-905f-acdb17292d9e	parent_98532380	parent_98532380@zinat.local	$2b$10$e/ZUTVTGvpRT/yKdQ32V5uaqoR.yyIyezlhCWspHhrimXn.Sj0Ima	والدة	الطالب شبيب الغنيمي	parent	\N	98532380	\N	\N	t	\N	1	2025-11-01 13:05:13.281985	2025-11-01 13:05:13.281985
a2676579-27f9-4771-90cc-0a550284502f	parent_96212441	parent_96212441@zinat.local	$2b$10$E1qLFhFIxt6TXF0v.nJDfe3aXqby/SuuxAY4pzbkFfTdNj9t5lHoy	والد	الطالب شبيب الغنيمي	parent	\N	96212441	\N	\N	t	\N	1	2025-11-01 13:05:13.352355	2025-11-01 13:05:13.352355
0c161026-ab1e-45f0-8b28-ed1fa84f26cd	parent_95611424	parent_95611424@zinat.local	$2b$10$/LB/17o6/f3E3WgmUF.s5uv4lYDZ2R3noVgqCJYqzarGHnWSQjA4e	والدة	الطالب أنس السعدي	parent	\N	95611424	\N	\N	t	\N	1	2025-11-01 13:05:13.427758	2025-11-01 13:05:13.427758
89784620-631d-4615-aabd-ec85e26b61c2	parent_98888208	parent_98888208@zinat.local	$2b$10$D9jVzQubv1kwgvMEvFLK/ul.L4lC7yHF5u/ZNtAn.mY21bjJtAXXS	والدة	الطالب الآء الأبروية	parent	\N	98888208	\N	\N	t	\N	1	2025-11-01 13:05:13.501984	2025-11-01 13:05:13.501984
70923e92-670f-42f6-a47f-3bf4f4c85425	parent_99897769	parent_99897769@zinat.local	$2b$10$ebK5jhZxq/EDeDwpMWhoYu3WK/r6GHrXNfdVrgDSg7r6/617FP2VW	والد	الطالب الآء الأبروية	parent	\N	99897769	\N	\N	t	\N	1	2025-11-01 13:05:13.572233	2025-11-01 13:05:13.572233
ec2a0493-ed8f-4357-b077-f0c3b70cdf40	parent_97390222	parent_97390222@zinat.local	$2b$10$vqVaxOyO9IJ0kKI2w12bAO0Slw/3B1SNMVruwfFbBsSP.HDhuYpqS	والدة	الطالب سيف الغنيمي	parent	\N	97390222	\N	\N	t	\N	1	2025-11-01 13:05:13.647304	2025-11-01 13:05:13.647304
4c386882-d5be-4780-ba79-9396865b92d9	parent_95020222	parent_95020222@zinat.local	$2b$10$qgiCVX2g0KgQq1r8HPnDZeCJV6oWuy8BUtUDr4nGZPB1gxTMYd7tq	والد	الطالب سيف الغنيمي	parent	\N	95020222	\N	\N	t	\N	1	2025-11-01 13:05:13.717511	2025-11-01 13:05:13.717511
88dc95f1-bd76-410d-91db-a5a3b9124975	parent_90197579	parent_90197579@zinat.local	$2b$10$zLi7HYl5k2X6w7ww8a6XaOSW9IEJnik1qtG7QCPeowWGYbw5GizXS	والدة	الطالب أمنة المسكرية	parent	\N	90197579	\N	\N	t	\N	1	2025-11-01 13:05:13.793116	2025-11-01 13:05:13.793116
30c52579-2048-4d00-b1e5-955d2436386c	parent_91221290	parent_91221290@zinat.local	$2b$10$za56UzWeTbgNzfvo7JTpS.IM7AyV44CeCtFHW.tsU6NZA56oca9BG	والدة	الطالب حلا اليزيدية	parent	\N	91221290	\N	\N	t	\N	1	2025-11-01 13:05:13.866824	2025-11-01 13:05:13.866824
8ade8c92-ffa3-4126-9463-f945be259718	parent_99576843	parent_99576843@zinat.local	$2b$10$TQZf.dGShO1RB67QzoWXoOYJ4caMZmUoOYrj.qZ8Jt7VhyKnuHfRe	والد	الطالب حلا اليزيدية	parent	\N	99576843	\N	\N	t	\N	1	2025-11-01 13:05:13.937868	2025-11-01 13:05:13.937868
7ff7703f-e9bb-4a79-af8e-f2ee3be7d530	parent_91102383	parent_91102383@zinat.local	$2b$10$nNQOQyvmn1eT.kRyrr0IRu52xWeSX39S5opu3hNamI0B/3HjHuUQa	والدة	الطالب هبة الأبروية	parent	\N	91102383	\N	\N	t	\N	1	2025-11-01 13:05:14.01223	2025-11-01 13:05:14.01223
58bd1bf3-df9a-46f7-bc47-9bb3daf9b603	parent_92223282	parent_92223282@zinat.local	$2b$10$fWgOw4gPYkfanCCnBvnRsO03LniChjSZJ8iDf/jt2GcRtHgge/MZ.	والد	الطالب هبة الأبروية	parent	\N	92223282	\N	\N	t	\N	1	2025-11-01 13:05:14.082405	2025-11-01 13:05:14.082405
0c931304-9451-4e4f-b784-1979772b239b	parent_99898928	parent_99898928@zinat.local	$2b$10$/fqzABaaIz20LamPb5bOZe3vPX6dzqWzUomSnzggxgT3Qc3aBWCni	والدة	الطالب هيثم اليزيدي	parent	\N	99898928	\N	\N	t	\N	1	2025-11-01 13:05:14.156746	2025-11-01 13:05:14.156746
062d39fb-b105-4151-ba0a-c734c2feebd0	parent_99347530	parent_99347530@zinat.local	$2b$10$4Aw4bBOkKHuLl3vps7awROOYeh5HL.xeaj84zwb/NVe2yNCyrzjXG	والد	الطالب هيثم اليزيدي	parent	\N	99347530	\N	\N	t	\N	1	2025-11-01 13:05:14.230409	2025-11-01 13:05:14.230409
229e8ef1-2ae7-4b8b-b2cf-03b7580962fb	parent_94499896	parent_94499896@zinat.local	$2b$10$D6JIuqwnqgw2DaZyOR66ueJ0lE7MQyigOWE8qJRqKhp2y2EjSjtze	والدة	الطالب رهام الرحبية	parent	\N	94499896	\N	\N	t	\N	1	2025-11-01 13:05:14.310269	2025-11-01 13:05:14.310269
d7608138-1bfd-4c3b-837e-1bc1e6198678	parent_92304811	parent_92304811@zinat.local	$2b$10$yU9mNS.BUYBkKi.9oSDJwuRgqHhMReXJOGhMM.DBHUp7bANBtUD.O	والد	الطالب رهام الرحبية	parent	\N	92304811	\N	\N	t	\N	1	2025-11-01 13:05:14.383935	2025-11-01 13:05:14.383935
38fa0944-0f83-4039-af56-7663e215f9db	parent_92518477	parent_92518477@zinat.local	$2b$10$ExoLrYQNfHz7lqbb7OZyLeXAsin0wyxTZxS18vFhJqJl5D8HbBqoS	والدة	الطالب مريم السعدية	parent	\N	92518477	\N	\N	t	\N	1	2025-11-01 13:05:14.459724	2025-11-01 13:05:14.459724
7da42408-4383-4450-b75b-e1a902cd9198	parent_92907478	parent_92907478@zinat.local	$2b$10$Gy0hLdLNffne6auSvTnyAeqKa6qW59qE2lXTsNSXPDUQ1exibGMfi	والد	الطالب مريم السعدية	parent	\N	92907478	\N	\N	t	\N	1	2025-11-01 13:05:14.53418	2025-11-01 13:05:14.53418
7a2ca9e6-c8f9-48c5-847d-2bc4edeee4d0	parent_90946647	parent_90946647@zinat.local	$2b$10$onfX92R9G0Vypq8Wn01LM.klgPfJKwbJ5LD3v6Ga6j98G.nAyV5SK	والدة	الطالب الحسن المصلحي	parent	\N	90946647	\N	\N	t	\N	1	2025-11-01 13:05:14.610306	2025-11-01 13:05:14.610306
6121a9d2-4c88-491c-99fb-08afd85b9210	parent_95908395	parent_95908395@zinat.local	$2b$10$uPjnwCOSNSLMwcOjJuiFcuttd6o9UUUKVL2VRxzVw6.Wa9VP6oVUy	والد	الطالب الحسن المصلحي	parent	\N	95908395	\N	\N	t	\N	1	2025-11-01 13:05:14.679974	2025-11-01 13:05:14.679974
5889749c-2b89-4d94-bd3f-cfb988ff9725	parent_96067035	parent_96067035@zinat.local	$2b$10$TcFW3Te3bknrCrfbP/.xfe1JM7cJaNiT17Z6RtXk9KNuWfbSpcV3y	والدة	الطالب محمد اليزيدي	parent	\N	96067035	\N	\N	t	\N	1	2025-11-01 13:05:14.753674	2025-11-01 13:05:14.753674
508ebed4-44cd-4ce1-9ac9-19c9835df0e3	parent_92296979	parent_92296979@zinat.local	$2b$10$sHCdWiDFFdil1tJRdV678ua7JOvueIfKocdpN8oTjuH2vhf7XlgEq	والد	الطالب محمد اليزيدي	parent	\N	92296979	\N	\N	t	\N	1	2025-11-01 13:05:14.825126	2025-11-01 13:05:14.825126
050396ff-a166-43ea-af3a-d87013ccab7f	parent_96433061	parent_96433061@zinat.local	$2b$10$CaEMHXdR.C84WxT6O0oOc.z7WpUsh2S3g6TidFnZjiMG7QNlyQjXS	والدة	الطالب نبراس الحارثي	parent	\N	96433061	\N	\N	t	\N	1	2025-11-01 13:05:14.899006	2025-11-01 13:05:14.899006
0450c32a-17de-48fd-b5da-7dbf49da1683	parent_95047783	parent_95047783@zinat.local	$2b$10$vu5d6q9GIgkblWCHAvaCH.N5UbcP/JhWQUS1qzezi/crvW34Bp5zC	والد	الطالب نبراس الحارثي	parent	\N	95047783	\N	\N	t	\N	1	2025-11-01 13:05:14.969408	2025-11-01 13:05:14.969408
4692c087-d170-4cf4-81f6-3de91d9b66a9	parent_93251825	parent_93251825@zinat.local	$2b$10$x/pWZW1u2wxzfzpqBTRl.O.o7N/aJh9FbtcEPkwgZqlb5A3jNhzU.	والدة	الطالب هبة الغنيمية	parent	\N	93251825	\N	\N	t	\N	1	2025-11-01 13:05:15.047496	2025-11-01 13:05:15.047496
daf4bcc1-321f-43e9-9027-4f5c0cc85e58	parent_99646261	parent_99646261@zinat.local	$2b$10$G5o83EEtJLngoJJte2VqGOl93vmavTNnZFe93xi2N7KGUp9IREyKi	والد	الطالب هبة الغنيمية	parent	\N	99646261	\N	\N	t	\N	1	2025-11-01 13:05:15.118552	2025-11-01 13:05:15.118552
a0caa5c4-f27c-4130-b9c3-9fe505577fb3	parent_96927883	parent_96927883@zinat.local	$2b$10$0BU5VeiNu/nx0qHEgpY4Wu1WtlbX5mP8DL4cMbi0WDX4xd0y6/m66	والدة	الطالب إيلاف النظيرية	parent	\N	96927883	\N	\N	t	\N	1	2025-11-01 13:05:15.197708	2025-11-01 13:05:15.197708
701a1dcd-a3d7-4794-b9f6-cfb379f7bba7	parent_95822009	parent_95822009@zinat.local	$2b$10$Y6f4S6nDG5bzh8qi6lGuI.1f3HM6m9/qTr4QGqFrCz9JzDgKJDeM2	والد	الطالب إيلاف النظيرية	parent	\N	95822009	\N	\N	t	\N	1	2025-11-01 13:05:15.268309	2025-11-01 13:05:15.268309
78257e11-5697-4f25-9e33-22d643c058fd	parent_96448770	parent_96448770@zinat.local	$2b$10$HMKnNFlnVYnTu02VHz3dQ.nC4R1b/aVZ4uDInc/wbPPpepvDoawB2	والدة	الطالب مسك المسكرية	parent	\N	96448770	\N	\N	t	\N	1	2025-11-01 13:05:15.344354	2025-11-01 13:05:15.344354
92b1e7e2-d80f-45c6-82f4-35e3edfa345a	parent_98675050	parent_98675050@zinat.local	$2b$10$PQUWa2034zLK6QTjS6WZNexx5eZo3T4xkpaXFENrV43d6oTJYapPu	والد	الطالب مسك المسكرية	parent	\N	98675050	\N	\N	t	\N	1	2025-11-01 13:05:15.414836	2025-11-01 13:05:15.414836
29eebfaa-db31-44b5-8d5e-38e5e70b2773	parent_93555689	parent_93555689@zinat.local	$2b$10$t7r9dl1wHwT8/X0wKU6V1.s0lXnzaI7H0KXSaKsJ1Ud6ITTtiuirW	والدة	الطالب أمجد السابقي	parent	\N	93555689	\N	\N	t	\N	1	2025-11-01 13:05:15.490691	2025-11-01 13:05:15.490691
86b7ae18-1a5e-42ea-af70-06b3e2f52dbb	parent_92949543	parent_92949543@zinat.local	$2b$10$n.sBVjitzcq3wgDsUFMCVeuTTJO4gU8edOm66fnNbKM2bJ8QoL/Xu	والد	الطالب أمجد السابقي	parent	\N	92949543	\N	\N	t	\N	1	2025-11-01 13:05:15.561694	2025-11-01 13:05:15.561694
e430974d-cf7f-4002-af49-206cfb6e9a33	parent_99262434	parent_99262434@zinat.local	$2b$10$iTfmwzc3oBLdWI.HhO.IZ.RNxHxQbEfX2gWMtOeneWaqjcCuFjxci	والدة	الطالب فارس الغنيمي	parent	\N	99262434	\N	\N	t	\N	1	2025-11-01 13:05:15.638347	2025-11-01 13:05:15.638347
7fb7537c-d176-4193-97d6-a02181150732	parent_97149449	parent_97149449@zinat.local	$2b$10$13BI.RJw1RuCVM1R2vk6g.9LMAM0mCs46YcSmsDQP0jupJHSaorkC	والد	الطالب فارس الغنيمي	parent	\N	97149449	\N	\N	t	\N	1	2025-11-01 13:05:15.709374	2025-11-01 13:05:15.709374
2d08436e-13c1-42a5-8141-e9fc1ce3977c	parent_97277795	parent_97277795@zinat.local	$2b$10$ZTW2.crrQQ7ORGd04otp8.342kTZxfnKcDipTWsQsQy7/.SCZ47Ry	والدة	الطالب عمر الحارثي	parent	\N	97277795	\N	\N	t	\N	1	2025-11-01 13:05:15.784436	2025-11-01 13:05:15.784436
dd5cd6f6-ff8c-4388-bd9a-cfbad6de25e6	parent_96162624	parent_96162624@zinat.local	$2b$10$ay/A4epzMYhC1b1jRDcIwuTgusuMzok7GrX/CoI3tyfG7rdrjvGSK	والد	الطالب عمر الحارثي	parent	\N	96162624	\N	\N	t	\N	1	2025-11-01 13:05:15.859854	2025-11-01 13:05:15.859854
d6081ae2-5945-4c1e-bfe2-b523c3bb9285	parent_95426643	parent_95426643@zinat.local	$2b$10$mNc8GmRdzAn7Ei2CwAAGeeA3c3HW3nR8vxqG7VVp0HB3V5rWiLMji	والدة	الطالب سارة الطوقية	parent	\N	95426643	\N	\N	t	\N	1	2025-11-01 13:05:15.936323	2025-11-01 13:05:15.936323
206d0f37-cf5e-426b-b2d5-c4eb64270af4	parent_94738797	parent_94738797@zinat.local	$2b$10$hNDeR5x3iyYsXYQeB3mkouVNXTdM5KvoVVVz04agCNUgmGXSsZ032	والد	الطالب سارة الطوقية	parent	\N	94738797	\N	\N	t	\N	1	2025-11-01 13:05:16.007558	2025-11-01 13:05:16.007558
721d5d7b-13fc-47dc-b5ba-f5414c2a5f4a	teacher_نسيبة	نسيبة@zinat.local	$2b$10$FnPFXkFvkWgoFb1NKeSNZuG1CwvDi8RImdV64.2hm044RCUQ2MStS	نسيبة	معلمة	teacher	\N	\N	\N	\N	t	\N	1	2025-11-01 13:05:16.080897	2025-11-01 13:05:16.080897
d9c69096-cb9a-4659-bcf2-d77386e926f0	parent_99119220	parent_99119220@zinat.local	$2b$10$BlWX6tlhcNC5njsLIJzX6O/3gNj9L5.gZes5MKU3epliAr7KP8z0.	والدة	الطالب هاجر الأبروية	parent	\N	99119220	\N	\N	t	\N	1	2025-11-01 13:05:16.153423	2025-11-01 13:05:16.153423
589ef6b4-9221-4f84-a9c7-a501ab74fe94	parent_99343718	parent_99343718@zinat.local	$2b$10$3bc/85Rd43eit4dwx2GTuutsSVF0L15xkEnt0Y5wexOnJyA.jCyqW	والد	الطالب هاجر الأبروية	parent	\N	99343718	\N	\N	t	\N	1	2025-11-01 13:05:16.223999	2025-11-01 13:05:16.223999
fb90e8f7-8e77-4578-8aff-365b31e9aa14	parent_98963964	parent_98963964@zinat.local	$2b$10$B6IeE99NUvDIjXxkXuHZAekfPaCJpodDBQsXF1nFJSoocVidzehWi	والدة	الطالب بشائر المسكرية	parent	\N	98963964	\N	\N	t	\N	1	2025-11-01 13:05:16.299451	2025-11-01 13:05:16.299451
4746f4e0-dba5-4709-b184-01dd81f8ce76	parent_99113491	parent_99113491@zinat.local	$2b$10$L3mo55D9QNXlgZcxcyNKqOjgES1GoisQg6jil6pv2cTlNQkyU4nfa	والدة	الطالب هاجر المصلحية	parent	\N	99113491	\N	\N	t	\N	1	2025-11-01 13:05:16.373435	2025-11-01 13:05:16.373435
dadcdf93-6389-4b02-aa21-395765100eb6	parent_95888218	parent_95888218@zinat.local	$2b$10$QMW0Ns6v4XLKt/TEsBrptukNr8nYlVr6csEgEduRMGx3GUObzZ326	والد	الطالب هاجر المصلحية	parent	\N	95888218	\N	\N	t	\N	1	2025-11-01 13:05:16.444793	2025-11-01 13:05:16.444793
340beb3c-09c9-4165-8e48-cbabb790c218	parent_95967228	parent_95967228@zinat.local	$2b$10$GqhzxPunUHuMgKC3Bz8ED.e8imglzJHBOeJt7pPbFcBkhD1u1h5qq	والدة	الطالب سلطان المغيري	parent	\N	95967228	\N	\N	t	\N	1	2025-11-01 13:05:16.519961	2025-11-01 13:05:16.519961
00cce789-c94a-4d7a-b902-b3b559b96221	parent_92466566	parent_92466566@zinat.local	$2b$10$Brkn/KUtQ9goQybf/byA0Ow3iHdfATDwxSUXdwA0nSFamc.S30ZnO	والد	الطالب سلطان المغيري	parent	\N	92466566	\N	\N	t	\N	1	2025-11-01 13:05:16.590254	2025-11-01 13:05:16.590254
7d287a6a-6e67-406d-a8a4-c39ee5abfc8c	parent_92929386	parent_92929386@zinat.local	$2b$10$yVU4LgSFDOC0wEbZm7xQue8oaXSlnaH7y6z.obsmKmtX7gaGTiSZ2	والدة	الطالب مريم الريامية	parent	\N	92929386	\N	\N	t	\N	1	2025-11-01 13:05:16.665601	2025-11-01 13:05:16.665601
c75c9ee0-0542-4b29-9d28-228b9641a77e	parent_96010671	parent_96010671@zinat.local	$2b$10$LLk3A0TiUlPS9Z.I7QD/0uzRPlK0YYOSQJxsTSk2kUey.YViMxFvW	والد	الطالب مريم الريامية	parent	\N	96010671	\N	\N	t	\N	1	2025-11-01 13:05:16.735709	2025-11-01 13:05:16.735709
6ab29946-2b34-4591-a28d-309a53965cf2	parent_92260170	parent_92260170@zinat.local	$2b$10$dj/OQAFUa2YaCKqdIlkleuVxfcdaAaQ5eIyR3W/wZbOWSvCZ8VlOK	والدة	الطالب البتول المصلحي	parent	\N	92260170	\N	\N	t	\N	1	2025-11-01 13:05:16.810365	2025-11-01 13:05:16.810365
8ea74c5d-e7e5-4c41-a70d-3516728ae3e5	parent_98273385	parent_98273385@zinat.local	$2b$10$.vHmD8a3X51StqnCEkw.N.ybv.UCIJpN3FQO9RO0DkiVsYP6JVx4m	والد	الطالب البتول المصلحي	parent	\N	98273385	\N	\N	t	\N	1	2025-11-01 13:05:16.881158	2025-11-01 13:05:16.881158
8a872ed0-d70d-40e5-8bc4-6325d64efedf	parent_92933730	parent_92933730@zinat.local	$2b$10$.HyeP/Oj9EiYG9A8ZlPoReNhXPfhPB2Qajt4X6.gUVCeFV4BTMy2i	والدة	الطالب محمد اليزيدي	parent	\N	92933730	\N	\N	t	\N	1	2025-11-01 13:05:16.955015	2025-11-01 13:05:16.955015
16967956-6195-4ea4-8427-52389d8f0a02	parent_99024544	parent_99024544@zinat.local	$2b$10$7n/GT63q0m.ISlO0ndoV2uwFi5naGZw6s0KA3M7Xsjm4z6qdjhTum	والد	الطالب محمد اليزيدي	parent	\N	99024544	\N	\N	t	\N	1	2025-11-01 13:05:17.026553	2025-11-01 13:05:17.026553
79aedf0c-beee-4966-82a0-9cdf232b34d2	parent_95128431	parent_95128431@zinat.local	$2b$10$wtin2PASEm7uk5jqkRQbbemkF6ddG.x1K849kASWbPDZK.4yfa.jO	والدة	الطالب سليمان السعدي	parent	\N	95128431	\N	\N	t	\N	1	2025-11-01 13:05:17.101879	2025-11-01 13:05:17.101879
d1bbc32c-63bd-4144-99b9-794f9302c851	parent_95480570	parent_95480570@zinat.local	$2b$10$hPPBakK3PiW07KxR3blCKu11o5DojRmVNXg/O5FeKf6DYB5iG.5K2	والد	الطالب سليمان السعدي	parent	\N	95480570	\N	\N	t	\N	1	2025-11-01 13:05:17.172797	2025-11-01 13:05:17.172797
447bb373-1d1a-486a-85e4-77d22fcf76f7	parent_95924561	parent_95924561@zinat.local	$2b$10$EXsrV28/h4w3mDB4MWHvduvvrz1OS8PTICaN0GTZB4OfIaHRrDmRS	والدة	الطالب جمان الرحبية	parent	\N	95924561	\N	\N	t	\N	1	2025-11-01 13:05:17.24973	2025-11-01 13:05:17.24973
16b566b9-cfbe-4957-92e7-2b1abf9fc251	parent_92677489	parent_92677489@zinat.local	$2b$10$Bpmu3yFW5tD9J2lof.RKCeKAPnxxZ.upA/xJbL.slV9txvxx/PBK.	والد	الطالب جمان الرحبية	parent	\N	92677489	\N	\N	t	\N	1	2025-11-01 13:05:17.320757	2025-11-01 13:05:17.320757
9294319d-46a2-42cc-a7c4-aa67b4413d62	parent_92837305	parent_92837305@zinat.local	$2b$10$yWQf4VRPBWvju.fOxkp3HOpqf5v7n.Da7tIhf7K7Kn1zD3OKefodG	والدة	الطالب سارة السيابية	parent	\N	92837305	\N	\N	t	\N	1	2025-11-01 13:05:17.395999	2025-11-01 13:05:17.395999
8f30fce8-0f4f-4088-9b56-46a6d50878ef	parent_99790947	parent_99790947@zinat.local	$2b$10$CAhNqoM52yAQzA2SfTPiPOWj9bKYW4ofvXoraRQJnLZc02CTRNX/O	والد	الطالب سارة السيابية	parent	\N	99790947	\N	\N	t	\N	1	2025-11-01 13:05:17.467143	2025-11-01 13:05:17.467143
35f776d1-55da-4bb5-95fe-76814b898980	parent_95266492	parent_95266492@zinat.local	$2b$10$tnQcpGY2/sQ3I.0E6J84Ie0v.yS/gQBVZ9dJrYeX/XHRft2rCcIhm	والدة	الطالب سعيد السيابي	parent	\N	95266492	\N	\N	t	\N	1	2025-11-01 13:05:17.550012	2025-11-01 13:05:17.550012
3146ee4a-8028-4223-8ee4-8c31f1b89a47	parent_99005499	parent_99005499@zinat.local	$2b$10$0Ql7eUyf9EoCALOfjxFBKeU1NxzfTwePYhZ8atYey0kpe5tEC0qL.	والد	الطالب سعيد السيابي	parent	\N	99005499	\N	\N	t	\N	1	2025-11-01 13:05:17.621842	2025-11-01 13:05:17.621842
2de1e070-a8ab-4848-8753-97103be25a4a	parent_99899662	parent_99899662@zinat.local	$2b$10$UZgrX9nvpaYq59F4d0vvvuI3CgOm5VUQowLDAl8EK.IAXwVa7Hi52	والدة	الطالب يحيى البراشدي	parent	\N	99899662	\N	\N	t	\N	1	2025-11-01 13:05:17.696275	2025-11-01 13:05:17.696275
e882c565-48d2-425b-874e-6f4b7062d156	parent_99332992	parent_99332992@zinat.local	$2b$10$2mnRG54M/1GvaxBTHQvxcOGt/n9e9/i3Zb2xIZes27EDE6y7rEfwK	والد	الطالب يحيى البراشدي	parent	\N	99332992	\N	\N	t	\N	1	2025-11-01 13:05:17.766802	2025-11-01 13:05:17.766802
7187b603-dde1-404a-b7aa-2fcfe9279d25	parent_93336581	parent_93336581@zinat.local	$2b$10$yn.qnrXN3aM33bSDy2XzjOrC94Jh42.UJHanM0Eg9WQnEy6ty3i.W	والدة	الطالب تيمور المصلحي	parent	\N	93336581	\N	\N	t	\N	1	2025-11-01 13:05:17.843484	2025-11-01 13:05:17.843484
7469ffeb-d3e4-4bbc-ae92-42dfe2f65a5c	parent_99238295	parent_99238295@zinat.local	$2b$10$3zCyi77rzFPyJth3xSibuu6gASArFGJr4Ok8ufWyToOHN300mrDAC	والد	الطالب تيمور المصلحي	parent	\N	99238295	\N	\N	t	\N	1	2025-11-01 13:05:17.915836	2025-11-01 13:05:17.915836
a3fee07a-837f-47c3-b51f-e0dc998ee761	parent_93527457	parent_93527457@zinat.local	$2b$10$z8OCus3Q3eZsrPJSagd0ceiaUijMgk.k.u.c48Pv3qSCcGkje8Wqy	والدة	الطالب نور السعدية	parent	\N	93527457	\N	\N	t	\N	1	2025-11-01 13:05:17.991879	2025-11-01 13:05:17.991879
dfdad4c3-98f3-4a2f-8b83-feb612f9d698	parent_99518145	parent_99518145@zinat.local	$2b$10$CQDF4qPBPZ3QNO3B37vNAeGjqGbdG9E2i5IC//Zewa.XfYlQqtebi	والد	الطالب نور السعدية	parent	\N	99518145	\N	\N	t	\N	1	2025-11-01 13:05:18.062617	2025-11-01 13:05:18.062617
4f408358-e42c-4ad1-b455-484126e71dd4	teacher_شمسة	شمسة@zinat.local	$2b$10$QvKlLXwfjLESh0L9hYv9MutHAcmquTBqQWmRAwFmNaEYpR2kwa34q	شمسة	معلمة	teacher	\N	\N	\N	\N	t	\N	1	2025-11-01 13:05:18.134646	2025-11-01 13:05:18.134646
026aeaee-3886-4ca7-bd42-adb69c4dcf88	parent_99669597	parent_99669597@zinat.local	$2b$10$eSKipVjzR5Cu2O.awIu3OOKx7xEWbXYyN/3zdWyU6sHN6qjH/hJYm	والدة	الطالب فرح الشحيمية	parent	\N	99669597	\N	\N	t	\N	1	2025-11-01 13:05:18.207995	2025-11-01 13:05:18.207995
c75126c3-5c9a-44d7-bf38-799fbc60f6c0	parent_92839030	parent_92839030@zinat.local	$2b$10$ydl6v.9ExWP5bo0rcc6nH.popn0ToLQTA2dQx0rkwylopNN8L5ThS	والد	الطالب فرح الشحيمية	parent	\N	92839030	\N	\N	t	\N	1	2025-11-01 13:05:18.278057	2025-11-01 13:05:18.278057
7b2b66c0-ce89-407f-93bc-e2b1c28187b0	parent_92311816	parent_92311816@zinat.local	$2b$10$Tvgg7UGgA3z0f6BYeSANxesaO4Y7dfB635R80k6PfspRbYLaRo0pO	والدة	الطالب حمزة المسكري	parent	\N	92311816	\N	\N	t	\N	1	2025-11-01 13:05:18.352118	2025-11-01 13:05:18.352118
25165b46-4d4a-4b60-8aa7-11d65d4b0b1c	parent_95464336	parent_95464336@zinat.local	$2b$10$w8Z1mBwKL4OFA3u11HBU1OYOs/rt3T.kFyo3TTKF5MvaMGzQ3afUi	والد	الطالب حمزة المسكري	parent	\N	95464336	\N	\N	t	\N	1	2025-11-01 13:05:18.422872	2025-11-01 13:05:18.422872
fc529176-1092-4912-a248-9dfd4e46f543	parent_95931443	parent_95931443@zinat.local	$2b$10$ge9RhJPDwSOAoAlLhXOPaOoVe6NgzfY7VjygSSdAtSKq2XjKlo7nq	والدة	الطالب لتين المسكري	parent	\N	95931443	\N	\N	t	\N	1	2025-11-01 13:05:18.497269	2025-11-01 13:05:18.497269
5f2397c2-a60a-43b5-bc2d-0dbf2224f31e	parent_96467667	parent_96467667@zinat.local	$2b$10$vsyMtUNGwc3Nh/7P0MpsH.lZI6fr3KO.BVzVxOKFhXlAGNZthfjPu	والد	الطالب لتين المسكري	parent	\N	96467667	\N	\N	t	\N	1	2025-11-01 13:05:18.56869	2025-11-01 13:05:18.56869
6232fc09-1a6d-4567-a9e2-1a40320dec97	parent_98200029	parent_98200029@zinat.local	$2b$10$ypyWPa1JLo7luQW/D0EAeeivNb.s1C2knomF5LIm30EfUg5V4jgqK	والدة	الطالب ملاك العزري	parent	\N	98200029	\N	\N	t	\N	1	2025-11-01 13:05:18.644698	2025-11-01 13:05:18.644698
67ccaa1b-c79d-4da7-a937-aeebb695197e	parent_93000045	parent_93000045@zinat.local	$2b$10$V7P7Le99EaSCPtpeDC3TPOcSUIl8ngUK/RZddUy2ZsTjaOgq7qXs2	والد	الطالب ملاك العزري	parent	\N	93000045	\N	\N	t	\N	1	2025-11-01 13:05:18.715254	2025-11-01 13:05:18.715254
212a03cd-6439-4847-9825-6c26cd264402	parent_95215738	parent_95215738@zinat.local	$2b$10$qbuk7BnV0zsOk9I1B1v3ReHvNsPsXwo3XaQ4k2Z1PiJSKJfXs0XyK	والدة	الطالب يوسف الصقري	parent	\N	95215738	\N	\N	t	\N	1	2025-11-01 13:05:18.789231	2025-11-01 13:05:18.789231
7bda3396-5546-428b-b550-2be19e61f02e	parent_96641062	parent_96641062@zinat.local	$2b$10$.9OnjDdFD5VvKK0bCAzJneV4YSVUqE86iSR3HCq/lYLSD68Pu98m.	والد	الطالب يوسف الصقري	parent	\N	96641062	\N	\N	t	\N	1	2025-11-01 13:05:18.860704	2025-11-01 13:05:18.860704
56563198-8357-4534-ab1d-f8734ea5482c	parent_96402929	parent_96402929@zinat.local	$2b$10$qdEAXwB2NUUBeNXFgQ63n.R/AXADNxa5rKjK0.T3ZXf9T7L2tANZ.	والدة	الطالب أنس الحارثي	parent	\N	96402929	\N	\N	t	\N	1	2025-11-01 13:05:18.939458	2025-11-01 13:05:18.939458
ae54bd88-6e62-4ff8-b7b1-4cf64083114d	parent_94484465	parent_94484465@zinat.local	$2b$10$UnXdCy9UPNocf6S234kwJ.us.U4Dtkc4Amn9DUUpHcBAS4AV0Bcii	والدة	الطالب أنس الحارثي	parent	\N	94484465	\N	\N	t	\N	1	2025-11-01 13:05:19.014753	2025-11-01 13:05:19.014753
626a3c4c-86b1-4ff4-a98d-b5a8aee34b69	parent_95397376	parent_95397376@zinat.local	$2b$10$vpnDHFWVvKQ9Zs2PT.TsuOC0sbdnK2ryXYnmHFM71o6XLzriXtONC	والد	الطالب أنس الحارثي	parent	\N	95397376	\N	\N	t	\N	1	2025-11-01 13:05:19.085241	2025-11-01 13:05:19.085241
508d3d5d-67c0-4ca4-96c9-1a3b7483aec3	parent_99378699	parent_99378699@zinat.local	$2b$10$7pzsHvtvU2VqUNjRXckI/OacACQ/KqTfbJXngMQjcHLz8uXCLz0SK	والدة	الطالب سدى البوسعيدية	parent	\N	99378699	\N	\N	t	\N	1	2025-11-01 13:05:19.160489	2025-11-01 13:05:19.160489
f1e2e99d-f1b5-433a-bb1b-6d3ccacc9e9f	parent_94050678	parent_94050678@zinat.local	$2b$10$MloV3r6ltlifCgC2KQVDEOaBqJu08F6PRE3OXg2ARs/.4XmYV/D5m	والد	الطالب سدى البوسعيدية	parent	\N	94050678	\N	\N	t	\N	1	2025-11-01 13:05:19.231488	2025-11-01 13:05:19.231488
d8893906-52fd-4fd3-8a86-0a306aa9bb6d	parent_97126778	parent_97126778@zinat.local	$2b$10$69qLjvqqPQgtDrbdxyA6Zutql2s51n2OFDHDpThKjxsqogt9txeF2	والدة	الطالب نسيبة الصوافية	parent	\N	97126778	\N	\N	t	\N	1	2025-11-01 13:05:19.304412	2025-11-01 13:05:19.304412
c04ad6bc-da5e-475d-a17b-775b7922fc85	parent_97791661	parent_97791661@zinat.local	$2b$10$8bCpa99fbai14n39sou/O.mk3ufD5po4v4xqbXtIZcZqO2Mp7hG.y	والد	الطالب نسيبة الصوافية	parent	\N	97791661	\N	\N	t	\N	1	2025-11-01 13:05:19.380367	2025-11-01 13:05:19.380367
cbe77914-89c3-4da1-a502-ee24b5c40552	parent_95175490	parent_95175490@zinat.local	$2b$10$N1b6Fz/3ILdSFrhOWb5SF.Ik2c8khcmYJg7uDrvFhN.UiU8qoJJsy	والدة	الطالب صهيب الحارثي	parent	\N	95175490	\N	\N	t	\N	1	2025-11-01 13:05:19.455261	2025-11-01 13:05:19.455261
a7a68c5a-ba51-4601-ad54-d8953b2ac03b	parent_94141523	parent_94141523@zinat.local	$2b$10$J.l1dy7LZH1Qg8YDXQvrR.BYIC73fhNtgPx2nmQgYYlL5cA6biFoW	والدة	الطالب الحسن الطالعي	parent	\N	94141523	\N	\N	t	\N	1	2025-11-01 13:05:19.529749	2025-11-01 13:05:19.529749
f08add49-b480-46d4-9147-8029804238fe	parent_94881766	parent_94881766@zinat.local	$2b$10$M6BTMAea9JBDtiiYsXnaqeE7wzgLgecRdtuqQvJEWYYMYESDWOINe	والد	الطالب الحسن الطالعي	parent	\N	94881766	\N	\N	t	\N	1	2025-11-01 13:05:19.601127	2025-11-01 13:05:19.601127
4bbcc292-15dd-40c8-b8e1-f4da9859e232	parent_96063357	parent_96063357@zinat.local	$2b$10$daB/Ep1YQenN58XCgWvpieie0Nn6WI5WRdoU/lfvfw6Y6u9HnrEwW	والدة	الطالب شمه الرحبية	parent	\N	96063357	\N	\N	t	\N	1	2025-11-01 13:05:19.676371	2025-11-01 13:05:19.676371
7928e3f6-2fd7-44e7-a75a-05f5ae0184c4	parent_77535302	parent_77535302@zinat.local	$2b$10$.m6DpHJjJphQF4Y3.zoJ.ed4IZDOFgbBKbN0oBv4Ug1Py1b/QjC.2	والد	الطالب شمه الرحبية	parent	\N	77535302	\N	\N	t	\N	1	2025-11-01 13:05:19.747998	2025-11-01 13:05:19.747998
c1e32556-ed91-4b87-92de-6ebeb97a5954	parent_92892110	parent_92892110@zinat.local	$2b$10$RG4vc8iAMiShvZwgHL.1puS2SDzC.JxjfN4NC0MLjxChLiGmKhq4W	والدة	الطالب شعيب المسكري	parent	\N	92892110	\N	\N	t	\N	1	2025-11-01 13:05:19.823563	2025-11-01 13:05:19.823563
6083c320-18c6-4eb8-b865-c9570e321761	parent_96563080	parent_96563080@zinat.local	$2b$10$w.Oi6ns8kDABXDP3JO8XBu0vCkmBMK6O.RwG5fVwwKYo1.otk8JYa	والد	الطالب شعيب المسكري	parent	\N	96563080	\N	\N	t	\N	1	2025-11-01 13:05:19.894231	2025-11-01 13:05:19.894231
a2f434d3-383b-46e7-9162-f727890716e3	parent_95677123	parent_95677123@zinat.local	$2b$10$YSR5YtWIpTxSmn3s7DWYmuPgmX/zrUm9456uIEBfHTg0SvsGEdYk.	والدة	الطالب سبأ الغزالية	parent	\N	95677123	\N	\N	t	\N	1	2025-11-01 13:05:19.96895	2025-11-01 13:05:19.96895
ee815e9f-bd7f-4b66-a445-6c68e5f69c07	parent_96035441	parent_96035441@zinat.local	$2b$10$VUbty3Eos6roAecIdmzZyuwqBPuc3yDSdCJeR6HgJaHlK.ZGETspO	والد	الطالب سبأ الغزالية	parent	\N	96035441	\N	\N	t	\N	1	2025-11-01 13:05:20.03921	2025-11-01 13:05:20.03921
30fb87e9-61a0-4cb0-9efb-0c3ce40b6104	parent_95412391	parent_95412391@zinat.local	$2b$10$6m6uWOAAoEephLmCR9rVOe7OrnIIUP3SJZHp1FrIwpbAsKHaG.Mbq	والدة	الطالب جمان السعدية	parent	\N	95412391	\N	\N	t	\N	1	2025-11-01 13:05:20.115405	2025-11-01 13:05:20.115405
8e10ee08-86a5-485a-9262-58ff35a54fae	parent_99071736	parent_99071736@zinat.local	$2b$10$Gzww.hujNYhgFcnlcdj.TeZnhsQRyEEUjQ2f8orPdl2dwJHHuSoo6	والد	الطالب جمان السعدية	parent	\N	99071736	\N	\N	t	\N	1	2025-11-01 13:05:20.187406	2025-11-01 13:05:20.187406
66706916-0a1a-4864-842a-e8c5391e9833	parent_92891771	parent_92891771@zinat.local	$2b$10$btC1g95H3mxEEW1SuRBuNu5MTUswmdMCdvVLGSdwPGqUohieSy6z.	والدة	الطالب سعود الراشدي	parent	\N	92891771	\N	\N	t	\N	1	2025-11-01 13:05:20.262047	2025-11-01 13:05:20.262047
e84b4419-0154-4ba7-b904-ba15401694ff	parent_92511613	parent_92511613@zinat.local	$2b$10$YDnq4r4Z0S3DPhQvL4wjberj3aMkNyzREcPiJ.2OnTPVs9e/.gPdS	والد	الطالب سعود الراشدي	parent	\N	92511613	\N	\N	t	\N	1	2025-11-01 13:05:20.333235	2025-11-01 13:05:20.333235
418eff25-67e1-4c9a-a06c-a712fcc18dd7	parent_95343856	parent_95343856@zinat.local	$2b$10$Q2838a57VefotUiYbMOCP.OR1eFW3BwFp1Y.KVekhI6Tk3RXpYjde	والدة	الطالب منذر الحارثي	parent	\N	95343856	\N	\N	t	\N	1	2025-11-01 13:05:20.408055	2025-11-01 13:05:20.408055
8afb2012-6421-4ba4-be28-68f2b449c544	parent_95555857	parent_95555857@zinat.local	$2b$10$U9UwOfUTXrxLj1LjDFdp7.YMQ1GCmVr38mlH6sII3/QWPbYrcaO4W	والد	الطالب منذر الحارثي	parent	\N	95555857	\N	\N	t	\N	1	2025-11-01 13:05:20.479162	2025-11-01 13:05:20.479162
a96d6cab-67dc-4179-8a49-7bb79f239a2f	parent_91480091	parent_91480091@zinat.local	$2b$10$XnBvvPTICkqiEb9iu/1gyOnoy/7Re/NlfEwH0WqklN7J2xHgZI6ta	والدة	الطالب أحمد المسكري	parent	\N	91480091	\N	\N	t	\N	1	2025-11-01 13:05:20.558559	2025-11-01 13:05:20.558559
9e214396-7060-4258-a3ea-c73cfd2e5cbf	parent_99884447	parent_99884447@zinat.local	$2b$10$5Jg4.Xjnf2BshJIjk6dUteccSafR7i1fEuCxW/1pKCdr5ujfgjr2y	والدة	الطالب محمد المصلحي	parent	\N	99884447	\N	\N	t	\N	1	2025-11-01 13:05:20.633116	2025-11-01 13:05:20.633116
320f0cdb-71ed-488b-96bb-3f87700dfc73	parent_99098811	parent_99098811@zinat.local	$2b$10$cJvtJ6x95yPo1wiEwcs2d.BTv0F8uLyYgTFq9EDzLOo9vMqaGMEBW	والد	الطالب محمد المصلحي	parent	\N	99098811	\N	\N	t	\N	1	2025-11-01 13:05:20.704345	2025-11-01 13:05:20.704345
375cd22f-3159-405d-8a4f-c3d496602a5d	teacher_أريام	أريام@zinat.local	$2b$10$esfM2JwKQPrLWafRDJe5FeucUM82Sz7SyFlZxqhJrsClTA/gyMqve	أريام	معلمة	teacher	\N	\N	\N	\N	t	\N	1	2025-11-01 13:05:20.78087	2025-11-01 13:05:20.78087
7ace12da-6a3f-44eb-a654-cca95bd15fec	parent_94440912	parent_94440912@zinat.local	$2b$10$f9iKQhy2Ksnc6/K6rIoOTeC0h3EZKq7ne2LxnycdyNvfM4zIj3Rse	والدة	الطالب الفراهيد المسكري	parent	\N	94440912	\N	\N	t	\N	1	2025-11-01 13:05:20.855191	2025-11-01 13:05:20.855191
3f8df0e2-0f57-452f-9cde-60d97127b9e5	parent_97040030	parent_97040030@zinat.local	$2b$10$taF7f7heniyPaZpC6wK8.O9ny5x9y9AYLOtTyPhqWWSFFNdGscqJO	والد	الطالب الفراهيد المسكري	parent	\N	97040030	\N	\N	t	\N	1	2025-11-01 13:05:20.925722	2025-11-01 13:05:20.925722
58135a72-0ae8-40b6-8dff-9883f9c8ea20	parent_91414109	parent_91414109@zinat.local	$2b$10$L4.C.unO8nEhtsxnxt9Ca.KsZjVDtZDYzC//YSmwXOMGt1eMa/nsW	والدة	الطالب سعد السيابي	parent	\N	91414109	\N	\N	t	\N	1	2025-11-01 13:05:21.003725	2025-11-01 13:05:21.003725
abd5c148-d97c-4244-acdf-95e7cf92ed99	parent_96447447	parent_96447447@zinat.local	$2b$10$ZMybKQem0xi3mujzQdoJI.TiKX7Nuo3x7tkX2tZ0Uejfq8H/6Zj0S	والد	الطالب سعد السيابي	parent	\N	96447447	\N	\N	t	\N	1	2025-11-01 13:05:21.074232	2025-11-01 13:05:21.074232
d32b1825-75d6-444f-84ea-f855f1686006	parent_92343800	parent_92343800@zinat.local	$2b$10$aWzshpd3lt3NtW9kWTp.VOB/PltueXS57BDy57NTcHMuwVWcA3aaO	والدة	الطالب سندس البوسعيدي	parent	\N	92343800	\N	\N	t	\N	1	2025-11-01 13:05:21.149967	2025-11-01 13:05:21.149967
67c95ba0-a344-456e-9fc4-afda775bf2b4	parent_0	parent_0@zinat.local	$2b$10$XLkT.UheMkB8TZs3/nOhae/J8aCTaBwzwZLrouva8NZUQeuR2HTne	والد	الطالب سندس البوسعيدي	parent	\N	0	\N	\N	t	\N	1	2025-11-01 13:05:21.220705	2025-11-01 13:05:21.220705
5949e018-3869-4bd4-a2f4-3856e8065e95	parent_96033203	parent_96033203@zinat.local	$2b$10$N4fK7heySWl3NBHgxpjifOp6I9H2yz7j.5NcqQtSRZhHt.c0yg50a	والدة	الطالب حور الكعبية	parent	\N	96033203	\N	\N	t	\N	1	2025-11-01 13:05:21.296475	2025-11-01 13:05:21.296475
560baa98-ab6a-4b02-977c-d43c311dc74f	parent_97726332	parent_97726332@zinat.local	$2b$10$9VWtm4r4DNFyO39vfb2i3u7v0Ecah6Wy7LpHvo91aopiK4RJ.Kik.	والد	الطالب حور الكعبية	parent	\N	97726332	\N	\N	t	\N	1	2025-11-01 13:05:21.367191	2025-11-01 13:05:21.367191
b4d86f70-82cd-4053-92f4-16efd5f1e6a7	parent_96120070	parent_96120070@zinat.local	$2b$10$lfTuE92N2RFbM5OaxEb0xOB/LDS/XP4UqsROa4EWtrWayqhWlXHUy	والدة	الطالب سعيد الرحبي	parent	\N	96120070	\N	\N	t	\N	1	2025-11-01 13:05:21.441868	2025-11-01 13:05:21.441868
4c5ddd4d-2a22-4d50-ba19-14283117f045	parent_96282216	parent_96282216@zinat.local	$2b$10$4tV2xm1CwDhjlwVWicuyTeldZZf0kKojk9nae9PuN0AAmzY1DlUlG	والد	الطالب سعيد الرحبي	parent	\N	96282216	\N	\N	t	\N	1	2025-11-01 13:05:21.511999	2025-11-01 13:05:21.511999
08ca1d7d-f5a9-4b41-a20b-cb65f1b338b7	parent_96479736	parent_96479736@zinat.local	$2b$10$oand6QwJwMO5So5QLEsD/OjlKdyWaXh0MdurKCe/mjWzs34Uu4LdC	والدة	الطالب أمين الإسماعيلي	parent	\N	96479736	\N	\N	t	\N	1	2025-11-01 13:05:21.586842	2025-11-01 13:05:21.586842
1af68d72-ffff-4b22-9787-020bf14a8a22	parent_92788803	parent_92788803@zinat.local	$2b$10$AM0qBWfFdp0rLpZPFs/ClO8Aa6btTtQXI3cndifKlDGaav/sVjgmO	والد	الطالب أمين الإسماعيلي	parent	\N	92788803	\N	\N	t	\N	1	2025-11-01 13:05:21.658006	2025-11-01 13:05:21.658006
3a28697b-13db-4fcf-b7af-d1a92a74f215	parent_97609904	parent_97609904@zinat.local	$2b$10$HfvekQ/mqzFXAoYkUjPqr.O1GI8h26cPppo/kaJSjyItHpf4F2Ql.	والدة	الطالب سديم الرحبية	parent	\N	97609904	\N	\N	t	\N	1	2025-11-01 13:05:21.734285	2025-11-01 13:05:21.734285
4d9da7c4-6b9a-45f2-82c6-8496ead3892f	parent_96754623	parent_96754623@zinat.local	$2b$10$t0kdMdWPf2KYAHOz4n1c.OkdyqJh0pt9jiej1vqJ3gvS9n8JSSCZC	والد	الطالب سديم الرحبية	parent	\N	96754623	\N	\N	t	\N	1	2025-11-01 13:05:21.805117	2025-11-01 13:05:21.805117
eeca9c82-7fcc-43d4-83f8-5503573ebebd	parent_97466312	parent_97466312@zinat.local	$2b$10$w6AlSnGotQyQ2CQvRXyX.eHLZE.fRfJax96rzKcxFg043A58u7AdC	والدة	الطالب آدم اليزيدي	parent	\N	97466312	\N	\N	t	\N	1	2025-11-01 13:05:21.881058	2025-11-01 13:05:21.881058
114998a2-d21a-445e-bd4d-05493e3a4590	parent_97966312	parent_97966312@zinat.local	$2b$10$pCinhN9M5oiXDTmw8S.42uz0HNAY7irZdGBdDhowF5DpI11ao3Dti	والد	الطالب آدم اليزيدي	parent	\N	97966312	\N	\N	t	\N	1	2025-11-01 13:05:21.951468	2025-11-01 13:05:21.951468
0edffcf3-0623-4e71-9702-5e728f566d7f	parent_98883020	parent_98883020@zinat.local	$2b$10$TAn.MljoRfQrOT1RK6T.SuvMm/IeHOq26tYXluyUqetOd9ZO0qCMO	والدة	الطالب فاطمة المسكرية	parent	\N	98883020	\N	\N	t	\N	1	2025-11-01 13:05:22.026573	2025-11-01 13:05:22.026573
679e94d1-0e8d-4842-beec-ab0329ea0e99	parent_99459947	parent_99459947@zinat.local	$2b$10$5qoS76ypxFmaeNx.D3CRde3AjR.OJWRSbqlFlm0vixbg0lQQgh6Fy	والد	الطالب فاطمة المسكرية	parent	\N	99459947	\N	\N	t	\N	1	2025-11-01 13:05:22.09613	2025-11-01 13:05:22.09613
0ad9739d-fd32-415b-8acc-2c156d88a1d8	parent_92230881	parent_92230881@zinat.local	$2b$10$PqbE/qT.yOWdqACMzCemuON6c/Mg34Tfp2DmovWRffn.JMcdbhJGm	والدة	الطالب فَلَكْ السعدية	parent	\N	92230881	\N	\N	t	\N	1	2025-11-01 13:05:22.170503	2025-11-01 13:05:22.170503
5b10a206-fcdd-445c-b916-95ab72d1549b	parent_95395062	parent_95395062@zinat.local	$2b$10$ushQkbuBlBV6C4iPgIHBg.DFRicbRadj9KNzQL160vZ7IC/UdW4WK	والد	الطالب فَلَكْ السعدية	parent	\N	95395062	\N	\N	t	\N	1	2025-11-01 13:05:22.241204	2025-11-01 13:05:22.241204
2d03e2c4-b0eb-4193-a161-6c88f0521d14	parent_99368119	parent_99368119@zinat.local	$2b$10$8E/PsmSiG/YhrQ1djGwdSuDr4rG8E.BoQE7kmJiJ8XWzOKgTy9Cdi	والدة	الطالب صالح المسكري	parent	\N	99368119	\N	\N	t	\N	1	2025-11-01 13:05:22.315194	2025-11-01 13:05:22.315194
850eef0b-ff54-47e4-90d5-14a867833327	parent_99006071	parent_99006071@zinat.local	$2b$10$Zumgzl.nF8JX8qDHlmoJIunH689Lb8VYlem04JFiva2uZ2i.jOeb6	والد	الطالب صالح المسكري	parent	\N	99006071	\N	\N	t	\N	1	2025-11-01 13:05:22.386195	2025-11-01 13:05:22.386195
1dba2988-dc5c-49e2-b610-5e71a7b801da	parent_92196942	parent_92196942@zinat.local	$2b$10$iT16ff1Jccc0vZjFxpKBjOVyJPI6TIYGXNehe4UmcqtGE9izQQA5m	والدة	الطالب أحمد الغنيمي	parent	\N	92196942	\N	\N	t	\N	1	2025-11-01 13:05:22.461154	2025-11-01 13:05:22.461154
fc7beb60-80cb-4b79-b5fa-2d3d12a65b8e	parent_97666325	parent_97666325@zinat.local	$2b$10$WNPgget.FoYCPFNUgs38n.uDDD.sjw.5BWyoEn53ukUgGa0ofw8RO	والد	الطالب أحمد الغنيمي	parent	\N	97666325	\N	\N	t	\N	1	2025-11-01 13:05:22.531655	2025-11-01 13:05:22.531655
0ecc2e97-e108-43ff-bc55-c742c3e1f8d4	parent_93913164	parent_93913164@zinat.local	$2b$10$UyUc/eJx10v.TwEJ6NPoxeh2GVaIYm102vWdOnEaf8w1C2vX3yntW	والدة	الطالب سالم الحارثي	parent	\N	93913164	\N	\N	t	\N	1	2025-11-01 13:05:22.605685	2025-11-01 13:05:22.605685
f40df012-0e7b-49d9-85bb-a49365c1984c	parent_92876168	parent_92876168@zinat.local	$2b$10$xvmRk3EpkbgxY6foVahYeuaVUYUMmDPU1Qa.iBiWaOeQyqiBsuMga	والد	الطالب سالم الحارثي	parent	\N	92876168	\N	\N	t	\N	1	2025-11-01 13:05:22.676588	2025-11-01 13:05:22.676588
4e889507-748c-42a5-b7ab-bfb8d464b1da	parent_95980543	parent_95980543@zinat.local	$2b$10$v6rHCXiYx.IlDbOMceE7xuvYHylmBZQcFDk1HyTU7lKDfxM3/KNOK	والدة	الطالب قيس الرواحي	parent	\N	95980543	\N	\N	t	\N	1	2025-11-01 13:05:22.750407	2025-11-01 13:05:22.750407
33041e4b-f11a-4334-b4cd-0530433ae3ce	parent_95572958	parent_95572958@zinat.local	$2b$10$tGwjUdfY8buxhUw.QJccEuDZ8fDppA6SujT1ZtKWAjqPXa.ytx4g2	والد	الطالب قيس الرواحي	parent	\N	95572958	\N	\N	t	\N	1	2025-11-01 13:05:22.820396	2025-11-01 13:05:22.820396
3fddc882-3807-4549-b6e3-82624ae80c58	parent_93834262	parent_93834262@zinat.local	$2b$10$nK7T3jhh6LHc.u4jqMVnyO5o.ULOchY/O4cSThp5Kzysnl1emqGzm	والدة	الطالب غزل المعمرية	parent	\N	93834262	\N	\N	t	\N	1	2025-11-01 13:05:22.894388	2025-11-01 13:05:22.894388
a0e1619d-9000-42ab-aaad-2fd52513ad5c	parent_92527773	parent_92527773@zinat.local	$2b$10$i2kgcx7XOECd7uSUdD5Qmuxi2OrXfTMNIZLFAZ5qNQbOF2nVtq15K	والد	الطالب غزل المعمرية	parent	\N	92527773	\N	\N	t	\N	1	2025-11-01 13:05:22.964257	2025-11-01 13:05:22.964257
2ca13efe-bcfc-4f76-b25d-ebd544a5c652	parent_93377754	parent_93377754@zinat.local	$2b$10$.NfbEchIlRXVuMN58C0NPe6j0l10Lmy4oJ/FtXJ9GRtiCjJxdJXIK	والدة	الطالب أثير الحارثية	parent	\N	93377754	\N	\N	t	\N	1	2025-11-01 13:05:23.038268	2025-11-01 13:05:23.038268
61d74fbe-fa29-4c37-bf8b-fc3908f6f2a4	parent_78423209	parent_78423209@zinat.local	$2b$10$Vg62udEYLGDy0dsXub3wRuyo3zYDiOfGJDS8N0eH.QhmZKZcpMc/S	والد	الطالب أثير الحارثية	parent	\N	78423209	\N	\N	t	\N	1	2025-11-01 13:05:23.108404	2025-11-01 13:05:23.108404
62184b85-92d0-4605-b538-fbbba60f4686	parent_95590378	parent_95590378@zinat.local	$2b$10$maRW4hPOGmIp2E8eEeeGjewzZFuUdAl9gIkkxQ8SO9rEdDdZN.QSa	والدة	الطالب عمر سعيدالسعدي	parent	\N	95590378	\N	\N	t	\N	1	2025-11-01 13:05:23.183072	2025-11-01 13:05:23.183072
82357b55-c762-4d51-800d-20ac2eb6f137	parent_95874762	parent_95874762@zinat.local	$2b$10$qkft8VtgFrwSwr2rf/SpweH98Ne0Fa4oaMKFMuUaIBxzn1GNOU1lK	والدة	الطالب غياث الرحبي	parent	\N	95874762	\N	\N	t	\N	1	2025-11-01 13:05:23.258195	2025-11-01 13:05:23.258195
a18db352-b86b-4daf-b0b9-65d7c71a7684	parent_99247020	parent_99247020@zinat.local	$2b$10$xp1.gPfzBMXNh4H7CNCJ.uq9G05duX9P7PpPg7q4R8GKdjJtRJmS.	والدة	الطالب ناصر المغيري	parent	\N	99247020	\N	\N	t	\N	1	2025-11-01 13:05:23.332803	2025-11-01 13:05:23.332803
a084f27d-50cb-4be5-bdb9-32b39ad36725	parent_96643889	parent_96643889@zinat.local	$2b$10$4.g6ARMJ8.WWXnOJDldI4.A3xEyoTCUOJuSkNw/t6Sbsi8VD0fHpm	والدة	الطالب أحمد الحارثي	parent	\N	96643889	\N	\N	t	\N	1	2025-11-01 13:05:23.406664	2025-11-01 13:05:23.406664
a5443406-8818-405e-8ff2-3e7692560d93	parent_99448812	parent_99448812@zinat.local	$2b$10$ufd/2SIfJo8WFyXD5R8QJeHI4JzV6LNKoug8pOgPXnz1RGceYOBO.	والد	الطالب أحمد الحارثي	parent	\N	99448812	\N	\N	t	\N	1	2025-11-01 13:05:23.477368	2025-11-01 13:05:23.477368
80b3437c-5776-47c8-bf15-dfc61406704f	teacher_هاجر	هاجر@zinat.local	$2b$10$GHMtEAT2gEabv3dpgvFGOOSihmWA.JJ.aWyzixSXogzd9MHV0W2O.	هاجر	معلمة	teacher	\N	\N	\N	\N	t	\N	1	2025-11-01 13:05:23.550162	2025-11-01 13:05:23.550162
2c6a8996-3fc3-4b82-a28a-e0d09eb7e7e6	parent_96649677	parent_96649677@zinat.local	$2b$10$mJpblkyUmKnTo4o/q.q0culfSqEdcO7Pu5vBZxGm9jOxKhZXWLgNG	والدة	الطالب سعيد المسكري	parent	\N	96649677	\N	\N	t	\N	1	2025-11-01 13:05:23.623107	2025-11-01 13:05:23.623107
06eae867-7451-4928-b39c-efaf1d89cb97	parent_98881883	parent_98881883@zinat.local	$2b$10$kheMZYZ7w66vqVQRGjejkOXnWyHuVOa9oKhaDqFWkzKuUTumUJtXW	والدة	الطالب أواب المغيري	parent	\N	98881883	\N	\N	t	\N	1	2025-11-01 13:05:23.702837	2025-11-01 13:05:23.702837
5a29b8bd-5abd-457f-a88a-ea17da54bb5a	parent_92546618	parent_92546618@zinat.local	$2b$10$SZ1ZMm3guBk.UF52B0QI8uFJlVc6.y/BR.dNxQf9qumUOaHsxpBmm	والد	الطالب أواب المغيري	parent	\N	92546618	\N	\N	t	\N	1	2025-11-01 13:05:23.773256	2025-11-01 13:05:23.773256
b3d25e2e-166b-4e16-963f-c7eb5dbd1a25	parent_91916066	parent_91916066@zinat.local	$2b$10$WSHnKxqP0qqukEfExbfaAOVCrVnfEdEIZtgCJHlsmOxwAd5NRlqgC	والدة	الطالب أحمد البوسعيدي	parent	\N	91916066	\N	\N	t	\N	1	2025-11-01 13:05:23.857298	2025-11-01 13:05:23.857298
cd710bef-f94f-411e-95af-e41c25b6dfa4	parent_92154206	parent_92154206@zinat.local	$2b$10$SVFXIQSeV.8MIyRh443PwOYHA7vUtex/EwARkGcFsYs1aS7M1UZJa	والدة	الطالب حذام المغيرية	parent	\N	92154206	\N	\N	t	\N	1	2025-11-01 13:05:23.932503	2025-11-01 13:05:23.932503
d1c5048d-c936-4428-b86c-389e8ef99f27	parent_99597217	parent_99597217@zinat.local	$2b$10$VSyNdIvu/wI54WzIOOqFH.ZANWImvmiGOuuFg23O8sw5wDLIjCxuy	والد	الطالب حذام المغيرية	parent	\N	99597217	\N	\N	t	\N	1	2025-11-01 13:05:24.00419	2025-11-01 13:05:24.00419
fa1fbdb7-4a31-4ea2-ace0-0887be03ebdd	parent_93344100	parent_93344100@zinat.local	$2b$10$385Hw.wLjkZSWte0n3IJIuCQDMMsfxf/Wa7Xif62DF3Uj6u0y1Gbi	والدة	الطالب رغد المقبالية	parent	\N	93344100	\N	\N	t	\N	1	2025-11-01 13:05:24.079856	2025-11-01 13:05:24.079856
c99ea4b6-1226-40bb-ba4a-40bdb793a186	parent_99770060	parent_99770060@zinat.local	$2b$10$rRV8VFf6ZjvBIZ.qYeY1eOfrUc3hnciws6yVGeLPgysKk7bWWG2bO	والد	الطالب رغد المقبالية	parent	\N	99770060	\N	\N	t	\N	1	2025-11-01 13:05:24.150674	2025-11-01 13:05:24.150674
63e3f2ee-ebba-4448-9cf6-97034ef5de6e	parent_95594241	parent_95594241@zinat.local	$2b$10$xdmyMM4GAifyBGOtXDCQLe5.bVFcdb9FnDmRMZ2RLn1xTNsrrIIQm	والدة	الطالب ذياب المعمري	parent	\N	95594241	\N	\N	t	\N	1	2025-11-01 13:05:24.223286	2025-11-01 13:05:24.223286
4e93ec2a-c5b9-4339-9641-e06b61c71235	parent_91166850	parent_91166850@zinat.local	$2b$10$9sR6cEHv0HSky.oGKMYvxOtT5UBkeYDlNqMIj1pJp3gnUvyiU.6iW	والد	الطالب ذياب المعمري	parent	\N	91166850	\N	\N	t	\N	1	2025-11-01 13:05:24.293646	2025-11-01 13:05:24.293646
67c5764d-3226-495f-9c90-065fade5a635	parent_95402296	parent_95402296@zinat.local	$2b$10$ie2w4iJwIClaVQ2LX72kWOHntwEpiw5E0Ia1wRYCfmw4jKM8v5Lhe	والدة	الطالب علي السعدي	parent	\N	95402296	\N	\N	t	\N	1	2025-11-01 13:05:24.372194	2025-11-01 13:05:24.372194
555b318d-1aeb-442e-8781-1d5debe0d95b	parent_99232016	parent_99232016@zinat.local	$2b$10$3mOq3KvhW2CdupOTrjsdCuMGrV0OB/DFRe79RztqsMwuSnrqsAMYW	والد	الطالب علي السعدي	parent	\N	99232016	\N	\N	t	\N	1	2025-11-01 13:05:24.442969	2025-11-01 13:05:24.442969
acce19fe-feec-45e7-86d5-a28e079fefad	parent_99760666	parent_99760666@zinat.local	$2b$10$a0rqm1QvDAas2Yp.7a4ajuhXzIGWM6XoVbVeRRR4J6D.bupBMNXpW	والدة	الطالب عبد الريامي	parent	\N	99760666	\N	\N	t	\N	1	2025-11-01 13:05:24.518738	2025-11-01 13:05:24.518738
b2508337-08de-4efa-b9ad-8e20efd1f855	parent_91112455	parent_91112455@zinat.local	$2b$10$VDQ1IkOnzbw8kPfO84X2wOCvhxmihWbNai8ChzpJi0v4mNrIreZSi	والد	الطالب عبد الريامي	parent	\N	91112455	\N	\N	t	\N	1	2025-11-01 13:05:24.589141	2025-11-01 13:05:24.589141
e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5	admin	admin@zinatalhaykindergarten.com	$2b$10$fsTgvjtE9fVv58rm.q4AZecctEMkED41kOIhXf/invBEcFJu9gStC	System	Administrator	admin	\N	+966-11-123-4567	Main Office, Zinat Al-Haya Kindergarten	\N	t	2026-01-20 20:53:29.635	1	2025-10-27 22:32:01.334252	2026-01-20 20:53:29.637546
d2260ae9-931a-4e45-9fcd-e13a6930e7c1	\N	Zahra@gmail.com	$2b$12$N5PX61ktK4L4nJmszTwuH.nQXfptyq6TDmVSYwRfGQhUfpvLfo9KG	Zahra	Administrator	admin	\N	+968 9999 0000	\N	\N	t	2026-01-20 20:47:18.901	1	2025-11-21 09:54:33.412	2026-01-20 20:47:18.909885
857e6bf6-96ad-4b62-a176-8222ef36cfb9	\N	parent.test@zinat.local	$2b$10$9dGVstokE5JNNN52SWUlO.ckpvVqfTyzLt/5rRhOkGremal2UxXsO	أحمد	المحمدي	parent	\N	+968 9123 4567	\N	\N	t	\N	1	2025-11-21 11:15:33.084993	2025-11-21 11:15:33.084993
f800de52-f824-4d47-adc1-af5f59850718	parent_91110090	parent_91110090@zinat.local	$2b$10$82H7SI6A2b4zPo7EbbenrONZV1TrgjjA/IjAXWiKc8301nBguCd3G	والد	الطالب إيلاف الإسماعيلية	parent	\N	91110090	\N	\N	t	2025-11-21 13:22:53.777	1	2025-11-01 13:05:25.602437	2025-11-21 13:22:53.780849
f15cb2a9-6ca4-4a40-a5a3-515986a9b573	parent_92098917	parent_92098917@zinat.local	$2b$10$Llsn//FPbCTg8l7UEHNZMOXMzPNdHOJi5oO8kmT7lq8tMAJgniGfK	والدة	الطالب تميم المعمري	parent	\N	92098917	\N	\N	t	\N	1	2025-11-01 13:05:24.66191	2025-11-01 13:05:24.66191
52908c20-159f-4544-a5c6-476dcdcc3da2	parent_94000862	parent_94000862@zinat.local	$2b$10$8eX9PhOOfH9ehT.bPPPT5.XgEnoT5LA8UTfMgVxecxqyIwDGmkUjq	والد	الطالب تميم المعمري	parent	\N	94000862	\N	\N	t	\N	1	2025-11-01 13:05:24.732235	2025-11-01 13:05:24.732235
649857de-a8a7-4d0a-8d2a-dd4f604c1178	parent_99797173	parent_99797173@zinat.local	$2b$10$heHEK9/F1R5BUwPUi.LuK.jsEkwN4y8WPKI1X6fbmh9G5J9f6Tpn.	والدة	الطالب جنى الحارثية	parent	\N	99797173	\N	\N	t	\N	1	2025-11-01 13:05:24.806485	2025-11-01 13:05:24.806485
89327c1d-ad23-4064-89f6-1529bcec86c5	parent_95167988	parent_95167988@zinat.local	$2b$10$cZAhIB7JyX3AYAN1q/tAI.mdwIo2fbM.umBEPJcnCfc5G5c76IpCW	والد	الطالب جنى الحارثية	parent	\N	95167988	\N	\N	t	\N	1	2025-11-01 13:05:24.877061	2025-11-01 13:05:24.877061
3c942acf-3b20-4274-b93e-2d6981184843	parent_99374116	parent_99374116@zinat.local	$2b$10$H63ptZfYhYBUqQ2m40JmN.OnjfHVO4r3d/R/.7sQMgkPF7Y43kJ7K	والدة	الطالب حمود الحارثي	parent	\N	99374116	\N	\N	t	\N	1	2025-11-01 13:05:24.951389	2025-11-01 13:05:24.951389
ae5c9f8d-7079-40e6-a84f-b24c2512195b	parent_93238000	parent_93238000@zinat.local	$2b$10$HzxVUfJXVFNitXfvCbWfz.XKaYNG4Fxxm4BvQQuW/MuDrprjBahwi	والد	الطالب حمود الحارثي	parent	\N	93238000	\N	\N	t	\N	1	2025-11-01 13:05:25.022553	2025-11-01 13:05:25.022553
fd5795fa-6777-4c76-b7a9-610efa0185cc	parent_91144364	parent_91144364@zinat.local	$2b$10$4HoW7WvFP6fxwnGhER4JUe9SLmWOkx68VjM6Q18O/adVxX3f35yue	والدة	الطالب عهد السعدي	parent	\N	91144364	\N	\N	t	\N	1	2025-11-01 13:05:25.097023	2025-11-01 13:05:25.097023
4a26a14d-2415-41ff-97fa-fca1a858a5a2	parent_96026650	parent_96026650@zinat.local	$2b$10$DifaSy0a4drKwA0mp9KPZuAY8dhJ86uqTuWXXlJ.9bVr6TnlUAyt6	والد	الطالب عهد السعدي	parent	\N	96026650	\N	\N	t	\N	1	2025-11-01 13:05:25.166798	2025-11-01 13:05:25.166798
4ca4a4ed-30d7-4ed1-b9e8-4c080082ef2a	parent_97763603	parent_97763603@zinat.local	$2b$10$e3.LkrLmjeJ37Oc0tAxdbekQcIXrlz5lRfDVihSFGpWI4pKu9u1r.	والدة	الطالب عفان السيابي	parent	\N	97763603	\N	\N	t	\N	1	2025-11-01 13:05:25.241008	2025-11-01 13:05:25.241008
9b6410bd-9cea-4b0d-a95b-3174233a9ea0	parent_96117377	parent_96117377@zinat.local	$2b$10$ztVwss2zg5FSN/eFYQbzN.40Iib29rd/Z.S10S5H0ULpO.xDJmewK	والد	الطالب عفان السيابي	parent	\N	96117377	\N	\N	t	\N	1	2025-11-01 13:05:25.311126	2025-11-01 13:05:25.311126
c088677c-7f6b-4123-82f4-f9ceaf0f6fcb	parent_98999149	parent_98999149@zinat.local	$2b$10$aMThrFbwezMZmNKiioy8CuBTVv8vZbSmtdrA7R/0GTmZFV3iLysn6	والدة	الطالب شيم المسكري	parent	\N	98999149	\N	\N	t	\N	1	2025-11-01 13:05:25.385577	2025-11-01 13:05:25.385577
f5ccd2fe-8571-4670-b418-64a0e36d976c	parent_93877877	parent_93877877@zinat.local	$2b$10$WVleBubI4L71EONFLgfffORAI18Braz0eIYlG0C1GRab.QL5FW5y.	والد	الطالب شيم المسكري	parent	\N	93877877	\N	\N	t	\N	1	2025-11-01 13:05:25.455715	2025-11-01 13:05:25.455715
4bb98e15-1b98-42b8-bca4-bcd845dcb680	parent_97939293	parent_97939293@zinat.local	$2b$10$1SUOqpD.VqvD2rhbpBRGTO5a3gzAM4CGNxtCpOOdgZsRkyAf6B6Ha	والدة	الطالب إيلاف الإسماعيلية	parent	\N	97939293	\N	\N	t	\N	1	2025-11-01 13:05:25.530895	2025-11-01 13:05:25.530895
\.


--
-- Data for Name: weekly_session_plans; Type: TABLE DATA; Schema: public; Owner: school_admin
--

COPY public.weekly_session_plans (id, schedule_id, week_start_date, week_end_date, task_title, task_description, is_completed, completion_date, completion_notes, created_by, created_at, updated_at, session_status, completion_description, completed_by, completed_at) FROM stdin;
\.


--
-- Name: activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: school_admin
--

SELECT pg_catalog.setval('public.activities_id_seq', 1, false);


--
-- Name: attendances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: school_admin
--

SELECT pg_catalog.setval('public.attendances_id_seq', 20, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: school_admin
--

SELECT pg_catalog.setval('public.migrations_id_seq', 2, true);


--
-- Name: parents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: school_admin
--

SELECT pg_catalog.setval('public.parents_id_seq', 247, true);


--
-- Name: reminders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: school_admin
--

SELECT pg_catalog.setval('public.reminders_id_seq', 1, false);


--
-- Name: rooms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: school_admin
--

SELECT pg_catalog.setval('public.rooms_id_seq', 6, true);


--
-- Name: schools_id_seq; Type: SEQUENCE SET; Schema: public; Owner: school_admin
--

SELECT pg_catalog.setval('public.schools_id_seq', 1, true);


--
-- Name: session_media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: school_admin
--

SELECT pg_catalog.setval('public.session_media_id_seq', 15, true);


--
-- Name: staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: school_admin
--

SELECT pg_catalog.setval('public.staff_id_seq', 1, true);


--
-- Name: student_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: school_admin
--

SELECT pg_catalog.setval('public.student_progress_id_seq', 4, true);


--
-- Name: rooms PK_0368a2d7c215f2d0458a54933f2; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY (id);


--
-- Name: milestones PK_0bdbfe399c777a6a8520ff902d9; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT "PK_0bdbfe399c777a6a8520ff902d9" PRIMARY KEY (id);


--
-- Name: academic_years PK_2021b90bfbfa6c9da7df34ca1cf; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.academic_years
    ADD CONSTRAINT "PK_2021b90bfbfa6c9da7df34ca1cf" PRIMARY KEY (id);


--
-- Name: semesters PK_25c393e2e76b3e32e87a79b1dc2; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT "PK_25c393e2e76b3e32e87a79b1dc2" PRIMARY KEY (id);


--
-- Name: reminders PK_38715fec7f634b72c6cf7ea4893; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT "PK_38715fec7f634b72c6cf7ea4893" PRIMARY KEY (id);


--
-- Name: courses PK_3f70a487cc718ad8eda4e6d58c9; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY (id);


--
-- Name: attendances PK_483ed97cd4cd43ab4a117516b69; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "PK_483ed97cd4cd43ab4a117516b69" PRIMARY KEY (id);


--
-- Name: groups PK_659d1483316afb28afd3a90646e; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY (id);


--
-- Name: students PK_7d7f07271ad4ce999880713f05e; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY (id);


--
-- Name: schedules PK_7e33fc2ea755a5765e3564e66dd; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT "PK_7e33fc2ea755a5765e3564e66dd" PRIMARY KEY (id);


--
-- Name: activities PK_7f4004429f731ffb9c88eb486a8; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: schools PK_95b932e47ac129dd8e23a0db548; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT "PK_95b932e47ac129dd8e23a0db548" PRIMARY KEY (id);


--
-- Name: parents PK_9a4dc67c7b8e6a9cb918938d353; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.parents
    ADD CONSTRAINT "PK_9a4dc67c7b8e6a9cb918938d353" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: student_parents PK_ad07904dc74a079fb1d7d82825c; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.student_parents
    ADD CONSTRAINT "PK_ad07904dc74a079fb1d7d82825c" PRIMARY KEY (student_id, parent_id);


--
-- Name: class_settings PK_b0297a43420f60073c0eab523a3; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.class_settings
    ADD CONSTRAINT "PK_b0297a43420f60073c0eab523a3" PRIMARY KEY (id);


--
-- Name: staff PK_e4ee98bb552756c180aec1e854a; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "PK_e4ee98bb552756c180aec1e854a" PRIMARY KEY (id);


--
-- Name: student_progress PK_e7df7ebbbab37cc250594423a38; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.student_progress
    ADD CONSTRAINT "PK_e7df7ebbbab37cc250594423a38" PRIMARY KEY (id);


--
-- Name: phases PK_e93bb53460b28d4daf72735d5d3; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.phases
    ADD CONSTRAINT "PK_e93bb53460b28d4daf72735d5d3" PRIMARY KEY (id);


--
-- Name: student_groups PK_ed5bb94d166be2eb02a40701460; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.student_groups
    ADD CONSTRAINT "PK_ed5bb94d166be2eb02a40701460" PRIMARY KEY (student_id, group_id);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: users UQ_fe0bb3f6520ee0469504521e710; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE (username);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: weekly_session_plans pk_weekly_session_plans; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.weekly_session_plans
    ADD CONSTRAINT pk_weekly_session_plans PRIMARY KEY (id);


--
-- Name: session_media session_media_pkey; Type: CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.session_media
    ADD CONSTRAINT session_media_pkey PRIMARY KEY (id);


--
-- Name: IDX_26f5abac21d5008e18949f7e1a; Type: INDEX; Schema: public; Owner: school_admin
--

CREATE INDEX "IDX_26f5abac21d5008e18949f7e1a" ON public.student_groups USING btree (student_id);


--
-- Name: IDX_3b25a982c6e8629dcb6fdcca68; Type: INDEX; Schema: public; Owner: school_admin
--

CREATE INDEX "IDX_3b25a982c6e8629dcb6fdcca68" ON public.student_groups USING btree (group_id);


--
-- Name: IDX_ab5687be754283635fffe3692e; Type: INDEX; Schema: public; Owner: school_admin
--

CREATE INDEX "IDX_ab5687be754283635fffe3692e" ON public.student_parents USING btree (student_id);


--
-- Name: IDX_d4d691ddbc51607ae462b68e16; Type: INDEX; Schema: public; Owner: school_admin
--

CREATE INDEX "IDX_d4d691ddbc51607ae462b68e16" ON public.student_parents USING btree (parent_id);


--
-- Name: idx_parents_user_id; Type: INDEX; Schema: public; Owner: school_admin
--

CREATE INDEX idx_parents_user_id ON public.parents USING btree (user_id);


--
-- Name: idx_schedules_group_id; Type: INDEX; Schema: public; Owner: school_admin
--

CREATE INDEX idx_schedules_group_id ON public.schedules USING btree (group_id);


--
-- Name: idx_session_media_file_type; Type: INDEX; Schema: public; Owner: school_admin
--

CREATE INDEX idx_session_media_file_type ON public.session_media USING btree (file_type);


--
-- Name: idx_session_media_session_plan_id; Type: INDEX; Schema: public; Owner: school_admin
--

CREATE INDEX idx_session_media_session_plan_id ON public.session_media USING btree (session_plan_id);


--
-- Name: idx_session_media_uploaded_by; Type: INDEX; Schema: public; Owner: school_admin
--

CREATE INDEX idx_session_media_uploaded_by ON public.session_media USING btree (uploaded_by);


--
-- Name: idx_student_parents_parent_id; Type: INDEX; Schema: public; Owner: school_admin
--

CREATE INDEX idx_student_parents_parent_id ON public.student_parents USING btree (parent_id);


--
-- Name: idx_student_parents_student_id; Type: INDEX; Schema: public; Owner: school_admin
--

CREATE INDEX idx_student_parents_student_id ON public.student_parents USING btree (student_id);


--
-- Name: idx_student_progress_student_id; Type: INDEX; Schema: public; Owner: school_admin
--

CREATE INDEX idx_student_progress_student_id ON public.student_progress USING btree (student_id);


--
-- Name: idx_weekly_session_plans_completed_at; Type: INDEX; Schema: public; Owner: school_admin
--

CREATE INDEX idx_weekly_session_plans_completed_at ON public.weekly_session_plans USING btree (completed_at);


--
-- Name: idx_weekly_session_plans_completed_by; Type: INDEX; Schema: public; Owner: school_admin
--

CREATE INDEX idx_weekly_session_plans_completed_by ON public.weekly_session_plans USING btree (completed_by);


--
-- Name: idx_weekly_session_plans_schedule_id; Type: INDEX; Schema: public; Owner: school_admin
--

CREATE INDEX idx_weekly_session_plans_schedule_id ON public.weekly_session_plans USING btree (schedule_id);


--
-- Name: idx_weekly_session_plans_schedule_week; Type: INDEX; Schema: public; Owner: school_admin
--

CREATE INDEX idx_weekly_session_plans_schedule_week ON public.weekly_session_plans USING btree (schedule_id, week_start_date);


--
-- Name: idx_weekly_session_plans_status; Type: INDEX; Schema: public; Owner: school_admin
--

CREATE INDEX idx_weekly_session_plans_status ON public.weekly_session_plans USING btree (session_status);


--
-- Name: idx_weekly_session_plans_week_dates; Type: INDEX; Schema: public; Owner: school_admin
--

CREATE INDEX idx_weekly_session_plans_week_dates ON public.weekly_session_plans USING btree (week_start_date, week_end_date);


--
-- Name: student_progress FK_0e6ffb6e4b3e62948d2cd8f9d25; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.student_progress
    ADD CONSTRAINT "FK_0e6ffb6e4b3e62948d2cd8f9d25" FOREIGN KEY (milestone_id) REFERENCES public.milestones(id);


--
-- Name: users FK_25e1cf8f41bae2f3d11f3c2a028; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_25e1cf8f41bae2f3d11f3c2a028" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: student_groups FK_26f5abac21d5008e18949f7e1af; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.student_groups
    ADD CONSTRAINT "FK_26f5abac21d5008e18949f7e1af" FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: schedules FK_2b9a68c93adbc74afa109bb2a73; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT "FK_2b9a68c93adbc74afa109bb2a73" FOREIGN KEY (room_id) REFERENCES public.rooms(id);


--
-- Name: schedules FK_2c027020a88187efddd0dbb8421; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT "FK_2c027020a88187efddd0dbb8421" FOREIGN KEY (teacher_id) REFERENCES public.users(id);


--
-- Name: schedules FK_330dc11fecc87ead6c8464d9552; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT "FK_330dc11fecc87ead6c8464d9552" FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: staff FK_351341ffb6055ef0907b18e28b9; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "FK_351341ffb6055ef0907b18e28b9" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: student_groups FK_3b25a982c6e8629dcb6fdcca68c; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.student_groups
    ADD CONSTRAINT "FK_3b25a982c6e8629dcb6fdcca68c" FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: class_settings FK_44ada01d1f189a02fec88613fc4; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.class_settings
    ADD CONSTRAINT "FK_44ada01d1f189a02fec88613fc4" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: reminders FK_586e0b8e419125be507701cee2a; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT "FK_586e0b8e419125be507701cee2a" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: courses FK_5d36fddafdb9cabd2df4178160d; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "FK_5d36fddafdb9cabd2df4178160d" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: student_progress FK_5fb6e1954cc0ffbaa4c57440aeb; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.student_progress
    ADD CONSTRAINT "FK_5fb6e1954cc0ffbaa4c57440aeb" FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: groups FK_733c97836a6a5575a5d1c70826b; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "FK_733c97836a6a5575a5d1c70826b" FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id);


--
-- Name: student_progress FK_760b6a9d017ba81f2a33b1bddee; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.student_progress
    ADD CONSTRAINT "FK_760b6a9d017ba81f2a33b1bddee" FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: attendances FK_7874d0af5c1371ad4ea2152e266; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "FK_7874d0af5c1371ad4ea2152e266" FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: student_progress FK_7b7df703b978daed31977bcdd0e; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.student_progress
    ADD CONSTRAINT "FK_7b7df703b978daed31977bcdd0e" FOREIGN KEY (updated_by) REFERENCES public.staff(id);


--
-- Name: courses FK_7f099cebb2ad6533754207a949b; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "FK_7f099cebb2ad6533754207a949b" FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id);


--
-- Name: activities FK_93af199b643c30e2bc55561d306; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "FK_93af199b643c30e2bc55561d306" FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: phases FK_9d14336cfb8bc056f1b8271b094; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.phases
    ADD CONSTRAINT "FK_9d14336cfb8bc056f1b8271b094" FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: semesters FK_a2d5014975f0e10189e2dc45820; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT "FK_a2d5014975f0e10189e2dc45820" FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id);


--
-- Name: students FK_aa8edc7905ad764f85924569647; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_aa8edc7905ad764f85924569647" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: student_parents FK_ab5687be754283635fffe3692ee; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.student_parents
    ADD CONSTRAINT "FK_ab5687be754283635fffe3692ee" FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: groups FK_b0bae95e6d3f33ec73b599c418d; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "FK_b0bae95e6d3f33ec73b599c418d" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: schedules FK_b1e10ac4dc72412af1c3f4d736d; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT "FK_b1e10ac4dc72412af1c3f4d736d" FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: academic_years FK_b293eb7909d2a3aae86c4380713; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.academic_years
    ADD CONSTRAINT "FK_b293eb7909d2a3aae86c4380713" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: parents FK_c94c3cea9b43a18c81269ded41d; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.parents
    ADD CONSTRAINT "FK_c94c3cea9b43a18c81269ded41d" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: staff FK_cec9365d9fc3a3409158b645f2e; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "FK_cec9365d9fc3a3409158b645f2e" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: student_parents FK_d4d691ddbc51607ae462b68e16c; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.student_parents
    ADD CONSTRAINT "FK_d4d691ddbc51607ae462b68e16c" FOREIGN KEY (parent_id) REFERENCES public.parents(id);


--
-- Name: attendances FK_ddb8f8852fc45bebff80106035c; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "FK_ddb8f8852fc45bebff80106035c" FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: attendances FK_e0ff1c3c262fb8b55222e4d8329; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "FK_e0ff1c3c262fb8b55222e4d8329" FOREIGN KEY (recorded_by) REFERENCES public.staff(id);


--
-- Name: milestones FK_ecc11da5b97746ab136a904626f; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT "FK_ecc11da5b97746ab136a904626f" FOREIGN KEY (phase_id) REFERENCES public.phases(id);


--
-- Name: students FK_f8c241265ea322470a2897ce0cd; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_f8c241265ea322470a2897ce0cd" FOREIGN KEY (room_id) REFERENCES public.rooms(id);


--
-- Name: students FK_fb3eff90b11bddf7285f9b4e281; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_fb3eff90b11bddf7285f9b4e281" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: rooms FK_ffaac60590923112dad474b21dc; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT "FK_ffaac60590923112dad474b21dc" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: parents fk_parents_user_id; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.parents
    ADD CONSTRAINT fk_parents_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: staff fk_staff_user_id; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT fk_staff_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: weekly_session_plans fk_weekly_session_plans_created_by; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.weekly_session_plans
    ADD CONSTRAINT fk_weekly_session_plans_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: weekly_session_plans fk_weekly_session_plans_schedule; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.weekly_session_plans
    ADD CONSTRAINT fk_weekly_session_plans_schedule FOREIGN KEY (schedule_id) REFERENCES public.schedules(id) ON DELETE CASCADE;


--
-- Name: session_media session_media_session_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.session_media
    ADD CONSTRAINT session_media_session_plan_id_fkey FOREIGN KEY (session_plan_id) REFERENCES public.weekly_session_plans(id) ON DELETE CASCADE;


--
-- Name: session_media session_media_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: school_admin
--

ALTER TABLE ONLY public.session_media
    ADD CONSTRAINT session_media_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: salim
--

GRANT ALL ON SCHEMA public TO school_admin;


--
-- PostgreSQL database dump complete
--

\unrestrict r1KdYmbiNLG1hToXSGOc74y5Kcni2u9lyUUFfG0YufH4X99XanTMWiplfSuGtBY


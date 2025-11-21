--
-- PostgreSQL database dump
--

\restrict 7qRA6btYa3GkHlOeNv6IH5CbjaCz1hG9YDj0ysK91jdALuysAsbTkhqocg13Zth

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;

DROP DATABASE IF EXISTS school_management;
--
--

CREATE DATABASE school_management WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';



\unrestrict 7qRA6btYa3GkHlOeNv6IH5CbjaCz1hG9YDj0ysK91jdALuysAsbTkhqocg13Zth
\connect school_management
\restrict 7qRA6btYa3GkHlOeNv6IH5CbjaCz1hG9YDj0ysK91jdALuysAsbTkhqocg13Zth

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--



--
--

CREATE TYPE public.courses_status_enum AS ENUM (
    'draft',
    'active',
    'published',
    'inactive',
    'archived'
);



--
--

CREATE TYPE public.groups_status_enum AS ENUM (
    'active',
    'inactive',
    'full'
);



--
--

CREATE TYPE public.students_gender_enum AS ENUM (
    'male',
    'female'
);



--
--

CREATE TYPE public.users_role_enum AS ENUM (
    'admin',
    'teacher',
    'student',
    'parent'
);



SET default_tablespace = '';

SET default_table_access_method = heap;

--
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
--

CREATE TABLE public.activities (
    id integer NOT NULL,
    student_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    data jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);



--
--

CREATE SEQUENCE public.activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
--

ALTER SEQUENCE public.activities_id_seq OWNED BY public.activities.id;


--
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
--

CREATE SEQUENCE public.attendances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
--

ALTER SEQUENCE public.attendances_id_seq OWNED BY public.attendances.id;


--
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



--
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



--
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);



--
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
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
--

CREATE SEQUENCE public.parents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
--

ALTER SEQUENCE public.parents_id_seq OWNED BY public.parents.id;


--
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
--

CREATE SEQUENCE public.reminders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
--

ALTER SEQUENCE public.reminders_id_seq OWNED BY public.reminders.id;


--
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
--

CREATE SEQUENCE public.rooms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
--

ALTER SEQUENCE public.rooms_id_seq OWNED BY public.rooms.id;


--
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
    room_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    teacher_id uuid
);



--
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



--
--

CREATE SEQUENCE public.schools_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
--

ALTER SEQUENCE public.schools_id_seq OWNED BY public.schools.id;


--
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
--

CREATE TABLE public.staff (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    school_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);



--
--

CREATE SEQUENCE public.staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
--

ALTER SEQUENCE public.staff_id_seq OWNED BY public.staff.id;


--
--

CREATE TABLE public.student_groups (
    student_id uuid NOT NULL,
    group_id uuid NOT NULL
);



--
--

CREATE TABLE public.student_parents (
    student_id uuid NOT NULL,
    parent_id integer NOT NULL
);



--
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
--

CREATE SEQUENCE public.student_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
--

ALTER SEQUENCE public.student_progress_id_seq OWNED BY public.student_progress.id;


--
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



--
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



--
--

ALTER TABLE ONLY public.activities ALTER COLUMN id SET DEFAULT nextval('public.activities_id_seq'::regclass);


--
--

ALTER TABLE ONLY public.attendances ALTER COLUMN id SET DEFAULT nextval('public.attendances_id_seq'::regclass);


--
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
--

ALTER TABLE ONLY public.parents ALTER COLUMN id SET DEFAULT nextval('public.parents_id_seq'::regclass);


--
--

ALTER TABLE ONLY public.reminders ALTER COLUMN id SET DEFAULT nextval('public.reminders_id_seq'::regclass);


--
--

ALTER TABLE ONLY public.rooms ALTER COLUMN id SET DEFAULT nextval('public.rooms_id_seq'::regclass);


--
--

ALTER TABLE ONLY public.schools ALTER COLUMN id SET DEFAULT nextval('public.schools_id_seq'::regclass);


--
--

ALTER TABLE ONLY public.staff ALTER COLUMN id SET DEFAULT nextval('public.staff_id_seq'::regclass);


--
--

ALTER TABLE ONLY public.student_progress ALTER COLUMN id SET DEFAULT nextval('public.student_progress_id_seq'::regclass);


--
--

COPY public.academic_years (id, year, start_date, end_date, is_active, school_id, description, created_at, updated_at) FROM stdin;
df68b56d-cb8a-45cd-8419-c21621d96b29	2025-2026	2025-09-01	2026-06-30	t	1	Current Academic Year	2025-09-19 14:04:43.161861	2025-09-19 14:04:43.161861
a7758257-8d24-4462-a31f-5653bc46f25c	2024-2025	2024-09-01	2025-06-30	f	1	Previous Academic Year	2025-09-19 14:04:43.164081	2025-09-19 14:04:43.164081
\.


--
--

COPY public.activities (id, student_id, type, data, created_at) FROM stdin;
\.


--
--

COPY public.attendances (id, attendance_date, status, check_in_time, check_out_time, notes, reason, is_excused, student_id, group_id, recorded_by, created_at, updated_at) FROM stdin;
3	2025-10-03	present	\N	\N	Test attendance	\N	f	8e50ded5-4571-4112-9c28-4a1bf7aa3618	e797a434-64a1-47a6-ba41-6f3666596bc6	\N	2025-10-03 17:55:13.522752	2025-10-03 17:55:13.522752
4	2025-10-03	late	08:30:00	\N	Arrived 30 minutes late	\N	f	8e50ded5-4571-4112-9c28-4a1bf7aa3618	e797a434-64a1-47a6-ba41-6f3666596bc6	\N	2025-10-03 17:55:37.868038	2025-10-03 17:55:37.868038
5	2025-10-04	present	08:00:00	\N	On time	\N	f	6f8d4364-1ed4-4e68-bbc8-e2c7fc06ce25	48802766-62a5-4457-9d74-47bfcda72ace	\N	2025-10-03 17:58:03.369546	2025-10-03 17:58:03.369546
6	2025-10-04	absent	\N	\N	Sick at home	\N	t	f6cec17d-e0c4-4904-b934-0dd2b847ca16	48802766-62a5-4457-9d74-47bfcda72ace	\N	2025-10-03 17:58:03.369546	2025-10-03 17:58:03.369546
7	2025-10-10	excused	\N	\N		\N	t	aafed5c4-9d8f-4fb3-a9c0-cdb586987ed9	b23ce3b0-86ea-4a10-9c3c-4976f4273069	\N	2025-10-10 04:48:52.377867	2025-10-10 04:48:52.377867
8	2025-10-10	excused	\N	\N		\N	t	aafed5c4-9d8f-4fb3-a9c0-cdb586987ed9	b23ce3b0-86ea-4a10-9c3c-4976f4273069	\N	2025-10-10 04:49:00.157725	2025-10-10 04:49:00.157725
9	2025-10-10	excused	\N	\N		\N	t	f6cec17d-e0c4-4904-b934-0dd2b847ca16	48802766-62a5-4457-9d74-47bfcda72ace	\N	2025-10-10 04:49:12.316702	2025-10-10 04:49:12.316702
10	2025-10-10	absent	\N	\N		\N	f	6f8d4364-1ed4-4e68-bbc8-e2c7fc06ce25	48802766-62a5-4457-9d74-47bfcda72ace	\N	2025-10-10 04:49:12.316702	2025-10-10 04:49:12.316702
11	2025-10-10	excused	\N	\N		\N	t	f6cec17d-e0c4-4904-b934-0dd2b847ca16	48802766-62a5-4457-9d74-47bfcda72ace	\N	2025-10-10 05:12:51.989349	2025-10-10 05:12:51.989349
12	2025-10-10	late	\N	\N		\N	f	6f8d4364-1ed4-4e68-bbc8-e2c7fc06ce25	48802766-62a5-4457-9d74-47bfcda72ace	\N	2025-10-10 05:12:51.989349	2025-10-10 05:12:51.989349
13	2025-10-10	excused	\N	\N		\N	t	f6cec17d-e0c4-4904-b934-0dd2b847ca16	b23ce3b0-86ea-4a10-9c3c-4976f4273069	\N	2025-10-10 05:13:05.775556	2025-10-10 05:13:05.775556
14	2025-10-10	late	\N	\N		\N	f	6f8d4364-1ed4-4e68-bbc8-e2c7fc06ce25	b23ce3b0-86ea-4a10-9c3c-4976f4273069	\N	2025-10-10 05:13:05.775556	2025-10-10 05:13:05.775556
15	2025-10-10	late	\N	\N		\N	f	aafed5c4-9d8f-4fb3-a9c0-cdb586987ed9	b23ce3b0-86ea-4a10-9c3c-4976f4273069	\N	2025-10-10 05:13:05.775556	2025-10-10 05:13:05.775556
\.


--
--

COPY public.class_settings (id, setting_type, name, duration_minutes, time_value, is_default, is_active, color, description, order_index, additional_settings, school_id, created_at, updated_at) FROM stdin;
f0bb8087-d79a-41f1-9b64-ce928d51a243	duration	90 minutes	90	\N	f	t	\N	\N	90	\N	1	2025-09-19 14:28:41.891607	2025-09-19 14:28:41.891607
\.


--
--

COPY public.courses (id, name, title, category, status, description, age_group_min, age_group_max, is_active, color_code, icon, send_notifications, estimated_duration_weeks, learning_objectives, prerequisites, materials_needed, school_id, academic_year_id, created_at, updated_at, "totalDuration", "createdDate", "lastModified", "targetAgeGroup", "difficultyLevel", "maxStudents") FROM stdin;
b65fd197-6b1c-407f-ad2a-9631dcb91fc1	Language Development	Language Development	Language Arts	active	Building vocabulary, communication skills, and early literacy	2	5	t	#FF6B6B	📚	t	36	Develop speaking, listening, reading readiness, and writing skills	None	Books, flashcards, writing materials	1	df68b56d-cb8a-45cd-8419-c21621d96b29	2025-09-19 14:04:43.218479	2025-09-19 14:04:43.218479	36	\N	\N	2-5 years	Beginner	20
f0fca69e-fd3c-4ca6-a380-c0765072d74b	Mathematics Foundations	Mathematics Foundations	Mathematics	active	Number recognition, counting, basic math concepts	3	5	t	#4ECDC4	🔢	t	36	Learn numbers, counting, shapes, patterns, and basic operations	Basic attention span	Counting blocks, number cards, shape puzzles	1	df68b56d-cb8a-45cd-8419-c21621d96b29	2025-09-19 14:04:43.221125	2025-09-19 14:04:43.221125	36	\N	\N	3-5 years	Beginner	18
02e181b8-b4bf-429d-a641-7980f3c9a3d0	Creative Arts	Creative Arts	Arts	active	Art, music, drama, and creative expression	2	5	t	#96CEB4	🎨	t	36	Develop creativity, fine motor skills, and artistic expression	None	Art supplies, musical instruments, costumes	1	df68b56d-cb8a-45cd-8419-c21621d96b29	2025-09-19 14:04:43.223432	2025-09-19 14:04:43.223432	36	\N	\N	2-5 years	Beginner	15
732535e1-34de-40ac-9c8e-9788f2a41d21	Physical Development	Physical Development	Physical Education	active	Gross and fine motor skills, physical fitness	2	5	t	#FFEAA7	🏃	t	36	Develop motor skills, coordination, and physical fitness	None	Sports equipment, playground, exercise mats	1	df68b56d-cb8a-45cd-8419-c21621d96b29	2025-09-19 14:04:43.225562	2025-09-19 14:04:43.225562	36	\N	\N	2-5 years	Beginner	25
61433d8b-d751-4cdb-a2ca-464b709a08c4	Social Skills	Social Skills	Social Development	active	Interaction, sharing, cooperation, and emotional development	2	5	t	#DDA0DD	👥	t	36	Learn cooperation, empathy, communication, and conflict resolution	None	Group games, role-play materials, books about emotions	1	df68b56d-cb8a-45cd-8419-c21621d96b29	2025-09-19 14:04:43.227427	2025-09-19 14:04:43.227427	36	\N	\N	2-5 years	Beginner	20
df4b93dc-bccf-44db-a6f0-b8d5151eb7c3	Test Course	\N	\N	draft	A test course to verify storage	3	5	t	\N	\N	t	\N	\N	\N	\N	1	df68b56d-cb8a-45cd-8419-c21621d96b29	2025-10-19 13:48:26.036761	2025-10-19 13:48:26.036761	\N	\N	\N	\N	\N	\N
\.


--
--

COPY public.groups (id, name, description, age_range_min, age_range_max, capacity, is_active, color, status, "studentCount", "teacherCount", school_id, room_id, academic_year_id, created_at, updated_at) FROM stdin;
e797a434-64a1-47a6-ba41-6f3666596bc6	Future Leaders	Age group 4-5 years - Pre-academic skills and independence	4	5	20	t	#4ECDC4	active	1	1	1	\N	\N	2025-09-19 14:04:43.212608	2025-09-19 14:04:43.323855
48802766-62a5-4457-9d74-47bfcda72ace	Bright Minds	Age group 3-4 years - Language and social skills development	3	4	18	t	#FF6B6B	active	2	1	1	\N	\N	2025-09-19 14:04:43.210763	2025-09-19 14:04:43.329976
b23ce3b0-86ea-4a10-9c3c-4976f4273069	Creative Explorers	Mixed age group for creative and artistic activities	3	5	16	t	#45B7D1	active	1	1	1	\N	\N	2025-09-19 14:04:43.214822	2025-09-19 14:04:43.342441
43a1c824-b3fd-4528-a3c6-0cc737cea8dc	Little Stars	Age group 2-3 years - Early development and basic skills	2	3	15	f	#FFD700	active	2	1	1	\N	\N	2025-09-19 14:04:43.208787	2025-09-30 19:15:50.818974
\.


--
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
\.


--
--

COPY public.milestones (id, name, description, order_index, is_required, points, phase_id, title, type, target_week, weight, difficulty_level, estimated_duration_minutes, required_resources, allow_late_submission, enable_peer_review, created_at, updated_at) FROM stdin;
30ef9441-f562-40e3-8203-5d9583f281ea	tyjetyj	etyjetyjytj	1	t	0	a5c5e104-dd0b-4f9a-8b45-c791f2322106	\N	\N	\N	\N	\N	\N	\N	f	f	2025-10-10 06:06:57.861598	2025-10-10 06:06:57.861598
732fd4e5-8028-4bf0-977e-ae691a02f3b7	Test Milestone 1	First milestone of the test phase	1	t	\N	b81af9c3-2d6d-4d93-83db-86525ef01f3e	\N	\N	\N	\N	\N	\N	\N	f	f	2025-10-19 13:48:47.902134	2025-10-19 13:48:47.902134
\.


--
--

COPY public.parents (id, "firstName", "lastName", email, phone, address, user_id, "createdAt", "updatedAt", student_id, created_at, updated_at) FROM stdin;
1	Ahmed	Hassan	ahmed.hassan@example.com	+966-50-678-9012	Al-Malaz District, Riyadh	\N	2025-09-19 14:04:43.174135	2025-09-19 14:04:43.174135	1	2025-09-19 14:04:43.174135	2025-09-19 14:04:43.174135
2	Layla	Hassan	layla.hassan@example.com	+966-50-678-9013	Al-Malaz District, Riyadh	\N	2025-09-19 14:04:43.176787	2025-09-19 14:04:43.176787	1	2025-09-19 14:04:43.176787	2025-09-19 14:04:43.176787
3	Omar	Salem	omar.salem@example.com	+966-50-789-0123	Al-Olaya District, Riyadh	\N	2025-09-19 14:04:43.179011	2025-09-19 14:04:43.179011	1	2025-09-19 14:04:43.179011	2025-09-19 14:04:43.179011
4	Fatima	Salem	fatima.salem@example.com	+966-50-789-0124	Al-Olaya District, Riyadh	\N	2025-09-19 14:04:43.181135	2025-09-19 14:04:43.181135	1	2025-09-19 14:04:43.181135	2025-09-19 14:04:43.181135
5	Khalid	Al-Otaibi	khalid.alotaibi@example.com	+966-50-890-1234	King Fahd District, Riyadh	\N	2025-09-19 14:04:43.183099	2025-09-19 14:04:43.183099	1	2025-09-19 14:04:43.183099	2025-09-19 14:04:43.183099
6	Maryam	Al-Otaibi	maryam.alotaibi@example.com	+966-50-890-1235	King Fahd District, Riyadh	\N	2025-09-19 14:04:43.184937	2025-09-19 14:04:43.184937	1	2025-09-19 14:04:43.184937	2025-09-19 14:04:43.184937
7	Mohammed	Al-Qahtani	mohammed.alqahtani@example.com	+966-50-901-2345	Al-Nakheel District, Riyadh	\N	2025-09-19 14:04:43.18683	2025-09-19 14:04:43.18683	1	2025-09-19 14:04:43.18683	2025-09-19 14:04:43.18683
8	Aisha	Al-Qahtani	aisha.alqahtani@example.com	+966-50-901-2346	Al-Nakheel District, Riyadh	\N	2025-09-19 14:04:43.188526	2025-09-19 14:04:43.188526	1	2025-09-19 14:04:43.188526	2025-09-19 14:04:43.188526
9	Abdullah	Al-Mutairi	abdullah.almutairi@example.com	+966-50-012-3456	Al-Rawdah District, Riyadh	\N	2025-09-19 14:04:43.190133	2025-09-19 14:04:43.190133	1	2025-09-19 14:04:43.190133	2025-09-19 14:04:43.190133
10	Nour	Al-Mutairi	nour.almutairi@example.com	+966-50-012-3457	Al-Rawdah District, Riyadh	\N	2025-09-19 14:04:43.191882	2025-09-19 14:04:43.191882	1	2025-09-19 14:04:43.191882	2025-09-19 14:04:43.191882
\.


--
--

COPY public.phases (id, name, description, order_index, estimated_duration_days, is_active, course_id, created_at, updated_at) FROM stdin;
a5c5e104-dd0b-4f9a-8b45-c791f2322106	ghjrtyj	tyjetyj	1	\N	t	732535e1-34de-40ac-9c8e-9788f2a41d21	2025-10-10 06:06:37.040259	2025-10-10 06:06:37.040259
18c3e438-3f33-4117-8816-251571bf750e	fgbsfgn	sdgnsgdn	2	\N	t	732535e1-34de-40ac-9c8e-9788f2a41d21	2025-10-10 06:08:23.892833	2025-10-10 06:08:23.892833
b81af9c3-2d6d-4d93-83db-86525ef01f3e	Test Phase 1	First phase of the test course	1	\N	t	df4b93dc-bccf-44db-a6f0-b8d5151eb7c3	2025-10-19 13:48:36.708745	2025-10-19 13:48:36.708745
\.


--
--

COPY public.reminders (id, user_id, title, description, due_date, created_at, updated_at) FROM stdin;
\.


--
--

COPY public.rooms (id, name, capacity, room_type, description, equipment, is_active, school_id, created_at, updated_at) FROM stdin;
2	Sunshine Room	15	classroom	Bright and cheerful room for toddlers	\N	t	1	2025-09-19 14:04:42.354269	2025-09-19 14:04:42.354269
3	Rainbow Room	18	classroom	Colorful learning space for preschoolers	\N	t	1	2025-09-19 14:04:42.364127	2025-09-19 14:04:42.364127
4	Garden Room	20	classroom	Nature-themed room for kindergarten students	\N	t	1	2025-09-19 14:04:42.368808	2025-09-19 14:04:42.368808
5	Star Room	16	classroom	Space-themed room for advanced learners	\N	t	1	2025-09-19 14:04:42.371482	2025-09-19 14:04:42.371482
6	Art Studio	12	activity	Creative space for art and crafts	\N	t	1	2025-09-19 14:04:42.373877	2025-09-19 14:04:42.373877
7	Music Room	25	activity	Musical activities and performances	\N	t	1	2025-09-19 14:04:42.377615	2025-09-19 14:04:42.377615
\.


--
--

COPY public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) FROM stdin;
de727931-f60b-4e81-9bcb-1ed6dd9cfc4e	sunday	08:00:00	08:45:00	45	Test notes	t	\N	active	b23ce3b0-86ea-4a10-9c3c-4976f4273069	b65fd197-6b1c-407f-ad2a-9631dcb91fc1	\N	2025-09-19 15:13:35.638894	2025-09-19 15:13:35.638894	46d30267-6432-4727-896c-b5aad126a61f
9a575ff4-487c-480a-b2f9-3d45fec4f3fe	monday	09:00:00	09:45:00	45	Introduction to numbers	t	\N	active	b23ce3b0-86ea-4a10-9c3c-4976f4273069	b65fd197-6b1c-407f-ad2a-9631dcb91fc1	\N	2025-09-19 15:16:30.548001	2025-09-19 15:16:30.548001	46d30267-6432-4727-896c-b5aad126a61f
47fb2d42-0134-4660-9468-5b5128560367	monday	09:00:00	09:45:00	45	Test schedule from frontend simulation	t	\N	active	b23ce3b0-86ea-4a10-9c3c-4976f4273069	61433d8b-d751-4cdb-a2ca-464b709a08c4	\N	2025-09-19 15:50:04.198674	2025-09-19 15:50:04.198674	a845910d-da81-48d2-9dc7-3b3f5ebc3716
d1365a1c-3c0c-4c58-83e4-9bf9ec777655	monday	09:00:00	09:45:00	45	Test schedule from frontend simulation	t	\N	active	b23ce3b0-86ea-4a10-9c3c-4976f4273069	61433d8b-d751-4cdb-a2ca-464b709a08c4	\N	2025-09-19 15:50:23.486466	2025-09-19 15:50:23.486466	a845910d-da81-48d2-9dc7-3b3f5ebc3716
751afc16-79dc-4d0d-bd25-4ee4be423281	sunday	08:00:00	09:30:00	90	sfgnsfgn	t	\N	active	b23ce3b0-86ea-4a10-9c3c-4976f4273069	732535e1-34de-40ac-9c8e-9788f2a41d21	\N	2025-09-24 14:29:11.794261	2025-09-24 14:29:11.794261	\N
8be41f4f-eb9d-4462-bd1b-84df3fcd43b5	sunday	08:00:00	09:30:00	90	wrtbwrtb	t	\N	active	e797a434-64a1-47a6-ba41-6f3666596bc6	61433d8b-d751-4cdb-a2ca-464b709a08c4	\N	2025-09-24 14:30:40.333597	2025-09-24 14:30:40.333597	\N
c748c6d3-debe-4332-9578-530c60e9f515	tuesday	10:00:00	10:45:00	45	Test schedule for table verification	t	\N	active	b23ce3b0-86ea-4a10-9c3c-4976f4273069	\N	\N	2025-09-29 05:14:19.5799	2025-09-29 05:14:19.5799	\N
56bd4bbb-8132-4ae1-8ffa-b5ad75437071	wednesday	11:00:00	11:45:00	45	Test schedule created during development	t	\N	active	b23ce3b0-86ea-4a10-9c3c-4976f4273069	\N	\N	2025-09-30 13:09:05.832203	2025-09-30 13:09:05.832203	\N
ac7de153-63c8-41cd-957b-032766f4ae1a	sunday	09:00:00	10:30:00	90	aerthaerth	t	\N	active	e797a434-64a1-47a6-ba41-6f3666596bc6	732535e1-34de-40ac-9c8e-9788f2a41d21	\N	2025-09-30 17:40:51.589769	2025-09-30 17:40:51.589769	\N
2703fb90-83a5-4393-9357-9a7f9f623434	monday	09:00:00	09:45:00	45	Test schedule creation	t	\N	active	b23ce3b0-86ea-4a10-9c3c-4976f4273069	732535e1-34de-40ac-9c8e-9788f2a41d21	\N	2025-09-24 14:24:23.234709	2025-09-30 17:43:34.17116	46d30267-6432-4727-896c-b5aad126a61f
52172b2e-3bd5-4554-a198-7f79be30ad73	tuesday	10:00:00	10:45:00	45	Test schedule with teacher assignment	t	\N	active	b23ce3b0-86ea-4a10-9c3c-4976f4273069	732535e1-34de-40ac-9c8e-9788f2a41d21	\N	2025-09-30 17:43:51.13216	2025-09-30 17:43:51.13216	46d30267-6432-4727-896c-b5aad126a61f
e23c2cac-7099-4725-90f2-1c1af1d2344f	monday	08:00:00	09:30:00	90	wrthwrth	t	\N	active	e797a434-64a1-47a6-ba41-6f3666596bc6	732535e1-34de-40ac-9c8e-9788f2a41d21	\N	2025-09-30 17:51:12.475582	2025-09-30 17:51:12.475582	\N
c4207fb2-8922-4910-ba03-6414658971e1	monday	09:00:00	10:30:00	90	rtnwsrtnsw	t	\N	active	e797a434-64a1-47a6-ba41-6f3666596bc6	732535e1-34de-40ac-9c8e-9788f2a41d21	\N	2025-09-30 17:53:57.079132	2025-09-30 17:53:57.079132	\N
725552c4-7048-4b1f-a066-db684fe50600	friday	14:00:00	14:45:00	45	Test schedule after schema fixes	t	\N	active	b23ce3b0-86ea-4a10-9c3c-4976f4273069	732535e1-34de-40ac-9c8e-9788f2a41d21	\N	2025-09-30 18:00:32.246393	2025-09-30 18:00:32.246393	46d30267-6432-4727-896c-b5aad126a61f
a4a01bc4-7723-4b87-8742-a7f4e4031ee4	tuesday	09:00:00	10:30:00	90	klbkjhv	t	\N	active	e797a434-64a1-47a6-ba41-6f3666596bc6	732535e1-34de-40ac-9c8e-9788f2a41d21	\N	2025-09-30 18:01:27.440877	2025-09-30 18:01:27.440877	\N
b7f14798-d0ca-43ef-9fa9-641dbfbf76f1	saturday	16:00:00	16:45:00	45	Test with teacher assignment fix	t	\N	active	b23ce3b0-86ea-4a10-9c3c-4976f4273069	732535e1-34de-40ac-9c8e-9788f2a41d21	\N	2025-09-30 18:09:42.020956	2025-09-30 18:09:42.020956	a845910d-da81-48d2-9dc7-3b3f5ebc3716
ca6839ed-5073-47a4-80b8-5dcb90b49dc3	friday	15:00:00	15:45:00	45	Test schedule with frontend fixes	t	\N	active	b23ce3b0-86ea-4a10-9c3c-4976f4273069	61433d8b-d751-4cdb-a2ca-464b709a08c4	\N	2025-09-30 18:09:46.787398	2025-09-30 18:09:46.787398	a845910d-da81-48d2-9dc7-3b3f5ebc3716
f156f238-320f-4f75-a106-c33d0f8b951b	friday	15:00:00	15:45:00	45	Test schedule with frontend fixes	t	\N	active	b23ce3b0-86ea-4a10-9c3c-4976f4273069	61433d8b-d751-4cdb-a2ca-464b709a08c4	\N	2025-09-30 18:09:49.467535	2025-09-30 18:09:49.467535	a845910d-da81-48d2-9dc7-3b3f5ebc3716
16d057fd-0f71-442a-a470-feea62713cb0	friday	15:00:00	15:45:00	45	Test schedule with frontend fixes	t	\N	active	b23ce3b0-86ea-4a10-9c3c-4976f4273069	61433d8b-d751-4cdb-a2ca-464b709a08c4	\N	2025-09-30 18:09:50.994598	2025-09-30 18:09:50.994598	a845910d-da81-48d2-9dc7-3b3f5ebc3716
dc3569f8-96d4-4feb-a433-0bdae6f50741	friday	15:00:00	15:45:00	45	Test schedule with frontend fixes	t	\N	active	b23ce3b0-86ea-4a10-9c3c-4976f4273069	61433d8b-d751-4cdb-a2ca-464b709a08c4	\N	2025-09-30 18:09:51.633704	2025-09-30 18:09:51.633704	a845910d-da81-48d2-9dc7-3b3f5ebc3716
b4f2895f-c7af-4698-8a10-6f9bba604519	sunday	17:00:00	17:45:00	45	Final test schedule	t	\N	active	b23ce3b0-86ea-4a10-9c3c-4976f4273069	732535e1-34de-40ac-9c8e-9788f2a41d21	\N	2025-09-30 18:10:44.431796	2025-09-30 18:10:44.431796	a845910d-da81-48d2-9dc7-3b3f5ebc3716
9a759cb0-1a8d-44c0-bb62-ed510693549e	tuesday	10:00:00	10:45:00	45	Test teacher assignment fix	t	\N	active	e797a434-64a1-47a6-ba41-6f3666596bc6	732535e1-34de-40ac-9c8e-9788f2a41d21	\N	2025-09-30 18:13:40.478026	2025-09-30 18:13:40.478026	a845910d-da81-48d2-9dc7-3b3f5ebc3716
698d734e-7a6c-4cbb-a2d9-6175b9b4aeb6	monday	10:00:00	11:30:00	90	e3tynt3yn	t	\N	active	e797a434-64a1-47a6-ba41-6f3666596bc6	732535e1-34de-40ac-9c8e-9788f2a41d21	\N	2025-09-30 18:17:13.114526	2025-09-30 18:17:13.114526	46d30267-6432-4727-896c-b5aad126a61f
14542854-7ba8-44cd-8a42-0ec115b2b40e	sunday	11:00:00	12:30:00	90	2erf2erg	t	\N	active	e797a434-64a1-47a6-ba41-6f3666596bc6	f0fca69e-fd3c-4ca6-a380-c0765072d74b	\N	2025-09-30 18:18:11.881421	2025-09-30 18:18:11.881421	eb9bf6a7-8fb0-4262-9194-1aa75b9ce7c6
\.


--
--

COPY public.schools (id, name, address, phone, email, website, logo_url, established_date, description, created_at, updated_at) FROM stdin;
1	Zinat Al-Haya Kindergarten	Main Street, City Center	+1234567890	info@zinatalhaykindergarten.com	www.zinatalhaykindergarten.com	\N	2020-09-01	A premier kindergarten focused on early childhood development	2025-09-19 14:04:15.440634	2025-09-19 14:04:15.440634
\.


--
--

COPY public.semesters (id, title, start_date, end_date, academic_year_id, description, is_active, created_at, updated_at) FROM stdin;
1baefa1a-a3fe-4678-9a20-0a7c31f3efc9	First Semester	2025-09-01	2026-01-15	df68b56d-cb8a-45cd-8419-c21621d96b29	Fall semester focusing on foundational skills	t	2025-09-19 14:04:43.166988	2025-09-19 14:04:43.166988
bc6e2956-8fff-40e6-9be1-5b1cdfb65cc4	Second Semester	2026-01-16	2026-06-30	df68b56d-cb8a-45cd-8419-c21621d96b29	Spring semester with advanced learning activities	f	2025-09-19 14:04:43.169318	2025-09-19 14:04:43.169318
\.


--
--

COPY public.staff (id, user_id, school_id, created_at, updated_at) FROM stdin;
\.


--
--

COPY public.student_groups (student_id, group_id) FROM stdin;
f6cec17d-e0c4-4904-b934-0dd2b847ca16	48802766-62a5-4457-9d74-47bfcda72ace
738c7a69-4ace-447f-ae7d-86b230179c64	43a1c824-b3fd-4528-a3c6-0cc737cea8dc
8e50ded5-4571-4112-9c28-4a1bf7aa3618	e797a434-64a1-47a6-ba41-6f3666596bc6
6f8d4364-1ed4-4e68-bbc8-e2c7fc06ce25	48802766-62a5-4457-9d74-47bfcda72ace
0dfb30a9-0277-4498-b73c-b945c6a045c2	43a1c824-b3fd-4528-a3c6-0cc737cea8dc
aafed5c4-9d8f-4fb3-a9c0-cdb586987ed9	b23ce3b0-86ea-4a10-9c3c-4976f4273069
\.


--
--

COPY public.student_parents (student_id, parent_id) FROM stdin;
f6cec17d-e0c4-4904-b934-0dd2b847ca16	1
f6cec17d-e0c4-4904-b934-0dd2b847ca16	2
738c7a69-4ace-447f-ae7d-86b230179c64	1
738c7a69-4ace-447f-ae7d-86b230179c64	2
8e50ded5-4571-4112-9c28-4a1bf7aa3618	3
8e50ded5-4571-4112-9c28-4a1bf7aa3618	4
6f8d4364-1ed4-4e68-bbc8-e2c7fc06ce25	5
6f8d4364-1ed4-4e68-bbc8-e2c7fc06ce25	6
0dfb30a9-0277-4498-b73c-b945c6a045c2	7
0dfb30a9-0277-4498-b73c-b945c6a045c2	8
aafed5c4-9d8f-4fb3-a9c0-cdb586987ed9	9
aafed5c4-9d8f-4fb3-a9c0-cdb586987ed9	10
\.


--
--

COPY public.student_progress (id, status, score, points_earned, teacher_notes, student_notes, started_date, completed_date, due_date, is_late_submission, attempts_count, feedback, attachments, student_id, course_id, milestone_id, updated_by, created_at, updated_at) FROM stdin;
\.


--
--

COPY public.students (id, "firstName", "lastName", "dateOfBirth", gender, address, phone, email, "emergencyContact", "medicalInfo", notes, "secondName", "thirdName", nationality, "studentId", photo, "createdAt", "updatedAt", user_id, school_id, room_id, first_name, family_name, date_of_birth, medical_conditions, allergies, emergency_contact, group_id, created_at, updated_at) FROM stdin;
f6cec17d-e0c4-4904-b934-0dd2b847ca16	Yusuf	Hassan	2019-03-15	male	Al-Malaz District, Riyadh	\N	\N	+966-50-678-9012	No known allergies	Very active and loves building blocks	Ahmed	Ali	Saudi	STU001	\N	2025-09-19 14:04:43.195549	2025-09-19 14:04:43.195549	\N	1	2	\N	\N	\N	\N	\N	\N	\N	2025-09-19 14:04:43.195549	2025-09-19 14:04:43.195549
738c7a69-4ace-447f-ae7d-86b230179c64	Zahra	Hassan	2020-07-22	female	Al-Malaz District, Riyadh	\N	\N	+966-50-678-9012	Mild food allergy to nuts	Loves reading and drawing	Ahmed	Ali	Saudi	STU002	\N	2025-09-19 14:04:43.197739	2025-09-19 14:04:43.197739	\N	1	3	\N	\N	\N	\N	\N	\N	\N	2025-09-19 14:04:43.197739	2025-09-19 14:04:43.197739
8e50ded5-4571-4112-9c28-4a1bf7aa3618	Khalid	Salem	2018-11-08	male	Al-Olaya District, Riyadh	\N	\N	+966-50-789-0123	Asthma - has inhaler	Excellent at mathematics and puzzles	Omar	Mohammed	Saudi	STU003	\N	2025-09-19 14:04:43.199584	2025-09-19 14:04:43.199584	\N	1	4	\N	\N	\N	\N	\N	\N	\N	2025-09-19 14:04:43.199584	2025-09-19 14:04:43.199584
6f8d4364-1ed4-4e68-bbc8-e2c7fc06ce25	Lina	Al-Otaibi	2019-05-12	female	King Fahd District, Riyadh	\N	\N	+966-50-890-1234	No known medical conditions	Very social and loves group activities	Khalid	Abdullah	Saudi	STU004	\N	2025-09-19 14:04:43.201612	2025-09-19 14:04:43.201612	\N	1	3	\N	\N	\N	\N	\N	\N	\N	2025-09-19 14:04:43.201612	2025-09-19 14:04:43.201612
0dfb30a9-0277-4498-b73c-b945c6a045c2	Omar	Al-Qahtani	2020-01-30	male	Al-Nakheel District, Riyadh	\N	\N	+966-50-901-2345	No known allergies	Loves music and singing	Mohammed	Salem	Saudi	STU005	\N	2025-09-19 14:04:43.204037	2025-09-19 14:04:43.204037	\N	1	2	\N	\N	\N	\N	\N	\N	\N	2025-09-19 14:04:43.204037	2025-09-19 14:04:43.204037
aafed5c4-9d8f-4fb3-a9c0-cdb586987ed9	Nora	Al-Mutairi	2019-09-18	female	Al-Rawdah District, Riyadh	\N	\N	+966-50-012-3456	Lactose intolerant	Creative and artistic, loves painting	Abdullah	Fahad	Saudi	STU006	\N	2025-09-19 14:04:43.20571	2025-09-19 14:04:43.20571	\N	1	5	\N	\N	\N	\N	\N	\N	\N	2025-09-19 14:04:43.20571	2025-09-19 14:04:43.20571
\.


--
--

COPY public.users (id, username, email, password, "firstName", "lastName", role, roles, phone, address, "dateOfBirth", "isActive", "lastLogin", school_id, "createdAt", "updatedAt") FROM stdin;
377de989-f289-4a32-a944-e0d04cec3e3a	director	director@zinatalhaykindergarten.com	$2b$10$gRE9wvJiCjoycIDIpU47xug41kb/hvs.t1Gg9Za1F/dLis4B/.TYq	Maryam	Al-Rashid	admin	\N	+966-11-123-4568	Riyadh, Saudi Arabia	\N	t	\N	1	2025-09-19 14:04:43.137499	2025-09-19 14:04:43.137499
a845910d-da81-48d2-9dc7-3b3f5ebc3716	teacher2	aisha.mohamed@zinatalhaykindergarten.com	$2b$10$gsdqCi/xCpYH7lH4CwVa7uaa/D1HapVRL9SCBlVhf/vIdH02O81ge	Aisha	Mohamed	teacher	\N	+966-50-345-6789	Riyadh, Saudi Arabia	\N	t	\N	1	2025-09-19 14:04:43.14322	2025-09-19 14:04:43.14322
46d30267-6432-4727-896c-b5aad126a61f	teacher3	sara.abdullah@zinatalhaykindergarten.com	$2b$10$0imGXX65YFckdlQiaMvf3uPnNjGzsCMHNdgvwVqqGYY3xwIn7/xGS	Sara	Abdullah	teacher	\N	+966-50-456-7890	Riyadh, Saudi Arabia	\N	t	\N	1	2025-09-19 14:04:43.145625	2025-09-19 14:04:43.145625
eb9bf6a7-8fb0-4262-9194-1aa75b9ce7c6	teacher4	nour.hassan@zinatalhaykindergarten.com	$2b$10$eLbHaB0fTLYVD7eXydhOy.iYao0XCv/bmYPFK3cuBeRuEpEtVV2PG	Nour	Hassan	teacher	\N	+966-50-567-8901	Riyadh, Saudi Arabia	\N	t	\N	1	2025-09-19 14:04:43.147807	2025-09-19 14:04:43.147807
1bb6032e-3ae6-4f81-955e-765745270a46	parent2	omar.salem@example.com	$2b$10$HPsrX9Dq5qpD1JT4daxsYOrlhK7sBNPGF3GlX.wBixuDZEH1jT9me	Omar	Salem	parent	\N	+966-50-789-0123	Al-Olaya District, Riyadh	\N	t	\N	1	2025-09-19 14:04:43.152709	2025-09-19 14:04:43.152709
27fe24c2-0733-4655-9314-70a9281ea374	parent3	khalid.alotaibi@example.com	$2b$10$OZ9lrtTlVYTqnaSXcy2wwup/AkD0OQ94eONH7hBdiGA8Si5DUW1TS	Khalid	Al-Otaibi	parent	\N	+966-50-890-1234	King Fahd District, Riyadh	\N	t	\N	1	2025-09-19 14:04:43.154895	2025-09-19 14:04:43.154895
b6d2a95a-36a0-4911-a45c-a147a96f2dcb	parent4	mohammed.alqahtani@example.com	$2b$10$8uIlLnY0.MUfSl0D02wOfeyNx0YjSmYt2Cyf4ZY64iwfT8/C7V1US	Mohammed	Al-Qahtani	parent	\N	+966-50-901-2345	Al-Nakheel District, Riyadh	\N	t	\N	1	2025-09-19 14:04:43.156951	2025-09-19 14:04:43.156951
a6ac0305-dacf-4df9-8ae0-74f5cf25bdbc	parent5	abdullah.almutairi@example.com	$2b$10$yi3cZYE2BcwOIRvJMmb2vuBEAqTaWN9qlITBvlfTUg3aKNdjo3lE.	Abdullah	Al-Mutairi	parent	\N	+966-50-012-3456	Al-Rawdah District, Riyadh	\N	t	\N	1	2025-09-19 14:04:43.158633	2025-09-19 14:04:43.158633
2c5b5795-6986-48e6-a5ce-d16255ac2fa7	teacher1	fatima.alzahra@zinatalhaykindergarten.com	$2b$10$np80QGK6l./jDJvMrCplqefQbzPZCP.Z8r0mlCsqgRbQInxOrKdqq	Fatima	Al-Zahra	teacher	\N	+966-50-234-5678	Riyadh, Saudi Arabia	\N	t	2025-09-19 18:09:31.346	1	2025-09-19 14:04:43.140152	2025-09-19 14:09:31.348892
e83c5521-837e-4a17-92af-40c5c5e91aaa	parent1	ahmed.hassan@example.com	$2b$10$pLHbrwOnCb03upgggyrF.eHtyQOFS3cuQpHVmsBPuN6vChKPVyEuW	Ahmed	Hassan	parent	\N	+966-50-678-9012	Al-Malaz District, Riyadh	\N	t	2025-09-19 18:09:36.706	1	2025-09-19 14:04:43.149966	2025-09-19 14:09:36.707988
bd306529-6a0f-4e42-9dce-3928af367e94	admin	admin@zinatalhaykindergarten.com	$2b$10$rePaACpflK7vahq8g/pnR.2t4Z4xjrpWpRyKRgWkR20g.Tq1mSg7u	System	Administrator	admin	\N	+966-11-123-4567	Main Office, Zinat Al-Haya Kindergarten	\N	t	2025-09-30 09:04:32.272	1	2025-09-19 14:04:43.127087	2025-09-30 13:04:32.277471
\.


--
--

SELECT pg_catalog.setval('public.activities_id_seq', 1, false);


--
--

SELECT pg_catalog.setval('public.attendances_id_seq', 15, true);


--
--

SELECT pg_catalog.setval('public.migrations_id_seq', 3, true);


--
--

SELECT pg_catalog.setval('public.parents_id_seq', 10, true);


--
--

SELECT pg_catalog.setval('public.reminders_id_seq', 1, false);


--
--

SELECT pg_catalog.setval('public.rooms_id_seq', 7, true);


--
--

SELECT pg_catalog.setval('public.schools_id_seq', 1, true);


--
--

SELECT pg_catalog.setval('public.staff_id_seq', 1, false);


--
--

SELECT pg_catalog.setval('public.student_progress_id_seq', 1, false);


--
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY (id);


--
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT "PK_0bdbfe399c777a6a8520ff902d9" PRIMARY KEY (id);


--
--

ALTER TABLE ONLY public.academic_years
    ADD CONSTRAINT "PK_2021b90bfbfa6c9da7df34ca1cf" PRIMARY KEY (id);


--
--

ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT "PK_25c393e2e76b3e32e87a79b1dc2" PRIMARY KEY (id);


--
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT "PK_38715fec7f634b72c6cf7ea4893" PRIMARY KEY (id);


--
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY (id);


--
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "PK_483ed97cd4cd43ab4a117516b69" PRIMARY KEY (id);


--
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY (id);


--
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY (id);


--
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT "PK_7e33fc2ea755a5765e3564e66dd" PRIMARY KEY (id);


--
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY (id);


--
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT "PK_95b932e47ac129dd8e23a0db548" PRIMARY KEY (id);


--
--

ALTER TABLE ONLY public.parents
    ADD CONSTRAINT "PK_9a4dc67c7b8e6a9cb918938d353" PRIMARY KEY (id);


--
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
--

ALTER TABLE ONLY public.student_parents
    ADD CONSTRAINT "PK_ad07904dc74a079fb1d7d82825c" PRIMARY KEY (student_id, parent_id);


--
--

ALTER TABLE ONLY public.class_settings
    ADD CONSTRAINT "PK_b0297a43420f60073c0eab523a3" PRIMARY KEY (id);


--
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "PK_e4ee98bb552756c180aec1e854a" PRIMARY KEY (id);


--
--

ALTER TABLE ONLY public.student_progress
    ADD CONSTRAINT "PK_e7df7ebbbab37cc250594423a38" PRIMARY KEY (id);


--
--

ALTER TABLE ONLY public.phases
    ADD CONSTRAINT "PK_e93bb53460b28d4daf72735d5d3" PRIMARY KEY (id);


--
--

ALTER TABLE ONLY public.student_groups
    ADD CONSTRAINT "PK_ed5bb94d166be2eb02a40701460" PRIMARY KEY (student_id, group_id);


--
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE (username);


--
--

CREATE INDEX "IDX_26f5abac21d5008e18949f7e1a" ON public.student_groups USING btree (student_id);


--
--

CREATE INDEX "IDX_3b25a982c6e8629dcb6fdcca68" ON public.student_groups USING btree (group_id);


--
--

CREATE INDEX "IDX_ab5687be754283635fffe3692e" ON public.student_parents USING btree (student_id);


--
--

CREATE INDEX "IDX_d4d691ddbc51607ae462b68e16" ON public.student_parents USING btree (parent_id);


--
--

ALTER TABLE ONLY public.student_progress
    ADD CONSTRAINT "FK_0e6ffb6e4b3e62948d2cd8f9d25" FOREIGN KEY (milestone_id) REFERENCES public.milestones(id);


--
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_25e1cf8f41bae2f3d11f3c2a028" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
--

ALTER TABLE ONLY public.student_groups
    ADD CONSTRAINT "FK_26f5abac21d5008e18949f7e1af" FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT "FK_2b9a68c93adbc74afa109bb2a73" FOREIGN KEY (room_id) REFERENCES public.rooms(id);


--
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT "FK_2c027020a88187efddd0dbb8421" FOREIGN KEY (teacher_id) REFERENCES public.users(id);


--
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT "FK_330dc11fecc87ead6c8464d9552" FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "FK_351341ffb6055ef0907b18e28b9" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
--

ALTER TABLE ONLY public.student_groups
    ADD CONSTRAINT "FK_3b25a982c6e8629dcb6fdcca68c" FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
--

ALTER TABLE ONLY public.class_settings
    ADD CONSTRAINT "FK_44ada01d1f189a02fec88613fc4" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT "FK_586e0b8e419125be507701cee2a" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "FK_5d36fddafdb9cabd2df4178160d" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
--

ALTER TABLE ONLY public.student_progress
    ADD CONSTRAINT "FK_5fb6e1954cc0ffbaa4c57440aeb" FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "FK_733c97836a6a5575a5d1c70826b" FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id);


--
--

ALTER TABLE ONLY public.student_progress
    ADD CONSTRAINT "FK_760b6a9d017ba81f2a33b1bddee" FOREIGN KEY (student_id) REFERENCES public.students(id);


--
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "FK_7874d0af5c1371ad4ea2152e266" FOREIGN KEY (student_id) REFERENCES public.students(id);


--
--

ALTER TABLE ONLY public.student_progress
    ADD CONSTRAINT "FK_7b7df703b978daed31977bcdd0e" FOREIGN KEY (updated_by) REFERENCES public.staff(id);


--
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "FK_7f099cebb2ad6533754207a949b" FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id);


--
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "FK_93af199b643c30e2bc55561d306" FOREIGN KEY (student_id) REFERENCES public.students(id);


--
--

ALTER TABLE ONLY public.phases
    ADD CONSTRAINT "FK_9d14336cfb8bc056f1b8271b094" FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
--

ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT "FK_a2d5014975f0e10189e2dc45820" FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id);


--
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_aa8edc7905ad764f85924569647" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
--

ALTER TABLE ONLY public.student_parents
    ADD CONSTRAINT "FK_ab5687be754283635fffe3692ee" FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "FK_b0bae95e6d3f33ec73b599c418d" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT "FK_b1e10ac4dc72412af1c3f4d736d" FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
--

ALTER TABLE ONLY public.academic_years
    ADD CONSTRAINT "FK_b293eb7909d2a3aae86c4380713" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
--

ALTER TABLE ONLY public.parents
    ADD CONSTRAINT "FK_c94c3cea9b43a18c81269ded41d" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "FK_cec9365d9fc3a3409158b645f2e" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
--

ALTER TABLE ONLY public.student_parents
    ADD CONSTRAINT "FK_d4d691ddbc51607ae462b68e16c" FOREIGN KEY (parent_id) REFERENCES public.parents(id);


--
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "FK_ddb8f8852fc45bebff80106035c" FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "FK_e0ff1c3c262fb8b55222e4d8329" FOREIGN KEY (recorded_by) REFERENCES public.staff(id);


--
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT "FK_ecc11da5b97746ab136a904626f" FOREIGN KEY (phase_id) REFERENCES public.phases(id);


--
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_f8c241265ea322470a2897ce0cd" FOREIGN KEY (room_id) REFERENCES public.rooms(id);


--
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_fb3eff90b11bddf7285f9b4e281" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT "FK_ffaac60590923112dad474b21dc" FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 7qRA6btYa3GkHlOeNv6IH5CbjaCz1hG9YDj0ysK91jdALuysAsbTkhqocg13Zth


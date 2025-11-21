--
-- PostgreSQL database dump
--

\restrict 57HaEcxtHg5HU3RJFUsIlUTNdiawDqpFdqBJ00QlBV18Z3wci2vDd8CGLX6Rhwz

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

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
-- Data for Name: schools; Type: TABLE DATA; Schema: public; Owner: school_admin
--

INSERT INTO public.schools (id, name, address, phone, email, website, logo_url, established_date, description, created_at, updated_at) VALUES (1, 'Zinat Al-Haya Kindergarten', 'Main Street, City Center', '+1234567890', 'info@zinatalhaykindergarten.com', 'www.zinatalhaykindergarten.com', NULL, '2020-09-01', 'A premier kindergarten focused on early childhood development', '2025-09-19 14:04:15.440634', '2025-09-19 14:04:15.440634');


--
-- Data for Name: academic_years; Type: TABLE DATA; Schema: public; Owner: school_admin
--

INSERT INTO public.academic_years (id, year, start_date, end_date, is_active, school_id, description, created_at, updated_at) VALUES ('df68b56d-cb8a-45cd-8419-c21621d96b29', '2025-2026', '2025-09-01', '2026-06-30', true, 1, 'Current Academic Year', '2025-09-19 14:04:43.161861', '2025-09-19 14:04:43.161861');
INSERT INTO public.academic_years (id, year, start_date, end_date, is_active, school_id, description, created_at, updated_at) VALUES ('a7758257-8d24-4462-a31f-5653bc46f25c', '2024-2025', '2024-09-01', '2025-06-30', false, 1, 'Previous Academic Year', '2025-09-19 14:04:43.164081', '2025-09-19 14:04:43.164081');


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: school_admin
--

INSERT INTO public.rooms (id, name, capacity, room_type, description, equipment, is_active, school_id, created_at, updated_at) VALUES (2, 'Sunshine Room', 15, 'classroom', 'Bright and cheerful room for toddlers', NULL, true, 1, '2025-09-19 14:04:42.354269', '2025-09-19 14:04:42.354269');
INSERT INTO public.rooms (id, name, capacity, room_type, description, equipment, is_active, school_id, created_at, updated_at) VALUES (3, 'Rainbow Room', 18, 'classroom', 'Colorful learning space for preschoolers', NULL, true, 1, '2025-09-19 14:04:42.364127', '2025-09-19 14:04:42.364127');
INSERT INTO public.rooms (id, name, capacity, room_type, description, equipment, is_active, school_id, created_at, updated_at) VALUES (4, 'Garden Room', 20, 'classroom', 'Nature-themed room for kindergarten students', NULL, true, 1, '2025-09-19 14:04:42.368808', '2025-09-19 14:04:42.368808');
INSERT INTO public.rooms (id, name, capacity, room_type, description, equipment, is_active, school_id, created_at, updated_at) VALUES (5, 'Star Room', 16, 'classroom', 'Space-themed room for advanced learners', NULL, true, 1, '2025-09-19 14:04:42.371482', '2025-09-19 14:04:42.371482');
INSERT INTO public.rooms (id, name, capacity, room_type, description, equipment, is_active, school_id, created_at, updated_at) VALUES (6, 'Art Studio', 12, 'activity', 'Creative space for art and crafts', NULL, true, 1, '2025-09-19 14:04:42.373877', '2025-09-19 14:04:42.373877');
INSERT INTO public.rooms (id, name, capacity, room_type, description, equipment, is_active, school_id, created_at, updated_at) VALUES (7, 'Music Room', 25, 'activity', 'Musical activities and performances', NULL, true, 1, '2025-09-19 14:04:42.377615', '2025-09-19 14:04:42.377615');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: school_admin
--

INSERT INTO public.users (id, username, email, password, "firstName", "lastName", role, roles, phone, address, "dateOfBirth", "isActive", "lastLogin", school_id, "createdAt", "updatedAt") VALUES ('377de989-f289-4a32-a944-e0d04cec3e3a', 'director', 'director@zinatalhaykindergarten.com', '$2b$10$gRE9wvJiCjoycIDIpU47xug41kb/hvs.t1Gg9Za1F/dLis4B/.TYq', 'Maryam', 'Al-Rashid', 'admin', NULL, '+966-11-123-4568', 'Riyadh, Saudi Arabia', NULL, true, NULL, 1, '2025-09-19 14:04:43.137499', '2025-09-19 14:04:43.137499');
INSERT INTO public.users (id, username, email, password, "firstName", "lastName", role, roles, phone, address, "dateOfBirth", "isActive", "lastLogin", school_id, "createdAt", "updatedAt") VALUES ('a845910d-da81-48d2-9dc7-3b3f5ebc3716', 'teacher2', 'aisha.mohamed@zinatalhaykindergarten.com', '$2b$10$gsdqCi/xCpYH7lH4CwVa7uaa/D1HapVRL9SCBlVhf/vIdH02O81ge', 'Aisha', 'Mohamed', 'teacher', NULL, '+966-50-345-6789', 'Riyadh, Saudi Arabia', NULL, true, NULL, 1, '2025-09-19 14:04:43.14322', '2025-09-19 14:04:43.14322');
INSERT INTO public.users (id, username, email, password, "firstName", "lastName", role, roles, phone, address, "dateOfBirth", "isActive", "lastLogin", school_id, "createdAt", "updatedAt") VALUES ('46d30267-6432-4727-896c-b5aad126a61f', 'teacher3', 'sara.abdullah@zinatalhaykindergarten.com', '$2b$10$0imGXX65YFckdlQiaMvf3uPnNjGzsCMHNdgvwVqqGYY3xwIn7/xGS', 'Sara', 'Abdullah', 'teacher', NULL, '+966-50-456-7890', 'Riyadh, Saudi Arabia', NULL, true, NULL, 1, '2025-09-19 14:04:43.145625', '2025-09-19 14:04:43.145625');
INSERT INTO public.users (id, username, email, password, "firstName", "lastName", role, roles, phone, address, "dateOfBirth", "isActive", "lastLogin", school_id, "createdAt", "updatedAt") VALUES ('eb9bf6a7-8fb0-4262-9194-1aa75b9ce7c6', 'teacher4', 'nour.hassan@zinatalhaykindergarten.com', '$2b$10$eLbHaB0fTLYVD7eXydhOy.iYao0XCv/bmYPFK3cuBeRuEpEtVV2PG', 'Nour', 'Hassan', 'teacher', NULL, '+966-50-567-8901', 'Riyadh, Saudi Arabia', NULL, true, NULL, 1, '2025-09-19 14:04:43.147807', '2025-09-19 14:04:43.147807');
INSERT INTO public.users (id, username, email, password, "firstName", "lastName", role, roles, phone, address, "dateOfBirth", "isActive", "lastLogin", school_id, "createdAt", "updatedAt") VALUES ('1bb6032e-3ae6-4f81-955e-765745270a46', 'parent2', 'omar.salem@example.com', '$2b$10$HPsrX9Dq5qpD1JT4daxsYOrlhK7sBNPGF3GlX.wBixuDZEH1jT9me', 'Omar', 'Salem', 'parent', NULL, '+966-50-789-0123', 'Al-Olaya District, Riyadh', NULL, true, NULL, 1, '2025-09-19 14:04:43.152709', '2025-09-19 14:04:43.152709');
INSERT INTO public.users (id, username, email, password, "firstName", "lastName", role, roles, phone, address, "dateOfBirth", "isActive", "lastLogin", school_id, "createdAt", "updatedAt") VALUES ('27fe24c2-0733-4655-9314-70a9281ea374', 'parent3', 'khalid.alotaibi@example.com', '$2b$10$OZ9lrtTlVYTqnaSXcy2wwup/AkD0OQ94eONH7hBdiGA8Si5DUW1TS', 'Khalid', 'Al-Otaibi', 'parent', NULL, '+966-50-890-1234', 'King Fahd District, Riyadh', NULL, true, NULL, 1, '2025-09-19 14:04:43.154895', '2025-09-19 14:04:43.154895');
INSERT INTO public.users (id, username, email, password, "firstName", "lastName", role, roles, phone, address, "dateOfBirth", "isActive", "lastLogin", school_id, "createdAt", "updatedAt") VALUES ('b6d2a95a-36a0-4911-a45c-a147a96f2dcb', 'parent4', 'mohammed.alqahtani@example.com', '$2b$10$8uIlLnY0.MUfSl0D02wOfeyNx0YjSmYt2Cyf4ZY64iwfT8/C7V1US', 'Mohammed', 'Al-Qahtani', 'parent', NULL, '+966-50-901-2345', 'Al-Nakheel District, Riyadh', NULL, true, NULL, 1, '2025-09-19 14:04:43.156951', '2025-09-19 14:04:43.156951');
INSERT INTO public.users (id, username, email, password, "firstName", "lastName", role, roles, phone, address, "dateOfBirth", "isActive", "lastLogin", school_id, "createdAt", "updatedAt") VALUES ('a6ac0305-dacf-4df9-8ae0-74f5cf25bdbc', 'parent5', 'abdullah.almutairi@example.com', '$2b$10$yi3cZYE2BcwOIRvJMmb2vuBEAqTaWN9qlITBvlfTUg3aKNdjo3lE.', 'Abdullah', 'Al-Mutairi', 'parent', NULL, '+966-50-012-3456', 'Al-Rawdah District, Riyadh', NULL, true, NULL, 1, '2025-09-19 14:04:43.158633', '2025-09-19 14:04:43.158633');
INSERT INTO public.users (id, username, email, password, "firstName", "lastName", role, roles, phone, address, "dateOfBirth", "isActive", "lastLogin", school_id, "createdAt", "updatedAt") VALUES ('2c5b5795-6986-48e6-a5ce-d16255ac2fa7', 'teacher1', 'fatima.alzahra@zinatalhaykindergarten.com', '$2b$10$np80QGK6l./jDJvMrCplqefQbzPZCP.Z8r0mlCsqgRbQInxOrKdqq', 'Fatima', 'Al-Zahra', 'teacher', NULL, '+966-50-234-5678', 'Riyadh, Saudi Arabia', NULL, true, '2025-09-19 18:09:31.346', 1, '2025-09-19 14:04:43.140152', '2025-09-19 14:09:31.348892');
INSERT INTO public.users (id, username, email, password, "firstName", "lastName", role, roles, phone, address, "dateOfBirth", "isActive", "lastLogin", school_id, "createdAt", "updatedAt") VALUES ('e83c5521-837e-4a17-92af-40c5c5e91aaa', 'parent1', 'ahmed.hassan@example.com', '$2b$10$pLHbrwOnCb03upgggyrF.eHtyQOFS3cuQpHVmsBPuN6vChKPVyEuW', 'Ahmed', 'Hassan', 'parent', NULL, '+966-50-678-9012', 'Al-Malaz District, Riyadh', NULL, true, '2025-09-19 18:09:36.706', 1, '2025-09-19 14:04:43.149966', '2025-09-19 14:09:36.707988');
INSERT INTO public.users (id, username, email, password, "firstName", "lastName", role, roles, phone, address, "dateOfBirth", "isActive", "lastLogin", school_id, "createdAt", "updatedAt") VALUES ('bd306529-6a0f-4e42-9dce-3928af367e94', 'admin', 'admin@zinatalhaykindergarten.com', '$2b$10$rePaACpflK7vahq8g/pnR.2t4Z4xjrpWpRyKRgWkR20g.Tq1mSg7u', 'System', 'Administrator', 'admin', NULL, '+966-11-123-4567', 'Main Office, Zinat Al-Haya Kindergarten', NULL, true, '2025-09-30 09:04:32.272', 1, '2025-09-19 14:04:43.127087', '2025-09-30 13:04:32.277471');


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: school_admin
--

INSERT INTO public.students (id, "firstName", "lastName", "dateOfBirth", gender, address, phone, email, "emergencyContact", "medicalInfo", notes, "secondName", "thirdName", nationality, "studentId", photo, "createdAt", "updatedAt", user_id, school_id, room_id, first_name, family_name, date_of_birth, medical_conditions, allergies, emergency_contact, group_id, created_at, updated_at) VALUES ('f6cec17d-e0c4-4904-b934-0dd2b847ca16', 'Yusuf', 'Hassan', '2019-03-15', 'male', 'Al-Malaz District, Riyadh', NULL, NULL, '+966-50-678-9012', 'No known allergies', 'Very active and loves building blocks', 'Ahmed', 'Ali', 'Saudi', 'STU001', NULL, '2025-09-19 14:04:43.195549', '2025-09-19 14:04:43.195549', NULL, 1, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-19 14:04:43.195549', '2025-09-19 14:04:43.195549');
INSERT INTO public.students (id, "firstName", "lastName", "dateOfBirth", gender, address, phone, email, "emergencyContact", "medicalInfo", notes, "secondName", "thirdName", nationality, "studentId", photo, "createdAt", "updatedAt", user_id, school_id, room_id, first_name, family_name, date_of_birth, medical_conditions, allergies, emergency_contact, group_id, created_at, updated_at) VALUES ('738c7a69-4ace-447f-ae7d-86b230179c64', 'Zahra', 'Hassan', '2020-07-22', 'female', 'Al-Malaz District, Riyadh', NULL, NULL, '+966-50-678-9012', 'Mild food allergy to nuts', 'Loves reading and drawing', 'Ahmed', 'Ali', 'Saudi', 'STU002', NULL, '2025-09-19 14:04:43.197739', '2025-09-19 14:04:43.197739', NULL, 1, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-19 14:04:43.197739', '2025-09-19 14:04:43.197739');
INSERT INTO public.students (id, "firstName", "lastName", "dateOfBirth", gender, address, phone, email, "emergencyContact", "medicalInfo", notes, "secondName", "thirdName", nationality, "studentId", photo, "createdAt", "updatedAt", user_id, school_id, room_id, first_name, family_name, date_of_birth, medical_conditions, allergies, emergency_contact, group_id, created_at, updated_at) VALUES ('8e50ded5-4571-4112-9c28-4a1bf7aa3618', 'Khalid', 'Salem', '2018-11-08', 'male', 'Al-Olaya District, Riyadh', NULL, NULL, '+966-50-789-0123', 'Asthma - has inhaler', 'Excellent at mathematics and puzzles', 'Omar', 'Mohammed', 'Saudi', 'STU003', NULL, '2025-09-19 14:04:43.199584', '2025-09-19 14:04:43.199584', NULL, 1, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-19 14:04:43.199584', '2025-09-19 14:04:43.199584');
INSERT INTO public.students (id, "firstName", "lastName", "dateOfBirth", gender, address, phone, email, "emergencyContact", "medicalInfo", notes, "secondName", "thirdName", nationality, "studentId", photo, "createdAt", "updatedAt", user_id, school_id, room_id, first_name, family_name, date_of_birth, medical_conditions, allergies, emergency_contact, group_id, created_at, updated_at) VALUES ('6f8d4364-1ed4-4e68-bbc8-e2c7fc06ce25', 'Lina', 'Al-Otaibi', '2019-05-12', 'female', 'King Fahd District, Riyadh', NULL, NULL, '+966-50-890-1234', 'No known medical conditions', 'Very social and loves group activities', 'Khalid', 'Abdullah', 'Saudi', 'STU004', NULL, '2025-09-19 14:04:43.201612', '2025-09-19 14:04:43.201612', NULL, 1, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-19 14:04:43.201612', '2025-09-19 14:04:43.201612');
INSERT INTO public.students (id, "firstName", "lastName", "dateOfBirth", gender, address, phone, email, "emergencyContact", "medicalInfo", notes, "secondName", "thirdName", nationality, "studentId", photo, "createdAt", "updatedAt", user_id, school_id, room_id, first_name, family_name, date_of_birth, medical_conditions, allergies, emergency_contact, group_id, created_at, updated_at) VALUES ('0dfb30a9-0277-4498-b73c-b945c6a045c2', 'Omar', 'Al-Qahtani', '2020-01-30', 'male', 'Al-Nakheel District, Riyadh', NULL, NULL, '+966-50-901-2345', 'No known allergies', 'Loves music and singing', 'Mohammed', 'Salem', 'Saudi', 'STU005', NULL, '2025-09-19 14:04:43.204037', '2025-09-19 14:04:43.204037', NULL, 1, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-19 14:04:43.204037', '2025-09-19 14:04:43.204037');
INSERT INTO public.students (id, "firstName", "lastName", "dateOfBirth", gender, address, phone, email, "emergencyContact", "medicalInfo", notes, "secondName", "thirdName", nationality, "studentId", photo, "createdAt", "updatedAt", user_id, school_id, room_id, first_name, family_name, date_of_birth, medical_conditions, allergies, emergency_contact, group_id, created_at, updated_at) VALUES ('aafed5c4-9d8f-4fb3-a9c0-cdb586987ed9', 'Nora', 'Al-Mutairi', '2019-09-18', 'female', 'Al-Rawdah District, Riyadh', NULL, NULL, '+966-50-012-3456', 'Lactose intolerant', 'Creative and artistic, loves painting', 'Abdullah', 'Fahad', 'Saudi', 'STU006', NULL, '2025-09-19 14:04:43.20571', '2025-09-19 14:04:43.20571', NULL, 1, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-19 14:04:43.20571', '2025-09-19 14:04:43.20571');


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: school_admin
--



--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: school_admin
--

INSERT INTO public.groups (id, name, description, age_range_min, age_range_max, capacity, is_active, color, status, "studentCount", "teacherCount", school_id, room_id, academic_year_id, created_at, updated_at) VALUES ('e797a434-64a1-47a6-ba41-6f3666596bc6', 'Future Leaders', 'Age group 4-5 years - Pre-academic skills and independence', 4, 5, 20, true, '#4ECDC4', 'active', 1, 1, 1, NULL, NULL, '2025-09-19 14:04:43.212608', '2025-09-19 14:04:43.323855');
INSERT INTO public.groups (id, name, description, age_range_min, age_range_max, capacity, is_active, color, status, "studentCount", "teacherCount", school_id, room_id, academic_year_id, created_at, updated_at) VALUES ('48802766-62a5-4457-9d74-47bfcda72ace', 'Bright Minds', 'Age group 3-4 years - Language and social skills development', 3, 4, 18, true, '#FF6B6B', 'active', 2, 1, 1, NULL, NULL, '2025-09-19 14:04:43.210763', '2025-09-19 14:04:43.329976');
INSERT INTO public.groups (id, name, description, age_range_min, age_range_max, capacity, is_active, color, status, "studentCount", "teacherCount", school_id, room_id, academic_year_id, created_at, updated_at) VALUES ('b23ce3b0-86ea-4a10-9c3c-4976f4273069', 'Creative Explorers', 'Mixed age group for creative and artistic activities', 3, 5, 16, true, '#45B7D1', 'active', 1, 1, 1, NULL, NULL, '2025-09-19 14:04:43.214822', '2025-09-19 14:04:43.342441');
INSERT INTO public.groups (id, name, description, age_range_min, age_range_max, capacity, is_active, color, status, "studentCount", "teacherCount", school_id, room_id, academic_year_id, created_at, updated_at) VALUES ('43a1c824-b3fd-4528-a3c6-0cc737cea8dc', 'Little Stars', 'Age group 2-3 years - Early development and basic skills', 2, 3, 15, false, '#FFD700', 'active', 2, 1, 1, NULL, NULL, '2025-09-19 14:04:43.208787', '2025-09-30 19:15:50.818974');


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: school_admin
--



--
-- Data for Name: attendances; Type: TABLE DATA; Schema: public; Owner: school_admin
--

INSERT INTO public.attendances (id, attendance_date, status, check_in_time, check_out_time, notes, reason, is_excused, student_id, group_id, recorded_by, created_at, updated_at) VALUES (3, '2025-10-03', 'present', NULL, NULL, 'Test attendance', NULL, false, '8e50ded5-4571-4112-9c28-4a1bf7aa3618', 'e797a434-64a1-47a6-ba41-6f3666596bc6', NULL, '2025-10-03 17:55:13.522752', '2025-10-03 17:55:13.522752');
INSERT INTO public.attendances (id, attendance_date, status, check_in_time, check_out_time, notes, reason, is_excused, student_id, group_id, recorded_by, created_at, updated_at) VALUES (4, '2025-10-03', 'late', '08:30:00', NULL, 'Arrived 30 minutes late', NULL, false, '8e50ded5-4571-4112-9c28-4a1bf7aa3618', 'e797a434-64a1-47a6-ba41-6f3666596bc6', NULL, '2025-10-03 17:55:37.868038', '2025-10-03 17:55:37.868038');
INSERT INTO public.attendances (id, attendance_date, status, check_in_time, check_out_time, notes, reason, is_excused, student_id, group_id, recorded_by, created_at, updated_at) VALUES (5, '2025-10-04', 'present', '08:00:00', NULL, 'On time', NULL, false, '6f8d4364-1ed4-4e68-bbc8-e2c7fc06ce25', '48802766-62a5-4457-9d74-47bfcda72ace', NULL, '2025-10-03 17:58:03.369546', '2025-10-03 17:58:03.369546');
INSERT INTO public.attendances (id, attendance_date, status, check_in_time, check_out_time, notes, reason, is_excused, student_id, group_id, recorded_by, created_at, updated_at) VALUES (6, '2025-10-04', 'absent', NULL, NULL, 'Sick at home', NULL, true, 'f6cec17d-e0c4-4904-b934-0dd2b847ca16', '48802766-62a5-4457-9d74-47bfcda72ace', NULL, '2025-10-03 17:58:03.369546', '2025-10-03 17:58:03.369546');
INSERT INTO public.attendances (id, attendance_date, status, check_in_time, check_out_time, notes, reason, is_excused, student_id, group_id, recorded_by, created_at, updated_at) VALUES (7, '2025-10-10', 'excused', NULL, NULL, '', NULL, true, 'aafed5c4-9d8f-4fb3-a9c0-cdb586987ed9', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', NULL, '2025-10-10 04:48:52.377867', '2025-10-10 04:48:52.377867');
INSERT INTO public.attendances (id, attendance_date, status, check_in_time, check_out_time, notes, reason, is_excused, student_id, group_id, recorded_by, created_at, updated_at) VALUES (8, '2025-10-10', 'excused', NULL, NULL, '', NULL, true, 'aafed5c4-9d8f-4fb3-a9c0-cdb586987ed9', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', NULL, '2025-10-10 04:49:00.157725', '2025-10-10 04:49:00.157725');
INSERT INTO public.attendances (id, attendance_date, status, check_in_time, check_out_time, notes, reason, is_excused, student_id, group_id, recorded_by, created_at, updated_at) VALUES (9, '2025-10-10', 'excused', NULL, NULL, '', NULL, true, 'f6cec17d-e0c4-4904-b934-0dd2b847ca16', '48802766-62a5-4457-9d74-47bfcda72ace', NULL, '2025-10-10 04:49:12.316702', '2025-10-10 04:49:12.316702');
INSERT INTO public.attendances (id, attendance_date, status, check_in_time, check_out_time, notes, reason, is_excused, student_id, group_id, recorded_by, created_at, updated_at) VALUES (10, '2025-10-10', 'absent', NULL, NULL, '', NULL, false, '6f8d4364-1ed4-4e68-bbc8-e2c7fc06ce25', '48802766-62a5-4457-9d74-47bfcda72ace', NULL, '2025-10-10 04:49:12.316702', '2025-10-10 04:49:12.316702');
INSERT INTO public.attendances (id, attendance_date, status, check_in_time, check_out_time, notes, reason, is_excused, student_id, group_id, recorded_by, created_at, updated_at) VALUES (11, '2025-10-10', 'excused', NULL, NULL, '', NULL, true, 'f6cec17d-e0c4-4904-b934-0dd2b847ca16', '48802766-62a5-4457-9d74-47bfcda72ace', NULL, '2025-10-10 05:12:51.989349', '2025-10-10 05:12:51.989349');
INSERT INTO public.attendances (id, attendance_date, status, check_in_time, check_out_time, notes, reason, is_excused, student_id, group_id, recorded_by, created_at, updated_at) VALUES (12, '2025-10-10', 'late', NULL, NULL, '', NULL, false, '6f8d4364-1ed4-4e68-bbc8-e2c7fc06ce25', '48802766-62a5-4457-9d74-47bfcda72ace', NULL, '2025-10-10 05:12:51.989349', '2025-10-10 05:12:51.989349');
INSERT INTO public.attendances (id, attendance_date, status, check_in_time, check_out_time, notes, reason, is_excused, student_id, group_id, recorded_by, created_at, updated_at) VALUES (13, '2025-10-10', 'excused', NULL, NULL, '', NULL, true, 'f6cec17d-e0c4-4904-b934-0dd2b847ca16', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', NULL, '2025-10-10 05:13:05.775556', '2025-10-10 05:13:05.775556');
INSERT INTO public.attendances (id, attendance_date, status, check_in_time, check_out_time, notes, reason, is_excused, student_id, group_id, recorded_by, created_at, updated_at) VALUES (14, '2025-10-10', 'late', NULL, NULL, '', NULL, false, '6f8d4364-1ed4-4e68-bbc8-e2c7fc06ce25', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', NULL, '2025-10-10 05:13:05.775556', '2025-10-10 05:13:05.775556');
INSERT INTO public.attendances (id, attendance_date, status, check_in_time, check_out_time, notes, reason, is_excused, student_id, group_id, recorded_by, created_at, updated_at) VALUES (15, '2025-10-10', 'late', NULL, NULL, '', NULL, false, 'aafed5c4-9d8f-4fb3-a9c0-cdb586987ed9', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', NULL, '2025-10-10 05:13:05.775556', '2025-10-10 05:13:05.775556');


--
-- Data for Name: class_settings; Type: TABLE DATA; Schema: public; Owner: school_admin
--

INSERT INTO public.class_settings (id, setting_type, name, duration_minutes, time_value, is_default, is_active, color, description, order_index, additional_settings, school_id, created_at, updated_at) VALUES ('f0bb8087-d79a-41f1-9b64-ce928d51a243', 'duration', '90 minutes', 90, NULL, false, true, NULL, NULL, 90, NULL, 1, '2025-09-19 14:28:41.891607', '2025-09-19 14:28:41.891607');


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: school_admin
--

INSERT INTO public.courses (id, name, title, category, status, description, age_group_min, age_group_max, is_active, color_code, icon, send_notifications, estimated_duration_weeks, learning_objectives, prerequisites, materials_needed, school_id, academic_year_id, created_at, updated_at, "totalDuration", "createdDate", "lastModified", "targetAgeGroup", "difficultyLevel", "maxStudents") VALUES ('b65fd197-6b1c-407f-ad2a-9631dcb91fc1', 'Language Development', 'Language Development', 'Language Arts', 'active', 'Building vocabulary, communication skills, and early literacy', 2, 5, true, '#FF6B6B', '📚', true, 36, 'Develop speaking, listening, reading readiness, and writing skills', 'None', 'Books, flashcards, writing materials', 1, 'df68b56d-cb8a-45cd-8419-c21621d96b29', '2025-09-19 14:04:43.218479', '2025-09-19 14:04:43.218479', 36, NULL, NULL, '2-5 years', 'Beginner', 20);
INSERT INTO public.courses (id, name, title, category, status, description, age_group_min, age_group_max, is_active, color_code, icon, send_notifications, estimated_duration_weeks, learning_objectives, prerequisites, materials_needed, school_id, academic_year_id, created_at, updated_at, "totalDuration", "createdDate", "lastModified", "targetAgeGroup", "difficultyLevel", "maxStudents") VALUES ('f0fca69e-fd3c-4ca6-a380-c0765072d74b', 'Mathematics Foundations', 'Mathematics Foundations', 'Mathematics', 'active', 'Number recognition, counting, basic math concepts', 3, 5, true, '#4ECDC4', '🔢', true, 36, 'Learn numbers, counting, shapes, patterns, and basic operations', 'Basic attention span', 'Counting blocks, number cards, shape puzzles', 1, 'df68b56d-cb8a-45cd-8419-c21621d96b29', '2025-09-19 14:04:43.221125', '2025-09-19 14:04:43.221125', 36, NULL, NULL, '3-5 years', 'Beginner', 18);
INSERT INTO public.courses (id, name, title, category, status, description, age_group_min, age_group_max, is_active, color_code, icon, send_notifications, estimated_duration_weeks, learning_objectives, prerequisites, materials_needed, school_id, academic_year_id, created_at, updated_at, "totalDuration", "createdDate", "lastModified", "targetAgeGroup", "difficultyLevel", "maxStudents") VALUES ('02e181b8-b4bf-429d-a641-7980f3c9a3d0', 'Creative Arts', 'Creative Arts', 'Arts', 'active', 'Art, music, drama, and creative expression', 2, 5, true, '#96CEB4', '🎨', true, 36, 'Develop creativity, fine motor skills, and artistic expression', 'None', 'Art supplies, musical instruments, costumes', 1, 'df68b56d-cb8a-45cd-8419-c21621d96b29', '2025-09-19 14:04:43.223432', '2025-09-19 14:04:43.223432', 36, NULL, NULL, '2-5 years', 'Beginner', 15);
INSERT INTO public.courses (id, name, title, category, status, description, age_group_min, age_group_max, is_active, color_code, icon, send_notifications, estimated_duration_weeks, learning_objectives, prerequisites, materials_needed, school_id, academic_year_id, created_at, updated_at, "totalDuration", "createdDate", "lastModified", "targetAgeGroup", "difficultyLevel", "maxStudents") VALUES ('732535e1-34de-40ac-9c8e-9788f2a41d21', 'Physical Development', 'Physical Development', 'Physical Education', 'active', 'Gross and fine motor skills, physical fitness', 2, 5, true, '#FFEAA7', '🏃', true, 36, 'Develop motor skills, coordination, and physical fitness', 'None', 'Sports equipment, playground, exercise mats', 1, 'df68b56d-cb8a-45cd-8419-c21621d96b29', '2025-09-19 14:04:43.225562', '2025-09-19 14:04:43.225562', 36, NULL, NULL, '2-5 years', 'Beginner', 25);
INSERT INTO public.courses (id, name, title, category, status, description, age_group_min, age_group_max, is_active, color_code, icon, send_notifications, estimated_duration_weeks, learning_objectives, prerequisites, materials_needed, school_id, academic_year_id, created_at, updated_at, "totalDuration", "createdDate", "lastModified", "targetAgeGroup", "difficultyLevel", "maxStudents") VALUES ('61433d8b-d751-4cdb-a2ca-464b709a08c4', 'Social Skills', 'Social Skills', 'Social Development', 'active', 'Interaction, sharing, cooperation, and emotional development', 2, 5, true, '#DDA0DD', '👥', true, 36, 'Learn cooperation, empathy, communication, and conflict resolution', 'None', 'Group games, role-play materials, books about emotions', 1, 'df68b56d-cb8a-45cd-8419-c21621d96b29', '2025-09-19 14:04:43.227427', '2025-09-19 14:04:43.227427', 36, NULL, NULL, '2-5 years', 'Beginner', 20);
INSERT INTO public.courses (id, name, title, category, status, description, age_group_min, age_group_max, is_active, color_code, icon, send_notifications, estimated_duration_weeks, learning_objectives, prerequisites, materials_needed, school_id, academic_year_id, created_at, updated_at, "totalDuration", "createdDate", "lastModified", "targetAgeGroup", "difficultyLevel", "maxStudents") VALUES ('df4b93dc-bccf-44db-a6f0-b8d5151eb7c3', 'Test Course', NULL, NULL, 'draft', 'A test course to verify storage', 3, 5, true, NULL, NULL, true, NULL, NULL, NULL, NULL, 1, 'df68b56d-cb8a-45cd-8419-c21621d96b29', '2025-10-19 13:48:26.036761', '2025-10-19 13:48:26.036761', NULL, NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: school_admin
--



--
-- Data for Name: phases; Type: TABLE DATA; Schema: public; Owner: school_admin
--

INSERT INTO public.phases (id, name, description, order_index, estimated_duration_days, is_active, course_id, created_at, updated_at) VALUES ('a5c5e104-dd0b-4f9a-8b45-c791f2322106', 'ghjrtyj', 'tyjetyj', 1, NULL, true, '732535e1-34de-40ac-9c8e-9788f2a41d21', '2025-10-10 06:06:37.040259', '2025-10-10 06:06:37.040259');
INSERT INTO public.phases (id, name, description, order_index, estimated_duration_days, is_active, course_id, created_at, updated_at) VALUES ('18c3e438-3f33-4117-8816-251571bf750e', 'fgbsfgn', 'sdgnsgdn', 2, NULL, true, '732535e1-34de-40ac-9c8e-9788f2a41d21', '2025-10-10 06:08:23.892833', '2025-10-10 06:08:23.892833');
INSERT INTO public.phases (id, name, description, order_index, estimated_duration_days, is_active, course_id, created_at, updated_at) VALUES ('b81af9c3-2d6d-4d93-83db-86525ef01f3e', 'Test Phase 1', 'First phase of the test course', 1, NULL, true, 'df4b93dc-bccf-44db-a6f0-b8d5151eb7c3', '2025-10-19 13:48:36.708745', '2025-10-19 13:48:36.708745');


--
-- Data for Name: milestones; Type: TABLE DATA; Schema: public; Owner: school_admin
--

INSERT INTO public.milestones (id, name, description, order_index, is_required, points, phase_id, title, type, target_week, weight, difficulty_level, estimated_duration_minutes, required_resources, allow_late_submission, enable_peer_review, created_at, updated_at) VALUES ('30ef9441-f562-40e3-8203-5d9583f281ea', 'tyjetyj', 'etyjetyjytj', 1, true, 0, 'a5c5e104-dd0b-4f9a-8b45-c791f2322106', NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, false, '2025-10-10 06:06:57.861598', '2025-10-10 06:06:57.861598');
INSERT INTO public.milestones (id, name, description, order_index, is_required, points, phase_id, title, type, target_week, weight, difficulty_level, estimated_duration_minutes, required_resources, allow_late_submission, enable_peer_review, created_at, updated_at) VALUES ('732fd4e5-8028-4bf0-977e-ae691a02f3b7', 'Test Milestone 1', 'First milestone of the test phase', 1, true, NULL, 'b81af9c3-2d6d-4d93-83db-86525ef01f3e', NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, false, '2025-10-19 13:48:47.902134', '2025-10-19 13:48:47.902134');


--
-- Data for Name: parents; Type: TABLE DATA; Schema: public; Owner: school_admin
--

INSERT INTO public.parents (id, "firstName", "lastName", email, phone, address, user_id, "createdAt", "updatedAt", student_id, created_at, updated_at) VALUES (1, 'Ahmed', 'Hassan', 'ahmed.hassan@example.com', '+966-50-678-9012', 'Al-Malaz District, Riyadh', NULL, '2025-09-19 14:04:43.174135', '2025-09-19 14:04:43.174135', 1, '2025-09-19 14:04:43.174135', '2025-09-19 14:04:43.174135');
INSERT INTO public.parents (id, "firstName", "lastName", email, phone, address, user_id, "createdAt", "updatedAt", student_id, created_at, updated_at) VALUES (2, 'Layla', 'Hassan', 'layla.hassan@example.com', '+966-50-678-9013', 'Al-Malaz District, Riyadh', NULL, '2025-09-19 14:04:43.176787', '2025-09-19 14:04:43.176787', 1, '2025-09-19 14:04:43.176787', '2025-09-19 14:04:43.176787');
INSERT INTO public.parents (id, "firstName", "lastName", email, phone, address, user_id, "createdAt", "updatedAt", student_id, created_at, updated_at) VALUES (3, 'Omar', 'Salem', 'omar.salem@example.com', '+966-50-789-0123', 'Al-Olaya District, Riyadh', NULL, '2025-09-19 14:04:43.179011', '2025-09-19 14:04:43.179011', 1, '2025-09-19 14:04:43.179011', '2025-09-19 14:04:43.179011');
INSERT INTO public.parents (id, "firstName", "lastName", email, phone, address, user_id, "createdAt", "updatedAt", student_id, created_at, updated_at) VALUES (4, 'Fatima', 'Salem', 'fatima.salem@example.com', '+966-50-789-0124', 'Al-Olaya District, Riyadh', NULL, '2025-09-19 14:04:43.181135', '2025-09-19 14:04:43.181135', 1, '2025-09-19 14:04:43.181135', '2025-09-19 14:04:43.181135');
INSERT INTO public.parents (id, "firstName", "lastName", email, phone, address, user_id, "createdAt", "updatedAt", student_id, created_at, updated_at) VALUES (5, 'Khalid', 'Al-Otaibi', 'khalid.alotaibi@example.com', '+966-50-890-1234', 'King Fahd District, Riyadh', NULL, '2025-09-19 14:04:43.183099', '2025-09-19 14:04:43.183099', 1, '2025-09-19 14:04:43.183099', '2025-09-19 14:04:43.183099');
INSERT INTO public.parents (id, "firstName", "lastName", email, phone, address, user_id, "createdAt", "updatedAt", student_id, created_at, updated_at) VALUES (6, 'Maryam', 'Al-Otaibi', 'maryam.alotaibi@example.com', '+966-50-890-1235', 'King Fahd District, Riyadh', NULL, '2025-09-19 14:04:43.184937', '2025-09-19 14:04:43.184937', 1, '2025-09-19 14:04:43.184937', '2025-09-19 14:04:43.184937');
INSERT INTO public.parents (id, "firstName", "lastName", email, phone, address, user_id, "createdAt", "updatedAt", student_id, created_at, updated_at) VALUES (7, 'Mohammed', 'Al-Qahtani', 'mohammed.alqahtani@example.com', '+966-50-901-2345', 'Al-Nakheel District, Riyadh', NULL, '2025-09-19 14:04:43.18683', '2025-09-19 14:04:43.18683', 1, '2025-09-19 14:04:43.18683', '2025-09-19 14:04:43.18683');
INSERT INTO public.parents (id, "firstName", "lastName", email, phone, address, user_id, "createdAt", "updatedAt", student_id, created_at, updated_at) VALUES (8, 'Aisha', 'Al-Qahtani', 'aisha.alqahtani@example.com', '+966-50-901-2346', 'Al-Nakheel District, Riyadh', NULL, '2025-09-19 14:04:43.188526', '2025-09-19 14:04:43.188526', 1, '2025-09-19 14:04:43.188526', '2025-09-19 14:04:43.188526');
INSERT INTO public.parents (id, "firstName", "lastName", email, phone, address, user_id, "createdAt", "updatedAt", student_id, created_at, updated_at) VALUES (9, 'Abdullah', 'Al-Mutairi', 'abdullah.almutairi@example.com', '+966-50-012-3456', 'Al-Rawdah District, Riyadh', NULL, '2025-09-19 14:04:43.190133', '2025-09-19 14:04:43.190133', 1, '2025-09-19 14:04:43.190133', '2025-09-19 14:04:43.190133');
INSERT INTO public.parents (id, "firstName", "lastName", email, phone, address, user_id, "createdAt", "updatedAt", student_id, created_at, updated_at) VALUES (10, 'Nour', 'Al-Mutairi', 'nour.almutairi@example.com', '+966-50-012-3457', 'Al-Rawdah District, Riyadh', NULL, '2025-09-19 14:04:43.191882', '2025-09-19 14:04:43.191882', 1, '2025-09-19 14:04:43.191882', '2025-09-19 14:04:43.191882');


--
-- Data for Name: reminders; Type: TABLE DATA; Schema: public; Owner: school_admin
--



--
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: school_admin
--

INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('de727931-f60b-4e81-9bcb-1ed6dd9cfc4e', 'sunday', '08:00:00', '08:45:00', 45, 'Test notes', true, NULL, 'active', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', 'b65fd197-6b1c-407f-ad2a-9631dcb91fc1', NULL, '2025-09-19 15:13:35.638894', '2025-09-19 15:13:35.638894', '46d30267-6432-4727-896c-b5aad126a61f');
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('9a575ff4-487c-480a-b2f9-3d45fec4f3fe', 'monday', '09:00:00', '09:45:00', 45, 'Introduction to numbers', true, NULL, 'active', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', 'b65fd197-6b1c-407f-ad2a-9631dcb91fc1', NULL, '2025-09-19 15:16:30.548001', '2025-09-19 15:16:30.548001', '46d30267-6432-4727-896c-b5aad126a61f');
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('47fb2d42-0134-4660-9468-5b5128560367', 'monday', '09:00:00', '09:45:00', 45, 'Test schedule from frontend simulation', true, NULL, 'active', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', '61433d8b-d751-4cdb-a2ca-464b709a08c4', NULL, '2025-09-19 15:50:04.198674', '2025-09-19 15:50:04.198674', 'a845910d-da81-48d2-9dc7-3b3f5ebc3716');
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('d1365a1c-3c0c-4c58-83e4-9bf9ec777655', 'monday', '09:00:00', '09:45:00', 45, 'Test schedule from frontend simulation', true, NULL, 'active', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', '61433d8b-d751-4cdb-a2ca-464b709a08c4', NULL, '2025-09-19 15:50:23.486466', '2025-09-19 15:50:23.486466', 'a845910d-da81-48d2-9dc7-3b3f5ebc3716');
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('751afc16-79dc-4d0d-bd25-4ee4be423281', 'sunday', '08:00:00', '09:30:00', 90, 'sfgnsfgn', true, NULL, 'active', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', '732535e1-34de-40ac-9c8e-9788f2a41d21', NULL, '2025-09-24 14:29:11.794261', '2025-09-24 14:29:11.794261', NULL);
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('8be41f4f-eb9d-4462-bd1b-84df3fcd43b5', 'sunday', '08:00:00', '09:30:00', 90, 'wrtbwrtb', true, NULL, 'active', 'e797a434-64a1-47a6-ba41-6f3666596bc6', '61433d8b-d751-4cdb-a2ca-464b709a08c4', NULL, '2025-09-24 14:30:40.333597', '2025-09-24 14:30:40.333597', NULL);
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('c748c6d3-debe-4332-9578-530c60e9f515', 'tuesday', '10:00:00', '10:45:00', 45, 'Test schedule for table verification', true, NULL, 'active', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', NULL, NULL, '2025-09-29 05:14:19.5799', '2025-09-29 05:14:19.5799', NULL);
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('56bd4bbb-8132-4ae1-8ffa-b5ad75437071', 'wednesday', '11:00:00', '11:45:00', 45, 'Test schedule created during development', true, NULL, 'active', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', NULL, NULL, '2025-09-30 13:09:05.832203', '2025-09-30 13:09:05.832203', NULL);
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('ac7de153-63c8-41cd-957b-032766f4ae1a', 'sunday', '09:00:00', '10:30:00', 90, 'aerthaerth', true, NULL, 'active', 'e797a434-64a1-47a6-ba41-6f3666596bc6', '732535e1-34de-40ac-9c8e-9788f2a41d21', NULL, '2025-09-30 17:40:51.589769', '2025-09-30 17:40:51.589769', NULL);
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('2703fb90-83a5-4393-9357-9a7f9f623434', 'monday', '09:00:00', '09:45:00', 45, 'Test schedule creation', true, NULL, 'active', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', '732535e1-34de-40ac-9c8e-9788f2a41d21', NULL, '2025-09-24 14:24:23.234709', '2025-09-30 17:43:34.17116', '46d30267-6432-4727-896c-b5aad126a61f');
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('52172b2e-3bd5-4554-a198-7f79be30ad73', 'tuesday', '10:00:00', '10:45:00', 45, 'Test schedule with teacher assignment', true, NULL, 'active', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', '732535e1-34de-40ac-9c8e-9788f2a41d21', NULL, '2025-09-30 17:43:51.13216', '2025-09-30 17:43:51.13216', '46d30267-6432-4727-896c-b5aad126a61f');
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('e23c2cac-7099-4725-90f2-1c1af1d2344f', 'monday', '08:00:00', '09:30:00', 90, 'wrthwrth', true, NULL, 'active', 'e797a434-64a1-47a6-ba41-6f3666596bc6', '732535e1-34de-40ac-9c8e-9788f2a41d21', NULL, '2025-09-30 17:51:12.475582', '2025-09-30 17:51:12.475582', NULL);
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('c4207fb2-8922-4910-ba03-6414658971e1', 'monday', '09:00:00', '10:30:00', 90, 'rtnwsrtnsw', true, NULL, 'active', 'e797a434-64a1-47a6-ba41-6f3666596bc6', '732535e1-34de-40ac-9c8e-9788f2a41d21', NULL, '2025-09-30 17:53:57.079132', '2025-09-30 17:53:57.079132', NULL);
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('725552c4-7048-4b1f-a066-db684fe50600', 'friday', '14:00:00', '14:45:00', 45, 'Test schedule after schema fixes', true, NULL, 'active', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', '732535e1-34de-40ac-9c8e-9788f2a41d21', NULL, '2025-09-30 18:00:32.246393', '2025-09-30 18:00:32.246393', '46d30267-6432-4727-896c-b5aad126a61f');
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('a4a01bc4-7723-4b87-8742-a7f4e4031ee4', 'tuesday', '09:00:00', '10:30:00', 90, 'klbkjhv', true, NULL, 'active', 'e797a434-64a1-47a6-ba41-6f3666596bc6', '732535e1-34de-40ac-9c8e-9788f2a41d21', NULL, '2025-09-30 18:01:27.440877', '2025-09-30 18:01:27.440877', NULL);
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('b7f14798-d0ca-43ef-9fa9-641dbfbf76f1', 'saturday', '16:00:00', '16:45:00', 45, 'Test with teacher assignment fix', true, NULL, 'active', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', '732535e1-34de-40ac-9c8e-9788f2a41d21', NULL, '2025-09-30 18:09:42.020956', '2025-09-30 18:09:42.020956', 'a845910d-da81-48d2-9dc7-3b3f5ebc3716');
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('ca6839ed-5073-47a4-80b8-5dcb90b49dc3', 'friday', '15:00:00', '15:45:00', 45, 'Test schedule with frontend fixes', true, NULL, 'active', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', '61433d8b-d751-4cdb-a2ca-464b709a08c4', NULL, '2025-09-30 18:09:46.787398', '2025-09-30 18:09:46.787398', 'a845910d-da81-48d2-9dc7-3b3f5ebc3716');
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('f156f238-320f-4f75-a106-c33d0f8b951b', 'friday', '15:00:00', '15:45:00', 45, 'Test schedule with frontend fixes', true, NULL, 'active', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', '61433d8b-d751-4cdb-a2ca-464b709a08c4', NULL, '2025-09-30 18:09:49.467535', '2025-09-30 18:09:49.467535', 'a845910d-da81-48d2-9dc7-3b3f5ebc3716');
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('16d057fd-0f71-442a-a470-feea62713cb0', 'friday', '15:00:00', '15:45:00', 45, 'Test schedule with frontend fixes', true, NULL, 'active', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', '61433d8b-d751-4cdb-a2ca-464b709a08c4', NULL, '2025-09-30 18:09:50.994598', '2025-09-30 18:09:50.994598', 'a845910d-da81-48d2-9dc7-3b3f5ebc3716');
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('dc3569f8-96d4-4feb-a433-0bdae6f50741', 'friday', '15:00:00', '15:45:00', 45, 'Test schedule with frontend fixes', true, NULL, 'active', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', '61433d8b-d751-4cdb-a2ca-464b709a08c4', NULL, '2025-09-30 18:09:51.633704', '2025-09-30 18:09:51.633704', 'a845910d-da81-48d2-9dc7-3b3f5ebc3716');
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('b4f2895f-c7af-4698-8a10-6f9bba604519', 'sunday', '17:00:00', '17:45:00', 45, 'Final test schedule', true, NULL, 'active', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069', '732535e1-34de-40ac-9c8e-9788f2a41d21', NULL, '2025-09-30 18:10:44.431796', '2025-09-30 18:10:44.431796', 'a845910d-da81-48d2-9dc7-3b3f5ebc3716');
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('9a759cb0-1a8d-44c0-bb62-ed510693549e', 'tuesday', '10:00:00', '10:45:00', 45, 'Test teacher assignment fix', true, NULL, 'active', 'e797a434-64a1-47a6-ba41-6f3666596bc6', '732535e1-34de-40ac-9c8e-9788f2a41d21', NULL, '2025-09-30 18:13:40.478026', '2025-09-30 18:13:40.478026', 'a845910d-da81-48d2-9dc7-3b3f5ebc3716');
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('698d734e-7a6c-4cbb-a2d9-6175b9b4aeb6', 'monday', '10:00:00', '11:30:00', 90, 'e3tynt3yn', true, NULL, 'active', 'e797a434-64a1-47a6-ba41-6f3666596bc6', '732535e1-34de-40ac-9c8e-9788f2a41d21', NULL, '2025-09-30 18:17:13.114526', '2025-09-30 18:17:13.114526', '46d30267-6432-4727-896c-b5aad126a61f');
INSERT INTO public.schedules (id, day_of_week, start_time, end_time, duration_minutes, notes, is_recurring, specific_date, status, group_id, course_id, room_id, created_at, updated_at, teacher_id) VALUES ('14542854-7ba8-44cd-8a42-0ec115b2b40e', 'sunday', '11:00:00', '12:30:00', 90, '2erf2erg', true, NULL, 'active', 'e797a434-64a1-47a6-ba41-6f3666596bc6', 'f0fca69e-fd3c-4ca6-a380-c0765072d74b', NULL, '2025-09-30 18:18:11.881421', '2025-09-30 18:18:11.881421', 'eb9bf6a7-8fb0-4262-9194-1aa75b9ce7c6');


--
-- Data for Name: semesters; Type: TABLE DATA; Schema: public; Owner: school_admin
--

INSERT INTO public.semesters (id, title, start_date, end_date, academic_year_id, description, is_active, created_at, updated_at) VALUES ('1baefa1a-a3fe-4678-9a20-0a7c31f3efc9', 'First Semester', '2025-09-01', '2026-01-15', 'df68b56d-cb8a-45cd-8419-c21621d96b29', 'Fall semester focusing on foundational skills', true, '2025-09-19 14:04:43.166988', '2025-09-19 14:04:43.166988');
INSERT INTO public.semesters (id, title, start_date, end_date, academic_year_id, description, is_active, created_at, updated_at) VALUES ('bc6e2956-8fff-40e6-9be1-5b1cdfb65cc4', 'Second Semester', '2026-01-16', '2026-06-30', 'df68b56d-cb8a-45cd-8419-c21621d96b29', 'Spring semester with advanced learning activities', false, '2025-09-19 14:04:43.169318', '2025-09-19 14:04:43.169318');


--
-- Data for Name: student_groups; Type: TABLE DATA; Schema: public; Owner: school_admin
--

INSERT INTO public.student_groups (student_id, group_id) VALUES ('f6cec17d-e0c4-4904-b934-0dd2b847ca16', '48802766-62a5-4457-9d74-47bfcda72ace');
INSERT INTO public.student_groups (student_id, group_id) VALUES ('738c7a69-4ace-447f-ae7d-86b230179c64', '43a1c824-b3fd-4528-a3c6-0cc737cea8dc');
INSERT INTO public.student_groups (student_id, group_id) VALUES ('8e50ded5-4571-4112-9c28-4a1bf7aa3618', 'e797a434-64a1-47a6-ba41-6f3666596bc6');
INSERT INTO public.student_groups (student_id, group_id) VALUES ('6f8d4364-1ed4-4e68-bbc8-e2c7fc06ce25', '48802766-62a5-4457-9d74-47bfcda72ace');
INSERT INTO public.student_groups (student_id, group_id) VALUES ('0dfb30a9-0277-4498-b73c-b945c6a045c2', '43a1c824-b3fd-4528-a3c6-0cc737cea8dc');
INSERT INTO public.student_groups (student_id, group_id) VALUES ('aafed5c4-9d8f-4fb3-a9c0-cdb586987ed9', 'b23ce3b0-86ea-4a10-9c3c-4976f4273069');


--
-- Data for Name: student_parents; Type: TABLE DATA; Schema: public; Owner: school_admin
--

INSERT INTO public.student_parents (student_id, parent_id) VALUES ('f6cec17d-e0c4-4904-b934-0dd2b847ca16', 1);
INSERT INTO public.student_parents (student_id, parent_id) VALUES ('f6cec17d-e0c4-4904-b934-0dd2b847ca16', 2);
INSERT INTO public.student_parents (student_id, parent_id) VALUES ('738c7a69-4ace-447f-ae7d-86b230179c64', 1);
INSERT INTO public.student_parents (student_id, parent_id) VALUES ('738c7a69-4ace-447f-ae7d-86b230179c64', 2);
INSERT INTO public.student_parents (student_id, parent_id) VALUES ('8e50ded5-4571-4112-9c28-4a1bf7aa3618', 3);
INSERT INTO public.student_parents (student_id, parent_id) VALUES ('8e50ded5-4571-4112-9c28-4a1bf7aa3618', 4);
INSERT INTO public.student_parents (student_id, parent_id) VALUES ('6f8d4364-1ed4-4e68-bbc8-e2c7fc06ce25', 5);
INSERT INTO public.student_parents (student_id, parent_id) VALUES ('6f8d4364-1ed4-4e68-bbc8-e2c7fc06ce25', 6);
INSERT INTO public.student_parents (student_id, parent_id) VALUES ('0dfb30a9-0277-4498-b73c-b945c6a045c2', 7);
INSERT INTO public.student_parents (student_id, parent_id) VALUES ('0dfb30a9-0277-4498-b73c-b945c6a045c2', 8);
INSERT INTO public.student_parents (student_id, parent_id) VALUES ('aafed5c4-9d8f-4fb3-a9c0-cdb586987ed9', 9);
INSERT INTO public.student_parents (student_id, parent_id) VALUES ('aafed5c4-9d8f-4fb3-a9c0-cdb586987ed9', 10);


--
-- Data for Name: student_progress; Type: TABLE DATA; Schema: public; Owner: school_admin
--



--
-- Name: activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: school_admin
--

SELECT pg_catalog.setval('public.activities_id_seq', 1, false);


--
-- Name: attendances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: school_admin
--

SELECT pg_catalog.setval('public.attendances_id_seq', 15, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: school_admin
--

SELECT pg_catalog.setval('public.migrations_id_seq', 3, true);


--
-- Name: parents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: school_admin
--

SELECT pg_catalog.setval('public.parents_id_seq', 10, true);


--
-- Name: reminders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: school_admin
--

SELECT pg_catalog.setval('public.reminders_id_seq', 1, false);


--
-- Name: rooms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: school_admin
--

SELECT pg_catalog.setval('public.rooms_id_seq', 7, true);


--
-- Name: schools_id_seq; Type: SEQUENCE SET; Schema: public; Owner: school_admin
--

SELECT pg_catalog.setval('public.schools_id_seq', 1, true);


--
-- Name: staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: school_admin
--

SELECT pg_catalog.setval('public.staff_id_seq', 1, false);


--
-- Name: student_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: school_admin
--

SELECT pg_catalog.setval('public.student_progress_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

\unrestrict 57HaEcxtHg5HU3RJFUsIlUTNdiawDqpFdqBJ00QlBV18Z3wci2vDd8CGLX6Rhwz


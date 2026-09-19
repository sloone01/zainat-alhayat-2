import type { DocsContentMap } from '../types'

export const docsEn: DocsContentMap = {
  'admin-overview': {
    title: 'School admin overview',
    intro:
      'This guide is for the school administrator (`role: admin`). After sign-in your home is `/dashboard`. From there you configure the school, register students, run daily operations, fees v2, transport, and communications. Teachers, parents, and drivers use the same product with different navigation and limits — each article’s “Appears as” section explains their view.',
    who:
      'School admins. Platform operators use the separate `/platform` console, not this school dashboard.',
    when:
      'First week on FIKR, when onboarding new staff, or whenever you need a map of what the school admin can configure.',
    steps: [
      'Sign in and land on `/dashboard`. Confirm the school name and that your sidebar shows the full admin menu (not the teaching-only teacher nav).',
      'If your login belongs to more than one school, open the profile account switcher and pick the active staff school. Parent persona (if linked) is school-less and opens `/parent/dashboard`.',
      'Complete School settings first: academic year and one Active now semester, grades, class groups, and class-time template. Later screens depend on this structure.',
      'Create employees and permission groups under Users. One email is one login. Arabic and English names are stored on people records.',
      'Register students with the three-step wizard (`/students/register`) or process public applications in the enrollment inbox. Teachers cannot open any `/students*` routes.',
      'Build the fixed or flexible schedule, then run daily attendance for campus days and session attendance for live online classes.',
      'Create skill courses, courses with marks, and/or independent courses. Share materials; admins write weekly session plans while teachers run Weekly sessions.',
      'Configure fees v2: catalogs → packages → installment plans → level/course/bus links → student charge sheets → pending receipts.',
      'Set up the bus fleet (required driver user), GPS pickup points, and daily log. Drivers use the transport mobile flavor: Live dashboard, Bus log, Fleet, Chats.',
      'Publish the school landing page and share public enrollment (`/student-enrollment`). Families without accounts apply there; staff approve in the inbox.',
    ],
    notes: [
      'Sidebar visibility is not security — the API enforces claims. Subscribed modules on the plan can hide pages that are not entitled.',
      'Names are Arabic + English. Staff may switch schools via the account switcher; pure parents have no school switcher and see all linked children together.',
      'Fees work is fees v2 only. Do not revive legacy unrouted payment editors.',
      'Meeting rooms and live class need a Daily.co API key on the server.',
    ],
    appearsAs: {
      teacher:
        'Teachers land on `/dashboard` with a teaching-filtered sidebar: My schedule, materials, weekly sessions, progress, attendance, activities, course enrollments, bus daily log (if claimed), chats, and My meetings. They cannot open `/students*` (register, list, edit, charge sheets, enrollments inbox).',
      parent:
        'Parents are school-less on the user record. After login they always go to `/parent/dashboard` and see every linked child (even across schools) with a flat parent menu — Fees, Schedule, Attendance, Progress, Learning, Chats, Approvals, My meetings.',
      driver:
        'Drivers use the transport mobile app flavor only: Live dashboard, Bus log, Fleet, and Chats (plus More). They do not get the school-admin sidebar or academic/fee modules.',
    },
    related: ['sign-in', 'school-settings', 'users-and-roles'],
  },
  'sign-in': {
    title: 'Sign in and home',
    intro:
      'Staff (admin or teacher) open the school from the platform login or the school’s branded login page. After sign-in you land on the dashboard for that school. Staff with multiple school memberships use the profile account switcher; parents remain school-less on `/parent/dashboard`.',
    who:
      'School admins and teachers. Parents use the same login screen but are sent to the parent dashboard.',
    when: 'Every session. Also after a password reset email.',
    steps: [
      'Open Sign in from the FIKR site, or your school page at /s/your-slug/login (logo and name of that school).',
      'Enter the email and password that the school created for you. If you were just registered, use the temporary password from email, then change it in Settings.',
      'You arrive at /dashboard. Admins see school-wide shortcuts; teachers see a teaching-focused home.',
      'If the school subscription is still pending payment, an admin is limited to /billing until the first invoice is paid.',
      'Use the sidebar to open modules. What you see depends on your user group (role) and the school’s subscribed plan.',
      'If your account has memberships in more than one school (or also a Parent persona), open the profile account switcher. Staff switch sets the active school; Parent persona clears school context and opens `/parent/dashboard`.',
      'Sign out from the profile menu when finished, especially on a shared device.',
    ],
    notes: [
      'Staff can belong to more than one school via staff memberships and switch with the profile account switcher; the JWT carries the active school only.',
      'Teachers cannot open student register or the full student list (`/students*`).',
      'Hiding a nav link is not security — claims are checked on the API.',
    ],
    appearsAs: {
      teacher:
        'Same login page. Home is still `/dashboard`, but the sidebar is teaching-focused (schedule, materials, weekly sessions, progress, attendance, activities, chats). No Students, Payment settings, or school landing editor.',
      parent:
        'Same Sign in page. After success you always go to `/parent/dashboard`. There is no staff sidebar and no school switcher for pure parents — all linked children appear together.',
      driver:
        'Drivers sign in with their staff email, then use the transport mobile shell (Live dashboard, Bus log, Fleet, Chats). They are not meant to work from the full school-admin web sidebar.',
    },
    related: ['admin-overview', 'school-settings', 'users-and-roles'],
  },
  'school-settings': {
    title: 'School settings, years, grades, and groups',
    intro:
      'Before daily work, set the school calendar, grade levels, class groups, and class times. Most later screens (schedule, fees, attendance) depend on this structure.',
    who: 'School admins.',
    when:
      'At the start of a year, when adding a grade or classroom, or after changing the school logo/brand.',
    steps: [
      'Open Settings. Fill school name, contact, and logo. Use Detect from logo if you want the public enrollment form to pick brand colors from the logo.',
      'Add or activate the academic year and semesters you will teach. Mark exactly one semester Active now — that is the semester teachers enter marks for.',
      'Open Grades and create stages/levels in the order students progress (for example KG1, KG2).',
      'Open Class groups and create a group per classroom. Assign the grade (this also drives the fee level later).',
      'In Settings, set class durations and start times. One duration must be Default — regenerating periods builds the timetable template from first class to end, including breaks.',
      'Open Enrollment responsibilities if you use the public form: maintain the school and parent responsibility lists shown on the review step.',
      'Optionally open System settings for school-wide options such as how far back daily attendance may be marked.',
      'Save changes, then open Schedules or Register student to confirm groups and periods appear as expected.',
    ],
    notes: [
      'Regenerating periods updates the template only. Existing schedule rows keep their times until you edit them.',
      'The public school website is edited separately under Landing page.',
    ],
    appearsAs: {
      teacher:
        'Teachers may open personal Settings (password, language) but do not configure school calendar, grades, class groups, or enrollment responsibilities. They consume the Active now semester and group structure you set.',
      parent:
        'Parents have no school settings UI. They see the results on `/parent/schedule`, fees, and the branded public enrollment form.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['users-and-roles', 'fixed-schedule', 'landing-editor'],
  },
  'users-and-roles': {
    title: 'Users and permission groups',
    intro:
      'FIKR separates people (employees, parent logins, optional student logins) from permission groups. Groups decide which pages and actions a staff member can use.',
    who: 'School admins.',
    when:
      'When hiring staff, creating parent/student logins, or tightening who can approve fees or edit students.',
    steps: [
      'Open User groups (roles). Create a group and pick the privileges your plan allows (view, create, edit, approve, and so on).',
      'Open Employees to create staff accounts. Choose one or more groups. A temporary password is emailed.',
      'To change access later, use the employee row menu → Edit role (groups plus optional extra claims).',
      'Open Parents for parent logins and Student accounts for student logins. + opens a create page (Arabic and English names, contact, optional civil ID). Kindergarten usually needs parent login only.',
      'Parents can be linked even when their login is not tied to one school — they see every child linked to them.',
      'Link parents to students from the student editor Parents tab if the login was created separately.',
      'If a person works at more than one school, add staff membership for each school; they switch active school from the profile account switcher.',
      'Remind staff that hiding a sidebar link is not enough — claims on the API enforce access.',
    ],
    notes: [
      'Hiding a sidebar link is not security. The API checks claims. Super-admins and (during transition) school admins may still bypass group claims.',
      'A school’s subscribed modules can hide pages that are not in the plan.',
    ],
    appearsAs: {
      teacher:
        'Teachers do not manage employees or user groups. Their own account may appear under Employees, but day-to-day they only use Teaching, Attendance, and Chats according to their claims.',
      parent:
        'Parents do not create users. The school creates the parent login; after sign-in they use `/parent/...` routes only.',
      driver:
        'A driver is a staff user assigned as `driver_user_id` on a bus. They use the transport app (Live dashboard, Bus log, Fleet, Chats), not the Users admin screens.',
    },
    related: ['sign-in', 'register-student'],
  },
  'register-student': {
    title: 'Register a student (staff wizard)',
    intro:
      'Staff register creates the student immediately (not a public application). It is a three-step wizard: student, parent, class group.',
    who: 'School admins with students create access. Teachers cannot use this page.',
    when:
      'Walk-in enrollment, transferring a child in person, or when you do not need the public form.',
    steps: [
      'Open Students → Register (or /students/register).',
      'Step 1: enter student name, date of birth, and the other required fields.',
      'Step 2: link an existing parent or create a new parent profile. Optionally tick Create user account so the parent receives a login email with a temporary password.',
      'Optionally create a student login (needs a student email). Kindergarten default is parent-only login.',
      'Step 3: pick the class group. The fee level comes from that group. Submit. The student appears on the Students list, already in the group.',
      'Confirm the student appears on the Students list, already in the group.',
      'Open Edit student if you still need a second guardian, bus assignment, or extra details.',
      'If the family should have applied online instead, prefer the public enrollment form and process the inbox.',
    ],
    notes: [
      'Public families should use the school enrollment form instead; those applications land in the enrollment inbox.',
      'You can still add more parents, a bus, or extra details on the edit page after register.',
      'Assigning a class group can rebuild the fee charge sheet from current packages.',
    ],
    appearsAs: {
      teacher:
        'Teachers cannot open `/students/register` or the student list. Ask an admin to register the child.',
      parent:
        'Parents do not use the staff wizard. Prospective families use `/student-enrollment`. Existing parents manage linked children from `/parent/dashboard`.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['edit-student', 'enrollment-inbox', 'charge-sheets'],
  },
  'edit-student': {
    title: 'Edit a student, parents, class, and bus',
    intro:
      'The student editor is tabbed: student details, parents grid, class group, and bus. Use it after register or after approving a public application.',
    who: 'School admins.',
    when: 'Changing class, adding a second guardian, assigning a bus, or correcting student data.',
    steps: [
      'Open Students, find the child, and choose Edit from the row menu (opens /students/:id/edit).',
      'Student tab: identity and contact fields. Save when you change them.',
      'Parents tab: add father, mother, or guardian. Pick an existing parent or create a new profile with the fields for that relationship.',
      'Class tab: optionally pick a Level, then assign a class group from groups in that level (this also affects the fee level).',
      'Bus tab: assign the student to a bus if they use school transport. Pickup coordinates can be set here or later on the bus editor.',
      'Optionally create or reset a parent login from the linked parent so they can open `/parent/dashboard`.',
      'Save each tab’s changes. Check Charge sheets if group or bus assignment should rebuild fees.',
      'Return to the Students list and confirm the group and bus columns look correct.',
    ],
    notes: [
      'Assigning or removing a group or bus rebuilds the fee charge sheet from the current packages.',
      'The relationship (father / mother / guardian) is stored on the student–parent link, not only on the parent record.',
    ],
    appearsAs: {
      teacher:
        'Teachers cannot open `/students/:id/edit`. They see the child in attendance, progress, and schedule contexts only.',
      parent:
        'Parents cannot edit school records. They view the child on `/parent/dashboard`, `/parent/schedule`, fees, and can share GPS pickup for bus assignment.',
      driver:
        'Drivers do not edit student records. They see assigned riders on Fleet / Bus log in the transport app after an admin assigns the bus.',
    },
    related: ['register-student', 'fleet-assignment', 'charge-sheets'],
  },
  'enrollment-inbox': {
    title: 'Public enrollment inbox',
    intro:
      'Families apply on /student-enrollment (or a button on the school website). Staff review those applications, then approve or reject.',
    who: 'School admins who handle admissions.',
    when: 'Whenever a family submits the public form, and at the start of an intake period.',
    steps: [
      'Open Enrollments. Each row is an application, not yet a student record.',
      'Open an application to read student, academic, health, guardian, and address details. Edit if the family made a mistake. Print if you need a paper copy.',
      'Approve creates a Student and Parent record(s), marks the application enrolled, and emails the family (enrollment accepted).',
      'Reject marks it rejected and emails the family (enrollment rejected).',
      'After approve, open Students and assign class group (and bus / payment level) if they were not set yet.',
      'Use Print when you need a paper copy (live fee preview from the public enrollment-fees preview).',
      'Create a parent user login from Users or the student Parents tab if the family should sign in to `/parent/dashboard`.',
      'Track incomplete applications and follow up with families who abandoned the public form.',
    ],
    notes: [
      'Approve does not replace the in-app register wizard — it is the path for public applications.',
      'Brand colors on the public form come from the school landing logo settings.',
    ],
    appearsAs: {
      teacher:
        'Teachers do not see the enrollment inbox. Admissions stay with school admin.',
      parent:
        'Prospective parents use `/student-enrollment` without an account. After approval they need a parent login from the school to use `/parent/...`.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['public-enrollment', 'register-student', 'edit-student'],
  },
  'course-enrollments': {
    title: 'Course enrollments (staff)',
    intro:
      'Some courses (especially independent courses for institutes and independent learners) need an explicit enrollment, separate from sitting in a class group. Staff can enroll one or more students on a course.',
    who: 'Admins and teachers who manage course lists.',
    when:
      'When a child joins a course that is not automatic from the class group, or when a parent asked the school to enroll.',
    steps: [
      'Open Course enrollments.',
      'Select the course, then tick the students to add.',
      'Confirm enroll. The students can then see materials and, if a course fee package is linked, their charge sheet can pick up that fee.',
      'Remove an enrollment from the same screen if the child leaves the course.',
      'If a course fee package is linked under Payment settings → course fees, check the student’s charge sheet for new lines.',
      'Tell parents they can also self-enroll from `/parent/course-enrollments` when the school offers enrollable courses.',
      'For class-group subjects on the timetable, you usually do not need a separate course enrollment — the schedule membership is enough.',
    ],
    notes: [
      'Parents can also enroll a child themselves from /parent/course-enrollments when the school offers enrollable courses.',
      'Course → package links in Payment settings decide whether enrollment creates a fee line.',
    ],
    appearsAs: {
      teacher:
        'Teachers with claims can enroll students into courses from the teaching nav. They still cannot open `/students*` admin pages.',
      parent:
        'Parents enroll a selected child from `/parent/course-enrollments` when courses are offered. Fee impact appears under `/parent/fees`.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['standalone-courses', 'catalogs-packages', 'parent-course-enrollments'],
  },
  'fixed-schedule': {
    title: 'Fixed weekly schedule',
    intro:
      'The fixed timetable is a weekly grid per class group: period, day, course, and teacher. Period times come from the class-time template in Settings.',
    who: 'School admins. Teachers have a read-only My schedule.',
    when: 'Building or adjusting the regular week. Export when you need Word, Excel, or PDF.',
    steps: [
      'Open Schedules. Pick the class group in the toolbar.',
      'Fill cells: course and teacher. Break rows from the template are not assignable.',
      'Only submitted, Active courses that match the group’s grade level appear in the subject list.',
      'Period start and duration come from Settings — there is no duration picker on this grid.',
      'Use the icon menu to export Word, Excel, or PDF if you need a printed timetable.',
      'Teachers open My schedule for a read-only view of their own week.',
      'Save as you go. Review the full week for missing periods or wrong teachers.',
      'Parents will see the child’s group timetable under `/parent/schedule`.',
    ],
    notes: [
      '/schedules/flexible redirects to the flexible timetable page.',
      'Parents see the child’s group timetable under My children → Schedule.',
    ],
    appearsAs: {
      teacher:
        'Teachers open My schedule (read-only) for their assigned cells. They do not edit the school-wide Schedules grid unless given special claims.',
      parent:
        'Parents open `/parent/schedule`, select a child if needed, and read the same group week. Tapping a class can open `/parent/course-materials?course=`.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['school-settings', 'flexible-schedule', 'parent-schedule'],
  },
  'flexible-schedule': {
    title: 'Flexible timetable',
    intro:
      'Use the flexible timetable when the week is not a repeating fixed grid — for example rotating sessions or one-off blocks — while still attaching group, course, teacher, and time.',
    who: 'School admins.',
    when: 'Programs that do not fit the standard period template, or weeks that change often.',
    steps: [
      'Open Flexible schedule (/flexible). Do not look under /schedules/flexible — that URL redirects here.',
      'Add a session: pick the day, then place it at the start of the day or after an existing slot, then duration, course, and teacher.',
      'Later sessions on the same day shift automatically when you insert or change duration.',
      'Keep class durations in Settings consistent so session attendance and weekly plans still line up.',
      'Tell teachers to check My schedule and weekly sessions after you change the week.',
      'Only use submitted, Active courses that match the group level, same as the fixed grid.',
      'Confirm parents still see the updated week on `/parent/schedule` where applicable.',
    ],
    notes: [
      'Daily attendance still uses class groups; session attendance is for online / weekly sessions.',
      'Claims on the API enforce access; sidebar visibility alone is not security.',
    ],
    appearsAs: {
      teacher:
        'Teachers consume the flexible week via My schedule and Weekly sessions; they do not own the admin flexible editor.',
      parent:
        'Parents still read the child’s week on `/parent/schedule` — they cannot edit slots.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['fixed-schedule', 'session-attendance', 'materials-weekly-plans'],
  },
  'daily-attendance': {
    title: 'Daily attendance',
    intro:
      'Mark a class group present, absent, late, or excused for a calendar day. Parents see today’s summary on their dashboard and the full history on Attendance.',
    who: 'Admins and teachers.',
    when: 'Each school day, once the group is in session.',
    steps: [
      'Open Attendance. Pick the group and the date in the toolbar (inline pickers).',
      'Mark each student (or use bulk actions) for that date. Save.',
      'Use the icon menu to export Word, Excel, or PDF when you need a daily report.',
      'Parents receive a clear record on /parent/attendance and a today strip on the parent dashboard.',
      'If you must correct a past day, check System settings for the maximum days in the past allowed.',
      'Confirm parents see the update on `/parent/attendance` and the dashboard today strip.',
      'Do not confuse this campus day roll with session attendance for live online classes.',
    ],
    notes: [
      'This is the campus day roll, not online-session attendance.',
      'Retroactive marking can be limited by a school setting (maximum days in the past).',
    ],
    appearsAs: {
      teacher:
        'Teachers commonly mark daily attendance for their groups from the teaching / attendance nav. They cannot open student admin pages to change enrollment.',
      parent:
        'Parents open `/parent/attendance` (or See all from `/parent/dashboard`). They never mark attendance; they contact the school if a mark is wrong.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['session-attendance', 'parent-attendance', 'fixed-schedule'],
  },
  'session-attendance': {
    title: 'Session attendance',
    intro:
      'When teachers run a live (Daily.co) class from weekly sessions, attendance for that session is recorded separately from the daily campus roll.',
    who: 'Admins and teachers who run online sessions.',
    when: 'During or after a live class, to confirm who joined.',
    steps: [
      'Teacher opens Weekly sessions, starts the online session for the plan, and teaches in the live room.',
      'Presence is tracked in the live room (/online-session/:id).',
      'Open Session attendance (/attendance/sessions) to review or complete the roll for that session.',
      'Parents do not mark session attendance; they follow weekly plans and the child’s progress instead.',
      'Ensure Daily.co is configured on the server (API key) or the live class will not start.',
      'Save corrections if someone joined late or left early and needs a manual mark.',
      'Keep daily campus attendance separate — do not replace one with the other.',
    ],
    notes: [
      'Daily.co must be configured on the server (API key) or live class will not start.',
      'Claims on the API enforce access; sidebar visibility alone is not security.',
    ],
    appearsAs: {
      teacher:
        'Teachers start the live class from Weekly sessions and complete session attendance. Admins may oversee `/attendance/sessions`.',
      parent:
        'Parents do not mark session attendance. They read `/parent/weekly-plans` and join live class or My meetings when invited.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['materials-weekly-plans', 'meetings-live-class', 'daily-attendance'],
  },
  'activities': {
    title: 'Activities and parent approvals',
    intro:
      'School activities (trips, events, special days) live in Activities. You can attach a parent-approval letter. Approvals show up in the approvals inbox.',
    who: 'Admins and teachers who organize activities. Parents respond from their app.',
    when: 'Planning an event that families must acknowledge or approve.',
    steps: [
      'Open Activities. Create the activity (title, dates, groups or audience).',
      'If you need a signature/approval, attach a letter. The composer matches message letters: pick a template, fill subject and variables, Arabic and English.',
      'Save and notify. Parents see Assigned activities and Weekly activities.',
      'Watch Approvals for parent responses. Follow up with families who have not answered.',
      'Do not rely on group chat alone if you need a formal yes/no record.',
      'After the event, keep the activity for history according to your school process.',
    ],
    notes: [
      'Letters used here are the same family of templates as Notifications → Message letters.',
      'Do not use group chat as the only approval record if you need a formal yes/no.',
    ],
    appearsAs: {
      teacher:
        'Teachers with activities access can create and manage activities and see related approvals in their nav.',
      parent:
        'Parents open `/parent/assigned-activities`, `/parent/weekly-activities`, and Approvals (or Approve/Reject links in email/SMS).',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['letters-templates', 'parent-activities'],
  },
  'milestone-courses': {
    title: 'Skill courses',
    intro:
      'Skill courses are a curriculum of stages and skills (units). Teachers mark each student’s progress through those skills.',
    who: 'Admins create the course; teachers mark progress.',
    when:
      'Kindergarten / skills-based programs where you track “not started / in progress / mastered” rather than exam marks.',
    steps: [
      'Open Skill courses → New. Step 1: title, grade level, Active / Not active, and description. Save as draft if you are not ready, or Next to add stages.',
      'Step 2: add learning stages and skills (title and description). Submit when every stage has titled skills and a level is set.',
      'Drafts stay on Edit / Delete only — they cannot be opened as a view page and do not appear on the timetable until you Submit and set them Active.',
      'Put the submitted, Active course on the timetable (fixed or flexible) with a teacher and a group of the same grade level.',
      'Teachers open Progress, then the course, and update skill status per student.',
      'Parents see the same progress on /parent/progress.',
      'Upload materials under Course materials (files group by phase/stage).',
      'Keep Active / Not active separate from draft vs submitted — a submitted course can still be Not active.',
    ],
    notes: [
      'Active / Not active is separate from draft vs submitted. A submitted course can still be Not active.',
      'Courses with marks are a different module. Do not mix the two for the same subject unless you intend both.',
    ],
    appearsAs: {
      teacher:
        'Teachers mark skill progress and share materials. They typically do not create the full course structure unless given course claims.',
      parent:
        'Parents read-only on `/parent/progress` and download materials from `/parent/course-materials`.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['progress-marks', 'graded-courses', 'fixed-schedule'],
  },
  'graded-courses': {
    title: 'Courses with marks',
    intro:
      'Courses with marks use an assessment scheme: the school’s semesters, criteria, and weights. Teachers enter task marks or a criterion grid — not skill-progress checkboxes.',
    who: 'Admins set up the scheme; teachers enter marks.',
    when: 'Subjects that need numeric or criterion scores and class/student mark reports.',
    steps: [
      'Open Courses with marks → New. Set the title, grade level, total marks, then Average or Sum.',
      'Semesters come from School settings (the active academic year). Add criteria only — you do not add or rename semesters here.',
      'Save as draft, or save the course when criteria are ready. Drafts are edit/delete only.',
      'Teachers enter marks on Enter marks for the school’s Active now semester, or add tasks per criterion.',
      'Use Academic reports → class or student graded marks when you need a printable report.',
      'Set Active when the course should appear for timetable assignment.',
      'Parents do not edit marks; share printed reports or communicate results through your school process.',
    ],
    notes: [
      'Sum: all criteria across semesters must total the course total. Average: each named criterion needs marks greater than 0.',
      'Two mark models exist: task-based and direct criterion marks. Pick one workflow per course so staff are not split.',
    ],
    appearsAs: {
      teacher:
        'Teachers use Enter marks, graded tasks, and My schedule. Course scheme setup is usually admin-owned.',
      parent:
        'Parents do not have a marks editor. Skill progress is on `/parent/progress`; graded mark sheets come from school reports.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['progress-marks', 'academic-reports', 'milestone-courses'],
  },
  'standalone-courses': {
    title: 'Independent courses',
    intro:
      'Independent courses are for independent learners and institutes. Students enroll in the course itself (not via a class group). They use stages and skills like skill courses, plus materials and an optional course fee.',
    who: 'Admins at institutes and independent programs.',
    when: 'Teaching outside a school class-group model — independent tutors, institutes, or similar.',
    steps: [
      'Open Independent courses. Create the course the same way as a skill course (title, grade level, Active / Not active, then stages).',
      'Link a fee package under Payment settings → course fees if the course is billed (only submitted, Active courses appear there).',
      'Enroll students from Course enrollments (staff) or let parents enroll from their Learning menu.',
      'Add materials from Course materials if the teacher will share files.',
      'Submit and set Active when ready for enrollment and materials.',
      'Teachers update progress the same way as skill courses when stages exist.',
      'Remove enrollments when a learner leaves so fee lines rebuild correctly.',
    ],
    notes: [
      'Removing a student from the course should be done on enrollments so fee lines can rebuild correctly.',
      'Claims on the API enforce access; sidebar visibility alone is not security.',
    ],
    appearsAs: {
      teacher:
        'Teachers with access mark progress and materials for independent courses; enrollment may be shared with admin.',
      parent:
        'Parents can self-enroll from `/parent/course-enrollments`, then use `/parent/course-materials` and `/parent/progress`.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['course-enrollments', 'catalogs-packages', 'materials-weekly-plans'],
  },
  'materials-weekly-plans': {
    title: 'Materials and weekly plans',
    intro:
      'Course materials are files for a course. Weekly session plans are the teaching week: tasks, media, and the optional live class. Admins plan; teachers run the week.',
    who: 'Admins (plans), teachers (weekly sessions), parents (read materials and plans).',
    when: 'Every teaching week, and whenever you upload a worksheet or recording.',
    steps: [
      'Open Course materials. Pick a course (cards or list; you can filter by skill, marks, or independent).',
      'If the course has stages, open a phase accordion and upload there. If it has no stages, use Add topic, name the topic, then upload inside it (file, title, Upload).',
      'Download with the icon; delete with the red X. Files with no phase or topic sit in Unassigned.',
      'Parents open the parent materials page to download the same grouping. They cannot upload.',
      'Admins open Weekly session plans, pick group and week, and write the plan (course and teacher on each cell). Teachers are redirected away from this admin page.',
      'Teachers open Weekly sessions: filter week/group, complete tasks, upload session media, and start a live class if needed.',
      'Parents read Weekly plans. They do not edit plans.',
      'After a live class, complete session attendance if you need a roll.',
    ],
    notes: [
      'Live class needs Daily.co. Session attendance is a separate roll from daily campus attendance.',
      'Claims on the API enforce access; sidebar visibility alone is not security.',
    ],
    appearsAs: {
      teacher:
        'Teachers upload materials (with claims), run Weekly sessions, and start live class. They do not use the admin Weekly session plans page.',
      parent:
        'Parents read-only: `/parent/course-materials` and `/parent/weekly-plans`. No upload, no plan editing.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['session-attendance', 'meetings-live-class', 'parent-weekly-plans'],
  },
  'progress-marks': {
    title: 'Progress and marks',
    intro:
      'Skill progress and graded marks are different screens. Use Progress for skill courses; use Enter marks and/or graded tasks for courses with marks. Parents see progress, not the staff marks editor.',
    who: 'Teachers day to day; admins for oversight and reports.',
    when: 'After lessons, at the end of a phase, or when preparing a parent meeting.',
    steps: [
      'For skill courses: Progress → open the course → update each student.',
      'For courses with marks: Enter marks for the Active now semester, and/or Graded tasks, then save.',
      'Open Academic reports for class or student mark sheets.',
      'Parents check Progress under My children. They cannot change marks.',
      'Do not enter the same assessment in both skill and graded modules.',
      'Export or print from reports before parent meetings when graded evidence is required.',
      'If a course is Not active but still on the timetable, parents may still see materials — progress entry follows your teaching process.',
    ],
    notes: [
      'Do not enter the same assessment in both skill and graded modules.',
      'Claims on the API enforce access; sidebar visibility alone is not security.',
    ],
    appearsAs: {
      teacher:
        'Teachers own day-to-day Progress and Enter marks from the teaching nav.',
      parent:
        'Parents open `/parent/progress` (read-only skill status). Graded sheets come from the school.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['milestone-courses', 'graded-courses', 'academic-reports'],
  },
  'catalogs-packages': {
    title: 'Fee catalogs and packages',
    intro:
      'Fees v2 starts with a catalog of charge types, discounts, extras, and included items, then a package that says which charges apply, what is included, which extras and discounts are allowed, what is upfront versus installment, and amounts per level or course.',
    who: 'School admins who configure billing (before generating student sheets).',
    when: 'New year, new program, or when tuition/transport amounts change.',
    steps: [
      'Open Payment settings → charge catalog, discount catalog, extra catalog, and included catalog. Create the items you will reuse (tuition, bus, sibling discount, extra activity, uniform, books).',
      'Open Packages → create a package, then open its structure: add charges, mark each as upfront or installment, once or per year. Add included items, allowed discounts, and extras from those catalogs.',
      'Set amounts per grade level or per course inside the package structure.',
      'Link the package to grades (level fees), courses, or a bus on the bus editor — students inherit from those links.',
      'Only submitted, Active courses appear when linking course fees.',
      'After structure changes, open a student charge sheet and Update so lines rebuild from current packages.',
    ],
    notes: [
      'Do not use the old unrouted payment editors. New work is fees v2 only.',
      'Changing a package later can rebuild student sheets when they are opened or updated.',
    ],
    appearsAs: {
      teacher:
        'Teachers do not configure fee catalogs or packages.',
      parent:
        'Parents never edit catalogs. They see the resulting sheet on `/parent/fees` and pay from `/parent/fees` (Pay now).',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['installment-plans', 'charge-sheets', 'fleet-assignment'],
  },
  'installment-plans': {
    title: 'Installment plans and level or course links',
    intro:
      'An installment plan splits the remaining amount after the advance (مقدم). Due dates use the school’s installment due day. Then you bind packages to grades and courses.',
    who: 'School admins.',
    when: 'After packages exist, before generating charge sheets for the year.',
    steps: [
      'Open Installment plans. Create a plan with weights or dates for each installment after the advance.',
      'Set the school installment due day (1–31, or last day of the month) so due dates calculate correctly.',
      'Open Level fees: choose a grade, attach the package, and confirm charge lines for that level.',
      'Open Course fees for course-specific packages. Bus packages are set on the bus editor.',
      'Bus packages are set on the bus editor when transport is billed.',
      'Public enrollment can let families pick an installment plan; approved applications seed the sheet with that plan id.',
      'Verify one student sheet after linking before rolling out the whole grade.',
    ],
    notes: [
      'Every sheet still gets an immediate advance row (sequence 0, due today) when net due is greater than zero.',
      'The advance amount is editable on the student charge sheet until payment starts.',
    ],
    appearsAs: {
      teacher:
        'Teachers do not manage installment plans or level/course fee links.',
      parent:
        'On public enrollment, families may select a plan. After enrollment they only see the schedule on `/parent/fees` (advance + installments).',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['catalogs-packages', 'charge-sheets'],
  },
  'charge-sheets': {
    title: 'Student charge sheets',
    intro:
      'Each student has one charge sheet built from grade, bus, and course links. Update is the single save: it rebuilds lines, extras, discounts, and the advance, then splits the rest on the installment plan.',
    who: 'School admins (fee operations).',
    when:
      'After structure is linked, when a child changes group/bus/course, or when you record a staff payment.',
    steps: [
      'Open Charge sheets (/students/payments). Search or page the list, then open a student.',
      'Review list total, extras, discounts, and due. The schedule grid shows advance then installments with due, paid, remaining, and payment reference.',
      'Adjust extras, discounts, or the advance if needed. Unsaved changes hide Add payment and show a waiting-to-save state until you press Update.',
      'Press Update to save the plan. After that, Add payment: enter amount and receipt, allocated across unpaid installments in order (advance first). You cannot overpay a row; later rows stay locked until the previous is covered.',
      'The advance due amount stays editable until money is applied or an open receipt exists; then plan, advance, and discounts lock.',
      'Parent payments (Thawani or uploaded receipt) are single-target; staff Add payment can split one receipt across several installments.',
      'Assigning a bus or class group also rebuilds the sheet — re-open after transport or class changes.',
    ],
    notes: [
      'Assigning a bus or class group also rebuilds the sheet. Opening a sheet can auto-rebuild if stored lines disagree with current packages.',
      'Parent payments (Thawani or uploaded receipt) are single-target; staff Add payment can split one receipt across several installments.',
      'Teachers cannot open `/students/payments` charge-sheet admin.',
    ],
    appearsAs: {
      teacher:
        'Teachers do not manage charge sheets (`/students/payments`).',
      parent:
        'Parents open `/parent/fees` for the selected child: totals, advance, installments, history, and Pay now. They cannot rebuild the plan.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['installment-plans', 'receipts-transfers', 'parent-fees'],
  },
  'receipts-transfers': {
    title: 'Pending receipts and transfers',
    intro:
      'When a parent uploads a receipt it waits for review. After payment is accepted it may sit in pending reconcile until the platform batches a transfer that the school confirms.',
    who: 'School finance staff. Platform operators handle cross-school ledgers.',
    when: 'Daily, whenever parents pay offline or you need to confirm a bank transfer.',
    steps: [
      'Open Pending receipts. Filter pending approval or pending reconcile. View receipt opens the file (signed-in download).',
      'Approve or reject according to your school process. Rejected payments notify the parent.',
      'Open Pending transfers when a FeeTransfer is waiting. Confirm that the money arrived.',
      'Use the due-installments financial report for late or unpaid rows.',
      'Approved attached receipts apply to the installment (or allocate across the schedule, advance first) and update the charge sheet.',
      'Statuses you will see include pending, pending_approval, pending_reconcile, paid, rejected, cancelled, and failed.',
      'Remind parents that only one Pay now target can wait at a time on their sheet.',
    ],
    notes: [
      'School confirmation of money is on pending-transfers, not only on the receipt list.',
      'Payment statuses include pending, pending_approval, pending_reconcile, paid, rejected, cancelled, and failed.',
    ],
    appearsAs: {
      teacher:
        'Teachers do not approve fee receipts.',
      parent:
        'Parents upload proof or pay with Thawani from `/parent/fees`. Offline stays waiting until the school approves; they see status on the schedule.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['charge-sheets', 'parent-pay', 'financial-reports'],
  },
  'group-chat': {
    title: 'Group chat and bus chat',
    intro:
      'Group chat mixes class rooms (automatic from the class), ad-hoc rooms you create, and bus rooms that include parents of students on that bus.',
    who: 'Admins, teachers, and parents (not students).',
    when: 'Class announcements, a custom staff/parent group, or talking to all families on a bus.',
    steps: [
      'Open Chats (groups). Class rooms appear from membership — you do not invite the class by hand.',
      'New group chat: name the room and pick members (requires chat create).',
      'From Transportation, use Chat with bus parents on a bus row. This creates or reuses one room for that bus (idempotent).',
      'Open a room to send messages in real time (Socket.IO). Keep official approvals in Activities or letters when you need a record.',
      'Drivers open Chats from the transport mobile bottom bar to reach bus parent rooms.',
      'Students do not use group chat (they may still use DMs and meetings).',
      'Keep official approvals in Activities or letters when you need a formal record — chat is not a substitute.',
    ],
    notes: [
      'Students do not use group chat. Direct messages are a separate inbox.',
      'Claims on the API enforce access; sidebar visibility alone is not security.',
    ],
    appearsAs: {
      teacher:
        'Teachers use group chat for their class rooms and any rooms they are members of, from the Chats nav.',
      parent:
        'Parents open Chat on the parent menu for class, ad-hoc, and bus groups.',
      driver:
        'Drivers use the transport app Chats tab (with Live dashboard, Bus log, and Fleet). Bus parent rooms are the main transport chat surface.',
    },
    related: ['direct-messages', 'fleet-assignment', 'parent-chats-meetings'],
  },
  'direct-messages': {
    title: 'Direct messages',
    intro:
      'Direct messages are one-to-one threads. The mailbox lists conversations; opening a thread loads the history and lets you reply.',
    who: 'Staff and parents (and students for DMs only).',
    when: 'Private follow-up that should not go to the whole class or bus group.',
    steps: [
      'Open Direct messages. Pick a thread or start a conversation with an allowed user.',
      'Send the message. The list refreshes after you open a thread or send.',
      'Do not use DMs for fee receipts or formal activity approval — those have their own screens.',
      'On native mobile, chat threads hide the bottom bar so the conversation stays full-screen.',
      'Students may open DMs and meetings but not group chat.',
      'Keep tone suitable for a school record.',
    ],
    notes: [
      'Students can open DMs and meetings but not group chat.',
      'Claims on the API enforce access; sidebar visibility alone is not security.',
    ],
    appearsAs: {
      teacher:
        'Teachers use Direct messages from Chats for private parent or staff follow-up.',
      parent:
        'Parents open Direct messages from the parent menu for private teacher/admin threads.',
      driver:
        'Drivers primarily use group Chats in the transport app; DM availability follows their staff user and claims.',
    },
    related: ['group-chat', 'meetings-live-class'],
  },
  'meetings-live-class': {
    title: 'Meeting rooms and live class',
    intro:
      'Admins schedule meeting rooms (Daily.co). Invitees join from My meetings. Teachers can also start a live class from a weekly session (online session room).',
    who:
      'Admins schedule rooms; teachers, parents, and students join if invited or if a live class is started.',
    when: 'Parent–teacher meetings, staff huddles, or a remote lesson tied to a weekly plan.',
    steps: [
      'Admin: open Meeting rooms, create a room with time and invitees. **Save as draft** keeps it unpublished; **Create room** saves without opening the video; **Create room & open** starts Daily.co.',
      'Everyone else: open My meetings and join /meeting-room/:id at the scheduled time.',
      'For a lesson: teacher opens Weekly sessions and starts the online session. Participants use /online-session/:id.',
      'Mark session attendance afterwards if you need a roll for that live class.',
      'Confirm Daily.co API key is configured on the server.',
      'Parents join from My meetings or the link the school shared.',
    ],
    notes: [
      'Live video needs a Daily.co API key on the server. Without it, rooms will not start.',
      'Claims on the API enforce access; sidebar visibility alone is not security.',
    ],
    appearsAs: {
      teacher:
        'Teachers join My meetings and start live class from Weekly sessions. Admin Meeting rooms creation is usually admin-owned.',
      parent:
        'Parents open My meetings from the parent menu and join invited rooms; live class uses the school’s join path.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['materials-weekly-plans', 'session-attendance', 'parent-chats-meetings'],
  },
  'letters-templates': {
    title: 'Letters, email layouts, and templates',
    intro:
      'Layouts are HTML shells with a {{content}} hole. Templates are the email/SMS wording (and locale). Message letters are composed and dispatched to an audience, with optional approval.',
    who:
      'School admins (notification settings). Platform users edit product defaults under /platform.',
    when:
      'Before you send enrollment, payment, or activity messages, and when you want a branded email frame.',
    steps: [
      'Open Notification layouts. Design or import a layout (including .docx → HTML). Put {{content}} where the body should go.',
      'Open Notification templates. Edit Arabic and English. Pick a layout. Use merge-field chips. Preview both languages. SMS sits under the email when the channel is both.',
      'Open Message letters to compose a one-off or reusable letter, pick audience, preview with sample data, and dispatch.',
      'If a letter needs parent approval, follow it in Approvals. Activities can attach the same kind of letter.',
      'SMS sits under the email when the channel is both.',
      'System emails (platform.*) use FIKR chrome, not the school layout.',
    ],
    notes: [
      'Send path must use an explicit locale (ar or en) so the stored language is the one that goes out.',
      'System emails (platform.*) use FIKR chrome, not the school layout.',
    ],
    appearsAs: {
      teacher:
        'Teachers may attach letters on activities if they have access; layout/template admin is typically school admin.',
      parent:
        'Parents receive letters by email/SMS and respond to approvals from Approvals or the message links — they do not edit templates.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['activities', 'enrollment-inbox', 'receipts-transfers'],
  },
  'fleet-assignment': {
    title: 'Bus fleet and student assignment',
    intro:
      'Transportation is a fleet of buses. Each bus has a driver (required staff user), optional supervisor, route, optional fee package, and assigned students with pickup points.',
    who: 'School admins. Teachers may have daily log only, depending on access.',
    when: 'Setting up routes, adding a child to a bus, or capturing the pickup stop on site.',
    steps: [
      'Open Transportation. Create a bus (New). Details tab: name/route, driver, supervisor, and fee package if bus is billed.',
      'Assign students from the fleet list or the editor track tab. Stand at the stop and tap Use current location — the app stores the phone GPS. No typed coordinates. Parents do the same from their dashboard.',
      'You can also assign a bus from the student editor Bus tab.',
      'Use Chat with bus parents on the bus row when you need a group with those families.',
      'Drivers open Fleet (and Live dashboard / Bus log) in the transport app to work the route.',
      'Confirm assigning a bus rebuilds the student’s fee sheet if a bus package is linked.',
    ],
    notes: [
      'A driver user is required. Assigning a bus rebuilds the student’s fee sheet if a bus package is linked.',
      'Parents can share GPS pickup from their dashboard for a linked child.',
    ],
    appearsAs: {
      teacher:
        'Teachers may only have Bus daily log access (depending on claims). They do not configure the fleet or fee packages.',
      parent:
        'Parents see today’s movements on `/parent/dashboard` and can Share pickup GPS for the child’s stop. They do not edit the fleet.',
      driver:
        'Drivers use the transport mobile flavor: Live dashboard, Bus log, Fleet, and Chats. Fleet shows their buses; they do not use school-admin Payment settings.',
    },
    related: ['daily-log', 'edit-student', 'parent-bus'],
  },
  'daily-log': {
    title: 'Bus daily log',
    intro:
      'The daily log records going and return movements (boarding). Parents see today’s trips on their dashboard.',
    who: 'Admins, supervisors, or teachers with daily-log access.',
    when: 'Each trip, typically morning and return.',
    steps: [
      'Open Daily log. Select the bus and date.',
      'Record boarding / movement for the trip direction you are running.',
      'Parents open the parent dashboard to see today’s bus movements for their children.',
      'Keep student assignment up to date on the bus before the trip so the right names appear.',
      'Save as you complete stops so the parent dashboard stays current.',
      'Use Fleet if you need to confirm who is assigned before marking the log.',
      'Open bus Chat if you must notify families about delays (formal approvals still use Activities).',
    ],
    notes: [
      'Keep student assignment up to date before the trip so the right names appear on the log.',
      'Claims on the API enforce access; sidebar visibility alone is not security.',
    ],
    appearsAs: {
      teacher:
        'Teachers with claims can open Bus daily log from their nav; they usually do not edit fleet structure.',
      parent:
        'Parents read today’s movements on `/parent/dashboard` only — they do not write the log.',
      driver:
        'Drivers’ primary surface is Bus log in the transport app, alongside Live dashboard, Fleet, and Chats.',
    },
    related: ['fleet-assignment', 'parent-bus'],
  },
  'academic-reports': {
    title: 'Academic reports',
    intro:
      'The reports hub splits academic and financial. Academic currently includes graded marks for a class or a student.',
    who: 'Admins and teachers who may export marks.',
    when: 'End of a period, parent meetings, or when a family asks for a mark sheet.',
    steps: [
      'Open Reports. You land on Academic (or choose Academic from the submenu).',
      'Open class graded marks or student graded marks and pick the course / class / student filters.',
      'Export or print as the screen allows.',
      'Use Progress (not this report list) when you need skill-course milestone status.',
      'Share results with families through your school process — parents do not edit reports.',
      'Switch to Financial reports when you need due installments instead.',
    ],
    notes: [
      'Milestone progress is viewed on Progress, not in this report list (unless you add a new report later).',
      'Claims on the API enforce access; sidebar visibility alone is not security.',
    ],
    appearsAs: {
      teacher:
        'Teachers with report access can export class/student graded marks for their courses.',
      parent:
        'Parents do not open staff Reports. They see skill progress on `/parent/progress`; graded sheets are provided by the school.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['graded-courses', 'progress-marks', 'financial-reports'],
  },
  'financial-reports': {
    title: 'Financial reports',
    intro:
      'Financial reports currently include due and late installments. Use it to chase unpaid rows after charge sheets exist.',
    who: 'School finance staff.',
    when: 'Weekly or before sending payment reminders.',
    steps: [
      'Open Reports → Financial.',
      'Open Due installments. Filter as needed and follow up with families (parent pay or staff Add payment).',
      'Cross-check Pending receipts if many rows are waiting on uploaded proofs.',
      'Confirm pending transfers when money should have arrived at the school.',
      'Use Message letters or templates if you send payment reminders.',
      'Re-run the report after approvals to confirm rows cleared.',
    ],
    notes: [
      'More report types can be added under the same Academic / Financial lists later.',
      'Claims on the API enforce access; sidebar visibility alone is not security.',
    ],
    appearsAs: {
      teacher:
        'Teachers do not use financial reports.',
      parent:
        'Parents see only their children’s balances on `/parent/fees`, not the school-wide due report.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['charge-sheets', 'receipts-transfers', 'academic-reports'],
  },
  'landing-editor': {
    title: 'School landing page editor',
    intro:
      'Each school has a public site at /s/your-slug. Staff edit copy, programs, and brand from the landing editor. This is not the FIKR platform hub.',
    who: 'School admins.',
    when: 'Launching the public site, changing programs, or refreshing photos and CTAs.',
    steps: [
      'Open Landing page (Settings → landing).',
      'Edit the content the public page shows (hero, programs, CTAs). Save.',
      'Set the landing slug in school settings if you still use the default.',
      'Open /s/your-slug in a private window to review. Login on that site stays branded.',
      'Confirm logo and Detect from logo colors in Settings — they also brand public enrollment.',
      'Link Enroll / CTA buttons to `/student-enrollment` with the school id as your intake requires.',
    ],
    notes: [
      'Logo brand colors sampled in Settings feed the public enrollment form, not only the CMS page.',
      'The FIKR marketing page at / is separate: Documentation, live pricing, a custom-plan form (/custom-plan), and a demo request. That is not this school site.',
    ],
    appearsAs: {
      teacher:
        'Teachers do not edit the school landing page.',
      parent:
        'Parents (and prospects) view `/s/your-slug` publicly; enrolled parents work inside `/parent/...` after login.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['public-enrollment', 'school-settings'],
  },
  'public-enrollment': {
    title: 'Public enrollment form',
    intro:
      'Families apply without an account on /student-enrollment. The form can be opened from the school landing CTA. It loads the school name, logo, and brand colors. The review step shows school and parent responsibility lists from Settings → Enrollment responsibilities.',
    who: 'Prospective families (no login). Staff then process the inbox.',
    when: 'Open intake. Share the link or the button on /s/your-slug.',
    steps: [
      'Confirm the school is active and the landing/enrollment branding looks right.',
      'Share /student-enrollment with the school_id query, or the Enroll button on the school site.',
      'The family completes student, academic, health, guardian, address, then review, and submits.',
      'Staff process the application in the enrollment inbox (approve or reject).',
      'On approve, student/parent records are created and the charge sheet can be seeded with the selected installment plan.',
      'Create a parent user login if the family should sign in to `/parent/dashboard` — the form alone does not create a login.',
      'After approve, assign class group and bus on the student editor if not already set.',
    ],
    notes: [
      'This does not create a parent login by itself. Create a parent user from Students if they should sign in.',
      'Legacy numeric `school_id` is rejected — use UUID only.',
    ],
    appearsAs: {
      teacher:
        'Teachers do not configure or process public enrollment; admissions stay with admin.',
      parent:
        'Prospective parents use `/student-enrollment` without signing in. After acceptance they need a school-created login for `/parent/...`.',
      driver:
        'Drivers do not see this module. The transport mobile app only includes Live dashboard, Bus log, Fleet, and Chats.',
    },
    related: ['enrollment-inbox', 'landing-editor', 'register-student'],
  },
  'parent-sign-in': {
    title: 'Sign in as a parent',
    intro:
      'Parents use the same Sign in page. After a successful login you always go to the parent dashboard — not the staff dashboard.',
    who: 'Parents and guardians who have a user account linked to at least one child.',
    when: 'First login (temporary password from email) and every later visit.',
    steps: [
      'Open Sign in from the FIKR site or your school’s /s/slug/login.',
      'Use the email the school registered. First time: password from the welcome email, then change it.',
      'You land on /parent/dashboard. There is no school switcher — all linked children appear together, even across schools.',
      'If you cannot sign in, ask the school to create or reset the parent user (Users), not a staff employee account.',
    ],
    notes: [
      'Parent accounts often have no school_id on the user. That is expected; access is via linked students.',
    ],
    related: ['parent-dashboard', 'switching-children'],
  },
  'parent-dashboard': {
    title: 'Parent dashboard',
    intro:
      'The parent home shows counts, today’s attendance for each child, today’s bus movements, and shortcuts into schedule, fees, learning, and chats.',
    who: 'Parents.',
    when: 'Daily — it is the first screen after login.',
    steps: [
      'After login, read the summary cards (children, groups, schedules, weekly plans).',
      'Check today’s attendance strip: present, absent, late, or not marked yet, per child.',
      'Check today’s bus log if your children ride a school bus.',
      'Use the shortcut tiles for schedule, attendance, fees, materials, activities, and progress.',
    ],
    notes: [
      'If attendance or bus data fails to load, use the retry or open the full Attendance / dashboard sections.',
    ],
    related: ['parent-attendance', 'parent-bus', 'switching-children'],
  },
  'switching-children': {
    title: 'Switching between children',
    intro:
      'If you have more than one child, most parent pages show a row of child buttons. Select a child to filter schedule, fees, enrollments, and similar lists. There is no global school switcher.',
    who: 'Parents with two or more linked students.',
    when: 'Whenever the page shows all children and you need one child’s timetable, fees, or courses.',
    steps: [
      'Open the page (Schedule, Fees, Course enrollments, Weekly plans, or Activities).',
      'If more than one child is linked, tap the child’s name at the top. The selected child uses the teal outline.',
      'The list or timetable below updates for that child. Switch again to see a sibling.',
      'On the dashboard, all children are shown together (attendance and bus) without a picker.',
    ],
    notes: ['Children in different schools still appear on the same parent login.'],
    related: ['parent-dashboard', 'parent-schedule', 'parent-fees'],
  },
  'parent-schedule': {
    title: 'Child schedule',
    intro:
      'The parent schedule is the class-group timetable for the selected child — the same week the school built under Schedules.',
    who: 'Parents.',
    when: 'To know when the child is in class, with which teacher, or to plan pickup.',
    steps: [
      'Open My children → Schedule.',
      'If you have several children, select one.',
      'Read the weekly grid (desktop) or the stacked day list on a small screen.',
      'Tap a class to open that course’s materials.',
    ],
    notes: [
      'Parents cannot edit the timetable. Ask the school if a cell looks wrong.',
    ],
    related: ['switching-children', 'parent-attendance', 'parent-weekly-plans', 'parent-materials'],
  },
  'parent-attendance': {
    title: 'Child attendance',
    intro:
      'See today at a glance and the history of daily marks (present, absent, late, excused) for your children.',
    who: 'Parents.',
    when: 'Any day you want to confirm the child arrived, or when the school asks about an absence.',
    steps: [
      'Open Attendance from the parent menu, or See all from the dashboard strip.',
      'Read today’s totals, then each child’s status and check-in / check-out times if recorded.',
      'Scroll or change date as the page allows to review previous days.',
    ],
    notes: [
      'Parents do not mark attendance. If a mark is wrong, contact the school.',
    ],
    related: ['parent-dashboard', 'parent-schedule'],
  },
  'parent-progress': {
    title: 'Child progress',
    intro:
      'Progress shows skill status for skill courses. It is a parent-facing view of what teachers update on Progress.',
    who: 'Parents.',
    when: 'After a reporting period or when you want to see skills/units completed.',
    steps: [
      'Open Progress.',
      'Select the child if you have more than one.',
      'Read each course and the milestone states. This is not the graded-marks grid.',
    ],
    notes: [
      'Graded mark reports are produced by the school (academic reports), not edited here.',
    ],
    related: ['parent-weekly-plans', 'parent-materials'],
  },
  'parent-course-enrollments': {
    title: 'Enroll a child in a course',
    intro:
      'When the school offers enrollable courses (often standalone), a parent can enroll a selected child without asking staff to do it.',
    who: 'Parents.',
    when: 'Independent or institute courses, or anything the school listed as enrollable.',
    steps: [
      'Open Learning → Course enrollments.',
      'Select the child, then tick the course(s) offered for that child.',
      'Confirm. If the course has a fee package, the charge sheet may update — check Fees afterwards.',
    ],
    notes: [
      'If no courses appear, the school has not opened enrollable courses for that child.',
    ],
    related: ['parent-fees', 'parent-materials', 'course-enrollments'],
  },
  'parent-materials': {
    title: 'Course materials',
    intro:
      'Parents can list and download files teachers uploaded for the child’s courses.',
    who: 'Parents.',
    when: 'Homework, worksheets, or recordings the teacher shared.',
    steps: [
      'Open Learning → Course materials, or tap a class on the timetable.',
      'Pick a course. Files are grouped by phase (skill/independent courses that have stages) or by topic.',
      'Open a section and download. You must be signed in; files are not a public link.',
    ],
    notes: [
      'Courses on the child’s timetable appear even if staff marked the course Not active. If a file fails to open, try again while logged in.',
    ],
    related: ['parent-weekly-plans', 'parent-course-enrollments', 'parent-schedule'],
  },
  'parent-weekly-plans': {
    title: 'Weekly plans',
    intro:
      'Weekly plans are what the school prepared for the child’s group that week (topics, tasks, notes). Parents read them; teachers complete them.',
    who: 'Parents.',
    when: 'Each week, to know what is being taught and whether a live session is planned.',
    steps: [
      'Open Learning → Weekly plans.',
      'Select the child if needed.',
      'Read the plan for the current week (same class groups as the timetable). Use the arrows for another week.',
    ],
    notes: [
      'Starting a live class is a teacher action. Parents join from My meetings or the link the school provides.',
    ],
    related: ['parent-schedule', 'parent-chats-meetings', 'parent-materials'],
  },
  'parent-activities': {
    title: 'Assigned and weekly activities',
    intro:
      'Assigned activities are items attached to your child or group. Weekly activities is the week’s feed. Some activities ask you to approve a letter.',
    who: 'Parents.',
    when: 'Trips, events, or anything the school marked for parent acknowledgement.',
    steps: [
      'Open Assigned activities for the list that belongs to the selected child.',
      'Open Weekly activities for the week’s feed.',
      'If an activity includes an approval letter, you can answer in Approvals, in chat, or from the email/SMS link (Approve / Reject).',
      'If you miss an approval, the school sees it in their Approvals inbox and may follow up.',
    ],
    notes: [
      'Chat is not a substitute for the approval letter when the school requested a formal response.',
    ],
    related: ['parent-chats-meetings', 'activities'],
  },
  'parent-fees': {
    title: 'Viewing charges',
    intro:
      'Fees shows the selected child’s charge sheet: list total, extras, discounts, amount due, the advance, and each installment with paid and remaining.',
    who: 'Parents.',
    when: 'Anytime you want the balance, and before you pay.',
    steps: [
      'Open Fees from the sidebar (under the dashboard) or the dashboard tile.',
      'Read the totals at the top, then the schedule (advance first, then installments).',
      'Payment history under the sheet lists previous receipts and their status (waiting, paid, rejected).',
      'Use Pay now on an unpaid advance or installment. You cannot start a second payment while one is still waiting for approval.',
    ],
    notes: [
      'Staff may still add a payment at school. Your history updates after they save or after a receipt is approved.',
    ],
    related: ['parent-pay', 'switching-children'],
  },
  'parent-pay': {
    title: 'Paying fees',
    intro:
      'Parents pay one target at a time: the advance or a single installment. You can upload a bank receipt (offline) or pay online with Thawani when the school enabled it.',
    who: 'Parents.',
    when: 'When a row is unpaid and not already waiting on a receipt.',
    steps: [
      'On Fees, select the child and press Pay now on the advance or an open installment.',
      'Choose upload receipt (offline) or Thawani. Offline: attach the proof image/PDF and an optional note, then confirm.',
      'Offline payments stay pending until the school reviews them. You will see waiting approval on that row.',
      'Thawani: complete checkout in the window that opens. Success marks the payment according to the webhook; keep the window until it finishes.',
      'If a payment is rejected, read the notice and pay again with a correct receipt.',
    ],
    notes: [
      'You cannot overpay a row or skip ahead while an earlier installment is unpaid (school policy on the sheet).',
      'Thawani is unavailable until the school configures it.',
    ],
    related: ['parent-fees', 'receipts-transfers'],
  },
  'parent-chats-meetings': {
    title: 'Chats and meetings',
    intro:
      'Parents use group chat (class, ad-hoc, or bus), direct messages, and My meetings for scheduled video rooms.',
    who: 'Parents.',
    when: 'Day-to-day communication with teachers, and joining a booked meeting or live session.',
    steps: [
      'Open Chats for class or bus groups. Reply in the thread; keep tone suitable for a school record.',
      'Open Direct messages for a private conversation with a teacher or admin.',
      'Open Approval requests to accept or decline an activity letter, or use Approve / Reject in the email and SMS the school sent.',
      'Open My meetings to join a scheduled room at the right time.',
      'If a teacher started a live class, use the join path they shared (online session).',
    ],
    notes: [
      'Students may have DMs and meetings but not group chat. Do not share passwords in chat.',
    ],
    related: ['parent-bus', 'parent-activities', 'parent-weekly-plans'],
  },
  'parent-bus': {
    title: 'Bus movements and pickup',
    intro:
      'If your child is assigned to a bus, the dashboard shows today’s movements. You can share your current GPS location as the child’s pickup point for the school map.',
    who: 'Parents of children on school transport.',
    when: 'Each trip day, and when the pickup address/location should be updated.',
    steps: [
      'Open the parent dashboard and read today’s bus log for boarding / trip direction.',
      'To share pickup: use Share pickup (or the equivalent button) on the child. Allow the browser to use your location.',
      'The school sees the coordinates on the bus students map. Staff can also type or map a point themselves.',
      'If the child is not on a bus, ask the school to assign them in Transportation or the student editor.',
    ],
    notes: [
      'Location sharing needs permission in the browser or phone. It updates the child’s pickup on their current bus.',
      'The live daily log is written by staff; parents do not mark boarding.',
    ],
    related: ['parent-dashboard', 'fleet-assignment', 'daily-log'],
  },
}

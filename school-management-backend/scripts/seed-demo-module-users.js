#!/usr/bin/env node
/**
 * Seed demo module user-groups + sample people across two schools.
 *
 * School A = existing demo (`landing_slug` zinat-al-haya)
 * School B = created/updated `fikr-demo-b`
 *
 * - Staff user groups for each product module (+ Driver)
 * - One staff login per module group (on School A)
 * - 3 teachers + 6 students split across A/B
 * - Driver group + driver user + bus on School A
 *
 * Usage (from school-management-backend):
 *   node scripts/seed-demo-module-users.js           # dry-run
 *   node scripts/seed-demo-module-users.js --apply
 */
'use strict';

const path = require('path');
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const APPLY = process.argv.includes('--apply');
const PASSWORD = 'DemoPass123!';
const DEMO_SLUG = process.env.DEMO_SCHOOL_SLUG || 'zinat-al-haya';
const SCHOOL_B_SLUG = 'fikr-demo-b';

/** Logical modules → RBAC page keys (school scope). */
const MODULES = [
  {
    code: 'mod_dashboard',
    name: 'Module: Dashboard',
    pages: ['dashboard', 'mobile_dashboard'],
  },
  {
    code: 'mod_users',
    name: 'Module: Users',
    pages: ['users', 'user_groups'],
  },
  {
    code: 'mod_students',
    name: 'Module: Students',
    pages: [
      'students',
      'student_register',
      'groups',
      'grade_levels',
      'enrollments',
      'enrollment_responsibilities',
      'course_enrollments',
    ],
  },
  {
    code: 'mod_settings',
    name: 'Module: Settings',
    pages: ['settings', 'system_settings', 'school_billing'],
  },
  {
    code: 'mod_schedules',
    name: 'Module: Schedules',
    pages: ['schedules'],
  },
  {
    code: 'mod_attendance',
    name: 'Module: Attendance',
    pages: ['attendance', 'attendance_sessions'],
  },
  {
    code: 'mod_activities',
    name: 'Module: Activities',
    pages: ['activities', 'approvals'],
  },
  {
    code: 'mod_courses',
    name: 'Module: Courses',
    pages: [
      'courses',
      'graded_courses',
      'course_enrollments',
      'progress',
      'weekly_session_plans',
      'teacher_weekly_sessions',
      'teacher_schedule',
      'teacher_graded_tasks',
      'teacher_graded_marks',
    ],
  },
  {
    code: 'mod_fees',
    name: 'Module: Fees',
    pages: [
      'student_payments',
      'payment_levels',
      'payment_courses',
      'payment_packages',
      'payment_catalog_charges',
      'payment_catalog_discounts',
      'payment_catalog_extras',
      'payment_catalog_inclusions',
      'reports_fees_due',
    ],
  },
  {
    code: 'mod_transport',
    name: 'Module: Transportation',
    pages: ['transportation', 'transportation_daily_log'],
  },
  {
    code: 'mod_driver',
    name: 'Module: Driver',
    pages: [
      'dashboard',
      'mobile_dashboard',
      'transportation',
      'transportation_daily_log',
      'chat',
      'messages',
    ],
  },
  {
    code: 'mod_comms',
    name: 'Module: Communication',
    pages: ['chat', 'messages', 'admin_meeting_rooms', 'my_meeting_rooms'],
  },
  {
    code: 'mod_notifications',
    name: 'Module: Notifications',
    pages: [
      'notification_layouts',
      'notification_templates',
      'message_letters',
      'notification_transactions',
    ],
  },
  {
    code: 'mod_reports',
    name: 'Module: Reports',
    pages: ['reports', 'reports_fees_due'],
  },
];

const TEACHERS = [
  {
    email: 'teacher1@fikr-demo.com',
    school: 'A',
    firstEn: 'Sara',
    lastEn: 'Al Harthy',
    firstAr: 'سارة',
    lastAr: 'الحارثية',
  },
  {
    email: 'teacher2@fikr-demo.com',
    school: 'A',
    firstEn: 'Omar',
    lastEn: 'Al Busaidi',
    firstAr: 'عمر',
    lastAr: 'البوسعيدي',
  },
  {
    email: 'teacher3@fikr-demo.com',
    school: 'B',
    firstEn: 'Laila',
    lastEn: 'Al Lawati',
    firstAr: 'ليلى',
    lastAr: 'اللواتية',
  },
];

const STUDENTS = [
  {
    key: 's1',
    school: 'A',
    firstEn: 'Yusuf',
    lastEn: 'Al Hinai',
    firstAr: 'يوسف',
    lastAr: 'الهنائي',
    parentEmail: 'parent.s1@fikr-demo.com',
  },
  {
    key: 's2',
    school: 'A',
    firstEn: 'Maryam',
    lastEn: 'Al Hinai',
    firstAr: 'مريم',
    lastAr: 'الهنائية',
    parentEmail: 'parent.s1@fikr-demo.com',
  },
  {
    key: 's3',
    school: 'A',
    firstEn: 'Hassan',
    lastEn: 'Al Riyami',
    firstAr: 'حسن',
    lastAr: 'الريامي',
    parentEmail: 'parent.s3@fikr-demo.com',
  },
  {
    key: 's4',
    school: 'B',
    firstEn: 'Noor',
    lastEn: 'Al Balushi',
    firstAr: 'نور',
    lastAr: 'البلوشية',
    parentEmail: 'parent.s4@fikr-demo.com',
  },
  {
    key: 's5',
    school: 'B',
    firstEn: 'Khalid',
    lastEn: 'Al Balushi',
    firstAr: 'خالد',
    lastAr: 'البلوشي',
    parentEmail: 'parent.s4@fikr-demo.com',
  },
  {
    key: 's6',
    school: 'B',
    firstEn: 'Aisha',
    lastEn: 'Al Abri',
    firstAr: 'عائشة',
    lastAr: 'العبري',
    parentEmail: 'parent.s6@fikr-demo.com',
  },
];

function log(msg) {
  console.log(msg);
}

async function main() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT || 5432),
    user: process.env.DATABASE_USERNAME || 'school_admin',
    password: process.env.DATABASE_PASSWORD || 'school_password_2024',
    database: process.env.DATABASE_NAME || 'school_management',
  });
  await client.connect();

  try {
    const schoolA = await ensureSchoolA(client);
    const schoolB = await ensureSchoolB(client, schoolA);
    log(`School A: ${schoolA.id} (${schoolA.landing_slug})`);
    log(`School B: ${schoolB.id} (${schoolB.landing_slug})`);

    const pages = await loadPages(client);
    const allowed = await loadAllowedActions(client);
    const passwordHash = await bcrypt.hash(PASSWORD, 10);

    for (const school of [schoolA, schoolB]) {
      await ensureSchoolAdminAndTeacherGroups(client, school.id, pages, allowed);
      for (const mod of MODULES) {
        await ensureModuleGroup(client, school.id, mod, pages, allowed);
      }
    }

    // One user per module group on School A (primary demo logins)
    const moduleUsers = [];
    for (const mod of MODULES) {
      const email = `${mod.code.replace(/^mod_/, 'mod.')}@fikr-demo.com`;
      const isDriver = mod.code === 'mod_driver';
      const user = await ensureStaffUser(client, {
        email,
        passwordHash,
        schoolId: schoolA.id,
        // Not `admin` — school admins bypass ClaimGuard during RBAC transition.
        role: 'teacher',
        firstEn: mod.name.replace('Module: ', ''),
        lastEn: 'Demo',
        firstAr: mod.name.replace('Module: ', ''),
        lastAr: 'تجريبي',
      });
      void isDriver;
      const group = await getGroupByCode(client, schoolA.id, mod.code);
      await ensureMembership(client, user.id, group.id);
      moduleUsers.push({ email, group: mod.name, code: mod.code });
    }

    // School B admin (full school admin group)
    const adminB = await ensureStaffUser(client, {
      email: 'admin.b@fikr-demo.com',
      passwordHash,
      schoolId: schoolB.id,
      role: 'admin',
      firstEn: 'Admin',
      lastEn: 'Branch B',
      firstAr: 'مدير',
      lastAr: 'الفرع ب',
    });
    const schoolAdminB = await getGroupByCode(client, schoolB.id, 'school_admin');
    await ensureMembership(client, adminB.id, schoolAdminB.id);

    // Teachers
    const teacherUsers = [];
    for (const t of TEACHERS) {
      const schoolId = t.school === 'A' ? schoolA.id : schoolB.id;
      const user = await ensureStaffUser(client, {
        email: t.email,
        passwordHash,
        schoolId,
        role: 'teacher',
        firstEn: t.firstEn,
        lastEn: t.lastEn,
        firstAr: t.firstAr,
        lastAr: t.lastAr,
      });
      const teacherGroup = await getGroupByCode(client, schoolId, 'teacher');
      await ensureMembership(client, user.id, teacherGroup.id);
      teacherUsers.push({ email: t.email, school: t.school });
    }

    // Class groups
    const groupA = await ensureClassGroup(client, schoolA.id, 'Demo Class A');
    const groupB = await ensureClassGroup(client, schoolB.id, 'Demo Class B');

    // Parents + students
    const parentByEmail = new Map();
    const studentRows = [];
    for (const s of STUDENTS) {
      const schoolId = s.school === 'A' ? schoolA.id : schoolB.id;
      const classGroupId = s.school === 'A' ? groupA.id : groupB.id;

      let parent = parentByEmail.get(s.parentEmail);
      if (!parent) {
        parent = await ensureParentWithLogin(client, {
          email: s.parentEmail,
          passwordHash,
          firstEn: 'Parent',
          lastEn: s.lastEn,
          firstAr: 'ولي',
          lastAr: s.lastAr,
        });
        parentByEmail.set(s.parentEmail, parent);
      }

      const student = await ensureStudent(client, {
        schoolId,
        groupId: classGroupId,
        firstEn: s.firstEn,
        lastEn: s.lastEn,
        firstAr: s.firstAr,
        lastAr: s.lastAr,
        email: `${s.key}@students.fikr-demo.local`,
      });
      await ensureStudentParentLink(client, student.id, parent.parentId, 'guardian');
      studentRows.push({
        key: s.key,
        school: s.school,
        name: `${s.firstEn} ${s.lastEn}`,
        parent: s.parentEmail,
      });
    }

    // Driver user on School A + bus
    const driverEmail = 'driver@fikr-demo.com';
    const driverUser = await ensureStaffUser(client, {
      email: driverEmail,
      passwordHash,
      schoolId: schoolA.id,
      role: 'teacher',
      firstEn: 'Badr',
      lastEn: 'Al Masoudi',
      firstAr: 'بدر',
      lastAr: 'المسعودي',
    });
    const driverGroup = await getGroupByCode(client, schoolA.id, 'mod_driver');
    await ensureMembership(client, driverUser.id, driverGroup.id);
    const bus = await ensureBus(client, schoolA.id, driverUser.id, 'Demo Bus A');

    // Assign first School A student to the bus
    const firstA = studentRows.find((r) => r.school === 'A');
    if (firstA) {
      const st = await client.query(
        `SELECT id FROM students WHERE school_id = $1 AND "first_name_en" = $2 LIMIT 1`,
        [schoolA.id, STUDENTS.find((x) => x.key === firstA.key).firstEn],
      );
      if (st.rows[0]) {
        await ensureStudentBus(client, st.rows[0].id, bus.id);
      }
    }

    log('');
    log(APPLY ? 'APPLIED' : 'DRY-RUN (pass --apply to write)');
    log(`Password for all new logins: ${PASSWORD}`);
    log('');
    log('Module users (School A — zinat-al-haya):');
    for (const u of moduleUsers) log(`  ${u.email}  →  ${u.group}`);
    log('');
    log('School B admin: admin.b@fikr-demo.com');
    log('Teachers:');
    for (const t of teacherUsers) log(`  ${t.email}  (School ${t.school})`);
    log('Parents:');
    for (const email of parentByEmail.keys()) log(`  ${email}`);
    log('Students:');
    for (const s of studentRows) log(`  ${s.name}  School ${s.school}  parent ${s.parent}`);
    log(`Driver: ${driverEmail}  bus: ${bus.title}`);

    if (!APPLY) {
      log('\nNo changes written. Re-run with --apply.');
      return;
    }
  } finally {
    await client.end();
  }
}

async function ensureSchoolA(client) {
  const { rows } = await client.query(
    `SELECT id, name, landing_slug, status, logo_url FROM schools WHERE landing_slug = $1 LIMIT 1`,
    [DEMO_SLUG],
  );
  if (!rows[0]) throw new Error(`Demo school slug ${DEMO_SLUG} not found`);
  return rows[0];
}

async function ensureSchoolB(client, schoolA) {
  const existing = await client.query(
    `SELECT id, name, landing_slug, status FROM schools WHERE landing_slug = $1 LIMIT 1`,
    [SCHOOL_B_SLUG],
  );
  if (existing.rows[0]) {
    if (!APPLY) return existing.rows[0];
    return existing.rows[0];
  }
  if (!APPLY) {
    return {
      id: '(pending)',
      name: 'FIKR Demo School B',
      landing_slug: SCHOOL_B_SLUG,
      status: 'active',
    };
  }
  const { rows } = await client.query(
    `INSERT INTO schools (
        name, name_ar, name_en, status, landing_slug, logo_url, description, created_at, updated_at
      ) VALUES (
        $1, $2, $3, 'active', $4, $5, $6, NOW(), NOW()
      ) RETURNING id, name, landing_slug, status`,
    [
      'FIKR Demo School B',
      'مدرسة فكر التجريبية ب',
      'FIKR Demo School B',
      SCHOOL_B_SLUG,
      schoolA.logo_url || null,
      'Second demo school for multi-school role testing',
    ],
  );
  return rows[0];
}

async function loadPages(client) {
  const { rows } = await client.query(
    `SELECT id, key FROM rbac_pages WHERE "isActive" = true`,
  );
  return new Map(rows.map((r) => [r.key, r.id]));
}

async function loadAllowedActions(client) {
  const { rows } = await client.query(
    `SELECT p.key AS page_key, a.code AS action_code, p.id AS page_id, a.id AS action_id
     FROM rbac_page_actions pa
     JOIN rbac_pages p ON p.id = pa."pageId"
     JOIN rbac_actions a ON a.id = pa."actionId"`,
  );
  const byPage = new Map();
  for (const r of rows) {
    if (!byPage.has(r.page_key)) byPage.set(r.page_key, []);
    byPage.get(r.page_key).push({
      actionCode: r.action_code,
      pageId: r.page_id,
      actionId: r.action_id,
    });
  }
  return byPage;
}

async function ensureSchoolAdminAndTeacherGroups(client, schoolId, pages, allowed) {
  if (schoolId === '(pending)') return;
  // School Admin: all school/both page actions
  const schoolPageKeys = [...pages.keys()].filter((k) => !k.startsWith('platform_') && !k.startsWith('parent_'));
  // Keep parent_* out of staff admin? School admin template includes school+both; parent pages are school scope in seed.
  // Match service: school + both scopes — exclude platform only.
  const allSchoolKeys = (
    await client.query(
      `SELECT key FROM rbac_pages WHERE scope IN ('school','both') AND "isActive" = true`,
    )
  ).rows.map((r) => r.key);

  await upsertStaffGroup(client, schoolId, {
    code: 'school_admin',
    name: 'School Admin',
    description: 'Full school access',
    pageKeys: allSchoolKeys,
    pages,
    allowed,
  });

  const teacherPages = [
    'dashboard',
    'mobile_dashboard',
    'teacher_schedule',
    'teacher_weekly_sessions',
    'teacher_graded_tasks',
    'teacher_graded_marks',
    'attendance',
    'attendance_sessions',
    'activities',
    'course_enrollments',
    'progress',
    'courses',
    'graded_courses',
    'chat',
    'messages',
    'my_meeting_rooms',
    'transportation_daily_log',
  ];
  await upsertStaffGroup(client, schoolId, {
    code: 'teacher',
    name: 'Teacher',
    description: 'School teacher access',
    pageKeys: teacherPages,
    pages,
    allowed,
  });
}

async function ensureModuleGroup(client, schoolId, mod, pages, allowed) {
  if (schoolId === '(pending)') return;
  await upsertStaffGroup(client, schoolId, {
    code: mod.code,
    name: mod.name,
    description: `Demo claims for ${mod.name}`,
    pageKeys: [...new Set(['dashboard', ...mod.pages])],
    pages,
    allowed,
  });
}

async function upsertStaffGroup(client, schoolId, { code, name, description, pageKeys, pages, allowed }) {
  let group = (
    await client.query(
      `SELECT id, code, name FROM rbac_groups WHERE "schoolId" = $1 AND code = $2 LIMIT 1`,
      [schoolId, code],
    )
  ).rows[0];

  if (!APPLY) {
    log(`[dry] group ${code} @ ${schoolId.slice(0, 8)}…`);
    return group || { id: '(pending)', code };
  }

  if (!group) {
    group = (
      await client.query(
        `INSERT INTO rbac_groups (
           name, code, "groupType", description, "schoolId", color, "isSystem", "systemKey", "isActive", "createdAt", "updatedAt"
         ) VALUES ($1,$2,'staff',$3,$4,$5,false,NULL,true,NOW(),NOW())
         RETURNING id, code, name`,
        [name, code, description, schoolId, code === 'mod_driver' ? '#b45309' : '#0f766e'],
      )
    ).rows[0];
  } else {
    await client.query(
      `UPDATE rbac_groups SET name = $2, description = $3, "updatedAt" = NOW() WHERE id = $1`,
      [group.id, name, description],
    );
  }

  // Primary role pack
  let role = (
    await client.query(
      `SELECT r.id FROM rbac_roles r
       JOIN rbac_user_group_roles ugr ON ugr."roleId" = r.id
       WHERE ugr."groupId" = $1
       ORDER BY ugr."assignedAt" ASC LIMIT 1`,
      [group.id],
    )
  ).rows[0];

  if (!role) {
    const roleCode = `role_${code}_${schoolId.slice(0, 8)}`;
    role = (
      await client.query(
        `INSERT INTO rbac_roles (name, description, code, "schoolId", "isSystem", "systemKey", "isActive", "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,false,NULL,true,NOW(),NOW())
         RETURNING id`,
        [`Claim pack: ${name}`, description, roleCode, schoolId],
      )
    ).rows[0];
    await client.query(
      `INSERT INTO rbac_user_group_roles ("groupId", "roleId", "assignedAt")
       VALUES ($1,$2,NOW())
       ON CONFLICT DO NOTHING`,
      [group.id, role.id],
    );
  }

  await client.query(`DELETE FROM rbac_group_permissions WHERE "groupId" = $1`, [group.id]);
  await client.query(`DELETE FROM rbac_role_permissions WHERE "roleId" = $1`, [role.id]);

  const seenG = new Set();
  const seenR = new Set();
  for (const pageKey of pageKeys) {
    const acts = allowed.get(pageKey) || [];
    for (const a of acts) {
      const gk = `${a.pageId}:${a.actionId}`;
      if (!seenG.has(gk)) {
        seenG.add(gk);
        await client.query(
          `INSERT INTO rbac_group_permissions ("groupId", "pageId", "actionId") VALUES ($1,$2,$3)
           ON CONFLICT DO NOTHING`,
          [group.id, a.pageId, a.actionId],
        );
      }
      const rk = `${a.pageId}:${a.actionId}`;
      if (!seenR.has(rk)) {
        seenR.add(rk);
        await client.query(
          `INSERT INTO rbac_role_permissions ("roleId", "pageId", "actionId") VALUES ($1,$2,$3)
           ON CONFLICT DO NOTHING`,
          [role.id, a.pageId, a.actionId],
        );
      }
    }
  }

  return group;
}

async function getGroupByCode(client, schoolId, code) {
  if (!APPLY) return { id: '(pending)', code };
  const { rows } = await client.query(
    `SELECT id, code, name FROM rbac_groups WHERE "schoolId" = $1 AND code = $2 LIMIT 1`,
    [schoolId, code],
  );
  if (!rows[0]) throw new Error(`Missing group ${code} for school ${schoolId}`);
  return rows[0];
}

async function ensureStaffUser(client, opts) {
  if (!APPLY || opts.schoolId === '(pending)') {
    log(`[dry] staff ${opts.email} @ school ${opts.schoolId}`);
    return { id: '(pending)', email: opts.email };
  }
  const existing = (
    await client.query(`SELECT id, email, school_id FROM users WHERE email = $1 LIMIT 1`, [
      opts.email,
    ])
  ).rows[0];

  let user = existing;
  if (!user) {
    user = (
      await client.query(
        `INSERT INTO users (
           email, password, "firstName", "lastName",
           first_name_ar, first_name_en, last_name_ar, last_name_en,
           role, user_type, school_id, "isActive", must_change_password,
           preferred_language, is_system_user, is_super_admin, "createdAt", "updatedAt"
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,'staff',$10,true,false,'ar',false,false,NOW(),NOW()
         ) RETURNING id, email, school_id`,
        [
          opts.email,
          opts.passwordHash,
          opts.firstAr || opts.firstEn,
          opts.lastAr || opts.lastEn,
          opts.firstAr,
          opts.firstEn,
          opts.lastAr,
          opts.lastEn,
          opts.role,
          opts.schoolId,
        ],
      )
    ).rows[0];
  } else {
    await client.query(
      `UPDATE users SET
         password = $2, school_id = $3, role = $4, user_type = 'staff',
         "isActive" = true, must_change_password = false,
         first_name_en = $5, last_name_en = $6, first_name_ar = $7, last_name_ar = $8,
         "firstName" = $7, "lastName" = $8, "updatedAt" = NOW()
       WHERE id = $1`,
      [
        user.id,
        opts.passwordHash,
        opts.schoolId,
        opts.role,
        opts.firstEn,
        opts.lastEn,
        opts.firstAr,
        opts.lastAr,
      ],
    );
  }

  const staff = await client.query(
    `SELECT id FROM staff WHERE user_id = $1 AND school_id = $2 LIMIT 1`,
    [user.id, opts.schoolId],
  );
  if (!staff.rows[0]) {
    await client.query(
      `INSERT INTO staff (user_id, school_id, created_at, updated_at) VALUES ($1,$2,NOW(),NOW())`,
      [user.id, opts.schoolId],
    );
  }

  return user;
}

async function ensureMembership(client, userId, groupId) {
  if (!APPLY || userId === '(pending)' || groupId === '(pending)') return;
  await client.query(
    `INSERT INTO rbac_user_group_members ("userId", "groupId", "assignedAt")
     VALUES ($1,$2,NOW())
     ON CONFLICT DO NOTHING`,
    [userId, groupId],
  );
}

async function ensureClassGroup(client, schoolId, name) {
  if (schoolId === '(pending)') return { id: '(pending)', name };
  const existing = (
    await client.query(
      `SELECT id, name FROM groups WHERE school_id = $1 AND name = $2 LIMIT 1`,
      [schoolId, name],
    )
  ).rows[0];
  if (existing) return existing;
  if (!APPLY) return { id: '(pending)', name };
  const { rows } = await client.query(
    `INSERT INTO groups (name, capacity, is_active, status, "studentCount", "teacherCount", school_id, created_at, updated_at)
     VALUES ($1, 25, true, 'active', 0, 0, $2, NOW(), NOW())
     RETURNING id, name`,
    [name, schoolId],
  );
  return rows[0];
}

async function ensureParentWithLogin(client, opts) {
  const existingUser = (
    await client.query(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [opts.email])
  ).rows[0];

  if (!APPLY) {
    return { userId: existingUser?.id || '(pending)', parentId: '(pending)', email: opts.email };
  }

  let userId = existingUser?.id;
  if (!userId) {
    const u = (
      await client.query(
        `INSERT INTO users (
           email, password, "firstName", "lastName",
           first_name_ar, first_name_en, last_name_ar, last_name_en,
           role, user_type, school_id, "isActive", must_change_password,
           preferred_language, is_system_user, is_super_admin, "createdAt", "updatedAt"
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,'parent','parent',NULL,true,false,'ar',false,false,NOW(),NOW()
         ) RETURNING id`,
        [
          opts.email,
          opts.passwordHash,
          opts.firstAr,
          opts.lastAr,
          opts.firstAr,
          opts.firstEn,
          opts.lastAr,
          opts.lastEn,
        ],
      )
    ).rows[0];
    userId = u.id;
  } else {
    await client.query(
      `UPDATE users SET password = $2, role = 'parent', user_type = 'parent', school_id = NULL,
         "isActive" = true, must_change_password = false, "updatedAt" = NOW()
       WHERE id = $1`,
      [userId, opts.passwordHash],
    );
  }

  let parent = (
    await client.query(`SELECT id FROM parents WHERE user_id = $1 LIMIT 1`, [userId])
  ).rows[0];
  if (!parent) {
    parent = (
      await client.query(
        `SELECT id FROM parents WHERE lower(email) = lower($1) LIMIT 1`,
        [opts.email],
      )
    ).rows[0];
  }
  if (!parent) {
    parent = (
      await client.query(
        `INSERT INTO parents (
           "firstName", "lastName", email, user_id, school_id,
           first_name_ar, first_name_en, last_name_ar, last_name_en,
           "createdAt", "updatedAt", created_at, updated_at
         ) VALUES ($1,$2,$3,$4,NULL,$1,$5,$2,$6,NOW(),NOW(),NOW(),NOW())
         RETURNING id`,
        [opts.firstAr, opts.lastAr, opts.email, userId, opts.firstEn, opts.lastEn],
      )
    ).rows[0];
  } else {
    await client.query(`UPDATE parents SET user_id = $2 WHERE id = $1`, [parent.id, userId]);
  }

  // Parent system group membership
  const parentGroup = (
    await client.query(`SELECT id FROM rbac_groups WHERE "systemKey" = 'parent' LIMIT 1`)
  ).rows[0];
  if (parentGroup) {
    await ensureMembership(client, userId, parentGroup.id);
  }

  return { userId, parentId: parent.id, email: opts.email };
}

async function ensureStudent(client, opts) {
  if (!APPLY || opts.schoolId === '(pending)') return { id: '(pending)' };
  const existing = (
    await client.query(
      `SELECT id FROM students
       WHERE school_id = $1 AND first_name_en = $2 AND last_name_en = $3
       LIMIT 1`,
      [opts.schoolId, opts.firstEn, opts.lastEn],
    )
  ).rows[0];
  if (existing) {
    if (opts.groupId && opts.groupId !== '(pending)') {
      await client.query(
        `INSERT INTO student_groups (student_id, group_id)
         VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [existing.id, opts.groupId],
      );
    }
    return existing;
  }

  const { rows } = await client.query(
    `INSERT INTO students (
       "firstName", "lastName", first_name, family_name,
       first_name_ar, first_name_en, last_name_ar, last_name_en,
       email, gender, "dateOfBirth", address, "emergencyContact",
       school_id, "createdAt", "updatedAt", created_at, updated_at
     ) VALUES (
       $1,$2,$1,$2,$1,$3,$2,$4,$5,'male','2021-01-15','Demo area','90000000',
       $6,NOW(),NOW(),NOW(),NOW()
     ) RETURNING id`,
    [
      opts.firstAr,
      opts.lastAr,
      opts.firstEn,
      opts.lastEn,
      opts.email,
      opts.schoolId,
    ],
  );
  const student = rows[0];
  if (opts.groupId && opts.groupId !== '(pending)') {
    await client.query(
      `INSERT INTO student_groups (student_id, group_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
      [student.id, opts.groupId],
    );
  }
  return student;
}

async function ensureStudentParentLink(client, studentId, parentId, relationship) {
  if (!APPLY || studentId === '(pending)' || parentId === '(pending)') return;
  await client.query(
    `INSERT INTO student_parents (student_id, parent_id, relationship)
     VALUES ($1,$2,$3)
     ON CONFLICT DO NOTHING`,
    [studentId, parentId, relationship],
  );
}

async function ensureBus(client, schoolId, driverUserId, title) {
  if (!APPLY) return { id: '(pending)', title };
  const existing = (
    await client.query(
      `SELECT id, title FROM buses WHERE school_id = $1 AND title = $2 LIMIT 1`,
      [schoolId, title],
    )
  ).rows[0];
  if (existing) {
    await client.query(
      `UPDATE buses SET driver_user_id = $2, is_active = true, updated_at = NOW() WHERE id = $1`,
      [existing.id, driverUserId],
    );
    return existing;
  }
  const { rows } = await client.query(
    `INSERT INTO buses (title, driver_name, capacity, is_active, school_id, driver_user_id, created_at, updated_at)
     VALUES ($1, $2, 20, true, $3, $4, NOW(), NOW())
     RETURNING id, title`,
    [title, 'بدر المسعودي', schoolId, driverUserId],
  );
  return rows[0];
}

async function ensureStudentBus(client, studentId, busId) {
  if (!APPLY) return;
  await client.query(
    `INSERT INTO student_buses (student_id, bus_id) VALUES ($1,$2)
     ON CONFLICT (student_id) DO UPDATE SET bus_id = EXCLUDED.bus_id`,
    [studentId, busId],
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

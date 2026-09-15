#!/usr/bin/env node
/**
 * One-off Zinat 2026/2027 load:
 *  1. Anonymize people on the existing demo school (keep name + logo + staff logins).
 *  2. Create a second school with the same branding (slug zinat-al-haya-live).
 *  3. Import roster, class groups, parents, fleet, and one bus per student.
 *
 * Usage (from school-management-backend):
 *   node scripts/import-zinat-2026-roster.js           # dry-run (local .env)
 *   node scripts/import-zinat-2026-roster.js --apply
 *
 * Production: point DATABASE_URL at Railway Postgres, keep the three source files
 * on the machine, then dry-run before --apply.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');
const XLSX = require('xlsx');
const PizZip = require('pizzip');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const APPLY = process.argv.includes('--apply');
const DEMO_SLUG = process.env.DEMO_SCHOOL_SLUG || 'zinat-al-haya';
const LIVE_SLUG = process.env.LIVE_SCHOOL_SLUG || 'zinat-al-haya-live';
const LIVE_ADMIN_EMAIL = process.env.LIVE_ADMIN_EMAIL || 'Zahra@gmail.com';
const LIVE_ADMIN_PASSWORD = process.env.LIVE_ADMIN_PASSWORD || 'ZahraAdmin123';
const PARENT_PASSWORD = 'DemoPass123!';
const STAFF_PASSWORD = 'DemoPass123!';
const KEEP_STAFF_EMAILS = new Set([
  'admin@zinatalhaykindergarten.com',
  'zahra@gmail.com',
  'moza@zinat.local',
  'superadmin@zinat.platform',
]);

const ROSTER_XLSX =
  process.env.ROSTER_XLSX ||
  '/Users/salim/Downloads/بيانات العباقرة (تم الحفظ تلقائياً) (1).xlsx';
const BUSES_XLSX =
  process.env.BUSES_XLSX || '/Users/salim/Downloads/حافلات زينة الحياة.xlsx';
const TRANSPORT_DOCX =
  process.env.TRANSPORT_DOCX || '/Users/salim/Downloads/النقل المدرسي.docx';

const CLASS_SHEETS = [
  'أفلاك ابن ماجد',
  'مناهل عائشة الريامية',
  'نوابغ ابن الذهبي',
  'غيمات الزهراء السقطرية',
  'رواد نور الدين السالمي',
  'درر الفراهيدي',
  'رياحين هند بنت المهلب',
];

const GROUP_TEACHERS = {
  'نوابغ ابن الذهبي': 'حميدة',
  'غيمات الزهراء السقطرية': 'موزة',
};

const FLEET = [
  { key: 'اليحمدي', title: 'حافلة اليحمدي', plate: '8444', capacity: 26, area: 'اليحمدي', driver: 'بدر المسعودي', driverPhone: '95536647', supervisor: 'أمل المسعودية', supervisorPhone: '96900659' },
  { key: 'الثابتي', title: 'حافلة الثابتي', plate: 'د ك/6496', capacity: 15, area: 'الثابتي', driver: 'خلفان السالمي', driverPhone: '92501150', supervisor: 'فرحة حسين', supervisorPhone: '92521779' },
  { key: 'الحزم', title: 'حافلة الحزم', plate: '91604 ر', capacity: 15, area: 'الحزم والنصيب', driver: 'بدر الإسماعيلي', driverPhone: '94777427', supervisor: 'زينة الإسماعيلية', supervisorPhone: '96649661' },
  { key: 'علاية', title: 'حافلة علاية', plate: 'ي س/5830', capacity: 25, area: 'علاية / شخابيط 1', driver: 'عامر الدويكي', driverPhone: '94121333', supervisor: 'خلود الرواحية', supervisorPhone: '98193187' },
  { key: 'الشخابيط', title: 'حافلة الشخابيط', plate: '', capacity: 15, area: 'الشخابيط والدكيك', driver: 'حمود الحارثي', driverPhone: '94997577', supervisor: 'زيانة الحارثية', supervisorPhone: '98885014' },
  { key: 'سفالة', title: 'حافلة سفالة', plate: '4019 ر أ', capacity: 25, area: 'سيح العافية والخويلية والصفيح والمعترض', driver: 'سليم الدويكي', driverPhone: '92697543', supervisor: 'صفية الدويكية', supervisorPhone: '91121943' },
  { key: 'وادي نام', title: 'حافلة وادي نام', plate: '', capacity: 25, area: 'النبأ والغبرة والرحيبات', driver: 'عبدالله العامري', driverPhone: '99223462', supervisor: 'سهى العامرية', supervisorPhone: '79620677' },
  { key: 'القابل', title: 'سيارة خاصة القابل', plate: '', capacity: 12, area: 'القابل ومضيرب', driver: 'آية البلوشية', driverPhone: '72661269', supervisor: '', supervisorPhone: '' },
  { key: 'مصرون', title: 'سيارة خاصة مصرون', plate: '', capacity: 12, area: 'مصرون', driver: 'وداد النظيرية', driverPhone: '94452224', supervisor: '', supervisorPhone: '' },
  { key: 'الصرم', title: 'سيارة خاصة الصرم', plate: '', capacity: 12, area: 'الصرم', driver: 'أريام الرحبية', driverPhone: '97570736', supervisor: '', supervisorPhone: '' },
  { key: 'جديا', title: 'حافلة جديا', plate: '', capacity: 20, area: 'جديا', driver: 'سائق جديا', driverPhone: '', supervisor: '', supervisorPhone: '', placeholderDriver: true },
];

const AR_MAP = {
  ا: 'a', أ: 'a', إ: 'a', آ: 'a', ب: 'b', ت: 't', ث: 'th', ج: 'j', ح: 'h', خ: 'kh',
  د: 'd', ذ: 'dh', ر: 'r', ز: 'z', س: 's', ش: 'sh', ص: 's', ض: 'd', ط: 't', ظ: 'z',
  ع: 'a', غ: 'gh', ف: 'f', ق: 'q', ك: 'k', ل: 'l', م: 'm', ن: 'n', ه: 'h', و: 'w',
  ي: 'y', ى: 'a', ة: 'a', ء: '', ئ: 'y', ؤ: 'w', لا: 'la',
};

function transliterate(ar) {
  if (!ar) return '';
  let out = '';
  for (const ch of ar) {
    if (ch === ' ') out += ' ';
    else out += AR_MAP[ch] || (/[a-zA-Z0-9-]/.test(ch) ? ch : '');
  }
  out = out.replace(/\s+/g, ' ').trim();
  return out
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ') || 'Student';
}

function collapseWs(s) {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

function normalizeName(s) {
  return collapseWs(s)
    .replace(/[ـ]/g, '')
    .replace(/\u0650|\u064B|\u064C|\u064D|\u064E|\u064F|\u0651|\u0652/g, '')
    .replace(/\s+بن\s+/g, ' ')
    .replace(/\s+بنت\s+/g, ' ')
    .replace(/\s+ابن\s+/g, ' ');
}

function asCivilId(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number') {
    if (!v) return null;
    return String(Math.round(v));
  }
  const s = String(v).trim();
  if (!s || s === '0') return null;
  const n = Number(s);
  if (Number.isFinite(n) && n > 0) return String(Math.round(n));
  const digits = s.replace(/\D/g, '');
  return digits && digits !== '0' ? digits : null;
}

function asPhone(v) {
  if (v == null || v === '') return null;
  let digits = String(typeof v === 'number' ? Math.round(v) : v).replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length > 8) digits = digits.slice(-8);
  if (digits.length < 7) return null;
  return digits;
}

function excelSerialToIso(v) {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n) || n < 20000 || n > 60000) return null;
  const utc = new Date(Date.UTC(1899, 11, 30) + Math.round(n) * 86400000);
  return utc.toISOString().slice(0, 10);
}

function inferGender(fullName) {
  const n = collapseWs(fullName);
  if (/\bبنت\b/.test(n) || /ية$/.test(n.split(/\s+/).pop() || '')) return 'female';
  return 'male';
}

function splitArabicName(fullName) {
  const raw = collapseWs(fullName);
  const parts = raw.split(/\s+/).filter((p) => p && p !== 'بن' && p !== 'بنت' && p !== 'ابن');
  const first = parts[0] || raw || 'عبقري';
  const last = parts.length > 1 ? parts[parts.length - 1] : first;
  const second = parts.length > 2 ? parts[1] : null;
  const third = parts.length > 3 ? parts[2] : null;
  return { first, second, third, last, gender: inferGender(raw) };
}

function busTitle(bus) {
  return bus.plate ? `${bus.title} (${bus.plate})` : bus.title;
}

function sheetRows(wb, name) {
  const sheet = wb.Sheets[name];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: '' });
}

function parseRoster() {
  const wb = XLSX.readFile(ROSTER_XLSX);
  const byNorm = new Map();
  const byCivil = new Map();
  const students = [];

  const ingest = (row, groupName) => {
    const fullName = collapseWs(row[0]);
    if (!fullName || fullName.includes('اسم العبقري') || fullName.length < 2) return;
    if (CLASS_SHEETS.includes(fullName) || ['حميدة', 'موزة'].includes(fullName)) return;
    const names = splitArabicName(fullName);
    const rec = {
      fullName,
      norm: normalizeName(fullName),
      ...names,
      civilId: asCivilId(row[1]),
      dob: excelSerialToIso(row[2]),
      stage: collapseWs(row[3]) === 'روضة' ? 'روضة' : collapseWs(row[3]) === 'تمهيدي' ? 'تمهيدي' : null,
      fatherCivilId: asCivilId(row[4]),
      fatherPhone: asPhone(row[5]),
      motherCivilId: asCivilId(row[6]),
      motherPhone: asPhone(row[7]),
      area: collapseWs(row[8]) || '',
      groupName: groupName || null,
    };
    students.push(rec);
    if (rec.civilId) byCivil.set(rec.civilId, rec);
    if (!byNorm.has(rec.norm)) byNorm.set(rec.norm, rec);
    else if (groupName && !byNorm.get(rec.norm).groupName) byNorm.get(rec.norm).groupName = groupName;
  };

  for (const name of CLASS_SHEETS) {
    const rows = sheetRows(wb, name);
    for (const row of rows) ingest(row, name);
  }

  const master = sheetRows(wb, 'جميع العباقرة');
  for (const row of master) {
    const fullName = collapseWs(row[0]);
    if (!fullName || fullName.includes('اسم العبقري')) continue;
    const existing = byNorm.get(normalizeName(fullName)) || (asCivilId(row[1]) && byCivil.get(asCivilId(row[1])));
    if (existing) {
      existing.civilId = existing.civilId || asCivilId(row[1]);
      existing.dob = existing.dob || excelSerialToIso(row[2]);
      existing.stage = existing.stage || (collapseWs(row[3]) === 'روضة' ? 'روضة' : collapseWs(row[3]) === 'تمهيدي' ? 'تمهيدي' : null);
      existing.fatherCivilId = existing.fatherCivilId || asCivilId(row[4]);
      existing.fatherPhone = existing.fatherPhone || asPhone(row[5]);
      existing.motherCivilId = existing.motherCivilId || asCivilId(row[6]);
      existing.motherPhone = existing.motherPhone || asPhone(row[7]);
      existing.area = existing.area || collapseWs(row[8]);
    } else {
      ingest(row, null);
    }
  }

  const unique = [];
  const seen = new Set();
  for (const s of students) {
    const key = s.civilId || s.norm;
    if (seen.has(key)) {
      const keep = unique.find((u) => (u.civilId && u.civilId === s.civilId) || u.norm === s.norm);
      if (keep && s.groupName && !keep.groupName) keep.groupName = s.groupName;
      continue;
    }
    seen.add(key);
    unique.push(s);
  }
  return { students: unique, byNorm, byCivil };
}

function parseBusExcel() {
  const wb = XLSX.readFile(BUSES_XLSX);
  const assignments = [];
  for (const sheetName of wb.SheetNames) {
    const rows = sheetRows(wb, sheetName);
    for (const row of rows) {
      const fullName = collapseWs(row[0]);
      if (!fullName || fullName.includes('اسم العبقري') || fullName === sheetName || fullName.startsWith('حافلة')) continue;
      assignments.push({
        fullName,
        norm: normalizeName(fullName),
        busKey: collapseWs(sheetName) === 'سيح الشخابيط' ? 'الشخابيط' : collapseWs(sheetName),
      });
    }
  }
  return assignments;
}

function extractDocxTables(filePath) {
  const zip = new PizZip(fs.readFileSync(filePath));
  const xml = zip.file('word/document.xml').asText();
  const tables = [];
  const tbls = xml.match(/<w:tbl[\s\S]*?<\/w:tbl>/g) || [];
  for (const tbl of tbls) {
    const rows = [];
    const trs = tbl.match(/<w:tr[\s\S]*?<\/w:tr>/g) || [];
    for (const tr of trs) {
      const cells = [];
      const tcs = tr.match(/<w:tc[\s\S]*?<\/w:tc>/g) || [];
      for (const tc of tcs) {
        const texts = [];
        const re = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g;
        let m;
        while ((m = re.exec(tc))) texts.push(m[1]);
        cells.push(collapseWs(texts.join('').replace(/&amp;/g, '&')));
      }
      if (cells.some(Boolean)) rows.push(cells);
    }
    if (rows.length) tables.push(rows);
  }
  return tables;
}

function resolveBusKey(vehicle) {
  const v = collapseWs(vehicle);
  if (!v) return null;
  if (v.includes('جديا')) return 'جديا';
  if (v.includes('اليحمدي')) return 'اليحمدي';
  if (v.includes('الثابتي')) return 'الثابتي';
  if (v.includes('الحزم')) return 'الحزم';
  if (v.includes('علاية')) return 'علاية';
  if (v.includes('الشخابيط') || v.includes('شخابيط')) return 'الشخابيط';
  if (v.includes('سفالة')) return 'سفالة';
  if (v.includes('الصرم')) return 'الصرم';
  if (v.includes('وادي نام')) return 'وادي نام';
  if (v.includes('القابل')) return 'القابل';
  if (v.includes('مصرون')) return 'مصرون';
  if (v === 'سيارة خاصة') return null;
  return null;
}

function parseTransportDoc() {
  const tables = extractDocxTables(TRANSPORT_DOCX);
  const assignments = [];
  const classByNorm = new Map();
  const master = tables[0] || [];
  for (const row of master.slice(1)) {
    const fullName = collapseWs(row[1]);
    if (!fullName) continue;
    if (fullName.includes('<') || fullName.length < 3) continue;
    const notes = collapseWs(row[5] || '');
    assignments.push({
      fullName,
      norm: normalizeName(fullName),
      stage: collapseWs(row[2]),
      busKey: resolveBusKey(row[3]),
      vehicle: collapseWs(row[3]),
      phone: asPhone(row[4]),
      notes,
    });
  }
  const tidyGroup = (g) =>
    collapseWs(g).replace('ا بن', 'ابن').replace('نورالدين', 'نور الدين');
  for (const tbl of tables.slice(2)) {
    for (const row of tbl) {
      const fullName = collapseWs(row[1]);
      const groupName = tidyGroup(row[2]);
      if (!fullName || fullName.includes('<') || !groupName) continue;
      const g = CLASS_SHEETS.find((x) => normalizeName(x) === normalizeName(groupName));
      if (g) classByNorm.set(normalizeName(fullName), g);
    }
  }
  return { assignments, classByNorm };
}

function dbClient() {
  if (process.env.DATABASE_URL) {
    return new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === '0' ? false : { rejectUnauthorized: false },
    });
  }
  return new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT || 5432),
    user: process.env.DATABASE_USERNAME || 'school_admin',
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME || 'school_management',
  });
}

async function resolveDemoSchoolId(client) {
  const row = (
    await client.query(`SELECT id, name, landing_slug FROM schools WHERE landing_slug = $1`, [DEMO_SLUG])
  ).rows[0];
  if (!row) throw new Error(`Demo school with landing_slug=${DEMO_SLUG} not found`);
  return row.id;
}

async function anonymizeDemo(client, report, demoSchoolId) {
  const already = (
    await client.query(
      `SELECT COUNT(*)::int AS n FROM students WHERE school_id = $1 AND "studentId" LIKE 'DEMO-%'`,
      [demoSchoolId],
    )
  ).rows[0].n;
  if (already > 0) {
    report.anonymized = { students: already, parents: 0, skipped: true };
    return;
  }
  const students = (
    await client.query(
      `SELECT id, "firstName", first_name_ar FROM students WHERE school_id = $1`,
      [demoSchoolId],
    )
  ).rows;
  let i = 0;
  for (const st of students) {
    i += 1;
    const arFirst = i % 2 === 0 ? 'ليان' : 'آدم';
    const enFirst = i % 2 === 0 ? 'Layan' : 'Adam';
    const arLast = `تجريبي${i}`;
    const enLast = `Demo${i}`;
    await client.query(
      `UPDATE students SET
         "firstName" = $2, "lastName" = $3,
         first_name_ar = $2, last_name_ar = $3,
         first_name_en = $4, last_name_en = $5,
         "secondName" = NULL, "thirdName" = NULL,
         address = 'Demo area',
         "studentId" = $6,
         phone = NULL, email = NULL,
         notes = 'Anonymized demo record'
       WHERE id = $1`,
      [st.id, arFirst, arLast, enFirst, enLast, `DEMO-${String(i).padStart(4, '0')}`],
    );
  }

  const parents = (
    await client.query(
      `SELECT DISTINCT p.id, p.user_id
         FROM parents p
         JOIN student_parents sp ON sp.parent_id = p.id
         JOIN students s ON s.id = sp.student_id
        WHERE s.school_id = $1`,
      [demoSchoolId],
    )
  ).rows;
  let p = 0;
  for (const parent of parents) {
    p += 1;
    const civil = `D${String(p).padStart(8, '0')}`;
    const phone = String(70000000 + p);
    await client.query(
      `UPDATE parents SET
         "firstName" = 'ولي', "lastName" = $2,
         first_name_ar = 'ولي', last_name_ar = $2,
         first_name_en = 'Guardian', last_name_en = $3,
         civil_id = $4, phone = $5, address = 'Demo'
       WHERE id = $1`,
      [parent.id, `تجريبي${p}`, `Demo${p}`, civil, phone],
    );
    if (parent.user_id) {
      const u = (
        await client.query(`SELECT email FROM users WHERE id = $1`, [parent.user_id])
      ).rows[0];
      if (u && !KEEP_STAFF_EMAILS.has(String(u.email).toLowerCase()) && !String(u.email).includes('parent.test')) {
        await client.query(
          `UPDATE users SET
             "firstName" = 'ولي', "lastName" = $2,
             first_name_ar = 'ولي', last_name_ar = $2,
             first_name_en = 'Guardian', last_name_en = $3,
             civil_id = $4, phone = $5
           WHERE id = $1`,
          [parent.user_id, `تجريبي${p}`, `Demo${p}`, civil, phone],
        );
      }
    }
  }
  report.anonymized = { students: students.length, parents: parents.length };
}

async function cloneRbac(client, fromSchoolId, toSchoolId, adminUserId) {
  const existing = (
    await client.query(`SELECT id, name, code FROM rbac_groups WHERE "schoolId" = $1`, [toSchoolId])
  ).rows;
  if (existing.length) {
    const map = new Map();
    for (const g of existing) {
      map.set(g.code, g.id);
      if (g.name === 'School Admin') map.set('school_admin', g.id);
      if (g.name === 'Teacher') map.set('teacher', g.id);
    }
    const adminGroup = map.get('school_admin');
    if (adminGroup && adminUserId) {
      await client.query(
        `INSERT INTO rbac_user_group_members ("userId", "groupId", "assignedAt")
         VALUES ($1,$2,NOW()) ON CONFLICT DO NOTHING`,
        [adminUserId, adminGroup],
      );
    }
    return map;
  }
  const groups = (
    await client.query(
      `SELECT id, name, code, "groupType", description, color, "clonedFromId"
         FROM rbac_groups WHERE "schoolId" = $1`,
      [fromSchoolId],
    )
  ).rows;
  const map = new Map();
  for (const g of groups) {
    const id = crypto.randomUUID();
    await client.query(
      `INSERT INTO rbac_groups (id, name, code, "groupType", description, "schoolId", color, "clonedFromId", "isSystem", "isActive", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false,true,NOW(),NOW())`,
      [id, g.name, g.code, g.groupType, g.description, toSchoolId, g.color, g.clonedFromId],
    );
    const perms = (
      await client.query(
        `SELECT "pageId", "actionId" FROM rbac_group_permissions WHERE "groupId" = $1`,
        [g.id],
      )
    ).rows;
    for (const perm of perms) {
      await client.query(
        `INSERT INTO rbac_group_permissions ("groupId", "pageId", "actionId") VALUES ($1,$2,$3)
         ON CONFLICT DO NOTHING`,
        [id, perm.pageId, perm.actionId],
      );
    }
    map.set(g.code, id);
    if (g.name === 'School Admin') map.set('school_admin', id);
    if (g.name === 'Teacher') map.set('teacher', id);
  }
  const adminGroup = map.get('school_admin') || map.get('School Admin');
  if (adminGroup && adminUserId) {
    await client.query(
      `INSERT INTO rbac_user_group_members ("userId", "groupId", "assignedAt")
       VALUES ($1,$2,NOW()) ON CONFLICT DO NOTHING`,
      [adminUserId, adminGroup],
    );
  }
  return map;
}

async function ensureStaff(client, { email, firstAr, lastAr, phone, schoolId, role, passwordHash, teacherGroupId }) {
  const existing = (
    await client.query(`SELECT id FROM users WHERE LOWER(email) = LOWER($1)`, [email])
  ).rows[0];
  const names = {
    first_name_ar: firstAr,
    last_name_ar: lastAr,
    first_name_en: transliterate(firstAr),
    last_name_en: transliterate(lastAr),
  };
  let id;
  if (existing) {
    id = existing.id;
    await client.query(
      `UPDATE users SET
         "firstName" = $2, "lastName" = $3,
         first_name_ar = $2, last_name_ar = $3,
         first_name_en = $4, last_name_en = $5,
         phone = COALESCE($6, phone),
         role = $7, user_type = 'staff', school_id = $8, "isActive" = true
       WHERE id = $1`,
      [id, names.first_name_ar, names.last_name_ar, names.first_name_en, names.last_name_en, phone || null, role, schoolId],
    );
  } else {
    id = crypto.randomUUID();
    const username = email.split('@')[0];
    await client.query(
      `INSERT INTO users (
         id, username, email, password, "firstName", "lastName",
         first_name_ar, first_name_en, last_name_ar, last_name_en,
         role, user_type, phone, school_id, "isActive", "createdAt", "updatedAt"
       ) VALUES ($1,$2,$3,$4,$5,$6,$5,$7,$6,$8,$9,'staff',$10,$11,true,NOW(),NOW())`,
      [
        id, username, email, passwordHash,
        names.first_name_ar, names.last_name_ar, names.first_name_en, names.last_name_en,
        role, phone || null, schoolId,
      ],
    );
  }
  await client.query(
    `INSERT INTO staff (id, user_id, school_id, created_at, updated_at)
     VALUES ($1,$2,$3,NOW(),NOW())
     ON CONFLICT (user_id, school_id) DO NOTHING`,
    [crypto.randomUUID(), id, schoolId],
  );
  if (teacherGroupId && role === 'teacher') {
    await client.query(
      `INSERT INTO rbac_user_group_members ("userId", "groupId", "assignedAt")
       VALUES ($1,$2,NOW()) ON CONFLICT DO NOTHING`,
      [id, teacherGroupId],
    );
  }
  return id;
}

async function upsertParent(client, { civilId, phone, relationship, familyAr, familyEn, passwordHash }) {
  const isMother = relationship === 'mother';
  const firstAr = isMother ? 'أم' : 'أب';
  const firstEn = isMother ? 'Mother' : 'Father';
  if (civilId) {
    const byCivil = (await client.query(`SELECT id, user_id FROM parents WHERE civil_id = $1`, [civilId])).rows[0];
    if (byCivil) return byCivil;
  }
  if (phone) {
    const byPhone = (await client.query(`SELECT id, user_id FROM parents WHERE phone = $1`, [phone])).rows[0];
    if (byPhone) {
      if (civilId) await client.query(`UPDATE parents SET civil_id = COALESCE(civil_id, $2) WHERE id = $1`, [byPhone.id, civilId]);
      return byPhone;
    }
  }
  const id = crypto.randomUUID();
  const local = civilId ? `parent_${civilId}` : `parent_${relationship}_${phone || crypto.randomUUID().slice(0, 8)}`;
  const email = `${local}@zinat-live.local`;
  const userId = crypto.randomUUID();
  await client.query(
    `INSERT INTO users (
       id, username, email, password, "firstName", "lastName",
       first_name_ar, first_name_en, last_name_ar, last_name_en,
       civil_id, role, user_type, phone, school_id, "isActive", "createdAt", "updatedAt"
     ) VALUES ($1,$2,$3,$4,$5,$6,$5,$7,$6,$8,$9,'parent','parent',$10,NULL,true,NOW(),NOW())`,
    [userId, local, email, passwordHash, firstAr, familyAr, firstEn, familyEn, civilId, phone || null],
  );
  await client.query(
    `INSERT INTO parents (
       id, "firstName", "lastName", first_name_ar, first_name_en, last_name_ar, last_name_en,
       email, phone, civil_id, address, user_id, school_id, "createdAt", "updatedAt", created_at, updated_at
     ) VALUES ($1,$2,$3,$2,$4,$3,$5,$6,$7,$8,'عمان',$9,NULL,NOW(),NOW(),NOW(),NOW())`,
    [id, firstAr, familyAr, firstEn, familyEn, email, phone || null, civilId, userId],
  );
  return { id, user_id: userId };
}

async function applyImport(client, data) {
  const report = {
    created: { students: 0, parents: 0, buses: 0, groups: 0, staff: 0 },
    assigned: 0,
    skipped: [],
    unmatchedBus: [],
    dualBus: [],
    missingCivil: [],
    jediaPlaceholder: true,
  };

  const demoSchoolId = await resolveDemoSchoolId(client);
  await anonymizeDemo(client, report, demoSchoolId);

  const demo = (
    await client.query(`SELECT * FROM schools WHERE id = $1`, [demoSchoolId])
  ).rows[0];
  if (!demo) throw new Error('Demo Zinat school not found');

  let live = (await client.query(`SELECT * FROM schools WHERE landing_slug = $1`, [LIVE_SLUG])).rows[0];
  const passwordHash = await bcrypt.hash(LIVE_ADMIN_PASSWORD, 12);
  const staffHash = await bcrypt.hash(STAFF_PASSWORD, 12);
  const parentHash = await bcrypt.hash(PARENT_PASSWORD, 12);

  if (!live) {
    const liveId = crypto.randomUUID();
    await client.query(
      `INSERT INTO schools (
         id, name, name_ar, name_en, address, phone, email, website, logo_url,
         description, status, landing_slug, created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'active',$11,NOW(),NOW())`,
      [
        liveId,
        demo.name,
        demo.name_ar,
        demo.name_en,
        demo.address,
        demo.phone,
        'live@zinatalhaykindergarten.com',
        demo.website,
        demo.logo_url,
        demo.description,
        LIVE_SLUG,
      ],
    );
    live = (await client.query(`SELECT * FROM schools WHERE id = $1`, [liveId])).rows[0];
  }

  const landing = (
    await client.query(
      `SELECT logo_url, brand_name_en, brand_name_ar, brand_primary_color, brand_accent_color, is_published
         FROM school_landing_pages WHERE school_id = $1`,
      [demoSchoolId],
    )
  ).rows[0];
  if (landing) {
    const existsLanding = (
      await client.query(`SELECT id FROM school_landing_pages WHERE school_id = $1`, [live.id])
    ).rows[0];
    if (!existsLanding) {
      await client.query(
        `INSERT INTO school_landing_pages (
           id, school_id, logo_url, brand_name_en, brand_name_ar,
           brand_primary_color, brand_accent_color, is_published, created_at, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
        [
          crypto.randomUUID(),
          live.id,
          landing.logo_url,
          landing.brand_name_en || demo.name_en,
          landing.brand_name_ar || demo.name_ar,
          landing.brand_primary_color,
          landing.brand_accent_color,
          landing.is_published,
        ],
      );
    }
  }

  let admin = (await client.query(`SELECT id FROM users WHERE LOWER(email) = LOWER($1)`, [LIVE_ADMIN_EMAIL])).rows[0];
  if (!admin) {
    const adminId = crypto.randomUUID();
    const username = LIVE_ADMIN_EMAIL.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '.') || 'zahra';
    await client.query(
      `INSERT INTO users (
         id, username, email, password, "firstName", "lastName",
         first_name_ar, first_name_en, last_name_ar, last_name_en,
         role, user_type, phone, school_id, "isActive", "createdAt", "updatedAt"
       ) VALUES ($1,$2,$3,$4,'زهرة','المديرة','زهرة','Zahra','المديرة','Administrator','admin','staff', $5, $6, true, NOW(), NOW())`,
      [adminId, username, LIVE_ADMIN_EMAIL, passwordHash, demo.phone || '90000000', live.id],
    );
    admin = { id: adminId };
  } else {
    await client.query(
      `UPDATE users SET school_id = $2, role = 'admin', user_type = 'staff', "isActive" = true WHERE id = $1`,
      [admin.id, live.id],
    );
    await client.query(
      `INSERT INTO staff (id, user_id, school_id, created_at, updated_at)
       VALUES ($1,$2,$3,NOW(),NOW()) ON CONFLICT (user_id, school_id) DO NOTHING`,
      [crypto.randomUUID(), admin.id, demoSchoolId],
    );
  }
  await client.query(
    `INSERT INTO staff (id, user_id, school_id, created_at, updated_at)
     VALUES ($1,$2,$3,NOW(),NOW()) ON CONFLICT (user_id, school_id) DO NOTHING`,
    [crypto.randomUUID(), admin.id, live.id],
  );

  const rbac = await cloneRbac(client, demoSchoolId, live.id, admin.id);
  const teacherGroupId = rbac.get('teacher');

  let year = (
    await client.query(`SELECT id FROM academic_years WHERE school_id = $1 AND year = '2026/2027'`, [live.id])
  ).rows[0];
  if (!year) {
    const yearId = crypto.randomUUID();
    await client.query(
      `INSERT INTO academic_years (id, year, start_date, end_date, is_active, school_id, created_at, updated_at)
       VALUES ($1,'2026/2027','2026-09-01','2027-06-30',true,$2,NOW(),NOW())`,
      [yearId, live.id],
    );
    year = { id: yearId };
    await client.query(
      `INSERT INTO semesters (id, title, start_date, end_date, academic_year_id, is_active, created_at, updated_at)
       VALUES ($1,'الفصل الأول','2026-09-01','2027-01-31',$2,true,NOW(),NOW())`,
      [crypto.randomUUID(), yearId],
    );
  }

  async function ensureLevel(code, name, sort) {
    const row = (
      await client.query(`SELECT id FROM school_payment_levels WHERE school_id = $1 AND code = $2`, [live.id, code])
    ).rows[0];
    if (row) return row.id;
    const id = crypto.randomUUID();
    await client.query(
      `INSERT INTO school_payment_levels (id, school_id, code, name, sort_order, is_active, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,true,NOW(),NOW())`,
      [id, live.id, code, name, sort],
    );
    return id;
  }
  const levelTamhidi = await ensureLevel('TAMHIDI', 'تمهيدي', 1);
  const levelRawda = await ensureLevel('RAWDA', 'روضة', 2);

  const groupIds = new Map();
  for (const name of CLASS_SHEETS) {
    let g = (await client.query(`SELECT id FROM groups WHERE school_id = $1 AND name = $2`, [live.id, name])).rows[0];
    const teacherName = GROUP_TEACHERS[name];
    let supervisorId = null;
    if (teacherName) {
      supervisorId = await ensureStaff(client, {
        email: `${transliterate(teacherName).toLowerCase().replace(/\s+/g, '.')}@zinat-live.local`,
        firstAr: teacherName,
        lastAr: 'معلمة',
        phone: null,
        schoolId: live.id,
        role: 'teacher',
        passwordHash: staffHash,
        teacherGroupId,
      });
      report.created.staff += 1;
    }
    const mostlyRawda = ['رواد نور الدين السالمي', 'درر الفراهيدي', 'رياحين هند بنت المهلب'].includes(name);
    const levelId = mostlyRawda ? levelRawda : levelTamhidi;
    if (!g) {
      const id = crypto.randomUUID();
      await client.query(
        `INSERT INTO groups (id, name, description, capacity, is_active, status, "studentCount", "teacherCount", school_id, academic_year_id, level_id, supervisor_id, created_at, updated_at)
         VALUES ($1,$2,$3,30,true,'active',0,$4,$5,$6,$7,$8,NOW(),NOW())`,
        [id, name, name, supervisorId ? 1 : 0, live.id, year.id, levelId, supervisorId],
      );
      g = { id };
      report.created.groups += 1;
    }
    groupIds.set(name, g.id);
  }

  const staffByName = new Map();
  async function staffFor(name, phone, kind) {
    if (!name || name === '-') return null;
    if (staffByName.has(name)) return staffByName.get(name);
    const slug = transliterate(name).toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '') || 'staff';
    const id = await ensureStaff(client, {
      email: `${kind}.${slug}@zinat-live.local`,
      firstAr: name.split(/\s+/)[0],
      lastAr: name.split(/\s+/).slice(1).join(' ') || name,
      phone,
      schoolId: live.id,
      role: 'teacher',
      passwordHash: staffHash,
      teacherGroupId,
    });
    staffByName.set(name, id);
    report.created.staff += 1;
    return id;
  }

  const busIds = new Map();
  for (const bus of FLEET) {
    const title = busTitle(bus);
    let row = (await client.query(`SELECT id FROM buses WHERE school_id = $1 AND title = $2`, [live.id, title])).rows[0];
    const driverId = await staffFor(bus.driver, bus.driverPhone, 'driver');
    const supervisorId = bus.supervisor ? await staffFor(bus.supervisor, bus.supervisorPhone, 'supervisor') : null;
    if (!row) {
      const id = crypto.randomUUID();
      await client.query(
        `INSERT INTO buses (id, title, driver_name, capacity, driver_contacts, driver_user_id, supervisor_user_id, school_id, is_active, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,NOW(),NOW())`,
        [id, title, bus.driver, bus.capacity, bus.driverPhone || null, driverId, supervisorId, live.id],
      );
      row = { id };
      report.created.buses += 1;
    }
    busIds.set(bus.key, row.id);
  }

  const existingByCivil = new Map();
  const existingByNorm = new Map();
  for (const s of data.students) {
    if (!s.groupName && data.classByNorm.has(s.norm)) s.groupName = data.classByNorm.get(s.norm);
    if (!s.groupName) {
      const g = CLASS_SHEETS.find((n) => false);
      void g;
    }
    const groupId = s.groupName ? groupIds.get(s.groupName) : null;
    if (!groupId) {
      report.skipped.push({ name: s.fullName, reason: 'no class group' });
    }
    const levelId = s.stage === 'روضة' ? levelRawda : levelTamhidi;
    const firstEn = transliterate(s.first);
    const lastEn = transliterate(s.last);
    if (!s.civilId) report.missingCivil.push(s.fullName);

    let student = s.civilId
      ? (await client.query(`SELECT id FROM students WHERE school_id = $1 AND "studentId" = $2`, [live.id, s.civilId])).rows[0]
      : (await client.query(
          `SELECT id FROM students WHERE school_id = $1 AND first_name_ar = $2 AND last_name_ar = $3 AND "dateOfBirth" = $4`,
          [live.id, s.first, s.last, s.dob || '2019-01-01'],
        )).rows[0];

    const dob = s.dob || '2019-01-01';
    if (!student) {
      const id = crypto.randomUUID();
      await client.query(
        `INSERT INTO students (
           id, "firstName", "lastName", first_name_ar, first_name_en, last_name_ar, last_name_en,
           "secondName", "thirdName", "dateOfBirth", gender, address, phone,
           "emergencyContact", nationality, "studentId", notes, school_id, payment_level_id,
           "createdAt", "updatedAt", created_at, updated_at
         ) VALUES (
           $1,$2,$3,$2,$4,$3,$5,$6,$7,$8,$9,$10,$11,$12,'عماني',$13,$14,$15,$16,
           NOW(),NOW(),NOW(),NOW()
         )`,
        [
          id, s.first, s.last, firstEn, lastEn,
          s.second, s.third, dob, s.gender, s.area || '-',
          s.fatherPhone || s.motherPhone || null,
          s.fatherPhone || s.motherPhone || '—',
          s.civilId, null, live.id, levelId,
        ],
      );
      student = { id };
      report.created.students += 1;
    }
    if (groupId) {
      await client.query(
        `INSERT INTO student_groups (student_id, group_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [student.id, groupId],
      );
    }
    existingByCivil.set(s.civilId || '', student.id);
    existingByNorm.set(s.norm, student.id);
    const parts = s.norm.split(' ').filter(Boolean);
    if (parts.length) existingByNorm.set(`${parts[0]}|${parts[parts.length - 1]}`, student.id);

    const familyAr = s.last;
    const familyEn = lastEn;
    if (s.fatherCivilId || s.fatherPhone) {
      const father = await upsertParent(client, {
        civilId: s.fatherCivilId,
        phone: s.fatherPhone,
        relationship: 'father',
        familyAr,
        familyEn,
        passwordHash: parentHash,
      });
      await client.query(
        `INSERT INTO student_parents (student_id, parent_id, relationship) VALUES ($1,$2,'father')
         ON CONFLICT (student_id, parent_id) DO UPDATE SET relationship = 'father'`,
        [student.id, father.id],
      );
      report.created.parents += 1;
    }
    if (s.motherCivilId || s.motherPhone) {
      const mother = await upsertParent(client, {
        civilId: s.motherCivilId,
        phone: s.motherPhone,
        relationship: 'mother',
        familyAr,
        familyEn,
        passwordHash: parentHash,
      });
      await client.query(
        `INSERT INTO student_parents (student_id, parent_id, relationship) VALUES ($1,$2,'mother')
         ON CONFLICT (student_id, parent_id) DO UPDATE SET relationship = 'mother'`,
        [student.id, mother.id],
      );
      report.created.parents += 1;
    }
  }

  const assigned = new Set();
  for (const a of data.wordAssignments) {
    const aParts = a.norm.split(' ').filter(Boolean);
    const studentId =
      existingByNorm.get(a.norm) ||
      (aParts.length ? existingByNorm.get(`${aParts[0]}|${aParts[aParts.length - 1]}`) : null);
    if (!studentId) {
      report.unmatchedBus.push({ name: a.fullName, vehicle: a.vehicle });
      continue;
    }
    if (/حافلتين/.test(a.notes || '')) report.dualBus.push(a.fullName);
    if (assigned.has(studentId)) {
      await client.query(
        `UPDATE students SET notes = CONCAT(COALESCE(notes,''), $2::text) WHERE id = $1`,
        [studentId, ` | also ${a.vehicle}`],
      );
      continue;
    }
    if (!a.busKey || !busIds.get(a.busKey)) {
      await client.query(
        `UPDATE students SET notes = CONCAT(COALESCE(notes,''), $2::text) WHERE id = $1`,
        [studentId, a.vehicle ? ` | ${a.vehicle}` : ''],
      );
      continue;
    }
    await client.query(`DELETE FROM student_buses WHERE student_id = $1`, [studentId]);
    await client.query(`INSERT INTO student_buses (student_id, bus_id) VALUES ($1,$2)`, [
      studentId,
      busIds.get(a.busKey),
    ]);
    if (a.notes) {
      await client.query(`UPDATE students SET notes = $2 WHERE id = $1`, [studentId, a.notes]);
    }
    assigned.add(studentId);
    report.assigned += 1;
  }

  for (const a of data.excelBusAssignments) {
    const studentId = existingByNorm.get(a.norm);
    if (!studentId || assigned.has(studentId)) continue;
    const busId = busIds.get(a.busKey);
    if (!busId) continue;
    await client.query(`DELETE FROM student_buses WHERE student_id = $1`, [studentId]);
    await client.query(`INSERT INTO student_buses (student_id, bus_id) VALUES ($1,$2)`, [studentId, busId]);
    assigned.add(studentId);
    report.assigned += 1;
  }

  report.liveSchoolId = live.id;
  report.liveSlug = LIVE_SLUG;
  report.liveAdmin = LIVE_ADMIN_EMAIL;
  return report;
}

function printInventory(data) {
  console.log('\n=== Source inventory ===');
  console.log(`Roster students: ${data.students.length}`);
  console.log(`  with civil ID: ${data.students.filter((s) => s.civilId).length}`);
  console.log(`  with group: ${data.students.filter((s) => s.groupName).length}`);
  console.log(`  روضة: ${data.students.filter((s) => s.stage === 'روضة').length}`);
  console.log(`  تمهيدي: ${data.students.filter((s) => s.stage === 'تمهيدي').length}`);
  const byGroup = {};
  for (const s of data.students) {
    const g = s.groupName || '(none)';
    byGroup[g] = (byGroup[g] || 0) + 1;
  }
  console.log('  by class:', byGroup);
  console.log(`Word assignments: ${data.wordAssignments.length}`);
  const byBus = {};
  for (const a of data.wordAssignments) {
    const k = a.busKey || a.vehicle || '(none)';
    byBus[k] = (byBus[k] || 0) + 1;
  }
  console.log('  by bus:', byBus);
  console.log(`Excel bus rows: ${data.excelBusAssignments.length}`);
  console.log(`Word class hints: ${data.classByNorm.size}`);
}

async function main() {
  if (!fs.existsSync(ROSTER_XLSX) || !fs.existsSync(BUSES_XLSX) || !fs.existsSync(TRANSPORT_DOCX)) {
    throw new Error('One or more source files are missing in Downloads');
  }
  const roster = parseRoster();
  const excelBusAssignments = parseBusExcel();
  const doc = parseTransportDoc();
  for (const s of roster.students) {
    if (!s.groupName && doc.classByNorm.has(s.norm)) s.groupName = doc.classByNorm.get(s.norm);
  }
  const data = {
    students: roster.students,
    wordAssignments: doc.assignments,
    excelBusAssignments,
    classByNorm: doc.classByNorm,
  };
  printInventory(data);

  if (!APPLY) {
    console.log('\nDry-run only. Re-run with --apply to write the demo anonymize + live school import.');
    return;
  }

  const client = dbClient();
  await client.connect();
  try {
    await client.query('BEGIN');
    const report = await applyImport(client, data);
    await client.query('COMMIT');
    console.log('\n=== Apply report ===');
    console.log(JSON.stringify(report, null, 2));
    console.log(`\nLive school slug: /s/${LIVE_SLUG}`);
    console.log(`Live admin: ${LIVE_ADMIN_EMAIL} / ${LIVE_ADMIN_PASSWORD}`);
    console.log(`Parent / driver password: ${PARENT_PASSWORD}`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

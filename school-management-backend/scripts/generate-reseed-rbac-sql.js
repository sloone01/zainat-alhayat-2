const fs = require('fs');
const { randomUUID } = require('crypto');

const src = fs.readFileSync(
  require('path').join(__dirname, '../src/rbac/rbac-catalog.seed.ts'),
  'utf8',
);

const actions = [
  ...src.matchAll(/\{ code: '([^']+)', name: '([^']+)', sortOrder: (\d+) \}/g),
].map((m) => ({ code: m[1], name: m[2], sortOrder: +m[3] }));

const pageBlock = src.slice(
  src.indexOf('export const RBAC_PAGE_SEED'),
  src.indexOf('];', src.indexOf('export const RBAC_PAGE_SEED')) + 1,
);

const pages = [];
const re =
  /\{ key: '([^']+)', route: '([^']+)', nameEn: '([^']*)', nameAr: '([^']*)', scope: '([^']+)', sortOrder: (\d+), actions: \[([^\]]*)\]/g;
let m;
while ((m = re.exec(pageBlock))) {
  const raw = m[7];
  const list = [];
  if (raw.includes('...CRUD')) list.push('view', 'search', 'create', 'edit', 'delete');
  if (raw.includes('...VIEW_SEARCH')) list.push('view', 'search');
  if (raw.includes('...VIEW_EDIT')) list.push('view', 'search', 'edit');
  raw.replace(/'([^']+)'/g, (_, c) => {
    list.push(c);
    return _;
  });
  pages.push({
    key: m[1],
    route: m[2],
    nameEn: m[3],
    nameAr: m[4],
    scope: m[5],
    sortOrder: +m[6],
    actions: [...new Set(list)],
  });
}

function esc(s) {
  return String(s).replace(/'/g, "''");
}

let sql = 'BEGIN;\n';
for (const a of actions) {
  sql += `INSERT INTO rbac_actions (code,name,"sortOrder") VALUES ('${esc(a.code)}','${esc(a.name)}',${a.sortOrder}) ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, "sortOrder"=EXCLUDED."sortOrder";\n`;
}
for (const p of pages) {
  sql += `INSERT INTO rbac_pages (key,route,"nameEn","nameAr",scope,"sortOrder","isActive") VALUES ('${esc(p.key)}','${esc(p.route)}','${esc(p.nameEn)}','${esc(p.nameAr)}','${esc(p.scope)}',${p.sortOrder},true) ON CONFLICT (key) DO UPDATE SET route=EXCLUDED.route,"nameEn"=EXCLUDED."nameEn","nameAr"=EXCLUDED."nameAr",scope=EXCLUDED.scope,"sortOrder"=EXCLUDED."sortOrder","isActive"=true;\n`;
}

const vals = [];
for (const p of pages) {
  for (const c of p.actions) vals.push(`('${esc(p.key)}','${esc(c)}')`);
}
sql += `
INSERT INTO rbac_page_actions ("pageId","actionId")
SELECT p.id, a.id
FROM rbac_pages p
JOIN (VALUES
${vals.join(',\n')}
) AS v(page_key, action_code) ON p.key=v.page_key
JOIN rbac_actions a ON a.code=v.action_code
ON CONFLICT DO NOTHING;
`;

const groups = [
  ['super_admin', 'Super Admin', 'super_admin', 'system', 'Full platform access', '#7c3aed'],
  ['school_manager', 'School Manager', 'school_manager', 'system', 'Manage schools', '#2563eb'],
  ['payment_manager', 'Payment Manager', 'payment_manager', 'system', 'Manage payments', '#059669'],
  [
    'school_admin_template',
    'School Admin (template)',
    'school_admin_template',
    'staff',
    'Default full school admin',
    '#0f766e',
  ],
  [
    'teacher_template',
    'Teacher (template)',
    'teacher_template',
    'staff',
    'Default teacher access',
    '#059669',
  ],
];
for (const g of groups) {
  sql += `INSERT INTO rbac_groups (id,name,code,"groupType",description,"schoolId","isSystem","systemKey",color,"isActive") SELECT '${randomUUID()}','${esc(g[1])}','${esc(g[2])}','${esc(g[3])}','${esc(g[4])}',NULL,true,'${esc(g[0])}','${esc(g[5])}',true WHERE NOT EXISTS (SELECT 1 FROM rbac_groups WHERE "systemKey"='${esc(g[0])}');\n`;
}

sql += `
INSERT INTO rbac_group_permissions ("groupId","pageId","actionId")
SELECT g.id, pa."pageId", pa."actionId"
FROM rbac_groups g
JOIN rbac_pages p ON p.scope IN ('school','both')
JOIN rbac_page_actions pa ON pa."pageId"=p.id
WHERE g."systemKey"='school_admin_template'
ON CONFLICT DO NOTHING;

INSERT INTO rbac_group_permissions ("groupId","pageId","actionId")
SELECT g.id, pa."pageId", pa."actionId"
FROM rbac_groups g
JOIN rbac_pages p ON p.key IN (
  'dashboard','mobile_dashboard','groups','students','courses','course_enrollments','graded_courses',
  'schedules','attendance','attendance_sessions','progress','activities','chat','messages',
  'weekly_session_plans','teacher_weekly_sessions','teacher_schedule','teacher_graded_tasks',
  'teacher_graded_marks','my_meeting_rooms'
)
JOIN rbac_page_actions pa ON pa."pageId"=p.id
JOIN rbac_actions a ON a.id=pa."actionId" AND a.code <> 'manage'
WHERE g."systemKey"='teacher_template'
ON CONFLICT DO NOTHING;

INSERT INTO rbac_group_permissions ("groupId","pageId","actionId")
SELECT g.id, pa."pageId", pa."actionId"
FROM rbac_groups g CROSS JOIN rbac_page_actions pa
WHERE g."systemKey"='super_admin'
ON CONFLICT DO NOTHING;

COMMIT;
`;

const out = '/tmp/reseed_rbac.sql';
fs.writeFileSync(out, sql);
console.log(`actions=${actions.length} pages=${pages.length} wrote ${out} (${sql.length} bytes)`);

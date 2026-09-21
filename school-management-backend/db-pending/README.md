# Pending data-model cleanup migrations (NOT active)

These two migrations are parked here on purpose: files in `src/migrations/` run automatically on the
next deploy, and these change live parent/student data, so they must be checked first.

| File | What it does |
|---|---|
| `1792560000000-ParentIdentitySingleSource.ts` | Snapshots `parents` + parent `users`, creates the 4 missing parent profiles, logs every conflicting value in `parent_identity_conflicts` (users wins), copies the login's identity onto the profile, adds a trigger so `users` -> `parents` stays in sync, adds unique guards (only if the data allows) |
| `1792570000000-DropLegacyDuplicateColumns.ts` | Snapshots `students` + `parents`, drops the unused `students.first_name/family_name/date_of_birth/medical_conditions/allergies/emergency_contact` and `parents.school_id` |

The application code already stopped using those columns, so it works with or without these migrations.

## Check on a copy of the database (rolls back, changes nothing)

```bash
cd school-management-backend
npx tsc --outDir _mig_tmp --module commonjs --target es2020 --skipLibCheck --experimentalDecorators --emitDecoratorMetadata db-pending/*.ts
node db-pending/dry-run.js          # prints before/after numbers, then ROLLS BACK
```

Expected on the production copy: parent profiles go from 519 to 523 (the 4 missing ones), no parent login without a
profile, 0 linked mismatches, both unique indexes created, no dropped column left, and "trigger: parent phone follows login" shows 99999999.

## Activate

1. Run the dry run above and read the numbers.
2. Move both files into `src/migrations/`. They apply on the next deploy (backend start runs pending migrations).
3. Rollback: `down()` removes the trigger and indexes and re-adds the dropped columns (empty); the old values are in the `bak_20260921_*` tables.

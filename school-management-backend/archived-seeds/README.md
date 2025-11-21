# 📦 Archived Seed Data

## ⚠️ Important Notice

**All seed files have been archived to prevent contamination of production data.**

## 🗂️ What's Archived Here

This directory contains all the original seed files that were creating sample data:

- `seed.ts.backup` - Original comprehensive seeding
- `simple-seed.ts` - Simple seeding script  
- `excel-seed.ts` - Excel import seeding
- `run-seed.ts` - Seed runner script
- `run-seeds.ts` - Database seeds runner

## 🚫 Why Seeding Was Disabled

The seed files were automatically inserting sample data including:

- **Sample Courses**: Language Development, Math Fundamentals, etc.
- **Sample Users**: admin, teacher1, parent1 accounts
- **Sample Schools**: Test kindergarten data
- **Sample Schedules**: Fake class schedules
- **Sample Groups**: Test student groups

This sample data was appearing in production, showing fake courses and schedules to real users.

## 🔧 How to Re-enable (Development Only)

If you need seeding for development:

1. Copy files back to `src/seeds/`
2. Update `package.json` to restore `db:seed` command
3. **NEVER run seeding on production database**

## 🧹 Production Cleanup

To clean existing sample data from production:

```sql
-- Run the production-database-cleanup.sql script
```

## 📋 Current Status

- ✅ Seeding disabled in production
- ✅ Sample data archived safely  
- ✅ Production database will show only real data
- ✅ No more fake courses/schedules appearing

## 🔒 Security Note

**Never re-enable automatic seeding in production environments.**
Sample data should only exist in development/testing environments.

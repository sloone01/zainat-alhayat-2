# 🛡️ Change Protocol - Preventing Login Breakage

## ⚠️ **CRITICAL RULE: Always Test Before & After Changes**

### **Before Making ANY Changes:**
1. Run `./test-critical-functions.sh` to verify current state
2. If tests fail, fix existing issues BEFORE making new changes
3. Document what you're about to change and why

### **During Changes:**
1. **Make incremental changes** - one small change at a time
2. **Test after each change** - don't accumulate multiple changes
3. **Avoid touching shared services** unless absolutely necessary
4. **Never modify auth.service.ts, api.ts, or login components** unless specifically requested

### **After Changes:**
1. Run `./test-critical-functions.sh` again
2. If tests fail, immediately revert the last change
3. Test the specific feature you were working on
4. Verify frontend loads correctly at http://localhost:5173

## 🚫 **High-Risk Areas to Avoid:**

### **Never Touch Unless Specifically Asked:**
- `src/services/auth.service.ts` - Authentication logic
- `src/services/api.ts` - Base API service
- `src/views/LoginView.vue` - Login page
- `src/layouts/DashboardLayout.vue` - Main layout (unless for specific layout changes)
- Backend authentication middleware
- Database connection settings

### **Safe Areas for Changes:**
- Individual page components (except LoginView)
- Styling/CSS (but test after changes)
- New features that don't touch existing auth
- UI improvements that don't affect core functionality

## 🔧 **Safe Change Practices:**

### **1. Isolated Changes:**
- Work on one component at a time
- Don't modify multiple files simultaneously
- Keep changes focused and minimal

### **2. Backup Strategy:**
- Before major changes, create a backup:
  ```bash
  git add . && git commit -m "Backup before changes"
  ```

### **3. Rollback Plan:**
- If something breaks, immediately revert:
  ```bash
  git checkout HEAD~1 -- path/to/file
  ```

### **4. Testing Frequency:**
- Test after every 2-3 small changes
- Test immediately after touching any shared service
- Test before declaring work complete

## 🎯 **Specific Guidelines:**

### **For UI/Styling Changes:**
1. Only modify Tailwind classes in templates
2. Avoid changing component logic
3. Test in browser after each change

### **For Backend Changes:**
1. Never modify auth routes unless specifically requested
2. Test API endpoints with curl after changes
3. Check backend logs for errors

### **For New Features:**
1. Create new files instead of modifying existing ones when possible
2. Import existing services, don't modify them
3. Test integration with existing auth system

## 🚨 **Emergency Recovery:**

If login breaks:
1. **Stop immediately** - don't make more changes
2. **Check backend logs** for errors
3. **Revert last change** using git
4. **Run test script** to verify recovery
5. **Identify root cause** before proceeding

## ✅ **Success Metrics:**

A change is successful when:
- `./test-critical-functions.sh` passes
- Frontend loads without console errors
- Login works in browser
- The specific feature you worked on functions correctly
- No regression in existing functionality

# 🤝 Contributing to MBOA Command

Thank you for your interest in contributing to MBOA Command!

---

## 📝 **IMPORTANT: Change Tracking Policy**

**Every modification MUST be documented in `HISTORY.md`**

### Required Steps for ALL Changes:

1. **Make your code changes**
2. **Update HISTORY.md** with a new entry at the TOP
3. **Commit both together**
4. **Push to GitHub**

---

## 📋 How to Document Changes in HISTORY.md

### 1. Open HISTORY.md

### 2. Add Entry at the TOP of "Chronological History"

Use this template:

```markdown
#### HH:MM AM/PM - Commit `HASH`
**Author:** PAUL  
**Type:** [Feature/Bug Fix/Documentation/Refactor/Performance]  
**Message:** [Brief description of what you did]

**Changes:**
- ✅ [Detailed change 1]
- ✅ [Detailed change 2]
- ✅ [Detailed change 3]

**Files Modified:**
- `path/to/file1.ext`
- `path/to/file2.ext`

---
```

### 3. Example Entry

```markdown
#### 03:45 PM - Commit `a1b2c3d`
**Author:** PAUL  
**Type:** Feature  
**Message:** Add real-time order tracking with maps

**Changes:**
- ✅ Integrated Google Maps API
- ✅ Created real-time tracking component
- ✅ Added WebSocket connection for live updates
- ✅ Updated order status UI with map view

**Files Modified:**
- `frontend/src/components/OrderTracking.tsx`
- `frontend/src/services/maps.ts`
- `backend/routes/orders.js`
- `backend/services/websocket.js`

---
```

---

## 🔄 Git Workflow

### Standard Commit Process

```bash
# 1. Make your changes
# 2. Update HISTORY.md with new entry
# 3. Stage all changes
git add .

# 4. Commit with descriptive message
git commit -m "type: brief description"

# 5. Push to GitHub
git push origin master

# 6. Get the commit hash
git log -1 --pretty=format:"%h"

# 7. Update HISTORY.md with the commit hash
# 8. Commit and push the hash update
git add HISTORY.md
git commit -m "docs: add commit hash to latest HISTORY entry"
git push origin master
```

### Commit Message Format

```
type: brief description

Examples:
- feat: add payment integration
- fix: resolve login authentication bug
- docs: update API documentation
- refactor: optimize database queries
- perf: improve image loading speed
- style: update UI colors and spacing
```

---

## 📂 Project Structure

```
mboa-command/
├── frontend/          # React + TypeScript
├── backend/           # Express.js API
├── HISTORY.md         # ⭐ MUST UPDATE THIS
├── CHANGELOG.md       # Version history
├── README.md          # Project documentation
└── STATUS.md          # Current system status
```

---

## ✅ Checklist Before Committing

- [ ] Code changes completed and tested
- [ ] HISTORY.md updated with new entry at TOP
- [ ] Entry includes: date, time, author, type, message, changes, files
- [ ] All modified files listed in HISTORY.md
- [ ] Commit message follows format: `type: description`
- [ ] Code follows existing style and conventions
- [ ] No console.log or debug code left behind
- [ ] Tests pass (if applicable)

---

## 🚫 What NOT to Do

❌ **DO NOT** commit without updating HISTORY.md  
❌ **DO NOT** add entries to the bottom (always TOP)  
❌ **DO NOT** use vague descriptions ("fixed stuff", "updates")  
❌ **DO NOT** forget to list modified files  
❌ **DO NOT** commit broken code  

---

## 📊 Types of Changes

| Type | When to Use | Example |
|------|-------------|---------|
| **feat** | New feature | Add payment gateway |
| **fix** | Bug fix | Fix login error |
| **docs** | Documentation | Update README |
| **refactor** | Code restructure | Optimize queries |
| **perf** | Performance | Improve load time |
| **style** | UI/CSS changes | Update colors |
| **test** | Add tests | Add unit tests |
| **chore** | Maintenance | Update dependencies |

---

## 🎯 Best Practices

### 1. **Be Specific**
❌ Bad: "Updated some files"  
✅ Good: "Added Mobile Money payment integration with Orange Money API"

### 2. **List All Files**
Always include the complete list of modified files

### 3. **Use Checkmarks**
Use ✅ for completed changes in the Changes section

### 4. **Keep It Chronological**
Always add new entries at the TOP, newest first

### 5. **Include Context**
Explain WHY the change was made, not just WHAT changed

---

## 📞 Questions?

If you're unsure about how to document a change:
1. Look at recent entries in HISTORY.md for examples
2. Follow the template provided above
3. Ask for clarification before committing

---

## 🎉 Thank You!

Your contributions help make MBOA Command better for everyone. By following these guidelines, you help maintain a clear and complete project history.

**Remember: Every change matters, and every change should be documented!** 📝

---

**Last Updated:** May 12, 2026  
**Maintained by:** PAUL

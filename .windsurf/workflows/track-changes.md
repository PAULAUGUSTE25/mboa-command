---
description: Automatically track and document all code modifications in HISTORY.md
---

# 📝 Workflow: Track Changes

**Purpose:** Automatically document every modification made to the project in HISTORY.md

## When to Use
- After making ANY code change
- After fixing a bug
- After adding a feature
- After updating documentation
- Before committing to Git

## Steps

### 1. Make Your Changes
Edit files as needed for your feature/fix/update

### 2. Document the Change in HISTORY.md
// turbo
Add a new entry at the TOP of the "Chronological History" section with:
- Current date and time
- Commit hash (will be added after commit)
- Author: PAUL
- Type: Feature / Bug Fix / Documentation / Refactor
- Message: Brief description
- Changes: Detailed list of what was modified
- Files Modified: List of affected files

### 3. Commit and Push
// turbo
```bash
git add .
git commit -m "type: brief description"
git push origin master
```

### 4. Update HISTORY.md with Commit Hash
After pushing, get the commit hash and update the entry in HISTORY.md

## Template for New Entry

```markdown
#### HH:MM AM/PM - Commit `HASH`
**Author:** PAUL  
**Type:** [Feature/Bug Fix/Documentation/Refactor]  
**Message:** [Brief description]

**Changes:**
- ✅ [Change 1]
- ✅ [Change 2]
- ✅ [Change 3]

**Files Modified:**
- `path/to/file1.ext`
- `path/to/file2.ext`

---
```

## Example Entry

```markdown
#### 02:30 PM - Commit `abc1234`
**Author:** PAUL  
**Type:** Feature  
**Message:** Add payment integration with Mobile Money

**Changes:**
- ✅ Implemented Mobile Money API integration
- ✅ Added payment processing routes
- ✅ Created payment confirmation page
- ✅ Updated order flow to include payment step

**Files Modified:**
- `backend/routes/payments.js`
- `backend/services/mobileMoney.js`
- `frontend/src/pages/PaymentPage.tsx`
- `frontend/src/contexts/OrderContext.tsx`

---
```

## Important Notes

1. **Always add entries at the TOP** of the chronological history
2. **Use the current date and time** (format: YYYY-MM-DD HH:MM AM/PM)
3. **Be specific** about what changed and why
4. **List all modified files** for traceability
5. **Commit HISTORY.md** along with your changes

## Automation Reminder

Every time you make a change:
1. ✅ Code the feature/fix
2. ✅ Update HISTORY.md
3. ✅ Commit everything together
4. ✅ Push to GitHub

This ensures **complete traceability** of all project modifications! 📊

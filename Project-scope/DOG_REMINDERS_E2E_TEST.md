# Dog Reminders E2E Test

**Status:** Manual Test  
**Date:** November 15, 2025  
**Purpose:** Validate full-stack ShepThon integration (C4.3 from TTD)

---

## Test Scenario

Verify that:
1. ShepThon backend loads correctly
2. ShepLang frontend connects to backend
3. Data flows between frontend and backend
4. UI updates with backend responses

---

## Prerequisites

- ShepYard IDE running (`cd shepyard && pnpm run dev`)
- Both dog-reminders files available:
  - `examples/dog-reminders.shepthon` (backend)
  - `examples/dog-reminders.shep` (frontend)

---

## Test Steps

### Step 1: Load ShepThon Backend
1. Open ShepYard in browser (`http://localhost:3000`)
2. Navigate to Files panel
3. Select "Dog Reminders (Backend)" from examples
4. Verify backend panel shows:
   - App name: "DogReminders"
   - 1 model: Reminder
   - 2 endpoints: GET /reminders, POST /reminders
   - 1 job: mark-due-as-done

**Expected:** Backend loads without errors, panel displays structure.

**Result:** ⬜ PASS / ⬜ FAIL

---

### Step 2: View Explain Tab
1. Click "📋 Explain" tab in backend panel
2. Read plain English summary

**Expected:** 
- "Your app is called DogReminders"
- Describes models, endpoints, jobs in plain language
- No technical jargon

**Result:** ⬜ PASS / ⬜ FAIL

---

### Step 3: Load ShepLang Frontend
1. Navigate to Files panel
2. Select "Dog Reminders (Frontend)" from examples
3. Editor shows ShepLang code with `call` and `load` statements

**Expected:** Frontend code loads, no parser errors.

**Result:** ⬜ PASS / ⬜ FAIL

---

### Step 4: Test GET Endpoint (Read Data)
1. Open browser console (F12)
2. In console, test backend directly:
   ```javascript
   // Get ShepThon service
   const { callShepThonEndpoint } = await import('./services/bridgeService.js');
   
   // Call GET endpoint
   const reminders = await callShepThonEndpoint('GET', '/reminders');
   console.log('Reminders:', reminders);
   ```

**Expected:** 
- Returns array (empty initially): `[]`
- No errors in console

**Result:** ⬜ PASS / ⬜ FAIL

---

### Step 5: Test POST Endpoint (Create Data)
1. In browser console, create a reminder:
   ```javascript
   const { callShepThonEndpoint } = await import('./services/bridgeService.js');
   
   // Create reminder
   const newReminder = await callShepThonEndpoint('POST', '/reminders', {
     text: 'Walk the dog',
     time: new Date().toISOString()
   });
   console.log('Created:', newReminder);
   ```

**Expected:**
- Returns created reminder object with id
- Has fields: id, text, time, done=false

**Result:** ⬜ PASS / ⬜ FAIL

---

### Step 6: Verify Data Persists
1. Call GET endpoint again:
   ```javascript
   const reminders = await callShepThonEndpoint('GET', '/reminders');
   console.log('All reminders:', reminders);
   ```

**Expected:**
- Returns array with 1 reminder
- Matches the created reminder from Step 5

**Result:** ⬜ PASS / ⬜ FAIL

---

### Step 7: Test Job Scheduler (Optional)
1. Check backend panel Jobs tab
2. If jobs are running, wait 5 minutes
3. Check console logs for job execution

**Expected:**
- Job "mark-due-as-done" executes every 5 minutes
- Console shows job activity

**Result:** ⬜ PASS / ⬜ FAIL / ⬜ SKIPPED

---

### Step 8: Test Multiple Records
1. Create 3 more reminders via POST
2. Call GET to retrieve all
3. Verify all 4 reminders returned

**Expected:**
- 4 reminders in database
- Each has unique id

**Result:** ⬜ PASS / ⬜ FAIL

---

## Success Criteria

**Minimum (All Must Pass):**
- ✅ Step 1: Backend loads
- ✅ Step 2: Explain view works
- ✅ Step 3: Frontend loads
- ✅ Step 4: GET returns data
- ✅ Step 5: POST creates data
- ✅ Step 6: Data persists

**Optional:**
- ⭐ Step 7: Jobs execute
- ⭐ Step 8: Multiple records work

---

## Known Limitations (Alpha)

1. **ShepLang `call`/`load` not fully wired:**
   - Grammar updated with `call` and `load` statements
   - Bridge service exists and works
   - Full runtime integration pending (post-Alpha)
   - Workaround: Test via console directly

2. **UI not updated automatically:**
   - Manual testing via console required
   - Full UI integration in next phase

3. **Jobs disabled by default:**
   - To prevent console noise during development
   - Enable manually if testing scheduler

---

## Test Results

**Date Tested:** _________________

**Tester:** _________________

**Overall Status:** ⬜ PASS / ⬜ FAIL

**Notes:**
```
(Add any observations, errors, or issues encountered)
```

---

## Next Steps If Tests Fail

### If Step 1 Fails (Backend won't load):
- Check console for ShepThon parser errors
- Verify dog-reminders.shepthon syntax
- Check shepthonService integration

### If Step 4/5 Fails (Endpoints don't work):
- Verify bridge service loaded
- Check runtime initialized correctly
- Inspect endpoint registration

### If Step 6 Fails (Data doesn't persist):
- Check InMemoryDatabase
- Verify CRUD operations
- Inspect database state

---

## Automated Test (Future)

```typescript
// Future: Automated E2E test
describe('Dog Reminders E2E', () => {
  it('should load backend and create reminder', async () => {
    // Load backend
    const backend = await loadShepThon(dogRemindersSource);
    expect(backend.success).toBe(true);
    
    // Test GET (empty)
    const initial = await callEndpoint('GET', '/reminders');
    expect(initial).toEqual([]);
    
    // Test POST
    const created = await callEndpoint('POST', '/reminders', {
      text: 'Test',
      time: new Date()
    });
    expect(created.id).toBeDefined();
    
    // Test GET (with data)
    const all = await callEndpoint('GET', '/reminders');
    expect(all).toHaveLength(1);
  });
});
```

---

**Status:** Manual test documented and ready for execution  
**Automated:** Pending (future enhancement)

# Manual Testing Instructions - Dashboard Instrument Filters

## Overview
This document provides step-by-step instructions for manually testing the dashboard instrument filters feature end-to-end.

## Prerequisites

### 1. Start the Application
```bash
# From project root directory
./start-all.sh
```

This will start:
- Backend on http://localhost:8080
- Frontend on http://localhost:4200
- API Documentation at http://localhost:8080/swagger-ui.html

### 2. Verify Services are Running
- Backend: Check http://localhost:8080/actuator/health (should return {"status":"UP"})
- Frontend: Open http://localhost:4200 (should load the application)

### 3. Required Tools
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Browser DevTools (for network inspection)
- Access to Redis (for cache testing)

## Testing Checklist

### ✅ Quick Smoke Test (5 minutes)
Before detailed testing, verify basic functionality:

1. **Open Dashboard**
   - Navigate to http://localhost:4200
   - Go to Stock Insights Dashboard
   - Verify three filter dropdowns appear in header

2. **Check Default Values**
   - Exchange should show "NSE"
   - Index should show "NIFTY 50"
   - Segment should show "EQ"
   - Stock List should display instruments

3. **Test One Filter Change**
   - Change Exchange to "BSE"
   - Verify Stock List updates
   - Verify loading indicator appears

If all three checks pass, proceed with detailed testing.

## Detailed Test Execution

### Test 1: Default Filter Loading ⏱️ 2 min
**Validates Requirements: 1.2**

1. Clear browser cache (Ctrl+Shift+Del)
2. Navigate to http://localhost:4200
3. Open Stock Insights Dashboard
4. **Verify:**
   - [ ] Exchange dropdown = "NSE"
   - [ ] Index dropdown = "NIFTY 50"
   - [ ] Segment dropdown = "EQ"
   - [ ] Stock List shows instruments
   - [ ] Brief loading indicator appears

**Record results in:** `.kiro/specs/dashboard-instrument-filters/e2e-test-results.md` (Test Case 1)

---

### Test 2: Individual Filter Changes ⏱️ 5 min
**Validates Requirements: 1.3**

**Test 2a: Exchange Filter**
1. From default state, click Exchange dropdown
2. Select "BSE"
3. **Verify:**
   - [ ] Dropdown updates to "BSE"
   - [ ] Loading indicator appears
   - [ ] Stock List updates with BSE instruments
   - [ ] Other filters unchanged

**Test 2b: Index Filter**
1. Reset to defaults (refresh page)
2. Click Index dropdown
3. Select "NIFTY BANK"
4. **Verify:**
   - [ ] Dropdown updates to "NIFTY BANK"
   - [ ] Loading indicator appears
   - [ ] Stock List updates
   - [ ] Other filters unchanged

**Test 2c: Segment Filter**
1. Reset to defaults
2. Click Segment dropdown
3. Select "FO"
4. **Verify:**
   - [ ] Dropdown updates to "FO"
   - [ ] Loading indicator appears
   - [ ] Stock List updates
   - [ ] Other filters unchanged

**Record results in:** e2e-test-results.md (Test Cases 2, 3, 4)

---

### Test 3: Multiple Filters Together ⏱️ 3 min
**Validates Requirements: 1.5**

1. From default state:
   - Change Exchange to "BSE"
   - Change Index to "SENSEX"
   - Keep Segment as "EQ"
2. **Verify:**
   - [ ] All dropdowns update correctly
   - [ ] Only ONE API call made (debounced)
   - [ ] Results match ALL three filters (AND logic)
   - [ ] No BSE instruments with NIFTY index appear
   - [ ] No NSE instruments appear

**Record results in:** e2e-test-results.md (Test Case 5)

---

### Test 4: Filter State Persistence ⏱️ 2 min
**Validates Requirements: 1.4**

1. Set filters to: BSE + SENSEX + EQ
2. Navigate to another dashboard page
3. Return to Stock Insights Dashboard
4. **Verify:**
   - [ ] Filters still show BSE + SENSEX + EQ
   - [ ] Stock List shows same data
   - [ ] No new API calls made

**Record results in:** e2e-test-results.md (Test Case 7)

---

### Test 5: Loading Indicators ⏱️ 3 min
**Validates Requirements: 6.2**

1. Open DevTools (F12) → Network tab
2. Throttle network: "Slow 3G"
3. Change any filter
4. **Verify:**
   - [ ] Loading indicator appears immediately
   - [ ] Dropdowns remain clickable
   - [ ] Indicator disappears when loaded
   - [ ] UI doesn't freeze

**Record results in:** e2e-test-results.md (Test Case 8)

---

### Test 6: Error Handling ⏱️ 3 min
**Validates Requirements: 7.3**

1. Stop backend server (Ctrl+C in backend terminal)
2. Change any filter in frontend
3. **Verify:**
   - [ ] Error toast/notification appears
   - [ ] Message is user-friendly (not technical)
   - [ ] Previous data remains visible
   - [ ] Can still interact with UI
4. Restart backend: `cd backend && ./start-app.sh`

**Record results in:** e2e-test-results.md (Test Case 9)

---

### Test 7: Cache Performance ⏱️ 5 min
**Validates Requirements: 3.2**

1. Clear Redis cache:
   ```bash
   redis-cli FLUSHDB
   ```
2. Open DevTools → Network tab
3. Load dashboard (first request)
4. Note response time for `/api/v1/instruments/filters/exchanges`
5. Refresh page (second request)
6. Note response time again
7. **Verify:**
   - [ ] Second request is faster
   - [ ] Response data is identical
   - [ ] Cache headers present

**Record results in:** e2e-test-results.md (Test Case 10)

---

### Test 8: Debouncing ⏱️ 2 min
**Validates Requirements: 6.1, 6.4**

1. Open DevTools → Network tab
2. Rapidly change filters 5 times within 1 second
3. Count API calls to `/api/v1/instruments/filtered`
4. **Verify:**
   - [ ] Only 1 API call made
   - [ ] 300ms delay observed
   - [ ] Final result matches last selection

**Record results in:** e2e-test-results.md (Test Case 11)

---

### Test 9: Empty Results ⏱️ 2 min
**Validates Requirements: 6.5**

1. Select filters that return no results:
   - Exchange: "MCX"
   - Index: "NIFTY 50"
   - Segment: "EQ"
2. **Verify:**
   - [ ] Empty state message appears
   - [ ] Message is clear and helpful
   - [ ] No error notification
   - [ ] Can change filters to get results

**Record results in:** e2e-test-results.md (Test Case 12)

---

### Test 10: Performance with Large Dataset ⏱️ 3 min
**Validates Requirements: 6.3**

1. Select filters returning ~1000 instruments:
   - Exchange: "NSE"
   - Index: (leave empty or select broad index)
   - Segment: "EQ"
2. Open DevTools → Performance tab
3. Record performance
4. **Verify:**
   - [ ] Response time < 2 seconds
   - [ ] Rendering is smooth
   - [ ] Scrolling is responsive
   - [ ] No console errors

**Record results in:** e2e-test-results.md (Test Case 13)

---

## API Endpoint Verification

### Using Browser DevTools
1. Open DevTools → Network tab
2. Filter by "XHR" or "Fetch"
3. Verify these endpoints are called:

**Filter Options (cached):**
- `GET /api/v1/instruments/filters/exchanges`
- `GET /api/v1/instruments/filters/indices`
- `GET /api/v1/instruments/filters/segments`

**Filtered Instruments:**
- `GET /api/v1/instruments/filtered?exchange=NSE&index=NIFTY%2050&segment=EQ`

### Using Swagger UI
1. Navigate to http://localhost:8080/swagger-ui.html
2. Find "Instrument Filters" section
3. Test each endpoint manually:
   - Try `/filters/exchanges` → Should return list of exchanges
   - Try `/filters/indices` → Should return list of indices
   - Try `/filters/segments` → Should return list of segments
   - Try `/filtered` with various parameters

---

## Common Issues and Solutions

### Issue: Dropdowns are empty
**Solution:** Check backend logs for database connection errors

### Issue: No data appears in Stock List
**Solution:** 
- Verify database has data in `kite_instrument_master` table
- Check browser console for errors
- Verify API endpoints return data in Swagger UI

### Issue: Filters don't update the list
**Solution:**
- Check browser console for JavaScript errors
- Verify network requests are being made
- Check backend logs for errors

### Issue: Cache not working
**Solution:**
- Verify Redis is running: `redis-cli ping` (should return "PONG")
- Check backend logs for cache configuration errors
- Verify cache annotations in controller

---

## Completion Checklist

After completing all tests:

1. **Fill out results** in `e2e-test-results.md`
2. **Document issues** found during testing
3. **Calculate statistics:**
   - Tests passed / total tests
   - Average response times
   - Cache performance improvement
4. **Create fixes** for any issues found
5. **Commit changes:**
   ```bash
   git add .
   git commit -m "fix: resolve end-to-end testing issues"
   ```

---

## Next Steps

If all tests pass:
- ✅ Mark task 14 as complete
- ✅ Move to task 15 (Performance optimization)

If issues found:
- 🔧 Document issues in e2e-test-results.md
- 🔧 Create fix commits
- 🔧 Re-run affected tests
- 🔧 Update test results

---

## Support

If you encounter issues during testing:
1. Check backend logs: `tail -f backend/logs/application.log`
2. Check browser console for frontend errors
3. Verify database connectivity
4. Verify Redis is running
5. Check network tab for failed requests

For questions or clarifications, refer to:
- Requirements: `.kiro/specs/dashboard-instrument-filters/requirements.md`
- Design: `.kiro/specs/dashboard-instrument-filters/design.md`
- Tasks: `.kiro/specs/dashboard-instrument-filters/tasks.md`

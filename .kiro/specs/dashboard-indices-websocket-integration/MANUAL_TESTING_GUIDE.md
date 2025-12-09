# Manual Testing Guide: Dashboard Indices WebSocket Integration

## Overview
This document provides a comprehensive manual testing checklist for the dashboard indices WebSocket integration feature. Follow each test case carefully and document your findings.

## Prerequisites
- Backend SocketEngine service running on configured port
- Frontend Angular application running in development mode
- Browser DevTools available (Chrome/Firefox recommended)
- Network throttling tools available (optional but recommended)

## Test Environment Setup

### 1. Start Backend Services
```bash
cd socketengine
./start-app.sh
```
Verify SocketEngine is running and WebSocket endpoint is available at `/ws/indices/all`

### 2. Start Frontend Application
```bash
cd frontend
npm start
```
Verify application is accessible at `http://localhost:4200` (or configured port)

### 3. Open Browser DevTools
- Open Chrome DevTools (F12)
- Navigate to Network tab
- Filter by "WS" to see WebSocket connections
- Keep Console tab visible for logging

---

## Test Cases

### Test Case 1: Initial Fallback Data Display
**Requirement:** 1.1 - Display existing fallback data immediately

**Steps:**
1. Clear browser cache and local storage
2. Navigate to dashboard URL
3. Observe the Index List widget

**Expected Results:**
- [ ] Dashboard loads without errors
- [ ] Index List widget displays immediately (no blank screen)
- [ ] Fallback data from REST API is visible
- [ ] All NSE indices are displayed (NIFTY 50, NIFTY BANK, etc.)
- [ ] Data includes: symbol, price, change, change percentage

**Actual Results:**
```
[Document your observations here]
```

**Status:** ⬜ Pass / ⬜ Fail / ⬜ Blocked

**Issues Found:**
```
[Document any issues]
```

---

### Test Case 2: WebSocket Connection Establishment
**Requirement:** 1.2, 2.1 - WebSocket connection and subscription

**Steps:**
1. With DevTools Network tab open (WS filter)
2. Load the dashboard
3. Observe WebSocket connections in Network tab
4. Check Console for connection logs

**Expected Results:**
- [ ] WebSocket connection appears in Network tab
- [ ] Connection status shows "101 Switching Protocols"
- [ ] Connection URL matches SocketEngine endpoint
- [ ] Console logs show "WebSocket state changed: CONNECTED"
- [ ] Subscription to `/topic/nse-indices` is established
- [ ] No connection errors in console

**Actual Results:**
```
[Document your observations here]
```

**Status:** ⬜ Pass / ⬜ Fail / ⬜ Blocked

**Issues Found:**
```
[Document any issues]
```

---

### Test Case 3: Real-Time Data Updates
**Requirement:** 1.3, 3.5 - Real-time updates via WebSocket

**Steps:**
1. With dashboard loaded and WebSocket connected
2. Observe the Index List widget for 2-3 minutes
3. Watch for price changes in the indices
4. Monitor WebSocket frames in DevTools

**Expected Results:**
- [ ] Index prices update automatically without page refresh
- [ ] Updates appear smoothly without flickering
- [ ] WebSocket frames visible in Network tab (Data column)
- [ ] Frame payload contains IndicesDto structure
- [ ] Console shows no parsing errors
- [ ] UI remains responsive during updates

**Actual Results:**
```
[Document your observations here]
```

**Status:** ⬜ Pass / ⬜ Fail / ⬜ Blocked

**Issues Found:**
```
[Document any issues]
```

---

### Test Case 4: Price Change Indicators
**Requirement:** 3.1, 3.2 - Visual indicators for price changes

**Steps:**
1. Observe indices with price increases
2. Observe indices with price decreases
3. Check visual indicators (colors, arrows, etc.)

**Expected Results:**
- [ ] Price increases show positive indicator (green/up arrow)
- [ ] Price decreases show negative indicator (red/down arrow)
- [ ] Indicators update in real-time with price changes
- [ ] Change percentage displays correctly
- [ ] Visual feedback is clear and immediate

**Actual Results:**
```
[Document your observations here]
```

**Status:** ⬜ Pass / ⬜ Fail / ⬜ Blocked

**Issues Found:**
```
[Document any issues]
```

---

### Test Case 5: Selection Persistence
**Requirement:** 3.3 - Selection persists during updates

**Steps:**
1. Click on an index in the Index List widget to select it
2. Note the selected index (e.g., NIFTY 50)
3. Wait for WebSocket data updates (30-60 seconds)
4. Observe if selection remains highlighted

**Expected Results:**
- [ ] Selected index is visually highlighted
- [ ] Selection persists through multiple data updates
- [ ] Highlighting doesn't flicker or disappear
- [ ] Selected index data updates correctly
- [ ] No console errors related to selection

**Actual Results:**
```
[Document your observations here]
```

**Status:** ⬜ Pass / ⬜ Fail / ⬜ Blocked

**Issues Found:**
```
[Document any issues]
```

---

### Test Case 6: Data Merge Verification
**Requirement:** 1.3, 3.4 - Merge WebSocket data with fallback

**Steps:**
1. Load dashboard and note initial indices count
2. Wait for WebSocket connection
3. Compare indices before and after WebSocket updates
4. Verify no data loss

**Expected Results:**
- [ ] All fallback indices remain visible
- [ ] WebSocket data overlays fallback data
- [ ] No indices disappear after WebSocket connection
- [ ] Index count remains consistent or increases
- [ ] No duplicate entries appear

**Actual Results:**
```
[Document your observations here]
```

**Status:** ⬜ Pass / ⬜ Fail / ⬜ Blocked

**Issues Found:**
```
[Document any issues]
```

---

### Test Case 7: Network Disconnect Scenario
**Requirement:** 2.3, 4.1 - Graceful handling of connection failures

**Steps:**
1. Load dashboard with WebSocket connected
2. Open DevTools Network tab
3. Enable "Offline" mode in DevTools
4. Observe dashboard behavior
5. Disable "Offline" mode after 30 seconds
6. Observe reconnection behavior

**Expected Results:**
- [ ] Dashboard continues displaying last known data
- [ ] No error messages shown to user
- [ ] Console logs connection error (not user-facing)
- [ ] UI remains functional and responsive
- [ ] After reconnection, WebSocket reconnects automatically
- [ ] Data updates resume after reconnection

**Actual Results:**
```
[Document your observations here]
```

**Status:** ⬜ Pass / ⬜ Fail / ⬜ Blocked

**Issues Found:**
```
[Document any issues]
```

---

### Test Case 8: Network Throttling
**Requirement:** 6.1, 6.2, 6.3 - Efficient handling of high-frequency updates

**Steps:**
1. Open DevTools Network tab
2. Enable "Slow 3G" or "Fast 3G" throttling
3. Load dashboard
4. Observe performance and responsiveness

**Expected Results:**
- [ ] Dashboard loads successfully (may be slower)
- [ ] WebSocket connection establishes
- [ ] UI remains responsive despite slow network
- [ ] No UI freezing or blocking
- [ ] Updates appear smoothly when they arrive
- [ ] No memory leaks or performance degradation

**Actual Results:**
```
[Document your observations here]
```

**Status:** ⬜ Pass / ⬜ Fail / ⬜ Blocked

**Issues Found:**
```
[Document any issues]
```

---

### Test Case 9: Navigation and Cleanup
**Requirement:** 1.4, 1.5, 2.2 - Proper cleanup on navigation

**Steps:**
1. Load dashboard with WebSocket connected
2. Note WebSocket connection in DevTools
3. Navigate to a different page/route
4. Observe WebSocket connection status
5. Check Console for cleanup logs

**Expected Results:**
- [ ] WebSocket connection closes when navigating away
- [ ] Console logs show "WebSocket state changed: DISCONNECTED"
- [ ] No WebSocket connection remains in Network tab
- [ ] No console errors during cleanup
- [ ] No memory leaks (check DevTools Memory tab)

**Actual Results:**
```
[Document your observations here]
```

**Status:** ⬜ Pass / ⬜ Fail / ⬜ Blocked

**Issues Found:**
```
[Document any issues]
```

---

### Test Case 10: Multiple Component Instances
**Requirement:** 2.4 - Connection reuse across components

**Steps:**
1. Open dashboard in first browser tab
2. Open dashboard in second browser tab (same browser)
3. Observe WebSocket connections in both tabs
4. Check DevTools Network tab in both

**Expected Results:**
- [ ] Each tab establishes its own WebSocket connection
- [ ] Both tabs receive real-time updates independently
- [ ] No connection conflicts or errors
- [ ] Both tabs function correctly

**Actual Results:**
```
[Document your observations here]
```

**Status:** ⬜ Pass / ⬜ Fail / ⬜ Blocked

**Issues Found:**
```
[Document any issues]
```

---

### Test Case 11: Backend Service Restart
**Requirement:** 4.2, 4.3 - Reconnection with exponential backoff

**Steps:**
1. Load dashboard with WebSocket connected
2. Stop the SocketEngine backend service
3. Observe dashboard behavior for 2 minutes
4. Restart SocketEngine backend service
5. Observe reconnection behavior

**Expected Results:**
- [ ] Dashboard continues with last known data
- [ ] Console logs show reconnection attempts
- [ ] Reconnection attempts use exponential backoff
- [ ] After backend restart, connection re-establishes
- [ ] Data updates resume automatically
- [ ] No manual refresh required

**Actual Results:**
```
[Document your observations here]
```

**Status:** ⬜ Pass / ⬜ Fail / ⬜ Blocked

**Issues Found:**
```
[Document any issues]
```

---

### Test Case 12: Invalid Data Handling
**Requirement:** 5.3, 8.2 - Graceful handling of invalid data

**Steps:**
1. Monitor Console for any parsing errors
2. Observe dashboard behavior over 5 minutes
3. Check for any data corruption or UI issues

**Expected Results:**
- [ ] Invalid data is logged but doesn't crash app
- [ ] Dashboard continues functioning normally
- [ ] Existing data remains intact
- [ ] No UI corruption or blank screens
- [ ] Console shows warning for invalid data (if any)

**Actual Results:**
```
[Document your observations here]
```

**Status:** ⬜ Pass / ⬜ Fail / ⬜ Blocked

**Issues Found:**
```
[Document any issues]
```

---

### Test Case 13: Long-Running Session
**Requirement:** 2.5, 6.3 - No memory leaks in long sessions

**Steps:**
1. Load dashboard
2. Keep dashboard open for 30+ minutes
3. Monitor DevTools Memory tab
4. Take heap snapshots at 0, 15, and 30 minutes
5. Compare memory usage

**Expected Results:**
- [ ] Memory usage remains stable over time
- [ ] No continuous memory growth
- [ ] Heap snapshots show no significant leaks
- [ ] Dashboard remains responsive
- [ ] WebSocket connection remains stable

**Actual Results:**
```
[Document your observations here]
```

**Status:** ⬜ Pass / ⬜ Fail / ⬜ Blocked

**Issues Found:**
```
[Document any issues]
```

---

### Test Case 14: Console Logging Verification
**Requirement:** 8.1, 8.4, 8.5 - Comprehensive error handling and logging

**Steps:**
1. Open Console in DevTools
2. Load dashboard
3. Review all console messages
4. Categorize logs (info, warn, error)

**Expected Results:**
- [ ] Connection state changes are logged
- [ ] WebSocket operations are logged (if debug mode)
- [ ] No unexpected errors in console
- [ ] Error messages are clear and actionable
- [ ] Logging doesn't impact performance

**Actual Results:**
```
[Document your observations here]
```

**Status:** ⬜ Pass / ⬜ Fail / ⬜ Blocked

**Issues Found:**
```
[Document any issues]
```

---

## Summary

### Test Execution Summary
- Total Test Cases: 14
- Passed: ___
- Failed: ___
- Blocked: ___

### Critical Issues Found
```
[List all critical issues that block functionality]
```

### Non-Critical Issues Found
```
[List all minor issues or improvements]
```

### Overall Assessment
```
[Provide overall assessment of the feature]
- Is the feature ready for production? YES / NO
- What are the main concerns?
- What needs to be fixed before release?
```

### Recommendations
```
[Provide recommendations for improvements or fixes]
```

---

## Sign-Off

**Tester Name:** ___________________
**Date:** ___________________
**Signature:** ___________________


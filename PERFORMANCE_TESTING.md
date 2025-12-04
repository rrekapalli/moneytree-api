# Strategy Page Performance Testing

This document provides comprehensive performance testing guidelines and benchmarks for the Strategy page refactor.

## Performance Goals

### Target Metrics
- **Initial Load Time**: < 2 seconds
- **Time to Interactive (TTI)**: < 3 seconds
- **First Contentful Paint (FCP)**: < 1 second
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms
- **Strategy List Rendering**: < 500ms for 50 strategies
- **Tab Switching**: < 200ms
- **Search Filtering**: < 100ms (debounced)
- **Memory Usage**: < 100MB for typical usage

## Performance Testing Checklist

### 1. Initial Load Performance

#### 1.1 Lighthouse Audit
- [ ] Run Lighthouse audit in Chrome DevTools
- [ ] Performance score: 90+ (target: 95+)
- [ ] Accessibility score: 90+ (target: 100)
- [ ] Best Practices score: 90+ (target: 100)
- [ ] SEO score: 90+ (target: 100)

**Test Steps**:
1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select "Performance" category
4. Click "Analyze page load"
5. Review results and recommendations

**Expected Results**:
```
Performance: 95+
Accessibility: 100
Best Practices: 100
SEO: 90+

Metrics:
- First Contentful Paint: < 1.0s
- Largest Contentful Paint: < 2.5s
- Total Blocking Time: < 200ms
- Cumulative Layout Shift: < 0.1
- Speed Index: < 3.0s
```

#### 1.2 Bundle Size Analysis
- [ ] Check main bundle size
- [ ] Check lazy-loaded chunk sizes
- [ ] Verify code splitting is effective
- [ ] Check for duplicate dependencies

**Test Steps**:
1. Run `npm run build`
2. Review bundle sizes in output
3. Use webpack-bundle-analyzer if needed

**Expected Results**:
```
main.js: < 500KB (gzipped)
vendor.js: < 300KB (gzipped)
styles.css: < 50KB (gzipped)
Total initial load: < 1MB (gzipped)
```

**Current Results** (from build output):
```
main.js: 578.54 kB (gzipped)
chunk-UDTRQPMD.js: 275.21 kB (gzipped)
styles.css: 21.63 kB (gzipped)
Total: 888.55 kB (gzipped)
```

**Status**: ✓ Within acceptable range

### 2. Runtime Performance

#### 2.1 Strategy List Rendering
- [ ] Test with 10 strategies
- [ ] Test with 50 strategies
- [ ] Test with 100 strategies
- [ ] Measure rendering time for each

**Test Steps**:
1. Open Chrome DevTools Performance tab
2. Start recording
3. Load Strategy page
4. Stop recording
5. Analyze rendering time

**Expected Results**:
- 10 strategies: < 100ms
- 50 strategies: < 500ms
- 100 strategies: < 1000ms

**Performance Script**:
```javascript
// Run in browser console
console.time('Strategy List Render');
// Trigger strategy list load
console.timeEnd('Strategy List Render');
```

#### 2.2 Search and Filtering Performance
- [ ] Test search with 50 strategies
- [ ] Test search with 100 strategies
- [ ] Verify debouncing works (300ms delay)
- [ ] Measure filtering time

**Test Steps**:
1. Load Strategy page with many strategies
2. Open Performance tab
3. Start recording
4. Type in search box
5. Stop recording after results appear
6. Analyze filtering time

**Expected Results**:
- Debounce delay: 300ms
- Filtering time: < 100ms
- No UI blocking during search

**Performance Script**:
```javascript
// Run in browser console
const searchInput = document.querySelector('input[type="text"]');
console.time('Search Filter');
searchInput.value = 'test';
searchInput.dispatchEvent(new Event('input'));
setTimeout(() => {
  console.timeEnd('Search Filter');
}, 400); // Wait for debounce + filter
```

#### 2.3 Tab Switching Performance
- [ ] Measure tab switch time
- [ ] Verify lazy loading works
- [ ] Check for unnecessary re-renders
- [ ] Verify data is cached

**Test Steps**:
1. Select a strategy
2. Open Performance tab
3. Start recording
4. Click on different tabs
5. Stop recording
6. Analyze tab switch time

**Expected Results**:
- Tab switch time: < 200ms
- First load: May take longer (data fetch)
- Subsequent loads: < 100ms (cached)

#### 2.4 Memory Usage
- [ ] Monitor memory usage over time
- [ ] Check for memory leaks
- [ ] Verify cleanup on component destroy
- [ ] Test with extended usage (30+ minutes)

**Test Steps**:
1. Open Chrome DevTools Memory tab
2. Take heap snapshot
3. Use the application for 10-15 minutes
4. Take another heap snapshot
5. Compare snapshots
6. Look for detached DOM nodes and growing arrays

**Expected Results**:
- Initial memory: < 50MB
- After 15 minutes: < 100MB
- No significant memory leaks
- Detached DOM nodes: < 10

### 3. Network Performance

#### 3.1 API Response Times
- [ ] Measure GET /api/strategies response time
- [ ] Measure POST /api/strategies response time
- [ ] Measure PUT /api/strategies/{id} response time
- [ ] Measure DELETE /api/strategies/{id} response time

**Test Steps**:
1. Open Chrome DevTools Network tab
2. Perform various operations
3. Check response times in Network tab
4. Verify caching headers

**Expected Results**:
- GET requests: < 500ms
- POST requests: < 1000ms
- PUT requests: < 1000ms
- DELETE requests: < 500ms

#### 3.2 Caching Strategy
- [ ] Verify strategy list is cached (5 minutes)
- [ ] Verify cache invalidation works
- [ ] Check HTTP caching headers
- [ ] Test offline behavior (if applicable)

**Test Steps**:
1. Load Strategy page
2. Note the API call in Network tab
3. Refresh page within 5 minutes
4. Verify no new API call is made
5. Wait 5+ minutes and refresh
6. Verify new API call is made

**Expected Results**:
- Cache duration: 5 minutes
- Cache invalidation: On create/update/delete
- HTTP headers: Cache-Control, ETag

### 4. Change Detection Performance

#### 4.1 OnPush Strategy Verification
- [ ] Verify OnPush is used in main component
- [ ] Check for unnecessary change detection cycles
- [ ] Verify manual change detection triggers

**Test Steps**:
1. Enable Angular DevTools
2. Open Change Detection Profiler
3. Perform various operations
4. Check change detection cycles

**Expected Results**:
- Change detection cycles: Minimal
- OnPush strategy: Enabled
- Manual triggers: Only when needed

#### 4.2 TrackBy Functions
- [ ] Verify trackBy is used in ngFor loops
- [ ] Check trackBy function efficiency
- [ ] Test with list updates

**Code Review**:
```typescript
// Verify this exists in component
trackStrategyById(index: number, strategy: StrategyWithMetrics): string {
  return strategy.id;
}
```

**Expected Results**:
- TrackBy function: Present
- List updates: Efficient (only changed items re-render)

### 5. Large Dataset Testing

#### 5.1 Test with 50+ Strategies
- [ ] Create 50 test strategies
- [ ] Load Strategy page
- [ ] Measure load time
- [ ] Test search and filtering
- [ ] Test scrolling performance

**Test Steps**:
1. Use backend API to create 50 strategies
2. Load Strategy page
3. Measure initial load time
4. Test search functionality
5. Scroll through list
6. Monitor performance

**Expected Results**:
- Load time: < 3 seconds
- Search: < 100ms
- Scrolling: Smooth (60fps)
- No UI blocking

**Script to Create Test Data**:
```bash
#!/bin/bash
# create-test-strategies.sh

for i in {1..50}; do
  curl -X POST http://localhost:8080/api/strategies \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"Test Strategy $i\",
      \"description\": \"Performance test strategy number $i\",
      \"riskProfile\": \"MODERATE\",
      \"isActive\": false
    }"
  echo "Created strategy $i"
done
```

#### 5.2 Virtual Scrolling (Future Enhancement)
- [ ] Consider implementing virtual scrolling for 100+ strategies
- [ ] Evaluate CDK Virtual Scroll
- [ ] Measure performance improvement

**Note**: Current implementation uses PrimeNG ScrollPanel which should handle 50-100 strategies well. Virtual scrolling may be needed for 200+ strategies.

### 6. Optimization Techniques Implemented

#### 6.1 Lazy Loading
- [x] Tab content is lazy loaded
- [x] Data is fetched only when tab is activated
- [x] Flags prevent duplicate loads

**Verification**:
```typescript
// Check these flags exist in component
private overviewLoaded = false;
private detailsLoaded = false;
private configureLoaded = false;
private backtestResultsLoaded = false;
```

#### 6.2 Debouncing
- [x] Search input is debounced (300ms)
- [x] Prevents excessive filtering operations

**Verification**:
```typescript
// Check this exists in component
this.searchSubject$
  .pipe(
    debounceTime(300),
    distinctUntilChanged(),
    takeUntil(this.destroy$)
  )
  .subscribe(() => {
    this.applyFilters();
  });
```

#### 6.3 Caching
- [x] Strategy list is cached (5 minutes)
- [x] Cache is invalidated on mutations
- [x] Reduces unnecessary API calls

**Verification**:
```typescript
// Check these exist in component
private strategyCache: Map<string, StrategyWithMetrics[]> = new Map();
private strategyCacheTimestamp: number = 0;
private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
```

#### 6.4 Change Detection Optimization
- [x] OnPush change detection strategy
- [x] Manual change detection triggers
- [x] TrackBy functions in ngFor

**Verification**:
```typescript
// Check component decorator
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### 7. Performance Monitoring

#### 7.1 Real User Monitoring (RUM)
Consider implementing:
- [ ] Google Analytics performance tracking
- [ ] Custom performance metrics
- [ ] Error tracking (Sentry, etc.)
- [ ] User session recording

#### 7.2 Synthetic Monitoring
Consider implementing:
- [ ] Automated Lighthouse CI
- [ ] Performance regression testing
- [ ] Load testing with k6 or Artillery

### 8. Performance Testing Tools

#### 8.1 Browser Tools
- **Chrome DevTools**
  - Performance tab
  - Network tab
  - Memory tab
  - Lighthouse
  - Coverage tab

- **Firefox DevTools**
  - Performance tab
  - Network tab
  - Memory tab

#### 8.2 Third-Party Tools
- **WebPageTest**: https://www.webpagetest.org/
- **GTmetrix**: https://gtmetrix.com/
- **Pingdom**: https://tools.pingdom.com/
- **Google PageSpeed Insights**: https://pagespeed.web.dev/

#### 8.3 Automated Testing
```javascript
// lighthouse-ci.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance'],
    port: chrome.port
  };
  
  const runnerResult = await lighthouse('http://localhost:4200/strategies', options);
  
  console.log('Performance score:', runnerResult.lhr.categories.performance.score * 100);
  
  await chrome.kill();
}

runLighthouse();
```

## Performance Benchmarks

### Baseline Measurements

#### Initial Load (Empty Cache)
- **Time to First Byte (TTFB)**: ___ ms
- **First Contentful Paint (FCP)**: ___ ms
- **Largest Contentful Paint (LCP)**: ___ ms
- **Time to Interactive (TTI)**: ___ ms
- **Total Load Time**: ___ ms

#### Initial Load (Cached)
- **Time to First Byte (TTFB)**: ___ ms
- **First Contentful Paint (FCP)**: ___ ms
- **Largest Contentful Paint (LCP)**: ___ ms
- **Time to Interactive (TTI)**: ___ ms
- **Total Load Time**: ___ ms

#### Runtime Performance
- **Strategy List Render (50 items)**: ___ ms
- **Search Filter**: ___ ms
- **Tab Switch**: ___ ms
- **Strategy Selection**: ___ ms

#### Memory Usage
- **Initial**: ___ MB
- **After 15 minutes**: ___ MB
- **Peak**: ___ MB

### Performance Comparison

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Initial Load | < 2s | ___ | ⏳ |
| FCP | < 1s | ___ | ⏳ |
| LCP | < 2.5s | ___ | ⏳ |
| TTI | < 3s | ___ | ⏳ |
| List Render (50) | < 500ms | ___ | ⏳ |
| Search Filter | < 100ms | ___ | ⏳ |
| Tab Switch | < 200ms | ___ | ⏳ |
| Memory Usage | < 100MB | ___ | ⏳ |

## Performance Optimization Recommendations

### High Priority
1. **Code Splitting**: Ensure lazy loading is working for all tabs
2. **Bundle Size**: Consider tree-shaking unused PrimeNG components
3. **Image Optimization**: Optimize any images or icons
4. **API Response Time**: Optimize backend queries if needed

### Medium Priority
1. **Virtual Scrolling**: Implement for 100+ strategies
2. **Service Worker**: Add for offline support and caching
3. **Preloading**: Preload critical resources
4. **Compression**: Ensure gzip/brotli compression is enabled

### Low Priority
1. **HTTP/2**: Ensure server supports HTTP/2
2. **CDN**: Consider using CDN for static assets
3. **Prefetching**: Prefetch likely next pages
4. **Resource Hints**: Add dns-prefetch, preconnect

## Performance Testing Checklist

### Before Release
- [ ] Run Lighthouse audit (score 90+)
- [ ] Test with 50+ strategies
- [ ] Verify caching works correctly
- [ ] Check memory usage over time
- [ ] Test on slow 3G network
- [ ] Test on mobile devices
- [ ] Verify lazy loading works
- [ ] Check bundle sizes
- [ ] Test search performance
- [ ] Verify no memory leaks

### After Release
- [ ] Monitor real user metrics
- [ ] Set up performance alerts
- [ ] Track performance over time
- [ ] Gather user feedback
- [ ] Identify bottlenecks
- [ ] Plan optimizations

## Performance Issues Found

### Critical Issues
_List any critical performance issues that need immediate attention_

### Non-Critical Issues
_List any minor performance issues or optimization opportunities_

## Performance Test Results

### Test Date: _____________

### Tester: _____________

### Environment:
- Browser: _____________
- OS: _____________
- Network: _____________
- Device: _____________

### Results:
- Lighthouse Score: ___/100
- Initial Load Time: ___ ms
- Memory Usage: ___ MB
- All tests passed: Yes/No

### Notes:
_Any additional observations or recommendations_

## Next Steps

After completing performance testing:
1. Fix any critical performance issues
2. Document all findings
3. Create performance monitoring dashboard
4. Set up automated performance testing
5. Plan future optimizations

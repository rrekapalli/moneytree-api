# Implementation Plan

- [x] 1. Set up Angular signals infrastructure in overall component
  - Import signal primitives from @angular/core (signal, computed, effect)
  - Create writable signals for indices data, selected index, and connection state
  - Create computed signals for filtered indices and connection status
  - Set up effects for logging and widget updates
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - _Requirements: 7.1, 7.4, 7.5_

- [x] 1.1 Write property test for signal initialization
  - **Property 1: Signal initialization with defaults**
  - **Validates: Requirements 7.1**
  - Verify app builds without errors/warnings
  - Commit changes to local git

- [x] 2. Implement WebSocket subscription method
  - Create `initializeWebSocketSubscription()` method
  - Call `webSocketService.connect()` with error handling
  - Subscribe to `subscribeToAllIndices()` observable
  - Update connection state signal on successful connection
  - Handle connection errors gracefully (continue with fallback data)
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - _Requirements: 1.2, 2.1, 4.1_

- [x] 2.1 Write property test for WebSocket subscription
  - **Property 1: WebSocket subscription on connection**
  - **Validates: Requirements 1.2**
  - Verify app builds without errors/warnings
  - Commit changes to local git

- [x] 3. Implement incoming data handler
  - Create `handleIncomingIndicesData()` method
  - Validate incoming `IndicesDto` structure
  - Map indices data using existing `mapIndicesToStockData()` method
  - Call data merge method
  - Update indices data signal with merged result
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - _Requirements: 1.3, 5.1, 5.2, 5.5_

- [x] 3.1 Write property test for data validation
  - **Property 9: Data validation against interface**
  - **Validates: Requirements 5.2**
  - Verify app builds without errors/warnings
  - Commit changes to local git

- [x] 3.2 Write property test for invalid data handling
  - **Property 10: Invalid data skipped**
  - **Validates: Requirements 5.3**
  - Verify app builds without errors/warnings
  - Commit changes to local git

- [x] 4. Implement data merging logic
  - Create `mergeIndicesData()` method
  - Use Map for efficient O(n) merging
  - Preserve all fallback entries not in incoming data
  - Overlay incoming data on top of fallback data
  - Return merged array from Map values
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - _Requirements: 1.3, 3.4_

- [x] 4.1 Write property test for data merge
  - **Property 2: Data merge preserves fallback**
  - **Validates: Requirements 1.3, 3.4**
  - Verify app builds without errors/warnings
  - Commit changes to local git

- [x] 4.2 Write property test for missing fields
  - **Property 11: Missing fields use defaults**
  - **Validates: Requirements 5.4**
  - Verify app builds without errors/warnings
  - Commit changes to local git

- [x] 5. Integrate WebSocket subscription into component lifecycle
  - Call `initializeWebSocketSubscription()` in `onChildInit()`
  - Ensure fallback data loads first (before WebSocket)
  - Make WebSocket initialization non-blocking
  - Update existing `loadDefaultNifty50Data()` to use signals
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - _Requirements: 1.1, 2.1_

- [x] 5.1 Write unit test for lifecycle integration
  - Test that WebSocket subscription occurs after fallback data loads
  - Test that component displays fallback data immediately
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - _Requirements: 1.1, 2.1_

- [-] 6. Implement WebSocket cleanup method
  - Create `cleanupWebSocketSubscription()` method
  - Unsubscribe from `allIndicesSubscription` if active
  - Call `webSocketService.unsubscribeFromAll()`
  - Update connection state signal to DISCONNECTED
  - Set subscription reference to null
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - _Requirements: 1.4, 1.5, 2.2, 2.5_

- [-] 6.1 Write unit test for cleanup
  - Test that all subscriptions are unsubscribed
  - Test that connection state is updated
  - Test that no memory leaks occur
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - _Requirements: 2.2, 2.5_

- [ ] 7. Integrate cleanup into component destruction
  - Call `cleanupWebSocketSubscription()` in `onChildDestroy()`
  - Ensure cleanup happens before parent cleanup
  - Verify no errors if WebSocket was never connected
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - _Requirements: 1.4, 1.5, 2.2_

- [ ] 8. Update widget update logic to use signals
  - Modify `updateIndexListWidget()` to read from signals
  - Use effect to automatically update widget when signal changes
  - Remove manual change detection calls (signals handle this)
  - Preserve selected index highlighting using signal
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - _Requirements: 3.3, 3.5, 7.2, 7.3_

- [ ] 8.1 Write property test for selection persistence
  - **Property 7: Selection persists across updates**
  - **Validates: Requirements 3.3**
  - Verify app builds without errors/warnings
  - Commit changes to local git

- [ ] 8.2 Write property test for automatic UI updates
  - **Property 15: Signal triggers automatic UI updates**
  - **Validates: Requirements 7.3**
  - Verify app builds without errors/warnings
  - Commit changes to local git

- [ ] 9. Implement price change indicators
  - Add logic to detect price increases (positive indicator)
  - Add logic to detect price decreases (negative indicator)
  - Update widget data with change indicators
  - Use computed signal for change calculations
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - _Requirements: 3.1, 3.2_

- [ ] 9.1 Write property test for positive indicator
  - **Property 5: Price increase shows positive indicator**
  - **Validates: Requirements 3.1**
  - Verify app builds without errors/warnings
  - Commit changes to local git

- [ ] 9.2 Write property test for negative indicator
  - **Property 6: Price decrease shows negative indicator**
  - **Validates: Requirements 3.2**
  - Verify app builds without errors/warnings
  - Commit changes to local git

- [ ] 10. Implement error handling for connection failures
  - Create `handleConnectionError()` method
  - Log error with context (message, timestamp, state)
  - Update connection state signal to ERROR
  - Continue displaying fallback data (no user-facing error)
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - _Requirements: 2.3, 4.1_

- [ ] 10.1 Write property test for connection failure
  - **Property 3: Connection failure preserves data**
  - **Validates: Requirements 2.3, 4.1**
  - Verify app builds without errors/warnings
  - Commit changes to local git

- [ ] 11. Implement error handling for data parsing
  - Create `handleParsingError()` method
  - Log raw message (first 200 chars) and error
  - Skip the update, continue with existing data
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - _Requirements: 5.3, 8.2_

- [ ] 12. Implement error handling for subscriptions
  - Create `handleSubscriptionError()` method
  - Log topic name and error details
  - Implement retry logic with delay
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - _Requirements: 4.2, 8.3_

- [ ] 12.1 Write property test for exponential backoff
  - **Property 8: Exponential backoff on reconnection**
  - **Validates: Requirements 4.2**
  - Verify app builds without errors/warnings
  - Commit changes to local git

- [ ] 13. Add connection state logging
  - Use effect to log connection state changes
  - Include timestamp and state transition
  - Enable verbose logging in debug mode
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - _Requirements: 8.4, 8.5_

- [ ] 14. Optimize signal performance
  - Ensure computed signals are used for derived data
  - Verify signal batching for rapid updates
  - Test that only affected components update
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - _Requirements: 6.1, 6.2, 6.4, 6.5_

- [ ] 14.1 Write property test for signal batching
  - **Property 12: Signal batching for rapid updates**
  - **Validates: Requirements 6.2**
  - Verify app builds without errors/warnings
  - Commit changes to local git

- [ ] 14.2 Write property test for computed signals
  - **Property 13: Computed signals auto-recompute**
  - **Validates: Requirements 6.4**
  - Verify app builds without errors/warnings
  - Commit changes to local git

- [ ] 14.3 Write property test for targeted updates
  - **Property 14: Targeted UI updates**
  - **Validates: Requirements 6.5**
  - Verify app builds without errors/warnings
  - Commit changes to local git

- [ ] 15. Add connection reuse verification
  - Verify WebSocketService reuses existing connection
  - Test with multiple component instances
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - _Requirements: 2.4_

- [ ] 15.1 Write property test for connection reuse
  - **Property 4: Connection reuse**
  - **Validates: Requirements 2.4**
  - Verify app builds without errors/warnings
  - Commit changes to local git

- [ ] 16. Update component template for signal binding
  - Replace direct property access with signal calls
  - Use computed signals in template expressions
  - Remove manual change detection triggers
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - _Requirements: 7.3_

- [ ] 17. Add debug logging configuration
  - Create debug flag for verbose logging
  - Add conditional logging throughout WebSocket flow
  - Log all WebSocket operations in debug mode
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - _Requirements: 8.5_

- [ ] 18. Checkpoint - Ensure all tests pass
  - Run all tests and verify they pass
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - Ask the user if questions arise

- [ ] 19. Write integration tests
  - Test end-to-end flow from WebSocket to UI
  - Test interaction between service and component
  - Test signal effects trigger correctly
  - Verify app builds without errors/warnings
  - Commit changes to local git
  - _Requirements: All_

- [ ] 20. Perform manual testing
  - Load dashboard and verify fallback data displays
  - Observe WebSocket connection in DevTools
  - Verify real-time updates in Index List widget
  - Test selection persistence during updates
  - Test network disconnect/reconnect scenarios
  - Test navigation cleanup
  - Document any issues found
  - _Requirements: All_

- [ ] 21. Final Checkpoint - Ensure all tests pass
  - Run all tests and verify they pass
  - Verify app builds without errors/warnings
  - Create final commit with all changes
  - Ask the user if questions arise

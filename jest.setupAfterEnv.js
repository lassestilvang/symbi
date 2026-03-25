// Global cleanup after each test to prevent open handles
afterEach(() => {
  // Clear all timers
  jest.clearAllTimers();
});

// Global cleanup after all tests
afterAll(() => {
  // Use real timers for cleanup
  jest.useRealTimers();
});

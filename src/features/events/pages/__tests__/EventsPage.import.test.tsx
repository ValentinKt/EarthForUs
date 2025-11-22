// Simple test to verify EventsPage component can be imported and rendered

// Test basic import first
describe('EventsPage Import Test', () => {
  it('should be able to import EventsPage', () => {
    // This test will fail if there's an import issue
    expect(() => {
      require('../EventsPage');
    }).not.toThrow();
  });

  it('should export a valid React component', () => {
    const EventsPage = require('../EventsPage').default;
    expect(EventsPage).toBeDefined();
    expect(typeof EventsPage).toBe('function');
  });
});
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock environment variables
const globalAny = global as any;
globalAny.import = { 
  meta: { 
    env: {
      VITE_API_BASE: 'http://localhost:3002',
      VITE_LOG_LEVEL: 'debug',
      VITE_TEST_USER_EMAIL: 'test@example.com',
      VITE_TEST_USER_PASSWORD: 'test123',
      VITE_ENABLE_DEBUG: 'true',
      VITE_SHOW_ERROR_DETAILS: 'true',
    }
  }
};

// Mock WebSocket
class MockWebSocket {
  constructor(public url: string) {}
  send = jest.fn();
  close = jest.fn();
  addEventListener = jest.fn();
  removeEventListener = jest.fn();
  dispatchEvent = jest.fn();
}

globalAny.WebSocket = MockWebSocket;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
globalAny.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
globalAny.sessionStorage = sessionStorageMock;

// Mock fetch
globalAny.fetch = jest.fn();

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
/**
 * Vitest Test Setup
 *
 * Global setup for unit tests including mocks and configurations.
 */

import { vi } from 'vitest';

// Mock environment variables
vi.mocked(import.meta.env, { partial: true });

// Mock console methods to reduce noise in tests
Object.defineProperty(global, 'console', {
  value: {
    ...console,
    // Uncomment to ignore specific console messages during tests
    // log: vi.fn(),
    // warn: vi.fn(),
    // error: vi.fn(),
  },
  writable: true,
});

// Mock matchMedia for components that use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock URL constructor for YouTube URL tests
global.URL = class MockURL {
  constructor(url: string, base?: string) {
    this.searchParams = new MockURLSearchParams();

    // Simple parsing for test purposes
    if (url.includes('youtube.com/watch')) {
      const match = url.match(/[?&]v=([^&]+)/);
      if (match) {
        this.searchParams.set('v', match[1]);
      }
    }
  }

  searchParams: MockURLSearchParams;
  hash: string = '';
  host: string = '';
  hostname: string = '';
  href: string = '';
  origin: string = '';
  pathname: string = '';
  port: string = '';
  protocol: string = '';
  search: string = '';
};

class MockURLSearchParams {
  private params: Record<string, string> = {};

  get(name: string): string | null {
    return this.params[name] || null;
  }

  set(name: string, value: string): void {
    this.params[name] = value;
  }
}

// Mock localStorage and sessionStorage
const createStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  };
};

Object.defineProperty(window, 'localStorage', {
  value: createStorage(),
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: createStorage(),
  writable: true,
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock fetch API for GitHub issues tests
global.fetch = vi.fn();

// Add custom matchers for better test readability
expect.extend({
  toBeValidExercise(received: any) {
    const isValid = received &&
      typeof received.id === 'string' &&
      typeof received.name === 'string' &&
      typeof received.muscle === 'string' &&
      typeof received.equipment === 'string';

    return {
      message: () =>
        `expected ${received} to be a valid exercise with required fields`,
      pass: isValid,
    };
  },

  toHaveQualityScore(received: any, expectedScore: number) {
    const hasQuality = received.quality &&
      typeof received.quality.completeness === 'number';

    const actualScore = hasQuality ? received.quality.completeness : 0;

    return {
      message: () =>
        `expected exercise to have quality score ${expectedScore}, but got ${actualScore}`,
      pass: actualScore === expectedScore,
    };
  },

  toBeFromDataSource(received: any, expectedSource: string) {
    const hasDataSource = received && typeof received.dataSource === 'string';
    const actualSource = hasDataSource ? received.dataSource : 'unknown';

    return {
      message: () =>
        `expected exercise to be from data source ${expectedSource}, but got ${actualSource}`,
      pass: actualSource === expectedSource,
    };
  }
});

// Extend the matchers interface
declare global {
  namespace Vi {
    interface Assertion<T = any> {
      toBeValidExercise(): T;
      toHaveQualityScore(expected: number): T;
      toBeFromDataSource(expected: string): T;
    }
  }
}

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

export {};
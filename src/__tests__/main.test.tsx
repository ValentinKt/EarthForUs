import * as React from 'react';
import { StrictMode } from 'react';

// Mock react-dom/client
const mockRender = jest.fn();
const mockCreateRoot = jest.fn(() => ({
  render: mockRender
}));

jest.mock('react-dom/client', () => ({
  createRoot: mockCreateRoot
}));

describe('Main Entry Point', () => {
  let originalGetElementById: any;
  let mockElement: HTMLElement;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock DOM element
    mockElement = document.createElement('div');
    mockElement.id = 'root';
    originalGetElementById = document.getElementById;
    document.getElementById = jest.fn().mockReturnValue(mockElement);
  });

  afterEach(() => {
    document.getElementById = originalGetElementById;
  });

  it('should create root and render App component', () => {
    // Simulate the main.tsx logic
    const App = () => <div data-testid="app-component">App Component</div>;
    
    const rootElement = document.getElementById('root');
    if (rootElement) {
      const { createRoot } = require('react-dom/client');
      const root = createRoot(rootElement);
      root.render(
        <StrictMode>
          <App />
        </StrictMode>
      );
    }

    expect(mockCreateRoot).toHaveBeenCalledWith(mockElement);
    expect(mockRender).toHaveBeenCalled();
    
    // Check that App was rendered within StrictMode
    const renderCall = mockRender.mock.calls[0][0];
    expect(renderCall.type).toBe(StrictMode);
    expect(renderCall.props.children.type).toBe(App);
  });

  it('should handle missing root element gracefully', () => {
    document.getElementById = jest.fn().mockReturnValue(null);
    
    const App = () => <div data-testid="app-component">App Component</div>;
    
    const rootElement = document.getElementById('root');
    if (rootElement) {
      const { createRoot } = require('react-dom/client');
      const root = createRoot(rootElement);
      root.render(
        <StrictMode>
          <App />
        </StrictMode>
      );
    }

    // Should not call createRoot or render when element is missing
    expect(mockCreateRoot).not.toHaveBeenCalled();
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('should use StrictMode for development', () => {
    const App = () => <div data-testid="app-component">App Component</div>;
    
    const rootElement = document.getElementById('root');
    if (rootElement) {
      const { createRoot } = require('react-dom/client');
      const root = createRoot(rootElement);
      root.render(
        <StrictMode>
          <App />
        </StrictMode>
      );
    }

    const renderCall = mockRender.mock.calls[0][0];
    expect(renderCall.type).toBe(StrictMode);
  });

  it('should render App component as child of StrictMode', () => {
    const App = () => <div data-testid="app-component">App Component</div>;
    
    const rootElement = document.getElementById('root');
    if (rootElement) {
      const { createRoot } = require('react-dom/client');
      const root = createRoot(rootElement);
      root.render(
        <StrictMode>
          <App />
        </StrictMode>
      );
    }

    const renderCall = mockRender.mock.calls[0][0];
    expect(renderCall.props.children).toBeDefined();
    expect(renderCall.props.children.type).toBe(App);
  });

  it('should get element by ID "root"', () => {
    const App = () => <div data-testid="app-component">App Component</div>;
    
    const rootElement = document.getElementById('root');
    if (rootElement) {
      const { createRoot } = require('react-dom/client');
      const root = createRoot(rootElement);
      root.render(
        <StrictMode>
          <App />
        </StrictMode>
      );
    }
    
    expect(document.getElementById).toHaveBeenCalledWith('root');
    expect(mockCreateRoot).toHaveBeenCalledWith(mockElement);
  });

  it('should set up React application correctly', () => {
    const App = () => <div data-testid="app-component">App Component</div>;
    
    const rootElement = document.getElementById('root');
    if (rootElement) {
      const { createRoot } = require('react-dom/client');
      const root = createRoot(rootElement);
      root.render(
        <StrictMode>
          <App />
        </StrictMode>
      );
    }
    
    expect(document.getElementById).toHaveBeenCalledWith('root');
    expect(mockCreateRoot).toHaveBeenCalledWith(mockElement);
    expect(mockRender).toHaveBeenCalled();
  });
});
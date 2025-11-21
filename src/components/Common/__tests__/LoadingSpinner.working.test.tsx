import * as React from 'react';
import { render, screen } from '@testing-library/react';

// Import component
const LoadingSpinner = require('../LoadingSpinner').default;

describe('LoadingSpinner Component', () => {
  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<LoadingSpinner />);
      expect(container).toBeTruthy();
    });

    it('should render an SVG element', () => {
      render(<LoadingSpinner />);
      const svg = document.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should render with animation class', () => {
      render(<LoadingSpinner />);
      const svg = document.querySelector('svg');
      expect(svg?.classList.contains('animate-spin')).toBe(true);
    });
  });

  describe('Size Variants', () => {
    it('should render with default medium size', () => {
      render(<LoadingSpinner />);
      const svg = document.querySelector('svg');
      expect(svg?.classList.contains('w-6')).toBe(true);
      expect(svg?.classList.contains('h-6')).toBe(true);
    });

    it('should render with small size', () => {
      render(<LoadingSpinner size="sm" />);
      const svg = document.querySelector('svg');
      expect(svg?.classList.contains('w-4')).toBe(true);
      expect(svg?.classList.contains('h-4')).toBe(true);
    });

    it('should render with medium size', () => {
      render(<LoadingSpinner size="md" />);
      const svg = document.querySelector('svg');
      expect(svg?.classList.contains('w-6')).toBe(true);
      expect(svg?.classList.contains('h-6')).toBe(true);
    });

    it('should render with large size', () => {
      render(<LoadingSpinner size="lg" />);
      const svg = document.querySelector('svg');
      expect(svg?.classList.contains('w-8')).toBe(true);
      expect(svg?.classList.contains('h-8')).toBe(true);
    });

    it('should render with extra large size', () => {
      render(<LoadingSpinner size="xl" />);
      const svg = document.querySelector('svg');
      expect(svg?.classList.contains('w-12')).toBe(true);
      expect(svg?.classList.contains('h-12')).toBe(true);
    });
  });

  describe('Color Variants', () => {
    it('should render with default blue color', () => {
      render(<LoadingSpinner />);
      const svg = document.querySelector('svg');
      expect(svg?.classList.contains('text-blue-600')).toBe(true);
    });

    it('should render with blue color', () => {
      render(<LoadingSpinner color="blue" />);
      const svg = document.querySelector('svg');
      expect(svg?.classList.contains('text-blue-600')).toBe(true);
    });

    it('should render with green color', () => {
      render(<LoadingSpinner color="green" />);
      const svg = document.querySelector('svg');
      expect(svg?.classList.contains('text-green-600')).toBe(true);
    });

    it('should render with gray color', () => {
      render(<LoadingSpinner color="gray" />);
      const svg = document.querySelector('svg');
      expect(svg?.classList.contains('text-gray-600')).toBe(true);
    });
  });

  describe('SVG Structure', () => {
    it('should have correct SVG attributes', () => {
      render(<LoadingSpinner />);
      const svg = document.querySelector('svg');
      expect(svg?.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
      expect(svg?.getAttribute('fill')).toBe('none');
      expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
    });

    it('should render circle element', () => {
      render(<LoadingSpinner />);
      const circle = document.querySelector('circle');
      expect(circle).toBeTruthy();
      expect(circle?.getAttribute('cx')).toBe('12');
      expect(circle?.getAttribute('cy')).toBe('12');
      expect(circle?.getAttribute('r')).toBe('10');
      expect(circle?.getAttribute('stroke-width')).toBe('4');
    });

    it('should render path element', () => {
      render(<LoadingSpinner />);
      const path = document.querySelector('path');
      expect(path).toBeTruthy();
      expect(path?.getAttribute('fill')).toBe('currentColor');
    });

    it('should have correct opacity classes', () => {
      render(<LoadingSpinner />);
      const circle = document.querySelector('circle');
      const path = document.querySelector('path');
      
      expect(circle?.classList.contains('opacity-25')).toBe(true);
      expect(path?.classList.contains('opacity-75')).toBe(true);
    });
  });

  describe('Container Div', () => {
    it('should render with inline-block class', () => {
      render(<LoadingSpinner />);
      const container = document.querySelector('.inline-block');
      expect(container).toBeTruthy();
    });

    it('should apply custom className', () => {
      render(<LoadingSpinner className="custom-class" />);
      const container = document.querySelector('.inline-block');
      expect(container?.classList.contains('custom-class')).toBe(true);
    });

    it('should combine default and custom classes', () => {
      render(<LoadingSpinner className="custom-class another-class" />);
      const container = document.querySelector('.inline-block');
      expect(container?.classList.contains('inline-block')).toBe(true);
      expect(container?.classList.contains('custom-class')).toBe(true);
      expect(container?.classList.contains('another-class')).toBe(true);
    });
  });

  describe('Combined Props', () => {
    it('should render with size and color combined', () => {
      render(<LoadingSpinner size="lg" color="green" />);
      const svg = document.querySelector('svg');
      expect(svg?.classList.contains('w-8')).toBe(true);
      expect(svg?.classList.contains('h-8')).toBe(true);
      expect(svg?.classList.contains('text-green-600')).toBe(true);
    });

    it('should render with size, color and className combined', () => {
      render(<LoadingSpinner size="xl" color="gray" className="my-spinner" />);
      const container = document.querySelector('.inline-block');
      const svg = document.querySelector('svg');
      
      expect(container?.classList.contains('my-spinner')).toBe(true);
      expect(svg?.classList.contains('w-12')).toBe(true);
      expect(svg?.classList.contains('h-12')).toBe(true);
      expect(svg?.classList.contains('text-gray-600')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty className', () => {
      render(<LoadingSpinner className="" />);
      const container = document.querySelector('.inline-block');
      expect(container).toBeTruthy();
    });

    it('should handle undefined className', () => {
      render(<LoadingSpinner className={undefined} />);
      const container = document.querySelector('.inline-block');
      expect(container).toBeTruthy();
    });

    it('should render consistently across multiple renders', () => {
      const { container: container1 } = render(<LoadingSpinner />);
      const { container: container2 } = render(<LoadingSpinner />);
      
      expect(container1.innerHTML).toBe(container2.innerHTML);
    });
  });
});
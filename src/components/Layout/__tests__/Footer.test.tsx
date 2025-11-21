import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Import component
import Footer from '../Footer';

const renderFooter = () => {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
};

describe('Footer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderFooter();
      expect(container).toBeTruthy();
    });

    it('should display the brand name and logo', () => {
      renderFooter();
      
      expect(screen.getByText('EarthForUs')).toBeTruthy();
      const logoIcon = screen.getByText('EarthForUs').closest('div')?.querySelector('svg');
      expect(logoIcon).toBeTruthy();
    });

    it('should display the company description', () => {
      renderFooter();
      
      expect(screen.getByText('Connecting passionate volunteers with meaningful environmental initiatives. Together, we can make a difference for our planet.')).toBeTruthy();
    });

    it('should display the copyright information', () => {
      renderFooter();
      
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(`© ${currentYear} EarthForUs. All rights reserved.`)).toBeTruthy();
    });
  });

  describe('Quick Links Section', () => {
    it('should display Quick Links heading', () => {
      renderFooter();
      
      expect(screen.getByText('Quick Links')).toBeTruthy();
    });

    it('should display all quick links', () => {
      renderFooter();
      
      expect(screen.getByText('Browse Events')).toBeTruthy();
      expect(screen.getByText('Create Event')).toBeTruthy();
      expect(screen.getByText('Become a Volunteer')).toBeTruthy();
      expect(screen.getByText('About Us')).toBeTruthy();
    });

    it('should have correct href attributes for quick links', () => {
      renderFooter();
      
      const browseEventsLink = screen.getByText('Browse Events').closest('a');
      const createEventLink = screen.getByText('Create Event').closest('a');
      const volunteerLink = screen.getByText('Become a Volunteer').closest('a');
      const aboutLink = screen.getByText('About Us').closest('a');
      
      expect(browseEventsLink).toHaveAttribute('href', '/events');
      expect(createEventLink).toHaveAttribute('href', '/create-event');
      expect(volunteerLink).toHaveAttribute('href', '/volunteer-signup');
      expect(aboutLink).toHaveAttribute('href', '/about');
    });
  });

  describe('Support Section', () => {
    it('should display Support heading', () => {
      renderFooter();
      
      expect(screen.getByText('Support')).toBeTruthy();
    });

    it('should display all support links', () => {
      renderFooter();
      
      expect(screen.getByText('Help Center')).toBeTruthy();
      expect(screen.getByText('Contact Us')).toBeTruthy();
      expect(screen.getByText('Terms of Service')).toBeTruthy();
      expect(screen.getByText('Privacy Policy')).toBeTruthy();
    });

    it('should have correct href attributes for support links', () => {
      renderFooter();
      
      const helpLink = screen.getByText('Help Center').closest('a');
      const contactLink = screen.getByText('Contact Us').closest('a');
      const termsLink = screen.getByText('Terms of Service').closest('a');
      const privacyLink = screen.getByText('Privacy Policy').closest('a');
      
      expect(helpLink).toHaveAttribute('href', '/help');
      expect(contactLink).toHaveAttribute('href', '/contact');
      expect(termsLink).toHaveAttribute('href', '/terms');
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });
  });

  describe('Bottom Section', () => {
    it('should display bottom links', () => {
      renderFooter();
      
      expect(screen.getByText('Terms')).toBeTruthy();
      expect(screen.getByText('Privacy')).toBeTruthy();
      expect(screen.getByText('Cookies')).toBeTruthy();
    });

    it('should have correct href attributes for bottom links', () => {
      renderFooter();
      
      const termsLink = screen.getAllByText('Terms')[0]; // There are multiple "Terms" links
      const privacyLink = screen.getAllByText('Privacy')[0];
      const cookiesLink = screen.getByText('Cookies');
      
      expect(termsLink.closest('a')).toHaveAttribute('href', '/terms');
      expect(privacyLink.closest('a')).toHaveAttribute('href', '/privacy');
      expect(cookiesLink.closest('a')).toHaveAttribute('href', '/cookies');
    });
  });

  describe('Social Media Links', () => {
    it('should display social media icons', () => {
      renderFooter();
      
      const facebookLink = screen.getByLabelText('Facebook');
      const twitterLink = screen.getByLabelText('Twitter');
      const instagramLink = screen.getByLabelText('Instagram');
      
      expect(facebookLink).toBeTruthy();
      expect(twitterLink).toBeTruthy();
      expect(instagramLink).toBeTruthy();
    });

    it('should have correct social media link attributes', () => {
      renderFooter();
      
      const facebookLink = screen.getByLabelText('Facebook');
      const twitterLink = screen.getByLabelText('Twitter');
      const instagramLink = screen.getByLabelText('Instagram');
      
      expect(facebookLink).toHaveAttribute('href', '#');
      expect(twitterLink).toHaveAttribute('href', '#');
      expect(instagramLink).toHaveAttribute('href', '#');
    });
  });

  describe('Styling', () => {
    it('should have correct footer styling', () => {
      renderFooter();
      
      const footer = screen.getByText('EarthForUs').closest('footer');
      expect(footer).toHaveClass('bg-white', 'dark:bg-gray-800');
      expect(footer).toHaveClass('border-t', 'border-gray-200', 'dark:border-gray-700');
    });

    it('should have correct container styling', () => {
      renderFooter();
      
      const container = screen.getByText('EarthForUs').closest('.max-w-7xl');
      expect(container).toHaveClass('max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8', 'py-12');
    });

    it('should have correct grid layout', () => {
      renderFooter();
      
      const grid = screen.getByText('EarthForUs').closest('div')?.parentElement?.querySelector('.grid');
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-4', 'gap-8');
    });

    it('should have correct link styling', () => {
      renderFooter();
      
      const browseEventsLink = screen.getByText('Browse Events').closest('a');
      expect(browseEventsLink).toHaveClass('text-gray-600', 'dark:text-gray-400');
      expect(browseEventsLink).toHaveClass('hover:text-primary-600', 'dark:hover:text-primary-400');
      expect(browseEventsLink).toHaveClass('transition-colors', 'duration-200');
    });

    it('should have correct section heading styling', () => {
      renderFooter();
      
      const quickLinksHeading = screen.getByText('Quick Links');
      expect(quickLinksHeading).toHaveClass('text-sm', 'font-semibold', 'text-gray-900', 'dark:text-white');
      expect(quickLinksHeading).toHaveClass('uppercase', 'tracking-wider', 'mb-4');
    });

    it('should have correct bottom section styling', () => {
      renderFooter();
      
      const bottomSection = screen.getByText(`© ${new Date().getFullYear()} EarthForUs. All rights reserved.`).closest('div');
      expect(bottomSection).toHaveClass('mt-8', 'pt-8', 'border-t', 'border-gray-200', 'dark:border-gray-700');
      expect(bottomSection).toHaveClass('flex', 'flex-col', 'md:flex-row', 'justify-between', 'items-center');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid layout', () => {
      renderFooter();
      
      const grid = screen.getByText('EarthForUs').closest('div')?.parentElement?.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-4');
    });

    it('should have responsive bottom section layout', () => {
      renderFooter();
      
      const bottomSection = screen.getByText(`© ${new Date().getFullYear()} EarthForUs. All rights reserved.`).closest('div');
      expect(bottomSection).toHaveClass('flex-col', 'md:flex-row');
    });

    it('should have responsive spacing', () => {
      renderFooter();
      
      const bottomSection = screen.getByText(`© ${new Date().getFullYear()} EarthForUs. All rights reserved.`).closest('div');
      expect(bottomSection).toHaveClass('mt-4', 'md:mt-0'); // mt-4 for mobile, md:mt-0 for desktop
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple instances of same text', () => {
      renderFooter();
      
      // There are multiple "Terms" and "Privacy" links
      const allTermsLinks = screen.getAllByText('Terms');
      const allPrivacyLinks = screen.getAllByText('Privacy');
      
      expect(allTermsLinks.length).toBeGreaterThan(1);
      expect(allPrivacyLinks.length).toBeGreaterThan(1);
    });

    it('should render with all elements correctly', () => {
      const { container } = renderFooter();
      expect(container.firstChild).toBeTruthy();
    });
  });
});
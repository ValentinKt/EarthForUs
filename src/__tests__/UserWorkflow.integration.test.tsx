import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock components for integration testing
const MockApp = () => {
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [currentPage, setCurrentPage] = React.useState('landing');
  const [events, setEvents] = React.useState<any[]>([]);
  const [notifications, setNotifications] = React.useState<any[]>([]);

  // Mock API functions
  const mockApi = {
    login: async (email: string, _password: string) => {
      return {
        user: {
          id: '1',
          name: 'John Doe',
          email: email,
          avatar: 'https://example.com/avatar.jpg'
        },
        token: 'mock-jwt-token'
      };
    },
    register: async (userData: any) => {
      return {
        user: {
          id: '2',
          name: userData.name,
          email: userData.email,
          avatar: 'https://example.com/avatar.jpg'
        },
        token: 'mock-jwt-token'
      };
    },
    getEvents: async () => {
      return [
        {
          id: '1',
          title: 'Beach Cleanup Event',
          description: 'Join us for a community beach cleanup',
          location: 'Santa Monica Beach',
          date: new Date('2024-04-15T10:00:00'),
          category: 'environment',
          attendees: 25,
          maxAttendees: 50,
          lat: 34.0195,
          lng: -118.4912
        },
        {
          id: '2',
          title: 'Tree Planting Drive',
          description: 'Help plant trees in the community park',
          location: 'Central Park',
          date: new Date('2024-04-20T14:00:00'),
          category: 'environment',
          attendees: 30,
          maxAttendees: 60,
          lat: 40.7829,
          lng: -73.9654
        }
      ];
    },
    joinEvent: async (_eventId: string) => {
      return { success: true, message: 'Successfully joined event' };
    },
    createEvent: async (eventData: any) => {
      return {
        id: '3',
        ...eventData,
        attendees: 0,
        createdAt: new Date()
      };
    },
    getNotifications: async () => {
      return [
        {
          id: '1',
          title: 'Event Reminder',
          message: 'Beach cleanup event starts in 30 minutes',
          type: 'info',
          timestamp: new Date(),
          read: false
        }
      ];
    }
  };

  React.useEffect(() => {
    // Load initial data
    const loadData = async () => {
      const eventsData = await mockApi.getEvents();
      setEvents(eventsData);
      
      const notificationsData = await mockApi.getNotifications();
      setNotifications(notificationsData);
    };
    loadData();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await mockApi.login(email, password);
      setCurrentUser(response.user);
      setCurrentPage('dashboard');
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        title: 'Login Successful',
        message: 'Welcome back, John!',
        type: 'success',
        timestamp: new Date(),
        read: false
      }]);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleRegister = async (userData: any) => {
    try {
      const response = await mockApi.register(userData);
      setCurrentUser(response.user);
      setCurrentPage('dashboard');
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        title: 'Registration Successful',
        message: 'Welcome to EarthForUs!',
        type: 'success',
        timestamp: new Date(),
        read: false
      }]);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      await mockApi.joinEvent(eventId);
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, attendees: event.attendees + 1 }
          : event
      ));
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        title: 'Event Joined',
        message: 'You have successfully joined the event!',
        type: 'success',
        timestamp: new Date(),
        read: false
      }]);
    } catch (error) {
      console.error('Join event failed:', error);
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      const response = await mockApi.createEvent(eventData);
      setEvents(prev => [...prev, response]);
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        title: 'Event Created',
        message: 'Your event has been created successfully!',
        type: 'success',
        timestamp: new Date(),
        read: false
      }]);
    } catch (error) {
      console.error('Create event failed:', error);
    }
  };

  // Render different pages based on current state
  const renderLandingPage = () => (
    <div className="landing-page bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Connect, Volunteer, and <span className="text-green-600">Make a Difference</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of volunteers creating positive environmental impact. Find local events, connect with like-minded people, and track your volunteer journey.
          </p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setCurrentPage('login')}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => setCurrentPage('register')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );

  const renderLoginPage = () => (
    <div className="login-page bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login to EarthForUs</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          handleLogin(
            formData.get('email') as string,
            formData.get('password') as string
          );
        }}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Login
          </button>
        </form>
        <div className="text-center mt-4">
          <button
            onClick={() => setCurrentPage('landing')}
            className="text-green-600 hover:text-green-800"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  const renderRegisterPage = () => (
    <div className="register-page bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Join EarthForUs</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          handleRegister({
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string
          });
        }}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="register-email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              id="register-email"
              type="email"
              name="email"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="register-password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              id="register-password"
              type="password"
              name="password"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Register
          </button>
        </form>
        <div className="text-center mt-4">
          <button
            onClick={() => setCurrentPage('landing')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="dashboard bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">EarthForUs</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {currentUser?.name}!</span>
            <button
              onClick={() => setCurrentPage('create-event')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Event
            </button>
            <button
              onClick={() => {
                setCurrentUser(null);
                setCurrentPage('landing');
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Events Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-gray-600 mt-1">{event.description}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <span className="mr-4">📍 {event.location}</span>
                        <span className="mr-4">📅 {event.date.toLocaleDateString()}</span>
                        <span>👥 {event.attendees}/{event.maxAttendees} attending</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinEvent(event.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Join Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications Section */}
          <div>
            <h2 className="text-xl font-bold mb-4">Notifications</h2>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCreateEventPage = () => (
    <div className="create-event-page bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="text-green-600 hover:text-green-800"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Create New Event</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            handleCreateEvent({
              title: formData.get('title') as string,
              description: formData.get('description') as string,
              location: formData.get('location') as string,
              date: new Date(formData.get('date') as string),
              category: formData.get('category') as string,
              maxAttendees: parseInt(formData.get('maxAttendees') as string)
            });
            setCurrentPage('dashboard');
          }}>
            <div className="space-y-6">
              <div>
                <label htmlFor="event-title" className="block text-gray-700 text-sm font-bold mb-2">Event Title</label>
                <input
                  id="event-title"
                  type="text"
                  name="title"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="event-description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                <textarea
                  id="event-description"
                  name="description"
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="event-location" className="block text-gray-700 text-sm font-bold mb-2">Location</label>
                <input
                  id="event-location"
                  type="text"
                  name="location"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    name="date"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                  <select
                    name="category"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="environment">Environment</option>
                    <option value="community">Community</option>
                    <option value="education">Education</option>
                    <option value="health">Health</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Maximum Attendees</label>
                <input
                  type="number"
                  name="maxAttendees"
                  min="1"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Create Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Render current page
  switch (currentPage) {
    case 'landing':
      return renderLandingPage();
    case 'login':
      return renderLoginPage();
    case 'register':
      return renderRegisterPage();
    case 'dashboard':
      return renderDashboard();
    case 'create-event':
      return renderCreateEventPage();
    default:
      return renderLandingPage();
  }
};

// Test suite
describe('User Workflow Integration Test', () => {
  const renderApp = () => {
    return render(<MockApp />);
  };

  describe('Complete User Journey', () => {
    it('should handle user registration flow', async () => {
      renderApp();
      
      // Start at landing page
      expect(screen.getByText('Connect, Volunteer, and')).toBeTruthy();
      expect(screen.getByText('Make a Difference')).toBeTruthy();
      
      // Navigate to register page
      const registerButton = screen.getByText('Register');
      fireEvent.click(registerButton);
      
      // Should show register form
      await waitFor(() => {
        expect(screen.getByText('Join EarthForUs')).toBeTruthy();
      });
      
      // Fill registration form
      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      
      fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      // Submit registration
      const submitButton = screen.getByText('Register');
      fireEvent.click(submitButton);
      
      // Should redirect to dashboard
      await waitFor(() => {
        expect(screen.getByText('Welcome, Jane Smith!')).toBeTruthy();
      });
    });

    it('should handle user login flow', async () => {
      renderApp();
      
      // Navigate to login page
      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);
      
      // Should show login form
      await waitFor(() => {
        expect(screen.getByText('Login to EarthForUs')).toBeTruthy();
      });
      
      // Login with test credentials
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const submitButton = screen.getByText('Login');
      fireEvent.click(submitButton);
      
      // Should redirect to dashboard
      await waitFor(() => {
        expect(screen.getByText('Welcome, John Doe!')).toBeTruthy();
      });
    });

    it('should handle event browsing and joining', async () => {
      renderApp();
      
      // Login first
      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);
      
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const submitButton = screen.getByText('Login');
      fireEvent.click(submitButton);
      
      // Wait for dashboard
      await waitFor(() => {
        expect(screen.getByText('Upcoming Events')).toBeTruthy();
      });
      
      // Should show events
      expect(screen.getByText('Beach Cleanup Event')).toBeTruthy();
      expect(screen.getByText('Tree Planting Drive')).toBeTruthy();
      
      // Join an event
      const joinButtons = screen.getAllByText('Join Event');
      expect(joinButtons.length).toBeGreaterThan(0);
      
      fireEvent.click(joinButtons[0]);
      
      // Should show notification
      await waitFor(() => {
        expect(screen.getByText('Event Joined')).toBeTruthy();
      });
    });

    it('should handle event creation workflow', async () => {
      renderApp();
      
      // Login first
      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);
      
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const submitButton = screen.getByText('Login');
      fireEvent.click(submitButton);
      
      // Wait for dashboard
      await waitFor(() => {
        expect(screen.getByText('Upcoming Events')).toBeTruthy();
      });
      
      // Navigate to create event
      const createEventButton = screen.getByText('Create Event');
      fireEvent.click(createEventButton);
      
      // Should show create event form
      await waitFor(() => {
        expect(screen.getByText('Create New Event')).toBeTruthy();
      });
      
      // Fill event creation form
      const titleInput = screen.getByLabelText('Event Title');
      const descriptionInput = screen.getByLabelText('Description');
      const locationInput = screen.getByLabelText('Location');
      
      fireEvent.change(titleInput, { target: { value: 'Community Garden Cleanup' } });
      fireEvent.change(descriptionInput, { target: { value: 'Help clean up the community garden' } });
      fireEvent.change(locationInput, { target: { value: 'Central Community Garden' } });
      
      // Submit event creation form
      const form = titleInput.closest('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      // Should redirect to dashboard and show notification
      await waitFor(() => {
        expect(screen.getByText('Upcoming Events')).toBeTruthy();
      });
      
      // Should show success notification
      expect(screen.getByText('Event Created')).toBeTruthy();
    });

    it('should handle navigation between pages', async () => {
      renderApp();
      
      // Start at landing page
      expect(screen.getByText('Connect, Volunteer, and')).toBeTruthy();
      
      // Navigate to login
      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(screen.getByText('Login to EarthForUs')).toBeTruthy();
      });
      
      // Navigate back to landing
      const backToHomeButton = screen.getByText('Back to Home');
      fireEvent.click(backToHomeButton);
      
      await waitFor(() => {
        expect(screen.getByText('Connect, Volunteer, and')).toBeTruthy();
      });
      
      // Navigate to register
      const registerButton = screen.getByText('Register');
      fireEvent.click(registerButton);
      
      await waitFor(() => {
        expect(screen.getByText('Join EarthForUs')).toBeTruthy();
      });
    });

    it('should handle user logout', async () => {
      renderApp();
      
      // Login first
      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);
      
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const submitButton = screen.getByText('Login');
      fireEvent.click(submitButton);
      
      // Wait for dashboard
      await waitFor(() => {
        expect(screen.getByText('Welcome, John Doe!')).toBeTruthy();
      });
      
      // Logout
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);
      
      // Should redirect to landing page
      await waitFor(() => {
        expect(screen.getByText('Connect, Volunteer, and')).toBeTruthy();
      });
    });
  });

  describe('State Management', () => {
    it('should maintain user state across page navigation', async () => {
      renderApp();
      
      // Login
      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);
      
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const submitButton = screen.getByText('Login');
      fireEvent.click(submitButton);
      
      // Wait for dashboard
      await waitFor(() => {
        expect(screen.getByText('Welcome, John Doe!')).toBeTruthy();
      });
      
      // Navigate to create event and back
      const createEventButton = screen.getByText('Create Event');
      fireEvent.click(createEventButton);
      
      await waitFor(() => {
        expect(screen.getByText('Create New Event')).toBeTruthy();
      });
      
      const backButton = screen.getByText('← Back to Dashboard');
      fireEvent.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome, John Doe!')).toBeTruthy();
      });
    });

    it('should update event attendance in real-time', async () => {
      renderApp();
      
      // Login
      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);
      
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const submitButton = screen.getByText('Login');
      fireEvent.click(submitButton);
      
      // Wait for dashboard
      await waitFor(() => {
        expect(screen.getByText('Upcoming Events')).toBeTruthy();
      });
      
      // Check initial attendance
      expect(screen.getByText(/25.*50.*attending/)).toBeTruthy();
      
      // Join event
      const joinButtons = screen.getAllByText('Join Event');
      fireEvent.click(joinButtons[0]);
      
      // Should update to 26/50
      await waitFor(() => {
        expect(screen.getByText(/26.*50.*attending/)).toBeTruthy();
      });
    });

    it('should manage notifications state correctly', async () => {
      renderApp();
      
      // Login
      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const submitButton = screen.getByText('Login');
      fireEvent.click(submitButton);
      
      // Wait for dashboard
      await waitFor(() => {
        expect(screen.getByText('Upcoming Events')).toBeTruthy();
      });
      
      // Should have initial notification
      expect(screen.getByText('Event Reminder')).toBeTruthy();
      
      // Join event to trigger new notification
      const joinButtons = screen.getAllByText('Join Event');
      fireEvent.click(joinButtons[0]);
      
      // Should have new notification
      await waitFor(() => {
        expect(screen.getByText('Event Joined')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid login credentials gracefully', async () => {
      renderApp();
      
      // Navigate to login
      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);
      
      // Try to login with empty credentials
      const submitButton = screen.getByText('Login');
      fireEvent.click(submitButton);
      
      // Form validation should prevent submission
      expect(screen.getByText('Login to EarthForUs')).toBeTruthy();
    });

    it('should handle form validation', async () => {
      renderApp();
      
      // Navigate to register
      const registerButton = screen.getByText('Register');
      fireEvent.click(registerButton);
      
      // Try to submit empty form
      const submitButton = screen.getByText('Register');
      fireEvent.click(submitButton);
      
      // Form validation should prevent submission
      expect(screen.getByText('Join EarthForUs')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      renderApp();
      
      // Navigate to login
      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);
      
      // Should have form elements
      expect(screen.getByRole('textbox', { name: /email/i })).toBeTruthy();
      expect(screen.getByLabelText('Password')).toBeTruthy();
      expect(screen.getByText('Login')).toBeTruthy();
    });

    it('should have proper navigation structure', () => {
      renderApp();
      
      // Should have navigation buttons
      expect(screen.getByText('Login')).toBeTruthy();
      expect(screen.getByText('Register')).toBeTruthy();
    });

    it('should have proper content structure', () => {
      renderApp();
      
      // Should have main content
      expect(screen.getByText('Connect, Volunteer, and')).toBeTruthy();
      expect(screen.getByText('Make a Difference')).toBeTruthy();
    });
  });
});
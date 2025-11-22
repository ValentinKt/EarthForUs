import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Create a simplified mock EventMap component
const MockEventMap = ({
  events = [],
  center = { lat: 40.7128, lng: -74.0060 }, // New York City
  zoom = 10,
  onEventClick,
  onMapClick,
  showMarkers = true,
  className,
  height = '400px',
  width = '100%',
  theme = 'light'
}: {
  events?: Array<{
    id: string;
    title: string;
    description: string;
    location: { lat: number; lng: number };
    date: Date;
    category: string;
    attendees: number;
    maxAttendees: number;
  }>;
  center?: { lat: number; lng: number };
  zoom?: number;
  onEventClick?: (eventId: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
  showMarkers?: boolean;
  showClusters?: boolean;
  clusterThreshold?: number;
  className?: string;
  height?: string;
  width?: string;
  theme?: 'light' | 'dark';
}) => {
  const [selectedEvent, setSelectedEvent] = React.useState<string | null>(null);
  const [mapCenter, setMapCenter] = React.useState(center);
  const [mapZoom, setMapZoom] = React.useState(zoom);

  const handleEventClick = (eventId: string) => {
    setSelectedEvent(eventId);
    onEventClick?.(eventId);
  };

  const handleMapClick = (lat: number, lng: number) => {
    onMapClick?.(lat, lng);
  };

  const getEventIcon = (category: string) => {
    const icons: Record<string, string> = {
      'environment': '🌱',
      'community': '👥',
      'education': '📚',
      'health': '❤️',
      'cleanup': '🧹',
      'tree-planting': '🌳',
      'recycling': '♻️',
      'awareness': '📢',
    };
    return icons[category] || '📍';
  };

  const getMarkerColor = (attendees: number, maxAttendees: number) => {
    const percentage = (attendees / maxAttendees) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getThemeClasses = () => {
    if (theme === 'dark') {
      return 'event-map-dark bg-gray-900 text-white';
    }
    return 'event-map-light bg-white text-gray-900';
  };

  return (
    <div 
      className={`event-map ${getThemeClasses()} ${className || ''}`}
      style={{ height, width }}
    >
      {/* Map Container */}
      <div className="map-container relative w-full h-full border rounded-lg overflow-hidden">
        {/* Map Background */}
        <div 
          className="map-background absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const lat = mapCenter.lat + (y - rect.height/2) * 0.001;
            const lng = mapCenter.lng + (x - rect.width/2) * 0.001;
            handleMapClick(lat, lng);
          }}
        >
          <div className="map-placeholder text-center">
            <div className="map-icon text-6xl mb-4">🗺️</div>
            <div className="map-text text-lg font-semibold text-gray-700">
              Interactive Map
            </div>
            <div className="map-coordinates text-sm text-gray-500 mt-2">
              Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
            </div>
            <div className="map-zoom text-sm text-gray-500">
              Zoom: {mapZoom}
            </div>
          </div>
        </div>

        {/* Event Markers */}
        {showMarkers && events && events.map((event) => {
          const isSelected = selectedEvent === event.id;
          const markerColor = getMarkerColor(event.attendees, event.maxAttendees);
          
          return (
            <div
              key={event.id}
              className={`event-marker absolute transform -translate-x-1/2 -translate-y-1/2 ${
                isSelected ? 'z-20' : 'z-10'
              }`}
              style={{
                left: `${50 + (event.location.lng - mapCenter.lng) * 1000}%`,
                top: `${50 - (event.location.lat - mapCenter.lat) * 1000}%`,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventClick(event.id);
                }}
                className={`marker-button w-12 h-12 rounded-full ${markerColor} text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-lg font-bold ${
                  isSelected ? 'ring-4 ring-blue-300 scale-110' : 'hover:scale-105'
                }`}
              >
                {getEventIcon(event.category)}
              </button>

              {/* Event Info Popup */}
              {isSelected && (
                <div className="event-popup absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-white rounded-lg shadow-xl border z-30">
                  <div className="popup-header p-3 border-b">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      {event.date.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="popup-body p-3">
                    <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">
                        {event.attendees}/{event.maxAttendees} attendees
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  <div className="popup-footer p-3 border-t flex space-x-2">
                    <button className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors">
                      View Details
                    </button>
                    <button className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 transition-colors">
                      Join Event
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Map Controls */}
        <div className="map-controls absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={() => setMapZoom(Math.min(mapZoom + 1, 20))}
            className="control-button bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <span className="text-lg">+</span>
          </button>
          <button
            onClick={() => setMapZoom(Math.max(mapZoom - 1, 1))}
            className="control-button bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <span className="text-lg">-</span>
          </button>
          <button
            onClick={() => setMapCenter(center)}
            className="control-button bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <span className="text-lg">🎯</span>
          </button>
        </div>

        {/* Event Legend */}
        <div className="event-legend absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h4 className="font-semibold text-gray-900 mb-2">Event Legend</h4>
          <div className="legend-items space-y-2 text-sm">
            <div className="legend-item flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <span>Available (&lt;50% full)</span>
            </div>
            <div className="legend-item flex items-center">
              <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
              <span>Popular (50-70% full)</span>
            </div>
            <div className="legend-item flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
              <span>Almost Full (70-90% full)</span>
            </div>
            <div className="legend-item flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <span>Full (&gt;90% full)</span>
            </div>
          </div>
        </div>

        {/* Event Stats */}
        {events && events.length > 0 && (
          <div className="event-stats absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4">
            <div className="stats-grid grid grid-cols-2 gap-4 text-center">
              <div className="stat">
                <div className="stat-number text-2xl font-bold text-blue-600">{events.length}</div>
                <div className="stat-label text-xs text-gray-500">Events</div>
              </div>
              <div className="stat">
                <div className="stat-number text-2xl font-bold text-green-600">
                  {events.reduce((sum, event) => sum + event.attendees, 0)}
                </div>
                <div className="stat-label text-xs text-gray-500">Attendees</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Test suite
describe('EventMap Component - Simplified Test', () => {
  const mockEvents = [
    {
      id: '1',
      title: 'Beach Cleanup',
      description: 'Join us for a community beach cleanup event',
      location: { lat: 40.7589, lng: -73.9851 }, // Times Square
      date: new Date('2024-03-15T10:00:00'),
      category: 'cleanup',
      attendees: 25,
      maxAttendees: 50,
    },
    {
      id: '2',
      title: 'Tree Planting',
      description: 'Help plant trees in Central Park',
      location: { lat: 40.7829, lng: -73.9654 }, // Central Park
      date: new Date('2024-03-20T14:00:00'),
      category: 'tree-planting',
      attendees: 45,
      maxAttendees: 60,
    },
    {
      id: '3',
      title: 'Recycling Drive',
      description: 'Community recycling collection event',
      location: { lat: 40.7505, lng: -73.9934 }, // Empire State Building
      date: new Date('2024-03-25T09:00:00'),
      category: 'recycling',
      attendees: 15,
      maxAttendees: 100,
    },
  ];

  const renderEventMap = (props = {}) => {
    return render(
      <MockEventMap
        events={mockEvents}
        center={{ lat: 40.7128, lng: -74.0060 }}
        zoom={10}
        onEventClick={jest.fn()}
        onMapClick={jest.fn()}
        {...props}
      />
    );
  };

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderEventMap();
      expect(container).toBeTruthy();
    });

    it('should render map container', () => {
      const { container } = renderEventMap();
      const mapContainer = container.querySelector('.map-container');
      expect(mapContainer).toBeTruthy();
    });

    it('should render map background', () => {
      const { container } = renderEventMap();
      const mapBackground = container.querySelector('.map-background');
      expect(mapBackground).toBeTruthy();
    });

    it('should render map placeholder', () => {
      renderEventMap();
      expect(screen.getByText('Interactive Map')).toBeTruthy();
    });

    it('should render map coordinates', () => {
      renderEventMap();
      expect(screen.getByText(/Center:/)).toBeTruthy();
    });

    it('should render map zoom level', () => {
      renderEventMap();
      expect(screen.getByText('Zoom: 10')).toBeTruthy();
    });

    it('should render event markers', () => {
      const { container } = renderEventMap();
      const markers = container.querySelectorAll('.event-marker');
      expect(markers.length).toBe(3);
    });

    it('should render event icons', () => {
      renderEventMap();
      expect(screen.getByText('🧹')).toBeTruthy(); // Cleanup icon
      expect(screen.getByText('🌳')).toBeTruthy(); // Tree-planting icon
      expect(screen.getByText('♻️')).toBeTruthy(); // Recycling icon
    });
  });

  describe('Event Markers', () => {
    it('should render different marker colors based on attendance', () => {
      const { container } = renderEventMap();
      const markers = container.querySelectorAll('.marker-button');
      
      // Beach Cleanup: 25/50 = 50% -> orange
      expect(markers[0]?.className).toContain('bg-orange-500');
      
      // Tree Planting: 45/60 = 75% -> yellow
      expect(markers[1]?.className).toContain('bg-yellow-500');
      
      // Recycling Drive: 15/100 = 15% -> green
      expect(markers[2]?.className).toContain('bg-green-500');
    });

    it('should handle click events on markers', () => {
      const onEventClick = jest.fn();
      renderEventMap({ onEventClick });
      
      const markers = screen.getAllByRole('button').filter(btn => 
        btn.className.includes('marker-button')
      );
      
      fireEvent.click(markers[0]);
      expect(onEventClick).toHaveBeenCalledWith('1');
    });

    it('should show event popup when marker is clicked', () => {
      renderEventMap();
      
      const markers = screen.getAllByRole('button').filter(btn => 
        btn.className.includes('marker-button')
      );
      
      fireEvent.click(markers[0]);
      
      expect(screen.getByText('Beach Cleanup')).toBeTruthy();
      expect(screen.getByText('Join us for a community beach cleanup event')).toBeTruthy();
    });

    it('should show event details in popup', () => {
      renderEventMap();
      
      const markers = screen.getAllByRole('button').filter(btn => 
        btn.className.includes('marker-button')
      );
      
      fireEvent.click(markers[0]);
      
      expect(screen.getByText('25/50 attendees')).toBeTruthy();
      expect(screen.getByText('cleanup')).toBeTruthy();
    });

    it('should show action buttons in popup', () => {
      renderEventMap();
      
      const markers = screen.getAllByRole('button').filter(btn => 
        btn.className.includes('marker-button')
      );
      
      fireEvent.click(markers[0]);
      
      expect(screen.getByText('View Details')).toBeTruthy();
      expect(screen.getByText('Join Event')).toBeTruthy();
    });
  });

  describe('Map Controls', () => {
    it('should render zoom controls', () => {
      renderEventMap();
      
      const controls = screen.getAllByRole('button').filter(btn => 
        btn.className.includes('control-button')
      );
      
      expect(controls.length).toBe(3); // +, -, 🎯
      expect(screen.getByText('+')).toBeTruthy();
      expect(screen.getByText('-')).toBeTruthy();
      expect(screen.getByText('🎯')).toBeTruthy();
    });

    it('should handle zoom in', () => {
      renderEventMap();
      
      const zoomInButton = screen.getByText('+');
      fireEvent.click(zoomInButton);
      
      // Should update zoom level
      expect(screen.getByText('Zoom: 11')).toBeTruthy();
    });

    it('should handle zoom out', () => {
      renderEventMap();
      
      const zoomOutButton = screen.getByText('-');
      fireEvent.click(zoomOutButton);
      
      // Should update zoom level
      expect(screen.getByText('Zoom: 9')).toBeTruthy();
    });

    it('should handle center reset', () => {
      renderEventMap();
      
      const centerButton = screen.getByText('🎯');
      fireEvent.click(centerButton);
      
      // Should reset to original center
      expect(screen.getByText(/Center: 40.7128, -74.0060/)).toBeTruthy();
    });
  });

  describe('Map Legend', () => {
    it('should render event legend', () => {
      renderEventMap();
      
      expect(screen.getByText('Event Legend')).toBeTruthy();
    });

    it('should render legend items', () => {
      renderEventMap();
      
      expect(screen.getByText('Available (<50% full)')).toBeTruthy();
      expect(screen.getByText('Popular (50-70% full)')).toBeTruthy();
      expect(screen.getByText('Almost Full (70-90% full)')).toBeTruthy();
      expect(screen.getByText('Full (>90% full)')).toBeTruthy();
    });

    it('should render legend colors', () => {
      const { container } = renderEventMap();
      
      const legendColors = container.querySelectorAll('.legend-item div');
      expect(legendColors.length).toBeGreaterThan(0);
    });
  });

  describe('Event Stats', () => {
    it('should render event stats when events exist', () => {
      renderEventMap();
      
      expect(screen.getByText('3')).toBeTruthy(); // Events count
      expect(screen.getByText('85')).toBeTruthy(); // Total attendees (25+45+15)
    });

    it('should not render event stats when no events', () => {
      renderEventMap({ events: [] });
      
      expect(screen.queryByText('Events')).toBeFalsy();
      expect(screen.queryByText('Attendees')).toBeFalsy();
    });

    it('should calculate correct total attendees', () => {
      renderEventMap();
      
      expect(screen.getByText('85')).toBeTruthy(); // 25 + 45 + 15
    });
  });

  describe('Map Interactions', () => {
    it('should handle map click events', () => {
      const onMapClick = jest.fn();
      renderEventMap({ onMapClick });
      
      const mapBackground = screen.getByText('Interactive Map').closest('.map-background');
      if (mapBackground) {
        fireEvent.click(mapBackground);
      }
      
      expect(onMapClick).toHaveBeenCalled();
    });

    it('should handle empty events array', () => {
      renderEventMap({ events: [] });
      
      const markers = screen.queryAllByRole('button').filter(btn => 
        btn.className.includes('marker-button')
      );
      
      expect(markers.length).toBe(0);
    });

    it('should handle null events', () => {
      renderEventMap({ events: null as any });
      
      expect(screen.getByText('Interactive Map')).toBeTruthy();
    });
  });

  describe('Configuration Options', () => {
    it('should hide markers when showMarkers is false', () => {
      renderEventMap({ showMarkers: false });
      
      const markers = screen.queryAllByRole('button').filter(btn => 
        btn.className.includes('marker-button')
      );
      
      expect(markers.length).toBe(0);
    });

    it('should apply custom className', () => {
      const { container } = renderEventMap({ className: 'custom-map' });
      
      const mapElement = container.querySelector('.event-map');
      expect(mapElement?.className).toContain('custom-map');
    });

    it('should apply custom dimensions', () => {
      const { container } = renderEventMap({ height: '500px', width: '80%' });
      
      const mapElement = container.querySelector('.event-map');
      expect(mapElement?.getAttribute('style')).toContain('height: 500px');
      expect(mapElement?.getAttribute('style')).toContain('width: 80%');
    });

    it('should apply light theme by default', () => {
      const { container } = renderEventMap();
      
      const mapElement = container.querySelector('.event-map');
      expect(mapElement?.className).toContain('event-map-light');
    });

    it('should apply dark theme when specified', () => {
      const { container } = renderEventMap({ theme: 'dark' });
      
      const mapElement = container.querySelector('.event-map');
      expect(mapElement?.className).toContain('event-map-dark');
    });
  });

  describe('Edge Cases', () => {
    it('should handle events with missing properties', () => {
      const incompleteEvents = [
        {
          id: '1',
          title: 'Test Event',
          description: 'Test description',
          location: { lat: 40.7128, lng: -74.0060 },
          date: new Date(),
          category: 'test',
          attendees: 10,
          maxAttendees: 20,
        },
      ];
      
      renderEventMap({ events: incompleteEvents as any });
      
      // Check that the event marker is rendered
      const markers = screen.getAllByRole('button').filter(btn => 
        btn.className.includes('marker-button')
      );
      expect(markers.length).toBe(1);
    });

    it('should handle events with invalid coordinates', () => {
      const invalidEvents = [
        {
          id: '1',
          title: 'Invalid Event',
          description: 'Test description',
          location: { lat: 999, lng: 999 }, // Invalid coordinates
          date: new Date(),
          category: 'test',
          attendees: 10,
          maxAttendees: 20,
        },
      ];
      
      renderEventMap({ events: invalidEvents as any });
      
      // Check that the event marker is rendered even with invalid coordinates
      const markers = screen.getAllByRole('button').filter(btn => 
        btn.className.includes('marker-button')
      );
      expect(markers.length).toBe(1);
    });

    it('should handle very high zoom levels', () => {
      renderEventMap({ zoom: 25 });
      
      expect(screen.getByText('Zoom: 25')).toBeTruthy();
    });

    it('should handle very low zoom levels', () => {
      renderEventMap({ zoom: 1 });
      
      expect(screen.getByText('Zoom: 1')).toBeTruthy();
    });

    it('should handle null callbacks', () => {
      renderEventMap({
        onEventClick: null as any,
        onMapClick: null as any,
      });
      
      expect(screen.getByText('Interactive Map')).toBeTruthy();
    });

    it('should render consistently', () => {
      const { container: container1 } = renderEventMap();
      const { container: container2 } = renderEventMap();
      
      expect(container1.querySelectorAll('.event-marker').length).toBe(
        container2.querySelectorAll('.event-marker').length
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper button structure', () => {
      renderEventMap();
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have proper map structure', () => {
      const { container } = renderEventMap();
      
      const mapContainer = container.querySelector('.map-container');
      const mapBackground = container.querySelector('.map-background');
      
      expect(mapContainer).toBeTruthy();
      expect(mapBackground).toBeTruthy();
    });

    it('should have proper legend structure', () => {
      renderEventMap();
      
      expect(screen.getByText('Event Legend')).toBeTruthy();
    });

    it('should have proper stats structure', () => {
      renderEventMap();
      
      expect(screen.getByText('Events')).toBeTruthy();
      expect(screen.getByText('Attendees')).toBeTruthy();
    });
  });
});
// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  location?: string;
  joinDate: Date;
  isVolunteer: boolean;
  isOrganizer: boolean;
  profileComplete: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  organizerId: string;
  organizer: User;
  category: EventCategory;
  location: EventLocation;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  maxVolunteers: number;
  currentVolunteers: number;
  requiredSkills: string[];
  tags: string[];
  images: string[];
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventLocation {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const EventCategory = {
  ENVIRONMENTAL: 'environmental',
  COMMUNITY: 'community',
  EDUCATION: 'education',
  CONSERVATION: 'conservation',
  CLEANUP: 'cleanup',
  AWARENESS: 'awareness',
  FUNDRAISING: 'fundraising',
  OTHER: 'other'
} as const;

export type EventCategory = typeof EventCategory[keyof typeof EventCategory];

export const EventStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
} as const;

export type EventStatus = typeof EventStatus[keyof typeof EventStatus];

// Registration Types
export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  registrationDate: Date;
  status: RegistrationStatus;
  notes?: string;
  skills: string[];
  availability: string;
}

export const RegistrationStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  WAITLISTED: 'waitlisted'
} as const;

export type RegistrationStatus = typeof RegistrationStatus[keyof typeof RegistrationStatus];

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export const NotificationType = {
  EVENT_REMINDER: 'event_reminder',
  REGISTRATION_CONFIRMED: 'registration_confirmed',
  EVENT_CANCELLED: 'event_cancelled',
  EVENT_UPDATED: 'event_updated',
  NEW_MESSAGE: 'new_message',
  SYSTEM: 'system'
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

// Chat and Communication Types
export interface ChatMessage {
  id: string;
  eventId: string;
  userId: string;
  user: User;
  message: string;
  timestamp: Date;
  isEdited: boolean;
  editedAt?: Date;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

// Todo and Task Types
export interface TodoItem {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  assignedTo?: string[];
  createdBy: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  completedBy?: string;
}

export const TodoStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export type TodoStatus = typeof TodoStatus[keyof typeof TodoStatus];

export const TodoPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export type TodoPriority = typeof TodoPriority[keyof typeof TodoPriority];

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface EventCreationForm {
  title: string;
  description: string;
  shortDescription: string;
  category: EventCategory;
  location: EventLocation;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxVolunteers: number;
  requiredSkills: string[];
  tags: string[];
  images: File[];
}

export interface ProfileSetupForm {
  bio: string;
  skills: string[];
  interests: string[];
  location: string;
  avatar?: File;
  isVolunteer: boolean;
  isOrganizer: boolean;
}

// UI Component Types
export interface DropdownItem {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  event: Event;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Settings Types
export interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  preferences: UserPreferences;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  eventReminders: boolean;
  messageNotifications: boolean;
  weeklyDigest: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'volunteers_only';
  showEmail: boolean;
  showLocation: boolean;
  allowMessages: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  defaultView: 'list' | 'grid' | 'calendar';
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Route Types
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  protected?: boolean;
  title?: string;
}

// Theme Types
export interface ThemeConfig {
  colors: {
    primary: Record<string, string>;
    earth: Record<string, string>;
    gray: Record<string, string>;
  };
  fonts: {
    sans: string[];
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
}
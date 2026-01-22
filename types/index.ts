export interface Location {
  id: string;
  name: string;
  description?: string;
  setting?: string;
  permitStatus?: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  availability?: {
    start: string;
    end: string;
    type: 'available' | 'unavailable' | 'tentative';
  }[];
  projectId?: string;
  [key: string]: any;
}

export interface Contact {
  id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  type: 'cast' | 'crew' | 'vendor';
  department?: string;
  address?: string;
  rates?: {
    type: string;
    amount: number;
    currency: string;
    unit: string;
  }[];
  availability?: {
    start: string;
    end: string;
    type: 'available' | 'unavailable' | 'tentative';
  }[];
  projectId?: string;
  [key: string]: any;
}

export interface Character {
  id: string;
  name: string;
  role?: string;
  description?: string;
  photo?: string;
  actorId?: string;
  traits: string[];
  scenes: string[];
  projectId?: string;
  scriptId?: string;
  [key: string]: any;
}

export interface Scene {
  id: string;
  sceneNumber: string;
  content?: string;
  heading?: string;
  time?: string;
  status?: string;
  estimatedTime?: number;
  locationId?: string;
  metadata?: any;
  logistics?: any;
  technical?: any;
  audio?: any;
  creative?: any;
  shotList?: any;
  aiHistory?: any;
  projectId?: string;
  [key: string]: any;
}

export interface Script {
  id: string;
  title: string;
  content: string;
  version: string | number;
  updatedAt: string | Date;
  createdAt?: string | Date;
  createdBy?: string;
  projectId?: string;
  project_id?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'script' | 'scene' | 'character' | 'location';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  mentions: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  referenceId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ShootingDay {
  id: string;
  date: string;
  locationId?: string;
  status: string;
  callTime: string;
  wrapTime?: string;
  notes?: string;
  scenes: string[];
  crew: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  type?: string;
  locationId?: string;
  description?: string;
  castMembers?: string[];
  backgroundColor?: string;
  borderColor?: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size?: number;
  url?: string;
  folder?: string;
  uploadedAt?: string | Date;
}

export interface WeatherData {
  date: Date;
  locationId: string;
  temperature: number;
  condition: string;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  sunrise: Date;
  sunset: Date;
  goldenHourAM: Date;
  goldenHourPM: Date;
}

export interface ContinuityItem {
  id: string;
  sceneId: string;
  type: string;
  description: string;
  photos?: string[];
  [key: string]: any;
}
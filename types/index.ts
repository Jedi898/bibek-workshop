// Core types
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'crew' | 'viewer';
  avatar?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  type: 'shoot' | 'meeting' | 'deadline' | 'rehearsal' | 'other';
  color: string;
  projectId: string;
  createdBy: string;
  attendees?: string[]; // User IDs
  location?: string;
}

export interface Script {
  id: string;
  title: string;
  content: string;
  projectId: string;
  version: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  parentVersionId?: string; // For version control
}

export interface ScriptVersion {
  id: string;
  scriptId: string;
  version: number;
  content: string;
  createdAt: Date;
  createdBy: string;
}

export interface Scene {
  id: string;
  scriptId: string;
  sceneNumber: number;
  title: string;
  description: string;
  locationId?: string;
  characters: string[]; // Character IDs
  props: string[];
  wardrobe: string[];
  vehicles: string[];
  specialEffects: string[];
  estimatedTime: number; // in minutes
  timeOfDay: 'day' | 'night' | 'both';
  interiorExterior: 'int' | 'ext' | 'both';
  status: 'pending' | 'scheduled' | 'shot' | 'completed';
}

export interface Character {
  id: string;
  name: string;
  description?: string;
  age?: string;
  appearance?: string;
  personality?: string;
  background?: string;
  traits: string[];
  projectId: string;
  scriptId: string;
  actorId?: string; // Link to Contact
  scenes: string[]; // Scene IDs
  costumeNotes?: string;
  photoUrl?: string;
  relationships?: { characterId: string; relationship: string }[];
}

export interface Location {
  id: string;
  name: string;
  address: string;
  description?: string;
  projectId: string;
  scriptId?: string;
  contactId?: string; // Owner/contact
  availability: DateRange[];
  permitRequired: boolean;
  permitStatus?: 'pending' | 'approved' | 'denied';
  photos: string[];
  floorPlanUrl?: string;
  scenes: string[]; // Scene IDs
  notes?: string;
}

export interface Contact {
  id: string;
  name: string;
  type: 'cast' | 'crew' | 'vendor' | 'studio';
  department?: string;
  role?: string;
  email?: string;
  phone?: string;
  address?: string;
  rates?: Rate[];
  availability: DateRange[];
  projectId: string;
  notes?: string;
  documents?: string[]; // File URLs
}

export interface DateRange {
  start: Date;
  end: Date;
  type: 'available' | 'unavailable' | 'booked';
}

export interface Rate {
  type: string;
  amount: number;
  unit: 'hour' | 'day' | 'week' | 'project';
  currency: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'script' | 'scene' | 'character' | 'location' | 'general';
  referenceId?: string; // ID of the item being annotated
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  mentions: string[]; // User IDs
  dueDate?: Date;
  attachments?: string[]; // File URLs
}

export interface ShootingDay {
  id: string;
  date: Date;
  projectId: string;
  scenes: string[]; // Scene IDs
  crew: string[]; // Contact IDs
  locationId: string;
  callTime: Date;
  wrapTime?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  weather?: WeatherData;
  notes?: string;
  callSheetId?: string;
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

export interface FileItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  projectId: string;
  folder: string;
  uploadedBy: string;
  uploadedAt: Date;
  version?: number;
  parentFileId?: string;
}

export interface ContinuityItem {
  id: string;
  scriptId: string;
  sceneNo: string;
  shot: string;
  take: string;
  soundNo: string;
  fileNo: string;
  description: string;
  remarks: string;
}

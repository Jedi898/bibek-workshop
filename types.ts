export interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
  description?: string;
  location?: string;
  resourceId?: string;
  castMembers?: string[];
  type?: string;
  backgroundColor?: string;
  borderColor?: string;
}

export interface Character {
  id: string;
  name: string;
  role?: string;
  description?: string;
  photo?: string;
  actorId?: string;
  traits?: string[];
  scenes?: string[];
  projectId?: string;
  scriptId?: string;
  [key: string]: any;
}

// Contact interface for directory
export interface Contact {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  notes?: string;
  department?: string;
  type?: string;
  address?: string;
  rates?: {
    type: string;
    amount: number;
    currency: string;
    unit: string;
  }[];
  availability?: {
    start: string | Date;
    end: string | Date;
    type: string;
  }[];
}

export interface FileItem {
  id: string;
  name: string;
  folder?: string;
  type: string;
  size?: number;
  path?: string;
  parentId?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  uploadedAt?: Date;
  mimeType?: string;
  url?: string;
  projectId?: string;
  uploadedBy?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  mentions: string[];
  createdBy: string;
  projectId: string;
  referenceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Script {
  id: string;
  title: string;
  content: string;
  version: string | number;
  updatedAt: string;
  projectId?: string;
  project_id?: string;
}

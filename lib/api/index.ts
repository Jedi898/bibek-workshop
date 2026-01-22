import { supabase } from '../supabase';
import { 
  CalendarEvent, 
  Script, 
  Scene, 
  Character, 
  Location, 
  Note, 
  Contact 
} from '@/types/index';

export const fetchCalendarEvents = async (projectId: string): Promise<CalendarEvent[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('project_id', projectId);

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return data.map((event: any) => ({
    id: event.id,
    title: event.title,
    start: event.start_time,
    end: event.end_time,
    allDay: event.all_day,
    type: event.event_type,
    locationId: event.location_id,
    description: event.description,
    castMembers: event.cast_members,
    backgroundColor: event.background_color,
    borderColor: event.border_color
  }));
};

export const fetchScripts = async (projectId: string): Promise<Script[]> => {
  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .eq('project_id', projectId);

  if (error) {
    console.error('Error fetching scripts:', error);
    return [];
  }

  return data.map((script: any) => ({
    id: script.id,
    title: script.title,
    content: script.content,
    version: script.version,
    updatedAt: script.updated_at,
    projectId: script.project_id,
    project_id: script.project_id
  }));
};

export const fetchScenes = async (projectId: string): Promise<Scene[]> => {
  const { data, error } = await supabase
    .from('scenes')
    .select('*')
    .eq('project_id', projectId);

  if (error) {
    console.error('Error fetching scenes:', error);
    return [];
  }

  return data.map((scene: any) => ({
    id: scene.id,
    sceneNumber: scene.scene_number,
    content: scene.content,
    heading: scene.heading,
    time: scene.time,
    status: scene.status,
    estimatedTime: scene.estimated_time,
    locationId: scene.location_id,
    metadata: scene.metadata,
    logistics: scene.logistics,
    technical: scene.technical,
    audio: scene.audio,
    creative: scene.creative,
    shotList: scene.shot_list,
    aiHistory: scene.ai_history,
    projectId: scene.project_id
  }));
};

export const fetchCharacters = async (projectId: string): Promise<Character[]> => {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('project_id', projectId);

  if (error) {
    console.error('Error fetching characters:', error);
    return [];
  }

  return data.map((char: any) => ({
    id: char.id,
    name: char.name,
    role: char.role,
    description: char.description,
    photo: char.photo,
    actorId: char.actor_id,
    traits: char.traits || [],
    scenes: char.scenes || [],
    projectId: char.project_id
  }));
};

export const fetchLocations = async (projectId: string): Promise<Location[]> => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('project_id', projectId);

  if (error) {
    console.error('Error fetching locations:', error);
    return [];
  }

  return data.map((loc: any) => ({
    id: loc.id,
    name: loc.name,
    description: loc.description,
    setting: loc.setting,
    permitStatus: loc.permit_status,
    address: loc.address,
    coordinates: loc.coordinates,
    availability: loc.availability,
    projectId: loc.project_id
  }));
};

export const fetchNotes = async (projectId: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('project_id', projectId);

  if (error) {
    console.error('Error fetching notes:', error);
    return [];
  }

  return data.map((note: any) => ({
    id: note.id,
    title: note.title,
    content: note.content,
    type: note.type,
    priority: note.priority,
    tags: note.tags || [],
    mentions: note.mentions || [],
    createdBy: note.created_by,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
    projectId: note.project_id,
    referenceId: note.reference_id
  }));
};

export const fetchContacts = async (projectId: string): Promise<Contact[]> => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('project_id', projectId);

  if (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }

  return data.map((contact: any) => ({
    id: contact.id,
    name: contact.name,
    role: contact.role,
    email: contact.email,
    phone: contact.phone,
    type: contact.type,
    department: contact.department,
    address: contact.address,
    rates: contact.rates,
    availability: contact.availability,
    projectId: contact.project_id
  }));
};
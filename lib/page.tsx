'use client';

import { useState, useEffect } from 'react';
import CalendarView from '@/components/CalendarView';
import FileStorage from '@/components/FileStorage';
import ScriptEditor from '@/components/ScriptEditor';
import SceneBreakdown from '@/components/SceneBreakdown';
import DatabaseManager from '@/components/DatabaseManager';
import NotesManager from '@/components/NotesManager';
import ShootingSchedule from '@/components/ShootingSchedule';
import ContactDirectory from '@/components/ContactDirectory';
import { 
  CalendarEvent, 
  Script, 
  Scene, 
  Character, 
  Location, 
  Note, 
  Contact, 
  ShootingDay 
} from '@/types/index';
import { 
  fetchCalendarEvents, 
  fetchScripts, 
  fetchScenes, 
  fetchCharacters, 
  fetchLocations, 
  fetchNotes, 
  fetchContacts 
} from '@/lib/api';

interface ProductionPageProps {
  params: {
    projectId: string;
  };
}

export default function ProductionPage({ params }: ProductionPageProps) {
  const { projectId } = params;
  
  const [activeTab, setActiveTab] = useState('calendar');
  const [isLoading, setIsLoading] = useState(true);
  
  // State for all data
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [shootingDays, setShootingDays] = useState<ShootingDay[]>([]);
  
  useEffect(() => {
    loadData();
  }, [projectId]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        eventsData,
        scriptsData,
        scenesData,
        charactersData,
        locationsData,
        notesData,
        contactsData
      ] = await Promise.all([
        fetchCalendarEvents(projectId),
        fetchScripts(projectId),
        fetchScenes(projectId),
        fetchCharacters(projectId),
        fetchLocations(projectId),
        fetchNotes(projectId),
        fetchContacts(projectId)
      ]);
      
      setCalendarEvents(eventsData);
      setScripts(scriptsData);
      setScenes(scenesData);
      setCharacters(charactersData);
      setLocations(locationsData);
      setNotes(notesData);
      setContacts(contactsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const tabs = [
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'scripts', label: 'Scripts', icon: '📝' },
    { id: 'breakdown', label: 'Breakdown', icon: '📋' },
    { id: 'database', label: 'Database', icon: '🗃️' },
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'schedule', label: 'Schedule', icon: '⏰' },
    { id: 'contacts', label: 'Contacts', icon: '👥' },
    { id: 'files', label: 'Files', icon: '📁' }
  ];
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading production data...</p>
        </div>
      </div>
    );
  }
  
  const currentScript = scripts[0];
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Production Dashboard</h1>
              <p className="text-gray-600">Manage your pre-production workflow</p>
            </div>
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Export Report
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                Share
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <nav className="flex space-x-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-white text-blue-600 border-t border-l border-r' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 overflow-y-auto w-full">
        {activeTab === 'calendar' && (
          <CalendarView
            projectId={projectId}
            events={calendarEvents}
            onEventClick={(event) => console.log('Event clicked:', event)}
            onEventDrop={(eventId, newStart, newEnd) => 
              console.log('Event moved:', eventId, newStart, newEnd)
            }
          />
        )}
        
        {activeTab === 'scripts' && currentScript && (
          <ScriptEditor
            script={{
              ...currentScript,
              updatedAt: new Date(currentScript.updatedAt).toISOString()
            } as any}
            projectId={projectId}
            onSave={async (content) => {
              console.log('Saving script:', content);
              // Implement save logic
            }}
          />
        )}
        
        {activeTab === 'breakdown' && (
          <SceneBreakdown
            scenes={scenes.map(s => ({
              ...s,
              location: { 
                type: s.heading?.includes('EXT') ? 'EXT.' : 'INT.',
                name: locations.find(l => l.id === s.locationId)?.name || 'Unknown'
              },
              summary: s.metadata?.summary || '',
              script: s.content || ''
            })) as any}
            characters={characters}
            locations={locations}
            projectId={projectId}
            onUpdateScene={async (sceneId, updates) => {
              console.log('Updating scene:', sceneId, updates);
              // Implement update logic
            }}
          />
        )}
        
        {activeTab === 'database' && (
          <DatabaseManager
            characters={characters}
            locations={locations}
            contacts={contacts}
            projectId={projectId}
            onUpdateCharacter={async (characterId, updates) => {
              console.log('Updating character:', characterId, updates);
              // Implement update logic
            }}
            onUpdateLocation={async (locationId, updates) => {
              console.log('Updating location:', locationId, updates);
              // Implement update logic
            }}
          />
        )}
        
        {activeTab === 'notes' && (
          <NotesManager
            notes={notes}
            users={[]} // Pass actual users
            projectId={projectId}
            onCreateNote={async (note) => {
              console.log('Creating note:', note);
              // Implement create logic
            }}
            onUpdateNote={async (noteId, updates) => {
              console.log('Updating note:', noteId, updates);
              // Implement update logic
            }}
            onDeleteNote={async (noteId) => {
              console.log('Deleting note:', noteId);
              // Implement delete logic
            }}
          />
        )}
        
        {activeTab === 'schedule' && (
          <ShootingSchedule
            scenes={scenes}
            locations={locations}
            contacts={contacts}
            projectId={projectId}
            onScheduleGenerated={async (schedule) => {
              console.log('Schedule generated:', schedule);
              setShootingDays(schedule);
              // Implement save logic
            }}
          />
        )}
        
        {activeTab === 'contacts' && (
          <ContactDirectory
            contacts={contacts}
            projectId={projectId}
            onUpdateContact={async (contactId, updates) => {
              console.log('Updating contact:', contactId, updates);
              // Implement update logic
            }}
          />
        )}
        
        {activeTab === 'files' && (
          <FileStorage
            projectId={projectId}
            initialFiles={[]} // Pass actual files
          />
        )}
      </main>
    </div>
  );
}
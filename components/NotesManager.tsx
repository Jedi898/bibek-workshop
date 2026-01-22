'use client';

import { useState, useMemo } from 'react';
import { Note, User } from '@/types/index';

interface NotesManagerProps {
  notes: Note[];
  users: User[];
  projectId: string;
  onCreateNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateNote: (noteId: string, updates: Partial<Note>) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
}

export default function NotesManager({
  notes,
  users,
  projectId,
  onCreateNote,
  onUpdateNote,
  onDeleteNote
}: NotesManagerProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'mentioned' | 'high-priority'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    type: 'general' as Note['type'],
    priority: 'medium' as Note['priority'],
    tags: [] as string[],
    mentions: [] as string[]
  });

  const filteredNotes = useMemo(() => {
    const currentUserId = 'current-user-id'; // Replace with actual user ID from auth
    
    switch (activeTab) {
      case 'mine':
        return notes.filter(note => note.createdBy === currentUserId);
      case 'mentioned':
        return notes.filter(note => note.mentions.includes(currentUserId));
      case 'high-priority':
        return notes.filter(note => note.priority === 'high' || note.priority === 'urgent');
      default:
        return notes;
    }
  }, [notes, activeTab]);

  const handleCreateNote = async () => {
    await onCreateNote({
      ...newNote,
      projectId,
      createdBy: 'current-user-id',
      referenceId: undefined
    });
    setShowCreateModal(false);
    setNewNote({
      title: '',
      content: '',
      type: 'general',
      priority: 'medium',
      tags: [],
      mentions: []
    });
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            {['all', 'mine', 'mentioned', 'high-priority'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3 py-1 rounded capitalize ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + New Note
          </button>
        </div>
      </div>

      <div className="p-4">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No notes found. Create your first note!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map(note => (
              <div key={note.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{note.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${priorityColors[note.priority]}`}>
                    {note.priority}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {note.type} • {new Date(note.createdAt).toLocaleDateString()}
                </div>
                <p className="text-gray-700 mb-4 line-clamp-3">{note.content}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {note.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    By {users.find(u => u.id === note.createdBy)?.name || 'Unknown'}
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Edit
                    </button>
                    <button 
                      onClick={() => onDeleteNote(note.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Note Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Create New Note</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Note title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                    className="w-full border rounded px-3 py-2 h-32"
                    placeholder="Note content..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={newNote.type}
                      onChange={(e) => setNewNote({...newNote, type: e.target.value as Note['type']})}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="general">General</option>
                      <option value="script">Script</option>
                      <option value="scene">Scene</option>
                      <option value="character">Character</option>
                      <option value="location">Location</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={newNote.priority}
                      onChange={(e) => setNewNote({...newNote, priority: e.target.value as Note['priority']})}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNote}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
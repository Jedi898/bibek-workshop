'use client'

import { useState, useEffect } from 'react'
import { Note } from '@/types'

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')

  useEffect(() => {
    const saved = localStorage.getItem('notesState')
    if (saved) setNotes(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('notesState', JSON.stringify(notes))
  }, [notes])

  const handleAdd = () => {
    if (!newNote.trim()) return
    const note: Note = {
      id: Date.now().toString(),
      title: 'Note',
      content: newNote,
      type: 'general',
      priority,
      tags: [],
      mentions: [],
      createdBy: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setNotes([note, ...notes])
    setNewNote('')
  }

  const handleDelete = (id: string) => {
    setNotes(notes.filter(n => n.id !== id))
  }

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'high': return 'bg-red-50 border-red-200'
      case 'medium': return 'bg-yellow-50 border-yellow-200'
      case 'low': return 'bg-blue-50 border-blue-200'
      default: return 'bg-white border-gray-200'
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Production Notes</h2>
      
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full border rounded p-3 h-24 mb-3"
          placeholder="Type a new note..."
        />
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={() => setPriority('low')}
              className={`px-3 py-1 rounded text-sm ${priority === 'low' ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300' : 'bg-gray-100'}`}
            >
              Low
            </button>
            <button 
              onClick={() => setPriority('medium')}
              className={`px-3 py-1 rounded text-sm ${priority === 'medium' ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-300' : 'bg-gray-100'}`}
            >
              Medium
            </button>
            <button 
              onClick={() => setPriority('high')}
              className={`px-3 py-1 rounded text-sm ${priority === 'high' ? 'bg-red-100 text-red-800 ring-2 ring-red-300' : 'bg-gray-100'}`}
            >
              High
            </button>
          </div>
          <button 
            onClick={handleAdd}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Post Note
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map(note => (
          <div key={note.id} className={`p-4 rounded-lg border shadow-sm relative ${getPriorityColor(note.priority)}`}>
            <button 
              onClick={() => handleDelete(note.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
            <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
            <div className="mt-3 text-xs text-gray-500">
              {new Date(note.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
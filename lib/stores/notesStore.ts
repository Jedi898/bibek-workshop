import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Note {
  id: string
  title: string
  content: string
  type: 'scene' | 'character' | 'location' | 'general'
  referenceId?: string // ID of the referenced item (scene, character, etc.)
  createdAt: Date
  updatedAt: Date
  scriptId: string
}

interface NotesStore {
  notes: Note[]
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  getNotesByScript: (scriptId: string) => Note[]
  getNotesByType: (scriptId: string, type: Note['type']) => Note[]
  getNotesByReference: (referenceId: string) => Note[]
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      notes: [],

      addNote: (noteData) => {
        const newNote: Note = {
          ...noteData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
        set(state => ({
          notes: [...state.notes, newNote]
        }))
      },

      updateNote: (id: string, updates: Partial<Note>) => {
        set(state => ({
          notes: state.notes.map(note =>
            note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
          )
        }))
      },

      deleteNote: (id: string) => {
        set(state => ({
          notes: state.notes.filter(note => note.id !== id)
        }))
      },

      getNotesByScript: (scriptId: string) => {
        return get().notes
          .filter(note => note.scriptId === scriptId)
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      },

      getNotesByType: (scriptId: string, type: Note['type']) => {
        return get().notes
          .filter(note => note.scriptId === scriptId && note.type === type)
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      },

      getNotesByReference: (referenceId: string) => {
        return get().notes
          .filter(note => note.referenceId === referenceId)
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      }
    }),
    {
      name: 'notes-store'
    }
  )
)

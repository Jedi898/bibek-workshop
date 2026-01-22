import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Character } from '@/types/index'

interface CharacterStore {
  characters: Character[]
  addCharacter: (character: Omit<Character, 'id'>) => void
  updateCharacter: (id: string, updates: Partial<Character>) => void
  deleteCharacter: (id: string) => void
  getCharactersByScript: (scriptId: string) => Character[]
}

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
      characters: [],
      addCharacter: (charData) => set((state) => ({
        characters: [...state.characters, { ...charData, id: Math.random().toString(36).substring(2, 9) } as Character]
      })),
      updateCharacter: (id, updates) => set((state) => ({
        characters: state.characters.map((c) => c.id === id ? { ...c, ...updates } : c)
      })),
      deleteCharacter: (id) => set((state) => ({
        characters: state.characters.filter((c) => c.id !== id)
      })),
      getCharactersByScript: (scriptId) => get().characters.filter((c) => c.scriptId === scriptId)
    }),
    { name: 'character-storage' }
  )
)
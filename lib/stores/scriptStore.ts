import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Script } from '@/types'

interface ScriptStore {
  scripts: Script[]
  currentScript: Script | null
  addScript: (script: Omit<Script, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> & { createdBy?: string }) => void
  updateScript: (id: string, updates: Partial<Script>) => void
  deleteScript: (id: string) => void
  setCurrentScript: (script: Script | null) => void
  getScriptById: (id: string) => Script | undefined
}

export const useScriptStore = create<ScriptStore>()(
  persist(
    (set, get) => ({
      scripts: [],
      currentScript: null,
      addScript: (scriptData) => {
        const newScript: Script = {
          projectId: 'default',
          createdBy: 'user',
          ...scriptData,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          scripts: [newScript, ...state.scripts],
          currentScript: newScript
        }))
      },
      updateScript: (id, updates) => {
        set((state) => {
          const updatedScripts = state.scripts.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
          )
          const currentScript = state.currentScript?.id === id
            ? { ...state.currentScript, ...updates, updatedAt: new Date() } as Script
            : state.currentScript
          return { scripts: updatedScripts, currentScript }
        })
      },
      deleteScript: (id) => {
        set((state) => ({
          scripts: state.scripts.filter((s) => s.id !== id),
          currentScript: state.currentScript?.id === id ? null : state.currentScript
        }))
      },
      setCurrentScript: (script) => set({ currentScript: script }),
      getScriptById: (id) => get().scripts.find((s) => s.id === id),
    }),
    { name: 'script-storage' }
  )
)
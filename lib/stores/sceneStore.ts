import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Scene } from '@/types/index'

interface SceneStore {
  scenes: Scene[]
  addScene: (scene: Omit<Scene, 'id'>) => void
  updateScene: (id: string, updates: Partial<Scene>) => void
  deleteScene: (id: string) => void
  getScenesByScript: (scriptId: string) => Scene[]
}

export const useSceneStore = create<SceneStore>()(
  persist(
    (set, get) => ({
      scenes: [],
      addScene: (sceneData) => set((state) => ({
        scenes: [...state.scenes, { ...sceneData, id: Math.random().toString(36).substring(2, 9) } as Scene]
      })),
      updateScene: (id, updates) => set((state) => ({
        scenes: state.scenes.map((s) => s.id === id ? { ...s, ...updates } : s)
      })),
      deleteScene: (id) => set((state) => ({
        scenes: state.scenes.filter((s) => s.id !== id)
      })),
      getScenesByScript: (scriptId) => get().scenes.filter((s) => s.scriptId === scriptId)
    }),
    { name: 'scene-storage' }
  )
)
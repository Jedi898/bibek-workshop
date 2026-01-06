import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ContinuityItem } from '@/types'

interface ContinuityStore {
  items: ContinuityItem[]
  addItem: (item: Omit<ContinuityItem, 'id'>) => void
  updateItem: (id: string, updates: Partial<ContinuityItem>) => void
  deleteItem: (id: string) => void
  getItemsByScript: (scriptId: string) => ContinuityItem[]
}

export const useContinuityStore = create<ContinuityStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (itemData) => set((state) => ({
        items: [...state.items, { ...itemData, id: Date.now().toString() }]
      })),
      updateItem: (id, updates) => set((state) => ({
        items: state.items.map((item) => item.id === id ? { ...item, ...updates } : item)
      })),
      deleteItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id)
      })),
      getItemsByScript: (scriptId) => get().items.filter((item) => item.scriptId === scriptId)
    }),
    { name: 'continuity-storage' }
  )
)
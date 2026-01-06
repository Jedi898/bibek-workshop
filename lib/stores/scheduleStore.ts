import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ScheduleItem {
  id: string
  scriptId: string
  date: string
  startTime: string
  endTime: string
  location: string
  sceneIds: string[]
  notes?: string
  shots?: any[]
}

interface ScheduleStore {
  scheduleItems: ScheduleItem[]
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void
  deleteScheduleItem: (id: string) => void
  getScheduleByScript: (scriptId: string) => ScheduleItem[]
}

export const useScheduleStore = create<ScheduleStore>()(
  persist(
    (set, get) => ({
      scheduleItems: [],
      addScheduleItem: (item) => set((state) => ({
        scheduleItems: [...state.scheduleItems, { ...item, id: Math.random().toString(36).substring(2, 9) }]
      })),
      updateScheduleItem: (id, updates) => set((state) => ({
        scheduleItems: state.scheduleItems.map((i) => i.id === id ? { ...i, ...updates } : i)
      })),
      deleteScheduleItem: (id) => set((state) => ({
        scheduleItems: state.scheduleItems.filter((i) => i.id !== id)
      })),
      getScheduleByScript: (scriptId) => get().scheduleItems.filter((i) => i.scriptId === scriptId)
    }),
    { name: 'schedule-storage' }
  )
)
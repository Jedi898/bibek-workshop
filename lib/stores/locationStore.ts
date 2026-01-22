import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Location } from '@/types/index'

interface LocationStore {
  locations: Location[]
  addLocation: (location: Omit<Location, 'id'>) => void
  updateLocation: (id: string, updates: Partial<Location>) => void
  deleteLocation: (id: string) => void
  getLocationsByScript: (scriptId: string) => Location[]
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      locations: [],
      addLocation: (locData) => set((state) => ({
        locations: [...state.locations, { ...locData, id: Math.random().toString(36).substring(2, 9) } as Location]
      })),
      updateLocation: (id, updates) => set((state) => ({
        locations: state.locations.map((l) => l.id === id ? { ...l, ...updates } : l)
      })),
      deleteLocation: (id) => set((state) => ({
        locations: state.locations.filter((l) => l.id !== id)
      })),
      getLocationsByScript: (scriptId) => get().locations.filter((l) => l.scriptId === scriptId)
    }),
    { name: 'location-storage' }
  )
)
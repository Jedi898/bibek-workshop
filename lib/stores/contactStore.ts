import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Contact {
  id: string
  name: string
  role: 'cast' | 'crew' | 'vendor' | 'other'
  email?: string
  phone?: string
  address?: string
  notes: string
  availability: { date: string; available: boolean }[]
  scriptId: string
}

interface ContactStore {
  contacts: Contact[]
  addContact: (contact: Omit<Contact, 'id'>) => void
  updateContact: (id: string, updates: Partial<Contact>) => void
  deleteContact: (id: string) => void
  getContactsByScript: (scriptId: string) => Contact[]
  updateAvailability: (id: string, date: string, available: boolean) => void
}

export const useContactStore = create<ContactStore>()(
  persist(
    (set, get) => ({
      contacts: [],

      addContact: (contactData) => {
        const newContact: Contact = {
          ...contactData,
          id: Date.now().toString()
        }
        set(state => ({
          contacts: [...state.contacts, newContact]
        }))
      },

      updateContact: (id: string, updates: Partial<Contact>) => {
        set(state => ({
          contacts: state.contacts.map(contact =>
            contact.id === id ? { ...contact, ...updates } : contact
          )
        }))
      },

      deleteContact: (id: string) => {
        set(state => ({
          contacts: state.contacts.filter(contact => contact.id !== id)
        }))
      },

      getContactsByScript: (scriptId: string) => {
        return get().contacts.filter(contact => contact.scriptId === scriptId)
      },

      updateAvailability: (id: string, date: string, available: boolean) => {
        set(state => ({
          contacts: state.contacts.map(contact =>
            contact.id === id
              ? {
                  ...contact,
                  availability: [
                    ...contact.availability.filter(a => a.date !== date),
                    { date, available }
                  ]
                }
              : contact
          )
        }))
      }
    }),
    {
      name: 'contact-store'
    }
  )
)

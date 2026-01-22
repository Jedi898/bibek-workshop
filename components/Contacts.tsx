'use client'

import { useState, useEffect } from 'react'
import { Contact } from '@/types/index' // Assuming this type is compatible with the DB schema
import { useLanguage } from './LanguageContext'
import { supabase } from '../lib/supabase'

interface ContactsProps {
  projectId?: string;
}

export default function Contacts({ projectId }: ContactsProps) {
  const { t } = useLanguage()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '', role: '', email: '', phone: '', type: 'crew'
  })

  useEffect(() => {
    const fetchContacts = async () => {
      if (!projectId) {
        setContacts([])
        setIsLoaded(true)
        return
      }
      setIsLoaded(false)
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('project_id', projectId)

      if (error) {
        console.error('Error fetching contacts:', error)
      } else if (data) {
        setContacts(data as Contact[])
      }
      setIsLoaded(true)
    }
    fetchContacts()
  }, [projectId])

  const handleSave = async () => {
    if (!newContact.name || !projectId) return
    
    if (editingId) {
      const { error } = await supabase
        .from('contacts')
        .update({
          name: newContact.name,
          role: newContact.role,
          email: newContact.email,
          phone: newContact.phone,
          type: newContact.type
        })
        .eq('id', editingId)

      if (error) {
        console.error('Error updating contact:', error)
        alert('Failed to update contact.')
      } else {
        setContacts(contacts.map(c => c.id === editingId ? { ...c, ...newContact } as Contact : c))
        setNewContact({ name: '', role: '', email: '', phone: '', type: 'crew' })
        setIsAdding(false)
        setEditingId(null)
      }
      return
    }

    const contactToSave = {
      ...newContact,
      project_id: projectId,
      name: newContact.name!,
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert(contactToSave)
      .select()
      .single()

    if (error) {
      console.error('Error adding contact:', error)
      alert('Failed to add contact.')
    } else if (data) {
      setContacts([...contacts, data as Contact])
      setNewContact({ name: '', role: '', email: '', phone: '', type: 'crew' })
      setIsAdding(false)
    }
  }

  const handleEdit = (contact: Contact) => {
    setNewContact(contact)
    setEditingId(contact.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(t('Are you sure you want to delete this item?'))) {
      const { error } = await supabase.from('contacts').delete().eq('id', id)
      if (error) {
        console.error('Error deleting contact:', error)
        alert('Failed to delete contact.')
      } else {
        setContacts(contacts.filter(c => c.id !== id))
      }
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Contacts Directory</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {t('Add Contact')}
        </button>
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6 shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Name"
              value={newContact.name}
              onChange={e => setNewContact({ ...newContact, name: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              placeholder="Role"
              value={newContact.role}
              onChange={e => setNewContact({ ...newContact, role: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              placeholder="Email"
              value={newContact.email}
              onChange={e => setNewContact({ ...newContact, email: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              placeholder="Phone"
              value={newContact.phone}
              onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
              className="p-2 border rounded"
            />
            <select
              value={newContact.type}
              onChange={e => setNewContact({ ...newContact, type: e.target.value as any })}
              className="p-2 border rounded"
            >
              <option value="cast">Cast</option>
              <option value="crew">Crew</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded">{t('Save')}</button>
            <button onClick={() => {
              setIsAdding(false)
              setEditingId(null)
              setNewContact({ name: '', role: '', email: '', phone: '', type: 'crew' })
            }} className="bg-gray-500 text-white px-4 py-2 rounded">{t('Cancel')}</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map(contact => (
          <div key={contact.id} className="bg-white p-4 rounded-lg shadow border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{contact.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  contact.type === 'cast' ? 'bg-purple-100 text-purple-800' :
                  contact.type === 'crew' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                }`}>
                  {(contact.type || 'unknown').toUpperCase()}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(contact)} className="text-blue-400 hover:text-blue-600" title="Edit">✎</button>
                <button onClick={() => handleDelete(contact.id)} className="text-red-400 hover:text-red-600" title="Delete">×</button>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p><strong>Role:</strong> {contact.role}</p>
              {contact.email && (
                <p><strong>Email:</strong> <a href={`mailto:${contact.email}`} className="text-blue-600">{contact.email}</a></p>
              )}
              {contact.phone && (
                <p><strong>Phone:</strong> <a href={`tel:${contact.phone}`} className="text-blue-600">{contact.phone}</a></p>
              )}
            </div>
          </div>
        ))}
        {contacts.length === 0 && <div className="col-span-full text-center text-gray-500 py-8">No contacts added yet.</div>}
      </div>
    </div>
  )
}
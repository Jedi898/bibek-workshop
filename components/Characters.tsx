'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Contact } from '@/types'
import { useLanguage } from './LanguageContext'
import { supabase } from '../lib/supabase'
// import imageCompression from 'browser-image-compression'

interface Character {
  id: string
  name: string
  role: string
  description: string
  photo?: string
  actorId?: string
}

interface CharactersProps {
  projectId?: string
}

const Characters = ({ projectId }: CharactersProps = {}) => {
  const { t } = useLanguage()
  const [characters, setCharacters] = useState<Character[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedChar, setSelectedChar] = useState<Character | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) {
        setCharacters([])
        setContacts([])
        setIsLoaded(true)
        return
      }
      setIsLoaded(false)

      const [charRes, contactRes] = await Promise.all([
        supabase.from('characters').select('*').eq('project_id', projectId),
        supabase.from('contacts').select('*').eq('project_id', projectId)
      ])

      if (charRes.error) {
        console.error('Error fetching characters:', charRes.error)
      } else if (charRes.data) {
        setCharacters(charRes.data.map((char: any) => ({
          ...char,
          actorId: char.actor_id
        })))
      }

      if (contactRes.error) {
        console.error('Error fetching contacts:', contactRes.error)
      } else if (contactRes.data) {
        setContacts(contactRes.data)
      }
      setIsLoaded(true)
    }
    fetchData()
  }, [projectId])

  const handleAddNew = () => {
    setSelectedChar({
      id: crypto.randomUUID(),
      name: '',
      role: '',
      description: '',
      photo: '',
      actorId: ''
    })
    setIsModalOpen(true)
  }

  const handleCardClick = (char: Character) => {
    setSelectedChar({ ...char })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (selectedChar) {
      if (!projectId) {
        alert('No project selected. Cannot save character.')
        return
      }

      const charToSave = {
        ...selectedChar,
        actor_id: selectedChar.actorId || null,
        project_id: projectId
      }
      delete (charToSave as any).actorId

      const { error } = await supabase
        .from('characters')
        .upsert(charToSave)
      
      if (error) {
        console.error('Error saving character:', error)
        alert('Failed to save character')
        return
      }

      setCharacters(prev => {
        const exists = prev.find(c => c.id === selectedChar.id)
        if (exists) {
          return prev.map(c => c.id === selectedChar.id ? selectedChar : c)
        } else {
          return [...prev, selectedChar]
        }
      })
      setIsModalOpen(false)
      setSelectedChar(null)
    }
  }

  const handleDelete = async () => {
    if (selectedChar && window.confirm(t('Are you sure you want to delete this item?'))) {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', selectedChar.id)

      if (error) {
        console.error('Error deleting character:', error)
        alert('Failed to delete character')
        return
      }

      setCharacters(characters.filter(char => char.id !== selectedChar.id))
      setIsModalOpen(false)
      setSelectedChar(null)
    }
  }

  const handleDeletePhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedChar) {
      setSelectedChar({ ...selectedChar, photo: '' })
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && selectedChar && projectId) {
      setIsUploading(true)
      
      // Compress image (Uncomment if browser-image-compression is installed)
      // const options = {
      //   maxSizeMB: 0.5, // Max size in MB
      //   maxWidthOrHeight: 800, // Max width/height
      //   useWebWorker: true
      // }

      // Upload to Supabase Storage
      try {
        const compressedFile = file // await imageCompression(file, options)
        const fileExt = file.name.split('.').pop()
        const fileName = `${projectId}/${crypto.randomUUID()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('character-photos')
          .upload(fileName, compressedFile)

      if (uploadError) {
        console.error('Error uploading photo:', uploadError)
        alert('Failed to upload photo')
        setIsUploading(false)
        return
      }

      // Get Public URL
      const { data } = supabase.storage
        .from('character-photos')
        .getPublicUrl(fileName)

      setSelectedChar({ ...selectedChar, photo: data.publicUrl })
      } catch (error) {
        console.error('Error compressing or uploading photo:', error)
        alert('Failed to process photo')
      }
      
      setIsUploading(false)
    }
  }

  const updateSelectedChar = (field: keyof Character, value: string) => {
    if (selectedChar) {
      setSelectedChar({ ...selectedChar, [field]: value })
    }
  }

  const actors = contacts.filter(c => c.type === 'cast')

  if (!isLoaded) {
    return (
      <div className="p-6 text-white h-full flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6 text-white h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">{t('Characters')}</h2>
        <button
          onClick={handleAddNew}
          disabled={!projectId}
          className={`px-4 py-2 rounded transition-colors ${
            !projectId ? 'bg-gray-400 cursor-not-allowed text-gray-200' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          title={!projectId ? "No project loaded" : ""}
        >
          {t('Add Character')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {characters.map((char) => {
          const actor = actors.find(a => a.id === char.actorId)
          return (
            <div 
              key={char.id} 
              onClick={() => handleCardClick(char)}
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:bg-gray-700 transition-all transform hover:-translate-y-1"
            >
              <div className="h-48 bg-gray-700 w-full object-cover relative">
                {char.photo ? (
                  <img src={char.photo} alt={char.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-4xl">👤</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-1">{char.name || 'Unnamed'}</h3>
                <p className="text-blue-400 text-sm mb-2">{char.role || 'No Role'}</p>
                <p className="text-gray-400 text-sm line-clamp-2">{char.description}</p>
                {actor && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <span className="text-xs text-gray-500">{t('Played by')}</span>
                    <p className="text-sm font-medium text-green-400">{actor.name}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {characters.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No characters added yet. Click "Add Character" to begin.
        </div>
      )}

      {isModalOpen && selectedChar && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-6">{t('Character Details')}</h3>
              
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  <div 
                    className="w-32 h-32 bg-gray-700 rounded-full overflow-hidden relative cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {selectedChar.photo ? (
                      <img src={selectedChar.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-4xl">
                        {isUploading ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        ) : '📷'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-white">{t('Upload Photo')}</span>
                    </div>
                  </div>
                  {selectedChar.photo && (
                    <button
                      onClick={handleDeletePhoto}
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 shadow-lg z-10"
                      title="Remove Photo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">{t('Name')}</label>
                  <input type="text" value={selectedChar.name} onChange={(e) => updateSelectedChar('name', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">{t('Role')}</label>
                  <input type="text" value={selectedChar.role} onChange={(e) => updateSelectedChar('role', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">{t('Description')}</label>
                  <textarea value={selectedChar.description} onChange={(e) => updateSelectedChar('description', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500 h-24" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">{t('Assigned Actor')}</label>
                  <select
                    value={selectedChar.actorId || ''}
                    onChange={(e) => updateSelectedChar('actorId', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">{t('Not Assigned')}</option>
                    {actors.map(actor => <option key={actor.id} value={actor.id}>{actor.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 px-6 py-4 flex justify-between">
              <button onClick={handleDelete} className="text-red-400 hover:text-red-300 font-medium">{t('Delete')}</button>
              <div className="space-x-3">
                <button onClick={() => setIsModalOpen(false)} className="text-gray-300 hover:text-white">{t('Close')}</button>
                <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">{t('Save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Characters
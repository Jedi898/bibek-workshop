'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from './LanguageContext'

interface Character {
  id: string
  name: string
  role: string
  description: string
  photo?: string
}

const Characters = () => {
  const { t } = useLanguage()
  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedChar, setSelectedChar] = useState<Character | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('characters')
    if (saved) {
      setCharacters(JSON.parse(saved))
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('characters', JSON.stringify(characters))
    }
  }, [characters, isLoaded])

  const handleAddNew = () => {
    setSelectedChar({
      id: Date.now().toString(),
      name: '',
      role: '',
      description: '',
      photo: ''
    })
    setIsModalOpen(true)
  }

  const handleCardClick = (char: Character) => {
    setSelectedChar({ ...char })
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (selectedChar) {
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

  const handleDelete = () => {
    if (selectedChar && window.confirm(t('Are you sure you want to delete this item?'))) {
      setCharacters(characters.filter(char => char.id !== selectedChar.id))
      setIsModalOpen(false)
      setSelectedChar(null)
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && selectedChar) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setSelectedChar({ ...selectedChar, photo: ev.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const updateSelectedChar = (field: keyof Character, value: string) => {
    if (selectedChar) {
      setSelectedChar({ ...selectedChar, [field]: value })
    }
  }

  return (
    <div className="p-6 text-white h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">{t('Characters')}</h2>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          {t('Add Character')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {characters.map((char) => (
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
            </div>
          </div>
        ))}
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
                <div 
                  className="w-32 h-32 bg-gray-700 rounded-full overflow-hidden relative cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedChar.photo ? (
                    <img src={selectedChar.photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-4xl">📷</div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-white">{t('Upload Photo')}</span>
                  </div>
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
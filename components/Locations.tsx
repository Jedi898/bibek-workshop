'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from './LanguageContext'

interface Location {
  id: string
  name: string
  setting: string
  description: string
  permitStatus: string
}

const Locations = () => {
  const { t } = useLanguage()
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('locations')
    if (saved) {
      setLocations(JSON.parse(saved))
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('locations', JSON.stringify(locations))
    }
  }, [locations, isLoaded])

  const addLocation = () => {
    setLocations([...locations, {
      id: Date.now().toString(),
      name: '',
      setting: 'INT',
      description: '',
      permitStatus: 'Not Required'
    }])
  }

  const updateLocation = (id: string, field: keyof Location, value: string) => {
    setLocations(locations.map(loc => loc.id === id ? { ...loc, [field]: value } : loc))
  }

  const deleteLocation = (id: string) => {
    if (window.confirm(t('Are you sure you want to delete this item?'))) {
      setLocations(locations.filter(loc => loc.id !== id))
    }
  }

  return (
    <div className="p-6 text-white h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">{t('Locations')}</h2>
        <button
          onClick={addLocation}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          {t('Add Location')}
        </button>
      </div>

      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-900 border-b border-gray-700">
              <th className="p-3 text-sm font-semibold text-gray-300 w-1/3">{t('Name')}</th>
              <th className="p-3 text-sm font-semibold text-gray-300 w-20">{t('Setting')}</th>
              <th className="p-3 text-sm font-semibold text-gray-300 w-32">{t('Permit Status')}</th>
              <th className="p-3 text-sm font-semibold text-gray-300">{t('Description')}</th>
              <th className="p-3 text-sm font-semibold text-gray-300 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr key={loc.id} className="border-b border-gray-700 hover:bg-gray-750">
                <td className="p-2"><input type="text" value={loc.name} onChange={(e) => updateLocation(loc.id, 'name', e.target.value)} className="w-full bg-transparent border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm uppercase" placeholder={t('Name')} /></td>
                <td className="p-2">
                  <select
                    value={loc.setting}
                    onChange={(e) => updateLocation(loc.id, 'setting', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm"
                  >
                    <option value="INT">INT</option>
                    <option value="EXT">EXT</option>
                    <option value="I/E">I/E</option>
                  </select>
                </td>
                <td className="p-2">
                  <select
                    value={loc.permitStatus}
                    onChange={(e) => updateLocation(loc.id, 'permitStatus', e.target.value)}
                    className={`w-full border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm ${
                      loc.permitStatus === 'Obtained' ? 'bg-green-900 text-green-100' : 
                      loc.permitStatus === 'Required' ? 'bg-red-900 text-red-100' : 'bg-gray-700'
                    }`}
                  >
                    <option value="Not Required">{t('Not Required')}</option>
                    <option value="Required">{t('Required')}</option>
                    <option value="Obtained">{t('Obtained')}</option>
                  </select>
                </td>
                <td className="p-2"><input type="text" value={loc.description} onChange={(e) => updateLocation(loc.id, 'description', e.target.value)} className="w-full bg-transparent border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm" placeholder={t('Description')} /></td>
                <td className="p-2 text-center">
                  <button onClick={() => deleteLocation(loc.id)} className="text-gray-500 hover:text-red-500 transition-colors">×</button>
                </td>
              </tr>
            ))}
            {locations.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">No locations added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Locations
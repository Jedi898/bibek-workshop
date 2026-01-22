'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from './LanguageContext'
import { supabase } from '../lib/supabase'

interface Location {
  id: string
  name: string
  setting: string
  description: string
  permitStatus: string
}

interface LocationsProps {
  projectId?: string
}

const Locations = ({ projectId }: LocationsProps = {}) => {
  const { t } = useLanguage()
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const fetchLocations = async () => {
      if (!projectId) {
        setLocations([])
        setIsLoaded(true)
        return
      }

      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching locations:', error)
      } else if (data) {
        setLocations(data.map((loc: any) => ({
          id: loc.id,
          name: loc.name,
          setting: loc.setting,
          description: loc.description,
          permitStatus: loc.permit_status
        })))
      }
      setIsLoaded(true)
    }
    fetchLocations()
  }, [projectId])

  const addLocation = async () => {
    if (!projectId) return

    const newLocation = {
      project_id: projectId,
      name: 'New Location',
      setting: 'INT',
      description: '',
      permit_status: 'Not Required'
    }

    const { data, error } = await supabase
      .from('locations')
      .insert(newLocation)
      .select()
      .single()

    if (error) {
      console.error('Error adding location:', error)
      alert('Failed to add location')
    } else if (data) {
      setLocations([...locations, {
        id: data.id,
        name: data.name,
        setting: data.setting,
        description: data.description,
        permitStatus: data.permit_status
      }])
    }
  }

  const persistLocation = async (location: Location) => {
    if (!projectId) return

    const { error } = await supabase
      .from('locations')
      .update({
        name: location.name,
        setting: location.setting,
        description: location.description,
        permit_status: location.permitStatus
      })
      .eq('id', location.id)

    if (error) {
      console.error('Error updating location:', error)
    }
  }

  const updateLocation = (id: string, field: keyof Location, value: string) => {
    const updatedLocations = locations.map(loc => loc.id === id ? { ...loc, [field]: value } : loc)
    setLocations(updatedLocations)

    // For select fields, save immediately as there is no blur event to rely on
    if (field === 'setting' || field === 'permitStatus') {
      const updatedLoc = updatedLocations.find(l => l.id === id)
      if (updatedLoc) {
        persistLocation(updatedLoc)
      }
    }
  }

  const deleteLocation = async (id: string) => {
    if (window.confirm(t('Are you sure you want to delete this item?'))) {
      const { error } = await supabase.from('locations').delete().eq('id', id)
      
      if (error) {
        console.error('Error deleting location:', error)
        alert('Failed to delete location')
      } else {
        setLocations(locations.filter(loc => loc.id !== id))
      }
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

      <div className="space-y-4">
        {/* Header for larger screens */}
        <div className="hidden md:grid grid-cols-[2fr,1fr,1fr,3fr,auto] gap-4 px-4 py-2 bg-gray-800 rounded-t-lg text-sm font-semibold text-gray-300">
          <div>{t('Name')}</div>
          <div>{t('Setting')}</div>
          <div>{t('Permit Status')}</div>
          <div>{t('Description')}</div>
          <div></div>
        </div>
        {locations.length > 0 ? locations.map((loc) => (
          <div key={loc.id} className="bg-gray-800 md:bg-transparent md:grid md:grid-cols-[2fr,1fr,1fr,3fr,auto] gap-4 p-4 md:p-0 md:px-4 md:py-2 rounded-lg md:rounded-none border md:border-0 border-gray-700 items-center">
            {/* Name */}
            <div className="md:p-2">
              <label className="md:hidden text-xs font-bold text-gray-400">{t('Name')}</label>
              <input 
                type="text" 
                value={loc.name} 
                onChange={(e) => updateLocation(loc.id, 'name', e.target.value)} 
                onBlur={() => persistLocation(loc)}
                className="w-full bg-transparent md:bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm uppercase" 
                placeholder={t('Name')} 
              />
            </div>
            {/* Setting */}
            <div className="mt-2 md:mt-0 md:p-2">
              <label className="md:hidden text-xs font-bold text-gray-400">{t('Setting')}</label>
              <select
                value={loc.setting}
                onChange={(e) => updateLocation(loc.id, 'setting', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm"
              >
                <option value="INT">INT</option>
                <option value="EXT">EXT</option>
                <option value="I/E">I/E</option>
              </select>
            </div>
            {/* Permit Status */}
            <div className="mt-2 md:mt-0 md:p-2">
              <label className="md:hidden text-xs font-bold text-gray-400">{t('Permit Status')}</label>
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
            </div>
            {/* Description */}
            <div className="mt-2 md:mt-0 md:p-2">
              <label className="md:hidden text-xs font-bold text-gray-400">{t('Description')}</label>
              <input 
                type="text" 
                value={loc.description} 
                onChange={(e) => updateLocation(loc.id, 'description', e.target.value)} 
                onBlur={() => persistLocation(loc)}
                className="w-full bg-transparent md:bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm" 
                placeholder={t('Description')} 
              />
            </div>
            {/* Delete */}
            <div className="mt-4 md:mt-0 md:p-2 text-right md:text-center">
              <button onClick={() => deleteLocation(loc.id)} className="text-gray-500 hover:text-red-500 transition-colors">×</button>
            </div>
          </div>
        )) : (
          <div className="p-4 text-center text-gray-500">No locations added yet.</div>
        )}
      </div>
    </div>
  )
}

export default Locations
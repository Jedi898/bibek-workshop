'use client'

import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Character } from '@/types/index'
import { useLanguage } from './LanguageContext'
import { supabase } from '../lib/supabase'

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
  castMembers?: string[]
  description?: string
  type?: string
  backgroundColor?: string
  borderColor?: string
  locationId?: string
}

const EVENT_TYPES: Record<string, { label: string; color: string }> = {
  shoot: { label: 'Shoot', color: '#059669' }, // emerald-600
  rehearsal: { label: 'Rehearsal', color: '#2563eb' }, // blue-600
  meeting: { label: 'Meeting', color: '#7c3aed' }, // violet-600
  scout: { label: 'Location Scout', color: '#d97706' }, // amber-600
  other: { label: 'Other', color: '#4b5563' } // gray-600
}

interface ScheduleProps {
  projectId?: string
}

interface Location {
  id: string
  name: string
}

const Schedule: React.FC<ScheduleProps> = ({ projectId }) => {
  const { t } = useLanguage()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [storedCharacters, setStoredCharacters] = useState<Character[]>([])
  const [storedLocations, setStoredLocations] = useState<Location[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    castMembers: [],
    backgroundColor: EVENT_TYPES.shoot.color,
    borderColor: EVENT_TYPES.shoot.color
  })
  const [filterCharacterId, setFilterCharacterId] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) {
        setEvents([])
        setStoredCharacters([])
        setStoredLocations([])
        setIsLoaded(true)
        return
      }
      setIsLoaded(false)

      const [eventsRes, charactersRes, locationsRes] = await Promise.all([
        supabase.from('events').select('*').eq('project_id', projectId),
        supabase.from('characters').select('id, name').eq('project_id', projectId),
        supabase.from('locations').select('id, name').eq('project_id', projectId),
      ])

      if (eventsRes.error) console.error('Error fetching events:', eventsRes.error)
      else if (eventsRes.data) {
        const fetchedEvents = eventsRes.data.map((e: any) => {
          const eventType = e.event_type || 'other'
          const color = EVENT_TYPES[eventType]?.color || EVENT_TYPES.other.color
          return {
            id: e.id,
            title: e.title,
            start: e.start_time,
            end: e.end_time,
            allDay: e.all_day,
            castMembers: e.cast_members || [],
            description: e.description,
            type: eventType,
            locationId: e.location_id,
            backgroundColor: color,
            borderColor: color,
          } as CalendarEvent
        })
        setEvents(fetchedEvents)
      }

      if (charactersRes.error) console.error('Error fetching characters for schedule:', charactersRes.error)
      else setStoredCharacters(charactersRes.data as Character[])

      if (locationsRes.error) console.error('Error fetching locations for schedule:', locationsRes.error)
      else setStoredLocations(locationsRes.data as Location[])

      setIsLoaded(true)
    }
    fetchData()
  }, [projectId])

  // Load draft from local storage
  useEffect(() => {
    if (projectId) {
      const savedDraft = localStorage.getItem(`schedule-draft-${projectId}`)
      if (savedDraft) {
        try {
          const { editingEvent: savedEvent, showModal: savedShowModal } = JSON.parse(savedDraft)
          if (savedEvent) setEditingEvent(savedEvent)
          if (savedShowModal) setShowModal(savedShowModal)
        } catch (e) {
          console.error('Failed to parse schedule draft', e)
        }
      }
    }
  }, [projectId])

  // Save draft to local storage
  useEffect(() => {
    if (projectId) {
      if (showModal) {
        localStorage.setItem(`schedule-draft-${projectId}`, JSON.stringify({ editingEvent, showModal }))
      } else {
        localStorage.removeItem(`schedule-draft-${projectId}`)
      }
    }
  }, [projectId, showModal, editingEvent])

  const allCharacters = storedCharacters

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.start)
    setEditingEvent({
      title: '',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
      castMembers: [],
      type: 'shoot',
      backgroundColor: EVENT_TYPES.shoot.color,
      borderColor: EVENT_TYPES.shoot.color
    })
    setShowModal(true)
  }

  const handleEventClick = (clickInfo: any) => {
    const event = events.find(e => e.id === clickInfo.event.id)
    if (event) {
      const toLocalISOString = (dateStr: string | Date) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        const tzoffset = new Date().getTimezoneOffset() * 60000
        const localISOTime = new Date(date.getTime() - tzoffset).toISOString().slice(0, 16)
        return localISOTime
      }
      setEditingEvent({
        ...event,
        start: toLocalISOString(event.start),
        end: event.end ? toLocalISOString(event.end) : '',
      })
      setShowModal(true)
    }
  }

  const handleSaveEvent = async () => {
    if (!editingEvent.title || !projectId) return

    const eventType = editingEvent.type || 'other'
    const color = EVENT_TYPES[eventType]?.color || EVENT_TYPES.other.color

    const eventToSave = {
      id: editingEvent.id,
      project_id: projectId,
      title: editingEvent.title,
      start_time: editingEvent.start ? new Date(editingEvent.start).toISOString() : null,
      end_time: editingEvent.end ? new Date(editingEvent.end).toISOString() : null,
      all_day: editingEvent.allDay,
      event_type: eventType,
      description: editingEvent.description,
      location_id: editingEvent.locationId,
      cast_members: editingEvent.castMembers,
    }

    const { data, error } = await supabase
      .from('events')
      .upsert(eventToSave)
      .select()
      .single()

    if (error) {
      console.error('Error saving event:', error)
      alert('Failed to save event.')
    } else if (data) {
      const savedEvent: CalendarEvent = {
        id: data.id,
        title: data.title,
        start: data.start_time,
        end: data.end_time,
        allDay: data.all_day,
        castMembers: data.cast_members || [],
        description: data.description,
        type: data.event_type,
        locationId: data.location_id,
        backgroundColor: color,
        borderColor: color,
      }
      if (events.find(e => e.id === savedEvent.id)) {
        setEvents(events.map(e => (e.id === savedEvent.id ? savedEvent : e)))
      } else {
        setEvents([...events, savedEvent])
      }
      setShowModal(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (editingEvent.id && window.confirm(t('Are you sure you want to delete this item?'))) {
      const { error } = await supabase.from('events').delete().eq('id', editingEvent.id)
      if (error) {
        console.error('Error deleting event:', error)
        alert('Failed to delete event.')
      } else {
        setEvents(events.filter(e => e.id !== editingEvent.id))
        setShowModal(false)
      }
    }
  }

  const toggleCastMember = (characterId: string) => {
    const currentCast = editingEvent.castMembers || []
    if (currentCast.includes(characterId)) {
      setEditingEvent({
        ...editingEvent,
        castMembers: currentCast.filter(id => id !== characterId)
      })
    } else {
      setEditingEvent({
        ...editingEvent,
        castMembers: [...currentCast, characterId]
      })
    }
  }

  const handleEventDrop = async (info: any) => {
    const { event } = info
    const eventToSave = {
      id: event.id,
      start_time: event.startStr,
      end_time: event.endStr,
      all_day: event.allDay,
    }

    const { error } = await supabase.from('events').update(eventToSave).eq('id', event.id)

    if (error) {
      console.error('Error updating event drop:', error)
      info.revert()
    } else {
      setEvents(events.map(e => {
        if (e.id === event.id) {
          return {
            ...e,
            start: event.startStr,
            end: event.endStr,
            allDay: event.allDay,
          }
        }
        return e
      }))
    }
  }

  const filteredEvents = filterCharacterId
    ? events.filter(e => e.castMembers?.includes(filterCharacterId))
    : events

  const upcomingEvents = events
    .filter(e => new Date(e.start).getTime() >= new Date().setHours(0,0,0,0))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5)

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Production Schedule</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>${t('Production Schedule')}</h1>
          <table>
            <thead>
              <tr>
                <th>${t('Date')}</th>
                <th>${t('Title')}</th>
                <th>${t('Type')}</th>
                <th>${t('Location')}</th>
                <th>${t('Description')}</th>
                <th>${t('Cast')}</th>
              </tr>
            </thead>
            <tbody>
              ${[...filteredEvents].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()).map(event => {
                const eventDate = new Date(event.start).toLocaleDateString()
                const castNames = event.castMembers 
                  ? allCharacters.filter(c => event.castMembers?.includes(c.id)).map(c => c.name).join(', ')
                  : ''
                const typeLabel = EVENT_TYPES[event.type || 'other']?.label || event.type
                const locationName = event.locationId 
                  ? storedLocations.find(l => l.id === (event as any).locationId)?.name 
                  : ''
                return `
                  <tr>
                    <td>${eventDate}</td>
                    <td>${event.title}</td>
                    <td>${typeLabel}</td>
                    <td>${locationName || ''}</td>
                    <td>${event.description || ''}</td>
                    <td>${castNames}</td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
    }, 250)
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">📅 {t('Production Schedule')}</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportPDF}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm mr-2"
          >
            {t('Export PDF')}
          </button>
          <label className="text-sm text-gray-600">{t('Filter by Cast:')}</label>
          <select
            value={filterCharacterId}
            onChange={(e) => setFilterCharacterId(e.target.value)}
            className="border border-gray-300 rounded p-1 text-sm"
          >
            <option value="">{t('All Cast')}</option>
            {allCharacters.map(char => (
              <option key={char.id} value={char.id}>{char.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar for Upcoming Events */}
        <div className="w-72 bg-white border-r border-gray-200 p-4 hidden lg:flex flex-col overflow-y-auto">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{t('Upcoming Events')}</h3>
          <div className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <div 
                  key={event.id} 
                  className="p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white"
                  style={{ borderLeft: `4px solid ${event.backgroundColor || '#ccc'}` }}
                  onClick={() => {
                    setEditingEvent(event)
                    setShowModal(true)
                  }}
                >
                  <div className="font-semibold text-gray-800 text-sm truncate">{event.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(event.start).toLocaleDateString()} 
                    {!event.allDay && ` • ${new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 capitalize">{event.type || 'event'}</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">{t('No upcoming events.')}</p>
            )}
          </div>
          
          <div className="mt-auto pt-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{t('Legend')}</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(EVENT_TYPES).map(([key, type]) => (
                <div key={key} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }}></span>
                  {type.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 h-full">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              events={filteredEvents}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventDrop}
              height="100%"
              eventClassNames="cursor-pointer hover:opacity-90 transition-opacity"
            />
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-40 overflow-y-auto flex items-start justify-center p-4 pb-96">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl my-8 relative">
            <h3 className="text-lg font-bold mb-4">{editingEvent.id && events.find(e => e.id === editingEvent.id) ? t('Edit Event') : t('New Event')}</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('Event Type')}</label>
                  <select
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    value={editingEvent.type || 'shoot'}
                    onChange={e => setEditingEvent({ ...editingEvent, type: e.target.value })}
                  >
                    {Object.entries(EVENT_TYPES).map(([key, type]) => (
                      <option key={key} value={key}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('Event Title')}</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded p-2 virtual-keyboard-input"
                  autoFocus
                  value={editingEvent.title}
                  onChange={e => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  placeholder={t('Shoot Scene 1, Rehearsal, etc.')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('Start')}</label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    value={editingEvent.start || ''}
                    onChange={e => setEditingEvent({ ...editingEvent, start: new Date(e.target.value).toISOString() })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('End')}</label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    value={editingEvent.end || ''}
                    onChange={e => setEditingEvent({ ...editingEvent, end: new Date(e.target.value).toISOString() })}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                 <input type="checkbox" id="allDay" checked={editingEvent.allDay} onChange={e => setEditingEvent({...editingEvent, allDay: e.target.checked})} />
                 <label htmlFor="allDay" className="text-sm text-gray-700">{t('All Day Event')}</label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('Location')}</label>
                <select
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                  value={editingEvent.locationId || ''}
                  onChange={e => setEditingEvent({ ...editingEvent, locationId: e.target.value })}
                >
                  <option value="">{t('Select Location')}</option>
                  {storedLocations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('Description')}</label>
                <textarea
                  className="w-full border border-gray-300 rounded p-2 virtual-keyboard-input"
                  value={editingEvent.description || ''}
                  onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t('Cast Members')}</label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded p-2 bg-gray-50">
                  {allCharacters.length > 0 ? (
                    allCharacters.map(char => (
                      <div key={char.id} className="flex items-center mb-1">
                        <input
                          type="checkbox"
                          id={`char-${char.id}`}
                          checked={(editingEvent.castMembers || []).includes(char.id)}
                          onChange={() => toggleCastMember(char.id)}
                          className="mr-2"
                        />
                        <label htmlFor={`char-${char.id}`} className="text-sm cursor-pointer select-none">
                          {char.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 italic">{t('No characters found in script.')}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                {editingEvent.id && events.find(e => e.id === editingEvent.id) && (
                  <button
                    onClick={handleDeleteEvent}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm mr-auto"
                  >
                    {t('Delete')}
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
                >
                  {t('Cancel')}
                </button>
                <button
                  onClick={handleSaveEvent}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  {t('Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Schedule
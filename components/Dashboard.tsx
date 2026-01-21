'use client'

import { useState, useEffect } from 'react'
import { useScriptStore } from '../lib/stores/scriptStore'
import { supabase } from '../lib/supabase'

interface Location {
  id: string
  name: string
}

interface DashboardProps {
  onNavigate?: (tab: string) => void
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { currentScript } = useScriptStore()
  
  const [todaySchedule, setTodaySchedule] = useState<any[]>([])
  const [importantNotices, setImportantNotices] = useState<any[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [projectDuration, setProjectDuration] = useState(60) // Default to 60 days

  useEffect(() => {
    const fetchData = async () => {
      if (!currentScript?.project_id) return

      // Load Today's Schedule
      const today = new Date().toISOString().split('T')[0]
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', currentScript.project_id)
        .gte('start_time', `${today}T00:00:00`)
        .lte('start_time', `${today}T23:59:59`)
        .order('start_time', { ascending: true })

      if (events) {
        setTodaySchedule(events.map((e: any) => ({
          id: e.id,
          title: e.title,
          start: e.start_time,
          end: e.end_time,
          type: e.event_type,
          locationId: e.location_id
        })))
      }

      // Load Important Notices (Recent Notes)
      const { data: notes } = await supabase
        .from('notes')
        .select('*')
        .eq('project_id', currentScript.project_id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (notes) {
        setImportantNotices(notes.map((n: any) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          priority: n.priority,
          createdAt: n.created_at
        })))
      }

      // Load Locations
      const { data: locs } = await supabase
        .from('locations')
        .select('id, name')
        .eq('project_id', currentScript.project_id)
      
      if (locs) {
        setLocations(locs)
      }
    }
    fetchData()
  }, [currentScript])

  const formatTime = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Film Production Manager</h1>
        <p className="text-gray-600">Your daily schedule and important notices</p>
        
        {/* Project Progress Bar */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Project Progress (Target: {projectDuration} Days)</span>
            <span className="text-blue-600 font-bold">Day 1 of {projectDuration}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(1/projectDuration)*100}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Today's Schedule</h2>
          {todaySchedule.length > 0 ? (
            <div className="space-y-4">
              {todaySchedule.map((item) => (
                <div key={item.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatTime(item.start)} - {formatTime(item.end)}
                      </p>
                      {item.locationId && (
                        <p className="text-gray-600 text-sm">📍 {locations.find(l => l.id === item.locationId)?.name || 'Unknown Location'}</p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 capitalize">
                      {item.type || 'Event'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No scheduled activities for today.</p>
          )}
        </div>

        {/* Important Notices */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Important Notices</h2>
          {importantNotices.length > 0 ? (
            <div className="space-y-4">
              {importantNotices.map((notice) => (
                <div key={notice.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{notice.title || 'Note'}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded capitalize ${notice.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>{notice.priority}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 whitespace-pre-wrap">{notice.content}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No important notices at this time.</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button onClick={() => onNavigate?.('schedule')} className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200">
            Add Schedule Item
          </button>
          <button onClick={() => onNavigate?.('notes')} className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200">
            Create Notice
          </button>
          <button onClick={() => onNavigate?.('editor')} className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200">
            View Script
          </button>
          <button onClick={() => onNavigate?.('shot-planning')} className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200">
            Generate Shots
          </button>
        </div>
      </div>
    </div>
  )
}

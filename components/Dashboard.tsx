'use client'

import { useState, useEffect } from 'react'
import { useScriptStore } from '../lib/stores/scriptStore'
import { supabase } from '../lib/supabase'
import { Calendar, FileText, Camera, ClipboardList, Clock, MapPin } from 'lucide-react'

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
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2 text-amber-400">Welcome to Film Production Manager</h1>
        <p className="text-gray-300">Your daily schedule and important notices</p>
        
        {/* Project Progress Bar */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-300">Project Progress (Target: {projectDuration} Days)</span>
            <span className="text-amber-400 font-bold">Day 1 of {projectDuration}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-amber-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${(1/projectDuration)*100}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-600" /> Today's Schedule</h2>
          {todaySchedule.length > 0 ? (
            <div className="space-y-4">
              {todaySchedule.map((item) => (
                <div key={item.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> {formatTime(item.start)} - {formatTime(item.end)}
                      </p>
                      {item.locationId && (
                        <p className="text-gray-600 text-sm flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {locations.find(l => l.id === item.locationId)?.name || 'Unknown Location'}</p>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-amber-600" /> Important Notices</h2>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button onClick={() => onNavigate?.('schedule')} className="flex flex-col items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-6 px-4 rounded-xl transition duration-200 border border-blue-100">
            <Calendar className="w-8 h-8 mb-1" />
            Add Schedule Item
          </button>
          <button onClick={() => onNavigate?.('notes')} className="flex flex-col items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-6 px-4 rounded-xl transition duration-200 border border-green-100">
            <ClipboardList className="w-8 h-8 mb-1" />
            Create Notice
          </button>
          <button onClick={() => onNavigate?.('editor')} className="flex flex-col items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-6 px-4 rounded-xl transition duration-200 border border-purple-100">
            <FileText className="w-8 h-8 mb-1" />
            View Script
          </button>
          <button onClick={() => onNavigate?.('shot-planning')} className="flex flex-col items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium py-6 px-4 rounded-xl transition duration-200 border border-orange-100">
            <Camera className="w-8 h-8 mb-1" />
            Generate Shots
          </button>
        </div>
      </div>
    </div>
  )
}

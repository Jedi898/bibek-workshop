'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from './LanguageContext'
import { supabase } from '../lib/supabase'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface TimelineProps {
  projectId?: string
}

export default function ProjectTimeline({ projectId }: TimelineProps) {
  const { t } = useLanguage()
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [durationDays, setDurationDays] = useState<number>(60)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [draggedDate, setDraggedDate] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (projectId) {
      fetchEvents()
    }
  }, [projectId])

  const fetchEvents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('project_id', projectId)
      .order('start_time', { ascending: true })
    
    if (data) setEvents(data)
    setLoading(false)
  }

  const getDayStatus = (dayIndex: number) => {
    const currentDay = new Date(startDate)
    currentDay.setDate(currentDay.getDate() + dayIndex)
    const dateStr = currentDay.toISOString().split('T')[0]
    
    const dayEvents = events.filter(e => e.start_time && e.start_time.startsWith(dateStr))
    
    if (dayEvents.length > 0) {
      const isShoot = dayEvents.some(e => e.event_type === 'shoot')
      return isShoot ? 'shoot' : 'prep'
    }
    return 'empty'
  }

  const handleDragStart = (e: React.DragEvent, dateStr: string) => {
    e.dataTransfer.setData('text/plain', dateStr)
    setDraggedDate(dateStr)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault()
    const sourceDateStr = e.dataTransfer.getData('text/plain')
    
    if (!sourceDateStr || sourceDateStr === targetDateStr) {
      setDraggedDate(null)
      return
    }

    await moveEvents(sourceDateStr, targetDateStr)
    setDraggedDate(null)
  }

  const moveEvents = async (sourceDateStr: string, targetDateStr: string) => {
    if (!projectId) return

    const sourceEvents = events.filter(e => e.start_time && e.start_time.startsWith(sourceDateStr))
    if (sourceEvents.length === 0) return

    setLoading(true)

    const updates = sourceEvents.map(event => {
      const originalStart = new Date(event.start_time)
      const targetDate = new Date(targetDateStr)
      
      const newStart = new Date(targetDate)
      newStart.setHours(originalStart.getHours(), originalStart.getMinutes(), originalStart.getSeconds())
      
      let newEnd = null
      if (event.end_time) {
        const originalEnd = new Date(event.end_time)
        const duration = originalEnd.getTime() - originalStart.getTime()
        newEnd = new Date(newStart.getTime() + duration)
      }

      return {
        ...event,
        start_time: newStart.toISOString(),
        end_time: newEnd ? newEnd.toISOString() : null
      }
    })

    const { error } = await supabase.from('events').upsert(updates)
    if (error) console.error('Error moving events:', error)
    else await fetchEvents()
    
    setLoading(false)
  }

  const handleExportPDF = async () => {
    if (!timelineRef.current) return
    
    setIsExporting(true)
    try {
      const canvas = await html2canvas(timelineRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })
      
      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save('project-timeline.pdf')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF')
    } finally {
      setIsExporting(false)
    }
  }

  const weeks = Math.ceil(durationDays / 7)

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('Project Timeline')}</h2>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('Start Date')}</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded p-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('Duration (Days)')}</label>
            <input 
              type="number" 
              value={durationDays}
              onChange={(e) => setDurationDays(parseInt(e.target.value))}
              className="border rounded p-1 text-sm w-20"
            />
          </div>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded transition-colors disabled:opacity-50 text-sm h-[30px]"
          >
            {isExporting ? '...' : t('Export PDF')}
          </button>
        </div>
      </div>

      <div ref={timelineRef} className="bg-white rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-7 gap-4 mb-4 text-center font-bold text-gray-500 border-b pb-2">
              <div>Day 1</div>
              <div>Day 2</div>
              <div>Day 3</div>
              <div>Day 4</div>
              <div>Day 5</div>
              <div>Day 6</div>
              <div>Day 7</div>
            </div>
            
            <div className="space-y-6">
              {Array.from({ length: weeks }).map((_, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-4">
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const absoluteDayIndex = weekIndex * 7 + dayIndex
                    if (absoluteDayIndex >= durationDays) return <div key={dayIndex} />
                    
                    const status = getDayStatus(absoluteDayIndex)
                    const currentDate = new Date(startDate)
                    currentDate.setDate(currentDate.getDate() + absoluteDayIndex)
                    const dateStr = currentDate.toISOString().split('T')[0]
                    
                    return (
                      <div 
                        key={dayIndex} 
                        draggable={status !== 'empty'}
                        onDragStart={(e) => handleDragStart(e, dateStr)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, dateStr)}
                        className={`
                          h-24 rounded-lg border p-2 relative transition-all hover:shadow-md
                          ${status === 'shoot' ? 'bg-green-50 border-green-200' : 
                            status === 'prep' ? 'bg-blue-50 border-blue-200' : 
                            'bg-gray-50 border-gray-100'}
                          ${draggedDate === dateStr ? 'opacity-50 border-dashed' : ''}
                          ${status !== 'empty' ? 'cursor-move' : 'cursor-default'}
                        `}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-gray-500">Day {absoluteDayIndex + 1}</span>
                          <span className="text-[10px] text-gray-400">{currentDate.getDate()}/{currentDate.getMonth() + 1}</span>
                        </div>
                        
                        <div className="mt-2">
                          {status === 'shoot' && <span className="text-xs bg-green-200 text-green-800 px-1 rounded">Shoot</span>}
                          {status === 'prep' && <span className="text-xs bg-blue-200 text-blue-800 px-1 rounded">Prep</span>}
                          {status === 'empty' && <span className="text-xs text-gray-300">Free</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
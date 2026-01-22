'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from './LanguageContext'
import { supabase } from '../lib/supabase'

interface ContinuityRow {
  id: string
  sceneNo: string
  shot: string
  take: string
  soundNo: string
  fileNo: string
  description: string
  remarks: string
}

interface ContinuitySheetProps {
  projectId?: string
}

const ContinuitySheet = ({ projectId }: ContinuitySheetProps) => {
  const { t } = useLanguage()
  const [rows, setRows] = useState<ContinuityRow[]>([
    { id: '1', sceneNo: '', shot: '', take: '', soundNo: '', fileNo: '', description: '', remarks: '' }
  ])
  const [date, setDate] = useState('')
  const [firstTakeTime, setFirstTakeTime] = useState('')
  const [packUpTime, setPackUpTime] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'local' | 'saving'>('local')
  const storageKey = projectId ? `continuity-sheet-${projectId}` : 'continuity-sheet'

  // History state for Undo/Redo
  const [history, setHistory] = useState<{
    rows: ContinuityRow[]
    date: string
    firstTakeTime: string
    packUpTime: string
  }[]>([])
  const [currentStep, setCurrentStep] = useState(-1)
  const isUndoRedo = useRef(false)

  // Track state changes for history
  useEffect(() => {
    const currentState = { rows, date, firstTakeTime, packUpTime }

    if (isUndoRedo.current) {
      isUndoRedo.current = false
      return
    }

    if (history.length === 0) {
      setHistory([currentState])
      setCurrentStep(0)
      return
    }

    const lastState = history[currentStep]
    if (JSON.stringify(lastState) !== JSON.stringify(currentState)) {
      const newHistory = history.slice(0, currentStep + 1)
      newHistory.push(currentState)
      setHistory(newHistory)
      setCurrentStep(newHistory.length - 1)
    }
  }, [rows, date, firstTakeTime, packUpTime, history, currentStep])

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const data = JSON.parse(saved)
      setRows(data.rows || [])
      setDate(data.date || '')
      setFirstTakeTime(data.firstTakeTime || '')
      setPackUpTime(data.packUpTime || '')
    }
    setIsLoaded(true)
  }, [storageKey])

  useEffect(() => {
    if (isLoaded) {
      const data = { rows, date, firstTakeTime, packUpTime }
      localStorage.setItem(storageKey, JSON.stringify(data))
      setSyncStatus('local')

      if (projectId) {
        const syncToCloud = async () => {
          setSyncStatus('saving')
          // Attempt to sync to Supabase if online
          const { error } = await supabase.from('continuity_sheets').upsert({
            project_id: projectId,
            content: data,
            updated_at: new Date().toISOString()
          }, { onConflict: 'project_id' })
          
          if (!error) setSyncStatus('synced')
          else setSyncStatus('local') // Fallback to local status on error
        }
        
        const timeout = setTimeout(syncToCloud, 2000)
        return () => clearTimeout(timeout)
      }
    }
  }, [rows, date, firstTakeTime, packUpTime, isLoaded, storageKey, projectId])

  const handleChange = (id: string, field: keyof ContinuityRow, value: string) => {
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ))
  }

  const addRow = () => {
    const newRow: ContinuityRow = {
      id: Date.now().toString(),
      sceneNo: '',
      shot: '',
      take: '',
      soundNo: '',
      fileNo: '',
      description: '',
      remarks: ''
    }
    setRows([...rows, newRow])
  }

  const deleteRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id))
    }
  }

  const handleUndo = () => {
    if (currentStep > 0) {
      isUndoRedo.current = true
      const prevStep = currentStep - 1
      const prevState = history[prevStep]
      setRows(prevState.rows)
      setDate(prevState.date)
      setFirstTakeTime(prevState.firstTakeTime)
      setPackUpTime(prevState.packUpTime)
      setCurrentStep(prevStep)
    }
  }

  const handleRedo = () => {
    if (currentStep < history.length - 1) {
      isUndoRedo.current = true
      const nextStep = currentStep + 1
      const nextState = history[nextStep]
      setRows(nextState.rows)
      setDate(nextState.date)
      setFirstTakeTime(nextState.firstTakeTime)
      setPackUpTime(nextState.packUpTime)
      setCurrentStep(nextStep)
    }
  }

  const handleSave = () => {
    const data = { rows, date, firstTakeTime, packUpTime }
    localStorage.setItem(storageKey, JSON.stringify(data))
    alert(t('Sheet saved successfully!'))
  }

  const handleReset = () => {
    if (window.confirm(t('Are you sure you want to clear all data?'))) {
      setRows([{ id: Date.now().toString(), sceneNo: '', shot: '', take: '', soundNo: '', fileNo: '', description: '', remarks: '' }])
      setDate('')
      setFirstTakeTime('')
      setPackUpTime('')
      localStorage.removeItem(storageKey)
    }
  }

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Continuity Sheet - ${date || 'Untitled'}</title>
          <style>
            @page { size: A4 landscape; margin: 15mm; }
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 20px; color: #000 !important; -webkit-print-color-adjust: exact; }
            h1 { text-align: center; margin-bottom: 20px; text-transform: uppercase; font-size: 24px; }
            .meta-container { display: flex; justify-content: space-between; margin-bottom: 20px; border: 1px solid #000; padding: 15px; }
            .meta-item { display: flex; flex-direction: column; }
            .meta-label { font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
            .meta-value { font-size: 16px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; vertical-align: top; }
            th { background-color: #f0f0f0; font-weight: bold; text-transform: uppercase; }
            .col-sm { width: 60px; }
            .col-md { width: 80px; }
          </style>
        </head>
        <body>
          <h1>${t('Continuity Sheet')}</h1>
          <div class="meta-container">
            <div class="meta-item">
              <span class="meta-label">${t('Date')}</span>
              <span class="meta-value">${date || '&nbsp;'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">${t('First Take Time')}</span>
              <span class="meta-value">${firstTakeTime || '&nbsp;'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">${t('Pack Up Time')}</span>
              <span class="meta-value">${packUpTime || '&nbsp;'}</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th class="col-sm">${t('Scene No.')}</th>
                <th class="col-sm">${t('Shot')}</th>
                <th class="col-sm">${t('Take')}</th>
                <th class="col-md">${t('Sound No.')}</th>
                <th class="col-md">${t('File No.')}</th>
                <th>${t('Description')}</th>
                <th>${t('Remarks')}</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr>
                  <td>${row.sceneNo}</td>
                  <td>${row.shot}</td>
                  <td>${row.take}</td>
                  <td>${row.soundNo}</td>
                  <td>${row.fileNo}</td>
                  <td>${row.description}</td>
                  <td>${row.remarks}</td>
                </tr>
              `).join('')}
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
    <div className="p-6 text-gray-900 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">{t('Continuity Sheet')}</h2>
          <span className={`text-xs px-2 py-1 rounded ${syncStatus === 'synced' ? 'bg-green-900 text-green-100' : 'bg-yellow-900 text-yellow-100'}`}>{syncStatus === 'synced' ? 'Cloud Synced' : 'Offline / Local'}</span>
        </div>
        <div className="space-x-4">
          <button
            onClick={handleUndo}
            disabled={currentStep <= 0}
            className={`px-4 py-2 rounded transition-colors ${
              currentStep <= 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            {t('Undo')}
          </button>
          <button
            onClick={handleRedo}
            disabled={currentStep >= history.length - 1}
            className={`px-4 py-2 rounded transition-colors ${
              currentStep >= history.length - 1
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            {t('Redo')}
          </button>
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition-colors"
          >
            {t('Save')}
          </button>
          <button
            onClick={handleReset}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
          >
            {t('Reset')}
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
          >
            {t('Export PDF')}
          </button>
          <button
            onClick={addRow}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            {t('Add Row')}
          </button>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t('Date')}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t('First Take Time')}</label>
            <input
              type="time"
              value={firstTakeTime}
              onChange={(e) => setFirstTakeTime(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t('Pack Up Time')}</label>
            <input
              type="time"
              value={packUpTime}
              onChange={(e) => setPackUpTime(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-white"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-900 border-b border-gray-700">
              <th className="p-3 text-sm font-semibold text-gray-300 w-24">{t('Scene No.')}</th>
              <th className="p-3 text-sm font-semibold text-gray-300 w-20">{t('Shot')}</th>
              <th className="p-3 text-sm font-semibold text-gray-300 w-20">{t('Take')}</th>
              <th className="p-3 text-sm font-semibold text-gray-300 w-24">{t('Sound No.')}</th>
              <th className="p-3 text-sm font-semibold text-gray-300 w-24">{t('File No.')}</th>
              <th className="p-3 text-sm font-semibold text-gray-300">{t('Description')}</th>
              <th className="p-3 text-sm font-semibold text-gray-300">{t('Remarks')}</th>
              <th className="p-3 text-sm font-semibold text-gray-300 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-700 hover:bg-gray-750">
                <td className="p-2">
                  <input
                    type="text"
                    value={row.sceneNo}
                    onChange={(e) => handleChange(row.id, 'sceneNo', e.target.value)}
                    className="w-full bg-transparent border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm text-white"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={row.shot}
                    onChange={(e) => handleChange(row.id, 'shot', e.target.value)}
                    className="w-full bg-transparent border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm text-white"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={row.take}
                    onChange={(e) => handleChange(row.id, 'take', e.target.value)}
                    className="w-full bg-transparent border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm text-white"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={row.soundNo}
                    onChange={(e) => handleChange(row.id, 'soundNo', e.target.value)}
                    className="w-full bg-transparent border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm text-white"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={row.fileNo}
                    onChange={(e) => handleChange(row.id, 'fileNo', e.target.value)}
                    className="w-full bg-transparent border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm text-white"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={row.description}
                    onChange={(e) => handleChange(row.id, 'description', e.target.value)}
                    className="w-full bg-transparent border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm text-white"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={row.remarks}
                    onChange={(e) => handleChange(row.id, 'remarks', e.target.value)}
                    className="w-full bg-transparent border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm text-white"
                  />
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => deleteRow(row.id)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                    title="Delete Row"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ContinuitySheet
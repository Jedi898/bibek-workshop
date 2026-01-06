'use client'

import React, { useState } from 'react'
import { useLanguage } from './LanguageContext'

interface ScheduleRow {
  id: string
  artist: string
  location: string
  intExt: string
  property: string
}

const Schedule = () => {
  const { t } = useLanguage()
  const [date, setDate] = useState('')
  const [miti, setMiti] = useState('')
  const [times, setTimes] = useState({
    callTime: '',
    breakfast: '',
    lunch: '',
    dinner: ''
  })

  const [rows, setRows] = useState<ScheduleRow[]>([])

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTimes(prev => ({ ...prev, [name]: value }))
  }

  const addRow = () => {
    setRows([...rows, {
      id: Date.now().toString(),
      artist: '',
      location: '',
      intExt: 'INT',
      property: ''
    }])
  }

  const updateRow = (id: string, field: keyof ScheduleRow, value: string) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row))
  }

  const deleteRow = (id: string) => {
    setRows(rows.filter(row => row.id !== id))
  }

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daily Schedule - ${date || 'Untitled'}</title>
          <style>
            @page { size: A4 landscape; margin: 20mm; }
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 20px; color: #000 !important; -webkit-print-color-adjust: exact; }
            h1 { text-align: center; margin-bottom: 20px; text-transform: uppercase; }
            .meta-table { width: 100%; margin-bottom: 30px; border-collapse: collapse; }
            .meta-table td { padding: 12px; border: 1px solid #000; vertical-align: top; width: 20%; }
            .meta-label { font-weight: bold; display: block; font-size: 11px; color: #444; text-transform: uppercase; margin-bottom: 4px; }
            .meta-value { font-size: 16px; font-weight: bold; color: #000; }
            .schedule-table { width: 100%; border-collapse: collapse; }
            .schedule-table th, .schedule-table td { border: 1px solid #000; padding: 10px; text-align: left; font-size: 14px; color: #000; }
            .schedule-table th { background-color: #f0f0f0; font-weight: bold; text-transform: uppercase; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${t('Daily Schedule')}</h1>
          <table class="meta-table">
            <tr>
              <td><span class="meta-label">${t('Date')}</span><span class="meta-value">${date || '&nbsp;'}</span></td>
              <td><span class="meta-label">${t('Miti (BS)')}</span><span class="meta-value">${miti || '&nbsp;'}</span></td>
              <td><span class="meta-label">${t('Call Time')}</span><span class="meta-value">${times.callTime || '&nbsp;'}</span></td>
              <td><span class="meta-label">${t('Breakfast')}</span><span class="meta-value">${times.breakfast || '&nbsp;'}</span></td>
              <td><span class="meta-label">${t('Lunch')}</span><span class="meta-value">${times.lunch || '&nbsp;'}</span></td>
              <td><span class="meta-label">${t('Dinner')}</span><span class="meta-value">${times.dinner || '&nbsp;'}</span></td>
            </tr>
          </table>
          <table class="schedule-table">
            <thead>
              <tr>
                <th>${t('Artist Name')}</th>
                <th>${t('Location')}</th>
                <th style="width: 100px;">${t('Int/Ext')}</th>
                <th>${t('Property')}</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr>
                  <td>${row.artist || '&nbsp;'}</td>
                  <td>${row.location || '&nbsp;'}</td>
                  <td>${row.intExt || '&nbsp;'}</td>
                  <td>${row.property || '&nbsp;'}</td>
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
    <div className="p-6 text-white h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('Daily Schedule')}</h2>
        <button onClick={handleExportPDF} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors">{t('Export PDF')}</button>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-300">{t('General Timing')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t('Date')}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t('Miti (BS)')}</label>
            <input
              type="text"
              value={miti}
              onChange={(e) => setMiti(e.target.value)}
              placeholder="2080-01-01"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t('Call Time')}</label>
            <input
              type="time"
              name="callTime"
              value={times.callTime}
              onChange={handleTimeChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t('Breakfast')}</label>
            <input
              type="time"
              name="breakfast"
              value={times.breakfast}
              onChange={handleTimeChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t('Lunch')}</label>
            <input
              type="time"
              name="lunch"
              value={times.lunch}
              onChange={handleTimeChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t('Dinner')}</label>
            <input
              type="time"
              name="dinner"
              value={times.dinner}
              onChange={handleTimeChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{t('Schedule Details')}</h3>
        <button
          onClick={addRow}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          {t('Add Entry')}
        </button>
      </div>

      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-900 border-b border-gray-700">
              <th className="p-3 text-sm font-semibold text-gray-300">{t('Artist Name')}</th>
              <th className="p-3 text-sm font-semibold text-gray-300">{t('Location')}</th>
              <th className="p-3 text-sm font-semibold text-gray-300 w-32">{t('Int/Ext')}</th>
              <th className="p-3 text-sm font-semibold text-gray-300">{t('Property')}</th>
              <th className="p-3 text-sm font-semibold text-gray-300 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-700 hover:bg-gray-750">
                <td className="p-2">
                  <input
                    type="text"
                    value={row.artist}
                    onChange={(e) => updateRow(row.id, 'artist', e.target.value)}
                    className="w-full bg-transparent border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm"
                    placeholder={t('Artist')}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={row.location}
                    onChange={(e) => updateRow(row.id, 'location', e.target.value)}
                    className="w-full bg-transparent border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm"
                    placeholder={t('Location')}
                  />
                </td>
                <td className="p-2">
                  <select
                    value={row.intExt}
                    onChange={(e) => updateRow(row.id, 'intExt', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm"
                  >
                    <option value="INT">INT</option>
                    <option value="EXT">EXT</option>
                    <option value="INT/EXT">INT/EXT</option>
                  </select>
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={row.property}
                    onChange={(e) => updateRow(row.id, 'property', e.target.value)}
                    className="w-full bg-transparent border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm"
                    placeholder={t('Props/Notes')}
                  />
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => deleteRow(row.id)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  {t('No schedule entries yet. Click "Add Entry" to begin.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Schedule
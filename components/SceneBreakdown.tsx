'use client'

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { parseScript, SceneBreakdown as Scene } from './scriptParser'
import { useLanguage } from './LanguageContext'
import { extractDocxText } from './fileExtractors'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { supabase } from '../lib/supabase'

interface SceneBreakdownProps {
  projectId?: string
  scenes?: Scene[]
  characters?: any[]
  locations?: any[]
  onUpdateScene?: (id: string, data: any) => void
}

const SceneBreakdown = ({ projectId }: SceneBreakdownProps = {}) => {
  const { t } = useLanguage()
  const [scenes, setScenes] = useState<Scene[]>([])
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [debugText, setDebugText] = useState<string>('')
  const [rawExtractedText, setRawExtractedText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [characterSearch, setCharacterSearch] = useState<string>('')
  const [selectedSceneIds, setSelectedSceneIds] = useState<Set<string>>(new Set())
  const [isGeneratingShots, setIsGeneratingShots] = useState(false)
  
  const txtInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const wordInputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Load saved scenes on mount to prevent data vanishing
  useEffect(() => {
    const fetchScenes = async () => {
      if (!projectId) {
        setScenes([])
        return
      }
      setIsLoading(true)
      const { data, error } = await supabase.from('scenes').select('*').eq('project_id', projectId)
      
      if (error) {
        console.error('Error fetching scenes:', error)
      } else if (data) {
        // Sort scenes numerically by scene number
        const sortedData = data.sort((a, b) => {
          const aNum = parseFloat(a.scene_number) || 0
          const bNum = parseFloat(b.scene_number) || 0
          return aNum - bNum
        })

        setScenes(sortedData.map((scene: any) => ({
          ...scene,
          sceneNumber: scene.scene_number,
          shotList: scene.shot_list,
          aiHistory: scene.ai_history
        })))
      }
      setIsLoading(false)
    }
    fetchScenes()
  }, [projectId])

  // Analytics
  const analytics = useMemo(() => {
    if (scenes.length === 0) return null

    const totalScenes = scenes.length
    const totalPages = scenes.reduce((acc, s) => acc + parseFloat(s.metadata?.pageCount || '0'), 0).toFixed(1)
    const allChars = new Set(scenes.flatMap(s => s.logistics?.characters || []))
    const intScenes = scenes.filter(s => s.location?.type === 'INT.').length
    const extScenes = scenes.filter(s => s.location?.type === 'EXT.').length

    return {
      totalScenes,
      totalPages,
      totalCharacters: allChars.size,
      intExtRatio: `${intScenes} / ${extScenes}`
    }
  }, [scenes])

  // Filtered scenes based on character search
  const filteredScenes = useMemo(() => {
    if (!characterSearch.trim()) return scenes
    const searchTerm = characterSearch.toLowerCase()
    return scenes.filter(scene =>
      scene.logistics.characters.some(char =>
        char.toLowerCase().includes(searchTerm)
      )
    )
  }, [scenes, characterSearch])

  const toggleSceneSelection = (e: React.SyntheticEvent, sceneId: string) => {
    e.stopPropagation()
    const newSelected = new Set(selectedSceneIds)
    if (newSelected.has(sceneId)) {
      newSelected.delete(sceneId)
    } else {
      newSelected.add(sceneId)
    }
    setSelectedSceneIds(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedSceneIds.size === filteredScenes.length) {
      setSelectedSceneIds(new Set())
    } else {
      setSelectedSceneIds(new Set(filteredScenes.map(s => s.id)))
    }
  }

  // Export handler
  const handleExportPDF = async () => {
    if (filteredScenes.length === 0) {
      alert(t('No scenes to export'))
      return
    }
    
    if (!resultsRef.current) return

    try {
      const canvas = await html2canvas(resultsRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#1f2937', // Match the dark theme background
        ignoreElements: (element) => {
          if (selectedSceneIds.size === 0) return false
          return element.classList.contains('scene-card') && !selectedSceneIds.has(element.getAttribute('data-scene-id') || '')
        }
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm' })
      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save('scene-breakdown.pdf')
    } catch (err) {
      console.error('PDF export failed:', err)
      alert(t('Failed to export PDF'))
    }
  }

  const handleGenerateShotList = async () => {
    if (!selectedScene) return
    setIsGeneratingShots(true)
    try {
      const response = await fetch('/api/generate-shots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneText: selectedScene.content,
          directorNotes: `Mood: ${selectedScene.creative.mood || ''}. Visuals: ${selectedScene.creative.visuals.join(', ')}`,
          model: 'thenaijapromptengineer/matsya-7b'
        })
      })

      if (!response.ok) throw new Error('Failed to generate shots')
      
      const data = await response.json()
      const shotList = data.shotList

      // Update Supabase
      const { error } = await supabase
        .from('scenes')
        .update({ shot_list: shotList })
        .eq('id', selectedScene.id)

      if (error) throw error

      // Update local state
      const updatedScene = { ...selectedScene, shotList }
      setSelectedScene(updatedScene)
      setScenes(scenes.map(s => s.id === selectedScene.id ? updatedScene : s))
      
    } catch (err) {
      console.error(err)
      alert('Error generating shot list')
    } finally {
      setIsGeneratingShots(false)
    }
  }

  const extractPdfWithOcr = async (file: File): Promise<string> => {
    // Load PDF.js from CDN
    if (!(window as any).pdfjsLib) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      await new Promise((resolve, reject) => { script.onload = resolve; script.onerror = reject; document.head.appendChild(script); })
    }
    // Load Tesseract.js for OCR
    if (!(window as any).Tesseract) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
      await new Promise((resolve, reject) => { script.onload = resolve; script.onerror = reject; document.head.appendChild(script); });
    }

    const pdfjsLib = (window as any).pdfjsLib
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
    const Tesseract = (window as any).Tesseract;

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR accuracy
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (!context) continue;

      await page.render({ canvasContext: context, viewport }).promise;
      const imageData = canvas.toDataURL('image/png');

      try {
        const { data: { text: pageText } } = await Tesseract.recognize(
            imageData,
            'nep+eng', // Nepali and English language packs
            { logger: (m: any) => console.log(m) }
        );
        fullText += pageText + '\n';
      } catch (err) {
        console.error(`OCR failed on page ${i}`, err);
      }
    }
    return fullText;
  }

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.name.endsWith('.pdf')) {
      return extractPdfWithOcr(file)
    } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      return extractDocxText(file)
    } else {
      return file.text()
    }
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setScenes([])
    setError(null)
    setRawExtractedText(null)
    setDebugText('')

    if (!projectId) {
      setError(t('Please select a project first.'))
      setIsProcessing(false)
      return
    }

    try {
      console.log("Processing file:", file.name, file.type)
      
      // Extract text
      const rawText = await extractTextFromFile(file)
      console.log("RAW EXTRACTED TEXT (first 1000 chars):", rawText.substring(0, 1000))
      console.log("Total text length:", rawText.length)

      if (!rawText || rawText.trim().length === 0) {
        setError(t('No text could be extracted from this file.'))
      } else {
        // Parse script
        const parsedScenes = parseScript(rawText)
        console.log("Parsed scenes:", parsedScenes)
        
        if (parsedScenes.length === 0) {
          // Store raw text for debugging
          setRawExtractedText(rawText)
          setError(t("No scenes found. Check debug box below for extracted text."))
        } else {
          // Prepare scenes for insertion (remove temporary IDs from parser if needed, or let DB handle it)
          // We assume the DB generates UUIDs, so we strip the parser's ID or map it to something else if needed.
          // For now, we'll try to insert. If 'id' is a UUID in DB, we should omit it or generate a valid one.
          const scenesToInsert = parsedScenes.map(({ id, sceneNumber, shotList, aiHistory, ...rest }) => ({
            ...rest,
            scene_number: sceneNumber,
            project_id: projectId,
            shot_list: shotList,
            ai_history: aiHistory
          }))

          if (projectId) {
            // Optional: Clear existing scenes for this project before importing new script?
            // For now, let's append or we can delete first. Let's delete to replace.
            await supabase.from('scenes').delete().eq('project_id', projectId)
          }

          const { data, error } = await supabase.from('scenes').insert(scenesToInsert).select()
          
          if (error) throw error
          if (data) setScenes(data.map((scene: any) => ({
            ...scene,
            sceneNumber: scene.scene_number,
            shotList: scene.shot_list,
            aiHistory: scene.ai_history
          })) as Scene[])
          setRawExtractedText(null)
        }
      }
    } catch (err: any) {
      console.error("File processing error:", err)
      setError(`Failed to process file: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const testWithSampleScript = async () => {
    if (!projectId) {
      setError(t('Please select a project first.'))
      return
    }

    const sampleScript = `1. INT. HOUSE - DAY

John enters the room. He looks tired.

CHARACTER
This is a test dialogue.

2. EXT. STREET - NIGHT

It's raining heavily.

दृश्य ३ भित्री कोठा - बिहान

रामले किताब पढ्दैछ।`
    
    console.log("Testing with sample script")
    const parsed = parseScript(sampleScript)
    
    const scenesToInsert = parsed.map(({ id, sceneNumber, shotList, aiHistory, ...rest }) => ({
      ...rest,
      scene_number: sceneNumber,
      project_id: projectId,
      shot_list: shotList,
      ai_history: aiHistory
    }))

    const { data, error } = await supabase.from('scenes').insert(scenesToInsert).select()
    if (error) {
      console.error('Error saving sample scenes:', error)
      setError('Failed to save sample scenes')
    } else if (data) {
      setScenes(data.map((scene: any) => ({
        ...scene,
        sceneNumber: scene.scene_number,
        shotList: scene.shot_list,
        aiHistory: scene.ai_history
      })) as Scene[])
    }
    setRawExtractedText(null)
    setError(null)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
    // Reset input value to allow re-uploading same file
    e.target.value = ''
  }

  const handleReset = async () => {
    if (window.confirm(t('Are you sure you want to clear all scenes? This cannot be undone.'))) {
      if (!projectId) return
      
      const { error } = await supabase.from('scenes').delete().eq('project_id', projectId)

      if (!error) {
        setScenes([])
      }
      setRawExtractedText(null)
      setError(null)
    }
  }

  const handleDeleteScene = async (e: React.MouseEvent, sceneId: string) => {
    e.stopPropagation() // Prevent opening the modal
    if (window.confirm(t('Delete this scene?'))) {
      const { error } = await supabase.from('scenes').delete().eq('id', sceneId)
      if (!error) {
        setScenes(scenes.filter(s => s.id !== sceneId))
      }
    }
  }

  return (
    <div className="p-6 text-white h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">{t('Scene Breakdown')}</h2>
        <div className="flex gap-3">
          <button
            onClick={() => testWithSampleScript()}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
          >
            {t('Test Sample')}
          </button>
          <input
            type="file"
            ref={txtInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".txt,.fountain,.md"
          />
          <input
            type="file"
            ref={pdfInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf"
          />
          <input
            type="file"
            ref={wordInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".doc,.docx"
          />
          
          <button
            onClick={() => txtInputRef.current?.click()}
            disabled={isProcessing}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
          >
            <span>📄</span> {t('Import Script')}
          </button>
          
          <button
            onClick={() => pdfInputRef.current?.click()}
            disabled={isProcessing}
            className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
          >
            <span>📑</span> {t('Import PDF')}
          </button>

          <button
            onClick={() => wordInputRef.current?.click()}
            disabled={isProcessing}
            className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
          >
            <span>📝</span> {t('Import Word')}
          </button>

          {scenes.length > 0 && (
            <button
              onClick={handleReset}
              className="bg-red-900/80 hover:bg-red-800 text-red-100 px-4 py-2 rounded transition-colors flex items-center gap-2 border border-red-700"
            >
              <span>🗑️</span> {t('Clear All')}
            </button>
          )}
        </div>
      </div>

      {isProcessing && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-3 text-gray-300">{t('Processing file...')}</span>
        </div>
      )}

      {isLoading && !isProcessing && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-3 text-gray-300">{t('Loading scenes...')}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-gray-400 text-xs uppercase">{t('Total Scenes')}</div>
            <div className="text-2xl font-bold text-white">{analytics.totalScenes}</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-gray-400 text-xs uppercase">{t('Est. Pages')}</div>
            <div className="text-2xl font-bold text-blue-400">{analytics.totalPages}</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-gray-400 text-xs uppercase">{t('Characters')}</div>
            <div className="text-2xl font-bold text-green-400">{analytics.totalCharacters}</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-gray-400 text-xs uppercase">{t('INT / EXT')}</div>
            <div className="text-2xl font-bold text-purple-400">{analytics.intExtRatio}</div>
          </div>
        </div>
      )}

      {/* Search and Export Controls */}
      {scenes.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('Search by character name...')}
              value={characterSearch}
              onChange={(e) => setCharacterSearch(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
          >
            {selectedSceneIds.size === filteredScenes.length && filteredScenes.length > 0 ? t('Deselect All') : t('Select All')}
          </button>
          <button
            onClick={handleExportPDF}
            disabled={filteredScenes.length === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <span>📄</span> {t('Export PDF')} {selectedSceneIds.size > 0 ? `(${selectedSceneIds.size})` : characterSearch ? `(${filteredScenes.length})` : ''}
          </button>
        </div>
      )}

      <div ref={resultsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredScenes.map((scene) => (
          <div
            key={scene.id}
            data-scene-id={scene.id}
            onClick={() => setSelectedScene(scene)}
            className="scene-card bg-gray-800 rounded-lg shadow-lg p-4 cursor-pointer hover:bg-gray-700 transition-all transform hover:-translate-y-1 border border-gray-700"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedSceneIds.has(scene.id)}
                  onChange={(e) => toggleSceneSelection(e, scene.id)}
                  className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                />
                <span className="bg-blue-900 text-blue-200 text-xs font-bold px-2 py-1 rounded">
                  {t('SCENE')} {scene.sceneNumber}
                </span>
              </div>
              <span className="text-gray-400 text-xs font-mono">{scene.time}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs font-mono">{scene.time}</span>
                <button 
                  onClick={(e) => handleDeleteScene(e, scene.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-gray-700"
                  title={t('Delete Scene')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-3 leading-tight min-h-[3rem]">{scene.location?.name || t('Unknown Location')}</h3>
            <div className="text-sm text-gray-400">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-500 text-xs uppercase tracking-wider">{t('Characters')}</span>
                <span className="bg-gray-700 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">{scene.logistics?.characters?.length || 0}</span>
              </div>
              <p className="line-clamp-2 text-gray-500 text-xs">
                {scene.logistics?.characters?.length ? scene.logistics.characters.join(', ') : t('No characters detected')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {scenes.length === 0 && !rawExtractedText && !isProcessing && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
          <p className="text-lg mb-2">{t('No script loaded')}</p>
          <p className="text-sm">{t('Upload a script file to see the breakdown')}</p>
        </div>
      )}
      
      {rawExtractedText && (
        <div className="mt-6 p-4 bg-gray-900 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-yellow-400">
              Debug: Raw Extracted Text
            </h3>
            <button
              onClick={() => setRawExtractedText(null)}
              className="text-sm text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="max-h-96 overflow-auto p-4 bg-black rounded">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
              {rawExtractedText.substring(0, 5000)}
              {rawExtractedText.length > 5000 && '...'}
            </pre>
          </div>
          <div className="mt-2 text-sm text-gray-400">
            Total characters: {rawExtractedText.length}
          </div>
        </div>
      )}

      {selectedScene && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-700">
            <div className="p-6 border-b border-gray-700 flex justify-between items-start bg-gray-900 rounded-t-xl">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-blue-600 text-white text-sm font-bold px-2 py-0.5 rounded">
                    {t('SCENE')} {selectedScene.sceneNumber}
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {selectedScene.heading}
                  </h3>
                </div>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">📍 {selectedScene.location?.name || 'Unknown Location'}</span>
                  <span className="flex items-center gap-1">🕒 {selectedScene.time || 'Unknown Time'}</span>
                  <span className="flex items-center gap-1">⏱️ {selectedScene.metadata?.estTime || '-'}</span>
                  <span className="flex items-center gap-1">
                    ⭐ {t('Complexity')}: {selectedScene.metadata?.complexity || 0}/5
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedScene(null)}
                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Summary */}
              {selectedScene.summary && (
                <div className="bg-blue-900/20 border border-blue-800 p-3 rounded">
                  <h4 className="text-xs font-bold text-blue-300 uppercase mb-1">{t('One Line Summary')}</h4>
                  <p className="text-sm text-gray-200 italic">{selectedScene.summary}</p>
                </div>
              )}

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Logistics Column */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 border-b border-gray-700 pb-1">{t('Production Logistics')}</h4>
                  
                  <div className="bg-gray-750 p-3 rounded border border-gray-700">
                    <span className="text-xs text-gray-500 block mb-1">{t('Characters')}</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedScene.logistics.characters.length > 0 ? selectedScene.logistics.characters.map((c, i) => (
                        <span key={i} className="bg-gray-700 px-2 py-0.5 rounded text-xs">{c}</span>
                      )) : <span className="text-gray-500 text-xs">-</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-750 p-3 rounded border border-gray-700">
                      <span className="text-xs text-gray-500 block mb-1">{t('Props')}</span>
                      <ul className="text-xs list-disc pl-3 text-gray-300">
                        {selectedScene.logistics.props.map((p, i) => <li key={i}>{p}</li>)}
                        {!selectedScene.logistics.props.length && <li>-</li>}
                      </ul>
                    </div>
                    <div className="bg-gray-750 p-3 rounded border border-gray-700">
                      <span className="text-xs text-gray-500 block mb-1">{t('Wardrobe/Makeup')}</span>
                      <ul className="text-xs list-disc pl-3 text-gray-300">
                        {[...selectedScene.logistics.wardrobe, ...selectedScene.logistics.makeup].map((w, i) => <li key={i}>{w}</li>)}
                        {(!selectedScene.logistics.wardrobe.length && !selectedScene.logistics.makeup.length) && <li>-</li>}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Technical Column */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 border-b border-gray-700 pb-1">{t('Technical & Audio')}</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-750 p-3 rounded border border-gray-700">
                      <span className="text-xs text-gray-500 block mb-1">{t('Camera & Lighting')}</span>
                      <ul className="text-xs list-disc pl-3 text-gray-300">
                        {[...selectedScene.technical.shots, ...selectedScene.technical.camera, ...selectedScene.technical.lighting].map((t, i) => <li key={i}>{t}</li>)}
                        {(!selectedScene.technical.shots.length && !selectedScene.technical.camera.length && !selectedScene.technical.lighting.length) && <li>{t('Standard Coverage')}</li>}
                      </ul>
                    </div>
                    <div className="bg-gray-750 p-3 rounded border border-gray-700">
                      <span className="text-xs text-gray-500 block mb-1">{t('Audio & SFX')}</span>
                      <ul className="text-xs list-disc pl-3 text-gray-300">
                        {[...selectedScene.audio.sound, ...selectedScene.audio.music, ...selectedScene.audio.ambience].map((a, i) => <li key={i}>{a}</li>)}
                        {(!selectedScene.audio.sound.length && !selectedScene.audio.music.length) && <li>{t('Dialogue Only')}</li>}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gray-750 p-3 rounded border border-gray-700">
                    <span className="text-xs text-gray-500 block mb-1">{t('Creative Notes')}</span>
                    <div className="text-xs text-gray-300">
                      {selectedScene.creative.mood && <p><span className="text-gray-500">{t('Mood')}:</span> {selectedScene.creative.mood}</p>}
                      {selectedScene.creative.visuals.length > 0 && <p><span className="text-gray-500">{t('Visuals')}:</span> {selectedScene.creative.visuals.join(', ')}</p>}
                      {!selectedScene.creative.mood && !selectedScene.creative.visuals.length && <p className="italic text-gray-600">{t('No specific notes detected')}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shot List Section */}
              <div className="bg-gray-750 p-4 rounded border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-gray-400">{t('Shot List')}</h4>
                  <button
                    onClick={handleGenerateShotList}
                    disabled={isGeneratingShots}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isGeneratingShots ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span>🎥</span> {selectedScene.shotList ? t('Regenerate Shots') : t('Generate Shots AI')}
                      </>
                    )}
                  </button>
                </div>
                
                {selectedScene.shotList ? (
                  <div className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-800 p-3 rounded border border-gray-600">
                    {typeof selectedScene.shotList === 'string' ? selectedScene.shotList : JSON.stringify(selectedScene.shotList, null, 2)}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">{t('No shot list generated yet.')}</p>
                )}
              </div>

              {/* Script Content Section */}
              <div className="flex-1">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t('Script Content (दृश्य विवरण)')}</h4>
                <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-700 shadow-inner">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300 leading-relaxed font-medium">
                    {selectedScene.content}
                  </pre>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-xl flex justify-end">
              <button
                onClick={() => setSelectedScene(null)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                {t('Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SceneBreakdown
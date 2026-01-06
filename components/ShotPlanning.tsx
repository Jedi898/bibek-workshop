'use client'

import React, { useState, useEffect, useRef } from 'react'
import { loadScenes, updateScene, SceneBreakdown, Shot, DEFAULT_DICTIONARY } from './scriptParser'
import { useLanguage } from './LanguageContext'

// Nepali Grammar Training Dataset (v1)
const NEPALI_GRAMMAR_DB = [
  {"id": 1, "category": "definition", "topic": "व्याकरण", "text": "भाषालाई शुद्ध, स्पष्ट र नियमबद्ध बनाउन प्रयोग गरिने नियमहरूको समष्टिलाई व्याकरण भनिन्छ।"},
  {"id": 2, "category": "definition", "topic": "भाषा", "text": "भाषा मानिसले आफ्ना विचार, भावना र अनुभव आदान–प्रदान गर्न प्रयोग गर्ने माध्यम हो।"},
  {"id": 3, "category": "phonetics", "topic": "वर्ण", "text": "भाषाको सबैभन्दा सानो ध्वनि एकाइलाई वर्ण भनिन्छ।"},
  {"id": 4, "category": "phonetics", "topic": "वर्णमाला", "text": "वर्णहरूको निश्चित क्रमलाई वर्णमाला भनिन्छ।"},
  {"id": 5, "category": "phonetics", "topic": "स्वर", "text": "स्वतन्त्र रूपमा उच्चारण गर्न सकिने वर्णलाई स्वर भनिन्छ।"},
  {"id": 6, "category": "phonetics", "topic": "स्वर सूची", "text": "अ, आ, इ, ई, उ, ऊ, ऋ, ए, ऐ, ओ, औ"},
  {"id": 7, "category": "phonetics", "topic": "व्यञ्जन", "text": "स्वरको सहायता बिना उच्चारण गर्न नसकिने वर्णलाई व्यञ्जन भनिन्छ।"},
  {"id": 8, "category": "phonetics", "topic": "व्यञ्जन उदाहरण", "text": "क, ख, ग, घ, ङ, च, छ, ज, झ, ञ, त, थ, द, ध, न"},
  {"id": 9, "category": "word", "topic": "शब्द", "text": "अर्थ बोकेको वर्ण वा वर्णसमूहलाई शब्द भनिन्छ।"},
  {"id": 10, "category": "parts_of_speech", "topic": "नाम", "text": "व्यक्ति, वस्तु, स्थान, गुण वा भाव जनाउने शब्दलाई नाम भनिन्छ।"},
  {"id": 11, "category": "parts_of_speech", "topic": "नाम उदाहरण", "text": "राम, किताब, काठमाडौं, सुन्दरता"},
  {"id": 12, "category": "parts_of_speech", "topic": "सर्वनाम", "text": "नामको सट्टा प्रयोग गरिने शब्दलाई सर्वनाम भनिन्छ।"},
  {"id": 13, "category": "parts_of_speech", "topic": "सर्वनाम उदाहरण", "text": "म, हामी, तिमी, ऊ, उनीहरू"},
  {"id": 14, "category": "parts_of_speech", "topic": "विशेषण", "text": "नाम वा सर्वनामको गुण, अवस्था वा संख्या जनाउने शब्दलाई विशेषण भनिन्छ।"},
  {"id": 15, "category": "parts_of_speech", "topic": "विशेषण उदाहरण", "text": "राम्रो घर, ठूलो रूख, पाँच किताब"},
  {"id": 16, "category": "parts_of_speech", "topic": "क्रिया", "text": "काम, अवस्था वा घटना जनाउने शब्दलाई क्रिया भनिन्छ।"},
  {"id": 17, "category": "parts_of_speech", "topic": "क्रिया उदाहरण", "text": "खानु, पढ्नु, जानु"},
  {"id": 18, "category": "grammar", "topic": "काल", "text": "क्रियाले जनाउने समयलाई काल भनिन्छ।"},
  {"id": 19, "category": "grammar", "topic": "काल प्रकार", "text": "वर्तमान काल, भूत काल र भविष्य काल"},
  {"id": 20, "category": "grammar", "topic": "वाच्य", "text": "क्रियाको कर्ता वा कर्मसँग सम्बन्ध देखाउने रूपलाई वाच्य भनिन्छ।"},
  {"id": 21, "category": "grammar", "topic": "वचन", "text": "शब्दले एक वा एकभन्दा बढी जनाउँछ भन्ने आधारलाई वचन भनिन्छ।"},
  {"id": 22, "category": "grammar", "topic": "लिङ्ग", "text": "पुरुष वा स्त्री जनाउने आधारलाई लिङ्ग भनिन्छ।"},
  {"id": 23, "category": "grammar", "topic": "कारक", "text": "नाम र क्रियाबीचको सम्बन्ध जनाउने तत्त्वलाई कारक भनिन्छ।"},
  {"id": 24, "category": "grammar", "topic": "विभक्ति", "text": "कारक जनाउन प्रयोग गरिने चिह्नलाई विभक्ति भनिन्छ।"},
  {"id": 25, "category": "syntax", "topic": "वाक्य", "text": "पूर्ण अर्थ व्यक्त गर्ने शब्दसमूहलाई वाक्य भनिन्छ।"},
  {"id": 26, "category": "syntax", "topic": "वाक्य प्रकार", "text": "सरल, संयुक्त र मिश्र वाक्य"},
  {"id": 27, "category": "morphology", "topic": "संधि", "text": "दुई वर्ण वा शब्द मिल्दा हुने परिवर्तनलाई संधि भनिन्छ।"},
  {"id": 28, "category": "morphology", "topic": "समास", "text": "दुई वा दुईभन्दा बढी शब्द मिलेर बनेको शब्दलाई समास भनिन्छ।"},
  {"id": 29, "category": "morphology", "topic": "उपसर्ग", "text": "शब्दको अगाडि लाग्ने अंशलाई उपसर्ग भनिन्छ।"},
  {"id": 30, "category": "morphology", "topic": "प्रत्यय", "text": "शब्दको पछाडि लाग्ने अंशलाई प्रत्यय भनिन्छ।"},
  {"id": 31, "category": "punctuation", "topic": "विरामचिह्न", "text": "वाक्यलाई स्पष्ट बनाउन प्रयोग गरिने चिह्नलाई विरामचिह्न भनिन्छ।"},
  {"id": 32, "category": "idiom", "topic": "मुहावरा", "text": "विशेष अर्थ दिने स्थिर शब्दसमूहलाई मुहावरा भनिन्छ।"},
  {"id": 33, "category": "proverb", "topic": "उखान", "text": "अनुभव र शिक्षा दिने छोटा भनाइलाई उखान भनिन्छ।"}
];

const ShotPlanning = () => {
  const { t } = useLanguage()
  const [scenes, setScenes] = useState<SceneBreakdown[]>([])
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)
  const [editingShot, setEditingShot] = useState<Shot | null>(null)
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [aiMood, setAiMood] = useState('')
  const [aiCharacters, setAiCharacters] = useState('')
  const [aiOutput, setAiOutput] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const aiOutputRef = useRef<HTMLDivElement>(null)
  const [showTraining, setShowTraining] = useState(false)
  const [grammarRules, setGrammarRules] = useState(NEPALI_GRAMMAR_DB)
  const [customSceneKeywords, setCustomSceneKeywords] = useState<string[]>([
    'INT', 'EXT', 'I/E', 'INT/EXT', 'आ', 'बा', 'आ/बा', 'आन्तरिक', 'बाहिर'
  ])
  const [newRule, setNewRule] = useState({ category: 'word', topic: '', text: '' })
  const [newKeyword, setNewKeyword] = useState('')

  // Algorithm: Basic Nepali NLP Rule-Based Parser
  // "Trains" the app to understand specific Nepali grammatical markers
  const extractNepaliContext = (text: string) => {
    const tokens = text.split(/\s+|[।?!,]/).filter(t => t.length > 0);
    const context = {
      potentialCharacters: new Set<string>(),
      potentialLocations: new Set<string>(),
      keyActions: new Set<string>()
    };

    // Extract knowledge from the dynamic "Training Set"
    const knownPronouns = grammarRules.find(d => d.topic === "सर्वनाम उदाहरण")?.text.split(/,\s*/) || [];
    const knownVerbs = grammarRules.find(d => d.topic === "क्रिया उदाहरण")?.text.split(/,\s*/) || [];
    const knownNouns = grammarRules.find(d => d.topic === "नाम उदाहरण")?.text.split(/,\s*/) || [];

    tokens.forEach((word, index) => {
      // Heuristic 1: 'ले' (le) often marks the subject/agent in Nepali
      if (word.endsWith('ले') && word.length > 2) {
        context.potentialCharacters.add(word.slice(0, -2));
      }
      // Heuristic 2: 'लाई' (lai) marks the object/receiver
      if (word.endsWith('लाई') && word.length > 3) {
        context.potentialCharacters.add(word.slice(0, -3));
      }
      // Heuristic 3: 'मा' (ma) often marks location
      if (word.endsWith('मा') && word.length > 2) {
        context.potentialLocations.add(word.slice(0, -2));
      }

      // Training Data Matching
      if (knownPronouns.includes(word)) {
         // Pronouns are often subjects in scripts
         context.potentialCharacters.add(word);
      }
      if (knownNouns.includes(word)) {
         // Known nouns from training set
         context.potentialCharacters.add(word);
      }
      // Simple fuzzy match for verbs (since they conjugate)
      if (knownVerbs.some(v => word.includes(v.replace('नु', '')))) { 
         context.keyActions.add(word);
      }
    });

    return context;
  };

  // Load scenes from shared storage on mount
  useEffect(() => {
    const saved = loadScenes()
    if (saved && saved.length > 0) {
      setScenes(saved)
      if (!selectedSceneId) {
        setSelectedSceneId(saved[0].id)
      }
    }

    const savedGrammar = localStorage.getItem('app-training-grammar')
    if (savedGrammar) setGrammarRules(JSON.parse(savedGrammar))

    const savedKeywords = localStorage.getItem('app-training-keywords')
    if (savedKeywords) setCustomSceneKeywords(JSON.parse(savedKeywords))
  }, [])

  const selectedScene = scenes.find(s => s.id === selectedSceneId)

  useEffect(() => {
    if (showAiPanel && aiOutputRef.current && aiOutput) {
      aiOutputRef.current.innerHTML = aiOutput
    }
  }, [showAiPanel, aiOutput])

  // Auto-detect characters and mood context when opening AI panel
  useEffect(() => {
    if (showAiPanel && selectedScene) {
      // Simple heuristic: Find capitalized words or Nepali names (approximate)
      // In a real app, this would be an NLP extraction
      if (!aiCharacters && selectedScene.content) {
        const nlpResult = extractNepaliContext(selectedScene.content);
        if (nlpResult.potentialCharacters.size > 0) {
          setAiCharacters(Array.from(nlpResult.potentialCharacters).join(', '));
        }
      }
      
      // Reset output if scene changes
      if (!aiOutput) setAiOutput(null)
    }
  }, [showAiPanel, selectedScene])

  const handleAddShot = () => {
    if (!selectedScene) return

    const newShot: Shot = {
      id: Math.random().toString(36).substr(2, 9),
      number: (selectedScene.shotList?.length || 0) + 1,
      size: 'WIDE',
      angle: 'EYE-LEVEL',
      movement: 'STATIC',
      equipment: 'TRIPOD',
      description: '',
      subject: ''
    }

    const updatedScene = {
      ...selectedScene,
      shotList: [...(selectedScene.shotList || []), newShot]
    }

    // Update local state and persistent storage
    const updatedScenes = updateScene(scenes, updatedScene)
    setScenes(updatedScenes)
    setEditingShot(newShot)
  }

  const handleUpdateShot = (shot: Shot) => {
    if (!selectedScene) return

    const updatedList = selectedScene.shotList.map(s => s.id === shot.id ? shot : s)
    const updatedScene = { ...selectedScene, shotList: updatedList }
    
    const updatedScenes = updateScene(scenes, updatedScene)
    setScenes(updatedScenes)
    setEditingShot(null)
  }

  const handleDeleteShot = (shotId: string) => {
    if (!selectedScene || !window.confirm(t('Delete this shot?'))) return

    const updatedList = selectedScene.shotList.filter(s => s.id !== shotId)
    // Renumber shots
    const renumberedList = updatedList.map((s, index) => ({ ...s, number: index + 1 }))
    
    const updatedScene = { ...selectedScene, shotList: renumberedList }
    const updatedScenes = updateScene(scenes, updatedScene)
    setScenes(updatedScenes)
  }

  const handleGenerateAi = async () => {
    if (!selectedScene) return
    
    // Allow generation even if fields are empty - let AI infer from script
    if (!selectedScene.content) {
      alert(t('Scene has no content to analyze.'))
      return
    }

    setIsGenerating(true)
    setAiOutput(null)
    
    try {
      // ---------------------------------------------------------
      // ARCHITECTURE UPGRADE: 
      // Instead of ignoring the script, we construct a context-aware payload.
      // ---------------------------------------------------------
      
      const nlpAnalysis = selectedScene.content ? extractNepaliContext(selectedScene.content) : null;

      const promptPayload = {
        scriptContent: selectedScene.content,
        userMood: aiMood, // Optional override
        userCharacters: aiCharacters, // Optional override
        technicalConstraints: selectedScene.technical,
        nepaliGrammarAnalysis: nlpAnalysis, // Feeding the "trained" logic to the AI
        grammarKnowledgeBase: grammarRules // Injecting the full dataset for context
      }

      console.log("Sending to AI Agent:", promptPayload)

      // SIMULATION OF API CALL
      // const response = await fetch('/api/generate-shots', { method: 'POST', body: JSON.stringify(promptPayload) })
      // const data = await response.json()
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mocking a smarter response that references the actual input
      const inferredMood = aiMood || "Dramatic/Intense"
      const inferredChars = aiCharacters || "the characters"

      const mockResult = `
        <div class="space-y-3 text-gray-200">
          <div>
            <h4 class="font-bold text-blue-400">AI Analysis: ${inferredMood}</h4>
            <p class="text-xs text-gray-400 mb-2">Based on the script action...</p>
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li><strong>Master Shot:</strong> Wide shot establishing ${inferredChars} in ${selectedScene.location.name}.</li>
              <li><strong>Psychological Angle:</strong> Use a <em>Dutch Angle</em> to reflect the ${inferredMood.toLowerCase()} tension found in the dialogue.</li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold text-blue-400">Suggested Shot List</h4>
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li><strong>1. Medium Close-Up:</strong> Focus on reaction during the revelation.</li>
              <li><strong>2. Slow Push-In:</strong> To emphasize the internal conflict described in the scene.</li>
            </ul>
          </div>
        </div>
      `
      setAiOutput(mockResult)
    } catch (error) {
      console.error(error)
      alert(t('Error generating shots'))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveToNotes = () => {
    if (!aiOutputRef.current) return
    const savedNotes = localStorage.getItem('script-editor-notes')
    let notes = []
    try {
      notes = savedNotes ? JSON.parse(savedNotes) : []
    } catch (e) {}
    
    const newNote = {
      id: Date.now().toString(),
      mood: aiMood,
      characters: aiCharacters,
      content: aiOutputRef.current.innerHTML,
      timestamp: Date.now()
    }
    
    localStorage.setItem('script-editor-notes', JSON.stringify([newNote, ...notes]))
    alert(t('Saved to Notes (accessible in Editor)'))
    setShowAiPanel(false)
    setAiOutput(null)
  }

  const handleAddRule = () => {
    if (!newRule.topic || !newRule.text) return
    const updated = [...grammarRules, { id: Date.now(), ...newRule }]
    setGrammarRules(updated)
    localStorage.setItem('app-training-grammar', JSON.stringify(updated))
    setNewRule({ category: 'word', topic: '', text: '' })
  }

  const handleAddKeyword = () => {
    if (!newKeyword || customSceneKeywords.includes(newKeyword)) return
    const updated = [...customSceneKeywords, newKeyword]
    setCustomSceneKeywords(updated)
    localStorage.setItem('app-training-keywords', JSON.stringify(updated))
    setNewKeyword('')
  }


  if (scenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
        <div className="text-4xl mb-4">🎬</div>
        <h2 className="text-xl font-bold mb-2">{t('No Scenes Found')}</h2>
        <p className="text-center max-w-md">
          {t('Please go to the Scene Breakdown feature and import a script first. Shot planning requires broken-down scenes.')}
        </p>
      </div>
    )
  }

  return (
    <>
    {/* Training Center Modal */}
    {showTraining && (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col border border-gray-700 shadow-2xl">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900 rounded-t-lg">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">🧠 {t('App Training Center')}</h2>
            <button onClick={() => setShowTraining(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Section 1: Grammar & Vocabulary */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-blue-400 border-b border-gray-700 pb-2">{t('Nepali Grammar & Vocabulary')}</h3>
              <p className="text-xs text-gray-400">{t('Teach the app new words to improve context detection.')}</p>
              
              <div className="bg-gray-900 p-3 rounded border border-gray-700 space-y-2">
                <input 
                  className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm text-white" 
                  placeholder={t('Topic (e.g., New Verbs)')}
                  value={newRule.topic}
                  onChange={e => setNewRule({...newRule, topic: e.target.value})}
                />
                <textarea 
                  className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm text-white" 
                  placeholder={t('Content (comma separated words or definition)')}
                  value={newRule.text}
                  onChange={e => setNewRule({...newRule, text: e.target.value})}
                />
                <button onClick={handleAddRule} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-sm">{t('Add Rule')}</button>
              </div>

              <div className="h-64 overflow-y-auto space-y-2 pr-2">
                {grammarRules.slice().reverse().map((rule: any) => (
                  <div key={rule.id} className="bg-gray-700/50 p-2 rounded text-sm border border-gray-600">
                    <span className="text-blue-300 font-bold">{rule.topic}:</span> <span className="text-gray-300">{rule.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Script Structure */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-green-400 border-b border-gray-700 pb-2">{t('Script Structure Training')}</h3>
              <p className="text-xs text-gray-400">{t('Define keywords that start a scene (e.g., INT, EXT, दृश्य).')}</p>
              
              <div className="flex gap-2">
                <input 
                  className="flex-1 bg-gray-900 border border-gray-600 rounded p-2 text-sm text-white" 
                  placeholder={t('New Scene Keyword')}
                  value={newKeyword}
                  onChange={e => setNewKeyword(e.target.value)}
                />
                <button onClick={handleAddKeyword} className="bg-green-600 hover:bg-green-700 text-white px-4 rounded text-sm">{t('Add')}</button>
              </div>

              <div className="flex flex-wrap gap-2">
                {customSceneKeywords.map(kw => (
                  <span key={kw} className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm border border-gray-600">{kw}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    <div className="flex h-full bg-gray-900 text-white overflow-hidden">
      {/* Sidebar: Scene List */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700 font-bold text-lg">
          {t('Scenes')}
        </div>
        <div className="overflow-y-auto flex-1">
          {scenes.map(scene => (
            <button
              key={scene.id}
              onClick={() => setSelectedSceneId(scene.id)}
              className={`w-full text-left p-3 border-b border-gray-700 hover:bg-gray-700 transition-colors text-sm ${
                selectedSceneId === scene.id ? 'bg-blue-900/50 border-l-4 border-l-blue-500' : 'text-gray-400'
              }`}
            >
              <div className="font-bold text-white">
                {t('SCENE')} {scene.sceneNumber}
              </div>
              <div className="truncate text-xs mt-1">{scene.location.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedScene ? (
          <>
            {/* Header */}
            <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center shadow-md z-10">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <span className="bg-blue-600 text-xs px-2 py-1 rounded">{selectedScene.location.type}</span>
                  {selectedScene.location.name}
                  <span className="text-gray-400 text-sm font-normal">({selectedScene.time})</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1 truncate max-w-2xl">{selectedScene.summary || t('No summary available')}</p>
              </div>
              <div className="flex gap-2">
              <button
                onClick={() => setShowTraining(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded flex items-center gap-2 text-sm font-bold shadow-lg transition-transform transform hover:scale-105"
              >
                <span>🧠</span> {t('Train App')}
              </button>
              <button
                onClick={() => setShowAiPanel(!showAiPanel)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold shadow-lg transition-transform transform hover:scale-105"
              >
                <span>✨</span> {t('AI Ideas')}
              </button>
              <button
                onClick={handleAddShot}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold shadow-lg transition-transform transform hover:scale-105"
              >
                <span>+</span> {t('Add Shot')}
              </button>
              </div>
            </div>

            {/* AI Panel */}
            {showAiPanel && (
              <div className="p-4 bg-gray-800 border-b border-gray-700 animate-in slide-in-from-top-2">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-400">{t('Mood')}:</label>
                    <input
                      type="text"
                      value={aiMood}
                      onChange={(e) => setAiMood(e.target.value)}
                      className="px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm w-48 focus:outline-none focus:border-orange-500 text-white"
                      placeholder={t('Leave empty to auto-detect')}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-400">{t('Characters')}:</label>
                    <input
                      type="text"
                      value={aiCharacters}
                      onChange={(e) => setAiCharacters(e.target.value)}
                      className="px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm w-64 focus:outline-none focus:border-orange-500 text-white"
                      placeholder={t('Leave empty to auto-detect')}
                    />
                  </div>
                  <button
                    onClick={handleGenerateAi}
                    disabled={isGenerating}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-2 h-[38px]"
                  >
                    {isGenerating ? t('Crawling...') : t('Generate Shots')}
                  </button>
                </div>
                {aiOutput && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Shot Ideas (Editable)')}</span>
                      <button onClick={handleSaveToNotes} className="text-xs bg-orange-900/50 hover:bg-orange-800 text-orange-200 px-2 py-1 rounded transition-colors border border-orange-800">
                        {t('Save to Notes')}
                      </button>
                    </div>
                    <div 
                      ref={aiOutputRef}
                      className="p-4 bg-gray-900 rounded border border-gray-700 shadow-sm text-gray-200 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-text" 
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={() => { if (aiOutputRef.current) setAiOutput(aiOutputRef.current.innerHTML) }}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Script Context */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">{t('Script Context')}</h3>
                    <div className="text-sm text-gray-300 font-mono whitespace-pre-wrap max-h-[60vh] overflow-y-auto pr-2">
                      {selectedScene.content}
                    </div>
                  </div>
                  
                  {/* Extracted Technical Notes */}
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">{t('Suggested Elements')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedScene.technical.shots.map((s, i) => (
                        <span key={i} className="text-xs bg-purple-900/50 text-purple-200 px-2 py-1 rounded border border-purple-800">{s}</span>
                      ))}
                      {selectedScene.technical.camera.map((c, i) => (
                        <span key={i} className="text-xs bg-indigo-900/50 text-indigo-200 px-2 py-1 rounded border border-indigo-800">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Shot List */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    {t('Shot List')} 
                    <span className="text-sm font-normal text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                      {selectedScene.shotList?.length || 0}
                    </span>
                  </h3>

                  <div className="space-y-3">
                    {(selectedScene.shotList || []).map((shot) => (
                      <div key={shot.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-blue-500 transition-colors group relative">
                        {editingShot?.id === shot.id ? (
                          // Edit Mode
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 flex justify-between items-center mb-2">
                              <span className="font-bold text-blue-400">Shot #{shot.number}</span>
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">{t('Size')}</label>
                              <select 
                                className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-sm"
                                value={shot.size}
                                onChange={(e) => setEditingShot({...shot, size: e.target.value})}
                              >
                                {DEFAULT_DICTIONARY.shots.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">{t('Angle')}</label>
                              <select 
                                className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-sm"
                                value={shot.angle}
                                onChange={(e) => setEditingShot({...shot, angle: e.target.value})}
                              >
                                <option value="EYE-LEVEL">Eye-Level</option>
                                <option value="LOW ANGLE">Low Angle</option>
                                <option value="HIGH ANGLE">High Angle</option>
                                <option value="DUTCH">Dutch</option>
                                <option value="OVERHEAD">Overhead</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs text-gray-500 mb-1">{t('Movement')}</label>
                              <select 
                                className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-sm"
                                value={shot.movement}
                                onChange={(e) => setEditingShot({...shot, movement: e.target.value})}
                              >
                                <option value="STATIC">Static</option>
                                {DEFAULT_DICTIONARY.camera.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs text-gray-500 mb-1">{t('Subject')}</label>
                              <input 
                                className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-sm"
                                value={shot.subject}
                                onChange={(e) => setEditingShot({...shot, subject: e.target.value})}
                                placeholder="e.g. Ram, Door, Hand"
                              />
                            </div>

                            <div className="col-span-2">
                              <label className="block text-xs text-gray-500 mb-1">{t('Description')}</label>
                              <textarea 
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm"
                                rows={2}
                                value={shot.description}
                                onChange={(e) => setEditingShot({...shot, description: e.target.value})}
                                placeholder="Describe the action..."
                              />
                            </div>

                            <div className="col-span-2 flex justify-end gap-2 mt-2">
                              <button onClick={() => setEditingShot(null)} className="px-3 py-1 text-sm text-gray-400 hover:text-white">{t('Cancel')}</button>
                              <button onClick={() => handleUpdateShot(editingShot!)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">{t('Save Shot')}</button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="bg-gray-700 text-white font-bold px-2 py-1 rounded text-sm">#{shot.number}</span>
                                <span className="font-bold text-blue-300">{shot.size}</span>
                                <span className="text-gray-400 text-xs px-2 border-l border-gray-600">{shot.angle}</span>
                                <span className="text-gray-400 text-xs px-2 border-l border-gray-600">{shot.movement}</span>
                              </div>
                              <p className="text-sm text-gray-300 mb-1"><span className="text-gray-500">{t('Subject')}:</span> {shot.subject || 'N/A'}</p>
                              <p className="text-sm text-gray-400 italic">{shot.description || t('No description')}</p>
                            </div>
                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => setEditingShot(shot)}
                                className="p-1 text-gray-400 hover:text-blue-400"
                                title={t('Edit')}
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={() => handleDeleteShot(shot.id)}
                                className="p-1 text-gray-400 hover:text-red-400"
                                title={t('Delete')}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {(!selectedScene.shotList || selectedScene.shotList.length === 0) && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg text-gray-500">
                        {t('No shots planned yet. Click "Add Shot" to begin.')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {t('Select a scene to start planning shots')}
          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default ShotPlanning
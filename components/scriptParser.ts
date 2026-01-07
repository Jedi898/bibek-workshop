export interface Shot {
  id: string
  number: number
  size: string // e.g., Wide, Close Up
  angle: string // e.g., Low, High, Eye-Level
  movement: string // e.g., Static, Pan, Dolly
  equipment: string // e.g., Tripod, Steadicam
  description: string
  subject: string
}

export interface SceneBreakdown {
  id: string
  sceneNumber: string
  heading: string
  location: {
    type: string // INT/EXT
    name: string
  }
  time: string
  summary: string // One-line summary
  content: string
  script: string
  
  // Technical Elements
  technical: {
    shots: string[]
    camera: string[]
    lighting: string[]
    equipment: string[]
  }

  // Creative Elements
  creative: {
    mood: string
    visuals: string[]
    pacing: string
  }

  // Production Logistics
  logistics: {
    characters: string[] // Appearing
    props: string[]
    wardrobe: string[]
    makeup: string[]
    sfx: string[] // Special effects
    stunts: string[]
  }

  // Audio Elements
  audio: {
    dialogueLines: number
    sound: string[] // SFX
    music: string[]
    ambience: string[]
  }

  // Shot Planning
  shotList: Shot[]

  metadata: {
    estTime: string
    pageCount: string
    complexity: number // 1-5 stars
    genre?: string
  }
  aiHistory?: { timestamp: number; content: string; mood: string; isPinned?: boolean }[]
}

// Default dictionary for parsing (mirrors public/data/nepali_dictionary.json)
export const DEFAULT_DICTIONARY = {
  shots: ['CLOSE UP', 'CLOSE-UP', 'WIDE', 'LONG SHOT', 'MCU', 'ECU', 'ESTABLISHING', 'TWO SHOT', 'INSERT', 'POV', 'क्लोजअप', 'वाइड', 'लङ सट', 'इन्जर्ट', 'पिओभी', 'मिड सट', 'एक्स्ट्रीम क्लोजअप', 'एरियल', 'मास्टर सट'],
  camera: ['PAN', 'TILT', 'DOLLY', 'TRACK', 'STEADICAM', 'HANDHELD', 'CRANE', 'DRONE', 'ZOOM', 'FOCUS', 'RACK FOCUS', 'प्यान', 'जुम', 'क्यामेरा', 'ट्र्याक', 'फोकस', 'स्टिडिक्याम', 'ह्यान्डहेल्ड', 'क्रेन', 'ड्रोन', 'टिल्ट'],
  lighting: ['DARK', 'BRIGHT', 'DIM', 'SUNLIGHT', 'MOONLIGHT', 'SHADOW', 'SILHOUETTE', 'FLASH', 'CANDLE', 'LAMP', 'LANTERN', 'TORCH', 'अँध्यारो', 'उज्यालो', 'बत्ती', 'छाया', 'घाम', 'जुन', 'टर्च', 'लालटिन', 'मैनबत्ती', 'साँझ', 'बिहानी'],
  equipment: ['GREEN SCREEN', 'BLUE SCREEN', 'RIG', 'GIMBAL', 'LENS', 'TRIPOD', 'ट्राइपोड', 'लेन्स', 'गिम्बल', 'रिफ्लेक्टर'],
  
  mood: ['SAD', 'HAPPY', 'TENSE', 'SCARY', 'ROMANTIC', 'QUIET', 'CHAOTIC', 'SILENCE', 'BEAT', 'EMOTIONAL', 'HOPEFUL', 'DESPERATE', 'खुसी', 'दुखी', 'डरलाग्दो', 'मौन', 'शान्त', 'भावुक', 'आशावादी', 'निराश', 'रिसाएको', 'हँसिलो', 'गम्भीर', 'अत्तालिएको', 'लजाएको', 'थकित', 'उदास', 'तनाव'],
  visuals: ['RED', 'BLUE', 'GREEN', 'GOLD', 'FOG', 'RAIN', 'SMOKE', 'DUST', 'BLOOD', 'MUD', 'RIVER', 'FIELDS', 'HILLS', 'रातो', 'नीलो', 'धुवाँ', 'रगत', 'हिलो', 'खोला', 'खेत', 'डाँडा', 'कुहिरो', 'बादल', 'जंगल', 'बाटो', 'घर', 'आँगन', 'हिमाल', 'पोखरी', 'बगैंचा'],
  
  props: ['GUN', 'PHONE', 'KNIFE', 'BAG', 'MONEY', 'BOOK', 'CAR', 'GLASS', 'CIGARETTE', 'PLOUGH', 'SPADE', 'RADIO', 'FLAG', 'TEA', 'RICE', 'बन्दुक', 'फोन', 'झोला', 'पैसा', 'किताब', 'गाडी', 'चिया', 'पानी', 'हलो', 'कोदालो', 'रेडियो', 'झन्डा', 'भात', 'गाग्री', 'लोटा', 'थाल', 'कचौरा', 'चुरोट', 'रक्सी', 'मोबाइल', 'ल्यापटप', 'कलम', 'कापी', 'साइकल', 'मोटरसाइकल', 'बस', 'ट्रक', 'डोको', 'नाम्लो', 'हँसिया', 'खुकुरी', 'गुन्द्री', 'सुकुल', 'टुकी', 'चुलो', 'कराई', 'दाउरा'],
  wardrobe: ['WEARING', 'DRESSED', 'SUIT', 'UNIFORM', 'COAT', 'SHIRT', 'JEANS', 'SHOES', 'DHAKA TOPI', 'DAURA SURUWAL', 'SARI', 'KURTA', 'लुगा', 'सारी', 'कोट', 'टोपी', 'ढाका टोपी', 'दौरा सुरुवाल', 'कुर्ता', 'चप्पल', 'जुत्ता', 'मोजा', 'चस्मा', 'घडी', 'माला', 'पोते', 'सिन्दुर', 'टिका', 'पतुका', 'भादगाउँले टोपी', 'गुन्यु चोलो', 'धोती', 'गम्छा'],
  makeup: ['WOUND', 'SCAR', 'TEARS', 'SWEAT', 'DIRTY', 'BRUISED', 'PALE', 'घाउ', 'रगत', 'पसिना', 'मैलो', 'दाग', 'कपाल', 'दाह्री', 'जुँगा', 'गाजल', 'लिपिस्टिक', 'फोहोर'],
  sfx: ['EXPLOSION', 'FIRE', 'SMOKE', 'SPARK', 'DEBRIS', 'THUNDER', 'BLAST', 'आगो', 'विस्फोट', 'चट्याङ', 'गोली', 'बम'],
  stunts: ['FALL', 'JUMP', 'FIGHT', 'PUNCH', 'KICK', 'CRASH', 'RUN', 'CHASE', 'SLAP', 'STRUGGLE', 'लड्ने', 'कुद्ने', 'हान्ने', 'भाग्ने', 'कुटाकुट', 'थप्पड', 'धकेल्ने', 'तान्ने', 'हिर्काउने'],
  
  sound: ['SOUND', 'NOISE', 'CLICK', 'BANG', 'RING', 'FOOTSTEPS', 'SCREAM', 'CRY', 'WHISPER', 'BARK', 'आवाज', 'चिच्याउने', 'रुने', 'सुस्केरा', 'भुक्ने', 'घन्टी', 'शंख', 'सिठी', 'ताली', 'हाँसो'],
  music: ['MUSIC', 'SONG', 'SCORE', 'RADIO', 'SINGING', 'FLUTE', 'SARANGI', 'MADAL', 'संगीत', 'गीत', 'बाँसुरी', 'सारङ्गी', 'मादल', 'गितार', 'पियानो', 'हार्मोनियम', 'तबला', 'बाजा'],
  ambience: ['WIND', 'RAIN', 'TRAFFIC', 'CROWD', 'SILENCE', 'BIRDS', 'CRICKETS', 'RIVER FLOW', 'VILLAGE', 'हावा', 'पानी', 'भीड', 'चरा', 'गाउँ', 'खोलाको आवाज', 'गाडीको आवाज', 'कुकुर भुकेको', 'चरा कराएको', 'सन्नाटा'],
  
  // Genre Specific Keywords
  mythological: ['SWORD', 'KING', 'QUEEN', 'PALACE', 'THRONE', 'CHARIOT', 'BOW', 'ARROW', 'DEMON', 'GOD', 'TEMPLE', 'राजा', 'रानी', 'दरबार', 'तरवार', 'धनुष', 'बाण', 'रथ', 'राक्षस', 'भगवान', 'मन्दिर', 'सिंहासन', 'युद्ध'],
  village: ['HUT', 'FIELD', 'FARM', 'COW', 'GOAT', 'RIVER', 'WELL', 'MUD', 'FOREST', 'झुपडी', 'खेत', 'बारी', 'गाई', 'बाख्रा', 'कुवा', 'पँधेरो', 'चौतारी', 'भन्ज्याङ', 'उकालो', 'ओरालो'],
  modern: ['OFFICE', 'COMPUTER', 'PHONE', 'CAR', 'CAFE', 'BUILDING', 'LAPTOP', 'INTERNET', 'अफिस', 'कम्प्युटर', 'मोबाइल', 'गाडी', 'क्याफे', 'भवन', 'सहर', 'बजार'],
  action: ['GUN', 'BOMB', 'CHASE', 'FIGHT', 'POLICE', 'ARREST', 'KILL', 'BLOOD', 'बन्दुक', 'बम', 'प्रहरी', 'मारपिट', 'रगत', 'आक्रमण']
}

// Helper to get dynamic keywords from Training Center
const getSceneKeywordsPattern = (): string => {
  const defaults = ['INT', 'EXT', 'I/E', 'INT/EXT', 'EST', 'दृश्य', 'सिट', 'भित्र', 'बाहिर', 'भित्री', 'बाहिरी', 'SCENE'];
  let custom: string[] = [];
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = localStorage.getItem('app-training-keywords');
      if (saved) custom = JSON.parse(saved);
    } catch (e) {}
  }
  const all = Array.from(new Set([...defaults, ...custom]));
  return all.sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
}

// Helper to get known characters from Training Center
const getKnownCharacters = (): string[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = localStorage.getItem('app-training-grammar');
      if (saved) {
        const rules = JSON.parse(saved);
        // Extract text from rules where category is 'character' or topic contains 'name'
        return rules
          .filter((r: any) => r.category === 'character' || /name|naam|नाम|पात्र/i.test(r.topic))
          .flatMap((r: any) => r.text.split(/,\s*/))
          .map((s: string) => s.trim());
      }
    } catch (e) {}
  }
  return [];
}

/**
 * Cleans raw script text by fixing common OCR artifacts and normalization issues.
 */
export const cleanScriptText = (scriptText: string): string => {
  // Normalize text: remove weird spaces, ensure standard newlines
  let cleanText = scriptText
    .normalize('NFC') // Ensure Unicode normalization (fixes separated diacritics)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\u00A0/g, ' ') // Replace non-breaking spaces with normal space
    .replace(/[\u200B\uFEFF]/g, '') // Remove zero-width spaces but KEEP ZWJ/ZWNJ (\u200C, \u200D) for Nepali conjuncts
    .replace(/[ \t]+/g, ' ') // Collapse multiple spaces
    // Fix detached Devanagari matras/modifiers (common PDF issue: "क ा" -> "का")
    .replace(/([\u0900-\u097F])\s+([\u0901-\u0903\u093C\u093E-\u094D\u0951-\u0954\u0962\u0963])/g, '$1$2')

  // Define replacements for PDF OCR artifacts
  // NOTE: The PDF import process (OCR) misinterprets the font, converting English words 
  // into numbers based on visual similarity (e.g., "BOB" -> "808", "SCENE" -> "50...").
  // We map them back to English here.
  const artifacts = [
    // Scene Headings
    { pattern: /50[६E6][^\s-]*\s*[-]\s*(\d+[A-Z]?)/g, replacement: '\nSCENE $1 -' },
    { pattern: /50[६E6]146/g, replacement: 'SCENE' },
    { pattern: /॥\s*[ाप][ा]?\./g, replacement: 'INT.' },
    { pattern: /€\)0त\./g, replacement: 'EXT.' },
    { pattern: /506116/g, replacement: 'SCENE' },
    
    // Character Names (Whole lines)
    { pattern: /^\s*808(\s*\(.*\))?\s*$/gm, replacement: 'BOB$1' },
    { pattern: /^\s*1212\.?(\s*\(.*\))?\s*$/gm, replacement: 'MAILA$1' },
    { pattern: /^\s*2010(\s*\(.*\))?\s*$/gm, replacement: 'PANDEY$1' },
    { pattern: /^\s*81[९9]\/87(\s*\(.*\))?\s*$/gm, replacement: 'BIKASH$1' },
    { pattern: /^\s*8195(\s*\(.*\))?\s*$/gm, replacement: 'BIKASH$1' },
    { pattern: /^\s*2\/\/40€%(\s*\(.*\))?\s*$/gm, replacement: 'PANDEY$1' },
    { pattern: /^\s*2240(\s*\(.*\))?\s*$/gm, replacement: 'PANDEY$1' },
    { pattern: /^\s*\[पि पाट(\s*\(.*\))?\s*$/gm, replacement: 'MAILA$1' },
    { pattern: /^\s*रि\/७॥७(\s*\(.*\))?\s*$/gm, replacement: 'RAGHU$1' },
    { pattern: /^\s*अशर ९८40(\s*\(.*\))?\s*$/gm, replacement: 'TANTRIK PANDEY$1' },
    { pattern: /^\s*अपार 0८00(\s*\(.*\))?\s*$/gm, replacement: 'TANTRIK PANDEY$1' },
    { pattern: /^\s*अपार \?\/\/40€४(\s*\(.*\))?\s*$/gm, replacement: 'TANTRIK PANDEY$1' },
    { pattern: /^\s*पश्ाषारि९\?\/॥\/५0€\?(\s*\(.*\))?\s*$/gm, replacement: 'TANTRIK PANDEY$1' },
    { pattern: /^\s*जान९€0\/२ \(0४८५\.\s*$/gm, replacement: 'THEKEDAR KAMAL' },
    { pattern: /^\s*€149\. \?२\/५\/९\/८8१\s*$/gm, replacement: 'ENG. PRAKASH' },
    
    // Transitions
    { pattern: /^\s*८010[:.]?\s*$/gm, replacement: 'CUT TO:' },
    { pattern: /^\s*808\s*८010\.\s*$/gm, replacement: 'BOB CONTD.' },
    { pattern: /^\s*C010[:.]?\s*$/gm, replacement: 'CUT TO:' },
    { pattern: /^\s*CUT\s*T0[:.]?\s*$/gm, replacement: 'CUT TO:' },

    // Inline Artifacts (Words inside sentences/headings)
    { pattern: /81[९9][02४][^\s]*/g, replacement: "BIKAS'S" },
    { pattern: /\b808\b/g, replacement: "BOB" },
    { pattern: /\b8O8\b/g, replacement: "BOB" },
    { pattern: /\bB0B\b/g, replacement: "BOB" },
    { pattern: /1212\.(?!\d)/g, replacement: "MAILA" },
    { pattern: /\b2010\b/g, replacement: "PANDEY" },
    { pattern: /\b2240\b/g, replacement: "PANDEY" },
    { pattern: /2\/\/40€%/g, replacement: "PANDEY" },
    { pattern: /\b8195\b/g, replacement: "BIKAS" },
    { pattern: /२0[0०][^\s]*/g, replacement: "ROOM" },
    { pattern: /\?२०५€८ा 10 कता/g, replacement: "PROJECT LAND" },
    { pattern: /81९25'5/g, replacement: "BIKAS'S" },
    { pattern: /81९2४5515/g, replacement: "BIKASH'S" },
    { pattern: /780-2/g, replacement: "MAILA" },
    { pattern: /22\/140€7/g, replacement: "PANDEY" },
    { pattern: /81005/g, replacement: "BIKAS" },
    { pattern: /50६146/g, replacement: "SCENE" },
  ]

  artifacts.forEach(({ pattern, replacement }) => {
    cleanText = cleanText.replace(pattern, replacement)
  })

  // Merge isolated scene numbers with following heading (e.g. "1\nEXT." -> "1 EXT.")
  const kwPattern = getSceneKeywordsPattern()
  cleanText = cleanText.replace(new RegExp(`^(\\d+[A-Z\\.]*)\\s*\\n\\s*((?:${kwPattern}))`, 'gim'), '$1 $2')

  // Heuristic: If text is long but has few newlines (e.g. bad PDF extraction), try to insert them before Scene Headings
  if (cleanText.length > 500 && cleanText.split('\n').length < 20) {
    // Look for INT./EXT. or Nepali headers preceded by punctuation or space
    cleanText = cleanText.replace(new RegExp(`([.?!])\\s*((?:${kwPattern})[\\.\\s])`, 'gi'), '$1\n$2')
    // Look for numbered scenes like "1. INT"
    cleanText = cleanText.replace(new RegExp(`([.?!])\\s*(\\d+[\\.\\s]+(?:${kwPattern}))`, 'gi'), '$1\n$2')
  }

  return cleanText
}

/**
 * Parses a raw script string into a structured scene breakdown.
 * Redesigned for robust filmmaking/video production breakdown.
 */
export const parseScript = (scriptText: string): SceneBreakdown[] => {
  const cleanText = cleanScriptText(scriptText)
  const lines = cleanText.split('\n')
  const scenes: SceneBreakdown[] = []
  
  // Expanded Keywords for Extraction
  const keywords = DEFAULT_DICTIONARY

  let currentScene: SceneBreakdown | null = null
  let sceneCount = 0
  let lastLineType: 'HEADING' | 'CHARACTER' | 'DIALOGUE' | 'PARENTHETICAL' | 'ACTION' | 'TRANSITION' | 'UNKNOWN' = 'UNKNOWN'

  lines.forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed) return
    
    // Check for Scene Heading match
    const isSceneHeading = detectSceneHeading(trimmed)
    
    if (isSceneHeading) {
      if (currentScene) {
        scenes.push(currentScene)
      }
      
      sceneCount++
      const fullHeading = trimmed

      // Extract Scene Number if present in heading, else use counter
      // Supports: "SCENE 1", "SCENE-1", "1 EXT.", "1. INT."
      const numberMatch = fullHeading.match(/^(?:SCENE[\s-]*|दृश्य[\s-]*|)(\d+[A-Z\.]*)/i)
      const sceneNumStr = numberMatch ? numberMatch[1] : sceneCount.toString()

      // Remove the scene number part from the heading to parse location
      const headingContent = fullHeading.replace(/^(?:SCENE[\s-]*|दृश्य[\s-]*|)(\d+[A-Z\.]*)[,\.\s-]*/i, '').trim()
      
      // Parse location and time from format: INT. LOCATION - TIME
      // Normalize separators
      const normalizedHeading = headingContent.replace(/[:–—]/g, '-').replace(/\s+/g, ' ').trim()
      const parts = normalizedHeading.split('-')
      
      let time = ''
      let locationRaw = parts[0]

      if (parts.length > 1) {
        // Assume last part is time if it's short, otherwise it might be part of location
        const potentialTime = parts[parts.length - 1].trim()
        // Heuristic: Time is usually short (DAY, NIGHT, CONTINUOUS, बिहान, राती)
        if (potentialTime.length < 25) {
          time = potentialTime.toUpperCase()
          locationRaw = parts.slice(0, parts.length - 1).join('-').trim()
        }
      }
      
      // Extract Location Type (INT/EXT)
      let locationType = 'UNKNOWN'
      if (/INT|भित्र|भित्री/i.test(fullHeading)) locationType = 'INT.'
      else if (/EXT|बाहिर|बाहिरी/i.test(fullHeading)) locationType = 'EXT.'

      // Clean location name (remove type keywords)
      const kwPattern = getSceneKeywordsPattern()
      const locationName = locationRaw.replace(new RegExp(`^(?:${kwPattern}|INT\\.|EXT\\.)[\\.\\s]*`, 'i'), '').trim()

      currentScene = {
        id: `scene-${sceneCount}`,
        sceneNumber: sceneNumStr,
        heading: fullHeading,
        location: {
          type: locationType,
          name: locationName
        },
        time: time,
        summary: '',
        content: line + '\n',
        script: line + '\n',
        
        technical: {
          shots: [],
          camera: [],
          lighting: [],
          equipment: []
        },
        creative: {
          mood: '',
          visuals: [],
          pacing: ''
        },
        logistics: {
          characters: [],
          props: [],
          wardrobe: [],
          makeup: [],
          sfx: [],
          stunts: []
        },
        audio: {
          dialogueLines: 0,
          sound: [],
          music: [],
          ambience: []
        },
        shotList: [],
        metadata: {
          estTime: '0 min',
          pageCount: '0',
          complexity: 1,
          genre: 'Drama' // Default
        }
      }
      lastLineType = 'HEADING'
    } else if (currentScene) {
      currentScene.content += line + '\n'
      currentScene.script += line + '\n'
      
      // Determine line type based on context and content
      let currentLineType: typeof lastLineType = 'ACTION' // Default

      // Check Transition
      if (/^(?:CUT TO:|FADE|DISSOLVE|SMASH CUT|BACK TO:|MATCH CUT|TIME CUT|मध्यान्तर|समाप्त|क्रमशः)(?::)?$/i.test(trimmed)) {
        currentLineType = 'TRANSITION'
      }
      // Check Character
      else if (isCharacter(trimmed)) {
        // If previous was Heading, Action, or Transition, this is likely a character cue
        if (['HEADING', 'ACTION', 'TRANSITION', 'UNKNOWN'].includes(lastLineType)) {
          currentLineType = 'CHARACTER'
          const name = trimmed.replace(/\s*\(.*\)$/, '') // Remove parenthetical from name
          if (!currentScene.logistics.characters.includes(name)) {
            currentScene.logistics.characters.push(name)
          }
        } else if (lastLineType === 'CHARACTER') {
           // Two characters in a row? Rare. Maybe dual dialogue or mistake. Treat as character.
           currentLineType = 'CHARACTER'
           const name = trimmed.replace(/\s*\(.*\)$/, '')
           if (!currentScene.logistics.characters.includes(name)) {
            currentScene.logistics.characters.push(name)
           }
        } else {
           // Character name appearing after dialogue? Could be action starting with name.
           // "JOHN walks away." -> isCharacter might be false due to punctuation.
           // If it passed isCharacter (no punctuation), it might be a character cue.
           currentLineType = 'CHARACTER'
           const name = trimmed.replace(/\s*\(.*\)$/, '')
           if (!currentScene.logistics.characters.includes(name)) {
            currentScene.logistics.characters.push(name)
           }
        }
      }
      // Check Parenthetical
      else if (/^\(.*\)$/.test(trimmed) && ['CHARACTER', 'DIALOGUE', 'PARENTHETICAL'].includes(lastLineType)) {
        currentLineType = 'PARENTHETICAL'
      }
      // Check Dialogue
      else if (['CHARACTER', 'PARENTHETICAL'].includes(lastLineType)) {
        currentLineType = 'DIALOGUE'
        currentScene.audio.dialogueLines++
      }
      else if (lastLineType === 'DIALOGUE') {
        // Continuation of dialogue
        currentLineType = 'DIALOGUE'
        currentScene.audio.dialogueLines++
      }
      // Otherwise Action
      else {
        currentLineType = 'ACTION'
      }

      lastLineType = currentLineType
      
      // Extract metadata only from Action lines
      if (currentLineType === 'ACTION') {
        if (!currentScene.summary && trimmed.length > 10) {
          currentScene.summary = trimmed
        }
        
        const upperLine = trimmed.toUpperCase()
        
        keywords.shots.forEach(kw => { if (upperLine.includes(kw)) currentScene!.technical.shots.push(kw) })
        keywords.camera.forEach(kw => { if (upperLine.includes(kw)) currentScene!.technical.camera.push(kw) })
        keywords.lighting.forEach(kw => { if (upperLine.includes(kw)) currentScene!.technical.lighting.push(kw) })
        keywords.equipment.forEach(kw => { if (upperLine.includes(kw)) currentScene!.technical.equipment.push(kw) })
        
        keywords.mood.forEach(kw => { if (upperLine.includes(kw)) currentScene!.creative.mood = kw })
        keywords.visuals.forEach(kw => { if (upperLine.includes(kw)) currentScene!.creative.visuals.push(kw) })
        
        keywords.props.forEach(kw => { if (upperLine.includes(kw)) currentScene!.logistics.props.push(kw) })
        keywords.wardrobe.forEach(kw => { if (upperLine.includes(kw)) currentScene!.logistics.wardrobe.push(kw) })
        keywords.makeup.forEach(kw => { if (upperLine.includes(kw)) currentScene!.logistics.makeup.push(kw) })
        keywords.sfx.forEach(kw => { if (upperLine.includes(kw)) currentScene!.logistics.sfx.push(kw) })
        keywords.stunts.forEach(kw => { if (upperLine.includes(kw)) currentScene!.logistics.stunts.push(kw) })
        
        keywords.sound.forEach(kw => { if (upperLine.includes(kw)) currentScene!.audio.sound.push(kw) })
        keywords.music.forEach(kw => { if (upperLine.includes(kw)) currentScene!.audio.music.push(kw) })
        keywords.ambience.forEach(kw => { if (upperLine.includes(kw)) currentScene!.audio.ambience.push(kw) })
      }
    }
  })

  if (currentScene) {
    scenes.push(currentScene)
  }

  // Post-processing for estimates
  scenes.forEach(scene => {
    // Deduplicate lists
    scene.technical.shots = [...new Set(scene.technical.shots)]
    scene.technical.camera = [...new Set(scene.technical.camera)]
    scene.technical.lighting = [...new Set(scene.technical.lighting)]
    scene.logistics.props = [...new Set(scene.logistics.props)]
    scene.logistics.wardrobe = [...new Set(scene.logistics.wardrobe)]
    scene.logistics.sfx = [...new Set(scene.logistics.sfx)]
    scene.logistics.stunts = [...new Set(scene.logistics.stunts)]
    scene.audio.sound = [...new Set(scene.audio.sound)]

    // Estimate time: Standard rule is ~1 minute per page (approx 200 words)
    // Nepali script might be denser, but we'll use a rough word count
    const wordCount = scene.content.split(/\s+/).length
    const minutes = (wordCount / 200).toFixed(1)
    scene.metadata.estTime = `${minutes} min`
    scene.metadata.pageCount = (wordCount / 250).toFixed(2) // Approx page count
    
    // Complexity: Based on elements
    let complexityScore = 1
    if (scene.logistics.characters.length > 3) complexityScore += 1
    if (scene.logistics.stunts.length > 0 || scene.logistics.sfx.length > 0) complexityScore += 1
    if (scene.technical.camera.length > 2) complexityScore += 1
    if (scene.location.type === 'EXT.') complexityScore += 1
    scene.metadata.complexity = Math.min(5, complexityScore)

    // Determine Genre based on keywords
    const contentUpper = scene.content.toUpperCase();
    let scores = { myth: 0, village: 0, modern: 0, action: 0 };
    
    DEFAULT_DICTIONARY.mythological.forEach(k => { if (contentUpper.includes(k)) scores.myth++; });
    DEFAULT_DICTIONARY.village.forEach(k => { if (contentUpper.includes(k)) scores.village++; });
    DEFAULT_DICTIONARY.modern.forEach(k => { if (contentUpper.includes(k)) scores.modern++; });
    DEFAULT_DICTIONARY.action.forEach(k => { if (contentUpper.includes(k)) scores.action++; });

    const maxScore = Math.max(scores.myth, scores.village, scores.modern, scores.action);
    if (maxScore > 0) {
      if (scores.myth === maxScore) scene.metadata.genre = 'Mythological/Historical';
      else if (scores.action === maxScore) scene.metadata.genre = 'Action/Thriller';
      else if (scores.village === maxScore) scene.metadata.genre = 'Rural/Village Drama';
      else if (scores.modern === maxScore) scene.metadata.genre = 'Modern/Urban';
    }
  })

  console.log(`Total scenes parsed: ${scenes.length}`)
  saveScenes(scenes)
  return scenes
}

function detectSceneHeading(line: string): boolean {
  const trimmed = line.trim().toUpperCase()
  const kwPattern = getSceneKeywordsPattern()
  return (
    new RegExp(`^(?:${kwPattern})(?:[\\.\\s]|$)`, 'i').test(trimmed) ||
    /^(?:SCENE|दृश्य)[\s-]*\d+/.test(trimmed) ||
    new RegExp(`^\\d+[A-Z\\.]*[\\,\\.\\s-]+(?:${kwPattern})`, 'i').test(trimmed)
  )
}

function isCharacter(line: string): boolean {
  const trimmed = line.trim()
  if (trimmed.length === 0 || trimmed.length > 40) return false
  
  // Check against trained characters first
  const knownChars = getKnownCharacters();
  if (knownChars.some(name => trimmed === name || trimmed.startsWith(name + ' ('))) {
    return true;
  }

  const hasLower = /[a-z]/.test(trimmed)
  const hasNepali = /[\u0900-\u097F]/.test(trimmed)
  
  // Heuristics
  return (!hasLower && /[A-Z]/.test(trimmed)) || (hasNepali && trimmed.length < 20)
}

// ==========================================
// Storage & State Management Utilities
// ==========================================

const STORAGE_KEY = 'nepali_script_breakdown_data'

/**
 * Saves the current list of scenes to LocalStorage.
 * Call this whenever the scenes array changes.
 */
export const saveScenes = (scenes: SceneBreakdown[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes))
    } catch (e) {
      console.error('Failed to save scenes to storage:', e)
    }
  }
}

/**
 * Loads scenes from LocalStorage on component mount.
 */
export const loadScenes = (): SceneBreakdown[] | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : null
    } catch (e) {
      console.error('Failed to load scenes from storage:', e)
      return null
    }
  }
  return null
}

/**
 * Clears all saved data (Reset feature).
 */
export const resetScenes = (): SceneBreakdown[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(STORAGE_KEY)
  }
  return []
}

/**
 * Deletes a specific scene by ID and updates storage.
 */
export const deleteScene = (scenes: SceneBreakdown[], sceneId: string): SceneBreakdown[] => {
  const updatedScenes = scenes.filter(s => s.id !== sceneId)
  saveScenes(updatedScenes)
  return updatedScenes
}

/**
 * Updates a specific scene in the list and persists to storage.
 */
export const updateScene = (scenes: SceneBreakdown[], updatedScene: SceneBreakdown): SceneBreakdown[] => {
  const newScenes = scenes.map(s => s.id === updatedScene.id ? updatedScene : s)
  saveScenes(newScenes)
  return newScenes
}
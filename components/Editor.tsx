'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useLanguage } from './LanguageContext'
import { detectAndConvert } from '../lib/legacyFontConverter'
import { cleanScriptText } from './scriptParser'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { useScriptStore } from '../lib/stores/scriptStore'
import { supabase } from '../lib/supabase'

const Editor = () => {
  const { t } = useLanguage()
  const [text, setText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredText, setFilteredText] = useState<string | null>(null)  
  const [processingStatus, setProcessingStatus] = useState<string | false>(false)
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const wordInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const [showNotesSidebar, setShowNotesSidebar] = useState(false)
  const [savedShots, setSavedShots] = useState<{id: string, mood: string, characters: string, content: string, timestamp: number}[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const { currentScript } = useScriptStore()
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')

  // Load script from Supabase when currentScript changes
  useEffect(() => {
    if (currentScript?.content) {
      setText(currentScript.content)
    }
    setIsLoaded(true)
  }, [currentScript])

  // Auto-save to Supabase (Debounced)
  useEffect(() => {
    if (isLoaded && currentScript?.id) {
      setSaveStatus('unsaved')
      const saveToDb = async () => {
        setSaveStatus('saving')
        await supabase
          .from('scripts')
          .update({ content: text, updated_at: new Date().toISOString() })
          .eq('id', currentScript.id)
        setSaveStatus('saved')
      }
      const timeoutId = setTimeout(saveToDb, 2000) // Save after 2 seconds of inactivity
      return () => clearTimeout(timeoutId)
    }
  }, [text, isLoaded, currentScript]);

  useEffect(() => {
    const savedNotes = localStorage.getItem('script-editor-notes')
    if (savedNotes) {
      try {
        setSavedShots(JSON.parse(savedNotes))
      } catch (e) {
        console.error('Failed to parse notes', e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('script-editor-notes', JSON.stringify(savedShots))
  }, [savedShots])

  const handleImportPDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setProcessingStatus('Starting import...')
    try {
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

        if (!context) {
            console.error(`Could not get 2D context for canvas on page ${i}`);
            continue;
        }

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };

        try {
            await page.render(renderContext).promise;
        } catch (renderError) {
            console.error(`Error rendering page ${i}:`, renderError);
            alert(`Failed to render page ${i}. The PDF might be corrupted.`);
            continue; // Skip to the next page
        }
        
        const imageData = canvas.toDataURL('image/png');

        const ocrPromise = Tesseract.recognize(
            imageData,
            'nep+eng', // Nepali and English language packs
            { logger: (m: any) => {
                if (m.status === 'recognizing text') {
                    const progress = (m.progress * 100).toFixed(0);
                    setProcessingStatus(`Processing Page ${i}/${pdf.numPages} (${progress}%)...`);
                }
            } }
        );

        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`OCR timed out for page ${i}`)), 90000) // 90-second timeout
        );

        try {
          // @ts-ignore
          const { data: { text: pageText } } = await Promise.race([ocrPromise, timeoutPromise]);
          fullText += pageText;
        } catch (ocrError) {
            console.error(`OCR failed on page ${i}:`, ocrError);
            alert(`OCR process failed on page ${i}. It might be blank, contain complex graphics, or timed out.`);
            continue; // Skip to the next page
        }
      }

      if (fullText.trim()) {
        // OCR provides plain text. We convert it to simple HTML to preserve line breaks.
        const cleanedText = cleanScriptText(fullText);
        const finalText = cleanedText.split('\n').map(line => `<div>${line || '&nbsp;'}</div>`).join('');
        setText(finalText);
        alert(t('Import Successful'))
      } else {
        alert(t('Invalid File') + ': No text found.')
      }
    } catch (error) {
      console.error(error)
      alert('Error during OCR import. Check console for details.')
    } finally {
      setProcessingStatus(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleImportWord = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setProcessingStatus('Processing Word file...')
    try {
      // Load mammoth.js from CDN
      if (!(window as any).mammoth) {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js'
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

      const mammoth = (window as any).mammoth

      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
      const theText = result.value // This is now an HTML string

      if (theText.trim()) {
        setText(theText)
        alert(t('Import Successful'))
      } else {
        alert(t('Invalid File') + ': No text found.')
      }
    } catch (error) {
      console.error(error)
      alert('Error importing Word file.')
    } finally {
      setProcessingStatus(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleManualConvert = () => {
    setText(detectAndConvert(text));
  };

  const handleExportPDF = async () => {
    const isFiltered = filteredText !== null
    const contentToExport = filteredText || text
    const rawTitle = isFiltered ? `Search Report: ${searchQuery}` : 'Script Export'
    // Sanitize title to prevent invalid filenames during save
    const title = rawTitle.replace(/[^a-zA-Z0-9\s\-_]/g, '_')

    try {
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      // Set font to support Unicode characters better
      pdf.setFont('helvetica', 'normal')

      // Add header if filtered
      if (isFiltered) {
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        const headerLines = pdf.splitTextToSize(rawTitle, pdfWidth - 20)
        pdf.text(headerLines, 10, 15)
        pdf.setFontSize(12)
        pdf.setFont('courier', 'normal')
      }

      // Convert HTML to plain text while preserving line breaks
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = contentToExport

      // More robust text extraction that handles various HTML structures
      const extractTextLines = (element: Element): string[] => {
        const lines: string[] = []

        // Handle text nodes directly
        if (element.nodeType === Node.TEXT_NODE) {
          const text = element.textContent?.trim()
          if (text) {
            lines.push(text)
          }
          return lines
        }

        // Handle element nodes
        const childNodes = Array.from(element.childNodes)
        let currentLine = ''

        for (const node of childNodes) {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim()
            if (text) {
              currentLine += text + ' '
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element

            // If it's a block element or br, start new line
            if (el.tagName === 'BR' || getComputedStyle(el).display === 'block' ||
                ['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(el.tagName)) {
              if (currentLine.trim()) {
                lines.push(currentLine.trim())
                currentLine = ''
              }
              // Recursively extract from child elements
              lines.push(...extractTextLines(el))
            } else {
              // Inline elements - extract text and continue current line
              const childLines = extractTextLines(el)
              if (childLines.length > 0) {
                currentLine += childLines.join(' ') + ' '
              }
            }
          }
        }

        // Add remaining line if any
        if (currentLine.trim()) {
          lines.push(currentLine.trim())
        }

        return lines
      }

      const lines = extractTextLines(tempDiv).filter(line => line.trim())

      // Debug: Log the extracted lines to console
      console.log('Extracted lines for PDF:', lines.slice(0, 10))
      console.log('First 10 lines content:', lines.slice(0, 10).join('\n'))
      console.log('HTML content being processed:', contentToExport.substring(0, 500))

      // Split lines into pages
      const maxLinesPerPage = 45 // Approximate lines per page for better fit
      const pages: string[] = []

      for (let i = 0; i < lines.length; i += maxLinesPerPage) {
        pages.push(lines.slice(i, i + maxLinesPerPage).join('\n'))
      }

      // Add each page to PDF
      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage()

        const yPosition = isFiltered && i === 0 ? 25 : 10
        const textLines = pdf.splitTextToSize(pages[i], pdfWidth - 20)
        pdf.text(textLines, 10, yPosition)
      }

      // Download the PDF
      pdf.save(`${title}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  const handleReplaceAll = () => {
    if (!findText) return;
    
    // Create a temporary DOM element to handle text node replacement safely without breaking HTML tags
    const div = document.createElement('div');
    div.innerHTML = text;
    
    const walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT, null);
    let node;
    let count = 0;
    
    // Escape regex special characters for the find term
    const escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedFind, 'g');

    while (node = walker.nextNode()) {
      if (node.nodeValue && regex.test(node.nodeValue)) {
        const matches = node.nodeValue.match(regex);
        if (matches) count += matches.length;
        node.nodeValue = node.nodeValue.replace(regex, replaceText);
      }
    }
    
    setText(div.innerHTML);
    alert(t(`Replaced ${count} occurrences.`));
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredText(null);
      return;
    }

    // Parse HTML content to process lines
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    const nodes = Array.from(tempDiv.childNodes);
    
    const scenes: { id: number, html: string, textContent: string, sceneNumber: string }[] = [];
    let currentSceneHtml = '';
    let currentSceneText = '';
    let sceneCount = 0;
    let currentSceneNumber = '0'; // For preamble

    // Load custom keywords from training center if available, else default
    const savedKeywords = localStorage.getItem('app-training-keywords')
    const keywords = savedKeywords ? JSON.parse(savedKeywords) : [
      'INT', 'EXT', 'I/E', 'INT/EXT', 'आ', 'बा', 'आ/बा', 'आन्तरिक', 'बाहिर'
    ]
    // Create dynamic regex from keywords
    const keywordPattern = keywords.map((k: string) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const sceneStartRegex = new RegExp(`^(?:\\d+[A-Z]?[\\.\\)]?\\s*)?(?:${keywordPattern})(?:[\\.\\-\\s]+)`, 'i');

    const extractSceneNumber = (textLine: string): string => {
      const match = textLine.trim().match(/^(?:SCENE[\s-]*|दृश्य[\s-]*|)?\s*(\d+[A-Z]*)/i);
      return match ? match[1] : '';
    };

    nodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        const textContent = node.textContent || '';
        if (textContent.trim()) {
          if (sceneStartRegex.test(textContent.trim())) {
            if (currentSceneHtml) {
              scenes.push({ id: sceneCount, html: currentSceneHtml, textContent: currentSceneText, sceneNumber: currentSceneNumber });
            }
            sceneCount++;
            currentSceneHtml = `<div>${textContent}</div>`;
            currentSceneText = textContent + '\n';
            currentSceneNumber = extractSceneNumber(textContent) || `${sceneCount}`;
          } else {
            currentSceneHtml += `<div>${textContent}</div>`;
            currentSceneText += textContent + '\n';
          }
        }
        return;
      }

      const element = node as HTMLElement;
      const elementText = element.innerText; // innerText correctly interprets <br> as \n
      const elementHtml = element.outerHTML;

      const textLines = elementText.split('\n');
      let sceneHeadingFoundAtIndex = -1;

      for (let i = 0; i < textLines.length; i++) {
        if (sceneStartRegex.test(textLines[i].trim())) {
          sceneHeadingFoundAtIndex = i;
          break;
        }
      }

      if (sceneHeadingFoundAtIndex > 0) {
        // Scene heading is inside this element, but not on the first line. We must split it.
        // Split by <br> or newline to align with innerText lines
        const htmlLines = element.innerHTML.split(/(?:<br\s*\/?>|\n)/gi);

        // Check if we can cleanly split based on the index found in textLines
        if (sceneHeadingFoundAtIndex < htmlLines.length) {
          const beforeHtml = htmlLines.slice(0, sceneHeadingFoundAtIndex).join('<br>');
          const afterHtml = htmlLines.slice(sceneHeadingFoundAtIndex).join('<br>');

          const beforeText = textLines.slice(0, sceneHeadingFoundAtIndex).join('\n');
          const afterText = textLines.slice(sceneHeadingFoundAtIndex).join('\n');

          // 1. Append the "before" part to the current scene
          if (beforeHtml.trim()) {
            const wrapper = document.createElement(element.tagName);
            Array.from(element.attributes).forEach(attr => wrapper.setAttribute(attr.name, attr.value));
            wrapper.innerHTML = beforeHtml;
            currentSceneHtml += wrapper.outerHTML;
            currentSceneText += beforeText + '\n';
          }

          // 2. Finalize the previous scene
          if (currentSceneHtml) {
            scenes.push({ id: sceneCount, html: currentSceneHtml, textContent: currentSceneText, sceneNumber: currentSceneNumber });
          }

          // 3. Start a new scene with the "after" part
          sceneCount++;
          const wrapperAfter = document.createElement(element.tagName);
          Array.from(element.attributes).forEach(attr => wrapperAfter.setAttribute(attr.name, attr.value));
          wrapperAfter.innerHTML = afterHtml;
          currentSceneHtml = wrapperAfter.outerHTML;
          currentSceneText = afterText + '\n';
          currentSceneNumber = extractSceneNumber(textLines[sceneHeadingFoundAtIndex]) || `${sceneCount}`;
        } else {
          // Fallback: HTML structure doesn't match text lines. Treat whole element as new scene start.
          if (currentSceneHtml) {
            scenes.push({ id: sceneCount, html: currentSceneHtml, textContent: currentSceneText, sceneNumber: currentSceneNumber });
          }
          sceneCount++;
          currentSceneHtml = elementHtml;
          currentSceneText = elementText + '\n';
          currentSceneNumber = extractSceneNumber(textLines[0]) || `${sceneCount}`;
        }
      } else if (sceneHeadingFoundAtIndex === 0) {
        // The element itself is the start of a new scene
        if (currentSceneHtml) {
          scenes.push({ id: sceneCount, html: currentSceneHtml, textContent: currentSceneText, sceneNumber: currentSceneNumber });
        }
        sceneCount++;
        currentSceneHtml = elementHtml;
        currentSceneText = elementText + '\n';
        currentSceneNumber = extractSceneNumber(textLines[0]) || `${sceneCount}`;
      } else {
        // No scene heading found, just append the whole element
        currentSceneHtml += elementHtml;
        currentSceneText += elementText + '\n';
      }
    });
    
    if (currentSceneHtml) {
      scenes.push({ id: sceneCount, html: currentSceneHtml, textContent: currentSceneText, sceneNumber: currentSceneNumber });
    }

    const query = searchQuery.toLowerCase().trim();
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Use word boundary if query is alphanumeric to avoid partial matches (e.g. "he" in "the")
    const isWholeWord = /^[a-z0-9_]+$/i.test(query);
    const searchRegex = new RegExp(isWholeWord ? `\\b${escapedQuery}\\b` : escapedQuery, 'i');
    
    const filteredScenes = scenes.filter(scene => searchRegex.test(scene.textContent));

    if (filteredScenes.length > 0) {
      const resultHtml = filteredScenes.map(s => {
        const highlightRegex = new RegExp(`(${isWholeWord ? `\\b${escapedQuery}\\b` : escapedQuery})(?![^<]*>)`, 'gi');

        // Highlight the search term in the entire scene HTML
        const contentHtml = s.html.replace(highlightRegex, '<span class="bg-yellow-200 text-black">$1</span>');

        return `
        <div class="scene-result pb-4">
          <div style="font-size: 0.75rem; font-weight: bold; color: #6b7280; margin-bottom: 0.25rem;">
            ${s.id > 0 ? `Scene #${s.sceneNumber}` : 'Preamble'}
          </div>
          ${contentHtml}
        </div>
        <hr class="my-16 border-t-4 border-gray-300" />
      `}).join('');
      setFilteredText(resultHtml);
    } else {
      setFilteredText(`<div style="text-align: center; color: #6b7280; padding: 2rem;">${t('No results found.')}</div>`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredText(null);
  };

  const handleFormat = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
  };

  const onContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newHTML = e.currentTarget.innerHTML;
    if (newHTML !== text && filteredText === null) {
      setText(newHTML);
    }
  };

  // Sync state to the DOM for imports and initial load.
  useEffect(() => {
    // This check prevents the cursor from jumping during user input
    const displayContent = filteredText ?? text;
    if (editorRef.current && displayContent !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = displayContent;
    }
  }, [text, filteredText]);

  return (
    <div className="min-h-[85vh] flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');
        .nepali-font {
          font-family: 'Noto Sans Devanagari', sans-serif;
        }
        .editor-div:empty::before {
          content: attr(data-placeholder);
          color: #9ca3af; /* gray-400 */
          pointer-events: none;
        }
      `}</style>
      <div className="flex justify-between items-center p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-black">{t('Script Editor')}</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${
            saveStatus === 'saved' ? 'bg-green-100 text-green-700 border-green-200' :
            saveStatus === 'saving' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
            'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
            {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowFindReplace(!showFindReplace)
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
          >
            {t('Find & Replace')}
          </button>
          <button
            onClick={() => setShowNotesSidebar(!showNotesSidebar)}
            className={`px-4 py-2 rounded-md transition-colors text-sm ${showNotesSidebar ? 'bg-yellow-600 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
          >
            {t('Notes')}
          </button>
          <button
            onClick={handleManualConvert}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
          >
            {t('Convert Legacy Font')}
          </button>
          <input
            type="file"
            ref={wordInputRef}
            onChange={handleImportWord}
            className="hidden"
            accept=".docx"
          />
          <button
            onClick={() => wordInputRef.current?.click()}
            disabled={!!processingStatus}
            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md transition-colors text-sm"
          >
            {processingStatus ? processingStatus : t('Import Word')}
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
          >
            {filteredText ? t('Export Search PDF') : t('Export PDF')}
          </button>
          <input
            type="file"
            ref={pdfInputRef}
            onChange={handleImportPDF}
            className="hidden"
            accept=".pdf"
          />
          <button
            onClick={() => pdfInputRef.current?.click()}
            disabled={!!processingStatus}
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
          >
            {processingStatus ? processingStatus : t('Import PDF')}
          </button>
        </div>
      </div>

      {/* Find and Replace Panel */}
      {showFindReplace && (
        <div className="p-3 bg-yellow-50 border-b border-yellow-200 flex flex-wrap gap-4 items-center animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{t('Find')}:</span>
            <input
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm w-40 focus:outline-none focus:border-blue-500 text-gray-900"
              placeholder={t('Text to find...')}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{t('Replace')}:</span>
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm w-40 focus:outline-none focus:border-blue-500 text-gray-900"
              placeholder={t('Replacement...')}
            />
          </div>
          <button
            onClick={handleReplaceAll}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            {t('Replace All')}
          </button>
        </div>
      )}

      <div className="flex items-center gap-1 border-b border-gray-200 bg-white p-2 text-gray-700">
        <button title={t('Bold')} onClick={() => handleFormat('bold')} className="p-2 rounded hover:bg-gray-200 w-9 h-9 flex items-center justify-center">
          <b>B</b>
        </button>
        <button title={t('Italic')} onClick={() => handleFormat('italic')} className="p-2 rounded hover:bg-gray-200 w-9 h-9 flex items-center justify-center">
          <i>I</i>
        </button>
        <button title={t('Underline')} onClick={() => handleFormat('underline')} className="p-2 rounded hover:bg-gray-200 w-9 h-9 flex items-center justify-center">
          <u>U</u>
        </button>
        <div className="h-6 w-px bg-gray-300 mx-2"></div>
        <button title={t('Align Left')} onClick={() => handleFormat('justifyLeft')} className="p-2 rounded hover:bg-gray-200 w-9 h-9 flex items-center justify-center text-xs">
          L
        </button>
        <button title={t('Align Center')} onClick={() => handleFormat('justifyCenter')} className="p-2 rounded hover:bg-gray-200 w-9 h-9 flex items-center justify-center text-xs">
          C
        </button>
        <button title={t('Align Right')} onClick={() => handleFormat('justifyRight')} className="p-2 rounded hover:bg-gray-200 w-9 h-9 flex items-center justify-center text-xs">
          R
        </button>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 bg-gray-100 border-b border-gray-200">
          <div className="flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('Search Script')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              {searchQuery && (
                <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800">✕</button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
            >
              {t('Search')}
            </button>
          </div>
        </div>
        <div
          ref={editorRef}
          contentEditable={filteredText === null}
          onInput={onContentChange}
          className={`editor-div flex-1 w-full p-8 text-lg font-mono text-gray-900 outline-none overflow-y-auto nepali-font ${filteredText !== null ? 'bg-gray-50' : ''}`}
          data-placeholder="Start typing your script here..."
          spellCheck={false}
        />
        </div>
        {showNotesSidebar && (
          <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto p-4 flex flex-col gap-4 animate-in slide-in-from-right-2">
            <h3 className="font-bold text-gray-700">{t('Saved Shot Lists')}</h3>
            {savedShots.length === 0 && <p className="text-sm text-gray-500 italic">{t('No saved notes yet.')}</p>}
            {savedShots.map(note => (
              <div key={note.id} className="bg-white p-3 rounded shadow-sm border border-gray-200 text-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-gray-800">{note.characters}</div>
                    <div className="text-xs text-gray-500">{note.mood} • {new Date(note.timestamp).toLocaleDateString()}</div>
                  </div>
                  <button onClick={() => setSavedShots(prev => prev.filter(n => n.id !== note.id))} className="text-red-400 hover:text-red-600">×</button>
                </div>
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: note.content }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Editor
// Helper to load external scripts dynamically from CDN
const loadScript = (src: string, globalName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve()
    
    // Check if global is already available
    if ((window as any)[globalName]) {
      resolve()
      return
    }

    // If script is loading/loaded but global not ready, poll for it
    if (document.querySelector(`script[src="${src}"]`)) {
      const interval = setInterval(() => {
        if ((window as any)[globalName]) {
          clearInterval(interval)
          resolve()
        }
      }, 100)
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.onload = () => {
      // Wait for global to be available after load
      const interval = setInterval(() => {
        if ((window as any)[globalName]) {
          clearInterval(interval)
          resolve()
        }
      }, 50)
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export const extractPdfText = async (file: File): Promise<string> => {
  try {
    // Load PDF.js from CDN
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', 'pdfjsLib')
    const pdfjsLib = (window as any).pdfjsLib

    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
    }

    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    
    let fullText = ''
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const items = textContent.items as any[]
      
      console.log(`PDF: Page ${i}, ${items.length} text items`)
      if (items.length > 0) {
        console.log(`Sample text item:`, items[0]?.str, items[0]?.transform)
      }
      
      let lastY = -1
      let pageText = ''

      for (const item of items) {
        const y = item.transform ? item.transform[5] : 0
        // If Y difference is significant (> 3 units), assume new line. 
        // Reduced to 3 to catch tighter line spacing often found in dense scripts
        if (lastY !== -1 && Math.abs(y - lastY) > 3) {
          pageText += '\n' + item.str
        } else {
          // Add space if previous char wasn't space and current isn't space
          pageText += (pageText.endsWith(' ') || item.str.startsWith(' ') ? '' : ' ') + item.str
        }
        lastY = y
      }
      
      fullText += pageText + '\n\n'
    }
    
    return fullText
  } catch (error) {
    console.error('PDF Extraction Error:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

export const extractDocxText = async (file: File): Promise<string> => {
  try {
    // Load Mammoth from CDN
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js', 'mammoth')
    const mammoth = (window as any).mammoth

    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  } catch (error) {
    console.error('Word Extraction Error:', error)
    throw new Error('Failed to extract text from Word document')
  }
}
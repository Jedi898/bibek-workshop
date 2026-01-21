'use client';

import { useState, useRef } from 'react';
import { Loader2, Clapperboard, FileText, AlertCircle, Download, Save, FolderOpen, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function SceneBreakdown() {
  const [sceneText, setSceneText] = useState('');
  const [projectName, setProjectName] = useState('Nepali Film Script');
  const [breakdown, setBreakdown] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedFiles, setSavedFiles] = useState([]);
  const resultsRef = useRef(null);

  const handleAnalyze = async () => {
    if (!sceneText.trim()) return;

    setIsLoading(true);
    setError('');
    setBreakdown('');

    try {
      const response = await fetch('/api/scene-breakdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sceneText,
          model: 'microsoft/Phi-3-mini-4k-instruct',
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error(`Server error (${response.status}). The request may have timed out.`);
      }

      if (!response.ok) {
        if (data.error && typeof data.error === 'string' && data.error.includes('loading')) {
          throw new Error('AI Model is warming up. Please try again in 30 seconds.');
        }
        throw new Error(data.error || 'Failed to analyze scene');
      }

      setBreakdown(data.breakdown);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const filename = window.prompt('Save as (filename):', 'sceneBreakdownDraft');
    if (!filename) return;

    const data = {
      projectName,
      sceneText,
      breakdown
    };
    
    try {
      const response = await fetch('/api/local-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: filename, data })
      });

      if (response.ok) {
        alert(`Draft saved to public/${filename}.json`);
      } else {
        alert('Failed to save draft.');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving draft.');
    }
  };

  const handleLoad = async () => {
    try {
      const response = await fetch('/api/local-storage?list=true');
      const files = await response.json();

      if (files && files.length > 0) {
        setSavedFiles(files);
        setShowLoadModal(true);
      } else {
        alert('No saved drafts found in public folder.');
      }
    } catch (e) {
      console.error(e);
      alert('Error loading draft list.');
    }
  };

  const loadFile = async (filename) => {
    try {
      const response = await fetch(`/api/local-storage?key=${filename}`);
      const data = await response.json();

      if (data) {
        setProjectName(data.projectName || '');
        setSceneText(data.sceneText || '');
        setBreakdown(data.breakdown || '');
        setShowLoadModal(false);
      }
    } catch (e) {
      console.error(e);
      alert('Error loading file.');
    }
  };

  const handleDownloadPDF = async () => {
    if (!resultsRef.current) return;

    try {
      const canvas = await html2canvas(resultsRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions to fit A4 width
      const imgProps = { width: canvas.width, height: canvas.height };
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const headerHeight = 30;
      
      // Create PDF with dynamic height if content is long
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [pdfWidth, Math.max(pdfHeight + headerHeight, 297)] // Ensure at least A4 height
      });

      // Add Header
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text(`Project: ${projectName}`, 10, 15);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 10, 22);
      
      pdf.setLineWidth(0.5);
      pdf.line(10, 25, 200, 25);

      pdf.addImage(imgData, 'PNG', 0, headerHeight, pdfWidth, pdfHeight);
      pdf.save('scene-breakdown.pdf');
    } catch (err) {
      console.error('PDF generation failed:', err);
      setError('PDF डाउनलोड गर्न असफल भयो (Failed to download PDF)');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Clapperboard className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">दृश्य विश्लेषण (Scene Breakdown)</h2>
          <p className="text-sm text-gray-500">तपाईंको दृश्यको विस्तृत विश्लेषण गर्नुहोस्</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            प्रोजेक्टको नाम (Project Name)
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="प्रोजेक्टको नाम लेख्नुहोस्..."
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            दृश्य विवरण (Scene Script)
          </label>
          <textarea
            className="w-full h-48 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
            placeholder="यहाँ दृश्यको विवरण नेपालीमा लेख्नुहोस्..."
            value={sceneText}
            onChange={(e) => setSceneText(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-2 text-right">
            {sceneText.length} क्यारेक्टरहरू
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !sceneText.trim()}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                विश्लेषण गर्दै...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                विश्लेषण गर्नुहोस्
              </>
            )}
          </button>

          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
          >
            <Save className="w-5 h-5" />
            Save
          </button>

          <button
            onClick={handleLoad}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
          >
            <FolderOpen className="w-5 h-5" />
            Load
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {breakdown && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">विश्लेषण नतिजा</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">सम्पन्न</span>
            </div>
          </div>
          <div ref={resultsRef} className="bg-gray-50 p-6 rounded-xl border border-gray-200 prose prose-indigo max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed shadow-inner">
            {breakdown}
          </div>
        </div>
      )}

      {showLoadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Load Saved Draft</h3>
              <button onClick={() => setShowLoadModal(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {savedFiles.map((file) => (
                <button
                  key={file}
                  onClick={() => loadFile(file)}
                  className="w-full text-left p-3 hover:bg-indigo-50 rounded-lg border border-gray-200 transition-colors flex items-center gap-3 group"
                >
                  <FileText className="w-5 h-5 text-indigo-500 group-hover:text-indigo-600" />
                  <span className="text-gray-700 group-hover:text-gray-900 font-medium">{file}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
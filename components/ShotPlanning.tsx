'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Loader, Camera, Film, AlertTriangle, Download, Save, FolderOpen, X, FileText, Check, ArrowLeft, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '../lib/supabase';

// Define the Nepali LLM model to use
const NEPALI_MODEL = 'thenaijapromptengineer/matsya-7b';

interface ShotPlanningProps {
  projectId?: string;
}

export default function ShotPlanning({ projectId }: ShotPlanningProps) {
  const [sceneText, setSceneText] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('Nepali Film Script');
  const [directorNotes, setDirectorNotes] = useState<string>('');
  const [shotList, setShotList] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showLoadModal, setShowLoadModal] = useState<boolean>(false);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load draft from local storage on mount
  useEffect(() => {
    if (projectId) {
      const savedDraft = localStorage.getItem(`shot-planning-draft-${projectId}`);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.sceneText) setSceneText(draft.sceneText);
        if (draft.projectName) setProjectName(draft.projectName);
        if (draft.directorNotes) setDirectorNotes(draft.directorNotes);
        if (draft.shotList) setShotList(draft.shotList);
      }
    }
  }, [projectId]);

  // Save draft to local storage on change
  useEffect(() => {
    if (projectId) {
      const draft = { sceneText, projectName, directorNotes, shotList };
      localStorage.setItem(`shot-planning-draft-${projectId}`, JSON.stringify(draft));
    }
  }, [sceneText, projectName, directorNotes, shotList, projectId]);

  const handlePlan = async () => {
    if (!sceneText.trim()) return;

    setIsLoading(true);
    setError('');
    setShotList('');

    try {
      const response = await fetch('/api/generate-shots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sceneText,
          directorNotes,
          model: NEPALI_MODEL,
        }),
      });

      let data;
      try {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          // If parsing fails, use the text as error message if possible or fallback
          throw new Error(`Invalid JSON response: ${text.substring(0, 50)}...`);
        }
      } catch (parseError) {
        throw new Error(`Server error (${response.status}): ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }

      if (!response.ok) {
        if (data.error && typeof data.error === 'string' && data.error.includes('loading')) {
          throw new Error('AI Model is warming up. Please try again in 30 seconds.');
        }
        throw new Error(data.error || 'Failed to generate shot plan');
      }

      setShotList(data.shotList);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!projectId) {
      alert('Please select a project first.');
      return;
    }

    const title = window.prompt('Save plan as:', 'Shot Plan 1');
    if (!title) return;

    const planData = {
      project_id: projectId,
      title,
      project_name: projectName,
      scene_text: sceneText,
      director_notes: directorNotes,
      shot_list: shotList
    };
    
    try {
      const { data, error } = await supabase
        .from('shot_plans')
        .insert(planData)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setCurrentPlanId(data.id);
        alert('Plan saved successfully!');
      }
    } catch (e: any) {
      console.error(e);
      alert('Error saving plan: ' + e.message);
    }
  };

  const handleLoad = async () => {
    if (!projectId) {
      alert('Please select a project first.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('shot_plans')
        .select('id, title, created_at')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setSavedPlans(data);
        setShowLoadModal(true);
      } else {
        alert('No saved plans found for this project.');
      }
    } catch (e: any) {
      console.error(e);
      alert('Error loading plans: ' + e.message);
    }
  };

  const loadPlan = async (plan: any) => {
    try {
      const { data, error } = await supabase
        .from('shot_plans')
        .select('*')
        .eq('id', plan.id)
        .single();

      if (error) throw error;

      if (data) {
        setProjectName(data.project_name || '');
        setSceneText(data.scene_text || '');
        setDirectorNotes(data.director_notes || '');
        setShotList(data.shot_list || '');
        setCurrentPlanId(data.id);
        setShowLoadModal(false);
      }
    } catch (e: any) {
      console.error(e);
      alert('Error loading plan: ' + e.message);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the current draft?')) {
      setSceneText('');
      setProjectName('Nepali Film Script');
      setDirectorNotes('');
      setShotList('');
      setError('');
      setCurrentPlanId(null);
      if (projectId) localStorage.removeItem(`shot-planning-draft-${projectId}`);
    }
  };

  const handleEditPlanTitle = async (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.stopPropagation();
    const newTitle = window.prompt('Enter new title:', currentTitle);
    if (!newTitle || newTitle === currentTitle) return;

    try {
      const { error } = await supabase
        .from('shot_plans')
        .update({ title: newTitle })
        .eq('id', id);

      if (error) throw error;

      setSavedPlans(savedPlans.map(p => p.id === id ? { ...p, title: newTitle } : p));
    } catch (e: any) {
      console.error(e);
      alert('Error updating plan title: ' + e.message);
    }
  };

  const handleDeletePlan = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this plan?')) {
      const { error } = await supabase.from('shot_plans').delete().eq('id', id);
      if (error) {
        alert('Failed to delete plan');
      } else {
        setSavedPlans(savedPlans.filter(p => p.id !== id));
      }
    }
  };

  const handleSelectAll = () => {
    if (resultsRef.current) {
      const range = document.createRange();
      range.selectNodeContents(resultsRef.current);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (!resultsRef.current) return;

    setIsPdfGenerating(true);
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
      pdf.save('shot-list.pdf');
    } catch (err) {
      console.error('PDF generation failed:', err);
      setError('PDF डाउनलोड गर्न असफल भयो (Failed to download PDF)');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Camera className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">सट योजना (Shot Planning)</h2>
            <p className="text-sm text-gray-500">तपाईंको दृश्यको लागि क्यामेरा सटहरू योजना गर्नुहोस्</p>
          </div>
        </div>
        <Link 
          href="/" 
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            प्रोजेक्टको नाम (Project Name)
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
            className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
            placeholder="यहाँ दृश्यको विवरण नेपालीमा लेख्नुहोस्..."
            value={sceneText}
            onChange={(e) => setSceneText(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-2 text-right">
            {sceneText.length} characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            निर्देशकको नोट (Director's Notes) - ऐच्छिक
          </label>
          <textarea
            className="w-full h-24 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
            placeholder="कुनै विशेष निर्देशन वा मुड..."
            value={directorNotes}
            onChange={(e) => setDirectorNotes(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handlePlan}
            disabled={isLoading || !sceneText.trim()}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                योजना गर्दै...
              </>
            ) : (
              <>
                <Film className="w-5 h-5" />
                सटहरू तयार गर्नुहोस्
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

            <button
              onClick={handleClear}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
            >
              <X className="w-5 h-5" />
              Clear Draft
            </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {shotList && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">सट सूची (Shot List)</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                title="Select All"
              >
                <Check className="w-4 h-4" />
                Select All
              </button>
              <button
                onClick={handleDownloadPDF}
                  disabled={isPdfGenerating}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download PDF"
              >
                  {isPdfGenerating ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {isPdfGenerating ? 'Generating...' : 'PDF'}
              </button>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">सम्पन्न</span>
            </div>
          </div>
          <div ref={resultsRef} className="bg-gray-50 p-6 rounded-xl border border-gray-200 prose prose-purple max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed shadow-inner">
            {shotList}
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
              {savedPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => loadPlan(plan)}
                  className="w-full text-left p-3 hover:bg-purple-50 rounded-lg border border-gray-200 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-purple-500 group-hover:text-purple-600" />
                    <div>
                      <span className="text-gray-700 group-hover:text-gray-900 font-medium block">{plan.title}</span>
                      <span className="text-xs text-gray-500">{new Date(plan.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => handleEditPlanTitle(e, plan.id, plan.title)}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Edit Title"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDeletePlan(e, plan.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
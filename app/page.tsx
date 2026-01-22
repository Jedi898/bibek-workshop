'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Sidebar from '../components/Sidebar'
import VirtualKeyboard from '../components/VirtualKeyboard'
import { useScriptStore } from '../lib/stores/scriptStore'
import { useSceneStore } from '../lib/stores/sceneStore'
import { useCharacterStore } from '../lib/stores/characterStore'
import { useLocationStore } from '../lib/stores/locationStore'
import { LanguageProvider } from '../components/LanguageContext'
import ErrorBoundary from '../components/ErrorBoundary'
import { supabase } from '../lib/supabase'
import Auth from '../components/Auth'

const ContinuitySheet = dynamic(() => import('../components/ContinuitySheet'))
const Editor = dynamic(() => import('../components/Editor'))
const Characters = dynamic(() => import('../components/Characters'))
const Notes = dynamic(() => import('../components/Notes'))
const Weather = dynamic(() => import('../components/Weather'))
const Schedule = dynamic(() => import('../components/Schedule'))
const Contacts = dynamic(() => import('../components/Contacts'))
const SceneBreakdown = dynamic(() => import('../components/SceneBreakdown'))
const Locations = dynamic(() => import('../components/Locations'))
const ShotPlanning = dynamic(() => import('../components/ShotPlanning'))
const Budget = dynamic(() => import('../components/Budget'))
const Dashboard = dynamic(() => import('../components/Dashboard'))
const ProjectTimeline = dynamic(() => import('../components/ProjectTimeline'))
const Projects = dynamic(() => import('../components/Projects'))

type TabType = 'projects' | 'dashboard' | 'editor' | 'scene-breakdown' | 'characters' | 'locations' | 'contacts' | 'schedule' | 'notes' | 'weather' | 'continuity' | 'shot-planning' | 'budget' | 'timeline'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const { currentScript, setCurrentScript } = useScriptStore()
  const [isScriptLoading, setIsScriptLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [projectToDeleteName, setProjectToDeleteName] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthChecked(true)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setAuthChecked(true)
      if (event === 'PASSWORD_RECOVERY') {
        setShowPasswordReset(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    const loadLastScript = async () => {
      if (!currentScript) {
        setIsScriptLoading(true)
        
        let data = null;
        
        // 1. Try to load the last active project from local storage
        const lastProjectId = localStorage.getItem('lastActiveProjectId');
        if (lastProjectId) {
          const { data: lastProjectData } = await supabase
            .from('scripts')
            .select('*')
            .is('project.deleted_at', null) // Ensure we don't load deleted projects
            .eq('project_id', lastProjectId)
            .maybeSingle();
          if (lastProjectData) data = lastProjectData;
        }

        // 2. If no last project found, fallback to the most recently updated one
        if (!data) {
          const { data: latestData } = await supabase
            .from('scripts')
            .select('*, project:projects!inner(deleted_at)')
            .is('project.deleted_at', null)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          data = latestData;
        }

        if (data && setCurrentScript) {
          setCurrentScript({
            ...data,
            projectId: data.project_id,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          })
        } else if (!data && setCurrentScript) {
          // Auto-create default project and script if none exist
          try {
            const { data: projectData, error: projectError } = await supabase
              .from('projects')
              .insert({ name: 'My First Project', description: 'Auto-generated' })
              .select()
              .single()

            if (projectData && !projectError) {
              const { data: scriptData, error: scriptError } = await supabase
                .from('scripts')
                .insert({ 
                  project_id: projectData.id, 
                  title: 'My First Script', 
                  content: '' 
                })
                .select()
                .single()

              if (scriptData && !scriptError) {
                setCurrentScript({
                  ...scriptData,
                  projectId: scriptData.project_id,
                  createdAt: scriptData.created_at,
                  updatedAt: scriptData.updated_at
                })
              }
            }
          } catch (e) {
            console.error('Error creating default project:', e)
          }
        }
        setIsScriptLoading(false)
      } else {
        setIsScriptLoading(false)
      }
    }
    loadLastScript()
  }, [currentScript, setCurrentScript, session])

  // Save the active project ID to local storage whenever it changes
  useEffect(() => {
    if (currentScript?.project_id) {
      localStorage.setItem('lastActiveProjectId', currentScript.project_id);
    }
  }, [currentScript?.project_id]);

  const { scenes, getScenesByScript, updateScene, addScene } = useSceneStore()
  const { characters, getCharactersByScript } = useCharacterStore()
  const { locations, getLocationsByScript } = useLocationStore()

  const scriptScenes = currentScript ? getScenesByScript(currentScript.id) : []
  const scriptCharacters = currentScript ? getCharactersByScript(currentScript.id) : []
  const scriptLocations = currentScript ? getLocationsByScript(currentScript.id) : []

  const handleUpdateScene = async (sceneId: string, updates: any) => {
    updateScene(sceneId, updates)
  }

  const handleCreateProject = async () => {
    const name = window.prompt("Enter project name:")
    if (!name) return

    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({ name, description: '' })
        .select()
        .single()

      if (projectError) throw projectError

      if (projectData) {
        const { data: scriptData, error: scriptError } = await supabase
          .from('scripts')
          .insert({ 
            project_id: projectData.id, 
            title: name, 
            content: '' 
          })
          .select()
          .single()

        if (scriptError) throw scriptError

        if (scriptData && setCurrentScript) {
          setCurrentScript({
            ...scriptData,
            projectId: scriptData.project_id,
            createdAt: scriptData.created_at,
            updatedAt: scriptData.updated_at
          })
          setActiveTab('dashboard')
        }
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project')
    }
  }

  const handleSelectProject = async (projectId: string) => {
    setIsScriptLoading(true)
    try {
      let { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      // If no script found, try to create one (fixes "same data" issue)
      if (!data && !error) {
        const { data: project } = await supabase.from('projects').select('name').eq('id', projectId).single()
        if (project) {
          const res = await supabase.from('scripts').insert({
            project_id: projectId,
            title: project.name,
            content: ''
          }).select().single()
          data = res.data
          error = res.error
        }
      }

      if (data && setCurrentScript) {
        setCurrentScript({
          ...data,
          projectId: data.project_id,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        })
        setActiveTab('dashboard')
      } else {
        console.error('Error fetching script for project:', error)
        alert('Failed to load project. Please try again.')
      }
    } finally {
      setIsScriptLoading(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!currentScript?.project_id) return

    const { data } = await supabase
      .from('projects')
      .select('name')
      .eq('id', currentScript.project_id)
      .single()
    
    setProjectToDeleteName(data?.name || 'this project')
    setDeleteConfirmation('')
    setShowDeleteModal(true)
  }

  const confirmDeleteProject = async () => {
    if (!currentScript?.project_id) return
    
    const { error } = await supabase
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', currentScript.project_id)

    if (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project')
    } else {
      setCurrentScript(null)
      localStorage.removeItem('lastActiveProjectId')
      setActiveTab('projects')
      setShowDeleteModal(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (!newPassword) return
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      alert('Error updating password: ' + error.message)
    } else {
      alert('Password updated successfully!')
      setShowPasswordReset(false)
      setNewPassword('')
    }
  }

  const renderActiveComponent = () => {
    if (isScriptLoading) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mr-3"></div>
          Loading script...
        </div>
      )
    }
    switch (activeTab) {
      case 'projects':
        return <Projects onSelectProject={handleSelectProject} />
      case 'dashboard':
        return <Dashboard onNavigate={(tab) => setActiveTab(tab as TabType)} />
      case 'editor':
        return <Editor />
      case 'scene-breakdown':
        return <SceneBreakdown projectId={currentScript?.project_id} />
      case 'characters':
        return <Characters projectId={currentScript?.project_id} />
      case 'locations':
        return <Locations projectId={currentScript?.project_id} />
      case 'contacts':
        return <Contacts projectId={currentScript?.project_id} />
      case 'shot-planning':
        return <ShotPlanning projectId={currentScript?.project_id} />
      case 'budget':
        return <Budget projectId={currentScript?.project_id} />
      case 'schedule':
        return <Schedule projectId={currentScript?.project_id} />
      case 'notes':
        return <Notes projectId={currentScript?.project_id} />
      case 'timeline':
        return <ProjectTimeline projectId={currentScript?.project_id} />
      case 'weather':
        return <Weather />
      case 'continuity':
        return <ContinuitySheet projectId={currentScript?.project_id} />
      default:
        return <Dashboard onNavigate={(tab) => setActiveTab(tab as TabType)} />
    }
  }

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-100 flex">
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-gray-800 text-white rounded-md shadow-lg"
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tab: string) => setActiveTab(tab as TabType)} 
          onCreateProject={handleCreateProject}
          onDeleteProject={currentScript ? handleDeleteProject : undefined}
          projectName={currentScript?.title}
          isMobileOpen={isSidebarOpen}
          setIsMobileOpen={setIsSidebarOpen}
        />
        <main className="flex-1 p-4 md:p-8 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary key={activeTab}>
              {renderActiveComponent()}
            </ErrorBoundary>
          </div>
        </main>

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
              <h3 className="text-xl font-bold text-red-600 mb-4">Delete Project?</h3>
              <p className="text-gray-600 mb-4">
                This action cannot be undone. This will permanently delete the project 
                <span className="font-bold text-gray-900"> "{projectToDeleteName}"</span> and all associated scripts, scenes, and characters.
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Please type <span className="font-mono font-bold select-all text-red-600">{projectToDeleteName}</span> to confirm.
              </p>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Type project name"
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProject}
                  disabled={deleteConfirmation !== projectToDeleteName}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                >
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        )}

        {showPasswordReset && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reset Password</h3>
              <p className="text-gray-600 mb-4">
                Please enter your new password below.
              </p>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="New Password"
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={handlePasswordUpdate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}

        <VirtualKeyboard />
      </div>
    </LanguageProvider>
  )
}

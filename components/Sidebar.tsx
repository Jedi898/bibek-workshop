'use client'

import { useLanguage } from './LanguageContext'
import { supabase } from '../lib/supabase'
import { 
  Folder, LayoutDashboard, FileText, Clapperboard, Users, MapPin, 
  Phone, Camera, Calendar, BarChart, DollarSign, Film, ClipboardList, 
  CloudSun, Keyboard, Globe, LogOut, Trash2, Plus, X
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onCreateProject?: () => void
  onDeleteProject?: () => void
  projectName?: string,
  isMobileOpen: boolean,
  setIsMobileOpen: (isOpen: boolean) => void
}

const Sidebar = ({ activeTab, onTabChange, onCreateProject, onDeleteProject, projectName, isMobileOpen, setIsMobileOpen }: SidebarProps) => {
  const { t, language, setLanguage, isNepaliTyping, setIsNepaliTyping, showVirtualKeyboard, setShowVirtualKeyboard } = useLanguage()

  const tabs = [
    { id: 'projects', label: t('My Projects'), icon: Folder },
    { id: 'dashboard', label: t('Dashboard'), icon: LayoutDashboard },
    { id: 'editor', label: t('Script Editor'), icon: FileText },
    { id: 'scene-breakdown', label: t('Scene Breakdown'), icon: Clapperboard },
    { id: 'characters', label: t('Characters'), icon: Users },
    { id: 'locations', label: t('Locations'), icon: MapPin },
    { id: 'contacts', label: t('Contacts'), icon: Phone },
    { id: 'shot-planning', label: t('Shot Planning'), icon: Camera },
    { id: 'schedule', label: t('Schedule'), icon: Calendar },
    { id: 'timeline', label: t('Timeline'), icon: BarChart },
    { id: 'budget', label: t('Budget'), icon: DollarSign },
    { id: 'continuity', label: t('Continuity Sheet'), icon: Film },
    { id: 'notes', label: t('Notes'), icon: ClipboardList },
    { id: 'weather', label: t('Weather'), icon: CloudSun },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileOpen(false)}
      />
      <div className={`w-64 bg-slate-900 text-gray-100 h-screen fixed left-0 top-0 flex flex-col border-r border-gray-800 z-40 transform transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 shadow-2xl`}>
        <button onClick={() => setIsMobileOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white lg:hidden">
          <X className="w-6 h-6" />
        </button>
      <div className="p-4 flex-1 overflow-y-auto">
        <h1 className="text-xl font-bold mb-8 text-amber-400 flex items-center gap-2"><Film className="w-6 h-6" /> {t('Screenwriting App')}</h1>
        {projectName && (
          <div className="mb-6 p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{t('Current Project')}</div>
            <div className="font-medium truncate text-lg text-white" title={projectName}>{projectName}</div>
          </div>
        )}
        {onCreateProject && (
          <button
            onClick={onCreateProject}
            className="w-full mb-6 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium shadow-lg shadow-amber-900/20"
          >
            <Plus className="w-4 h-4" /> {t('Create New Project')}
          </button>
        )}
        <nav>
          <ul className="space-y-2">
            {tabs.map(tab => (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center group ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-slate-900 font-bold shadow-md'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-slate-900' : 'text-gray-400 group-hover:text-white'}`} />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="p-4 border-t border-gray-800 space-y-3 bg-slate-950">
        <button
          onClick={() => setIsNepaliTyping(!isNepaliTyping)}
          className={`w-full py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium ${
            isNepaliTyping ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          {t('Nepali Typing')}: {isNepaliTyping ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
          className={`w-full py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium ${
            showVirtualKeyboard ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          {t('Virtual Keyboard')}
        </button>
        <button
          onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
          className="w-full bg-slate-800 hover:bg-slate-700 text-gray-300 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Globe className="w-4 h-4" />
          {language === 'en' ? 'नेपाली' : 'English'}
        </button>
        {onDeleteProject && activeTab !== 'projects' && (
          <button
            onClick={onDeleteProject}
            className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2 text-sm font-medium border border-red-900/30"
          >
            <Trash2 className="w-4 h-4" /> {t('Delete Project')}
          </button>
        )}
        <button
          onClick={handleSignOut}
          className="w-full bg-slate-800 hover:bg-red-600 text-gray-300 hover:text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2 text-sm font-medium"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
    </>
  )
}

export default Sidebar

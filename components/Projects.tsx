'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from './LanguageContext'

interface Project {
  id: string
  name: string
  description: string
  created_at: string
  deleted_at?: string | null
}

interface ProjectsProps {
  onSelectProject: (projectId: string) => void
}

export default function Projects({ onSelectProject }: ProjectsProps) {
  const { t } = useLanguage()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleted, setShowDeleted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching projects:', error)
      } else if (data) {
        setProjects(data)
      }
      setIsLoading(false)
    }
    fetchProjects()
  }, [])

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    // Soft delete
    e.stopPropagation()
    if (!window.confirm(t('Are you sure you want to delete this project?'))) return

    const { error } = await supabase
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error deleting project:', error)
      alert(`Failed to delete project: ${error.message}`)
    } else {
      setProjects(projects.map(p => p.id === id ? { ...p, deleted_at: new Date().toISOString() } : p))
    }
  }

  const handleRestoreProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const { error } = await supabase
      .from('projects')
      .update({ deleted_at: null })
      .eq('id', id)

    if (error) {
      console.error('Error restoring project:', error)
      alert('Failed to restore project')
    } else {
      setProjects(projects.map(p => p.id === id ? { ...p, deleted_at: null } : p))
    }
  }

  const handlePermanentDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!window.confirm(t('This will permanently delete the project and cannot be undone. Are you sure?'))) return

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error permanently deleting project:', error)
      alert('Failed to delete project')
    } else {
      setProjects(projects.filter(p => p.id !== id))
    }
  }

  const filteredProjects = projects
    .filter(p => showDeleted ? p.deleted_at : !p.deleted_at)
    .filter(project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('My Projects')}</h2>
        <div className="relative">
          <input
            type="text"
            placeholder={t('Search projects...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
        <button
          onClick={() => setShowDeleted(!showDeleted)}
          className={`px-4 py-2 rounded text-sm ${showDeleted ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          {showDeleted ? t('Show Active Projects') : t('Show Deleted Projects')}
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? t('No projects found matching your search.') : t('No projects found')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all border border-gray-200 relative group"
            >
              <h3 className="text-xl font-bold mb-2 text-gray-900">{project.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {project.description || t('No description')}
              </p>
              <div className="text-xs text-gray-500">
                {new Date(project.created_at).toLocaleDateString()}
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                {showDeleted ? (
                  <>
                    <button onClick={(e) => handleRestoreProject(e, project.id)} className="text-green-500 hover:text-green-700" title={t('Restore')}>
                      ♻️
                    </button>
                    <button onClick={(e) => handlePermanentDelete(e, project.id)} className="text-red-500 hover:text-red-700" title={t('Delete Permanently')}>
                      ❌
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => handleDeleteProject(e, project.id)}
                    className="text-gray-400 hover:text-red-500"
                    title={t('Delete Project')}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
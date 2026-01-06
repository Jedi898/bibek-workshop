'use client'

import { useState } from 'react'
import ContinuitySheet from '../components/ContinuitySheet'
import Editor from '../components/Editor'
import Sidebar from '../components/Sidebar'
import Characters from '../components/Characters'
import Notes from '../components/Notes'
import Weather from '../components/Weather'
import Schedule from '../components/Schedule'
import Contacts from '../components/Contacts'
import SceneBreakdown from '../components/SceneBreakdown'
import Locations from '../components/Locations'
import ShotPlanning from '../components/ShotPlanning'
import Budget from '../components/Budget'
import VirtualKeyboard from '../components/VirtualKeyboard'
import { useScriptStore } from '../lib/stores/scriptStore'
import { useSceneStore } from '../lib/stores/sceneStore'
import { useCharacterStore } from '../lib/stores/characterStore'
import { useLocationStore } from '../lib/stores/locationStore'
import { LanguageProvider } from '../components/LanguageContext'

type TabType = 'editor' | 'scene-breakdown' | 'characters' | 'locations' | 'contacts' | 'schedule' | 'notes' | 'weather' | 'continuity' | 'shot-planning' | 'budget'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('editor')
  const { currentScript } = useScriptStore()
  const { scenes, getScenesByScript, updateScene, addScene } = useSceneStore()
  const { characters, getCharactersByScript } = useCharacterStore()
  const { locations, getLocationsByScript } = useLocationStore()

  const scriptScenes = currentScript ? getScenesByScript(currentScript.id) : []
  const scriptCharacters = currentScript ? getCharactersByScript(currentScript.id) : []
  const scriptLocations = currentScript ? getLocationsByScript(currentScript.id) : []

  const handleUpdateScene = async (sceneId: string, updates: any) => {
    updateScene(sceneId, updates)
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'editor':
        return <Editor />
      case 'scene-breakdown':
        return <SceneBreakdown
          scenes={scriptScenes}
          characters={scriptCharacters}
          locations={scriptLocations}
          projectId={currentScript?.id || ''}
          onUpdateScene={handleUpdateScene}
          onAddScene={addScene}
        />
      case 'characters':
        return <Characters />
      case 'locations':
        return <Locations />
      case 'contacts':
        return <Contacts />
      case 'shot-planning':
        return <ShotPlanning scenes={scriptScenes} />
      case 'budget':
        return <Budget />
      case 'schedule':
        return <Schedule />
      case 'notes':
        return <Notes />
      case 'weather':
        return <Weather />
      case 'continuity':
        return <ContinuitySheet />
      default:
        return <Editor />
    }
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar activeTab={activeTab} onTabChange={(tab: string) => setActiveTab(tab as TabType)} />
        <main className="flex-1 p-8 ml-64">
          <div className="max-w-7xl mx-auto">
            {renderActiveComponent()}
          </div>
        </main>
        <VirtualKeyboard />
      </div>
    </LanguageProvider>
  )
}

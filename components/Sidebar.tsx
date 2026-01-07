'use client'

import { useLanguage } from './LanguageContext'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const { t, language, setLanguage, isNepaliTyping, setIsNepaliTyping, showVirtualKeyboard, setShowVirtualKeyboard } = useLanguage()

  const tabs = [
    { id: 'editor', label: t('Script Editor'), icon: '📝' },
    { id: 'scene-breakdown', label: t('Scene Breakdown'), icon: '🎬' },
    { id: 'characters', label: t('Characters'), icon: '👥' },
    { id: 'locations', label: t('Locations'), icon: '📍' },
    { id: 'contacts', label: t('Contacts'), icon: '📞' },
    { id: 'shot-planning', label: t('Shot Planning'), icon: '🎥' },
    { id: 'schedule', label: t('Schedule'), icon: '📅' },
    { id: 'budget', label: t('Budget'), icon: '💰' },
    { id: 'continuity', label: t('Continuity Sheet'), icon: '🎞️' },
    { id: 'notes', label: t('Notes'), icon: '📋' },
    { id: 'weather', label: t('Weather'), icon: '🌤️' },
  ]

  return (
    <div className="w-64 bg-film-black text-film-gold h-screen fixed left-0 top-0 flex flex-col border-r border-film-gray">
      <div className="p-4 flex-1 overflow-y-auto">
        <h1 className="text-xl font-bold mb-8">{t('Screenwriting App')}</h1>
        <nav>
          <ul className="space-y-2">
            {tabs.map(tab => (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center ${
                    activeTab === tab.id
                      ? 'bg-film-gold text-film-black font-semibold'
                      : 'hover:bg-film-gray text-film-gold'
                  }`}
                >
                  <span className="mr-3 text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="p-4 border-t border-gray-200 space-y-3">
        <button
          onClick={() => setIsNepaliTyping(!isNepaliTyping)}
          className={`w-full py-2 px-4 rounded transition-colors flex items-center justify-center gap-2 ${
            isNepaliTyping ? 'bg-film-gold text-film-black' : 'bg-film-gray text-film-gold hover:bg-film-gray-light'
          }`}
        >
          <span>⌨️</span>
          {t('Nepali Typing')}: {isNepaliTyping ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
          className={`w-full py-2 px-4 rounded transition-colors flex items-center justify-center gap-2 ${
            showVirtualKeyboard ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <span>🎹</span>
          {t('Virtual Keyboard')}
        </button>
        <button
          onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
        >
          <span>{language === 'en' ? '🇳🇵' : '🇺🇸'}</span>
          {language === 'en' ? 'नेपाली' : 'English'}
        </button>
      </div>
    </div>
  )
}

export default Sidebar

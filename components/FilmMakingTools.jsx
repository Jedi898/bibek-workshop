'use client';

import { useState } from 'react';
import SceneBreakdown from './SceneBreakdown';
import ShotPlanning from './ShotPlanning';
import { Clapperboard, Camera } from 'lucide-react';

export default function FilmMakingTools() {
  const [activeTab, setActiveTab] = useState('sceneBreakdown');

  const tabs = [
    { id: 'sceneBreakdown', label: 'दृश्य विश्लेषण', icon: Clapperboard },
    { id: 'shotPlanning', label: 'सट योजना', icon: Camera },
  ];

  return (
    <div className="w-full">
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex gap-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center gap-3 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base transition-colors focus:outline-none`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div>
        {activeTab === 'sceneBreakdown' && <SceneBreakdown />}
        {activeTab === 'shotPlanning' && <ShotPlanning />}
      </div>
    </div>
  );
}
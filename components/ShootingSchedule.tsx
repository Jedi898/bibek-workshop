'use client';

import { useState, useMemo } from 'react';
import { Contact } from '@/types/index';
import { generateSchedule, optimizeSchedule } from '@/lib/schedule';

export interface Location {
  id: string;
  name: string;
  [key: string]: any;
}

export interface Scene {
  id: string;
  sceneNumber: string;
  status?: string;
  estimatedTime?: number;
  locationId?: string;
  [key: string]: any;
}

export interface ShootingDay {
  id: string;
  date: string;
  locationId?: string;
  status: string;
  callTime: string;
  scenes: string[];
  crew: string[];
}

interface ShootingScheduleProps {
  scenes: Scene[];
  locations: Location[];
  contacts: Contact[];
  projectId: string;
  onScheduleGenerated: (schedule: ShootingDay[]) => Promise<void>;
}

export default function ShootingSchedule({
  scenes,
  locations,
  contacts,
  projectId,
  onScheduleGenerated
}: ShootingScheduleProps) {
  const [schedule, setSchedule] = useState<ShootingDay[]>([]);
  const [constraints, setConstraints] = useState({
    maxHoursPerDay: 12,
    travelTimeBetweenLocations: 30, // minutes
    mustShootSequentially: false,
    prioritizeLocationClusters: true,
    targetDurationDays: 60
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState<ShootingDay | null>(null);

  const unscheduledScenes = useMemo(() => 
    scenes.filter(scene => scene.status !== 'scheduled' && scene.status !== 'shot'),
    [scenes]
  );

  const availableActors = useMemo(() =>
    contacts.filter(contact =>
      contact.type === 'cast' &&
      contact.availability?.some(range => range.type === 'available')
    ),
    [contacts]
  );

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    try {
      const newSchedule = await generateSchedule({
        scenes: unscheduledScenes,
        locations,
        contacts: availableActors,
        constraints
      });
      
      const optimized = optimizeSchedule(newSchedule, constraints);
      setSchedule(optimized);
      await onScheduleGenerated(optimized);
    } catch (error) {
      console.error('Schedule generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimize = () => {
    const optimized = optimizeSchedule(schedule, constraints);
    setSchedule(optimized);
  };

  const calculateDayStats = (day: ShootingDay) => {
    const sceneCount = day.scenes.length;
    const crewCount = day.crew.length;
    const estimatedHours = day.scenes.reduce((total, sceneId) => {
      const scene = scenes.find(s => s.id === sceneId);
      return total + (scene?.estimatedTime || 0);
    }, 0) / 60;

    return { sceneCount, crewCount, estimatedHours };
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Shooting Schedule</h2>
            <p className="text-gray-600">
              {schedule.length} days scheduled • {unscheduledScenes.length} scenes remaining
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleOptimize}
              disabled={schedule.length === 0}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Optimize Schedule
            </button>
            <button
              onClick={handleGenerateSchedule}
              disabled={isGenerating || unscheduledScenes.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate Schedule'}
            </button>
          </div>
        </div>

        {/* Constraints Editor */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Hours/Day
            </label>
            <input
              type="number"
              value={constraints.maxHoursPerDay}
              onChange={(e) => setConstraints({...constraints, maxHoursPerDay: parseInt(e.target.value)})}
              className="w-full border rounded px-3 py-2"
              min="1"
              max="24"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Travel Time (min)
            </label>
            <input
              type="number"
              value={constraints.travelTimeBetweenLocations}
              onChange={(e) => setConstraints({...constraints, travelTimeBetweenLocations: parseInt(e.target.value)})}
              className="w-full border rounded px-3 py-2"
              min="0"
              max="240"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Days
            </label>
            <input
              type="number"
              value={constraints.targetDurationDays}
              onChange={(e) => setConstraints({...constraints, targetDurationDays: parseInt(e.target.value)})}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sequential"
              checked={constraints.mustShootSequentially}
              onChange={(e) => setConstraints({...constraints, mustShootSequentially: e.target.checked})}
              className="h-4 w-4 text-blue-600"
            />
            <label htmlFor="sequential" className="ml-2 text-sm text-gray-700">
              Shoot Sequentially
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="clusters"
              checked={constraints.prioritizeLocationClusters}
              onChange={(e) => setConstraints({...constraints, prioritizeLocationClusters: e.target.checked})}
              className="h-4 w-4 text-blue-600"
            />
            <label htmlFor="clusters" className="ml-2 text-sm text-gray-700">
              Prioritize Location Clusters
            </label>
          </div>
        </div>
      </div>

      {/* Schedule Display */}
      <div className="p-4">
        {schedule.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No schedule generated yet</div>
            <button
              onClick={handleGenerateSchedule}
              disabled={isGenerating || unscheduledScenes.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Generate Your First Schedule
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {schedule.map((day, index) => {
              const stats = calculateDayStats(day);
              const location = locations.find(l => l.id === day.locationId);
              
              return (
                <div
                  key={day.id}
                  onClick={() => setSelectedDay(day)}
                  className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                    selectedDay?.id === day.id ? 'border-blue-300 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">Day {index + 1}</h3>
                      <p className="text-gray-600">
                        {new Date(day.date).toLocaleDateString()} • {location?.name || 'Unknown Location'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-3 py-1 text-sm rounded ${
                        day.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                        day.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {day.status.replace('_', ' ')}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded">
                        Call: {new Date(day.callTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.sceneCount}</div>
                      <div className="text-sm text-gray-600">Scenes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.crewCount}</div>
                      <div className="text-sm text-gray-600">Crew</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.estimatedHours.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Hours</div>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-medium mb-1">Scenes:</div>
                    <div className="flex flex-wrap gap-2">
                      {day.scenes.map(sceneId => {
                        const scene = scenes.find(s => s.id === sceneId);
                        return scene ? (
                          <span key={sceneId} className="px-2 py-1 bg-gray-100 rounded">
                            {scene.sceneNumber}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
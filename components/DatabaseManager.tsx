'use client';

import { useState, useMemo } from 'react';
import { Character, Location, Contact } from '@/types/index';

interface DatabaseManagerProps {
  characters: Character[];
  locations: Location[];
  contacts: Contact[];
  projectId: string;
  onUpdateCharacter: (characterId: string, updates: Partial<Character>) => Promise<void>;
  onUpdateLocation: (locationId: string, updates: Partial<Location>) => Promise<void>;
}

type DatabaseView = 'characters' | 'locations';

export default function DatabaseManager({
  characters,
  locations,
  contacts,
  projectId,
  onUpdateCharacter,
  onUpdateLocation
}: DatabaseManagerProps) {
  const [view, setView] = useState<DatabaseView>('characters');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Character | Location | null>(null);

  const filteredItems = useMemo(() => {
    const items = view === 'characters' ? characters : locations;
    if (!searchTerm.trim()) return items;

    const term = searchTerm.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(term) ||
      (item.description && item.description.toLowerCase().includes(term))
    );
  }, [view, characters, locations, searchTerm]);

  const actors = contacts.filter(c => c.type === 'cast');

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setView('characters')}
              className={`px-4 py-2 rounded ${
                view === 'characters' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Characters ({characters.length})
            </button>
            <button
              onClick={() => setView('locations')}
              className={`px-4 py-2 rounded ${
                view === 'locations' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Locations ({locations.length})
            </button>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            + Add {view === 'characters' ? 'Character' : 'Location'}
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder={`Search ${view}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg pl-10"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* List */}
        <div className="border-r p-4">
          <h3 className="font-semibold mb-3">{view === 'characters' ? 'Characters' : 'Locations'}</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-3 rounded cursor-pointer ${
                  selectedItem?.id === item.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50 border'
                }`}
              >
                <div className="font-medium">{item.name}</div>
                {item.description && (
                  <div className="text-sm text-gray-600 truncate mt-1">
                    {item.description}
                  </div>
                )}
                {view === 'characters' && 'scenes' in item && (
                  <div className="text-xs text-gray-500 mt-1">
                    {item.scenes.length} scenes
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2 p-6">
          {selectedItem ? (
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
                  {selectedItem.description && (
                    <p className="text-gray-600 mt-2">{selectedItem.description}</p>
                  )}
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Edit
                </button>
              </div>

              {view === 'characters' && 'actorId' in selectedItem && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Assigned Actor
                        </label>
                        <select
                          value={selectedItem.actorId || ''}
                          onChange={async (e) => {
                            const character = selectedItem as Character;
                            await onUpdateCharacter(character.id, { 
                              actorId: e.target.value || undefined 
                            });
                          }}
                          className="w-full border rounded px-3 py-2"
                        >
                          <option value="">Not assigned</option>
                          {actors.map(actor => (
                            <option key={actor.id} value={actor.id}>
                              {actor.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Traits
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(selectedItem as Character).traits.map((trait, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Scenes</h3>
                    <div className="space-y-2">
                      {(selectedItem as Character).scenes.map(sceneId => (
                        <div key={sceneId} className="p-2 border rounded">
                          Scene {sceneId}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {view === 'locations' && 'address' in selectedItem && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Location Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <p className="mt-1">{selectedItem.address}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Permit Status
                        </label>
                        <span className={`mt-1 inline-block px-3 py-1 rounded text-sm ${
                          selectedItem.permitStatus === 'approved' ? 'bg-green-100 text-green-800' :
                          selectedItem.permitStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedItem.permitStatus || 'Not required'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Availability</h3>
                    <div className="space-y-2">
                      {(selectedItem as Location).availability?.map((range, index) => (
                        <div key={index} className="p-2 border rounded">
                          <div className="flex justify-between">
                            <span>{new Date(range.start).toLocaleDateString()}</span>
                            <span>{new Date(range.end).toLocaleDateString()}</span>
                          </div>
                          <div className={`text-sm ${
                            range.type === 'available' ? 'text-green-600' :
                            range.type === 'unavailable' ? 'text-red-600' :
                            'text-blue-600'
                          }`}>
                            {range.type}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select a {view.slice(0, -1)} to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
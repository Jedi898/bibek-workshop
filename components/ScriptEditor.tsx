'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CharacterExtension from './extensions/CharacterExtension';
import SceneNumberExtension from './extensions/SceneNumberExtension';
import { Script, ScriptVersion } from '../types';
import { saveScript, getScriptVersions, compareVersions } from '../lib/api/scripts';

interface ScriptEditorProps {
  script: Script;
  projectId: string;
  onSave: (content: string) => Promise<void>;
}

export default function ScriptEditor({ script, projectId, onSave }: ScriptEditorProps) {
  const [content, setContent] = useState(script.content);
  const [isSaving, setIsSaving] = useState(false);
  const [versions, setVersions] = useState<ScriptVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [characterNames, setCharacterNames] = useState<string[]>([]);

  // Extract character names from script content
  useEffect(() => {
    const lines = content.split('\n');
    const names = lines
      .filter(line => line.toUpperCase() === line && line.trim().length > 0)
      .map(line => line.trim());
    setCharacterNames(names);
  }, [content]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CharacterExtension.configure({ names: characterNames }),
      SceneNumberExtension
    ],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] p-4'
      }
    }
  });

  const handleSave = useCallback(async () => {
    if (!editor || !content.trim()) return;

    setIsSaving(true);
    try {
      await onSave(content);
      await saveScript(projectId, script.id, content);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [editor, content, projectId, script.id, onSave]);

  const loadVersions = useCallback(async () => {
    const versions = await getScriptVersions(script.id);
    setVersions(versions);
    setShowVersions(true);
  }, [script.id]);

  const handleVersionSelect = useCallback(async (versionId: string) => {
    const selectedVersion = versions.find(v => v.id === versionId);
    if (selectedVersion && editor) {
      editor.commands.setContent(selectedVersion.content);
      setContent(selectedVersion.content);
    }
  }, [versions, editor]);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{script.title}</h2>
            <p className="text-gray-600">Version {script.version}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={loadVersions}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Version History
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
        <div className="mt-2 flex space-x-4 text-sm">
          <span className="text-gray-600">Characters: {characterNames.length}</span>
          <span className="text-gray-600">
            Last saved: {new Date(script.updatedAt).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4">
        {/* Editor */}
        <div className="lg:col-span-3">
          <EditorContent editor={editor} />
        </div>

        {/* Sidebar */}
        <div className="border-l p-4">
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <button
              onClick={() => editor?.chain().focus().insertContent('\n\nINT. LOCATION - DAY\n\n').run()}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded"
            >
              Add Scene Header
            </button>
            <button
              onClick={() => editor?.chain().focus().insertContent('\nCHARACTER\n').run()}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded"
            >
              Add Character
            </button>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Characters ({characterNames.length})</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {characterNames.map(name => (
                <div key={name} className="px-2 py-1 bg-blue-50 rounded">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Version History Modal */}
      {showVersions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Version History</h3>
                <button
                  onClick={() => setShowVersions(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {versions.map(version => (
                  <div
                    key={version.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleVersionSelect(version.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">Version {version.version}</div>
                        <div className="text-sm text-gray-600">
                          {version.createdBy} • {new Date(version.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {version.id === script.id && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-gray-700 line-clamp-2">
                      {version.content.substring(0, 200)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

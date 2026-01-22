'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export interface Script {
  id: string;
  title: string;
  content: string;
  version: string | number;
  updatedAt: string;
}

interface ScriptEditorProps {
  script: Script;
  projectId: string;
  onSave: (content: string) => Promise<void>;
}

export default function ScriptEditor({ script, onSave }: ScriptEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: script.content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] p-4'
      }
    }
  });

  const handleSave = async () => {
    if (!editor) return;

    setIsSaving(true);
    try {
      await onSave(editor.getHTML());
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">{script.title}</h2>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

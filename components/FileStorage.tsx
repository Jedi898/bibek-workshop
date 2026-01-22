'use client';

import { useState, useCallback, useEffect } from 'react';
import { FileItem } from '@/types/index';
import { uploadFile, deleteFile, createFolder } from '@/lib/api/files';

interface FileStorageProps {
  projectId: string;
  initialFiles: FileItem[];
}

const folders = ['scripts', 'storyboards', 'contracts', 'production', 'art', 'sound'];

export default function FileStorage({ projectId, initialFiles }: FileStorageProps) {
  const [files, setFiles] = useState<FileItem[]>(initialFiles || []);
  const [currentFolder, setCurrentFolder] = useState('scripts');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setFiles(initialFiles || []);
  }, [initialFiles]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    setUploading(true);
    const uploadPromises = Array.from(fileList).map(file =>
      uploadFile(projectId, file, currentFolder)
    );

    try {
      const newFiles = await Promise.all(uploadPromises);
      setFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  }, [projectId, currentFolder]);

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const filteredFiles = files.filter(file => file.folder === currentFolder);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2 overflow-x-auto">
            {folders.map(folder => (
              <button
                key={folder}
                onClick={() => setCurrentFolder(folder)}
                className={`px-3 py-1 rounded capitalize flex items-center ${
                  currentFolder === folder
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {folder}
                <span className={`ml-2 text-xs ${currentFolder === folder ? 'text-blue-100' : 'text-gray-500'}`}>
                  {files.filter(f => f.folder === folder).length}
                </span>
              </button>
            ))}
          </div>
          <div>
            <label className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">
              {uploading ? 'Uploading...' : 'Upload Files'}
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </div>
      <div className="p-4">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No files in {currentFolder}. Upload some files to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map(file => (
              <div key={file.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded ${
                        file.type.startsWith('image') ? 'bg-green-100' :
                        file.type.includes('pdf') ? 'bg-red-100' :
                        'bg-blue-100'
                      }`}>
                        {file.type.includes('pdf') ? '📄' :
                         file.type.startsWith('image') ? '🖼️' : '📎'}
                      </div>
                      <div>
                        <h4 className="font-medium truncate">{file.name}</h4>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size ?? 0)} • {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    🗑️
                  </button>
                </div>
                <div className="mt-3 flex space-x-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View
                  </a>
                  <button className="text-sm text-gray-600 hover:underline">
                    Version History
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

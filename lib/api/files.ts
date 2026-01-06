import { FileItem } from '@/types';

export async function uploadFile(projectId: string, file: File, folder: string): Promise<FileItem> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  formData.append('projectId', projectId);

  const response = await fetch('/api/files', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Upload failed');
  
  const data = await response.json();
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: data.name,
    url: data.url,
    type: data.type,
    size: data.size,
    projectId,
    folder,
    uploadedBy: 'current-user',
    uploadedAt: new Date(),
  };
}

export async function deleteFile(fileId: string): Promise<void> {
  // Implementation for delete
}

export async function createFolder(name: string): Promise<void> {
  // Implementation for create folder
}
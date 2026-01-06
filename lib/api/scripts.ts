import { Script } from '../../types';

export async function saveScript(projectId: string, scriptId: string, content: string): Promise<Script> {
  const response = await fetch(`/api/scripts/${scriptId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error('Failed to save script');
  }

  return response.json();
}

export async function getScriptVersions(scriptId: string): Promise<any[]> {
  const response = await fetch(`/api/scripts/${scriptId}/versions`);

  if (!response.ok) {
    throw new Error('Failed to fetch script versions');
  }

  return response.json();
}

export async function compareVersions(versionId1: string, versionId2: string): Promise<any> {
  const response = await fetch(`/api/scripts/compare?version1=${versionId1}&version2=${versionId2}`);

  if (!response.ok) {
    throw new Error('Failed to compare versions');
  }

  return response.json();
}

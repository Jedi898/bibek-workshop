import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;
  const folder = data.get('folder') as string || 'uploads';

  if (!file) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Ensure directory exists
  const uploadDir = path.join(process.cwd(), 'public', folder);
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (e) {
    // Ignore error if directory exists
  }

  const filePath = path.join(uploadDir, file.name);
  await writeFile(filePath, buffer);
  
  return NextResponse.json({ 
    success: true, 
    url: `/${folder}/${file.name}`,
    name: file.name,
    size: file.size,
    type: file.type
  });
}
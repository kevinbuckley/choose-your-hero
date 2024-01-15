import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const theme = searchParams.get('theme');
 
  const guid = new Date().toISOString(); // Generate a GUID based on the current date and time
  
  const blob = await put(guid, theme || '', {
    access: 'public',
  });
  
  return NextResponse.json(
    { theme },
    {
      status: 200,
    },
  );
}
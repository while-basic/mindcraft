import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PROFILES_DIR = path.join(process.cwd(), '..', 'profiles');

export async function GET() {
  try {
    const files = await fs.readdir(PROFILES_DIR);
    const profiles = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async (file) => {
          const content = await fs.readFile(path.join(PROFILES_DIR, file), 'utf-8');
          const profile = JSON.parse(content);
          return {
            ...profile,
            id: file.replace('.json', ''),
          };
        })
    );

    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Error reading profiles:', error);
    return NextResponse.json({ error: 'Failed to load profiles' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const id = data.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filePath = path.join(PROFILES_DIR, `${id}.json`);

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ id, ...data });
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { id } = data;
    const filePath = path.join(PROFILES_DIR, `${id}.json`);

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    const filePath = path.join(PROFILES_DIR, `${id}.json`);

    await fs.unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting profile:', error);
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
  }
}

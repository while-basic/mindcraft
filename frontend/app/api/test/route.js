import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const currentDir = process.cwd();
    const possiblePaths = [
      path.join(currentDir, 'settings.js'),
      path.join(currentDir, '../settings.js'),
      path.join(currentDir, '../../settings.js'),
    ];

    const results = await Promise.all(
      possiblePaths.map(async (p) => {
        try {
          await fs.access(p);
          return { path: p, exists: true };
        } catch {
          return { path: p, exists: false };
        }
      })
    );

    return NextResponse.json({
      currentDir,
      paths: results
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Get the absolute path to the settings.js file - we know this exists from our test
const settingsPath = path.join(process.cwd(), '../settings.js');

// Function to clean the JavaScript object string for JSON parsing
function cleanJavaScriptObject(str) {
  return str
    // Remove comments
    .replace(/\/\/.+$/gm, '')
    // Remove trailing commas
    .replace(/,(\s*[}\]])/g, '$1')
    // Clean up whitespace
    .trim();
}

export async function GET() {
  try {
    const fileContent = await fs.readFile(settingsPath, 'utf-8');
    
    // First, extract everything between export default and the end of the object
    const match = fileContent.match(/export\s+default\s+({[\s\S]*})/);
    if (!match) {
      throw new Error('Could not find settings object in file');
    }

    // Get the object content and remove comments before parsing
    const objectContent = cleanJavaScriptObject(match[1]);
    const settings = JSON.parse(objectContent);
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error reading settings:', error);
    console.error('Attempted path:', settingsPath);
    return NextResponse.json({ error: `Failed to read settings: ${error.message}` }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { key, value } = await request.json();
    
    // Read the current file content
    const fileContent = await fs.readFile(settingsPath, 'utf-8');
    
    // Extract the settings object while preserving comments
    const settingsMatch = fileContent.match(/export\s+default\s+({[\s\S]*})/);
    if (!settingsMatch) {
      throw new Error('Invalid settings file format');
    }
    
    // Parse the current settings while preserving the file structure
    const currentSettings = JSON.parse(
      cleanJavaScriptObject(settingsMatch[1])
    );
    
    // Update the value
    currentSettings[key] = value;
    
    // Create new file content preserving the export default and maintaining the original structure
    let newContent = fileContent;
    
    // Update the specific key-value pair while preserving comments
    const keyRegex = new RegExp(`"${key}":\\s*[^,\\n}]*`);
    const valueStr = typeof value === 'string' ? `"${value}"` : value;
    newContent = newContent.replace(keyRegex, `"${key}": ${valueStr}`);
    
    await fs.writeFile(settingsPath, newContent);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: `Failed to update settings: ${error.message}` }, { status: 500 });
  }
}

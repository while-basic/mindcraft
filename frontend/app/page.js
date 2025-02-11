'use client';

import { useState, useEffect } from 'react';
import SettingsTile from './components/SettingsTile';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setSettings(data);
        setError(null);
      } catch (error) {
        console.error('Error loading settings:', error);
        setError(error.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSettingChange = async (key, value) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      });
      
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to update setting');
      }
      
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
      setError(null);
    } catch (error) {
      console.error('Error updating setting:', error);
      setError(error.message || 'Failed to update setting');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      Loading...
    </div>
  );

  if (error) return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Mindcraft Settings</h1>
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500">
        {error}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Mindcraft Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settings && Object.entries(settings).map(([key, value]) => (
          <SettingsTile
            key={key}
            name={key}
            value={value}
            onChange={(newValue) => handleSettingChange(key, newValue)}
          />
        ))}
      </div>
    </div>
  );
}

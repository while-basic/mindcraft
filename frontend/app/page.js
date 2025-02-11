'use client';

import { useState, useEffect } from 'react';
import SettingsTile from './components/SettingsTile';

const CATEGORIES = {
  server: ['minecraft_version', 'host', 'port', 'auth'],
  mindserver: ['host_mindserver', 'mindserver_host', 'mindserver_port'],
  profiles: ['base_profile', 'profiles', 'load_memory'],
  communication: ['init_message', 'only_chat_with', 'language', 'chat_bot_messages'],
  behavior: ['show_bot_views', 'narrate_behavior', 'verbose_commands'],
  security: ['allow_insecure_coding', 'code_timeout_mins'],
  system: ['relevant_docs_count', 'max_messages', 'num_examples', 'max_commands'],
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('server');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/settings');
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      setError(error.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

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

      // Show success notification
      setNotification({
        type: 'success',
        message: `Successfully updated ${key.replace(/_/g, ' ')}`
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      console.error('Error updating setting:', error);
      setNotification({
        type: 'error',
        message: error.message
      });
      throw error; // Re-throw to be handled by the SettingsTile
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Mindcraft Settings</h1>
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={loadSettings}
          className="mt-4 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg
                   hover:bg-red-500/20 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Mindcraft Settings</h1>
            <button
              onClick={loadSettings}
              className="px-3 py-1 text-sm bg-blue-500/10 text-blue-400 rounded
                       hover:bg-blue-500/20 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category Navigation */}
        <div className="mb-6 border-b border-gray-800">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {Object.keys(CATEGORIES).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-sm rounded-t-lg transition-colors whitespace-nowrap
                          ${activeCategory === category
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:text-gray-300'}`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settings && CATEGORIES[activeCategory].map((key) => (
            <SettingsTile
              key={key}
              name={key}
              value={settings[key]}
              onChange={(value) => handleSettingChange(key, value)}
            />
          ))}
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg
                        ${notification.type === 'success'
                          ? 'bg-green-500/10 border border-green-500 text-green-400'
                          : 'bg-red-500/10 border border-red-500 text-red-400'}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}

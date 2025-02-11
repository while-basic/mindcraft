'use client';

import { useState, useEffect } from 'react';

const SettingsTile = ({ name, value: initialValue, onChange }) => {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await onChange(value);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
    setError(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const renderInput = () => {
    if (typeof value === 'boolean') {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => setValue(e.target.checked)}
            disabled={!isEditing}
            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span className="text-sm text-gray-400">{value ? 'Enabled' : 'Disabled'}</span>
        </div>
      );
    }

    if (typeof value === 'number') {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          onKeyDown={handleKeyDown}
          disabled={!isEditing}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   disabled:opacity-50 disabled:cursor-not-allowed"
        />
      );
    }

    if (Array.isArray(value)) {
      return (
        <textarea
          value={JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              setValue(JSON.parse(e.target.value));
              setError(null);
            } catch (err) {
              setError('Invalid JSON format');
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              handleSave();
            } else if (e.key === 'Escape') {
              handleCancel();
            }
          }}
          disabled={!isEditing}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]
                   disabled:opacity-50 disabled:cursor-not-allowed"
        />
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={!isEditing}
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 
                 focus:outline-none focus:ring-2 focus:ring-blue-500
                 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    );
  };

  return (
    <div className={`bg-gray-900 rounded-lg p-4 border transition-colors duration-200
                    ${isEditing ? 'border-blue-500' : 'border-gray-800 hover:border-gray-700'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <label className="block font-medium text-gray-200">
            {name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </label>
          <p className="text-xs text-gray-500 mt-1">
            {typeof value === 'boolean' ? 'Toggle setting' :
             typeof value === 'number' ? 'Numeric value' :
             Array.isArray(value) ? 'JSON array' : 'Text value'}
          </p>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 
                       hover:bg-blue-500/20 transition-colors"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving || error}
                className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 
                         hover:bg-green-500/20 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="text-xs px-2 py-1 rounded bg-gray-500/10 text-gray-400 
                         hover:bg-gray-500/20 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
      {renderInput()}
      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default SettingsTile;

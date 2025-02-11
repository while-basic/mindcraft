'use client';

import { useState } from 'react';
import { Card, Button, Input, Select, Textarea } from '../../components/ui';
import styles from '../profiles.module.css';

const PROVIDERS = [
  'gpt',
  'claude',
  'gemini',
  'mistral',
  'llama',
  'deepseek',
  'qwen',
  'grok'
];

const ProfileEditor = ({ profile, onSave, onDelete, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    systemPrompt: '',
    ...profile
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className={styles.editorCard}>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Name</label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Provider</label>
          <Select
            value={formData.provider}
            onChange={(e) => handleChange('provider', e.target.value)}
            required
          >
            <option value="">Select Provider</option>
            {PROVIDERS.map(provider => (
              <option key={provider} value={provider}>
                {provider.toUpperCase()}
              </option>
            ))}
          </Select>
        </div>

        <div className={styles.formGroup}>
          <label>Temperature ({formData.temperature})</label>
          <Input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={formData.temperature}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Max Tokens</label>
          <Input
            type="number"
            value={formData.maxTokens}
            onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
            min="1"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Top P ({formData.topP})</label>
          <Input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={formData.topP}
            onChange={(e) => handleChange('topP', parseFloat(e.target.value))}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Frequency Penalty ({formData.frequencyPenalty})</label>
          <Input
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={formData.frequencyPenalty}
            onChange={(e) => handleChange('frequencyPenalty', parseFloat(e.target.value))}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Presence Penalty ({formData.presencePenalty})</label>
          <Input
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={formData.presencePenalty}
            onChange={(e) => handleChange('presencePenalty', parseFloat(e.target.value))}
          />
        </div>

        <div className={styles.formGroup}>
          <label>System Prompt</label>
          <Textarea
            value={formData.systemPrompt}
            onChange={(e) => handleChange('systemPrompt', e.target.value)}
            rows={4}
          />
        </div>

        <div className={styles.buttonGroup}>
          <Button type="submit" variant="primary">
            {profile ? 'Update Profile' : 'Create Profile'}
          </Button>
          
          {profile && (
            <Button
              type="button"
              variant="danger"
              onClick={() => onDelete(profile.id)}
            >
              Delete Profile
            </Button>
          )}
          
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export { ProfileEditor };

'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '../components/ui';
import { ProfileEditor } from './components/ProfileEditor';
import styles from './profiles.module.css';

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const response = await fetch('/api/profiles');
      const data = await response.json();
      setProfiles(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const handleSave = async (profileData) => {
    try {
      const method = profileData.id ? 'PUT' : 'POST';
      const url = `/api/profiles${profileData.id ? `/${profileData.id}` : ''}`;
      
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      await loadProfiles();
      setIsEditing(false);
      setSelectedProfile(null);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleDelete = async (profileId) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;

    try {
      await fetch(`/api/profiles/${profileId}`, {
        method: 'DELETE',
      });
      await loadProfiles();
      setSelectedProfile(null);
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Language Model Profiles</h1>
      
      <div className={styles.grid}>
        <div className={styles.profilesList}>
          <Button onClick={() => setIsEditing(true)} className={styles.addButton}>
            Add New Profile
          </Button>
          
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className={styles.profileCard}
              onClick={() => setSelectedProfile(profile)}
            >
              <h3>{profile.name}</h3>
              <p>Provider: {profile.provider}</p>
            </Card>
          ))}
        </div>

        <div className={styles.profileEditor}>
          {(selectedProfile || isEditing) && (
            <ProfileEditor
              profile={selectedProfile}
              onSave={handleSave}
              onDelete={handleDelete}
              onCancel={() => {
                setSelectedProfile(null);
                setIsEditing(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// AddSafeZoneForm.jsx
// Drop this component into SafeZonesPage.jsx (or use as a standalone modal)
// It calls POST /api/route/safe-zones and saves directly to MySQL safe_zones table

import React, { useState } from 'react';
import { routeApi } from '../services/api';

const ZONE_TYPES = ['POLICE', 'HOSPITAL', 'SHELTER', 'SHOP', 'TRANSPORT'];

export default function AddSafeZoneForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    type: 'SHELTER',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // ✅ Uses browser geolocation to auto-fill lat/lng
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(prev => ({
          ...prev,
          latitude:  pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
      },
      () => setError('Could not get your location')
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name || !form.latitude || !form.longitude || !form.type) {
      setError('Name, latitude, longitude and type are required');
      return;
    }

    setLoading(true);
    try {
      // ✅ This calls POST /api/route/safe-zones → SafeRouteService.addSafeZone()
      // → safeZoneRepo.save() → writes to MySQL safe_zones table
      await routeApi.addSafeZone({
        name:        form.name,
        description: form.description,
        latitude:    parseFloat(form.latitude),
        longitude:   parseFloat(form.longitude),
        type:        form.type,
      });

      setSuccess('Safe zone added successfully!');
      setForm({ name: '', description: '', latitude: '', longitude: '', type: 'SHELTER' });
      if (onSuccess) onSuccess(); // refresh the safe zones list in parent
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add safe zone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '1rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Add a safe zone</h3>

      {error   && <p style={{ color: 'red',   marginBottom: 8 }}>{error}</p>}
      {success && <p style={{ color: 'green', marginBottom: 8 }}>{success}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          name="name"
          placeholder="Place name *"
          value={form.name}
          onChange={handleChange}
          style={inputStyle}
        />
        <input
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
          style={inputStyle}
        />
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          style={inputStyle}
        >
          {ZONE_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            name="latitude"
            placeholder="Latitude *"
            value={form.latitude}
            onChange={handleChange}
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            name="longitude"
            placeholder="Longitude *"
            value={form.longitude}
            onChange={handleChange}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>

        <button
          type="button"
          onClick={useMyLocation}
          style={{ ...btnStyle, background: '#e8f5e9', color: '#2e7d32' }}
        >
          Use my current location
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          style={{ ...btnStyle, background: '#6a1b9a', color: '#fff' }}
        >
          {loading ? 'Saving...' : 'Save to database'}
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #ccc',
  fontSize: 14,
  width: '100%',
  boxSizing: 'border-box',
};

const btnStyle = {
  padding: '10px 16px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
};
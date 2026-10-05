import { useState, useEffect } from 'react';
import { routeApi } from '../services/api';
import { Shield, Phone, MapPin, Search, Plus, X } from 'lucide-react';
import './SafeZonesPage.css';
import AddSafeZoneForm from '../components/AddSafeZoneForm';

const FILTER_TYPES = ['All','POLICE','HOSPITAL','SHELTER','SHOP','TRANSPORT'];

const TYPE_META = {
  POLICE:    { color:'#3B82F6', bg:'rgba(59,130,246,0.12)',  icon:'🛡️', label:'Police'    },
  HOSPITAL:  { color:'#22C55E', bg:'rgba(34,197,94,0.12)',   icon:'🏥', label:'Hospital'  },
  SHELTER:   { color:'#F59E0B', bg:'rgba(245,158,11,0.12)',  icon:'🏠', label:'Shelter'   },
  SHOP:      { color:'#8B5CF6', bg:'rgba(139,92,246,0.12)',  icon:'🏪', label:'Shop'      },
  TRANSPORT: { color:'#e8614d', bg:'rgba(232,97,77,0.12)',   icon:'🚌', label:'Transport' },
};

function SafetyRing({ score }) {
  const color = score >= 90 ? '#3B82F6' : score >= 75 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#e8614d';
  const r = 20, circ = 2 * Math.PI * r, dash = (score / 100) * circ;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"/>
      <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 28 28)"
        style={{filter:`drop-shadow(0 0 4px ${color}88)`}}/>
      <text x="28" y="33" textAnchor="middle" fill={color} fontSize="13" fontWeight="700">{score}</text>
    </svg>
  );
}

export default function SafeZonesPage() {
  const [zones,      setZones]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('All');
  const [search,     setSearch]     = useState('');
  // ✅ NEW: toggle to show/hide the Add Safe Zone form
  const [showForm,   setShowForm]   = useState(false);

  // ✅ Extracted into a function so we can call it again after adding a zone
  const fetchSafeZones = () => {
    setLoading(true);
    routeApi.safeZones()
      .then(r => setZones(r.data || []))
      .catch(() => setZones([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSafeZones();
  }, []);

  // ✅ Called by AddSafeZoneForm's onSuccess — refreshes list from MySQL
  const handleZoneAdded = () => {
    setShowForm(false);   // hide the form
    fetchSafeZones();     // re-fetch updated list from backend
  };

  const filtered = zones.filter(z => {
    const matchType = filter === 'All' || z.type === filter;
    const matchSearch = !search ||
      z.name?.toLowerCase().includes(search.toLowerCase()) ||
      z.description?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const counts = {
    POLICE:   zones.filter(z => z.type === 'POLICE').length,
    HOSPITAL: zones.filter(z => z.type === 'HOSPITAL').length,
    SHELTER:  zones.filter(z => z.type === 'SHELTER').length,
    Total:    zones.length,
  };

  return (
    <div className="sz-page">

      {/* Header */}
      <div className="sz-header">
        <div className="sz-header-left">
          <div className="sz-header-icon">🛡️</div>
          <div>
            <h1>Safe Zones</h1>
            <p>Community-verified safe areas near you</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* ✅ NEW: Add Zone toggle button */}
          <button
            onClick={() => setShowForm(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              background: showForm ? 'rgba(232,97,77,0.15)' : 'rgba(34,197,94,0.15)',
              color: showForm ? '#e8614d' : '#22C55E',
            }}
          >
            {showForm ? <X size={15}/> : <Plus size={15}/>}
            {showForm ? 'Cancel' : 'Add Zone'}
          </button>

          <div className="sz-live-pill">
            <span className="sz-live-dot"/>
            Live
          </div>
        </div>
      </div>

      {/* ✅ NEW: Add Safe Zone Form — shown only when showForm is true */}
      {showForm && (
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <AddSafeZoneForm onSuccess={handleZoneAdded} />
        </div>
      )}

      {/* Stats */}
      {!loading && (
        <div className="sz-stats-grid">
          {[
            { label:'Police Stations', value:counts.POLICE,   icon:'🛡️', color:'#3B82F6' },
            { label:'Hospitals',       value:counts.HOSPITAL, icon:'🏥', color:'#22C55E' },
            { label:'Shelters',        value:counts.SHELTER,  icon:'🏠', color:'#F59E0B' },
            { label:'Total Zones',     value:counts.Total,    icon:'⚡', color:'#8B5CF6' },
          ].map(s => (
            <div key={s.label} className="sz-stat-card">
              <div className="sz-stat-icon">{s.icon}</div>
              <div className="sz-stat-val" style={{color:s.color}}>{s.value}</div>
              <div className="sz-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search + filter */}
      <div className="sz-controls">
        <div className="sz-search-wrap">
          <Search size={15} className="sz-search-icon"/>
          <input className="sz-search" placeholder="Search zones or areas…"
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="sz-filters">
          {FILTER_TYPES.map(t => (
            <button key={t}
              className={`sz-filter-btn ${filter === t ? 'active' : ''}`}
              onClick={() => setFilter(t)}>
              {t === 'All' ? 'All' : TYPE_META[t]?.label || t}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      {!loading && (
        <div className="sz-result-count">▼ {filtered.length} zone{filtered.length !== 1 ? 's' : ''} found</div>
      )}

      {/* Zone list */}
      {loading ? (
        <div className="sz-skeleton-list">
          {[1,2,3].map(i => <div key={i} className="sz-skeleton"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="sz-empty">
          <div>🔍</div>
          <p>No zones match your search.</p>
        </div>
      ) : (
        <div className="sz-zone-list">
          {filtered.map((z, i) => {
            const meta = TYPE_META[z.type] || TYPE_META.SHELTER;
            const score = z.safetyScore || (z.isVerified ? 92 : 75);
            return (
              <div key={z.id || i} className="sz-zone-card" style={{'--delay':`${i*0.05}s`}}>
                <div className="sz-zone-icon" style={{background:meta.bg, border:`1px solid ${meta.color}33`}}>
                  {meta.icon}
                </div>
                <div className="sz-zone-info">
                  <div className="sz-zone-name">{z.name}</div>
                  <div className="sz-zone-loc">
                    <MapPin size={11}/> {z.description || meta.label}
                  </div>
                  <div className="sz-zone-tags">
                    <span className="sz-tag" style={{color:meta.color,background:meta.bg,border:`1px solid ${meta.color}33`}}>
                      {meta.label}
                    </span>
                    {z.isVerified && <span className="sz-tag sz-verified">✓ Verified</span>}
                  </div>
                </div>
                <div className="sz-zone-right">
                  <SafetyRing score={score}/>
                  <a href="tel:112" className="sz-call-btn" style={{background:meta.bg,border:`1px solid ${meta.color}33`}}>
                    📞
                  </a>
                  <span className="sz-chevron">›</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
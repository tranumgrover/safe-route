import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup, Circle, Polyline, useMapEvents } from 'react-leaflet';
import { Navigation, MapPin, Zap, Crosshair, Shield, AlertTriangle, ChevronDown, X, Layers, Clock, Star } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapPage.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER = [30.7333, 76.7794];

// ── Geocode a place name → [lat, lng] via Nominatim (free, no key) ──────────
async function geocode(query) {
  const r = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await r.json();
  if (!data.length) throw new Error('Place not found: "' + query + '". Try a more specific name.');
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

// ── Haversine distance in km ─────────────────────────────────────────────────
function haversineKm(a, b) {
  const R = 6371, toR = d => d * Math.PI / 180;
  const dLat = toR(b[0]-a[0]), dLng = toR(b[1]-a[1]);
  const x = Math.sin(dLat/2)**2 + Math.cos(toR(a[0]))*Math.cos(toR(b[0]))*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}

const SAFE_ZONES = [
  { id:1, center:[30.745,76.785], radius:400, label:'Sector 17 Police', type:'police' },
  { id:2, center:[30.760,76.770], radius:350, label:'PGI Hospital',      type:'hospital' },
  { id:3, center:[30.728,76.760], radius:300, label:'Rose Garden',       type:'public' },
];
const DANGER_ZONES = [
  { id:1, center:[30.720,76.800], radius:300, label:'Isolated stretch' },
  { id:2, center:[30.750,76.810], radius:250, label:'Poor lighting area' },
];
const RECENT_SEARCHES = ['Sector 22 Market','PGI Hospital','Rose Garden','Sector 17'];

function createUserIcon() {
  return L.divIcon({
    className: '',
    html: `<div class="user-marker"><div class="user-marker-inner"></div><div class="user-marker-ring"></div></div>`,
    iconSize: [22,22], iconAnchor: [11,11],
  });
}

function LocationMarker({ onLocate }) {
  const [position, setPosition] = useState(null);
  const map = useMap();
  useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, 16, { duration: 2 });
      onLocate && onLocate(e.latlng);
    },
    locationerror() { map.flyTo(DEFAULT_CENTER, 13, { duration: 1 }); },
  });
  useEffect(() => { map.locate({ watch:false, enableHighAccuracy:true }); }, [map]);
  return position ? <Marker position={position} icon={createUserIcon()} /> : null;
}

function PickMarker({ mode, onPick }) {
  useMapEvents({ click(e) { if (mode) onPick(e.latlng); } });
  return null;
}

function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords) map.flyTo(coords, 15, { duration: 1.5 }); }, [coords, map]);
  return null;
}

// ── Auto-fit map to show both endpoints after route calculation ───────────────
function FitBounds({ sCoords, eCoords, trigger }) {
  const map = useMap();
  useEffect(() => {
    if (!sCoords || !eCoords || !trigger) return;
    const bounds = L.latLngBounds([sCoords[0], sCoords[1]], [eCoords[0], eCoords[1]]);
    map.flyToBounds(bounds, { padding:[90,90], duration:1.4, maxZoom:13 });
  }, [trigger]);
  return null;
}

export default function MapPage() {
  const [startPoint,  setStartPoint]  = useState('');
  const [endPoint,    setEndPoint]    = useState('');
  const [startCoords, setStartCoords] = useState(null); // [lat, lng]
  const [endCoords,   setEndCoords]   = useState(null); // [lat, lng]
  const [pickMode,    setPickMode]    = useState(null);
  const [routes,      setRoutes]      = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);
  const [flyTo,       setFlyTo]       = useState(null);
  const [showRecent,  setShowRecent]  = useState(false);
  const [mapLayer,    setMapLayer]    = useState('standard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [locatedAt,   setLocatedAt]   = useState(null);
  const [scoreAnim,   setScoreAnim]   = useState(0);
  const [fitTrigger,  setFitTrigger]  = useState(0);
  const [geoError,    setGeoError]    = useState('');
  const startRef = useRef();

  const TILES = {
    standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    dark:     'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
  };

  // Animate safety score bar
  useEffect(() => {
    if (routes.length > 0) {
      const target = routes[0]?.safetyScore || 87;
      let frame, start;
      const animate = now => {
        if (!start) start = now;
        const p = Math.min((now - start) / 1000, 1);
        setScoreAnim(Math.round((1 - Math.pow(1-p, 3)) * target));
        if (p < 1) frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frame);
    }
  }, [routes]);

  // ── MAIN: geocode both inputs, build routes, auto-zoom ───────────────────
  const handleCalculate = async () => {
    if (!startPoint.trim() || !endPoint.trim()) return;
    setLoading(true);
    setRoutes([]);
    setGeoError('');
    try {
      // Use map-click coords if available, else geocode the typed text
      const sC = startCoords || await geocode(startPoint);
      const eC = endCoords   || await geocode(endPoint);

      // Persist resolved coords so markers show correctly
      setStartCoords(sC);
      setEndCoords(eC);

      const directDist = haversineKm(sC, eC);
      const safeDetour = directDist * 1.15;
      const speed      = 30; // km/h

      // Safe route — bezier curve offset perpendicular to direct line
      const midLat = (sC[0]+eC[0])/2, midLng = (sC[1]+eC[1])/2;
      const dx = eC[1]-sC[1], dy = eC[0]-sC[0];
      const safeCoords = Array.from({length:9}, (_,i) => {
        const t = i/8;
        return [
          (1-t)**2 * sC[0] + 2*(1-t)*t * (midLat - dx*0.25) + t**2 * eC[0],
          (1-t)**2 * sC[1] + 2*(1-t)*t * (midLng + dy*0.25) + t**2 * eC[1],
        ];
      });

      setRoutes([
        {
          id:1, label:'Safest Route',  color:'#22c55e', dashArray:null,
          coords: safeCoords,
          distance: `${safeDetour.toFixed(1)} km`,
          time:     `${Math.round((safeDetour/speed)*60)} min`,
          safetyScore: 94, tags:['Well lit','CCTV'],
        },
        {
          id:2, label:'Fastest Route', color:'#f59e0b', dashArray:'8 6',
          coords: [sC, eC],
          distance: `${directDist.toFixed(1)} km`,
          time:     `${Math.round((directDist/speed)*60)} min`,
          safetyScore: 67, tags:['Busy area'],
        },
      ]);
      setActiveRoute(1);
      setFitTrigger(t => t + 1); // ← triggers FitBounds → flyToBounds
    } catch (err) {
      setGeoError(err.message || 'Could not find location. Try a more specific name.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickMode = mode => setPickMode(prev => prev === mode ? null : mode);

  const handleMapPick = latlng => {
    const coords = [latlng.lat, latlng.lng];
    if (pickMode === 'start') {
      setStartCoords(coords);
      setStartPoint(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
      setFlyTo(latlng);
    } else if (pickMode === 'end') {
      setEndCoords(coords);
      setEndPoint(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
      setFlyTo(latlng);
    }
    setPickMode(null);
  };

  return (
    <div className="mp-root">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside className={`mp-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <button className="mp-sidebar-toggle" onClick={() => setSidebarOpen(p => !p)}>
          <ChevronDown size={14} style={{ transform: sidebarOpen ? 'rotate(90deg)' : 'rotate(-90deg)', transition:'transform 0.3s' }} />
        </button>

        {sidebarOpen && (
          <>
            <div className="mp-logo-row">
              <img src="/logo.svg" alt="S" className="mp-logo-img" />
              <span className="mp-logo-text">SafeRoute</span>
              <span className="mp-logo-badge">Live</span>
            </div>

            <div className="mp-section">
              <div className="mp-section-label"><Navigation size={11}/> Route Planner</div>

              {/* Start input */}
              <div className={`mp-input-wrap ${pickMode==='start'?'picking':''}`}>
                <div className="mp-input-dot dot-green"/>
                <input ref={startRef} className="mp-input" placeholder="Start — type a place or pick on map"
                  value={startPoint} onChange={e => { setStartPoint(e.target.value); setStartCoords(null); }}
                  onFocus={() => setShowRecent('start')}
                  onBlur={() => setTimeout(() => setShowRecent(false), 150)} />
                {startPoint && <button className="mp-input-clear" onClick={() => { setStartPoint(''); setStartCoords(null); }}><X size={11}/></button>}
              </div>

              {showRecent === 'start' && (
                <div className="mp-recent-dropdown">
                  <div className="mp-recent-label"><Clock size={10}/> Recent</div>
                  {RECENT_SEARCHES.map(s => (
                    <div key={s} className="mp-recent-item" onMouseDown={() => { setStartPoint(s); setStartCoords(null); setShowRecent(false); }}>
                      <MapPin size={11} color="#6b7b99"/> {s}
                    </div>
                  ))}
                </div>
              )}

              {/* End input */}
              <div className={`mp-input-wrap ${pickMode==='end'?'picking':''}`} style={{marginTop:6}}>
                <div className="mp-input-dot dot-red"/>
                <input className="mp-input" placeholder="End — type a place or pick on map"
                  value={endPoint} onChange={e => { setEndPoint(e.target.value); setEndCoords(null); }}
                  onFocus={() => setShowRecent('end')}
                  onBlur={() => setTimeout(() => setShowRecent(false), 150)} />
                {endPoint && <button className="mp-input-clear" onClick={() => { setEndPoint(''); setEndCoords(null); }}><X size={11}/></button>}
              </div>

              {showRecent === 'end' && (
                <div className="mp-recent-dropdown">
                  <div className="mp-recent-label"><Clock size={10}/> Recent</div>
                  {RECENT_SEARCHES.map(s => (
                    <div key={s} className="mp-recent-item" onMouseDown={() => { setEndPoint(s); setEndCoords(null); setShowRecent(false); }}>
                      <MapPin size={11} color="#6b7b99"/> {s}
                    </div>
                  ))}
                </div>
              )}

              <div className="mp-pick-row">
                <button className={`mp-pick-btn ${pickMode==='start'?'active':''}`} onClick={() => handlePickMode('start')}>
                  <MapPin size={12}/> Pick start
                </button>
                <button className={`mp-pick-btn ${pickMode==='end'?'active':''}`} onClick={() => handlePickMode('end')}>
                  <MapPin size={12}/> Pick end
                </button>
              </div>

              <button className={`mp-calc-btn ${loading?'loading':''}`} onClick={handleCalculate} disabled={loading}>
                {loading ? <><span className="mp-spinner"/> Calculating…</> : <><Navigation size={13}/> Calculate Routes</>}
              </button>

              {geoError && (
                <div style={{fontSize:12,color:'#e8614d',padding:'7px 10px',background:'rgba(232,97,77,.1)',borderRadius:8,marginTop:6,lineHeight:1.4}}>
                  ⚠ {geoError}
                </div>
              )}
            </div>

            {/* Route results */}
            {routes.length > 0 && (
              <div className="mp-section mp-routes-section">
                <div className="mp-section-label"><Star size={11}/> Routes Found</div>
                {routes.map(route => (
                  <div key={route.id}
                    className={`mp-route-card ${activeRoute===route.id?'active':''}`}
                    onClick={() => setActiveRoute(route.id)}
                    style={{'--route-color': route.color}}>
                    <div className="mp-route-header">
                      <div className="mp-route-dot" style={{background:route.color}}/>
                      <span className="mp-route-label">{route.label}</span>
                      <span className="mp-route-score" style={{color:route.color}}>{route.safetyScore}</span>
                    </div>
                    <div className="mp-route-meta">
                      <span>{route.distance}</span>
                      <span className="mp-route-sep">·</span>
                      <span>{route.time}</span>
                    </div>
                    <div className="mp-route-tags">
                      {route.tags.map(t => (
                        <span key={t} className="mp-route-tag" style={{borderColor:route.color+'55',color:route.color}}>{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="mp-score-bar-wrap">
                  <div className="mp-score-bar-label">Safety score</div>
                  <div className="mp-score-bar-track">
                    <div className="mp-score-bar-fill" style={{width:`${scoreAnim}%`}}/>
                  </div>
                  <span className="mp-score-bar-val">{scoreAnim}</span>
                </div>
              </div>
            )}

            <button className="mp-location-btn" onClick={() => setFlyTo(locatedAt || DEFAULT_CENTER)}>
              <Crosshair size={14}/> My location
            </button>

            <div className="mp-section">
              <div className="mp-section-label"><Layers size={11}/> Map Style</div>
              <div className="mp-layer-row">
                <button className={`mp-layer-btn ${mapLayer==='standard'?'active':''}`} onClick={() => setMapLayer('standard')}>Standard</button>
                <button className={`mp-layer-btn ${mapLayer==='dark'?'active':''}`}     onClick={() => setMapLayer('dark')}>Dark</button>
              </div>
            </div>

            <button className="mp-sos-btn"><Zap size={15}/> SOS Emergency</button>

            <div className="mp-legend">
              <div className="mp-legend-item"><span className="mp-leg-dot" style={{background:'#22c55e'}}/>Safe zone</div>
              <div className="mp-legend-item"><span className="mp-leg-dot" style={{background:'#ef4444'}}/>Danger zone</div>
              <div className="mp-legend-item"><span className="mp-leg-line" style={{background:'#22c55e'}}/>Safe route</div>
              <div className="mp-legend-item"><span className="mp-leg-line" style={{background:'transparent',borderTop:'2px dashed #f59e0b'}}/>Fastest route</div>
              <div className="mp-legend-item"><span className="mp-leg-dot" style={{background:'#3b82f6'}}/>Your location</div>
            </div>
          </>
        )}
      </aside>

      {/* ── MAP ─────────────────────────────────────────────────────────── */}
      <div className={`mp-map-wrap ${pickMode?'pick-cursor':''}`}>
        {pickMode && (
          <div className="mp-pick-toast">
            <MapPin size={13}/> Click on the map to set <strong>{pickMode}</strong> point
            <button onClick={() => setPickMode(null)}><X size={12}/></button>
          </div>
        )}

        <MapContainer center={DEFAULT_CENTER} zoom={5} style={{width:'100%',height:'100%'}} zoomControl={false}>
          <TileLayer url={TILES[mapLayer]} attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'/>

          <LocationMarker onLocate={setLocatedAt}/>
          <PickMarker mode={pickMode} onPick={handleMapPick}/>
          {flyTo && <FlyTo coords={flyTo}/>}

          {/* AUTO-ZOOM after Calculate Routes */}
          <FitBounds sCoords={startCoords} eCoords={endCoords} trigger={fitTrigger}/>

          {SAFE_ZONES.map(z => (
            <Circle key={z.id} center={z.center} radius={z.radius}
              pathOptions={{color:'#22c55e',fillColor:'#22c55e',fillOpacity:0.12,weight:1.5}}>
              <Popup className="mp-popup">{z.label}</Popup>
            </Circle>
          ))}

          {DANGER_ZONES.map(z => (
            <Circle key={z.id} center={z.center} radius={z.radius}
              pathOptions={{color:'#ef4444',fillColor:'#ef4444',fillOpacity:0.15,weight:1.5}}>
              <Popup className="mp-popup">{z.label}</Popup>
            </Circle>
          ))}

          {routes.map(route => (
            <Polyline key={route.id} positions={route.coords}
              pathOptions={{
                color:     route.color,
                weight:    activeRoute===route.id ? 5 : 3,
                opacity:   activeRoute===route.id ? 1 : 0.45,
                dashArray: route.dashArray,
              }}>
              <Popup className="mp-popup">{route.label} · {route.distance} · {route.time}</Popup>
            </Polyline>
          ))}

          {startCoords && (
            <Marker position={startCoords}>
              <Popup className="mp-popup">📍 Start: {startPoint}</Popup>
            </Marker>
          )}
          {endCoords && (
            <Marker position={endCoords}>
              <Popup className="mp-popup">🏁 End: {endPoint}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
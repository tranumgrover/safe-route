import { useState, useEffect } from 'react';
import './NewsPage.css';

const CATEGORIES = ['All','Crime','Weather','Traffic','Alert'];
const META = {
  Crime:   { color:'#e8614d', bg:'rgba(232,97,77,0.12)',   icon:'🚨' },
  Weather: { color:'#F59E0B', bg:'rgba(245,158,11,0.12)',  icon:'🌧️' },
  Traffic: { color:'#F97316', bg:'rgba(249,115,22,0.12)',  icon:'⚠️' },
  Alert:   { color:'#8B5CF6', bg:'rgba(139,92,246,0.12)',  icon:'🔔' },
};

const SEED = [
  { id:1, title:'Crime reported in Sector 22', description:'A snatching incident was reported near the Sector 22 market area. Police have been notified and are investigating.', category:'Crime',   location:'Sector 22, Chandigarh',        severity:'high',   timestamp: new Date(Date.now()-1000*60*18).toISOString(),  source:'SafeRoute Community' },
  { id:2, title:'Road blocked near Industrial Area', description:'A major arterial road near the industrial area is blocked due to a vehicle breakdown. Commuters advised to take alternate routes.', category:'Traffic', location:'Industrial Area Phase 1', severity:'medium', timestamp: new Date(Date.now()-1000*60*45).toISOString(),  source:'SafeRoute Community' },
  { id:3, title:'Heavy rain alert issued for Tricity', description:'IMD has issued a yellow alert for heavy rainfall in Chandigarh, Mohali and Panchkula. Citizens advised to stay indoors when possible.', category:'Weather', location:'Chandigarh Tricity',           severity:'medium', timestamp: new Date(Date.now()-1000*60*120).toISOString(), source:'India Meteorological Dept.' },
  { id:4, title:'Safety alert near Sector 35 bus stand', description:'Multiple reports of suspicious activity near the Sector 35 bus stand after 9 PM. Avoid the area at night if possible.', category:'Alert',   location:'Sector 35, Chandigarh',        severity:'high',   timestamp: new Date(Date.now()-1000*60*200).toISOString(), source:'SafeRoute AI Monitor' },
];

function timeAgo(iso) {
  const d = (Date.now() - new Date(iso)) / 1000;
  if (d < 60) return 'Just now';
  if (d < 3600) return `${Math.floor(d/60)}m ago`;
  if (d < 86400) return `${Math.floor(d/3600)}h ago`;
  return `${Math.floor(d/86400)}d ago`;
}

export default function NewsPage() {
  const [tab,     setTab]     = useState('All');
  const [news,    setNews]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setNews(SEED); setLoading(false); }, 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = tab === 'All' ? news : news.filter(n => n.category === tab);

  return (
    <div className="news-page">

      {/* Header */}
      <div className="news-header">
        <div className="news-header-left">
          <div className="news-header-icon">📰</div>
          <div>
            <h1>Safety News</h1>
            <p>Latest safety updates and alerts</p>
          </div>
        </div>
        <div className="news-live-pill">
          <span className="news-live-dot"/>
          Live
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="news-stats-grid">
          {[
            { label:'Total Alerts',   val: news.length,                                             color:'#e8614d' },
            { label:'High Severity',  val: news.filter(n=>n.severity==='high').length,               color:'#E84545' },
            { label:'Categories',     val: CATEGORIES.length - 1,                                   color:'#8B5CF6' },
            { label:'Last Updated',   val: 'Just now',                                              color:'#22C55E' },
          ].map(s => (
            <div key={s.label} className="news-stat-card">
              <div className="news-stat-val" style={{color:s.color}}>{s.val}</div>
              <div className="news-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="news-tabs">
        {CATEGORIES.map(cat => {
          const m = META[cat];
          return (
            <button key={cat}
              className={`news-tab ${tab===cat?'active':''}`}
              style={tab===cat && m ? {borderColor:`${m.color}66`, background:m.bg, color:m.color} : {}}
              onClick={() => setTab(cat)}>
              {cat === 'All' ? 'All' : `${m?.icon} ${cat}`}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="news-skeleton-list">
          {[1,2,3].map(i => <div key={i} className="news-skeleton"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="news-empty"><div>📰</div><p>No news in this category.</p></div>
      ) : (
        <div className="news-card-list">
          {filtered.map((item, i) => {
            const m = META[item.category] || { color:'#888', bg:'rgba(136,136,136,.1)', icon:'📢' };
            const sevColor = {high:'#e8614d', medium:'#F59E0B', low:'#22C55E'}[item.severity] || '#888';
            return (
              <div key={item.id} className="news-card" style={{'--delay':`${i*0.07}s`}}>
                <div className="news-card-icon" style={{background:m.bg, border:`1px solid ${m.color}33`}}>
                  {m.icon}
                </div>
                <div className="news-card-body">
                  <div className="news-card-top">
                    <span className="news-cat-badge" style={{color:m.color, background:m.bg, border:`1px solid ${m.color}44`}}>
                      {item.category}
                    </span>
                    <span className="news-sev-dot" style={{background:sevColor, boxShadow:`0 0 6px ${sevColor}88`}}/>
                    <span className="news-time">{timeAgo(item.timestamp)}</span>
                  </div>
                  <h3 className="news-card-title">{item.title}</h3>
                  <p className="news-card-desc">{item.description}</p>
                  <div className="news-card-meta">
                    <span>📍 {item.location}</span>
                    <span>· {item.source}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="news-footer">Data sourced from community reports · Updates every 5 minutes</p>
      )}
    </div>
  );
}

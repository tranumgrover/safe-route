import { useState, useEffect } from 'react';
import { sosApi } from '../services/api';
import toast from 'react-hot-toast';
import { Zap, CheckCircle, Clock, MapPin } from 'lucide-react';
import './SosPage.css';

export default function SosPage() {
  const [alerts,  setAlerts]  = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => { sosApi.my().then(r => setAlerts(r.data)).catch(() => {}); }, []);

  const trigger = () => {
    navigator.geolocation?.getCurrentPosition(async pos => {
      setSending(true);
      try {
        const { data } = await sosApi.trigger({
          latitude:  pos.coords.latitude,
          longitude: pos.coords.longitude,
          message:   'Emergency! I need help immediately.',
        });
        setAlerts(prev => [data, ...prev]);
        toast.success('🚨 SOS sent to your emergency contacts!', { duration: 6000 });
      } catch { toast.error('SOS failed — check your contacts'); }
      finally  { setSending(false); }
    }, () => { toast.error('Enable location to send SOS'); setSending(false); });
  };

  const resolve = async id => {
    try {
      const { data } = await sosApi.resolve(id);
      setAlerts(prev => prev.map(a => a.id === id ? data : a));
      toast.success('Alert resolved');
    } catch { toast.error('Failed to resolve'); }
  };

  return (
    <div className="sos-page">

      {/* Header */}
      <div className="sos-header">
        <div className="sos-header-icon"><Zap size={22}/></div>
        <div>
          <h1>SOS Alerts</h1>
          <p>Send emergency alerts to your contacts</p>
        </div>
      </div>

      {/* Hero trigger card */}
      <div className="sos-hero-card">
        <div className="sos-hero-bg"/>
        <div className="sos-alarm-icon">🚨</div>
        <h2>Emergency SOS</h2>
        <p>Instantly alerts all your emergency contacts with your live location</p>
        <button className={`sos-trigger-btn ${sending ? 'sending' : ''}`}
          onClick={trigger} disabled={sending}>
          <Zap size={22}/>
          {sending ? 'Sending Alert…' : 'SEND SOS NOW'}
        </button>
        <div className="sos-helplines">
          <span>Police <strong>100</strong></span>
          <span>Women Helpline <strong>1091</strong></span>
          <span>Emergency <strong>112</strong></span>
        </div>
      </div>

      {/* Alert history */}
      <div className="sos-history-header">
        <span>ALERT HISTORY</span>
        <span className="sos-count">{alerts.length} total</span>
      </div>

      {alerts.length === 0 ? (
        <div className="sos-empty">
          <div className="sos-empty-icon">🔔</div>
          <div>No SOS alerts sent yet.</div>
          <div className="sos-empty-sub">Your alert history will appear here</div>
        </div>
      ) : (
        <div className="sos-alert-list">
          {alerts.map(a => (
            <div key={a.id} className={`sos-alert-card ${a.status === 'ACTIVE' ? 'active' : 'resolved'}`}>
              <div className="sos-alert-left">
                <div className="sos-alert-num">#{a.id}</div>
                <div className="sos-alert-badge" style={{
                  background: a.status === 'ACTIVE' ? 'rgba(232,97,77,.15)' : 'rgba(61,214,140,.15)',
                  color:      a.status === 'ACTIVE' ? '#e8614d' : '#3dd68c',
                  border:     `1px solid ${a.status === 'ACTIVE' ? 'rgba(232,97,77,.3)' : 'rgba(61,214,140,.3)'}`,
                }}>
                  {a.status === 'ACTIVE' ? '🔴' : '✅'} {a.status}
                </div>
              </div>
              <div className="sos-alert-info">
                {a.message && <div className="sos-alert-msg">{a.message}</div>}
                <div className="sos-alert-meta">
                  <span><MapPin size={10}/> {a.latitude?.toFixed(4)}, {a.longitude?.toFixed(4)}</span>
                  <span><Clock size={10}/> {new Date(a.createdAt).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
                </div>
              </div>
              {a.status === 'ACTIVE' && (
                <button className="sos-resolve-btn" onClick={() => resolve(a.id)}>
                  <CheckCircle size={14}/> Resolve
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

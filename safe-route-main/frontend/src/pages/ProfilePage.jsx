import { useState, useEffect } from 'react';
import { userApi, incidentApi, sosApi } from '../services/api';
import toast from 'react-hot-toast';
import { User, Phone, Mail, Shield, AlertTriangle, Zap, Plus, Trash2, Edit3, Check, X, ChevronRight, Lock } from 'lucide-react';
import './ProfilePage.css';

export default function ProfilePage() {
  const [profile,   setProfile]   = useState(null);
  const [contacts,  setContacts]  = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [alerts,    setAlerts]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editing,   setEditing]   = useState(false);
  const [form,      setForm]      = useState({ name:'', phone:'' });
  const [saving,    setSaving]    = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name:'', phone:'', relation:'' });
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwd, setPwd] = useState({ current:'', next:'', confirm:'' });

  useEffect(() => {
    Promise.all([
      userApi.profile(),
      incidentApi.my(),
      sosApi.my(),
    ]).then(([p, inc, sos]) => {
      setProfile(p.data);
      setContacts(p.data.emergencyContacts || []);
      setForm({ name: p.data.name || '', phone: p.data.phone || '' });
      setIncidents(inc.data || []);
      setAlerts(sos.data || []);
    }).catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      // update localStorage display name
      const stored = localStorage.getItem('user');
      if (stored) localStorage.setItem('user', JSON.stringify({ ...JSON.parse(stored), ...form }));
      setProfile(p => ({ ...p, ...form }));
      setEditing(false);
      toast.success('Profile updated');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const addContact = async e => {
    e.preventDefault();
    try {
      const { data } = await userApi.addContact(contactForm);
      setContacts(prev => [...prev, data]);
      setContactForm({ name:'', phone:'', relation:'' });
      setShowAddContact(false);
      toast.success('Contact added');
    } catch { toast.error('Failed to add'); }
  };

  const deleteContact = async id => {
    try {
      await userApi.deleteContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
      toast.success('Contact removed');
    } catch { toast.error('Failed to remove'); }
  };

  const initial = (profile?.name || 'U')[0]?.toUpperCase();
  const openCount   = incidents.filter(i => i.status === 'OPEN').length;
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE').length;

  const tabs = [
    { id:'overview',  label:'Overview',  icon: User },
    { id:'contacts',  label:'Emergency Contacts', icon: Phone },
    { id:'activity',  label:'My Activity', icon: AlertTriangle },
    { id:'security',  label:'Security',  icon: Lock },
  ];

  if (loading) return (
    <div className="prof-loading">
      <div className="prof-spinner" />
      <p>Loading profile…</p>
    </div>
  );

  return (
    <div className="prof-page">

      {/* ── HERO BANNER ── */}
      <div className="prof-hero">
        <div className="prof-hero-bg" />
        <div className="prof-hero-content">
          <div className="prof-avatar-ring">
            <div className="prof-avatar">{initial}</div>
            <div className="prof-avatar-status" />
          </div>
          <div className="prof-hero-info">
            {editing ? (
              <div className="prof-edit-row">
                <input className="prof-edit-input" value={form.name}
                  onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="Your name"/>
                <input className="prof-edit-input" value={form.phone}
                  onChange={e => setForm(f=>({...f,phone:e.target.value}))} placeholder="Phone number"/>
                <button className="prof-save-btn" onClick={saveProfile} disabled={saving}>
                  <Check size={14}/> {saving?'Saving…':'Save'}
                </button>
                <button className="prof-cancel-btn" onClick={()=>setEditing(false)}>
                  <X size={14}/>
                </button>
              </div>
            ) : (
              <>
                <h1 className="prof-name">{profile?.name}</h1>
                <p className="prof-email"><Mail size={13}/> {profile?.email}</p>
                {profile?.phone && <p className="prof-phone"><Phone size={13}/> {profile?.phone}</p>}
                <div className="prof-badges">
                  <span className="prof-badge badge-active">● Active</span>
                  <span className="prof-badge badge-role">{profile?.role}</span>
                </div>
              </>
            )}
          </div>
          {!editing && (
            <button className="prof-edit-trigger" onClick={()=>setEditing(true)}>
              <Edit3 size={14}/> Edit
            </button>
          )}
        </div>

        {/* STAT PILLS */}
        <div className="prof-stats">
          <div className="prof-stat">
            <div className="prof-stat-val" style={{color:'#e8614d'}}>{incidents.length}</div>
            <div className="prof-stat-label">Incidents</div>
          </div>
          <div className="prof-stat-div"/>
          <div className="prof-stat">
            <div className="prof-stat-val" style={{color:'#f5a623'}}>{alerts.length}</div>
            <div className="prof-stat-label">SOS Alerts</div>
          </div>
          <div className="prof-stat-div"/>
          <div className="prof-stat">
            <div className="prof-stat-val" style={{color:'#3dd68c'}}>{contacts.length}</div>
            <div className="prof-stat-label">Contacts</div>
          </div>
          <div className="prof-stat-div"/>
          <div className="prof-stat">
            <div className="prof-stat-val" style={{color:'#378ADD'}}>{openCount}</div>
            <div className="prof-stat-label">Open Cases</div>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="prof-tabs">
        {tabs.map(t => (
          <button key={t.id}
            className={`prof-tab ${activeTab===t.id?'prof-tab-active':''}`}
            onClick={()=>setActiveTab(t.id)}>
            <t.icon size={14}/>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="prof-body">

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab==='overview' && (
          <div className="prof-tab-content">
            {/* Quick actions */}
            <div className="prof-section-title">Quick Actions</div>
            <div className="prof-actions-grid">
              <button className="prof-action-card" onClick={()=>setActiveTab('contacts')}>
                <div className="prof-action-icon" style={{background:'rgba(232,97,77,.12)',color:'#e8614d'}}>
                  <Phone size={18}/>
                </div>
                <div className="prof-action-text">
                  <div className="prof-action-label">Emergency Contacts</div>
                  <div className="prof-action-sub">{contacts.length} saved</div>
                </div>
                <ChevronRight size={16} className="prof-action-arrow"/>
              </button>
              <button className="prof-action-card" onClick={()=>setActiveTab('activity')}>
                <div className="prof-action-icon" style={{background:'rgba(245,166,35,.12)',color:'#f5a623'}}>
                  <AlertTriangle size={18}/>
                </div>
                <div className="prof-action-text">
                  <div className="prof-action-label">Incident History</div>
                  <div className="prof-action-sub">{openCount} open</div>
                </div>
                <ChevronRight size={16} className="prof-action-arrow"/>
              </button>
              <button className="prof-action-card" onClick={()=>setActiveTab('activity')}>
                <div className="prof-action-icon" style={{background:'rgba(232,97,77,.12)',color:'#e8614d'}}>
                  <Zap size={18}/>
                </div>
                <div className="prof-action-text">
                  <div className="prof-action-label">SOS History</div>
                  <div className="prof-action-sub">{activeAlerts} active</div>
                </div>
                <ChevronRight size={16} className="prof-action-arrow"/>
              </button>
              <button className="prof-action-card" onClick={()=>setActiveTab('security')}>
                <div className="prof-action-icon" style={{background:'rgba(55,138,221,.12)',color:'#378ADD'}}>
                  <Shield size={18}/>
                </div>
                <div className="prof-action-text">
                  <div className="prof-action-label">Security</div>
                  <div className="prof-action-sub">Change password</div>
                </div>
                <ChevronRight size={16} className="prof-action-arrow"/>
              </button>
            </div>

            {/* Safety score card */}
            <div className="prof-section-title" style={{marginTop:28}}>Safety Overview</div>
            <div className="prof-safety-card">
              <div className="prof-safety-row">
                <div className="prof-safety-item">
                  <div className="prof-safety-num" style={{color:'#3dd68c'}}>{incidents.filter(i=>i.status==='RESOLVED').length}</div>
                  <div className="prof-safety-label">Resolved incidents</div>
                  <div className="prof-safety-bar"><div className="prof-safety-fill" style={{width:`${incidents.length?Math.round(incidents.filter(i=>i.status==='RESOLVED').length/incidents.length*100):0}%`,background:'#3dd68c'}}/></div>
                </div>
                <div className="prof-safety-item">
                  <div className="prof-safety-num" style={{color:'#f5a623'}}>{incidents.filter(i=>i.status==='OPEN').length}</div>
                  <div className="prof-safety-label">Open incidents</div>
                  <div className="prof-safety-bar"><div className="prof-safety-fill" style={{width:`${incidents.length?Math.round(incidents.filter(i=>i.status==='OPEN').length/incidents.length*100):0}%`,background:'#f5a623'}}/></div>
                </div>
                <div className="prof-safety-item">
                  <div className="prof-safety-num" style={{color:'#e8614d'}}>{alerts.filter(a=>a.status==='ACTIVE').length}</div>
                  <div className="prof-safety-label">Active SOS</div>
                  <div className="prof-safety-bar"><div className="prof-safety-fill" style={{width:`${alerts.length?Math.round(alerts.filter(a=>a.status==='ACTIVE').length/alerts.length*100):0}%`,background:'#e8614d'}}/></div>
                </div>
              </div>
            </div>

            {/* Recent incidents preview */}
            {incidents.length > 0 && <>
              <div className="prof-section-title" style={{marginTop:28}}>Recent Incidents</div>
              <div className="prof-recent-list">
                {incidents.slice(0,3).map(i => (
                  <div key={i.id} className="prof-recent-row">
                    <div className="prof-recent-icon" style={{
                      background: i.severity==='HIGH'?'rgba(232,97,77,.12)':i.severity==='MEDIUM'?'rgba(245,166,35,.12)':'rgba(61,214,140,.12)',
                      color: i.severity==='HIGH'?'#e8614d':i.severity==='MEDIUM'?'#f5a623':'#3dd68c',
                    }}>
                      <AlertTriangle size={13}/>
                    </div>
                    <div className="prof-recent-info">
                      <div className="prof-recent-type">{i.incidentType}</div>
                      <div className="prof-recent-date">{new Date(i.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                    </div>
                    <span className="prof-recent-status" style={{
                      color: i.status==='OPEN'?'#f5a623':'#3dd68c',
                      background: i.status==='OPEN'?'rgba(245,166,35,.1)':'rgba(61,214,140,.1)',
                    }}>{i.status}</span>
                  </div>
                ))}
              </div>
            </>}
          </div>
        )}

        {/* ══ CONTACTS TAB ══ */}
        {activeTab==='contacts' && (
          <div className="prof-tab-content">
            <div className="prof-tab-header">
              <div>
                <div className="prof-section-title" style={{margin:0}}>Emergency Contacts</div>
                <p className="prof-section-sub">They'll be notified automatically during SOS alerts</p>
              </div>
              <button className="prof-add-btn" onClick={()=>setShowAddContact(!showAddContact)}>
                {showAddContact?<><X size={13}/> Cancel</>:<><Plus size={13}/> Add Contact</>}
              </button>
            </div>

            {showAddContact && (
              <form onSubmit={addContact} className="prof-contact-form">
                <div className="prof-contact-form-title"><Plus size={13}/> New Emergency Contact</div>
                <div className="prof-form-grid">
                  <div className="prof-field">
                    <label>Full Name</label>
                    <input placeholder="Contact name" value={contactForm.name}
                      onChange={e=>setContactForm(f=>({...f,name:e.target.value}))} required/>
                  </div>
                  <div className="prof-field">
                    <label>Phone Number</label>
                    <input placeholder="9876543210" value={contactForm.phone}
                      onChange={e=>setContactForm(f=>({...f,phone:e.target.value}))} required/>
                  </div>
                </div>
                <div className="prof-field">
                  <label>Relation</label>
                  <div className="prof-relation-grid">
                    {['Mother','Father','Sister','Brother','Friend','Partner','Other'].map(r => (
                      <button type="button" key={r}
                        className={`prof-relation-btn ${contactForm.relation===r?'active':''}`}
                        onClick={()=>setContactForm(f=>({...f,relation:r}))}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="prof-submit-btn">
                  <Check size={14}/> Save Contact
                </button>
              </form>
            )}

            <div className="prof-contacts-list">
              {contacts.length===0 && (
                <div className="prof-empty">
                  <Phone size={28} style={{opacity:.3}}/>
                  <div>No emergency contacts yet</div>
                  <div style={{fontSize:12,opacity:.4,marginTop:4}}>Add contacts to notify during SOS</div>
                </div>
              )}
              {contacts.map((c,idx) => (
                <div key={c.id} className="prof-contact-card" style={{'--delay':`${idx*0.06}s`}}>
                  <div className="prof-contact-avatar">{c.name?.[0]?.toUpperCase()}</div>
                  <div className="prof-contact-info">
                    <div className="prof-contact-name">{c.name}</div>
                    <div className="prof-contact-phone"><Phone size={11}/> {c.phone}</div>
                    {c.relation && <div className="prof-contact-relation">{c.relation}</div>}
                  </div>
                  <div className="prof-contact-actions">
                    <a href={`tel:${c.phone}`} className="prof-contact-call">📞</a>
                    <button className="prof-contact-del" onClick={()=>deleteContact(c.id)}>
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ ACTIVITY TAB ══ */}
        {activeTab==='activity' && (
          <div className="prof-tab-content">
            <div className="prof-activity-split">
              <div>
                <div className="prof-section-title">Incident History</div>
                <div className="prof-activity-list">
                  {incidents.length===0 && <div className="prof-empty"><AlertTriangle size={24} style={{opacity:.3}}/><div>No incidents yet</div></div>}
                  {incidents.map(i => (
                    <div key={i.id} className="prof-activity-card">
                      <div className="prof-activity-top">
                        <span className="prof-activity-type">{i.incidentType}</span>
                        <div style={{display:'flex',gap:6}}>
                          <span className="prof-mini-badge" style={{
                            color:i.severity==='HIGH'?'#e8614d':i.severity==='MEDIUM'?'#f5a623':'#3dd68c',
                            background:i.severity==='HIGH'?'rgba(232,97,77,.12)':i.severity==='MEDIUM'?'rgba(245,166,35,.12)':'rgba(61,214,140,.12)',
                          }}>{i.severity}</span>
                          <span className="prof-mini-badge" style={{
                            color:i.status==='OPEN'?'#f5a623':'#3dd68c',
                            background:i.status==='OPEN'?'rgba(245,166,35,.1)':'rgba(61,214,140,.1)',
                          }}>{i.status}</span>
                        </div>
                      </div>
                      {i.description && <p className="prof-activity-desc">{i.description.substring(0,90)}{i.description.length>90?'…':''}</p>}
                      <div className="prof-activity-meta">
                        {new Date(i.createdAt).toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="prof-section-title">SOS Alert History</div>
                <div className="prof-activity-list">
                  {alerts.length===0 && <div className="prof-empty"><Zap size={24} style={{opacity:.3}}/><div>No SOS alerts sent</div></div>}
                  {alerts.map(a => (
                    <div key={a.id} className="prof-activity-card prof-sos-card">
                      <div className="prof-activity-top">
                        <span className="prof-activity-type" style={{color:'#e8614d'}}>🚨 SOS Alert #{a.id}</span>
                        <span className="prof-mini-badge" style={{
                          color:a.status==='ACTIVE'?'#e8614d':'#3dd68c',
                          background:a.status==='ACTIVE'?'rgba(232,97,77,.12)':'rgba(61,214,140,.12)',
                        }}>{a.status}</span>
                      </div>
                      {a.message && <p className="prof-activity-desc">{a.message}</p>}
                      <div className="prof-activity-meta">
                        📍 {a.latitude?.toFixed(4)}, {a.longitude?.toFixed(4)} · {new Date(a.createdAt).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ SECURITY TAB ══ */}
        {activeTab==='security' && (
          <div className="prof-tab-content">
            <div className="prof-section-title">Security Settings</div>
            <div className="prof-security-list">
              <div className="prof-security-card">
                <div className="prof-security-icon"><Lock size={18}/></div>
                <div className="prof-security-info">
                  <div className="prof-security-label">Password</div>
                  <div className="prof-security-sub">Last changed: never · Use a strong password</div>
                </div>
                <button className="prof-security-btn" onClick={()=>setShowPwdModal(true)}>Change</button>
              </div>
              <div className="prof-security-card">
                <div className="prof-security-icon"><Shield size={18}/></div>
                <div className="prof-security-info">
                  <div className="prof-security-label">Account Role</div>
                  <div className="prof-security-sub">Your current access level</div>
                </div>
                <span className="prof-mini-badge" style={{color:'#378ADD',background:'rgba(55,138,221,.12)'}}>{profile?.role}</span>
              </div>
              <div className="prof-security-card">
                <div className="prof-security-icon"><Mail size={18}/></div>
                <div className="prof-security-info">
                  <div className="prof-security-label">Email Address</div>
                  <div className="prof-security-sub">{profile?.email}</div>
                </div>
                <span className="prof-mini-badge" style={{color:'#3dd68c',background:'rgba(61,214,140,.12)'}}>Verified</span>
              </div>
            </div>

            <div className="prof-section-title" style={{marginTop:28}}>Danger Zone</div>
            <div className="prof-danger-card">
              <div>
                <div className="prof-security-label">Delete Account</div>
                <div className="prof-security-sub" style={{marginTop:4}}>This will permanently delete all your data</div>
              </div>
              <button className="prof-delete-btn" onClick={()=>toast.error('Contact admin to delete account')}>
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PASSWORD MODAL */}
      {showPwdModal && (
        <div className="prof-modal-overlay" onClick={()=>setShowPwdModal(false)}>
          <div className="prof-modal" onClick={e=>e.stopPropagation()}>
            <div className="prof-modal-header">
              <div className="prof-modal-icon"><Lock size={18}/></div>
              <div><h3>Change Password</h3><p>Choose a strong password</p></div>
              <button className="prof-modal-close" onClick={()=>setShowPwdModal(false)}><X size={16}/></button>
            </div>
            <div className="prof-modal-body">
              {['current','next','confirm'].map((k,i) => (
                <div className="prof-field" key={k}>
                  <label>{['Current password','New password','Confirm new password'][i]}</label>
                  <input type="password" placeholder="••••••••"
                    value={pwd[k]} onChange={e=>setPwd(p=>({...p,[k]:e.target.value}))}/>
                </div>
              ))}
              <button className="prof-submit-btn" style={{marginTop:8}} onClick={()=>{
                if(pwd.next!==pwd.confirm) return toast.error('Passwords do not match');
                if(pwd.next.length<6) return toast.error('Min 6 characters');
                toast.success('Password change coming soon — backend endpoint needed');
                setShowPwdModal(false); setPwd({current:'',next:'',confirm:''});
              }}>
                <Check size={14}/> Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
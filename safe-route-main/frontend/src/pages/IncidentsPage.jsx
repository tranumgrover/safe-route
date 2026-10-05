import { useState, useEffect } from "react";

const INCIDENT_TYPES = ["All", "Harassment", "Theft", "Unsafe Area", "Poor Lighting", "Other"];

const TYPE_META = {
  Harassment:    { color: "#E84545", bg: "rgba(232,69,69,0.1)",    icon: "🚨" },
  Theft:         { color: "#F97316", bg: "rgba(249,115,22,0.1)",   icon: "🔓" },
  "Unsafe Area": { color: "#EAB308", bg: "rgba(234,179,8,0.1)",    icon: "⚠️" },
  "Poor Lighting": { color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", icon: "💡" },
  Other:         { color: "#6B7280", bg: "rgba(107,114,128,0.1)",  icon: "📋" },
};

function timeAgo(isoString) {
  const diff = (Date.now() - new Date(isoString)) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function EmptyState({ onReport }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "80px 24px", gap: 16,
    }}>
      <div style={{
        width: 80, height: 80,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 36,
      }}>🛡️</div>
      <div style={{ textAlign: "center" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600, color: "#fff" }}>
          All clear in your area
        </h3>
        <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.35)", maxWidth: 280 }}>
          No incidents reported yet. Be the first to keep your community safe.
        </p>
      </div>
      <button
        onClick={onReport}
        style={{
          marginTop: 8,
          background: "#E8635A",
          border: "none",
          borderRadius: 10,
          padding: "12px 28px",
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        + Report an Incident
      </button>
    </div>
  );
}

function ReportModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ title: "", type: "Harassment", location: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.title || !form.location) return;
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: 24,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#16161a",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 18,
        padding: 28,
        width: "100%", maxWidth: 500,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Report Incident</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        {[
          { key: "title", label: "Incident Title", placeholder: "Brief description of the incident" },
          { key: "location", label: "Location", placeholder: "e.g. Sector 22, near the market" },
        ].map(({ key, label, placeholder }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
            <input
              value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, padding: "10px 14px",
                color: "#fff", fontSize: 14, outline: "none",
              }}
              onFocus={e => { e.target.style.borderColor = "#E8635A"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Incident Type</label>
          <select
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, padding: "10px 14px",
              color: "#fff", fontSize: 14, outline: "none",
            }}
          >
            {INCIDENT_TYPES.filter(t => t !== "All").map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Details (optional)</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Describe what happened…"
            rows={3}
            style={{
              width: "100%", boxSizing: "border-box",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, padding: "10px 14px",
              color: "#fff", fontSize: 14, outline: "none",
              resize: "vertical",
            }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !form.title || !form.location}
          style={{
            width: "100%",
            background: "#E8635A",
            border: "none",
            borderRadius: 10, padding: "13px",
            color: "#fff", fontSize: 15, fontWeight: 600,
            cursor: submitting || !form.title || !form.location ? "not-allowed" : "pointer",
            opacity: submitting || !form.title || !form.location ? 0.6 : 1,
          }}
        >
          {submitting ? "Submitting…" : "Submit Report"}
        </button>
      </div>
    </div>
  );
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await fetch("/api/incidents", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setIncidents(Array.isArray(data) ? data : data.incidents || []);
      } catch {
        // Use empty array; real incidents come from the DB
        setIncidents([]);
      } finally {
        setLoading(false);
      }
    };
    loadIncidents();
  }, []);

  const handleSubmitIncident = async (form) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: form.title,
          type: form.type,
          location: form.location,
          description: form.description,
          timestamp: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        const newIncident = await res.json();
        setIncidents(prev => [newIncident, ...prev]);
      } else {
        // Optimistic UI fallback
        setIncidents(prev => [{
          id: Date.now(),
          ...form,
          timestamp: new Date().toISOString(),
          severity: "medium",
        }, ...prev]);
      }
    } catch {
      setIncidents(prev => [{
        id: Date.now(),
        ...form,
        timestamp: new Date().toISOString(),
        severity: "medium",
      }, ...prev]);
    }
  };

  const filtered = filter === "All" ? incidents : incidents.filter(i => i.type === filter);

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0f", color: "#fff" }}>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 52, height: 52,
              background: "rgba(232,69,69,0.1)",
              border: "1px solid rgba(232,69,69,0.2)",
              borderRadius: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24,
            }}>⚠️</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>Incident Reports</h1>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                Report unsafe incidents to help keep others safe
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            style={{
              background: "#E8635A",
              border: "none",
              borderRadius: 10,
              padding: "12px 22px",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            + Report Incident
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {INCIDENT_TYPES.map(type => {
            const meta = TYPE_META[type];
            const isActive = filter === type;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 20,
                  border: isActive
                    ? `1px solid ${meta ? meta.color + "66" : "#E8635A66"}`
                    : "1px solid rgba(255,255,255,0.1)",
                  background: isActive
                    ? meta ? meta.bg : "rgba(232,99,90,0.15)"
                    : "rgba(255,255,255,0.03)",
                  color: isActive
                    ? meta ? meta.color : "#E8635A"
                    : "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {meta ? `${meta.icon} ${type}` : type}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[1, 2].map(i => (
              <div key={i} style={{
                height: 90,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14,
                animation: "shimmer 1.4s infinite",
                animationDelay: `${i * 0.15}s`,
              }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onReport={() => setShowModal(true)} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((item, idx) => {
              const meta = TYPE_META[item.type] || TYPE_META["Other"];
              return (
                <div key={item.id || idx} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14,
                  padding: "18px 22px",
                  display: "flex",
                  gap: 16,
                  transition: "background 0.15s",
                  animation: "fadeSlideIn 0.3s ease both",
                  animationDelay: `${idx * 0.06}s`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: 11,
                    background: meta.bg,
                    border: `1px solid ${meta.color}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, flexShrink: 0, marginTop: 2,
                  }}>
                    {meta.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 6 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
                        textTransform: "uppercase", color: meta.color,
                        background: meta.bg, padding: "2px 9px",
                        borderRadius: 20, border: `1px solid ${meta.color}33`,
                      }}>
                        {item.type}
                      </span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                        {timeAgo(item.timestamp || item.createdAt)}
                      </span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{item.title}</div>
                    {item.description && (
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 6, lineHeight: 1.5 }}>
                        {item.description}
                      </div>
                    )}
                    {item.location && (
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>📍 {item.location}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && <ReportModal onClose={() => setShowModal(false)} onSubmit={handleSubmitIncident} />}

      <style>{`
        @keyframes shimmer { 0%,100% { opacity:.4 } 50% { opacity:.7 } }
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );
}
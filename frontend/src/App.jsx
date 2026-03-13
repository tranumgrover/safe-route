import { useEffect, useMemo, useState } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || "";

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });

  return null;
}

function App() {
  const [unsafeZones, setUnsafeZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);

  const [reportForm, setReportForm] = useState({
    title: "",
    level: "Medium Risk",
    radius: 500,
    description: "",
  });

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const defaultCenter = [23.97, 88.45];

  const fetchUnsafeZones = async () => {
    try {
      setLoadingZones(true);

      const response = await axios.get(`${API_URL}/unsafe-zones`);

      const formattedZones = response.data.map((zone) => ({
        id: zone._id,
        title: zone.title,
        level: zone.level,
        radius: zone.radius,
        description: zone.description,
        center: [zone.latitude, zone.longitude],
      }));

      setUnsafeZones(formattedZones);
    } catch (error) {
      console.error("Error loading unsafe zones:", error);
    } finally {
      setLoadingZones(false);
    }
  };

  useEffect(() => {
    fetchUnsafeZones();
  }, []);

  const handleMapClick = (latlng) => {
    setSelectedPoint(latlng);
  };

  const handleSaveReport = async () => {
    try {
      if (!selectedPoint) {
        alert("Please click on the map first.");
        return;
      }

      if (!reportForm.title.trim()) {
        alert("Please enter a report title.");
        return;
      }

      const payload = {
        title: reportForm.title,
        level: reportForm.level,
        latitude: selectedPoint.lat,
        longitude: selectedPoint.lng,
        radius: Number(reportForm.radius),
        description: reportForm.description,
      };

      await axios.post(`${API_URL}/unsafe-zones`, payload, {
  headers: {
    "x-admin-key": ADMIN_KEY,
  },
});

      alert("Unsafe zone saved successfully.");

      setReportForm({
        title: "",
        level: "Medium Risk",
        radius: 500,
        description: "",
      });

      setSelectedPoint(null);
      fetchUnsafeZones();
    } catch (error) {
      console.error("Error saving unsafe zone:", error);
      alert("Failed to save unsafe zone.");
    }
  };

  const getCoordinates = async (place) => {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        place
      )}`
    );

    if (!response.data || response.data.length === 0) {
      throw new Error(`Location not found: ${place}`);
    }

    return [
      parseFloat(response.data[0].lat),
      parseFloat(response.data[0].lon),
    ];
  };

  const getDistanceMeters = (a, b) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371000;

    const dLat = toRad(b[0] - a[0]);
    const dLon = toRad(b[1] - a[1]);
    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);

    const x =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return R * y;
  };

  const calculateSafetyScore = (coords) => {
    if (!coords.length) return 100;

    let penalty = 0;

    coords.forEach((point) => {
      unsafeZones.forEach((zone) => {
        const dist = getDistanceMeters(point, zone.center);

        if (dist < zone.radius) {
          if (zone.level === "High Risk") penalty += 6;
          else if (zone.level === "Medium Risk") penalty += 4;
          else penalty += 3;
        } else if (dist < zone.radius + 200) {
          if (zone.level === "High Risk") penalty += 3;
          else if (zone.level === "Medium Risk") penalty += 2;
          else penalty += 1;
        }
      });
    });

    return Math.max(20, 100 - penalty);
  };

  const handleFindRoute = async () => {
    try {
      setLoadingRoute(true);
      setRoutes([]);
      setRouteInfo(null);

      const startPoint = await getCoordinates(start);
      const endPoint = await getCoordinates(end);

      setStartCoords(startPoint);
      setEndCoords(endPoint);

      const startLon = startPoint[1];
      const startLat = startPoint[0];
      const endLon = endPoint[1];
      const endLat = endPoint[0];

      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson&alternatives=true&steps=false`
      );

      const foundRoutes = response.data.routes.map((route, index) => {
        const coords = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
        const safetyScore = calculateSafetyScore(coords);

        return {
          id: index,
          coords,
          distanceKm: (route.distance / 1000).toFixed(2),
          durationMin: Math.ceil(route.duration / 60),
          safetyScore,
        };
      });

      foundRoutes.sort((a, b) => b.safetyScore - a.safetyScore);

      setRoutes(foundRoutes);
      setRouteInfo(foundRoutes[0]);
    } catch (error) {
      console.error("Error finding route:", error);
      alert("Failed to find route.");
    } finally {
      setLoadingRoute(false);
    }
  };

  const selectedLocationText = useMemo(() => {
    if (!selectedPoint) return "Click on map to select location";
    return `${selectedPoint.lat.toFixed(5)}, ${selectedPoint.lng.toFixed(5)}`;
  }, [selectedPoint]);

  const getZoneColor = (level) => {
    if (level === "High Risk") return "#ef4444";
    if (level === "Medium Risk") return "#f59e0b";
    return "#eab308";
  };

  const getRouteColor = (index, score) => {
    if (index === 0) return "#22c55e";
    if (score >= 70) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        background: "#0b1120",
      }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <MapClickHandler onMapClick={handleMapClick} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {unsafeZones.map((zone) => (
          <Circle
            key={zone.id}
            center={zone.center}
            radius={zone.radius}
            pathOptions={{
              color: getZoneColor(zone.level),
              fillOpacity: 0.25,
            }}
          >
            <Popup>
              <div>
                <strong>{zone.title}</strong>
                <br />
                {zone.level}
                <br />
                {zone.description || "No description"}
              </div>
            </Popup>
          </Circle>
        ))}

        {selectedPoint && (
          <Marker position={[selectedPoint.lat, selectedPoint.lng]}>
            <Popup>Selected location</Popup>
          </Marker>
        )}

        {startCoords && (
          <Marker position={startCoords}>
            <Popup>Start</Popup>
          </Marker>
        )}

        {endCoords && (
          <Marker position={endCoords}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        {routes.map((route, index) => (
          <Polyline
            key={route.id}
            positions={route.coords}
            pathOptions={{
              color: getRouteColor(index, route.safetyScore),
              weight: index === 0 ? 7 : 4,
              opacity: index === 0 ? 1 : 0.6,
            }}
          />
        ))}
      </MapContainer>

      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 1000,
          width: "380px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "20px",
          borderRadius: "22px",
          background: "rgba(10, 14, 25, 0.78)",
          backdropFilter: "blur(14px)",
          color: "white",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "30px", fontWeight: "800" }}>
          SafeRoute
        </h1>

        <p style={{ marginTop: "8px", color: "#cbd5e1", fontSize: "14px" }}>
          Find the safest route and report unsafe areas
        </p>

        <div
          style={{
            marginTop: "18px",
            padding: "16px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ fontWeight: "700", marginBottom: "10px" }}>
            Find Safe Route
          </div>

          <input
            type="text"
            placeholder="Start location"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Destination"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            style={{ ...inputStyle, marginTop: "12px" }}
          />

          <button onClick={handleFindRoute} style={buttonStyle}>
            {loadingRoute ? "Finding Route..." : "Find Safe Route"}
          </button>

          {routeInfo && (
            <div
              style={{
                marginTop: "14px",
                padding: "12px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <div style={{ fontWeight: "700" }}>Best Route</div>
              <div style={{ marginTop: "6px", fontSize: "14px", color: "#dbe2ea" }}>
                Distance: {routeInfo.distanceKm} km
              </div>
              <div style={{ marginTop: "4px", fontSize: "14px", color: "#dbe2ea" }}>
                Duration: {routeInfo.durationMin} min
              </div>
              <div style={{ marginTop: "4px", fontSize: "14px", color: "#22c55e" }}>
                Safety Score: {routeInfo.safetyScore}/100
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: "18px",
            padding: "16px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ fontWeight: "700", marginBottom: "10px" }}>
            Report Unsafe Area
          </div>

          <div
            style={{
              fontSize: "13px",
              color: "#cbd5e1",
              marginBottom: "10px",
            }}
          >
            {selectedLocationText}
          </div>

          <input
            type="text"
            placeholder="Report title"
            value={reportForm.title}
            onChange={(e) =>
              setReportForm((prev) => ({ ...prev, title: e.target.value }))
            }
            style={inputStyle}
          />

          <select
            value={reportForm.level}
            onChange={(e) =>
              setReportForm((prev) => ({ ...prev, level: e.target.value }))
            }
            style={{ ...inputStyle, marginTop: "12px" }}
          >
            <option value="High Risk">High Risk</option>
            <option value="Medium Risk">Medium Risk</option>
            <option value="Low Lighting">Low Lighting</option>
          </select>

          <input
            type="number"
            placeholder="Radius"
            value={reportForm.radius}
            onChange={(e) =>
              setReportForm((prev) => ({
                ...prev,
                radius: e.target.value,
              }))
            }
            style={{ ...inputStyle, marginTop: "12px" }}
          />

          <textarea
            rows="3"
            placeholder="Description"
            value={reportForm.description}
            onChange={(e) =>
              setReportForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            style={{
              ...inputStyle,
              marginTop: "12px",
              resize: "none",
              fontFamily: "inherit",
            }}
          />

          <button onClick={handleSaveReport} style={buttonStyle}>
            Save Unsafe Report
          </button>
        </div>

        <div
          style={{
            marginTop: "14px",
            fontSize: "13px",
            color: "#94a3b8",
          }}
        >
          {loadingZones
            ? "Loading unsafe zones..."
            : `Unsafe zones loaded: ${unsafeZones.length}`}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: "20px",
          top: "20px",
          zIndex: 1000,
          width: "220px",
          padding: "18px",
          borderRadius: "20px",
          background: "rgba(10, 14, 25, 0.74)",
          backdropFilter: "blur(14px)",
          color: "white",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ fontWeight: "800", marginBottom: "10px" }}>Legend</div>
        <div style={{ fontSize: "14px", color: "#dbe2ea", lineHeight: 1.9 }}>
          <div>🔴 High-risk zone</div>
          <div>🟠 Medium-risk zone</div>
          <div>🟡 Low-light area</div>
          <div>🟢 Best route</div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "13px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  outline: "none",
  boxSizing: "border-box",
  fontSize: "14px",
};

const buttonStyle = {
  width: "100%",
  marginTop: "14px",
  padding: "13px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(90deg, #16a34a, #22c55e)",
  color: "white",
  fontWeight: "800",
  cursor: "pointer",
  fontSize: "15px",
};

export default App;
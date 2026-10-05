import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Navbar from './components/common/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import MapPage from './pages/MapPage';
import IncidentsPage from './pages/IncidentsPage';
import SosPage from './pages/SosPage';
import ProfilePage from './pages/ProfilePage';
import SafeZonesPage from './pages/SafeZonesPage';
import NewsPage from './pages/NewsPage';
import './styles/global.css';

function Protected({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {/* ✅ ONE LINE FIX: pushes all page content below the 60px fixed navbar */}
      <div style={{ paddingTop: '60px', minHeight: '100vh' }}>
        {children}
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a1e28', color: '#e8eaf0', border: '1px solid #252a38' },
          success: { iconTheme: { primary: '#3dd68c', secondary: '#1a1e28' } },
          error:   { iconTheme: { primary: '#e8614d', secondary: '#1a1e28' } },
        }}
      />
      <Routes>
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/"           element={<Protected><Layout><MapPage /></Layout></Protected>} />
        <Route path="/incidents"  element={<Protected><Layout><IncidentsPage /></Layout></Protected>} />
        <Route path="/sos"        element={<Protected><Layout><SosPage /></Layout></Protected>} />
        <Route path="/profile"    element={<Protected><Layout><ProfilePage /></Layout></Protected>} />
        <Route path="/safe-zones" element={<Protected><Layout><SafeZonesPage /></Layout></Protected>} />
        <Route path="/news"       element={<Protected><Layout><NewsPage /></Layout></Protected>} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
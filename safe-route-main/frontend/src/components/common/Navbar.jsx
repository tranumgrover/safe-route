import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Map, AlertTriangle, Bell, User, LogOut, Shield, Newspaper } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import './Navbar.css';

const links = [
  { to: '/',           label: 'Map',       icon: Map           },
  { to: '/incidents',  label: 'Incidents', icon: AlertTriangle },
  { to: '/safe-zones', label: 'Safe Zones',icon: Shield        },
  { to: '/news',       label: 'News',      icon: Newspaper     },
  { to: '/sos',        label: 'SOS',       icon: Bell, sos: true },
  { to: '/profile',    label: 'Profile',   icon: User          },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate         = useNavigate();
  const { pathname }     = useLocation();

  return (
    <nav className="navbar">
      {/* Brand */}
      <Link to="/" className="nav-brand">
        <img src="/logo.svg" alt="SafeRoute" className="nav-logo-img" />
        <span>SafeRoute</span>
      </Link>

      {/* Nav links */}
      <div className="nav-links">
        {links.map(({ to, label, icon: Icon, sos }) => (
          <Link
            key={to}
            to={to}
            className={`nav-link${pathname === to ? ' active' : ''}${sos ? ' nav-sos' : ''}`}
          >
            <Icon size={15} />
            <span>{label}</span>
          </Link>
        ))}
      </div>

      {/* Right: avatar + name + logout */}
      <div className="nav-right">
        <div className="nav-avatar">
          {user?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <span className="nav-name">{user?.name}</span>
        <button
          className="nav-logout"
          title="Logout"
          onClick={() => { logout(); navigate('/login'); }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
}
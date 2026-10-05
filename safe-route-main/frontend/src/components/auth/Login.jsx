import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../services/api';
import useAuthStore from '../../store/authStore';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handle = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      login(data.token, { name: data.name, email: data.email, role: data.role });
      toast.success(`Welcome back, ${data.name}`);
      navigate('/');
    } catch {
      toast.error('Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo-wrap">
            <img src="/logo.svg" alt="SafeRoute" className="auth-logo-img" />
          </div>
          <p>Navigate fearlessly</p>
        </div>
        <form onSubmit={handle} className="auth-form">
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@email.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="auth-switch">No account? <Link to="/register">Register free</Link></p>
      </div>
      <div className="auth-tagline">
        <div className="auth-tagline-dot" />
        Community-powered safety for every journey
      </div>
    </div>
  );
}
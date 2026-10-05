import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../services/api';
import useAuthStore from '../../store/authStore';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handle = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.register(form);
      login(data.token, { name: data.name, email: data.email, role: data.role });
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const f = (k, v) => setForm({...form, [k]: v});

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-brand">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
  <img 
    src="/logo.svg" 
    alt="SafeRoute logo" 
    style={{ width: "70px" }} 
  />
</div>
          <h1>SafeRoute</h1>
          <p>Create your account</p>
        </div>
        <form onSubmit={handle} className="auth-form">
          <div className="field">
            <label>Full Name</label>
            <input placeholder="Your name" value={form.name} onChange={e => f('name', e.target.value)} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@email.com" value={form.email} onChange={e => f('email', e.target.value)} required />
          </div>
          <div className="field">
            <label>Phone</label>
            <input placeholder="9876543210" value={form.phone} onChange={e => f('phone', e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="Min 8 characters" value={form.password} onChange={e => f('password', e.target.value)} required />
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">Have an account? <Link to="/login">Sign in</Link></p>
      </div>
      <div className="auth-tagline">
        <div className="auth-tagline-dot" />
        Community-powered safety for every journey
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { api } from '../services/api';
import { Lock, Mail, User, ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthPages({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registration form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    age: 24,
    height: 175,
    weight: 70,
    activity_level: 'moderate',
    dietary_preference: 'vegetarian',
    goal: 'general_wellness',
    allergies: '',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      localStorage.setItem('nutricloud_token', data.access_token);
      localStorage.setItem('nutricloud_user', JSON.stringify(data));
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.register({
        ...regData,
        age: parseInt(regData.age),
        height: parseFloat(regData.height),
        weight: parseFloat(regData.weight),
      });
      localStorage.setItem('nutricloud_token', data.access_token);
      localStorage.setItem('nutricloud_user', JSON.stringify(data));
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoData = () => {
    if (isLogin) {
      setEmail('alex.student@clouddemo.edu');
      setPassword('CloudDemo2026!');
    } else {
      setRegData({
        name: 'Alex Cloud Student',
        email: `alex_${Math.floor(Math.random() * 9000 + 1000)}@clouddemo.edu`,
        password: 'CloudDemo2026!',
        age: 23,
        height: 178,
        weight: 72,
        activity_level: 'moderate',
        dietary_preference: 'vegetarian',
        goal: 'general_wellness',
        allergies: 'peanuts',
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)' }}>
      <div style={{ maxWidth: isLogin ? '460px' : '640px', width: '100%' }}>
        
        {/* Branding header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: '#10b981', color: 'white', fontSize: '1.75rem', marginBottom: '0.75rem', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}>
            🥗
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>NutriCloud AI</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Cloud Computing Diet Planner with Object Storage & AI Recommendations
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {/* Tab selector */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.25rem', borderRadius: '0.65rem', marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              style={{
                flex: 1,
                padding: '0.6rem',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                background: isLogin ? '#ffffff' : 'transparent',
                color: isLogin ? '#059669' : '#64748b',
                boxShadow: isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              style={{
                flex: 1,
                padding: '0.6rem',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                background: !isLogin ? '#ffffff' : 'transparent',
                color: !isLogin ? '#059669' : '#64748b',
                boxShadow: !isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          {isLogin ? (
            /* Login Form */
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: '#334155' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: '#334155' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                {loading ? 'Authenticating...' : 'Sign In to Cloud Planner'}
              </button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    placeholder="Alex Johnson"
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    placeholder="alex@example.com"
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>Password (min 6 chars)</label>
                <input
                  type="password"
                  required
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  placeholder="Create secure password"
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>Age</label>
                  <input
                    type="number"
                    min="12"
                    max="100"
                    value={regData.age}
                    onChange={(e) => setRegData({ ...regData, age: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>Height (cm)</label>
                  <input
                    type="number"
                    min="100"
                    max="230"
                    value={regData.height}
                    onChange={(e) => setRegData({ ...regData, height: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>Weight (kg)</label>
                  <input
                    type="number"
                    min="30"
                    max="250"
                    value={regData.weight}
                    onChange={(e) => setRegData({ ...regData, weight: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>Dietary Preference</label>
                  <select
                    value={regData.dietary_preference}
                    onChange={(e) => setRegData({ ...regData, dietary_preference: e.target.value })}
                    className="input-field"
                  >
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="non-vegetarian">General / Non-Veg</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>Health Goal</label>
                  <select
                    value={regData.goal}
                    onChange={(e) => setRegData({ ...regData, goal: e.target.value })}
                    className="input-field"
                  >
                    <option value="general_wellness">General Balanced Wellness</option>
                    <option value="weight_loss">Weight Loss (-500 kcal)</option>
                    <option value="weight_gain">Muscle Building / Weight Gain</option>
                    <option value="fitness">Fitness & Maintenance</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>
                  Allergies / Dislikes (Optional Demo Field)
                </label>
                <input
                  type="text"
                  value={regData.allergies}
                  onChange={(e) => setRegData({ ...regData, allergies: e.target.value })}
                  placeholder="e.g. peanuts, dairy, mushrooms"
                  className="input-field"
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                {loading ? 'Creating Cloud Account...' : 'Register & Launch Planner'}
              </button>
            </form>
          )}

          {/* Quick Demo Fill Button */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <button
              type="button"
              onClick={fillDemoData}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
            >
              <Sparkles size={14} color="#10b981" />
              Prefill Demo Data for Testing
            </button>
          </div>
        </div>

        {/* Cloud Architecture Notice */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={16} color="#10b981" />
          Secured with bcrypt password hashing & JWT token-based cloud isolation
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { 
  Sparkles, 
  LayoutDashboard, 
  BookmarkCheck, 
  Cloud, 
  User, 
  LogOut 
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, user, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'generate', label: 'AI Plan Generator', icon: Sparkles },
    { id: 'saved-plans', label: 'Saved Plans', icon: BookmarkCheck },
    { id: 'cloud-files', label: 'Cloud Storage', icon: Cloud },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <header style={{ background: '#ffffff', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.5rem' }}>
        {/* Brand */}
        <div 
          onClick={() => setActivePage('dashboard')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{ background: '#10b981', color: 'white', width: '2.5rem', height: '2.5rem', borderRadius: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.25rem' }}>
            🥗
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
              NutriCloud <span style={{ color: '#10b981' }}>AI</span>
            </h1>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', letterSpacing: '0.05em' }}>
              CLOUD DIET PLANNER
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: isActive ? '#ecfdf5' : 'transparent',
                  color: isActive ? '#059669' : '#475569',
                }}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Badge & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>{user?.name || 'Student Demo'}</div>
            <span className="badge badge-green" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
              {user?.dietary_preference || 'Standard'}
            </span>
          </div>
          <button 
            onClick={onLogout} 
            className="btn btn-secondary" 
            title="Log out"
            style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

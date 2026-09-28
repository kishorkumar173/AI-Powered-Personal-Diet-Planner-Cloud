import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthPages from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import GeneratePlan from './pages/GeneratePlan';
import PlanResult from './pages/PlanResult';
import SavedPlans from './pages/SavedPlans';
import CloudFiles from './pages/CloudFiles';
import ProfilePage from './pages/ProfilePage';
import { api } from './services/api';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nutricloud_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    if (user) {
      // Refresh current user profile from cloud database
      api.getMe()
        .then((profile) => setUser(profile))
        .catch(() => {
          // Token expired or invalid
          setUser(null);
          localStorage.removeItem('nutricloud_token');
          localStorage.removeItem('nutricloud_user');
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('nutricloud_token');
    localStorage.removeItem('nutricloud_user');
    setUser(null);
    setActivePage('dashboard');
  };

  if (!user) {
    return <AuthPages onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {activePage === 'dashboard' && (
          <Dashboard
            setActivePage={setActivePage}
            setSelectedPlan={setSelectedPlan}
          />
        )}

        {activePage === 'generate' && (
          <GeneratePlan
            user={user}
            onPlanGenerated={(plan) => {
              setSelectedPlan(plan);
              setActivePage('plan-result');
            }}
          />
        )}

        {activePage === 'plan-result' && (
          <PlanResult
            plan={selectedPlan}
            setActivePage={setActivePage}
            onPlanSaved={(saved) => setSelectedPlan(saved)}
          />
        )}

        {activePage === 'saved-plans' && (
          <SavedPlans
            setActivePage={setActivePage}
            setSelectedPlan={setSelectedPlan}
          />
        )}

        {activePage === 'cloud-files' && <CloudFiles />}

        {activePage === 'profile' && (
          <ProfilePage
            user={user}
            onProfileUpdated={(updated) => setUser(updated)}
          />
        )}
      </main>

      <footer style={{ background: '#ffffff', borderTop: '1px solid var(--border-color)', padding: '1.5rem 0', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
        <div className="container">
          <p>
            <strong>AI-Powered Personal Diet Planner with Cloud Storage</strong> — Cloud Computing Course Capstone Project
          </p>
          <p style={{ marginTop: '0.25rem' }}>
            Multi-Tier Architecture • REST API Microservice • Cloud Database • Cloud Object Storage • Rule-Based & Generative AI Fallback
          </p>
        </div>
      </footer>
    </div>
  );
}

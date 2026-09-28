import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Flame, 
  Droplets, 
  Utensils, 
  Cloud, 
  Sparkles, 
  ArrowRight, 
  Calendar,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function Dashboard({ setActivePage, setSelectedPlan }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '2.5rem', height: '2.5rem', border: '3px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Connecting to Cloud Database & Services...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const user = metrics?.user;
  const latestPlan = metrics?.latest_plan;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      
      {/* Welcome Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: 'white', padding: '2rem', marginBottom: '2rem', borderRadius: '1.25rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '650px' }}>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', marginBottom: '0.75rem' }}>
            Cloud Profile Active
          </span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '800', lineHeight: 1.2 }}>
            Welcome back, {user?.name || 'Explorer'}!
          </h2>
          <p style={{ marginTop: '0.5rem', opacity: 0.9, fontSize: '0.95rem' }}>
            Your personalized nutrition telemetry and cloud-stored diet history are synchronized across your devices.
          </p>

          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActivePage('generate')} 
              className="btn" 
              style={{ background: '#ffffff', color: '#065f46', fontWeight: '700' }}
            >
              <Sparkles size={17} color="#059669" />
              Generate New AI Plan
            </button>
            <button 
              onClick={() => setActivePage('cloud-files')} 
              className="btn" 
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <Cloud size={17} />
              Open Object Storage
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.85rem 1rem', borderRadius: '0.65rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        {/* Metric 1 */}
        <div className="card card-hover">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Target Calories</span>
            <div style={{ padding: '0.4rem', background: '#fee2e2', borderRadius: '0.5rem' }}>
              <Flame size={18} color="#ef4444" />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a' }}>
            {metrics?.daily_calorie_target} <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#64748b' }}>kcal/day</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem', fontWeight: '600' }}>
            Based on {user?.goal?.replace('_', ' ')}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card card-hover">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Hydration Target</span>
            <div style={{ padding: '0.4rem', background: '#e0f2fe', borderRadius: '0.5rem' }}>
              <Droplets size={18} color="#0284c7" />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a' }}>
            {metrics?.hydration_target_liters} <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#64748b' }}>Liters</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            35ml per kg body weight
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card card-hover">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Saved Diet Plans</span>
            <div style={{ padding: '0.4rem', background: '#dcfce7', borderRadius: '0.5rem' }}>
              <Utensils size={18} color="#16a34a" />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a' }}>
            {metrics?.total_plans_saved} <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#64748b' }}>Plans</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem', fontWeight: '600' }}>
            Stored in Cloud Database
          </div>
        </div>

        {/* Metric 4 */}
        <div className="card card-hover">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Cloud Files</span>
            <div style={{ padding: '0.4rem', background: '#f3e8ff', borderRadius: '0.5rem' }}>
              <Cloud size={18} color="#9333ea" />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a' }}>
            {metrics?.total_files_uploaded} <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#64748b' }}>Files</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9333ea', marginTop: '0.25rem', fontWeight: '600' }}>
            Stored in Object Bucket
          </div>
        </div>
      </div>

      {/* Main Content Split: Latest Plan & User Telemetry */}
      <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
        
        {/* Latest Diet Plan Column (2 cols wide) */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>Latest Cloud Diet Plan</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Synchronized with your personal cloud account</span>
              </div>
              {latestPlan && (
                <button
                  onClick={() => {
                    setSelectedPlan(latestPlan);
                    setActivePage('plan-result');
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
                >
                  View Details <ArrowRight size={14} />
                </button>
              )}
            </div>

            {latestPlan ? (
              <div>
                {/* Plan Meals Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '0.65rem', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', textTransform: 'uppercase' }}>Breakfast</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', marginTop: '0.2rem' }}>{latestPlan.breakfast.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{latestPlan.breakfast.calories} kcal • {latestPlan.breakfast.portion}</div>
                  </div>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '0.65rem', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase' }}>Lunch</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', marginTop: '0.2rem' }}>{latestPlan.lunch.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{latestPlan.lunch.calories} kcal • {latestPlan.lunch.portion}</div>
                  </div>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '0.65rem', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#8b5cf6', textTransform: 'uppercase' }}>Snack</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', marginTop: '0.2rem' }}>{latestPlan.snack.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{latestPlan.snack.calories} kcal • {latestPlan.snack.portion}</div>
                  </div>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '0.65rem', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase' }}>Dinner</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', marginTop: '0.2rem' }}>{latestPlan.dinner.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{latestPlan.dinner.calories} kcal • {latestPlan.dinner.portion}</div>
                  </div>
                </div>

                {/* Macro breakdown strip */}
                <div style={{ display: 'flex', gap: '1rem', background: '#f1f5f9', padding: '0.75rem 1rem', borderRadius: '0.6rem', fontSize: '0.85rem' }}>
                  <span><strong>Total:</strong> {latestPlan.nutrition_summary.total_calories} kcal</span>
                  <span><strong>Protein:</strong> {latestPlan.nutrition_summary.total_protein_g}g</span>
                  <span><strong>Carbs:</strong> {latestPlan.nutrition_summary.total_carbs_g}g</span>
                  <span><strong>Fats:</strong> {latestPlan.nutrition_summary.total_fats_g}g</span>
                  <span style={{ marginLeft: 'auto', color: '#059669', fontWeight: '700' }}>Engine: {latestPlan.source}</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
                <Utensils size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ fontWeight: '600' }}>No diet plans saved yet in your cloud database.</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Generate your first personalized plan using the AI recommendation engine!</p>
                <button
                  onClick={() => setActivePage('generate')}
                  className="btn btn-primary"
                  style={{ marginTop: '1rem', fontSize: '0.85rem' }}
                >
                  <Sparkles size={16} /> Generate Plan Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Profile Summary (1 col wide) */}
        <div>
          <div className="card" style={{ height: '100%' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
              Biometric Profile
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Age</span>
                <span style={{ fontWeight: '700' }}>{user?.age} years</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Height</span>
                <span style={{ fontWeight: '700' }}>{user?.height} cm</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Weight</span>
                <span style={{ fontWeight: '700' }}>{user?.weight} kg</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Activity Multiplier</span>
                <span style={{ fontWeight: '700', textTransform: 'capitalize' }}>{user?.activity_level}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Diet Preference</span>
                <span className="badge badge-green">{user?.dietary_preference}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Allergies</span>
                <span style={{ fontWeight: '600' }}>{user?.allergies || 'None specified'}</span>
              </div>
            </div>

            <button
              onClick={() => setActivePage('profile')}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '1.25rem', fontSize: '0.85rem' }}
            >
              Update Biometrics & Goals
            </button>
          </div>
        </div>

      </div>

      {/* Course & Wellness Disclaimer */}
      <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <AlertCircle size={20} color="#059669" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
        <div style={{ fontSize: '0.8rem', color: '#475569' }}>
          <strong>Cloud Computing Academic Project Notice:</strong> This software is engineered to demonstrate Cloud Architecture (SaaS/PaaS, Object Storage, NoSQL/Relational Cloud DBs, and Serverless API microservices). Generated plans represent general wellness educational samples, not medical or clinical nutrition guidance.
        </div>
      </div>

    </div>
  );
}

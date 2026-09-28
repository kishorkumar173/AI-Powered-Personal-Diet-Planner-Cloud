import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BookmarkCheck, Trash2, Eye, Calendar, Sparkles } from 'lucide-react';

export default function SavedPlans({ setActivePage, setSelectedPlan }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSavedPlans();
  }, []);

  const loadSavedPlans = async () => {
    try {
      setLoading(true);
      const data = await api.listPlans();
      setPlans(data);
    } catch (err) {
      setError(err.message || 'Failed to load saved diet plans.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Delete this plan from your cloud database?')) return;
    try {
      await api.deletePlan(planId);
      setPlans(plans.filter((p) => p.plan_id !== planId));
    } catch (err) {
      alert(err.message || 'Failed to delete plan.');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
            Saved Cloud Diet Plans
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            History of personalized nutrition plans stored in your cloud database.
          </p>
        </div>
        <button
          onClick={() => setActivePage('generate')}
          className="btn btn-primary"
          style={{ fontSize: '0.85rem' }}
        >
          <Sparkles size={16} /> Create New Plan
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.85rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          Loading saved cloud records...
        </div>
      ) : plans.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <BookmarkCheck size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#334155' }}>No Saved Plans Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
            When you generate a diet plan, click "Save to Cloud DB" to archive it here for multi-device access.
          </p>
          <button onClick={() => setActivePage('generate')} className="btn btn-primary">
            Generate Your First Plan
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {plans.map((p) => (
            <div key={p.plan_id} className="card card-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span className="badge badge-green">{p.dietary_preference}</span>
                  <span className="badge badge-blue">{p.goal?.replace('_', ' ')}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={13} /> {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                  {p.breakfast?.name} & {p.lunch?.name}
                </h4>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Total: <strong>{p.nutrition_summary?.total_calories} kcal</strong> | P: {p.nutrition_summary?.total_protein_g}g | C: {p.nutrition_summary?.total_carbs_g}g | F: {p.nutrition_summary?.total_fats_g}g
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setSelectedPlan(p);
                    setActivePage('plan-result');
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
                >
                  <Eye size={16} /> View
                </button>
                <button
                  onClick={() => handleDelete(p.plan_id)}
                  className="btn btn-danger"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

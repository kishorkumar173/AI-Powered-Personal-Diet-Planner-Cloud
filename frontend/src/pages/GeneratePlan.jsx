import React, { useState } from 'react';
import { api } from '../services/api';
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function GeneratePlan({ user, onPlanGenerated }) {
  const [dietPref, setDietPref] = useState(user?.dietary_preference || 'vegetarian');
  const [goal, setGoal] = useState(user?.goal || 'general_wellness');
  const [allergies, setAllergies] = useState(user?.allergies || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const plan = await api.generatePlan({
        dietary_preference: dietPref,
        goal: goal,
        allergies: allergies,
      });
      onPlanGenerated(plan);
    } catch (err) {
      setError(err.message || 'Diet generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', padding: '0.75rem', background: '#ecfdf5', borderRadius: '1rem', color: '#10b981', marginBottom: '0.75rem' }}>
          <Sparkles size={28} />
        </div>
        <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a' }}>
          AI Diet Recommendation Engine
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.35rem' }}>
          Calorie & macronutrient targets tailored dynamically using Mifflin-St Jeor calculations with intelligent fallback resilience.
        </p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.85rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleGenerate}>
          {/* Diet Preference */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
              Dietary Preference
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {[
                { id: 'vegetarian', label: 'Vegetarian', desc: 'Plant & dairy based' },
                { id: 'vegan', label: 'Vegan', desc: '100% plant based' },
                { id: 'non-vegetarian', label: 'General / Non-Veg', desc: 'Includes poultry, fish' }
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setDietPref(opt.id)}
                  style={{
                    border: `2px solid ${dietPref === opt.id ? '#10b981' : '#e2e8f0'}`,
                    background: dietPref === opt.id ? '#ecfdf5' : '#ffffff',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: dietPref === opt.id ? '#065f46' : '#1e293b' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                    {opt.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goal selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
              Health & Fitness Objective
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="input-field"
              style={{ fontSize: '0.95rem', padding: '0.75rem' }}
            >
              <option value="general_wellness">General Wellness & Balanced Energy (Neutral TDEE)</option>
              <option value="weight_loss">Weight Management (-500 kcal Deficit)</option>
              <option value="weight_gain">Muscle Building / Hypertrophy (+400 kcal Surplus)</option>
              <option value="fitness">Active Fitness Performance (+200 kcal)</option>
            </select>
          </div>

          {/* Allergies / Exclusions */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
              Allergies or Ingredient Exclusions (Optional)
            </label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. peanuts, dairy, shellfish, gluten"
              className="input-field"
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', display: 'block' }}>
              The recommendation engine will filter recipes avoiding matches to these keywords.
            </span>
          </div>

          {/* Biometrics confirmation reminder */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.65rem', marginBottom: '1.75rem', fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span>Using Biometrics: <strong>{user?.weight || 70} kg</strong>, <strong>{user?.height || 170} cm</strong>, <strong>{user?.age || 25} yrs</strong>, <strong>{user?.activity_level || 'moderate'}</strong></span>
            </div>
            <span className="badge badge-blue">Auto-Calculated</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Querying Recommendation Engine...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Tailored Cloud Diet Plan
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

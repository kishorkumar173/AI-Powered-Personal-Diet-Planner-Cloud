import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  Bookmark, 
  Download, 
  ArrowLeft, 
  Droplets, 
  Flame, 
  Activity, 
  Check, 
  AlertCircle,
  FileDown
} from 'lucide-react';

export default function PlanResult({ plan, setActivePage, onPlanSaved }) {
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(!!plan?.plan_id);
  const [error, setError] = useState('');

  if (!plan) {
    return (
      <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
        <p>No diet plan selected.</p>
        <button onClick={() => setActivePage('generate')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Generate a Plan
        </button>
      </div>
    );
  }

  const handleSaveToCloud = async () => {
    setSaving(true);
    setError('');
    try {
      const saved = await api.savePlan({
        breakfast: plan.breakfast,
        lunch: plan.lunch,
        snack: plan.snack,
        dinner: plan.dinner,
        nutrition_summary: plan.nutrition_summary,
        hydration_reminder: plan.hydration_reminder,
        dietary_preference: plan.dietary_preference,
        goal: plan.goal,
        source: plan.source || 'rule_based_engine',
      });
      setSavedSuccess(true);
      if (onPlanSaved) onPlanSaved(saved);
    } catch (err) {
      setError(err.message || 'Failed to save diet plan to Cloud Database.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadMarkdown = () => {
    const summary = plan.nutrition_summary;
    const content = `# Cloud Diet Plan Export
Diet Preference: ${plan.dietary_preference}
Goal: ${plan.goal}
Source Engine: ${plan.source}

## Nutritional Targets
- Total Energy: ${summary.total_calories} kcal (Target: ${summary.target_calories} kcal)
- Protein: ${summary.total_protein_g}g
- Carbs: ${summary.total_carbs_g}g
- Fats: ${summary.total_fats_g}g
- Hydration: ${plan.hydration_reminder}

## Meals
1. Breakfast: ${plan.breakfast.name} (${plan.breakfast.calories} kcal)
   Portion: ${plan.breakfast.portion}

2. Lunch: ${plan.lunch.name} (${plan.lunch.calories} kcal)
   Portion: ${plan.lunch.portion}

3. Snack: ${plan.snack.name} (${plan.snack.calories} kcal)
   Portion: ${plan.snack.portion}

4. Dinner: ${plan.dinner.name} (${plan.dinner.calories} kcal)
   Portion: ${plan.dinner.portion}

Disclaimer: ${plan.disclaimer}
`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diet_plan_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const meals = [
    { title: 'Breakfast', color: '#10b981', item: plan.breakfast, badge: 'badge-green' },
    { title: 'Lunch', color: '#3b82f6', item: plan.lunch, badge: 'badge-blue' },
    { title: 'Snack', color: '#8b5cf6', item: plan.snack, badge: 'badge-purple' },
    { title: 'Dinner', color: '#f59e0b', item: plan.dinner, badge: 'badge-amber' },
  ];

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1000px' }}>
      
      {/* Top action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button onClick={() => setActivePage('generate')} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to Generator
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleDownloadMarkdown} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <FileDown size={16} /> Export Markdown
          </button>

          {!savedSuccess ? (
            <button onClick={handleSaveToCloud} disabled={saving} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <Bookmark size={16} /> {saving ? 'Saving...' : 'Save to Cloud DB'}
            </button>
          ) : (
            <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}>
              <Check size={16} /> Saved in Cloud Database
            </span>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.25rem' }}>
          {error}
        </div>
      )}

      {/* Plan Header Card */}
      <div className="card" style={{ marginBottom: '1.75rem', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span className="badge badge-green">{plan.dietary_preference}</span>
              <span className="badge badge-blue">{plan.goal.replace('_', ' ')}</span>
              <span className="badge badge-purple">Source: {plan.source}</span>
            </div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a' }}>
              Customized Daily Meal Architecture
            </h2>
          </div>
        </div>

        {/* Nutritional Summary Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #f1f5f9' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>TOTAL ENERGY</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
              {plan.nutrition_summary.total_calories} <span style={{ fontSize: '0.8rem' }}>kcal</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10b981' }}>Target: {plan.nutrition_summary.target_calories}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>PROTEIN</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
              {plan.nutrition_summary.total_protein_g} <span style={{ fontSize: '0.8rem' }}>g</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>4 kcal / g</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>CARBOHYDRATES</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
              {plan.nutrition_summary.total_carbs_g} <span style={{ fontSize: '0.8rem' }}>g</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>4 kcal / g</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>HEALTHY FATS</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
              {plan.nutrition_summary.total_fats_g} <span style={{ fontSize: '0.8rem' }}>g</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>9 kcal / g</div>
          </div>
        </div>

        {/* Hydration Banner */}
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', background: '#ecfeff', border: '1px solid #cffafe', borderRadius: '0.65rem' }}>
          <Droplets size={20} color="#0891b2" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.85rem', color: '#155e75', fontWeight: '500' }}>
            <strong>Hydration Advisory:</strong> {plan.hydration_reminder}
          </div>
        </div>
      </div>

      {/* Meal Grid */}
      <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
        {meals.map((m, idx) => (
          <div key={idx} className="card card-hover" style={{ borderLeft: `4px solid ${m.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className={`badge ${m.badge}`}>{m.title}</span>
              <span style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>
                {m.item.calories} <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#64748b' }}>kcal</span>
              </span>
            </div>

            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.4rem' }}>
              {m.item.name}
            </h4>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.85rem' }}>
              <strong>Portion:</strong> {m.item.portion}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#475569', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '0.5rem' }}>
              <span>Protein: <strong>{m.item.protein_g}g</strong></span>
              <span>•</span>
              <span>Carbs: <strong>{m.item.carbs_g}g</strong></span>
              <span>•</span>
              <span>Fats: <strong>{m.item.fats_g}g</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Medical Disclaimer Banner */}
      <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', gap: '0.85rem' }}>
        <AlertCircle size={22} color="#b45309" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
        <p style={{ fontSize: '0.8rem', color: '#92400e', lineHeight: 1.5 }}>
          {plan.disclaimer}
        </p>
      </div>

    </div>
  );
}

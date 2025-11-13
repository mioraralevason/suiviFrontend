import React, { useState } from 'react';
import { Save, RotateCcw, Loader2, Sliders, Eye, AlertTriangle } from 'lucide-react';
import { useThresholds } from "../hooks/useThresholds";
import ThresholdParameters from '../ThresholdParameters';

import ThresholdVisualization from './ThresholdVisualization';

const ThresholdsPage = () => {
  const token = 'your-token-here';
  const {
    thresholds, setThresholds, possibleLabels,
    loading, saving, error, hasChanges,
    setHasChanges, loadThresholds, saveThresholds
  } = useThresholds(token);

  const [activeView, setActiveView] = useState<'parameters' | 'visualization'>('parameters');

  const handleChange = (level: string, field: any, value: any) => {
    setThresholds(prev => prev.map(t => t.level === level ? { ...t, [field]: value } : t));
    setHasChanges(true);
  };

  if (loading) return <div className="text-center mt-20">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Configuration des seuils</h1>
        <div className="flex gap-3">
          {hasChanges && (
            <button onClick={loadThresholds} className="px-4 py-2 bg-gray-200 rounded-lg flex items-center gap-2">
              <RotateCcw className="h-4 w-4" /> Annuler
            </button>
          )}
          <button
            onClick={saveThresholds}
            disabled={!hasChanges || saving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save />} Enregistrer
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 p-4 border-l-4 border-red-500 mb-6 flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" /> {error}
        </div>
      )}

      <div className="mb-6 flex gap-2">
        <button
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeView === 'parameters' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
          onClick={() => setActiveView('parameters')}
        >
          <Sliders className="h-4 w-4" /> Paramètres
        </button>
        <button
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeView === 'visualization' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
          onClick={() => setActiveView('visualization')}
        >
          <Eye className="h-4 w-4" /> Visualisation
        </button>
      </div>

      {activeView === 'parameters'
        ? <ThresholdParameters thresholds={thresholds} possibleLabels={possibleLabels} onChange={handleChange} />
        : <ThresholdVisualization thresholds={thresholds} />}
    </div>
  );
};

export default ThresholdsPage;

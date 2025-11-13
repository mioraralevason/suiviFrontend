import React from 'react';
import { RiskThreshold } from '../types/threshold';

const ThresholdVisualization: React.FC<{ thresholds: RiskThreshold[] }> = ({ thresholds }) => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-3 gap-6">
      {thresholds.map((t, i) => (
        <div key={t.level} className="bg-white p-6 rounded-xl border shadow-sm text-center">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white font-bold text-3xl ${
            t.level === 'low' ? 'bg-yellow-500' : t.level === 'medium' ? 'bg-orange-500' : 'bg-red-500'
          }`}>
            {i + 1}
          </div>
          <h4 className="text-lg font-bold mb-2">{t.label}</h4>
          <p className="text-sm text-slate-600">{t.minScore} - {t.maxScore} points</p>
        </div>
      ))}
    </div>
  </div>
);

export default ThresholdVisualization;

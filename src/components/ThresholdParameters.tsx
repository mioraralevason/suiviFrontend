import React from 'react';
import { RiskThreshold } from '../types/threshold';

interface Props {
  thresholds: RiskThreshold[];
  possibleLabels: string[];
  onChange: (level: string, field: keyof RiskThreshold, value: any) => void;
}

const ThresholdParameters: React.FC<Props> = ({ thresholds, possibleLabels, onChange }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
    {thresholds.map((t) => (
      <div key={t.level} className="mb-6 border-b pb-6 last:border-b-0">
        <h3 className="text-lg font-bold text-slate-900 mb-4">{t.label}</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Libellé</label>
            <select
              value={t.label}
              onChange={(e) => onChange(t.level, 'label', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-slate-50"
            >
              {possibleLabels.map((label) => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Score min</label>
            <input
              type="number"
              min="0"
              max="100"
              value={t.minScore}
              onChange={(e) => onChange(t.level, 'minScore', +e.target.value)}
              disabled={t.level === 'low'}
              className="w-full px-4 py-2 border rounded-lg bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Score max</label>
            <input
              type="number"
              min="0"
              max="100"
              value={t.maxScore}
              onChange={(e) => onChange(t.level, 'maxScore', +e.target.value)}
              disabled={t.level === 'high'}
              className="w-full px-4 py-2 border rounded-lg bg-slate-50"
            />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default ThresholdParameters;

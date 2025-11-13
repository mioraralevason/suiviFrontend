import { useState, useEffect } from 'react';
import { RiskThreshold } from "../../types";
import { API_BASE } from "../../config/api";


export const useThresholds = (token: string) => {
  const [thresholds, setThresholds] = useState<RiskThreshold[]>([]);
  const [possibleLabels, setPossibleLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const mapBackendToFrontend = (backendData: any[]): RiskThreshold[] => {
    let mapped = backendData
      .map((item) => ({
        idSeuil: item.idSeuil,
        level: '' as any,
        label: item.description || 'N/A',
        minScore: parseFloat(item.tauxMin?.toString() || '0'),
        maxScore: parseFloat(item.tauxMax?.toString() || '100'),
        color: 'gray',
        supervisionPeriod: ''
      }))
      .sort((a, b) => a.minScore - b.minScore);

    mapped = mapped.map((item, index) => ({
      ...item,
      level: index === 0 ? 'low' : index === 1 ? 'medium' : 'high',
      color: index === 0 ? 'yellow' : index === 1 ? 'orange' : 'red',
      supervisionPeriod: index === 0 ? '5 ans' : index === 1 ? '3 ans' : '1 an'
    }));

    return mapped;
  };

  const mapFrontendToBackend = (threshold: RiskThreshold) => ({
    tauxMin: threshold.minScore,
    tauxMax: threshold.maxScore,
    description: threshold.label
  });

  // 🔄 Charger les seuils
  const loadThresholds = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/seuils-risque`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
      const data = await res.json();
      const labels = [...new Set(data.map((d: any) => d.description).filter(Boolean))];
      setPossibleLabels(labels.length ? labels as string[] : ['Faible', 'Modéré', 'Élevé']);
      setThresholds(mapBackendToFrontend(data));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  
  const saveThresholds = async () => {
    setSaving(true);
    setError('');
    try {
      const sorted = [...thresholds].sort((a, b) => a.minScore - b.minScore);
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].maxScore >= sorted[i + 1].minScore) {
          throw new Error('Les plages de scores se chevauchent.');
        }
      }

      for (const threshold of thresholds) {
        const data = mapFrontendToBackend(threshold);
        const method = threshold.idSeuil ? 'PUT' : 'POST';
        const url = threshold.idSeuil
          ? `${API_BASE}/seuils-risque/${threshold.idSeuil}`
          : `${API_BASE}/seuils-risque`;

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Échec de sauvegarde');
      }

      setHasChanges(false);
      alert('✓ Configuration sauvegardée avec succès');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => { loadThresholds(); }, []);

  return {
    thresholds,
    setThresholds,
    possibleLabels,
    loading,
    saving,
    error,
    hasChanges,
    setHasChanges,
    loadThresholds,
    saveThresholds
  };
};

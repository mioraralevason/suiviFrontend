// src/components/hooks/useScoring.ts
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { API_BASE } from '../../config/api';

export type ScoringRule = {
  idRegle: string;           
  condition: string;         
  noteRi: number | null;     
  noteSc: number | null;
};

export const useScoring = (questionId: string) => {
  const { user } = useAuth();
  const token = user?.token;

  const [rules, setRules] = useState<ScoringRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const API = `${API_BASE}/scoring/regles`;

  // Charger les règles
  const loadRules = useCallback(async () => {
    if (!token || !questionId) return;

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API}/question/${questionId}`, {  // ✅ CORRECTION ICI
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Règles non chargées');
      }

      const data: ScoringRule[] = await res.json();
      setRules(data);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erreur chargement des règles');
    } finally {
      setLoading(false);
    }
  }, [questionId, token]);

  // Ajouter / Modifier
  const saveRule = useCallback(async (rule: ScoringRule, isEdit: boolean) => {
    if (!token) return;

    setSaving(true);
    setError('');
    
    try {
      const url = isEdit ? `${API}/${rule.idRegle}` : API;
      const method = isEdit ? 'PUT' : 'POST';
      
      const body = isEdit
        ? { condition: rule.condition, noteRi: rule.noteRi, noteSc: rule.noteSc }
        : { idQuestion: questionId, condition: rule.condition, noteRi: rule.noteRi, noteSc: rule.noteSc };

      console.log('Envoi au backend:', { url, method, body });  // Debug

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Erreur backend:', err);  // Debug
        throw new Error(err.error || 'Échec sauvegarde');
      }

      await loadRules();
      toast.success(isEdit ? 'Règle mise à jour' : 'Règle ajoutée');
    } catch (err: any) {
      console.error('Erreur dans saveRule:', err);  // Debug
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }, [questionId, token, loadRules, API]);

  // Supprimer
  const deleteRule = useCallback(async (ruleId: string) => {
    if (!token || !confirm('Supprimer cette règle ?')) return;

    try {
      const res = await fetch(`${API}/${ruleId}`, {  // ✅ CORRECTION ICI
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Suppression échouée');

      await loadRules();
      toast.success('Règle supprimée');
    } catch {
      toast.error('Erreur suppression');
    }
  }, [token, loadRules, API]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  return {
    rules,
    loading,
    saving,
    error,
    saveRule,
    deleteRule,
    refresh: loadRules,
  };
};
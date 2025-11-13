// src/hooks/useQuestions.ts
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import toast from 'react-hot-toast';
import { Question } from '../../types';
import { API_BASE } from '../../config/api';

const REVERSE_MAPPING: Record<string, string> = {
  choice_multiple: 'Choix multiple',
  choice_single: 'Choix simple',
  boolean: 'Boolean',
  percentage: 'Pourcentage',
  interval: 'Intervalle',
  date: 'Date',
  date_range: 'Intervalle de dates',
  text_short: 'Texte court',
  text_long: 'Texte long',
  integer: 'Nombre entier',
  decimal: 'Nombre decimal',
};

export interface QuestionFormData {
  axisId: string;
  label: string;
  definition: string;
  type: string;
  required: boolean;
  justificationRequired: boolean;
  commentRequired: boolean;
  notes: string;
  options?: string;
}

export const useQuestions = () => {
  const { user } = useAuth();
  const token = user?.token;
  const { loadSectionsWithNested } = useData();

  const [typesReponse, setTypesReponse] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadTypesReponse = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/type-reponse`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Types non chargés');
      const data = await res.json();
      setTypesReponse(data);
    } catch (err) {
      console.error(err);
      toast.error('Erreur types');
    }
  }, [token]);

  const handleAddQuestion = useCallback(async (
    formData: QuestionFormData,
    redirectToScoring = false
  ) => {
    if (!token) return;
    setSaving(true);
    setError('');

    try {
      const dto = {
        axisId: formData.axisId,
        libelle: formData.label,
        definition: formData.definition,
        type: REVERSE_MAPPING[formData.type] || formData.type,
        required: formData.required,
        justificationRequired: formData.justificationRequired,
        commentRequired: formData.commentRequired,
        notes: formData.notes,
        options: formData.options,
      };

      const res = await fetch(`${API_BASE}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dto),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.details || err.error || 'Erreur');
      }

      const newQuestion = await res.json();
      await loadSectionsWithNested();
      toast.success('Question ajoutée !');

      // REDIRECTION VERS SCORING
      if (redirectToScoring) {
        window.location.hash = `#scoring-${newQuestion.id || newQuestion.idQuestion}`;
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }, [token, loadSectionsWithNested]);

  const handleUpdateQuestion = useCallback(async (id: string, formData: QuestionFormData) => {
    if (!token) return;
    setSaving(true);
    setError('');
    try {
      const dto = {
        axisId: formData.axisId,
        libelle: formData.label,
        definition: formData.definition,
        type: REVERSE_MAPPING[formData.type] || formData.type,
        required: formData.required,
        justificationRequired: formData.justificationRequired,
        commentRequired: formData.commentRequired,
        notes: formData.notes,
        options: formData.options,
      };

      const res = await fetch(`${API_BASE}/questions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dto),
      });

      if (!res.ok) throw new Error('Échec mise à jour');
      await loadSectionsWithNested();
      toast.success('Mise à jour OK');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }, [token, loadSectionsWithNested]);

  const handleDeleteQuestion = useCallback(async (id: string) => {
    if (!token || !confirm('Supprimer ?')) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/questions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Suppression échouée');
      await loadSectionsWithNested();
      toast.success('Supprimée');
    } catch {
      toast.error('Erreur');
    } finally {
      setSaving(false);
    }
  }, [token, loadSectionsWithNested]);

  const prepareEditForm = useCallback((q: Question): QuestionFormData => ({
    axisId: q.axisId,
    label: q.label,
    definition: q.definition || '',
    type: q.type,
    required: q.required,
    justificationRequired: q.justificationRequired,
    commentRequired: q.commentRequired,
    notes: q.notes || '',
    options: q.dropdownOptions?.join(', ') || undefined, // ← depuis frontend
  }), []);

  const getDefaultFormData = useCallback((axisId = '', type = 'Texte court'): QuestionFormData => ({
  axisId,
  label: '',
  definition: '',
  type,
  required: true,
  justificationRequired: false,
  commentRequired: false,
  notes: '',
  options: undefined,
  }), []);

  useEffect(() => {
    if (token) loadTypesReponse();
  }, [token, loadTypesReponse]);

  return {
    typesReponse,
    saving,
    error,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    prepareEditForm,
    getDefaultFormData,
  };
};
// src/components/scoring/FormInteger.tsx

import React, { useState, useEffect } from 'react';
import { Loader2, Trash2, X } from 'lucide-react';

type Props = {
  rule?: {
    value?: string; // "10" ou ">5" ou "5-15"
    points?: { noteRi?: number; noteSc?: number | null };
  };
  index?: number;
  onDelete?: (i: number) => void;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: 'single_rule';
    rule: { condition: string; noteRi: number; noteSc?: number | null };
  }) => void;
  saving?: boolean;
  error?: string;
};

const OPERATORS = [
  { value: '=', label: 'Égal à' },
  { value: '>', label: 'Supérieur à' },
  { value: '<', label: 'Inférieur à' },
  { value: '>=', label: 'Supérieur ou égal à' },
  { value: '<=', label: 'Inférieur ou égal à' },
] as const;

export const FormInteger: React.FC<Props> = ({
  rule,
  index = -1,
  onDelete,
  isOpen,
  onClose,
  onSubmit,
  saving = false,
  error,
}) => {
  // États locaux
  const [operator, setOperator] = useState<'=' | '>' | '<' | '>=' | '<='>('=');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [noteRi, setNoteRi] = useState('');
  const [noteSc, setNoteSc] = useState('');

  // Initialisation depuis rule (édition)
  useEffect(() => {
    if (rule?.value) {
      // Cas 1: opérateur + valeur → ">10"
      const opMatch = rule.value.match(/^([><]=?|=)(.+)$/);
      if (opMatch) {
        setOperator(opMatch[1] as any);
        setMinValue(opMatch[2].trim());
        setMaxValue('');
      } else {
        // Cas 2: plage → "5-15"
        const [min, max] = rule.value.split('-');
        if (max) {
          setOperator('=');
          setMinValue(min.trim());
          setMaxValue(max.trim());
        } else {
          // Cas 3: valeur unique → "10"
          setOperator('=');
          setMinValue(rule.value.trim());
          setMaxValue('');
        }
      }
    }
    if (rule?.points) {
      setNoteRi(rule.points.noteRi?.toString() || '');
      setNoteSc(rule.points.noteSc?.toString() || '');
    }
  }, [rule]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const min = minValue ? parseInt(minValue) : null;
    const max = maxValue ? parseInt(maxValue) : null;

    if (min === null && max === null) {
      alert('Veuillez saisir au moins une valeur');
      return;
    }
    if (min !== null && isNaN(min)) {
      alert('Valeur min invalide');
      return;
    }
    if (max !== null && isNaN(max)) {
      alert('Valeur max invalide');
      return;
    }
    if (min !== null && max !== null && min > max) {
      alert('Min doit être ≤ Max');
      return;
    }

    const ri = Number(noteRi);
    if (!noteRi || isNaN(ri) || ri < 1 || ri > 4) {
      alert('Note RI obligatoire entre 1 et 4');
      return;
    }
    const sc = noteSc ? Number(noteSc) : null;
    if (sc !== null && (sc < 1 || sc > 4)) {
      alert('Note SC doit être entre 1 et 4');
      return;
    }

    let condition: string;
    if (min !== null && max !== null) {
      condition = `reponse::NUMERIC BETWEEN ${min} AND ${max}`;
    } else if (operator !== '=' && min !== null) {
      condition = `reponse::NUMERIC ${operator} ${min}`;
    } else if (min !== null) {
      condition = `reponse::NUMERIC = ${min}`;
    } else {
      condition = `reponse::NUMERIC = ${max}`;
    }

    onSubmit({
      type: 'single_rule',
      rule: { condition, noteRi: ri, noteSc: sc },
    });
  };

  const isEdit = index !== -1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Modifier la règle - Nombre entier' : 'Ajouter une règle - Nombre entier'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            disabled={saving}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note :</strong> Saisissez une plage (ex: 5 à 15), une valeur unique (ex: 10) ou un opérateur.
          </p>
        </div>

        {/* Loader */}
        {saving && (
          <div className="mb-4 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-green-600" />
            <span className="text-sm text-green-600">Enregistrement...</span>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* === SECTION CONDITION === */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-md font-medium text-blue-900 mb-3">Condition de déclenchement</h4>

            <div className="space-y-3">
              {/* Opérateur + valeur unique */}
              <div className="flex gap-3 items-center">
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value as any)}
                  className="px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                >
                  {OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="1"
                  placeholder="Valeur"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center"
                  disabled={saving}
                />
              </div>

              {/* OU plage */}
              <div className="flex items-center gap-3">
                <span className="text-gray-600 text-sm">ou</span>
                <input
                  type="number"
                  step="1"
                  placeholder="Min"
                  value={minValue}
                  onChange={(e) => {
                    setMinValue(e.target.value);
                    setOperator('=');
                  }}
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center"
                  disabled={saving}
                />
                <span className="text-gray-600">à</span>
                <input
                  type="number"
                  step="1"
                  placeholder="Max"
                  value={maxValue}
                  onChange={(e) => {
                    setMaxValue(e.target.value);
                    setOperator('=');
                  }}
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Aperçu SQL */}
            {(minValue || maxValue) && (
              <div className="mt-3 p-2 bg-blue-100 rounded font-mono text-xs text-blue-900">
                {minValue && maxValue
                  ? `reponse::NUMERIC BETWEEN ${minValue} AND ${maxValue}`
                  : `reponse::NUMERIC ${operator} ${minValue || maxValue}`}
              </div>
            )}
          </div>

          {/* === SECTION NOTES === */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 mb-3">Notes</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note RI (Risque Inhérent) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  step="0.1"
                  value={noteRi}
                  onChange={(e) => setNoteRi(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-center font-medium"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note SC (Contrôles) <span className="text-gray-500 text-xs">(optionnel)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  step="0.1"
                  value={noteSc}
                  onChange={(e) => setNoteSc(e.target.value)}
                  placeholder="Ex: 2.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* === BOUTONS === */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition font-medium"
              disabled={saving}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
              disabled={saving || (!minValue && !maxValue)}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : isEdit ? (
                'Mettre à jour'
              ) : (
                'Créer la règle'
              )}
            </button>
          </div>
        </form>

        {/* === SUPPRIMER === */}
        {isEdit && onDelete && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onDelete(index)}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer cette règle
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormInteger;
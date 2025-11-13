// src/components/scoring/FormDate.tsx

import React, { useState, useEffect } from 'react';
import { Loader2, Trash2, X, Calendar } from 'lucide-react';

type Props = {
  rule?: {
    value?: string; // "2025-06-15" ou ">2025-01-01"
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

export const FormDate: React.FC<Props> = ({
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
  const [dateValue, setDateValue] = useState('');
  const [noteRi, setNoteRi] = useState('');
  const [noteSc, setNoteSc] = useState('');

  // Initialisation depuis rule (édition)
  useEffect(() => {
    if (rule?.value) {
      const match = rule.value.match(/^([><]=?|=)?(.*)$/);
      if (match) {
        const op = (match[1] as any) || '=';
        const date = match[2]?.trim() || '';
        setOperator(op);
        setDateValue(date);
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

    if (!dateValue) {
      alert('Veuillez sélectionner une date');
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

    const condition = `reponse::DATE ${operator} '${dateValue}'`;

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
            {isEdit ? 'Modifier la règle - Date' : 'Ajouter une règle - Date'}
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
            <strong>Note :</strong> Sélectionnez un opérateur et une date. Ex: "Supérieur à 2025-01-01".
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

              <div className="flex-1 relative">
                <input
                  type="date"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  className="w-full px-3 py-2 pl-10 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={

saving}
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Aperçu SQL */}
            {dateValue && (
              <div className="mt-3 p-2 bg-blue-100 rounded font-mono text-xs text-blue-900">
                reponse::DATE <span className="font-bold">{operator}</span> '{dateValue}'
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
              disabled={saving || !dateValue}
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

export default FormDate;
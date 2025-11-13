// ...existing code...
import React, { useEffect } from 'react';
import { Loader2, HelpCircle, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuestionFormData } from '../hooks/useQuestions';
import { TypeReponse } from '../../types';
import { SousSection } from '../../types';


const TYPE_MAPPING: Record<string, string> = {
  'Boolean': 'boolean',
  'Choix multiple': 'choice_multiple',
  'Choix simple': 'choice_single',
  'Intervalle': 'interval',
  'Pourcentage': 'percentage',
  'Date': 'date',
  'Intervalle de dates': 'date_range',
  'Texte court': 'text_short',
  'Texte long': 'text_long',
  'Nombre entier': 'integer',
  'Nombre decimal': 'decimal',
};

interface QuestionFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  formData: QuestionFormData;
  onChange: (updates: Partial<QuestionFormData>) => void;
  sousSections?: SousSection[];
  onSubmit: (data: QuestionFormData) => Promise<void>;
  saving: boolean;
  typesReponse: TypeReponse[];
  error?: string;
  selectedSousSectionId?: string;
  onSousSectionChange?: (id: string) => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  isOpen,
  onClose,
  title,
  formData,
  onChange,
  sousSections,
  selectedSousSectionId,
  onSousSectionChange,
  onSubmit,
  saving,
  typesReponse,
  error,
}) => {
  if (!isOpen) return null;

  const navigate = useNavigate();

  useEffect(() => {
    console.log('formData.type:', formData.type);
  }, [formData.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onClose();
      navigate('/scoringpage');
    } catch (err) {
      // L'erreur est attendue d'être remontée via la prop `error`
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>

        {saving && (
          <div className="mb-4 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Enregistrement en cours...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {sousSections && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sous-section *
              </label>
              <select
                value={formData.axisId || ''}
                onChange={(e) => {
                  onChange({ axisId: e.target.value });
                  if (onSousSectionChange) onSousSectionChange(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
                disabled={saving}
              >
                <option value="">Sélectionner une sous-section</option>
                {sousSections.map((ss) => (
                  <option key={ss.id} value={ss.id}>
                    {ss.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Libellé de la Question *</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => onChange({ label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Saisir le texte de la question"
              required
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Définition</label>
            <textarea
              value={formData.definition}
              onChange={(e) => onChange({ definition: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={2}
              placeholder="Explication détaillée de la question"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de Réponse *</label>
            <select
              value={Object.keys(TYPE_MAPPING).find(key => TYPE_MAPPING[key] === formData.type) || ''}
              onChange={(e) => {
                const backendType = e.target.value;
                const normalized = TYPE_MAPPING[backendType] || backendType.toLowerCase().replace(' ', '_');
                console.log('Type sélectionné:', backendType, '→', normalized);
                onChange({ type: normalized });
              }}
              required
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Choisir un type</option>
              {typesReponse.map((tr) => (
                <option key={tr.idTypeReponse} value={tr.type}>
                  {tr.type}
                </option>
               
              ))}
            </select>
          </div>
          {['choice_multiple', 'choice_single'].includes(formData.type) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options (séparées par des virgules) *
                </label>
                <input
                  type="text"
                  value={formData.options || ''}
                  onChange={(e) => onChange({ options: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: svt, hg, pc"
                  required
                  disabled={saving}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Séparez les options par des virgules. Ex: <code className="bg-gray-100 px-1 rounded">virement, cash, chèque</code>
                </p>
              </div>
            )}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.required}
                onChange={(e) => onChange({ required: e.target.checked })}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                disabled={saving}
              />
              <span className="ml-2 text-sm text-gray-700">Question obligatoire</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.justificationRequired}
                onChange={(e) => onChange({ justificationRequired: e.target.checked })}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                disabled={saving}
              />
              <span className="ml-2 text-sm text-gray-700">Justification requise</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.commentRequired}
                onChange={(e) => onChange({ commentRequired: e.target.checked })}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                disabled={saving}
              />
              <span className="ml-2 text-sm text-gray-700">Commentaire requis</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optionnel)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={2}
              placeholder="Conseils supplémentaires pour les répondants"
              disabled={saving}
            />
          </div>

          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              disabled={saving}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={saving || (!selectedSousSectionId && !formData.axisId)}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Enregistrement...
                </>
              ) : (
                title.includes('Modifier') ? 'Mettre à Jour' : 'Ajouter Question'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionForm;

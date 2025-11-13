import React, { useState, useEffect } from 'react';
import { Loader2, Trash2, X } from 'lucide-react';

type Props = {
  rule: {
    value?: any;
    points?: number;
  };
  index: number;
  onChange: (i: number, field: 'value' | 'points', value: any) => void;
  onDelete: (i: number) => void;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  saving?: boolean;
  error?: string;
};

export const FormBoolean: React.FC<Props> = ({
  rule,
  index,
  onChange,
  onDelete,
  isOpen,
  onClose,
  onSubmit,
  saving = false,
  error,
}) => {
  // États locaux pour les champs
  const [noteRiOui, setNoteRiOui] = useState('');
  const [noteScOui, setNoteScOui] = useState('');
  const [noteRiNon, setNoteRiNon] = useState('');
  const [noteScNon, setNoteScNon] = useState('');

  // Initialiser les valeurs depuis rule.value si elles existent
  useEffect(() => {
    if (rule.value?.rules) {
      const rules = rule.value.rules;
      const ouiRule = rules.find((r: any) => r.condition.includes('oui'));
      const nonRule = rules.find((r: any) => r.condition.includes('non'));
      
      if (ouiRule) {
        setNoteRiOui(ouiRule.noteRi || '');
        setNoteScOui(ouiRule.noteSc || '');
      }
      if (nonRule) {
        setNoteRiNon(nonRule.noteRi || '');
        setNoteScNon(nonRule.noteSc || '');
      }
    }
  }, [rule.value]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('=== FormBoolean handleSubmit ===');
    console.log('noteRiOui:', noteRiOui);
    console.log('noteRiNon:', noteRiNon);

    // Vérifier que les deux RI sont renseignés et valides (entre 1 et 4)
    const riOui = Number(noteRiOui);
    const riNon = Number(noteRiNon);
    
    // Vérification que les valeurs sont renseignées
    if (isNaN(riOui) || riOui === 0 || noteRiOui === '' || noteRiOui === null || noteRiOui === undefined) {
      alert('Veuillez renseigner la note RI pour la réponse "Oui" (entre 1 et 4)');
      return;
    }
    
    if (isNaN(riNon) || riNon === 0 || noteRiNon === '' || noteRiNon === null || noteRiNon === undefined) {
      alert('Veuillez renseigner la note RI pour la réponse "Non" (entre 1 et 4)');
      return;
    }

    // Vérifier les limites
    if (riOui < 1 || riOui > 4) {
      alert('La note RI "Oui" doit être entre 1 et 4');
      return;
    }
    
    if (riNon < 1 || riNon > 4) {
      alert('La note RI "Non" doit être entre 1 et 4');
      return;
    }

    // Pour le type Boolean, on crée un objet spécial qui indique qu'il faut créer 2 règles
    const booleanValue = {
      type: 'boolean_dual_rule',
      rules: [
        {
          condition: "reponse = 'oui'",
          noteRi: riOui,
          noteSc: noteScOui ? Number(noteScOui) : null,
        },
        {
          condition: "reponse = 'non'",
          noteRi: riNon,
          noteSc: noteScNon ? Number(noteScNon) : null,
        }
      ]
    };
    
    console.log('Valeur créée:', booleanValue);
    console.log('Appel DIRECT de onSubmit avec les données');
    
    // Appeler onSubmit directement avec les données
    onSubmit(booleanValue);
  };
  const isEdit = index !== -1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Modifier la règle - Booléen' : 'Ajouter une règle - Booléen'}
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
            <strong>Note :</strong> Pour les questions booléennes, deux règles distinctes seront créées (une pour "Oui" et une pour "Non").
          </p>
        </div>

        {/* Loader */}
        {saving && (
          <div className="mb-4 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-green-600" />
            <span className="text-sm text-green-600">Enregistrement en cours...</span>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
  

          {/* Section Réponse "Oui" */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-md font-medium text-green-900 mb-3">Réponse "Oui"</h4>
            
            {/* Note RI Oui */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note RI (Risque Inhérent) *
              </label>
              <input
                type="number"
                min="1"
                max="4"
                step="0.1"
                value={noteRiOui}
                onChange={(e) => setNoteRiOui(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-center font-medium"
                disabled={saving}
              />
            </div>

            {/* Note SC Oui (optionnel) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note SC (Contrôles) <span className="text-gray-500 text-xs">(optionnel)</span>
              </label>
              <input
                type="number"
                min="1"
                max="4"
                step="0.1"
                value={noteScOui}
                onChange={(e) => setNoteScOui(e.target.value)}
                placeholder="Ex: 1.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>
          </div>

          {/* Section Réponse "Non" */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-md font-medium text-red-900 mb-3">Réponse "Non"</h4>
            
            {/* Note RI Non */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note RI (Risque Inhérent) *
              </label>
              <input
                type="number"
                min="1"
                max="4"
                step="0.1"
                value={noteRiNon}
                onChange={(e) => setNoteRiNon(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-center font-medium"
                disabled={saving}
              />
            </div>

            {/* Note SC Non (optionnel) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note SC (Contrôles) <span className="text-gray-500 text-xs">(optionnel)</span>
              </label>
              <input
                type="number"
                min="1"
                max="4"
                step="0.1"
                value={noteScNon}
                onChange={(e) => setNoteScNon(e.target.value)}
                placeholder="Ex: 1.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>
          </div>

          {/* Boutons */}
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
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                isEdit ? 'Mettre à jour' : 'Créer les 2 règles'
              )}
            </button>
          </div>
        </form>

        {/* Supprimer */}
        {isEdit && (
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

export default FormBoolean;
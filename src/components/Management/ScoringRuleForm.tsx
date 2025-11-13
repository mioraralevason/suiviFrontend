// src/components/Management/ScoringRuleForm.tsx
import React from 'react';

// Import all specific form components
import FormBoolean from './Form_boolean';
import FormChoiceMultiple from './Form_choice_multiple';
import FormChoiceSingle from './Form_choice_single';
import FormRange from './Form_range';
import FormPercentage from './Form_percentage';
import FormDate from './Form_date';
import FormDateRange from './Form_date_range';
import FormTextShort from './Form_text_short';
import FormTextLong from './Form_text_long';
import FormInteger from './Form_integer';
import FormDecimal from './Form_decimal';

type ResponseType = 
  | 'boolean' 
  | 'choice_multiple' 
  | 'choice_single' 
  | 'range' 
  | 'percentage' 
  | 'date' 
  | 'date_range' 
  | 'text_short' 
  | 'text_long' 
  | 'integer' 
  | 'decimal'
  | 'Boolean'
  | 'Choix multiple'
  | 'Choix simple'
  | 'Intervalle'
  | 'Pourcentage'
  | 'Date'
  | 'Intervalle de dates'
  | 'Texte court'
  | 'Texte long'
  | 'Nombre entier'
  | 'Nombre decimal';

type ScoringRule = {
  condition: string;
  noteRi: number;
  noteSc: number | null;
};

type ScoringRuleFormProps = {
  type: ResponseType;
  rule: ScoringRule;
  index: number;
  onChange: (i: number, field: keyof ScoringRule, v: any) => void;
  onDelete: (i: number) => void;
  choiceOptions?: string[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  saving?: boolean;
  error?: string;
  onAddRule?: () => void;
};

export const ScoringRuleForm: React.FC<ScoringRuleFormProps> = ({
  type,
  rule,
  index,
  onChange,
  onDelete,
  choiceOptions = [],
  isOpen,
  onClose,
  onSubmit,
  saving = false,
  error,
  onAddRule,
}) => {
  // Show the add button when onAddRule is provided but isOpen is false
  if (!isOpen && onAddRule) {
    return (
      <button
        onClick={onAddRule}
        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
      >
        + Ajouter une règle
      </button>
    );
  }

  // Show the appropriate form when isOpen is true
  if (isOpen) {
    switch (type) {
      case 'boolean':
      case 'Boolean':
        return (
          <FormBoolean
            rule={rule}
            index={index}
            onChange={onChange}
            onDelete={onDelete}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            saving={saving}
            error={error}
          />
        );
        
      case 'choice_multiple':
      case 'Choix multiple':
        return (
          <FormChoiceMultiple
            rule={rule}
            index={index}
            onChange={onChange}
            onDelete={onDelete}
            choiceOptions={choiceOptions}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            saving={saving}
            error={error}
          />
        );
        
      case 'choice_single':
      case 'Choix simple':
        return (
          <FormChoiceSingle
            rule={rule}
            index={index}
            onChange={onChange}
            onDelete={onDelete}
            choiceOptions={choiceOptions}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            saving={saving}
            error={error}
          />
        );
        
      case 'range':
      case 'Intervalle':
        return (
          <FormRange
            rule={rule}
            index={index}
            onChange={onChange}
            onDelete={onDelete}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            saving={saving}
            error={error}
          />
        );
        
      case 'percentage':
      case 'Pourcentage':
        return (
          <FormPercentage
            rule={rule}
            index={index}
            onChange={onChange}
            onDelete={onDelete}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            saving={saving}
            error={error}
          />
        );
        
      case 'date':
      case 'Date':
        return (
          <FormDate
            rule={rule}
            index={index}
            onChange={onChange}
            onDelete={onDelete}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            saving={saving}
            error={error}
          />
        );
        
      case 'date_range':
      case 'Intervalle de dates':
        return (
          <FormDateRange
            rule={rule}
            index={index}
            onChange={onChange}
            onDelete={onDelete}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            saving={saving}
            error={error}
          />
        );
        
      case 'text_short':
      case 'Texte court':
        return (
          <FormTextShort
            rule={rule}
            index={index}
            onChange={onChange}
            onDelete={onDelete}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            saving={saving}
            error={error}
          />
        );
        
      case 'text_long':
      case 'Texte long':
        return (
          <FormTextLong
            rule={rule}
            index={index}
            onChange={onChange}
            onDelete={onDelete}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            saving={saving}
            error={error}
          />
        );
        
      case 'integer':
      case 'Nombre entier':
        return (
          <FormInteger
            rule={rule}
            index={index}
            onChange={onChange}
            onDelete={onDelete}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            saving={saving}
            error={error}
          />
        );
        
      case 'decimal':
      case 'Nombre decimal':
        return (
          <FormDecimal
            rule={rule}
            index={index}
            onChange={onChange}
            onDelete={onDelete}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            saving={saving}
            error={error}
          />
        );
        
      default:
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Type non supporté</h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600">Le type "{type}" n'est pas supporté.</p>
            </div>
          </div>
        );
    }
  }

  return null;
};

export default ScoringRuleForm;
import React, { useState } from 'react';
import ScoringRuleForm from './ScoringRuleForm';

const ExampleScoringRuleManager = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentType, setCurrentType] = useState<'boolean' | 'choice_multiple' | 'choice_single' | 'range' | 'percentage' | 'date' | 'date_range' | 'text_short' | 'text_long' | 'integer' | 'decimal'>('boolean');
  const [currentRule, setCurrentRule] = useState({ value: {}, points: 0 });
  const [rules, setRules] = useState<any[]>([]);
  
  const handleOpenForm = (type: any) => {
    setCurrentType(type);
    setCurrentRule({ value: {}, points: 0 });
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };
  
  const handleRuleChange = (index: number, field: 'value' | 'points', value: any) => {
    const updatedRules = [...rules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setRules(updatedRules);
  };
  
  const handleAddRule = () => {
    const newRule = { 
      id: Date.now(), 
      type: currentType, 
      value: currentRule.value, 
      points: currentRule.points 
    };
    setRules([...rules, newRule]);
    setIsFormOpen(false);
  };
  
  const handleDeleteRule = (index: number) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    setRules(updatedRules);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Gestion des règles de notation</h2>
        
        {/* Boutons pour ouvrir différents types de formulaires */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(['boolean', 'choice_multiple', 'choice_single', 'range', 'percentage', 'date', 'date_range', 'text_short', 'text_long', 'integer', 'decimal'] as const).map(type => (
            <button
              key={type}
              onClick={() => handleOpenForm(type)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Formulaire de règle */}
      <ScoringRuleForm
        type={currentType}
        rule={currentRule}
        index={-1}
        onChange={(i, field, value) => setCurrentRule({ ...currentRule, [field]: value })}
        onDelete={() => {}}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleAddRule}
        saving={false}
      />

      {/* Liste des règles */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Règles existantes</h3>
        {rules.map((rule, index) => (
          <div key={rule.id} className="p-3 border border-gray-200 rounded mb-2 flex justify-between items-center">
            <div>
              <span className="font-medium">{rule.type}</span>: {JSON.stringify(rule.value)} - {rule.points} points
            </div>
            <button 
              onClick={() => handleDeleteRule(index)}
              className="text-red-500 hover:text-red-700"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExampleScoringRuleManager;
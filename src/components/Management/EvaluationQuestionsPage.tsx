import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, Check, ArrowLeft, Settings, Circle as HelpCircle } from 'lucide-react';
import { Question } from '../../types';

interface EvaluationQuestionsPageProps {
  evaluationId: string;
  onBack: () => void;
  onNext: () => void;
}

const EvaluationQuestionsPage: React.FC<EvaluationQuestionsPageProps> = ({ 
  evaluationId, 
  onBack, 
  onNext 
}) => {
  const { axes, questions, addQuestion } = useData();
  const [selectedAxis, setSelectedAxis] = useState<string>(axes[0]?.id || '');
  const [selectedQuestions, setSelectedQuestions] = useState<Record<string, string[]>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    label: '',
    definition: '',
    type: 'boolean' as Question['type'],
    required: true,
    justificationRequired: false,
    notes: ''
  });

  useEffect(() => {
    // Initialiser avec toutes les questions existantes sélectionnées
    const initialSelection: Record<string, string[]> = {};
    axes.forEach(axis => {
      const axisQuestions = questions.filter(q => q.axisId === axis.id);
      initialSelection[axis.id] = axisQuestions.map(q => q.id);
    });
    setSelectedQuestions(initialSelection);
  }, [axes, questions]);

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions(prev => ({
      ...prev,
      [selectedAxis]: prev[selectedAxis]?.includes(questionId)
        ? prev[selectedAxis].filter(id => id !== questionId)
        : [...(prev[selectedAxis] || []), questionId]
    }));
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const question: Question = {
      id: `Q_${Date.now()}`,
      axisId: selectedAxis,
      ...newQuestion,
      scoring: {
        mapping: [{ value: true, points: 5 }, { value: false, points: 0 }],
        weightBySector: [{ sector: 'banque', weight: 1.0 }]
      }
    };
    
    addQuestion(question);
    
    // Ajouter automatiquement la nouvelle question à la sélection
    setSelectedQuestions(prev => ({
      ...prev,
      [selectedAxis]: [...(prev[selectedAxis] || []), question.id]
    }));
    
    setShowAddModal(false);
    setNewQuestion({
      label: '',
      definition: '',
      type: 'boolean',
      required: true,
      justificationRequired: false,
      notes: ''
    });
  };

  const axisQuestions = questions.filter(q => q.axisId === selectedAxis);
  const totalSelected = Object.values(selectedQuestions).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sélection des Questions</h1>
            <p className="text-gray-600">Choisir les questions pour cette évaluation</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {totalSelected} questions sélectionnées
          </div>
          <button
            onClick={onNext}
            disabled={totalSelected === 0}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuer vers Notation
          </button>
        </div>
      </div>

      {/* Navigation par axes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Axes d'Évaluation</h2>
        <div className="flex flex-wrap gap-2">
          {axes.map((axis) => {
            const axisSelectedCount = selectedQuestions[axis.id]?.length || 0;
            const axisQuestionsCount = questions.filter(q => q.axisId === axis.id).length;
            
            return (
              <button
                key={axis.id}
                onClick={() => setSelectedAxis(axis.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedAxis === axis.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{axis.name}</span>
                  <span className="text-sm">
                    ({axisSelectedCount}/{axisQuestionsCount})
                  </span>
                  {axisSelectedCount > 0 && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Questions de l'axe sélectionné */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Questions - {axes.find(a => a.id === selectedAxis)?.name}
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Ajouter Question</span>
          </button>
        </div>

        <div className="space-y-4">
          {axisQuestions.map((question) => (
            <div key={question.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  checked={selectedQuestions[selectedAxis]?.includes(question.id) || false}
                  onChange={() => handleQuestionToggle(question.id)}
                  className="mt-1 text-green-600 focus:ring-green-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900">{question.label}</h3>
                    {question.required && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                        Obligatoire
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{question.definition}</p>
                  {question.notes && (
                    <div className="flex items-start space-x-2 text-sm text-gray-500">
                      <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p>{question.notes}</p>
                    </div>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                    <span>Type: {question.type}</span>
                    <span>Points: {question.scoring.mapping.length} règles</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {axisQuestions.length === 0 && (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune question</h3>
              <p className="text-gray-600 mb-4">Aucune question n'existe pour cet axe.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Créer la première question
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'ajout de question */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Ajouter Nouvelle Question</h3>
            
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Libellé de la Question *
                </label>
                <input
                  type="text"
                  value={newQuestion.label}
                  onChange={(e) => setNewQuestion({...newQuestion, label: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Définition
                </label>
                <textarea
                  value={newQuestion.definition}
                  onChange={(e) => setNewQuestion({...newQuestion, definition: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de Réponse *
                </label>
                <select
                  value={newQuestion.type}
                  onChange={(e) => setNewQuestion({...newQuestion, type: e.target.value as Question['type']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="boolean">Oui/Non</option>
                  <option value="percentage">Pourcentage</option>
                  <option value="numeric">Numérique</option>
                  <option value="text">Texte</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newQuestion.required}
                    onChange={(e) => setNewQuestion({...newQuestion, required: e.target.checked})}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Question obligatoire</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newQuestion.justificationRequired}
                    onChange={(e) => setNewQuestion({...newQuestion, justificationRequired: e.target.checked})}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Justification requise</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optionnel)
                </label>
                <textarea
                  value={newQuestion.notes}
                  onChange={(e) => setNewQuestion({...newQuestion, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Ajouter Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationQuestionsPage;
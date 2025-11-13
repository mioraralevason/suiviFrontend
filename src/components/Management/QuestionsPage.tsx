// src/pages/QuestionsPage.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useQuestions, QuestionFormData } from '../hooks/useQuestions';
import QuestionForm from './QuestionForm';
import {
  Plus, Loader2, ChevronDown, Edit, Trash2, Settings, HelpCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SectionWithNested, SousSection, Question } from '../../types';

const QuestionsPage: React.FC = () => {
  const { sectionsWithNested, getSousSectionsForSection, getQuestionsForSousSection } = useData();
  const {
    typesReponse,
    saving,
    error,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    prepareEditForm,
    getDefaultFormData,
  } = useQuestions();

  // États
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [expandedSousSections, setExpandedSousSections] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<QuestionFormData>(
    getDefaultFormData('', typesReponse[0]?.type || 'texte court')
  );

  // Sélectionne la première section au chargement
  useEffect(() => {
    if (sectionsWithNested.length > 0 && !selectedSectionId) {
      setSelectedSectionId(sectionsWithNested[0].id);
    }
  }, [sectionsWithNested, selectedSectionId]);

  // Mémorisation
  const selectedSection = useMemo(
    () => sectionsWithNested.find(s => s.id === selectedSectionId),
    [sectionsWithNested, selectedSectionId]
  );

  const sousSections: SousSection[] = useMemo(
    () => getSousSectionsForSection(selectedSectionId),
    [selectedSectionId, getSousSectionsForSection]
  );

  const allQuestionsInSection = useMemo(
    () => sousSections.flatMap(ss => getQuestionsForSousSection(ss.id)),
    [sousSections, getQuestionsForSousSection]
  );

  // Réinitialise le formulaire
  const resetForm = useCallback(() => {
    setFormData(getDefaultFormData('', typesReponse[0]?.type || 'texte court'));
    setEditingQuestion(null);
  }, [typesReponse, getDefaultFormData]);

  // Ouvre le modal d’ajout
  const openAddModal = useCallback((axisId?: string) => {
    if (!selectedSectionId) {
      toast.error('Sélectionnez une section d’abord');
      return;
    }
    const id = axisId || sousSections[0]?.id || '';
    setFormData(getDefaultFormData(id, typesReponse[0]?.type || 'texte court'));
    setShowAddModal(true);
  }, [selectedSectionId, sousSections, typesReponse, getDefaultFormData]);

  // Ouvre le modal d’édition
  const handleEditQuestion = useCallback((question: Question) => {
    setEditingQuestion(question);
    setFormData(prepareEditForm(question));
    setShowAddModal(true);
  }, [prepareEditForm]);

  // Soumission
  const handleSubmit = useCallback(async (data: QuestionFormData) => {
    try {
      if (editingQuestion) {
        await handleUpdateQuestion(editingQuestion.id, data);
      } else {
        await handleAddQuestion(data, true); // Redirect to scoring after adding new question
      }
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      // Erreur gérée dans le hook
    }
  }, [editingQuestion, handleUpdateQuestion, handleAddQuestion, resetForm]);

  // Icône par type
  const getTypeIcon = useCallback((type: string) => {
    const t = type.toLowerCase();
    if (t.includes('boolean')) return 'Yes/No';
    if (t.includes('pourcentage')) return '%';
    if (t.includes('nombre')) return '#';
    if (t.includes('texte court')) return 'T';
    if (t.includes('date')) return 'Date';
    if (t.includes('choix multiple')) return 'Checkboxes';
    if (t.includes('choix simple')) return 'Radio';
    return '?';
  }, []);

  // Titre du modal
  const modalTitle = editingQuestion ? 'Modifier Question' : 'Ajouter Nouvelle Question';

  if (sectionsWithNested.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Questions</h1>
          <p className="text-gray-600">Configurez les questions et leurs paramètres</p>
        </div>
        <button
          onClick={() => openAddModal()}
          className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          disabled={saving}
        >
          <Plus className="h-5 w-5" />
          <span>Ajouter Question</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Sélection de section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Section (Axe d'Évaluation)</h2>
        <div className="flex flex-wrap gap-3">
          {sectionsWithNested.map((section) => {
            const count = getSousSectionsForSection(section.id)
              .flatMap(ss => getQuestionsForSousSection(ss.id)).length;
            return (
              <button
                key={section.id}
                onClick={() => setSelectedSectionId(section.id)}
                className={`px-5 py-3 rounded-lg font-medium transition ${
                  selectedSectionId === section.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {section.name} <span className="ml-2 text-sm opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sous-sections & questions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Sous-sections de <span className="text-green-600">{selectedSection?.name}</span>
            </h2>
            <span className="text-sm text-gray-500">
              {allQuestionsInSection.length} question{allQuestionsInSection.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {sousSections.length === 0 ? (
            <div className="p-12 text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucune sous-section. Ajoutez des questions pour commencer.</p>
            </div>
          ) : (
            sousSections.map((sousSection) => {
              const questions = getQuestionsForSousSection(sousSection.id);
              const isExpanded = expandedSousSections.has(sousSection.id);

              return (
                <div key={sousSection.id}>
                  {/* En-tête sous-section */}
                  <div
                    className="p-6 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition"
                    onClick={() =>
                      setExpandedSousSections(prev => {
                        const next = new Set(prev);
                        if (next.has(sousSection.id)) next.delete(sousSection.id);
                        else next.add(sousSection.id);
                        return next;
                      })
                    }
                  >
                    <div className="flex items-center gap-3">
                      <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      <h3 className="font-medium text-gray-900">{sousSection.name}</h3>
                      <span className="text-sm text-gray-500">({questions.length})</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddModal(sousSection.id);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition"
                      disabled={saving}
                    >
                      + Question
                    </button>
                  </div>

                  {/* Questions */}
                  {isExpanded && (
                    <div className="px-6 pb-6 space-y-4">
                      {questions.length === 0 ? (
                        <p className="text-center text-gray-500 py-8 italic">
                          Aucune question. Cliquez sur "+ Question" pour commencer.
                        </p>
                      ) : (
                        questions.map((q) => (
                          <div key={q.id} className="bg-gray-50 rounded-lg p-5">
                            <div className="flex items-start justify-between gap-6">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-xs font-medium">
                                    {getTypeIcon(q.type)}
                                  </span>
                                  <h4 className="font-medium text-gray-900">{q.label}</h4>
                                  {q.required && (
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                      Obligatoire
                                    </span>
                                  )}
                                </div>
                                {q.definition && (
                                  <p className="text-sm text-gray-600">{q.definition}</p>
                                )}
                                {q.notes && (
                                  <div className="flex items-start gap-2 text-sm text-gray-500">
                                    <HelpCircle className="h-4 w-4 mt-0.5" />
                                    <p>{q.notes}</p>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditQuestion(q)}
                                  className="p-2 text-green-600 hover:bg-green-100 rounded transition"
                                  title="Modifier"
                                  disabled={saving}
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                                  title="Supprimer"
                                  disabled={saving}
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      <QuestionForm
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title={modalTitle}
        formData={formData}
        onChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
        sousSections={sousSections}
        onSubmit={handleSubmit}
        saving={saving}
        typesReponse={typesReponse}
        error={error}
      />
    </div>
  );
};

export default QuestionsPage;
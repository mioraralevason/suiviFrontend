// src/components/Management/ScoringPage.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';
import { ScoringRuleForm } from './ScoringRuleForm';
import { useScoring } from '../hooks/useScoring';
import { useData } from '../../context/DataContext';
import toast from 'react-hot-toast';

const typeLabels: Record<string, string> = {
  boolean: 'Oui/Non',
  percentage: 'Pourcentage',
  range: 'Intervalle',
  dropdown: 'Liste déroulante',
  numeric: 'Numérique',
  'text_short': 'Texte court',
  'text_long': 'Texte long',
  'integer': 'Nombre entier',
  'decimal': 'Nombre décimal',
  'date': 'Date',
  'date_range': 'Intervalle de dates',
  'choice_multiple': 'Choix multiple',
  'choice_single': 'Choix simple',
};

interface ScoringPageProps {
  selectedQuestionId?: string;
}

export default function ScoringPage({ selectedQuestionId: propSelectedQuestionId }: ScoringPageProps = {}) {
  const { sectionsWithNested, getSousSectionsForSection, getQuestionsForSousSection } = useData();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedSousSections, setExpandedSousSections] = useState<Set<string>>(new Set());
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(propSelectedQuestionId || '');

  const question = sectionsWithNested
    .flatMap(s => getSousSectionsForSection(s.id))
    .flatMap(ss => getQuestionsForSousSection(ss.id))
    .find(q => q.id === selectedQuestionId);

  const {
    rules,
    loading,
    saving,
    error,
    saveRule,
    deleteRule,
    refresh,
  } = useScoring(selectedQuestionId, question?.type);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<-1 | number>(-1);
  const [saved, setSaved] = useState(false);

  // RÈGLE PAR DÉFAUT SÉCURISÉE
  const defaultRule = { condition: '', noteRi: 1, noteSc: null };
  const currentRule = editingIndex !== -1 ? rules[editingIndex] : defaultRule;

  useEffect(() => {
    if (propSelectedQuestionId && !selectedQuestionId) {
      setSelectedQuestionId(propSelectedQuestionId);
    }
  }, [propSelectedQuestionId, selectedQuestionId]);

  useEffect(() => {
    if (selectedQuestionId) refresh();
  }, [selectedQuestionId, refresh]);

  const openModal = (index: number = -1) => {
    setEditingIndex(index);
    setModalOpen(true);
  };

  const handleSaveRule = async (data?: any) => {
    if (!data) return;

    try {
      if (data.type === 'multiple_rules' || data.type === 'boolean_dual_rule') {
        for (const ruleData of data.rules) {
          const rule = {
            idRegleNotation: '',
            condition: ruleData.condition,
            noteRi: ruleData.noteRi,
            noteSc: ruleData.noteSc,
          };
          await saveRule(rule, false);
        }
      } else if (data.type === 'single_rule') {
        const rule = {
          idRegleNotation: editingIndex !== -1 ? rules[editingIndex].idRegleNotation : '',
          condition: data.rule.condition,
          noteRi: data.rule.noteRi,
          noteSc: data.rule.noteSc,
        };
        await saveRule(rule, editingIndex !== -1);
      }

      setModalOpen(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = (index: number) => {
    deleteRule(rules[index].idRegleNotation);
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSousSection = (id: string) => {
    setExpandedSousSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // CALCUL DU RR
  const getRisqueResiduel = (noteRi: number, noteSc: number | null) => {
    return noteRi * (noteSc || 1);
  };

  const getColorClass = (rr: number) => {
    return rr >= 6
      ? { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700' }
      : { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700' };
  };

  // FORMATAGE DE LA CONDITION
  const formatConditionDisplay = (condition: string) => {
    const trimmed = condition.trim();
    if (trimmed === "reponse = 'oui'") return 'Oui';
    if (trimmed === "reponse = 'non'") return 'Non';
    if (trimmed.includes('>')) return `Supérieur à ${trimmed.split('>')[1].trim()}`;
    if (trimmed.includes('<')) return `Inférieur à ${trimmed.split('<')[1].trim()}`;
    if (trimmed.includes('=')) return `Égal à ${trimmed.split('=')[1].replace(/'/g, '').trim()}`;
    return trimmed;
  };

  if (sectionsWithNested.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Configuration de la Notation</h1>
          <p className="text-gray-600">Définissez les règles de scoring pour chaque question du questionnaire</p>
        </header>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Modifications enregistrées avec succès</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow border border-gray-200 sticky top-6">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                <p className="text-sm text-gray-500 mt-1">Structure → Sous-section → Question</p>
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                {(() => {
                  if (!expandedSections.size) {
                    return (
                      <div className="p-2">
                        <h3 className="text-sm font-semibold text-gray-700 px-4 py-2">Sections</h3>
                        {sectionsWithNested.map(section => (
                          <button
                            key={section.id}
                            onClick={() => toggleSection(section.id)}
                            className="w-full text-left p-3 flex justify-between items-center hover:bg-gray-50 transition"
                          >
                            <span className="font-medium text-gray-900">{section.name}</span>
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          </button>
                        ))}
                      </div>
                    );
                  }

                  const selectedSectionId = Array.from(expandedSections)[0];
                  const selectedSection = sectionsWithNested.find(s => s.id === selectedSectionId);
                  const sousSections = selectedSection ? getSousSectionsForSection(selectedSection.id) : [];

                  if (selectedSection && !expandedSousSections.size) {
                    return (
                      <div className="p-2">
                        <div className="flex items-center gap-2 px-4 py-2">
                          <button
                            onClick={() => setExpandedSections(new Set())}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            {selectedSection.name}
                          </button>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-700">Sous-sections</span>
                        </div>
                        {sousSections.map(ss => (
                          <button
                            key={ss.id}
                            onClick={() => toggleSousSection(ss.id)}
                            className="w-full text-left p-3 flex justify-between items-center hover:bg-gray-50 transition"
                          >
                            <span className="font-medium text-gray-900">{ss.name}</span>
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          </button>
                        ))}
                      </div>
                    );
                  }

                  const selectedSousSectionId = Array.from(expandedSousSections)[0];
                  const selectedSousSection = sousSections.find(ss => ss.id === selectedSousSectionId);
                  const questions = selectedSousSection ? getQuestionsForSousSection(selectedSousSection.id) : [];

                  if (selectedSousSection) {
                    return (
                      <div className="p-2">
                        <div className="flex items-center gap-2 px-4 py-2">
                          <button
                            onClick={() => setExpandedSections(new Set())}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            {selectedSection.name}
                          </button>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                          <button
                            onClick={() => setExpandedSousSections(new Set())}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            {selectedSousSection.name}
                          </button>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-700">Questions</span>
                        </div>
                        {questions.map(q => (
                          <button
                            key={q.id}
                            onClick={() => setSelectedQuestionId(q.id)}
                            className={`w-full text-left p-3 transition ${
                              selectedQuestionId === q.id
                                ? 'bg-green-50 text-green-900'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <p className="font-medium truncate">{q.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {typeLabels[q.type] || q.type}
                            </p>
                          </button>
                        ))}
                      </div>
                    );
                  }

                  return null;
                })()}
              </div>
            </div>
          </div>

          {/* Éditeur */}
          <div className="lg:col-span-2">
            {!question ? (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
                <div className="max-w-sm mx-auto space-y-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <ChevronRight className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Aucune question sélectionnée</h3>
                  <p className="text-gray-500">Sélectionnez une question dans la navigation à gauche</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">{question.label}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {typeLabels[question.type]}
                        </span>
                        {rules.length > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            {rules.length} règle{rules.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => openModal()}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                    >
                      <Plus className="w-4 w-4" />
                      Nouvelle règle
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {loading ? (
                    <div className="text-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto" />
                      <p className="text-gray-500 mt-3">Chargement des règles...</p>
                    </div>
                  ) : rules.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="max-w-sm mx-auto space-y-3">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto border border-gray-200">
                          <Plus className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Aucune règle définie</h3>
                        <p className="text-sm text-gray-500">Créez votre première règle de notation</p>
                        <button
                          onClick={() => openModal()}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm mt-2"
                        >
                          <Plus className="w-4 w-4" />
                          Créer une règle
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rules.map((rule, i) => {
                        const rr = getRisqueResiduel(rule.noteRi, rule.noteSc);
                        const colors = getColorClass(rr);
                        const condition = formatConditionDisplay(rule.condition);

                        return (
                          <div
                            key={rule.idRegleNotation}
                            className="group flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition"
                          >
                            {/* RR */}
                            <div className="flex-shrink-0">
                              <div className={`w-16 h-16 ${colors.bg} ${colors.border} rounded-lg flex flex-col items-center justify-center`}>
                                <div className={`text-2xl font-bold ${colors.text}`}>
                                  {rr}
                                </div>
                                <div className="text-xs font-medium text-gray-600">RR</div>
                              </div>
                            </div>

                            {/* Condition + RI/SC */}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Condition
                              </p>
                              <p className="font-mono text-sm text-gray-900 truncate">
                                {condition}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                RI: <span className="font-medium">{rule.noteRi}</span>
                                {rule.noteSc !== null && (
                                  <> | SC: <span className="font-medium">{rule.noteSc}</span></>
                                )}
                                {rule.noteSc === null && (
                                  <> | SC: <span className="font-medium text-green-600">1 (parfait)</span></>
                                )}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={() => openModal(i)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                                title="Modifier"
                              >
                                <Edit2 className="w-4 w-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleDelete(i)}
                                className="p-2 hover:bg-red-50 rounded-lg transition"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 w-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {question && (
          <ScoringRuleForm
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            type={question.type}
            rule={currentRule}
            index={editingIndex}
            onDelete={handleDelete}
            choiceOptions={question.dropdownOptions || []}
            onSubmit={handleSaveRule}
            saving={saving}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
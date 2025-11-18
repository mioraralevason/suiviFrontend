// src/components/Assessment/QuestionnairePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Question } from '../../types';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

type AnswerValue = string | number | boolean | string[] | undefined;
interface Answer {
  questionId: string;
  value: AnswerValue;
  justification?: string;
  comment?: string;
}

const QuestionnairePage: React.FC = () => {
  const { user } = useAuth();
  const { sectionsWithNested } = useData();

  const [answers, setAnswers] = useState<{ [questionId: string]: Answer }>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSubSections, setOpenSubSections] = useState<{ [key: string]: boolean }>({});

  const sections = sectionsWithNested || [];
  const currentSection = sections[currentSectionIndex];
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === sections.length - 1;

  // Ouvrir la première sous-section par défaut
  useEffect(() => {
    if (currentSection?.sousSections?.[0]) {
      setOpenSubSections({ [currentSection.sousSections[0].id]: true });
    }
  }, [currentSection]);

  // Chargement des réponses précédentes
  useEffect(() => {
    if (!user?.token || sections.length === 0) return;

    const loadAnswers = async () => {
      const institutionId = user.institutionId || user.id;
      if (!institutionId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:9090/api/responses/institution/${institutionId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const loaded: Record<string, Answer> = {};
          data.forEach((r: any) => {
            loaded[r.questionId] = {
              questionId: r.questionId,
              value: r.value,
              justification: r.justification || '',
              comment: r.comment || '',
            };
          });
          setAnswers(loaded);
        }
      } catch (err) {
        console.error('Erreur chargement réponses:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnswers();
  }, [user?.token, user?.institutionId, user?.id, sections.length]);

  const toggleSubSection = (subSectionId: string) => {
    setOpenSubSections(prev => ({
      ...prev,
      [subSectionId]: !prev[subSectionId]
    }));
  };

  const handleAnswerChange = useCallback((
    questionId: string,
    value: AnswerValue,
    field: 'value' | 'justification' | 'comment' = 'value'
  ) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], questionId, [field]: value },
    }));
  }, []);

  const saveProgress = async () => {
    if (saving || Object.keys(answers).length === 0) return;
    setSaving(true);
    try {
      await fetch('http://localhost:9090/api/responses/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          responses: Object.values(answers).map(a => ({
            questionId: a.questionId,
            value: a.value,
            justification: a.justification,
            comment: a.comment,
          })),
        }),
      });
      toast.success('Sauvegardé');
    } catch (err) {
      toast.error('Échec sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const goNext = () => {
    saveProgress();
    setCurrentSectionIndex(i => Math.min(i + 1, sections.length - 1));
  };

  const goPrev = () => {
    saveProgress();
    setCurrentSectionIndex(i => Math.max(i - 1, 0));
  };

  const handleFinalSubmit = async () => {
    const missing = sections
      .flatMap(s => s.sousSections.flatMap(ss => ss.questions))
      .filter(q => q.required && !answers[q.id]?.value)
      .map(q => q.label);

    if (missing.length > 0) {
      toast.error(`Il manque ${missing.length} réponse(s) obligatoire(s)`);
      return;
    }

    await saveProgress();
    toast.success('Questionnaire soumis avec succès !', {
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      duration: 5000,
    });
  };

  const renderQuestionInput = (question: Question) => {
    const val = answers[question.id]?.value;

    switch (question.type) {
      case 'boolean':
        return (
          <RadioGroup onValueChange={(v) => handleAnswerChange(question.id, v === 'true')} value={val !== undefined ? String(val) : ''}>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id={`${question.id}-oui`} />
                <Label htmlFor={`${question.id}-oui`} className="text-xs">Oui</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id={`${question.id}-non`} />
                <Label htmlFor={`${question.id}-non`} className="text-xs">Non</Label>
              </div>
            </div>
          </RadioGroup>
        );

      case 'choice_single':
        return (
          <RadioGroup onValueChange={(v) => handleAnswerChange(question.id, v)} value={val as string || ''}>
            {question.dropdownOptions?.map(opt => (
              <div key={opt} className="flex items-center space-x-2">
                <RadioGroupItem value={opt} id={`${question.id}-${opt}`} />
                <Label htmlFor={`${question.id}-${opt}`} className="text-xs">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'choice_multiple':
        return (
          <div className="space-y-1">
            {question.dropdownOptions?.map(opt => (
              <div key={opt} className="flex items-center space-x-2">
                <Checkbox
                  checked={(val as string[])?.includes(opt) || false}
                  onCheckedChange={(checked) => {
                    const arr = (val as string[]) || [];
                    const newArr = checked ? [...arr, opt] : arr.filter(x => x !== opt);
                    handleAnswerChange(question.id, newArr);
                  }}
                />
                <Label className="text-xs">{opt}</Label>
              </div>
            ))}
          </div>
        );

      case 'percentage':
      case 'integer':
      case 'decimal':
        return <Input type="number" value={val ?? ''} onChange={e => handleAnswerChange(question.id, e.target.value ? Number(e.target.value) : undefined)} placeholder="Nombre" className="text-xs h-8" />;

      case 'date':
        return <Input type="date" value={val as string || ''} onChange={e => handleAnswerChange(question.id, e.target.value)} className="text-xs h-8" />;

      case 'text_short':
        return <Input type="text" value={val as string || ''} onChange={e => handleAnswerChange(question.id, e.target.value)} placeholder="Réponse" className="text-xs h-8" />;

      case 'text_long':
        return <Textarea value={val as string || ''} onChange={e => handleAnswerChange(question.id, e.target.value)} rows={2} placeholder="Réponse" className="text-xs" />;

      default:
        return <p className="text-red-600 text-xs">Type non supporté : {question.type}</p>;
    }
  };

  // Calculer le nombre de réponses dans une sous-section
  const getSubSectionProgress = (subSection: any) => {
    const total = subSection.questions.length;
    const answered = subSection.questions.filter((q: Question) => answers[q.id]?.value !== undefined).length;
    return { answered, total };
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-xl">Chargement...</div>;
  if (sections.length === 0) return <div className="text-center py-20 text-lg text-gray-600">Aucune section disponible.</div>;

  return (
    <div className="container mx-auto max-w-6xl p-4">
      {/* Barre de progression */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
          <span>Section {currentSectionIndex + 1} / {sections.length}</span>
          <span className="text-green-700">{currentSection.name}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${((currentSectionIndex + 1) / sections.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Section principale */}
      <div className="bg-white rounded-lg shadow-lg p-5">
        <div className="mb-5 pb-3 border-b-2 border-green-600">
          <div className="flex items-center gap-2">
            <span className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">SECTION</span>
            <h1 className="text-xl font-bold text-green-800">{currentSection.name}</h1>
          </div>
        </div>

        {/* Accordéon des sous-sections */}
        <div className="space-y-2">
          {currentSection.sousSections.map((ss, index) => {
            const { answered, total } = getSubSectionProgress(ss);
            const isOpen = openSubSections[ss.id];
            const isComplete = answered === total;

            return (
              <div key={ss.id} className="border border-gray-300 rounded-lg overflow-hidden">
                {/* En-tête de la sous-section */}
                <button
                  onClick={() => toggleSubSection(ss.id)}
                  className="w-full bg-green-50 p-2.5 flex items-center justify-between hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                      SS{index + 1}
                    </span>
                    <h2 className="text-sm font-semibold text-gray-800 text-left">{ss.libelle}</h2>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium ${isComplete ? 'text-green-600' : 'text-gray-600'}`}>
                      {answered}/{total}
                    </span>
                    {isComplete && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Contenu - Liste des questions */}
                {isOpen && (
                  <div className="bg-gray-50 p-2 space-y-2">
                    {ss.questions.map((q, qIndex) => (
                      <div key={q.id} className="bg-white border-l-2 border-blue-400 rounded p-2">
                        {/* Question */}
                        <div className="mb-2">
                          <Label className="text-xs font-semibold text-gray-800 flex items-start gap-1">
                            <span className="text-blue-600 flex-shrink-0">{qIndex + 1}.</span>
                            <span className="flex-1">
                              {q.label} 
                              {q.required && <span className="text-red-600 ml-1">*</span>}
                            </span>
                          </Label>
                          {q.definition && (
                            <p className="text-xs text-gray-500 italic mt-0.5 ml-4">{q.definition}</p>
                          )}
                        </div>

                        {/* Input de réponse */}
                        <div className="ml-4 bg-gray-50 p-1.5 rounded">
                          {renderQuestionInput(q)}
                        </div>

                        {/* Justification */}
                        {q.justificationRequired && (
                          <div className="mt-1.5 ml-4 bg-blue-50 p-1.5 rounded border-l-2 border-blue-400">
                            <Label className="text-xs font-medium text-blue-900 mb-0.5 block">
                              📝 Justification <span className="text-red-600">*</span>
                            </Label>
                            <Textarea
                              value={answers[q.id]?.justification || ''}
                              onChange={e => handleAnswerChange(q.id, e.target.value, 'justification')}
                              rows={2}
                              className="bg-white text-xs"
                              placeholder="Justifiez..."
                            />
                          </div>
                        )}

                        {/* Commentaire */}
                        {q.commentRequired && (
                          <div className="mt-1.5 ml-4 bg-amber-50 p-1.5 rounded border-l-2 border-amber-400">
                            <Label className="text-xs font-medium text-amber-900 mb-0.5 block">
                              💬 Commentaire
                            </Label>
                            <Textarea
                              value={answers[q.id]?.comment || ''}
                              onChange={e => handleAnswerChange(q.id, e.target.value, 'comment')}
                              rows={2}
                              className="bg-white text-xs"
                              placeholder="Commentaire..."
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-300">
          <Button onClick={goPrev} disabled={isFirstSection} variant="outline" size="sm" className="px-6">
            <ChevronLeft className="mr-1 w-4 h-4" /> Précédent
          </Button>

          <div className="text-xs text-gray-600">
            {saving && "💾 Sauvegarde..."}
          </div>

          {isLastSection ? (
            <Button onClick={handleFinalSubmit} size="sm" className="bg-green-600 hover:bg-green-700 text-white px-8 font-semibold">
              ✓ Soumettre
            </Button>
          ) : (
            <Button onClick={goNext} size="sm" className="bg-green-600 hover:bg-green-700 text-white px-6">
              Suivant <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionnairePage;
// src/components/Assessment/QuestionnairePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { Question, SectionWithNested, SousSection } from '../../types';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import toast from 'react-hot-toast';

// Define a more specific type for answer values
type AnswerValue = string | number | boolean | string[] | undefined;

interface Answer {
  questionId: string;
  value: AnswerValue;
  justification?: string;
  comment?: string;
}

const QuestionnairePage: React.FC = () => {
  const { sectionsWithNested, loadSectionsWithNested } = useData();
  const [answers, setAnswers] = useState<{[questionId: string]: Answer}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      await loadSectionsWithNested();
      setLoading(false);
    };
    fetchQuestions();
  }, [loadSectionsWithNested]);

  const handleAnswerChange = useCallback((questionId: string, value: AnswerValue, field: 'value' | 'justification' | 'comment' = 'value') => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        [field]: value,
      },
    }));
  }, []);

  const renderQuestionInput = (question: Question) => {
    const currentAnswer: AnswerValue = answers[question.id]?.value;

    switch (question.type) {
      case 'boolean':
        return (
          <RadioGroup
            onValueChange={(val) => handleAnswerChange(question.id, val === 'true')}
            value={currentAnswer !== undefined ? String(currentAnswer) : undefined}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`${question.id}-true`} />
              <Label htmlFor={`${question.id}-true`}>Oui</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`${question.id}-false`} />
              <Label htmlFor={`${question.id}-false`}>Non</Label>
            </div>
          </RadioGroup>
        );
      case 'choice_single':
        return (
          <RadioGroup
            onValueChange={(val) => handleAnswerChange(question.id, val)}
            value={currentAnswer as string || ''}
          >
            {question.dropdownOptions?.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'choice_multiple':
        return (
          <div>
            {question.dropdownOptions?.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={(currentAnswer as string[])?.includes(option) || false}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...((currentAnswer as string[]) || []), option]
                      : ((currentAnswer as string[]) || []).filter((val: string) => val !== option);
                    handleAnswerChange(question.id, newValues);
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );
      case 'percentage':
      case 'integer':
      case 'decimal':
        return (
          <Input
            type="number"
            value={currentAnswer as number || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value === '' ? undefined : Number(e.target.value))}
            placeholder={question.type === 'percentage' ? '0-100' : ''}
            min={question.min}
            max={question.max}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={currentAnswer as string || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        );
      case 'date_range':
        return (
          <Input
            type="text"
            value={currentAnswer as string || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="YYYY-MM-DD to YYYY-MM-DD"
          />
        );
      case 'text_short':
        return (
          <Input
            type="text"
            value={currentAnswer as string || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        );
      case 'text_long':
        return (
          <Textarea
            value={answers[question.id]?.value as string || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        );
      default:
        return <p className="text-red-500">Type de question non supporté: {question.type}</p>;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted Answers:', answers);
    toast.success('Answers submitted (check console)!');
    // Here you would typically send 'answers' to your backend API
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Chargement des questions...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Questionnaire Institutionnel</h1>

      <form onSubmit={handleSubmit} className="space-y-10">
        {sectionsWithNested.length === 0 ? (
          <p className="text-gray-600">Aucune question disponible pour le moment.</p>
        ) : (
          sectionsWithNested.map((section: SectionWithNested) => (
            <div key={section.id} className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 text-green-700">{section.name}</h2>
              {section.sousSections.map((sousSection: SousSection) => (
                <div key={sousSection.id} className="mb-8 border-l-4 border-green-200 pl-4">
                  <h3 className="text-xl font-medium mb-4 text-gray-700">{sousSection.libelle}</h3>
                  <div className="space-y-6">
                    {sousSection.questions.map((question: Question) => (
                      <div key={question.id} className="bg-gray-50 p-4 rounded-md shadow-sm">
                        <Label htmlFor={question.id} className="block text-lg font-medium text-gray-900 mb-2">
                          {question.label} {question.required && <span className="text-red-500">*</span>}
                        </Label>
                        {question.definition && (
                          <p className="text-sm text-gray-600 mb-3">{question.definition}</p>
                        )}

                        {renderQuestionInput(question)}

                        {question.justificationRequired && (
                          <div className="mt-4">
                            <Label htmlFor={`${question.id}-justification`} className="block text-sm font-medium text-gray-700">
                              Justification {question.justificationRequired && <span className="text-red-500">*</span>}
                            </Label>
                            <Textarea
                              id={`${question.id}-justification`}
                              value={answers[question.id]?.justification || ''}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value, 'justification')}
                              className="mt-1 block w-full"
                            />
                          </div>
                        )}

                        {question.commentRequired && (
                          <div className="mt-4">
                            <Label htmlFor={`${question.id}-comment`} className="block text-sm font-medium text-gray-700">
                              Commentaire
                            </Label>
                            <Textarea
                              id={`${question.id}-comment`}
                              value={answers[question.id]?.comment || ''}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value, 'comment')}
                              className="mt-1 block w-full"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}

        <Button type="submit" className="w-full py-3 text-lg bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
          Soumettre les réponses
        </Button>
      </form>
    </div>
  );
};

export default QuestionnairePage;
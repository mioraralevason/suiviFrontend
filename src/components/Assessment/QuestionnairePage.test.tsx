// Fichier temporaire pour tester la structure de QuestionnairePage
import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Question, SectionWithNested, SousSection, SousSectionWithQuestions } from '../../types';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { toast } from 'react-hot-toast';

// Define a more specific type for answer values
type AnswerValue = string | number | boolean | string[] | undefined;

interface Answer {
  questionId: string;
  value: AnswerValue;
  justification?: string;
  comment?: string;
}

// Composant minimal pour tester
const QuestionnairePageMinimal: React.FC = () => {
  const { user } = useAuth();
  const { sectionsWithNested, loadSectionsWithNested } = useData();
  const [answers, setAnswers] = useState<{[questionId: string]: Answer}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Loading questionnaire data...');
    const fetchData = async () => {
      setLoading(true);
      await loadSectionsWithNested();
      setLoading(false);
      console.log('Questionnaire data loaded:', sectionsWithNested);
    };

    fetchData();
  }, [loadSectionsWithNested]);

  if (loading) {
    return <div>Chargement du questionnaire...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Questionnaire Institutionnel</h1>
      <p>Nombre de sections: {sectionsWithNested.length}</p>
    </div>
  );
};

export default QuestionnairePageMinimal;
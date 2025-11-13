import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Minus, 
  Plus, 
  Settings, 
  Type, 
  AlignLeft, 
  Hash,
  Percent,
  ToggleLeft,
  Circle,
  MinusSquare,
  CheckSquare,
  MinusCircle
} from 'lucide-react';
import { Question, QuestionRule } from '../../types';

interface DynamicRatingFormProps {
  questions: Question[];
  onAnswersChange: (answers: Record<string, any>) => void;
  onSubmit?: (answers: Record<string, any>, totalScore: number) => void;
  answers?: Record<string, any>;
  showSubmitButton?: boolean;
  submitButtonText?: string;
  onCancel?: () => void;
}

const DynamicRatingForm: React.FC<DynamicRatingFormProps> = ({ 
  questions, 
  onAnswersChange,
  onSubmit,
  showSubmitButton = false,
  submitButtonText = 'Soumettre le formulaire',
  answers = {}
}) => {
  const [localAnswers, setLocalAnswers] = useState<Record<string, any>>(answers);
  const [configuredRules, setConfiguredRules] = useState<Record<string, QuestionRule[]>>({});
  const [showRuleConfig, setShowRuleConfig] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize answers and rules from props
  useEffect(() => {
    setLocalAnswers(answers);
    const initialRules: Record<string, QuestionRule[]> = {};
    questions.forEach(q => {
      initialRules[q.id] = q.rules || [];
    });
    setConfiguredRules(initialRules);
  }, [answers, questions]);

  // Handle answer changes
  const handleAnswerChange = (questionId: string, value: any) => {
    const updatedAnswers = { ...localAnswers, [questionId]: value };
    setLocalAnswers(updatedAnswers);
    
    // Re-validate the specific question
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const error = validateAnswer(question, value);
      setErrors(prev => ({
        ...prev,
        [questionId]: error || ''
      }));
    }
    
    onAnswersChange(updatedAnswers);
  };

  // Get icon based on question type
  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'boolean': return <ToggleLeft className="h-4 w-4" />;
      case 'multiple_choice': return <CheckSquare className="h-4 w-4" />;
      case 'single_choice': return <Circle className="h-4 w-4" />;
      case 'range': return <MinusSquare className="h-4 w-4" />;
      case 'percentage': return <Percent className="h-4 w-4" />;
      case 'date': return <Calendar className="h-4 w-4" />;
      case 'date_range': return <Clock className="h-4 w-4" />;
      case 'text_short': return <Type className="h-4 w-4" />;
      case 'text_long': return <AlignLeft className="h-4 w-4" />;
      case 'integer': 
      case 'decimal':
      case 'numeric': return <Hash className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  // Render appropriate input based on question type
  const renderInput = (question: Question) => {
    const currentAnswer = localAnswers[question.id] || '';
    
    switch (question.type) {
      case 'boolean':
        return (
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name={`answer-${question.id}`}
                checked={currentAnswer === true}
                onChange={() => handleAnswerChange(question.id, true)}
                className="text-green-600 focus:ring-green-500"
              />
              <span className="ml-2">Oui</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name={`answer-${question.id}`}
                checked={currentAnswer === false}
                onChange={() => handleAnswerChange(question.id, false)}
                className="text-green-600 focus:ring-green-500"
              />
              <span className="ml-2">Non</span>
            </label>
          </div>
        );
        
      case 'single_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={`answer-${question.id}`}
                  checked={currentAnswer === option}
                  onChange={() => handleAnswerChange(question.id, option)}
                  className="text-green-600 focus:ring-green-500"
                />
                <span className="ml-2">{option}</span>
              </label>
            ))}
          </div>
        );
        
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => {
              const selectedOptions = Array.isArray(currentAnswer) ? currentAnswer : [];
              const isChecked = selectedOptions.includes(option);
              
              return (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const newAnswers = e.target.checked 
                        ? [...selectedOptions, option]
                        : selectedOptions.filter((opt: string) => opt !== option);
                      handleAnswerChange(question.id, newAnswers);
                    }}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2">{option}</span>
                </label>
              );
            })}
          </div>
        );
        
      case 'range':
        const rangeValue = typeof currentAnswer === 'number' ? currentAnswer : (question.min || 0);
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min={question.min || 0}
                max={question.max || 100}
                value={rangeValue}
                onChange={(e) => handleAnswerChange(question.id, parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{question.min || 0}</span>
              <span className="font-medium">{rangeValue}</span>
              <span>{question.max || 100}</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min={question.min}
                max={question.max}
                value={rangeValue}
                onChange={(e) => handleAnswerChange(question.id, parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        );
        
      case 'percentage':
        const percentValue = typeof currentAnswer === 'number' ? currentAnswer : 0;
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="100"
                value={percentValue}
                onChange={(e) => handleAnswerChange(question.id, parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>0%</span>
              <span className="font-medium">{percentValue}%</span>
              <span>100%</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="100"
                value={percentValue}
                onChange={(e) => handleAnswerChange(question.id, parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <span className="text-gray-600">%</span>
            </div>
          </div>
        );
        
      case 'integer':
        return (
          <input
            type="number"
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Saisir un nombre entier"
          />
        );
        
      case 'decimal':
      case 'numeric':
        return (
          <input
            type="number"
            step="0.01"
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Saisir un nombre"
          />
        );
        
      case 'text_short':
        return (
          <input
            type="text"
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Saisir une réponse courte"
          />
        );
        
      case 'text_long':
        return (
          <textarea
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            placeholder="Saisir une réponse détaillée"
          />
        );
        
      case 'date':
        return (
          <input
            type="date"
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        );
        
      case 'date_range':
        const dateRange = typeof currentAnswer === 'object' && currentAnswer !== null 
          ? currentAnswer 
          : { start: '', end: '' };
          
        return (
          <div className="flex space-x-2">
            <input
              type="date"
              value={dateRange.start || ''}
              onChange={(e) => handleAnswerChange(question.id, { ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <span className="flex items-center">à</span>
            <input
              type="date"
              value={dateRange.end || ''}
              onChange={(e) => handleAnswerChange(question.id, { ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        );
        
      default:
        return (
          <input
            type="text"
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Saisir une réponse"
          />
        );
    }
  };

  // Calculate score for a specific question based on its rules
  const calculateQuestionScore = (questionId: string, answer: any): number => {
    const question = questions.find(q => q.id === questionId);
    const rules = configuredRules[questionId] || [];
    
    // If there are no configured rules, check the original question rules
    if (rules.length === 0 && question?.rules && question.rules.length > 0) {
      for (const rule of question.rules) {
        if (question.type === 'boolean') {
          // For boolean questions, check for true/false matches
          if (answer === rule.value) return rule.points;
        } else if (rule.condition === 'equal' || !rule.condition) {
          if (answer === rule.value) return rule.points;
        } else if (rule.condition === 'between') {
          if (typeof rule.value === 'object' && rule.value.min !== undefined && rule.value.max !== undefined) {
            if (typeof answer === 'number' && answer >= rule.value.min && answer <= rule.value.max) return rule.points;
          }
        } else if (rule.condition === 'greater') {
          if (typeof answer === 'number' && answer > rule.value) return rule.points;
          if (typeof answer === 'string' && parseFloat(answer) > rule.value) return rule.points;
        } else if (rule.condition === 'less') {
          if (typeof answer === 'number' && answer < rule.value) return rule.points;
          if (typeof answer === 'string' && parseFloat(answer) < rule.value) return rule.points;
        } else if (rule.condition === 'contains') {
          if (Array.isArray(answer) && answer.includes(rule.value)) return rule.points;
          if (typeof answer === 'string' && answer.includes(rule.value)) return rule.points;
        } else if (rule.condition === 'greater_equal') {
          if (typeof answer === 'number' && answer >= rule.value) return rule.points;
          if (typeof answer === 'string' && parseFloat(answer) >= rule.value) return rule.points;
        } else if (rule.condition === 'less_equal') {
          if (typeof answer === 'number' && answer <= rule.value) return rule.points;
          if (typeof answer === 'string' && parseFloat(answer) <= rule.value) return rule.points;
        } else {
          if (answer === rule.value) return rule.points;
        }
      }
      return 0;
    }
    
    // If there are configured rules, use them
    for (const rule of rules) {
      if (question?.type === 'boolean') {
        // For boolean questions with configured rules, check the value directly
        if (answer === rule.value) return rule.points;
      } else if (rule.condition === 'equal') {
        if (answer === rule.value) return rule.points;
      } else if (rule.condition === 'between') {
        // Handle different types for 'between' condition
        if (question?.type === 'date_range' || question?.type === 'range' || question?.type === 'percentage') {
          if (typeof rule.value === 'object' && rule.value.min !== undefined && rule.value.max !== undefined) {
            if (typeof answer === 'number') {
              if (answer >= rule.value.min && answer <= rule.value.max) return rule.points;
            } else if (typeof answer === 'object' && answer !== null) {
              // For date_range, we'll use the start date for comparison
              // Or for other range-like objects
              const numericValue = Array.isArray(answer) ? answer[0] : answer;
              if (typeof numericValue === 'number' && numericValue >= rule.value.min && numericValue <= rule.value.max) {
                return rule.points;
              }
            }
          }
        } else {
          // For other types, treat value as string range
          if (typeof answer === 'number' && typeof rule.value === 'object' && rule.value.min !== undefined && rule.value.max !== undefined) {
            if (answer >= rule.value.min && answer <= rule.value.max) return rule.points;
          }
        }
      } else if (rule.condition === 'greater') {
        if (typeof answer === 'number' && answer > rule.value) return rule.points;
        if (typeof answer === 'string' && parseFloat(answer) > rule.value) return rule.points;
      } else if (rule.condition === 'less') {
        if (typeof answer === 'number' && answer < rule.value) return rule.points;
        if (typeof answer === 'string' && parseFloat(answer) < rule.value) return rule.points;
      } else if (rule.condition === 'contains') {
        // For multiple choice or text with array of selections
        if (Array.isArray(answer) && answer.includes(rule.value)) return rule.points;
        if (typeof answer === 'string' && answer.includes(rule.value)) return rule.points;
      } else if (rule.condition === 'greater_equal') {
        if (typeof answer === 'number' && answer >= rule.value) return rule.points;
        if (typeof answer === 'string' && parseFloat(answer) >= rule.value) return rule.points;
      } else if (rule.condition === 'less_equal') {
        if (typeof answer === 'number' && answer <= rule.value) return rule.points;
        if (typeof answer === 'string' && parseFloat(answer) <= rule.value) return rule.points;
      } else {
        // Default case: exact match
        if (answer === rule.value) return rule.points;
      }
    }
    
    // If no rule matches, return 0 points
    return 0;
  };

  // Calculate total score
  const calculateTotalScore = (): number => {
    return questions.reduce((total, question) => {
      const answer = localAnswers[question.id];
      return total + calculateQuestionScore(question.id, answer);
    }, 0);
  };

  // Add a rule to a question
  const addRule = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    const newRule: QuestionRule = {
      id: `rule-${Date.now()}`,
      value: question?.type === 'boolean' ? true : '',
      points: 0,
      condition: question?.type === 'boolean' ? undefined : 'equal'
    };
    
    setConfiguredRules(prev => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), newRule]
    }));
  };

  // Update a rule
  const updateRule = (questionId: string, ruleId: string, field: keyof QuestionRule, value: any) => {
    setConfiguredRules(prev => ({
      ...prev,
      [questionId]: (prev[questionId] || []).map(rule => 
        rule.id === ruleId ? { ...rule, [field]: value } : rule
      )
    }));
  };

  // Remove a rule
  const removeRule = (questionId: string, ruleId: string) => {
    setConfiguredRules(prev => ({
      ...prev,
      [questionId]: (prev[questionId] || []).filter(rule => rule.id !== ruleId)
    }));
  };

  // Validation functions
  const validateAnswer = (question: Question, answer: any): string | null => {
    if (question.required && (answer === undefined || answer === null || answer === '')) {
      return 'Cette question est obligatoire';
    }

    switch (question.type) {
      case 'boolean':
        if (question.required && typeof answer !== 'boolean') {
          return 'Veuillez sélectionner une option';
        }
        break;

      case 'single_choice':
        if (question.required && (answer === undefined || answer === '')) {
          return 'Veuillez sélectionner une option';
        } else if (question.options && answer && !question.options.includes(answer)) {
          return 'Option invalide sélectionnée';
        }
        break;

      case 'multiple_choice':
        if (question.required && (!Array.isArray(answer) || answer.length === 0)) {
          return 'Veuillez sélectionner au moins une option';
        } else if (question.options && Array.isArray(answer)) {
          const invalidSelections = answer.filter((opt: string) => !question.options?.includes(opt));
          if (invalidSelections.length > 0) {
            return 'Options invalides sélectionnées';
          }
        }
        break;

      case 'range':
      case 'integer':
      case 'decimal':
      case 'numeric':
        if (question.required && (answer === undefined || answer === '')) {
          return 'Veuillez saisir un nombre';
        } else if (typeof answer === 'number') {
          if (question.min !== undefined && answer < question.min) {
            return `La valeur doit être supérieure ou égale à ${question.min}`;
          }
          if (question.max !== undefined && answer > question.max) {
            return `La valeur doit être inférieure ou égale à ${question.max}`;
          }
        } else if (answer !== '' && isNaN(parseFloat(answer))) {
          return 'Veuillez saisir un nombre valide';
        }
        break;

      case 'percentage':
        if (question.required && (answer === undefined || answer === '')) {
          return 'Veuillez saisir un pourcentage';
        } else if (typeof answer === 'number') {
          if (answer < 0) {
            return 'Le pourcentage ne peut pas être négatif';
          }
          if (answer > 100) {
            return 'Le pourcentage ne peut pas dépasser 100%';
          }
        } else if (answer !== '' && (isNaN(parseFloat(answer)) || parseFloat(answer) < 0 || parseFloat(answer) > 100)) {
          return 'Veuillez saisir un pourcentage valide (0-100)';
        }
        break;

      case 'date':
        if (question.required && (answer === undefined || answer === '')) {
          return 'Veuillez sélectionner une date';
        } else if (answer && isNaN(Date.parse(answer))) {
          return 'Date invalide';
        }
        break;

      case 'date_range':
        if (question.required && (!answer || !answer.start || !answer.end)) {
          return 'Veuillez sélectionner une période complète';
        } else if (answer && (answer.start && isNaN(Date.parse(answer.start)) || answer.end && isNaN(Date.parse(answer.end)))) {
          return 'Dates invalides';
        } else if (answer && answer.start && answer.end && new Date(answer.start) > new Date(answer.end)) {
          return 'La date de début ne peut pas être postérieure à la date de fin';
        }
        break;

      case 'text_short':
        if (question.required && (answer === undefined || answer === '')) {
          return 'Veuillez saisir une réponse';
        } else if (typeof answer === 'string' && answer.length > 255) {
          return 'La réponse est trop longue (max 255 caractères)';
        }
        break;

      case 'text_long':
        if (question.required && (answer === undefined || answer === '')) {
          return 'Veuillez saisir une réponse';
        } else if (typeof answer === 'string' && answer.length > 2000) {
          return 'La réponse est trop longue (max 2000 caractères)';
        }
        break;
    }

    return null; // No error
  };

  // Validate all answers
  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};

    questions.forEach(question => {
      const answer = localAnswers[question.id];
      const error = validateAnswer(question, answer);
      if (error) {
        newErrors[question.id] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!onSubmit) return;
    
    if (!validateAll()) {
      alert('Veuillez corriger les erreurs dans le formulaire avant de soumettre');
      return;
    }
    
    const totalScore = calculateTotalScore();
    onSubmit(localAnswers, totalScore);
  };

  // Render rule configuration panel
  const renderRuleConfig = (question: Question) => {
    if (showRuleConfig !== question.id) return null;
    
    const rules = configuredRules[question.id] || [];
    
    return (
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-blue-900">Règles de notation</h4>
          <p className="text-sm text-blue-700">
            <span className="font-medium">{rules.length}</span> règle{rules.length !== 1 ? 's' : ''}
          </p>
        </div>
        <p className="text-sm text-blue-800 mb-3">
          Configurez les règles pour attribuer des points selon la réponse fournie
        </p>
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-end gap-2 p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex-1 grid grid-cols-3 gap-2">
                {question.type === 'boolean' ? (
                  <div className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg">
                    Oui / Non
                  </div>
                ) : (
                  <select
                    value={rule.condition || 'equal'}
                    onChange={(e) => updateRule(question.id, rule.id, 'condition', e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="equal">Égal à</option>
                    <option value="greater">Supérieur à</option>
                    <option value="greater_equal">Supérieur ou égal à</option>
                    <option value="less">Inférieur à</option>
                    <option value="less_equal">Inférieur ou égal à</option>
                    <option value="between">Entre</option>
                    <option value="contains">Contient</option>
                  </select>
                )}
                
                {question.type === 'boolean' ? (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 block mb-1">Si Oui</label>
                      <input
                        type="number"
                        value={rule.value === true ? rule.points || 0 : ''}
                        onChange={(e) => {
                          updateRule(question.id, rule.id, 'value', true);
                          updateRule(question.id, rule.id, 'points', parseInt(e.target.value, 10));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 block mb-1">Si Non</label>
                      <input
                        type="number"
                        value={rule.value === false ? rule.points || 0 : ''}
                        onChange={(e) => {
                          updateRule(question.id, rule.id, 'value', false);
                          updateRule(question.id, rule.id, 'points', parseInt(e.target.value, 10));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ) : rule.condition === 'between' ? (
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={rule.value?.min || ''}
                      onChange={(e) => updateRule(question.id, rule.id, 'value', {
                        ...rule.value,
                        min: parseFloat(e.target.value) || 0
                      })}
                      placeholder="Min"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <span className="flex items-center px-2">à</span>
                    <input
                      type="number"
                      value={rule.value?.max || ''}
                      onChange={(e) => updateRule(question.id, rule.id, 'value', {
                        ...rule.value,
                        max: parseFloat(e.target.value) || 0
                      })}
                      placeholder="Max"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                ) : ['greater', 'less', 'greater_equal', 'less_equal'].includes(rule.condition || '') ? (
                  <input
                    type="number"
                    value={rule.value || ''}
                    onChange={(e) => updateRule(question.id, rule.id, 'value', parseFloat(e.target.value) || 0)}
                    placeholder="Valeur"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <input
                    type="text"
                    value={rule.value || ''}
                    onChange={(e) => updateRule(question.id, rule.id, 'value', e.target.value)}
                    placeholder="Valeur"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                )}
              </div>
              
              {question.type !== 'boolean' && (
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Points</label>
                  <input
                    type="number"
                    value={rule.points || 0}
                    onChange={(e) => updateRule(question.id, rule.id, 'points', parseInt(e.target.value, 10))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center"
                  />
                </div>
              )}
              
              <button
                onClick={() => removeRule(question.id, rule.id)}
                className={`p-2 text-red-600 hover:bg-red-100 rounded-lg self-center ${question.type === 'boolean' ? 'mt-6' : ''}`}
                title="Supprimer cette règle"
              >
                <Minus className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          <button
            onClick={() => addRule(question.id)}
            className="w-full py-3 text-green-600 border-2 border-dashed border-green-300 rounded-lg hover:bg-green-50 flex items-center justify-center space-x-2 mt-3"
          >
            <Plus className="h-5 w-5" />
            <span>Ajouter une nouvelle règle</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Validation and Score Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Formulaire de notation dynamique</h2>
          <div className="text-2xl font-bold text-green-600">
            Total: {calculateTotalScore()} pts
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Répondez aux questions et configurez les règles de notation</p>
          <div className="flex space-x-2">
            <button
              onClick={validateAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Valider le formulaire
            </button>
            {showSubmitButton && onSubmit && (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                {submitButtonText}
              </button>
            )}
          </div>
        </div>
        {Object.keys(errors).length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              {Object.keys(errors).length} erreur{Object.keys(errors).length > 1 ? 's' : ''} trouvée{Object.keys(errors).length > 1 ? 's' : ''} dans le formulaire
            </p>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((question, index) => {
          const currentScore = calculateQuestionScore(question.id, localAnswers[question.id]);
          
          return (
            <div key={question.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-800 font-medium">{index + 1}</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">
                        {getQuestionTypeIcon(question.type)}
                      </span>
                      <h3 className="text-lg font-medium text-gray-900">
                        {question.label}
                      </h3>
                      {question.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                        {question.type}
                      </span>
                      <span className={`text-sm font-medium ${
                        currentScore > 0 ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        Score: {currentScore} pts
                      </span>
                      {configuredRules[question.id] && configuredRules[question.id].length > 0 && (
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full flex items-center">
                          <Settings className="h-3 w-3 mr-1" />
                          {configuredRules[question.id].length} règle{configuredRules[question.id].length > 1 ? 's' : ''}
                        </span>
                      )}
                      {(question.rules && question.rules.length > 0) && !configuredRules[question.id]?.length && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          Règles prédéfinies
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {configuredRules[question.id] && configuredRules[question.id].length > 0 ? (
                    <button
                      onClick={() => setShowRuleConfig(showRuleConfig === question.id ? null : question.id)}
                      className="px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium flex items-center space-x-1"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Gérer les règles</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowRuleConfig(showRuleConfig === question.id ? null : question.id)}
                      className="px-3 py-1.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center space-x-1"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Ajouter des règles</span>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                {renderInput(question)}
                {errors[question.id] && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <MinusCircle className="h-4 w-4 mr-1" />
                    {errors[question.id]}
                  </p>
                )}
              </div>
              
              {renderRuleConfig(question)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DynamicRatingForm;
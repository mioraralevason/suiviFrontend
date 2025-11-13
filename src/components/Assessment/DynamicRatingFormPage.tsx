import React, { useState } from 'react';
import DynamicRatingForm from './DynamicRatingForm';
import { Question } from '../../types';

// Example data for the dynamic rating form
const exampleQuestions: Question[] = [
  {
    id: 'q1',
    label: 'L\'institution dispose-t-elle d\'un système de gestion des risques LBC/FT ?',
    type: 'boolean',
    required: true,
    justificationRequired: false,
    commentRequired: false,
    definition: 'Vérifier si l\'institution a un système de gestion des risques LBC/FT',
    notes: 'Un système documenté est requis',
    axisId: 'axis1',
    rules: [
      { id: 'r1', value: true, points: 10, condition: 'equal' },
      { id: 'r2', value: false, points: 0, condition: 'equal' }
    ]
  },
  {
    id: 'q2',
    label: 'Quel est le pourcentage d\'opérations surveillées automatiquement ?',
    type: 'percentage',
    required: true,
    justificationRequired: false,
    commentRequired: false,
    definition: 'Pourcentage des opérations surveillées automatiquement',
    notes: 'Calculer sur la base des opérations totales',
    axisId: 'axis2',
    rules: [
      { id: 'r3', value: { min: 90, max: 100 }, points: 20, condition: 'between' },
      { id: 'r4', value: { min: 70, max: 89 }, points: 10, condition: 'between' },
      { id: 'r5', value: { min: 0, max: 69 }, points: 5, condition: 'between' }
    ]
  },
  {
    id: 'q3',
    label: 'Sélectionnez les types de clients concernés',
    type: 'multiple_choice',
    options: ['Particuliers', 'Professionnels', 'Entreprises', 'ONG', 'Autres'],
    required: false,
    justificationRequired: false,
    commentRequired: false,
    definition: 'Types de clients concernés par les risques LBC/FT',
    notes: 'Sélectionner tous les types applicables',
    axisId: 'axis1',
    rules: [
      { id: 'r6', value: 'Particuliers', points: 5, condition: 'contains' },
      { id: 'r7', value: 'Professionnels', points: 5, condition: 'contains' },
      { id: 'r8', value: 'Entreprises', points: 10, condition: 'contains' }
    ]
  },
  {
    id: 'q4',
    label: 'Quel est le montant moyen des transactions par jour ?',
    type: 'range',
    min: 0,
    max: 1000000,
    required: true,
    justificationRequired: false,
    commentRequired: false,
    definition: 'Montant moyen des transactions par jour en devise locale',
    notes: 'Calculer sur la base des 30 derniers jours',
    axisId: 'axis3',
    rules: [
      { id: 'r9', value: { min: 500000, max: 1000000 }, points: 15, condition: 'between' },
      { id: 'r10', value: { min: 100000, max: 499999 }, points: 10, condition: 'between' },
      { id: 'r11', value: { min: 0, max: 99999 }, points: 5, condition: 'between' }
    ]
  },
  {
    id: 'q5',
    label: 'Sélectionnez votre type d\'établissement',
    type: 'single_choice',
    options: ['Banque', 'Assurance', 'Société de financement', 'Autre'],
    required: true,
    justificationRequired: false,
    commentRequired: false,
    definition: 'Type d\'établissement financier',
    notes: 'Sélectionner un seul type',
    axisId: 'axis1',
    rules: [
      { id: 'r12', value: 'Banque', points: 10, condition: 'equal' },
      { id: 'r13', value: 'Assurance', points: 8, condition: 'equal' },
      { id: 'r14', value: 'Société de financement', points: 12, condition: 'equal' }
    ]
  },
  {
    id: 'q6',
    label: 'Date de mise en place du système LBC/FT',
    type: 'date',
    required: false,
    justificationRequired: false,
    commentRequired: false,
    definition: 'Date de mise en place du système de lutte contre le blanchiment',
    notes: 'Format: AAAA-MM-JJ',
    axisId: 'axis2',
    rules: []
  },
  {
    id: 'q7',
    label: 'Période d\'audit des systèmes',
    type: 'date_range',
    required: false,
    justificationRequired: false,
    commentRequired: false,
    definition: 'Période couverte par l\'audit des systèmes',
    notes: 'Date de début et date de fin',
    axisId: 'axis2',
    rules: []
  },
  {
    id: 'q8',
    label: 'Brève description du système de gestion des risques',
    type: 'text_short',
    required: false,
    justificationRequired: false,
    commentRequired: false,
    definition: 'Description concise du système de gestion des risques',
    notes: 'Max 255 caractères',
    axisId: 'axis1',
    rules: []
  },
  {
    id: 'q9',
    label: 'Détaillez les mesures de sécurité mises en place',
    type: 'text_long',
    required: true,
    justificationRequired: false,
    commentRequired: false,
    definition: 'Détail des mesures de sécurité mises en place',
    notes: 'Décrivez les mesures en détail',
    axisId: 'axis3',
    rules: []
  },
  {
    id: 'q10',
    label: 'Nombre d\'employés dans le service de conformité',
    type: 'integer',
    min: 0,
    max: 100,
    required: true,
    justificationRequired: false,
    commentRequired: false,
    definition: 'Nombre total d\'employés dans le service de conformité',
    notes: 'Compter tous les employés à temps plein et à temps partiel',
    axisId: 'axis4',
    rules: [
      { id: 'r15', value: 10, points: 10, condition: 'greater' },
      { id: 'r16', value: 5, points: 5, condition: 'between' }
    ]
  },
  {
    id: 'q11',
    label: 'Taux de conformité aux réglementations',
    type: 'decimal',
    min: 0,
    max: 100,
    required: true,
    justificationRequired: false,
    commentRequired: false,
    definition: 'Taux de conformité aux réglementations en pourcentage',
    notes: 'Valeur entre 0 et 100 avec décimales possibles',
    axisId: 'axis5',
    rules: [
      { id: 'r17', value: 95, points: 15, condition: 'greater' },
      { id: 'r18', value: { min: 80, max: 94.9 }, points: 10, condition: 'between' }
    ]
  }
];

const DynamicRatingFormPage = () => {
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const handleAnswersChange = (updatedAnswers: Record<string, any>) => {
    setAnswers(updatedAnswers);
    console.log('Updated Answers:', updatedAnswers);
  };

  const handleSubmit = (answers: Record<string, any>, totalScore: number) => {
    console.log('Formulaire soumis:', { answers, totalScore });
    alert(`Formulaire soumis avec succès!\nScore total: ${totalScore} points`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Formulaire de Notation Dynamique
        </h1>
        <p className="text-gray-600 mb-6">
          Ce formulaire s'adapte dynamiquement selon le type de réponse des questions.
          Vous pouvez configurer les règles de notation après avoir sélectionné une question.
        </p>
        
        <DynamicRatingForm 
          questions={exampleQuestions} 
          onAnswersChange={handleAnswersChange}
          onSubmit={handleSubmit}
          showSubmitButton={true}
          submitButtonText="Soumettre l'évaluation"
          answers={answers}
        />
      </div>
    </div>
  );
};

export default DynamicRatingFormPage;
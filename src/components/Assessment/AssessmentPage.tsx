import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Shield, CircleCheck as CheckCircle, AlertCircle, Upload, FileText, Building2 } from 'lucide-react';


const AssessmentPage: React.FC = () => {
  const { user } = useAuth();
  const { axes, questions, institutions, assessments, addAssessment } = useData();
  const [currentAxis, setCurrentAxis] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [justifications, setJustifications] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationInstitutionId, setEvaluationInstitutionId] = useState<string>('');

  // Récupérer l'ID de l'institution à évaluer
  useEffect(() => {
    const storedId = sessionStorage.getItem('evaluationInstitutionId');
    if (storedId) {
      setEvaluationInstitutionId(storedId);
    } else if (user?.institutionId) {
      setEvaluationInstitutionId(user.institutionId);
    }
  }, [user]);

  const institution = institutions.find(i => i.id === evaluationInstitutionId);
  const currentAxisData = axes[currentAxis];
  const axisQuestions = questions.filter(q => q.axisId === currentAxisData?.id);

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleJustificationChange = (questionId: string, value: string) => {
    setJustifications(prev => ({ ...prev, [questionId]: value }));
  };

  const [comments, setComments] = useState<Record<string, string>>({});
  
  const handleCommentChange = (questionId: string, value: string) => {
    setComments(prev => ({ ...prev, [questionId]: value }));
  };

  const isAxisComplete = (axisId: string) => {
    const axisQs = questions.filter(q => q.axisId === axisId);
    return axisQs.every(q => {
      const hasResponse = responses[q.id] !== undefined;
      const hasJustification = !q.justificationRequired || justifications[q.id];
      return hasResponse && hasJustification;
    });
  };

  const completedAxes = axes.filter(axis => isAxisComplete(axis.id)).length;
  const progress = (completedAxes / axes.length) * 100;

  const handleSubmitAssessment = async () => {
    setIsSubmitting(true);
    
    try {
      // Calculer les scores (logique simplifiée)
      const totalScore = Math.random() * 5; // À remplacer par la vraie logique
      const axisScores = {
        institution: 0, // Pas de score pour l'axe institution
        clients: Math.random() * 5,
        products: Math.random() * 5,
        channels: Math.random() * 5,
        geography: Math.random() * 5,
        controls: Math.random() * 5
      };
      
      const riskLevel = totalScore > 3.5 ? 'high' : totalScore > 2.5 ? 'medium' : 'low';
      
      const newAssessment = {
        id: `assessment_${Date.now()}`,
        institutionId: evaluationInstitutionId,
        totalScore,
        axisScores,
        riskLevel: riskLevel as 'high' | 'medium' | 'low',
        submittedAt: new Date(),
        responses: Object.entries(responses).map(([questionId, value]) => ({
          id: `response_${Date.now()}_${questionId}`,
          questionId,
          institutionId: evaluationInstitutionId,
          value,
          justification: justifications[questionId],
          comment: comments[questionId],
          submittedAt: new Date()
        }))
      };
      
      addAssessment(newAssessment);
      
      // Nettoyer le sessionStorage
      sessionStorage.removeItem('evaluationInstitutionId');
      
      alert('Évaluation soumise avec succès ! Le rapport a été généré automatiquement.');
      
      // Rediriger vers les rapports
      window.location.hash = '#reports';
      
    } catch (error) {
      alert('Erreur lors de la soumission de l\'évaluation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionInput = (question: any) => {
    const value = responses[question.id];

    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      handleResponseChange(question.id, [...currentValues, option]);
                    } else {
                      handleResponseChange(question.id, currentValues.filter(v => v !== option));
                    }
                  }}
                  className="text-green-600 focus:ring-green-500 mr-2"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'single_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={() => handleResponseChange(question.id, option)}
                  className="text-green-600 focus:ring-green-500 mr-2"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <div className="space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name={question.id}
                value="true"
                checked={value === true}
                onChange={() => handleResponseChange(question.id, true)}
                className="text-green-600 focus:ring-green-500"
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name={question.id}
                value="false"
                checked={value === false}
                onChange={() => handleResponseChange(question.id, false)}
                className="text-green-600 focus:ring-green-500"
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        );

      case 'percentage':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              max="100"
              value={value || ''}
              onChange={(e) => handleResponseChange(question.id, parseFloat(e.target.value))}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0"
            />
            <span className="text-gray-600">%</span>
          </div>
        );

      case 'numeric':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Saisir un nombre"
          />
        );

      case 'text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            placeholder="Saisir votre réponse"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Saisir la réponse"
          />
        );
    }
  };

  if (!institution) {
    return <div>Institution not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-4 mb-4">
          <Building2 className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Évaluation des Risques LBC/FT</h1>
            <p className="text-gray-600">Institution : {institution?.name}</p>
          </div>
        </div>
      </div>

      {/* Résumé des réponses de l'axe Institution */}
      {responses && Object.keys(responses).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Résumé - Informations Institution</h2>
          <div className="space-y-2">
            <p className="text-blue-800"><strong>Secteurs d'activité sélectionnés :</strong></p>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              {Object.entries(responses).map(([questionId, value]) => {
                const question = questions.find(q => q.id === questionId && q.axisId === 'institution');
                if (question && value === true) {
                  return (
                    <li key={questionId}>{question.label.replace('?', '').replace('Votre entité relève-t-elle d\'un secteur EPNFD (au moins un) ? Cochez (Oui) pour chaque secteur qui vous concerne :', '').trim()}</li>
                  );
                }
                return null;
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Progression de l'Évaluation</h2>
          <span className="text-sm text-gray-600">{completedAxes}/{axes.length} sections terminées</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Axis Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sections d'Évaluation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {axes.map((axis, index) => {
            const isComplete = isAxisComplete(axis.id);
            const isCurrent = index === currentAxis;
            return (
              <button
                key={axis.id}
                onClick={() => setCurrentAxis(index)}
                className={`p-4 rounded-lg text-left transition-colors ${
                  isCurrent
                    ? 'bg-green-600 text-white'
                    : isComplete
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {isComplete ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Shield className="h-5 w-5" />
                  )}
                  <span className="font-medium">{axis.name}</span>
                </div>
                <p className="text-sm opacity-90">{axis.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Section */}
      {currentAxisData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-8 w-8 text-green-600" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{currentAxisData.name}</h2>
              <p className="text-gray-600">{currentAxisData.description}</p>
            </div>
          </div>

          <div className="space-y-8">
            {axisQuestions.map((question, qIndex) => (
              <div key={question.id} className="border-b border-gray-200 pb-8 last:border-b-0">
                <div className="mb-4">
                  <div className="flex items-start space-x-2 mb-2">
                    <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded font-medium">
                      {qIndex + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {question.label}
                        {question.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </h3>
                      {question.definition && (
                        <p className="text-gray-600 text-sm">{question.definition}</p>
                      )}
                      {question.notes && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-blue-800 text-sm">{question.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Réponse
                    </label>
                    {renderQuestionInput(question)}
                  </div>

                  {question.justificationRequired && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Justification *
                      </label>
                      <textarea
                        value={justifications[question.id] || ''}
                        onChange={(e) => handleJustificationChange(question.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={3}
                        placeholder="Fournir une justification pour votre réponse"
                      />
                    </div>
                  )}

                  {question.commentRequired && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Commentaire *
                      </label>
                      <textarea
                        value={comments[question.id] || ''}
                        onChange={(e) => handleCommentChange(question.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={2}
                        placeholder="Ajouter un commentaire"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Documents Justificatifs
                      {question.justificationRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Cliquer pour télécharger ou glisser-déposer</p>
                      <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX jusqu'à 10MB</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentAxis(Math.max(0, currentAxis - 1))}
              disabled={currentAxis === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Section Précédente
            </button>
            
            {currentAxis < axes.length - 1 ? (
              <button
                onClick={() => setCurrentAxis(currentAxis + 1)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Section Suivante
              </button>
            ) : (
              <button
                onClick={handleSubmitAssessment}
                disabled={isSubmitting || completedAxes !== axes.length}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Soumission...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5" />
                    <span>Soumettre l'Évaluation</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentPage;
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Calendar, TrendingUp, Building2, FileText, Download, Eye } from 'lucide-react';

const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { institutions, assessments, axes } = useData();
  const [selectedInstitution, setSelectedInstitution] = useState<string>('');
  const [selectedAssessment, setSelectedAssessment] = useState<string>('');

  // Filtrer les évaluations selon le rôle
  const getFilteredAssessments = () => {
    if (user?.role === 'institution') {
      return assessments.filter(a => a.institutionId === user.institutionId);
    } else if (user?.role === 'supervisor') {
      // Pour le superviseur, on peut filtrer par institutions supervisées
      return assessments;
    }
    return assessments; // Admin voit tout
  };

  const filteredAssessments = getFilteredAssessments();
  const availableInstitutions = institutions.filter(inst => 
    filteredAssessments.some(assessment => assessment.institutionId === inst.id)
  );

  const displayedAssessments = filteredAssessments.filter(assessment => 
    !selectedInstitution || assessment.institutionId === selectedInstitution
  );

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'high': return 'ÉLEVÉ';
      case 'medium': return 'MOYEN';
      case 'low': return 'FAIBLE';
      default: return 'INCONNU';
    }
  };

  const viewAssessmentDetails = (assessmentId: string) => {
    setSelectedAssessment(assessmentId);
  };

  const selectedAssessmentData = assessments.find(a => a.id === selectedAssessment);

  if (selectedAssessmentData) {
    const institution = institutions.find(i => i.id === selectedAssessmentData.institutionId);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedAssessment('')}
            className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
          >
            <span>← Retour à l'historique</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{institution?.name}</h1>
              <p className="text-gray-600">Détails de l'évaluation du {selectedAssessmentData.submittedAt.toLocaleDateString()}</p>
            </div>
            <div className="flex space-x-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>PDF</span>
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Excel</span>
              </button>
            </div>
          </div>

          {/* Score global et niveau de risque */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {selectedAssessmentData.totalScore.toFixed(1)}/5.0
              </div>
              <p className="text-sm text-gray-600">Score Global</p>
            </div>
            
            <div className="text-center p-6 rounded-lg border-2">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getRiskColor(selectedAssessmentData.riskLevel)}`}>
                RISQUE {getRiskLabel(selectedAssessmentData.riskLevel)}
              </div>
              <p className="text-sm text-gray-600 mt-2">Niveau de Risque</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Évaluation du {selectedAssessmentData.submittedAt.toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Scores par axe */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scores par Axe d'Évaluation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(selectedAssessmentData.axisScores).map(([axisId, score]: [string, any]) => {
                const axis = axes.find(a => a.id === axisId);
                if (!axis || axisId === 'institution') return null;
                
                const percentage = (score / 5) * 100;
                const isGood = score <= 2;
                
                return (
                  <div key={axisId} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{axis.name}</h4>
                      <span className="font-bold text-gray-900">{score.toFixed(1)}/5.0</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${isGood ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommandations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommandations</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <ul className="space-y-2">
                {selectedAssessmentData.riskLevel === 'high' && (
                  <>
                    <li className="flex items-start space-x-2 text-blue-800">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Mise en place urgente d'un plan d'action pour réduire les risques identifiés</span>
                    </li>
                    <li className="flex items-start space-x-2 text-blue-800">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Renforcement des contrôles internes et des procédures LBC/FT</span>
                    </li>
                  </>
                )}
                {selectedAssessmentData.riskLevel === 'medium' && (
                  <>
                    <li className="flex items-start space-x-2 text-blue-800">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Amélioration des procédures de contrôle existantes</span>
                    </li>
                    <li className="flex items-start space-x-2 text-blue-800">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Formation du personnel sur les risques LBC/FT</span>
                    </li>
                  </>
                )}
                {selectedAssessmentData.riskLevel === 'low' && (
                  <>
                    <li className="flex items-start space-x-2 text-blue-800">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Maintenir les bonnes pratiques actuelles</span>
                    </li>
                    <li className="flex items-start space-x-2 text-blue-800">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Surveillance continue des évolutions réglementaires</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Historique des Évaluations</h1>
        <p className="text-gray-600">
          {user?.role === 'institution' 
            ? 'Consultez l\'historique de vos évaluations'
            : user?.role === 'supervisor'
            ? 'Historique des évaluations des institutions supervisées'
            : 'Historique complet de toutes les évaluations'
          }
        </p>
      </div>

      {/* Filtres */}
      {user?.role !== 'institution' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filtrer par institution :</label>
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Toutes les institutions</option>
              {availableInstitutions.map((institution) => (
                <option key={institution.id} value={institution.id}>
                  {institution.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Liste des évaluations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {user?.role !== 'institution' && (
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Institution</th>
                )}
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Score Global</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Niveau de Risque</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayedAssessments
                .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                .map((assessment) => {
                  const institution = institutions.find(i => i.id === assessment.institutionId);
                  return (
                    <tr key={assessment.id} className="hover:bg-gray-50">
                      {user?.role !== 'institution' && (
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <Building2 className="h-6 w-6 text-gray-400" />
                            <span className="font-medium text-gray-900">{institution?.name}</span>
                          </div>
                        </td>
                      )}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{assessment.submittedAt.toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="font-bold text-gray-900">{assessment.totalScore.toFixed(1)}/5.0</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(assessment.riskLevel)}`}>
                          RISQUE {getRiskLabel(assessment.riskLevel)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewAssessmentDetails(assessment.id)}
                            className="text-green-600 hover:text-green-900 p-1 flex items-center space-x-1"
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="text-sm">Détails</span>
                          </button>
                          <button className="text-blue-600 hover:text-blue-900 p-1 flex items-center space-x-1">
                            <Download className="h-4 w-4" />
                            <span className="text-sm">PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {displayedAssessments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune évaluation trouvée</h3>
          <p className="text-gray-600">
            {user?.role === 'institution' 
              ? 'Vous n\'avez pas encore d\'évaluations enregistrées.'
              : 'Aucune évaluation ne correspond aux critères sélectionnés.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Building2,
  BarChart3
} from 'lucide-react';

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { institutions, assessments, axes } = useData();
  const [selectedInstitution, setSelectedInstitution] = useState<string>('');

  // Filtrer les évaluations selon le rôle
  const getFilteredAssessments = () => {
    if (user?.role === 'institution') {
      return assessments.filter(a => a.institutionId === user.institutionId);
    }
    return assessments;
  };

  const filteredAssessments = getFilteredAssessments();

  const generateIndividualReport = (assessment: any) => {
    const institution = institutions.find(i => i.id === assessment.institutionId);
    if (!institution) return null;

    const getRiskColor = (level: string) => {
      switch (level) {
        case 'high': return 'text-red-600 bg-red-50 border-red-200';
        case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        case 'low': return 'text-green-600 bg-green-50 border-green-200';
        default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
    };

    const getRecommendations = (riskLevel: string, scores: any) => {
      const recommendations = [];
      
      if (riskLevel === 'high') {
        recommendations.push("Mise en place urgente d'un plan d'action pour réduire les risques identifiés");
        recommendations.push("Renforcement des contrôles internes et des procédures LBC/FT");
      }
      
      Object.entries(scores).forEach(([axis, score]: [string, any]) => {
        if (axis !== 'institution' && score > 3) {
          const axisName = axes.find(a => a.id === axis)?.name || axis;
          recommendations.push(`Amélioration nécessaire sur l'axe ${axisName}`);
        }
      });

      if (recommendations.length === 0) {
        recommendations.push("Maintenir les bonnes pratiques actuelles");
        recommendations.push("Surveillance continue des évolutions réglementaires");
      }

      return recommendations;
    };

    const recommendations = getRecommendations(assessment.riskLevel, assessment.axisScores);

    return (
      <div key={assessment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Building2 className="h-8 w-8 text-gray-400" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{institution.name}</h3>
              <p className="text-gray-600">Rapport d'évaluation - {assessment.submittedAt.toLocaleDateString()}</p>
            </div>
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

        {/* Score Global */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {assessment.totalScore.toFixed(1)}/5.0
            </div>
            <p className="text-sm text-gray-600">Score Global</p>
          </div>
          
          <div className="text-center p-6 rounded-lg border-2">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getRiskColor(assessment.riskLevel)}`}>
              RISQUE {assessment.riskLevel === 'high' ? 'ÉLEVÉ' : 
                      assessment.riskLevel === 'medium' ? 'MOYEN' : 'FAIBLE'}
            </div>
            <p className="text-sm text-gray-600 mt-2">Niveau de Risque</p>
          </div>

          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Prochaine supervision : {
                assessment.riskLevel === 'high' ? '1 an' :
                assessment.riskLevel === 'medium' ? '3 ans' : '5 ans'
              }
            </p>
          </div>
        </div>

        {/* Scores par Axe */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Scores par Axe d'Évaluation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(assessment.axisScores).map(([axisId, score]: [string, any]) => {
              const axis = axes.find(a => a.id === axisId);
              if (!axis || axisId === 'institution') return null;
              
              const percentage = (score / 5) * 100;
              const isGood = score <= 2;
              
              return (
                <div key={axisId} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{axis.name}</h5>
                    <div className="flex items-center space-x-2">
                      {isGood ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-bold text-gray-900">{score.toFixed(1)}/5.0</span>
                    </div>
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

        {/* Points Forts et Faibles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Points Forts</span>
            </h4>
            <ul className="space-y-2">
              {Object.entries(assessment.axisScores).map(([axisId, score]: [string, any]) => {
                const axis = axes.find(a => a.id === axisId);
                if (!axis || axisId === 'institution' || score > 2) return null;
                
                return (
                  <li key={axisId} className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Bon contrôle sur {axis.name.toLowerCase()}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-red-900 mb-4 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Points à Améliorer</span>
            </h4>
            <ul className="space-y-2">
              {Object.entries(assessment.axisScores).map(([axisId, score]: [string, any]) => {
                const axis = axes.find(a => a.id === axisId);
                if (!axis || axisId === 'institution' || score <= 2) return null;
                
                return (
                  <li key={axisId} className="flex items-center space-x-2 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Risques élevés sur {axis.name.toLowerCase()}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Recommandations */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Recommandations Personnalisées</h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-2 text-blue-800">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rapports d'Évaluation</h1>
        <p className="text-gray-600">
          {user?.role === 'institution' 
            ? 'Consultez vos rapports d\'évaluation et recommandations'
            : 'Rapports individuels générés automatiquement après chaque évaluation'
          }
        </p>
      </div>

      {/* Statistiques */}
      {user?.role !== 'institution' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Rapports</p>
                <p className="text-3xl font-bold text-gray-900">{filteredAssessments.length}</p>
              </div>
              <FileText className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Risque Élevé</p>
                <p className="text-3xl font-bold text-red-600">
                  {filteredAssessments.filter(a => a.riskLevel === 'high').length}
                </p>
              </div>
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Risque Moyen</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {filteredAssessments.filter(a => a.riskLevel === 'medium').length}
                </p>
              </div>
              <BarChart3 className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Risque Faible</p>
                <p className="text-3xl font-bold text-green-600">
                  {filteredAssessments.filter(a => a.riskLevel === 'low').length}
                </p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>
        </div>
      )}

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
              {institutions.map((institution) => (
                <option key={institution.id} value={institution.id}>
                  {institution.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Liste des Rapports */}
      <div>
        {filteredAssessments
          .filter(assessment => !selectedInstitution || assessment.institutionId === selectedInstitution)
          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
          .map(assessment => generateIndividualReport(assessment))}
        
        {filteredAssessments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rapport disponible</h3>
            <p className="text-gray-600">
              {user?.role === 'institution' 
                ? 'Complétez votre première évaluation pour générer un rapport.'
                : 'Les rapports seront générés automatiquement après les évaluations.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
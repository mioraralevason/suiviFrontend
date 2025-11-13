import React from 'react';
import { useData } from '../../context/DataContext';
import { Building2, Calendar, TrendingUp, ArrowLeft } from 'lucide-react';

interface InstitutionDetailsPageProps {
  institutionId: string;
  onBack: () => void;
}

const InstitutionDetailsPage: React.FC<InstitutionDetailsPageProps> = ({ institutionId, onBack }) => {
  const { institutions, assessments, axes } = useData();
  
  const institution = institutions.find(i => i.id === institutionId);
  const institutionAssessments = assessments.filter(a => a.institutionId === institutionId);
  
  if (!institution) {
    return <div>Institution non trouvée</div>;
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Retour à la liste</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Building2 className="h-12 w-12 text-gray-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{institution.name}</h1>
            <p className="text-gray-600 capitalize">{institution.sector}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(institution.riskLevel)}`}>
                {institution.riskLevel === 'high' ? 'RISQUE ÉLEVÉ' : 
                 institution.riskLevel === 'medium' ? 'RISQUE MOYEN' : 'RISQUE FAIBLE'}
              </span>
              {institution.score && (
                <span className="text-sm text-gray-600">Score: {institution.score.toFixed(1)}/5.0</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {institutionAssessments.length}
            </div>
            <p className="text-sm text-gray-600">Évaluations Réalisées</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {institution.lastAssessment ? institution.lastAssessment.toLocaleDateString() : 'Jamais'}
            </div>
            <p className="text-sm text-gray-600">Dernière Évaluation</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {institution.nextSupervision ? institution.nextSupervision.toLocaleDateString() : 'À planifier'}
            </div>
            <p className="text-sm text-gray-600">Prochaine Supervision</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activités</h3>
          <div className="flex flex-wrap gap-2">
            {institution.activities.map((activity, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {activity}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Historique des évaluations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Historique des Évaluations</h2>
        
        {institutionAssessments.length > 0 ? (
          <div className="space-y-6">
            {institutionAssessments.map((assessment) => (
              <div key={assessment.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {assessment.submittedAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-gray-900">
                      Score Global: {assessment.totalScore.toFixed(1)}/5.0
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(assessment.axisScores).map(([axisId, score]) => {
                    const axis = axes.find(a => a.id === axisId);
                    if (!axis || axisId === 'institution') return null;
                    
                    return (
                      <div key={axisId} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">{axis.name}</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-gray-900">
                            {score.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-600">/5.0</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(score / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune évaluation</h3>
            <p className="text-gray-600">Cette institution n'a pas encore réalisé d'évaluation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionDetailsPage;
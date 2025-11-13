import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  Shield, 
  AlertCircle, 
  Calendar, 
  TrendingUp, 
  FileText,
  CheckCircle,
  Clock
} from 'lucide-react';

const InstitutionDashboard: React.FC = () => {
  const { user } = useAuth();
  const { institutions, assessments } = useData();
  
  const institution = institutions.find(i => i.id === user?.institutionId);
  const latestAssessment = assessments
    .filter(a => a.institutionId === user?.institutionId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];

  if (!institution) {
    return <div>Institution not found</div>;
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSupervisionPeriod = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'Supervision annuelle';
      case 'medium': return 'Supervision tous les 3 ans';
      case 'low': return 'Supervision tous les 5 ans';
      default: return 'Non déterminé';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{institution.name}</h1>
        <p className="text-gray-600">Tableau de Bord d'Évaluation des Risques LBC/FT</p>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Évaluation Actuelle des Risques</h2>
          <Shield className="h-8 w-8 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-lg bg-gray-50">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {institution.score?.toFixed(1) || 'N/A'}
            </div>
            <p className="text-sm text-gray-600">Score Global</p>
          </div>
          
          <div className="text-center p-4 rounded-lg">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(institution.riskLevel)}`}>
              RISQUE {institution.riskLevel === 'high' ? 'ÉLEVÉ' : 
                      institution.riskLevel === 'medium' ? 'MOYEN' : 'FAIBLE'}
            </div>
            <p className="text-sm text-gray-600 mt-2">Classification de Risque</p>
          </div>

          <div className="text-center p-4 rounded-lg bg-gray-50">
            <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{getSupervisionPeriod(institution.riskLevel)}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut de l'Évaluation</h3>
          
          {institution.lastAssessment ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Évaluation terminée</span>
              </div>
              <p className="text-sm text-gray-600">
                Dernière soumission : {institution.lastAssessment.toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                Prochaine supervision : {institution.nextSupervision?.toLocaleDateString() || 'À déterminer'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-orange-600">
                <Clock className="h-5 w-5" />
                <span>Évaluation en attente</span>
              </div>
              <p className="text-sm text-gray-600">Complétez votre évaluation des risques pour recevoir votre classification</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Commencer l'Évaluation
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h3>
          
          <div className="space-y-3">
            {institution.lastAssessment && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <FileText className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Évaluation Soumise</p>
                  <p className="text-sm text-green-600">Évaluation annuelle des risques terminée</p>
                  <p className="text-xs text-green-500 mt-1">
                    {institution.lastAssessment.toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Classification de Risque Mise à Jour</p>
                <p className="text-sm text-blue-600">Classification : risque {institution.riskLevel}</p>
                <p className="text-xs text-blue-500 mt-1">Généré par le système</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      {latestAssessment && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Détail des Scores</h3>
          
          <div className="space-y-4">
            {Object.entries(latestAssessment.axisScores).map(([axis, score]) => {
              const percentage = (score / 5) * 100;
              return (
                <div key={axis} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="capitalize font-medium text-gray-900">{axis}</span>
                    <span className="font-semibold text-gray-900">{score.toFixed(1)}/5.0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionDashboard;
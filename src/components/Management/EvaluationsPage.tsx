import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Plus, Building2, Users, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react';

interface Evaluation {
  id: string;
  startDate: Date;
  endDate: Date;
  institutionIds: string[];
  status: 'planned' | 'active' | 'completed';
  createdAt: Date;
}

const EvaluationsPage: React.FC = () => {
  const { user } = useAuth();
  const { institutions } = useData();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([
    {
      id: 'eval_1',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-15'),
      institutionIds: ['inst_1', 'inst_2'],
      status: 'completed',
      createdAt: new Date('2024-01-01')
    },
    {
      id: 'eval_2',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-04-01'),
      institutionIds: ['inst_1'],
      status: 'active',
      createdAt: new Date('2024-02-20')
    }
  ]);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvaluation, setNewEvaluation] = useState({
    startDate: '',
    endDate: '',
    institutionIds: [] as string[]
  });

  const handleCreateEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEvaluation.startDate || !newEvaluation.endDate || newEvaluation.institutionIds.length === 0) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (new Date(newEvaluation.startDate) >= new Date(newEvaluation.endDate)) {
      alert('La date de fin doit être postérieure à la date de début');
      return;
    }

    const evaluation: Evaluation = {
      id: `eval_${Date.now()}`,
      startDate: new Date(newEvaluation.startDate),
      endDate: new Date(newEvaluation.endDate),
      institutionIds: newEvaluation.institutionIds,
      status: new Date(newEvaluation.startDate) > new Date() ? 'planned' : 'active',
      createdAt: new Date()
    };

    setEvaluations(prev => [...prev, evaluation]);
    setShowCreateModal(false);
    setNewEvaluation({ startDate: '', endDate: '', institutionIds: [] });
    alert('Évaluation créée avec succès !');
  };

  const handleInstitutionToggle = (institutionId: string) => {
    setNewEvaluation(prev => ({
      ...prev,
      institutionIds: prev.institutionIds.includes(institutionId)
        ? prev.institutionIds.filter(id => id !== institutionId)
        : [...prev.institutionIds, institutionId]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planned': return 'Planifiée';
      case 'active': return 'En cours';
      case 'completed': return 'Terminée';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return Clock;
      case 'active': return AlertCircle;
      case 'completed': return CheckCircle;
      default: return Clock;
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accès Restreint</h3>
        <p className="text-gray-600">Vous n'avez pas les permissions pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Évaluations</h1>
          <p className="text-gray-600">Planifier et gérer les campagnes d'évaluation des institutions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Créer une Évaluation</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Évaluations</p>
              <p className="text-3xl font-bold text-gray-900">{evaluations.length}</p>
            </div>
            <Calendar className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">En Cours</p>
              <p className="text-3xl font-bold text-green-600">
                {evaluations.filter(e => e.status === 'active').length}
              </p>
            </div>
            <AlertCircle className="h-12 w-12 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Planifiées</p>
              <p className="text-3xl font-bold text-blue-600">
                {evaluations.filter(e => e.status === 'planned').length}
              </p>
            </div>
            <Clock className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Terminées</p>
              <p className="text-3xl font-bold text-gray-600">
                {evaluations.filter(e => e.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-12 w-12 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Liste des évaluations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Période</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Statut</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Institutions</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Créée le</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {evaluations
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((evaluation) => {
                  const StatusIcon = getStatusIcon(evaluation.status);
                  const evaluationInstitutions = institutions.filter(inst => 
                    evaluation.institutionIds.includes(inst.id)
                  );
                  
                  return (
                    <tr key={evaluation.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {evaluation.startDate.toLocaleDateString()} - {evaluation.endDate.toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {Math.ceil((evaluation.endDate.getTime() - evaluation.startDate.getTime()) / (1000 * 60 * 60 * 24))} jours
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="h-4 w-4" />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(evaluation.status)}`}>
                            {getStatusLabel(evaluation.status)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {evaluation.institutionIds.length} institution{evaluation.institutionIds.length > 1 ? 's' : ''}
                            </p>
                            <div className="text-sm text-gray-500">
                              {evaluationInstitutions.slice(0, 2).map(inst => inst.name).join(', ')}
                              {evaluationInstitutions.length > 2 && ` +${evaluationInstitutions.length - 2} autres`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-600">
                          {evaluation.createdAt.toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button className="text-green-600 hover:text-green-900 font-medium">
                            Voir Détails
                          </button>
                          {evaluation.status === 'planned' && (
                            <button className="text-blue-600 hover:text-blue-900 font-medium">
                              Modifier
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {evaluations.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune évaluation créée</h3>
          <p className="text-gray-600 mb-6">Commencez par créer votre première campagne d'évaluation.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Créer une Évaluation
          </button>
        </div>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Créer une Nouvelle Évaluation</h3>
            
            <form onSubmit={handleCreateEvaluation} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de Début *
                  </label>
                  <input
                    type="date"
                    value={newEvaluation.startDate}
                    onChange={(e) => setNewEvaluation({...newEvaluation, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de Fin *
                  </label>
                  <input
                    type="date"
                    value={newEvaluation.endDate}
                    onChange={(e) => setNewEvaluation({...newEvaluation, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institutions à Évaluer * ({newEvaluation.institutionIds.length} sélectionnée{newEvaluation.institutionIds.length > 1 ? 's' : ''})
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {institutions.map((institution) => (
                      <label key={institution.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={newEvaluation.institutionIds.includes(institution.id)}
                          onChange={() => handleInstitutionToggle(institution.id)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{institution.name}</span>
                          </div>
                          <p className="text-sm text-gray-500 ml-6">{institution.sector}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                {newEvaluation.institutionIds.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">Veuillez sélectionner au moins une institution</p>
                )}
              </div>
              
              <div className="flex space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewEvaluation({ startDate: '', endDate: '', institutionIds: [] });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Créer l'Évaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationsPage;
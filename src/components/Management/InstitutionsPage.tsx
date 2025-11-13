import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

import { Building2, Plus, Search, ListFilter as Filter, AlertTriangle } from 'lucide-react';
import { Institution } from '../../types';

const InstitutionsPage: React.FC = () => {
  const { user } = useAuth();
  const { institutions, updateInstitution,assessments} = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredInstitutions = institutions.filter(institution => {
    const matchesSearch = institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         institution.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'all' || institution.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSupervisionFrequency = (risk: string) => {
    switch (risk) {
      case 'high': return 'Annuelle';
      case 'medium': return 'Tous les 3 ans';
      case 'low': return 'Tous les 5 ans';
      default: return 'À déterminer';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Institutions Financières</h1>
          <p className="text-gray-600">Gérer et surveiller toutes les institutions enregistrées</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Ajouter Institution</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des institutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Tous Niveaux de Risque</option>
              <option value="high">Risque Élevé</option>
              <option value="medium">Risque Moyen</option>
              <option value="low">Risque Faible</option>
            </select>
          </div>
        </div>
      </div>

      {/* Institutions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Institution</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Sector</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Niveau de Risque</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Score</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Dernière Évaluation</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Supervision</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInstitutions.map((institution) => (
                <tr key={institution.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{institution.name}</p>
                        <p className="text-sm text-gray-500">
                          {institution.activities.join(', ')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="capitalize text-gray-900">{institution.sector}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskBadgeColor(institution.riskLevel)}`}>
                      {institution.riskLevel === 'high' ? 'ÉLEVÉ' : 
                       institution.riskLevel === 'medium' ? 'MOYEN' : 'FAIBLE'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900">
                      {institution.score ? institution.score.toFixed(1) : 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-600">
                      {institution.lastAssessment 
                        ? institution.lastAssessment.toLocaleDateString()
                        : 'Jamais'
                      }
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {getSupervisionFrequency(institution.riskLevel)}
                      </p>
                      {institution.nextSupervision && (
                        <p className="text-xs text-gray-500">
                          Prochaine : {institution.nextSupervision.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => window.location.hash = `#institution-details-${institution.id}`}
                        className="text-green-600 hover:text-green-900 font-medium"
                      >
                      Voir Détails
                      </button>
                      {(user?.role === 'admin' || user?.role === 'supervisor') && (
                        <button 
                          onClick={() => {
                            // Vérifier si l'institution a déjà été évaluée
                            const hasAssessment = assessments.some(a => a.institutionId === institution.id);
                            
                            if (hasAssessment) {
                              const confirmed = confirm(
                                'Cette institution a déjà été évaluée. Voulez-vous procéder à une nouvelle évaluation ?'
                              );
                              if (confirmed) {
                                window.location.hash = `#assessment`;
                                // Stocker l'ID de l'institution pour l'évaluation
                                sessionStorage.setItem('evaluationInstitutionId', institution.id);
                              }
                            } else {
                              window.location.hash = `#assessment`;
                              sessionStorage.setItem('evaluationInstitutionId', institution.id);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Évaluer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Institutions</p>
                <p className="text-3xl font-bold text-gray-900">{institutions.length}</p>
              </div>
              <Building2 className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Risque Élevé</p>
                <p className="text-3xl font-bold text-red-600">
                  {institutions.filter(i => i.riskLevel === 'high').length}
                </p>
              </div>
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Score Moyen</p>
                <p className="text-3xl font-bold text-green-600">
                  {(institutions.reduce((sum, i) => sum + (i.score || 0), 0) / institutions.length).toFixed(1)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">Moy</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionsPage;
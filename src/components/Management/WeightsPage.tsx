import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Scale, Plus, CreditCard as Edit, Trash2, Save } from 'lucide-react';
import { SectorWeight } from '../../types';

const WeightsPage: React.FC = () => {
  const { sectorWeights, addSectorWeight, updateSectorWeight, deleteSectorWeight } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWeight, setEditingWeight] = useState<SectorWeight | null>(null);
  const [newWeight, setNewWeight] = useState({
    name: '',
    weight: 1.0,
    coefficient: 1.0
  });

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const weight: SectorWeight = {
      id: `sw_${Date.now()}`,
      ...newWeight
    };
    addSectorWeight(weight);
    setShowAddModal(false);
    setNewWeight({ name: '', weight: 1.0, coefficient: 1.0 });
  };

  const handleEditWeight = (weight: SectorWeight) => {
    setEditingWeight(weight);
    setNewWeight({
      name: weight.name,
      weight: weight.weight,
      coefficient: weight.coefficient
    });
  };

  const handleUpdateWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWeight) {
      updateSectorWeight(editingWeight.id, newWeight);
      setEditingWeight(null);
      setNewWeight({ name: '', weight: 1.0, coefficient: 1.0 });
    }
  };

  const resetForm = () => {
    setNewWeight({ name: '', weight: 1.0, coefficient: 1.0 });
    setEditingWeight(null);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pondérations par Secteur</h1>
          <p className="text-gray-600">Configurer les poids et coefficients pour chaque secteur d'activité</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Ajouter Secteur</span>
        </button>
      </div>

      {/* Liste des pondérations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Secteur</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Poids</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Coefficient</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Niveau de Risque</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sectorWeights.map((weight) => {
                const getRiskLevel = (coeff: number) => {
                  if (coeff >= 2.5) return { label: 'Élevé', color: 'bg-red-100 text-red-800' };
                  if (coeff >= 1.5) return { label: 'Moyen', color: 'bg-yellow-100 text-yellow-800' };
                  return { label: 'Faible', color: 'bg-green-100 text-green-800' };
                };
                
                const riskLevel = getRiskLevel(weight.coefficient);
                
                return (
                  <tr key={weight.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">{weight.name}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900">{weight.weight.toFixed(1)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900">{weight.coefficient.toFixed(1)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${riskLevel.color}`}>
                        {riskLevel.label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditWeight(weight)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteSectorWeight(weight.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Guide des pondérations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Guide des Pondérations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Poids (1.0 - 3.0)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>1.0 - 1.5</span>
                <span className="text-green-600">Impact faible</span>
              </div>
              <div className="flex justify-between">
                <span>1.6 - 2.5</span>
                <span className="text-yellow-600">Impact modéré</span>
              </div>
              <div className="flex justify-between">
                <span>2.6 - 3.0</span>
                <span className="text-red-600">Impact élevé</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Coefficient (1.0 - 3.0)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>1.0 - 1.4</span>
                <span className="text-green-600">Risque faible</span>
              </div>
              <div className="flex justify-between">
                <span>1.5 - 2.4</span>
                <span className="text-yellow-600">Risque moyen</span>
              </div>
              <div className="flex justify-between">
                <span>2.5 - 3.0</span>
                <span className="text-red-600">Risque élevé</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'ajout/modification */}
      {(showAddModal || editingWeight) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingWeight ? 'Modifier le Secteur' : 'Ajouter Nouveau Secteur'}
            </h3>
            
            <form onSubmit={editingWeight ? handleUpdateWeight : handleAddWeight} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du Secteur *
                </label>
                <input
                  type="text"
                  value={newWeight.name}
                  onChange={(e) => setNewWeight({...newWeight, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="ex: Banque, Assurance, Casino..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poids (1.0 - 3.0) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="3.0"
                  value={newWeight.weight}
                  onChange={(e) => setNewWeight({...newWeight, weight: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coefficient (1.0 - 3.0) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="3.0"
                  value={newWeight.coefficient}
                  onChange={(e) => setNewWeight({...newWeight, coefficient: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingWeight ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeightsPage;
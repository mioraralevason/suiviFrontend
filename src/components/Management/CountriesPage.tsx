import React, { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, AlertTriangle, Shield, Loader2 } from 'lucide-react';
import { API_BASE } from '../../config/api';
import { Country } from '../../types';

const CountriesPage: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCountry, setNewCountry] = useState({ code: '', name: '', listType: 'greylist' as 'blacklist' | 'greylist' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const loadCountries = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/countries`);
      if (!res.ok) throw new Error('Erreur chargement pays');
      const data: Country[] = await res.json();
      const mappedData = data.map(c => ({
        ...c,
        listType: c.categoriePays?.libelle === 'Liste Noire'
          ? 'blacklist'
          : c.categoriePays?.libelle === 'Liste Grise'
          ? 'greylist'
          : undefined as 'blacklist' | 'greylist' | undefined
      }));
      setCountries(mappedData);
      setAvailableCountries(mappedData);
    } catch (err) {
      setError((err as Error).message);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadCountries(); }, []);

  const blacklistCountries = countries.filter(c => c.listType === 'blacklist');
  const greylistCountries = countries.filter(c => c.listType === 'greylist');

  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/countries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCountry)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Erreur ajout pays');
      }
      await loadCountries();
      setShowAddModal(false);
      setNewCountry({ code: '', name: '', listType: 'greylist' });
    } catch (err) { setError((err as Error).message); }
    finally { setLoading(false); }
  };

  const handleDeleteCountry = async (idPays: string) => {
    if (!confirm('Confirmer suppression ?')) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/countries/${idPays}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur suppression pays');
      await loadCountries();
    } catch (err) { setError((err as Error).message); }
    finally { setLoading(false); }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = availableCountries.find(c => c.libelle === e.target.value);
    if (country) setNewCountry({ ...newCountry, name: country.libelle, code: country.code });
  };

  if (loading && countries.length === 0) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8"/></div>;

  if (loading && countries.length === 0) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Risques Pays</h1>
          <p className="text-gray-600">Gérer les pays de liste noire et liste grise pour l'évaluation des risques</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
          <span>Ajouter Pays</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertTriangle className="h-5 w-5 inline mr-2" />
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Pays</p>
              <p className="text-3xl font-bold text-gray-900">{countries.length}</p>
            </div>
            <Globe className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Liste Noire</p>
              <p className="text-3xl font-bold text-red-600">{blacklistCountries.length}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Liste Grise</p>
              <p className="text-3xl font-bold text-yellow-600">{greylistCountries.length}</p>
            </div>
            <Shield className="h-12 w-12 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Country Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blacklist */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">Pays Liste Noire</h2>
            <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
              {blacklistCountries.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {blacklistCountries.map((country) => (
              <div key={country.idPays} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-4 bg-red-200 rounded flex items-center justify-center">
                    <span className="text-xs font-medium text-red-800">{country.code}</span>
                  </div>
                  <span className="font-medium text-red-900">{country.libelle}</span>
                </div>
                <button 
                  onClick={() => handleDeleteCountry(country.idPays)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {blacklistCountries.length === 0 && (
              <p className="text-gray-500 text-center py-4">Aucun pays en liste noire</p>
            )}
          </div>
        </div>

        {/* Greylist */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Shield className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">Pays Liste Grise</h2>
            <span className="bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded-full">
              {greylistCountries.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {greylistCountries.map((country) => (
              <div key={country.idPays} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-4 bg-yellow-200 rounded flex items-center justify-center">
                    <span className="text-xs font-medium text-yellow-800">{country.code}</span>
                  </div>
                  <span className="font-medium text-yellow-900">{country.libelle}</span>
                </div>
                <button 
                  onClick={() => handleDeleteCountry(country.idPays)}
                  disabled={loading}
                  className="text-yellow-600 hover:text-yellow-900 p-1 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {greylistCountries.length === 0 && (
              <p className="text-gray-500 text-center py-4">Aucun pays en liste grise</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Country Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter Nouveau Pays</h3>
            
            <form onSubmit={handleAddCountry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du Pays
                </label>
                <select
                  value={newCountry.name}
                  onChange={handleCountryChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                  required
                >
                  <option value="" disabled>Sélectionnez un pays</option>
                  {availableCountries.map(country => (
                    <option key={country.idPays} value={country.libelle}>
                      {country.libelle} ({country.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de Liste de Risque
                </label>
                <select
                  value={newCountry.listType}
                  onChange={(e) => setNewCountry({...newCountry, listType: e.target.value as 'blacklist' | 'greylist'})}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="greylist">Liste Grise</option>
                  <option value="blacklist">Liste Noire</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading || !newCountry.name}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Ajouter Pays'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountriesPage;
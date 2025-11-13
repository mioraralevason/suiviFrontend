import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Building2, User, Mail, Phone, Calendar, Users, DollarSign, MapPin, CreditCard as Edit, Save, X } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { institutions, assessments } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    address: '',
    sector: '',
    employeeCount: 0,
    annualRevenue: 0,
    creationDate: '',
    mainContact: {
      name: '',
      email: '',
      phone: ''
    }
  });

  const institution = institutions.find(i => i.id === user?.institutionId);
  const institutionAssessments = assessments.filter(a => a.institutionId === user?.institutionId);

  useEffect(() => {
    if (institution) {
      setProfileData({
        name: institution.name,
        address: institution.address || '',
        sector: institution.sector,
        employeeCount: institution.employeeCount || 0,
        annualRevenue: institution.annualRevenue || 0,
        creationDate: institution.creationDate?.toISOString().split('T')[0] || '',
        mainContact: institution.mainContact || { name: '', email: '', phone: '' }
      });
    }
  }, [institution]);

  const handleSave = () => {
    // Sauvegarder les modifications
    console.log('Sauvegarde du profil:', profileData);
    setIsEditing(false);
    alert('Profil mis à jour avec succès !');
  };

  const getSectorLabel = (sector: string) => {
    const sectors = {
      'banque': 'Banque',
      'microfinance': 'Microfinance',
      'assurance': 'Assurance',
      'immobilier': 'Immobilier',
      'casino': 'Casino / Jeux de hasard',
      'metaux_precieux': 'Métaux précieux',
      'avocat': 'Avocat / Notaire',
      'comptable': 'Comptable',
      'vehicules': 'Véhicules'
    };
    return sectors[sector as keyof typeof sectors] || sector;
  };

  if (!institution) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Institution non trouvée</h3>
        <p className="text-gray-600">Impossible de charger les informations de votre institution.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil Institution</h1>
          <p className="text-gray-600">Informations détaillées de votre institution</p>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          {isEditing ? <Save className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
          <span>{isEditing ? 'Sauvegarder' : 'Modifier'}</span>
        </button>
      </div>

      {/* Informations générales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations Générales</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-2" />
              Nom de l'institution
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 font-medium">{profileData.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              Secteur d'activité
            </label>
            {isEditing ? (
              <select
                value={profileData.sector}
                onChange={(e) => setProfileData({...profileData, sector: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="banque">Banque</option>
                <option value="microfinance">Microfinance</option>
                <option value="assurance">Assurance</option>
                <option value="immobilier">Immobilier</option>
                <option value="casino">Casino / Jeux de hasard</option>
                <option value="metaux_precieux">Métaux précieux</option>
                <option value="avocat">Avocat / Notaire</option>
                <option value="comptable">Comptable</option>
                <option value="vehicules">Véhicules</option>
              </select>
            ) : (
              <p className="text-gray-900 font-medium">{getSectorLabel(profileData.sector)}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              Adresse
            </label>
            {isEditing ? (
              <textarea
                value={profileData.address}
                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
              />
            ) : (
              <p className="text-gray-900">{profileData.address || 'Non renseignée'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 inline mr-2" />
              Nombre d'employés
            </label>
            {isEditing ? (
              <input
                type="number"
                value={profileData.employeeCount}
                onChange={(e) => setProfileData({...profileData, employeeCount: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 font-medium">{profileData.employeeCount.toLocaleString()}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 inline mr-2" />
              Chiffre d'affaires annuel (Ar)
            </label>
            {isEditing ? (
              <input
                type="number"
                value={profileData.annualRevenue}
                onChange={(e) => setProfileData({...profileData, annualRevenue: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 font-medium">{profileData.annualRevenue.toLocaleString()} Ar</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Date de création
            </label>
            {isEditing ? (
              <input
                type="date"
                value={profileData.creationDate}
                onChange={(e) => setProfileData({...profileData, creationDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 font-medium">
                {profileData.creationDate ? new Date(profileData.creationDate).toLocaleDateString() : 'Non renseignée'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contact principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Principal</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Nom complet
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.mainContact.name}
                onChange={(e) => setProfileData({
                  ...profileData,
                  mainContact: {...profileData.mainContact, name: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 font-medium">{profileData.mainContact.name || 'Non renseigné'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={profileData.mainContact.email}
                onChange={(e) => setProfileData({
                  ...profileData,
                  mainContact: {...profileData.mainContact, email: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 font-medium">{profileData.mainContact.email || 'Non renseigné'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4 inline mr-2" />
              Téléphone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={profileData.mainContact.phone}
                onChange={(e) => setProfileData({
                  ...profileData,
                  mainContact: {...profileData.mainContact, phone: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 font-medium">{profileData.mainContact.phone || 'Non renseigné'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Statistiques d'évaluation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Statistiques d'Évaluation</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {institutionAssessments.length}
            </div>
            <p className="text-sm text-blue-800">Évaluations Réalisées</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {institution.score?.toFixed(1) || 'N/A'}
            </div>
            <p className="text-sm text-green-800">Score Actuel</p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {institution.riskLevel === 'high' ? 'ÉLEVÉ' : 
               institution.riskLevel === 'medium' ? 'MOYEN' : 'FAIBLE'}
            </div>
            <p className="text-sm text-orange-800">Niveau de Risque</p>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setIsEditing(false)}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors flex items-center space-x-2"
          >
            <X className="h-5 w-5" />
            <span>Annuler</span>
          </button>
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Save className="h-5 w-5" />
            <span>Sauvegarder</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
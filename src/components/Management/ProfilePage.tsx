import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Building2, User, Mail, Phone, Calendar, Users, DollarSign, MapPin, CreditCard as Edit, Save, X } from 'lucide-react';
import { API_BASE } from '../../config/api'; // ✅ Import de API_BASE
import { toast } from 'react-hot-toast'; // ✅ Import de toast pour les notifications

const ProfilePage: React.FC = () => {
  const { user, token } = useAuth(); // ✅ Récupérer le token depuis le contexte
  const { institutions, assessments, loadInstitutionById } = useData();
  
  // ✅ LOGS DE DEBUG
  console.log('=== DEBUG ProfilePage ===');
  console.log('User:', user);
  console.log('User institutionId:', user?.institutionId);
  console.log('Institutions disponibles:', institutions);
  console.log('Nombre d\'institutions:', institutions.length);
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    denominationSociale: '',
    nomCommercial: '',
    formeJuridique: '',
    dateDebutOperations: '',
    adresseSiegeSocial: '',
    adresseActivitePrincipale: '',
    adressesSecondaires: '',
    numeroTelephone: '',
    adresseEmail: '',
    listeActivites: '',
    activitePrincipale: '',
    activitesSecondaires: '',
    description: '',
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // ✅ État pour le bouton de sauvegarde
  const [institutionData, setInstitutionData] = useState<any>(null); // ✅ Stocker l'institution directement

  // ✅ Charger l'institution de l'utilisateur connecté via l'API
  useEffect(() => {
    const fetchUserInstitution = async () => {
      if (!user || user.role !== 'institution' || !token) {
        console.log('DEBUG: Skip chargement institution - user:', user?.role, 'token:', !!token);
        setLoading(false);
        return;
      }

      try {
        console.log('DEBUG: Chargement de l\'institution pour l\'utilisateur:', user.email);
        
        // ✅ Utiliser l'endpoint qui trouve l'institution par email utilisateur
        const response = await fetch(`${API_BASE}/institution/by-user-email`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('DEBUG: Institution récupérée:', data);
          setInstitutionData(data);
        } else {
          const errorText = await response.text();
          console.error('DEBUG: Erreur lors de la récupération de l\'institution:', response.status, errorText);
        }
      } catch (error) {
        console.error('DEBUG: Error fetching user institution:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInstitution();
  }, [user, token]);

  // Utiliser institutionData au lieu de chercher dans institutions
  const institution = institutionData || institutions.find(i => i.id === user?.institutionId);
  const institutionAssessments = assessments.filter(a => a.institutionId === user?.institutionId);
  
  // ✅ LOG SUPPLÉMENTAIRE
  console.log('Institution trouvée:', institution);
  console.log('Recherche avec ID:', user?.institutionId);

  useEffect(() => {
    // Check if institution is loaded
    if (institution) {
      setProfileData({
        denominationSociale: institution.denominationSociale || '',
        nomCommercial: institution.nomCommercial || '',
        formeJuridique: institution.formeJuridique || '',
        dateDebutOperations: institution.dateDebutOperations ? 
          (typeof institution.dateDebutOperations === 'string' ? institution.dateDebutOperations.split('T')[0] : institution.dateDebutOperations.toISOString().split('T')[0]) :
          (institution.creationDate ? 
            (typeof institution.creationDate === 'string' ? institution.creationDate.split('T')[0] : institution.creationDate.toISOString().split('T')[0]) : ''),
        adresseSiegeSocial: institution.adresseSiegeSocial || institution.address || '',
        adresseActivitePrincipale: institution.adresseActivitePrincipale || '',
        adressesSecondaires: institution.adressesSecondaires || '',
        numeroTelephone: institution.numeroTelephone || '',
        adresseEmail: institution.adresseEmail || '',
        listeActivites: institution.listeActivites || '',
        activitePrincipale: institution.activitePrincipale || '',
        activitesSecondaires: institution.activitesSecondaires || '',
        description: institution.description || '',
        sector: institution.sector || '',
        employeeCount: institution.employeeCount || 0,
        annualRevenue: institution.annualRevenue || 0,
        creationDate: institution.dateDebutOperations ? 
          (typeof institution.dateDebutOperations === 'string' ? institution.dateDebutOperations.split('T')[0] : institution.dateDebutOperations.toISOString().split('T')[0]) :
          (institution.creationDate ? 
            (typeof institution.creationDate === 'string' ? institution.creationDate.split('T')[0] : institution.creationDate.toISOString().split('T')[0]) : ''),
        mainContact: institution.mainContact || { name: '', email: '', phone: '' }
      });
    }
  }, [institution]);

  const handleSave = async () => {
    // ✅ Vérifier que le token existe
    if (!token) {
      toast.error('Vous devez être connecté pour modifier le profil');
      return;
    }

    setSaving(true);
    
    try {
      // ✅ Utiliser API_BASE et le token depuis le contexte
      const response = await fetch(`${API_BASE}/institution/update-info`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          denominationSociale: profileData.denominationSociale,
          nomCommercial: profileData.nomCommercial,
          formeJuridique: profileData.formeJuridique,
          dateDebutOperations: profileData.dateDebutOperations,
          adresseSiegeSocial: profileData.adresseSiegeSocial,
          adresseActivitePrincipale: profileData.adresseActivitePrincipale,
          adressesSecondaires: profileData.adressesSecondaires,
          numeroTelephone: profileData.numeroTelephone,
          adresseEmail: profileData.adresseEmail,
          listeActivites: profileData.listeActivites,
          activitePrincipale: profileData.activitePrincipale,
          activitesSecondaires: profileData.activitesSecondaires,
        })
      });

      if (response.ok) {
        setIsEditing(false);
        toast.success('Profil mis à jour avec succès !');
        
        // ✅ Recharger les données de l'institution
        if (user?.institutionId) {
          loadInstitutionById(user.institutionId);
        }
      } else {
        const errorText = await response.text();
        toast.error(errorText || 'Erreur lors de la mise à jour du profil');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!institution) {
    if (user?.institutionId) {
      return (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Institution non trouvée</h3>
          <p className="text-gray-600">Impossible de charger les informations de votre institution.</p>
          <p className="text-sm text-gray-500 mt-2">ID de l'institution: {user.institutionId}</p>
        </div>
      );
    } else {
      return (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune institution associée</h3>
          <p className="text-gray-600">Votre compte utilisateur n'est pas associé à une institution.</p>
          <p className="text-sm text-gray-500 mt-2">Veuillez contacter l'administrateur pour associer votre compte à une institution.</p>
        </div>
      );
    }
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
          disabled={saving}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Enregistrement...</span>
            </>
          ) : (
            <>
              {isEditing ? <Save className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
              <span>{isEditing ? 'Sauvegarder' : 'Modifier'}</span>
            </>
          )}
        </button>
      </div>

      {/* Informations générales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations Générales</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-2" />
              Dénomination sociale
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.denominationSociale}
                onChange={(e) => setProfileData({...profileData, denominationSociale: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 font-medium">{profileData.denominationSociale}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-2" />
              Nom commercial
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.nomCommercial}
                onChange={(e) => setProfileData({...profileData, nomCommercial: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 font-medium">{profileData.nomCommercial || 'Non renseigné'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-2" />
              Forme juridique
            </label>
            {isEditing ? (
              <select
                value={profileData.formeJuridique}
                onChange={(e) => setProfileData({...profileData, formeJuridique: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Sélectionnez une forme juridique</option>
                <option value="SA">SA - Société Anonyme</option>
                <option value="SARL">SARL - Société à Responsabilité Limitée</option>
                <option value="SNC">SNC - Société en Nom Collectif</option>
                <option value="SCS">SCS - Société en Commandite Simple</option>
                <option value="SCA">SCA - Société en Commandite par Actions</option>
                <option value="EI">EI - Entreprise Individuelle</option>
                <option value="EURL">EURL - Entreprise Unipersonnelle à Responsabilité Limitée</option>
                <option value="SAS">SAS - Société par Actions Simplifiée</option>
                <option value="Autre">Autre</option>
              </select>
            ) : (
              <p className="text-gray-900 font-medium">{profileData.formeJuridique || 'Non renseigné'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Date de début des opérations
            </label>
            {isEditing ? (
              <input
                type="date"
                value={profileData.dateDebutOperations}
                onChange={(e) => setProfileData({...profileData, dateDebutOperations: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 font-medium">
                {profileData.dateDebutOperations ? new Date(profileData.dateDebutOperations).toLocaleDateString() : 'Non renseigné'}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              Adresse du siège social
            </label>
            {isEditing ? (
              <textarea
                value={profileData.adresseSiegeSocial}
                onChange={(e) => setProfileData({...profileData, adresseSiegeSocial: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
              />
            ) : (
              <p className="text-gray-900">{profileData.adresseSiegeSocial || 'Non renseigné'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              Adresse de l'activité principale
            </label>
            {isEditing ? (
              <textarea
                value={profileData.adresseActivitePrincipale}
                onChange={(e) => setProfileData({...profileData, adresseActivitePrincipale: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
              />
            ) : (
              <p className="text-gray-900">{profileData.adresseActivitePrincipale || 'Non renseigné'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              Adresses secondaires / succursales
            </label>
            {isEditing ? (
              <textarea
                value={profileData.adressesSecondaires}
                onChange={(e) => setProfileData({...profileData, adressesSecondaires: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
              />
            ) : (
              <p className="text-gray-900">{profileData.adressesSecondaires || 'Non renseigné'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4 inline mr-2" />
              Numéro de téléphone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={profileData.numeroTelephone}
                onChange={(e) => setProfileData({...profileData, numeroTelephone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 font-medium">{profileData.numeroTelephone || 'Non renseigné'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              Adresse email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={profileData.adresseEmail}
                onChange={(e) => setProfileData({...profileData, adresseEmail: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 font-medium">{profileData.adresseEmail || 'Non renseigné'}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-2" />
              Liste des activités effectuées
            </label>
            {isEditing ? (
              <textarea
                value={profileData.listeActivites}
                onChange={(e) => setProfileData({...profileData, listeActivites: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
              />
            ) : (
              <p className="text-gray-900">{profileData.listeActivites || 'Non renseigné'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-2" />
              Activité principale
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.activitePrincipale}
                onChange={(e) => setProfileData({...profileData, activitePrincipale: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 font-medium">{profileData.activitePrincipale || 'Non renseigné'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-2" />
              Activités secondaires
            </label>
            {isEditing ? (
              <textarea
                value={profileData.activitesSecondaires}
                onChange={(e) => setProfileData({...profileData, activitesSecondaires: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
              />
            ) : (
              <p className="text-gray-900">{profileData.activitesSecondaires || 'Non renseigné'}</p>
            )}
          </div>

          {/* Additional information fields that were in the original form */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-2" />
              Description
            </label>
            {isEditing ? (
              <textarea
                value={profileData.description}
                onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Décrivez votre institution..."
              />
            ) : (
              <p className="text-gray-900">{profileData.description || 'Non renseignée'}</p>
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
            disabled={saving}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
            <span>Annuler</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Sauvegarder</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
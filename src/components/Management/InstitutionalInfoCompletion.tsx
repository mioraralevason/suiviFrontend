import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, MapPin, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_BASE } from '../../config/api';

interface InstitutionalInfo {
  denominationSociale: string;
  nomCommercial: string;
  formeJuridique: string;
  dateDebutOperations: string;
  adresseSiegeSocial: string;
  adresseActivitePrincipale: string;
  adressesSecondaires: string;
  numeroTelephone: string;
  adresseEmail: string;
  listeActivites: string;
  activitePrincipale: string;
  activitesSecondaires: string;
}

interface Props {
  onComplete: () => void;
}

const STEPS = [
  { id: 1, title: 'Informations', icon: Building2 },
  { id: 2, title: 'Adresses', icon: MapPin },
  { id: 3, title: 'Coordonnées', icon: Phone },
  { id: 4, title: 'Activités', icon: Building2 },
];

const InstitutionalInfoCompletion: React.FC<Props> = ({ onComplete }) => {
  const { user, token, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<InstitutionalInfo>({
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
    activitesSecondaires: ''
  });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('API_BASE utilisé:', API_BASE);
    setLoading(false);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validation par étape
  const validateStep = (step: number): string[] => {
    const errors: string[] = [];

    if (step === 1) {
      if (!formData.denominationSociale.trim()) errors.push('Dénomination sociale obligatoire');
      if (!formData.dateDebutOperations) errors.push('Date de début obligatoire');
    }

    if (step === 2) {
      if (!formData.adresseSiegeSocial.trim()) errors.push('Adresse du siège social obligatoire');
    }

    if (step === 3) {
      if (!formData.numeroTelephone.trim()) errors.push('Numéro de téléphone obligatoire');
      if (!formData.adresseEmail.trim()) errors.push('Email obligatoire');
      else if (!/\S+@\S+\.\S+/.test(formData.adresseEmail)) errors.push('Email invalide');
    }

    return errors;
  };

  const goToNext = () => {
    const errors = validateStep(currentStep);
    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
      return;
    }
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateStep(currentStep);
    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/institution/update-info`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Informations enregistrées avec succès');
        if (updateUser) {
          updateUser({ ...user, needsCompletion: false });
        }
        onComplete();
      } else {
        const text = await response.text();
        toast.error(text || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    toast.error('Vous devez compléter vos informations pour continuer');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* === PROGRESS INDICATOR DYNAMIQUE === */}
      <div className="mb-10">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                      isActive
                        ? 'bg-green-600 text-white shadow-lg'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-500'
                    }`}
                  >
                    {isCompleted ? '✓' : step.id}
                  </div>
                  <p
                    className={`mt-2 text-xs font-medium transition-colors ${
                      isActive ? 'text-green-600' : isCompleted ? 'text-green-500' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      currentStep > step.id + 1 ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="flex justify-center mt-3 md:hidden">
          <span className="text-xs text-gray-500 font-medium">
            Étape {currentStep} sur {STEPS.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {STEPS[currentStep - 1].title} de l'Institution
          </h1>
          <p className="text-gray-600">
            {currentStep === 1 && 'Informations juridiques de base'}
            {currentStep === 2 && 'Localisation physique'}
            {currentStep === 3 && 'Moyens de contact'}
            {currentStep === 4 && 'Activités exercées'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* === ÉTAPE 1 : Informations de Base === */}
          {currentStep === 1 && (
            <div className="bg-gray-50 p-6 rounded-lg animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-green-600" />
                Informations de Base
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dénomination sociale <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="denominationSociale"
                    value={formData.denominationSociale}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Banque Nationale de Madagascar"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom commercial
                  </label>
                  <input
                    type="text"
                    name="nomCommercial"
                    value={formData.nomCommercial}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: BN Mada"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forme juridique
                  </label>
                  <select
                    name="formeJuridique"
                    value={formData.formeJuridique}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="SA">SA</option>
                    <option value="SARL">SARL</option>
                    <option value="EI">EI</option>
                    <option value="SAS">SAS</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateDebutOperations"
                    value={formData.dateDebutOperations}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* === ÉTAPE 2 : Adresses === */}
          {currentStep === 2 && (
            <div className="bg-gray-50 p-6 rounded-lg animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                Adresses
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Siège social <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="adresseSiegeSocial"
                    value={formData.adresseSiegeSocial}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Lot IIY 123 Bis, Antananarivo"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Activité principale
                    </label>
                    <textarea
                      name="adresseActivitePrincipale"
                      value={formData.adresseActivitePrincipale}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Succursales
                    </label>
                    <textarea
                      name="adressesSecondaires"
                      value={formData.adressesSecondaires}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === ÉTAPE 3 : Coordonnées === */}
          {currentStep === 3 && (
            <div className="bg-gray-50 p-6 rounded-lg animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-green-600" />
                Coordonnées
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="numeroTelephone"
                    value={formData.numeroTelephone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="+261 34 ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="adresseEmail"
                    value={formData.adresseEmail}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="contact@institution.mg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* === ÉTAPE 4 : Activités === */}
          {currentStep === 4 && (
            <div className="bg-gray-50 p-6 rounded-lg animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-green-600" />
                Activités
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Toutes les activités
                  </label>
                  <textarea
                    name="listeActivites"
                    value={formData.listeActivites}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="- Services bancaires\n- Crédit immobilier"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Activité principale
                    </label>
                    <input
                      type="text"
                      name="activitePrincipale"
                      value={formData.activitePrincipale}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Services bancaires"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Activités secondaires
                    </label>
                    <textarea
                      name="activitesSecondaires"
                      value={formData.activitesSecondaires}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === BOUTONS DE NAVIGATION === */}
          <div className="flex justify-between items-center pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-400 bg-gray-100 cursor-not-allowed"
              disabled
            >
              Annuler
            </button>

            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={goToPrev}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </button>
              )}

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={goToNext}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enregistrement...
                    </>
                  ) : (
                    'Terminer'
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstitutionalInfoCompletion;
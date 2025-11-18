// ✅ DataContext COMPLET ET MIS À JOUR : Chargement nested et mapping complet

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { 
  Institution, 
  Country, 
  QuestionAxis, 
  Question, 
  Assessment, 
  SectorWeight, 
  RiskThreshold, 
  SousSection, 
  SectionWithNested 
} from '../types';  // Assurez-vous d'avoir ajouté SousSection et SectionWithNested dans types.ts

const API_BASE = 'http://localhost:9090/api';

const TYPE_MAPPING: Record<string, string> = {
  'Boolean': 'boolean',
  'Choix multiple': 'choice_multiple',
  'Choix simple': 'choice_single',
  'Intervalle': 'interval',
  'Pourcentage': 'percentage',
  'Date': 'date',
  'Intervalle de dates': 'date_range',
  'Texte court': 'text_short',
  'Texte long': 'text_long',
  'Nombre entier': 'integer',
  'Nombre decimal': 'decimal',
};

interface DataContextType {
  institutions: Institution[];
  countries: Country[];
  axes: QuestionAxis[];
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  assessments: Assessment[];
  sectorWeights: SectorWeight[];
  riskThresholds: RiskThreshold[];
  sectionsWithNested: SectionWithNested[];  // ← Structure nested complète
  loadSectionsWithNested: () => Promise<void>;  // ← Chargement nested
  getQuestionsForSousSection: (sousSectionId: string) => Question[];  // ← Filtre questions par sous-section
  getSousSectionsForSection: (sectionId: string) => SousSectionWithQuestions[];  // ← Filtre sous-sections par section
  loadQuestionsForAxis: (axisId: string) => Promise<void>;  // ← Compatibilité (axisId = sousSectionId)
  updateInstitution: (id: string, updates: Partial<Institution>) => void;
  addCountry: (country: Country) => void;
  removeCountry: (code: string) => void;
  addQuestion: (question: Question) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  addAssessment: (assessment: Assessment) => void;
  addSectorWeight: (weight: SectorWeight) => void;
  updateSectorWeight: (id: string, updates: Partial<SectorWeight>) => void;
  deleteSectorWeight: (id: string) => void;
  updateRiskThresholds: (thresholds: RiskThreshold[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

const useDataStore = () => {
  const { user } = useAuth();
  const token = user?.token;

  const [institutions, setInstitutions] = useState<Institution[]>([]);

  const [countries] = useState<Country[]>([
    { code: 'KP', name: 'Corée du Nord', listType: 'blacklist' },
    { code: 'IR', name: 'Iran', listType: 'blacklist' },
    { code: 'MM', name: 'Myanmar', listType: 'blacklist' },
    { code: 'DZ', name: 'Algérie', listType: 'greylist' },
    { code: 'AO', name: 'Angola', listType: 'greylist' },
    { code: 'BG', name: 'Bulgarie', listType: 'greylist' },
    { code: 'BF', name: 'Burkina Faso', listType: 'greylist' },
    { code: 'CM', name: 'Cameroon', listType: 'greylist' },
  ]);

  // ✅ Axes = sections (chargées depuis backend)
  const [axes, setAxes] = useState<QuestionAxis[]>([]);

  // ✅ Questions vides initialement, chargées dynamiquement
  const [questions, setQuestions] = useState<Question[]>([]);

  const [assessments, setAssessments] = useState<Assessment[]>([]);

  const [sectorWeights, setSectorWeights] = useState<SectorWeight[]>([
    { id: 'sw_1', name: 'Banque', weight: 1.2, coefficient: 1.5 },
    { id: 'sw_2', name: 'Microfinance', weight: 1.0, coefficient: 1.2 },
    { id: 'sw_3', name: 'Assurance', weight: 0.8, coefficient: 1.0 },
  ]);

  const [riskThresholds, setRiskThresholds] = useState<RiskThreshold[]>([
    { level: 'low', min: 0, max: 2.5 },
    { level: 'medium', min: 2.5, max: 3.5 },
    { level: 'high', min: 3.5, max: 5 },
  ]);

  // ✅ NOUVEAU ÉTAT : Structure nested (sections + sous-sections + questions)
  const [sectionsWithNested, setSectionsWithNested] = useState<SectionWithNested[]>([]);

  // ✅ Mapping backend nested → frontend (SectionWithNested)
  const mapBackendToSectionWithNested = (backendSection: any): SectionWithNested => ({
    id: backendSection.idSection,
    name: backendSection.libelle,
    coefficient: backendSection.coefficient,
    creeLe: backendSection.creeLe,
    modifieLe: backendSection.modifieLe,
    sousSections: backendSection.sousSections.map((ss: any) => ({
      ...ss, // Inclure tous les champs de la sous-section
      id: ss.idSousSection, // Utiliser id pour compatibilité avec les composants existants
      idSousSection: ss.idSousSection,
      libelle: ss.libelle,
      name: ss.libelle, // Ajout de name pour compatibilité avec les composants existants
      creeLe: ss.creeLe,
      modifieLe: ss.modifieLe,
      questions: ss.questions.map((q: any) => mapBackendToQuestion(q))  // Réutilise le mapping existant
    }))
  });

  // ✅ Mapping backend section → frontend axis (pour compatibilité)
  const mapBackendToAxis = (backendSection: any): QuestionAxis => ({
    id: backendSection.idSection,
    name: backendSection.libelle,
    description: backendSection.libelle,
    order: 0
  });

  // ✅ Mapping backend question (existant)
  const mapBackendToQuestion = (backendQuestion: any): Question => ({
    id: backendQuestion.idQuestion,
    label: backendQuestion.libelle,
    definition: backendQuestion.definition || '',
    type: TYPE_MAPPING[backendQuestion.typeReponse?.type] || 
          backendQuestion.typeReponse?.type?.toLowerCase().replace(' ', '_') || '',
    required: backendQuestion.exigeDocument || false,
    justificationRequired: backendQuestion.justificationRequired || false,
    commentRequired: backendQuestion.commentRequired || false,
    notes: backendQuestion.notes || '',
    axisId: backendQuestion.sousSection?.idSousSection || '',  // idSousSection comme axisId pour compatibilité
    creeLe: backendQuestion.creeLe,
    modifieLe: backendQuestion.modifieLe,
    typeReponse: backendQuestion.typeReponse,
    sousSection: backendQuestion.sousSection,
    dropdownOptions: backendQuestion.options
    ? backendQuestion.options
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0)
    : [],
  });

  // ✅ NOUVELLE FONCTION : Charger la structure nested (sections + sous-sections + questions)
  const loadSectionsWithNested = async () => {
    if (!token) {
      console.warn('Token manquant pour loadSectionsWithNested');
      return;
    }
    try {
      console.log('📌 Chargement des sections nested...');
      
      const response = await fetch(`${API_BASE}/sections`, {  // Utilise l'endpoint nested
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Erreur chargement sections: ${errText}`);
      }

      const backendSections: any[] = await response.json();
      const mappedSections: SectionWithNested[] = backendSections.map(mapBackendToSectionWithNested);
      
      setSectionsWithNested(mappedSections);
      
      // ✅ Mise à jour des axes (sections) pour compatibilité
      const mappedAxes: QuestionAxis[] = backendSections.map(mapBackendToAxis);
      setAxes(mappedAxes);
      
      // ✅ Mise à jour des questions globales (toutes les questions de toutes les sous-sections)
      const allQuestions: Question[] = mappedSections.flatMap(s => 
        s.sousSections.flatMap(ss => ss.questions)
      );
      setQuestions(allQuestions);
      
      console.log('✅ Sections nested chargées:', mappedSections);
    } catch (err) {
      console.error('❌ Erreur loadSectionsWithNested:', err);
    }
  };

  // ✅ FONCTION EXISTANTE MODIFIÉE : loadQuestionsForAxis (utilise maintenant le nested si disponible, sinon API)
  const loadQuestionsForAxis = async (axisId: string) => {  // axisId = idSousSection
    if (!token || !axisId) {
      console.warn('Token ou axisId manquant pour loadQuestionsForAxis', { token: !!token, axisId });
      return;
    }

    // ✅ Priorité au nested (si déjà chargé)
    const questionsFromNested = sectionsWithNested
      .flatMap(s => s.sousSections)
      .find(ss => ss.id === axisId)?.questions || [];
    
    if (questionsFromNested.length > 0) {
      setQuestions(questionsFromNested);
      console.log('📌 Questions chargées depuis nested pour:', axisId);
      return;
    }

    // Fallback API si nested pas chargé
    try {
      console.log('📌 Chargement des questions via API pour l\'axe:', axisId);
      
      const response = await fetch(`${API_BASE}/questions/sous-section/${axisId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Erreur API:', response.status, errText);
        throw new Error(`Erreur chargement questions: ${errText}`);
      }

      const backendQuestions: any[] = await response.json();
      const mappedQuestions: Question[] = backendQuestions.map(mapBackendToQuestion);
      setQuestions(mappedQuestions);
    } catch (err) {
      console.error('Erreur loadQuestionsForAxis:', err);
    }
  };

  // ✅ NOUVEAUX UTILITAIRES
  const getSousSectionsForSection = (sectionId: string): SousSectionWithQuestions[] => {
    return sectionsWithNested.find(s => s.id === sectionId)?.sousSections || [];
  };

  // Ancienne fonction pour compatibilité - mais il vaut mieux accéder directement aux questions via sousSections.questions
  const getQuestionsForSousSection = (sousSectionId: string): Question[] => {
    return sectionsWithNested
      .flatMap(s => s.sousSections)
      .find(ss => ss.id === sousSectionId)?.questions || [];
  };

  // Fonction pour charger une institution spécifique par ID
  const loadInstitutionById = async (institutionId: string) => {
    if (!token || !institutionId) {
      console.warn('Token ou institutionId manquant pour loadInstitutionById');
      return;
    }
    try {
      console.log('📌 Chargement de l\'institution spécifique:', institutionId);

      const response = await fetch(`${API_BASE}/institutions/${institutionId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Erreur chargement institution: ${errText}`);
      }

      const backendInstitution: any = await response.json();

      // Convertir les dates et mapper les données backend aux types frontend
      const mappedInstitution: Institution = {
        id: backendInstitution.idInstitution || backendInstitution.id,
        name: backendInstitution.nom || backendInstitution.name, // Kept for backward compatibility
        denominationSociale: backendInstitution.denominationSociale || backendInstitution.libelle || backendInstitution.name || '',
        nomCommercial: backendInstitution.nomCommercial,
        formeJuridique: backendInstitution.formeJuridique,
        dateDebutOperations: backendInstitution.dateDebutOperations ? new Date(backendInstitution.dateDebutOperations) : undefined,
        adresseSiegeSocial: backendInstitution.adresseSiegeSocial || backendInstitution.adresse,
        adresseActivitePrincipale: backendInstitution.adresseActivitePrincipale,
        adressesSecondaires: backendInstitution.adressesSecondaires,
        numeroTelephone: backendInstitution.numeroTelephone,
        adresseEmail: backendInstitution.adresseEmail,
        listeActivites: backendInstitution.listeActivites,
        activitePrincipale: backendInstitution.activitePrincipale,
        activitesSecondaires: backendInstitution.activitesSecondaires,
        // Existing fields
        address: backendInstitution.adresse || backendInstitution.address,
        description: backendInstitution.description,
        sector: backendInstitution.secteur || backendInstitution.sector,
        activities: backendInstitution.activites || backendInstitution.activities || [],
        employeeCount: backendInstitution.nombreEmployes || backendInstitution.employeeCount,
        annualRevenue: backendInstitution.chiffreAffaire || backendInstitution.annualRevenue,
        creationDate: backendInstitution.dateCreation ? new Date(backendInstitution.dateCreation) : undefined,
        mainContact: backendInstitution.contactPrincipal || backendInstitution.mainContact || {
          name: backendInstitution.nomContact || '',
          email: backendInstitution.emailContact || '',
          phone: backendInstitution.telephoneContact || ''
        },
        riskLevel: backendInstitution.niveauRisque || backendInstitution.riskLevel,
        lastAssessment: backendInstitution.dateDerniereEvaluation ? new Date(backendInstitution.dateDerniereEvaluation) : undefined,
        nextSupervision: backendInstitution.dateProchaineSupervision ? new Date(backendInstitution.dateProchaineSupervision) : undefined,
        score: backendInstitution.score || backendInstitution.globalScore
      };

      // Mettre à jour uniquement les institutions en remplaçant ou ajoutant cette institution
      setInstitutions(prev => {
        const existingIndex = prev.findIndex(inst => inst.id === mappedInstitution.id);
        if (existingIndex >= 0) {
          // Remplacer l'institution existante
          const updated = [...prev];
          updated[existingIndex] = mappedInstitution;
          return updated;
        } else {
          // Ajouter la nouvelle institution
          return [...prev, mappedInstitution];
        }
      });

      console.log('✅ Institution spécifique chargée:', mappedInstitution);
    } catch (err) {
      console.error('❌ Erreur loadInstitutionById:', err);
      // Ne pas changer les institutions existantes en cas d'erreur
    }
  };

  // Fonction pour charger toutes les institutions (pour admin/superviseur)
  const loadInstitutions = async () => {
    if (!token) {
      console.warn('Token manquant pour loadInstitutions');
      return;
    }
    try {
      console.log('📌 Chargement de toutes les institutions...');

      const response = await fetch(`${API_BASE}/institutions`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Erreur chargement institutions: ${errText}`);
      }

      const backendInstitutions: any[] = await response.json();

      // Convertir les dates et mapper les données backend aux types frontend
      const mappedInstitutions: Institution[] = backendInstitutions.map(inst => ({
        id: inst.idInstitution || inst.id,
        name: inst.nom || inst.name, // Kept for backward compatibility
        denominationSociale: inst.denominationSociale || inst.libelle || inst.name || '',
        nomCommercial: inst.nomCommercial,
        formeJuridique: inst.formeJuridique,
        dateDebutOperations: inst.dateDebutOperations ? new Date(inst.dateDebutOperations) : undefined,
        adresseSiegeSocial: inst.adresseSiegeSocial || inst.adresse,
        adresseActivitePrincipale: inst.adresseActivitePrincipale,
        adressesSecondaires: inst.adressesSecondaires,
        numeroTelephone: inst.numeroTelephone,
        adresseEmail: inst.adresseEmail,
        listeActivites: inst.listeActivites,
        activitePrincipale: inst.activitePrincipale,
        activitesSecondaires: inst.activitesSecondaires,
        // Existing fields
        address: inst.adresse || inst.address,
        description: inst.description,
        sector: inst.secteur || inst.sector,
        activities: inst.activites || inst.activities || [],
        employeeCount: inst.nombreEmployes || inst.employeeCount,
        annualRevenue: inst.chiffreAffaire || inst.annualRevenue,
        creationDate: inst.dateCreation ? new Date(inst.dateCreation) : undefined,
        mainContact: inst.contactPrincipal || inst.mainContact || {
          name: inst.nomContact || '',
          email: inst.emailContact || '',
          phone: inst.telephoneContact || ''
        },
        riskLevel: inst.niveauRisque || inst.riskLevel,
        lastAssessment: inst.dateDerniereEvaluation ? new Date(inst.dateDerniereEvaluation) : undefined,
        nextSupervision: inst.dateProchaineSupervision ? new Date(inst.dateProchaineSupervision) : undefined,
        score: inst.score || inst.globalScore
      }));

      setInstitutions(mappedInstitutions);
      console.log('✅ Toutes les institutions chargées:', mappedInstitutions);
    } catch (err) {
      console.error('❌ Erreur loadInstitutions:', err);
      // Ne pas changer les institutions existantes en cas d'erreur
    }
  };

  // ... autres fonctions existantes (updateInstitution, etc.)
  const updateInstitution = (id: string, updates: Partial<Institution>) => {
    setInstitutions(prev =>
      prev.map(inst =>
        inst.id === id ? { ...inst, ...updates } : inst
      )
    );
  };

  const addCountry = (country: Country) => {
    // Mock - appelez API si besoin
  };

  const removeCountry = (code: string) => {
    // Mock - appelez API si besoin
  };

  const addQuestion = (question: Question) => {
    setQuestions(prev => [...prev, question]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(prev =>
      prev.map(q => q.id === id ? { ...q, ...updates } : q)
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const addAssessment = (assessment: Assessment) => {
    setAssessments(prev => [...prev, assessment]);
  };

  const addSectorWeight = (weight: SectorWeight) => {
    setSectorWeights(prev => [...prev, weight]);
  };

  const updateSectorWeight = (id: string, updates: Partial<SectorWeight>) => {
    setSectorWeights(prev => 
      prev.map(w => w.id === id ? { ...w, ...updates } : w)
    );
  };

  const deleteSectorWeight = (id: string) => {
    setSectorWeights(prev => prev.filter(w => w.id !== id));
  };

  const updateRiskThresholds = (thresholds: RiskThreshold[]) => {
    setRiskThresholds(thresholds);
  };

  // ✅ Effet pour charger les données au démarrage
  const [dataLoaded, setDataLoaded] = useState(false);

useEffect(() => {
  if (!token || dataLoaded) return;

  const loadInitialData = async () => {
    await loadSectionsWithNested();

    if (user?.role === 'admin' || user?.role === 'superviseur') {
      await loadInstitutions();
    } else if (user?.role === 'institution' && user.institutionId) {
      await loadInstitutionById(user.institutionId);
    }

    setDataLoaded(true); // Plus jamais rechargé
  };

  loadInitialData();
}, [token, user?.role, user?.institutionId]);
  // À la toute fin de useDataStore(), juste avant export DataProvider
return useMemo(() => ({
  institutions,
  countries,
  axes,
  questions,
  setQuestions,
  assessments,
  sectorWeights,
  riskThresholds,
  sectionsWithNested,
  loadSectionsWithNested,        // OBLIGATOIRE – tu l’avais enlevé !
  loadInstitutions,
  loadInstitutionById,
  getSousSectionsForSection,
  getQuestionsForSousSection,
  loadQuestionsForAxis,
  updateInstitution,
  addCountry,
  removeCountry,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  addAssessment,
  addSectorWeight,
  updateSectorWeight,
  deleteSectorWeight,
  updateRiskThresholds,
}), [
    institutions,
    countries,
    axes,
    questions,
    assessments,
    sectorWeights,
    riskThresholds,
    sectionsWithNested,
    loadSectionsWithNested
  ]);
}; // ← Fermeture de useDataStore()

// EXPORT DU PROVIDER (doit être HORS de useDataStore !)
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const data = useDataStore();
  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
};
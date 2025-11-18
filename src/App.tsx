import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/Auth/LoginForm';
import Navigation from './components/Layout/Navigation';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import InstitutionDashboard from './components/Dashboard/InstitutionDashboard';
import InstitutionsPage from './components/Management/InstitutionsPage';
import CountriesPage from './components/Management/CountriesPage';
import QuestionsPage from './components/Management/QuestionsPage';
import AssessmentPage from './components/Assessment/AssessmentPage';
import InstitutionDetailsPage from './components/Management/InstitutionDetailsPage';
import ScoringPage from './components/Management/ScoringPage';
import WeightsPage from './components/Management/WeightsPage';
import ThresholdsPage from './components/Management/ThresholdsPage';
import ReportsPage from './components/Reports/ReportsPage';
import ProfilePage from './components/Management/ProfilePage';
import HistoryPage from './components/Management/HistoryPage';
import UsersPage from './components/Management/UsersPage';
import EvaluationsPage from './components/Management/EvaluationsPage';
import EvaluationQuestionsPage from './components/Management/EvaluationQuestionsPage';
import QuestionnairePage from './components/Assessment/QuestionnairePage';
import InstitutionalInfoCompletion from './components/Management/InstitutionalInfoCompletion';
import { Toaster } from 'react-hot-toast';
import { API_BASE } from './config/api'; // ✅ Import de la configuration API

const AppContent: React.FC = () => {
  const { user, token, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');
  const [needsInfoCompletion, setNeedsInfoCompletion] = useState(false);
  const [checkingCompletion, setCheckingCompletion] = useState(true); // ✅ Nouvel état pour le chargement

  // Charger le hash initial au montage du composant
  useEffect(() => {
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
      setCurrentPage(initialHash);
    }
  }, []);

  // Mettre à jour le hash quand currentPage change
  useEffect(() => {
    window.location.hash = currentPage;
  }, [currentPage]);

  // ✅ Vérifier le statut de complétion dès que l'utilisateur est chargé
  useEffect(() => {
    const checkCompletionStatus = async () => {
      console.log('=== DEBUG DÉBUT checkCompletionStatus ===');
      console.log('User:', user);
      console.log('User role:', user?.role);
      console.log('Token exists:', !!token);
      
      // Si l'utilisateur n'est pas une institution, pas besoin de vérifier
      if (!user || user.role !== 'institution') {
        console.log('DEBUG: Pas une institution, skip vérification');
        setCheckingCompletion(false);
        return;
      }

      // Si pas de token, attendre
      if (!token) {
        console.log('DEBUG: Pas de token, skip vérification');
        setCheckingCompletion(false);
        return;
      }

      try {
        const url = `${API_BASE}/institution/completion-status`;
        console.log('DEBUG: Appel API:', url);
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('DEBUG: Response status:', response.status);
        console.log('DEBUG: Response headers:', response.headers.get('content-type'));
        
        // ✅ Vérifier d'abord si la réponse est OK
        if (!response.ok) {
          const errorText = await response.text();
          console.error('DEBUG: Erreur HTTP:', response.status, errorText);
          // En cas d'erreur HTTP, on permet l'accès normal
          setNeedsInfoCompletion(false);
          setCheckingCompletion(false);
          return;
        }

        // ✅ Lire le texte brut d'abord
        const textResponse = await response.text();
        console.log('DEBUG: Réponse brute (100 premiers chars):', textResponse.substring(0, 100));

        // ✅ Vérifier si c'est du JSON valide
        if (!textResponse || !textResponse.trim()) {
          console.error('DEBUG: Réponse vide');
          setNeedsInfoCompletion(false);
          setCheckingCompletion(false);
          return;
        }

        // ✅ Parser le JSON
        let data;
        try {
          data = JSON.parse(textResponse);
        } catch (parseError) {
          console.error('DEBUG: Erreur parsing JSON:', parseError);
          console.error('DEBUG: Texte reçu (200 premiers chars):', textResponse.substring(0, 200));
          // Si ce n'est pas du JSON, on permet l'accès normal
          setNeedsInfoCompletion(false);
          setCheckingCompletion(false);
          return;
        }

        console.log('DEBUG: Réponse parsée:', data);
        console.log('DEBUG: needsCompletion:', data.needsCompletion);
        
        setNeedsInfoCompletion(data.needsCompletion === true);
        console.log('DEBUG: État needsInfoCompletion mis à jour à:', data.needsCompletion);
        
      } catch (error) {
        console.error('DEBUG: Erreur réseau ou autre:', error);
        // 🔴 TEST TEMPORAIRE : En cas d'erreur, forcer l'affichage du formulaire
        console.warn('⚠️ Erreur réseau - FORÇAGE du formulaire pour test');
        setNeedsInfoCompletion(true);
      } finally {
        // ✅ Important : marquer la vérification comme terminée
        console.log('DEBUG: Fin de vérification, checkingCompletion -> false');
        setCheckingCompletion(false);
      }
      
      console.log('=== DEBUG FIN checkCompletionStatus ===');
    };

    checkCompletionStatus();
  }, [user, token]);

  // Autre useEffect pour gérer l'ID d'institution
  useEffect(() => {
    if (currentPage.startsWith('evaluate-')) {
      const institutionId = currentPage.replace('evaluate-', '');
      setSelectedInstitutionId(institutionId);
    }
  }, [currentPage]);

  // ✅ Afficher un loader pendant la vérification ET le chargement initial
  if (loading || (user?.role === 'institution' && checkingCompletion)) {
    console.log('DEBUG: Affichage du loader');
    console.log('loading:', loading);
    console.log('checkingCompletion:', checkingCompletion);
    console.log('user?.role:', user?.role);
    
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
          <p className="mt-4 text-gray-600">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    console.log('=== DEBUG renderPage ===');
    console.log('currentPage:', currentPage);
    console.log('user?.role:', user?.role);
    console.log('needsInfoCompletion:', needsInfoCompletion);
    console.log('checkingCompletion:', checkingCompletion);

    // ✅ Si l'institution doit remplir son profil, afficher le formulaire
    if (user?.role === 'institution' && needsInfoCompletion) {
      console.log('DEBUG: Affichage du formulaire InstitutionalInfoCompletion');
      return (
        <InstitutionalInfoCompletion 
          onComplete={() => {
            console.log('DEBUG: onComplete appelé');
            setNeedsInfoCompletion(false);
            setCurrentPage('dashboard');
          }} 
        />
      );
    }

    if (currentPage.startsWith('institution-details-')) {
      const institutionId = currentPage.replace('institution-details-', '');
      return (
        <InstitutionDetailsPage
          institutionId={institutionId}
          onBack={() => setCurrentPage('institutions')}
        />
      );
    }

    if (currentPage.startsWith('evaluation-questions-')) {
      const evaluationId = currentPage.replace('evaluation-questions-', '');
      return (
        <EvaluationQuestionsPage
          evaluationId={evaluationId}
          onBack={() => setCurrentPage('evaluations')}
          onNext={() => setCurrentPage('scoring')}
        />
      );
    }

    if (currentPage.startsWith('scoring-')) {
      const questionId = currentPage.replace('scoring-', '');
      return <ScoringPage selectedQuestionId={questionId} />;
    }

    switch (currentPage) {
      case 'dashboard':
        console.log('Rendering dashboard for role:', user?.role);
        return (user.role === 'admin' || user.role === 'superviseur') ? <AdminDashboard /> : <InstitutionDashboard />;
      case 'institutions':
        return <InstitutionsPage />;
      case 'countries':
        return <CountriesPage />;
      case 'questions':
        return <QuestionsPage />;
      case 'scoring':
        return <ScoringPage />;
      case 'weights':
        return <WeightsPage />;
      case 'thresholds':
        return <ThresholdsPage />;
      case 'assessment':
        return <AssessmentPage />;
      case 'evaluations':
        return <EvaluationsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'users':
        return <UsersPage />;
      case 'history':
        return <HistoryPage />;
      case 'questionnaire':
        console.log('Rendering QuestionnairePage - about to render');
        return <QuestionnairePage />;
      default:
        console.log('Page par défaut - currentPage:', currentPage, 'role:', user?.role);
        return (user.role === 'admin' || user.role === 'superviseur') ? <AdminDashboard /> : <InstitutionDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 ml-64 p-8">
        <div key={currentPage}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <>
      <AppContent />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
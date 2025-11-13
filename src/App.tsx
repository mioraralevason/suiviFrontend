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
import QuestionnairePage from './components/Assessment/QuestionnairePage'; // Import the new component
import { Toaster } from 'react-hot-toast';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');
  const [showInstitutionProfile, setShowInstitutionProfile] = useState(false);

  
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

  // Vérifier si l'utilisateur institution doit remplir son profil
  // Fix: Utilisez optional chaining et un check fallback (name === email → nouveau user)
  useEffect(() => {
    // Vérifier seulement au chargement initial ou si utilisateur change
    if (user?.role === 'institution' && (user.id?.startsWith('user_') || user.name === user.email)) {  // ← Fix: ?. et fallback
      console.log('Debug: Force profil pour nouveau user', { id: user.id, name: user.name, email: user.email });  // ← Debug temporaire
      setShowInstitutionProfile(true);
    }
    // Ne pas inclure currentPage dans les dépendances pour éviter les réexécutions inutiles
  }, [user]);

  // ✅ autre useEffect, isolé
  useEffect(() => {
    if (currentPage.startsWith('evaluate-')) {
      const institutionId = currentPage.replace('evaluate-', '');
      setSelectedInstitutionId(institutionId);
    }
  }, [currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    console.log('Render page called with currentPage:', currentPage, 'and user role:', user?.role);

    // Si profil institution à remplir, redirigez vers profile
    if (showInstitutionProfile) {
      return <ProfilePage onComplete={() => setShowInstitutionProfile(false)} />;  // ← Ajout: onComplete pour cacher après
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
        // ← Fix : Inclure 'superviseur' comme admin pour redirection vers AdminDashboard
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
      case 'questionnaire': // New case for the questionnaire page
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
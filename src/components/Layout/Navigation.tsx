import React from 'react';

import { useAuth } from '../../context/AuthContext';
import { Shield, Building2, Users, Globe, FileText, ChartBar as BarChart3, Settings, LogOut, Hop as Home, TriangleAlert as AlertTriangle, Calculator, Scale, ClipboardList, User, Clock } from 'lucide-react';



interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Tableau de bord', icon: Home },
          { id: 'institutions', label: 'Institutions', icon: Building2 },
          { id: 'evaluations', label: 'Évaluations', icon: ClipboardList },
          { id: 'countries', label: 'Risque Pays', icon: Globe },
          { id: 'questions', label: 'Questions', icon: Settings },
          { id: 'scoring', label: 'Notation', icon: Calculator },
          { id: 'weights', label: 'Pondérations', icon: Scale },
          { id: 'thresholds', label: 'Seuils de Risque', icon: AlertTriangle },
          { id: 'users', label: 'Utilisateurs', icon: Users },
        ];
      case 'institution':
          return [
            { id: 'dashboard', label: 'Tableau de bord', icon: Home },
            { id: 'profile', label: 'Profil', icon: User },
            { id: 'questionnaire', label: 'Questionnaire', icon: FileText }, // New questionnaire link
            { id: 'assessment', label: 'Évaluations', icon: Shield },
            { id: 'history', label: 'Historique des évaluations', icon: Clock },
          ];
      case 'superviseur':
        return [
          { id: 'institutions', label: 'Institutions', icon: Building2 },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <nav className="bg-white shadow-sm border-r border-gray-200 h-full w-64 fixed left-0 top-0 z-10">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <img 
            src="/assets/logo.png" 
            alt="Logo SAMIFIN" 
            className="h-8 w-8"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling.style.display = 'block';
            }}
          />
          <Shield className="h-8 w-8 text-green-500" style={{display: 'none'}} />
          <h1 className="text-xl font-bold text-gray-900">Plateforme LBC/FT</h1>
        </div>
        
        <div className="mb-6">
          <div className="text-sm text-gray-500">Connecté en tant que</div>
          <div className="font-medium text-gray-900">{user?.name}</div>
          <div className="text-sm text-green-600 capitalize">{user?.role}</div>
        </div>

        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onPageChange(item.id);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-green-50 text-green-700 border-r-2 border-green-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
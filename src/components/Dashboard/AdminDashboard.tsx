import React from 'react';
import { useData } from '../../context/DataContext';
import { 
  Building2, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Users,
  Globe,
  FileText,
  Calendar
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { institutions, countries } = useData();

  const riskDistribution = {
    high: institutions.filter(i => i.riskLevel === 'high').length,
    medium: institutions.filter(i => i.riskLevel === 'medium').length,
    low: institutions.filter(i => i.riskLevel === 'low').length,
  };

  const upcomingSupervisions = institutions.filter(i => 
    i.nextSupervision && 
    new Date(i.nextSupervision) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  const stats = [
    {
      title: 'Total Institutions',
      value: institutions.length,
      icon: Building2,
      color: 'bg-blue-500',
      change: '+2 ce mois',
    },
    {
      title: 'Risque Élevé',
      value: riskDistribution.high,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: 'Nécessite attention',
    },
    {
      title: 'Pays Surveillés',
      value: countries.length,
      icon: Globe,
      color: 'bg-green-500',
      change: `${countries.filter(c => c.listType === 'blacklist').length} liste noire`,
    },
    {
      title: 'Supervisions Prochaines',
      value: upcomingSupervisions.length,
      icon: Calendar,
      color: 'bg-orange-500',
      change: '30 prochains jours',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord Administrateur</h1>
        <p className="text-gray-600">Surveiller les risques LBC/FT de toutes les institutions financières</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">{stat.title}</h3>
              <p className="text-sm text-gray-500">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Risk Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Répartition des Risques</h2>
          <div className="space-y-4">
            {Object.entries(riskDistribution).map(([level, count]) => {
              const percentage = (count / institutions.length) * 100;
              const colors = {
                high: 'bg-red-500',
                medium: 'bg-yellow-500',
                low: 'bg-green-500',
              };
              const labels = {
                high: 'Risque Élevé',
                medium: 'Risque Moyen',
                low: 'Risque Faible',
              };
              
              return (
                <div key={level} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${colors[level as keyof typeof colors]}`} />
                    <span className="font-medium">{labels[level as keyof typeof labels]}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{count} institutions</span>
                    <span className="font-semibold">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Activité Récente</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Évaluation Terminée</p>
                <p className="text-sm text-green-600">BNI Madagascar a soumis son évaluation annuelle</p>
                <p className="text-xs text-green-500 mt-1">Il y a 2 heures</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-orange-800">Alerte Risque</p>
                <p className="text-sm text-orange-600">Nouveau pays ajouté à la liste grise nécessitant révision</p>
                <p className="text-xs text-orange-500 mt-1">Il y a 1 jour</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Nouvelle Institution</p>
                <p className="text-sm text-blue-600">Microfinance XYZ enregistrée sur la plateforme</p>
                <p className="text-xs text-blue-500 mt-1">Il y a 3 jours</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Supervisions */}
      {upcomingSupervisions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Supervisions Prochaines</h2>
          <div className="space-y-3">
            {upcomingSupervisions.map((institution) => (
              <div key={institution.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Building2 className="h-8 w-8 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">{institution.name}</h3>
                    <p className="text-sm text-gray-500">{institution.sector} • risque {institution.riskLevel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {institution.nextSupervision?.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-orange-600">Échéance proche</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
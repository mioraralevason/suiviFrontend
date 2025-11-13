import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import logoSamifin from '../../assets/logosamifin.jpeg';
import { Shield, Mail, Lock, User, CircleAlert as AlertCircle, ArrowLeft, Building2, Shield as ShieldIcon, MapPin, UserCog } from 'lucide-react';

interface RegisterFormProps {
  onBackToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onBackToLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    nomInstitution: '',
    adresse: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'institution' as 'institution' | 'supervisor' | 'admin'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Validation spécifique au rôle
    if (formData.role === 'institution') {
      if (!formData.nomInstitution.trim()) {
        setError('Le nom complet de l\'institution est requis');
        return;
      }
      if (!formData.adresse.trim()) {
        setError('L\'adresse est requise');
        return;
      }
    } else {
      if (!formData.prenom.trim() || !formData.nom.trim()) {
        setError('Le prénom et le nom sont requis');
        return;
      }
    }

    setLoading(true);

    try {
      let fullName: string;
      // Mapping du rôle pour le backend
      const backendRole: 'institution' | 'superviseur' | 'admin' = 
        formData.role === 'supervisor' ? 'superviseur' : 
        formData.role === 'admin' ? 'admin' : 'institution';
      
      if (formData.role === 'institution') {
        fullName = formData.nomInstitution;
      } else {
        fullName = `${formData.prenom} ${formData.nom}`;
      }
      
      const regSuccess = await register(
        formData.email, 
        formData.password, 
        fullName, 
        backendRole, 
        formData.role === 'institution' ? formData.adresse : undefined
      );
      
      if (regSuccess) {
        setSuccess(true);
      } else {
        setError('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (role: 'institution' | 'supervisor' | 'admin') => {
    setFormData({
      ...formData,
      role,
      // Réinitialiser les champs spécifiques au rôle si changement
      ...(role === 'supervisor' || role === 'admin' 
        ? { nomInstitution: '', adresse: '' } 
        : { prenom: '', nom: '' })
    });
  };

  // Gestion de la redirection après succès (vers login)
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onBackToLogin();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [success, onBackToLogin]);

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Inscription Réussie !</h1>
          <p className="text-gray-600 mb-4">
            {formData.role === 'supervisor' 
              ? 'Votre compte superviseur a été créé avec succès.' 
              : formData.role === 'admin'
              ? 'Votre compte administrateur a été créé avec succès.'
              : 'Votre compte institution a été créé avec succès.'
            }
          </p>
          <p className="text-sm text-gray-500">
            Redirection vers la page de connexion...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={logoSamifin} alt="Logo SAMIFIN" className="h-16 w-16 mr-3" />
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full" style={{display: 'none'}}>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Inscription</h1>
          <p className="text-gray-600">Créer un compte sur la plateforme LBC/FT</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection du profil */}
          <div>
            <div className="grid grid-cols-3 gap-3">
              <label 
                htmlFor="role-institution"
                className="flex flex-col items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  id="role-institution"
                  type="radio"
                  name="role"
                  value="institution"
                  checked={formData.role === 'institution'}
                  onChange={() => handleRoleChange('institution')}
                  className="text-green-600 focus:ring-green-500 mb-2"
                />
                <Building2 className="h-5 w-5 text-gray-500 mb-1" />
                <div className="text-center">
                  <div className="font-medium text-sm text-gray-900">Institution</div>
                </div>
              </label>
              
              <label 
                htmlFor="role-supervisor"
                className="flex flex-col items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  id="role-supervisor"
                  type="radio"
                  name="role"
                  value="supervisor"
                  checked={formData.role === 'supervisor'}
                  onChange={() => handleRoleChange('supervisor')}
                  className="text-green-600 focus:ring-green-500 mb-2"
                />
                <ShieldIcon className="h-5 w-5 text-gray-500 mb-1" />
                <div className="text-center">
                  <div className="font-medium text-sm text-gray-900">Superviseur</div>
                </div>
              </label>

              <label 
                htmlFor="role-admin"
                className="flex flex-col items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  id="role-admin"
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formData.role === 'admin'}
                  onChange={() => handleRoleChange('admin')}
                  className="text-green-600 focus:ring-green-500 mb-2"
                />
                <UserCog className="h-5 w-5 text-gray-500 mb-1" />
                <div className="text-center">
                  <div className="font-medium text-sm text-gray-900">Admin</div>
                </div>
              </label>
            </div>
          </div>

          {/* Champs conditionnels basés sur le rôle */}
          {formData.role === 'supervisor' || formData.role === 'admin' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="prenom"
                    name="prenom"
                    type="text"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Prénom"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Nom"
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="nomInstitution" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet de l'institution *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="nomInstitution"
                    name="nomInstitution"
                    type="text"
                    value={formData.nomInstitution}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Nom complet de l'institution"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="adresse"
                    name="adresse"
                    type="text"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Adresse complète"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="votre.email@domaine.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onBackToLogin}
            className="flex items-center justify-center space-x-2 text-green-600 hover:text-green-700 transition-colors mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Se connecter</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
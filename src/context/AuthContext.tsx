import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { API_BASE } from '../config/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: 'institution' | 'superviseur', adresse?: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const saveUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, motDePasse: password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Email ou mot de passe invalide');
      }

      const data = await response.json();
      const loggedUser: User = {
        id: data.id, // Assuming the API returns user ID
        email,
        name: data.name || email, // Use data.name if available, otherwise fallback to email
        role: data.role as 'institution' | 'superviseur' | 'admin',
        token: data.token,
        institutionId: data.institutionId, // Add this line
      };
      saveUser(loggedUser);
      return true;
    } catch (error) {
      console.error('Erreur login:', error);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: 'institution' | 'superviseur',
    adresse?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, motDePasse: password, fullName: name, role, adresse }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erreur lors de l\'inscription');
      }

      await response.json(); // Réponse récupérée mais non utilisée
      return true;
    } catch (error) {
      console.error('Erreur register:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

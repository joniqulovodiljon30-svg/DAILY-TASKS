
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import { storageService } from './services/storage';
import { User, AuthState } from './types';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: storageService.getCurrentUser(),
    isAuthenticated: !!storageService.getCurrentUser(),
  });

  const login = (user: User) => {
    storageService.setCurrentUser(user);
    setAuth({ user, isAuthenticated: true });
  };

  const logout = () => {
    storageService.setCurrentUser(null);
    setAuth({ user: null, isAuthenticated: false });
  };

  const updateProfile = (newUsername: string) => {
    if (auth.user) {
      const updatedUser = { ...auth.user, username: newUsername };
      storageService.saveUser(updatedUser);
      storageService.setCurrentUser(updatedUser);
      setAuth({ ...auth, user: updatedUser });
    }
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
        <Routes>
          <Route 
            path="/auth" 
            element={auth.isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage onLogin={login} />} 
          />
          <Route 
            path="/dashboard" 
            element={auth.isAuthenticated ? <DashboardPage user={auth.user!} onLogout={logout} /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/profile" 
            element={auth.isAuthenticated ? <ProfilePage user={auth.user!} onUpdate={updateProfile} onLogout={logout} /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={auth.isAuthenticated ? "/dashboard" : "/auth"} />} 
          />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;

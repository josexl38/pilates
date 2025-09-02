import React from 'react';
import { useAuth } from './hooks/useAuth.js';
import { LoginPage } from './components/LoginPage.jsx';
import { Dashboard } from './components/Dashboard.jsx';

export default function App() {
  const { user, login, logout, reload } = useAuth();

  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  return <Dashboard user={user} onLogout={logout} onReload={reload} />;
}
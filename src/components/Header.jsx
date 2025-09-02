import React from 'react';
import { Badge } from './ui/Badge.jsx';

export function Header({ user, onLogout }) {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return { variant: 'danger', label: 'Administrador' };
      case 'instructor': return { variant: 'warning', label: 'Instructor' };
      default: return { variant: 'info', label: 'Cliente' };
    }
  };

  const roleBadge = getRoleBadge(user.role);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🧘‍♀️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Pilates Studio</h1>
              <p className="text-sm text-gray-600">Sistema de Reservas</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-800">{user.name}</span>
                <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
              </div>
              <div className="text-xs text-gray-600">
                {user.role === 'user' && `${user.sessions} sesiones disponibles`}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors duration-200"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
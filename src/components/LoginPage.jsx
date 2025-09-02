import { useState } from 'react';
import { TEST_USERS } from '../config/constants.js';
import { Badge } from './ui/Badge.jsx';

export function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [showDemo, setShowDemo] = useState(false);

  const handleLogin = () => {
    try {
      onLogin(email);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧘‍♀️</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Pilates Studio</h1>
            <p className="text-white/80 text-sm">Sistema de Reservas y Asistencia</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="tu@correo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <button
              className="w-full bg-white text-gray-800 font-semibold py-3 px-4 rounded-xl hover:bg-white/90 transition-all duration-200 transform hover:scale-105"
              onClick={handleLogin}
            >
              Iniciar Sesión
            </button>

            <div className="text-center">
              <button
                className="text-white/80 text-sm hover:text-white transition-colors"
                onClick={() => setShowDemo(!showDemo)}
              >
                {showDemo ? "Ocultar" : "Ver"} usuarios de prueba
              </button>
            </div>

            {showDemo && (
              <div className="bg-white/10 rounded-xl p-4 space-y-2">
                <p className="text-white/90 text-sm font-medium mb-3">Usuarios de prueba:</p>
                {TEST_USERS.map(user => (
                  <div key={user.email} className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm font-medium">{user.name}</div>
                      <div className="text-white/70 text-xs">{user.email}</div>
                      <Badge variant={
                        user.role === 'admin' ? 'danger' : 
                        user.role === 'instructor' ? 'warning' : 'info'
                      }>
                        {user.role === 'admin' ? 'Administrador' : 
                         user.role === 'instructor' ? 'Instructor' : 'Cliente'}
                      </Badge>
                    </div>
                    <button
                      className="text-xs bg-white/20 text-white px-3 py-1 rounded-lg hover:bg-white/30 transition-colors"
                      onClick={() => setEmail(user.email)}
                    >
                      Usar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
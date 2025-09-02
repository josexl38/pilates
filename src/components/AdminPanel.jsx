import React, { useState, useEffect } from 'react';
import { DB } from '../services/database.js';
import { addSessions, setSessions } from '../services/userService.js';
import { cancelBooking, reschedule } from '../services/bookingService.js';
import { formatDateTime, parseLocalISO } from '../utils/dateUtils.js';
import { Section } from './ui/Section.jsx';
import { Badge } from './ui/Badge.jsx';

export function AdminPanel({ onReload }) {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [sessionAmount, setSessionAmount] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setUsers(DB.users());
    setBookings(DB.bookings());
  };

  const handleAddSessions = () => {
    if (!selectedUser || !sessionAmount) {
      alert("Selecciona usuario y cantidad de sesiones");
      return;
    }
    
    try {
      addSessions(selectedUser, parseInt(sessionAmount));
      loadData();
      onReload();
      setSessionAmount('');
      alert("Sesiones agregadas correctamente");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCancelBooking = (bookingId) => {
    if (confirm("¿Cancelar esta reserva?")) {
      try {
        cancelBooking(bookingId, 'admin');
        loadData();
        onReload();
        alert("Reserva cancelada");
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'attended': return { variant: 'success', label: 'Asistió' };
      case 'missed': return { variant: 'danger', label: 'Faltó' };
      case 'canceled': return { variant: 'default', label: 'Cancelada' };
      default: return { variant: 'info', label: 'Reservada' };
    }
  };

  const activeBookings = bookings.filter(b => b.status !== 'canceled');
  const upcomingBookings = activeBookings
    .filter(b => parseLocalISO(b.slotISO) > new Date())
    .sort((a, b) => parseLocalISO(a.slotISO) - parseLocalISO(b.slotISO));

  return (
    <div className="space-y-6">
      {/* User Management */}
      <Section title="Gestión de Usuarios">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Seleccionar usuario</option>
              {users.filter(u => u.role === 'user').map(user => (
                <option key={user.email} value={user.email}>
                  {user.name} ({user.sessions} sesiones)
                </option>
              ))}
            </select>
            
            <input
              type="number"
              placeholder="Cantidad de sesiones"
              value={sessionAmount}
              onChange={e => setSessionAmount(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            
            <button
              onClick={handleAddSessions}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Agregar Sesiones
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.filter(u => u.role === 'user').map(user => (
              <div key={user.email} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800">{user.name}</h4>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="mt-2">
                  <Badge variant={user.sessions > 0 ? 'success' : 'warning'}>
                    {user.sessions} sesiones
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Bookings Management */}
      <Section title="Gestión de Reservas" right={
        <Badge variant="info">{upcomingBookings.length} próximas</Badge>
      }>
        {upcomingBookings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Sin reservas próximas</h3>
            <p className="text-gray-600">No hay reservas programadas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map(booking => {
              const user = users.find(u => u.email === booking.email);
              const statusBadge = getStatusBadge(booking.status);
              
              return (
                <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {user?.name || booking.email}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatDateTime(parseLocalISO(booking.slotISO))}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      
                      {booking.status === 'booked' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}
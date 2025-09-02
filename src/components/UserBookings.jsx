import React, { useState, useEffect } from 'react';
import { DB } from '../services/database.js';
import { cancelBooking, reschedule, canChange } from '../services/bookingService.js';
import { formatDateTime, parseLocalISO } from '../utils/dateUtils.js';
import { generateSlots } from '../services/slotService.js';
import { Section } from './ui/Section.jsx';
import { Badge } from './ui/Badge.jsx';

export function UserBookings({ user, onReload }) {
  const [bookings, setBookings] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [rescheduleBooking, setRescheduleBooking] = useState(null);

  useEffect(() => {
    loadBookings();
    setAvailableSlots(generateSlots());
  }, [user.email]);

  const loadBookings = () => {
    const allBookings = DB.bookings();
    const userBookings = allBookings
      .filter(b => b.email === user.email && b.status !== "canceled")
      .sort((a, b) => parseLocalISO(a.slotISO) - parseLocalISO(b.slotISO));
    setBookings(userBookings);
  };

  const handleCancel = (bookingId) => {
    if (confirm("¿Estás seguro de cancelar esta reserva?")) {
      try {
        cancelBooking(bookingId, user.role);
        loadBookings();
        onReload();
        alert("Reserva cancelada");
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleReschedule = (bookingId, newSlotISO) => {
    try {
      reschedule(bookingId, newSlotISO, user.role);
      loadBookings();
      onReload();
      setRescheduleBooking(null);
      alert("Reserva reprogramada");
    } catch (error) {
      alert(error.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'attended': return { variant: 'success', label: 'Asistió' };
      case 'missed': return { variant: 'danger', label: 'Faltó' };
      default: return { variant: 'info', label: 'Reservado' };
    }
  };

  return (
    <Section title="Mis Reservas">
      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Sin reservas</h3>
          <p className="text-gray-600">Haz tu primera reserva en la pestaña "Reservar"</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => {
            const slotDate = parseLocalISO(booking.slotISO);
            const canModify = canChange(booking) || user.role === 'admin';
            const statusBadge = getStatusBadge(booking.status);

            return (
              <div key={booking.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {formatDateTime(slotDate)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Reservado: {formatDateTime(parseLocalISO(booking.bookedAt))}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                    
                    {booking.status === 'booked' && canModify && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setRescheduleBooking(booking)}
                          className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          Reprogramar
                        </button>
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Reprogramar Clase</h3>
            <p className="text-sm text-gray-600 mb-4">
              Clase actual: {formatDateTime(parseLocalISO(rescheduleBooking.slotISO))}
            </p>
            
            <div className="space-y-2 mb-4">
              {availableSlots.slice(0, 10).map(slotISO => {
                const slotDate = parseLocalISO(slotISO);
                const allBookings = DB.bookings();
                const capacity = allBookings.filter(b => 
                  b.slotISO === slotISO && b.status !== "canceled"
                ).length;

                return (
                  <button
                    key={slotISO}
                    onClick={() => handleReschedule(rescheduleBooking.id, slotISO)}
                    disabled={capacity >= 6}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      capacity >= 6 
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 cursor-pointer'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{formatDateTime(slotDate)}</span>
                      <Badge variant={capacity >= 6 ? 'danger' : 'default'}>
                        {capacity}/6
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setRescheduleBooking(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
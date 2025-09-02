import React, { useState, useEffect } from 'react';
import { DB } from '../services/database.js';
import { markAttendance } from '../services/bookingService.js';
import { formatDateTime, parseLocalISO, dayKey } from '../utils/dateUtils.js';
import { Section } from './ui/Section.jsx';
import { Badge } from './ui/Badge.jsx';

export function InstructorPanel({ user, onReload }) {
  const [todayBookings, setTodayBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    const allBookings = DB.bookings();
    const users = DB.users();
    const today = dayKey(new Date());
    
    // Get today's bookings
    const todaySlots = allBookings
      .filter(b => dayKey(parseLocalISO(b.slotISO)) === today && b.status !== "canceled")
      .map(booking => ({
        ...booking,
        userName: users.find(u => u.email === booking.email)?.name || booking.email
      }))
      .sort((a, b) => parseLocalISO(a.slotISO) - parseLocalISO(b.slotISO));

    // Get upcoming bookings (next 7 days)
    const upcoming = allBookings
      .filter(b => {
        const slotDate = parseLocalISO(b.slotISO);
        const daysDiff = (slotDate - new Date()) / (1000 * 60 * 60 * 24);
        return daysDiff > 0 && daysDiff <= 7 && b.status !== "canceled";
      })
      .map(booking => ({
        ...booking,
        userName: users.find(u => u.email === booking.email)?.name || booking.email
      }))
      .sort((a, b) => parseLocalISO(a.slotISO) - parseLocalISO(b.slotISO));

    setTodayBookings(todaySlots);
    setUpcomingBookings(upcoming);
  };

  const handleAttendance = (bookingId, status) => {
    try {
      markAttendance(bookingId, status);
      loadBookings();
      onReload();
    } catch (error) {
      alert(error.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'attended': return { variant: 'success', label: 'Asistió' };
      case 'missed': return { variant: 'danger', label: 'Faltó' };
      default: return { variant: 'info', label: 'Pendiente' };
    }
  };

  return (
    <div className="space-y-6">
      <Section title="Clases de Hoy" right={
        <Badge variant="info">{todayBookings.length} reservas</Badge>
      }>
        {todayBookings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🌅</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Sin clases hoy</h3>
            <p className="text-gray-600">No hay clases programadas para hoy</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayBookings.map(booking => {
              const statusBadge = getStatusBadge(booking.status);
              
              return (
                <div key={booking.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">{booking.userName}</h4>
                      <p className="text-sm text-gray-600">
                        {formatDateTime(parseLocalISO(booking.slotISO))}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      
                      {booking.status === 'booked' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleAttendance(booking.id, 'attended')}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                          >
                            ✓ Asistió
                          </button>
                          <button
                            onClick={() => handleAttendance(booking.id, 'missed')}
                            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                          >
                            ✗ Faltó
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
      </Section>

      <Section title="Próximas Clases" right={
        <Badge variant="default">{upcomingBookings.length} próximas</Badge>
      }>
        {upcomingBookings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Sin clases próximas</h3>
            <p className="text-gray-600">No hay clases programadas para los próximos días</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map(booking => (
              <div key={booking.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{booking.userName}</h4>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(parseLocalISO(booking.slotISO))}
                    </p>
                  </div>
                  <Badge variant="info">Programada</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
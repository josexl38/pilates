import React, { useState, useEffect } from 'react';
import { generateSlots } from '../services/slotService.js';
import { book, capacityFor } from '../services/bookingService.js';
import { DB } from '../services/database.js';
import { formatDateTime, parseLocalISO } from '../utils/dateUtils.js';
import { Section } from './ui/Section.jsx';
import { Badge } from './ui/Badge.jsx';
import { CAPACITY } from '../config/constants.js';

export function BookingForm({ user, onReload }) {
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    setSlots(generateSlots());
    setBookings(DB.bookings());
  }, []);

  const handleBook = (slotISO) => {
    try {
      book(user, slotISO);
      setBookings(DB.bookings());
      onReload();
      alert("¡Reserva confirmada!");
    } catch (error) {
      alert(error.message);
    }
  };

  const getSlotStatus = (slotISO) => {
    const capacity = capacityFor(slotISO, bookings);
    const userBooked = bookings.some(b => 
      b.email === user.email && 
      b.slotISO === slotISO && 
      b.status !== "canceled"
    );

    if (userBooked) return { status: 'booked', text: 'Reservado', variant: 'success' };
    if (capacity >= CAPACITY) return { status: 'full', text: 'Lleno', variant: 'danger' };
    return { status: 'available', text: `${capacity}/${CAPACITY}`, variant: 'default' };
  };

  const groupSlotsByDate = () => {
    const grouped = {};
    slots.forEach(slotISO => {
      const date = parseLocalISO(slotISO);
      const dateKey = date.toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(slotISO);
    });
    return grouped;
  };

  const groupedSlots = groupSlotsByDate();

  return (
    <Section title="Reservar Clase" right={
      <Badge variant="info">{user.sessions} sesiones disponibles</Badge>
    }>
      {user.sessions <= 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Sin sesiones disponibles</h3>
          <p className="text-gray-600">Contacta al administrador para comprar más sesiones</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSlots).map(([dateKey, daySlots]) => {
            const date = new Date(dateKey);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div key={dateKey} className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  {date.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  {isToday && <Badge variant="warning" className="ml-2">Hoy</Badge>}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {daySlots.map(slotISO => {
                    const slotStatus = getSlotStatus(slotISO);
                    const time = parseLocalISO(slotISO).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div
                        key={slotISO}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          slotStatus.status === 'available' 
                            ? 'border-indigo-200 bg-indigo-50 hover:border-indigo-300 hover:shadow-md cursor-pointer'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                        onClick={() => slotStatus.status === 'available' && handleBook(slotISO)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">{time}</span>
                          <Badge variant={slotStatus.variant}>{slotStatus.text}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}
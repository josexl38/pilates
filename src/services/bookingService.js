import { CAPACITY } from '../config/constants.js';
import { parseLocalISO, uid, localISO } from '../utils/dateUtils.js';
import { DB } from './database.js';

export const capacityFor = (slotISO, allBookings) => 
  allBookings.filter(booking => 
    booking.slotISO === slotISO && booking.status !== "canceled"
  ).length;

export const canChange = booking => 
  (parseLocalISO(booking.slotISO) - new Date()) / (1000 * 60 * 60) >= 24;

export function book(user, slotISO) {
  const users = DB.users();
  const foundUser = users.find(u => u.email === user.email);
  if (!foundUser) throw new Error("Usuario no encontrado");
  
  const bookings = DB.bookings();
  
  // Check if already booked
  if (bookings.some(b => 
    b.email === foundUser.email && 
    b.slotISO === slotISO && 
    b.status !== "canceled"
  )) {
    throw new Error("Ya reservaste ese horario");
  }
  
  // Check capacity
  if (capacityFor(slotISO, bookings) >= CAPACITY) {
    throw new Error("Clase llena (6/6)");
  }
  
  // Check sessions
  if (foundUser.sessions <= 0) {
    throw new Error("No tienes sesiones disponibles");
  }

  // Create booking
  foundUser.sessions -= 1;
  DB.saveUsers(users);
  
  bookings.push({
    id: uid(),
    email: foundUser.email,
    slotISO,
    status: "booked",
    bookedAt: localISO(new Date())
  });
  
  DB.saveBookings(bookings);
}

export function cancelBooking(bookingId, userRole = "user") {
  const bookings = DB.bookings();
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) throw new Error("Reserva no encontrada");
  if (booking.status === "canceled") return;

  const users = DB.users();
  const user = users.find(u => u.email === booking.email);
  const isRefundable = canChange(booking) || userRole === "admin";
  
  booking.status = "canceled";
  DB.saveBookings(bookings);
  
  if (isRefundable && user) {
    user.sessions += 1;
    DB.saveUsers(users);
  }
}

export function reschedule(bookingId, newSlotISO, userRole = "user") {
  const bookings = DB.bookings();
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) throw new Error("Reserva no encontrada");
  
  if (userRole !== "admin" && !canChange(booking)) {
    throw new Error("Solo puedes reprogramar con ≥24 h de anticipación");
  }
  
  if (capacityFor(newSlotISO, bookings) >= CAPACITY) {
    throw new Error("La clase destino está llena");
  }
  
  if (bookings.some(b => 
    b.email === booking.email && 
    b.slotISO === newSlotISO && 
    b.status !== "canceled"
  )) {
    throw new Error("Ya tienes esa hora reservada");
  }

  booking.slotISO = newSlotISO;
  DB.saveBookings(bookings);
}

export function markAttendance(bookingId, status) {
  const bookings = DB.bookings();
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) throw new Error("Reserva no encontrada");
  
  if (!["booked", "attended", "missed"].includes(status)) {
    throw new Error("Estado inválido");
  }
  
  booking.status = status;
  DB.saveBookings(bookings);
}
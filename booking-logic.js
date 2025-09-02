// ===== Lógica de negocio para reservas =====
const BookingLogic = {
  // ===== Validaciones =====
  validateBooking: (user, slotISO) => {
    // Verificar si el usuario existe y tiene sesiones
    if (!user) {
      throw new Error(TEXTS.ERRORS.USER_NOT_FOUND);
    }
    
    if (user.role === 'user' && user.sessions <= 0) {
      throw new Error(TEXTS.ERRORS.NO_SESSIONS);
    }
    
    // Verificar si ya tiene una reserva en ese horario
    const existingBookings = Database.getBookings();
    const hasExistingBooking = existingBookings.some(booking => 
      booking.userEmail === user.email && 
      booking.slotISO === slotISO && 
      booking.status !== "canceled"
    );
    
    if (hasExistingBooking) {
      throw new Error(TEXTS.ERRORS.ALREADY_BOOKED);
    }
    
    // Verificar capacidad de la clase
    const currentCapacity = Utils.getCapacity(slotISO, existingBookings);
    if (currentCapacity >= CONFIG.CAPACITY) {
      throw new Error(TEXTS.ERRORS.CLASS_FULL);
    }
    
    return true;
  },
  
  // ===== Crear reserva =====
  createBooking: (user, slotISO) => {
    try {
      // Validar la reserva
      BookingLogic.validateBooking(user, slotISO);
      
      // Crear la reserva
      const booking = Database.addBooking({
        userEmail: user.email,
        userName: user.name,
        slotISO: slotISO,
        status: "booked"
      });
      
      // Descontar sesión si es usuario regular
      if (user.role === 'user') {
        const updatedUser = {
          ...user,
          sessions: user.sessions - 1
        };
        Database.updateUser(updatedUser);
        Database.setCurrentUser(updatedUser);
      }
      
      return booking;
    } catch (error) {
      console.error("Error al crear reserva:", error);
      throw error;
    }
  },
  
  // ===== Cancelar reserva =====
  cancelBooking: (bookingId, requestingUser) => {
    try {
      const bookings = Database.getBookings();
      const booking = bookings.find(b => b.id === bookingId);
      
      if (!booking) {
        throw new Error(TEXTS.ERRORS.BOOKING_NOT_FOUND);
      }
      
      if (booking.status === "canceled") {
        return booking; // Ya está cancelada
      }
      
      // Verificar permisos
      const isOwnBooking = booking.userEmail === requestingUser.email;
      const isAdmin = requestingUser.role === 'admin';
      
      if (!isOwnBooking && !isAdmin) {
        throw new Error("No tienes permisos para cancelar esta reserva");
      }
      
      // Verificar si se puede reembolsar
      const canRefund = Utils.canChangeBooking(booking) || isAdmin;
      
      // Actualizar el estado de la reserva
      const updatedBooking = Database.updateBooking(bookingId, {
        status: "canceled",
        canceledAt: Utils.localISO(new Date()),
        canceledBy: requestingUser.email
      });
      
      // Reembolsar sesión si corresponde
      if (canRefund) {
        const user = Database.getUserByEmail(booking.userEmail);
        if (user && user.role === 'user') {
          const updatedUser = {
            ...user,
            sessions: user.sessions + 1
          };
          Database.updateUser(updatedUser);
          
          // Actualizar usuario actual si es el mismo
          if (user.email === requestingUser.email) {
            Database.setCurrentUser(updatedUser);
          }
        }
      }
      
      return updatedBooking;
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
      throw error;
    }
  },
  
  // ===== Reprogramar reserva =====
  rescheduleBooking: (bookingId, newSlotISO, requestingUser) => {
    try {
      const bookings = Database.getBookings();
      const booking = bookings.find(b => b.id === bookingId);
      
      if (!booking) {
        throw new Error(TEXTS.ERRORS.BOOKING_NOT_FOUND);
      }
      
      // Verificar permisos
      const isOwnBooking = booking.userEmail === requestingUser.email;
      const isAdmin = requestingUser.role === 'admin';
      
      if (!isOwnBooking && !isAdmin) {
        throw new Error("No tienes permisos para reprogramar esta reserva");
      }
      
      // Verificar tiempo límite (excepto admin)
      if (!isAdmin && !Utils.canChangeBooking(booking)) {
        throw new Error(TEXTS.ERRORS.CANNOT_CHANGE);
      }
      
      // Verificar capacidad del nuevo horario
      const newSlotCapacity = Utils.getCapacity(newSlotISO, bookings);
      if (newSlotCapacity >= CONFIG.CAPACITY) {
        throw new Error("La nueva clase está llena");
      }
      
      // Verificar que no tenga otra reserva en el nuevo horario
      const hasConflict = bookings.some(b => 
        b.userEmail === booking.userEmail && 
        b.slotISO === newSlotISO && 
        b.status !== "canceled" && 
        b.id !== bookingId
      );
      
      if (hasConflict) {
        throw new Error("Ya tienes una reserva en ese horario");
      }
      
      // Actualizar la reserva
      const updatedBooking = Database.updateBooking(bookingId, {
        slotISO: newSlotISO,
        rescheduledAt: Utils.localISO(new Date()),
        rescheduledBy: requestingUser.email
      });
      
      return updatedBooking;
    } catch (error) {
      console.error("Error al reprogramar reserva:", error);
      throw error;
    }
  },
  
  // ===== Marcar asistencia =====
  markAttendance: (bookingId, status, requestingUser) => {
    try {
      // Verificar permisos
      Auth.authorize(requestingUser, "mark_attendance");
      
      if (!["booked", "attended", "missed"].includes(status)) {
        throw new Error(TEXTS.ERRORS.INVALID_STATUS);
      }
      
      const updatedBooking = Database.updateBooking(bookingId, {
        status: status,
        attendanceMarkedAt: Utils.localISO(new Date()),
        attendanceMarkedBy: requestingUser.email
      });
      
      if (!updatedBooking) {
        throw new Error(TEXTS.ERRORS.BOOKING_NOT_FOUND);
      }
      
      return updatedBooking;
    } catch (error) {
      console.error("Error al marcar asistencia:", error);
      throw error;
    }
  },
  
  // ===== Gestión de sesiones (solo admin) =====
  addSessions: (userEmail, amount, requestingUser) => {
    try {
      Auth.authorize(requestingUser, "assign_sessions");
      
      const user = Database.getUserByEmail(userEmail);
      if (!user) {
        throw new Error(TEXTS.ERRORS.USER_NOT_FOUND);
      }
      
      const updatedUser = {
        ...user,
        sessions: Math.max(0, (user.sessions || 0) + Number(amount))
      };
      
      Database.updateUser(

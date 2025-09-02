// ===== Simulación de base de datos usando localStorage =====
const Database = {
  // ===== Gestión de usuarios =====
  getUsers: () => {
    try {
      const stored = localStorage.getItem("pilates_users");
      if (!stored || JSON.parse(stored).length === 0) {
        Database.saveUsers(TEST_USERS);
        return TEST_USERS;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      return TEST_USERS;
    }
  },
  
  saveUsers: (users) => {
    try {
      localStorage.setItem("pilates_users", JSON.stringify(users));
    } catch (error) {
      console.error("Error al guardar usuarios:", error);
    }
  },
  
  getUserByEmail: (email) => {
    const users = Database.getUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  },
  
  updateUser: (updatedUser) => {
    const users = Database.getUsers();
    const index = users.findIndex(user => user.email === updatedUser.email);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser };
      Database.saveUsers(users);
      return users[index];
    }
    return null;
  },
  
  // ===== Gestión de reservas =====
  getBookings: () => {
    try {
      const stored = localStorage.getItem("pilates_bookings");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error al cargar reservas:", error);
      return [];
    }
  },
  
  saveBookings: (bookings) => {
    try {
      localStorage.setItem("pilates_bookings", JSON.stringify(bookings));
    } catch (error) {
      console.error("Error al guardar reservas:", error);
    }
  },
  
  addBooking: (booking) => {
    const bookings = Database.getBookings();
    const newBooking = {
      id: Utils.generateId(),
      ...booking,
      createdAt: Utils.localISO(new Date())
    };
    bookings.push(newBooking);
    Database.saveBookings(bookings);
    return newBooking;
  },
  
  updateBooking: (bookingId, updates) => {
    const bookings = Database.getBookings();
    const index = bookings.findIndex(booking => booking.id === bookingId);
    if (index !== -1) {
      bookings[index] = { ...bookings[index], ...updates };
      Database.saveBookings(bookings);
      return bookings[index];
    }
    return null;
  },
  
  getBookingsByUser: (userEmail) => {
    const bookings = Database.getBookings();
    return bookings.filter(booking => booking.userEmail === userEmail);
  },
  
  getBookingsBySlot: (slotISO) => {
    const bookings = Database.getBookings();
    return bookings.filter(booking => 
      booking.slotISO === slotISO && booking.status !== "canceled"
    );
  },
  
  // ===== Gestión de sesión actual =====
  getCurrentUser: () => {
    try {
      const stored = localStorage.getItem("pilates_current_user");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error al cargar usuario actual:", error);
      return null;
    }
  },
  
  setCurrentUser: (user) => {
    try {
      if (user) {
        localStorage.setItem("pilates_current_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("pilates_current_user");
      }
    } catch (error) {
      console.error("Error al guardar usuario actual:", error);
    }
  },
  
  // ===== Operaciones de consulta =====
  getFutureBookings: () => {
    const bookings = Database.getBookings();
    const now = new Date();
    return bookings.filter(booking => {
      const slotDate = Utils.parseLocalISO(booking.slotISO);
      return slotDate >= now && booking.status !== "canceled";
    });
  },
  
  getTodayBookings: () => {
    const bookings = Database.getBookings();
    const today = Utils.dayKey(new Date());
    return bookings.filter(booking => {
      const slotDate = Utils.parseLocalISO(booking.slotISO);
      return Utils.dayKey(slotDate) === today && booking.status !== "canceled";
    });
  },
  
  getBookingStats: () => {
    const bookings = Database.getBookings();
    const users = Database.getUsers();
    
    return {
      totalBookings: bookings.length,
      activeBookings: bookings.filter(b => b.status === "booked").length,
      attendedBookings: bookings.filter(b => b.status === "attended").length,
      missedBookings: bookings.filter(b => b.status === "missed").length,
      totalUsers: users.length,
      activeUsers: users.filter(u => u.role === "user" && u.sessions > 0).length
    };
  },
  
  // ===== Limpieza y mantenimiento =====
  clearAllData: () => {
    localStorage.removeItem("pilates_users");
    localStorage.removeItem("pilates_bookings");
    localStorage.removeItem("pilates_current_user");
  },
  
  resetToDefaults: () => {
    Database.clearAllData();
    Database.saveUsers(TEST_USERS);
  }
};

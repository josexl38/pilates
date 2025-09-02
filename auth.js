// ===== Sistema de autenticación =====
const Auth = {
  // Valida las credenciales del usuario
  validateLogin: (email, password = "") => {
    // Validar formato de email
    if (!email || !Utils.isValidEmail(email)) {
      throw new Error(TEXTS.ERRORS.INVALID_EMAIL);
    }
    
    // Buscar usuario en la base de datos
    const user = Database.getUserByEmail(email.trim());
    if (!user) {
      throw new Error(TEXTS.ERRORS.USER_NOT_FOUND);
    }
    
    return user;
  },
  
  // Inicia sesión de usuario
  login: (email, password = "") => {
    try {
      const user = Auth.validateLogin(email, password);
      Database.setCurrentUser(user);
      return user;
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  },
  
  // Cierra sesión
  logout: () => {
    try {
      Database.setCurrentUser(null);
    } catch (error) {
      console.error("Error en logout:", error);
    }
  },
  
  // Obtiene el usuario actual
  getCurrentUser: () => {
    try {
      return Database.getCurrentUser();
    } catch (error) {
      console.error("Error al obtener usuario actual:", error);
      return null;
    }
  },
  
  // Refresca los datos del usuario actual
  refreshCurrentUser: () => {
    try {
      const currentUser = Database.getCurrentUser();
      if (currentUser) {
        const updatedUser = Database.getUserByEmail(currentUser.email);
        if (updatedUser) {
          Database.setCurrentUser(updatedUser);
          return updatedUser;
        }
      }
      return null;
    } catch (error) {
      console.error("Error al refrescar usuario:", error);
      return null;
    }
  },
  
  // Verifica si el usuario tiene permisos para una acción
  hasPermission: (user, action) => {
    if (!user) return false;
    
    const permissions = {
      // Permisos de usuario regular
      user: [
        "view_schedule",
        "make_booking", 
        "view_own_bookings",
        "cancel_own_booking",
        "reschedule_own_booking"
      ],
      
      // Permisos de instructor
      instructor: [
        "view_schedule",
        "view_all_bookings",
        "mark_attendance",
        "view_today_classes"
      ],
      
      // Permisos de administrador (todos los permisos)
      admin: [
        "view_schedule",
        "make_booking",
        "view_own_bookings", 
        "view_all_bookings",
        "cancel_any_booking",
        "reschedule_any_booking",
        "mark_attendance",
        "manage_users",
        "assign_sessions",
        "view_reports",
        "admin_panel"
      ]
    };
    
    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes(action);
  },
  
  // Valida si el usuario puede realizar una acción específica
  authorize: (user, action) => {
    if (!Auth.hasPermission(user, action)) {
      throw new Error(`No tienes permisos para realizar esta acción: ${action}`);
    }
    return true;
  }
};

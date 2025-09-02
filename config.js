// ===== Configuración del sistema =====
const CONFIG = {
  CAPACITY: 6,
  TIMES: ["07:00", "09:00", "18:00"],
  DAYS_AHEAD: 21,
  MIN_HOURS_CANCEL: 24
};

// ===== Usuarios de prueba =====
const TEST_USERS = [
  { 
    id: "user1",
    email: "usuario@prueba.com", 
    name: "Cliente Demo", 
    role: "user", 
    sessions: 8,
    phone: "+52 444 123 4567"
  },
  { 
    id: "instructor1",
    email: "instructor@prueba.com", 
    name: "Instructor Demo", 
    role: "instructor", 
    sessions: 0,
    phone: "+52 444 765 4321"
  },
  { 
    id: "admin1",
    email: "admin@prueba.com", 
    name: "Admin Demo", 
    role: "admin", 
    sessions: 0,
    phone: "+52 444 999 0000"
  }
];

// ===== Textos del sistema =====
const TEXTS = {
  LOGIN: {
    TITLE: "Pilates Studio",
    SUBTITLE: "Sistema de Reservas y Asistencia",
    EMAIL_PLACEHOLDER: "tu@correo.com",
    LOGIN_BUTTON: "Iniciar Sesión",
    DEMO_TOGGLE: "Ver usuarios de prueba"
  },
  ROLES: {
    admin: "Administrador",
    instructor: "Instructor", 
    user: "Cliente"
  },
  STATUS: {
    booked: "Reservado",
    attended: "Asistió",
    missed: "Faltó",
    canceled: "Cancelado"
  },
  ERRORS: {
    INVALID_EMAIL: "Correo electrónico inválido",
    USER_NOT_FOUND: "Usuario no encontrado",
    ALREADY_BOOKED: "Ya reservaste ese horario",
    CLASS_FULL: "Clase llena (6/6)",
    NO_SESSIONS: "No tienes sesiones disponibles",
    BOOKING_NOT_FOUND: "Reserva no encontrada",
    CANNOT_CHANGE: "Solo puedes reprogramar con ≥24 h de anticipación",
    INVALID_STATUS: "Estado inválido"
  }
};

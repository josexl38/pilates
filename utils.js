// ===== Utilidades de fecha y formato =====
const Utils = {
  // Formateo de números con ceros
  pad: (n) => n.toString().padStart(2, "0"),
  
  // Convierte Date a ISO local (sin timezone)
  localISO: (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${Utils.pad(d.getMonth()+1)}-${Utils.pad(d.getDate())}T${Utils.pad(d.getHours())}:${Utils.pad(d.getMinutes())}`;
  },
  
  // Convierte ISO local a Date
  parseLocalISO: (iso) => {
    const [datePart, timePart] = iso.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    return new Date(year, month-1, day, hour, minute);
  },
  
  // Agrega días a una fecha
  addDays: (baseDate, days) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + days);
    return date;
  },
  
  // Formato amigable de fecha
  formatDate: (date) => {
    return date.toLocaleString('es-ES', {
      weekday: "short", 
      year: "numeric", 
      month: "short", 
      day: "numeric", 
      hour: "2-digit", 
      minute: "2-digit"
    });
  },
  
  // Formato de fecha para agrupación
  dayKey: (date) => {
    return date.toISOString().slice(0, 10);
  },
  
  // Genera ID único
  generateId: () => {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  },
  
  // Valida email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Genera horarios disponibles
  generateSlots: () => {
    const slots = [];
    const now = new Date();
    
    for (let i = 0; i < CONFIG.DAYS_AHEAD; i++) {
      const date = Utils.addDays(now, i);
      
      for (const time of CONFIG.TIMES) {
        const [hour, minute] = time.split(":").map(Number);
        const slotDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute);
        
        // Solo incluir slots futuros
        if (slotDate > now) {
          slots.push(Utils.localISO(slotDate));
        }
      }
    }
    
    return slots;
  },
  
  // Calcula capacidad actual de una clase
  getCapacity: (slotISO, bookings) => {
    return bookings.filter(booking => 
      booking.slotISO === slotISO && booking.status !== "canceled"
    ).length;
  },
  
  // Verifica si se puede cambiar una reserva
  canChangeBooking: (booking) => {
    const slotDate = Utils.parseLocalISO(booking.slotISO);
    const now = new Date();
    const hoursUntilSlot = (slotDate - now) / (1000 * 60 * 60);
    return hoursUntilSlot >= CONFIG.MIN_HOURS_CANCEL;
  },
  
  // Agrupa slots por día
  groupSlotsByDay: (slots) => {
    const grouped = {};
    
    for (const slot of slots) {
      const date = Utils.parseLocalISO(slot);
      const key = Utils.dayKey(date);
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(slot);
    }
    
    return grouped;
  },
  
  // Formatea fecha larga para encabezados
  formatLongDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  },
  
  // Formatea solo la hora
  formatTime: (isoString) => {
    const date = Utils.parseLocalISO(isoString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit', 
      minute: '2-digit'
    });
  },
  
  // Debounce para optimizar renders
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

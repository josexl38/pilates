const { useState, useEffect, useMemo } = React;

// ===== Componentes UI Básicos =====
const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 border-gray-200",
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    danger: "bg-red-100 text-red-800 border-red-200",
    info: "bg-blue-100 text-blue-800 border-blue-200"
  };
  
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Section = ({ title, children, rightContent, className = "" }) => (
  <div className={`rounded-2xl shadow-lg p-6 bg-white border border-white/20 slide-in ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      {rightContent}
    </div>
    {children}
  </div>
);

const LoadingSpinner = ({ size = "default" }) => {
  const sizes = {
    small: "w-4 h-4",
    default: "w-6 h-6", 
    large: "w-8 h-8"
  };
  
  return <div className={`spinner ${sizes[size]}`}></div>;
};

const Button = ({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "default", 
  disabled = false, 
  loading = false,
  className = "" 
}) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50"
  };
  
  const sizes = {
    small: "px-3 py-1 text-sm",
    default: "px-4 py-2",
    large: "px-6 py-3 text-lg"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        rounded-lg font-medium transition-all duration-200 
        ${variants[variant]} ${sizes[size]} ${className}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'}
      `}
    >
      {loading && <LoadingSpinner size="small" />}
      {!loading && children}
    </button>
  );
};

// ===== Página de Login =====
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [showDemo, setShowDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await onLogin(email);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 fade-in">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧘‍♀️</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{TEXTS.LOGIN.TITLE}</h1>
            <p className="text-white/80 text-sm">{TEXTS.LOGIN.SUBTITLE}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                placeholder={TEXTS.LOGIN.EMAIL_PLACEHOLDER}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
            </div>

            <Button
              onClick={handleLogin}
              loading={isLoading}
              className="w-full bg-white text-gray-800 font-semibold hover:bg-white/90"
            >
              {TEXTS.LOGIN.LOGIN_BUTTON}
            </Button>

            <div className="text-center">
              <button
                className="text-white/80 text-sm hover:text-white transition-colors"
                onClick={() => setShowDemo(!showDemo)}
                disabled={isLoading}
              >
                {showDemo ? "Ocultar" : "Ver"} usuarios de prueba
              </button>
            </div>

            {showDemo && (
              <div className="bg-white/10 rounded-xl p-4 space-y-3 slide-in">
                <p className="text-white/90 text-sm font-medium mb-3">Usuarios de prueba:</p>
                {TEST_USERS.map(user => (
                  <div key={user.email} className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm font-medium">{user.name}</div>
                      <div className="text-white/70 text-xs">{user.email}</div>
                      <Badge variant={
                        user.role === 'admin' ? 'danger' : 
                        user.role === 'instructor' ? 'warning' : 'info'
                      }>
                        {TEXTS.ROLES[user.role]}
                      </Badge>
                    </div>
                    <button
                      className="text-xs bg-white/20 text-white px-3 py-1 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
                      onClick={() => setEmail(user.email)}
                      disabled={isLoading}
                    >
                      Usar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== Grid de Horarios Disponibles =====
const SlotsGrid = ({ slots, bookings, onBook, currentUser }) => {
  const grouped = useMemo(() => {
    return Utils.groupSlotsByDay(slots);
  }, [slots]);

  const SlotCard = ({ slotISO }) => {
    const capacity = Utils.getCapacity(slotISO, bookings);
    const userHasBooking = bookings.some(b => 
      b.userEmail === currentUser?.email && 
      b.slotISO === slotISO && 
      b.status !== "canceled"
    );
    const isFull = capacity >= CONFIG.CAPACITY;
    const canBook = currentUser?.role === 'user' && !userHasBooking && !isFull && currentUser.sessions > 0;

    return (
      <div className={`rounded-xl border-2 p-4 transition-all duration-200 ${
        userHasBooking ? 'bg-blue-50 border-blue-200' : 
        isFull ? 'bg-gray-50 border-gray-200' : 
        'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-gray-800">
            {Utils.formatTime(slotISO)}
          </div>
          <Badge variant={isFull ? "danger" : capacity > 3 ? "warning" : "success"}>
            {capacity}/{CONFIG.CAPACITY}
          </Badge>
        </div>
        
        <Button
          onClick={() => onBook(slotISO)}
          disabled={!canBook}
          variant={userHasBooking ? "success" : isFull ? "outline" : "primary"}
          size="small"
          className="w-full"
        >
          {userHasBooking ? "✓ Reservado" : 
           isFull ? "Clase llena" : 
           !currentUser ? "Inicia sesión" :
           currentUser.role !== 'user' ? "Solo clientes" :
           currentUser.sessions <= 0 ? "Sin sesiones" :
           "Reservar"}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([dayKey, daySlots]) => (
        <div key={dayKey} className="slide-in">
          <div className="text-sm font-medium text-gray-600 mb-3">
            {Utils.formatLongDate(dayKey)}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {daySlots.map(slot => (
              <SlotCard key={slot} slotISO={slot} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ===== Lista de Reservas del Usuario =====
const BookingsList = ({ user, bookings, allSlots, onCancel, onReschedule }) => {
  const userBookings = useMemo(() => {
    return BookingLogic.getUserBookings(user?.email)
      .sort((a, b) => Utils.parseLocalISO(a.slotISO) - Utils.parseLocalISO(b.slotISO));
  }, [user, bookings]);

  if (userBookings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <span className="text-4xl mb-4 block">📅</span>
        <h3 className="text-lg font-medium mb-2">No tienes reservas activas</h3>
        <p className="text-sm">Reserva tu primera clase en el calendario</p>
      </div>
    );
  }

  const BookingCard = ({ booking }) => {
    const slotDate = Utils.parseLocalISO(booking.slotISO);
    const canEdit = Utils.canChangeBooking(booking);
    const statusColors = {
      booked: "info",
      attended: "success", 
      missed: "danger"
    };

    return (
      <div className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 slide-in">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="font-semibold text-gray-800">
              {Utils.formatDate(slotDate)}
            </div>
            <Badge variant={statusColors[booking.status] || "default"}>
              {TEXTS.STATUS[booking.status] || booking.status}
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {canEdit && (
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    onReschedule(booking, e.target.value);
                  }
                }}
              >
                <option value="">Reprogramar a…</option>
                {allSlots.map(slot => (
                  <option key={slot} value={slot}>
                    {Utils.formatDate(Utils.parseLocalISO(slot))}
                  </option>
                ))}
              </select>
            )}
            
            <Button
              onClick={() => onCancel(booking)}
              variant="danger"
              size="small"
            >
              Cancelar {canEdit ? "(regresa sesión)" : "(sin reembolso)"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {userBookings.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
};

// ===== Hook personalizado para autenticación =====
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const currentUser = Auth.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email, password = "") => {
    try {
      const loggedInUser = Auth.login(email, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  const logout = () => {
    Auth.logout();
    setUser(null);
  };

  const refreshUser = () => {
    const updatedUser = Auth.refreshCurrentUser();
    setUser(updatedUser);
    return updatedUser;
  };

  return { user, login, logout, refreshUser, loading };
}

// ===== Hook para gestión de datos =====
function useAppData() {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [slots, setSlots] = useState([]);
  
  const refreshData = () => {
    setBookings(Database.getBookings());
    setUsers(Database.getUsers());
    setSlots(Utils.generateSlots());
  };

  useEffect(() => {
    refreshData();
  }, []);

  return { bookings, users, slots, refreshData };
}

// ===== Panel del Instructor =====
const InstructorPanel = ({ bookings, users, onRefresh }) => {
  const todayClasses = useMemo(() => {
    return BookingLogic.getTodayClasses();
  }, [bookings]);

  const upcomingBookings = useMemo(() => {
    const future = Database.getFutureBookings();
    return future
      .slice(0, 10)
      .map(booking => ({
        ...booking,
        user: users.find(u => u.email === booking.userEmail)
      }));
  }, [bookings, users]);

  const handleMarkAttendance = async (bookingId, status) => {
    try {
      const currentUser = Auth.getCurrentUser();
      await BookingLogic.markAttendance(bookingId, status, currentUser);
      onRefresh();
    } catch (error) {
      alert(error.message);
    }
  };

  const AttendanceCard = ({ booking }) => (
    <div className="border rounded-xl p-4 flex items-center justify-between">
      <div>
        <div className="font-medium">{Utils.formatDate(Utils.parseLocalISO(booking.slotISO))}</div>
        <div className="text-sm text-gray-600">{booking.user?.name || booking.userEmail}</div>
        <Badge variant={
          booking.status === "attended" ? "success" : 
          booking.status === "missed" ? "danger" : "info"
        }>
          {TEXTS.STATUS[booking.status]}
        </Badge>
      </div>
      
      {booking.status === "booked" && (
        <div className="flex gap-2">
          <Button
            onClick={() => handleMarkAttendance(booking.id, "attended")}
            variant="success"
            size="small"
          >
            ✓ Asistió
          </Button>
          <Button
            onClick={() => handleMarkAttendance(booking.id, "missed")}
            variant="danger"
            size="small"
          >
            ✗ Faltó
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Section 
        title="Clases de hoy" 
        rightContent={<Badge variant="info">{todayClasses.length} reservas</Badge>}
      >
        <div className="space-y-3">
          {todayClasses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-3xl mb-2 block">☀️</span>
              <p>No hay clases programadas para hoy</p>
            </div>
          ) : (
            todayClasses.map(booking => (
              <AttendanceCard key={booking.id} booking={booking} />
            ))
          )}
        </div>
      </Section>

      <Section 
        title="Próximas clases" 
        rightContent={<Badge variant="info">{upcomingBookings.length} reservas</Badge>}
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {upcomingBookings.map(booking => (
            <div key={booking.id} className="border rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{Utils.formatDate(Utils.parseLocalISO(booking.slotISO))}</div>
                <div className="text-xs text-gray-600">{booking.user?.name || booking.userEmail}</div>
              </div>
              <Badge variant="info">Reservado</Badge>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

// ===== Panel de Administrador =====
const AdminPanel = ({ users, bookings, onRefresh }) => {
  const [email, setEmail] = useState("");
  const [delta, setDelta] = useState(4);
  const [fixAmount, setFixAmount] = useState("");

  const futureBookings = useMemo(() => {
    return Database.getFutureBookings()
      .map(booking => ({
        ...booking,
        user: users.find(u => u.email === booking.userEmail)
      }))
      .sort((a, b) => Utils.parseLocalISO(a.slotISO) - Utils.parseLocalISO(b.slotISO));
  }, [bookings, users]);

  const handleAddSessions = async () => {
    try {
      const currentUser = Auth.getCurrentUser();
      await BookingLogic.addSessions(email, delta, currentUser);
      onRefresh();
      alert("Sesiones agregadas correctamente");
      setEmail("");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSetSessions = async () => {
    try {
      const currentUser = Auth.getCurrentUser();
      await BookingLogic.setSessions(email, fixAmount, currentUser);
      onRefresh();
      alert("Sesiones establecidas correctamente");
      setEmail("");
      setFixAmount("");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleMarkAttendance = async (bookingId, status) => {
    try {
      const currentUser = Auth.getCurrentUser();
      await BookingLogic.markAttendance(bookingId, status, currentUser);
      onRefresh();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleReschedule = async (booking, newSlotISO) => {
    try {
      const currentUser = Auth.getCurrentUser();
      await BookingLogic.rescheduleBooking(booking.id, newSlotISO, currentUser);
      onRefresh();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCancel = async (booking) => {
    try {
      const currentUser = Auth.getCurrentUser();
      await BookingLogic.cancelBooking(booking.id, currentUser);
      onRefresh();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <Section title="Gestión de Paquetes">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-medium text-blue-800 mb-4">Asignar sesiones a usuarios</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Correo del usuario</label>
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="cliente@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Agregar sesiones (+)</label>
              <input
                type="number"
                className="border border-gray-300 rounded-lg px-3 py-2 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={delta}
                onChange={(e) => setDelta(Number(e.target.value))}
              />
            </div>
            
            <Button onClick={handleAddSessions} variant="primary">
              Agregar
            </Button>
            
            <div className="text-sm text-gray-400">o</div>
            
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Fijar total (=)</label>
              <input
                type="number"
                className="border border-gray-300 rounded-lg px-3 py-2 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={fixAmount}
                onChange={(e) => setFixAmount(e.target.value)}
              />
            </div>
            
            <Button onClick={handleSetSessions} variant="success">
              Fijar
            </Button>
          </div>
        </div>
      </Section>

      <Section 
        title="Gestión de Reservas" 
        rightContent={<Badge variant="info">{futureBookings.length} reservas futuras</Badge>}
      >
        <div className="space-y-3">
          {futureBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-3xl mb-2 block">📋</span>
              <p>No hay reservas futuras</p>
            </div>
          ) : (
            futureBookings.map(booking => (
              <div key={booking.id} className="border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <Badge variant={
                    user.role === 'admin' ? 'danger' : 
                    user.role === 'instructor' ? 'warning' : 'info'
                  }>
                    {TEXTS.ROLES[user.role]}
                  </Badge>
                  <div className="text-sm">
                    <span className="text-gray-600">Sesiones:</span>
                    <span className="font-bold ml-1 text-blue-600">{user.sessions || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

// ===== Componente Principal de la App =====
function App() {
  const { user, login, logout, refreshUser, loading } = useAuth();
  const { bookings, users, slots, refreshData } = useAppData();
  const [activeTab, setActiveTab] = useState("schedule");

  // Actualizar datos cuando cambie el usuario
  useEffect(() => {
    if (user) {
      refreshData();
      // Establecer tab por defecto según el rol
      const defaultTabs = {
        user: "schedule",
        instructor: "attendance", 
        admin: "schedule"
      };
      setActiveTab(defaultTabs[user.role] || "schedule");
    }
  }, [user]);

  const handleRefresh = () => {
    refreshData();
    refreshUser();
  };

  const handleBooking = async (slotISO) => {
    try {
      await BookingLogic.createBooking(user, slotISO);
      handleRefresh();
      alert("¡Reserva creada exitosamente!");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCancel = async (booking) => {
    try {
      await BookingLogic.cancelBooking(booking.id, user);
      handleRefresh();
      alert("Reserva cancelada exitosamente");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleReschedule = async (booking, newSlotISO) => {
    try {
      await BookingLogic.rescheduleBooking(booking.id, newSlotISO, user);
      handleRefresh();
      alert("Reserva reprogramada exitosamente");
    } catch (error) {
      alert(error.message);
    }
  };

  // Definir tabs disponibles según el rol
  const getAvailableTabs = () => {
    const tabs = [];
    
    if (user.role === 'user') {
      tabs.push(
        { id: "schedule", label: "Reservar Clases", icon: "📅" },
        { id: "bookings", label: "Mis Reservas", icon: "📋" }
      );
    }
    
    if (user.role === 'instructor') {
      tabs.push(
        { id: "attendance", label: "Tomar Asistencia", icon: "✅" }
      );
    }
    
    if (user.role === 'admin') {
      tabs.push(
        { id: "schedule", label: "Reservar Clases", icon: "📅" },
        { id: "bookings", label: "Mis Reservas", icon: "📋" },
        { id: "attendance", label: "Tomar Asistencia", icon: "✅" },
        { id: "admin", label: "Administración", icon: "⚙️" }
      );
    }
    
    return tabs;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  const availableTabs = getAvailableTabs();

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{TEXTS.LOGIN.TITLE}</h1>
            <p className="text-white/80 text-sm">{TEXTS.LOGIN.SUBTITLE}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-white font-medium">Hola, {user.name}</div>
              <div className="text-white/80 text-sm flex items-center gap-2">
                <Badge variant={
                  user.role === 'admin' ? 'danger' : 
                  user.role === 'instructor' ? 'warning' : 'info'
                }>
                  {TEXTS.ROLES[user.role]}
                </Badge>
                {user.role === 'user' && (
                  <span>
                    <span className="font-mono">{user.sessions || 0}</span> sesiones
                  </span>
                )}
              </div>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              Cerrar Sesión
            </Button>
          </div>
        </header>

        {/* Navigation */}
        <nav className="flex flex-wrap items-center gap-2">
          {availableTabs.map(tab => (
            <button
              key={tab.id}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'bg-white text-gray-800 shadow-lg transform scale-105' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "schedule" && (
            <Section 
              title="Calendario de Clases" 
              rightContent={<Badge variant="info">Capacidad {CONFIG.CAPACITY} por clase</Badge>}
            >
              {user.role === 'user' && user.sessions <= 0 && (
                <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  ⚠️ No tienes sesiones disponibles. Contacta al administrador para adquirir un paquete.
                </div>
              )}
              <SlotsGrid 
                slots={slots} 
                bookings={bookings} 
                onBook={handleBooking} 
                currentUser={user} 
              />
            </Section>
          )}

          {activeTab === "bookings" && (
            <Section title="Tus Reservas">
              <BookingsList 
                user={user} 
                bookings={bookings} 
                allSlots={slots}
                onCancel={handleCancel} 
                onReschedule={handleReschedule} 
              />
            </Section>
          )}

          {activeTab === "attendance" && (user.role === 'instructor' || user.role === 'admin') && (
            <InstructorPanel 
              bookings={bookings} 
              users={users} 
              onRefresh={handleRefresh} 
            />
          )}

          {activeTab === "admin" && user.role === 'admin' && (
            <AdminPanel 
              users={users} 
              bookings={bookings} 
              onRefresh={handleRefresh} 
            />
          )}
        </div>

        {/* Footer */}
        <footer className="text-xs text-white/60 pt-6 text-center">
          <p>Demo del sistema de reservas • Para producción se requiere backend con base de datos y notificaciones por email</p>
        </footer>
      </div>
    </div>
  );
}

// ===== Inicializar la aplicación =====
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />); flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-semibold">{Utils.formatDate(Utils.parseLocalISO(booking.slotISO))}</div>
                    <div className="text-sm text-gray-600">{booking.user?.name || booking.userEmail}</div>
                    <Badge variant={
                      booking.status === "attended" ? "success" : 
                      booking.status === "missed" ? "danger" : "info"
                    }>
                      {TEXTS.STATUS[booking.status]}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      onClick={() => handleMarkAttendance(booking.id, "attended")}
                      variant="success"
                      size="small"
                    >
                      ✓ Asistió
                    </Button>
                    
                    <Button
                      onClick={() => handleMarkAttendance(booking.id, "missed")}
                      variant="danger" 
                      size="small"
                    >
                      ✗ Faltó
                    </Button>
                    
                    <select
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleReschedule(booking, e.target.value);
                        }
                      }}
                    >
                      <option value="">Reprogramar…</option>
                      {Utils.generateSlots().map(slot => (
                        <option key={slot} value={slot}>
                          {Utils.formatDate(Utils.parseLocalISO(slot))}
                        </option>
                      ))}
                    </select>
                    
                    <Button
                      onClick={() => handleCancel(booking)}
                      variant="secondary"
                      size="small"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Section>

      <Section 
        title="Usuarios Registrados" 
        rightContent={<Badge variant="info">{users.length} usuarios</Badge>}
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(user => (
            <div key={user.email} className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
              <div className="space-y-2">
                <div className="font-semibold text-gray-800">{user.name || user.email}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
                <div className="flex

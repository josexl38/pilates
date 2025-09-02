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
                <div className="flex flex-wrap items-center justify-between gap-4">
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

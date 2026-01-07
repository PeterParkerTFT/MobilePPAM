import React, { useState, useEffect } from 'react';
import { User, Turno } from '../types/models';
import { UserRole, EnumHelpers } from '../types/enums';
import { MoreVertical, Plus, X, Users, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { HeaderWithTheme } from '../components/HeaderWithTheme';
import { useThemeColors } from '../hooks/useThemeColors';
// import profilePlaceholder from 'figma:asset/116aa22720bf73cd0d1bc584769d9b781bd5c276.png';
import { useUser } from '../contexts/UserContext';
import { congregaciones } from '../data/congregaciones';

// const userService = new UserService(new MockUserRepository()); // Removed local instantiation

interface VoluntariosScreenProps {
  user: User;
  onLogout: () => void;
  onNavigateToInformes?: () => void;
  onRoleChange?: (userId: string, newRole: UserRole) => void;
  turnos?: Turno[]; // Opcional por ahora para compatibilidad, pero debería ser requerido
}

interface Voluntario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  ubicacion: string;
  role: UserRole;
  roleNumero: number;
  turnosAsignados: number;
  informeEnviado: boolean;
  capitanId?: string;
  foto?: string;
}

interface Capitan {
  id: string;
  nombre: string;
  voluntarios: Voluntario[];
}

// Eliminar mockVoluntarios antiguo
const mockVoluntarios: Voluntario[] = [];

type FilterType = 'all' | 'conAsignacion' | 'sinAsignacion' | 'sinInforme';

export function VoluntariosScreen({ user, onLogout, onNavigateToInformes, onRoleChange, turnos = [] }: VoluntariosScreenProps) {
  const { userService } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [expandedCapitanes, setExpandedCapitanes] = useState<Set<string>>(new Set());
  const [voluntariosDisponibles, setVoluntariosDisponibles] = useState<Voluntario[]>([]);
  const [loading, setLoading] = useState(true);
  const colors = useThemeColors();

  // Fetch users from UserService
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const users = await userService.searchUsers({}, user);

        // Transformar User -> Voluntario
        const mappedVoluntarios: Voluntario[] = users.map(u => {
          // Encontrar congregación
          const cong = congregaciones.find(c => c.id === u.congregacion);

          // Calcular turnos asignados
          const countTurnos = turnos.filter(t => t.voluntariosInscritos.includes(u.id)).length;

          return {
            id: u.id,
            nombre: u.nombre,
            email: u.email,
            telefono: u.telefono,
            ubicacion: cong ? cong.nombre : 'Sin asignación',
            role: u.role,
            roleNumero: 0, // Mock logic
            turnosAsignados: countTurnos,
            informeEnviado: Math.random() > 0.5, // Mock status
            capitanId: 'cap1', // Mock assignment
            foto: undefined
          };
        });

        setVoluntariosDisponibles(mappedVoluntarios);
      } catch (error) {
        console.error('Error fetching volunteers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, turnos]);

  // Solo admin y capitán pueden ver esta pantalla
  if (user.role === UserRole.Voluntario) {
    return (
      <div
        className="min-h-screen pb-24 flex items-center justify-center p-4 theme-transition"
        style={{ backgroundColor: `rgb(${colors.bg.primary})` }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="mb-2" style={{ color: `rgb(${colors.text.primary})` }}>Acceso Restringido</h2>
          <p style={{ color: `rgb(${colors.text.secondary})` }}>
            No tienes permisos para ver esta sección
          </p>
        </div>
      </div>
    );
  }

  // Si es capitán, filtrar solo SUS voluntarios (ya se hace en el useEffect si userService.searchUsers no lo hace, 
  // pero el servicio ya filtra por congregación. Aquí filtramos por "mi equipo" si aplica)
  // El userService.searchUsers ya maneja permisos básicos.
  // Aquí podemos refinar si es necesario.

  // Agrupar voluntarios por capitán (solo para admin)
  // NOTA: Esto usa lógica mock para agrupar, en real se usaría la relación en DB
  const capitanes: Capitan[] = [
    {
      id: 'cap1',
      nombre: 'Chelsea Maheda De Gonzalez',
      voluntarios: voluntariosDisponibles.filter(v => v.role === UserRole.Voluntario) // Mock grouping
    }
  ];

  // Filtrar voluntarios según el tipo de filtro
  const getFilteredVoluntarios = () => {
    let filtered = voluntariosDisponibles;

    switch (filterType) {
      case 'conAsignacion':
        filtered = filtered.filter(v => v.turnosAsignados > 0);
        break;
      case 'sinAsignacion':
        filtered = filtered.filter(v => v.turnosAsignados === 0);
        break;
      case 'sinInforme':
        filtered = filtered.filter(v => v.turnosAsignados > 0 && !v.informeEnviado);
        break;
      default:
        break;
    }

    if (searchTerm) {
      filtered = filtered.filter(v =>
        v.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredVoluntarios = getFilteredVoluntarios();

  const voluntariosConAsignacion = voluntariosDisponibles.filter(v => v.turnosAsignados > 0).length;
  const voluntariosSinAsignacion = voluntariosDisponibles.filter(v => v.turnosAsignados === 0).length;
  const voluntariosConAsignacionSinInfo = voluntariosDisponibles.filter(v => v.turnosAsignados > 0 && !v.informeEnviado).length;

  const getRoleLabel = (role: UserRole, numero: number) => {
    return EnumHelpers.getRoleLabel(role);
  };

  const handleAddVoluntario = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === confirmEmail && email.includes('@')) {
      // Aquí iría la lógica para agregar el voluntario
      setShowAddModal(false);
      setEmail('');
      setConfirmEmail('');
    }
  };

  const toggleCapitan = (capitanId: string) => {
    const newExpanded = new Set(expandedCapitanes);
    if (newExpanded.has(capitanId)) {
      newExpanded.delete(capitanId);
    } else {
      newExpanded.add(capitanId);
    }
    setExpandedCapitanes(newExpanded);
  };

  const getCapitanStats = (capitan: Capitan) => {
    const total = capitan.voluntarios.length;
    const conInforme = capitan.voluntarios.filter(v => v.informeEnviado).length;
    const sinInforme = capitan.voluntarios.filter(v => v.turnosAsignados > 0 && !v.informeEnviado).length;
    return { total, conInforme, sinInforme };
  };

  return (
    <div
      className="min-h-screen pb-24 theme-transition"
      style={{ backgroundColor: `rgb(${colors.bg.primary})` }}
    >
      {/* Header con Theme Toggle */}
      <HeaderWithTheme
        title="Voluntarios"
        showMenu={showMenu}
        onMenuToggle={() => setShowMenu(!showMenu)}
        user={user}
        onLogout={onLogout}
        onNavigateToInformes={onNavigateToInformes}
      />

      <div className="px-4 py-4">
        {/* Estadísticas con números en morado */}
        <div
          className="rounded-xl p-4 mb-4 shadow-md theme-transition"
          style={{
            backgroundColor: `rgb(${colors.bg.secondary})`,
            border: `1px solid rgb(${colors.ui.border})`
          }}
        >
          <div className="flex items-start gap-2 mb-2">
            <Users className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: `rgb(${colors.interactive.primary})` }} />
            <div className="flex-1">
              <span className="text-sm" style={{ color: `rgb(${colors.text.primary})` }}>
                Voluntarios con Asignaciones:{' '}
              </span>
              <span
                className="text-lg font-bold ml-1"
                style={{ color: `rgb(${colors.interactive.primary})` }}
              >
                {voluntariosConAsignacion}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 mb-2">
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: `rgb(${colors.text.tertiary})` }} />
            <div className="flex-1">
              <span className="text-sm" style={{ color: `rgb(${colors.text.primary})` }}>
                Voluntarios sin Asignaciones:{' '}
              </span>
              <span
                className="text-lg font-bold ml-1"
                style={{ color: `rgb(${colors.interactive.primary})` }}
              >
                {voluntariosSinAsignacion}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
            <div className="flex-1">
              <span className="text-sm" style={{ color: `rgb(${colors.text.primary})` }}>
                Voluntarios con Asignación que no han enviado informes:{' '}
              </span>
              <span
                className="text-lg font-bold ml-1"
                style={{ color: `rgb(${colors.interactive.primary})` }}
              >
                {voluntariosConAsignacionSinInfo}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de Filtro */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setFilterType('all')}
              className="px-3 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-medium"
              style={{
                backgroundColor: filterType === 'all'
                  ? `rgba(${colors.interactive.primary}, 0.15)`
                  : `rgb(${colors.bg.tertiary})`,
                border: filterType === 'all'
                  ? `2px solid rgb(${colors.interactive.primary})`
                  : `1px solid rgb(${colors.ui.border})`,
                color: filterType === 'all'
                  ? `rgb(${colors.interactive.primary})`
                  : `rgb(${colors.text.primary})`
              }}
            >
              <Users className="w-4 h-4" />
              Todos
            </button>

            <button
              onClick={() => setFilterType('conAsignacion')}
              className="px-3 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-medium"
              style={{
                backgroundColor: filterType === 'conAsignacion'
                  ? `rgba(${colors.interactive.primary}, 0.15)`
                  : `rgb(${colors.bg.tertiary})`,
                border: filterType === 'conAsignacion'
                  ? `2px solid rgb(${colors.interactive.primary})`
                  : `1px solid rgb(${colors.ui.border})`,
                color: filterType === 'conAsignacion'
                  ? `rgb(${colors.interactive.primary})`
                  : `rgb(${colors.text.primary})`
              }}
            >
              <CheckCircle className="w-4 h-4" />
              Con Asignación
            </button>

            <button
              onClick={() => setFilterType('sinAsignacion')}
              className="px-3 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-medium"
              style={{
                backgroundColor: filterType === 'sinAsignacion'
                  ? `rgba(${colors.interactive.primary}, 0.15)`
                  : `rgb(${colors.bg.tertiary})`,
                border: filterType === 'sinAsignacion'
                  ? `2px solid rgb(${colors.interactive.primary})`
                  : `1px solid rgb(${colors.ui.border})`,
                color: filterType === 'sinAsignacion'
                  ? `rgb(${colors.interactive.primary})`
                  : `rgb(${colors.text.primary})`
              }}
            >
              <XCircle className="w-4 h-4" />
              Sin Asignación
            </button>

            <button
              onClick={() => setFilterType('sinInforme')}
              className="px-3 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-medium"
              style={{
                backgroundColor: filterType === 'sinInforme'
                  ? `rgba(${colors.interactive.primary}, 0.15)`
                  : `rgb(${colors.bg.tertiary})`,
                border: filterType === 'sinInforme'
                  ? `2px solid rgb(${colors.interactive.primary})`
                  : `1px solid rgb(${colors.ui.border})`,
                color: filterType === 'sinInforme'
                  ? `rgb(${colors.interactive.primary})`
                  : `rgb(${colors.text.primary})`
              }}
            >
              <AlertTriangle className="w-4 h-4" />
              Sin Informe
            </button>
          </div>
        </div>

        {/* Header Voluntarios + Add Button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold" style={{ color: `rgb(${colors.text.primary})` }}>
            {filterType === 'all' && 'Todos los Voluntarios'}
            {filterType === 'conAsignacion' && 'Con Asignación'}
            {filterType === 'sinAsignacion' && 'Sin Asignación'}
            {filterType === 'sinInforme' && 'Pendientes de Informe'}
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:opacity-90 transition-opacity shadow-md"
            style={{ backgroundColor: `rgb(${colors.interactive.primary})` }}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buscar voluntario o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-4 py-3 rounded-lg text-sm outline-none theme-transition"
            style={{
              backgroundColor: `rgb(${colors.bg.tertiary})`,
              color: `rgb(${colors.text.primary})`,
              border: `1px solid rgb(${colors.ui.border})`
            }}
          />
        </div>

        {/* Vista Agrupada por Capitán (Solo Admin y Ultra Admin) */}
        {(EnumHelpers.isAdmin(user.role)) && filterType === 'all' && !searchTerm && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-sm" style={{ color: `rgb(${colors.text.secondary})` }}>
              Vista por Capitán
            </h3>
            <div className="space-y-3">
              {capitanes.map((capitan) => {
                const stats = getCapitanStats(capitan);
                const isExpanded = expandedCapitanes.has(capitan.id);

                return (
                  <div
                    key={capitan.id}
                    className="rounded-xl overflow-hidden shadow-md theme-transition"
                    style={{
                      backgroundColor: `rgb(${colors.bg.secondary})`,
                      border: `1px solid rgb(${colors.ui.border})`
                    }}
                  >
                    {/* Header del Capitán */}
                    <button
                      onClick={() => toggleCapitan(capitan.id)}
                      className="w-full p-4 flex items-center justify-between hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: `rgba(${colors.interactive.primary}, 0.08)` }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: `rgb(${colors.interactive.primary})` }}
                        >
                          {capitan.nombre.charAt(0)}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm" style={{ color: `rgb(${colors.text.primary})` }}>
                            {capitan.nombre}
                          </div>
                          <div className="text-xs" style={{ color: `rgb(${colors.text.secondary})` }}>
                            {stats.total} voluntarios · {stats.sinInforme} sin informe
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="text-lg font-bold"
                          style={{ color: `rgb(${colors.interactive.primary})` }}
                        >
                          {stats.sinInforme}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" style={{ color: `rgb(${colors.text.tertiary})` }} />
                        ) : (
                          <ChevronDown className="w-5 h-5" style={{ color: `rgb(${colors.text.tertiary})` }} />
                        )}
                      </div>
                    </button>

                    {/* Lista de Voluntarios del Capitán */}
                    {isExpanded && (
                      <div className="p-3 space-y-2">
                        {capitan.voluntarios.map((voluntario) => (
                          <div
                            key={voluntario.id}
                            className="rounded-lg p-3 flex items-center gap-3"
                            style={{
                              backgroundColor: `rgb(${colors.bg.tertiary})`,
                              border: `1px solid ${voluntario.turnosAsignados > 0 && !voluntario.informeEnviado ? '#f59e0b' : `rgb(${colors.ui.border})`}`
                            }}
                          >
                            <div className="w-8 h-8 flex-shrink-0">
                              <div
                                className="w-full h-full rounded-full flex items-center justify-center text-white text-xs font-medium"
                                style={{ backgroundColor: `rgb(${colors.interactive.primary})` }}
                              >
                                {voluntario.nombre.charAt(0)}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-xs" style={{ color: `rgb(${colors.text.primary})` }}>
                                {voluntario.nombre}
                              </div>
                              <div className="text-xs" style={{ color: `rgb(${colors.text.secondary})` }}>
                                {voluntario.turnosAsignados} turnos
                              </div>
                            </div>

                            {voluntario.turnosAsignados > 0 && (
                              <div>
                                {voluntario.informeEnviado ? (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lista de Voluntarios (Vista Normal o Filtrada) */}
        {(filterType !== 'all' || searchTerm || !EnumHelpers.isAdmin(user.role)) && (
          <div className="space-y-3">
            {filteredVoluntarios.map((voluntario) => (
              <div
                key={voluntario.id}
                className="rounded-lg p-3 flex items-center gap-3 shadow-sm theme-transition"
                style={{
                  backgroundColor: `rgb(${colors.bg.secondary})`,
                  border: `1px solid ${voluntario.turnosAsignados > 0 && !voluntario.informeEnviado ? '#f59e0b' : `rgb(${colors.ui.border})`}`
                }}
              >
                {/* Foto de perfil */}
                <div className="w-12 h-12 flex-shrink-0">
                  <div className="w-full h-full bg-gray-300 rounded-full overflow-hidden">
                    {voluntario.foto ? (
                      <img src={voluntario.foto} alt={voluntario.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-white text-lg font-medium"
                        style={{ backgroundColor: `rgb(${colors.interactive.primary})` }}
                      >
                        {voluntario.nombre.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs mb-0.5 uppercase tracking-wide font-semibold"
                    style={{ color: `rgb(${colors.interactive.primary})` }}
                  >
                    {voluntario.ubicacion}
                  </div>
                  <div
                    className="font-semibold text-sm mb-0.5"
                    style={{ color: `rgb(${colors.text.primary})` }}
                  >
                    {voluntario.nombre}
                  </div>
                  <div
                    className="text-xs flex items-center gap-2"
                    style={{ color: `rgb(${colors.text.secondary})` }}
                  >
                    <span>{getRoleLabel(voluntario.role, voluntario.roleNumero)}</span>
                    <span>·</span>
                    <span className="font-semibold" style={{ color: `rgb(${colors.interactive.primary})` }}>
                      {voluntario.turnosAsignados} turnos
                    </span>
                  </div>
                </div>

                {/* Indicador de informe */}
                {voluntario.turnosAsignados > 0 && (
                  <div className="flex-shrink-0">
                    {voluntario.informeEnviado ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-xs text-green-500 font-medium">Informe OK</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <span className="text-xs text-orange-500 font-medium">Sin informe</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Menu */}
                <button
                  className="p-2 hover:opacity-70 rounded-lg transition-opacity flex-shrink-0"
                  style={{ backgroundColor: `rgba(${colors.interactive.primary}, 0.1)` }}
                >
                  <MoreVertical
                    className="w-5 h-5"
                    style={{ color: `rgb(${colors.text.secondary})` }}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {filteredVoluntarios.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-3">👥</div>
            <p style={{ color: `rgb(${colors.text.secondary})` }}>No se encontraron voluntarios</p>
          </div>
        )}
      </div>

      {/* Modal Añadir Elemento */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div
            className="rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 theme-transition"
            style={{ backgroundColor: `rgb(${colors.bg.secondary})` }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: `rgb(${colors.ui.border})` }}
            >
              <h3
                className="font-semibold text-lg"
                style={{ color: `rgb(${colors.text.primary})` }}
              >
                Añadir elemento
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:opacity-70 rounded-full transition-opacity"
              >
                <X
                  className="w-5 h-5"
                  style={{ color: `rgb(${colors.text.secondary})` }}
                />
              </button>
            </div>

            <form onSubmit={handleAddVoluntario} className="p-4">
              {/* Advertencia */}
              <div
                className="rounded-lg p-4 mb-6 theme-transition"
                style={{ backgroundColor: `rgb(${colors.bg.tertiary})` }}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: `rgb(${colors.text.primary})` }}
                >
                  Si el correo esta mal, el usuario no podrá acceder en la app. Tómate el tiempo para escribirlo bien y confirmarlo con el voluntario
                </p>
              </div>

              {/* Correo Electrónico */}
              <div className="mb-4">
                <label
                  className="block font-medium mb-2 text-sm"
                  style={{ color: `rgb(${colors.text.primary})` }}
                >
                  Correo Electrónico
                  <span
                    className="text-xs ml-2"
                    style={{ color: `rgb(${colors.text.tertiary})` }}
                  >
                    Requerido
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-b outline-none theme-transition"
                    style={{
                      borderColor: `rgb(${colors.ui.border})`,
                      color: `rgb(${colors.text.primary})`,
                      backgroundColor: 'transparent'
                    }}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              {/* Repite el Correo */}
              <div className="mb-6">
                <label
                  className="block font-medium mb-2 text-sm"
                  style={{ color: `rgb(${colors.text.primary})` }}
                >
                  Repite el Correo
                  <span
                    className="text-xs ml-2"
                    style={{ color: `rgb(${colors.text.tertiary})` }}
                  >
                    Requerido
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    className="w-full px-4 py-3 border-b outline-none theme-transition"
                    style={{
                      borderColor: `rgb(${colors.ui.border})`,
                      color: `rgb(${colors.text.primary})`,
                      backgroundColor: 'transparent'
                    }}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border py-3 rounded-lg font-medium hover:opacity-90 transition-all theme-transition"
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: `rgb(${colors.ui.border})`,
                    color: `rgb(${colors.text.primary})`
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!email || !confirmEmail || email !== confirmEmail}
                  className="flex-1 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: `rgb(${colors.interactive.primary})` }}
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offline indicator - Removed for production polish until fully implemented with PWA */}
    </div>
  );
}
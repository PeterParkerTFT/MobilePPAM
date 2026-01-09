/**
 * AjustesScreen - Configuración del Sistema
 * @description Dos interfaces completamente distintas según el rol del usuario
 * 
 * - Admin Global: Panel de Control del Sistema (Gestión Macro)
 * - Otros roles: Mi Perfil Personal
 * 
 * @architecture SOLID - Single Responsibility + Open/Closed
 */

import React, { useState, useEffect } from 'react';
import { User } from '../types/models';
import { UserRole } from '../types/enums';
import {
  Camera,
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  Settings,
  Building,
  Users,
  LogOut,
  Edit2,
  Check,
  X,
  MapPin,
  Shield,
  UserCheck,
  AlertCircle,
  Warehouse,
  Navigation,
  Plus,
  Search
} from 'lucide-react';
import { HeaderWithTheme } from '../components/HeaderWithTheme';
import { useThemeColors } from '../hooks/useThemeColors';
import { congregaciones, getCongregacionNombre } from '../data/congregaciones';
// import jwLogo from 'figma:asset/424a964f516f725d66c9860b3a47b2b6be5d4747.png';

interface AjustesScreenProps {
  user: User;
  onLogout: () => void;
}

// Helper para compatibilidad con tipos legacy
const isGlobalAdmin = (role: string): boolean => {
  return role === 'ultraadmin' || role === 'ADMIN_GLOBAL';
};

const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    'voluntario': 'Voluntario',
    'VOLUNTARIO': 'Voluntario',
    'capitan': 'Capitán',
    'CAPITAN': 'Capitán',
    'admin': 'Administrador Local',
    'ADMIN_LOCAL': 'Administrador Local',
    'ultraadmin': 'Administrador Global',
    'ADMIN_GLOBAL': 'Administrador Global',
  };
  return labels[role] || 'Usuario';
};

// ==========================================
// VISTA A: Mi Perfil Personal
// ==========================================
import { useUser } from '../contexts/UserContext';
import { Loader2 } from 'lucide-react';

function MiPerfilView({ user, onLogout }: AjustesScreenProps) {
  const { userService, login } = useUser();
  const colors = useThemeColors();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [nombre, setNombre] = useState(user.nombre);
  const [telefono, setTelefono] = useState(user.telefono);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveName = async () => {
    if (!nombre.trim()) return;
    setIsSaving(true);
    try {
      const updatedUser = await userService.update(user.id, { nombre });
      login(updatedUser); // Update local state and storage
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Error al actualizar nombre. Intente de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePhone = async () => {
    if (!telefono.trim()) return;
    setIsSaving(true);
    try {
      const updatedUser = await userService.update(user.id, { telefono });
      login(updatedUser); // Update local state and storage
      setIsEditingPhone(false);
    } catch (error) {
      console.error('Error updating phone:', error);
      alert('Error al actualizar teléfono. Intente de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      {/* Avatar y Foto de Perfil */}
      <div className="mb-8">
        <div className="flex flex-col items-center mb-6">
          {/* Avatar grande */}
          <div className="relative mb-4">
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg"
              style={{ backgroundColor: '#594396' }}
            >
              {user.nombre.charAt(0).toUpperCase()}
            </div>

            {/* Botón de cámara */}
            <button
              className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 hover:scale-110 transition-transform"
              style={{ borderColor: '#594396' }}
            >
              <Camera className="w-5 h-5" style={{ color: '#594396' }} />
            </button>
          </div>

          {/* Nombre del usuario */}
          <h2
            className="text-2xl font-semibold mb-1"
            style={{ color: `rgb(${colors.text.primary})` }}
          >
            {user.nombre}
          </h2>
          <p
            className="text-sm"
            style={{ color: `rgb(${colors.text.secondary})` }}
          >
            {getRoleLabel(user.role)}
          </p>
        </div>

        {/* Sección de ayuda para foto */}
        <div
          className="rounded-xl p-4 mb-6"
          style={{
            backgroundColor: 'rgba(89, 67, 150, 0.05)',
            border: '1px solid rgba(89, 67, 150, 0.2)'
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(89, 67, 150, 0.1)' }}
              >
                <UserCheck className="w-5 h-5" style={{ color: '#594396' }} />
              </div>
            </div>
            <div className="flex-1">
              <h3
                className="font-semibold mb-1"
                style={{ color: '#594396' }}
              >
                Tu Foto de Perfil
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: `rgb(${colors.text.secondary})` }}
              >
                Esta imagen se usará en tus tarjetas de asignación. Te animamos a elegir una foto reciente con una sonrisa amable y la vestimenta que usas para las reuniones.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información Personal */}
      <div className="mb-6">
        <h3
          className="text-lg font-semibold mb-4 flex items-center gap-2"
          style={{ color: `rgb(${colors.text.primary})` }}
        >
          <UserIcon className="w-5 h-5" />
          Información Personal
        </h3>

        {/* Nombre */}
        <div
          className="rounded-xl p-4 mb-3"
          style={{
            backgroundColor: `rgb(${colors.bg.secondary})`,
            border: `1px solid rgb(${colors.ui.border})`
          }}
        >
          <label
            className="text-xs font-medium mb-2 block"
            style={{ color: `rgb(${colors.text.tertiary})` }}
          >
            Nombre Completo
          </label>
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={isSaving}
                  className="flex-1 px-3 py-2 rounded-lg border outline-none disabled:opacity-50"
                  style={{
                    borderColor: '#594396',
                    color: `rgb(${colors.text.primary})`,
                    backgroundColor: `rgb(${colors.bg.primary})`
                  }}
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={isSaving}
                  className="p-2 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: '#10b981', color: 'white' }}
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => {
                    setNombre(user.nombre);
                    setIsEditingName(false);
                  }}
                  disabled={isSaving}
                  className="p-2 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: '#ef4444', color: 'white' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <span
                  className="flex-1 font-medium"
                  style={{ color: `rgb(${colors.text.primary})` }}
                >
                  {user.nombre}
                </span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: `rgb(${colors.bg.tertiary})` }}
                >
                  <Edit2 className="w-4 h-4" style={{ color: '#594396' }} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Teléfono */}
        <div
          className="rounded-xl p-4 mb-3"
          style={{
            backgroundColor: `rgb(${colors.bg.secondary})`,
            border: `1px solid rgb(${colors.ui.border})`
          }}
        >
          <label
            className="text-xs font-medium mb-2 flex items-center gap-1"
            style={{ color: `rgb(${colors.text.tertiary})` }}
          >
            <Phone className="w-3 h-3" />
            Teléfono
          </label>
          <div className="flex items-center gap-2">
            {isEditingPhone ? (
              <>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  disabled={isSaving}
                  className="flex-1 px-3 py-2 rounded-lg border outline-none disabled:opacity-50"
                  style={{
                    borderColor: '#594396',
                    color: `rgb(${colors.text.primary})`,
                    backgroundColor: `rgb(${colors.bg.primary})`
                  }}
                  autoFocus
                />
                <button
                  onClick={handleSavePhone}
                  disabled={isSaving}
                  className="p-2 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: '#10b981', color: 'white' }}
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => {
                    setTelefono(user.telefono);
                    setIsEditingPhone(false);
                  }}
                  disabled={isSaving}
                  className="p-2 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: '#ef4444', color: 'white' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <span
                  className="flex-1 font-medium"
                  style={{ color: `rgb(${colors.text.primary})` }}
                >
                  {user.telefono}
                </span>
                <button
                  onClick={() => setIsEditingPhone(true)}
                  className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: `rgb(${colors.bg.tertiary})` }}
                >
                  <Edit2 className="w-4 h-4" style={{ color: '#594396' }} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Correo (Solo lectura) */}
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: `rgb(${colors.bg.secondary})`,
            border: `1px solid rgb(${colors.ui.border})`
          }}
        >
          <label
            className="text-xs font-medium mb-2 flex items-center gap-1"
            style={{ color: `rgb(${colors.text.tertiary})` }}
          >
            <Mail className="w-3 h-3" />
            Correo Electrónico
          </label>
          <div className="flex items-center gap-2">
            <span
              className="flex-1 font-medium"
              style={{ color: `rgb(${colors.text.primary})` }}
            >
              {user.email}
            </span>
            <span
              className="px-2 py-1 rounded text-xs"
              style={{
                backgroundColor: `rgb(${colors.bg.tertiary})`,
                color: `rgb(${colors.text.tertiary})`
              }}
            >
              Solo lectura
            </span>
          </div>
        </div>
      </div>

      {/* Tarjeta de Asignación */}
      <div className="mb-8">
        <h3
          className="text-lg font-semibold mb-4 flex items-center gap-2"
          style={{ color: `rgb(${colors.text.primary})` }}
        >
          <Building2 className="w-5 h-5" />
          Tu Asignación
        </h3>

        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: 'rgba(89, 67, 150, 0.05)',
            border: '2px solid rgba(89, 67, 150, 0.2)'
          }}
        >
          {/* Congregación - Solo si tiene una asignada */}
          {user.congregacion && (
            <div className="mb-4">
              <label
                className="text-xs font-medium mb-2 block"
                style={{ color: '#594396' }}
              >
                {user.role === UserRole.AdminGlobal ? 'Congregación de Origen' : 'Congregación'}
              </label>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" style={{ color: '#594396' }} />
                <span
                  className="font-semibold text-lg"
                  style={{ color: `rgb(${colors.text.primary})` }}
                >
                  {getCongregacionNombre(user.congregacion)}
                </span>
              </div>
              {user.role === UserRole.AdminGlobal && (
                <p
                  className="text-xs mt-1 italic"
                  style={{ color: `rgb(${colors.text.tertiary})` }}
                >
                  Acceso global a todas las congregaciones
                </p>
              )}
            </div>
          )}

          {/* Rol */}
          <div>
            <label
              className="text-xs font-medium mb-2 block"
              style={{ color: '#594396' }}
            >
              Rol en el Sistema
            </label>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: '#594396' }} />
              <span
                className="font-semibold text-lg"
                style={{ color: `rgb(${colors.text.primary})` }}
              >
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>

          {/* Nota */}
          <div
            className="mt-4 pt-4 text-xs italic flex items-start gap-2"
            style={{
              borderTop: '1px solid rgba(89, 67, 150, 0.2)',
              color: `rgb(${colors.text.secondary})`
            }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#594396' }} />
            <span>
              {user.congregacion
                ? 'Si necesitas cambiar tu congregación o rol, contacta a un administrador del sistema.'
                : 'Tienes acceso global a todas las congregaciones del sistema.'}
            </span>
          </div>
        </div>
      </div>

      {/* Botón de Cerrar Sesión */}
      <button
        onClick={onLogout}
        className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}
      >
        <LogOut className="w-5 h-5" />
        Cerrar Sesión
      </button>
    </div>
  );
}

// ==========================================
// VISTA B: Panel de Supervisión Global (Solo Ultra Admin)
// ==========================================
import { CongregacionService } from '../services/CongregacionService';
import { UserFilters, Congregacion, Sitio } from '../types/models';
import { UserStatus } from '../types/enums';
import { getEventColor } from '../constants/eventTypes';

type TabType = 'congregaciones' | 'sitios' | 'usuarios';

function PanelGlobalView({ user, onLogout }: AjustesScreenProps) {
  const { userService } = useUser();
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<TabType>('congregaciones');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const [isLoading, setIsLoading] = useState(false);
  const [usersData, setUsersData] = useState<User[]>([]);
  const [congregacionesData, setCongregacionesData] = useState<Congregacion[]>([]);
  const [sitiosData, setSitiosData] = useState<Sitio[]>([]);

  // Modal States
  const [showCongregacionModal, setShowCongregacionModal] = useState(false);
  const [editingCongregacion, setEditingCongregacion] = useState<Congregacion | null>(null);

  // User Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    role: UserRole.Voluntario,
    congregacion: '',
    status: UserStatus.Pendiente
  });
  const [congForm, setCongForm] = useState({ nombre: '', circuito: '', ciudad: '' });

  const [showSitioModal, setShowSitioModal] = useState(false);
  const [editingSitio, setEditingSitio] = useState<Sitio | null>(null);
  const [sitioForm, setSitioForm] = useState({
    nombre: '',
    direccion: '',
    tipo: 'Punto de Encuentro',
    congregacionId: '',
    lat: '',
    lng: '',
    eventType: 'expositores' // Default
  });

  // Saving State
  const [isSaving, setIsSaving] = useState(false);

  // Instance service (memoized or static)
  const congregacionService = new CongregacionService();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'congregaciones') {
        const data = await congregacionService.findAll();
        setCongregacionesData(data);
      } else if (activeTab === 'sitios') {
        const data = await congregacionService.getAllSitios();
        setSitiosData(data);
      } else if (activeTab === 'usuarios') {
        const data = await userService.searchUsers({}, user); // Fetch all users (Global Admin)
        setUsersData(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar usuarios
  const usuariosFiltrados = usersData.filter(u => {
    const matchSearch = u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const getRoleIcon = (role: UserRole) => {
    if (role === UserRole.AdminLocal || role === UserRole.AdminGlobal) return <Shield className="w-4 h-4" />;
    if (role === UserRole.Capitan) return <UserCheck className="w-4 h-4" />;
    return <UserIcon className="w-4 h-4" />;
  };

  const getRoleColor = (role: UserRole) => {
    if (role === UserRole.AdminLocal || role === UserRole.AdminGlobal) return '#594396';
    if (role === UserRole.Capitan) return '#2563eb';
    return '#059669';
  };

  // HANDLERS
  const handleEditCongregacion = (cong: Congregacion) => {
    setEditingCongregacion(cong);
    setCongForm({ nombre: cong.nombre, circuito: cong.circuito || '', ciudad: cong.ciudad || '' });
    setShowCongregacionModal(true);
  };

  const handleCreateCongregacion = () => {
    setEditingCongregacion(null);
    setCongForm({ nombre: '', circuito: '', ciudad: '' });
    setShowCongregacionModal(true);
  };

  const handleSaveCongregacion = async () => {
    if (!congForm.nombre || !congForm.circuito || !congForm.ciudad) return alert('Todos los campos son obligatorios');
    setIsSaving(true);
    try {
      if (editingCongregacion) {
        await congregacionService.update(editingCongregacion.id, congForm);
      } else {
        await congregacionService.create({ ...congForm, estado: 'NL' });
      }
      await loadData();
      setShowCongregacionModal(false);
    } catch (error) {
      console.error(error);
      alert('Error al guardar congregación');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSitio = (sitio: Sitio) => {
    setEditingSitio(sitio);
    setSitioForm({
      nombre: sitio.nombre,
      direccion: sitio.direccion || '',
      tipo: sitio.tipo,
      congregacionId: sitio.congregacionId || '',
      lat: sitio.coordenadas?.lat.toString() || '0',
      lng: sitio.coordenadas?.lng.toString() || '0',
      eventType: sitio.eventType || 'expositores'
    });
    setShowSitioModal(true);
  };

  const handleCreateSitio = () => {
    setEditingSitio(null);
    setSitioForm({
      nombre: '',
      direccion: '',
      tipo: 'Punto de Encuentro',
      congregacionId: congregacionesData[0]?.id || '',
      lat: '0',
      lng: '0',
      eventType: 'expositores'
    });
    setShowSitioModal(true);
  };

  const handleSaveSitio = async () => {
    if (!sitioForm.nombre) return alert('El nombre es obligatorio');
    setIsSaving(true);
    try {
      const payload: any = {
        nombre: sitioForm.nombre,
        direccion: sitioForm.direccion,
        tipo: sitioForm.tipo,
        congregacionId: sitioForm.congregacionId,
        coordenadas: {
          lat: parseFloat(sitioForm.lat || '0'),
          lng: parseFloat(sitioForm.lng || '0')
        },
        eventType: sitioForm.eventType // [FIX] Use camelCase 'eventType' to match Sitio model, Service maps it to 'event_type'
      };

      if (editingSitio) {
        await congregacionService.updateSitio(editingSitio.id, payload);
      } else {
        await congregacionService.createSitio(payload);
      }
      await loadData();
      setShowSitioModal(false);
    } catch (error) {
      console.error(error);
      alert('Error al guardar sitio');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      role: user.role,
      congregacion: user.congregacion || '',
      status: user.status
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      await userService.update(editingUser.id, userForm);
      await loadData();
      setShowUserModal(false);
    } catch (error) {
      console.error(error);
      alert('Error al actualizar usuario');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      {/* Header del Panel */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#594396' }}
            >
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1
                className="text-xl md:text-2xl font-bold"
                style={{ color: `rgb(${colors.text.primary})` }}
              >
                Panel de Supervisión Global
              </h1>
              <p
                className="text-xs md:text-sm"
                style={{ color: `rgb(${colors.text.secondary})` }}
              >
                Gestión de infraestructura del sistema PPAM
              </p>
            </div>
          </div>

          {/* Badge de Admin Global */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium self-start md:self-center"
            style={{
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              color: '#dc2626'
            }}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Administrador Global</span>
            <span className="sm:hidden">Admin Global</span>
          </div>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          <button
            onClick={() => setActiveTab('congregaciones')}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap"
            style={{
              backgroundColor: activeTab === 'congregaciones' ? '#594396' : `rgb(${colors.bg.secondary})`,
              color: activeTab === 'congregaciones' ? 'white' : `rgb(${colors.text.primary})`,
              border: activeTab === 'congregaciones' ? 'none' : `1px solid rgb(${colors.ui.border})`
            }}
          >
            <Building className="w-4 h-4" />
            Congregaciones
          </button>
          <button
            onClick={() => setActiveTab('sitios')}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap"
            style={{
              backgroundColor: activeTab === 'sitios' ? '#594396' : `rgb(${colors.bg.secondary})`,
              color: activeTab === 'sitios' ? 'white' : `rgb(${colors.text.primary})`,
              border: activeTab === 'sitios' ? 'none' : `1px solid rgb(${colors.ui.border})`
            }}
          >
            <Navigation className="w-4 h-4" />
            Sitios / Puntos
          </button>
          <button
            onClick={() => setActiveTab('usuarios')}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap"
            style={{
              backgroundColor: activeTab === 'usuarios' ? '#594396' : `rgb(${colors.bg.secondary})`,
              color: activeTab === 'usuarios' ? 'white' : `rgb(${colors.text.primary})`,
              border: activeTab === 'usuarios' ? 'none' : `1px solid rgb(${colors.ui.border})`
            }}
          >
            <Users className="w-4 h-4" />
            Usuarios
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mb-8">

        {isLoading && (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#594396]" />
          </div>
        )}

        {!isLoading && activeTab === 'congregaciones' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2" style={{ color: `rgb(${colors.text.primary})` }}>
                <Building className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#594396' }} />
                Congregaciones
              </h2>
              <button
                onClick={handleCreateCongregacion}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#594396' }}
              >
                <Plus className="w-4 h-4" />
                Nueva Congregación
              </button>
            </div>

            <div className="space-y-2">
              {congregacionesData.map((cong) => (
                <div key={cong.id} className="p-4 rounded-xl flex justify-between items-center" style={{ backgroundColor: `rgb(${colors.bg.secondary})`, border: `1px solid rgb(${colors.ui.border})` }}>
                  <div>
                    <h3 className="font-bold" style={{ color: `rgb(${colors.text.primary})` }}>{cong.nombre}</h3>
                    <p className="text-sm" style={{ color: `rgb(${colors.text.secondary})` }}>Circuito {cong.circuito}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm opacity-70 hidden sm:block">{cong.ciudad}</div>
                    <button
                      onClick={() => handleEditCongregacion(cong)}
                      className="p-2 rounded-full hover:bg-black/5"
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {congregacionesData.length === 0 && <p className="text-center py-8 opacity-50">No hay congregaciones registradas.</p>}
          </div>
        )}

        {!isLoading && activeTab === 'sitios' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2" style={{ color: `rgb(${colors.text.primary})` }}>
                <Navigation className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#594396' }} />
                Sitios y Puntos
              </h2>
              <button
                onClick={handleCreateSitio}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#594396' }}
              >
                <Plus className="w-4 h-4" />
                Nuevo Sitio
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {sitiosData.map((sitio) => (
                <div key={sitio.id} className="p-4 rounded-xl relative group" style={{ backgroundColor: `rgb(${colors.bg.secondary})`, border: `1px solid rgb(${colors.ui.border})` }}>
                  <div className="flex items-start gap-3">
                    <Navigation className="w-5 h-5 mt-1" style={{ color: '#594396' }} />
                    <div className="flex-1">
                      <h3 className="font-bold" style={{ color: `rgb(${colors.text.primary})` }}>{sitio.nombre}</h3>
                      <p className="text-sm mb-1" style={{ color: `rgb(${colors.text.secondary})` }}>{sitio.direccion}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 uppercase">
                        {sitio.tipo}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditSitio(sitio)}
                    className="absolute top-2 right-2 p-2 rounded-full hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
            {sitiosData.length === 0 && <p className="text-center py-8 opacity-50">No hay sitios registrados.</p>}
          </div>
        )}

        {!isLoading && activeTab === 'usuarios' && (
          <div>
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 mb-4" style={{ color: `rgb(${colors.text.primary})` }}>
              <Users className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#594396' }} />
              Usuarios ({usuariosFiltrados.length})
            </h2>

            {/* Role Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button onClick={() => setRoleFilter('all')} className={`px-3 py-1.5 rounded-lg text-sm border ${roleFilter === 'all' ? 'bg-[#594396] text-white border-transparent' : 'border-gray-200'}`}>Todos</button>
              <button onClick={() => setRoleFilter(UserRole.AdminLocal)} className={`px-3 py-1.5 rounded-lg text-sm border ${roleFilter === UserRole.AdminLocal ? 'bg-[#594396] text-white border-transparent' : 'border-gray-200'}`}>Admins</button>
              <button onClick={() => setRoleFilter(UserRole.Capitan)} className={`px-3 py-1.5 rounded-lg text-sm border ${roleFilter === UserRole.Capitan ? 'bg-[#594396] text-white border-transparent' : 'border-gray-200'}`}>Capitanes</button>
              <button onClick={() => setRoleFilter(UserRole.Voluntario)} className={`px-3 py-1.5 rounded-lg text-sm border ${roleFilter === UserRole.Voluntario ? 'bg-[#594396] text-white border-transparent' : 'border-gray-200'}`}>Voluntarios</button>
            </div>

            {/* Search */}
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none text-sm"
                style={{ backgroundColor: `rgb(${colors.bg.secondary})`, borderColor: `rgb(${colors.ui.border})`, color: `rgb(${colors.text.primary})` }}
              />
            </div>

            <div className="space-y-3">
              {usuariosFiltrados.map((u) => (
                <div key={u.id} className="p-4 rounded-xl" style={{ backgroundColor: `rgb(${colors.bg.secondary})`, border: `1px solid rgb(${colors.ui.border})`, opacity: u.status === UserStatus.Rechazado ? 0.5 : 1 }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: getRoleColor(u.role) }}>
                      {u.nombre.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm" style={{ color: `rgb(${colors.text.primary})` }}>{u.nombre}</h3>
                      <div className="text-xs text-gray-500">{u.email}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: `${getRoleColor(u.role)}20`, color: getRoleColor(u.role) }}>
                          {getRoleIcon(u.role)}
                          {getRoleLabel(u.role)}
                        </span>
                        <span className="text-xs text-gray-400">{getCongregacionNombre(u.congregacion)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEditUser(u)}
                      className="p-2 rounded-full hover:bg-black/5"
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Botón de Cerrar Sesión */}
      <button
        onClick={onLogout}
        className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}
      >
        <LogOut className="w-5 h-5" />
        Cerrar Sesión
      </button>

      {/* Congragación Modal */}
      {showCongregacionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4 text-[#594396]">{editingCongregacion ? 'Editar Congregación' : 'Nueva Congregación'}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Nombre</label>
                <input
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#594396] focus:border-transparent outline-none transition-all"
                  placeholder="Ej. Central"
                  value={congForm.nombre}
                  onChange={e => setCongForm({ ...congForm, nombre: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Circuito</label>
                <input
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#594396] focus:border-transparent outline-none transition-all"
                  placeholder="Ej. 01"
                  value={congForm.circuito}
                  onChange={e => setCongForm({ ...congForm, circuito: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Ciudad</label>
                <input
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#594396] focus:border-transparent outline-none transition-all"
                  placeholder="Ej. Monterrey"
                  value={congForm.ciudad}
                  onChange={e => setCongForm({ ...congForm, ciudad: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowCongregacionModal(false)} className="flex-1 p-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
              <button
                onClick={handleSaveCongregacion}
                disabled={isSaving}
                className="flex-1 p-2.5 bg-[#594396] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sitio Modal */}
      {showSitioModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4 text-[#594396]">{editingSitio ? 'Editar Sitio' : 'Nuevo Sitio'}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Nombre</label>
                <input
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#594396] focus:border-transparent outline-none transition-all"
                  placeholder="Nombre del Sitio"
                  value={sitioForm.nombre}
                  onChange={e => setSitioForm({ ...sitioForm, nombre: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Dirección (Opcional)</label>
                <input
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#594396] focus:border-transparent outline-none transition-all"
                  placeholder="Dirección completa"
                  value={sitioForm.direccion}
                  onChange={e => setSitioForm({ ...sitioForm, direccion: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Lugar (Físico)
                  </label>
                  <select
                    value={sitioForm.tipo}
                    onChange={(e) => setSitioForm({ ...sitioForm, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#594396] outline-none bg-white"
                  >
                    <option value="Punto de Encuentro">Punto de Encuentro Público</option>
                    <option value="Cartelera">Cartelera / Exhibidor</option>
                    <option value="Casa Particular">Casa Particular</option>
                    <option value="Salón">Salón / Auditorio</option>
                    <option value="Otro">Otro</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Describe la estructura física del lugar.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type (Categoría del Sitio)
                  </label>
                  <select
                    value={sitioForm.eventType || ''}
                    onChange={(e) => setSitioForm({ ...sitioForm, eventType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#594396] outline-none bg-white"
                    required
                  >
                    <option value="" disabled>Selecciona un tipo de evento...</option>
                    {eventTypes.map((et) => (
                      <option key={et.id} value={et.id}>
                        {et.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-brand-purple mt-1 font-medium">Define en qué mapa aparece este sitio.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Congregación (Opcional)</label>
                  <select
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#594396] focus:border-transparent outline-none transition-all bg-white"
                    value={sitioForm.congregacionId}
                    onChange={e => setSitioForm({ ...sitioForm, congregacionId: e.target.value })}
                  >
                    <option value="">-- Sin Asignación / Global --</option>
                    {congregacionesData.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Latitud</label>
                  <input
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#594396] focus:border-transparent outline-none transition-all"
                    placeholder="0.0000"
                    type="number"
                    step="any"
                    value={sitioForm.lat}
                    onChange={e => setSitioForm({ ...sitioForm, lat: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Longitud</label>
                  <input
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#594396] focus:border-transparent outline-none transition-all"
                    placeholder="0.0000"
                    type="number"
                    step="any"
                    value={sitioForm.lng}
                    onChange={e => setSitioForm({ ...sitioForm, lng: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowSitioModal(false)} className="flex-1 p-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
              <button
                onClick={handleSaveSitio}
                disabled={isSaving}
                className="flex-1 p-2.5 bg-[#594396] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )
      }

      {/* User Modal */}
      {
        showUserModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-bold mb-4 text-[#594396]">Editar Usuario</h3>
              {editingUser && (
                <p className="text-sm text-gray-500 mb-4">Editando a: <span className="font-semibold">{editingUser.nombre}</span></p>
              )}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Rol</label>
                  <select
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#594396] focus:border-transparent outline-none transition-all bg-white"
                    value={userForm.role}
                    onChange={e => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                  >
                    <option value={UserRole.Voluntario}>Voluntario</option>
                    <option value={UserRole.Capitan}>Capitán</option>
                    <option value={UserRole.AdminLocal}>Admin Local</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Congregación</label>
                  <select
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#594396] focus:border-transparent outline-none transition-all bg-white"
                    value={userForm.congregacion}
                    onChange={e => setUserForm({ ...userForm, congregacion: e.target.value })}
                  >
                    <option value="">Sin Asignación</option>
                    {congregacionesData.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Estado</label>
                  <select
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#594396] focus:border-transparent outline-none transition-all bg-white"
                    value={userForm.status}
                    onChange={e => setUserForm({ ...userForm, status: e.target.value as UserStatus })}
                  >
                    <option value={UserStatus.Pendiente}>Pendiente</option>
                    <option value={UserStatus.Aprobado}>Aprobado</option>
                    <option value={UserStatus.Rechazado}>Rechazado</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setShowUserModal(false)} className="flex-1 p-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
                <button
                  onClick={handleSaveUser}
                  disabled={isSaving}
                  className="flex-1 p-2.5 bg-[#594396] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

// ==========================================
// COMPONENTE PRINCIPAL CON LÓGICA CONDICIONAL
// ==========================================

export function AjustesScreen({ user, onLogout }: AjustesScreenProps) {
  const [showMenu, setShowMenu] = useState(false);
  const colors = useThemeColors();

  // Determinar qué vista mostrar según el rol
  const showGlobalPanel = isGlobalAdmin(user.role);

  return (
    <div
      className="min-h-screen pb-24 theme-transition"
      style={{ backgroundColor: `rgb(${colors.bg.primary})` }}
    >
      {/* Header */}
      <HeaderWithTheme
        title={showGlobalPanel ? "Supervisión Global" : "Mi Perfil"}
        showMenu={showMenu}
        onMenuToggle={() => setShowMenu(!showMenu)}
        user={user}
        onLogout={onLogout}
      />

      {/* Renderizado condicional según rol */}
      {showGlobalPanel ? (
        <PanelGlobalView user={user} onLogout={onLogout} />
      ) : (
        <MiPerfilView user={user} onLogout={onLogout} />
      )}
    </div>
  );
}

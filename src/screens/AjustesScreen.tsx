/**
 * AjustesScreen - Configuración del Sistema
 * @description Dos interfaces completamente distintas según el rol del usuario
 * 
 * - Admin Global: Panel de Control del Sistema (Gestión Macro)
 * - Otros roles: Mi Perfil Personal
 * 
 * @architecture SOLID - Single Responsibility + Open/Closed
 */

import React, { useState } from 'react';
import { User } from '../types/models';
import { 
  Camera, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Church, 
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
import jwLogo from 'figma:asset/424a964f516f725d66c9860b3a47b2b6be5d4747.png';

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

function MiPerfilView({ user, onLogout }: AjustesScreenProps) {
  const colors = useThemeColors();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [nombre, setNombre] = useState(user.nombre);
  const [telefono, setTelefono] = useState(user.telefono);

  const handleSaveName = () => {
    // TODO: Guardar en BD
    setIsEditingName(false);
  };

  const handleSavePhone = () => {
    // TODO: Guardar en BD
    setIsEditingPhone(false);
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
                  className="flex-1 px-3 py-2 rounded-lg border outline-none"
                  style={{ 
                    borderColor: '#594396',
                    color: `rgb(${colors.text.primary})`,
                    backgroundColor: `rgb(${colors.bg.primary})`
                  }}
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: '#10b981', color: 'white' }}
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setNombre(user.nombre);
                    setIsEditingName(false);
                  }}
                  className="p-2 rounded-lg hover:opacity-80 transition-opacity"
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
                  {nombre}
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
                  className="flex-1 px-3 py-2 rounded-lg border outline-none"
                  style={{ 
                    borderColor: '#594396',
                    color: `rgb(${colors.text.primary})`,
                    backgroundColor: `rgb(${colors.bg.primary})`
                  }}
                  autoFocus
                />
                <button
                  onClick={handleSavePhone}
                  className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: '#10b981', color: 'white' }}
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setTelefono(user.telefono);
                    setIsEditingPhone(false);
                  }}
                  className="p-2 rounded-lg hover:opacity-80 transition-opacity"
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
                  {telefono}
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
          <Church className="w-5 h-5" />
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
                {user.role === 'ultraadmin' ? 'Congregación de Origen' : 'Congregación'}
              </label>
              <div className="flex items-center gap-2">
                <Church className="w-5 h-5" style={{ color: '#594396' }} />
                <span 
                  className="font-semibold text-lg"
                  style={{ color: `rgb(${colors.text.primary})` }}
                >
                  {getCongregacionNombre(user.congregacion)}
                </span>
              </div>
              {user.role === 'ultraadmin' && (
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

// Tipos para el panel
interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  congregacion: string;
  role: 'admin' | 'capitan' | 'voluntario';
  activo: boolean;
  fechaAlta: string;
}

interface Ubicacion {
  id: string;
  nombre: string;
  direccion: string;
  tipo: 'bodega' | 'punto_encuentro';
  foto?: string;
  latitud?: number;
  longitud?: number;
}

type TabType = 'congregaciones' | 'ubicaciones' | 'puntos_encuentro' | 'usuarios';

function PanelGlobalView({ user, onLogout }: AjustesScreenProps) {
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<TabType>('congregaciones');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'capitan' | 'voluntario'>('all');

  // Mock de usuarios del sistema
  const [usuarios] = useState<Usuario[]>([
    {
      id: 'admin-1',
      nombre: 'Elder García López',
      email: 'elder.garcia@ejemplo.com',
      telefono: '+52 555 000 0001',
      congregacion: 'cong-001',
      role: 'admin',
      activo: true,
      fechaAlta: '2024-12-01'
    },
    {
      id: 'admin-2',
      nombre: 'Elder Martínez',
      email: 'elder.martinez@ejemplo.com',
      telefono: '+52 555 000 0002',
      congregacion: 'cong-002',
      role: 'admin',
      activo: true,
      fechaAlta: '2024-12-05'
    },
    {
      id: 'cap-1',
      nombre: 'Chelsea Maheda De Gonzalez',
      email: 'chelsea@ejemplo.com',
      telefono: '+52 555 345 6789',
      congregacion: 'cong-001',
      role: 'capitan',
      activo: true,
      fechaAlta: '2024-11-20'
    },
    {
      id: 'vol-1',
      nombre: 'Aranza Jiménez',
      email: 'aranza@ejemplo.com',
      telefono: '+52 555 456 7890',
      congregacion: 'cong-001',
      role: 'voluntario',
      activo: true,
      fechaAlta: '2024-12-10'
    },
  ]);

  // Mock de ubicaciones
  const [ubicaciones] = useState<Ubicacion[]>([
    {
      id: 'bod-1',
      nombre: 'Bodega Central Guadalajara',
      direccion: 'Av. López Mateos 2375, Guadalajara, Jalisco',
      tipo: 'bodega'
    },
    {
      id: 'bod-2',
      nombre: 'Bodega Zapopan Norte',
      direccion: 'Calle Tesistán 450, Zapopan, Jalisco',
      tipo: 'bodega'
    },
  ]);

  // Mock de puntos de encuentro
  const [puntosEncuentro] = useState<Ubicacion[]>([
    {
      id: 'pe-1',
      nombre: 'Plaza del Sol - Entrada Sur',
      direccion: 'Av. López Mateos Sur 2077, Guadalajara',
      tipo: 'punto_encuentro',
      foto: undefined
    },
    {
      id: 'pe-2',
      nombre: 'Parque Metropolitano',
      direccion: 'Av. Mariano Otero, Zapopan',
      tipo: 'punto_encuentro',
      foto: undefined
    },
  ]);

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchSearch = usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       usuario.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || usuario.role === roleFilter;
    return matchSearch && matchRole;
  });

  const getRoleIcon = (role: string) => {
    if (role === 'admin') return <Shield className="w-4 h-4" />;
    if (role === 'capitan') return <UserCheck className="w-4 h-4" />;
    return <UserIcon className="w-4 h-4" />;
  };

  const getRoleLabel = (role: string) => {
    if (role === 'admin') return 'Administrador';
    if (role === 'capitan') return 'Capitán';
    return 'Voluntario';
  };

  const getRoleColor = (role: string) => {
    if (role === 'admin') return '#594396';
    if (role === 'capitan') return '#2563eb';
    return '#059669';
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
            onClick={() => setActiveTab('ubicaciones')}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap"
            style={{
              backgroundColor: activeTab === 'ubicaciones' ? '#594396' : `rgb(${colors.bg.secondary})`,
              color: activeTab === 'ubicaciones' ? 'white' : `rgb(${colors.text.primary})`,
              border: activeTab === 'ubicaciones' ? 'none' : `1px solid rgb(${colors.ui.border})`
            }}
          >
            <Warehouse className="w-4 h-4" />
            Bodegas
          </button>
          <button
            onClick={() => setActiveTab('puntos_encuentro')}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap"
            style={{
              backgroundColor: activeTab === 'puntos_encuentro' ? '#594396' : `rgb(${colors.bg.secondary})`,
              color: activeTab === 'puntos_encuentro' ? 'white' : `rgb(${colors.text.primary})`,
              border: activeTab === 'puntos_encuentro' ? 'none' : `1px solid rgb(${colors.ui.border})`
            }}
          >
            <Navigation className="w-4 h-4" />
            <span className="hidden sm:inline">Puntos de Encuentro</span>
            <span className="sm:hidden">Encuentros</span>
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

      {/* Contenido según Tab Activo */}
      <div className="mb-8">
        {/* TAB: Congregaciones */}
        {activeTab === 'congregaciones' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 
                className="text-lg md:text-xl font-bold flex items-center gap-2"
                style={{ color: `rgb(${colors.text.primary})` }}
              >
                <Building className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#594396' }} />
                Congregaciones
              </h2>
              <button
                className="px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 text-sm"
                style={{ backgroundColor: '#594396', color: 'white' }}
              >
                <Plus className="w-4 h-4" />
                Agregar Congregación
              </button>
            </div>

            {/* Tabla responsive de congregaciones */}
            <div 
              className="rounded-xl overflow-hidden"
              style={{ 
                backgroundColor: `rgb(${colors.bg.secondary})`,
                border: `1px solid rgb(${colors.ui.border})`
              }}
            >
              {/* Header de tabla - solo visible en desktop */}
              <div 
                className="hidden md:grid grid-cols-3 gap-4 px-4 py-3 text-xs font-semibold"
                style={{ 
                  backgroundColor: `rgb(${colors.bg.tertiary})`,
                  color: `rgb(${colors.text.tertiary})`
                }}
              >
                <div>CONGREGACIÓN</div>
                <div>CIRCUITO</div>
                <div className="text-right">ACCIONES</div>
              </div>

              {/* Filas responsive */}
              {congregaciones.map((cong, index) => (
                <div 
                  key={cong.id}
                  className="px-4 py-4"
                  style={{ 
                    borderTop: index > 0 ? `1px solid rgb(${colors.ui.divider})` : 'none'
                  }}
                >
                  {/* Vista Desktop */}
                  <div className="hidden md:grid grid-cols-3 gap-4 items-center">
                    <div className="flex items-center gap-3">
                      <img 
                        src={jwLogo} 
                        alt="Kingdom Hall" 
                        className="w-10 h-10 object-contain flex-shrink-0"
                      />
                      <span 
                        className="font-medium"
                        style={{ color: `rgb(${colors.text.primary})` }}
                      >
                        {cong.nombre}
                      </span>
                    </div>
                    <div 
                      className="font-semibold"
                      style={{ color: '#594396' }}
                    >
                      Circuito {cong.circuito}
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: `rgb(${colors.bg.tertiary})` }}
                      >
                        <Edit2 className="w-4 h-4" style={{ color: '#594396' }} />
                      </button>
                    </div>
                  </div>

                  {/* Vista Mobile */}
                  <div className="md:hidden flex items-start gap-3">
                    <img 
                      src={jwLogo} 
                      alt="Kingdom Hall" 
                      className="w-12 h-12 object-contain flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span 
                          className="font-medium"
                          style={{ color: `rgb(${colors.text.primary})` }}
                        >
                          {cong.nombre}
                        </span>
                        <button
                          className="p-1.5 rounded-lg hover:opacity-80 transition-opacity flex-shrink-0"
                          style={{ backgroundColor: `rgb(${colors.bg.tertiary})` }}
                        >
                          <Edit2 className="w-3.5 h-3.5" style={{ color: '#594396' }} />
                        </button>
                      </div>
                      <div 
                        className="text-sm font-semibold"
                        style={{ color: '#594396' }}
                      >
                        Circuito {cong.circuito}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div 
              className="mt-2 text-xs flex items-center gap-1"
              style={{ color: `rgb(${colors.text.tertiary})` }}
            >
              <AlertCircle className="w-3 h-3" />
              Total: {congregaciones.length} congregaciones registradas
            </div>
          </div>
        )}

        {/* TAB: Bodegas */}
        {activeTab === 'ubicaciones' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 
                className="text-lg md:text-xl font-bold flex items-center gap-2"
                style={{ color: `rgb(${colors.text.primary})` }}
              >
                <Warehouse className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#594396' }} />
                Bodegas
              </h2>
              <button
                className="px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 text-sm"
                style={{ backgroundColor: '#594396', color: 'white' }}
              >
                <Plus className="w-4 h-4" />
                Agregar Bodega
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {ubicaciones.map((ubicacion) => (
                <div
                  key={ubicacion.id}
                  className="rounded-xl p-4"
                  style={{ 
                    backgroundColor: `rgb(${colors.bg.secondary})`,
                    border: `1px solid rgb(${colors.ui.border})`
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'rgba(89, 67, 150, 0.1)' }}
                      >
                        <Warehouse className="w-6 h-6" style={{ color: '#594396' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="font-semibold mb-1"
                          style={{ color: `rgb(${colors.text.primary})` }}
                        >
                          {ubicacion.nombre}
                        </h3>
                        <p 
                          className="text-sm"
                          style={{ color: `rgb(${colors.text.secondary})` }}
                        >
                          {ubicacion.direccion}
                        </p>
                      </div>
                    </div>
                    <button
                      className="p-2 rounded-lg hover:opacity-80 transition-opacity flex-shrink-0"
                      style={{ backgroundColor: `rgb(${colors.bg.tertiary})` }}
                    >
                      <Edit2 className="w-4 h-4" style={{ color: '#594396' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Puntos de Encuentro */}
        {activeTab === 'puntos_encuentro' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 
                className="text-lg md:text-xl font-bold flex items-center gap-2"
                style={{ color: `rgb(${colors.text.primary})` }}
              >
                <Navigation className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#594396' }} />
                Puntos de Encuentro
              </h2>
              <button
                className="px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 text-sm"
                style={{ backgroundColor: '#594396', color: 'white' }}
              >
                <Plus className="w-4 h-4" />
                Agregar Punto
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {puntosEncuentro.map((punto) => (
                <div
                  key={punto.id}
                  className="rounded-xl p-4"
                  style={{ 
                    backgroundColor: `rgb(${colors.bg.secondary})`,
                    border: `1px solid rgb(${colors.ui.border})`
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'rgba(89, 67, 150, 0.1)' }}
                      >
                        <Navigation className="w-6 h-6" style={{ color: '#594396' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="font-semibold mb-1"
                          style={{ color: `rgb(${colors.text.primary})` }}
                        >
                          {punto.nombre}
                        </h3>
                        <p 
                          className="text-sm mb-2"
                          style={{ color: `rgb(${colors.text.secondary})` }}
                        >
                          {punto.direccion}
                        </p>
                        {punto.foto ? (
                          <div 
                            className="text-xs flex items-center gap-1"
                            style={{ color: '#10b981' }}
                          >
                            <Check className="w-3 h-3" />
                            Foto disponible
                          </div>
                        ) : (
                          <div 
                            className="text-xs flex items-center gap-1"
                            style={{ color: `rgb(${colors.text.tertiary})` }}
                          >
                            <AlertCircle className="w-3 h-3" />
                            Sin foto
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      className="p-2 rounded-lg hover:opacity-80 transition-opacity flex-shrink-0"
                      style={{ backgroundColor: `rgb(${colors.bg.tertiary})` }}
                    >
                      <Edit2 className="w-4 h-4" style={{ color: '#594396' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Usuarios */}
        {activeTab === 'usuarios' && (
          <div>
            <h2 
              className="text-lg md:text-xl font-bold flex items-center gap-2 mb-4"
              style={{ color: `rgb(${colors.text.primary})` }}
            >
              <Users className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#594396' }} />
              Usuarios del Sistema
            </h2>

            {/* Filtros por Rol */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setRoleFilter('all')}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: roleFilter === 'all' ? '#594396' : `rgb(${colors.bg.secondary})`,
                  color: roleFilter === 'all' ? 'white' : `rgb(${colors.text.primary})`,
                  border: roleFilter === 'all' ? 'none' : `1px solid rgb(${colors.ui.border})`
                }}
              >
                Todos ({usuarios.length})
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                style={{
                  backgroundColor: roleFilter === 'admin' ? '#594396' : `rgb(${colors.bg.secondary})`,
                  color: roleFilter === 'admin' ? 'white' : `rgb(${colors.text.primary})`,
                  border: roleFilter === 'admin' ? 'none' : `1px solid rgb(${colors.ui.border})`
                }}
              >
                <Shield className="w-3.5 h-3.5" />
                Admins ({usuarios.filter(u => u.role === 'admin').length})
              </button>
              <button
                onClick={() => setRoleFilter('capitan')}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                style={{
                  backgroundColor: roleFilter === 'capitan' ? '#2563eb' : `rgb(${colors.bg.secondary})`,
                  color: roleFilter === 'capitan' ? 'white' : `rgb(${colors.text.primary})`,
                  border: roleFilter === 'capitan' ? 'none' : `1px solid rgb(${colors.ui.border})`
                }}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Capitanes ({usuarios.filter(u => u.role === 'capitan').length})
              </button>
              <button
                onClick={() => setRoleFilter('voluntario')}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                style={{
                  backgroundColor: roleFilter === 'voluntario' ? '#059669' : `rgb(${colors.bg.secondary})`,
                  color: roleFilter === 'voluntario' ? 'white' : `rgb(${colors.text.primary})`,
                  border: roleFilter === 'voluntario' ? 'none' : `1px solid rgb(${colors.ui.border})`
                }}
              >
                <UserIcon className="w-3.5 h-3.5" />
                Voluntarios ({usuarios.filter(u => u.role === 'voluntario').length})
              </button>
            </div>

            {/* Barra de búsqueda */}
            <div className="mb-4 relative">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
                style={{ color: `rgb(${colors.text.tertiary})` }}
              />
              <input
                type="text"
                placeholder="Buscar hermano por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg outline-none transition-all text-sm"
                style={{
                  backgroundColor: `rgb(${colors.bg.secondary})`,
                  border: `1px solid rgb(${colors.ui.border})`,
                  color: `rgb(${colors.text.primary})`
                }}
              />
            </div>

            {/* Lista de usuarios filtrados */}
            <div className="space-y-3">
              {usuariosFiltrados.map((usuario) => (
                <div
                  key={usuario.id}
                  className="rounded-xl p-4"
                  style={{ 
                    backgroundColor: `rgb(${colors.bg.secondary})`,
                    border: `1px solid rgb(${colors.ui.border})`,
                    opacity: usuario.activo ? 1 : 0.6
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar con color según rol */}
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                      style={{ backgroundColor: getRoleColor(usuario.role) }}
                    >
                      {usuario.nombre.charAt(0)}
                    </div>

                    {/* Datos del usuario */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span 
                              className="font-semibold"
                              style={{ color: `rgb(${colors.text.primary})` }}
                            >
                              {usuario.nombre}
                            </span>
                            {/* Badge de rol */}
                            <div 
                              className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
                              style={{ 
                                backgroundColor: `${getRoleColor(usuario.role)}20`,
                                color: getRoleColor(usuario.role)
                              }}
                            >
                              {getRoleIcon(usuario.role)}
                              <span className="hidden sm:inline">{getRoleLabel(usuario.role)}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          className="p-1.5 rounded-lg hover:opacity-80 transition-opacity flex-shrink-0"
                          style={{ backgroundColor: `rgb(${colors.bg.tertiary})` }}
                        >
                          <Edit2 className="w-3.5 h-3.5" style={{ color: '#594396' }} />
                        </button>
                      </div>

                      <div className="space-y-1 text-sm">
                        <div 
                          className="flex items-center gap-1.5"
                          style={{ color: `rgb(${colors.text.secondary})` }}
                        >
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{usuario.email}</span>
                        </div>
                        <div 
                          className="flex items-center gap-1.5"
                          style={{ color: `rgb(${colors.text.secondary})` }}
                        >
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          {usuario.telefono}
                        </div>
                        <div 
                          className="flex items-center gap-1.5"
                          style={{ color: '#594396' }}
                        >
                          <Church className="w-3 h-3 flex-shrink-0" />
                          {getCongregacionNombre(usuario.congregacion)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {usuariosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-3" style={{ color: `rgb(${colors.text.tertiary})` }} />
                <p style={{ color: `rgb(${colors.text.secondary})` }}>
                  No se encontraron hermanos con los filtros actuales
                </p>
              </div>
            )}
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
    </div>
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

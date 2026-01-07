import React, { useState } from 'react';
import { User } from '../types/models';
import { HeaderWithTheme } from '../components/HeaderWithTheme';
import { useThemeColors } from '../hooks/useThemeColors';
import { EventBadge } from '../components/EventBadge';
import { Clock, MapPin, CheckCircle, Edit3, Send, Heart, Sparkles, Calendar, X, AlertCircle, Users } from 'lucide-react';

interface InformesScreenProps {
  user: User;
  onLogout: () => void;
}

interface Informe {
  id: string;
  turnoId: string;
  voluntarioId: string;
  voluntarioNombre: string;
  tipo: 'expositores' | 'guias' | 'escuelas' | 'editoriales' | 'encuestas' | 'bodega';
  titulo: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  ubicacion: string;
  capitanId: string;
  capitanNombre: string;
  status: 'pendiente' | 'realizado';
  asistio?: boolean;
  comentarios?: string;
  experiencia?: string;
  fechaReporte?: string;
}

export function InformesScreen({ user, onLogout }: InformesScreenProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'pendientes' | 'realizados' | 'experiencias'>('pendientes');
  const [selectedInforme, setSelectedInforme] = useState<Informe | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExperienciaModal, setShowExperienciaModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const [formData, setFormData] = useState({
    asistio: true,
    comentarios: '',
    experiencia: ''
  });

  const colors = useThemeColors();

  // Mock data de informes (en producción vendrían de Supabase)
  const [informes, setInformes] = useState<Informe[]>([
    // Informes del usuario actual (voluntario)
    {
      id: 'inf1',
      turnoId: 't1',
      voluntarioId: user.id,
      voluntarioNombre: user.nombre,
      tipo: 'guias',
      titulo: 'Miércoles 3 de diciembre de 2025',
      fecha: '2025-12-03',
      horaInicio: '16:00',
      horaFin: '21:00',
      ubicacion: 'Museo Bíblico - Sede Central',
      capitanId: 'cap1',
      capitanNombre: 'Hermano Martínez',
      status: 'pendiente'
    },
    {
      id: 'inf2',
      turnoId: 't7',
      voluntarioId: user.id,
      voluntarioNombre: user.nombre,
      tipo: 'escuelas',
      titulo: 'Viernes 5 de diciembre de 2025',
      fecha: '2025-12-05',
      horaInicio: '18:00',
      horaFin: '21:00',
      ubicacion: 'Salón del Reino - Congregación Norte',
      capitanId: 'cap1',
      capitanNombre: 'Hermano Martínez',
      status: 'pendiente'
    },
    {
      id: 'inf3',
      turnoId: 't13',
      voluntarioId: user.id,
      voluntarioNombre: user.nombre,
      tipo: 'expositores',
      titulo: 'Sábado 30 de noviembre de 2025',
      fecha: '2025-11-30',
      horaInicio: '09:00',
      horaFin: '14:00',
      ubicacion: 'Salón de Asambleas',
      capitanId: 'cap2',
      capitanNombre: 'Hermana González',
      status: 'realizado',
      asistio: true,
      comentarios: 'Fue una experiencia maravillosa. Pude conversar con varios visitantes interesados.',
      experiencia: 'Una hermana me preguntó sobre la Trinidad y pudimos tener una conversación muy edificante usando la Biblia.',
      fechaReporte: '2025-12-01'
    },
    {
      id: 'inf4',
      turnoId: 't14',
      voluntarioId: user.id,
      voluntarioNombre: user.nombre,
      tipo: 'bodega',
      titulo: 'Jueves 28 de noviembre de 2025',
      fecha: '2025-11-28',
      horaInicio: '16:00',
      horaFin: '19:00',
      ubicacion: 'Bodega Central - Betel',
      capitanId: 'cap3',
      capitanNombre: 'Hermano Pérez',
      status: 'realizado',
      asistio: true,
      comentarios: 'Organizamos 200 cajas de literatura. Todo el equipo trabajó muy bien.',
      fechaReporte: '2025-11-29'
    },
    // Informes de otros voluntarios (para admins/capitanes)
    {
      id: 'inf5',
      turnoId: 't2',
      voluntarioId: 'vol2',
      voluntarioNombre: 'María Fernández',
      tipo: 'guias',
      titulo: 'Jueves 4 de diciembre de 2025',
      fecha: '2025-12-04',
      horaInicio: '14:00',
      horaFin: '18:00',
      ubicacion: 'Museo Bíblico - Sede Central',
      capitanId: 'cap1',
      capitanNombre: 'Hermano Martínez',
      status: 'pendiente'
    },
    {
      id: 'inf6',
      turnoId: 't3',
      voluntarioId: 'vol3',
      voluntarioNombre: 'Carlos López',
      tipo: 'expositores',
      titulo: 'Viernes 6 de diciembre de 2025',
      fecha: '2025-12-06',
      horaInicio: '10:00',
      horaFin: '13:00',
      ubicacion: 'Salón de Asambleas',
      capitanId: 'cap1',
      capitanNombre: 'Hermano Martínez',
      status: 'realizado',
      asistio: true,
      comentarios: 'Excelente día de servicio. Atendimos a muchas personas.',
      experiencia: 'Un joven me dijo que había estado orando para encontrar respuestas. Le mostramos el video "¿Por qué estudiar la Biblia?" Se emocionó mucho y aceptó un estudio.',
      fechaReporte: '2025-12-06'
    },
    {
      id: 'inf7',
      turnoId: 't4',
      voluntarioId: 'vol4',
      voluntarioNombre: 'Ana Rodríguez',
      tipo: 'escuelas',
      titulo: 'Sábado 7 de diciembre de 2025',
      fecha: '2025-12-07',
      horaInicio: '09:00',
      horaFin: '12:00',
      ubicacion: 'Salón del Reino - Congregación Sur',
      capitanId: 'cap2',
      capitanNombre: 'Hermana González',
      status: 'pendiente'
    },
    {
      id: 'inf8',
      turnoId: 't5',
      voluntarioId: 'vol5',
      voluntarioNombre: 'Pedro Sánchez',
      tipo: 'editoriales',
      titulo: 'Domingo 1 de diciembre de 2025',
      fecha: '2025-12-01',
      horaInicio: '08:00',
      horaFin: '12:00',
      ubicacion: 'Plaza Central',
      capitanId: 'cap1',
      capitanNombre: 'Hermano Martínez',
      status: 'realizado',
      asistio: true,
      comentarios: 'Muy buen clima para el servicio. Distribuimos 150 revistas.',
      experiencia: 'Una señora mayor me agradeció por la revista sobre el duelo. Me contó que había perdido a su esposo hace poco. Pudimos consolarla con Apocalipsis 21:4.',
      fechaReporte: '2025-12-01'
    }
  ]);

  // Filtrar informes según el rol
  const informesFiltrados = informes.filter(inf => {
    if (user.role === 'voluntario') {
      // Voluntarios solo ven SUS informes
      return inf.voluntarioId === user.id;
    } else if (user.role === 'capitan') {
      // Capitanes ven informes de voluntarios de SUS turnos
      return inf.capitanId === user.id;
    } else {
      // Admins ven TODOS los informes
      return true;
    }
  });

  const informesPendientes = informesFiltrados.filter(i => i.status === 'pendiente');
  const informesRealizados = informesFiltrados.filter(i => i.status === 'realizado');
  const experiencias = informesFiltrados.filter(i => i.experiencia && i.experiencia.trim() !== '');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
  };

  const handleEnviarInforme = () => {
    if (selectedInforme) {
      setInformes(prev => prev.map(inf => 
        inf.id === selectedInforme.id 
          ? { 
              ...inf, 
              status: 'realizado' as const,
              asistio: formData.asistio,
              comentarios: formData.comentarios,
              experiencia: formData.experiencia,
              fechaReporte: new Date().toISOString().split('T')[0]
            } 
          : inf
      ));
      setShowEditModal(false);
      setSelectedInforme(null);
      setFormData({ asistio: true, comentarios: '', experiencia: '' });
      setActiveTab('realizados');
    }
  };

  const handleEditarInforme = (informe: Informe) => {
    setSelectedInforme(informe);
    setFormData({
      asistio: informe.asistio ?? true,
      comentarios: informe.comentarios ?? '',
      experiencia: informe.experiencia ?? ''
    });
    setShowEditModal(true);
  };

  const handleAbrirInforme = (informe: Informe) => {
    setSelectedInforme(informe);
    setFormData({
      asistio: true,
      comentarios: '',
      experiencia: ''
    });
    setShowEditModal(true);
  };

  const handleVerDetalle = (informe: Informe) => {
    setSelectedInforme(informe);
    setShowDetailModal(true);
  };

  const handleCompartirExperiencia = () => {
    console.log('Experiencia compartida:', formData.experiencia);
    setShowExperienciaModal(false);
    setFormData({ asistio: true, comentarios: '', experiencia: '' });
  };

  // Determinar el título según el rol
  const getTitle = () => {
    if (user.role === 'voluntario') return 'Mis Informes';
    if (user.role === 'capitan') return 'Informes de Mi Grupo';
    return 'Todos los Informes';
  };

  return (
    <div 
      className="min-h-screen pb-24 theme-transition"
      style={{ backgroundColor: `rgb(${colors.bg.primary})` }}
    >
      {/* Header */}
      <HeaderWithTheme
        title={getTitle()}
        showMenu={showMenu}
        onMenuToggle={() => setShowMenu(!showMenu)}
        user={user}
        onLogout={onLogout}
      />

      <div className="px-4 py-4">
        {/* Estadísticas */}
        <div 
          className="rounded-xl p-4 mb-4 shadow-md theme-transition"
          style={{ 
            backgroundColor: `rgb(${colors.bg.secondary})`,
            border: `1px solid rgb(${colors.ui.border})`
          }}
        >
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: '#f59e0b' }}
              >
                {informesPendientes.length}
              </div>
              <div 
                className="text-xs"
                style={{ color: `rgb(${colors.text.secondary})` }}
              >
                Pendientes
              </div>
            </div>
            
            <div className="text-center">
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: '#10b981' }}
              >
                {informesRealizados.length}
              </div>
              <div 
                className="text-xs"
                style={{ color: `rgb(${colors.text.secondary})` }}
              >
                Completados
              </div>
            </div>
            
            <div className="text-center">
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: `rgb(${colors.interactive.primary})` }}
              >
                {experiencias.length}
              </div>
              <div 
                className="text-xs"
                style={{ color: `rgb(${colors.text.secondary})` }}
              >
                Experiencias
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('pendientes')}
            className="flex-1 py-2.5 px-3 rounded-lg font-medium text-xs transition-all"
            style={{
              backgroundColor: activeTab === 'pendientes' 
                ? `rgb(${colors.interactive.primary})` 
                : `rgb(${colors.bg.tertiary})`,
              color: activeTab === 'pendientes' 
                ? '#ffffff' 
                : `rgb(${colors.text.primary})`,
              border: activeTab === 'pendientes' 
                ? `2px solid rgb(${colors.interactive.primary})` 
                : `1px solid rgb(${colors.ui.border})`
            }}
          >
            Pendientes ({informesPendientes.length})
          </button>
          
          <button
            onClick={() => setActiveTab('realizados')}
            className="flex-1 py-2.5 px-3 rounded-lg font-medium text-xs transition-all"
            style={{
              backgroundColor: activeTab === 'realizados' 
                ? `rgb(${colors.interactive.primary})` 
                : `rgb(${colors.bg.tertiary})`,
              color: activeTab === 'realizados' 
                ? '#ffffff' 
                : `rgb(${colors.text.primary})`,
              border: activeTab === 'realizados' 
                ? `2px solid rgb(${colors.interactive.primary})` 
                : `1px solid rgb(${colors.ui.border})`
            }}
          >
            Completados ({informesRealizados.length})
          </button>

          <button
            onClick={() => setActiveTab('experiencias')}
            className="flex-1 py-2.5 px-3 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1"
            style={{
              backgroundColor: activeTab === 'experiencias' 
                ? `rgb(${colors.interactive.primary})` 
                : `rgb(${colors.bg.tertiary})`,
              color: activeTab === 'experiencias' 
                ? '#ffffff' 
                : `rgb(${colors.text.primary})`,
              border: activeTab === 'experiencias' 
                ? `2px solid rgb(${colors.interactive.primary})` 
                : `1px solid rgb(${colors.ui.border})`
            }}
          >
            <Heart className="w-3.5 h-3.5" />
            Experiencias
          </button>
        </div>

        {/* PESTAÑA: PENDIENTES */}
        {activeTab === 'pendientes' && (
          <>
            {informesPendientes.length > 0 ? (
              <div className="space-y-3">
                {informesPendientes.map((informe) => (
                  <div
                    key={informe.id}
                    onClick={() => {
                      if (user.role === 'voluntario') {
                        handleAbrirInforme(informe);
                      } else {
                        handleVerDetalle(informe);
                      }
                    }}
                    className="rounded-xl p-4 cursor-pointer hover:opacity-90 transition-all shadow-md theme-transition"
                    style={{ 
                      backgroundColor: `rgb(${colors.bg.secondary})`,
                      border: '2px solid rgba(251, 191, 36, 0.3)'
                    }}
                  >
                    {/* Header con badge y fecha */}
                    <div className="flex items-start justify-between mb-3">
                      <EventBadge tipo={informe.tipo} size="md" />
                      <span className="text-xs px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 font-semibold">
                        PENDIENTE
                      </span>
                    </div>

                    {/* Voluntario (solo para admins/capitanes) */}
                    {user.role !== 'voluntario' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Users 
                          className="w-4 h-4" 
                          style={{ color: `rgb(${colors.interactive.primary})` }}
                        />
                        <span 
                          className="text-sm font-semibold"
                          style={{ color: `rgb(${colors.text.primary})` }}
                        >
                          {informe.voluntarioNombre}
                        </span>
                      </div>
                    )}

                    {/* Fecha */}
                    <div 
                      className="text-sm font-semibold mb-2"
                      style={{ color: `rgb(${colors.text.primary})` }}
                    >
                      {formatDate(informe.fecha)}
                    </div>

                    {/* Horario */}
                    <div className="flex items-center gap-2 mb-2">
                      <Clock 
                        className="w-4 h-4 flex-shrink-0" 
                        style={{ color: `rgb(${colors.text.tertiary})` }}
                      />
                      <span 
                        className="text-xs"
                        style={{ color: `rgb(${colors.text.secondary})` }}
                      >
                        {informe.horaInicio} - {informe.horaFin}
                      </span>
                    </div>

                    {/* Ubicación */}
                    <div className="flex items-start gap-2 mb-3">
                      <MapPin 
                        className="w-4 h-4 flex-shrink-0 mt-0.5" 
                        style={{ color: `rgb(${colors.text.tertiary})` }}
                      />
                      <span 
                        className="text-xs"
                        style={{ color: `rgb(${colors.text.secondary})` }}
                      >
                        {informe.ubicacion}
                      </span>
                    </div>

                    {/* Capitán (solo para voluntarios) */}
                    {user.role === 'voluntario' && (
                      <div 
                        className="text-xs mb-3"
                        style={{ color: `rgb(${colors.text.tertiary})` }}
                      >
                        Capitán: <span className="font-semibold">{informe.capitanNombre}</span>
                      </div>
                    )}

                    {/* Botón */}
                    {user.role === 'voluntario' ? (
                      <button
                        className="w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                        style={{ 
                          backgroundColor: '#f59e0b',
                          color: '#ffffff'
                        }}
                      >
                        <Send className="w-4 h-4" />
                        Enviar Informe
                      </button>
                    ) : (
                      <div 
                        className="flex items-center gap-2 text-xs"
                        style={{ color: '#f59e0b' }}
                      >
                        <AlertCircle className="w-4 h-4" />
                        Esperando que el voluntario envíe su informe
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-3">✅</div>
                <h3 
                  className="font-semibold mb-2"
                  style={{ color: `rgb(${colors.text.primary})` }}
                >
                  ¡Todo al día!
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: `rgb(${colors.text.secondary})` }}
                >
                  {user.role === 'voluntario' 
                    ? 'No tienes informes pendientes' 
                    : 'Todos los voluntarios han enviado sus informes'}
                </p>
              </div>
            )}
          </>
        )}

        {/* PESTAÑA: REALIZADOS */}
        {activeTab === 'realizados' && (
          <>
            {informesRealizados.length > 0 ? (
              <div className="space-y-3">
                {informesRealizados.map((informe) => (
                  <div
                    key={informe.id}
                    onClick={() => {
                      if (user.role === 'voluntario' && informe.voluntarioId === user.id) {
                        handleEditarInforme(informe);
                      } else {
                        handleVerDetalle(informe);
                      }
                    }}
                    className="rounded-xl p-4 shadow-md theme-transition cursor-pointer hover:opacity-90"
                    style={{ 
                      backgroundColor: `rgb(${colors.bg.secondary})`,
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    {/* Header con badge y estado */}
                    <div className="flex items-start justify-between mb-3">
                      <EventBadge tipo={informe.tipo} size="md" />
                      <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        COMPLETADO
                      </div>
                    </div>

                    {/* Voluntario (solo para admins/capitanes) */}
                    {user.role !== 'voluntario' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Users 
                          className="w-4 h-4" 
                          style={{ color: `rgb(${colors.interactive.primary})` }}
                        />
                        <span 
                          className="text-sm font-semibold"
                          style={{ color: `rgb(${colors.text.primary})` }}
                        >
                          {informe.voluntarioNombre}
                        </span>
                      </div>
                    )}

                    {/* Fecha */}
                    <div 
                      className="text-sm font-semibold mb-2"
                      style={{ color: `rgb(${colors.text.primary})` }}
                    >
                      {formatDate(informe.fecha)}
                    </div>

                    {/* Horario */}
                    <div className="flex items-center gap-2 mb-2">
                      <Clock 
                        className="w-4 h-4 flex-shrink-0" 
                        style={{ color: `rgb(${colors.text.tertiary})` }}
                      />
                      <span 
                        className="text-xs"
                        style={{ color: `rgb(${colors.text.secondary})` }}
                      >
                        {informe.horaInicio} - {informe.horaFin}
                      </span>
                    </div>

                    {/* Ubicación */}
                    <div className="flex items-start gap-2 mb-3">
                      <MapPin 
                        className="w-4 h-4 flex-shrink-0 mt-0.5" 
                        style={{ color: `rgb(${colors.text.tertiary})` }}
                      />
                      <span 
                        className="text-xs"
                        style={{ color: `rgb(${colors.text.secondary})` }}
                      >
                        {informe.ubicacion}
                      </span>
                    </div>

                    {/* Comentarios */}
                    {informe.comentarios && (
                      <div 
                        className="text-xs mb-3 p-3 rounded-lg"
                        style={{ 
                          backgroundColor: `rgb(${colors.bg.tertiary})`,
                          color: `rgb(${colors.text.primary})`
                        }}
                      >
                        <div className="font-semibold mb-1">Comentarios:</div>
                        {informe.comentarios}
                      </div>
                    )}

                    {/* Experiencia */}
                    {informe.experiencia && (
                      <div 
                        className="text-xs mb-3 p-3 rounded-lg flex items-start gap-2"
                        style={{ 
                          backgroundColor: 'rgba(107, 87, 184, 0.1)',
                          borderLeft: `3px solid rgb(${colors.interactive.primary})`
                        }}
                      >
                        <Sparkles 
                          className="w-4 h-4 flex-shrink-0 mt-0.5"
                          style={{ color: `rgb(${colors.interactive.primary})` }}
                        />
                        <div>
                          <div 
                            className="font-semibold mb-1"
                            style={{ color: `rgb(${colors.interactive.primary})` }}
                          >
                            Experiencia:
                          </div>
                          <div style={{ color: `rgb(${colors.text.primary})` }}>
                            {informe.experiencia}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fecha de reporte */}
                    <div 
                      className="text-xs mb-3"
                      style={{ color: `rgb(${colors.text.tertiary})` }}
                    >
                      Reportado el: {informe.fechaReporte && formatDate(informe.fechaReporte)}
                    </div>

                    {/* Botón Editar (solo para voluntarios en sus propios informes) */}
                    {user.role === 'voluntario' && informe.voluntarioId === user.id && (
                      <button
                        className="w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 border"
                        style={{ 
                          backgroundColor: 'transparent',
                          borderColor: `rgb(${colors.interactive.primary})`,
                          color: `rgb(${colors.interactive.primary})`
                        }}
                      >
                        <Edit3 className="w-4 h-4" />
                        Editar Informe
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-3">📝</div>
                <h3 
                  className="font-semibold mb-2"
                  style={{ color: `rgb(${colors.text.primary})` }}
                >
                  Aún no hay informes completados
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: `rgb(${colors.text.secondary})` }}
                >
                  {user.role === 'voluntario' 
                    ? 'Tus informes completados aparecerán aquí' 
                    : 'Los informes completados de los voluntarios aparecerán aquí'}
                </p>
              </div>
            )}
          </>
        )}

        {/* PESTAÑA: EXPERIENCIAS */}
        {activeTab === 'experiencias' && (
          <>
            {/* Botón para compartir nueva experiencia (solo voluntarios) */}
            {user.role === 'voluntario' && (
              <button
                onClick={() => setShowExperienciaModal(true)}
                className="w-full py-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 mb-6 shadow-md"
                style={{ 
                  backgroundColor: `rgb(${colors.interactive.primary})`,
                  color: '#ffffff'
                }}
              >
                <Sparkles className="w-5 h-5" />
                Comparte una Experiencia
              </button>
            )}

            {/* Lista de experiencias */}
            <div className="space-y-4">
              {experiencias.map((informe) => (
                <div
                  key={informe.id}
                  className="rounded-xl p-4 shadow-md theme-transition"
                  style={{ 
                    backgroundColor: `rgb(${colors.bg.secondary})`,
                    border: `1px solid rgb(${colors.ui.border})`
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                      style={{ backgroundColor: `rgb(${colors.interactive.primary})` }}
                    >
                      {informe.voluntarioNombre.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div 
                        className="font-semibold text-sm mb-0.5"
                        style={{ color: `rgb(${colors.text.primary})` }}
                      >
                        {informe.voluntarioNombre}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <EventBadge tipo={informe.tipo} size="sm" />
                        <span 
                          className="text-xs"
                          style={{ color: `rgb(${colors.text.tertiary})` }}
                        >
                          • {formatDate(informe.fecha)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Experiencia */}
                  <div 
                    className="text-sm leading-relaxed mb-3"
                    style={{ color: `rgb(${colors.text.primary})` }}
                  >
                    {informe.experiencia}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-4">
                    <button 
                      className="flex items-center gap-1 text-xs"
                      style={{ color: `rgb(${colors.text.tertiary})` }}
                    >
                      <Heart className="w-4 h-4" />
                      <span className="font-medium">Me edifica</span>
                    </button>
                  </div>
                </div>
              ))}

              {experiencias.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-3">💝</div>
                  <h3 
                    className="font-semibold mb-2"
                    style={{ color: `rgb(${colors.text.primary})` }}
                  >
                    {user.role === 'voluntario' 
                      ? 'Comparte tus experiencias' 
                      : 'Aún no hay experiencias compartidas'}
                  </h3>
                  <p 
                    className="text-sm mb-4"
                    style={{ color: `rgb(${colors.text.secondary})` }}
                  >
                    {user.role === 'voluntario' 
                      ? 'Edifica a otros hermanos contando lo que Jehová ha hecho por ti' 
                      : 'Cuando los voluntarios compartan sus experiencias, aparecerán aquí'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* MODAL: Enviar/Editar Informe (solo voluntarios) */}
      {showEditModal && selectedInforme && user.role === 'voluntario' && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 p-0">
          <div 
            className="w-full max-w-[428px] rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto theme-transition"
            style={{ backgroundColor: `rgb(${colors.bg.primary})` }}
          >
            {/* Header del Modal */}
            <div 
              className="sticky top-0 z-10 px-4 py-4 border-b theme-transition"
              style={{ 
                backgroundColor: `rgb(${colors.bg.primary})`,
                borderColor: `rgb(${colors.ui.divider})`
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 
                  className="font-semibold text-lg"
                  style={{ color: `rgb(${colors.text.primary})` }}
                >
                  {selectedInforme.status === 'pendiente' ? 'Enviar Informe' : 'Editar Informe'}
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedInforme(null);
                  }}
                  className="p-2 rounded-lg hover:opacity-70 transition-all"
                  style={{ backgroundColor: `rgb(${colors.bg.tertiary})` }}
                >
                  <X className="w-5 h-5" style={{ color: `rgb(${colors.text.primary})` }} />
                </button>
              </div>
              <EventBadge tipo={selectedInforme.tipo} size="md" />
            </div>

            <div className="p-4 space-y-4">
              {/* Info del Turno */}
              <div 
                className="rounded-xl p-3"
                style={{ backgroundColor: `rgb(${colors.bg.secondary})` }}
              >
                <div 
                  className="text-sm font-semibold mb-2"
                  style={{ color: `rgb(${colors.text.primary})` }}
                >
                  {formatDate(selectedInforme.fecha)}
                </div>
                <div 
                  className="text-xs mb-1"
                  style={{ color: `rgb(${colors.text.secondary})` }}
                >
                  {selectedInforme.horaInicio} - {selectedInforme.horaFin}
                </div>
                <div 
                  className="text-xs"
                  style={{ color: `rgb(${colors.text.tertiary})` }}
                >
                  {selectedInforme.ubicacion}
                </div>
              </div>

              {/* ¿Asististe? */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: `rgb(${colors.text.primary})` }}
                >
                  ¿Asististe al turno?
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, asistio: true })}
                    className="flex-1 py-3 rounded-lg font-medium text-sm transition-all"
                    style={{
                      backgroundColor: formData.asistio 
                        ? '#10b981' 
                        : `rgb(${colors.bg.tertiary})`,
                      color: formData.asistio 
                        ? '#ffffff' 
                        : `rgb(${colors.text.primary})`,
                      border: formData.asistio 
                        ? '2px solid #10b981' 
                        : `1px solid rgb(${colors.ui.border})`
                    }}
                  >
                    ✓ Sí, asistí
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, asistio: false })}
                    className="flex-1 py-3 rounded-lg font-medium text-sm transition-all"
                    style={{
                      backgroundColor: !formData.asistio 
                        ? '#ef4444' 
                        : `rgb(${colors.bg.tertiary})`,
                      color: !formData.asistio 
                        ? '#ffffff' 
                        : `rgb(${colors.text.primary})`,
                      border: !formData.asistio 
                        ? '2px solid #ef4444' 
                        : `1px solid rgb(${colors.ui.border})`
                    }}
                  >
                    ✗ No asistí
                  </button>
                </div>
              </div>

              {/* Comentarios */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: `rgb(${colors.text.primary})` }}
                >
                  Comentarios del turno
                </label>
                <textarea
                  value={formData.comentarios}
                  onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                  placeholder="Describe cómo fue el turno, qué actividades realizaste, etc."
                  className="w-full p-3 rounded-lg text-sm resize-none theme-transition"
                  style={{
                    backgroundColor: `rgb(${colors.bg.secondary})`,
                    color: `rgb(${colors.text.primary})`,
                    border: `1px solid rgb(${colors.ui.border})`,
                    minHeight: '100px'
                  }}
                />
              </div>

              {/* Experiencia */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2 flex items-center gap-2"
                  style={{ color: `rgb(${colors.text.primary})` }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: `rgb(${colors.interactive.primary})` }} />
                  Cuéntanos una experiencia (opcional)
                </label>
                <textarea
                  value={formData.experiencia}
                  onChange={(e) => setFormData({ ...formData, experiencia: e.target.value })}
                  placeholder="¿Hubo alguna conversación edificante? ¿Aprendiste algo nuevo? ¿Jehová te ayudó de alguna manera?"
                  className="w-full p-3 rounded-lg text-sm resize-none theme-transition"
                  style={{
                    backgroundColor: `rgb(${colors.bg.secondary})`,
                    color: `rgb(${colors.text.primary})`,
                    border: `1px solid rgb(${colors.ui.border})`,
                    minHeight: '120px'
                  }}
                />
                <p 
                  className="text-xs mt-2"
                  style={{ color: `rgb(${colors.text.tertiary})` }}
                >
                  Las experiencias se comparten para edificar a otros hermanos
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedInforme(null);
                  }}
                  className="flex-1 py-3 rounded-lg font-medium text-sm transition-all border"
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: `rgb(${colors.ui.border})`,
                    color: `rgb(${colors.text.primary})`
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEnviarInforme}
                  className="flex-1 py-3 rounded-lg font-medium text-sm transition-all text-white"
                  style={{ backgroundColor: `rgb(${colors.interactive.primary})` }}
                >
                  {selectedInforme.status === 'pendiente' ? 'Enviar' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Ver Detalle (admins/capitanes) */}
      {showDetailModal && selectedInforme && user.role !== 'voluntario' && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 p-0">
          <div 
            className="w-full max-w-[428px] rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto theme-transition"
            style={{ backgroundColor: `rgb(${colors.bg.primary})` }}
          >
            <div 
              className="sticky top-0 z-10 px-4 py-4 border-b theme-transition"
              style={{ 
                backgroundColor: `rgb(${colors.bg.primary})`,
                borderColor: `rgb(${colors.ui.divider})`
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 
                  className="font-semibold text-lg"
                  style={{ color: `rgb(${colors.text.primary})` }}
                >
                  Detalle del Informe
                </h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedInforme(null);
                  }}
                  className="p-2 rounded-lg hover:opacity-70 transition-all"
                  style={{ backgroundColor: `rgb(${colors.bg.tertiary})` }}
                >
                  <X className="w-5 h-5" style={{ color: `rgb(${colors.text.primary})` }} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Voluntario */}
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold"
                  style={{ backgroundColor: `rgb(${colors.interactive.primary})` }}
                >
                  {selectedInforme.voluntarioNombre.charAt(0)}
                </div>
                <div>
                  <div 
                    className="font-semibold"
                    style={{ color: `rgb(${colors.text.primary})` }}
                  >
                    {selectedInforme.voluntarioNombre}
                  </div>
                  <EventBadge tipo={selectedInforme.tipo} size="sm" />
                </div>
              </div>

              {/* Info del Turno */}
              <div 
                className="rounded-xl p-3"
                style={{ backgroundColor: `rgb(${colors.bg.secondary})` }}
              >
                <div 
                  className="text-sm font-semibold mb-2"
                  style={{ color: `rgb(${colors.text.primary})` }}
                >
                  {formatDate(selectedInforme.fecha)}
                </div>
                <div 
                  className="text-xs mb-1"
                  style={{ color: `rgb(${colors.text.secondary})` }}
                >
                  {selectedInforme.horaInicio} - {selectedInforme.horaFin}
                </div>
                <div 
                  className="text-xs"
                  style={{ color: `rgb(${colors.text.tertiary})` }}
                >
                  {selectedInforme.ubicacion}
                </div>
              </div>

              {selectedInforme.status === 'realizado' ? (
                <>
                  {/* Asistencia */}
                  <div 
                    className="p-3 rounded-lg"
                    style={{ 
                      backgroundColor: selectedInforme.asistio 
                        ? 'rgba(16, 185, 129, 0.1)' 
                        : 'rgba(239, 68, 68, 0.1)'
                    }}
                  >
                    <div 
                      className="text-sm font-semibold"
                      style={{ color: selectedInforme.asistio ? '#10b981' : '#ef4444' }}
                    >
                      {selectedInforme.asistio ? '✓ Asistió al turno' : '✗ No asistió al turno'}
                    </div>
                  </div>

                  {/* Comentarios */}
                  {selectedInforme.comentarios && (
                    <div>
                      <div 
                        className="text-sm font-semibold mb-2"
                        style={{ color: `rgb(${colors.text.primary})` }}
                      >
                        Comentarios:
                      </div>
                      <div 
                        className="p-3 rounded-lg text-sm"
                        style={{ 
                          backgroundColor: `rgb(${colors.bg.secondary})`,
                          color: `rgb(${colors.text.primary})`
                        }}
                      >
                        {selectedInforme.comentarios}
                      </div>
                    </div>
                  )}

                  {/* Experiencia */}
                  {selectedInforme.experiencia && (
                    <div>
                      <div 
                        className="text-sm font-semibold mb-2 flex items-center gap-2"
                        style={{ color: `rgb(${colors.interactive.primary})` }}
                      >
                        <Sparkles className="w-4 h-4" />
                        Experiencia:
                      </div>
                      <div 
                        className="p-3 rounded-lg text-sm"
                        style={{ 
                          backgroundColor: 'rgba(107, 87, 184, 0.1)',
                          color: `rgb(${colors.text.primary})`,
                          borderLeft: `3px solid rgb(${colors.interactive.primary})`
                        }}
                      >
                        {selectedInforme.experiencia}
                      </div>
                    </div>
                  )}

                  {/* Fecha de reporte */}
                  <div 
                    className="text-xs"
                    style={{ color: `rgb(${colors.text.tertiary})` }}
                  >
                    Reportado el: {selectedInforme.fechaReporte && formatDate(selectedInforme.fechaReporte)}
                  </div>
                </>
              ) : (
                <div 
                  className="p-4 rounded-lg flex items-start gap-3"
                  style={{ 
                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.3)'
                  }}
                >
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-orange-600 mb-1">
                      Informe Pendiente
                    </div>
                    <div className="text-sm text-orange-700">
                      El voluntario aún no ha enviado su informe de este turno.
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedInforme(null);
                }}
                className="w-full py-3 rounded-lg font-medium text-sm transition-all"
                style={{ 
                  backgroundColor: `rgb(${colors.interactive.primary})`,
                  color: '#ffffff'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

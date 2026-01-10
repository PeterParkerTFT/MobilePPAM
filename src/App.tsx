import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { useUser, UserProvider } from './contexts/UserContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { LoginScreen } from './screens/LoginScreen';
import { TurnosScreen } from './screens/TurnosScreen';
import { TurnosScreenCapitan } from './screens/TurnosScreenCapitan';
import { TurnosScreenVoluntario } from './screens/TurnosScreenVoluntario';
import { MisTurnosScreen } from './screens/MisTurnosScreen';
import { VoluntariosScreen } from './screens/VoluntariosScreen';
import { AprobacionesScreen } from './screens/AprobacionesScreen';
import { InformesScreen } from './screens/InformesScreen';
import { AjustesScreen } from './screens/AjustesScreen';
import { BottomNav } from './components/BottomNav';
import { User, TurnoSesion, Capitan } from './types/models'; // Updated to TurnoSesion
import { UserRole, EnumHelpers } from './types/enums';
// import { mockTurnos, mockCapitanes } from './data/mockData'; // Removed mock data
import { TurnoService } from './services/TurnoService'; // [NEW]
import { CongregacionService } from './services/CongregacionService'; // [NEW]
import { PendingActionsModal } from './components/PendingActionsModal'; // [NEW]
import { UserStatus } from './types/enums';


// Singleton services
const turnoService = new TurnoService();
const congregacionService = new CongregacionService();

function AppContent() {
  const { currentUser, login, logout } = useUser();
  const [activeTab, setActiveTab] = useState<'turnos' | 'mis-turnos' | 'voluntarios' | 'aprobaciones' | 'ajustes' | 'informes'>('turnos');

  // State for real data
  const [turnos, setTurnos] = useState<TurnoSesion[]>([]); // Use TurnoSesion
  const [capitanes] = useState<Capitan[]>([]); // Capitanes fetch not implemented yet in this step, keeping empty for now or could implement CapitanService

  // Pending Actions Hub State
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [ajustesInitialFilter, setAjustesInitialFilter] = useState<UserStatus | 'all'>('all');

  const handleOpenPendingModal = () => {
    setShowPendingModal(true);
  };

  const handleNavigateToPendingUsers = () => {
    setAjustesInitialFilter(UserStatus.Pendiente);
    setActiveTab('ajustes');
    setShowPendingModal(false);
  };

  const handleNavigateToPendingReports = () => {
    setActiveTab('informes');
    setShowPendingModal(false);
  };



  // Fetch data on load
  useEffect(() => {
    if (currentUser) {
      loadTurnos();
    }
  }, [currentUser]);

  const loadTurnos = async () => {
    try {
      // If user has a congregation, we could filter. For now fetch all or filter by user's cong
      const data = await turnoService.getTurnosDisponibles(currentUser?.congregacion);
      setTurnos(data);
    } catch (e) {
      console.error("Error loading turnos", e);
    }
  };

  const handleLogin = (user: User) => {
    login(user);
    if (EnumHelpers.isAdmin(user.role)) {
      setActiveTab('turnos');
    } else if (user.role === UserRole.Capitan) {
      setActiveTab('turnos');
    } else {
      setActiveTab('turnos');
    }
  };

  const handleLogout = () => {
    logout();
    setActiveTab('turnos');
  };

  // Función para cambiar el rol de un usuario (solo admins)
  const handleRoleChange = (userId: string, newRole: UserRole) => {
    if (currentUser && EnumHelpers.isAdmin(currentUser.role)) {
      // Si estamos cambiando el rol del usuario actual
      if (currentUser.id === userId) {
        login({
          ...currentUser,
          role: newRole
        });
        // Navegar a la vista correspondiente al nuevo rol
        setActiveTab('turnos');
      }
    }
  };

  const handleInscripcion = async (turnoId: string, userId: string) => {
    // 1. Optimistic UI Update
    setTurnos(turnos.map(turno => {
      if (turno.id === turnoId && turno.cupoActual < (turno.voluntariosMax || 0)) {
        const cupoMax = turno.voluntariosMax || turno.cupoMaximo || 0;
        const nuevoCupo = turno.cupoActual + 1;
        const nuevoEstado =
          nuevoCupo >= cupoMax ? 'completo' :
            nuevoCupo >= cupoMax * 0.8 ? 'limitado' : 'disponible';

        return {
          ...turno,
          cupoActual: nuevoCupo,
          voluntariosInscritos: [...(turno.voluntariosInscritos || []), userId],
          estado: nuevoEstado as any
        };
      }
      return turno;
    }));

    // 2. Call Service
    // In a real app we'd revert if this fails
    await turnoService.inscribirse(turnoId, userId, new Date().toISOString().split('T')[0]);
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <AppTour />
      <div className="w-full max-w-[428px] min-h-screen relative shadow-2xl">
        {activeTab === 'turnos' && (
          <>
            {(EnumHelpers.isAdmin(currentUser.role)) && (
              <TurnosScreen
                user={currentUser}
                onLogout={handleLogout}
                turnos={turnos}
                capitanes={capitanes}
                onInscripcion={handleInscripcion}
                onNavigateToInformes={() => setActiveTab('informes')}
                onNavigateToPendientes={handleOpenPendingModal}
                onTurnoCreated={loadTurnos}
              />
            )}
            {currentUser.role === UserRole.Capitan && (
              <TurnosScreenCapitan
                user={currentUser}
                onLogout={handleLogout}
                turnos={turnos}
                capitanes={capitanes}
                onInscripcion={handleInscripcion}
                onNavigateToInformes={() => setActiveTab('informes')}
                onNavigateToPendientes={handleOpenPendingModal}
              />
            )}
            {currentUser.role === UserRole.Voluntario && (
              <TurnosScreenVoluntario
                user={currentUser}
                onLogout={handleLogout}
                turnos={turnos}
                onInscripcion={handleInscripcion}
                onNavigateToInformes={() => setActiveTab('informes')}
                onNavigateToPendientes={handleOpenPendingModal}
              />
            )}
          </>
        )}
        {activeTab === 'mis-turnos' && (
          <MisTurnosScreen
            user={currentUser}
            onLogout={handleLogout}
            turnos={turnos}
            onNavigateToInformes={() => setActiveTab('informes')}
            onNavigateToPendientes={handleOpenPendingModal}
          />
        )}
        {activeTab === 'voluntarios' && (
          <VoluntariosScreen
            user={currentUser}
            onLogout={handleLogout}
            onNavigateToInformes={() => setActiveTab('informes')}
            onNavigateToPendientes={handleOpenPendingModal}
            onRoleChange={handleRoleChange}
            turnos={turnos}
          />
        )}
        {activeTab === 'aprobaciones' && (
          <AprobacionesScreen
            user={currentUser}
            onLogout={handleLogout}
            onNavigateToInformes={() => setActiveTab('informes')}
            onNavigateToPendientes={handleOpenPendingModal}
          />
        )}
        {activeTab === 'informes' && (
          <InformesScreen
            user={currentUser}
            onLogout={handleLogout}
            onNavigateToInformes={() => setActiveTab('informes')}
            onNavigateToPendientes={handleOpenPendingModal}
          />
        )}
        {activeTab === 'ajustes' && (
          <AjustesScreen
            user={currentUser}
            onLogout={handleLogout}
            initialStatusFilter={ajustesInitialFilter}
            onNavigateToPendientes={handleOpenPendingModal}
            onNavigateToInformes={() => setActiveTab('informes')}
          />
        )}

        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userRole={currentUser.role}
        />

        <PendingActionsModal
          isOpen={showPendingModal}
          onClose={() => setShowPendingModal(false)}
          onNavigateToUsers={handleNavigateToPendingUsers}
          onNavigateToReports={handleNavigateToPendingReports}
          userCount={0} // TODO: fetch real count
          reportCount={0} // TODO: fetch real count
        />

        <PendingActionsModal
          isOpen={showPendingModal}
          onClose={() => setShowPendingModal(false)}
          onNavigateToUsers={handleNavigateToPendingUsers}
          onNavigateToReports={handleNavigateToPendingReports}
          userCount={0} // TODO: fetch real count
          reportCount={0} // TODO: fetch real count
        />
      </div>
    </div>
  );
}

import { ReloadPrompt } from './ReloadPrompt';
import { Toaster } from './components/ui/sonner';

import { AppTour } from './components/AppTour';

export default function App() {
  return (
    <ThemeProvider>
      <Toaster />
      <ReloadPrompt />
      <UserProvider>
        <NotificationsProvider>
          <AppContent />
        </NotificationsProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
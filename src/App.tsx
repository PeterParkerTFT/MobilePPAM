import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { useUser } from './contexts/UserContext';
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
import { User, Turno, Capitan } from './types/models';
import { UserRole, EnumHelpers } from './types/enums';
import { mockTurnos, mockCapitanes } from './data/mockData';

function AppContent() {
  const { currentUser, login, logout } = useUser();
  const [activeTab, setActiveTab] = useState<'turnos' | 'mis-turnos' | 'voluntarios' | 'aprobaciones' | 'ajustes' | 'informes'>('turnos');
  const [turnos, setTurnos] = useState<Turno[]>(mockTurnos);
  const [capitanes] = useState<Capitan[]>(mockCapitanes);

  const handleLogin = (user: User) => {
    login(user);
    // Navegar a la vista por defecto según el rol
    if (EnumHelpers.isAdmin(user.role)) {
      setActiveTab('turnos'); // Admin/Ultra Admin → Vista de gestión completa
    } else if (user.role === UserRole.Capitan) {
      setActiveTab('turnos'); // Capitán → Vista de capitán
    } else {
      setActiveTab('turnos'); // Voluntario → Vista de voluntario
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

  const handleInscripcion = (turnoId: string, userId: string) => {
    setTurnos(turnos.map(turno => {
      if (turno.id === turnoId && turno.cupoActual < turno.cupoMaximo) {
        const nuevoCupo = turno.cupoActual + 1;
        const nuevoEstado =
          nuevoCupo >= turno.cupoMaximo ? 'completo' :
            nuevoCupo >= turno.cupoMaximo * 0.8 ? 'limitado' : 'disponible';

        return {
          ...turno,
          cupoActual: nuevoCupo,
          voluntariosInscritos: [...turno.voluntariosInscritos, userId],
          estado: nuevoEstado
        };
      }
      return turno;
    }));
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
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
              />
            )}
            {currentUser.role === UserRole.Voluntario && (
              <TurnosScreenVoluntario
                user={currentUser}
                onLogout={handleLogout}
                turnos={turnos}
                onInscripcion={handleInscripcion}
                onNavigateToInformes={() => setActiveTab('informes')}
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
          />
        )}
        {activeTab === 'voluntarios' && (
          <VoluntariosScreen
            user={currentUser}
            onLogout={handleLogout}
            onNavigateToInformes={() => setActiveTab('informes')}
            onRoleChange={handleRoleChange}
            turnos={turnos}
          />
        )}
        {activeTab === 'aprobaciones' && (
          <AprobacionesScreen
            user={currentUser}
            onLogout={handleLogout}
            onNavigateToInformes={() => setActiveTab('informes')}
          />
        )}
        {activeTab === 'informes' && (
          <InformesScreen
            user={currentUser}
            onLogout={handleLogout}
          />
        )}
        {activeTab === 'ajustes' && (
          <AjustesScreen
            user={currentUser}
            onLogout={handleLogout}
          />
        )}

        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userRole={currentUser.role}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
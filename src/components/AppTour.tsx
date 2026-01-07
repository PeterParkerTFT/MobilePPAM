import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function AppTour() {
    useEffect(() => {
        // Check if tour has been seen
        const hasSeenTour = localStorage.getItem('hasSeenTour');
        if (hasSeenTour) return;

        const driverObj = driver({
            showProgress: true,
            allowClose: true,
            animate: true,
            doneBtnText: '¡Listo!',
            nextBtnText: 'Siguiente',
            prevBtnText: 'Atrás',
            steps: [
                {
                    element: '#nav-turnos',
                    popover: {
                        title: '📅 Gestión de Turnos',
                        description: 'Aquí puedes ver todos los horarios disponibles para la predicación pública.',
                        side: 'top',
                        align: 'center'
                    }
                },
                {
                    element: '#tour-turno-card',
                    popover: {
                        title: '👆 Inscribirse es fácil',
                        description: 'Toca cualquier tarjeta de turno para ver detalles o inscribirte como voluntario.',
                        side: 'bottom',
                        align: 'center'
                    }
                },
                {
                    element: '#nav-mis-turnos',
                    popover: {
                        title: '✅ Mis Asignaciones',
                        description: 'Consulta aquí los turnos en los que ya estás inscrito para no perderte ninguno.',
                        side: 'top',
                        align: 'center'
                    }
                },
                {
                    element: '#nav-ajustes',
                    popover: {
                        title: '⚙️ Tu Perfil',
                        description: 'Configura tus datos, tema oscuro y preferencias o cierra sesión aquí.',
                        side: 'top',
                        align: 'center'
                    }
                }
            ],
            onDestroyed: () => {
                localStorage.setItem('hasSeenTour', 'true');
            }
        });

        // Small delay to ensure DOM is ready
        setTimeout(() => {
            driverObj.drive();
        }, 1500);

    }, []);

    return null; // Logic component, no UI
}

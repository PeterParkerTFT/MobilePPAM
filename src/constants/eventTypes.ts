// Importar imágenes de eventos
import carritoImg from 'figma:asset/b5f9bc8cf8ae2256196253f91d15438b6e5511fa.png';
import guiasImg from 'figma:asset/14b8cb294160b12e248fbaa4047291c642239991.png';

export interface EventType {
  id: string;
  label: string;
  icon: string;
  image?: string;
  color: string;
  description: string;
}

export const eventTypes: EventType[] = [
  {
    id: 'expositores',
    label: 'Expositores',
    icon: '🎤',
    image: carritoImg, // Usando imagen de carrito como ejemplo
    color: '139, 92, 246', // Violeta
    description: 'Expositor en stand de testificación pública'
  },
  {
    id: 'guias',
    label: 'Guías',
    icon: '👥',
    image: guiasImg, // Usando imagen de predicación informal
    color: '59, 130, 246', // Azul
    description: 'Guía para grupos de predicación'
  },
  {
    id: 'escuelas',
    label: 'Escuelas',
    icon: '🎓',
    color: '16, 185, 129', // Verde
    description: 'Asistencia a escuelas y capacitaciones'
  },
  {
    id: 'editoriales',
    label: 'Editoriales',
    icon: '📰',
    color: '245, 158, 11', // Naranja
    description: 'Trabajo editorial y publicaciones'
  },
  {
    id: 'encuestas',
    label: 'Encuestas',
    icon: '📊',
    color: '168, 85, 247', // Púrpura
    description: 'Encuestas y formularios'
  },
  {
    id: 'bodega',
    label: 'Bodega',
    icon: '📦',
    color: '236, 72, 153', // Rosa
    description: 'Gestión de bodega y suministros'
  }
];

export const getEventType = (id: string): EventType | undefined => {
  return eventTypes.find(type => type.id === id);
};

export const getEventColor = (id: string): string => {
  const type = getEventType(id);
  return type?.color || '107, 87, 184'; // Violeta por defecto
};

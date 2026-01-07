// Importar imágenes de métodos de predicación
import predicacionInformalImg from 'figma:asset/14b8cb294160b12e248fbaa4047291c642239991.png';
import carritoPublicoImg from 'figma:asset/b5f9bc8cf8ae2256196253f91d15438b6e5511fa.png';

export interface PredicacionType {
  id: string;
  label: string;
  icon: string;
  image?: string;
  color: string;
  description: string;
}

export const predicacionTypes: PredicacionType[] = [
  {
    id: 'informal',
    label: 'Predicación Informal',
    icon: '🚶',
    image: predicacionInformalImg,
    color: '139, 92, 246', // Violeta
    description: 'Testificación informal, casa en casa'
  },
  {
    id: 'carrito',
    label: 'Testigo Público',
    icon: '🛒',
    image: carritoPublicoImg,
    color: '59, 130, 246', // Azul
    description: 'Carrito de literatura en lugares públicos'
  },
  {
    id: 'telefonica',
    label: 'Predicación Telefónica',
    icon: '📞',
    color: '16, 185, 129', // Verde
    description: 'Testificación por teléfono'
  },
  {
    id: 'carta',
    label: 'Predicación por Carta',
    icon: '✉️',
    color: '245, 158, 11', // Naranja
    description: 'Testificación mediante cartas'
  },
  {
    id: 'virtual',
    label: 'Predicación Virtual',
    icon: '💻',
    color: '168, 85, 247', // Púrpura
    description: 'Testificación por medios digitales'
  }
];

export const getPredicacionType = (id: string): PredicacionType | undefined => {
  return predicacionTypes.find(type => type.id === id);
};

export const getPredicacionColor = (id: string): string => {
  const type = getPredicacionType(id);
  return type?.color || '107, 87, 184'; // Violeta por defecto
};


import { Toy } from './types';

export const DEFAULT_TOY_IMAGE = 'https://placehold.co/400x400/fbbf24/ffffff?text=Leopold+Toy';

export const TOYS: Toy[] = [
  {
    id: '1',
    name: 'Набір LEGO "Весела Ферма"',
    price: 1200,
    category: 'lego',
    ageRange: '4-7',
    images: ['https://picsum.photos/seed/lego1/400/400'],
    description: 'Великий набір конструктора для розвитку дрібної моторики.'
  },
  {
    id: '2',
    name: 'Радіокерований Джип 4х4',
    price: 1550,
    discountPrice: 1299,
    category: 'cars',
    ageRange: '6-12',
    images: ['https://picsum.photos/seed/car1/400/400'],
    description: 'Потужний позашляховик на великих колесах. Долає будь-які перешкоди!'
  },
  {
    id: '3',
    name: 'Велика Лялька "Марічка"',
    price: 850,
    category: 'dolls',
    ageRange: '3-6',
    images: ['https://picsum.photos/seed/doll1/400/400'],
    description: 'Інтерактивна лялька, що вміє розмовляти та співати пісні.'
  },
  {
    id: '4',
    name: 'Пазли "Карта Світу" (500 ел.)',
    price: 420,
    discountPrice: 350,
    category: 'puzzles',
    ageRange: '8+',
    images: ['https://picsum.photos/seed/puzzle1/400/400'],
    description: 'Пізнавальна гра для всієї родини. Вивчай географію граючись!'
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'Всі іграшки' },
  { id: 'lego', name: 'LEGO та конструктори' },
  { id: 'cars', name: 'Машинки та роботи' },
  { id: 'dolls', name: 'Ляльки та будиночки' },
  { id: 'puzzles', name: 'Пазли' },
  { id: 'educational', name: 'Навчання та розвиток' },
  { id: 'soft-toys', name: 'М’які іграшки' }
];

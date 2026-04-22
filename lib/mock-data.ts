import type { MockPackage } from './types';

// Deterministic IDs so SSR/hydration don't disagree.
const id = (n: number) => `mock-${n}`;

export const sampleList: MockPackage[] = [
  {
    id: id(1),
    supplier: 'NOVARUM',
    code: 'C.01',
    date: 'Ayer 10:25 am',
    reference: 'b.234',
    items: [],
    isConfirmed: false,
  },
  {
    id: id(2),
    supplier: 'FERREMAX',
    code: 'C.02',
    date: 'Hoy 8:40 am',
    reference: 'b.510',
    items: [],
    isConfirmed: false,
  },
  {
    id: id(3),
    supplier: 'NOVARUM',
    code: 'C.03',
    date: 'Ayer 10:25 am',
    reference: 'b.234',
    items: [
      { id: id(31), name: 'CONECTOR ADAPTADOR HEMBRA EAGLE 110V SALIDA MACHO EAGLE 220V', received: 10, requested: 20 },
      { id: id(32), name: 'CONECTOR ADAPTADOR HEMBRA EAGLE 110V SALIDA MACHO EAGLE 220V', received: 0,  requested: 0  },
      { id: id(33), name: 'LADRILLO', received: 40, requested: 20 },
    ],
    isConfirmed: false,
  },
];

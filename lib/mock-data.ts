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
    items: [
      { id: id(11), name: 'VIGA METÁLICA HG 150×50×3mm', received: 12, requested: 12 },
      { id: id(12), name: 'PERNO ANCLAJE M20×200 GALVANIZADO', received: 48, requested: 48 },
      { id: id(13), name: 'PLACA BASE 400×400×16mm',   received: 8,  requested: 10 },
    ],
    isConfirmed: false,
  },
  {
    id: id(2),
    supplier: 'FERREMAX',
    code: 'C.02',
    date: 'Hoy 8:40 am',
    reference: 'b.510',
    items: [
      { id: id(21), name: 'CEMENTO PORTLAND GRIS 50kg',            received: 80, requested: 80 },
      { id: id(22), name: 'ARENA FINA LAVADA 1m³',                 received: 15, requested: 15 },
      { id: id(23), name: 'MALLA ELECTROSOLDADA 6mm 6×2.20m',       received: 20, requested: 24 },
      { id: id(24), name: 'ALAMBRE RECOCIDO #18 1kg',              received: 12, requested: 12 },
    ],
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
      { id: id(33), name: 'LADRILLO HUECO 12×18×24cm',                                      received: 40, requested: 20 },
    ],
    isConfirmed: false,
  },
];

export interface MockPackageItem {
  id: string;
  name: string;
  received: number;
  requested: number;
}

export const isExcess = (i: MockPackageItem) => i.received > i.requested;
export const delta = (i: MockPackageItem) => i.received - i.requested;

export interface MockPackage {
  id: string;
  supplier: string;
  code: string;
  date: string;
  reference: string;
  items: MockPackageItem[];
  isConfirmed: boolean;
}

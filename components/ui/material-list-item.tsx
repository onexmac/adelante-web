'use client';

/**
 * MaterialListItem — single row inside an expanded PackageCard. Item name on
 * the left, MaterialBadge on the right showing received count with a
 * yellow progress arc representing received/requested.
 *
 * Matches Figma v0.1.00 ("materialList", node 677:2515).
 */

import type { MockPackageItem } from '@/lib/types';
import { MaterialBadge } from './material-badge';

export interface MaterialListItemProps {
  item: MockPackageItem;
}

export function MaterialListItem({ item }: MaterialListItemProps) {
  const progress =
    item.requested > 0
      ? item.received / item.requested
      : item.received > 0
      ? 1
      : 0;

  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex-1 text-[12px] font-bold uppercase leading-tight tracking-wide">
        {item.name}
      </div>
      <MaterialBadge count={item.received} progress={progress} />
    </div>
  );
}

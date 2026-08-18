import { SIconSortArrowDown } from '@v2/assets/icons/SIconSortArrowDown/SIconSortArrowDown';
import { SIconSortArrowUp } from '@v2/assets/icons/SIconSortArrowUp/SIconSortArrowUp';
import { SIconUnfolderMore } from '@v2/assets/icons/SIconUnfolderMore/SIconUnfolderMore';
import { STableHRow } from '@v2/components/organisms/STable/common/STableHRow/STableHRow';

import type {
  ChemicalProductTableSort,
  ChemicalProductTableSortField,
} from './chemical-product-table-view.util';

export function ChemicalProductTableHeaderRow({
  text,
  field,
  sort,
  onSortField,
  justify,
}: {
  text: string;
  field?: ChemicalProductTableSortField;
  sort: ChemicalProductTableSort | null;
  onSortField?: (field: ChemicalProductTableSortField) => void;
  justify?: 'flex-start' | 'center' | 'flex-end';
}) {
  const direction = field && sort?.field === field ? sort.order : undefined;
  const clickable = Boolean(field && onSortField);

  return (
    <STableHRow
      clickable={clickable}
      justify={justify}
      boxProps={
        clickable && field && onSortField
          ? { onClick: () => onSortField(field) }
          : undefined
      }
    >
      {text}
      {clickable && !direction ? <SIconUnfolderMore /> : null}
      {direction === 'desc' ? <SIconSortArrowUp color="primary.main" /> : null}
      {direction === 'asc' ? <SIconSortArrowDown color="primary.main" /> : null}
    </STableHRow>
  );
}

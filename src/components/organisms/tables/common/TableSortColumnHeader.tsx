import { BoxProps } from '@mui/material';
import { STableActionHRow } from '@v2/components/organisms/STable/common/STableActionHRow/STableActionHRow';
import { FormApplicationHeaderMenu } from '@v2/components/organisms/STable/implementation/SFormApplicationTable/components/FormApplicationHeaderMenu/FormApplicationHeaderMenu';
import { mapOrderByTable } from '@v2/components/organisms/STable/helpers/map-order-by-table.helper';
import { STableHRow } from 'components/atoms/STable';

export type TableSortColumnHeaderProps<T extends string> = BoxProps & {
  label: string;
  sortField?: T;
  activeSort?: { field: T; order: 'asc' | 'desc' } | null;
  onSort: (field: T, order: 'asc' | 'desc') => void;
  onHideColumn?: () => void;
  onClearTable: () => void;
};

export function TableSortColumnHeader<T extends string>({
  label,
  sortField,
  activeSort,
  onSort,
  onHideColumn,
  onClearTable,
  justifyContent,
  ...boxProps
}: TableSortColumnHeaderProps<T>) {
  const orderByMap = mapOrderByTable<T>(
    activeSort ? [{ field: activeSort.field, order: activeSort.order }] : [],
  );

  const showMenu = !!sortField || !!onHideColumn;

  if (!showMenu) {
    return (
      <STableHRow {...boxProps} sx={{ justifyContent }}>
        {label}
      </STableHRow>
    );
  }

  return (
    <STableActionHRow
      boxProps={{
        justifyContent: justifyContent ?? 'flex-start',
        ...boxProps,
      }}
      direction={sortField ? orderByMap[sortField] : 'hide'}
      menu={({ close }) => (
        <FormApplicationHeaderMenu
          close={close}
          setOrderBy={
            sortField
              ? (order) => {
                  if (order === 'asc' || order === 'desc') {
                    onSort(sortField, order);
                  }
                }
              : undefined
          }
          onHidden={onHideColumn}
          onClean={onClearTable}
        />
      )}
    >
      {label}
    </STableActionHRow>
  );
}

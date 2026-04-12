import { FC } from 'react';

import { BoxProps } from '@mui/material';
import { STableActionHRow } from '@v2/components/organisms/STable/common/STableActionHRow/STableActionHRow';
import { FormApplicationHeaderMenu } from '@v2/components/organisms/STable/implementation/SFormApplicationTable/components/FormApplicationHeaderMenu/FormApplicationHeaderMenu';
import { mapOrderByTable } from '@v2/components/organisms/STable/helpers/map-order-by-table.helper';
import { STableHRow } from 'components/atoms/STable';

import { StoredEmployeeSort } from '../employeeTable.storage';
import { EmployeeListSortBy } from '../employeeTable.types';

export type EmployeesTableSortHeaderProps = BoxProps & {
  label: string;
  sortField?: EmployeeListSortBy;
  activeSort?: StoredEmployeeSort | null;
  onSort: (field: EmployeeListSortBy, order: 'asc' | 'desc') => void;
  onHideColumn?: () => void;
  onClearTable: () => void;
};

export const EmployeesTableSortHeader: FC<EmployeesTableSortHeaderProps> = ({
  label,
  sortField,
  activeSort,
  onSort,
  onHideColumn,
  onClearTable,
  justifyContent,
  ...boxProps
}) => {
  const orderByMap = mapOrderByTable<EmployeeListSortBy>(
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
};

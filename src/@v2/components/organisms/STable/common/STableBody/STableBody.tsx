/* eslint-disable react/no-children-prop */
import { useMemo, useState } from 'react';

import STableEmpty from '../../addons/addons-table/STableEmpty/STableEmpty';
import { STableLoadMore } from '../../addons/addons-table/STableLoadMore/STableLoadMore';
import { STSTableBody } from './STableBody.styles';
import { STableBodyProps } from './STableBody.types';

export function STableBody<T>({
  renderRow,
  rowsData,
  rowsInitialNumber = 8,
  numberRowsToLoadMore = 100,
  hideLoadMore,
  hideEmpty,
  contentEmpty,
  ...props
}: STableBodyProps<T>) {
  const [numberRows, setNumberRows] = useState(rowsInitialNumber);

  const handelMoreRows = () => {
    setNumberRows(numberRows + numberRowsToLoadMore);
  };

  const rows = useMemo(() => {
    return rowsData.slice(0, numberRows);
  }, [numberRows, rowsData]);

  return (
    <>
      <STSTableBody gap={5} {...props}>
        {rows.map((row, index) => renderRow(row, index))}
      </STSTableBody>
      {!hideEmpty && rows.length === 0 && (
        <STableEmpty children={contentEmpty} />
      )}
      {!hideLoadMore && (
        <STableLoadMore
          actualRows={rows.length}
          totalRows={rowsData.length}
          onClick={handelMoreRows}
        />
      )}
    </>
  );
}

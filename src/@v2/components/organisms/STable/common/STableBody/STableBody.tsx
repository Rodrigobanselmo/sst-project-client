import STableEmpty from '../../addons/addons-table/STableEmpty/STableEmpty';
import { STSTableBody } from './STableBody.styles';
import { STableBodyProps } from './STableBody.types';

export function STableBody<T>({
  renderRow,
  rows,
  hideEmpty,
  contentEmpty,
  ...props
}: STableBodyProps<T>) {
  return (
    <>
      <STSTableBody gap={3} {...props}>
        {rows.map((row, index) => renderRow(row, index))}
      </STSTableBody>
      {!hideEmpty && rows.length === 0 && (
        <STableEmpty children={contentEmpty} />
      )}
    </>
  );
}

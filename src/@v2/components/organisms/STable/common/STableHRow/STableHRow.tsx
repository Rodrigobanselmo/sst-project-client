import { FC, PropsWithChildren } from 'react';

import { BoxProps } from '@mui/material';
import { STSTableHRow } from './STableHRow.styles';

export interface ISTableHRowProps extends PropsWithChildren {
  clickable?: boolean;
  anchorEl?: React.RefObject<HTMLDivElement>;
  justify?: 'flex-start' | 'center' | 'flex-end';
  boxProps?: BoxProps;
}

export const STableHRow: FC<ISTableHRowProps> = ({
  children,
  clickable,
  anchorEl,
  boxProps,
  justify,
}) => {
  return (
    <STSTableHRow
      ref={anchorEl}
      justifyContent={justify}
      alignItems={'center'}
      clickable={clickable}
      fontSize={13}
      {...boxProps}
    >
      {children}
    </STSTableHRow>
  );
};

// export interface ITableSortLabel<T>
//   extends Omit<TableSortLabelProps, 'onChange'> {
//   direction?: 'asc' | 'desc';
//   orderBy?: T;
//   name: T;
//   onChange: (name?: T, direction?: 'asc' | 'desc') => void;
// }

// export function STableSortHRow<T>({
//   name,
//   direction,
//   orderBy,
//   onChange,
//   children,
// }: ITableSortLabel<T>) {
//   const onChangeSort = () => {
//     if (orderBy !== name) onChange(name, 'asc');
//     else if (!direction || direction === 'asc') onChange(name, 'desc');
//     else onChange();
//   };

//   return (
//     <MTableSortLabel
//       direction={direction}
//       active={orderBy === name}
//       onClick={onChangeSort}
//     >
//       {children}
//     </MTableSortLabel>
//   );
// }

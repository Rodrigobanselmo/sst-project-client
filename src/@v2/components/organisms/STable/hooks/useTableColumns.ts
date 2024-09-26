import { useMemo } from 'react';

type IUseTableColumnsProps = {
  column: string;
  header: React.ReactNode;
  row: (row: any) => React.ReactNode;
}[];

export const useTableColumns = (table: IUseTableColumnsProps) => {
  const { columns, headers, rows } = useMemo(() => {
    return {
      columns: table.map(({ column }) => column),
      headers: table.map(({ header }) => header),
      rows: table.map(({ row }) => row),
    };
  }, [table]);

  return { columns, headers, rows };
};

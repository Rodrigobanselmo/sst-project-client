import { FC, useMemo, useState } from 'react';

import { Box, Paper, Typography } from '@mui/material';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { persistKeys, usePersistedState } from '@v2/hooks/usePersistState';
import { useTablePageLimit } from '@v2/hooks/useTablePageLimit';
import { useFetchEsocialTable27 } from '@v2/services/esocial/esocial-table-27/hooks/useFetchEsocialTable27';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoleEnum } from 'project/enum/roles.enums';

import {
  EsocialTable27ColumnEnum,
  esocialTable27Columns,
  EsocialTable27OrderBy,
  sortEsocialTable27,
} from './esocial-table-27-columns';
import { ESocialTable27Table } from './components/ESocialTable27Table';

export const ESocialTable27ListPage: FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState<EsocialTable27OrderBy | null>(null);

  const [hiddenColumns, setHiddenColumns] = usePersistedState<
    Record<string, boolean>
  >(persistKeys.COLUMNS_ESOCIAL_TABLE_27, {});

  const { pageLimit, pageSizeOptions, createPageSizeChangeHandler } =
    useTablePageLimit(undefined, persistKeys.LIMIT_ESOCIAL_TABLE_27);

  const onPageSizeChange = createPageSizeChangeHandler((patch) => {
    if (patch.page) setPage(patch.page);
  });

  const { data, isLoading } = useFetchEsocialTable27();

  const allRows = useMemo(() => data?.data ?? [], [data]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return allRows;
    return allRows.filter(
      (row) =>
        row.code.toLowerCase().includes(term) ||
        row.name.toLowerCase().includes(term),
    );
  }, [allRows, search]);

  const sortedRows = useMemo(
    () => sortEsocialTable27(filteredRows, orderBy),
    [filteredRows, orderBy],
  );

  const total = sortedRows.length;

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageLimit;
    return sortedRows.slice(start, start + pageLimit);
  }, [sortedRows, page, pageLimit]);

  const handleOrderBy = (field: EsocialTable27ColumnEnum) => {
    setOrderBy((prev) => {
      if (prev?.field !== field) return { field, order: 'asc' };
      if (prev.order === 'asc') return { field, order: 'desc' };
      return null;
    });
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <SAuthShow roles={[RoleEnum.MASTER]}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box>
          <Typography variant="h5">
            Tabela 27 eSocial — Procedimentos Diagnósticos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Consulta dos procedimentos diagnósticos da Tabela 27 do eSocial,
            utilizados nos eventos de SST.
          </Typography>
        </Box>

        <Paper sx={{ p: 2 }}>
          <STableSearch search={search} onSearch={handleSearch}>
            <STableSearchContent>
              <STableColumnsButton
                showLabel
                columns={esocialTable27Columns}
                hiddenColumns={hiddenColumns}
                setHiddenColumns={setHiddenColumns}
              />
            </STableSearchContent>
          </STableSearch>

          <ESocialTable27Table
            data={pageRows}
            isLoading={isLoading}
            hiddenColumns={hiddenColumns}
            orderBy={orderBy}
            onOrderBy={handleOrderBy}
            pagination={{ total, limit: pageLimit, page }}
            setPage={setPage}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={onPageSizeChange}
          />
        </Paper>
      </Box>
    </SAuthShow>
  );
};

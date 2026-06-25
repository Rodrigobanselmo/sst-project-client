import { FC } from 'react';

import { Box, BoxProps, Link as MuiLink } from '@mui/material';
import NextLink from 'next/link';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STagButton } from 'components/atoms/STagButton';
import { ModalUploadFile } from 'components/organisms/modals/ModalUploadFile';

import SDatabaseIcon from 'assets/icons/SDatabaseIcon';
import SDownloadIcon from 'assets/icons/SDownloadIcon';
import SUploadIcon from 'assets/icons/SUploadIcon';

import { RoutesEnum } from 'core/enums/routes.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { useMutDownloadFile } from 'core/services/hooks/mutations/general/useMutDownloadFile';
import { useMutUploadFile } from 'core/services/hooks/mutations/general/useMutUploadFile';
import { useQueryDatabaseTable } from 'core/services/hooks/queries/useQueryDatabaseTable';
import { sortString } from 'core/utils/sorts/string.sort';

export const DatabaseTable: FC<{ children?: any } & BoxProps> = () => {
  const { data, isLoading } = useQueryDatabaseTable();
  const { onOpenModal } = useModal();
  const downloadMutation = useMutDownloadFile();
  const uploadMutation = useMutUploadFile();

  const { handleSearchChange, results } = useTableSearch({
    data,
    keys: ['name'],
    sort: (a, b) => sortString(a, b, 'name'),
  });

  return (
    <>
      <STableTitle icon={SDatabaseIcon}>Banco de dados</STableTitle>
      <Box mb={2} display="flex" flexDirection="column" gap={0.5}>
        <MuiLink
          component={NextLink}
          href={RoutesEnum.DATABASE_CATALOG_EQUIVALENCES}
          underline="hover"
        >
          Equivalências de Catálogo
        </MuiLink>
        <MuiLink
          component={NextLink}
          href={RoutesEnum.DATABASE_BIOLOGICAL_INDICATORS}
          underline="hover"
        >
          Indicadores Biológicos NR-07
        </MuiLink>
        <MuiLink
          component={NextLink}
          href={RoutesEnum.DATABASE_ESOCIAL_TABLE_27}
          underline="hover"
        >
          Tabela 27 eSocial
        </MuiLink>
      </Box>
      <STableSearch onChange={(e) => handleSearchChange(e.target.value)} />
      <STable
        loading={isLoading}
        columns="minmax(200px, 1fr) minmax(100px, 150px) minmax(100px, 150px)"
      >
        <STableHeader>
          <STableHRow>Tabelas</STableHRow>
          <STableHRow justifyContent="center">Baixar</STableHRow>
          <STableHRow justifyContent="center">Enviar</STableHRow>
        </STableHeader>
        <STableBody<(typeof data)[0]>
          rowsData={results}
          renderRow={(row) => {
            return (
              <STableRow key={row.id}>
                <TextIconRow text={row.name} />
                <STagButton
                  text="Baixar"
                  loading={
                    downloadMutation.isLoading &&
                    !!downloadMutation.variables &&
                    !!downloadMutation.variables.includes(row.path)
                  }
                  onClick={() =>
                    downloadMutation.mutate(row.path + '/download')
                  }
                  large
                  icon={SDownloadIcon}
                />
                <STagButton
                  text="Enviar"
                  large
                  icon={SUploadIcon}
                  onClick={() =>
                    onOpenModal(ModalEnum.UPLOAD, row.path + '/upload')
                  }
                />
              </STableRow>
            );
          }}
        />
      </STable>
      <ModalUploadFile
        loading={uploadMutation.isLoading}
        onConfirm={async (files: File[], path: string) =>
          await uploadMutation.mutateAsync({
            file: files[0],
            path: path,
          })
        }
        maxFiles={1}
        accept={
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      />
    </>
  );
};

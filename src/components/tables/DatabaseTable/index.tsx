import { FC } from 'react';

import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import { BoxProps } from '@mui/material';
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
import { ModalUploadFile } from 'components/modals/ModalUploadFile';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { useMutDownloadFile } from 'core/services/hooks/mutations/useMutDownloadFile';
import { useMutUploadFile } from 'core/services/hooks/mutations/useMutUploadFile';
import { useQueryDatabaseTable } from 'core/services/hooks/queries/useQueryDatabaseTable';
import { sortString } from 'core/utils/sorts/string.sort';

export const DatabaseTable: FC<BoxProps> = () => {
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
      <STableTitle icon={LibraryAddCheckIcon}>Checklist</STableTitle>
      <STableSearch onChange={(e) => handleSearchChange(e.target.value)} />
      <STable
        loading={isLoading}
        columns="minmax(200px, 1fr) minmax(100px, 150px) minmax(100px, 150px)"
      >
        <STableHeader>
          <STableHRow>Checklist</STableHRow>
          <STableHRow justifyContent="center">Importar</STableHRow>
          <STableHRow justifyContent="center">Exportar</STableHRow>
        </STableHeader>
        <STableBody<typeof data[0]>
          rowsData={results}
          renderRow={(row) => {
            return (
              <STableRow key={row.id}>
                <TextIconRow text={row.name} />
                <STagButton
                  text="Importar"
                  loading={downloadMutation.isLoading}
                  onClick={() =>
                    downloadMutation.mutate(ApiRoutesEnum.DOWNLOAD_RISKS)
                  }
                  large
                  icon={FileDownloadOutlinedIcon}
                />
                <STagButton
                  text="Exportar"
                  large
                  icon={FileUploadOutlinedIcon}
                  onClick={() => onOpenModal(ModalEnum.UPLOAD)}
                />
              </STableRow>
            );
          }}
        />
      </STable>
      <ModalUploadFile
        loading={uploadMutation.isLoading}
        onConfirm={(files: File[]) =>
          uploadMutation.mutate({
            file: files[0],
            path: ApiRoutesEnum.UPLOAD_RISKS,
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
import { FC } from 'react';

import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import { Box, BoxProps } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import { STableButton } from 'components/atoms/STable/components/STableButton';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import { STableAddButton } from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STagButton } from 'components/atoms/STagButton';
import { ModalAddRiskGroup } from 'components/organisms/modals/ModalAddRiskGroup';
import { ModalSelectDocPgr } from 'components/organisms/modals/ModalSelectDocPgr';
import { initialWorkspaceSelectState } from 'components/organisms/modals/ModalSelectWorkspace';
import { ModalShowHierarchyTree } from 'components/organisms/modals/ModalShowHierarchyTree';
import { ModalViewDocDownload } from 'components/organisms/modals/ModalViewDocDownloads';
import { initialViewDocDownloadState } from 'components/organisms/modals/ModalViewDocDownloads/hooks/useModalViewDocDownload';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dayjs from 'dayjs';
import { StatusEnum } from 'project/enum/status.enum';

import SDownloadIcon from 'assets/icons/SDownloadIcon';
import { SReloadIcon } from 'assets/icons/SReloadIcon';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { IPrgDocData } from 'core/interfaces/api/IRiskData';
import {
  IQueryDocVersion,
  useQueryDocVersions,
} from 'core/services/hooks/queries/useQueryDocVersions/useQueryDocVersions';
import { queryClient } from 'core/services/queryClient';

export const DocTable: FC<
  BoxProps & {
    documentPcmsoId?: string;
    rowsPerPage?: number;
    query?: Partial<IQueryDocVersion>;
  }
> = ({ rowsPerPage = 8, query }) => {
  const { page, setPage } = useTableSearchAsync();
  const {
    data: docs,
    isLoading,
    count,
    isFetching,
    isRefetching,
    refetch,
  } = useQueryDocVersions(page, { ...query }, rowsPerPage);
  const { onOpenModal } = useModal();
  const { companyId } = useGetCompanyId();

  const handleEditStatus = (status: StatusEnum) => {
    // TODO edit checklist status
  };

  const handleOpenDocModal = (doc: IPrgDocData) => {
    onOpenModal(ModalEnum.DOCUMENT_DOWNLOAD, {
      id: doc.id,
      companyId,
    } as typeof initialViewDocDownloadState);
  };

  const onGenerateVersion = async () => {
    const initialWorkspaceState = {
      title: 'Selecione o estabelecimento para o Sistema de Gestão SST',
      onSelect: (work: IWorkspace) =>
        onOpenModal(ModalEnum.DOCUMENT_DATA_UPSERT, {
          workspaceId: work.id,
          workspaceName: work.name,
          companyId,
        }),
    } as typeof initialWorkspaceSelectState;

    onOpenModal(ModalEnum.WORKSPACE_SELECT, initialWorkspaceState);
  };

  return (
    <>
      <SFlex mb={12} mt={30} align="center">
        <Box>
          <STableTitle mb={0} mr={5} icon={LibraryAddCheckIcon}>
            Versões
          </STableTitle>
        </Box>
        <STableAddButton
          addText="Adicionar"
          sm
          onAddClick={() => onGenerateVersion()}
        />
        <STableButton
          tooltip="autualizar"
          onClick={() => {
            refetch();
            queryClient.invalidateQueries([QueryEnum.DOCUMENT_VERSION]);
          }}
          loading={isLoading || isFetching || isRefetching}
          sx={{ height: 30, minWidth: 30, ml: 2 }}
          icon={SReloadIcon}
          color="grey.500"
        />
      </SFlex>
      <STable
        rowsNumber={rowsPerPage}
        loading={isLoading}
        columns="minmax(200px, 1fr) minmax(200px, 2fr) minmax(200px, 2fr) 100px 120px 100px 100px"
      >
        <STableHeader>
          <STableHRow>Identificação</STableHRow>
          <STableHRow>Descrição</STableHRow>
          <STableHRow>Estabelecimento</STableHRow>
          <STableHRow justifyContent="center">Versão</STableHRow>
          <STableHRow justifyContent="center">Criação</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
          <STableHRow justifyContent="center">Download</STableHRow>
        </STableHeader>
        <STableBody<typeof docs[0]>
          hideLoadMore
          rowsData={docs}
          renderRow={(row) => {
            const processing = row.status == StatusEnum.PROCESSING;
            const isError =
              processing &&
              dayjs(row.created_at).add(3, 'hour').isBefore(dayjs());

            return (
              <STableRow key={row.id}>
                <TextIconRow text={row.name || '--'} />
                <TextIconRow text={row.description || '--'} />
                <TextIconRow text={row.workspaceName || '--'} />
                <TextIconRow text={row.version} justifyContent="center" />
                <TextIconRow
                  text={dayjs(row.created_at).format('DD/MM/YYYY')}
                  justifyContent="center"
                />
                <StatusSelect
                  large
                  sx={{ maxWidth: '120px' }}
                  selected={isError ? StatusEnum.ERROR : row.status}
                  loading={isError ? false : processing}
                  statusOptions={[]}
                  disabled
                  handleSelectMenu={(option) => handleEditStatus(option.value)}
                />
                <STagButton
                  text="Baixar"
                  onClick={() => handleOpenDocModal(row)}
                  large
                  disabled={
                    processing ||
                    dayjs(row.created_at).add(7, 'days').isBefore(dayjs())
                  }
                  icon={SDownloadIcon}
                />
                {/* <STagButton
                  text="Baixar"
                  loading={
                    downloadMutation.isLoading &&
                    !!downloadMutation.variables &&
                    !!downloadMutation.variables.includes(row.id)
                  }
                  onClick={() =>
                    downloadMutation.mutate(
                      ApiRoutesEnum.DOCUMENTS_BASE + `/${row.id}/${companyId}`,
                    )
                  }
                  large
                  icon={SDownloadIcon}
                /> */}
              </STableRow>
            );
          }}
        />
      </STable>
      <STablePagination
        mt={2}
        registersPerPage={rowsPerPage}
        totalCountOfRegisters={isLoading ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
      <ModalAddRiskGroup />
      <ModalShowHierarchyTree />
      <ModalSelectDocPgr />
      <ModalViewDocDownload />
    </>
  );
};

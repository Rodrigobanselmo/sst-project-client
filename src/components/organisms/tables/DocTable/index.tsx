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
import STableSearch, {
  STableAddButton,
} from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { initialMainDocState } from 'components/organisms/modals/ModalAddDocVersion/hooks/useMainActions';
import { ModalAddRiskGroup } from 'components/organisms/modals/ModalAddRiskGroup';
import { ModalSelectDocPgr } from 'components/organisms/modals/ModalSelectDocPgr';
import { initialWorkspaceSelectState } from 'components/organisms/modals/ModalSelectWorkspace';
import { ModalShowHierarchyTree } from 'components/organisms/modals/ModalShowHierarchyTree';
import { ModalViewDocDownload } from 'components/organisms/modals/ModalViewDocDownloads';
import { initialViewDocDownloadState } from 'components/organisms/modals/ModalViewDocDownloads/hooks/useModalViewDocDownload';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dayjs from 'dayjs';
import { DocumentTypeEnum } from 'project/enum/document.enums';
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
import { IRiskDocument } from 'core/interfaces/api/IRiskData';
import {
  IQueryDocVersion,
  useQueryDocVersions,
} from 'core/services/hooks/queries/useQueryDocVersions/useQueryDocVersions';
import { queryClient } from 'core/services/queryClient';

export const DocTable: FC<
  { children?: any } & BoxProps & {
      hideTitle?: boolean;
      rowsPerPage?: number;
      query?: Partial<IQueryDocVersion>;
      type: DocumentTypeEnum;
    }
> = ({ rowsPerPage = 8, hideTitle, query, type }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();
  const {
    data: docs,
    isLoading,
    count,
    isFetching,
    isRefetching,
    refetch,
  } = useQueryDocVersions(
    page,
    {
      search,
      ...query,
      type,
    },
    rowsPerPage,
  );
  const { onOpenModal } = useModal();
  const { companyId } = useGetCompanyId();

  const handleEditStatus = (status: StatusEnum) => {
    // TODO edit checklist status
  };

  const documentMap: Record<DocumentTypeEnum, { title: string }> = {
    [DocumentTypeEnum.PGR]: {
      title: 'PGR',
    },
    [DocumentTypeEnum.PCSMO]: {
      title: 'PCMSO',
    },
    [DocumentTypeEnum.OTHER]: {
      title: 'Outros',
    },
  };

  const handleOpenDocModal = (doc: IRiskDocument) => {
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
          type,
        } as typeof initialMainDocState),
    } as typeof initialWorkspaceSelectState;

    onOpenModal(ModalEnum.WORKSPACE_SELECT, initialWorkspaceState);
  };

  return (
    <>
      {!hideTitle && (
        <STableTitle mr={5} icon={LibraryAddCheckIcon}>
          Versões{' '}
          <SText component="span" fontSize={14} fontWeight="600">
            ({documentMap[type]?.title})
          </SText>
        </STableTitle>
      )}

      <STableSearch
        onAddClick={() => onGenerateVersion()}
        onChange={(e) => handleSearchChange(e.target.value)}
      >
        <STableButton
          tooltip="autualizar"
          onClick={() => {
            refetch();
            queryClient.invalidateQueries([QueryEnum.DOCUMENT_VERSION]);
          }}
          loading={isLoading || isFetching || isRefetching}
          icon={SReloadIcon}
          color="grey.500"
        />
      </STableSearch>

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
        <STableBody<(typeof docs)[0]>
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

import { FC, useCallback } from 'react';

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
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
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
import { ModalShowHierarchyTree } from 'components/organisms/modals/ModalShowHierarchyTree';
import { ModalViewDocDownload } from 'components/organisms/modals/ModalViewDocDownloads';
import { initialViewDocDownloadState } from 'components/organisms/modals/ModalViewDocDownloads/hooks/useModalViewDocDownload';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dayjs from 'dayjs';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';

import SDownloadIcon from 'assets/icons/SDownloadIcon';
import { SDeleteIcon } from 'assets/icons/SDeleteIcon';
import { SReloadIcon } from 'assets/icons/SReloadIcon';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IRiskDocument } from 'core/interfaces/api/IRiskData';
import {
  IQueryDocVersion,
  useQueryDocVersions,
} from 'core/services/hooks/queries/useQueryDocVersions/useQueryDocVersions';
import { useMutDeleteDocVersion } from 'core/services/hooks/mutations/checklist/documentData/useMutDeleteDocVersion/useMutDeleteDocVersion';
import { queryClient } from 'core/services/queryClient';

export const DocTable: FC<
  { children?: any } & BoxProps & {
      hideTitle?: boolean;
      rowsPerPage?: number;
      query?: Partial<IQueryDocVersion>;
      type: DocumentTypeEnum;
      workspaceId?: string;
      workspaceName?: string;
    }
> = ({ rowsPerPage = 8, hideTitle, query, type, workspaceId, workspaceName }) => {
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
  const { preventDelete } = usePreventAction();
  const deleteDocVersion = useMutDeleteDocVersion();

  const isDownloadExpired = useCallback(
    (createdAt: string | Date) =>
      dayjs(createdAt).add(7, 'days').isBefore(dayjs()),
    [],
  );

  const getDeleteConfirmMessage = useCallback(
    (doc: IRiskDocument) => {
      const processing = doc.status === StatusEnum.PROCESSING;
      const downloadExpired = isDownloadExpired(doc.created_at);

      if (processing) {
        return 'Este documento ainda está em processamento. Tem certeza que deseja excluí-lo?';
      }

      if (!downloadExpired) {
        return 'Este documento ainda está disponível para download. Tem certeza que deseja excluí-lo?';
      }

      return 'Tem certeza que deseja excluir este documento?';
    },
    [isDownloadExpired],
  );

  const handleDeleteDoc = useCallback(
    (doc: IRiskDocument) => {
      preventDelete(
        async () => {
          await deleteDocVersion
            .mutateAsync({ id: doc.id, companyId })
            .catch(() => {});
        },
        getDeleteConfirmMessage(doc),
      );
    },
    [companyId, deleteDocVersion, getDeleteConfirmMessage, preventDelete],
  );

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
    [DocumentTypeEnum.PERICULOSIDADE]: {
      title: 'PERICULOSIDADE',
    },
    [DocumentTypeEnum.LTCAT]: {
      title: 'LTCAT',
    },
    [DocumentTypeEnum.INSALUBRIDADE]: {
      title: 'INSALUBRIDADE',
    },
    [DocumentTypeEnum.OTHER]: {
      title: 'Outros',
    },
  };

  const handleOpenDocModal = (doc: IRiskDocument) => {
    onOpenModal(ModalEnum.DOCUMENT_DOWNLOAD, {
      id: doc.id,
      companyId,
      documentType: type,
    } as typeof initialViewDocDownloadState);
  };

  const onGenerateVersion = async () => {
    if (!workspaceId) return;
    onOpenModal(ModalEnum.DOCUMENT_DATA_UPSERT, {
      workspaceId,
      workspaceName: workspaceName || '',
      companyId,
      type,
    } as typeof initialMainDocState);
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

      <STableSearch onAddClick={() => onGenerateVersion()} onChange={(e) => handleSearchChange(e.target.value)}>
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
        columns="minmax(200px, 1fr) minmax(200px, 2fr) minmax(200px, 2fr) 100px 120px 100px 130px"
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
            const downloadExpired = isDownloadExpired(row.created_at);

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
                <SFlex
                  align="center"
                  justifyContent="flex-end"
                  gap={1}
                  className="table-row-box"
                  sx={{ width: '100%', pr: 1 }}
                >
                  <STagButton
                    text="Baixar"
                    onClick={() => handleOpenDocModal(row)}
                    large
                    disabled={processing || downloadExpired}
                    icon={SDownloadIcon}
                    sx={{ flexShrink: 0 }}
                  />
                  <IconButtonRow
                    icon={<SDeleteIcon />}
                    tooltipTitle="Excluir"
                    sx={{
                      flexShrink: 0,
                      width: 32,
                      height: 32,
                      mx: 0,
                      svg: { fontSize: 18, color: 'grey.600' },
                    }}
                    disabled={
                      deleteDocVersion.isLoading &&
                      deleteDocVersion.variables?.id === row.id
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDoc(row);
                    }}
                  />
                </SFlex>
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

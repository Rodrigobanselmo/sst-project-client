import { FC } from 'react';

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
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STagButton } from 'components/atoms/STagButton';
import { ModalAddRiskGroup } from 'components/organisms/modals/ModalAddRiskGroup';
import { ModalSelectCompany } from 'components/organisms/modals/ModalSelectCompany';
import { ModalSelectDocPgr } from 'components/organisms/modals/ModalSelectDocPgr';
import { ModalShowHierarchyTree } from 'components/organisms/modals/ModalShowHierarchyTree';
import { ModalViewPgrDoc } from 'components/organisms/modals/ModalViewPgrDoc';
import { initialViewPgrDocState } from 'components/organisms/modals/ModalViewPgrDoc/hooks/useModalViewPgrDoc';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dayjs from 'dayjs';
import { StatusEnum } from 'project/enum/status.enum';

import SDownloadIcon from 'assets/icons/SDownloadIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { IPrgDocData } from 'core/interfaces/api/IRiskData';
import { useMutDownloadFile } from 'core/services/hooks/mutations/general/useMutDownloadFile';
import { useQueryPrgDocs } from 'core/services/hooks/queries/useQueryPrgDocs';

export const DocPgrTable: FC<BoxProps & { riskGroupId: string }> = ({
  riskGroupId,
}) => {
  const { data, isLoading } = useQueryPrgDocs(riskGroupId);
  const { onOpenModal } = useModal();
  const downloadMutation = useMutDownloadFile();
  const { companyId } = useGetCompanyId();

  const handleEditStatus = (status: StatusEnum) => {
    console.log(status); // TODO edit checklist status
  };

  const handleOpenDocModal = (doc: IPrgDocData) => {
    onOpenModal(ModalEnum.PGR_DOC_VIEW, {
      id: doc.id,
      companyId,
      riskGroupId,
    } as typeof initialViewPgrDocState);
  };

  return (
    <>
      <STableTitle icon={LibraryAddCheckIcon}>Versões</STableTitle>
      <STable
        mb={20}
        loading={isLoading}
        columns="minmax(200px, 1fr) minmax(200px, 2fr) minmax(200px, 2fr) 100px 120px 100px 100px"
      >
        <STableHeader>
          <STableHRow>Identificação</STableHRow>
          <STableHRow>Nome</STableHRow>
          <STableHRow>Estabelecimento</STableHRow>
          <STableHRow justifyContent="center">Versão</STableHRow>
          <STableHRow justifyContent="center">Criação</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
          <STableHRow justifyContent="center">Download</STableHRow>
        </STableHeader>
        <STableBody<typeof data[0]>
          rowsData={data}
          renderRow={(row) => {
            const processing = row.status == StatusEnum.PROCESSING;
            const isError =
              processing &&
              dayjs(row.created_at).add(1, 'day').isBefore(dayjs());

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
                  disabled={processing}
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
                      ApiRoutesEnum.DOCUMENTS_PGR + `/${row.id}/${companyId}`,
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
      <ModalAddRiskGroup />
      <ModalShowHierarchyTree />
      <ModalSelectCompany />
      <ModalSelectDocPgr />
      <ModalViewPgrDoc />
    </>
  );
};

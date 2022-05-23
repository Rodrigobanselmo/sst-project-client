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
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dayjs from 'dayjs';
import { StatusEnum } from 'project/enum/status.enum';

import SDownloadIcon from 'assets/icons/SDownloadIcon';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useMutDownloadFile } from 'core/services/hooks/mutations/useMutDownloadFile';
import { useQueryPrgDocs } from 'core/services/hooks/queries/useQueryPrgDocs';

export const DocPgrTable: FC<BoxProps & { riskGroupId: string }> = ({
  riskGroupId,
}) => {
  const { data, isLoading } = useQueryPrgDocs(riskGroupId);
  const downloadMutation = useMutDownloadFile();
  const { companyId } = useGetCompanyId();

  const handleEditStatus = (status: StatusEnum) => {
    console.log(status); // TODO edit checklist status
  };

  console.log('variables', downloadMutation.variables);

  return (
    <>
      <STableTitle icon={LibraryAddCheckIcon}>Versões</STableTitle>
      <STable
        mb={20}
        loading={isLoading}
        columns="minmax(200px, 1fr) minmax(200px, 2fr) 100px 120px 100px 100px"
      >
        <STableHeader>
          <STableHRow>Identificação</STableHRow>
          <STableHRow>Descrição</STableHRow>
          <STableHRow justifyContent="center">Versão</STableHRow>
          <STableHRow justifyContent="center">Criação</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
          <STableHRow justifyContent="center">Download</STableHRow>
        </STableHeader>
        <STableBody<typeof data[0]>
          rowsData={data}
          renderRow={(row) => {
            return (
              <STableRow key={row.id}>
                <TextIconRow text={row.name || '--'} height={'100%'} />
                <TextIconRow text={row.description || '--'} height={'100%'} />
                <TextIconRow
                  text={row.version}
                  height={'100%'}
                  justifyContent="center"
                />
                <TextIconRow
                  text={dayjs(row.created_at).format('DD/MM/YYYY')}
                  height={'100%'}
                  justifyContent="center"
                />
                <StatusSelect
                  large
                  sx={{ maxWidth: '120px', justifyContent: 'flex-start' }}
                  selected={row.status}
                  statusOptions={[
                    StatusEnum.PROGRESS,
                    StatusEnum.ACTIVE,
                    StatusEnum.INACTIVE,
                  ]}
                  disabled
                  handleSelectMenu={(option) => handleEditStatus(option.value)}
                />
                <STagButton
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
                />
              </STableRow>
            );
          }}
        />
      </STable>
      <ModalAddRiskGroup />
    </>
  );
};

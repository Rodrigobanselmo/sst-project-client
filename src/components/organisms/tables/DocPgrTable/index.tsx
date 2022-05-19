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
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STagButton } from 'components/atoms/STagButton';
import {
  initialRiskGroupState,
  ModalAddRiskGroup,
} from 'components/organisms/modals/ModalAddRiskGroup';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { StatusEnum } from 'project/enum/status.enum';

import SDownloadIcon from 'assets/icons/SDownloadIcon';
import EditIcon from 'assets/icons/SEditIcon';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { useMutDownloadFile } from 'core/services/hooks/mutations/useMutDownloadFile';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';
import { sortData } from 'core/utils/sorts/data.sort';

export const DocPgrTable: FC<BoxProps> = () => {
  const { data, isLoading } = useQueryRiskGroupData();
  const { onOpenModal } = useModal();
  const downloadMutation = useMutDownloadFile();
  const { push } = useRouter();
  const { companyId } = useGetCompanyId();

  const { handleSearchChange, results } = useTableSearch({
    data,
    keys: ['name'],
    sort: (a, b) => sortData(a, b, 'created_at'),
  });

  const handleEditStatus = (status: StatusEnum) => {
    console.log(status); // TODO edit checklist status
  };

  const handleEditRiskGroup = (data: IRiskGroupData) => {
    onOpenModal(ModalEnum.RISK_GROUP_ADD, {
      id: data.id,
      name: data.name,
      status: data.status,
    } as typeof initialRiskGroupState);
  };

  const handleGoToRiskData = (row: IRiskGroupData) => {
    push(
      RoutesEnum.RISK_DATA.replace(/:companyId/g, row.companyId).replace(
        /:riskGroupId/g,
        row.id,
      ),
    );
  };

  return (
    <>
      <STableTitle icon={LibraryAddCheckIcon}>Empresas</STableTitle>
      <STableSearch
        onAddClick={() => onOpenModal(ModalEnum.RISK_GROUP_ADD)}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <STable
        loading={isLoading}
        columns="minmax(200px, 2fr) minmax(200px, 1fr) 70px 90px 100px"
      >
        <STableHeader>
          <STableHRow>Descrição</STableHRow>
          <STableHRow>Criação</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
          <STableHRow justifyContent="center">Download</STableHRow>
        </STableHeader>
        <STableBody<typeof data[0]>
          rowsData={results}
          maxHeight={500}
          renderRow={(row) => {
            return (
              <STableRow clickable key={row.id}>
                <TextIconRow
                  onClick={() => handleGoToRiskData(row)}
                  text={row.name}
                  height={'100%'}
                />
                <TextIconRow
                  onClick={() => handleGoToRiskData(row)}
                  text={dayjs(row.created_at).format('DD/MM/YYYY')}
                  height={'100%'}
                />
                <IconButtonRow
                  onClick={() => handleEditRiskGroup(row)}
                  icon={<EditIcon />}
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
                    !!downloadMutation.variables.includes(
                      ApiRoutesEnum.DOWNLOAD_EMPLOYEES,
                    )
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
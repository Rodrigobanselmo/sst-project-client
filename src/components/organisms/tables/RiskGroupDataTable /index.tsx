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
import { ModalAddRiskGroup } from 'components/organisms/modals/ModalAddRiskGroup';
import { ModalSelectCompany } from 'components/organisms/modals/ModalSelectCompany';
import { ModalSelectDocPgr } from 'components/organisms/modals/ModalSelectDocPgr';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { StatusEnum } from 'project/enum/status.enum';

import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { useMutDownloadFile } from 'core/services/hooks/mutations/useMutDownloadFile';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';
import { sortData } from 'core/utils/sorts/data.sort';

export const RiskGroupDataTable: FC<BoxProps> = () => {
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
    // onOpenModal(ModalEnum.RISK_GROUP_ADD, {
    //   id: data.id,
    //   name: data.name,
    //   status: data.status,
    // } as typeof initialRiskGroupState);
    push(
      RoutesEnum.PGR_DOCUMENT.replace(/:companyId/g, data.companyId).replace(
        /:docId/g,
        data.id,
      ),
    );
  };

  // const handleGoToRiskData = (row: IRiskGroupData) => {
  //   push(
  //     RoutesEnum.RISK_DATA.replace(/:companyId/g, row.companyId).replace(
  //       /:riskGroupId/g,
  //       row.id,
  //     ),
  //   );
  // };

  return (
    <>
      <STableTitle
        mb={15}
        subtitle="Todos os documentos, riscos, exames e etc ficam vinculados a um Sistema de Gestão SST."
        icon={LibraryAddCheckIcon}
      >
        Gestão SST
      </STableTitle>
      <STableSearch
        onAddClick={() => onOpenModal(ModalEnum.RISK_GROUP_ADD)}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <STable
        loading={isLoading}
        columns="minmax(200px, 2fr) minmax(200px, 1fr) 70px 90px"
      >
        <STableHeader>
          <STableHRow>Descrição</STableHRow>
          <STableHRow>Criação</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
          {/* <STableHRow justifyContent="center">Download</STableHRow> */}
        </STableHeader>
        <STableBody<typeof data[0]>
          rowsData={results}
          maxHeight={500}
          renderRow={(row) => {
            return (
              <STableRow
                onClick={() => handleEditRiskGroup(row)}
                clickable
                key={row.id}
              >
                <TextIconRow text={row.name} />
                <TextIconRow
                  text={dayjs(row.created_at).format('DD/MM/YYYY')}
                />
                <IconButtonRow
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  icon={<EditIcon />}
                />
                <StatusSelect
                  large
                  sx={{ maxWidth: '120px' }}
                  selected={row.status}
                  statusOptions={[
                    StatusEnum.PROGRESS,
                    StatusEnum.ACTIVE,
                    StatusEnum.INACTIVE,
                  ]}
                  handleSelectMenu={(option) => handleEditStatus(option.value)}
                />
                {/* <STagButton
                  text="Baixar"
                  loading={
                    downloadMutation.isLoading &&
                    !!downloadMutation.variables &&
                    !!downloadMutation.variables.includes(
                      ApiRoutesEnum.DOWNLOAD_EMPLOYEES,
                    )
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadMutation.mutate(
                      ApiRoutesEnum.DOCUMENTS_PGR + `/${row.id}/${companyId}`,
                    );
                  }}
                  large
                  icon={SDownloadIcon}
                /> */}
              </STableRow>
            );
          }}
        />
      </STable>
      <ModalAddRiskGroup />
      <ModalSelectCompany />
      <ModalSelectDocPgr />
    </>
  );
};

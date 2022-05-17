import { FC } from 'react';

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
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { useRouter } from 'next/router';
import { StatusEnum } from 'project/enum/status.enum';

import EditIcon from 'assets/icons/SEditIcon';
import SWorkspaceIcon from 'assets/icons/SWorkspaceIcon';

import { RoutesEnum } from 'core/enums/routes.enums';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

export const WorkplaceTable: FC<BoxProps> = () => {
  const { data, isLoading } = useQueryCompany();

  const { push } = useRouter();

  const handleEditStatus = (status: StatusEnum) => {
    console.log(status); // TODO edit checklist status
  };

  const handleGoToEmployee = (companyId: string, employeeId: number) => {
    console.log(employeeId); // TODO edit checklist status
    //push(`${RoutesEnum.COMPANIES}/${companyId}/${employeeId}`);
  };

  const handleGoToHierarchy = (companyId: string) => {
    push(RoutesEnum.HIERARCHY.replace(/:companyId/g, companyId));
  };

  return (
    <>
      <STableTitle
        color="text.light"
        fontSize={18}
        mb={8}
        mt={40}
        variant="body1"
        icon={SWorkspaceIcon}
      >
        Unidade (Área de trabalho)
      </STableTitle>
      <STable
        loading={isLoading}
        columns="minmax(200px, 5fr) minmax(150px, 1fr) minmax(100px, 150px) 80px 80px"
      >
        <STableHeader>
          <STableHRow>Nome</STableHRow>
          <STableHRow>Descrição</STableHRow>
          <STableHRow>Sigla</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<IWorkspace>
          rowsData={data.workspace || []}
          renderRow={(row) => {
            return (
              <STableRow key={row.id}>
                <TextIconRow text={row.name} />
                <TextIconRow text={row.description || ' -- '} />
                <TextIconRow
                  text={row.abbreviation}
                  onClick={() => handleGoToHierarchy(row.companyId)}
                />
                <StatusSelect
                  large
                  sx={{ maxWidth: '120px', justifyContent: 'flex-start' }}
                  selected={row.status}
                  statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
                  handleSelectMenu={(option) => handleEditStatus(option.value)}
                />
                <IconButtonRow
                  onClick={() => handleGoToEmployee(row.companyId, row.id)}
                  icon={<EditIcon />}
                />
              </STableRow>
            );
          }}
        />
      </STable>
    </>
  );
};

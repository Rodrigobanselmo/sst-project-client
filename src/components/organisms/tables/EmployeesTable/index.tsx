import { FC } from 'react';

import BadgeIcon from '@mui/icons-material/Badge';
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
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { useRouter } from 'next/router';
import { StatusEnum } from 'project/enum/status.enum';

import EditIcon from 'assets/icons/SEditIcon';

import { RoutesEnum } from 'core/enums/routes.enums';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { useQueryEmployees } from 'core/services/hooks/queries/useQueryEmployees';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { sortData } from 'core/utils/sorts/data.sort';

export const EmployeesTable: FC<BoxProps> = () => {
  const { data, isLoading } = useQueryEmployees();
  const { data: hierarchy, isLoading: loadHierarchy } = useQueryHierarchies();

  const { push } = useRouter();
  const { handleSearchChange, results } = useTableSearch({
    data,
    keys: ['name', 'cpf'],
    sort: (a, b) => sortData(a, b, 'name'),
  });

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
      <STableTitle icon={BadgeIcon}>Empregados</STableTitle>
      <STableSearch
        // onAddClick={() => onOpenModal(ModalEnum.CHECKLIST_ADD)}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <STable
        loading={isLoading}
        columns="minmax(200px, 5fr) minmax(150px, 1fr) minmax(100px, 150px) 90px 80px"
      >
        <STableHeader>
          <STableHRow>Nome</STableHRow>
          <STableHRow>Cargo</STableHRow>
          <STableHRow>CPF</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<typeof data[0]>
          rowsData={results}
          renderRow={(row) => {
            return (
              <STableRow key={row.id}>
                <TextIconRow text={row.name} />
                <TextIconRow
                  text={
                    hierarchy[row.hierarchyId] &&
                    hierarchy[row.hierarchyId].name
                  }
                  loading={loadHierarchy}
                  onClick={() => handleGoToHierarchy(row.companyId)}
                />
                <TextIconRow text={row.cpf} />
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

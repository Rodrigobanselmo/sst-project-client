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
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { ModalAddExcelEmployees } from 'components/organisms/modals/ModalAddExcelEmployees';
import { initialEditEmployeeState } from 'components/organisms/modals/ModalEditEmployee/hooks/useEditEmployee';
import { StackModalEditEmployee } from 'components/organisms/modals/ModalEditEmployee/ModalEditEmployee';
import { ModalSelectHierarchy } from 'components/organisms/modals/ModalSelectHierarchy';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { useRouter } from 'next/router';
import { StatusEnum } from 'project/enum/status.enum';

import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { useQueryEmployees } from 'core/services/hooks/queries/useQueryEmployees';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { cpfMask } from 'core/utils/masks/cpf.mask';

export const EmployeesTable: FC<
  BoxProps & { rowsPerPage?: number; hideModal?: boolean }
> = ({ rowsPerPage = 8, hideModal }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const { data: hierarchy, isLoading: loadHierarchy } = useQueryHierarchies();
  const {
    data: employees,
    isLoading: loadEmployees,
    count,
  } = useQueryEmployees(page, { search }, rowsPerPage);

  const { onOpenModal } = useModal();
  const { push } = useRouter();

  const handleEditStatus = (status: StatusEnum) => {
    // TODO edit checklist status
  };

  const handleGoToEmployee = (companyId: string, employeeId: number) => {
    //push(`${RoutesEnum.COMPANIES}/${companyId}/${employeeId}`);
  };

  const handleGoToHierarchy = (companyId: string) => {
    push(RoutesEnum.HIERARCHY.replace(/:companyId/g, companyId));
  };

  const onAddEmployee = () => {
    onOpenModal(ModalEnum.EMPLOYEES_ADD);
  };

  const onExportClick = () => {
    onOpenModal(ModalEnum.EMPLOYEES_EXCEL_ADD);
  };

  const onEditEmployee = (employee: IEmployee) => {
    onOpenModal(ModalEnum.EMPLOYEES_ADD, {
      id: employee.id,
      companyId: employee.companyId,
      cpf: cpfMask.mask(employee.cpf),
      name: employee.name.split(' - ')[0],
      status: employee.status,
      birthday: employee.birthday,
      isComorbidity: employee.isComorbidity,
      phone: employee.phone,
      email: employee.email,
      sex: employee.sex,
      socialName: employee.socialName,
      shiftId: employee.shiftId,
      esocialCode: employee.esocialCode,
      nickname: employee.nickname,
      hierarchyId: employee.hierarchyId,
      hierarchy: {
        id: employee.hierarchyId,
        name:
          hierarchy[employee.hierarchyId] &&
          hierarchy[employee.hierarchyId].name,
      } as any,
    } as typeof initialEditEmployeeState);
  };

  return (
    <>
      <STableTitle icon={BadgeIcon}>Funcionários</STableTitle>
      <STableSearch
        onAddClick={onAddEmployee}
        onExportClick={onExportClick}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <STable
        loading={loadEmployees}
        rowsNumber={rowsPerPage}
        columns="minmax(200px, 5fr) minmax(150px, 1fr) minmax(100px, 150px) 90px 80px"
      >
        <STableHeader>
          <STableHRow>Nome</STableHRow>
          <STableHRow>Cargo</STableHRow>
          <STableHRow>CPF</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<typeof employees[0]>
          rowsData={employees}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            return (
              <STableRow
                onClick={() => onEditEmployee(row)}
                clickable
                key={row.id}
              >
                <TextIconRow text={row.name} />
                <TextIconRow
                  text={
                    hierarchy[row.hierarchyId] &&
                    hierarchy[row.hierarchyId].name
                  }
                  loading={loadHierarchy}
                  fontSize={13}
                  mr={3}
                  // onClick={() => handleGoToHierarchy(row.companyId)}
                />
                <TextIconRow fontSize={14} text={cpfMask.mask(row.cpf)} />
                <StatusSelect
                  large
                  sx={{ maxWidth: '120px' }}
                  selected={row.status}
                  statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
                  handleSelectMenu={(option) => handleEditStatus(option.value)}
                />
                <IconButtonRow icon={<EditIcon />} />
              </STableRow>
            );
          }}
        />
      </STable>{' '}
      <STablePagination
        mt={2}
        registersPerPage={rowsPerPage}
        totalCountOfRegisters={loadEmployees ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
      {hideModal && (
        <>
          <StackModalEditEmployee />
          <ModalAddExcelEmployees />
          <ModalSelectHierarchy />
        </>
      )}
    </>
  );
};

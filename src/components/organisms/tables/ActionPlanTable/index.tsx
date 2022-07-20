import { FC } from 'react';

import BadgeIcon from '@mui/icons-material/Badge';
import { BoxProps } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
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
import { STag } from 'components/atoms/STag';
import SText from 'components/atoms/SText';
import { ModalAddEmployee } from 'components/organisms/modals/ModalAddEmployees';
import { initialEmployeeState } from 'components/organisms/modals/ModalAddEmployees/hooks/useEditEmployees';
import { ModalAddExcelEmployees } from 'components/organisms/modals/ModalAddExcelEmployees';
import { ModalSelectHierarchy } from 'components/organisms/modals/ModalSelectHierarchy';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { StatusEnum } from 'project/enum/status.enum';

import { SActionPlanIcon } from 'assets/icons/SActionPlanIcon';
import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import {
  IUpsertRiskDataRec,
  useMutUpsertRiskDataRec,
} from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskDataRec';
import { useQueryEmployees } from 'core/services/hooks/queries/useQueryEmployees';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { useQueryRiskDataPlan } from 'core/services/hooks/queries/useQueryRiskDataPlan';
import { useQueryRiskGroupDataOne } from 'core/services/hooks/queries/useQueryRiskGroupDataOne';
import { cpfMask } from 'core/utils/masks/cpf.mask';

export const ActionPlanTable: FC<BoxProps & { rowsPerPage?: number }> = ({
  rowsPerPage = 15,
}) => {
  const { push, query } = useRouter();
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const riskGroupDataId = query.riskGroupId as string;

  const { data: hierarchy, isLoading: loadHierarchy } = useQueryHierarchies();
  const { data: riskGroupData, isLoading: loadRiskGroup } =
    useQueryRiskGroupDataOne(riskGroupDataId);
  const {
    data: employees,
    isLoading: loadEmployees,
    count,
  } = useQueryRiskDataPlan(riskGroupDataId, page, {}, rowsPerPage);

  const upsertRiskRecMutation = useMutUpsertRiskDataRec(riskGroupDataId);
  const { onOpenModal } = useModal();

  const handleGoToEmployee = (companyId: string, employeeId: number) => {
    console.log(employeeId); // TODO edit checklist status
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
      workspaces: employee.workspaces,
      hierarchy: {
        id: employee.hierarchyId,
        name:
          hierarchy[employee.hierarchyId] &&
          hierarchy[employee.hierarchyId].name,
      } as any,
    } as typeof initialEmployeeState);
  };

  const onEditRiskDataRec = async (submit: IUpsertRiskDataRec) => {
    await upsertRiskRecMutation
      .mutateAsync({
        ...submit,
      })
      .catch(console.error);
  };

  const handleEditStatus = (
    status: StatusEnum,
    recMedId: string,
    riskFactorDataId: string,
  ) => {
    onEditRiskDataRec({ status, recMedId, riskFactorDataId });
  };

  const endRecGrid = '200px 110px 200px 200px';

  return (
    <>
      <STableTitle icon={SActionPlanIcon}>Plano de Ação</STableTitle>
      <STable
        loading={loadEmployees}
        rowsNumber={rowsPerPage}
        columns={`160px 160px 150px 20px 20px 120px 90px ${endRecGrid}`}
      >
        <STableHeader>
          <STableHRow fontSize={14}>Origem</STableHRow>
          <STableHRow fontSize={14} textAlign="center">
            Fatores de Risco Perigos
          </STableHRow>
          <STableHRow fontSize={14} textAlign="center">
            Fonte Geradora ou Atividade de Risco
          </STableHRow>
          <STableHRow fontSize={14} justifyContent="center">
            S
          </STableHRow>
          <STableHRow fontSize={14} justifyContent="center">
            P
          </STableHRow>
          <STableHRow fontSize={14} textAlign="center" justifyContent="center">
            Risco ocupaciona
          </STableHRow>
          <STableHRow fontSize={14} justifyContent="center">
            Intervenção
          </STableHRow>
          <STableHRow fontSize={14} justifyContent="center">
            Recomendações
          </STableHRow>
          <STableHRow fontSize={14} justifyContent="center">
            status
          </STableHRow>
          <STableHRow fontSize={14} justifyContent="center">
            Responsável
          </STableHRow>
          <STableHRow fontSize={14} justifyContent="center">
            Prazo
          </STableHRow>
        </STableHeader>
        <STableBody<typeof employees[0]>
          rowsData={employees}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            const recs = row?.recs || [];
            const gs = row?.generateSources?.map((gs) => gs.name).join(', ');
            return (
              <STableRow key={row.id} fontSize={14}>
                <TextIconRow
                  lineNumber={recs.length + 1}
                  text={row.origin}
                  fontSize={14}
                  tooltipTitle={row.origin}
                />
                <TextIconRow
                  lineNumber={recs.length + 1}
                  text={row?.riskFactor?.name}
                  fontSize={14}
                  tooltipTitle={row?.riskFactor?.name}
                />
                <TextIconRow
                  fontSize={14}
                  justifyContent="center"
                  lineNumber={recs.length + 1}
                  text={gs}
                  tooltipTitle={gs}
                />
                <TextIconRow
                  fontSize={14}
                  lineNumber={recs.length + 1}
                  justifyContent="center"
                  text={String(row?.riskFactor?.severity || '-')}
                />
                <TextIconRow
                  justifyContent="center"
                  fontSize={14}
                  text={String(row?.probability || '-')}
                />
                <STag
                  action={String(row.level) as any}
                  text={row?.ro || '--'}
                  maxHeight={24}
                />
                <TextIconRow
                  text={row?.intervention}
                  textAlign="center"
                  fontSize={12}
                  justifyContent="center"
                />
                <SFlex gridColumn={'8 / 12'} center direction="column">
                  {recs.map((rec) => {
                    const dataRec = (row.dataRecs || []).find(
                      (dr) => dr.recMedId === rec.id,
                    ) || {
                      responsibleName: '',
                      endDate: null,
                      status: StatusEnum.PENDING,
                    };

                    return (
                      <SFlex
                        gap={5}
                        gridTemplateColumns={endRecGrid}
                        display="grid"
                        py={2}
                        key={rec.id}
                        center
                        border="1px solid"
                        borderRadius={1}
                        borderColor="rgba(0, 0, 0, 0.2)"
                      >
                        <TextIconRow
                          width={'100%'}
                          fontSize={14}
                          minHeight={35}
                          maxHeight={35}
                          align="center"
                          textAlign="center"
                          justifyContent="center"
                          text={rec.recName}
                          tooltipTitle={rec.recName}
                        />
                        <StatusSelect
                          large={false}
                          selected={dataRec.status}
                          statusOptions={[
                            StatusEnum.PENDING,
                            StatusEnum.PROGRESS,
                            StatusEnum.DONE,
                            StatusEnum.CANCELED,
                          ]}
                          handleSelectMenu={(option) =>
                            handleEditStatus(option.value, rec.id, row.id)
                          }
                        />
                        <SFlex center>
                          <SInput
                            // autoFocus
                            // value={selectedNode?.label}
                            // onChange={(e) =>
                            // setEditNodeSelectedItem({ label: e.target.value })
                            // }
                            variant="standard"
                            // placeholder={nodeTypesConstant[type]?.placeholder}
                          />
                        </SFlex>
                        {/* <TextIconRow
                          text={dataRec.responsibleName}
                          textAlign="center"
                          fontSize={12}
                          justifyContent="center"
                        /> */}
                        <TextIconRow
                          text={
                            dataRec.endDate
                              ? dayjs(dataRec.endDate).format('DD/MM/YYYY')
                              : '--'
                          }
                          textAlign="center"
                          fontSize={12}
                          justifyContent="center"
                        />
                      </SFlex>
                    );
                  })}
                </SFlex>

                {/* <IconButtonRow
                  onClick={() => onEditEmployee(row)}
                  icon={<EditIcon />}
                /> */}
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
      <ModalAddEmployee />
      <ModalAddExcelEmployees />
      <ModalSelectHierarchy />
    </>
  );
};

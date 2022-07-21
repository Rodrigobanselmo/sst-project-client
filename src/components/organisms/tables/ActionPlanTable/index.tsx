import { FC, useState } from 'react';
import React from 'react';

import { Box, BoxProps } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SInputEdit } from 'components/atoms/SInputEdit';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STag } from 'components/atoms/STag';
import { STagButton } from 'components/atoms/STagButton';
import { ModalAddEmployee } from 'components/organisms/modals/ModalAddEmployees';
import { ModalAddExcelEmployees } from 'components/organisms/modals/ModalAddExcelEmployees';
import { ModalAddComment } from 'components/organisms/modals/ModalRiskDataComment';
import { initialCommentState } from 'components/organisms/modals/ModalRiskDataComment/hooks/useEditComments';
import { ModalSelectHierarchy } from 'components/organisms/modals/ModalSelectHierarchy';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { RiskRecTypeEnum } from 'project/enum/RiskRecType.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { SActionPlanIcon } from 'assets/icons/SActionPlanIcon';
import SDownloadIcon from 'assets/icons/SDownloadIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { useMutCreateDocPlanAction } from 'core/services/hooks/mutations/checklist/docs/useMutCreateDocPlanAction';
import {
  IUpsertRiskDataRec,
  useMutUpsertRiskDataRec,
} from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskDataRec';
import { useQueryRiskDataPlan } from 'core/services/hooks/queries/useQueryRiskDataPlan';
import { useQueryRiskGroupDataOne } from 'core/services/hooks/queries/useQueryRiskGroupDataOne';

export const ActionPlanTable: FC<BoxProps & { rowsPerPage?: number }> = ({
  rowsPerPage = 15,
}) => {
  const { push, query } = useRouter();
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();
  const [update, setUpdate] = useState(0);
  const riskGroupDataId = query.riskGroupId as string;
  const workspaceId = query.workspaceId as string;

  const { data: riskGroupData, isLoading: loadRiskGroup } =
    useQueryRiskGroupDataOne(riskGroupDataId);
  const {
    data: employees,
    isLoading: loadEmployees,
    count,
  } = useQueryRiskDataPlan(riskGroupDataId, workspaceId, page, {}, rowsPerPage);

  const upsertRiskRecMutation = useMutUpsertRiskDataRec(riskGroupDataId);
  const createActionPlan = useMutCreateDocPlanAction();

  const { onOpenModal } = useModal();

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
    if (status === StatusEnum.CANCELED) {
      return onOpenModal(ModalEnum.RISK_DATA_COMMENTS_ADD, {
        recMedId: recMedId,
        riskGroupDataId: riskGroupDataId,
        riskDataId: riskFactorDataId,
        type: RiskRecTypeEnum.CANCELED,
        status,
      } as typeof initialCommentState);
    }

    onEditRiskDataRec({ status, recMedId, riskFactorDataId });
  };

  const endRecGrid = '200px 110px 200px 100px';

  return (
    <>
      <STableTitle icon={SActionPlanIcon}>Plano de Ação</STableTitle>
      <STable
        loading={loadEmployees}
        rowsNumber={rowsPerPage}
        columns={`minmax(160px, 1fr) minmax(160px, 1fr) minmax(150px, 1fr) 120px 90px ${endRecGrid}`}
      >
        <STableHeader>
          <STableHRow fontSize={14}>Origem</STableHRow>
          <STableHRow fontSize={14} textAlign="center">
            Fatores de Risco Perigos
          </STableHRow>
          <STableHRow fontSize={14} textAlign="center" justifySelf={'center'}>
            Fonte Geradora <br />
            ou Atividade de Risco
          </STableHRow>
          {/* <STableHRow fontSize={14} justifyContent="center">
            S
          </STableHRow>
          <STableHRow fontSize={14} justifyContent="center">
            P
          </STableHRow> */}
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
            const level = row?.level || 0;
            const recs = row?.recs || [];
            const gs = row?.generateSources?.map((gs) => gs.name).join(', ');
            return (
              <STableRow key={row.id} fontSize={14}>
                <TextIconRow
                  lineNumber={recs.length + 1}
                  text={row.origin}
                  fontSize={13}
                  tooltipTitle={row.origin}
                />
                <TextIconRow
                  lineNumber={recs.length + 1}
                  text={row?.riskFactor?.name}
                  fontSize={13}
                  tooltipTitle={row?.riskFactor?.name}
                />
                <TextIconRow
                  fontSize={13}
                  justifyContent="center"
                  lineNumber={recs.length + 1}
                  text={gs}
                  tooltipTitle={gs}
                />
                {/* <TextIconRow
                  fontSize={14}
                  lineNumber={recs.length + 1}
                  justifyContent="center"
                  text={String(row?.riskFactor?.severity || '-')}
                /> */}
                {/* <TextIconRow
                  justifyContent="center"
                  fontSize={14}
                  text={String(row?.probability || '-')}
                /> */}
                <STag
                  action={String(row.level) as any}
                  text={row?.ro || '--'}
                  maxHeight={24}
                />
                <TextIconRow
                  text={row?.intervention}
                  textAlign="center"
                  fontSize={10}
                  justifyContent="center"
                />
                <SFlex gridColumn={'6 / 10'} center direction="column">
                  {recs.map((rec) => {
                    const dataRec = (row.dataRecs || []).find(
                      (dr) => dr.recMedId === rec.id,
                    ) || {
                      responsibleName: '',
                      endDate: null,
                      status: StatusEnum.PENDING,
                    };

                    const months = ((riskGroupData || {}) as any)[
                      `months_period_level_${level}`
                    ];

                    const getDue = () => {
                      if (dataRec.endDate) {
                        return dayjs(dataRec.endDate);
                      }

                      if (riskGroupData && months)
                        return dayjs(riskGroupData?.validityStartDate).add(
                          months + 1,
                          'months',
                        );

                      return false;
                    };

                    const due = getDue();
                    const isExpired = due ? due.isBefore(dayjs()) : false;
                    const dueText = due
                      ? due.format('D [de] MMMM YYYY')
                      : 'sem prazo';

                    const dueEdit = due
                      ? due.format('DD/MM/YYYY')
                      : 'sem prazo';

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
                          selected={
                            isExpired ? StatusEnum.EXPIRED : dataRec.status
                          }
                          tooltipTitle={'iohuiu'}
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
                        <Box px={3}>
                          <SInputEdit
                            fullWidth
                            InputProps={{
                              sx: {
                                fontSize: 12,
                                textTransform: 'uppercase',
                              },
                            }}
                            value={dataRec.responsibleName}
                            onSave={(value) =>
                              onEditRiskDataRec({
                                responsibleName: value,
                                recMedId: rec.id,
                                riskFactorDataId: row.id,
                              })
                            }
                            loading={
                              upsertRiskRecMutation.isLoading &&
                              upsertRiskRecMutation.variables &&
                              upsertRiskRecMutation.variables.recMedId ===
                                rec.id &&
                              upsertRiskRecMutation.variables
                                .riskFactorDataId === row.id
                            }
                            variant="standard"
                          />
                        </Box>
                        <TextIconRow
                          text={dueText}
                          px={2}
                          onClick={() =>
                            onOpenModal(ModalEnum.RISK_DATA_COMMENTS_ADD, {
                              recMedId: rec.id,
                              riskGroupDataId: riskGroupDataId,
                              riskDataId: row.id,
                              type: RiskRecTypeEnum.POSTPONED,
                              endDate: dueEdit,
                            } as typeof initialCommentState)
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
      <SFlex mt={10}>
        <STagButton
          text="Baixar e Atualizar Plano de Ação"
          large
          active
          bg="info.main"
          icon={SDownloadIcon}
          onClick={() =>
            createActionPlan.mutate({
              workspaceId,
              riskGroupId: riskGroupData?.id || '',
            })
          }
        />
      </SFlex>
      <ModalAddEmployee />
      <ModalAddExcelEmployees />
      <ModalSelectHierarchy />
      <ModalAddComment />
    </>
  );
};

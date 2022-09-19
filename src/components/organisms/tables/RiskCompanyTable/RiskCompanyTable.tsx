import { FC, useState } from 'react';

import { Box, BoxProps } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STag } from 'components/atoms/STag';
import { ITagActionColors } from 'components/atoms/STag/types';
import { STagRisk } from 'components/atoms/STagRisk';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { SCheckRiskDocInfo } from 'components/molecules/SCheckRiskDocInfo';
import { useOpenRiskTool } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/hooks/useOpenRiskTool';
import { initialExamState } from 'components/organisms/modals/ModalAddExam/hooks/useEditExams';

import { SExamIcon } from 'assets/icons/SExamIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IRiskDocInfo, IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useMutUpsertRiskDocInfo } from 'core/services/hooks/mutations/checklist/risk/useMutUpsertRiskDocInfo';
import { IQueryExam } from 'core/services/hooks/queries/useQueryExams/useQueryExams';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';
import { useQueryRisksCompany } from 'core/services/hooks/queries/useQueryRisksCompany/useQueryRisksCompany';

import { getExamAge, getExamPeriodic } from '../ExamsRiskTable/ExamsRiskTable';

export const RiskCompanyTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (risk: IRiskFactors) => void;
    selectedData?: IRiskFactors[];
    query?: IQueryExam;
  }
> = ({ rowsPerPage = 8, onSelectData, selectedData }) => {
  const [showRiskExam, setShowRiskExam] = useState(false);
  const { data: riskGroupData, isLoading: loadingRiskGroup } =
    useQueryRiskGroupData();

  const riskGroupId = riskGroupData?.[riskGroupData.length - 1]?.id;

  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const { onOpenRiskToolSelected } = useOpenRiskTool();

  const isSelect = !!onSelectData;
  const upsertRiskDocInfo = useMutUpsertRiskDocInfo();

  const {
    data: risks,
    isLoading: loadRisks,
    count,
  } = useQueryRisksCompany(page, { search }, rowsPerPage);

  const { onStackOpenModal } = useModal();

  const onChangeRiskDocInfo = (docInfo: Partial<IRiskDocInfo>) => {
    if (!docInfo.riskId) return;

    upsertRiskDocInfo.mutateAsync({
      ...docInfo,
      riskId: docInfo.riskId,
    });
  };

  const onAddExam = () => {
    onStackOpenModal(ModalEnum.EXAMS_ADD, {} as typeof initialExamState);
  };

  const onEditExam = (exam: IRiskFactors) => {
    onStackOpenModal(ModalEnum.EXAMS_ADD, {
      ...(exam as any),
    } as typeof initialExamState);
  };

  const onSelectRow = (exam: IRiskFactors) => {
    if (isSelect) {
      onSelectData(exam);
    } else onEditExam(exam);
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Tipo', column: '40px' },
    { text: 'Nome', column: 'minmax(250px, 400px)' },
  ];

  if (selectedData) header.unshift({ text: '', column: '15px' });

  return (
    <>
      {!isSelect && <STableTitle icon={SExamIcon}>Riscos</STableTitle>}
      <STableSearch
        onAddClick={onAddExam}
        onChange={(e) => handleSearchChange(e.target.value)}
      >
        <SFlex justify="end" flex={1}>
          <SSwitch
            onChange={() => {
              setShowRiskExam(!showRiskExam);
            }}
            label="Mostar origens"
            checked={showRiskExam}
            sx={{ mr: 4 }}
            color="text.light"
          />
        </SFlex>
      </STableSearch>
      <STable
        loading={loadRisks}
        rowsNumber={rowsPerPage}
        columns={header.map(({ column }) => column).join(' ')}
      >
        <STableHeader>
          {header.map(({ text, ...props }) => (
            <STableHRow key={text} {...props}>
              {text}
            </STableHRow>
          ))}
        </STableHeader>
        <STableBody<typeof risks[0]>
          rowsData={risks}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            return (
              <>
                <STableRow
                  onClick={() => onSelectRow(row)}
                  clickable
                  key={row.id}
                  minHeight={40}
                >
                  {selectedData && (
                    <SCheckBox
                      label=""
                      checked={
                        !!selectedData.find((exam) => exam.id === row.id)
                      }
                    />
                  )}
                  <STagRisk hideRiskName riskFactor={row} />
                  <TextIconRow clickable text={row.name || '-'} />
                  {showRiskExam && (
                    <Box gridColumn={'1 / 10'} mb={6} mt={-1}>
                      {row?.riskFactorData?.map((riskData) => {
                        return (
                          <SFlex
                            direction="row"
                            align="center"
                            key={riskData.id}
                            gap={2}
                          >
                            <SText lineHeight="1.4rem" fontSize={11} mt={0}>
                              <b>Origem:</b>{' '}
                              <SText
                                component="span"
                                sx={{
                                  borderRadius: '4px',
                                  mr: 1,
                                  backgroundColor: 'background.box',
                                  px: 3,
                                  py: '1px',
                                  border: '1px solid',
                                  borderColor: 'grey.400',
                                  '&:hover': {
                                    textDecoration: 'underline',
                                  },
                                }}
                                fontSize={11}
                                onClick={() =>
                                  onOpenRiskToolSelected({
                                    homogeneousGroup: riskData.homogeneousGroup,
                                    riskFactor: row,
                                    riskGroupId,
                                  })
                                }
                              >
                                {riskData.origin || ''}
                              </SText>
                            </SText>
                            <STag
                              action={
                                String(
                                  riskData.level,
                                ) as unknown as ITagActionColors
                              }
                              minHeight={10}
                              display="inline-block"
                              text={''}
                              minWidth={10}
                              sx={{ p: 0, m: 0 }}
                            />
                          </SFlex>
                        );
                      })}
                    </Box>
                  )}
                  {!showRiskExam && (
                    <Box gridColumn={'1 / 10'} mb={6} mt={-1}>
                      <SFlex gap={'10px'} flexWrap="wrap">
                        <Box
                          sx={{
                            backgroundColor: 'grey.100',
                            padding: '5px 10px 0px',
                            borderRadius: 1,
                          }}
                        >
                          <SText fontSize={13} mb={-2}>
                            Empresa
                          </SText>
                          <SCheckRiskDocInfo
                            onUnmount={upsertRiskDocInfo.isError}
                            onSelectCheck={(docInfo) =>
                              onChangeRiskDocInfo({
                                ...docInfo,
                                riskId: row.id,
                              })
                            }
                            riskDocInfo={row?.docInfo?.find(
                              (i) => !i.hierarchyId,
                            )}
                          />
                        </Box>

                        {row?.docInfo?.map((docInfo) => {
                          if (!docInfo.hierarchyId) return null;
                          return (
                            <Box
                              key={docInfo.id}
                              sx={{
                                backgroundColor: 'grey.100',
                                padding: '5px 10px 0px',
                                borderRadius: 1,
                              }}
                            >
                              <SText fontSize={13} mb={-2}>
                                (Cargo) {docInfo?.hierarchy?.name}
                              </SText>
                              <SCheckRiskDocInfo
                                onUnmount={upsertRiskDocInfo.isError}
                                onSelectCheck={(docInfo) =>
                                  onChangeRiskDocInfo({
                                    ...docInfo,
                                    riskId: row.id,
                                    hierarchyId: docInfo.hierarchyId,
                                  })
                                }
                                riskDocInfo={docInfo}
                              />
                            </Box>
                          );
                        })}
                      </SFlex>
                    </Box>
                  )}
                </STableRow>
              </>
            );
          }}
        />
      </STable>
      <STablePagination
        mt={2}
        registersPerPage={rowsPerPage}
        totalCountOfRegisters={loadRisks ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
    </>
  );
};

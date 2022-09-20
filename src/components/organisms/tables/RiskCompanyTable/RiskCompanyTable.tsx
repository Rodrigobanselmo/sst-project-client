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
import { SCheckRiskDocInfo } from 'components/molecules/SCheckRiskDocInfo';
import { useOpenRiskTool } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/hooks/useOpenRiskTool';
import { initialDocPgrSelectState } from 'components/organisms/modals/ModalSelectDocPgr';
import { useRouter } from 'next/router';

import { SRiskFactorIcon } from 'assets/icons/SRiskFactorIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { IRiskDocInfo, IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useMutUpsertRiskDocInfo } from 'core/services/hooks/mutations/checklist/risk/useMutUpsertRiskDocInfo';
import { IQueryExam } from 'core/services/hooks/queries/useQueryExams/useQueryExams';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';
import { useQueryRisksCompany } from 'core/services/hooks/queries/useQueryRisksCompany/useQueryRisksCompany';

export const RiskCompanyTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (risk: IRiskFactors) => void;
    selectedData?: IRiskFactors[];
    query?: IQueryExam;
  }
> = ({ rowsPerPage = 8, onSelectData, selectedData }) => {
  const [showOrigins, setShowRiskExam] = useState(false);
  const { data: riskGroupData, isLoading: loadingRiskGroup } =
    useQueryRiskGroupData();

  const riskGroupId = riskGroupData?.[riskGroupData.length - 1]?.id;

  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();
  const { push } = useRouter();
  const { onOpenRiskToolSelected, onStackOpenModal } = useOpenRiskTool();

  const isSelect = !!onSelectData;
  const upsertRiskDocInfo = useMutUpsertRiskDocInfo();

  const {
    data: risks,
    isLoading: loadRisks,
    count,
    companyId,
  } = useQueryRisksCompany(page, { search }, rowsPerPage);

  const onChangeRiskDocInfo = (docInfo: Partial<IRiskDocInfo>) => {
    if (!docInfo.riskId) return;

    upsertRiskDocInfo.mutateAsync({
      ...docInfo,
      riskId: docInfo.riskId,
    });
  };

  const onAddRisk = () => {
    onStackOpenModal(ModalEnum.DOC_PGR_SELECT, {
      title:
        'Selecione para qual Sistema de Gestão SST deseja adicionar os fatores de risco',
      onSelect: (docPgr: IRiskGroupData) =>
        push(
          RoutesEnum.RISK_DATA.replace(/:companyId/g, companyId).replace(
            /:riskGroupId/g,
            docPgr.id,
          ),
        ),
    } as Partial<typeof initialDocPgrSelectState>);
  };

  // const onEditExam = (exam: IRiskFactors) => {};

  const onSelectRow = (exam: IRiskFactors) => {
    if (isSelect) {
      onSelectData(exam);
    }
    //  else onEditExam(exam);
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Tipo', column: '40px' },
    { text: 'Nome', column: 'minmax(250px, 400px)' },
  ];

  if (selectedData) header.unshift({ text: '', column: '15px' });

  return (
    <>
      {!isSelect && (
        <STableTitle
          subtitle="List de fatores de risco e perigos identificados na empresa"
          icon={SRiskFactorIcon}
        >
          Fatores de risco e perigos
        </STableTitle>
      )}
      <STableSearch
        onAddClick={onAddRisk}
        onChange={(e) => handleSearchChange(e.target.value)}
      >
        <SFlex justify="end" flex={1}>
          <SSwitch
            onChange={() => {
              setShowRiskExam(!showOrigins);
            }}
            label="Mostar origens"
            checked={showOrigins}
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
                  {showOrigins && (
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
                  {!showOrigins && (
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
                            riskDocInfo={
                              row?.docInfo?.find(
                                (i) =>
                                  !i.hierarchyId && i.companyId === companyId,
                              ) || row?.docInfo?.find((i) => !i.hierarchyId)
                            }
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

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useCallback, useMemo, useState } from 'react';

import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { Box, Button, Typography } from '@mui/material';
import { useFetchBrowseRiskSubType } from '@v2/services/security/risk/sub-type/browse-sub-type/hooks/useFetchBrowseSubType';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import SFlex from 'components/atoms/SFlex';
import { SMenuSimpleFilter } from 'components/molecules/SMenuSearch/SMenuSimpleFilter';
import { STagSearchSelect } from 'components/molecules/STagSearchSelect';
import { riskFilter } from 'components/organisms/tagSelects/RiskSelect/constants/filters';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { RiskEnum } from 'project/enum/risk.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { queryClient } from 'core/services/queryClient';

import { initialAddRecMedState } from '../../hooks/useAddRecMed';

interface IEditRecMedSelects {
  recMedData: typeof initialAddRecMedState;
  setRecMedData: React.Dispatch<any>;
}

const generalRiskLabels: Record<RiskEnum, string> = {
  [RiskEnum.OUTROS]: 'Todos os agentes',
  [RiskEnum.QUI]: 'Todos os agentes químicos',
  [RiskEnum.FIS]: 'Todos os agentes físicos',
  [RiskEnum.BIO]: 'Todos os agentes biológicos',
  [RiskEnum.ACI]: 'Todos os fatores de acidentes',
  [RiskEnum.ERG]: 'Todos os fatores ergonômicos',
};

const riskLabel = (risk: IRiskFactors) =>
  risk.representAll ? generalRiskLabels[risk.type] || risk.name : risk.name;

type SubtypeRiskOption = IRiskFactors & {
  catalogRiskId?: string;
  riskSubTypeId?: number;
};

export const EditRecMedSelects: FC<{ children?: any } & IEditRecMedSelects> = ({
  setRecMedData,
  recMedData,
}) => {
  const { companyId: userCompanyId } = useGetCompanyId(true);

  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showGeneralRisks, setShowGeneralRisks] = useState(false);
  const [showSubtypeRisks, setShowSubtypeRisks] = useState(false);
  const { subTypes: chemicalSubtypes } = useFetchBrowseRiskSubType({
    companyId: userCompanyId || '',
    filters: { types: [RiskTypeEnum.QUI] },
    pagination: { page: 1, limit: 200 },
  });
  const { subTypes: ergonomicSubtypes } = useFetchBrowseRiskSubType({
    companyId: userCompanyId || '',
    filters: { types: [RiskTypeEnum.ERG] },
    pagination: { page: 1, limit: 200 },
  });
  const { subTypes: physicalSubtypes } = useFetchBrowseRiskSubType({
    companyId: userCompanyId || '',
    filters: { types: [RiskTypeEnum.FIS] },
    pagination: { page: 1, limit: 200 },
  });
  const { subTypes: biologicalSubtypes } = useFetchBrowseRiskSubType({
    companyId: userCompanyId || '',
    filters: { types: [RiskTypeEnum.BIO] },
    pagination: { page: 1, limit: 200 },
  });
  const { subTypes: accidentSubtypes } = useFetchBrowseRiskSubType({
    companyId: userCompanyId || '',
    filters: { types: [RiskTypeEnum.ACI] },
    pagination: { page: 1, limit: 200 },
  });
  const subtypeOptions = useMemo(() => {
    const risks =
      queryClient.getQueryData<IRiskFactors[]>([
        QueryEnum.RISK,
        userCompanyId,
      ]) || [];
    return [
      // Os ergonômicos devem aparecer antes do limite inicial de 20 itens
      // do menu; os químicos não podem ocultar essa categoria inteira.
      { type: RiskEnum.ERG, rows: ergonomicSubtypes?.results ?? [] },
      { type: RiskEnum.QUI, rows: chemicalSubtypes?.results ?? [] },
      { type: RiskEnum.FIS, rows: physicalSubtypes?.results ?? [] },
      { type: RiskEnum.BIO, rows: biologicalSubtypes?.results ?? [] },
      { type: RiskEnum.ACI, rows: accidentSubtypes?.results ?? [] },
    ].flatMap(({ type, rows }) => {
      const general = risks.find(
        (risk) => risk.representAll && risk.type === type,
      );
      if (!general) return [];
      return [...rows]
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
        .map(
          (subtype): SubtypeRiskOption => ({
            ...general,
            id: `${general.id}::subtype:${subtype.id}`,
            catalogRiskId: general.id,
            riskSubTypeId: subtype.id,
            name: `Todos do subtipo — ${subtype.name}`,
          }),
        );
    });
  }, [
    chemicalSubtypes,
    ergonomicSubtypes,
    physicalSubtypes,
    biologicalSubtypes,
    accidentSubtypes,
    userCompanyId,
  ]);
  const selectedSubtype = subtypeOptions.find(
    (option) => option.riskSubTypeId === recMedData.riskSubTypeId,
  );
  const allScopeOptions = useMemo(
    () =>
      [
        ...(
          queryClient.getQueryData<IRiskFactors[]>([
            QueryEnum.RISK,
            userCompanyId,
          ]) || []
        ).map((risk) => ({ ...risk, name: riskLabel(risk) })),
        ...subtypeOptions,
      ] as SubtypeRiskOption[],
    [subtypeOptions, userCompanyId],
  );
  const selectedScopes = recMedData.riskScopes?.length
    ? recMedData.riskScopes
    : recMedData.risk.id
      ? [
          {
            riskId: recMedData.risk.id,
            riskSubTypeId: recMedData.riskSubTypeId,
          },
        ]
      : [];
  const selectedScopeIds = selectedScopes.map((scope) =>
    scope.riskSubTypeId
      ? `${scope.riskId}::subtype:${scope.riskSubTypeId}`
      : scope.riskId,
  );
  const selectedScopeNames = selectedScopeIds.map(
    (id) => allScopeOptions.find((option) => option.id === id)?.name || id,
  );
  const handleSelectRisk = (
    selection: (string | number)[] | SubtypeRiskOption,
  ) => {
    const ids = Array.isArray(selection)
      ? selection.map(String)
      : [selection.id];
    const selected = ids.map((id) =>
      allScopeOptions.find((option) => option.id === id),
    );
    // Preserve the previous selection rather than silently dropping an
    // unavailable catalogue scope from an edited recommendation.
    if (selected.some((option) => !option)) return;
    const scopes = (selected as SubtypeRiskOption[]).map((option) => ({
      riskId: option.catalogRiskId ?? option.id,
      riskSubTypeId: option.riskSubTypeId ?? null,
    }));
    const first = selected[0];
    setRecMedData({
      ...recMedData,
      risk: first
        ? { ...first, id: first.catalogRiskId ?? first.id }
        : ({} as IRiskFactors),
      riskSubTypeId: first?.riskSubTypeId ?? null,
      riskScopes: scopes,
    });
  };

  const handleActiveRisk = useCallback(
    (filterFilter: string) => {
      if (activeFilters.includes(filterFilter))
        return setActiveFilters(
          activeFilters.filter((risk) => risk !== filterFilter),
        );

      return setActiveFilters([...activeFilters, filterFilter]);
    },
    [activeFilters, setActiveFilters],
  );

  const options = useMemo(() => {
    const risks = (
      queryClient.getQueryData<IRiskFactors[]>([
        QueryEnum.RISK,
        userCompanyId,
      ]) || []
    ).map((risk) => ({ ...risk, name: riskLabel(risk) }));

    if (showSubtypeRisks)
      return subtypeOptions.filter(
        (risk) => !activeFilters.length || activeFilters.includes(risk.type),
      );

    if (showGeneralRisks)
      return risks
        .filter(
          (risk) =>
            risk.representAll &&
            (!activeFilters.length || activeFilters.includes(risk.type)),
        )
        .sort((a, b) =>
          a.type === RiskEnum.OUTROS ? -1 : b.type === RiskEnum.OUTROS ? 1 : 0,
        );

    if (activeFilters.length > 0 && risks)
      return risks.filter((risk) => activeFilters.includes(risk.type));

    if (!recMedData.riskIds.length) return risks;

    return risks.map((risk) => ({
      ...risk,
      hideWithoutSearch: !recMedData.riskIds.includes(risk.id),
    }));
  }, [
    activeFilters,
    showGeneralRisks,
    showSubtypeRisks,
    subtypeOptions,
    recMedData.riskIds,
    userCompanyId,
  ]);

  return (
    <SFlex gap={8} mt={10} align="flex-start">
      <StatusSelect
        selected={recMedData.status}
        statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
        handleSelectMenu={(option: any) => {
          if (option?.value)
            setRecMedData({ ...recMedData, status: option.value });
        }}
      />

      {!recMedData.passDataBack && (
        <Box sx={{ minWidth: 0 }}>
          <STagSearchSelect
            multiple
            selected={selectedScopeIds}
            handleMultiSelectMenu={(_option, ids) => handleSelectRisk(ids)}
            options={options}
            error={recMedData?.risk?.id ? false : recMedData.hasSubmit}
            icon={ReportProblemOutlinedIcon}
            text={
              selectedScopes.length > 1
                ? `${selectedScopes.length} fatores e escopos selecionados`
                : selectedSubtype?.name ||
                  (recMedData.risk.name
                    ? riskLabel(recMedData.risk)
                    : 'nenhum selecionado')
            }
            keys={['name', 'type']}
            large={true}
            maxWidth={300}
            handleSelectMenu={handleSelectRisk}
            tooltipTitle={selectedScopeNames.join(' · ')}
            startAdornment={(options: IRiskFactors | undefined) => (
              <Box
                sx={{
                  backgroundColor: `risk.${options?.type.toLowerCase()}`,
                  color: 'common.white',
                  px: 3,
                  py: '1px',
                  borderRadius: 3,
                  fontSize: '0.7rem',
                  mr: 6,
                }}
              >
                {options?.type === RiskEnum.OUTROS && options?.representAll
                  ? 'Todos'
                  : options?.type}
              </Box>
            )}
            renderFilter={() => (
              <SFlex gap={0} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                  type="button"
                  size="small"
                  aria-label="Mostrar cadastros para todos os agentes ou por categoria"
                  aria-pressed={showGeneralRisks}
                  onClick={() => {
                    setActiveFilters([]);
                    setShowSubtypeRisks(false);
                    setShowGeneralRisks((current) => !current);
                  }}
                  sx={{
                    ml: 6,
                    px: 4,
                    py: '1px',
                    minWidth: 0,
                    fontSize: '12px',
                    lineHeight: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    color: 'text.primary',
                    bgcolor: showGeneralRisks
                      ? 'action.selected'
                      : 'action.hover',
                    border: '1px solid',
                    borderColor: showGeneralRisks ? 'primary.main' : 'divider',
                  }}
                >
                  Todos
                </Button>
                <Button
                  type="button"
                  size="small"
                  aria-pressed={showSubtypeRisks}
                  onClick={() => {
                    setActiveFilters([]);
                    setShowGeneralRisks(false);
                    setShowSubtypeRisks((current) => !current);
                  }}
                  sx={{
                    ml: 3,
                    px: 4,
                    py: '1px',
                    minWidth: 0,
                    fontSize: '12px',
                    lineHeight: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    color: 'text.primary',
                    bgcolor: showSubtypeRisks
                      ? 'action.selected'
                      : 'action.hover',
                    border: '1px solid',
                    borderColor: showSubtypeRisks ? 'primary.main' : 'divider',
                  }}
                >
                  Todos por subtipo
                </Button>
                <SMenuSimpleFilter
                  options={riskFilter}
                  activeFilters={activeFilters}
                  onClickFilter={handleActiveRisk}
                />
                {showSubtypeRisks && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ width: '100%', mx: 6, mt: 3 }}
                  >
                    Ergonômicos, incluindo psicossociais, e químicos. Use os
                    filtros acima para ver cada categoria.
                  </Typography>
                )}
              </SFlex>
            )}
            optionsFieldName={{ valueField: 'id', contentField: 'name' }}
          />
          {selectedScopes.length > 1 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                mt: 3,
                maxWidth: '420px',
                overflowWrap: 'anywhere',
              }}
            >
              {selectedScopeNames.join(' · ')}
            </Typography>
          )}
        </Box>
      )}
    </SFlex>
  );
};

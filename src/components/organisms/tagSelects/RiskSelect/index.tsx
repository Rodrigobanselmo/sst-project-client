import React, { FC, useCallback, useMemo, useState, MouseEvent } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import {
  Box,
  Button,
  Icon,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';
import { RiskSelectFilterBar } from './RiskSelectFilterBar';
import { initialAddRiskState } from 'components/organisms/modals/ModalAddRisk/hooks/useAddRisk';
import { RiskEnum } from 'project/enum/risk.enums';

import { useQuery } from 'react-query';
import { QueryEnum } from 'core/enums/query.enums';
import { queryExams as queryLinkedRisks } from 'core/services/hooks/queries/useQueryRisksCompany/useQueryRisksCompany';

import EditIcon from 'assets/icons/SEditIcon';
import { SScaleFactorPill } from 'components/atoms/SScaleFactorPill';
import { STagRisk } from 'components/atoms/STagRisk';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { riskMatchesActiveFilters } from 'core/utils/risk-chip.util';
import {
  mapRiskSelectSearchFields,
  normalizeRiskSelectSearchQuery,
  RISK_SELECT_FUSE_KEYS,
  toRiskSelectDomainOption,
} from 'core/utils/risk-select-search.util';
import { sortString } from 'core/utils/sorts/string.sort';

import { useQueryAllRisk } from '../../../../core/services/hooks/queries/useQueryRiskAll';
import { STagSearchSelect } from '../../../molecules/STagSearchSelect';
import { riskFilterErgonomicRow, riskFilterMainRow } from './constants/filters';
import { ITypeSelectProps } from './types';

const EMPTY_LINKED_RISKS: IRiskFactors[] = [];

export const RiskSelect: FC<{ children?: any } & ITypeSelectProps> = ({
  large,
  linkageContext,
  polished = false,
  hideRiskIcon = false,
  handleSelect,
  selectedRiskIds,
  text,
  multiple = true,
  ...props
}) => {
  const polishedAppearance = polished || !!linkageContext;
  const { data } = useQueryAllRisk();
  const [origin, setOrigin] = useState<'workspace' | 'company' | 'catalog'>(
    linkageContext?.workspaceId ? 'workspace' : 'company',
  );
  const effectiveOrigin =
    origin === 'workspace' && !linkageContext?.workspaceId ? 'company' : origin;
  const linkedRisks = useQuery(
    [
      QueryEnum.RISK,
      'company',
      'linkage-selector',
      linkageContext?.companyId,
      effectiveOrigin === 'workspace' ? linkageContext?.workspaceId : undefined,
    ],
    async () => {
      const risks: IRiskFactors[] = [];
      let count = 0;
      do {
        const page = await queryLinkedRisks(
          { skip: risks.length, take: 200 },
          {
            companyId: linkageContext!.companyId,
            workspaceId:
              effectiveOrigin === 'workspace'
                ? linkageContext?.workspaceId
                : undefined,
          },
        );
        count = page.count;
        if (!page.data.length && risks.length < count)
          throw new Error('Incomplete risk list');
        risks.push(...page.data);
      } while (risks.length < count);
      return risks;
    },
    {
      enabled: !!linkageContext?.companyId && effectiveOrigin !== 'catalog',
      staleTime: 0,
    },
  );
  const scopedData =
    linkageContext && effectiveOrigin !== 'catalog'
      ? linkedRisks.isError
        ? EMPTY_LINKED_RISKS
        : (linkedRisks.data ?? EMPTY_LINKED_RISKS)
      : data;
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { onStackOpenModal } = useModal();

  const resolveOriginalRisk = (option: IRiskFactors): IRiskFactors => {
    const original = data.find((risk) => risk.id === option.id);
    if (original) return original;
    return toRiskSelectDomainOption(
      option as IRiskFactors & { casDigits?: string },
    );
  };

  const handleSelectRisk = (options: string[] | IRiskFactors) => {
    if (!handleSelect) return;
    if (Array.isArray(options)) {
      handleSelect(options);
      return;
    }
    handleSelect(resolveOriginalRisk(options));
  };

  const handleAddRisk = () => {
    const inputSelect = document.getElementById(
      IdsEnum.INPUT_MENU_SEARCH,
    ) as HTMLInputElement;

    const name = inputSelect?.value || '';

    onStackOpenModal(ModalEnum.RISK_ADD, { name });
  };

  const handleEditRisk = (
    e: MouseEvent<HTMLButtonElement>,
    option?: IRiskFactors,
  ) => {
    e.stopPropagation();
    if (option) {
      const original = resolveOriginalRisk(option);
      onStackOpenModal(ModalEnum.RISK_ADD, {
        ...original,
        propagation: original?.propagation?.join(', '),
      } as Partial<typeof initialAddRiskState>);
    }
  };

  const riskLength = String(selectedRiskIds ? selectedRiskIds.length : 0);

  const handleActiveRisk = useCallback(
    (filterFilter: string) => {
      if (activeFilters.includes(filterFilter))
        return setActiveFilters(
          activeFilters.filter((risk) => risk !== filterFilter),
        );

      return setActiveFilters([...activeFilters, filterFilter]);
      // return setActiveFilters([filterFilter]);
    },
    [activeFilters],
  );

  const options = useMemo(() => {
    if (!scopedData) return [];

    const filterData = scopedData.filter(
      (risk) =>
        !risk.representAll ||
        (risk.type === RiskEnum.OUTROS && risk.representAll),
    );

    if (activeFilters.length > 0)
      return filterData
        .filter((risk) => riskMatchesActiveFilters(risk, activeFilters))
        .sort((a, b) => sortString(a, b, 'name'))
        .map(mapRiskSelectSearchFields);

    return filterData.map(mapRiskSelectSearchFields);
  }, [scopedData, activeFilters]);

  return (
    <STagSearchSelect
      options={options}
      renderButton={
        polishedAppearance
          ? ({ onClick, text }) => (
              <Button
                disabled={props.disabled}
                variant="outlined"
                size="small"
                onClick={onClick as any}
                startIcon={hideRiskIcon ? undefined : <ReportProblemOutlinedIcon />}
                endIcon={<ExpandMoreIcon />}
                sx={{
                  textTransform: 'none',
                  borderRadius: '22px',
                  borderColor: 'divider',
                  color: 'text.primary',
                  px: 6,
                  py: 3,
                  minHeight: 38,
                  maxWidth: 360,
                  mr: 5,
                  '& .MuiButton-startIcon': { color: 'text.secondary' },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {text}
                </Box>
              </Button>
            )
          : undefined
      }
      icon={ReportProblemOutlinedIcon}
      multiple={multiple}
      additionalButton={
        !linkageContext || effectiveOrigin === 'catalog'
          ? handleAddRisk
          : undefined
      }
      isLoading={
        !!linkageContext &&
        effectiveOrigin !== 'catalog' &&
        linkedRisks.isFetching
      }
      text={text || (riskLength === '0' ? '' : riskLength)}
      keys={[...RISK_SELECT_FUSE_KEYS]}
      transformSearch={normalizeRiskSelectSearchQuery}
      large={large}
      handleSelectMenu={handleSelectRisk}
      selected={selectedRiskIds || []}
      tooltipTitle={`${riskLength} fatores de risco`}
      listMaxHeight="min(560px, calc(100vh - 200px))"
      renderFilter={() => (
        <>
          {linkageContext && (
            <Box sx={{ px: 6, py: 4 }}>
              <Typography fontSize={12} color="text.secondary" sx={{ mb: 3 }}>
                {linkageContext.companyName} ·{' '}
                {effectiveOrigin === 'workspace'
                  ? linkageContext.workspaceName ||
                    'Estabelecimento selecionado'
                  : effectiveOrigin === 'company'
                    ? 'Todos os estabelecimentos'
                    : 'Catálogo completo'}
              </Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={effectiveOrigin}
                aria-label="Origem dos fatores de risco"
                onChange={(_, value) => {
                  if (value) setOrigin(value);
                }}
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  '& .MuiToggleButton-root': {
                    borderRadius: '18px !important',
                    border: '1px solid',
                    borderColor: 'divider',
                    textTransform: 'none',
                    px: 4,
                    fontSize: 12,
                  },
                  '& .Mui-selected': {
                    bgcolor: 'action.selected',
                    fontWeight: 600,
                  },
                }}
              >
                {linkageContext.workspaceId && (
                  <ToggleButton value="workspace">
                    Vinculados ao estabelecimento
                  </ToggleButton>
                )}
                <ToggleButton value="company">
                  Vinculados à empresa
                </ToggleButton>
                <ToggleButton value="catalog">Catálogo completo</ToggleButton>
              </ToggleButtonGroup>
              {effectiveOrigin !== 'catalog' &&
                !linkedRisks.isFetching &&
                (linkedRisks.isError ? (
                  <Box role="alert" sx={{ mt: 3 }}>
                    <Typography fontSize={13}>
                      Não foi possível carregar os riscos vinculados.
                    </Typography>
                    <Button size="small" onClick={() => linkedRisks.refetch()}>
                      Tentar novamente
                    </Button>
                  </Box>
                ) : !linkedRisks.data?.length ? (
                  <Typography
                    fontSize={13}
                    color="text.secondary"
                    sx={{ mt: 3 }}
                  >
                    Nenhum risco vinculado{' '}
                    {effectiveOrigin === 'workspace'
                      ? 'neste estabelecimento'
                      : 'nesta empresa'}
                    . Consulte{' '}
                    {effectiveOrigin === 'workspace' ? 'a empresa ou ' : ''}o
                    catálogo completo nas opções acima.
                  </Typography>
                ) : null)}
            </Box>
          )}
          <RiskSelectFilterBar
            polished={polishedAppearance}
            mainRow={riskFilterMainRow}
            ergonomicRow={riskFilterErgonomicRow}
            activeFilters={activeFilters}
            onClickFilter={(filter) => handleActiveRisk(filter)}
          />
        </>
      )}
      startAdornment={(option: IRiskFactors | undefined) =>
        option ? (
          <Box sx={{ mr: 6, flexShrink: 0 }}>
            <STagRisk riskFactor={option} hideRiskName />
          </Box>
        ) : null
      }
      endAdornment={(options: IRiskFactors | undefined) => {
        const severity = options?.severity;
        const showSeverity = typeof severity === 'number' && severity >= 1;

        return (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              flexShrink: 0,
              gap: 0.25,
              ml: 1,
            }}
          >
            {showSeverity ? (
              <SScaleFactorPill kind="S" value={severity} />
            ) : null}
            <STooltip enterDelay={1200} withWrapper title={'editar'}>
              <SIconButton
                onClick={(e) => handleEditRisk(e, options)}
                sx={{ width: '2rem', height: '2rem' }}
              >
                <Icon
                  sx={{ color: 'text.light', fontSize: '18px' }}
                  component={EditIcon}
                />
              </SIconButton>
            </STooltip>
          </Box>
        );
      }}
      optionsFieldName={{ valueField: 'id', contentField: 'name' }}
      {...props}
    />
  );
};

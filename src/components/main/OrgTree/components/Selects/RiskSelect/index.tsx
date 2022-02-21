import React, { FC, useCallback, useMemo, useState } from 'react';

import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { Box } from '@mui/material';
import { SMenuSimpleFilter } from 'components/molecules/SMenuSearch/SMenuSimpleFilter';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { useQueryRisk } from '../../../../../../core/services/hooks/queries/useQueryRisk';
import { STagSearchSelect } from '../../../../../molecules/STagSearchSelect';
import { riskFilter } from './constants/filters';
import { ITypeSelectProps } from './types';

export const RiskSelect: FC<ITypeSelectProps> = ({
  large,
  handleSelect,
  node,
  ...props
}) => {
  const { data } = useQueryRisk();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { onOpenModal } = useModal();

  const handleSelectRisk = (options: string[]) => {
    if (handleSelect) handleSelect(options);
  };

  const handleAddRisk = () => {
    onOpenModal(ModalEnum.RISK_ADD);
  };

  const riskLength = String(node.risks ? node.risks.length : 0);

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
    if (activeFilters.length > 0 && data)
      return data.filter((risk) => activeFilters.includes(risk.type));

    if (data) return data;

    return [];
  }, [data, activeFilters]);

  return (
    <STagSearchSelect
      options={options}
      icon={ReportProblemOutlinedIcon}
      multiple
      additionalButton={handleAddRisk}
      text={riskLength}
      keys={['name', 'type']}
      large={large}
      handleSelectMenu={handleSelectRisk}
      selected={node?.risks ?? []}
      tooltipTitle={`${riskLength} fatores de risco`}
      renderFilter={() => (
        <SMenuSimpleFilter
          options={riskFilter}
          activeFilters={activeFilters}
          onClickFilter={handleActiveRisk}
        />
      )}
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
          {options?.type}
        </Box>
      )}
      optionsFieldName={{ valueField: 'id', contentField: 'name' }}
      {...props}
    />
  );
};

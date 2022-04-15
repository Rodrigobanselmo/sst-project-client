/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useCallback, useMemo, useState } from 'react';

import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { riskFilter } from 'components/main/Tree/ChecklistTree/components/Selects/RiskSelect/constants/filters';
import { SMenuSimpleFilter } from 'components/molecules/SMenuSearch/SMenuSimpleFilter';
import { STagSearchSelect } from 'components/molecules/STagSearchSelect';
import { StatusSelect } from 'components/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import { useAuth } from 'core/contexts/AuthContext';
import { QueryEnum } from 'core/enums/query.enums';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { queryClient } from 'core/services/queryClient';

import { initialAddRecMedState } from '../../hooks/useAddRecMed';

interface IEditRecMedSelects {
  recMedData: typeof initialAddRecMedState;
  setRecMedData: React.Dispatch<any>;
}

export const EditRecMedSelects: FC<IEditRecMedSelects> = ({
  setRecMedData,
  recMedData,
}) => {
  const { user } = useAuth();

  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const handleSelectRisk = (option: IRiskFactors) => {
    if (option?.id) setRecMedData({ ...recMedData, risk: option });
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
    const risks =
      queryClient.getQueryData<IRiskFactors[]>([
        QueryEnum.RISK,
        user?.companyId,
      ]) || [];

    if (activeFilters.length > 0 && risks)
      return risks.filter((risk) => activeFilters.includes(risk.type));

    if (!recMedData.riskIds.length) return risks;

    return risks.map((risk) => ({
      ...risk,
      hideWithoutSearch: !recMedData.riskIds.includes(risk.id),
    }));
  }, [activeFilters, recMedData.riskIds, user?.companyId]);

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
        <STagSearchSelect
          options={options}
          error={recMedData?.risk?.id ? false : recMedData.hasSubmit}
          icon={ReportProblemOutlinedIcon}
          text={
            recMedData.risk.name ? recMedData.risk.name : 'nenhum selecionado'
          }
          keys={['name', 'type']}
          large={true}
          maxWidth={300}
          handleSelectMenu={handleSelectRisk}
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
          renderFilter={() => (
            <SMenuSimpleFilter
              options={riskFilter}
              activeFilters={activeFilters}
              onClickFilter={handleActiveRisk}
            />
          )}
          optionsFieldName={{ valueField: 'id', contentField: 'name' }}
        />
      )}
    </SFlex>
  );
};
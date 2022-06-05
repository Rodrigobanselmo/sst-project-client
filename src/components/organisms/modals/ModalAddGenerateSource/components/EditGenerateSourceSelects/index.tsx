/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useCallback, useMemo, useState } from 'react';

import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SMenuSimpleFilter } from 'components/molecules/SMenuSearch/SMenuSimpleFilter';
import { STagSearchSelect } from 'components/molecules/STagSearchSelect';
import { riskFilter } from 'components/organisms/tagSelects/RiskSelect/constants/filters';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import { useAuth } from 'core/contexts/AuthContext';
import { QueryEnum } from 'core/enums/query.enums';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { queryClient } from 'core/services/queryClient';

import { initialAddGenerateSourceState } from '../../hooks/useAddGenerateSource';

interface IEditGenerateSourceSelects {
  generateSourceData: typeof initialAddGenerateSourceState;
  setGenerateSourceData: React.Dispatch<any>;
}

export const EditGenerateSourceSelects: FC<IEditGenerateSourceSelects> = ({
  setGenerateSourceData,
  generateSourceData,
}) => {
  const { user } = useAuth();

  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const handleSelectRisk = (option: IRiskFactors) => {
    if (option?.id)
      setGenerateSourceData({ ...generateSourceData, risk: option });
  };

  const handleActiveRisk = useCallback(
    (filterFilter: string) => {
      //!? multiple select risk
      // if (activeFilters.includes(filterFilter))
      //   return setActiveFilters(
      //     activeFilters.filter((risk) => risk !== filterFilter),
      //   );

      // return setActiveFilters([...activeFilters, filterFilter]);
      //!?
      return setActiveFilters([filterFilter]);
    },
    [setActiveFilters],
  );

  const options = useMemo(() => {
    const risks =
      queryClient.getQueryData<IRiskFactors[]>([
        QueryEnum.RISK,
        user?.companyId,
      ]) || [];

    if (activeFilters.length > 0 && risks)
      return risks.filter((risk) => activeFilters.includes(risk.type));

    if (!generateSourceData.riskIds.length) return risks;

    return risks.map((risk) => ({
      ...risk,
      hideWithoutSearch: !generateSourceData.riskIds.includes(risk.id),
    }));
  }, [activeFilters, generateSourceData.riskIds, user?.companyId]);

  return (
    <SFlex gap={8} mt={10} align="flex-start">
      <StatusSelect
        selected={generateSourceData.status}
        statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
        handleSelectMenu={(option: any) => {
          if (option?.value)
            setGenerateSourceData({
              ...generateSourceData,
              status: option.value,
            });
        }}
      />

      {!generateSourceData.passDataBack && (
        <STagSearchSelect
          options={options}
          error={
            generateSourceData?.risk?.id ? false : generateSourceData.hasSubmit
          }
          icon={ReportProblemOutlinedIcon}
          text={
            generateSourceData.risk.name
              ? generateSourceData.risk.name
              : 'nenhum selecionado'
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

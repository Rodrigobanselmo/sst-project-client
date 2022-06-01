import React, { FC, useCallback, useMemo, useState, MouseEvent } from 'react';

import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { Box, Icon } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';
import { SMenuSimpleFilter } from 'components/molecules/SMenuSearch/SMenuSimpleFilter';
import { initialAddRiskState } from 'components/organisms/modals/ModalAddRisk/hooks/useAddRisk';

import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { useQueryRisk } from '../../../../core/services/hooks/queries/useQueryRisk';
import { STagSearchSelect } from '../../../molecules/STagSearchSelect';
import { riskFilter } from './constants/filters';
import { ITypeSelectProps } from './types';

export const RiskSelect: FC<ITypeSelectProps> = ({
  large,
  handleSelect,
  selectedRiskIds,
  text,
  multiple = true,
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

  const handleEditRisk = (
    e: MouseEvent<HTMLButtonElement>,
    option?: IRiskFactors,
  ) => {
    e.stopPropagation();
    if (option)
      onOpenModal<Partial<typeof initialAddRiskState>>(ModalEnum.RISK_ADD, {
        ...option,
      });
  };

  const riskLength = String(selectedRiskIds ? selectedRiskIds.length : 0);

  const handleActiveRisk = useCallback(
    (filterFilter: string) => {
      //? select many filters at once
      // if (activeFilters.includes(filterFilter))
      //   return setActiveFilters(
      //     activeFilters.filter((risk) => risk !== filterFilter),
      //   );

      // return setActiveFilters([...activeFilters, filterFilter]);
      //? select one at a time
      return setActiveFilters([filterFilter]);
    },
    [setActiveFilters],
  );

  const options = useMemo(() => {
    if (!data) return [];

    const filterData = data.filter((risk) => !risk.representAll);

    if (activeFilters.length > 0)
      return filterData.filter((risk) => activeFilters.includes(risk.type));

    return filterData;
  }, [data, activeFilters]);

  return (
    <STagSearchSelect
      options={options}
      icon={ReportProblemOutlinedIcon}
      multiple={multiple}
      additionalButton={handleAddRisk}
      text={text || (riskLength === '0' ? '' : riskLength)}
      keys={['name', 'type']}
      large={large}
      handleSelectMenu={handleSelectRisk}
      selected={selectedRiskIds || []}
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
      endAdornment={(options: IRiskFactors | undefined) => {
        return (
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
        );
      }}
      optionsFieldName={{ valueField: 'id', contentField: 'name' }}
      {...props}
    />
  );
};

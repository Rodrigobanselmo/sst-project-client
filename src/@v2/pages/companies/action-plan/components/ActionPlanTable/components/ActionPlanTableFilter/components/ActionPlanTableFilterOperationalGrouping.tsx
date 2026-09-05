import { FormControlLabel, Radio, RadioGroup } from '@mui/material';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { IActionPlanFilterProps } from '@v2/components/organisms/STable/implementation/SActionPlanTable/SActionPlanTable.types';
import { ActionPlanOperationalGroupingFilterEnum } from '@v2/models/security/enums/action-plan-operational-grouping-filter.enum';

const ALL_VALUE = 'ALL';

const OPTIONS = [
  { value: ALL_VALUE, label: 'Todas' },
  {
    value: ActionPlanOperationalGroupingFilterEnum.GROUPED,
    label: 'Com múltiplas aplicações',
  },
  {
    value: ActionPlanOperationalGroupingFilterEnum.UNGROUPED,
    label: 'Aplicação única',
  },
] as const;

interface ActionPlanTableFilterOperationalGroupingProps {
  onFilterData: (props: IActionPlanFilterProps) => void;
  filters: IActionPlanFilterProps;
}

export const ActionPlanTableFilterOperationalGrouping = ({
  onFilterData,
  filters,
}: ActionPlanTableFilterOperationalGroupingProps) => {
  const value = filters.operationalGrouping ?? ALL_VALUE;

  return (
    <SFlex direction="column" gap={2} width="100%" px={1} mt={1}>
      <SText color="text.secondary" fontSize={13} fontWeight={600}>
        Agrupamento na visão Ações
      </SText>
      <RadioGroup
        row
        value={value}
        onChange={(_, nextValue) =>
          onFilterData({
            operationalGrouping:
              nextValue === ALL_VALUE
                ? null
                : (nextValue as ActionPlanOperationalGroupingFilterEnum),
          })
        }
        sx={{
          width: '100%',
          flexWrap: 'wrap',
          columnGap: 2,
          rowGap: 0,
        }}
      >
        {OPTIONS.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio size="small" />}
            label={option.label}
            sx={{
              mr: 0,
              alignItems: 'center',
              '& .MuiFormControlLabel-label': {
                fontSize: 13,
                color: 'text.secondary',
                whiteSpace: 'nowrap',
              },
            }}
          />
        ))}
      </RadioGroup>
    </SFlex>
  );
};

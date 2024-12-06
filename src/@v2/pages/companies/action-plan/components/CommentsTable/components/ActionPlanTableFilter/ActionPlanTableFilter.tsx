import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSwitch } from '@v2/components/forms/fields/SSwitch/SSwitch';
import { IActionPlanFilterProps } from '@v2/components/organisms/STable/implementation/SActionPlanTable/SActionPlanTable.types';
import { ActionPlanTableFilterHierarchy } from './components/ActionPlanTableFilterHierarchy';
import { ActionPlanTableFilterLevel } from './components/ActionPlanTableFilterLevel';
import { ActionPlanTableFilterResponsible } from './components/ActionPlanTableFilterResponsible';
import { ActionPlanTableFilterStatus } from './components/ActionPlanTableFilterStatus';

interface ActionPlanTableFilterProps {
  onFilterData: (props: IActionPlanFilterProps) => void;
  filters: IActionPlanFilterProps;
  companyId: string;
  workspaceId?: string;
}

export const ActionPlanTableFilter = ({
  onFilterData,
  filters,
  companyId,
  workspaceId,
}: ActionPlanTableFilterProps) => {
  return (
    <SFlex direction="column" gap={4} width={400} pb={10}>
      <ActionPlanTableFilterStatus
        filters={filters}
        onFilterData={onFilterData}
      />
      <ActionPlanTableFilterResponsible
        filters={filters}
        onFilterData={onFilterData}
        companyId={companyId}
      />
      <ActionPlanTableFilterLevel
        filters={filters}
        onFilterData={onFilterData}
      />
      <ActionPlanTableFilterHierarchy
        filters={filters}
        onFilterData={onFilterData}
        workspaceId={workspaceId}
        companyId={companyId}
      />
      <SSwitch
        label="Filtrar somente itens Expirados"
        value={!!filters.isExpired}
        formControlProps={{ sx: { mx: 1, mt: 2 } }}
        onChange={(e) => onFilterData({ isExpired: e.target.checked })}
      />
      {/* <SFlex gap={2}>
        <FormControlLabel
          label={'Somente Expirados'}
          sx={{ '.MuiFormControlLabel-label': { fontSize: 14 } }}
          control={
            <Checkbox
              sx={{
                'svg[data-testid="CheckBoxOutlineBlankIcon"]': {
                  color: 'grey.400',
                  fontSize: '1.0rem',
                },
                '.MuiSvgIcon-root': {
                  fontSize: '1.1rem',
                },
              }}
            />
          }
        />
      </SFlex> */}
    </SFlex>
  );
};

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSwitch } from '@v2/components/forms/fields/SSwitch/SSwitch';
import { IActionPlanFilterProps } from '@v2/components/organisms/STable/implementation/SActionPlanTable/SActionPlanTable.types';
import { ActionPlanTableFilterHierarchy } from './components/ActionPlanTableFilterHierarchy';
import { ActionPlanTableFilterLevel } from './components/ActionPlanTableFilterLevel';
import { ActionPlanTableFilterResponsible } from './components/ActionPlanTableFilterResponsible';
import { ActionPlanTableFilterStatus } from './components/ActionPlanTableFilterStatus';
import { ActionPlanBrowseFilterModel } from '@v2/models/security/models/action-plan/action-plan-browse-filter.model';
import { ActionPlanTableFilterRiskTypes } from './components/ActionPlanTableFilterRiskTypes';
import { ActionPlanTableFilterGenerateSource } from './components/ActionPlanTableFilterGenerateSource';

interface ActionPlanTableFilterProps {
  onFilterData: (props: IActionPlanFilterProps) => void;
  filters: IActionPlanFilterProps;
  modelFilters?: ActionPlanBrowseFilterModel;
  companyId: string;
  workspaceId?: string;
}

export const ActionPlanTableFilter = ({
  onFilterData,
  filters,
  companyId,
  workspaceId,
  modelFilters,
}: ActionPlanTableFilterProps) => {
  return (
    <SFlex direction="column" gap={4} width={400} pb={10}>
      <ActionPlanTableFilterStatus
        filters={filters}
        onFilterData={onFilterData}
      />
      {modelFilters && (
        <ActionPlanTableFilterRiskTypes
          filters={filters}
          onFilterData={onFilterData}
          modelFilters={modelFilters}
        />
      )}
      <ActionPlanTableFilterResponsible
        filters={filters}
        onFilterData={onFilterData}
        companyId={companyId}
      />
      <ActionPlanTableFilterGenerateSource
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
    </SFlex>
  );
};

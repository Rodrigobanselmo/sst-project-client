import { SIconStatus } from '@v2/assets/icons/SIconStatus/SIconStatus';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { ActionPlanStatusTypeList } from '@v2/components/organisms/STable/implementation/SActionPlanTable/maps/action-plan-status-type-map';
import {
  IActionPlanUUIDParams,
  useActionPlanStatusActions,
} from '@v2/pages/companies/action-plan/hooks/useActionPlanStatusActions';

interface ActionPlanTableSelectionProps {
  getIds: () => IActionPlanUUIDParams[];
  companyId: string;
}

export const ActionPlanTableStatusSelection = ({
  getIds,
  companyId,
}: ActionPlanTableSelectionProps) => {
  const { onEditManyActionPlanStatus, isLoading: isLoadingStatus } =
    useActionPlanStatusActions({ companyId });

  return (
    <SSearchSelect
      inputProps={{ sx: { width: 300 } }}
      loading={isLoadingStatus}
      options={ActionPlanStatusTypeList}
      label="Status"
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.value}
      onChange={(option) => {
        if (option?.value)
          onEditManyActionPlanStatus({
            status: option.value,
            uuids: getIds(),
          });
      }}
      component={() => (
        <SButton
          icon={<SIconStatus />}
          color="paper"
          variant="outlined"
          text="Atualizar Status"
        />
      )}
      renderItem={({ label, option }) => (
        <SFlex gap={6} align="center">
          {option.startAddon}
          <SText color="text.secondary" fontSize={14}>
            {label}
          </SText>
        </SFlex>
      )}
    />
  );
};

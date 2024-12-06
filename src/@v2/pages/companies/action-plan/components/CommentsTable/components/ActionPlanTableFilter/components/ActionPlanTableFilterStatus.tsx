import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { ActionPlanStatusTypeFilterList } from '@v2/components/organisms/STable/implementation/SActionPlanTable/maps/action-plan-status-type-map';
import { IActionPlanFilterProps } from '@v2/components/organisms/STable/implementation/SActionPlanTable/SActionPlanTable.types';

interface ActionPlanTableFilterStatusProps {
  onFilterData: (props: IActionPlanFilterProps) => void;
  filters: IActionPlanFilterProps;
}

export const ActionPlanTableFilterStatus = ({
  onFilterData,
  filters,
}: ActionPlanTableFilterStatusProps) => {
  const values =
    filters.status
      ?.map(
        (s) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          ActionPlanStatusTypeFilterList.find((option) => option.value == s)!,
      )
      .filter(Boolean) || [];

  return (
    <SSearchSelectMultiple
      label="Status"
      value={values}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.value}
      onChange={(option) =>
        onFilterData({ status: option.map((o) => o.value) })
      }
      onInputChange={(value) => console.log(value)}
      placeholder="selecione um ou mais status"
      options={ActionPlanStatusTypeFilterList}
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

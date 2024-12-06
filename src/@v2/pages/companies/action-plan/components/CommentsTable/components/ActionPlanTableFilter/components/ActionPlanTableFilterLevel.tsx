import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { ActionPlanLevelList } from '@v2/components/organisms/STable/implementation/SActionPlanTable/maps/action-plan-level-map';
import { IActionPlanFilterProps } from '@v2/components/organisms/STable/implementation/SActionPlanTable/SActionPlanTable.types';

interface ActionPlanTableFilterLevelProps {
  onFilterData: (props: IActionPlanFilterProps) => void;
  filters: IActionPlanFilterProps;
}

export const ActionPlanTableFilterLevel = ({
  onFilterData,
  filters,
}: ActionPlanTableFilterLevelProps) => {
  const values =
    filters.ocupationalRisks
      ?.map(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (v) => ActionPlanLevelList.find((option) => option.value == v)!,
      )
      .filter(Boolean) || [];

  return (
    <SSearchSelectMultiple
      label="Risco Ocupacional"
      value={values}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.value}
      onChange={(option) =>
        onFilterData({ ocupationalRisks: option.map((o) => o.value) })
      }
      boxProps={{ flex: 1 }}
      onInputChange={(value) => console.log(value)}
      placeholder="selecione"
      options={ActionPlanLevelList}
    />
  );
};

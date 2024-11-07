import { SSearchSelectMultiple } from '@v2/components/forms/SSearchSelect/SSearchSelectMultiple';
import { IActionPlanFilterProps } from '@v2/components/organisms/STable/implementation/SActionPlanTable/SActionPlanTable.types';

interface ActionPlanTableFilterStageProps {
  onFilterData: (props: IActionPlanFilterProps) => void;
  stages: {
    id: number;
    name: string;
    color?: string;
  }[];
  selectedStages: {
    id: number;
    name: string;
    color?: string;
  }[];
}

export const ActionPlanTableFilterStage = ({
  selectedStages,
  stages,
  onFilterData,
}: ActionPlanTableFilterStageProps) => {
  return (
    <SSearchSelectMultiple
      label="Status"
      value={selectedStages}
      getOptionLabel={(option) => option?.name}
      getOptionValue={(option) => option?.id}
      onChange={(option) => onFilterData({ stageIds: option.map((o) => o.id) })}
      onInputChange={(value) => console.log(value)}
      placeholder="selecione um ou mais status"
      options={stages}
    />
  );
};

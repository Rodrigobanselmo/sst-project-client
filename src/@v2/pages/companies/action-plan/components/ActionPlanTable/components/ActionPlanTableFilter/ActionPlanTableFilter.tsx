import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { IActionPlanFilterProps } from '@v2/components/organisms/STable/implementation/SActionPlanTable/SActionPlanTable.types';
import { ActionPlanTableFilterStage } from './components/ActionPlanTableFilterStage';

interface ActionPlanTableFilterProps {
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

export const ActionPlanTableFilter = ({
  selectedStages,
  stages,
  onFilterData,
}: ActionPlanTableFilterProps) => {
  return (
    <SFlex direction="column" gap={4} width={300}>
      <ActionPlanTableFilterStage
        selectedStages={selectedStages}
        stages={stages}
        onFilterData={onFilterData}
      />
    </SFlex>
  );
};

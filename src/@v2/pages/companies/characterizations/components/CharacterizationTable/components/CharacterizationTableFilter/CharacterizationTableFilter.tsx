import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { ICharacterizationFilterProps } from '@v2/components/organisms/STable/implementation/SCharacterizationTable/SCharacterizationTable.types';
import { CharacterizationTableFilterStage } from './components/CharacterizationTableFilterStage';

interface CharacterizationTableFilterProps {
  onFilterData: (props: ICharacterizationFilterProps) => void;
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

export const CharacterizationTableFilter = ({
  selectedStages,
  stages,
  onFilterData,
}: CharacterizationTableFilterProps) => {
  return (
    <SFlex direction="column" gap={4} width={300}>
      <CharacterizationTableFilterStage
        selectedStages={selectedStages}
        stages={stages}
        onFilterData={onFilterData}
      />
    </SFlex>
  );
};

import { SSearchSelectMultiple } from '@v2/components/forms/SSearchSelect/SSearchSelectMultiple';
import { ICharacterizationFilterProps } from '@v2/components/organisms/STable/implementation/SCharacterizationTable/SCharacterizationTable.types';

interface CharacterizationTableFilterStageProps {
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

export const CharacterizationTableFilterStage = ({
  selectedStages,
  stages,
  onFilterData,
}: CharacterizationTableFilterStageProps) => {
  return (
    <>
      <SSearchSelectMultiple
        label="Status"
        value={selectedStages}
        getOptionLabel={(option) => option?.name}
        getOptionValue={(option) => option?.id}
        onChange={(option) =>
          onFilterData({ stageIds: option.map((o) => o.id) })
        }
        onInputChange={(value) => console.log(value)}
        placeholder="selecione um ou mais status"
        options={stages}
      />
    </>
  );
};

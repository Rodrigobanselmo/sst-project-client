import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { IFormParticipantsFilterProps } from '@v2/components/organisms/STable/implementation/SFormParticipantsTable/SFormParticipantsTable.types';

type WorkspaceOption = { id: string; name: string };

interface FormParticipantsTableFilterEstablishmentProps {
  workspaces: WorkspaceOption[];
  filters: IFormParticipantsFilterProps;
  onFilterData: (props: IFormParticipantsFilterProps) => void;
}

export const FormParticipantsTableFilterEstablishment = ({
  workspaces,
  filters,
  onFilterData,
}: FormParticipantsTableFilterEstablishmentProps) => {
  if (workspaces.length === 0) {
    return null;
  }

  return (
    <SSearchSelectMultiple
      value={filters.workspaces ?? []}
      options={workspaces}
      label="Estabelecimento"
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.id}
      onChange={(selected) => {
        onFilterData({
          workspaces: selected.map((w) => ({ id: w.id, name: w.name })),
        });
      }}
    />
  );
};

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { IFormParticipantsFilterProps } from '@v2/components/organisms/STable/implementation/SFormParticipantsTable/SFormParticipantsTable.types';

interface FormParticipantsTableFilterProps {
  onFilterData: (props: IFormParticipantsFilterProps) => void;
  filters: IFormParticipantsFilterProps;
  companyId: string;
  applicationId: string;
}

export const FormParticipantsTableFilter = ({
  onFilterData,
  filters,
  companyId,
  applicationId,
}: FormParticipantsTableFilterProps) => {
  return (
    <SFlex direction="column" gap={4} width={400} pb={10}>
      {/* TODO: Add filter components for status, hierarchies, etc. */}
      {/* For now, this is a placeholder - filters can be added later */}
    </SFlex>
  );
};

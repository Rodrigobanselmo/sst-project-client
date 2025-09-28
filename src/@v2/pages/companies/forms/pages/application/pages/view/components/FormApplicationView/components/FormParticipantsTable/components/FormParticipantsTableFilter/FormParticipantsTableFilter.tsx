import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { IFormParticipantsFilterProps } from '@v2/components/organisms/STable/implementation/SFormParticipantsTable/SFormParticipantsTable.types';
import { FormParticipantsTableFilterHierarchy } from './components/FormParticipantsTableFilterHierarchy';

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
      <FormParticipantsTableFilterHierarchy
        onFilterData={onFilterData}
        filters={filters}
        companyId={companyId}
      />
    </SFlex>
  );
};

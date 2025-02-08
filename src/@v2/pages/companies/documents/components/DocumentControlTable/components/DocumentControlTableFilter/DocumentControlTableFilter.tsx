import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSwitch } from '@v2/components/forms/fields/SSwitch/SSwitch';
import { IDocumentControlFilterProps } from '@v2/components/organisms/STable/implementation/SDocumentControlTable/SDocumentControlTable.types';
import { DocumentControlTableFilterType } from './components/DocumentControlTableFilterType';

interface DocumentControlTableFilterProps {
  onFilterData: (props: IDocumentControlFilterProps) => void;
  filters: IDocumentControlFilterProps;
  companyId: string;
  workspaceId?: string;
}

export const DocumentControlTableFilter = ({
  onFilterData,
  companyId,
  filters,
}: DocumentControlTableFilterProps) => {
  return (
    <SFlex direction="column" gap={4} width={400} pb={10}>
      <DocumentControlTableFilterType
        filters={filters}
        onFilterData={onFilterData}
        companyId={companyId}
      />
    </SFlex>
  );
};

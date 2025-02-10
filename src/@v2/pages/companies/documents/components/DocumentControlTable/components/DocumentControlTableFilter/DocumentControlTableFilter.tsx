import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSwitch } from '@v2/components/forms/fields/SSwitch/SSwitch';
import { IDocumentControlFilterProps } from '@v2/components/organisms/STable/implementation/SDocumentControlTable/SDocumentControlTable.types';
import { DocumentControlTableFilterType } from './components/DocumentControlTableFilterType';
import { DocumentControlBrowseFilterModel } from '@v2/models/enterprise/models/document-control/document-control/document-control-browse-filter.model';

interface DocumentControlTableFilterProps {
  onFilterData: (props: IDocumentControlFilterProps) => void;
  filters: IDocumentControlFilterProps;
  companyId: string;
  workspaceId?: string;
  data?: DocumentControlBrowseFilterModel;
}

export const DocumentControlTableFilter = ({
  onFilterData,
  filters,
  data,
}: DocumentControlTableFilterProps) => {
  return (
    <SFlex direction="column" gap={4} width={400} pb={10}>
      {data?.types && (
        <DocumentControlTableFilterType
          filters={filters}
          onFilterData={onFilterData}
          types={data.types}
        />
      )}
    </SFlex>
  );
};

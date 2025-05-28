import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { IFormApplicationFilterProps } from '@v2/components/organisms/STable/implementation/SFormApplicationTable/SFormApplicationTable.types';
import { FormApplicationBrowseFilterModel } from '@v2/models/form/models/form-application/form-application-browse-filter.model';
import { FormApplicationTableFilterType } from './components/FormApplicationTableFilterType';

interface FormApplicationTableFilterProps {
  onFilterData: (props: IFormApplicationFilterProps) => void;
  filters: IFormApplicationFilterProps;
  companyId: string;
  data?: FormApplicationBrowseFilterModel;
}

export const FormApplicationTableFilter = ({
  onFilterData,
  filters,
  data,
}: FormApplicationTableFilterProps) => {
  return (
    <SFlex direction="column" gap={4} width={400} pb={10}>
      {data?.status && (
        <FormApplicationTableFilterType
          filters={filters}
          onFilterData={onFilterData}
          status={data.status}
        />
      )}
    </SFlex>
  );
};

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { IFormModelFilterProps } from '@v2/components/organisms/STable/implementation/SFormModelTable/SFormModelTable.types';
import { FormBrowseFilterModel } from '@v2/models/form/models/form/components/form-browse-filter.model';
import { FormModelTableFilterType } from './components/FormApplicationTableFilterType';

interface FormModelTableFilterProps {
  onFilterData: (props: IFormModelFilterProps) => void;
  filters: IFormModelFilterProps;
  companyId: string;
  data?: FormBrowseFilterModel;
}

export const FormModelTableFilter = ({
  onFilterData,
  filters,
  data,
}: FormModelTableFilterProps) => {
  return (
    <SFlex direction="column" gap={4} width={400} pb={10}>
      {data?.types && (
        <FormModelTableFilterType
          filters={filters}
          onFilterData={onFilterData}
          types={data.types}
        />
      )}
    </SFlex>
  );
};

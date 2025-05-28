import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { IFormApplicationFilterProps } from '@v2/components/organisms/STable/implementation/SFormApplicationTable/SFormApplicationTable.types';
import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';

interface FormApplicationTableFilterTypeProps {
  onFilterData: (props: IFormApplicationFilterProps) => void;
  filters: IFormApplicationFilterProps;
  status: FormApplicationStatusEnum[];
}

export const FormApplicationTableFilterType = ({
  onFilterData,
  filters,
  status: types,
}: FormApplicationTableFilterTypeProps) => {
  const isLoading = false;

  return (
    <SSearchSelectMultiple
      value={filters.status || []}
      boxProps={{ flex: 1 }}
      options={types}
      loading={isLoading}
      label="Status"
      getOptionLabel={(option) => option}
      getOptionValue={(option) => option}
      onChange={(option) =>
        onFilterData({
          status: option,
        })
      }
    />
  );
};

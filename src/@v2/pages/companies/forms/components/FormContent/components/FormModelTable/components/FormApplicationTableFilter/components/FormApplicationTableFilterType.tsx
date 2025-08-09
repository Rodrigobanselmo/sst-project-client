import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { IFormModelFilterProps } from '@v2/components/organisms/STable/implementation/SFormModelTable/SFormModelTable.types';
import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { FormTypeTranslate } from '@v2/models/form/translations/form-type.translation';

interface FormModelTableFilterTypeProps {
  onFilterData: (props: IFormModelFilterProps) => void;
  filters: IFormModelFilterProps;
  types: FormTypeEnum[];
}

export const FormModelTableFilterType = ({
  onFilterData,
  filters,
  types,
}: FormModelTableFilterTypeProps) => {
  const isLoading = false;

  return (
    <SSearchSelectMultiple
      value={filters.types || []}
      boxProps={{ flex: 1 }}
      options={types}
      loading={isLoading}
      label="Tipo"
      getOptionLabel={(option) => FormTypeTranslate[option]}
      getOptionValue={(option) => option}
      onChange={(option) =>
        onFilterData({
          types: option,
        })
      }
    />
  );
};

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { FormBrowseResultModel } from '@v2/models/form/models/form/form-browse-result.model';
import { FormTypeTranslate } from '@v2/models/form/translations/form-type.translation';
import { useInfinityBrowseFormModel } from '@v2/services/forms/form/browse-form-model/hooks/useInfinityBrowseFormModel';
import { useState } from 'react';

export type InputFormModelSelectOptionProps = Pick<
  FormBrowseResultModel,
  'id' | 'name' | 'type' | 'shareableLink' | 'anonymous'
>;

export interface InputFormModelSelectProps {
  companyId: string;
  onChange: (props: InputFormModelSelectOptionProps | null) => void;
  value: InputFormModelSelectOptionProps;
  errorMessage?: string;
  disabled?: boolean;
}

export const InputFormModelSelect = ({
  onChange,
  value,
  companyId,
  errorMessage,
  disabled,
}: InputFormModelSelectProps) => {
  const [search, setSearch] = useState('');

  const { forms, isFetching, fetchNextPage } = useInfinityBrowseFormModel({
    companyId,
    filters: {
      search: search,
    },
    pagination: {
      page: 1,
      limit: 10,
    },
  });

  const options =
    forms?.pages.reduce((acc, page) => {
      return [...acc, ...page.results];
    }, [] as FormBrowseResultModel[]) || [];

  return (
    <SSearchSelect
      value={value}
      errorMessage={errorMessage}
      disabled={disabled}
      onScrollEnd={() => fetchNextPage()}
      boxProps={{ flex: 1 }}
      options={options}
      onSearch={setSearch}
      loading={isFetching}
      label="Modelo"
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.id}
      renderItem={({ option }) => {
        return (
          <SFlex sx={{ alignItems: 'center' }}>
            <SText fontSize={11} color="grey.600">
              ({FormTypeTranslate[option.type]})
            </SText>
            <SText>{option.name}</SText>
          </SFlex>
        );
      }}
      onChange={(option) => {
        onChange(option);
      }}
    />
  );
};

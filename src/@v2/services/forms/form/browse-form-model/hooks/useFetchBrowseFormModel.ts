import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { BrowseFormModelParams } from '../service/browse-form-model.types';
import { browseForm } from '../service/browse-form-model.service';

export const getKeyBrowseForm = (params: BrowseFormModelParams) => {
  return [QueryKeyFormEnum.FORM_MODEL, params.companyId, params];
};

export const useFetchBrowseFormModel = (params: BrowseFormModelParams) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseForm(params);
    },
    queryKey: getKeyBrowseForm(params),
  });

  return {
    ...response,
    form: data,
  };
};

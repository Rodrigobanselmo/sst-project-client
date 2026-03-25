import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { IUseFetchProps, useFetch } from '@v2/hooks/api/useFetch';
import { FormBrowseModel } from '@v2/models/form/models/form/form-browse.model';
import { BrowseFormModelParams } from '../service/browse-form-model.types';
import { browseForm } from '../service/browse-form-model.service';

export const getKeyBrowseForm = (params: BrowseFormModelParams) => {
  return [QueryKeyFormEnum.FORM_MODEL, params.companyId, params];
};

export type UseFetchBrowseFormModelOptions = Pick<
  IUseFetchProps<FormBrowseModel>,
  'enabled'
>;

export const useFetchBrowseFormModel = (
  params: BrowseFormModelParams,
  options?: UseFetchBrowseFormModelOptions,
) => {
  const { data, ...response } = useFetch<FormBrowseModel>({
    queryFn: async () => browseForm(params),
    queryKey: getKeyBrowseForm(params),
    enabled: options?.enabled,
  });

  return {
    ...response,
    formModel: data,
  };
};

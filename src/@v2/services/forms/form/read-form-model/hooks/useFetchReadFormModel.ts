import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { readForm, ReadFormParams } from '../service/read-form-model.service';

export const useFetchReadFormModel = (params: ReadFormParams) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return readForm(params);
    },
    queryKey: [QueryKeyFormEnum.FORM_MODEL, params.companyId, params.formId],
  });

  return {
    ...response,
    form: data,
  };
};

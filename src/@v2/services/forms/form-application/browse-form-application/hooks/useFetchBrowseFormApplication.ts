import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { browseFormApplication } from '../service/browse-form-application.service';
import { BrowseFormApplicationParams } from '../service/browse-form-application.types';

export const getKeyBrowseFormApplication = (
  params: BrowseFormApplicationParams,
) => {
  return [QueryKeyFormEnum.FORM_APPLICATION, params.companyId, params];
};

export const useFetchBrowseFormApplication = (
  params: BrowseFormApplicationParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseFormApplication(params);
    },
    queryKey: getKeyBrowseFormApplication(params),
  });

  return {
    ...response,
    formApplication: data,
  };
};

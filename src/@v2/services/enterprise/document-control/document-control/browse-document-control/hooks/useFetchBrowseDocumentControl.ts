import { QueryKeyDocumentControlEnum } from '@v2/constants/enums/document-control-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { browseDocumentControl } from '../service/browse-document-control.service';
import { BrowseDocumentControlParams } from '../service/browse-document-control.types';

export const getKeyBrowseDocumentControl = (
  params: BrowseDocumentControlParams,
) => {
  return [
    QueryKeyDocumentControlEnum.DOCUMENT_CONTROL,
    params.companyId,
    params,
  ];
};

export const useFetchBrowseDocumentControl = (
  params: BrowseDocumentControlParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseDocumentControl(params);
    },
    queryKey: getKeyBrowseDocumentControl(params),
  });

  return {
    ...response,
    documentControl: data,
  };
};

import { QueryKeyDocumentControlEnum } from '@v2/constants/enums/document-control-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import {
  readDocumentControl,
  ReadDocumentControlParams,
} from '../service/read-document-control.service';

export const useFetchReadDocumentControl = (
  params: ReadDocumentControlParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return readDocumentControl(params);
    },
    queryKey: [
      QueryKeyDocumentControlEnum.DOCUMENT_CONTROL,
      params.companyId,
      params.documentControlId,
    ],
  });

  return {
    ...response,
    documentControl: data,
  };
};

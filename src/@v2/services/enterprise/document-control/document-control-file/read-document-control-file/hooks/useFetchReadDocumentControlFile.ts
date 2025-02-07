import { QueryKeyDocumentControlEnum } from '@v2/constants/enums/document-control-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import {
  readDocumentControlFile,
  ReadDocumentControlFileParams,
} from '../service/read-document-control-file.service';

export const useFetchReadDocumentControlFile = (
  params: ReadDocumentControlFileParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return readDocumentControlFile(params);
    },
    queryKey: [
      QueryKeyDocumentControlEnum.DOCUMENT_CONTROL_FILE,
      params.companyId,
      params.documentControlFileId,
    ],
  });

  return {
    ...response,
    documentControlFile: data,
  };
};

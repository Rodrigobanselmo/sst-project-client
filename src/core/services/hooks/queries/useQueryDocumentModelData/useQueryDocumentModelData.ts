import { useQuery } from 'react-query';

import { DocumentTypeEnum } from 'project/enum/document.enums';
import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryDocumentModelData {
  companyId?: string;
  id: number;
}

export const queryDocumentModel = async ({
  companyId,
  ...query
}: IQueryDocumentModelData) => {
  if (!companyId) return;

  const queries = queryString.stringify(query);

  const response = await api.get<IDocumentModelFull>(
    `${ApiRoutesEnum.DOCUMENT_MODEL}/${query.id}/data`.replace(
      ':companyId',
      companyId,
    ) + `?${queries}`,
  );

  return response.data;
};

export function useQueryDocumentModelData(query: IQueryDocumentModelData) {
  const { getCompanyId } = useGetCompanyId();
  const companyId = getCompanyId(query);

  query.companyId = companyId;

  const { data, ...rest } = useQuery(
    [QueryEnum.DOCUMENT_MODEL_DATA, query],
    () =>
      query.id && companyId
        ? queryDocumentModel({ ...query, companyId })
        : undefined,
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  // transfere o array de children que ta fora de data para dentro de data
  // if (data && data.document && data.document.sections) {
  //   data.document.sections.forEach((section, idxSection) => {
  //     section?.data?.forEach((_, idxData) => {
  //       if (data.document.sections[idxSection]?.children?.[idxData])
  //         data.document.sections[idxSection].data[idxData].children = (
  //           data as any
  //         ).document.sections[idxSection].children[idxData];

  //       delete data.document.sections[idxSection].children;
  //     });
  //   });
  // }

  return { ...rest, data };
}

import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IContact } from 'core/interfaces/api/IContact';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';
import { ImagesTypeEnum } from 'project/enum/imageGallery.enum';
import { IImageGallery } from 'core/interfaces/api/IImageGallery';

interface IQueryImageGallery {
  search?: string | null;
  companyId?: string;
  types?: ImagesTypeEnum[];
}

export const queryImagesGallery = async (
  { skip, take }: IPagination,
  companyId: string,
  query: IQueryImageGallery,
) => {
  const queries = queryString.stringify(query);

  if ('search' in query && query.search === null) return { data: [], count: 0 };
  if (!companyId) return { data: [], count: 0 };

  const response = await api.get<IPaginationResult<IImageGallery[]>>(
    `${ApiRoutesEnum.IMAGE_GALLERY}?take=${take}&skip=${skip}&${queries}`.replace(
      ':companyId',
      companyId,
    ),
  );

  return response.data;
};

export function useQueryImagesGalleries(
  page = 1,
  query = {} as IQueryImageGallery,
  take = 20,
  companyID?: string,
) {
  const { companyId } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const _companyId = companyID || companyId;

  const { data, ...result } = useQuery(
    [QueryEnum.IMAGE_GALLERY, _companyId, page, { ...query }],
    () => queryImagesGallery(pagination, _companyId || '', { ...query }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IImageGallery[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}

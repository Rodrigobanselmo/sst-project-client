import {
  IObjectToQueryParamsProps,
  objectToQueryParams,
} from './object-to-query-params';

type IBindUrlParamsProps = {
  path: string;
  pathParams: Record<string, string | number>;
  queryParams?: IObjectToQueryParamsProps;
};

export function bindUrlParams({
  path,
  pathParams,
  queryParams,
}: IBindUrlParamsProps) {
  let url = path;
  Object.keys(pathParams).forEach((key) => {
    url = url.replace(`:${key}`, pathParams[key].toString());
  });

  if (queryParams) {
    const query = objectToQueryParams(queryParams);
    if (query) {
      url += `?${query}`;
    }
  }

  return url;
}

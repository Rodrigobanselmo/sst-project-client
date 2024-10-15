import {
  getQueryParamsChipList,
  IParamsChipMap,
} from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/utils/get-query-params-chip-list';

export function useQueryParams<T extends Record<string, any>>({
  chipMap,
  cleanParams,
  queryParams,
  setQueryParams,
}: {
  chipMap: IParamsChipMap<T>;
  cleanParams: Required<T>;
  queryParams: T extends Record<string, any> ? T : never;
  setQueryParams: (values: T) => void;
}) {
  const onFilterQueryParams = (props: T) => {
    setQueryParams({ page: 1, ...props });
  };

  const onCleanQueryParams = () => {
    setQueryParams(cleanParams);
  };

  const paramsChipList = getQueryParamsChipList(queryParams, chipMap);

  return {
    paramsChipList,
    onFilterQueryParams,
    onCleanQueryParams,
  };
}

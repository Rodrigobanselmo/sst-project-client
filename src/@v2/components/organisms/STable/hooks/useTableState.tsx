import {
  getQueryParamsChipList,
  IParamsChipMap,
} from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/utils/get-query-params-chip-list';

export function useTableState<T extends Record<string, any>>({
  chipMap,
  cleanData,
  data,
  setData,
}: {
  chipMap: IParamsChipMap<Omit<T, 'limit' | 'orderBy' | 'page'>>;
  cleanData: Required<T>;
  data: T extends Record<string, any> ? T : never;
  setData: (values: T) => void;
}) {
  const onFilterData = (props: T) => {
    setData({ page: 1, ...props });
  };

  const onCleanData = () => {
    setData(cleanData);
  };

  const paramsChipList = getQueryParamsChipList(data, chipMap);

  return {
    paramsChipList,
    onFilterData,
    onCleanData,
  };
}

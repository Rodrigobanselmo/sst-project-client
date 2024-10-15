import { STableFilterChipProps } from '../STableFilterChip';

type ArrayElementType<T> = T extends (infer U)[] ? U : T;
type NonUndefinedArrayElement<T> = ArrayElementType<Exclude<T, undefined>>;
export type IParamsChipMap<T> = {
  [K in keyof Required<T>]:
    | ((value: NonUndefinedArrayElement<T[K]>) => STableFilterChipProps)
    | null;
};
export function getQueryParamsChipList<T>(
  queryParams: T extends Record<string, any> ? T : never,
  paramsChipMap: IParamsChipMap<T>,
) {
  const paramsChipList = Object.entries(queryParams).reduce(
    (acc, [key, value]) => {
      if (value) {
        const list = Array.isArray(value) ? value : [value];

        list.forEach((value) => {
          const chip = paramsChipMap[key];
          if (chip) acc.push(chip(value));
        });
      }

      return acc;
    },
    [] as STableFilterChipProps[],
  );

  return paramsChipList;
}

import { useCallback, useMemo, useState } from 'react';

import clone from 'clone';
import { initialCompanySelectState } from 'components/organisms/modals/ModalSelectCompany';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IQueryCompanies } from 'core/services/hooks/queries/useQueryCompanies';
import { getCompanyName } from 'core/utils/helpers/companyName';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

import { FilterFieldEnum } from '../constants/filter.map';

export type IFilterTag = {
  filterValue: string;
  name: string;
  field?: FilterFieldEnum;
};
export type IFilterTableType<T = any> = {
  data?: T;
  filters: IFilterTag[];
  field: FilterFieldEnum;
};

export type IFilterAdd<T> = {
  data: T | T[];
  getName: (data: T) => string;
  getId: (data: T) => string;
};

export type IFilterTableData = {
  [FilterFieldEnum.COMPANIES]?: IFilterTableType<ICompany[]>;
};

export const useFilterTable = (deafult?: IFilterTableData) => {
  const { onStackOpenModal } = useModal();
  const [filter, setFilter] = useState<IFilterTableData>(deafult || {});

  const addFilter = useCallback(
    <T>(
      filterField: FilterFieldEnum,
      addData: IFilterAdd<T>,
      options?: { addOnly?: boolean },
    ) => {
      const data = addData.data;

      setFilter((filter) => {
        const lastFilter = (filter as any)?.[filterField] as IFilterTableType;

        const filterData = {
          ...(Array.isArray(data) && {
            data: data.map((item) => ({
              ...item,
              filterValue: addData.getId(item),
            })),
            filters: data.map((item) => ({
              filterValue: addData.getId(item),
              name: addData.getName(item),
            })),
          }),
          ...(!Array.isArray(data) && {
            data: [data],
            filters: [
              {
                filterValue: addData.getId(data),
                name: addData.getName(data),
              },
            ],
          }),
          field: filterField,
        } as IFilterTableType;

        if (options?.addOnly) {
          if (lastFilter?.data) filterData.data.push(...lastFilter.data);
          if (lastFilter?.filters)
            filterData.filters.push(...lastFilter.filters);
        }

        filterData.data = removeDuplicate(filterData.data, {
          removeById: 'filterValue',
        });
        filterData.filters = removeDuplicate(filterData.filters, {
          removeById: 'filterValue',
        });

        return {
          ...filter,
          [filterField]: filterData,
        } as IFilterTableData;
      });
    },
    [],
  );

  const clearFilter = useCallback(() => {
    setFilter({});
  }, []);

  const removeTagsFilter = useCallback(
    (tags: IFilterTag[]) => {
      const filters = clone(filter);
      tags.forEach((tag) => {
        const field = tag.field;
        if (!field) return;

        if (field in filters) {
          const filter = (filters as any)[field] as IFilterTableType;
          (filters as any)[field] = {
            ...filter,
            filters: filter?.filters?.filter(
              (f) => f.filterValue != tag.filterValue,
            ),
            data: filter?.data?.filter(
              (d: any) => d.filterValue != tag.filterValue,
            ),
          };
        }
      });

      setFilter(filters);
    },
    [filter],
  );

  const onFilterCompanies = useCallback(
    (query?: IQueryCompanies) => {
      const filterField = query?.isGroup
        ? FilterFieldEnum.COMPANIES_GROUP
        : FilterFieldEnum.COMPANIES;

      const onSelect = (companies: ICompany[]) => {
        addFilter(filterField, {
          data: companies,
          getId: (data) => data.id,
          getName: (data) =>
            query?.isGroup
              ? data.name.replace('(GRUPO EMPRESARIAL) ', '')
              : getCompanyName(data),
        });
      };

      onStackOpenModal(ModalEnum.COMPANY_SELECT, {
        multiple: true,
        onSelect,
        query,
        selected: (filter as any)[filterField]?.data || [],
      } as Partial<typeof initialCompanySelectState>);
    },
    [addFilter, filter, onStackOpenModal],
  );

  const filtersQuery = useMemo(() => {
    const query: Record<string, any> = {};

    Object.values(filter).forEach((data) => {
      query[data.field] = data.filters.map((f) => f.filterValue);
    });
    return query;
  }, [filter]);

  return {
    filter,
    addFilter,
    clearFilter,
    removeTagsFilter,
    onFilterCompanies,
    filtersQuery,
  };
};

export type IUseFilterTableData = ReturnType<typeof useFilterTable>;

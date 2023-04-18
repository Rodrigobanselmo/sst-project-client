import { useCallback, useEffect, useMemo, useState } from 'react';

import clone from 'clone';
import { initialClinicSelectState } from 'components/organisms/modals/ModalSelectClinics';
import { initialCompanySelectState } from 'components/organisms/modals/ModalSelectCompany';
import { ExamHistoryEvaluationEnum } from 'project/enum/employee-exam-history-evaluation.enum';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';

import { useAuth } from 'core/contexts/AuthContext';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import usePersistedState from 'core/hooks/usePersistState';
import { usePersistTimeoutState } from 'core/hooks/usePersistTimeoutState';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IQueryCompanies } from 'core/services/hooks/queries/useQueryCompanies';
import { getCompanyName } from 'core/utils/helpers/companyName';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

import { FilterFieldEnum } from '../constants/filter.map';
import { StatusEnum } from 'project/enum/status.enum';
import { ExamAvaliationEnum } from 'project/enum/employee-exam-history-avaliation.enum';

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
  [FilterFieldEnum.START_DATE]?: IFilterTableType<Date[]>;
  [FilterFieldEnum.END_DATE]?: IFilterTableType<Date[]>;
  [FilterFieldEnum.EXAM_TYPE]?: IFilterTableType<ExamHistoryTypeEnum[]>;
  [FilterFieldEnum.LTE_EXPIRED_EXAM]?: IFilterTableType<Date[]>;
  [FilterFieldEnum.STATUS]?: IFilterTableType<StatusEnum[]>;
  [FilterFieldEnum.EXAM_AVALIATION_EXAM]?: IFilterTableType<
    ExamAvaliationEnum[]
  >;
  [FilterFieldEnum.EVALUATION_TYPE]?: IFilterTableType<
    ExamHistoryEvaluationEnum[]
  >;
};

export const useFilterTable = (
  deafult?: IFilterTableData,
  options?: {
    timeout?: number;
    key?: string;
    setPage?: (page: number) => void;
  },
) => {
  const { onStackOpenModal } = useModal();
  const [filter, setFilter] = usePersistTimeoutState<IFilterTableData>(
    (options?.key || '') + '_filter',
    deafult || {},
    options?.timeout,
  );

  useEffect(() => {
    options?.setPage?.(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const addFilter = useCallback(
    <T>(
      filterField: FilterFieldEnum,
      addData: IFilterAdd<T>,
      options?: { addOnly?: boolean; removeIfEqual?: boolean },
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

        if (options?.removeIfEqual) {
          const equalFilters = lastFilter?.filters
            ?.filter((lastF) =>
              filterData.filters.find(
                (f) => lastF.filterValue == f.filterValue,
              ),
            )
            .map((f) => f.filterValue);

          equalFilters?.map((eqFilterValue) => {
            const indexActual = filterData.filters.findIndex(
              (filter) => filter.filterValue == eqFilterValue,
            );
            const indexLast = lastFilter.filters.findIndex(
              (filter) => filter.filterValue == eqFilterValue,
            );

            if (indexActual != -1) {
              filterData.filters.splice(indexActual, 1);
              (filterData.data as any[]).splice(indexActual, 1);
            }
            if (indexLast != -1) {
              lastFilter.filters.splice(indexLast, 1);
              (lastFilter.data as any[]).splice(indexLast, 1);
            }
          });
        }

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
      const getFilterField = () => {
        if (query?.isGroup) return FilterFieldEnum.COMPANIES_GROUP;
        return FilterFieldEnum.COMPANIES;
      };
      const filterField = getFilterField();

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

  const onFilterClinics = useCallback(
    (query?: IQueryCompanies) => {
      const filterField = FilterFieldEnum.CLINICS;

      const onSelect = (companies: ICompany[]) => {
        addFilter(filterField, {
          data: companies,
          getId: (data) => data.id,
          getName: (data) => data.fantasy,
        });
      };

      onStackOpenModal(ModalEnum.CLINIC_SELECT, {
        multiple: true,
        onSelect,
        query,
        selected: (filter as any)[filterField]?.data || [],
      } as Partial<typeof initialClinicSelectState>);
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
    onFilterClinics,
    filtersQuery,
  };
};

export type IUseFilterTableData = ReturnType<typeof useFilterTable>;

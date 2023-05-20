import React, { FC, useCallback, useMemo, useState } from 'react';

import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { SMenuSimpleFilter } from 'components/molecules/SMenuSearch/SMenuSimpleFilter';
import sortArray from 'sort-array';

import SHierarchyIcon from 'assets/icons/SHierarchyIcon';

import { hierarchyConstant } from 'core/constants/maps/hierarchy.constant';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { useListHierarchyQuery } from 'core/hooks/useListHierarchyQuery';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';

import { STagSearchSelect } from '../../../molecules/STagSearchSelect';
import { hierarchyFilter } from './constants/filters';
import { IHierarchyTypeSelectProps } from './types';

export const HierarchySelect: FC<
  { children?: any } & IHierarchyTypeSelectProps
> = ({
  large,
  handleSelect,
  text,
  companyId,
  selectedId,
  tooltipText,
  defaultFilter = HierarchyEnum.OFFICE,
  filterOptions,
  parentId,
  allFilters,
  ...props
}) => {
  const { hierarchyListData, hierarchyTree } = useListHierarchyQuery(
    companyId ?? '-',
  );
  const [activeFilters, setActiveFilters] = useState<string[]>([defaultFilter]);
  const [allFilterTypes, setAllFilterTypes] = useState<
    Record<HierarchyEnum, boolean>
  >({} as Record<HierarchyEnum, boolean>);

  const handleSelectRisk = (options: IHierarchy) => {
    if (options && typeof options.id === 'string')
      handleSelect?.(
        hierarchyTree[options.id] || { id: '' },
        (options as any).parents,
      );
  };

  const getText = useCallback(
    (selectedId?: string, text?: string) => {
      if (!selectedId) return text || '';

      if (hierarchyTree[selectedId || '']) {
        let name = '';

        const hierarchyConstValue =
          hierarchyConstant[hierarchyTree[selectedId || '']?.type || ''];

        if (hierarchyConstValue) name = `(${hierarchyConstValue.name}) `;
        if (hierarchyTree[selectedId || ''].name)
          name = name + hierarchyTree[selectedId || ''].name;

        return name;
      }
      if (text) return text;

      return '';
    },
    [hierarchyTree],
  );

  const handleActiveFilter = useCallback((filterFilter: string) => {
    return setActiveFilters([filterFilter]);
  }, []);

  const options = useMemo(() => {
    const typesSelected: Record<HierarchyEnum, boolean> = {} as Record<
      HierarchyEnum,
      boolean
    >;

    const list = hierarchyListData()
      .map((hierarchyTree) => {
        if (
          !filterOptions ||
          (filterOptions && filterOptions.includes(hierarchyTree.type))
        )
          (typesSelected as any)[hierarchyTree.type] = true;

        return {
          ...hierarchyTree,
          // name: getText(hierarchyTree.id),
        };
      })
      .filter(
        (h) =>
          h.type === activeFilters[0] &&
          (!parentId || (parentId && h.parents.find((p) => p.id === parentId))),
      );
    (!activeFilters ||
      (filterOptions && filterOptions?.length > 1) ||
      allFilters) &&
      setAllFilterTypes(typesSelected);

    if (!list) return [];
    if (selectedId)
      list.unshift({
        ...list[0],
        id: '',
        name: 'Remover seleção',
      });

    return sortArray(list, { by: 'name', order: 'asc' });
  }, [
    hierarchyListData,
    allFilters,
    activeFilters,
    filterOptions,
    selectedId,
    parentId,
  ]);

  const textField = getText(selectedId, text);
  const isNotSelected = !selectedId;

  return (
    <STagSearchSelect
      options={options}
      icon={SHierarchyIcon}
      text={textField}
      bg={isNotSelected ? undefined : 'info.main'}
      active
      keys={['name']}
      large={large}
      handleSelectMenu={handleSelectRisk}
      tooltipTitle={tooltipText ? tooltipText(textField) : ''}
      optionsFieldName={{ valueField: 'id', contentField: 'name' }}
      renderContent={(option) => {
        if (!option.id)
          return (
            <SText my={-2} sx={{ opacity: 0.7 }} fontSize={13}>
              {option.name}
            </SText>
          );

        const name = getText(option.id);
        return (
          <STooltip
            withWrapper
            placement="bottom-end"
            title={
              option.parentsName ? (
                <>
                  <SText fontSize={11} color="common.white">
                    {`${option.parentsName}  > ${option.name}`}
                  </SText>
                  <SText fontSize={9} color="common.white">
                    estabelecimentos: {`${option.workspacesNames.join(' || ')}`}
                  </SText>
                </>
              ) : (
                ''
              )
            }
          >
            <SText fontSize={13} my={-2}>
              {name}
            </SText>
          </STooltip>
        );
      }}
      renderFilter={() => (
        <SMenuSimpleFilter
          options={hierarchyFilter.filter(
            (filter) => !allFilterTypes || allFilterTypes?.[filter.filter],
          )}
          activeFilters={activeFilters}
          onClickFilter={handleActiveFilter}
        />
      )}
      {...props}
    />
  );
};

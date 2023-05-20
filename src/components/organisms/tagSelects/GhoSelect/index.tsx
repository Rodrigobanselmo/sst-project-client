import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { SMenuSimpleFilter } from 'components/molecules/SMenuSearch/SMenuSimpleFilter';
import sortArray from 'sort-array';

import SHierarchyIcon from 'assets/icons/SHierarchyIcon';

import { originRiskMap } from 'core/constants/maps/origin-risk';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { useListGhoQuery } from 'core/hooks/useListGhoQuery';
import { IGho } from 'core/interfaces/api/IGho';

import { STagSearchSelect } from '../../../molecules/STagSearchSelect';
import { GhoFilter } from './constants/filters';
import { IGHOTypeSelectProps } from './types';

export const GhoSelect: FC<{ children?: any } & IGHOTypeSelectProps> = ({
  large,
  handleSelect,
  text,
  companyId,
  selectedId,
  tooltipText,
  defaultFilter = HomoTypeEnum.GSE,
  filterOptions,
  allFilters,
  ...props
}) => {
  const { ghoListData, ghoTree } = useListGhoQuery(companyId);

  const [activeFilters, setActiveFilters] = useState<string[]>([
    defaultFilter as any,
  ]);
  const [allFilterTypes, setAllFilterTypes] = useState<
    Record<HomoTypeEnum, boolean>
  >({} as Record<HomoTypeEnum, boolean>);

  useEffect(() => {
    setActiveFilters([defaultFilter as any]);
  }, [defaultFilter]);

  const handleSelectRisk = (options: IGho) => {
    if (options && typeof options.id === 'string')
      handleSelect?.(
        ghoTree[options.id] || { id: '' },
        (options as any).parents,
      );
  };

  const getText = useCallback(
    (selectedId?: string, text?: string) => {
      if (!selectedId) return text || '';
      const ghoData = ghoTree[selectedId || ''];

      if (ghoData) {
        let name = '';

        const ghoOriginValue = originRiskMap[ghoData?.type || ''];

        if (ghoOriginValue) name = `(${ghoOriginValue.name}) `;

        const isGho = !ghoData.type;

        if (ghoData.name)
          name =
            name +
            (!isGho ? ghoData.description.split('(//)')[0] : ghoData.name);

        return name;
      }
      if (text) return text;

      return '';
    },
    [ghoTree],
  );

  const handleActiveFilter = useCallback((filterFilter: string) => {
    return setActiveFilters([filterFilter]);
  }, []);

  const options = useMemo(() => {
    const typesSelected: Record<HomoTypeEnum, boolean> = {} as Record<
      HomoTypeEnum,
      boolean
    >;

    const list = ghoListData()
      .map((gho) => {
        if (
          !filterOptions ||
          (filterOptions && gho.type && filterOptions.includes(gho.type))
        ) {
          (typesSelected as any)[gho.type || HomoTypeEnum.GSE] = true;
        }

        return {
          ...gho,
          name: gho.type ? gho.description.split('(//)')[0] : gho.name,
        };
      })
      .filter((h) => (h.type || HomoTypeEnum.GSE) === activeFilters[0]);

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
  }, [ghoListData, activeFilters, filterOptions, allFilters, selectedId]);

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
          <STooltip withWrapper placement="bottom-end" title={option.name}>
            <SText fontSize={13} my={-2}>
              {name}
            </SText>
          </STooltip>
        );
      }}
      renderFilter={() => (
        <SMenuSimpleFilter
          options={
            GhoFilter.filter(
              (filter) => !allFilterTypes || allFilterTypes?.[filter.filter],
            ) as any
          }
          activeFilters={activeFilters}
          onClickFilter={handleActiveFilter}
        />
      )}
      {...props}
    />
  );
};

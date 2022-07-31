import React, { FC, useCallback, useMemo } from 'react';

import SHierarchyIcon from 'assets/icons/SHierarchyIcon';

import { hierarchyConstant } from 'core/constants/maps/hierarchy.constant';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';

import { STagSearchSelect } from '../../../molecules/STagSearchSelect';
import { ITypeSelectProps } from './types';

export const HierarchySelect: FC<ITypeSelectProps> = ({
  large,
  handleSelect,
  text,
  companyId,
  selectedId,
  tooltipText,
  ...props
}) => {
  const { data: copyFromHierarchy } = useQueryHierarchies(companyId || '-');
  const handleSelectRisk = (options: IHierarchy) => {
    if (options && typeof options.id === 'string')
      handleSelect?.(copyFromHierarchy[options.id] || { id: '' });
  };

  const getText = useCallback(
    (selectedId?: string, text?: string) => {
      if (!selectedId) return text || '';

      if (copyFromHierarchy[selectedId || '']) {
        let name = '';

        const hierarchyConstValue =
          hierarchyConstant[copyFromHierarchy[selectedId || '']?.type || ''];

        if (hierarchyConstValue) name = `(${hierarchyConstValue.name}) `;
        if (copyFromHierarchy[selectedId || ''].name)
          name = name + copyFromHierarchy[selectedId || ''].name;

        return name;
      }
      if (text) return text;

      return '';
    },
    [copyFromHierarchy],
  );

  const options = useMemo(() => {
    const copyHierarchyArray = Object.values(copyFromHierarchy).map(
      (copyFromHierarchy) => {
        return {
          ...copyFromHierarchy,
          name: getText(copyFromHierarchy.id),
        };
      },
    );

    if (!copyHierarchyArray) return [];
    copyHierarchyArray.unshift({
      ...copyHierarchyArray[0],
      id: '',
      name: 'Nenhum',
    });

    return copyHierarchyArray;
  }, [copyFromHierarchy, getText]);

  const textField = getText(selectedId, text);
  const isNotSelected = !selectedId;

  return (
    <STagSearchSelect
      options={options}
      icon={SHierarchyIcon}
      text={textField}
      bg={isNotSelected ? 'primary.main' : 'info.main'}
      active
      keys={['name']}
      large={large}
      handleSelectMenu={handleSelectRisk}
      tooltipTitle={tooltipText ? tooltipText(textField) : ''}
      optionsFieldName={{ valueField: 'id', contentField: 'name' }}
      {...props}
    />
  );
};

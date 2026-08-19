import React, { FC, useMemo } from 'react';

import { STagSearchSelect } from 'components/molecules/STagSearchSelect';
import { DocModelPageOrientation } from 'core/interfaces/api/IDocumentModel';
import { DocumentSectionChildrenTypeEnum } from 'project/enum/document-model.enum';
import sortArray from 'sort-array';

import { IElementTypeModelOption, IElementTypeModelSelectProps } from './types';

const SECTION_BREAK = DocumentSectionChildrenTypeEnum.SECTION_BREAK;

export const ElementTypeModelSelect: FC<
  { children?: any } & IElementTypeModelSelectProps
> = ({
  selected,
  selectedOptionValue,
  elements,
  large,
  handleSelect,
  text,
  multiple = false,
  ...props
}) => {
  const options = useMemo(() => {
    const sorted = sortArray(Object.values(elements), {
      by: ['order', 'label'],
      order: ['asc', 'asc'],
    }) as IElementTypeModelOption[];

    return sorted.flatMap((option) => {
      if (option.type !== SECTION_BREAK) {
        return [{ ...option, optionValue: option.type }];
      }

      return [
        {
          ...option,
          optionValue: `${SECTION_BREAK}:${DocModelPageOrientation.PORTRAIT}`,
          orientation: DocModelPageOrientation.PORTRAIT,
          label: 'Quebra de Seção — Retrato',
        },
        {
          ...option,
          optionValue: `${SECTION_BREAK}:${DocModelPageOrientation.LANDSCAPE}`,
          orientation: DocModelPageOrientation.LANDSCAPE,
          label: 'Quebra de Seção — Paisagem',
        },
      ];
    });
  }, [elements]);

  return (
    <STagSearchSelect
      options={options}
      multiple={multiple}
      text={text || elements[selected]?.label}
      keys={['label']}
      large={large}
      sx={{ alignItems: 'start' }}
      handleSelectMenu={handleSelect}
      selected={[selectedOptionValue || selected]}
      tooltipTitle={elements[selected]?.label}
      optionsFieldName={{ valueField: 'optionValue', contentField: 'label' }}
      {...props}
    />
  );
};

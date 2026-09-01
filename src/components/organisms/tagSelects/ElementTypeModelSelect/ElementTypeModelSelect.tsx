import React, { FC, useMemo } from 'react';

import { STagSearchSelect } from 'components/molecules/STagSearchSelect';
import { DocModelPageOrientation } from 'core/interfaces/api/IDocumentModel';
import { DocumentSectionChildrenTypeEnum } from 'project/enum/document-model.enum';

import { atomVisualLabel } from 'components/organisms/documentModel/editor-v2/domain/atom-visual';
import {
  DOCUMENT_MODEL_INSERT_VISUAL,
  withContentInsertOptionIcon,
} from 'components/organisms/documentModel/utils/documentModelInsertVisuals';
import { sortContentInsertOptions } from 'components/organisms/documentModel/utils/sortContentInsertOptions';

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
  insertVisualFamily,
  ...props
}) => {
  const insertVisual =
    insertVisualFamily === 'content'
      ? DOCUMENT_MODEL_INSERT_VISUAL.content
      : null;

  const options = useMemo(() => {
    const sorted = sortContentInsertOptions(
      Object.values(elements) as IElementTypeModelOption[],
    );

    const mapped = sorted.flatMap((option) => {
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

    if (!insertVisual) return mapped;

    return mapped.map((option) => withContentInsertOptionIcon(option));
  }, [elements, insertVisual]);

  return (
    <STagSearchSelect
      options={options}
      multiple={multiple}
      text={
        text ||
        elements[selected]?.label ||
        atomVisualLabel(selected)
      }
      keys={['label']}
      large={large}
      sx={{ alignItems: 'start' }}
      handleSelectMenu={handleSelect}
      selected={[selectedOptionValue || selected]}
      tooltipTitle={
        elements[selected]?.label ||
        (selected ? atomVisualLabel(selected) : undefined)
      }
      optionsFieldName={{ valueField: 'optionValue', contentField: 'label' }}
      {...(insertVisual && {
        icon: insertVisual.buttonIcon,
        iconItem: insertVisual.menuFallbackIcon,
        iconProps: { sx: { color: insertVisual.menuIconColor, fontSize: 16 } },
        borderActive: insertVisual.borderActive,
      })}
      {...props}
    />
  );
};

import React, { FC } from 'react';

import deepEqual from 'deep-equal';
import { InlineStyleTypeEnum } from 'project/enum/document-model.enum';

import {
  IDocVariablesAllType,
  IEntityRange,
  IInlineStyleRange,
} from 'core/interfaces/api/IDocumentModel';

import { replaceAllVariables } from '../../utils/replaceAllVariables';
import { getFontSize } from '../utils/getFontSize';

export const StyledText: FC<
  { children?: any } & {
    inlineStyleRange: IInlineStyleRange[];
    entityRange: IEntityRange[];
    text: string;
    variables: IDocVariablesAllType;
  }
> = ({ inlineStyleRange, entityRange, text, variables }) => {
  const getStyle = (range: IInlineStyleRange): React.CSSProperties => {
    const style: React.CSSProperties = {};
    switch (range.style) {
      case InlineStyleTypeEnum.BOLD:
        style.fontWeight = 'bold';
        break;
      case InlineStyleTypeEnum.ITALIC:
        style.fontStyle = 'italic';
        break;
      case InlineStyleTypeEnum.UNDERLINE:
        style.textDecoration = 'underline';
        break;
      case InlineStyleTypeEnum.SUPERSCRIPT:
        style.verticalAlign = 'super';
        style.fontSize = '10px';
        break;
      case InlineStyleTypeEnum.SUBSCRIPT:
        style.verticalAlign = 'sub';
        style.fontSize = '10px';
        break;
      case InlineStyleTypeEnum.FONTSIZE: {
        if (range.value)
          style.fontSize = `${getFontSize(Number(range.value))}px`;
        break;
      }
      case InlineStyleTypeEnum.COLOR: {
        style.color = range.value;
        break;
      }
      case InlineStyleTypeEnum.BG_COLOR: {
        style.backgroundColor = range.value;
        break;
      }
      default:
        break;
    }
    return style;
  };

  const styleMap = {} as Record<number, React.CSSProperties>;

  inlineStyleRange.forEach((range) => {
    for (let i = range.offset; i < range.offset + range.length; i++) {
      if (!styleMap[i]) {
        styleMap[i] = {};
      }

      styleMap[i] = { ...getStyle(range), ...styleMap[i] };
    }
  });

  if (entityRange?.length)
    entityRange.forEach((range) => {
      for (let i = range.offset; i < range.offset + range.length; i++) {
        if (!styleMap[i]) {
          styleMap[i] = {};
        }

        if (range.data?.type === 'LINK') {
          styleMap[i] = {
            color: 'blueviolet',
            textDecoration: 'underline',
            ...styleMap[i],
          };
        }
      }
    });

  const renderText = () => {
    const result = [] as any;
    let currentStyle: React.CSSProperties = {};
    let currentText = '';

    for (let i = 0; i < text.length; i++) {
      const style = styleMap[i];

      if (!deepEqual(style, currentStyle)) {
        // If the style has changed, add the previous text with its style to the result array
        if (currentText) {
          result.push(
            <span key={i - currentText.length} style={currentStyle}>
              {
                replaceAllVariables(currentText, variables, {
                  wrapper: true,
                  beforeWrapper: '{{',
                  afterWrapper: '}}',
                  addSpan: true,
                }).text
              }
            </span>,
          );
          currentText = '';
        }

        // Update the current style to the new style
        currentStyle = style;
      }

      // Add the current character to the current text
      currentText += text[i];
    }

    // Add any remaining text to the result array
    if (currentText) {
      result.push(
        <span key={text.length - currentText.length} style={currentStyle}>
          {
            replaceAllVariables(currentText, variables, {
              wrapper: true,
              beforeWrapper: '{{',
              afterWrapper: '}}',
              addSpan: true,
            }).text
          }
        </span>,
      );
    }

    return result;
  };

  return <p>{renderText()}</p>;
};

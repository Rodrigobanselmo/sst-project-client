import React, { useMemo } from 'react';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';
import {
  DocumentSectionChildrenTypeEnum,
  DocumentSectionTypeEnum,
} from 'project/enum/document-model.enum';

import {
  IDocumentModelFull,
  IDocVariablesAllType,
} from 'core/interfaces/api/IDocumentModel';

import {
  NodeDocumentModelElementData as IElement,
  NodeDocumentModelSectionData as ISection,
} from '../../DocumentModelTree/types/types';
import { parseInlineStyleText } from '../../utils/parseInlineStyleText';
import { replaceAllVariables } from '../../utils/replaceAllVariables';
import { ITypeDocumentModel } from '../types/types';
import { getFontSize, getSpacing } from '../utils/getFontSize';
import { ItemWrapper } from './ItemWrapper';
import { StyledText } from './StyledText';
import {
  STBreakPage,
  STBullet,
  STBulletSpace,
  STHeaderText,
  STOther,
  STParagraph,
  STSection,
} from './styles';

type Props = {
  data: ITypeDocumentModel[];
  variables: IDocVariablesAllType;
  elements: IDocumentModelFull['elements'];
  sections: IDocumentModelFull['sections'];
};

export const TypeSectionItem: React.FC<Props> = ({
  variables,
  data,
  elements,
  sections,
}) => {
  const map = useMemo<Record<string, (item: any) => JSX.Element>>(
    () => ({
      [DocumentSectionTypeEnum.SECTION]: (item: ISection) => (
        <STSection>
          Início de seção {item.label && <>: {item.label}</>}
        </STSection>
      ),
      [DocumentSectionChildrenTypeEnum.PARAGRAPH]: (item: IElement) => (
        <STParagraph fontSize={getFontSize(10)} pb={getSpacing(160)}>
          {item.text.split('\n').map((text, index) => (
            <StyledText
              inlineStyleRange={item.inlineStyleRangeBlock?.[index] || []}
              text={text}
              entityRange={item.entityRangeBlock?.[index] || []}
              variables={variables}
              key={item.id + index}
            />
          ))}
        </STParagraph>
      ),
      [DocumentSectionChildrenTypeEnum.LEGEND]: (item: IElement) => (
        <STParagraph fontSize={getFontSize(8)} pb={getSpacing(300)}>
          {item.text.split('\n').map((text, index) => (
            <StyledText
              inlineStyleRange={item.inlineStyleRangeBlock?.[index] || []}
              entityRange={item.entityRangeBlock?.[index] || []}
              text={text}
              variables={variables}
              key={item.id + index}
            />
          ))}
        </STParagraph>
      ),
      [DocumentSectionChildrenTypeEnum.PARAGRAPH_TABLE]: (item: IElement) => (
        <STParagraph fontSize={getFontSize(8)} pb={getSpacing(70)}>
          <SText component={'span'} fontSize={getFontSize(8)}>
            Tabela
          </SText>
          {item.text.split('\n').map((text, index) => (
            <StyledText
              entityRange={item.entityRangeBlock?.[index] || []}
              inlineStyleRange={item.inlineStyleRangeBlock?.[index] || []}
              text={text}
              variables={variables}
              key={item.id + index}
            />
          ))}
        </STParagraph>
      ),
      [DocumentSectionChildrenTypeEnum.PARAGRAPH_FIGURE]: (item: IElement) => (
        <STParagraph fontSize={getFontSize(8)} pb={getSpacing(70)}>
          <SText component={'span'} fontSize={getFontSize(8)}>
            Imagem
          </SText>
          {item.text.split('\n').map((text, index) => (
            <StyledText
              entityRange={item.entityRangeBlock?.[index] || []}
              inlineStyleRange={item.inlineStyleRangeBlock?.[index] || []}
              text={text}
              variables={variables}
              key={item.id + index}
            />
          ))}
        </STParagraph>
      ),
      [DocumentSectionChildrenTypeEnum.BULLET]: (item: IElement) => (
        <STBullet
          fontSize={getFontSize(item.size || 10)}
          level={item.level || 0}
          pb={getSpacing(160)}
        >
          <Box>
            {item.text.split('\n').map((text, index) => (
              <StyledText
                entityRange={item.entityRangeBlock?.[index] || []}
                inlineStyleRange={item.inlineStyleRangeBlock?.[index] || []}
                text={text}
                variables={variables}
                key={item.id + index}
              />
            ))}
          </Box>
        </STBullet>
      ),
      [DocumentSectionChildrenTypeEnum.BULLET_SPACE]: (item: IElement) => (
        <STBulletSpace
          fontSize={getFontSize(item.size || 10)}
          level={item.level || 0}
          pb={getSpacing(80)}
          // lineHeight={getLineHeight(350)}
        >
          <Box>
            {item.text.split('\n').map((text, index) => (
              <StyledText
                entityRange={item.entityRangeBlock?.[index] || []}
                inlineStyleRange={item.inlineStyleRangeBlock?.[index] || []}
                text={text}
                variables={variables}
                key={item.id + index}
              />
            ))}
          </Box>
        </STBulletSpace>
      ),

      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  BREAK PAGE

      [DocumentSectionChildrenTypeEnum.TITLE]: (item: IElement) => (
        <STHeaderText pb={3} pt={0} fontSize={getFontSize(16)}>
          <SText component={'span'} className="title">
            Título
          </SText>
          {item.text.split('\n').map((text, index) => (
            <StyledText
              entityRange={[]}
              inlineStyleRange={[]}
              text={text}
              variables={variables}
              key={item.id + index}
            />
          ))}
        </STHeaderText>
      ),
      [DocumentSectionChildrenTypeEnum.H1]: (item: IElement) => (
        <STHeaderText fontSize={getFontSize(14)}>
          <SText component={'span'} className="title">
            H1
          </SText>
          {item.text.split('\n').map((text, index) => (
            <StyledText
              entityRange={[]}
              inlineStyleRange={[]}
              text={text}
              variables={variables}
              key={item.id + index}
            />
          ))}
        </STHeaderText>
      ),
      [DocumentSectionChildrenTypeEnum.H2]: (item: IElement) => (
        <STHeaderText fontSize={getFontSize(13)}>
          <SText component={'span'} className="title">
            H2
          </SText>
          {item.text.split('\n').map((text, index) => (
            <StyledText
              entityRange={[]}
              inlineStyleRange={[]}
              text={text}
              variables={variables}
              key={item.id + index}
            />
          ))}
        </STHeaderText>
      ),
      [DocumentSectionChildrenTypeEnum.H3]: (item: IElement) => (
        <STHeaderText fontSize={getFontSize(12)}>
          <SText component={'span'} className="title">
            H3
          </SText>
          {item.text.split('\n').map((text, index) => (
            <StyledText
              entityRange={[]}
              inlineStyleRange={[]}
              text={text}
              variables={variables}
              key={item.id + index}
            />
          ))}
        </STHeaderText>
      ),
      [DocumentSectionChildrenTypeEnum.H4]: (item: IElement) => (
        <STHeaderText fontSize={getFontSize(11)}>
          <SText component={'span'} className="title">
            H4
          </SText>
          {item.text.split('\n').map((text, index) => (
            <StyledText
              entityRange={[]}
              inlineStyleRange={[]}
              text={text}
              variables={variables}
              key={item.id + index}
            />
          ))}
        </STHeaderText>
      ),
      [DocumentSectionChildrenTypeEnum.H5]: (item: IElement) => (
        <STHeaderText fontSize={getFontSize(10)}>
          <SText component={'span'} className="title">
            H5
          </SText>
          {item.text.split('\n').map((text, index) => (
            <StyledText
              entityRange={[]}
              inlineStyleRange={[]}
              text={text}
              variables={variables}
              key={item.id + index}
            />
          ))}
        </STHeaderText>
      ),
      [DocumentSectionChildrenTypeEnum.H6]: (item: IElement) => (
        <STHeaderText fontSize={getFontSize(10)}>
          <SText component={'span'} className="title">
            H6
          </SText>
          {item.text.split('\n').map((text, index) => (
            <StyledText
              entityRange={[]}
              inlineStyleRange={[]}
              text={text}
              variables={variables}
              key={item.id + index}
            />
          ))}
        </STHeaderText>
      ),
      [DocumentSectionChildrenTypeEnum.BREAK]: (item: IElement) => (
        <STBreakPage>Quebra de Página</STBreakPage>
      ),
    }),
    [variables],
  );

  return (
    <>
      {data.map((item) => {
        return (
          <ItemWrapper
            variables={variables}
            item={item}
            elements={elements}
            sections={sections}
            key={item.id}
          >
            {map[item.type]?.(item) || (
              <STOther>
                {(item as any).label ||
                  sections?.[item.type]?.label ||
                  elements?.[item.type]?.label ||
                  item.type ||
                  'ITEM NÃO IDENTIFICADO'}
              </STOther>
            )}
          </ItemWrapper>
        );
      })}
    </>
  );
};

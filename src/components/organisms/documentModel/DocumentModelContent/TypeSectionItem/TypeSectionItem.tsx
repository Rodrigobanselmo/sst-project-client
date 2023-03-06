import React, { ReactElement } from 'react';

import FolderIcon from '@mui/icons-material/Folder';
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
import { replaceAllVariables } from '../../utils/replaceAllVariables';
import { ITypeDocumentModel } from '../types/types';
import { getFontSize, getLineHeight, getSpacing } from '../utils/getFontSize';
import {
  STParagraph,
  STOther,
  STSection,
  STContainerItem,
  STHeaderText,
  STBullet,
  STBulletSpace,
  STBreakPage,
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
  const map: Record<string, (item: any) => JSX.Element> = {
    [DocumentSectionTypeEnum.SECTION]: (item: ISection) => (
      <STSection>Início de seção {item.label && <>: {item.label}</>}</STSection>
    ),
    [DocumentSectionChildrenTypeEnum.TITLE]: (item: IElement) => (
      <STHeaderText pb={3} pt={0} fontSize={getFontSize(16)}>
        <SText component={'span'}>Título</SText>
        {replaceAllVariables(item.text, variables, { wrapper: true })}
      </STHeaderText>
    ),
    [DocumentSectionChildrenTypeEnum.H1]: (item: IElement) => (
      <STHeaderText fontSize={getFontSize(14)}>
        <SText component={'span'}>H1</SText>
        {replaceAllVariables(item.text, variables, { wrapper: true })}
      </STHeaderText>
    ),
    [DocumentSectionChildrenTypeEnum.H2]: (item: IElement) => (
      <STHeaderText fontSize={getFontSize(13)}>
        <SText component={'span'}>H2</SText>
        {replaceAllVariables(item.text, variables, { wrapper: true })}
      </STHeaderText>
    ),
    [DocumentSectionChildrenTypeEnum.H3]: (item: IElement) => (
      <STHeaderText fontSize={getFontSize(12)}>
        <SText component={'span'}>H3</SText>
        {replaceAllVariables(item.text, variables, { wrapper: true })}
      </STHeaderText>
    ),
    [DocumentSectionChildrenTypeEnum.H4]: (item: IElement) => (
      <STHeaderText fontSize={getFontSize(11)}>
        <SText component={'span'}>H4</SText>
        {replaceAllVariables(item.text, variables, { wrapper: true })}
      </STHeaderText>
    ),
    [DocumentSectionChildrenTypeEnum.H5]: (item: IElement) => (
      <STHeaderText fontSize={getFontSize(10)}>
        <SText component={'span'}>H5</SText>
        {replaceAllVariables(item.text, variables, { wrapper: true })}
      </STHeaderText>
    ),
    [DocumentSectionChildrenTypeEnum.H6]: (item: IElement) => (
      <STHeaderText fontSize={getFontSize(10)}>
        <SText component={'span'}>H6</SText>
        {replaceAllVariables(item.text, variables, { wrapper: true })}
      </STHeaderText>
    ),
    [DocumentSectionChildrenTypeEnum.PARAGRAPH]: (item: IElement) => (
      <STParagraph fontSize={getFontSize(10)} pb={getSpacing(160)}>
        {replaceAllVariables(item.text, variables, { wrapper: true })}
      </STParagraph>
    ),
    [DocumentSectionChildrenTypeEnum.LEGEND]: (item: IElement) => (
      <STParagraph fontSize={getFontSize(8)} pb={getSpacing(300)}>
        {replaceAllVariables(item.text, variables, { wrapper: true })}
      </STParagraph>
    ),
    [DocumentSectionChildrenTypeEnum.PARAGRAPH_TABLE]: (item: IElement) => (
      <STParagraph fontSize={getFontSize(8)} pb={getSpacing(70)}>
        <SText component={'span'} fontSize={getFontSize(8)}>
          Tabela
        </SText>
        {replaceAllVariables(item.text, variables, { wrapper: true })}
      </STParagraph>
    ),
    [DocumentSectionChildrenTypeEnum.PARAGRAPH_FIGURE]: (item: IElement) => (
      <STParagraph fontSize={getFontSize(8)} pb={getSpacing(70)}>
        <SText component={'span'} fontSize={getFontSize(8)}>
          Imagem
        </SText>
        {replaceAllVariables(item.text, variables, { wrapper: true })}
      </STParagraph>
    ),
    [DocumentSectionChildrenTypeEnum.BULLET]: (item: IElement) => (
      <STBullet
        fontSize={getFontSize(item.size || 10)}
        level={item.level || 0}
        pb={getSpacing(160)}
      >
        {replaceAllVariables(item.text, variables, { wrapper: true })}
      </STBullet>
    ),
    [DocumentSectionChildrenTypeEnum.BULLET_SPACE]: (item: IElement) => (
      <STBulletSpace
        fontSize={getFontSize(item.size || 10)}
        level={item.level || 0}
        pb={getSpacing(80)}
        // lineHeight={getLineHeight(350)}
      >
        {replaceAllVariables(item.text, variables, { wrapper: true })}
      </STBulletSpace>
    ),
    [DocumentSectionChildrenTypeEnum.BREAK]: (item: IElement) => (
      <STBreakPage>Quebra de Página</STBreakPage>
    ),
  };

  return (
    <>
      {data.map((item) => {
        return (
          <STContainerItem key={item.id}>
            {map[item.type]?.(item) || (
              <STOther>
                {(item as any).label ||
                  sections?.[item.type]?.label ||
                  elements?.[item.type]?.label ||
                  item.type ||
                  'ITEM NÃO IDENTIFICADO'}
              </STOther>
            )}
          </STContainerItem>
        );
      })}
    </>
  );
};

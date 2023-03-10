import React, { cloneElement, useMemo, useState } from 'react';
import { SyntheticKeyboardEvent } from 'react-draft-wysiwyg';

import { Box, ClickAwayListener } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import { ElementTypeModelSelect } from 'components/organisms/tagSelects/ElementTypeModelSelect/ElementTypeModelSelect';
import { SectionTypeModelSelect } from 'components/organisms/tagSelects/SectionTypeModelSelect/SectionTypeModelSelect';
import { convertToRaw, EditorState, RawDraftContentState } from 'draft-js';
import dynamic from 'next/dynamic';
import {
  DocumentSectionChildrenTypeEnum,
  InlineStyleTypeEnum,
} from 'project/enum/document-model.enum';
import sortArray from 'sort-array';
import {
  setDocumentAddElementAfterChild,
  setDocumentAddElementAfterSection,
  setDocumentDeleteElementChild,
  setDocumentDeleteSection,
  setDocumentEditElementChild,
} from 'store/reducers/document/documentSlice';

import SAddIcon from 'assets/icons/SAddIcon';
import { SCloseIcon } from 'assets/icons/SCloseIcon';
import { SDeleteIcon } from 'assets/icons/SDeleteIcon';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import {
  IDocumentModelFull,
  IDocVariablesAllType,
  IInlineStyleRange,
} from 'core/interfaces/api/IDocumentModel';
import { generateRandomString } from 'core/utils/helpers/generateRandomString';

import { NodeDocumentModelElementData } from '../../DocumentModelTree/types/types';
import {
  IReplaceAllVarItem,
  replaceAllVariables,
} from '../../utils/replaceAllVariables';
import { replaceMultiple } from '../../utils/replaceMultiple';
import { replaceSubstring } from '../../utils/replaceSubstring';
import { transformArrayToObjectFunction } from '../../utils/transformArrayToObjectFunction';
import { ITypeDocumentModel } from '../types/types';
import { RemoveDoubleClickButton } from './RemoveDoubleClickButton';
import { STContainerItem } from './styles';

const DraftEditor = dynamic(
  async () => {
    const mod = await import(
      'components/molecules/form/draft-editor/DraftEditor'
    );
    return mod.DraftEditor;
  },
  { ssr: false },
);

const mapProps: Record<
  string,
  {
    edit?: boolean;
    multiline?: boolean;
    draft?: boolean;
    toolbar?: boolean;
    fontSize?: boolean;
  }
> = {
  [DocumentSectionChildrenTypeEnum.PARAGRAPH]: {
    edit: true,
    multiline: true,
    draft: true,
    fontSize: true,
    toolbar: true,
  },
  [DocumentSectionChildrenTypeEnum.BULLET]: {
    edit: true,
    draft: true,
    fontSize: true,
    toolbar: true,
  },
  [DocumentSectionChildrenTypeEnum.BULLET_SPACE]: {
    edit: true,
    draft: true,
    fontSize: true,
    toolbar: true,
  },
  [DocumentSectionChildrenTypeEnum.PARAGRAPH_FIGURE]: {
    edit: true,
    draft: true,
    toolbar: true,
  },
  [DocumentSectionChildrenTypeEnum.PARAGRAPH_TABLE]: {
    edit: true,
    draft: true,
    toolbar: true,
  },
  [DocumentSectionChildrenTypeEnum.LEGEND]: {
    edit: true,
    draft: true,
    toolbar: true,
  },
  [DocumentSectionChildrenTypeEnum.TITLE]: {
    edit: true,
    draft: true,
  },
  [DocumentSectionChildrenTypeEnum.H1]: {
    edit: true,
    draft: true,
  },
  [DocumentSectionChildrenTypeEnum.H2]: {
    edit: true,
    draft: true,
  },
  [DocumentSectionChildrenTypeEnum.H3]: {
    edit: true,
    draft: true,
  },
  [DocumentSectionChildrenTypeEnum.H4]: {
    edit: true,
    draft: true,
  },
  [DocumentSectionChildrenTypeEnum.H5]: {
    edit: true,
    draft: true,
  },
  [DocumentSectionChildrenTypeEnum.H6]: {
    edit: true,
    draft: true,
  },
};

type Props = {
  item: ITypeDocumentModel;
  variables: IDocVariablesAllType;
  elements: IDocumentModelFull['elements'];
  sections: IDocumentModelFull['sections'];
};

export const ItemWrapper: React.FC<Props> = ({
  variables,
  item,
  elements,
  sections,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const isElement = 'element' in item;
  const isSection = 'section' in item;

  const onOpen = () => {
    if (!open) {
      setOpen(true);
    }
  };

  const onEditChild = (element: Partial<NodeDocumentModelElementData>) => {
    dispatch(
      setDocumentEditElementChild({
        element: { ...element, id: item.id },
      }),
    );
  };

  const onDuplicateChild = (element: Partial<NodeDocumentModelElementData>) => {
    dispatch(
      setDocumentAddElementAfterChild({
        element: { ...element, id: item.id },
      }),
    );
  };

  const onAddElementAfterSection = (
    element: NodeDocumentModelElementData,
    sectionId: string,
  ) => {
    dispatch(
      setDocumentAddElementAfterSection({
        element: { ...element },
        sectionId,
      }),
    );
  };

  const onDeleteChild = (id: string) => {
    dispatch(setDocumentDeleteElementChild({ id }));
  };

  const onDeleteSection = (id: string) => {
    dispatch(setDocumentDeleteSection({ id }));
  };

  const handleEdit = (value: Partial<NodeDocumentModelElementData> | null) => {
    if (!value) return;
    if ('element' in item) onEditChild({ ...value, id: item.id });
  };

  const handleDuplicate = (data: ITypeDocumentModel) => {
    if ('element' in data)
      onDuplicateChild({
        ...data,
        ...(data.text && {
          text: '[DUPLICADO] ' + data.text.slice(0, 10) + '...',
        }),
      });
  };

  const handleAddChild = (data: ITypeDocumentModel) => {
    onAddElementAfterSection(
      {
        id: '',
        text: 'Novo parágrafo....',
        type: DocumentSectionChildrenTypeEnum.PARAGRAPH,
        element: true,
      },
      data.id,
    );
  };

  const handleDelete = (data: ITypeDocumentModel) => {
    if ('element' in data) onDeleteChild(data.id);
    if ('section' in data) onDeleteSection(data.id);
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  const handleReturn = (
    e: SyntheticKeyboardEvent,
    editorState: EditorState,
  ) => {
    // const contentState = convertToRaw(editorState.getCurrentContent());
    // handleEdit(parseFromEditorToElement(contentState));
    // setOpen(false);
    return true;
  };

  const parseToEditor = (item: ITypeDocumentModel) => {
    const entityMap: any[] = [];

    const createEntityRangeVars = (items: IReplaceAllVarItem[]) => {
      return items.map((v) => {
        entityMap.push({
          data: {
            value: v.data?.type,
            url: '',
            text: v.wrapperVariable,
          },
          mutability: 'IMMUTABLE',
          type: 'MENTION',
        });

        return {
          key: entityMap.length - 1,
          length: v.length,
          offset: v.offset,
        };
      });
    };

    const getInlineStyleRanges = (inlineStyleRange: IInlineStyleRange[]) => {
      return inlineStyleRange.map((inlineStyle) => {
        let style: string = inlineStyle.style;

        if (inlineStyle.style == InlineStyleTypeEnum.BG_COLOR) {
          style = 'bgcolor-' + inlineStyle.value;
        } else if (inlineStyle.style == InlineStyleTypeEnum.COLOR) {
          style = 'color-' + inlineStyle.value;
        } else if (inlineStyle.style == InlineStyleTypeEnum.FONTSIZE) {
          style = 'fontsize-' + inlineStyle.value;
        }

        return {
          length: inlineStyle.length,
          offset: inlineStyle.offset,
          style: style,
        };
      });
    };

    const blocks: RawDraftContentState['blocks'] = (item.text || '')
      ?.split('\n')
      .map((itemText, index) => {
        const { text, variables: foundVars } = replaceAllVariables(
          itemText,
          variables,
          { wrapper: true },
        );

        let inlineStyleRanges: any[] = [];
        let data = {};

        const entityRanges = createEntityRangeVars(foundVars);
        if ('element' in item && item.inlineStyleRangeBlock) {
          inlineStyleRanges = getInlineStyleRanges(
            item.inlineStyleRangeBlock[index],
          );

          data = { ...(item.align && { 'text-align': item.align }) };
        }

        return {
          key: generateRandomString(),
          text,
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges,
          entityRanges: entityRanges,
          data,
        };
      });

    const content = {
      entityMap: transformArrayToObjectFunction(entityMap),
      blocks,
    };

    return content;
  };

  const parseFromEditorToElement = (
    content: RawDraftContentState,
  ): Partial<NodeDocumentModelElementData> | null => {
    if (!content) return null;

    const text = content.blocks
      .reduce((acc, block) => {
        if (block.text) {
          let text = block.text;

          text = replaceMultiple(
            text,
            block.entityRanges.map((entity) => {
              return {
                length: entity.length,
                offset: entity.offset,
                replacementText: content.entityMap[entity.key]?.data?.value
                  ? `??${content.entityMap[entity.key].data.value}??`
                  : '',
              };
            }),
          );

          return [...acc, text];
        }
        return acc;
      }, [] as string[])
      .join('\n');

    const inlineStyleRange = content.blocks.map(
      (block): IInlineStyleRange[] => {
        return block.inlineStyleRanges.map((inlineStyle): IInlineStyleRange => {
          let style = inlineStyle.style as unknown as InlineStyleTypeEnum;
          let value: string | undefined = undefined;

          if (inlineStyle.style.includes('bgcolor')) {
            style = InlineStyleTypeEnum.BG_COLOR;
            value = inlineStyle.style.replace('bgcolor-', '');
          } else if (inlineStyle.style.includes('color')) {
            style = InlineStyleTypeEnum.COLOR;
            value = inlineStyle.style.replace('color-', '');
          } else if (inlineStyle.style.includes('fontsize')) {
            style = InlineStyleTypeEnum.COLOR;
            value = inlineStyle.style.replace('fontsize-', '');
          }

          return {
            style,
            offset: inlineStyle.offset,
            length: inlineStyle.length,
            value,
          };
        });
      },
    );

    return {
      inlineStyleRangeBlock: inlineStyleRange,
      text,
      ...(content.blocks[0].data?.['text-align'] && {
        align: content.blocks[0].data['text-align'],
      }),
    };
  };

  const suggestions = useMemo(
    () =>
      sortArray(
        Object.values(variables)
          .filter((v) => v.active != false && !v.isBoolean && v.label)
          .map((variable) => ({
            text: variable.label,
            url: variable.value || '',
            value: variable.type,
          })),
        { by: ['text'], order: ['asc'] },
      ),
    [variables],
  );

  return (
    <STContainerItem onClick={onOpen}>
      {open && (
        <>
          <ClickAwayListener onClickAway={handleClickAway}>
            <Box marginBottom={4} marginTop={4}>
              <SFlex>
                {isElement && (
                  <ElementTypeModelSelect
                    elements={elements}
                    selected={item.type}
                    minWidth={80}
                    borderActive="primary"
                    active
                    bg="common.white"
                    marginRight="10px"
                    handleSelect={(value) =>
                      value.type &&
                      onEditChild({ id: item.id, type: value.type })
                    }
                  />
                )}
                {isSection && (
                  <SectionTypeModelSelect
                    sections={sections}
                    selected={item.type}
                    minWidth={80}
                    borderActive="primary"
                    active
                    bg="common.white"
                    marginRight="10px"
                    handleSelect={(value) =>
                      value.type &&
                      onEditChild({ id: item.id, type: value.type })
                    }
                  />
                )}
                {isSection && (
                  <STagButton
                    maxWidth={'300px'}
                    onClick={() => handleAddChild(item)}
                    tooltipTitle="Adicionar item abaixo"
                    text={'Adicionar Parágrafo +'}
                    active
                    // bg="success.main"
                    bg="common.white"
                    iconProps={{ sx: { color: 'success.main' } }}
                    borderActive="success"
                  />
                )}
                {isElement && (
                  <STagButton
                    maxWidth={'300px'}
                    onClick={() => handleDuplicate(item)}
                    tooltipTitle="Adicionar item abaixo"
                    text={'Duplicar +'}
                    active
                    // bg="success.main"
                    bg="common.white"
                    iconProps={{ sx: { color: 'success.main' } }}
                    borderActive="success"
                  />
                )}
                <RemoveDoubleClickButton
                  onHandleDeletion={() => handleDelete(item)}
                />
                <STagButton
                  maxWidth={'300px'}
                  onClick={handleClickAway}
                  icon={SCloseIcon}
                  text={'Fechar'}
                  iconProps={{ sx: { color: 'error.dark' } }}
                  borderActive="error"
                />
              </SFlex>
              {mapProps[item.type]?.draft && (
                <DraftEditor
                  size="model"
                  mt={5}
                  isJson
                  document_model
                  textProps={{ color: 'grey.700' }}
                  label={''}
                  placeholder="descrição..."
                  defaultValue={parseToEditor(item) as any}
                  onChange={(value) =>
                    handleEdit(
                      parseFromEditorToElement(
                        (value ? JSON.parse(value) : null) as any,
                      ),
                    )
                  }
                  toolbarOpen
                  mention={{
                    separator: ' ',
                    trigger: '@',
                    suggestions,
                  }}
                  toolbarProps={{
                    options: [
                      'inline',
                      ...((mapProps as any)[item.type]?.fontSize
                        ? ['fontSize']
                        : []),
                      'textAlign',
                      'colorPicker',
                      'link',
                    ],
                  }}
                  {...(!mapProps[item.type]?.toolbar && { toolbarOpen: false })}
                  {...(!(mapProps as any)[item.type]?.multiline && {
                    handleReturn,
                  })}
                />
              )}
            </Box>
          </ClickAwayListener>
        </>
      )}
      {(!open || !mapProps[item.type]?.edit) &&
        cloneElement(children as any, {
          ...(open && { open: 1 }),
        })}
    </STContainerItem>
  );
};

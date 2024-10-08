import React, { cloneElement, useMemo, useState } from 'react';
import { SyntheticKeyboardEvent } from 'react-draft-wysiwyg';

import { Box, ClickAwayListener } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import { ElementTypeModelSelect } from 'components/organisms/tagSelects/ElementTypeModelSelect/ElementTypeModelSelect';
import { SectionTypeModelSelect } from 'components/organisms/tagSelects/SectionTypeModelSelect/SectionTypeModelSelect';
import { EditorState, Modifier, RawDraftContentState } from 'draft-js';
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
import { v4 } from 'uuid';

import { SSaveIcon } from 'assets/icons/SSaveIcon';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import {
  IDocumentModelFull,
  IDocVariablesAllType,
  IEntityRange,
  IInlineStyleRange,
} from 'core/interfaces/api/IDocumentModel';
import { generateRandomString } from 'core/utils/helpers/generateRandomString';

import { NodeDocumentModelElementData } from '../../DocumentModelTree/types/types';
import {
  IReplaceAllVarItem,
  replaceAllVariables,
} from '../../utils/replaceAllVariables';
import { replaceMultiple } from '../../utils/replaceMultiple';
import { transformArrayToObjectFunction } from '../../utils/transformArrayToObjectFunction';
import { ITypeDocumentModel } from '../types/types';
import { RemoveDoubleClickButton } from './RemoveDoubleClickButton';
import { STContainerItem } from './styles';
import { ImageGalleryTable } from 'components/organisms/tables/ImageGalleryTable/ImageGalleryTable';
import { ImagesTypeEnum } from 'project/enum/imageGallery.enum';

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
    duplicate?: boolean;
    newParagraph?: boolean;
  }
> = {
  [DocumentSectionChildrenTypeEnum.IMAGE]: {
    edit: true,
  },
  [DocumentSectionChildrenTypeEnum.PARAGRAPH]: {
    edit: true,
    multiline: true,
    draft: true,
    fontSize: true,
    toolbar: true,
    duplicate: true,
  },
  [DocumentSectionChildrenTypeEnum.BULLET]: {
    edit: true,
    draft: true,
    multiline: true,
    fontSize: true,
    toolbar: true,
    duplicate: true,
  },
  [DocumentSectionChildrenTypeEnum.BULLET_SPACE]: {
    edit: true,
    multiline: true,
    draft: true,
    fontSize: true,
    toolbar: true,
    duplicate: true,
  },
  [DocumentSectionChildrenTypeEnum.PARAGRAPH_FIGURE]: {
    edit: true,
    draft: true,
    toolbar: true,
    duplicate: true,
  },
  [DocumentSectionChildrenTypeEnum.PARAGRAPH_TABLE]: {
    edit: true,
    draft: true,
    toolbar: true,
    duplicate: true,
  },
  [DocumentSectionChildrenTypeEnum.LEGEND]: {
    edit: true,
    draft: true,
    toolbar: true,
    duplicate: true,
  },
  [DocumentSectionChildrenTypeEnum.TITLE]: {
    edit: true,
    draft: true,
    newParagraph: true,
  },
  [DocumentSectionChildrenTypeEnum.H1]: {
    edit: true,
    draft: true,
    newParagraph: true,
  },
  [DocumentSectionChildrenTypeEnum.H2]: {
    edit: true,
    draft: true,
    newParagraph: true,
  },
  [DocumentSectionChildrenTypeEnum.H3]: {
    edit: true,
    draft: true,
    newParagraph: true,
  },
  [DocumentSectionChildrenTypeEnum.H4]: {
    edit: true,
    draft: true,
    newParagraph: true,
  },
  [DocumentSectionChildrenTypeEnum.H5]: {
    edit: true,
    draft: true,
    newParagraph: true,
  },
  [DocumentSectionChildrenTypeEnum.H6]: {
    edit: true,
    draft: true,
    newParagraph: true,
  },
};

type Props = {
  item: ITypeDocumentModel;
  variables: IDocVariablesAllType;
  elements: IDocumentModelFull['elements'];
  sections: IDocumentModelFull['sections'];
  companyId?: string;
};

export const ItemWrapper: React.FC<{ children?: any } & Props> = ({
  variables,
  item,
  elements,
  sections,
  children,
  companyId,
}) => {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const isElement = 'element' in item;
  const isSection = 'section' in item;
  const isDuplicate = (mapProps as any)[item.type]?.duplicate;
  const isNewParagraph = (mapProps as any)[item.type]?.paragraph != false;
  const isImage = DocumentSectionChildrenTypeEnum.IMAGE == item.type;

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

  const handleEdit = (
    value: Partial<NodeDocumentModelElementData>[] | null,
  ) => {
    if (!value) return;

    if ('element' in item) {
      const line = value.splice(0, 1)[0];
      if (line) {
        onEditChild({ ...line, id: item.id });
      }

      if (value.length > 0) {
        dispatch(
          setDocumentAddElementAfterChild({
            element: value
              .reverse()
              .map((line) => ({ ...item, ...line, id: item.id })),
          }),
        );
      }
    }
  };

  const handleDuplicate = (data: ITypeDocumentModel) => {
    if ('element' in data)
      onDuplicateChild({
        ...data,
        ...(data.text &&
          !isNewParagraph && {
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
    setTimeout(() => {
      setOpen(false);
    }, 100);
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
      const entities = items.map((v) => {
        entityMap.push({
          data: {
            value: v.data?.label || v.data?.type,
            url: v.data?.type,
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

      return entities;
    };

    const getInlineStyleRanges = (inlineStyleRange: IInlineStyleRange[]) => {
      if (!inlineStyleRange) return [];

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
          {
            wrapper: true,
            keepOriginal: true,
            beforeWrapper: '{{',
            afterWrapper: '}}',
          },
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

        if ('element' in item && item.entityRangeBlock) {
          item.entityRangeBlock[index]?.forEach((v) => {
            entityMap.push(v.data);

            entityRanges.push({
              key: entityMap.length - 1,
              length: v.length,
              offset: v.offset,
            });
          });
        }

        return {
          key: generateRandomString(),
          text: text as string,
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
  ): Partial<NodeDocumentModelElementData>[] | null => {
    if (!content) return null;

    const text = content.blocks
      .reduce((acc, block) => {
        let text = block.text;

        text = replaceMultiple(
          text,
          block.entityRanges
            .filter((entity) => {
              return content.entityMap[entity.key].type == 'MENTION';
            })
            .map((entity) => {
              let replacementText = '';

              if (content.entityMap[entity.key].type == 'MENTION') {
                replacementText = content.entityMap[entity.key]?.data?.url
                  ? `??${content.entityMap[entity.key].data.url}??`
                  : '';
              }

              return {
                length: entity.length,
                offset: entity.offset,
                replacementText,
              };
            }),
        );

        return [...acc, text];
      }, [] as string[])
      .join('\n');

    const paragraph = text
      .split('\n\n')
      .map((t) => {
        return t.trim();
      })
      .filter((t) => t.length > 0);

    const blocks = content.blocks.filter((t) => t.text.trim().length > 0);

    const inlineStyleRange = blocks.map((block): IInlineStyleRange[] => {
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
          style = InlineStyleTypeEnum.FONTSIZE;
          value = inlineStyle.style.replace('fontsize-', '');
        }

        return {
          style,
          offset: inlineStyle.offset,
          length: inlineStyle.length,
          value,
        };
      });
    });

    const entityRangeBlock = blocks.map((block): IEntityRange[] => {
      if (!block.entityRanges) return [];

      return block.entityRanges
        .filter((entity) => {
          return content.entityMap[entity.key].type != 'MENTION';
        })
        .map((entity): IEntityRange => {
          return {
            offset: entity.offset,
            length: entity.length,
            data: content.entityMap[entity.key] as any,
          };
        });
    });

    const data = paragraph.map(
      (paragraph, index): Partial<NodeDocumentModelElementData> => {
        const numNewlines = (paragraph.match(/\n/g) || []).length + 1;

        let align = blocks[index + numNewlines - 1]?.data?.['text-align'];
        if (align) {
          if (align == 'justify') {
            align = 'both';
          }
        }

        return {
          inlineStyleRangeBlock: inlineStyleRange.splice(0, numNewlines),
          entityRangeBlock: entityRangeBlock.splice(0, numNewlines),
          text: paragraph,
          ...(align && { align }),
        };
      },
    );

    return data;
  };

  const suggestions = useMemo(
    () =>
      sortArray(
        Object.values(variables)
          .filter((v) => v.active != false && !v.isBoolean && v.label)
          .map((variable) => ({
            text: variable.label || variable.type,
            url: variable.type,
            value: '{' + variable.type + '}}',
          })),
        { by: ['text'], order: ['asc'] },
      ),
    [variables],
  );

  const handlePastedText = (
    setEditorState: React.Dispatch<React.SetStateAction<EditorState>>,
    text: string,
    html: string | undefined,
    editorState: EditorState,
  ) => {
    if (!text) {
      return editorState;
    }

    text = text.replaceAll('●	', '').replaceAll('\n', '\n\n');

    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const newContentState = Modifier.replaceText(
      contentState,
      selectionState,
      text,
    );

    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      'insert-characters',
    );

    setEditorState(newEditorState);

    return 'handled';
  };

  return (
    <STContainerItem onClick={onOpen}>
      {open && (
        <>
          <ClickAwayListener
            mouseEvent="onMouseDown"
            onClickAway={handleClickAway}
          >
            <Box marginBottom={4} marginTop={4}>
              <SFlex>
                <STagButton
                  maxWidth={'300px'}
                  mr={10}
                  onClick={handleClickAway}
                  icon={SSaveIcon}
                  iconProps={{ sx: { color: 'primary.main' } }}
                  borderActive="primary"
                />
                {isElement && (
                  <ElementTypeModelSelect
                    elements={elements}
                    selected={item.type}
                    minWidth={80}
                    borderActive="info"
                    active
                    bg="common.white"
                    marginRight="5px"
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
                    borderActive="info"
                    active
                    bg="common.white"
                    marginRight="5px"
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
                {isElement && isDuplicate && (
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
                {isElement && !isDuplicate && isNewParagraph && (
                  <STagButton
                    maxWidth={'300px'}
                    onClick={() =>
                      handleDuplicate({
                        text: '[NOVO PÁRAGRAFO]',
                        type: DocumentSectionChildrenTypeEnum.PARAGRAPH,
                        element: true,
                        id: v4(),
                        sectionId: item.sectionId,
                        sectionIndex: item.sectionIndex,
                        align: item.align,
                      })
                    }
                    tooltipTitle="Adicionar item abaixo"
                    text={'Parágrafo +'}
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
                  icon={SSaveIcon}
                  text={'Salvar'}
                  iconProps={{ sx: { color: 'primary.main' } }}
                  borderActive="primary"
                  ml="8px"
                />
              </SFlex>
              {mapProps[item.type]?.draft && (
                <DraftEditor
                  size="model"
                  handlePastedText={handlePastedText}
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
                    trigger: '{',
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
              {isImage && (
                <Box pt={10}>
                  <ImageGalleryTable
                    createTypes={[ImagesTypeEnum.DOCS]}
                    companyId={companyId}
                    hideTitle
                    onSelectData={(image) =>
                      onEditChild({
                        url: (item as any).url == image.url ? null : image.url,
                        id: item.id,
                      })
                    }
                    selectedData={[item as any]}
                  />
                </Box>
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

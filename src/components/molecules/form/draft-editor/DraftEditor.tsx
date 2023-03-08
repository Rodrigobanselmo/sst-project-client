import React, { useEffect, useRef, useState } from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Box } from '@mui/material';
import SText from 'components/atoms/SText';
import {
  ContentState,
  convertFromRaw,
  convertToRaw,
  EditorState,
  Modifier,
} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import dynamic from 'next/dynamic';

import { useNewDebounce } from 'core/hooks/useNewDebounce';

import { DraftEditorProps } from './types';

const STDraftBox = styled(Box)<{ document1?: number; document2?: number }>`
  overflow: visible;
  .wrapper_content {
    /* box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.19); */
    /* width: 100%; */
    border: 1px solid ${({ theme }) => theme.palette.grey[300]};
    padding: 0.3rem 0.5rem;
    margin: 1px 0px;
    border-radius: 10px;
    padding-bottom: 0rem;
    background-color: white;
    height: 100%;
  }

  .display-none {
    display: none;
  }

  .editor_content {
    background-color: white;
    width: 100%;
    max-height: 200px;
    padding: 0rem 0.5rem;
    margin: 0;
    min-height: 200px;
    max-height: 100%;
  }

  .public-DraftStyleDefault-block {
    padding: 0rem;
    margin: 0rem;
  }

  .rdw-link-wrapper {
    /* width: 200px; */
  }

  div > .rdw-option-wrapper {
    width: 20px;
    padding: 0.8rem 0.7rem;
    height: 20px;
  }

  .rdw-dropdown-selectedtext {
    font-size: 0.8rem;
  }

  .maxHeight_xs {
    min-height: 150px;
    max-height: 200px;
  }

  .maxHeight_s {
    min-height: 200px;
    max-height: 300px;
  }

  .maxHeight_m {
    min-height: 300px;
    max-height: 400px;
  }

  .maxHeight_l {
    min-height: 400px;
    max-height: 600px;
  }

  .maxHeight_xl {
    min-height: 400px;
    max-height: 900px;
  }

  .maxHeight_model {
    min-height: 50px;
    max-height: 900px;
  }

  .full {
    max-height: 100%;
  }

  .rdw-suggestion-wrapper {
    height: 500px;
    min-height: 500px;
  }

  .rdw-suggestion-dropdown {
    width: 400px;
    min-width: 300px;
    max-width: 500px;

    max-height: 320px;
    font-size: 12px;
  }

  .rdw-suggestion-option {
  }

  .rdw-editor-main {
    overflow: visible;
  }

  ${(props) =>
    props.document1 &&
    css`
      .rdw-dropdown-selectedtext {
        display: none;
      }
      .rdw-dropdown-wrapper {
        display: none;
      }
      .rdw-colorpicker-wrapper {
        display: none;
      }
      .rdw-image-wrapper {
        display: none;
      }
      div[title='Strikethrough'] {
        display: none;
      }
      div[title='Sobrescrito'] {
        display: none;
      }
      div[title='Subscrito'] {
        display: none;
      }
    `};

  ${(props) =>
    props.document2 &&
    css`
      .wrapper_content {
        margin-bottom: 15px;
        /* background-color: ${props.theme.palette.grey[50]}; */
      }

      .editor_content {
        padding-bottom: 10px;
        background-color: transparent;
      }

      .rdw-option-wrapper {
        max-height: 0px;
        min-width: 0px;
        max-width: 10px;
        img {
          padding: 0;
          max-height: 11px;
        }
      }

      .rdw-image-wrapper {
        display: none;
      }
      .rdw-list-wrapper {
        display: none;
      }
      .rdw-fontfamily-wrapper {
        display: none;
      }
      div[title='Strikethrough'] {
        display: none;
      }
    `};
`;

const Editor = dynamic(
  async () => {
    const mod = await import('react-draft-wysiwyg');
    return mod.Editor;
  },
  { ssr: false },
);

export const DraftEditor = ({
  defaultValue = '',
  placeholder = '',
  size = 'm',
  allVisible,
  label,
  isJson,
  onChange,
  textProps,
  document1,
  toolbarOpen,
  editorProps,
  document_model,
  handleReturn,
  toolbarProps,
  mention,
  ...props
}: DraftEditorProps) => {
  const [toolbar, setToolbar] = useState(toolbarOpen || false);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  );

  // const setEditorReference = (ref: any) => {
  //   if (this && (this as any)?.editorReferece)
  //     (this as any).editorReferece = ref;
  //   ref?.focus();
  // };

  useEffect(() => {
    if (!defaultValue) setEditorState(EditorState.createEmpty());
    if (defaultValue) {
      const isString = typeof defaultValue == 'string';
      if (isJson) {
        if (isString && defaultValue.includes('<p>')) return;

        return setEditorState(
          EditorState.createWithContent(
            convertFromRaw(isString ? JSON.parse(defaultValue) : defaultValue),
          ),
        );
      }

      if (!isString) return;
      const blocksFromHtml = htmlToDraft(defaultValue);
      const { contentBlocks, entityMap } = blocksFromHtml;
      const contentState = ContentState.createFromBlockArray(
        contentBlocks,
        entityMap,
      );
      const editorState = EditorState.createWithContent(contentState);
      setEditorState(editorState);
    }
  }, [defaultValue, isJson]);

  // const handleDebounceChange = useDebouncedCallback((value: any) => {
  //   onChange && onChange(value);
  // }, 1000);

  const { onDebounce, onClearDebounce } = useNewDebounce();

  const handleChange = (value: EditorState): void => {
    setEditorState(value);
    onClearDebounce();
    // handleDebounceChange(value);
  };

  const handleClickAway = (): void => {
    if (typeof toolbarOpen === 'boolean') return;
    onDebounce(() => {
      setToolbar(false);
    }, 10000);
  };

  const onTab = (e: React.KeyboardEvent): void => {
    e.nativeEvent.preventDefault();

    const contentState = Modifier.replaceText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      '      ',
      editorState.getCurrentInlineStyle(),
    );
    handleChange(
      EditorState.push(editorState, contentState, 'insert-characters'),
    );
  };

  return (
    <STDraftBox
      document1={document1 ? 1 : 0}
      document2={document_model ? 1 : 0}
      {...props}
    >
      <SText color="text.label" fontSize={14} mb={5} {...textProps}>
        {label}
      </SText>
      <Editor
        // editorRef={setEditorReference}
        onTab={onTab}
        mention={mention}
        wrapperClassName="wrapper_content"
        editorClassName={`editor_content maxHeight_${size} ${
          allVisible ? 'full' : ''
        }`}
        onBlur={() => {
          handleClickAway();
          const contentState = convertToRaw(editorState.getCurrentContent());
          const isEmpty =
            contentState?.blocks?.length === 1 &&
            contentState?.blocks?.[0]?.text === '';

          if (isEmpty) return onChange?.('');

          onChange?.(
            isJson ? JSON.stringify(contentState) : draftToHtml(contentState),
          );
        }}
        placeholder={placeholder}
        editorState={editorState}
        handleReturn={handleReturn}
        toolbar={{
          inline: {
            monospace: { className: 'display-none' },
          },
          // options: [
          //   'inline',
          //   'textAlign',
          //   'list',
          //   'link',
          //   'fontSize',
          //   'colorPicker',
          //   'emoji',
          // ],
          fontSize: {
            options: [6, 7, 7.5, 8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36],
          },
          textAlign: { inDropdown: true },
          link: { inDropdown: true },
          list: {
            indent: { className: 'display-none' },
            outdent: { className: 'display-none' },
          },
          monospace: {
            className: 'display-none',
          },
          embedded: {
            className: 'display-none',
          },
          ...toolbarProps,
        }}
        localization={{
          locale: 'pt',
        }}
        onFocus={() => {
          setToolbar(typeof toolbarOpen === 'boolean' ? toolbarOpen : true);
          if (typeof toolbarOpen !== 'boolean') onClearDebounce();
        }}
        toolbarHidden={!toolbar}
        onEditorStateChange={handleChange}
        {...(editorProps as any)}
      />
    </STDraftBox>
  );
};

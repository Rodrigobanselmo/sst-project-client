import React, { useEffect, useState } from 'react';

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

const STDraftBox = styled(Box)`
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

  .full {
    max-height: 100%;
  }
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
  ...props
}: DraftEditorProps) => {
  const [toolbar, setToolbar] = useState(false);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  );

  useEffect(() => {
    if (defaultValue) {
      if (isJson) {
        return setEditorState(
          EditorState.createWithContent(
            convertFromRaw(JSON.parse(defaultValue)),
          ),
        );
      }

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
    <STDraftBox {...props}>
      <SText color="text.label" fontSize={14} mb={5}>
        {label}
      </SText>
      <Editor
        onTab={onTab}
        wrapperClassName="wrapper_content"
        editorClassName={`editor_content maxHeight_${size} ${
          allVisible ? 'full' : ''
        }`}
        onBlur={() => {
          handleClickAway();
          onChange?.(
            draftToHtml(convertToRaw(editorState.getCurrentContent())),
          );
        }}
        placeholder={placeholder}
        editorState={editorState}
        toolbar={{
          inline: {
            monospace: { className: 'display-none' },
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
        }}
        localization={{
          locale: 'pt',
        }}
        onFocus={() => {
          onClearDebounce();
          setToolbar(true);
        }}
        toolbarHidden={!toolbar}
        onEditorStateChange={handleChange}
      />
    </STDraftBox>
  );
};

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import FormatBoldIcon from '@mui/icons-material/FormatBold';
import SuperscriptIcon from '@mui/icons-material/Superscript';
import FormatIndentDecreaseIcon from '@mui/icons-material/FormatIndentDecrease';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import SubjectIcon from '@mui/icons-material/Subject';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { markInputRule, markPasteRule } from '@tiptap/core';
import Bold from '@tiptap/extension-bold';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import Superscript from '@tiptap/extension-superscript';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ParagraphEnum } from 'project/enum/paragraph.enum';

import {
  CharacterizationEditorDoc,
  asParagraphType,
  characterizationContentToTiptap,
  indentBlockType,
  sameCharacterizationContent,
  tiptapToCharacterizationContent,
} from './characterization-content.adapter';

const starInputRegex = /(?:^|\s)(\*\*(?!\s+\*\*)((?:[^*]+))\*\*(?!\s+\*\*))$/;
const starPasteRegex = /(?:^|\s)(\*\*(?!\s+\*\*)((?:[^*]+))\*\*(?!\s+\*\*))/g;

const CharacterizationBold = Bold.extend({
  addInputRules() {
    return [markInputRule({ find: starInputRegex, type: this.type })];
  },
  addPasteRules() {
    return [markPasteRule({ find: starPasteRegex, type: this.type })];
  },
});

const CharacterizationParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      blockType: {
        default: ParagraphEnum.PARAGRAPH,
        keepOnSplit: true,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-block-type') || ParagraphEnum.PARAGRAPH,
        renderHTML: (attributes: { blockType?: string }) => ({
          'data-block-type': attributes.blockType,
        }),
      },
      sourceItem: {
        default: null,
        keepOnSplit: false,
        rendered: false,
      },
      synthetic: {
        default: false,
        keepOnSplit: false,
        rendered: false,
      },
    };
  },
});

function createExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      bold: false,
      paragraph: false,
      italic: false,
      strike: false,
      code: false,
      codeBlock: false,
      heading: false,
      blockquote: false,
      horizontalRule: false,
      orderedList: false,
      bulletList: false,
      listItem: false,
      dropcursor: false,
      gapcursor: false,
    }),
    CharacterizationParagraph,
    CharacterizationBold,
    Superscript,
    Placeholder.configure({ placeholder }),
  ];
}

function currentBlockType(editor: Editor): ParagraphEnum {
  const { $from } = editor.state.selection;
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.type.name === 'paragraph') {
      return asParagraphType(node.attrs.blockType);
    }
  }
  return ParagraphEnum.PARAGRAPH;
}

function applyBlockType(
  editor: Editor,
  nextType: (current: ParagraphEnum) => ParagraphEnum,
) {
  const { state } = editor;
  const positions: { pos: number; attrs: Record<string, unknown> }[] = [];
  state.doc.nodesBetween(state.selection.from, state.selection.to, (node, pos) => {
    if (node.type.name === 'paragraph') {
      positions.push({ pos, attrs: { ...node.attrs } });
    }
  });

  if (!positions.length) {
    const { $from } = state.selection;
    for (let depth = $from.depth; depth > 0; depth -= 1) {
      const node = $from.node(depth);
      if (node.type.name === 'paragraph') {
        positions.push({ pos: $from.before(depth), attrs: { ...node.attrs } });
        break;
      }
    }
  }

  let transaction = state.tr;
  positions.forEach(({ pos, attrs }) => {
    const current = asParagraphType(attrs.blockType);
    const type = nextType(current);
    if (type === current) return;
    transaction = transaction.setNodeMarkup(pos, undefined, {
      ...attrs,
      blockType: type,
      synthetic: false,
    });
  });

  if (transaction.docChanged) editor.view.dispatch(transaction);
}

type Props = {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function CharacterizationContentEditor({
  label,
  value,
  onChange,
  placeholder = 'Escreva o conteúdo…',
  disabled = false,
}: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const valueRef = useRef(value);
  const emittedRef = useRef(value);
  const editorRef = useRef<Editor | null>(null);
  const [ready, setReady] = useState(false);
  const [toolbarVersion, setToolbarVersion] = useState(0);
  const initialContent = useRef(characterizationContentToTiptap(value));
  const extensions = useMemo(
    () => createExtensions(placeholder),
    [placeholder],
  );

  const editor = useEditor(
    {
      extensions,
      content: initialContent.current,
      editable: !disabled,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          'aria-label': label || 'Editor de conteúdo',
        },
        handleKeyDown: (_view, event) => {
          if (event.key !== 'Tab') return false;
          const current = editorRef.current;
          if (!current || current.isDestroyed || !current.isEditable) return false;
          event.preventDefault();
          applyBlockType(current, (blockType) =>
            indentBlockType(blockType, event.shiftKey ? 'out' : 'in'),
          );
          return true;
        },
      },
      onCreate: ({ editor: current }) => {
        editorRef.current = current;
        setReady(true);
      },
      onSelectionUpdate: () => setToolbarVersion((version) => version + 1),
      onUpdate: ({ editor: current }) => {
        const next = tiptapToCharacterizationContent(
          current.getJSON() as CharacterizationEditorDoc,
        );
        if (sameCharacterizationContent(next, emittedRef.current)) return;
        emittedRef.current = next;
        onChangeRef.current(next);
      },
    },
    [extensions],
  );

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;
    const sameAsSeen = sameCharacterizationContent(value, valueRef.current);
    valueRef.current = value;
    if (sameAsSeen) return;
    if (sameCharacterizationContent(value, emittedRef.current)) return;
    editor.commands.setContent(characterizationContentToTiptap(value), false);
    emittedRef.current = value;
  }, [editor, value]);

  const blockType =
    ready && editor && !editor.isDestroyed
      ? currentBlockType(editor)
      : ParagraphEnum.PARAGRAPH;
  const boldActive = Boolean(ready && editor && !editor.isDestroyed && editor.isActive('bold'));
  const superscriptActive = Boolean(
    ready && editor && !editor.isDestroyed && editor.isActive('superscript'),
  );
  const canIndent =
    indentBlockType(blockType, 'in') !== blockType;
  const canOutdent =
    indentBlockType(blockType, 'out') !== blockType;

  const run = (action: (current: Editor) => void) => {
    if (!editor || editor.isDestroyed || disabled) return;
    action(editor);
    setToolbarVersion((version) => version + 1);
  };

  return (
    <Box sx={{ mt: label ? 1 : 0, mb: 1 }} data-toolbar={toolbarVersion}>
      {label ? (
        <Typography sx={{ color: 'grey.600', fontSize: 14, mb: 0.75 }}>
          {label}
        </Typography>
      ) : null}
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 1,
          backgroundColor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 0.25,
            px: 0.5,
            py: 0.25,
            borderBottom: '1px solid',
            borderColor: 'grey.200',
            backgroundColor: 'grey.50',
          }}
        >
          <ToolbarButton
            label="Negrito"
            active={boldActive}
            disabled={disabled || !ready}
            onClick={() =>
              run((current) => {
                current.chain().focus().toggleBold().run();
              })
            }
          >
            <FormatBoldIcon fontSize="small" />
          </ToolbarButton>
          <ToolbarButton
            label="Sobrescrito"
            active={superscriptActive}
            disabled={disabled || !ready}
            onClick={() =>
              run((current) => {
                current.chain().focus().toggleSuperscript().run();
              })
            }
          >
            <SuperscriptIcon fontSize="small" />
          </ToolbarButton>
          <ToolbarButton
            label="Parágrafo"
            active={blockType === ParagraphEnum.PARAGRAPH}
            disabled={disabled || !ready}
            onClick={() =>
              run((current) => {
                applyBlockType(current, () => ParagraphEnum.PARAGRAPH);
                current.commands.focus();
              })
            }
          >
            <SubjectIcon fontSize="small" />
          </ToolbarButton>
          <ToolbarButton
            label="Lista com marcadores"
            active={blockType !== ParagraphEnum.PARAGRAPH}
            disabled={disabled || !ready}
            onClick={() =>
              run((current) => {
                applyBlockType(current, (currentType) =>
                  currentType === ParagraphEnum.PARAGRAPH
                    ? ParagraphEnum.BULLET_0
                    : ParagraphEnum.PARAGRAPH,
                );
                current.commands.focus();
              })
            }
          >
            <FormatListBulletedIcon fontSize="small" />
          </ToolbarButton>
          <ToolbarButton
            label="Diminuir recuo"
            disabled={disabled || !ready || !canOutdent}
            onClick={() =>
              run((current) => {
                applyBlockType(current, (currentType) =>
                  indentBlockType(currentType, 'out'),
                );
                current.commands.focus();
              })
            }
          >
            <FormatIndentDecreaseIcon fontSize="small" />
          </ToolbarButton>
          <ToolbarButton
            label="Aumentar recuo"
            disabled={disabled || !ready || !canIndent}
            onClick={() =>
              run((current) => {
                applyBlockType(current, (currentType) =>
                  indentBlockType(currentType, 'in'),
                );
                current.commands.focus();
              })
            }
          >
            <FormatIndentIncreaseIcon fontSize="small" />
          </ToolbarButton>
        </Box>
        <Box
          sx={{
            px: 1.25,
            py: 1,
            '& .ProseMirror': {
              minHeight: 120,
              outline: 'none',
              fontSize: 14,
              lineHeight: 1.5,
            },
            '& .ProseMirror p': {
              margin: '0 0 4px',
            },
            '& .ProseMirror p.is-empty.is-editor-empty:first-of-type::before': {
              content: 'attr(data-placeholder)',
              float: 'left',
              height: 0,
              pointerEvents: 'none',
              color: 'text.disabled',
            },
            '& .ProseMirror strong': {
              fontWeight: 700,
            },
            '& .ProseMirror sup': {
              fontSize: '0.75em',
              verticalAlign: 'super',
            },
            ...bulletStyles,
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Box>
    </Box>
  );
}

const BULLET_LEVELS = [
  ParagraphEnum.BULLET_0,
  ParagraphEnum.BULLET_1,
  ParagraphEnum.BULLET_2,
  ParagraphEnum.BULLET_3,
  ParagraphEnum.BULLET_4,
];

const bulletStyles = BULLET_LEVELS.reduce<Record<string, object>>((styles, type, index) => {
  const selector = `& .ProseMirror p[data-block-type="${type}"]`;
  styles[selector] = {
    position: 'relative',
    paddingLeft: `${1.15 + index * 1.15}rem`,
  };
  styles[`${selector}::before`] = {
    content: '"•"',
    position: 'absolute',
    left: `${0.2 + index * 1.15}rem`,
  };
  return styles;
}, {});

function ToolbarButton({
  label,
  active = false,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip title={label}>
      <span>
        <IconButton
          size="small"
          aria-label={label}
          aria-pressed={active}
          disabled={disabled}
          color={active ? 'primary' : 'default'}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClick}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
}

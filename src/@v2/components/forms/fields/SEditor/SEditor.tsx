import CodeIcon from '@mui/icons-material/Code';
import CodeOffIcon from '@mui/icons-material/CodeOff';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import RedoIcon from '@mui/icons-material/Redo';
import SubscriptIcon from '@mui/icons-material/Subscript';
import SuperscriptIcon from '@mui/icons-material/Superscript';
import UndoIcon from '@mui/icons-material/Undo';
import {
  Box,
  BoxProps,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
} from '@mui/material';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Blockquote from '@tiptap/extension-blockquote';
import Heading, { Level } from '@tiptap/extension-heading';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import React from 'react';

// Shared styles for HTML content rendering
export const SEDITOR_HTML_STYLES = {
  fontSize: '1rem',
  color: '#232326',
  '& p': {
    margin: 0,
    marginBottom: 1,
    '&:last-child': { marginBottom: 0 },
  },
  '& h1, & h2, & h3, & h4': {
    margin: 0,
    marginBottom: 1,
    fontWeight: 600,
    '&:last-child': { marginBottom: 0 },
  },
  '& h1': { fontSize: '1.5rem' },
  '& h2': { fontSize: '1.25rem' },
  '& h3': { fontSize: '1.125rem' },
  '& h4': { fontSize: '1rem' },
  '& ul, & ol': {
    marginTop: 5,
    marginBottom: 1,
    paddingLeft: 20,
    '&:last-child': { marginBottom: 0 },
  },
  '& li': {
    marginBottom: 0.5,
    '&:last-child': { marginBottom: 0 },
  },
  '& code': {
    background: 'rgba(242, 115, 41, 0.2)',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '0.95em',
    padding: '2px 6px',
    color: '#F27329',
  },
  '& img': {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    margin: '16px auto',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  '& mark': {
    background: '#ffe066',
    color: '#232326',
    borderRadius: '2px',
    padding: '1px 4px',
  },
  '& a': {
    color: '#7c3aed',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  '& blockquote': {
    borderLeft: '4px solid #e5e7eb',
    margin: 0,
    marginBottom: 1,
    paddingLeft: 1,
    fontStyle: 'italic',
    color: '#6b7280',
    '&:last-child': { marginBottom: 0 },
  },
  '& hr': {
    border: 'none',
    borderTop: '1px solid #e5e7eb',
    margin: '16px 0',
  },
  '& strong': {
    fontWeight: 600,
  },
  '& em': {
    fontStyle: 'italic',
  },
  '& s': {
    textDecoration: 'line-through',
  },
  '& u': {
    textDecoration: 'underline',
  },
  '& sub': {
    verticalAlign: 'sub',
    fontSize: '0.75em',
  },
  '& sup': {
    verticalAlign: 'super',
    fontSize: '0.75em',
  },
} as const;

const headingOptions = [
  { label: 'Título 1', short: 'H₁', level: 1 },
  { label: 'Título 2', short: 'H₂', level: 2 },
  { label: 'Título 3', short: 'H₃', level: 3 },
  { label: 'Título 4', short: 'H₄', level: 4 },
];

const HighlightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="18"
    height="18"
    className="tiptap-button-icon"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.7072 4.70711C15.0977 4.31658 15.0977 3.68342 14.7072 3.29289C14.3167 2.90237 13.6835 2.90237 13.293 3.29289L8.69294 7.89286L8.68594 7.9C8.13626 8.46079 7.82837 9.21474 7.82837 10C7.82837 10.2306 7.85491 10.4584 7.90631 10.6795L2.29289 16.2929C2.10536 16.4804 2 16.7348 2 17V20C2 20.5523 2.44772 21 3 21H12C12.2652 21 12.5196 20.8946 12.7071 20.7071L15.3205 18.0937C15.5416 18.1452 15.7695 18.1717 16.0001 18.1717C16.7853 18.1717 17.5393 17.8639 18.1001 17.3142L22.7072 12.7071C23.0977 12.3166 23.0977 11.6834 22.7072 11.2929C22.3167 10.9024 21.6835 10.9024 21.293 11.2929L16.6971 15.8887C16.5105 16.0702 16.2605 16.1717 16.0001 16.1717C15.7397 16.1717 15.4897 16.0702 15.303 15.8887L10.1113 10.697C9.92992 10.5104 9.82837 10.2604 9.82837 10C9.82837 9.73963 9.92992 9.48958 10.1113 9.30297L14.7072 4.70711ZM13.5858 17L9.00004 12.4142L4 17.4142V19H11.5858L13.5858 17Z"
      fill="currentColor"
    ></path>
  </svg>
);

export interface SEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  containerProps?: BoxProps;
  editorContainerProps?: BoxProps;
  error?: boolean;
}

export function SEditor({
  value = '',
  onChange,
  placeholder,
  containerProps,
  editorContainerProps,
  error = false,
}: SEditorProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [showToolbar, setShowToolbar] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Digite o conteúdo...',
        emptyEditorClass: 'is-editor-empty',
      }),
      Heading.configure({ levels: [1, 2, 3, 4] }),
      Underline,
      Link,
      Code,
      CodeBlock,
      Subscript,
      Superscript,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      HorizontalRule,
      Image,
      Highlight,
    ],
    content: value,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      if (onChange) onChange(html);
    },
    onFocus: () => {
      setIsFocused(true);
      setShowToolbar(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    onBlur: () => {
      setIsFocused(false);
      timeoutRef.current = setTimeout(() => {
        setShowToolbar(false);
      }, 200);
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const [headingAnchorEl, setHeadingAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const openHeadingMenu = Boolean(headingAnchorEl);
  const handleHeadingMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setHeadingAnchorEl(event.currentTarget);
  };
  const handleHeadingMenuClose = () => {
    setHeadingAnchorEl(null);
  };

  const handleToolbarClick = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowToolbar(true);
  };

  if (!editor) {
    return null;
  }

  const buttonStyle = (active: boolean) => ({
    color: active ? '#7c3aed' : undefined,
    backgroundColor: active ? 'rgba(124, 58, 237, 0.08)' : undefined,
    borderRadius: 2,
  });

  const setLink = () => {
    const url = window.prompt('URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('URL da imagem');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const currentHeading =
    headingOptions.find((option) =>
      editor.isActive('heading', { level: option.level }),
    )?.level || null;

  return (
    <Box
      {...containerProps}
      sx={{
        border: '1px solid',
        borderColor: error ? 'error.main' : '#bfbfbf',
        borderRadius: 1,
        p: 2,
        minHeight: showToolbar ? 20 : 2,
        background: '#fff',
        ...containerProps?.sx,
      }}
    >
      {showToolbar && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          divider={<Divider orientation="vertical" flexItem />}
          sx={{ mb: 2 }}
          onClick={handleToolbarClick}
        >
          {/* Undo/Redo */}
          <Tooltip title="Desfazer">
            <span>
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().undo().run()}
                style={buttonStyle(false)}
                disabled={!editor.can().chain().focus().undo().run()}
              >
                <UndoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Refazer">
            <span>
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().redo().run()}
                style={buttonStyle(false)}
                disabled={!editor.can().chain().focus().redo().run()}
              >
                <RedoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          {/* Heading dropdown */}
          <div>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={handleHeadingMenuClick}
              sx={{
                minWidth: 30,
                fontWeight: 700,
                color: currentHeading ? '#7c3aed' : '#232326',
                background: currentHeading
                  ? 'rgba(124, 58, 237, 0.12)'
                  : 'transparent',
                border: 'none',
                borderRadius: 2,
                px: 2,
                mx: 0.5,
                '&:hover': { background: 'primary.light' },
              }}
            >
              {headingOptions.find((option) => option.level === currentHeading)
                ?.short || 'H₁'}
            </Button>
            <Menu
              anchorEl={headingAnchorEl}
              open={openHeadingMenu}
              onClose={handleHeadingMenuClose}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1.5,
                    borderRadius: 2,
                    boxShadow: '0px 8px 32px 0px rgba(80, 80, 120, 0.18)',
                    p: 4,
                    background: '#fff',
                    border: 'none',
                    overflow: 'visible',
                  },
                },
              }}
              MenuListProps={{
                sx: {
                  p: 0,
                },
              }}
            >
              {headingOptions.map((option) => (
                <MenuItem
                  key={option.level}
                  selected={currentHeading === option.level}
                  onClick={() => {
                    handleHeadingMenuClose();
                    editor
                      .chain()
                      .focus()
                      .toggleHeading({ level: option.level as Level })
                      .run();
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 4,
                    px: 6,
                    borderRadius: 1,
                    fontWeight: currentHeading === option.level ? 700 : 400,
                    color:
                      currentHeading === option.level ? '#7c3aed' : '#232326',
                    fontSize: 16,
                    background:
                      currentHeading === option.level
                        ? 'rgba(124, 58, 237, 0.08)'
                        : 'transparent',
                    transition: 'background 0.2s',
                    '&:hover': { background: 'rgba(124, 58, 237, 0.12)' },
                    mb: 0.5,
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 18, width: 28 }}>
                    {option.short}
                  </span>
                  {option.label}
                </MenuItem>
              ))}
            </Menu>
          </div>
          {/* Lists and code */}
          <Tooltip title="Lista com marcadores">
            <span>
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                style={buttonStyle(editor.isActive('bulletList'))}
                disabled={
                  !editor.can().chain().focus().toggleBulletList().run()
                }
              >
                <FormatListBulletedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Lista numerada">
            <span>
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                style={buttonStyle(editor.isActive('orderedList'))}
                disabled={
                  !editor.can().chain().focus().toggleOrderedList().run()
                }
              >
                <FormatListNumberedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Código">
            <span>
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleCode().run()}
                style={buttonStyle(editor.isActive('code'))}
                disabled={!editor.can().chain().focus().toggleCode().run()}
              >
                <CodeIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          {/* Highlight */}
          <Tooltip title="Destacar texto">
            <span>
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                style={buttonStyle(editor.isActive('highlight'))}
                disabled={!editor.can().chain().focus().toggleHighlight().run()}
              >
                <HighlightIcon
                  style={{
                    color: editor.isActive('highlight') ? '#f27329' : undefined,
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>
          {/* Formatting */}
          <Tooltip title="Negrito">
            <span>
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleBold().run()}
                style={buttonStyle(editor.isActive('bold'))}
                disabled={!editor.can().chain().focus().toggleBold().run()}
              >
                <FormatBoldIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Itálico">
            <span>
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                style={buttonStyle(editor.isActive('italic'))}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
              >
                <FormatItalicIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Riscado">
            <span>
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                style={buttonStyle(editor.isActive('strike'))}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
              >
                <FormatStrikethroughIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Sublinhado">
            <span>
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                style={buttonStyle(editor.isActive('underline'))}
              >
                <FormatUnderlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          {/* Link */}
          <Tooltip title="Link">
            <span>
              <IconButton
                size="small"
                onClick={setLink}
                style={buttonStyle(editor.isActive('link'))}
              >
                <LinkIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          {/* Subscript/Superscript */}
          <Tooltip title="Subscrito">
            <span>
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleSubscript().run()}
                style={buttonStyle(editor.isActive('subscript'))}
              >
                <SubscriptIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Sobrescrito">
            <span>
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                style={buttonStyle(editor.isActive('superscript'))}
              >
                <SuperscriptIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          {/* Text align */}
          <Tooltip title="Alinhar à esquerda">
            <span>
              <IconButton
                size="small"
                onClick={() =>
                  editor.chain().focus().setTextAlign('left').run()
                }
                style={buttonStyle(editor.isActive({ textAlign: 'left' }))}
              >
                <FormatAlignLeftIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Centralizar">
            <span>
              <IconButton
                size="small"
                onClick={() =>
                  editor.chain().focus().setTextAlign('center').run()
                }
                style={buttonStyle(editor.isActive({ textAlign: 'center' }))}
              >
                <FormatAlignCenterIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Alinhar à direita">
            <span>
              <IconButton
                size="small"
                onClick={() =>
                  editor.chain().focus().setTextAlign('right').run()
                }
                style={buttonStyle(editor.isActive({ textAlign: 'right' }))}
              >
                <FormatAlignRightIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Justificar">
            <span>
              <IconButton
                size="small"
                onClick={() =>
                  editor.chain().focus().setTextAlign('justify').run()
                }
                style={buttonStyle(editor.isActive({ textAlign: 'justify' }))}
              >
                <FormatAlignJustifyIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          {/* Horizontal rule */}
          <Tooltip title="Linha horizontal">
            <span>
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
              >
                <HorizontalRuleIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          {/* Image */}
          <Tooltip title="Adicionar imagem">
            <span>
              <IconButton size="small" onClick={addImage}>
                <ImageIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      )}
      <Box
        {...editorContainerProps}
        sx={{
          minHeight: showToolbar ? 20 : 2,
          background: '#fff',
          borderRadius: 1,
          overflow: 'hidden',
          mb: -1,
          '& .ProseMirror': {
            outline: 'none',
            boxShadow: 'none',
            border: 'none',
            minHeight: '1.5em',
            p: 5,
            pb: showToolbar ? 4 : 4,
            pt: showToolbar ? 1 : 1,
            mt: showToolbar ? 3 : 3,
            ...SEDITOR_HTML_STYLES,
          },
          '& .ProseMirror p.is-editor-empty:first-child::before': {
            content: 'attr(data-placeholder)',
            float: 'left',
            color: 'grey.500',
            pointerEvents: 'none',
            fontSize: 14,
            position: 'absolute',
            top: showToolbar ? 18 : 18,
            left: showToolbar ? 12 : 8,
            zIndex: 10,
          },
          ...editorContainerProps?.sx,
        }}
      >
        <EditorContent editor={editor} placeholder={placeholder} />
      </Box>
    </Box>
  );
}

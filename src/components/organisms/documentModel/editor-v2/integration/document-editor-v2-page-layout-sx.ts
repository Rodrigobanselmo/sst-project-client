export const documentEditorV2PageDeskSx = {
  bgcolor: 'grey.200',
  borderRadius: 1,
  overflowX: 'hidden',
  overflowY: 'auto',
  px: 1.5,
  py: 2,
};

export const documentEditorV2PageModeSx = {
  '& .ProseMirror.document-editor-v2-integration': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'transparent',
    minHeight: 'auto',
    py: 1,
  },
  '& [data-doc-section]': {
    position: 'relative',
  },
  '& .doc-editor-v2-page-sheet': {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'var(--v2-page-width, 210mm)',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    borderRadius: '2px',
    boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  '& .doc-editor-v2-page-chrome[data-page-orientation="portrait"], & .doc-editor-v2-page-spacer[data-page-orientation="portrait"], & .doc-editor-v2-page-sheet[data-page-orientation="portrait"], & .doc-editor-v2-page-block[data-page-orientation="portrait"]':
    {
      '--v2-page-width': '210mm',
      '--v2-page-height': '297mm',
    },
  '& .doc-editor-v2-page-chrome[data-page-orientation="landscape"], & .doc-editor-v2-page-spacer[data-page-orientation="landscape"], & .doc-editor-v2-page-sheet[data-page-orientation="landscape"], & .doc-editor-v2-page-block[data-page-orientation="landscape"]':
    {
      '--v2-page-width': '297mm',
      '--v2-page-height': '210mm',
    },
  '& .doc-editor-v2-page-chrome': {
    width: 'var(--v2-page-width, 210mm)',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: 'var(--v2-page-margin-left, 10mm)',
    pt: 1,
    backgroundColor: 'transparent',
    border: 'none',
    position: 'relative',
    zIndex: 1,
    pointerEvents: 'none',
    userSelect: 'none',
  },
  '& .doc-editor-v2-page-number': {
    fontSize: 11,
    fontWeight: 600,
    color: 'text.secondary',
    letterSpacing: 0.2,
  },
  '& .doc-editor-v2-page-overflow': {
    fontSize: 11,
    color: 'warning.dark',
    fontWeight: 600,
  },
  '& .doc-editor-v2-page-block': {
    width: 'var(--v2-page-width, 210mm)',
    boxSizing: 'border-box',
    paddingLeft: 'var(--v2-page-margin-left, 10mm)',
    paddingRight: 'var(--v2-page-margin-right, 10mm)',
    marginTop: 0,
    marginBottom: 0,
    marginBlock: 0,
    outline: 'none',
    boxShadow: 'none',
    position: 'relative',
    zIndex: 1,
  },
  '& .doc-editor-v2-page-block[data-doc-paragraph], & .doc-editor-v2-page-block[data-doc-heading], & .doc-editor-v2-page-block[data-doc-bullet]':
    {
      border: 'none',
      outline: 'none',
      boxShadow: 'none',
      backgroundColor: 'transparent',
      marginTop: 0,
      marginBottom: 0,
      marginBlock: 0,
    },
  '& .doc-editor-v2-page-block[data-doc-paragraph]': {
    pt: 0.75,
    pb: 0.75,
  },
  '& .doc-editor-v2-page-block[data-doc-heading]': {
    pt: 2,
    pb: 1,
  },
  '& .doc-editor-v2-page-block[data-doc-bullet]': {
    pt: 0.35,
    pb: 0.35,
    paddingLeft:
      'calc(var(--v2-page-margin-left, 10mm) + var(--doc-bullet-text-indent, 40px))',
  },
  '& .doc-editor-v2-page-block[data-doc-bullet]::before': {
    left: 'calc(var(--v2-page-margin-left, 10mm) + var(--doc-bullet-marker-left, 24px))',
  },
  '& .doc-editor-v2-page-block[data-doc-caption]': {
    my: 0,
    py: 0.75,
  },
  '& .doc-editor-v2-page-block.doc-editor-v2-atom': {
    my: 0,
    py: 1,
  },
  '& .doc-editor-v2-page-block[data-page-start="true"]': {
    paddingTop: 'var(--v2-page-margin-top, 10mm)',
  },
  '& .doc-editor-v2-page-block[data-page-end="true"]': {
    paddingBottom: 'var(--v2-page-margin-bottom, 15.875mm)',
  },
  '& .doc-editor-v2-page-spacer': {
    width: 'var(--v2-page-width, 210mm)',
    boxSizing: 'border-box',
    backgroundColor: 'transparent',
    border: 'none',
    position: 'relative',
    zIndex: 1,
    pointerEvents: 'none',
  },
  '& .doc-editor-v2-page-gap': {
    width: 'min(100%, 210mm)',
    justifyContent: 'center',
    my: 3,
    py: 0.5,
    border: 'none',
    bgcolor: 'transparent',
    boxShadow: 'none',
    color: 'text.secondary',
  },
  '& .doc-editor-v2-page-gap--break': {
    '&::before, &::after': {
      content: '""',
      flex: 1,
      borderTop: '1px dashed',
      borderColor: 'grey.500',
    },
  },
  '& .doc-editor-v2-atom.doc-editor-v2-page-gap--section': {
    width: 'min(100%, 297mm)',
    border: '1px dashed',
    borderColor: 'info.dark',
    bgcolor: 'info.light',
    color: 'info.dark',
    borderRadius: 1,
    px: 1.5,
    fontWeight: 700,
  },
};

/** Shared action treatment for the risk linkage editors (light and dark). */
export const riskEditorActionSx = {
  borderRadius: '999px',
  textTransform: 'none' as const,
  minWidth: 'auto',
  px: 6,
  minHeight: 32,
  backdropFilter: 'blur(10px)',
  '&&': {
    color: 'text.primary',
    borderColor: 'divider',
    backgroundColor: 'background.paper',
    backgroundImage:
      'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(128,128,128,0.03))',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 6px rgba(0,0,0,0.04)',
  },
  '&&:hover': {
    backgroundColor: 'action.hover',
    borderColor: 'primary.border',
  },
  '&&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: 2,
  },
  '&&.Mui-disabled': {
    color: 'text.disabled',
    borderColor: 'divider',
    backgroundColor: 'action.disabledBackground',
    boxShadow: 'none',
  },
};

export const riskEditorPrimaryActionSx = {
  ...riskEditorActionSx,
  '&&': {
    ...riskEditorActionSx['&&'],
    color: 'primary.identityOn',
    backgroundColor: 'primary.identityBackground',
    borderColor: 'primary.border',
  },
  '&&:hover': {
    backgroundColor: 'primary.identityBackgroundHover',
    borderColor: 'primary.border',
  },
};

export const riskEditorSaveActionSx = (dirty: boolean, primary = false) => {
  const base = primary ? riskEditorPrimaryActionSx : riskEditorActionSx;
  return dirty
    ? {
        ...base,
        '&&': {
          ...base['&&'],
          color: primary ? 'common.white' : 'error.main',
          borderColor: 'error.main',
          backgroundColor: primary ? 'error.main' : 'background.paper',
        },
        '&&:hover': {
          backgroundColor: primary ? 'error.dark' : 'action.hover',
          borderColor: 'error.main',
        },
      }
    : base;
};

/** Capsule search treatment, opt-in for the SST entity lists. */
export const riskEditorSearchSx = {
  '&&&& .MuiOutlinedInput-root': {
    borderRadius: '999px',
    backgroundColor: 'background.paper',
    boxShadow: 'none',
    WebkitBoxShadow: 'none',
  },
  '&&&& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'divider',
    borderWidth: 1,
  },
  '&&&& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'text.secondary',
  },
  '&&&& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'primary.main',
    borderWidth: 1,
  },
};

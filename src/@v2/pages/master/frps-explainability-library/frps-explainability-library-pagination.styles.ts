import type { SxProps, Theme } from '@mui/material';

/** Estilos locais da paginação da Biblioteca FRPS (contraste do item ativo). */
export const frpsLibraryPaginationSx: SxProps<Theme> = {
  '& .MuiPaginationItem-root': {
    color: 'text.primary',
  },
  '& .MuiPaginationItem-root:hover': {
    backgroundColor: 'action.hover',
    color: 'text.primary',
  },
  '& .MuiPaginationItem-root.Mui-selected': {
    backgroundColor: 'primary.main',
    color: 'primary.contrastText',
    fontWeight: 600,
  },
  '& .MuiPaginationItem-root.Mui-selected:hover': {
    backgroundColor: 'primary.dark',
    color: 'primary.contrastText',
  },
};

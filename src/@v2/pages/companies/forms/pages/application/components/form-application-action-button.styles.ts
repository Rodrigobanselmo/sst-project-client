import { Theme } from '@mui/material/styles';

export const formApplicationActionButtonSx = ({ palette }: Theme) => ({
            color: 'text.primary',
            borderColor: 'divider',
            background:
              palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.035))'
                : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4))',
            backdropFilter: 'blur(16px) saturate(140%)',
            WebkitBackdropFilter: 'blur(16px) saturate(140%)',
            transition:
              'background-color 160ms ease, border-color 160ms ease, transform 160ms ease',
            '&:hover': {
              color: palette.mode === 'dark' ? '#F9D43B' : '#1565C0',
              backgroundColor: 'action.hover',
              borderColor: 'text.secondary',
              transform: 'translateY(-1px)',
            },
            '&:active': { transform: 'translateY(0)' },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'text.secondary',
              outlineOffset: 2,
            },
            '& *': {
              color: 'inherit',
            },
          
});

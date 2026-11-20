import { alpha, Box, Button } from '@mui/material';

export function LinkageMenu({
  active,
  options,
  onChange,
  segmented = false,
}: {
  active: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  segmented?: boolean;
}) {
  return (
    <Box
      role="group"
      aria-label={segmented ? 'Modo de visualização' : 'Tipo de entidade'}
      sx={(theme) => ({
        alignSelf: 'flex-start',
        display: 'inline-flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        p: segmented ? 2 : 0,
        mb: segmented ? 5 : 0,
        borderRadius: '24px',
        ...(segmented && {
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.92)}, ${alpha(theme.palette.action.selected, 0.06)})`,
          border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
          backdropFilter: 'blur(12px)',
          boxShadow: `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.16)}, 0 3px 12px ${alpha(theme.palette.common.black, 0.04)}`,
        }),
      })}
    >
      {options.map((option) => (
        <Button
          key={option.value}
          size="small"
          aria-pressed={active === option.value}
          onClick={() => onChange(option.value)}
          sx={(theme) => ({
            textTransform: 'none',
            borderRadius: '20px',
            px: 6,
            py: 3,
            minHeight: 36,
            fontSize: 13,
            whiteSpace: 'nowrap',
            fontWeight: active === option.value ? 600 : 400,
            color:
              active === option.value
                ? theme.palette.text.primary
                : theme.palette.text.secondary,
            border: '1px solid',
            borderColor:
              active === option.value
                ? alpha(theme.palette.primary.main, 0.48)
                : segmented
                  ? 'transparent'
                  : theme.palette.divider,
            backgroundColor:
              active === option.value
                ? alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === 'dark' ? 0.2 : 0.15,
                  )
                : 'transparent',
            boxShadow:
              active === option.value
                ? `0 2px 5px ${alpha(theme.palette.common.black, 0.06)}`
                : 'none',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
            },
          })}
        >
          {option.label}
        </Button>
      ))}
    </Box>
  );
}

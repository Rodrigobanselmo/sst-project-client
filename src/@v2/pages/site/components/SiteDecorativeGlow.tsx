import { Box } from '@mui/material';
import { sitePalette } from '../styles/site.palette';

type SiteDecorativeGlowProps = {
  variant?: 'hero' | 'soft';
};

export function SiteDecorativeGlow({ variant = 'hero' }: SiteDecorativeGlowProps) {
  if (variant === 'soft') {
    return (
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '-10%',
            width: '50%',
            height: '60%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${sitePalette.violetSoft} 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-5%',
          width: '55%',
          height: '70%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26, 35, 50, 0.04) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '45%',
          height: '55%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26, 35, 50, 0.03) 0%, transparent 65%)',
          filter: 'blur(50px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          left: '35%',
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26, 35, 50, 0.03) 0%, transparent 70%)',
          filter: 'blur(48px)',
          opacity: 0.5,
        }}
      />
    </Box>
  );
}

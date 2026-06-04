import { Box, Stack, Typography } from '@mui/material';
import { sitePalette } from '../styles/site.palette';

const FLOW_NODES = [
  { label: 'Inventário', x: '8%', y: '18%', color: sitePalette.blue },
  { label: 'PGR', x: '72%', y: '12%', color: sitePalette.orange },
  { label: 'Plano', x: '78%', y: '58%', color: sitePalette.green },
  { label: 'FRPS', x: '12%', y: '62%', color: sitePalette.violet },
] as const;

export function SiteHeroVisual() {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: { xs: 420, md: 560 },
        mx: { xs: 'auto', md: 0 },
        ml: { md: 'auto' },
        minHeight: { xs: 320, md: 420 },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: '8%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${sitePalette.orangeGlow} 0%, transparent 70%)`,
          filter: 'blur(32px)',
          opacity: 0.5,
        }}
      />

      <Box
        sx={{
          position: 'relative',
          borderRadius: 5,
          border: `1px solid ${sitePalette.border}`,
          bgcolor: sitePalette.surface,
          boxShadow: '0 32px 80px rgba(26, 35, 50, 0.12), 0 0 0 1px rgba(255,255,255,0.8) inset',
          overflow: 'hidden',
          pt: 2,
          pb: 3,
          px: { xs: 2, md: 3 },
        }}
      >
        <Stack direction="row" spacing={1} mb={3} px={0.5}>
          {['#FCA5A5', '#FCD34D', '#86EFAC'].map((c) => (
            <Box key={c} sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: c }} />
          ))}
          <Typography variant="body2" fontWeight={600} color={sitePalette.inkMuted} ml={1}>
            Visão integrada · SimpleSST
          </Typography>
        </Stack>

        <Box
          sx={{
            position: 'relative',
            height: { xs: 200, md: 260 },
            borderRadius: 3,
            bgcolor: sitePalette.surfaceMuted,
            border: `1px dashed ${sitePalette.border}`,
            overflow: 'hidden',
          }}
        >
          <Box
            component="svg"
            viewBox="0 0 400 200"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: 0.35,
            }}
          >
            <path
              d="M 60 100 Q 200 40 340 100 Q 200 160 60 100"
              fill="none"
              stroke={sitePalette.blue}
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <path
              d="M 80 120 L 200 80 L 320 120"
              fill="none"
              stroke={sitePalette.orange}
              strokeWidth="2"
            />
          </Box>

          {FLOW_NODES.map((node) => (
            <Box
              key={node.label}
              sx={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: sitePalette.surface,
                border: `1px solid ${node.color}33`,
                boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: node.color }}>
                {node.label}
              </Typography>
            </Box>
          ))}

          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 88,
              height: 88,
              borderRadius: '50%',
              bgcolor: sitePalette.surface,
              border: `2px solid ${sitePalette.orange}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 0 12px ${sitePalette.orangeSoft}`,
            }}
          >
            <Typography variant="caption" fontWeight={800} color={sitePalette.orange} textAlign="center">
              GRO
              <br />
              integrado
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={2} mt={2.5} flexWrap="wrap" useFlexGap>
          {[
            { value: 'DOCX', label: 'Laudos' },
            { value: 'ERG-PSIC', label: 'Psicossocial' },
            { value: '100%', label: 'Rastreável' },
          ].map((stat) => (
            <Box key={stat.label} sx={{ flex: '1 1 100px', minWidth: 90 }}>
              <Typography variant="h6" fontWeight={800} color={sitePalette.ink} lineHeight={1.2}>
                {stat.value}
              </Typography>
              <Typography variant="caption" color={sitePalette.inkMuted}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

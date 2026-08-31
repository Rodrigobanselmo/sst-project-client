import ApartmentOutlined from '@mui/icons-material/ApartmentOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

import { LOGIN_STATS } from '../../constants/login-institutional.content';
import { formatLoginStat } from '../../helpers/format-login-stat';
import { useLoginStats } from '../../hooks/useLoginStats';
import type { LoginStatsCounts } from '../../services/fetch-login-stats';

const STAT_ICONS: Record<(typeof LOGIN_STATS)[number]['id'], SvgIconComponent> =
  {
    companies: ApartmentOutlined,
    workers: GroupsOutlined,
    documents: DescriptionOutlined,
  };

export function LoginInstitutionalStats() {
  const { data, isError, isSuccess } = useLoginStats();

  if (!isSuccess || isError || !data) return null;

  return (
    <Box
      component="ul"
      aria-label="Indicadores institucionais"
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        gap: { md: 7, lg: 8 },
        m: 0,
        p: 0,
        listStyle: 'none',
        flexShrink: 0,
        minWidth: { md: '100%', lg: 0 },
        width: { lg: 'auto' },
        maxWidth: { lg: '10.75rem' },
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {LOGIN_STATS.map((stat) => {
        const Icon = STAT_ICONS[stat.id];
        const formatted = formatLoginStat(data[stat.id as keyof LoginStatsCounts]);
        if (!formatted) return null;

        return (
          <Box
            key={stat.id}
            component="li"
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 3,
              minWidth: 0,
            }}
          >
            <Icon
              aria-hidden
              sx={{
                color: 'primary.main',
                fontSize: 18,
                mt: '0.35rem',
                flexShrink: 0,
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                component="p"
                sx={{
                  color: 'primary.main',
                  fontWeight: 700,
                  fontSize: { md: '1.35rem', lg: '1.55rem' },
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                }}
              >
                {formatted}
              </Typography>
              <Typography
                sx={{
                  color: 'text.light',
                  fontSize: { md: '0.75rem', lg: '0.8125rem' },
                  lineHeight: 1.35,
                  mt: 0.5,
                }}
              >
                {stat.label}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

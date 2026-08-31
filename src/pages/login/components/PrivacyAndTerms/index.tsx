import { FC } from 'react';

import GppGoodOutlined from '@mui/icons-material/GppGoodOutlined';
import { Box, Link, Stack, Typography } from '@mui/material';
import NextLink from 'next/link';

import { RoutesEnum } from 'core/enums/routes.enums';

import { LOGIN_TRUST_LINE } from '../../constants/login-institutional.content';

export const PrivacyAndTerms: FC = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        gap: { xs: 3, md: 6 },
        px: { xs: 6, sm: 12, lg: 16 },
        py: { xs: 6, md: 5 },
        borderTop: '1px solid',
        borderColor: 'background.divider',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <GppGoodOutlined
          sx={{ color: 'primary.main', fontSize: 18 }}
          aria-hidden
        />
        <Typography variant="caption" color="text.light">
          {LOGIN_TRUST_LINE}
        </Typography>
      </Stack>

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        divider={
          <Typography component="span" color="text.lightest" fontSize={12}>
            |
          </Typography>
        }
      >
        <NextLink passHref href={RoutesEnum.PRIVACY_POLITICS}>
          <Link
            target="_blank"
            underline="hover"
            color="text.medium"
            sx={{ fontSize: 12 }}
          >
            Política de Privacidade
          </Link>
        </NextLink>
        <NextLink passHref href={RoutesEnum.TERMS_OF_USE}>
          <Link
            target="_blank"
            underline="hover"
            color="text.medium"
            sx={{ fontSize: 12 }}
          >
            Termos de uso
          </Link>
        </NextLink>
      </Stack>

      <Typography variant="caption" color="text.light">
        © {year} SimpleSST — Todos os direitos reservados
      </Typography>
    </Box>
  );
};

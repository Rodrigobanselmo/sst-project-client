import { Box, Button, Container, Link, Stack, Typography } from '@mui/material';
import NextLink from 'next/link';
import { RoutesEnum } from 'core/enums/routes.enums';
import { brandNameConstant } from 'core/constants/brand.constant';
import { sitePalette } from '../styles/site.palette';

const LOGIN_PATH = '/login';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: sitePalette.ink,
        color: 'grey.200',
        py: { xs: 6, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={5}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Stack spacing={2} maxWidth={400}>
            <Stack direction="row" gap={1.5} alignItems="center">
              <Box
                component="img"
                src="/icons/brand/logo-simple.svg"
                alt="SimpleSST"
                sx={{ width: 40, height: 40 }}
              />
              <Typography fontWeight={800} color="common.white" variant="h6">
                {brandNameConstant}
              </Typography>
            </Stack>
            <Typography variant="body1" color="grey.400" lineHeight={1.65}>
              Gestão de SST com clareza, rastreabilidade e respeito ao trabalho técnico.
            </Typography>
          </Stack>

          <Stack spacing={2} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
            <Link
              component={NextLink}
              href={RoutesEnum.PRIVACY_POLITICS}
              color="grey.300"
              underline="hover"
              variant="body1"
            >
              Política de Privacidade
            </Link>
            <Link
              component={NextLink}
              href={RoutesEnum.TERMS_OF_USE}
              color="grey.300"
              underline="hover"
              variant="body1"
            >
              Termos de Uso
            </Link>
            <Button
              component={NextLink}
              href={LOGIN_PATH}
              variant="outlined"
              sx={{
                mt: 1,
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 3,
                borderColor: 'grey.600',
                color: 'common.white',
                '&:hover': { borderColor: sitePalette.orange, bgcolor: 'rgba(255,255,255,0.05)' },
              }}
            >
              Acessar sistema
            </Button>
          </Stack>
        </Stack>

        <Typography variant="body2" color="grey.600" display="block" mt={6}>
          © {year} {brandNameConstant} — Todos os direitos reservados
        </Typography>
      </Container>
    </Box>
  );
}

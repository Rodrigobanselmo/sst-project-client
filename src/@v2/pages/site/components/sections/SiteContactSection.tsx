import { Box, Button, Container, Stack, Typography } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import NextLink from 'next/link';
import { SITE_CONTACT, getSiteWhatsAppHref } from '../../constants/site-contact.constant';
import { siteSectionSx } from '../../styles/site.styles';
import { sitePalette } from '../../styles/site.palette';

const LOGIN_PATH = '/login';

export function SiteContactSection() {
  const whatsAppHref = getSiteWhatsAppHref();

  return (
    <Box
      component="section"
      id="contato"
      sx={{
        ...siteSectionSx,
        position: 'relative',
        overflow: 'hidden',
        background: sitePalette.ctaGradient,
        color: 'common.white',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: '-30%',
          right: '-15%',
          width: '50%',
          height: '80%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${sitePalette.orangeGlow} 0%, transparent 65%)`,
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={4} alignItems="center" textAlign="center">
          <Typography
            component="h2"
            fontWeight={800}
            color="common.white"
            sx={{
              fontSize: { xs: '2rem', md: '2.875rem' },
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
              textShadow: '0 2px 24px rgba(0,0,0,0.25)',
            }}
          >
            Encontrou o caminho para uma SST mais leve?
          </Typography>
          <Typography
            component="p"
            fontWeight={500}
            sx={{
              color: 'rgba(255,255,255,0.92)',
              fontSize: { xs: '1.125rem', md: '1.3125rem' },
              lineHeight: 1.65,
              maxWidth: 540,
            }}
          >
            Fale com nossa equipe sobre demonstração e implantação. Sem compromisso — só uma
            conversa para ver se faz sentido para sua operação.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width="100%" justifyContent="center" pt={1}>
            <Button
              component="a"
              href={`mailto:${SITE_CONTACT.email}?subject=${encodeURIComponent('Demonstração SimpleSST')}`}
              variant="contained"
              size="large"
              startIcon={<EmailOutlinedIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1.0625rem',
                px: 4,
                py: 1.75,
                borderRadius: 3,
                bgcolor: sitePalette.orange,
                color: '#fff',
                boxShadow: '0 12px 40px rgba(242, 115, 41, 0.45)',
                '&:hover': { bgcolor: '#e0651f' },
              }}
            >
              Solicitar demonstração
            </Button>
            <Button
              component={NextLink}
              href={LOGIN_PATH}
              variant="outlined"
              size="large"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1.0625rem',
                px: 4,
                py: 1.75,
                borderRadius: 3,
                borderColor: 'rgba(255,255,255,0.55)',
                borderWidth: 2,
                color: 'common.white',
                '&:hover': {
                  borderColor: 'common.white',
                  borderWidth: 2,
                  bgcolor: 'rgba(255,255,255,0.12)',
                },
              }}
            >
              Acessar sistema
            </Button>
          </Stack>
          <Button
            component={whatsAppHref ? 'a' : 'button'}
            href={whatsAppHref}
            target={whatsAppHref ? '_blank' : undefined}
            rel={whatsAppHref ? 'noopener noreferrer' : undefined}
            disabled={!whatsAppHref}
            variant="text"
            startIcon={<WhatsAppIcon />}
            sx={{
              textTransform: 'none',
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.85)',
              '&.Mui-disabled': { color: 'rgba(255,255,255,0.4)' },
            }}
          >
            {whatsAppHref ? 'WhatsApp' : 'WhatsApp — em breve'}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

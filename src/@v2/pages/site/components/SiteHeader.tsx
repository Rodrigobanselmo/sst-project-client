import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Link,
  Stack,
  Toolbar,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NextLink from 'next/link';
import { useState } from 'react';
import { SITE_NAV_LINKS } from '../constants/site-content.constant';
import { SiteLogo } from './SiteLogo';
import { sitePalette } from '../styles/site.palette';

const LOGIN_PATH = '/login';

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(250, 248, 245, 0.85)',
        backdropFilter: 'blur(12px)',
        color: sitePalette.ink,
        borderBottom: `1px solid ${sitePalette.border}`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: { xs: 72, md: 84 }, gap: 2, py: { xs: 1, md: 1.5 } }}>
          <SiteLogo size="lg" />

          <Stack
            direction="row"
            alignItems="center"
            sx={{
              ml: { md: 6 },
              flex: 1,
              display: { xs: 'none', md: 'flex' },
              gap: 5,
            }}
          >
            {SITE_NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                underline="none"
                fontWeight={500}
                fontSize="1rem"
                sx={{
                  color: sitePalette.inkSoft,
                  transition: 'color 0.2s ease',
                  '&:hover': { color: sitePalette.orange },
                }}
              >
                {item.label}
              </Link>
            ))}
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: 'auto' }}>
            <Button
              component={NextLink}
              href={LOGIN_PATH}
              variant="contained"
              size="medium"
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                borderRadius: 3,
                bgcolor: sitePalette.orange,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#e0651f', boxShadow: `0 8px 24px ${sitePalette.orangeGlow}` },
              }}
            >
              Acessar sistema
            </Button>
            <IconButton
              aria-label="Abrir menu"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: 'none' }, color: sitePalette.ink }}
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </Container>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: 300, bgcolor: sitePalette.canvas } }}
      >
        <Box sx={{ p: 3 }}>
          <SiteLogo size="lg" />
        </Box>
        <List sx={{ px: 2 }}>
          {SITE_NAV_LINKS.map((item) => (
            <ListItemButton
              key={item.href}
              component="a"
              href={item.href}
              onClick={() => setMobileOpen(false)}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: 500, fontSize: '1.0625rem', color: sitePalette.ink }}
              />
            </ListItemButton>
          ))}
          <ListItemButton
            component={NextLink}
            href={LOGIN_PATH}
            onClick={() => setMobileOpen(false)}
            sx={{ mt: 2, borderRadius: 2 }}
          >
            <ListItemText
              primary="Acessar sistema"
              primaryTypographyProps={{ fontWeight: 700, color: sitePalette.orange }}
            />
          </ListItemButton>
        </List>
      </Drawer>
    </AppBar>
  );
}

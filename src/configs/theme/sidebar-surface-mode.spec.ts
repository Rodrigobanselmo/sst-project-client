/**
 * Superfície da Sidebar segue o modo da interface.
 * npx tsx src/configs/theme/sidebar-surface-mode.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { createCustomTheme } from 'configs/theme';

const FORCED_COMPANY_RAIL = '#00FF00';

const light = createCustomTheme({
  sidebarBackgroundColor: FORCED_COMPANY_RAIL,
  interfaceTheme: 'light',
});
const dark = createCustomTheme({
  sidebarBackgroundColor: FORCED_COMPANY_RAIL,
  interfaceTheme: 'dark',
});

assert.equal(light.palette.sidebar.background, light.palette.background.paper);
assert.equal(light.palette.sidebar.background, '#FFFFFF');
assert.notEqual(light.palette.sidebar.background, FORCED_COMPANY_RAIL);

assert.equal(dark.palette.sidebar.background, dark.palette.background.paper);
assert.equal(dark.palette.sidebar.background, '#1A202C');
assert.notEqual(dark.palette.sidebar.background, FORCED_COMPANY_RAIL);

assert.equal(light.palette.background.dark, '#1A202C');
assert.equal(dark.palette.background.dark, '#1A202C');

const themeIndex = readFileSync(
  resolve('src/configs/theme/index.ts'),
  'utf8',
);
assert.equal(themeIndex.includes('sidebarBackgroundColor,'), false);
assert.equal(themeIndex.includes('background: surfaces.background.paper'), true);

const chatBox = readFileSync(
  resolve('src/layouts/dashboard/styles.ts'),
  'utf8',
);
assert.equal(chatBox.includes('STBoxAIChat'), true);
assert.equal(
  chatBox.includes('props.theme.palette.background.dark'),
  true,
);
assert.equal(
  /STBoxAIChat[\s\S]*sidebar\.background/.test(chatBox),
  false,
);

const navLink = readFileSync(
  resolve('src/components/organisms/main/Sidebar/NavLink/styles.ts'),
  'utf8',
);
assert.equal(navLink.includes('#00000067'), false);
assert.equal(navLink.includes('action.hover'), true);
assert.equal(navLink.includes('focus-visible'), true);

const searchBox = readFileSync(
  resolve('src/components/organisms/main/Sidebar/SearchBox/index.tsx'),
  'utf8',
);
assert.equal(searchBox.includes('!important'), false);
assert.equal(searchBox.includes('sidebarBg'), false);

const logoIcon = readFileSync(
  resolve('src/assets/logo/logo-simple/logo-simple.tsx'),
  'utf8',
);
assert.equal(logoIcon.includes("color = '#F27329'"), true);

const sidebarLogo = readFileSync(
  resolve('src/components/organisms/main/Sidebar/Logo/index.tsx'),
  'utf8',
);
assert.equal(sidebarLogo.includes('color={markColor}'), true);
assert.equal(sidebarLogo.includes('resolveSidebarLogo(visualIdentity)'), true);

console.log('sidebar-surface-mode.spec.ts ok');

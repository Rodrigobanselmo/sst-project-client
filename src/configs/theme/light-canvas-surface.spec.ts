/**
 * Canvas Light autenticado alinha com o off-white homologado no login.
 * Dark permanece no token próprio.
 * npx tsx src/configs/theme/light-canvas-surface.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { createCustomTheme } from 'configs/theme';

const light = createCustomTheme({ interfaceTheme: 'light' });
const dark = createCustomTheme({ interfaceTheme: 'dark' });

assert.equal(light.palette.background.default, '#F7F8FA');
assert.equal(light.palette.background.paper, '#FFFFFF');
assert.equal(light.palette.sidebar.background, light.palette.background.paper);

assert.equal(dark.palette.background.default, '#12151C');
assert.equal(dark.palette.background.paper, '#1A202C');
assert.equal(dark.palette.sidebar.background, dark.palette.background.paper);

assert.equal(light.palette.background.border, '#e2e2e2');
assert.equal(dark.palette.background.border, '#4A5568');

const hoverBorderFiles = [
  'src/components/atoms/SInput/styles.ts',
  'src/@v2/components/forms/fields/SInput/SInput.styles.ts',
  'src/components/atoms/SSelect/styles.ts',
  'src/components/atoms/SAuto/styles.ts',
  'src/components/atoms/SInputEdit/styles.ts',
  'src/components/atoms/STextarea/styles.ts',
  'src/components/organisms/main/Tree/OrgTree/components/GhoTool/components/HierarchyFilter/styles.ts',
];

for (const file of hoverBorderFiles) {
  const src = readFileSync(resolve(file), 'utf8');
  assert.equal(
    src.includes('background.default'),
    false,
    `${file} still uses background.default as hover border`,
  );
  assert.match(
    src,
    /&:hover[\s\S]*background\.border/,
    `${file} hover border must use background.border`,
  );
}

const palette = readFileSync(resolve('src/configs/theme/palette.ts'), 'utf8');
assert.match(palette, /default: '#F7F8FA'/);
assert.equal(palette.includes('#dddee2'), false);

const loginStyles = readFileSync(
  resolve('src/pages/login/index.styles.ts'),
  'utf8',
);
assert.match(loginStyles, /LOGIN_LIGHT_SURFACE = '#F7F8FA'/);

console.log('light-canvas-surface.spec.ts ok');

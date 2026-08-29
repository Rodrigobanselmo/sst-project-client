/**
 * npx tsx src/configs/theme/brand-identity-fill.spec.ts
 */
import assert from 'node:assert/strict';

import { createCustomTheme } from 'configs/theme';
import {
  brandIdentityGlyphDarkSx,
  brandIdentityQuantityColor,
  brandIdentityOutlinedHoverDarkSx,
  brandIdentityOutlinedHoverLightSx,
  brandIdentitySquareActionSx,
  brandIdentitySwitchLightSx,
  brandIdentityPaginationCurrentSx,
  brandIdentityPaginationIdleSx,
  brandIdentityToolbarAddSx,
  brandIdentityToolbarSquareSx,
  BRAND_IDENTITY_TABLE_CONFIG_PILL,
  BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT,
  tableOperationalButtonProps,
  tableUtilityPillButtonProps,
  tableUtilityPillSx,
} from 'configs/theme/brand-identity-fill';
import { getPrimaryInteractiveTokens } from 'configs/theme/generatePaletteFromColor';

const BRAND = '#F6D040';

const dark = getPrimaryInteractiveTokens(BRAND, 'dark', '#1A202C');
const light = getPrimaryInteractiveTokens(BRAND, 'light', '#FFFFFF');

assert.equal(dark.identityBackground, dark.emphasisBackground);
assert.equal(dark.identityBackground, BRAND);
assert.equal(dark.identityOn, dark.onEmphasis);
assert.notEqual(dark.identityOn.toLowerCase(), BRAND.toLowerCase());

assert.equal(light.identityBackground, light.softBackground);
assert.equal(light.identityOn, light.onSoftBackground);
assert.notEqual(light.identityBackground.toLowerCase(), BRAND.toLowerCase());

const darkTheme = createCustomTheme({
  primaryColor: BRAND,
  interfaceTheme: 'dark',
});
const lightTheme = createCustomTheme({
  primaryColor: BRAND,
  interfaceTheme: 'light',
});

assert.equal(dark.identityIdleOn, BRAND);
assert.equal(light.identityIdleOn, light.onSoftBackground);

assert.equal(darkTheme.palette.primary.identityBackground, BRAND);
assert.equal(darkTheme.palette.primary.identityIdleOn, BRAND);
assert.equal(
  lightTheme.palette.primary.identityBackground,
  lightTheme.palette.primary.softBackground,
);

const switchOn = brandIdentitySwitchLightSx['&& .MuiSwitch-switchBase'][
  '&.Mui-checked'
];
assert.equal(switchOn.color, 'primary.identityOn');
assert.equal(
  switchOn['& + .MuiSwitch-track'].backgroundColor,
  'primary.identityBackground',
);
assert.equal(switchOn['& + .MuiSwitch-track'].borderColor, 'primary.border');
assert.equal(
  brandIdentitySwitchLightSx['&& .MuiSwitch-switchBase'].color,
  'text.main',
);

assert.equal(
  brandIdentityQuantityColor({ palette: { mode: 'dark' } }),
  'primary.main',
);
assert.equal(
  brandIdentityQuantityColor({ palette: { mode: 'light' } }),
  'text.main',
);

assert.equal(brandIdentityGlyphDarkSx.color, 'primary.main');
assert.equal(
  brandIdentityGlyphDarkSx['&:hover'].color,
  'primary.identityBackgroundHover',
);

assert.equal(
  brandIdentityOutlinedHoverDarkSx['&:hover'].color,
  'primary.main',
);
assert.equal(
  brandIdentityOutlinedHoverDarkSx['&:hover'].backgroundColor,
  'transparent',
);
assert.equal(
  brandIdentityOutlinedHoverLightSx['&:hover'].backgroundColor,
  'primary.identityBackground',
);
assert.equal(
  brandIdentityOutlinedHoverLightSx['&:hover'].color,
  'primary.identityOn',
);

assert.equal(
  brandIdentitySquareActionSx.backgroundColor,
  'primary.identityBackground',
);
assert.equal(brandIdentitySquareActionSx.color, 'primary.identityOn');
assert.equal(brandIdentitySquareActionSx.borderColor, 'primary.border');
assert.equal(
  JSON.stringify(brandIdentitySquareActionSx).includes('#F6D040'),
  false,
);

assert.equal(BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT, 30);
assert.equal(
  brandIdentityToolbarAddSx.height,
  BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT,
);
assert.equal(brandIdentityToolbarAddSx['&&'].backgroundColor, 'transparent');
assert.equal(brandIdentityToolbarAddSx['&&'].color, 'text.primary');
assert.equal(brandIdentityToolbarAddSx['&&'].borderColor, 'grey.600');
assert.ok(brandIdentityToolbarAddSx['&&:hover']);
assert.ok(brandIdentityToolbarAddSx['&&:focus-visible']);
assert.ok(brandIdentityToolbarAddSx['&&:active']);
assert.equal(
  brandIdentityToolbarSquareSx.height,
  BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT,
);
assert.equal(
  brandIdentityToolbarSquareSx.maxWidth,
  BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT,
);
assert.equal(brandIdentityToolbarSquareSx['&&'].backgroundColor, 'transparent');
assert.ok(brandIdentityOutlinedHoverDarkSx['&:focus-visible']);
assert.ok(brandIdentityOutlinedHoverLightSx['&:active']);
assert.equal(
  BRAND_IDENTITY_TABLE_CONFIG_PILL.height,
  BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT,
);
assert.equal(BRAND_IDENTITY_TABLE_CONFIG_PILL.borderRadius, 3);
assert.equal(BRAND_IDENTITY_TABLE_CONFIG_PILL.minWidth, 120);

assert.equal(tableUtilityPillSx.height, BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT);
assert.equal(tableUtilityPillSx.borderRadius, 3);
assert.equal(tableUtilityPillSx['&&'].backgroundColor, 'transparent');
assert.equal(tableUtilityPillSx['&&'].color, 'text.primary');
assert.equal(tableUtilityPillSx['&&'].borderColor, 'grey.600');
assert.ok(tableUtilityPillSx['&&:hover']);
assert.ok(tableUtilityPillSx['&&:focus-visible']);
assert.ok(tableUtilityPillSx['&&:active']);
assert.equal(tableUtilityPillSx['&&:hover'].borderColor, 'primary.border');
assert.equal(tableUtilityPillButtonProps.variant, 'outlined');
assert.equal(tableUtilityPillButtonProps.color, 'paper');
assert.equal(
  tableUtilityPillButtonProps.schema.backgroundColor,
  'transparent',
);
assert.equal(JSON.stringify(tableUtilityPillSx).includes('#F6D040'), false);
assert.equal(JSON.stringify(tableUtilityPillSx).includes('#00000011'), false);
assert.equal(
  tableOperationalButtonProps.buttonProps.sx,
  brandIdentityToolbarAddSx,
);
assert.equal(
  brandIdentityPaginationCurrentSx.backgroundColor,
  'primary.identityBackground',
);
assert.equal(brandIdentityPaginationCurrentSx['& .text_main'].color, 'primary.identityOn');
assert.equal(brandIdentityPaginationIdleSx.backgroundColor, 'background.paper');
assert.equal(brandIdentityPaginationIdleSx['& .text_main'].color, 'text.main');

console.log('brand-identity-fill.spec.ts ok');

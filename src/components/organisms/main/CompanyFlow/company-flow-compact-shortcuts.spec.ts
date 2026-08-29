/**
 * Spec: atalhos da Empresa usam outlined neutro em repouso; identidade na interação.
 * Importar/Baixar permanecem outlined.
 * npx tsx src/components/organisms/main/CompanyFlow/company-flow-compact-shortcuts.spec.ts
 */
import assert from 'node:assert/strict';

import {
  companyWorkspaceActionButtonSx,
  principalBrandButtonSx,
} from './company-flow-compact-shortcuts.styles';
import { brandIdentityFillSx } from 'configs/theme/brand-identity-fill';
import { createCustomTheme } from 'configs/theme';

const workspace = companyWorkspaceActionButtonSx as Record<string, unknown>;
const workspaceRoot = workspace['&&'] as Record<string, unknown>;
const workspaceHover = workspace['&&:hover'] as Record<string, unknown>;
const workspaceFocus = workspace['&&:focus-visible'] as Record<string, unknown>;
const workspaceActive = workspace['&&:active'] as Record<string, unknown>;
const workspaceIcon = workspace['&& .MuiIcon-root, && svg'] as Record<
  string,
  unknown
>;
const workspaceText = workspace['&& p'] as Record<string, unknown>;

assert.equal(workspaceRoot.backgroundColor, 'transparent');
assert.equal(workspaceRoot.color, 'text.primary');
assert.equal(workspaceRoot.borderColor, 'grey.600');
assert.equal(workspace.borderRadius, 3);
assert.equal(workspace.minHeight, 30);
assert.equal(workspaceIcon.color, 'grey.600');
assert.equal(workspaceText.color, 'text.primary');
assert.notEqual(workspaceRoot.backgroundColor, brandIdentityFillSx.backgroundColor);
assert.notEqual(workspaceRoot.backgroundColor, 'primary.main');
assert.notEqual(workspaceRoot.backgroundColor, 'primary.emphasisBackground');

assert.equal(workspaceHover.borderColor, 'primary.border');
assert.equal(workspaceFocus.borderColor, 'primary.border');
assert.equal(workspaceActive.borderColor, 'primary.border');
assert.ok(workspaceHover['& p']);
assert.ok(workspaceHover['& .MuiSvgIcon-root, & .MuiIcon-root, & svg, & .MuiBox-root']);

const lightTheme = createCustomTheme({
  primaryColor: '#F6D040',
  interfaceTheme: 'light',
});
const darkTheme = createCustomTheme({
  primaryColor: '#F6D040',
  interfaceTheme: 'dark',
});

const resolvePrincipal = (theme: typeof lightTheme) =>
  typeof principalBrandButtonSx === 'function'
    ? (principalBrandButtonSx as (t: typeof lightTheme) => Record<string, unknown>)(
        theme,
      )
    : (principalBrandButtonSx as Record<string, unknown>);

const principalLight = resolvePrincipal(lightTheme);
const principalLightRest = principalLight['&&'] as Record<string, unknown>;
const principalLightHover = principalLight['&&:hover'] as Record<string, unknown>;

assert.equal(principalLightRest.backgroundColor, 'transparent');
assert.equal(principalLightRest.color, 'text.primary');
assert.equal(principalLightRest.borderColor, 'grey.600');
assert.notEqual(
  principalLightRest.backgroundColor,
  brandIdentityFillSx.backgroundColor,
);
assert.equal(principalLightHover.borderColor, 'primary.border');
assert.equal(principalLightHover.color, 'primary.identityOn');
assert.equal(
  principalLightHover.backgroundColor,
  'primary.identityBackground',
);

const principalDark = resolvePrincipal(darkTheme);
const principalDarkRest = principalDark['&&'] as Record<string, unknown>;
const principalDarkHover = principalDark['&&:hover'] as Record<string, unknown>;

assert.equal(principalDarkRest.backgroundColor, 'transparent');
assert.equal(principalDarkHover.color, 'primary.main');
assert.equal(principalDarkHover.borderColor, 'primary.border');
assert.equal(principalDarkHover.backgroundColor, 'transparent');
assert.equal(principalDark.height, 30);
assert.equal(principalDark.borderRadius, 3);

console.log('company-flow-compact-shortcuts.spec.ts ok');

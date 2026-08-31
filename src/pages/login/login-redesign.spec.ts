/**
 * npx tsx src/pages/login/login-redesign.spec.ts
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (file: string) => readFileSync(resolve(file), 'utf8');

const loginPage = read('src/pages/login/index.page.tsx');
const loginStyles = read('src/pages/login/index.styles.ts');
const loginForm = read('src/pages/login/components/LoginForm/index.tsx');
const loginBrand = read(
  'src/pages/login/components/LoginAuthBrand/LoginAuthBrand.tsx',
);
const loginSkin = read(
  'src/pages/login/components/LoginSkinProvider/LoginSkinProvider.tsx',
);
const loginContent = read(
  'src/pages/login/constants/login-institutional.content.ts',
);
const loginMap = read(
  'src/pages/login/components/LoginModuleMap/LoginModuleMap.tsx',
);
const loginPanel = read(
  'src/pages/login/components/LoginInstitutionalPanel/LoginInstitutionalPanel.tsx',
);
const loginAmbient = read(
  'src/pages/login/components/LoginAmbientGraphic/LoginAmbientGraphic.tsx',
);
const presentationWhat = read(
  'src/@v2/pages/site/presentation/components/cards/PresentationWhatCard.tsx',
);
const presentationConstant = read(
  'src/@v2/pages/site/presentation/constants/presentation.constant.ts',
);
const layout = read('src/layouts/default/layout/index.tsx');
const sLogo = read('src/components/atoms/SLogo/index.tsx');
const authContext = read('src/core/contexts/AuthContext.tsx');
const themeProvider = read(
  'src/layouts/default/providers/DynamicThemeProvider.tsx',
);
const palette = read('src/configs/theme/palette.ts');

assert.match(loginPage, /withSSRGuest/);
assert.match(loginPage, /LoginSkinProvider/);
assert.match(loginPage, /LoginAuthCard/);
assert.match(loginPage, /LoginInstitutionalPanel/);
assert.match(loginPage, /<LoginForm \/>/);
assert.equal(loginPage.includes('SLogo'), false);
assert.equal(loginPage.includes('SimpleSstWordmark'), false);

assert.match(loginStyles, /100dvh/);
assert.match(loginStyles, /overflow-x: hidden/);
assert.match(loginStyles, /width: 55%/);
assert.match(loginStyles, /width: 45%/);
assert.match(loginStyles, /#F7F8FA/);
assert.equal(loginStyles.includes('max-height: 570px'), false);

assert.match(loginBrand, /LOGIN_BRAND\.logoOnDark/);
assert.match(loginBrand, /LOGIN_BRAND\.logoOnLight/);
assert.equal(loginBrand.includes('SITE_BRAND'), false);
assert.match(
  loginContent,
  /simplesst-logo-h-destaque-yellow-white\.png/,
);
assert.match(
  loginContent,
  /simplesst-logo-h-destaque-yellow-black\.png/,
);

assert.match(loginSkin, /createCustomTheme/);
assert.match(loginSkin, /#F6D040/);
assert.match(loginSkin, /override === 'light'/);
assert.match(loginSkin, /useInterfaceThemeOverride/);
assert.equal(loginSkin.includes('DynamicThemeProvider'), false);

const loginThemeToggle = read(
  'src/pages/login/components/LoginThemeToggle/LoginThemeToggle.tsx',
);
assert.match(loginThemeToggle, /setInterfaceThemeOverride/);
assert.match(loginThemeToggle, /Modo claro/);
assert.match(loginThemeToggle, /Modo escuro/);
assert.match(loginThemeToggle, /LightModeOutlinedIcon/);
assert.match(loginThemeToggle, /DarkModeOutlinedIcon/);
assert.equal(loginThemeToggle.includes('sst:interface-theme-override'), false);
assert.equal(loginThemeToggle.includes('HeaderCompanySelect'), false);
assert.match(loginPage, /LoginThemeToggle/);
assert.match(loginStyles, /position: relative/);

assert.match(loginContent, /Gestão de SST integrada/);
assert.match(loginContent, /segura\./);
assert.match(
  loginContent,
  /Centralize riscos, saúde ocupacional, documentos e ações em uma única plataforma\./,
);
assert.match(loginContent, /Estrutura de trabalho/);
assert.match(loginContent, /Inventário de riscos/);
assert.match(loginContent, /Medidas de controle/);
assert.match(loginContent, /Plano de ação/);
assert.match(loginContent, /Evidências/);
assert.match(loginContent, /Acompanhamento/);
assert.equal(loginContent.includes('LOGIN_METRICS'), false);
assert.equal(loginContent.includes('+5.000'), false);
assert.equal(loginContent.includes('+1.2M'), false);
assert.equal(loginContent.includes('+3.5M'), false);
assert.match(loginContent, /empresas atendidas/);
assert.match(loginContent, /trabalhadores gerenciados/);
assert.match(loginContent, /documentos gerados/);
assert.equal(loginContent.includes('Gestão de Riscos'), false);
assert.equal(loginContent.includes('Saúde Ocupacional'), false);

assert.equal(loginMap.includes('presentation.css'), false);
assert.equal(loginMap.includes('PresentationWhatCard'), false);
assert.equal(loginMap.includes('PRESENTATION_WHAT'), false);
assert.match(loginMap, /<ellipse/);
assert.match(loginMap, /LogoSimpleIcon/);
assert.match(loginMap, /LOGIN_ECOSYSTEM_NODES/);
assert.equal(loginMap.includes('ModuleCard'), false);
assert.equal(loginMap.includes('HealthAndSafetyOutlined'), false);
assert.equal(loginMap.includes("PRESENTATION_WHAT.core"), false);
assert.equal(loginPanel.includes('LoginMetricsStrip'), false);
assert.match(loginPanel, /LoginInstitutionalStats/);
assert.equal(loginPanel.includes('presentation.css'), false);
assert.match(
  read('src/pages/login/components/LoginInstitutionalStats/LoginInstitutionalStats.tsx'),
  /useLoginStats/,
);
assert.match(
  read('src/pages/login/hooks/useLoginStats.ts'),
  /retry: false/,
);
assert.equal(
  read('src/pages/login/hooks/useLoginStats.ts').includes('AuthContext'),
  false,
);
assert.match(
  read('src/pages/login/services/fetch-login-stats.ts'),
  /PUBLIC_LOGIN_STATS/,
);
assert.match(
  read('src/pages/login/helpers/format-login-stat.ts'),
  /1_000_000/,
);
assert.match(loginAmbient, /login-dot-grid/);

assert.equal(
  existsSync(
    resolve(
      'src/pages/login/components/LoginMetricsStrip/LoginMetricsStrip.tsx',
    ),
  ),
  false,
);

assert.match(presentationWhat, /PRESENTATION_WHAT/);
assert.match(presentationConstant, /headlineAccent: 'único fluxo\.'/);
assert.match(presentationConstant, /associated:/);

assert.match(loginForm, /theme=\{recaptchaTheme\}/);
assert.match(loginForm, /disabled=\{!isCaptchaVerified\}/);
assert.match(
  loginForm,
  /sitekey="6Lc7Bu4pAAAAAKDIuEI3EWCamZ5p6GLEjihAMuPI"/,
);
assert.match(loginForm, /googleSignIn\(\)/);
assert.match(loginForm, /mutate\(data\)/);
assert.match(loginForm, /brandIdentityButtonSx/);
assert.match(loginForm, /useMutationLogin/);
assert.match(loginForm, /ModalSingleInput/);
assert.match(loginForm, /href="\/cadastro"/);
assert.equal(loginForm.includes('type="password"'), true);
assert.equal(loginForm.includes('Visibility'), false);

assert.match(layout, /isLoginPage/);
assert.match(layout, /RoutesEnum\.LOGIN/);
assert.match(
  layout,
  /!isMarketingSite && !isLoginPage && <AIChatToggleButton \/>/,
);

assert.match(sLogo, /LogoSimpleIcon/);
assert.match(authContext, /async function signIn/);
assert.match(authContext, /async function googleSignIn/);
assert.match(themeProvider, /createCustomTheme/);
assert.equal(palette.includes('#F6D040'), false);

assert.equal(
  existsSync(
    resolve('public/site/simplesst-logo-h-destaque-yellow-black.png'),
  ),
  true,
);
assert.equal(
  existsSync(
    resolve('public/site/simplesst-logo-h-destaque-yellow-white.png'),
  ),
  true,
);

console.log('login-redesign.spec.ts ok');

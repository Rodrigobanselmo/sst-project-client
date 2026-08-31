/**
 * npx tsx src/components/atoms/SLogo/s-logo-auth-brand.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const logo = readFileSync(
  resolve('src/components/atoms/SLogo/index.tsx'),
  'utf8',
);
const loginForm = readFileSync(
  resolve('src/pages/login/components/LoginForm/index.tsx'),
  'utf8',
);
const googleButton = readFileSync(
  resolve(
    'src/components/atoms/SSocialButton/GoogleButton/GoogleButton.tsx',
  ),
  'utf8',
);

assert.match(logo, /LogoSimpleIcon/);
assert.match(logo, /SimpleSstWordmark/);
assert.equal(logo.includes('/icons/brand/logo-simple.svg'), false);
assert.equal(logo.includes('#F27329'), false);
assert.match(logo, /primary\.main/);
assert.match(logo, /text\.dark/);

assert.match(loginForm, /theme=\{recaptchaTheme\}/);
assert.match(loginForm, /disabled=\{!isCaptchaVerified\}/);
assert.match(
  loginForm,
  /sitekey="6Lc7Bu4pAAAAAKDIuEI3EWCamZ5p6GLEjihAMuPI"/,
);
assert.match(loginForm, /googleSignIn\(\)/);
assert.match(loginForm, /mutate\(data\)/);
assert.match(loginForm, /brandIdentityButtonSx/);

assert.match(googleButton, /background\.paper/);
assert.match(googleButton, /text\.main/);
assert.match(googleButton, /SGoogleIcon/);
assert.equal(googleButton.includes("backgroundColor: 'white'"), false);

console.log('s-logo-auth-brand.spec.ts ok');

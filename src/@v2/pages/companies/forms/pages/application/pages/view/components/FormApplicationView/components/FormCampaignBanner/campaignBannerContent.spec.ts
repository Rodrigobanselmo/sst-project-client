import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bannerPrivacyText, defaultBannerTexts } from './campaignBannerContent.ts';

test('privacy distinguishes shared anonymous, individual anonymous and identified access', () => {
  const shared = bannerPrivacyText({ isAnonymous: true, isShareableLink: true });
  assert.match(shared, /sem necessidade de cadastro/);
  assert.match(shared, /reduzir o risco/);
  assert.match(bannerPrivacyText({ isAnonymous: true, isShareableLink: false }), /controle de participação/);
  assert.match(bannerPrivacyText({ isAnonymous: false, isShareableLink: true }), /não está configurada como anônima/);
});
test('generic draft uses campaign facts without inventing instrument or contact', () => {
  const texts = defaultBannerTexts({ name: 'Clima SEFAZ', description: 'Avaliar o ambiente de trabalho' });
  assert.match(texts.intro, /Clima SEFAZ/);
  assert.match(texts.intro, /Avaliar o ambiente de trabalho/);
  assert.doesNotMatch(JSON.stringify(texts), /COPSOQ|PGR|\(51\)/);
});

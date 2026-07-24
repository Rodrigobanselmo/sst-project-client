/**
 * Testes pontuais da confirmação de privacidade FRPS no client.
 * Executar com: npx tsx --test <este-arquivo>
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { requiresFrpsRiskAnalysisPrivacyConfirmation } from './frps-privacy-confirmation';

describe('requiresFrpsRiskAnalysisPrivacyConfirmation', () => {
  it('3 → 2 exige confirmação', () => {
    assert.equal(
      requiresFrpsRiskAnalysisPrivacyConfirmation({ current: 3, next: 2 }),
      true,
    );
  });

  it('3 → 1 exige confirmação', () => {
    assert.equal(
      requiresFrpsRiskAnalysisPrivacyConfirmation({ current: 3, next: 1 }),
      true,
    );
  });

  it('2 → 1 exige confirmação', () => {
    assert.equal(
      requiresFrpsRiskAnalysisPrivacyConfirmation({ current: 2, next: 1 }),
      true,
    );
  });

  it('1 → 2 mantém confirmação (ainda abaixo do padrão 3)', () => {
    assert.equal(
      requiresFrpsRiskAnalysisPrivacyConfirmation({ current: 1, next: 2 }),
      true,
    );
  });

  it('1/2 → 3 não exige confirmação de redução', () => {
    assert.equal(
      requiresFrpsRiskAnalysisPrivacyConfirmation({ current: 1, next: 3 }),
      false,
    );
    assert.equal(
      requiresFrpsRiskAnalysisPrivacyConfirmation({ current: 2, next: 3 }),
      false,
    );
  });

  it('mesmo valor não exige confirmação', () => {
    assert.equal(
      requiresFrpsRiskAnalysisPrivacyConfirmation({ current: 2, next: 2 }),
      false,
    );
  });
});

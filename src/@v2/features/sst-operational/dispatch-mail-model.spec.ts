import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  dispatchMailRecipients,
  dispatchMailReviewValid,
  dispatchMailStateLabel,
} from './dispatch-mail-model.ts';
describe('execution email preferences and explicit uncertain-result review', () => {
  it('uses registered identities, preserves selected users and deduplicates search pages', () => {
    const a = { id: 1, name: 'A', email: 'a@example.invalid' },
      b = { id: 2, name: 'B', email: 'b@example.invalid' };
    assert.deepEqual(dispatchMailRecipients([b, a], [a]), [a, b]);
  });
  it('never describes provider acceptance as mailbox delivery or reads', () => {
    assert.equal(
      dispatchMailStateLabel('SENT'),
      'Aceito pelo provedor de e-mail',
    );
    assert.match(dispatchMailStateLabel('UNKNOWN'), /incerto/);
  });
  it('requires a current UNKNOWN state, explicit provider review and a useful reason', () => {
    const m = {
      id: '1',
      role: 'OPERATOR',
      address: 'a***@example.invalid',
      state: 'UNKNOWN',
      attempts: 1,
      updatedAt: '2026-10-28T00:00:00Z',
    };
    assert.equal(
      dispatchMailReviewValid(
        m,
        'CONFIRM_SENT',
        'Provedor confirmou aceitação.',
        false,
      ),
      false,
    );
    assert.equal(
      dispatchMailReviewValid(
        m,
        'CONFIRM_SENT',
        'Provedor confirmou aceitação.',
        true,
      ),
      true,
    );
    assert.equal(
      dispatchMailReviewValid(m, 'RETRY_CONFIRMED_NOT_SENT', 'não', true),
      false,
    );
    assert.equal(
      dispatchMailReviewValid(m, 'RETRY_FAILED', 'Provedor confirmado.', true),
      false,
    );
    assert.equal(
      dispatchMailReviewValid(
        { ...m, state: 'SENT' },
        'CONFIRM_SENT',
        'Provedor confirmado.',
        true,
      ),
      false,
    );
    assert.equal(
      dispatchMailReviewValid(
        { ...m, state: 'FAILED' },
        'RETRY_FAILED',
        'Credencial corrigida.',
        false,
      ),
      true,
    );
  });
});

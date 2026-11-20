import assert from 'node:assert/strict';
import { occupationalSearchMessages } from './occupational-search-message';

const result = (niosh: object, osha: object) =>
  ({
    identity: { cas: '8042-47-5' },
    occupationalData: {
      attempts: [
        { provider: 'NIOSH_POCKET_GUIDE', ...niosh },
        { provider: 'OSHA_OCCUPATIONAL_CHEMICAL_DB', ...osha },
      ],
    },
  }) as any;
const partial = occupationalSearchMessages(
  result({ outcome: 'MISS', matchKind: 'NONE' }, { outcome: 'PROVIDER_ERROR' }),
);
assert.match(
  partial[0].message,
  /Pesquisa concluída: nenhuma correspondência.*8042-47-5/,
);
assert.equal(partial[0].completed, true);
assert.match(partial[1].message, /Não foi possível consultar/);
assert.doesNotMatch(
  partial[1].message,
  /nenhuma correspondência|sem limites publicados/,
);
assert.equal(partial[1].completed, false);
const matched = occupationalSearchMessages(
  result({ outcome: 'MISS', matchKind: 'CAS' }, { outcome: 'HIT' }),
);
assert.match(matched[0].message, /Substância localizada pelo CAS/);
assert.doesNotMatch(matched[0].message, /nenhuma correspondência/);
assert.match(matched[1].message, /Dados ocupacionais encontrados/);
const disabled = occupationalSearchMessages(
  result({ outcome: 'DISABLED' }, { outcome: 'SKIPPED' }),
);
assert.match(disabled[0].message, /não habilitada/);
assert.match(disabled[1].message, /não foi consultada/);
console.log('occupational-search-message.spec.ts OK');

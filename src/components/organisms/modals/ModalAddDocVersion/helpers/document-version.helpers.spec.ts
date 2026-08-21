/**
 * Runnable with:
 *   yarn ts-node -r tsconfig-paths/register \
 *     src/components/organisms/modals/ModalAddDocVersion/helpers/document-version.helpers.spec.ts
 */
import assert from 'assert';

import {
  getOfficialDeleteTooltip,
  isLatestOfficialVersionInSeries,
} from './document-version.helpers';

const series = [
  { version: '0.0.1', documentDataId: 'dd-1', officialRevisionSeries: 1 },
  { version: '1.0.0', documentDataId: 'dd-1', officialRevisionSeries: 1 },
  { version: '2.0.0', documentDataId: 'dd-1', officialRevisionSeries: 1 },
  { version: '3.0.0', documentDataId: 'dd-1', officialRevisionSeries: 1 },
  { version: '1.0.0', documentDataId: 'dd-1', officialRevisionSeries: 2 },
];

assert.equal(
  isLatestOfficialVersionInSeries(
    { version: '3.0.0', documentDataId: 'dd-1', officialRevisionSeries: 1 },
    series,
  ),
  true,
);
assert.equal(
  isLatestOfficialVersionInSeries(
    { version: '2.0.0', documentDataId: 'dd-1', officialRevisionSeries: 1 },
    series,
  ),
  false,
);
assert.equal(
  isLatestOfficialVersionInSeries(
    { version: '1.0.0', documentDataId: 'dd-1', officialRevisionSeries: 1 },
    series,
  ),
  false,
);
assert.equal(
  isLatestOfficialVersionInSeries(
    { version: '1.0.0', documentDataId: 'dd-1', officialRevisionSeries: 2 },
    series,
  ),
  true,
);

assert.equal(
  getOfficialDeleteTooltip({
    isOfficial: true,
    isMaster: false,
    isLatestInSeries: true,
  }),
  'Versões oficiais não podem ser excluídas',
);
assert.equal(
  getOfficialDeleteTooltip({
    isOfficial: true,
    isMaster: true,
    isLatestInSeries: true,
  }),
  'Excluir versão oficial — ação exclusiva de Master',
);
assert.equal(
  getOfficialDeleteTooltip({
    isOfficial: true,
    isMaster: true,
    isLatestInSeries: false,
  }),
  'Exclua primeiro a versão oficial mais recente desta série.',
);

console.log('document-version.helpers.spec.ts ok');

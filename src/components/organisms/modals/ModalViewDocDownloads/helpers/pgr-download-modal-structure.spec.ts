/**
 * npx tsx src/components/organisms/modals/ModalViewDocDownloads/helpers/pgr-download-modal-structure.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (relativePath: string) =>
  readFileSync(resolve(relativePath), 'utf8');

const modalUtil = read(
  'src/components/organisms/modals/ModalViewDocDownloads/helpers/pgr-download-modal.util.ts',
);
const modalContent = read(
  'src/components/organisms/modals/ModalViewDocDownloads/components/ModalContent/index.tsx',
);
const labels = read(
  'src/components/organisms/modals/ModalViewDocDownloads/helpers/pgr-download-labels.util.ts',
);
const categories = read(
  'src/components/organisms/modals/ModalViewDocDownloads/helpers/pgr-download-annex-categories.util.ts',
);

assert.match(modalContent, /PGR_DOWNLOAD_SECTION_DOCUMENT/);
assert.match(modalContent, /groupPgrDownloadAnnexesByCategory/);
assert.match(modalContent, /DocumentTypeEnum\.FRPS/);
assert.match(modalContent, /DocumentTypeEnum\.PGR/);
assert.match(modalUtil, /buildPgrActionPlanAnnexDownloadUrl/);
assert.match(modalUtil, /format: 'grouped'/);
assert.match(modalUtil, /format: 'managerial'/);
assert.match(modalUtil, /getPgrDownloadAnnexLabel\('action_plan_grouped'\)/);
assert.match(modalUtil, /getPgrDownloadAnnexLabel\('action_plan_managerial'\)/);
assert.match(labels, /pgr-action-plan\/docx/);
assert.match(labels, /getPgrEssentialDownloadLabel/);
assert.match(categories, /PGR_DOWNLOAD_ANNEX_CATEGORY_INVENTORY/);
assert.match(categories, /PGR_DOWNLOAD_ANNEX_CATEGORY_ACTION_PLAN/);
assert.match(categories, /action_plan_managerial/);

console.log('pgr-download-modal-structure.spec.ts ok');

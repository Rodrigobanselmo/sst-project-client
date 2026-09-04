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
const pcmsoUtil = read(
  'src/components/organisms/modals/ModalViewDocDownloads/helpers/pcmso-download-modal.util.ts',
);
const pcmsoComposition = read(
  'src/components/organisms/modals/ModalViewDocDownloads/helpers/pcmso-download-composition.util.ts',
);

assert.match(modalContent, /PGR_DOWNLOAD_SECTION_DOCUMENT/);
assert.match(modalContent, /PCMSO_DOWNLOAD_SECTION_DOCUMENT/);
assert.match(modalContent, /DocumentTypeEnum\.FRPS/);
assert.match(modalContent, /DocumentTypeEnum\.PGR/);
assert.match(modalContent, /getPgrCustomCompositionToggleLabel/);
assert.match(modalContent, /getPgrCompositionCheckboxes/);
assert.match(modalContent, /buildPgrCustomCompositionDownloadUrl/);
assert.match(modalContent, /getPcmsoCompositionCheckboxes/);
assert.match(modalContent, /buildPcmsoCustomCompositionDownloadUrl/);
assert.match(modalContent, /Baixar documento personalizado|getPgrCustomDownloadButtonLabel|getPcmsoCustomDownloadButtonLabel/);
assert.doesNotMatch(modalContent, /Baixar documento sem anexos/);
assert.doesNotMatch(modalContent, /Baixar PGR completo/);
assert.doesNotMatch(modalContent, /Baixar PCMSO completo/);
assert.doesNotMatch(modalContent, /PGR_DOWNLOAD_SECTION_ANNEXES/);
assert.doesNotMatch(modalContent, /PCMSO_DOWNLOAD_SECTION_ANNEXES/);
assert.doesNotMatch(modalContent, /groupPgrDownloadAnnexesByCategory/);
assert.match(modalContent, /selectedPgrParts|selectedPcmsoParts/);
assert.match(modalContent, /!params\.downloadUrl \|\| downloadMutation\.isLoading/);
assert.match(modalContent, /useState/);
assert.doesNotMatch(modalContent, /useDispatch|redux|localStorage/);
assert.match(
  read(
    'src/components/organisms/modals/ModalViewDocDownloads/hooks/useModalViewDocDownload.ts',
  ),
  /useMutDownloadFile/,
);
assert.match(modalUtil, /getPgrRecommendedDownloadLabel/);
assert.match(modalUtil, /profile: 'essential'/);
assert.doesNotMatch(modalUtil, /id: 'pgr-main'/);
assert.doesNotMatch(modalUtil, /id: 'pgr-full'/);
assert.match(modalUtil, /buildPgrActionPlanAnnexDownloadUrl/);
assert.match(labels, /pgr-action-plan\/docx/);
assert.match(pcmsoUtil, /pcmso-essential/);
assert.match(pcmsoUtil, /getPcmsoRecommendedDownloadLabel/);
assert.doesNotMatch(pcmsoUtil, /id: 'pcmso-main'/);
assert.doesNotMatch(pcmsoUtil, /id: 'pcmso-full'/);
assert.doesNotMatch(pcmsoUtil, /pcmso-annex-gse/);
assert.match(pcmsoComposition, /riskExamsByGse/);
assert.match(pcmsoComposition, /examsByMixedHierarchy/);
assert.match(pcmsoComposition, /composition=custom/);

console.log('pgr-download-modal-structure.spec.ts ok');

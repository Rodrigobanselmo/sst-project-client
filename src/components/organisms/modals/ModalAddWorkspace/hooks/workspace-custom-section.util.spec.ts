/**
 * Executar:
 * npx tsx --test src/components/organisms/modals/ModalAddWorkspace/hooks/workspace-custom-section.util.spec.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  hydrateWorkspaceSectionFlags,
  mergeWorkspaceCompanyJsonSectionFields,
} from './workspace-custom-section.util';

function persistAndReopen(input: {
  isFromOtherCnpj: boolean;
  useCustomSection: boolean;
  customSectionHTML?: string;
  extra?: Record<string, unknown>;
}) {
  const saved = mergeWorkspaceCompanyJsonSectionFields(
    { ...(input.extra || {}), customSectionHTML: input.customSectionHTML },
    {
      isFromOtherCnpj: input.isFromOtherCnpj,
      useCustomSection: input.useCustomSection,
      ...(input.customSectionHTML !== undefined && {
        customSectionHTML: input.customSectionHTML,
      }),
    },
  );

  const serialized = JSON.parse(JSON.stringify(saved));
  return { saved, serialized, reopened: hydrateWorkspaceSectionFlags(serialized) };
}

describe('hydrateWorkspaceSectionFlags', () => {
  it('1. outro CNPJ false / seção false → reabre false', () => {
    const flags = hydrateWorkspaceSectionFlags({
      isFromOtherCnpj: false,
      useCustomSection: false,
    });
    assert.equal(flags.isFromOtherCnpj, false);
    assert.equal(flags.useCustomSection, false);
  });

  it('2. outro CNPJ true / seção false / sem HTML → reabre false', () => {
    const flags = hydrateWorkspaceSectionFlags({
      isFromOtherCnpj: true,
      useCustomSection: false,
    });
    assert.equal(flags.isFromOtherCnpj, true);
    assert.equal(flags.useCustomSection, false);
  });

  it('3. outro CNPJ true / seção false / HTML vazio <p></p> → reabre false', () => {
    const flags = hydrateWorkspaceSectionFlags({
      isFromOtherCnpj: true,
      useCustomSection: false,
      customSectionHTML: '<p></p>',
    });
    assert.equal(flags.isFromOtherCnpj, true);
    assert.equal(flags.useCustomSection, false);
  });

  it('4. outro CNPJ true / seção false / HTML antigo → reabre false', () => {
    const flags = hydrateWorkspaceSectionFlags({
      isFromOtherCnpj: true,
      useCustomSection: false,
      customSectionHTML: '<p>Texto antigo</p>',
    });
    assert.equal(flags.isFromOtherCnpj, true);
    assert.equal(flags.useCustomSection, false);
  });

  it('5. outro CNPJ true / seção true → reabre true', () => {
    const flags = hydrateWorkspaceSectionFlags({
      isFromOtherCnpj: true,
      useCustomSection: true,
      customSectionHTML: '<p>Seção</p>',
    });
    assert.equal(flags.isFromOtherCnpj, true);
    assert.equal(flags.useCustomSection, true);
  });

  it('não trata string "false" nem 1 como true', () => {
    const flags = hydrateWorkspaceSectionFlags({
      isFromOtherCnpj: 'true' as unknown as boolean,
      useCustomSection: 1 as unknown as boolean,
    });
    assert.equal(flags.isFromOtherCnpj, false);
    assert.equal(flags.useCustomSection, false);
  });
});

describe('mergeWorkspaceCompanyJsonSectionFields', () => {
  it('8. submit desmarcado envia explicitamente useCustomSection: false', () => {
    const payload = mergeWorkspaceCompanyJsonSectionFields(
      { name: 'MOEVE', customSectionHTML: '<p></p>' },
      { isFromOtherCnpj: true, useCustomSection: false },
    );

    const json = JSON.stringify(payload);
    assert.match(json, /"useCustomSection":false/);
    assert.equal(payload.useCustomSection, false);
    assert.equal(payload.customSectionHTML, '<p></p>');
  });

  it('não apaga customSectionHTML ao desmarcar se o campo não veio no form', () => {
    const payload = mergeWorkspaceCompanyJsonSectionFields(
      { customSectionHTML: '<p>Texto antigo</p>' },
      { isFromOtherCnpj: true, useCustomSection: false },
    );
    assert.equal(payload.customSectionHTML, '<p>Texto antigo</p>');
    assert.equal(payload.useCustomSection, false);
  });
});

describe('persistência entre salvar e reabrir', () => {
  it('6. true → salvar → false → salvar → reabrir permanece false', () => {
    const afterTrue = persistAndReopen({
      isFromOtherCnpj: true,
      useCustomSection: true,
      customSectionHTML: '<p></p>',
    });
    assert.equal(afterTrue.reopened.useCustomSection, true);

    const afterFalse = persistAndReopen({
      isFromOtherCnpj: true,
      useCustomSection: false,
      customSectionHTML: '<p></p>',
    });
    assert.match(JSON.stringify(afterFalse.serialized), /"useCustomSection":false/);
    assert.equal(afterFalse.reopened.useCustomSection, false);
    assert.equal(afterFalse.serialized.customSectionHTML, '<p></p>');
  });

  it('7. false → true → salvar → reabrir permanece true', () => {
    const afterFalse = persistAndReopen({
      isFromOtherCnpj: true,
      useCustomSection: false,
    });
    assert.equal(afterFalse.reopened.useCustomSection, false);

    const afterTrue = persistAndReopen({
      isFromOtherCnpj: true,
      useCustomSection: true,
      customSectionHTML: '<p>Seção</p>',
    });
    assert.match(JSON.stringify(afterTrue.serialized), /"useCustomSection":true/);
    assert.equal(afterTrue.reopened.useCustomSection, true);
  });
});

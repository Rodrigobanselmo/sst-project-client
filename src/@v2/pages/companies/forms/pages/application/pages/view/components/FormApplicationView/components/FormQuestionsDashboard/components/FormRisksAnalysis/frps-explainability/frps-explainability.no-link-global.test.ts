/**
 * Testes pontuais: sem picker / link-global; LINK_REQUIRED → unavailable.
 * Executar: npx tsx --test <este-arquivo>
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { classifyFrpsExplainabilityError } from './frps-explainability-error.util';
import { FRPS_EXPLAINABILITY_UI_COPY } from './frps-explainability-ui-copy';
import {
  buildCatalogFrpsItemKey,
  resolveFrpsUnavailableUiPhase,
} from './frps-explainability.utils';

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = here.split('/src/')[0] + '/src';

describe('FRPS GLOBAL_CATALOG_LINK_REQUIRED → unavailable (no picker)', () => {
  it('1 MASTER + LINK_REQUIRED maps to unavailable (not decision / not generate)', () => {
    assert.equal(
      resolveFrpsUnavailableUiPhase({
        reason: 'GLOBAL_CATALOG_LINK_REQUIRED',
        canGenerateConceptual: true,
        isMaster: true,
      }),
      'unavailable',
    );
    assert.equal(
      resolveFrpsUnavailableUiPhase({
        reason: 'GLOBAL_CATALOG_LINK_REQUIRED',
        canGenerateConceptual: false,
        isMaster: true,
      }),
      'unavailable',
    );
    assert.equal(
      resolveFrpsUnavailableUiPhase({
        reason: 'GLOBAL_CATALOG_LINK_REQUIRED',
        canGenerateConceptual: false,
        isMaster: false,
      }),
      'unavailable',
    );
  });

  it('2 drawer has no Vincular/Criar panel or link-global phase', () => {
    const drawer = readFileSync(join(here, 'FrpsExplainabilityDrawer.tsx'), 'utf8');
    const context = readFileSync(join(here, 'FrpsExplainabilityContext.tsx'), 'utf8');

    assert.equal(existsSync(join(here, 'FrpsGlobalCatalogDecisionPanel.tsx')), false);
    assert.equal(drawer.includes('FrpsGlobalCatalogDecisionPanel'), false);
    assert.equal(drawer.includes('awaiting_global_catalog_decision'), false);
    assert.equal(drawer.includes('confirmCreateGlobalCatalog'), false);
    assert.equal(drawer.includes('confirmLinkGlobalCatalog'), false);
    assert.equal(context.includes('awaiting_global_catalog_decision'), false);
    assert.equal(context.includes('linkGlobalMutation'), false);
    assert.equal(context.includes('confirmLinkGlobalCatalog'), false);
    assert.equal(context.includes('confirmCreateGlobalCatalog'), false);
    assert.equal(context.includes('buildLinkFrpsItemConceptualGlobalBody'), false);
  });

  it('3 LINK_REQUIRED copy is simple unavailable (no Vincular)', () => {
    assert.equal(
      FRPS_EXPLAINABILITY_UI_COPY.globalCatalogLinkRequiredTitle,
      'Explicação técnica indisponível',
    );
    assert.match(
      FRPS_EXPLAINABILITY_UI_COPY.globalCatalogLinkRequiredBody,
      /identidade global|Biblioteca/i,
    );
    assert.equal(
      /Vincular|Criar novo item global/i.test(
        FRPS_EXPLAINABILITY_UI_COPY.globalCatalogLinkRequiredBody,
      ),
      false,
    );

    const classified = classifyFrpsExplainabilityError({
      response: {
        status: 409,
        data: {
          code: 'GLOBAL_CATALOG_LINK_REQUIRED',
          message: 'interno',
        },
      },
    });
    assert.equal(classified.code, 'GLOBAL_CATALOG_LINK_REQUIRED');
    assert.match(classified.message, /identidade global|Biblioteca/i);
    assert.equal(/Vincule|Vincular/i.test(classified.message), false);
  });

  it('4 CONCEPTUAL_NOT_GENERATED still allows master generate', () => {
    assert.equal(
      resolveFrpsUnavailableUiPhase({
        reason: 'CONCEPTUAL_NOT_GENERATED',
        canGenerateConceptual: true,
        isMaster: true,
      }),
      'awaiting_master_generate',
    );
  });

  it('5 buildCatalogFrpsItemKey keeps stable catalog identity', () => {
    const a = buildCatalogFrpsItemKey('SOURCE', 'local-homonym-1');
    const b = buildCatalogFrpsItemKey('SOURCE', 'local-homonym-2');
    assert.equal(a, 'catalog:SOURCE:local-homonym-1');
    assert.equal(b, 'catalog:SOURCE:local-homonym-2');
    assert.notEqual(a, b);
  });

  it('6 service/hooks/routes have no link-global API', () => {
    const service = readFileSync(
      join(
        srcRoot,
        '@v2/services/forms/form-questions-answers-analysis/frps-explainability/frps-explainability.service.ts',
      ),
      'utf8',
    );
    const hooks = readFileSync(
      join(
        srcRoot,
        '@v2/services/forms/form-questions-answers-analysis/frps-explainability/hooks.ts',
      ),
      'utf8',
    );
    const routes = readFileSync(
      join(srcRoot, '@v2/constants/routes/forms.routes.ts'),
      'utf8',
    );

    assert.equal(service.includes('linkFrpsItemConceptualGlobal'), false);
    assert.equal(hooks.includes('useMutateLinkFrpsItemConceptualGlobal'), false);
    assert.equal(routes.includes('EXPLAIN_ITEM_CONCEPTUAL_LINK_GLOBAL'), false);
  });
});

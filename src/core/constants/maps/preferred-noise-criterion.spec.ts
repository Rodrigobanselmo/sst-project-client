/**
 * Executar:
 * npx tsx --test src/core/constants/maps/preferred-noise-criterion.spec.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DEFAULT_PREFERRED_NOISE_CRITERION,
  PreferredNoiseCriterionEnum,
  normalizePreferredNoiseCriterion,
  occupationalCriterionHint,
  resolveRouteWorkspaceId,
  resolveWorkspacePreferredNoiseCriterion,
} from './preferred-noise-criterion';

describe('normalizePreferredNoiseCriterion', () => {
  it('defaults e valores válidos', () => {
    assert.equal(
      DEFAULT_PREFERRED_NOISE_CRITERION,
      PreferredNoiseCriterionEnum.NHO01_Q3,
    );
    assert.equal(
      normalizePreferredNoiseCriterion(null),
      PreferredNoiseCriterionEnum.NHO01_Q3,
    );
    assert.equal(
      normalizePreferredNoiseCriterion(undefined),
      PreferredNoiseCriterionEnum.NHO01_Q3,
    );
    assert.equal(
      normalizePreferredNoiseCriterion(''),
      PreferredNoiseCriterionEnum.NHO01_Q3,
    );
    assert.equal(
      normalizePreferredNoiseCriterion('NR15_Q5'),
      PreferredNoiseCriterionEnum.NR15_Q5,
    );
    assert.equal(
      normalizePreferredNoiseCriterion('NHO01_Q3'),
      PreferredNoiseCriterionEnum.NHO01_Q3,
    );
    assert.equal(
      normalizePreferredNoiseCriterion('INVALID'),
      PreferredNoiseCriterionEnum.NHO01_Q3,
    );
  });
});

describe('resolveRouteWorkspaceId — rota real Caracterização', () => {
  it('lê tabWorkspaceId quando workspaceId de path está ausente', () => {
    assert.equal(
      resolveRouteWorkspaceId({ tabWorkspaceId: 'ws-matriz' }),
      'ws-matriz',
    );
  });

  it('prefere workspaceId de path quando ambos existem', () => {
    assert.equal(
      resolveRouteWorkspaceId({
        workspaceId: 'ws-path',
        tabWorkspaceId: 'ws-tab',
      }),
      'ws-path',
    );
  });

  it('sem nenhum id → undefined', () => {
    assert.equal(resolveRouteWorkspaceId({}), undefined);
  });
});

describe('resolveWorkspacePreferredNoiseCriterion + hint', () => {
  const workspaces = [
    {
      id: 'ws-a',
      preferredNoiseCriterion: PreferredNoiseCriterionEnum.NHO01_Q3,
    },
    {
      id: 'ws-b',
      preferredNoiseCriterion: PreferredNoiseCriterionEnum.NR15_Q5,
    },
    {
      id: 'ws-c',
      // campo ausente
    },
  ];

  it('NHO01_Q3 → texto padrão SimpleSST', () => {
    const criterion = resolveWorkspacePreferredNoiseCriterion({
      workspaceId: 'ws-a',
      workspaces,
    });
    assert.equal(criterion, PreferredNoiseCriterionEnum.NHO01_Q3);
    assert.equal(
      occupationalCriterionHint(criterion),
      'Critério ocupacional do PGR: NHO 01 — Q3 (padrão SimpleSST).',
    );
  });

  it('NR15_Q5 → texto NR-15', () => {
    const criterion = resolveWorkspacePreferredNoiseCriterion({
      workspaceId: 'ws-b',
      workspaces,
    });
    assert.equal(criterion, PreferredNoiseCriterionEnum.NR15_Q5);
    assert.equal(
      occupationalCriterionHint(criterion),
      'Critério ocupacional do PGR: NR-15 — Q5.',
    );
  });

  it('campo ausente no workspace conhecido → default NHO01_Q3 + hint', () => {
    const criterion = resolveWorkspacePreferredNoiseCriterion({
      workspaceId: 'ws-c',
      workspaces,
    });
    assert.equal(criterion, PreferredNoiseCriterionEnum.NHO01_Q3);
    assert.equal(
      occupationalCriterionHint(criterion),
      'Critério ocupacional do PGR: NHO 01 — Q3 (padrão SimpleSST).',
    );
  });

  it('workspace não identificável → nenhum hint', () => {
    assert.equal(
      resolveWorkspacePreferredNoiseCriterion({
        workspaceId: undefined,
        workspaces,
      }),
      null,
    );
    assert.equal(
      resolveWorkspacePreferredNoiseCriterion({
        workspaceId: 'ws-missing',
        workspaces,
      }),
      null,
    );
    assert.equal(occupationalCriterionHint(null), null);
  });

  it('não seleciona o primeiro workspace como fallback', () => {
    const criterion = resolveWorkspacePreferredNoiseCriterion({
      workspaceId: undefined,
      workspaces,
    });
    assert.equal(criterion, null);
    assert.notEqual(criterion, PreferredNoiseCriterionEnum.NHO01_Q3);
    assert.notEqual(
      occupationalCriterionHint(criterion),
      'Critério ocupacional do PGR: NHO 01 — Q3 (padrão SimpleSST).',
    );
  });

  it('rota Caracterização (tabWorkspaceId) resolve o estabelecimento correto', () => {
    const workspaceId = resolveRouteWorkspaceId({
      tabWorkspaceId: 'ws-b',
    });
    const criterion = resolveWorkspacePreferredNoiseCriterion({
      workspaceId,
      workspaces,
    });
    assert.equal(workspaceId, 'ws-b');
    assert.equal(criterion, PreferredNoiseCriterionEnum.NR15_Q5);
    assert.equal(
      occupationalCriterionHint(criterion),
      'Critério ocupacional do PGR: NR-15 — Q5.',
    );
  });
});

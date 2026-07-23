/**
 * Testes da função pura de agrupamento do Relatório Técnico FRPS.
 * Executar: npx tsx --test <este-arquivo>
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type {
  FrpsTechnicalReportPendingItem,
  FrpsTechnicalReportValidatedItem,
} from '@v2/services/forms/form-questions-answers-analysis/frps-explainability-technical-report/frps-explainability-technical-report.types';

import {
  buildFrpsExplainabilityReportGroups,
  resolvePrimaryFrpsRisk,
} from './buildFrpsExplainabilityReportGroups';

function validated(
  partial: Partial<FrpsTechnicalReportValidatedItem> &
    Pick<
      FrpsTechnicalReportValidatedItem,
      'itemKey' | 'name' | 'itemType' | 'risks'
    >,
): FrpsTechnicalReportValidatedItem {
  return {
    canonicalCatalogId: partial.canonicalCatalogId ?? partial.itemKey,
    validationStatus: 'VALIDATED',
    validatedBy: { name: 'Auditor' },
    validatedAt: '2026-07-01T12:00:00.000Z',
    aliasCount: 1,
    usages: [{ groupingLabel: 'Setor', groupingValue: 'Produção' }],
    content: {
      definition: 'Conteúdo conceitual completo preservado',
      objective: 'Objetivo completo',
    },
    ...partial,
  };
}

function pending(
  partial: Partial<FrpsTechnicalReportPendingItem> &
    Pick<FrpsTechnicalReportPendingItem, 'name' | 'itemType' | 'reason'>,
): FrpsTechnicalReportPendingItem {
  return {
    validationStatus: null,
    risks: [],
    usages: [{ groupingLabel: 'Setor', groupingValue: 'Admin' }],
    ...partial,
  };
}

describe('buildFrpsExplainabilityReportGroups', () => {
  it('1 ordena capítulos FRPS alfabeticamente por riskName', () => {
    const result = buildFrpsExplainabilityReportGroups({
      items: [
        validated({
          itemKey: 'a',
          name: 'Item Z',
          itemType: 'GENERATE_SOURCE',
          risks: [{ riskId: '3', riskName: 'Carga de Trabalho' }],
        }),
        validated({
          itemKey: 'b',
          name: 'Item A',
          itemType: 'GENERATE_SOURCE',
          risks: [{ riskId: '1', riskName: 'Assédio Moral' }],
        }),
        validated({
          itemKey: 'c',
          name: 'Item M',
          itemType: 'GENERATE_SOURCE',
          risks: [{ riskId: '2', riskName: 'Autonomia' }],
        }),
      ],
      pendingItems: [],
    });

    assert.deepEqual(
      result.groups.map((g) => g.riskName),
      ['Assédio Moral', 'Autonomia', 'Carga de Trabalho'],
    );
  });

  it('2 dentro do FRPS: Fonte → Administrativa → Engenharia', () => {
    const result = buildFrpsExplainabilityReportGroups({
      items: [
        validated({
          itemKey: 'eng',
          name: 'Barreira física',
          itemType: 'REC_MED_ENGINEERING',
          risks: [{ riskId: 'r1', riskName: 'Ruído Organizacional' }],
        }),
        validated({
          itemKey: 'src',
          name: 'Pressão de prazo',
          itemType: 'GENERATE_SOURCE',
          risks: [{ riskId: 'r1', riskName: 'Ruído Organizacional' }],
        }),
        validated({
          itemKey: 'adm',
          name: 'Rodízio de turnos',
          itemType: 'REC_MED_ADMIN',
          risks: [{ riskId: 'r1', riskName: 'Ruído Organizacional' }],
        }),
      ],
      pendingItems: [],
    });

    const group = result.groups[0];
    assert.equal(group.sources.length, 1);
    assert.equal(group.administrative.length, 1);
    assert.equal(group.engineering.length, 1);
    assert.equal(group.sources[0].kind, 'full');
    assert.equal(group.administrative[0].kind, 'full');
    assert.equal(group.engineering[0].kind, 'full');
  });

  it('3 itens do mesmo tipo ordenados por nome', () => {
    const result = buildFrpsExplainabilityReportGroups({
      items: [
        validated({
          itemKey: '2',
          name: 'Zebra',
          itemType: 'GENERATE_SOURCE',
          risks: [{ riskId: 'r1', riskName: 'Estresse' }],
        }),
        validated({
          itemKey: '1',
          name: 'Alpha',
          itemType: 'GENERATE_SOURCE',
          risks: [{ riskId: 'r1', riskName: 'Estresse' }],
        }),
      ],
      pendingItems: [],
    });

    const names = result.groups[0].sources.map((e) =>
      e.kind === 'full' ? e.item.name : e.name,
    );
    assert.deepEqual(names, ['Alpha', 'Zebra']);
  });

  it('4 canônico multi-FRPS: uma ficha completa + referência cruzada', () => {
    const item = validated({
      itemKey: 'canon-1',
      name: 'Falta de reconhecimento',
      itemType: 'GENERATE_SOURCE',
      // API pode enviar fora de ordem; principal deve ser Assédio (A antes de C)
      risks: [
        { riskId: 'c', riskName: 'Carga Mental' },
        { riskId: 'a', riskName: 'Assédio Moral' },
      ],
      content: { definition: 'CONTEUDO_UNICO_NAO_DUPLICAR' },
    });

    const result = buildFrpsExplainabilityReportGroups({
      items: [item],
      pendingItems: [],
    });

    assert.equal(result.groups.length, 2);
    assert.equal(result.groups[0].riskName, 'Assédio Moral');
    assert.equal(result.groups[1].riskName, 'Carga Mental');

    const primaryEntry = result.groups[0].sources[0];
    const secondaryEntry = result.groups[1].sources[0];

    assert.equal(primaryEntry.kind, 'full');
    if (primaryEntry.kind === 'full') {
      assert.equal(
        primaryEntry.item.content.definition,
        'CONTEUDO_UNICO_NAO_DUPLICAR',
      );
    }

    assert.equal(secondaryEntry.kind, 'reference');
    if (secondaryEntry.kind === 'reference') {
      assert.equal(secondaryEntry.primaryFrpsName, 'Assédio Moral');
      assert.equal(secondaryEntry.name, 'Falta de reconhecimento');
      assert.equal(secondaryEntry.itemType, 'GENERATE_SOURCE');
    }

    const fullCount = result.groups.flatMap((g) => g.sources).filter(
      (e) => e.kind === 'full',
    ).length;
    const refCount = result.groups.flatMap((g) => g.sources).filter(
      (e) => e.kind === 'reference',
    ).length;
    assert.equal(fullCount, 1);
    assert.equal(refCount, 1);
  });

  it('5 pendência multi-FRPS aparece nos dois grupos', () => {
    const result = buildFrpsExplainabilityReportGroups({
      items: [],
      pendingItems: [
        pending({
          name: 'Sem validação',
          itemType: 'REC_MED_ADMIN',
          reason: 'DRAFT_AI',
          risks: [
            { riskId: 'b', riskName: 'Burnout' },
            { riskId: 'a', riskName: 'Assédio' },
          ],
        }),
      ],
    });

    assert.equal(result.groups.length, 2);
    assert.equal(result.groups[0].pending.length, 1);
    assert.equal(result.groups[1].pending.length, 1);
    assert.equal(result.groups[0].pending[0].name, 'Sem validação');
    assert.equal(result.groups[1].pending[0].name, 'Sem validação');
  });

  it('6 item sem FRPS vai para Pendências sem FRPS identificado', () => {
    const result = buildFrpsExplainabilityReportGroups({
      items: [],
      pendingItems: [
        pending({
          name: 'Órfão',
          itemType: 'GENERATE_SOURCE',
          reason: 'NEVER_GENERATED',
          risks: [],
        }),
      ],
    });

    assert.equal(result.groups.length, 0);
    assert.equal(result.pendingWithoutFrps.length, 1);
    assert.equal(result.pendingWithoutFrps[0].name, 'Órfão');
  });

  it('7 sumário por FRPS com contagens corretas', () => {
    const result = buildFrpsExplainabilityReportGroups({
      items: [
        validated({
          itemKey: 's1',
          name: 'Fonte A',
          itemType: 'GENERATE_SOURCE',
          risks: [{ riskId: 'r1', riskName: 'Demanda' }],
        }),
        validated({
          itemKey: 'a1',
          name: 'Adm A',
          itemType: 'REC_MED_ADMIN',
          risks: [{ riskId: 'r1', riskName: 'Demanda' }],
        }),
        validated({
          itemKey: 'e1',
          name: 'Eng A',
          itemType: 'REC_MED_ENGINEERING',
          // multi-FRPS: conta como engenharia nos dois grupos
          risks: [
            { riskId: 'r1', riskName: 'Demanda' },
            { riskId: 'r2', riskName: 'Isolamento' },
          ],
        }),
      ],
      pendingItems: [
        pending({
          name: 'P1',
          itemType: 'GENERATE_SOURCE',
          reason: 'REJECTED',
          risks: [{ riskId: 'r1', riskName: 'Demanda' }],
        }),
        pending({
          name: 'P2',
          itemType: 'REC_MED_ADMIN',
          reason: 'DRAFT_AI',
          risks: [{ riskId: 'r2', riskName: 'Isolamento' }],
        }),
      ],
    });

    assert.deepEqual(result.frpsSummary, [
      {
        riskId: 'r1',
        riskName: 'Demanda',
        validatedSources: 1,
        validatedAdministrative: 1,
        validatedEngineering: 1,
        pending: 1,
      },
      {
        riskId: 'r2',
        riskName: 'Isolamento',
        validatedSources: 0,
        validatedAdministrative: 0,
        validatedEngineering: 1,
        pending: 1,
      },
    ]);
  });

  it('8 ficha VALIDATED preserva content completo no full', () => {
    const result = buildFrpsExplainabilityReportGroups({
      items: [
        validated({
          itemKey: 'v1',
          name: 'Fonte validada',
          itemType: 'GENERATE_SOURCE',
          risks: [{ riskId: 'r1', riskName: 'Apoio' }],
          content: {
            definition: 'Definição X',
            favorableSignals: 'Sinais Y',
          },
        }),
      ],
      pendingItems: [],
    });

    const entry = result.groups[0].sources[0];
    assert.equal(entry.kind, 'full');
    if (entry.kind === 'full') {
      assert.equal(entry.item.content.definition, 'Definição X');
      assert.equal(entry.item.content.favorableSignals, 'Sinais Y');
      assert.equal(entry.item.validationStatus, 'VALIDATED');
    }
  });

  it('9 pendências DRAFT/NEVER/REJECTED não carregam content', () => {
    const result = buildFrpsExplainabilityReportGroups({
      items: [],
      pendingItems: [
        pending({
          name: 'Draft',
          itemType: 'GENERATE_SOURCE',
          reason: 'DRAFT_AI',
          risks: [{ riskId: 'r1', riskName: 'Apoio' }],
        }),
        pending({
          name: 'Never',
          itemType: 'REC_MED_ADMIN',
          reason: 'NEVER_GENERATED',
          risks: [{ riskId: 'r1', riskName: 'Apoio' }],
        }),
        pending({
          name: 'Rejected',
          itemType: 'REC_MED_ENGINEERING',
          reason: 'REJECTED',
          risks: [{ riskId: 'r1', riskName: 'Apoio' }],
        }),
      ],
    });

    for (const item of result.groups[0].pending) {
      assert.equal('content' in item, false);
      assert.ok(
        ['DRAFT_AI', 'NEVER_GENERATED', 'REJECTED'].includes(item.reason),
      );
    }
  });

  it('FRPS principal é determinístico (ordena risks, não ordem da API)', () => {
    const primary = resolvePrimaryFrpsRisk([
      { riskId: 'z', riskName: 'Zona de risco' },
      { riskId: 'a', riskName: 'Apoio Social' },
      { riskId: 'm', riskName: 'Metas Inalcançáveis' },
    ]);
    assert.equal(primary?.riskName, 'Apoio Social');
    assert.equal(primary?.riskId, 'a');
  });
});

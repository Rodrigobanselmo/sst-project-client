/**
 * Aceite de sugestão pendente: confirmação antes da gravação, verificação e falha.
 *
 * Executar:
 * npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/accept-pending-ai-suggestion.util.spec.ts
 */
import assert from 'node:assert/strict';

import type { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { RecTypeEnum } from 'project/enum/recType.enum';

import { acceptPendingAiSuggestion } from './accept-pending-ai-suggestion.util';
import {
  RiskFactorAiPendingRiskData,
  RiskFactorAiPendingSuggestion,
} from './risk-factor-ai-pending.util';

const row: RiskFactorAiPendingRiskData & { id: string; riskId: string } = {
  id: 'rfd-1',
  riskId: 'risk-1',
  generateSources: [],
  engs: [],
  adms: [],
  recs: [],
  probability: 4,
  probabilityAfter: undefined,
};

const item = (
  overrides: Partial<RiskFactorAiPendingSuggestion>,
): RiskFactorAiPendingSuggestion => ({
  key: 'risk-1:existingAdministrativeMeasures:rodizio',
  riskId: 'risk-1',
  riskFactorDataId: 'rfd-1',
  field: 'existingAdministrativeMeasures',
  value: 'Rodízio',
  action: 'confirm-existence',
  ...overrides,
});

const harness = (options: {
  confirm?: boolean;
  writeFails?: boolean;
  savedRow?: RiskFactorAiPendingRiskData | null;
}) => {
  const calls: string[] = [];
  const writes: Partial<IUpsertRiskData>[] = [];
  const applied: string[] = [];
  const confirmedLogs: string[] = [];
  return {
    calls,
    writes,
    applied,
    confirmedLogs,
    deps: {
      companyId: 'company-1',
      confirmExistence: async (value: string) => {
        calls.push(`confirm:${value}`);
        return options.confirm ?? true;
      },
      write: async (payload: Partial<IUpsertRiskData>) => {
        calls.push('write');
        writes.push(payload);
        if (options.writeFails) throw new Error('falhou');
      },
      readSavedRow: async () => {
        calls.push('refetch');
        return options.savedRow;
      },
      markApplied: (key: string) => {
        calls.push('applied');
        applied.push(key);
      },
      onExistenceConfirmed: async () => {
        calls.push('log-confirm');
        confirmedLogs.push('confirm');
      },
    },
  };
};

const run = async () => {
  // Cancelar a confirmação: nada é gravado e a sugestão continua pendente.
  {
    const h = harness({ confirm: false });
    const result = await acceptPendingAiSuggestion({ suggestion: item({}), riskData: row, ...h.deps });
    assert.equal(result, 'cancelled');
    assert.deepEqual(h.calls, ['confirm:Rodízio']);
    assert.equal(h.writes.length, 0);
    assert.equal(h.applied.length, 0);
  }

  // Confirmar: confirmação → gravação → releitura → marcação → registro de confirmação.
  {
    const h = harness({ savedRow: { ...row, adms: [{ id: 'adm-1', medName: 'rodizio' } as never] } });
    const result = await acceptPendingAiSuggestion({ suggestion: item({}), riskData: row, ...h.deps });
    assert.equal(result, 'applied');
    assert.deepEqual(h.calls, ['confirm:Rodízio', 'write', 'refetch', 'applied', 'log-confirm']);
    assert.deepEqual(h.writes[0], {
      admsAddOnly: [{ medName: 'Rodízio', medType: 'ADM', companyId: 'company-1' }],
    });
  }

  // Falha na gravação: continua pendente, sem marcação e sem registro.
  {
    const h = harness({ writeFails: true });
    const result = await acceptPendingAiSuggestion({ suggestion: item({}), riskData: row, ...h.deps });
    assert.equal(result, 'failed');
    assert.equal(h.applied.length, 0);
    assert.equal(h.confirmedLogs.length, 0);
  }

  // Gravação sem efeito no cadastro (ex.: bloqueio silencioso): continua pendente.
  {
    const h = harness({ savedRow: row });
    const result = await acceptPendingAiSuggestion({ suggestion: item({}), riskData: row, ...h.deps });
    assert.equal(result, 'failed');
    assert.equal(h.applied.length, 0);

    const retry = harness({ savedRow: { ...row, adms: [{ id: 'adm-1', medName: 'Rodízio' } as never] } });
    assert.equal(
      await acceptPendingAiSuggestion({ suggestion: item({}), riskData: row, ...retry.deps }),
      'applied',
      'nova tentativa funciona',
    );
  }

  // Recomendação: sem confirmação de existência, grava como recomendação com residual da coluna.
  {
    const rec = item({
      key: 'risk-1:recommendedEngineeringMeasures:barreira',
      field: 'recommendedEngineeringMeasures',
      value: 'Barreira',
      action: 'accept-recommendation',
      recType: RecTypeEnum.ENG,
    });
    const h = harness({
      savedRow: { ...row, recs: [{ id: 'rec-1', recName: 'Barreira', recType: RecTypeEnum.ENG } as never] },
    });
    const result = await acceptPendingAiSuggestion({ suggestion: rec, riskData: row, ...h.deps });
    assert.equal(result, 'applied');
    assert.equal(h.calls.some((call) => call.startsWith('confirm')), false);
    assert.equal(h.confirmedLogs.length, 0, 'recomendação não registra confirmação de controle');
    assert.deepEqual(h.writes[0], {
      recAddOnly: [{ recName: 'Barreira', recType: RecTypeEnum.ENG, companyId: 'company-1' }],
      probabilityAfter: 3,
    });
    assert.equal('engsAddOnly' in h.writes[0], false);
    assert.equal('probability' in h.writes[0], false);
  }

  // Já cadastrada (corrida com outra aba): marca aplicada sem gravar nem pedir confirmação.
  {
    const h = harness({});
    const registered = { ...row, adms: [{ id: 'adm-1', medName: 'Rodízio' } as never] };
    const result = await acceptPendingAiSuggestion({ suggestion: item({}), riskData: registered, ...h.deps });
    assert.equal(result, 'already-registered');
    assert.deepEqual(h.calls, ['applied']);
  }

  console.log('accept-pending-ai-suggestion.util.spec: ok');
};

void run().catch((error) => {
  console.error(error);
  process.exit(1);
});

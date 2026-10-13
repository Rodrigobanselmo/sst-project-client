import { useCallback } from 'react';

import { useSnackbar } from 'notistack';
import { MedTypeEnum } from 'project/enum/medType.enum';
import { RecTypeEnum } from 'project/enum/recType.enum';

import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useTabWorkspaceId } from 'core/hooks/useTabWorkspaceId';
import { IEpi } from 'core/interfaces/api/IEpi';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRecMed, IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { queryGenerateSource } from 'core/services/hooks/queries/useQueryGenerateSource/useQueryGenerateSource';
import { queryRecMed } from 'core/services/hooks/queries/useQueryRecMed/useQueryRecMed';
import { queryEpis } from 'core/services/hooks/queries/useQueryEpis';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';

import {
  buildRiskCatalogBatchConfirmMessage,
  buildRiskCatalogBatchSummaryMessage,
  buildRiskCatalogMissingConfirmMessage,
  dedupeRiskCatalogDragItems,
  findCatalogItemByNormalizedName,
} from './find-risk-catalog-item-match.util';
import {
  buildRecAttachPayload,
  validRiskDataRecs,
  withRecAttachResidual,
} from './rec-attach-residual.util';
import {
  RISK_CATALOG_DND_KIND_LABEL,
  RiskCatalogBatchStats,
  RiskCatalogCopyItemResult,
  RiskCatalogDndDragItem,
  RiskCatalogDndKind,
} from './risk-catalog-dnd.types';
import { isRiskCatalogSourceSameAsDestination } from './risk-catalog-record-copy.util';

type DestinationContext = {
  risk: IRiskFactors;
  riskData?: IRiskData | null;
  handleSelect: (values: Partial<IUpsertRiskData>) => Promise<void>;
  /** Visualização por risco: destino é o registro (GSE), não o fator. */
  recordScoped?: boolean;
  /** Nome exibido do destino (GSE) nas mensagens da visualização por risco. */
  label?: string;
};

const destinationIdentity = (dest: DestinationContext) => ({
  riskId: dest.risk?.id,
  riskDataId: dest.riskData?.id,
  recordScoped: dest.recordScoped,
});

const destinationName = (dest: DestinationContext) =>
  dest.label?.trim() || dest.risk.name || 'Fator de risco de destino';

/** Mesmo fator em outro registro: o item já existe no cadastro; vincula pelo próprio id. */
const sameRiskCatalogMatch = (
  item: RiskCatalogDndDragItem,
  dest: DestinationContext,
): RiskCatalogCopyItemResult | null => {
  if (!dest.recordScoped || item.kind === 'epi') return null;
  if (item.sourceRiskId !== dest.risk?.id || item.catalogId == null) return null;
  return {
    status: 'attach_existing',
    match: {
      id: String(item.catalogId),
      name: item.name,
      recName: item.name,
      medName: item.name,
      recType: item.recType,
      medType: item.medType,
      ...(item.catalogStatus ? { status: item.catalogStatus } : {}),
    },
  };
};

function alreadyAttached(
  kind: RiskCatalogDndKind,
  item: RiskCatalogDndDragItem,
  riskData?: IRiskData | null,
): boolean {
  if (!riskData) return false;
  const needle = (item.name || '').trim().toLowerCase();

  switch (kind) {
    case 'generateSource':
      return (riskData.generateSources ?? []).some(
        (gs) =>
          gs?.id === item.catalogId ||
          (gs?.name || '').trim().toLowerCase() === needle,
      );
    case 'eng':
      return (riskData.engs ?? []).some(
        (eng) =>
          eng?.id === item.catalogId ||
          (eng?.medName || '').trim().toLowerCase() === needle,
      );
    case 'adm':
      return (riskData.adms ?? []).some(
        (adm) =>
          adm?.id === item.catalogId ||
          (adm?.medName || '').trim().toLowerCase() === needle,
      );
    case 'rec':
      return (riskData.recs ?? []).some(
        (rec) =>
          rec?.id === item.catalogId ||
          (rec?.recName || '').trim().toLowerCase() === needle,
      );
    case 'epi':
      return (riskData.epis ?? []).some(
        (epi) =>
          epi?.id === item.catalogId ||
          (!!item.ca && String(epi?.ca) === String(item.ca)),
      );
    default:
      return false;
  }
}

function emptyBatchStats(
  kind: RiskCatalogDndKind,
  totalItems: number,
): RiskCatalogBatchStats {
  return {
    kind,
    totalItems,
    added: 0,
    existedInCatalog: 0,
    created: 0,
    alreadyAttached: 0,
    epiMissing: 0,
    failed: 0,
  };
}

export const useRiskCatalogDndCopy = () => {
  const { companyId } = useGetCompanyId();
  const { workspaceId: headerWorkspaceId } = useTabWorkspaceId();
  const { preventWarn } = usePreventAction();
  const { enqueueSnackbar } = useSnackbar();

  /** Mesma consulta usada pelo Adicionar (por nome / CA). */
  const findExistingInDestination = useCallback(
    async (item: RiskCatalogDndDragItem, destinationRiskId: string) => {
      if (!companyId) return null;

      if (item.kind === 'generateSource') {
        const result = await queryGenerateSource(
          { skip: 0, take: 300 },
          {
            companyId,
            riskIds: [destinationRiskId],
            search: item.name,
          },
        );
        return (
          findCatalogItemByNormalizedName(
            result.data || [],
            item.name,
            (gs) => gs.name,
          ) || null
        );
      }

      if (item.kind === 'eng' || item.kind === 'adm') {
        const medType =
          item.kind === 'eng' ? MedTypeEnum.ENG : MedTypeEnum.ADM;
        const result = await queryRecMed(
          { skip: 0, take: 300 },
          {
            companyId,
            riskIds: [destinationRiskId],
            onlyMed: true,
            medType: [medType],
            search: item.name,
          },
        );
        return (
          findCatalogItemByNormalizedName(
            result.data || [],
            item.name,
            (rm) => rm.medName,
          ) || null
        );
      }

      if (item.kind === 'rec') {
        const result = await queryRecMed(
          { skip: 0, take: 300 },
          {
            companyId,
            riskIds: [destinationRiskId],
            onlyRec: true,
            search: item.name,
          },
        );
        return (
          findCatalogItemByNormalizedName(
            result.data || [],
            item.name,
            (rm) => rm.recName,
          ) || null
        );
      }

      if (item.kind === 'epi') {
        const ca = String(item.ca || '').trim();
        if (!ca) return null;
        const result = await queryEpis({ skip: 0, take: 50 }, { ca });
        const list = result.data || [];
        const exact =
          list.find((epi) => String(epi.ca) === ca) ||
          list.find((epi) => String(epi.id) === String(item.catalogId));
        return exact || null;
      }

      return null;
    },
    [companyId],
  );

  /**
   * Núcleo compartilhado: decide o que o fluxo Adicionar faria para 1 item.
   * Usado pelo drag individual e pelo batch (sem UI).
   */
  const resolveCatalogCopyAction = useCallback(
    async (
      item: RiskCatalogDndDragItem,
      dest: DestinationContext,
    ): Promise<RiskCatalogCopyItemResult> => {
      if (!dest.risk?.id || !item.name?.trim()) return { status: 'invalid' };
      if (isRiskCatalogSourceSameAsDestination(item, destinationIdentity(dest))) {
        return { status: 'invalid' };
      }
      if (dest.recordScoped && item.recordCopyBlockedReason) {
        return { status: 'blocked', message: item.recordCopyBlockedReason };
      }
      if (alreadyAttached(item.kind, item, dest.riskData)) {
        return { status: 'already_attached' };
      }

      const sameRiskMatch = sameRiskCatalogMatch(item, dest);
      if (sameRiskMatch) return sameRiskMatch;

      const existing = await findExistingInDestination(item, dest.risk.id);
      if (existing?.id != null) {
        return { status: 'attach_existing', match: existing as any };
      }

      if (item.kind === 'epi') {
        return { status: 'epi_missing' };
      }

      return { status: 'create_and_attach' };
    },
    [findExistingInDestination],
  );

  const attachExisting = useCallback(
    async (
      item: RiskCatalogDndDragItem,
      match: IRecMed | IEpi | { id: string | number; name?: string },
      dest: DestinationContext,
    ) => {
      if (item.kind === 'generateSource') {
        await dest.handleSelect({ generateSources: [String(match.id)] });
        return;
      }
      if (item.kind === 'adm') {
        await dest.handleSelect({ adms: [String(match.id)] });
        return;
      }
      if (item.kind === 'eng') {
        await dest.handleSelect({
          engs: [{ recMedId: String(match.id) }],
        });
        return;
      }
      if (item.kind === 'rec') {
        await dest.handleSelect(
          buildRecAttachPayload(
            { ...(match as IRecMed), id: String(match.id) },
            dest.riskData,
            headerWorkspaceId,
            { excludeExistingControl: dest.recordScoped },
          ),
        );
        return;
      }
      if (item.kind === 'epi') {
        const epi = match as IEpi;
        await dest.handleSelect({
          epis: [{ ...epi.epiRiskData, epiId: epi.id }],
        });
      }
    },
    [headerWorkspaceId],
  );

  const createAndAttach = useCallback(
    async (item: RiskCatalogDndDragItem, dest: DestinationContext) => {
      if (!companyId) return;

      if (item.kind === 'generateSource') {
        await dest.handleSelect({
          generateSourcesAddOnly: [{ name: item.name, companyId }],
        });
        return;
      }
      if (item.kind === 'eng') {
        await dest.handleSelect({
          engsAddOnly: [
            {
              medName: item.name,
              medType: MedTypeEnum.ENG,
              companyId,
            },
          ],
        });
        return;
      }
      if (item.kind === 'adm') {
        await dest.handleSelect({
          admsAddOnly: [
            {
              medName: item.name,
              medType: MedTypeEnum.ADM,
              companyId,
            },
          ],
        });
        return;
      }
      if (item.kind === 'rec') {
        const recType =
          (item.recType as RecTypeEnum) || RecTypeEnum.ADM;
        await dest.handleSelect({
          recAddOnly: [
            {
              recName: item.name,
              recType,
              companyId,
            },
          ],
        });
        return;
      }
      if (item.kind === 'epi') {
        enqueueSnackbar(
          'Este EPI não foi encontrado no cadastro. Use Adicionar para cadastrá-lo.',
          { variant: 'warning' },
        );
      }
    },
    [companyId, enqueueSnackbar],
  );

  /** Agrupa o lote em um único handleSelect (mesmos campos do fluxo unitário). */
  const applyBatchResults = useCallback(
    async (
      kind: RiskCatalogDndKind,
      pairs: Array<{
        item: RiskCatalogDndDragItem;
        result: RiskCatalogCopyItemResult;
      }>,
      dest: DestinationContext,
    ) => {
      if (!companyId) return;

      let payload: Partial<IUpsertRiskData> = {};
      let hasWork = false;

      if (kind === 'generateSource') {
        const ids: string[] = [];
        const addOnly: { name?: string; companyId: string }[] = [];
        for (const { item, result } of pairs) {
          if (result.status === 'attach_existing') {
            ids.push(String(result.match.id));
          } else if (result.status === 'create_and_attach') {
            addOnly.push({ name: item.name, companyId });
          }
        }
        if (ids.length) {
          payload.generateSources = ids;
          hasWork = true;
        }
        if (addOnly.length) {
          payload.generateSourcesAddOnly = addOnly;
          hasWork = true;
        }
      }

      if (kind === 'adm') {
        const ids: string[] = [];
        const addOnly: {
          medName?: string;
          medType?: MedTypeEnum;
          companyId: string;
        }[] = [];
        for (const { item, result } of pairs) {
          if (result.status === 'attach_existing') {
            ids.push(String(result.match.id));
          } else if (result.status === 'create_and_attach') {
            addOnly.push({
              medName: item.name,
              medType: MedTypeEnum.ADM,
              companyId,
            });
          }
        }
        if (ids.length) {
          payload.adms = ids;
          hasWork = true;
        }
        if (addOnly.length) {
          payload.admsAddOnly = addOnly;
          hasWork = true;
        }
      }

      if (kind === 'eng') {
        const engs: { recMedId: string }[] = [];
        const addOnly: {
          medName?: string;
          medType?: MedTypeEnum;
          companyId: string;
        }[] = [];
        for (const { item, result } of pairs) {
          if (result.status === 'attach_existing') {
            engs.push({ recMedId: String(result.match.id) });
          } else if (result.status === 'create_and_attach') {
            addOnly.push({
              medName: item.name,
              medType: MedTypeEnum.ENG,
              companyId,
            });
          }
        }
        if (engs.length) {
          payload.engs = engs;
          hasWork = true;
        }
        if (addOnly.length) {
          payload.engsAddOnly = addOnly;
          hasWork = true;
        }
      }

      if (kind === 'rec') {
        const recIds: string[] = [];
        const addOnly: {
          recName?: string;
          recType?: RecTypeEnum;
          companyId: string;
        }[] = [];
        const residualOptions = { excludeExistingControl: dest.recordScoped };
        const nextRecsForProb: IRecMed[] = validRiskDataRecs(
          dest.riskData,
          residualOptions,
        );

        for (const { item, result } of pairs) {
          if (result.status === 'attach_existing') {
            const id = String(result.match.id);
            recIds.push(id);
            nextRecsForProb.push({
              ...(result.match as unknown as IRecMed),
              id,
            });
          } else if (result.status === 'create_and_attach') {
            addOnly.push({
              recName: item.name,
              recType: (item.recType as RecTypeEnum) || RecTypeEnum.ADM,
              companyId,
            });
            nextRecsForProb.push({
              id: `pending-${item.name}`,
              recName: item.name,
              recType: (item.recType as RecTypeEnum) || RecTypeEnum.ADM,
            } as IRecMed);
          }
        }

        if (recIds.length) {
          payload.recs = recIds;
          hasWork = true;
        }
        if (addOnly.length) {
          payload.recAddOnly = addOnly;
          hasWork = true;
        }

        if (hasWork) {
          payload = withRecAttachResidual({
            payload,
            riskData: dest.riskData,
            nextRecommendations: nextRecsForProb,
            headerWorkspaceId,
            options: residualOptions,
          });
        }
      }

      if (kind === 'epi') {
        const epis: NonNullable<IUpsertRiskData['epis']> = [];
        for (const { result } of pairs) {
          if (result.status === 'attach_existing') {
            const epi = result.match as unknown as IEpi;
            epis.push({ ...epi.epiRiskData, epiId: epi.id });
          }
        }
        if (epis.length) {
          payload.epis = epis;
          hasWork = true;
        }
      }

      if (!hasWork) return;
      await dest.handleSelect(payload);
    },
    [companyId, headerWorkspaceId],
  );

  const onDropCatalogItem = useCallback(
    async (item: RiskCatalogDndDragItem, dest: DestinationContext) => {
      if (!dest.risk?.id) return;
      if (isRiskCatalogSourceSameAsDestination(item, destinationIdentity(dest))) {
        return;
      }

      try {
        const action = await resolveCatalogCopyAction(item, dest);

        if (action.status === 'blocked') {
          enqueueSnackbar(action.message, { variant: 'warning' });
          return;
        }

        if (action.status === 'already_attached') {
          enqueueSnackbar(
            dest.recordScoped
              ? 'Este item já está neste GSE.'
              : 'Este item já está neste fator de risco.',
            { variant: 'info' },
          );
          return;
        }

        if (action.status === 'attach_existing') {
          await attachExisting(item, action.match as any, dest);
          enqueueSnackbar(
            dest.recordScoped
              ? `${RISK_CATALOG_DND_KIND_LABEL[item.kind]} copiada para ${destinationName(dest)}.`
              : `${RISK_CATALOG_DND_KIND_LABEL[item.kind]} adicionada ao fator de destino.`,
            { variant: 'success' },
          );
          return;
        }

        if (action.status === 'epi_missing') {
          enqueueSnackbar(
            'Este EPI não foi encontrado no cadastro. Use Adicionar para cadastrá-lo.',
            { variant: 'warning' },
          );
          return;
        }

        if (action.status !== 'create_and_attach') return;

        const destinationRiskName = destinationName(dest);

        preventWarn(
          buildRiskCatalogMissingConfirmMessage({
            kind: item.kind,
            itemName: item.name,
            destinationRiskName,
          }),
          async () => {
            try {
              await createAndAttach(item, dest);
              enqueueSnackbar(
                `${RISK_CATALOG_DND_KIND_LABEL[item.kind]} cadastrada e adicionada.`,
                { variant: 'success' },
              );
            } catch {
              enqueueSnackbar('Não foi possível cadastrar e adicionar o item.', {
                variant: 'error',
              });
            }
          },
          {
            title: 'Cadastrar no fator de destino?',
            confirmText: 'Cadastrar e adicionar',
            tag: 'warning',
          },
        );
      } catch {
        enqueueSnackbar('Falha ao consultar o cadastro do fator de destino.', {
          variant: 'error',
        });
      }
    },
    [
      attachExisting,
      createAndAttach,
      enqueueSnackbar,
      preventWarn,
      resolveCatalogCopyAction,
    ],
  );

  const onBatchCopyToDestination = useCallback(
    async (
      items: RiskCatalogDndDragItem[],
      dest: DestinationContext,
      options?: { onFinished?: () => void },
    ) => {
      if (!dest.risk?.id) return;
      const kind = items[0]?.kind;
      if (!kind) return;

      const uniqueItems = dedupeRiskCatalogDragItems(
        items.filter(
          (i) =>
            i.kind === kind &&
            !isRiskCatalogSourceSameAsDestination(i, destinationIdentity(dest)),
        ),
      );

      if (!uniqueItems.length) {
        enqueueSnackbar('Nenhum item para copiar.', { variant: 'info' });
        options?.onFinished?.();
        return;
      }

      const destinationRiskName = destinationName(dest);

      preventWarn(
        buildRiskCatalogBatchConfirmMessage({
          kind,
          count: uniqueItems.length,
          destinationRiskName,
        }),
        async () => {
          const stats = emptyBatchStats(kind, uniqueItems.length);
          const pairs: Array<{
            item: RiskCatalogDndDragItem;
            result: RiskCatalogCopyItemResult;
          }> = [];

          try {
            for (const item of uniqueItems) {
              try {
                const result = await resolveCatalogCopyAction(item, dest);
                pairs.push({ item, result });

                if (result.status === 'already_attached') {
                  stats.alreadyAttached += 1;
                } else if (result.status === 'attach_existing') {
                  stats.existedInCatalog += 1;
                  stats.added += 1;
                } else if (result.status === 'create_and_attach') {
                  stats.created += 1;
                  stats.added += 1;
                } else if (result.status === 'epi_missing') {
                  stats.epiMissing += 1;
                } else if (result.status === 'blocked') {
                  stats.blocked = (stats.blocked ?? 0) + 1;
                } else {
                  stats.failed += 1;
                }
              } catch {
                stats.failed += 1;
                pairs.push({ item, result: { status: 'invalid' } });
              }
            }

            await applyBatchResults(kind, pairs, dest);

            enqueueSnackbar(
              buildRiskCatalogBatchSummaryMessage(
                stats,
                destinationRiskName,
              ),
              {
                variant: stats.added > 0 ? 'success' : 'info',
                style: { whiteSpace: 'pre-line' },
              },
            );
          } catch {
            enqueueSnackbar('Falha ao copiar o lote para o fator de destino.', {
              variant: 'error',
            });
          } finally {
            options?.onFinished?.();
          }
        },
        {
          title: 'Copiar todos?',
          confirmText: 'Copiar',
          tag: 'warning',
        },
      );

      // Se o usuário cancelar o modal, ainda precisamos limpar o modo batch.
      // preventWarn não expõe onCancel — limpamos ao abrir destino via caller
      // após fechar; o caller passa onFinished só no confirm. Cancel: Escape no provider.
    },
    [
      applyBatchResults,
      enqueueSnackbar,
      preventWarn,
      resolveCatalogCopyAction,
    ],
  );

  return { onDropCatalogItem, onBatchCopyToDestination };
};

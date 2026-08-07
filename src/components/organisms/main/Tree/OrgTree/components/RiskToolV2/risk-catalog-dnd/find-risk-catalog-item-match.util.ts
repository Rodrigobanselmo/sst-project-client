import { normalizeInventoryItemName } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/normalizeInventoryItemName';

import {
  RISK_CATALOG_DND_KIND_LABEL,
  RISK_CATALOG_DND_KIND_LABEL_PLURAL,
  RiskCatalogBatchStats,
  RiskCatalogDndDragItem,
  RiskCatalogDndKind,
} from './risk-catalog-dnd.types';

export { normalizeInventoryItemName };

export function findCatalogItemByNormalizedName<T extends { id?: string | number }>(
  items: T[],
  name: string,
  getName: (item: T) => string | undefined | null,
): T | undefined {
  const target = normalizeInventoryItemName(name);
  if (!target) return undefined;

  return items.find((item) => {
    if (item?.id == null || item.id === '') return false;
    return normalizeInventoryItemName(getName(item)) === target;
  });
}

export function buildRiskCatalogMissingConfirmMessage(params: {
  kind: RiskCatalogDndKind;
  itemName: string;
  destinationRiskName: string;
}): string {
  const kindLabel = RISK_CATALOG_DND_KIND_LABEL[params.kind];
  return `Esta ${kindLabel} ainda não existe no cadastro do fator de risco:\n\n“${params.destinationRiskName}”\n\n“${params.itemName}”\n\nDeseja cadastrá-la e adicioná-la automaticamente?`;
}

export function buildRiskCatalogBatchConfirmMessage(params: {
  kind: RiskCatalogDndKind;
  count: number;
  destinationRiskName: string;
}): string {
  const plural = RISK_CATALOG_DND_KIND_LABEL_PLURAL[params.kind];
  return `Copiar ${params.count} ${plural} para:\n\n“${params.destinationRiskName}”\n\nContinuar?`;
}

export function buildRiskCatalogBatchSummaryMessage(
  stats: RiskCatalogBatchStats,
  destinationRiskName?: string,
): string {
  const plural = RISK_CATALOG_DND_KIND_LABEL_PLURAL[stats.kind];
  const lines: string[] = [];

  if (destinationRiskName?.trim()) {
    lines.push(`Destino:\n${destinationRiskName.trim()}`);
  }

  if (stats.added > 0) {
    lines.push(`${stats.added} ${plural} adicionadas.`);
  } else {
    lines.push(`Nenhuma ${RISK_CATALOG_DND_KIND_LABEL[stats.kind]} adicionada.`);
  }

  if (stats.added > 0 && stats.existedInCatalog === stats.added && stats.created === 0) {
    lines.push('Todas já existiam no catálogo.');
  } else {
    if (stats.existedInCatalog > 0) {
      lines.push(`${stats.existedInCatalog} já existiam no catálogo.`);
    }
    if (stats.created > 0) {
      if (stats.created === stats.added && stats.existedInCatalog === 0) {
        lines.push(
          `${stats.created} novos itens foram cadastrados no catálogo deste fator.`,
        );
      } else {
        lines.push(`${stats.created} foram cadastradas automaticamente.`);
      }
    }
  }

  if (stats.alreadyAttached > 0) {
    lines.push(
      `${stats.alreadyAttached} já estavam vinculadas neste fator.`,
    );
  }

  if (stats.epiMissing > 0) {
    lines.push(
      `${stats.epiMissing} EPI${stats.epiMissing > 1 ? 's' : ''} não ${
        stats.epiMissing > 1 ? 'puderam' : 'pôde'
      } ser incluído${stats.epiMissing > 1 ? 's' : ''} porque não existe${
        stats.epiMissing > 1 ? 'm' : ''
      } no cadastro global.`,
    );
  }

  if (stats.failed > 0) {
    lines.push(`${stats.failed} falharam ao processar.`);
  }

  return lines.join('\n');
}

export function isSameRiskCatalogDropForbidden(
  item: RiskCatalogDndDragItem,
  destinationRiskId?: string | null,
): boolean {
  if (!destinationRiskId) return true;
  return item.sourceRiskId === destinationRiskId;
}

export function dedupeRiskCatalogDragItems(
  items: RiskCatalogDndDragItem[],
): RiskCatalogDndDragItem[] {
  const seen = new Set<string>();
  const out: RiskCatalogDndDragItem[] = [];

  for (const item of items) {
    const key =
      item.kind === 'epi'
        ? `epi:${String(item.ca || item.catalogId || item.name)}`
        : `${item.kind}:${normalizeInventoryItemName(item.name)}`;
    if (!key || key.endsWith(':') || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

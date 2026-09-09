import type {
  InventoryGseSemanticEvidence,
  InventoryStructuralParentEvidence,
} from '@v2/services/security/inventory-pgr-import/service/inventory-pgr-import.types';
import { parentTypeLabel } from './inventory-parent-path';

export function gseOriginLabel(item: InventoryGseSemanticEvidence): string {
  return item.groupLabel || (item.groupCode ? `GHE ${item.groupCode}` : 'GHE');
}

export function formatOrganogramMatchLabel(
  type: string | null | undefined,
  name: string,
): string {
  return type ? `${parentTypeLabel(type)} > ${name}` : name;
}

export function promotedGseSuggestions(
  evidence: InventoryStructuralParentEvidence | undefined,
): InventoryGseSemanticEvidence[] {
  return (evidence?.gseEvidences || []).filter(
    (item) => item.promoted && item.suggestedName,
  );
}

export function unpromotedGseOrigins(
  evidence: InventoryStructuralParentEvidence | undefined,
): InventoryGseSemanticEvidence[] {
  return (evidence?.gseEvidences || []).filter(
    (item) => !item.promoted && item.rawName,
  );
}

export function formatGseSuggestionLine(item: InventoryGseSemanticEvidence): string {
  return `Sugestão a partir do ${gseOriginLabel(item)}: ${item.suggestedName}`;
}

export function formatOrganogramNoneLine(suggestedName: string): string {
  return `Sugestão a partir do GHE: ${suggestedName} — nenhuma correspondência única encontrada no organograma.`;
}

export function formatOrganogramFoundLine(
  type: string | null | undefined,
  name: string,
): string {
  return `Encontrado no organograma: ${formatOrganogramMatchLabel(type, name)}`;
}

export function formatProposeCreateLine(
  type: string | null | undefined,
  name: string,
): string {
  return `Ação proposta: Criar ${parentTypeLabel(type || 'SECTOR')} “${name}”`;
}

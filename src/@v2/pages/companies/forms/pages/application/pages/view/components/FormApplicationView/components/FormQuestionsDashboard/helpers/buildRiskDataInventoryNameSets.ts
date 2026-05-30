import type { IRiskData } from 'core/interfaces/api/IRiskData';
import { RecTypeEnum } from 'project/enum/recType.enum';
import { MedTypeEnum } from 'project/enum/medType.enum';

import { inventorySetHasItemName } from './matchesInventoryItemName';
import { normalizeInventoryItemName } from './normalizeInventoryItemName';

export type RiskDataInventoryNameSets = {
  fontesGeradoras: Set<string>;
  medidasEngenharia: Set<string>;
  medidasAdministrativas: Set<string>;
};

function getRecMedDisplayName(item: {
  recName?: string | null;
  medName?: string | null;
}): string {
  return item.medName?.trim() || item.recName?.trim() || '';
}

function isAdministrativeRecMed(item: {
  recType?: RecTypeEnum;
  medType?: MedTypeEnum;
}): boolean {
  return item.recType === RecTypeEnum.ADM || item.medType === MedTypeEnum.ADM;
}

function isEngineeringRecMed(item: {
  recType?: RecTypeEnum;
  medType?: MedTypeEnum;
}): boolean {
  return item.recType === RecTypeEnum.ENG || item.medType === MedTypeEnum.ENG;
}

function addNormalizedName(set: Set<string>, name: string | undefined | null) {
  const normalized = normalizeInventoryItemName(name);
  if (normalized) set.add(normalized);
}

function addRecMedNames(
  set: Set<string>,
  item: { recName?: string | null; medName?: string | null },
) {
  addNormalizedName(set, getRecMedDisplayName(item));
  addNormalizedName(set, item.recName);
  addNormalizedName(set, item.medName);
}

/**
 * Conjuntos de nomes do inventário real do setor alvo.
 *
 * Recomendações de IA (eng/admin) são aplicadas via `recAddOnly` na coluna
 * Recomendações. Medidas EPC/ENG (`engs`) e Outras Medidas (`adms`) são
 * colunas distintas — não devem manter "No inventário" após remoção da
 * recomendação correspondente.
 */
export function buildRiskDataInventoryNameSetsForRisk(
  riskDataList: IRiskData[] | undefined,
  riskId: string,
): RiskDataInventoryNameSets {
  const sets: RiskDataInventoryNameSets = {
    fontesGeradoras: new Set(),
    medidasEngenharia: new Set(),
    medidasAdministrativas: new Set(),
  };

  if (!riskDataList?.length) return sets;

  for (const riskData of riskDataList) {
    if (riskData.riskId !== riskId || riskData.endDate) continue;

    riskData.generateSources?.forEach((source) => {
      addNormalizedName(sets.fontesGeradoras, source.name);
    });

    riskData.recs?.forEach((item) => {
      if (isEngineeringRecMed(item)) {
        addRecMedNames(sets.medidasEngenharia, item);
      }
      if (isAdministrativeRecMed(item)) {
        addRecMedNames(sets.medidasAdministrativas, item);
      }
    });
  }

  return sets;
}

export function riskDataInventoryHasItemName(
  sets: RiskDataInventoryNameSets,
  itemType:
    | 'fontesGeradoras'
    | 'medidasEngenhariaRecomendadas'
    | 'medidasAdministrativasRecomendadas',
  itemName: string,
): boolean {
  return inventorySetHasItemName(
    getRiskDataInventoryNameSetForItemType(sets, itemType),
    itemName,
  );
}

export function getRiskDataInventoryNameSetForItemType(
  sets: RiskDataInventoryNameSets,
  itemType:
    | 'fontesGeradoras'
    | 'medidasEngenhariaRecomendadas'
    | 'medidasAdministrativasRecomendadas',
): Set<string> {
  switch (itemType) {
    case 'fontesGeradoras':
      return sets.fontesGeradoras;
    case 'medidasEngenhariaRecomendadas':
      return sets.medidasEngenharia;
    case 'medidasAdministrativasRecomendadas':
      return sets.medidasAdministrativas;
  }
}

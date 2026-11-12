import { browseHoMethods } from '@v2/services/occupational-hygiene/ho-method/service/ho-method.service';
import {
  HoMethodAgentTypeEnum,
  HoMethodAvailabilityStatusEnum,
  HoMethodRecord,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { queryExams } from 'core/services/hooks/queries/useQueryRisksCompany/useQueryRisksCompany';
import { RiskEnum } from 'project/enum/risk.enums';

export const riskLevels = [1, 2, 3, 4, 5] as const;
export type CampaignRiskLevel = (typeof riskLevels)[number];
export const defaultLevels: CampaignRiskLevel[] = [4, 5];

export type CampaignDraft = {
  id: string;
  name: string;
  levels: CampaignRiskLevel[];
  exposureIds: string[];
};

export async function loadChemicalFactors(
  companyId: string,
  workspaceId: string,
) {
  const take = 50;
  const factors = new Map<string, IRiskFactors>();
  let skip = 0;
  let count: number;
  do {
    const page = await queryExams({ take, skip }, { companyId, workspaceId });
    count = page.count;
    if (!page.data.length && skip < count) {
      throw new Error('A listagem de riscos retornou uma página incompleta.');
    }
    for (const factor of page.data) {
      if (factor.type === RiskEnum.QUI) factors.set(factor.id, factor);
    }
    skip += page.data.length;
  } while (skip < count);
  return [...factors.values()];
}

export async function loadMethodsByFactor() {
  const byFactor = new Map<string, HoMethodRecord[]>();
  let page = 1;
  let totalPages: number;
  do {
    const response = await browseHoMethods({
      page,
      limit: 50,
      status: HoMethodAvailabilityStatusEnum.ACTIVE,
    });
    totalPages = response.pagination.totalPages;
    for (const method of response.results) {
      if (method.agentType !== HoMethodAgentTypeEnum.CHEMICAL) continue;
      const factorIds = new Set(
        method.agents.map((agent) => agent.riskFactorId),
      );
      if (method.riskFactorId) factorIds.add(method.riskFactorId);
      for (const id of factorIds) {
        byFactor.set(id, [...(byFactor.get(id) ?? []), method]);
      }
    }
    page++;
  } while (page <= totalPages);
  return byFactor;
}

export function readDrafts(storageKey: string): CampaignDraft[] {
  const raw = localStorage.getItem(storageKey);
  return raw ? JSON.parse(raw) : [];
}

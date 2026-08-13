import type { DetailedRisk } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';
import type { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { MedTypeEnum } from 'project/enum/medType.enum';
import { RecTypeEnum } from 'project/enum/recType.enum';

export function buildGseAddRiskPayload(params: {
  gseId: string;
  companyId: string;
  workspaceId?: string;
  riskGroupId: string;
  risk: DetailedRisk;
}): IUpsertRiskData {
  return {
    riskFactorGroupDataId: params.riskGroupId,
    riskId: params.risk.id,
    homogeneousGroupId: params.gseId,
    companyId: params.companyId,
    workspaceId: params.workspaceId,
    probability: params.risk.probability,
    generateSourcesAddOnly: params.risk.generateSource
      ? [{ name: params.risk.generateSource, companyId: params.companyId }]
      : [],
    engsAddOnly: params.risk.existingEngineeringMeasures.map((rec) => ({
      medName: rec,
      medType: MedTypeEnum.ENG,
      companyId: params.companyId,
    })),
    admsAddOnly: params.risk.existingAdministrativeMeasures.map((adm) => ({
      medName: adm,
      medType: MedTypeEnum.ADM,
      companyId: params.companyId,
    })),
    recAddOnly: [
      ...params.risk.recommendedAdministrativeMeasures
        .map((adm) => adm?.trim())
        .filter((adm): adm is string => !!adm)
        .map((adm) => ({
          recName: adm,
          companyId: params.companyId,
          recType: RecTypeEnum.ADM,
        })),
      ...params.risk.recommendedEngineeringMeasures
        .map((rec) => rec?.trim())
        .filter((rec): rec is string => !!rec)
        .map((rec) => ({
          recName: rec,
          recType: RecTypeEnum.ENG,
          companyId: params.companyId,
        })),
    ],
  };
}

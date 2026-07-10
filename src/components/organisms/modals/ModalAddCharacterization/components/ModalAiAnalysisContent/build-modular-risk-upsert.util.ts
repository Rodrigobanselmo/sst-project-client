import {
  AiRiskFieldSuggestionField,
} from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { MedTypeEnum } from 'project/enum/medType.enum';
import { RecTypeEnum } from 'project/enum/recType.enum';

type BuildModularRiskUpsertParams = {
  field: AiRiskFieldSuggestionField;
  value: string | number;
  riskData: IRiskData;
  riskGroupId: string;
  companyId: string;
  workspaceId?: string;
  homogeneousGroupId: string;
};

export function buildModularRiskUpsert(
  params: BuildModularRiskUpsertParams,
): IUpsertRiskData | null {
  const base: IUpsertRiskData = {
    id: params.riskData.id,
    riskId: params.riskData.riskId,
    riskFactorGroupDataId: params.riskGroupId,
    homogeneousGroupId: params.homogeneousGroupId,
    companyId: params.companyId,
    workspaceId: params.workspaceId,
    keepEmpty: true,
  };

  switch (params.field) {
    case 'generateSource':
      return {
        ...base,
        generateSourcesAddOnly: [
          {
            name: String(params.value).trim(),
            companyId: params.companyId,
          },
        ],
      };
    case 'existingEngineeringMeasures':
      return {
        ...base,
        engsAddOnly: [
          {
            medName: String(params.value).trim(),
            medType: MedTypeEnum.ENG,
            companyId: params.companyId,
          },
        ],
      };
    case 'existingAdministrativeMeasures':
      return {
        ...base,
        admsAddOnly: [
          {
            medName: String(params.value).trim(),
            medType: MedTypeEnum.ADM,
            companyId: params.companyId,
          },
        ],
      };
    case 'recommendedEngineeringMeasures':
      return {
        ...base,
        recAddOnly: [
          {
            recName: String(params.value).trim(),
            recType: RecTypeEnum.ENG,
            companyId: params.companyId,
          },
        ],
      };
    case 'recommendedAdministrativeMeasures':
      return {
        ...base,
        recAddOnly: [
          {
            recName: String(params.value).trim(),
            recType: RecTypeEnum.ADM,
            companyId: params.companyId,
          },
        ],
      };
    case 'probability': {
      const probability = Number(params.value);
      if (!Number.isFinite(probability) || probability < 1 || probability > 5) {
        return null;
      }
      return {
        ...base,
        probability,
      };
    }
    case 'observation':
    default:
      return null;
  }
}

import { ViewsDataEnum as V1ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';
import { ViewTypeEnum as V1ViewTypeEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-risk-type.constant';

const BY_RISK_V2_VIEW_DATA: string[] = [
  V1ViewsDataEnum.GSE,
  V1ViewsDataEnum.ENVIRONMENT,
  V1ViewsDataEnum.CHARACTERIZATION,
];

/**
 * A visualização por risco V2 só substitui a V1 quando a abertura foi marcada
 * (Caracterização > Riscos > Editar risco) e o modo é "Por risco" de GSE,
 * ambiente ou caracterização. Simples, Avançado e hierarquia continuam na V1.
 * Valores da V1 (`state.riskAdd`), que diferem dos enums da V2.
 */
export function shouldUseRiskToolV2ByRiskView(params: {
  byRiskV2?: boolean;
  viewType?: string | null;
  viewData?: string | null;
}): boolean {
  if (!params.byRiskV2) return false;
  if (params.viewType !== V1ViewTypeEnum.SIMPLE_BY_RISK) return false;
  return !!params.viewData && BY_RISK_V2_VIEW_DATA.includes(params.viewData);
}

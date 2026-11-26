import { Box } from '@mui/material';
import { AnalysisItemsSection } from './AnalysisDisclosure';
import { CatalogAnalysisItemButton } from './CatalogAnalysisItemButton';
import { FormAiAnalysisStatusEnum, IFormQuestionsAnswersAnalysisBrowseResultModel } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';

export function ManualRiskContentSections({ companyId, applicationId, hierarchyId, riskId, riskName }: { companyId: string; applicationId: string; hierarchyId: string; riskId: string; riskName: string }) {
  const analysis: IFormQuestionsAnswersAnalysisBrowseResultModel = {
    id: 'manual', companyId, formApplicationId: applicationId, hierarchyId, riskId,
    status: FormAiAnalysisStatusEnum.DONE, createdAt: new Date(), updatedAt: new Date(),
    analysis: { frps: riskName, fontesGeradoras: [], medidasEngenhariaRecomendadas: [], medidasAdministrativasRecomendadas: [] },
  };
  return <Box sx={{ ml: { xs: '16px', sm: '24px' } }}>
    <AnalysisItemsSection title="Fontes Geradoras" action={<CatalogAnalysisItemButton companyId={companyId} analysis={analysis} itemType="fontesGeradoras" />}>{null}</AnalysisItemsSection>
    <AnalysisItemsSection title="Recomendações (Medidas Administrativas)" action={<CatalogAnalysisItemButton companyId={companyId} analysis={analysis} itemType="medidasAdministrativasRecomendadas" />}>{null}</AnalysisItemsSection>
  </Box>;
}

import { Alert, CircularProgress } from '@mui/material';
import { useQueryGho } from 'core/services/hooks/queries/useQueryGho/useQueryGho';
import { useQueryCharacterization } from 'core/services/hooks/queries/useQueryCharacterization';
import { GhoAiAnalysisContent } from 'components/organisms/modals/ModalAddGHO/components/GhoAiAnalysisContent';
import { initialAddGhoState } from 'components/organisms/modals/ModalAddGHO/hooks/useAddGho';
import { ModalAiAnalysisContent } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/ModalAiAnalysisContent';
import { initialCharacterizationState } from 'components/organisms/modals/ModalAddCharacterization/hooks/useEditCharacterization';
import type { CharacterizationAiRiskAnalysisState } from 'components/organisms/modals/ModalAddCharacterization/hooks/useCharacterizationAiRiskAnalysisState';
import type { RiskLinkageAiContext } from './risk-linkage-ai-context.util';

export function LinkageGeneralAnalysis({
  context,
  analysis,
  onClose,
}: {
  context: RiskLinkageAiContext;
  analysis: CharacterizationAiRiskAnalysisState;
  onClose: () => void;
}) {
  return context.kind === 'gse' ? (
    <GseGeneral context={context} analysis={analysis} onClose={onClose} />
  ) : (
    <CharacterizationGeneral
      context={context}
      analysis={analysis}
      onClose={onClose}
    />
  );
}
type Props = Parameters<typeof LinkageGeneralAnalysis>[0];
function GseGeneral({ context, analysis, onClose }: Props) {
  const detail = useQueryGho(context.entityId);
  if (detail.isLoading) return <CircularProgress size={24} />;
  const entity = detail.data;
  if (
    detail.isError ||
    entity.id !== context.entityId ||
    entity.companyId !== context.companyId ||
    !entity.workspaceIds?.includes(context.workspaceId)
  )
    return (
      <Alert severity="info">
        Não foi possível validar o GSE neste estabelecimento.
      </Alert>
    );
  return (
    <GhoAiAnalysisContent
      companyId={context.companyId}
      ghoData={{
        ...initialAddGhoState,
        id: entity.id,
        companyId: context.companyId,
        name: entity.name,
        description: entity.description || '',
        workspaceIds: [context.workspaceId],
      }}
      ghoQuery={entity}
      aiRiskAnalysis={analysis}
      workspaceId={context.workspaceId}
      presentation="risksTabDialog"
      onCloseDialog={onClose}
    />
  );
}
function CharacterizationGeneral({ context, analysis, onClose }: Props) {
  const detail = useQueryCharacterization(context.entityId, {
    companyId: context.companyId,
    workspaceId: context.workspaceId,
  });
  if (detail.isLoading) return <CircularProgress size={24} />;
  const entity = detail.data;
  if (
    detail.isError ||
    entity.id !== context.entityId ||
    entity.companyId !== context.companyId ||
    entity.workspaceId !== context.workspaceId ||
    entity.deleted_at
  )
    return (
      <Alert severity="info">
        Não foi possível validar a caracterização neste estabelecimento.
      </Alert>
    );
  return (
    <ModalAiAnalysisContent
      data={{
        ...initialCharacterizationState,
        id: entity.id,
        name: entity.name,
        companyId: context.companyId,
        workspaceId: context.workspaceId,
        photos: entity.photos || [],
      }}
      hasUnsavedChanges={false}
      aiRiskAnalysis={analysis}
      onCloseDialog={onClose}
    />
  );
}

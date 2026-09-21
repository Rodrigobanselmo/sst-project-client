import { FC, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { SAuthShow, useAuthShow } from 'components/molecules/SAuthShow';
import { PermissionEnum } from 'project/enum/permission.enum';

import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { useFetchBrowseRiskMatrices } from '@v2/services/security/risk-matrix/hooks/useFetchBrowseRiskMatrices';
import {
  useMutateCreateRiskMatrix,
  useMutateDeleteRiskMatrixDraft,
  useMutateDuplicateRiskMatrix,
} from '@v2/services/security/risk-matrix/hooks/useMutateRiskMatrix';
import {
  CompanyRiskMatrixStatusEnum,
  type CreateRiskMatrixPayload,
  type RiskMatrixBrowseItem,
  type RiskMatrixCoverageKeyEnum,
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';
import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';

import {
  RISK_MATRIX_COVERAGE_LABELS,
  RISK_MATRIX_COVERAGE_TITLES,
  RISK_MATRIX_DELETE_DRAFT_ACTION,
  RISK_MATRIX_DELETE_DRAFT_KEEP_PUBLISHED_CONFIRMATION,
  RISK_MATRIX_DELETE_DRAFT_ONLY_CONFIRMATION,
  RISK_MATRIX_DUPLICATE_CONFIRMATION,
  RISK_MATRIX_MANAGE_AVAILABILITY_ACTION,
  RISK_MATRIX_STATUS_LABELS,
} from '../maps/risk-matrix.maps';
import {
  mapBrowseRiskMatrices,
  canDeleteCatalogDraft,
  canDuplicateRiskMatrix,
  canOpenWorkspaceAvailability,
  catalogEstablishmentAvailabilityLabel,
  deleteCatalogDraftRemovesIdentity,
} from '../utils/risk-matrix-catalog.util';
import { getRiskMatrixApiErrorMessage } from '../utils/risk-matrix-error.util';
import { canWriteRiskMatrix } from '../utils/risk-matrix-permission.util';
import {
  getRiskMatrixVersionEditorPath,
  resolveCreatedRiskMatrixEditorPath,
} from '../utils/risk-matrix-paths.util';
import { RiskMatrixCreateDialog } from './RiskMatrixCreateDialog';
import { RiskMatrixWorkspaceAvailabilityDialog } from './RiskMatrixWorkspaceAvailabilityDialog';

type RiskMatricesPageContentProps = {
  companyId: string;
};

export const RiskMatricesPageContent: FC<RiskMatricesPageContentProps> = ({
  companyId,
}) => {
  const router = useRouter();
  const { isAuthSuccess } = useAuthShow();
  const { showSnackBar } = useSystemSnackbar();
  const { showConfirmation } = useConfirmationModal();
  const [createOpen, setCreateOpen] = useState(false);
  const [availabilityMatrix, setAvailabilityMatrix] =
    useState<RiskMatrixBrowseItem | null>(null);
  const canCreate = canWriteRiskMatrix({ isAuthSuccess });

  const { data, isLoading, isError, error } =
    useFetchBrowseRiskMatrices(companyId);
  const createMutation = useMutateCreateRiskMatrix(companyId);
  const duplicateMutation = useMutateDuplicateRiskMatrix(companyId);
  const deleteDraftMutation = useMutateDeleteRiskMatrixDraft(companyId);

  const matrices = mapBrowseRiskMatrices(data);
  const listedCountLabel = isLoading
    ? ' (carregando…)'
    : isError
      ? ' (erro ao carregar)'
      : ` (${matrices.length})`;

  const handleOpenDraft = (matrix: RiskMatrixBrowseItem) => {
    if (!matrix.draftVersion?.id) return;
    void router.push(
      getRiskMatrixVersionEditorPath(
        companyId,
        matrix.id,
        matrix.draftVersion.id,
      ),
    );
  };

  const handleCreate = async (payload: CreateRiskMatrixPayload) => {
    const created = await createMutation.mutateAsync(payload);
    const editorPath = resolveCreatedRiskMatrixEditorPath(companyId, created);

    if (!editorPath) {
      showSnackBar(
        'A matriz foi criada, mas o rascunho inicial não foi retornado.',
        { type: 'error' },
      );
      return;
    }

    setCreateOpen(false);
    await router.push(editorPath);
  };

  const handleDuplicate = async (matrix: RiskMatrixBrowseItem) => {
    const confirmed = await showConfirmation({
      title: RISK_MATRIX_DUPLICATE_CONFIRMATION.title,
      message: RISK_MATRIX_DUPLICATE_CONFIRMATION.message,
      confirmText: RISK_MATRIX_DUPLICATE_CONFIRMATION.confirmText,
      cancelText: RISK_MATRIX_DUPLICATE_CONFIRMATION.cancelText,
    });
    if (!confirmed) return;

    try {
      const created = await duplicateMutation.mutateAsync(matrix.id);
      const editorPath = resolveCreatedRiskMatrixEditorPath(companyId, created);

      if (!editorPath) {
        showSnackBar(
          'A matriz foi duplicada, mas o rascunho inicial não foi retornado.',
          { type: 'error' },
        );
        return;
      }

      await router.push(editorPath);
    } catch (duplicateError) {
      showSnackBar(
        getRiskMatrixApiErrorMessage(
          duplicateError,
          'Não foi possível duplicar a matriz.',
        ),
        { type: 'error' },
      );
    }
  };

  const handleDeleteDraft = async (matrix: RiskMatrixBrowseItem) => {
    if (!matrix.draftVersion?.id) return;

    const confirmation = deleteCatalogDraftRemovesIdentity(matrix)
      ? RISK_MATRIX_DELETE_DRAFT_ONLY_CONFIRMATION
      : RISK_MATRIX_DELETE_DRAFT_KEEP_PUBLISHED_CONFIRMATION;
    const confirmed = await showConfirmation({
      title: confirmation.title,
      message: confirmation.message,
      confirmText: confirmation.confirmText,
      cancelText: confirmation.cancelText,
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await deleteDraftMutation.mutateAsync({
        matrixId: matrix.id,
        versionId: matrix.draftVersion.id,
      });
    } catch (deleteError) {
      showSnackBar(
        getRiskMatrixApiErrorMessage(
          deleteError,
          'Não foi possível excluir o rascunho.',
        ),
        { type: 'error' },
      );
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box>
        <Typography variant="h5" gutterBottom>
          Matrizes de Risco
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cadastro técnico de matrizes customizadas da empresa. Disponibilizar
          uma matriz não altera avaliações já realizadas.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="subtitle1">
            Matrizes cadastradas{listedCountLabel}
          </Typography>
          <SAuthShow permissions={[PermissionEnum.RISK]} cruds="c">
            <Button
              variant="contained"
              onClick={() => setCreateOpen(true)}
              disabled={!canCreate}
            >
              Criar matriz
            </Button>
          </SAuthShow>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        {isLoading && (
          <Box display="flex" alignItems="center" gap={2} py={2}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Carregando matrizes de risco…
            </Typography>
          </Box>
        )}

        {isError && (
          <Alert severity="error">
            {getRiskMatrixApiErrorMessage(
              error,
              'Não foi possível carregar as matrizes de risco.',
            )}
          </Alert>
        )}

        {!isLoading && !isError && matrices.length === 0 && (
          <Alert severity="warning">
            Nenhuma matriz de risco cadastrada. Clique em &quot;Criar
            matriz&quot; para cadastrar a primeira.
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={2}>
          {matrices.map((matrix) => (
            <RiskMatrixCatalogCard
              key={matrix.id}
              matrix={matrix}
              canWrite={canCreate}
              duplicating={duplicateMutation.isPending}
              deletingDraft={deleteDraftMutation.isPending}
              onOpenDraft={() => handleOpenDraft(matrix)}
              onOpenAvailability={() => setAvailabilityMatrix(matrix)}
              onDuplicate={() => handleDuplicate(matrix)}
              onDeleteDraft={() => handleDeleteDraft(matrix)}
            />
          ))}
        </Box>
      </Paper>

      <RiskMatrixCreateDialog
        open={createOpen}
        loading={createMutation.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
      <RiskMatrixWorkspaceAvailabilityDialog
        open={Boolean(availabilityMatrix)}
        companyId={companyId}
        matrixId={availabilityMatrix?.id ?? null}
        matrixName={availabilityMatrix?.name}
        canWrite={canCreate}
        onClose={() => setAvailabilityMatrix(null)}
      />
    </Box>
  );
};

const RiskMatrixCatalogCard: FC<{
  matrix: RiskMatrixBrowseItem;
  canWrite: boolean;
  duplicating: boolean;
  deletingDraft: boolean;
  onOpenDraft: () => void;
  onOpenAvailability: () => void;
  onDuplicate: () => void;
  onDeleteDraft: () => void;
}> = ({
  matrix,
  canWrite,
  duplicating,
  deletingDraft,
  onOpenDraft,
  onOpenAvailability,
  onDuplicate,
  onDeleteDraft,
}) => {
  const published = matrix.latestPublishedVersion;
  const coverages = published?.coverages ?? [];
  const showAvailabilityAction = canOpenWorkspaceAvailability(matrix);
  const showDuplicateAction = canWrite && canDuplicateRiskMatrix(matrix);
  const showDeleteDraftAction = canWrite && canDeleteCatalogDraft(matrix);
  const establishmentLabel = catalogEstablishmentAvailabilityLabel(matrix);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        gap={2}
        flexWrap="wrap"
      >
        <Box flex={1} minWidth={280}>
          <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
            <Chip
              size="small"
              label={RISK_MATRIX_STATUS_LABELS[matrix.status]}
              color={
                matrix.status === CompanyRiskMatrixStatusEnum.ACTIVE
                  ? 'success'
                  : 'default'
              }
            />
            {matrix.draftVersion && (
              <Chip
                size="small"
                color="warning"
                label={`DRAFT v${matrix.draftVersion.versionNumber}`}
              />
            )}
            {published && (
              <Chip
                size="small"
                variant="outlined"
                label={`Publicada v${published.versionNumber}`}
              />
            )}
          </Box>
          <Typography variant="subtitle1">{matrix.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {matrix.description?.trim() || 'Sem descrição'}
          </Typography>
          {published ? (
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              Última versão publicada: v{published.versionNumber}
              {published.publishedAt
                ? ` · ${new Date(published.publishedAt).toLocaleDateString('pt-BR')}`
                : ''}
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              Sem versão publicada
            </Typography>
          )}
          {establishmentLabel && (
            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
              {establishmentLabel}
            </Typography>
          )}
          {coverages.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
              {coverages.map((coverage) => (
                <CoverageChip key={coverage} coverage={coverage} />
              ))}
            </Box>
          )}
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          {showAvailabilityAction && (
            <Button
              size="small"
              variant="contained"
              onClick={onOpenAvailability}
            >
              {RISK_MATRIX_MANAGE_AVAILABILITY_ACTION}
            </Button>
          )}
          {showDuplicateAction && (
            <SAuthShow permissions={[PermissionEnum.RISK]} cruds="c">
              <Button
                size="small"
                variant="outlined"
                onClick={onDuplicate}
                disabled={duplicating}
              >
                Duplicar
              </Button>
            </SAuthShow>
          )}
          {matrix.draftVersion && (
            <Button size="small" variant="outlined" onClick={onOpenDraft}>
              Editar rascunho
            </Button>
          )}
          {showDeleteDraftAction && (
            <SAuthShow permissions={[PermissionEnum.RISK]} cruds="c">
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={onDeleteDraft}
                disabled={deletingDraft}
              >
                {RISK_MATRIX_DELETE_DRAFT_ACTION}
              </Button>
            </SAuthShow>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

const CoverageChip: FC<{ coverage: RiskMatrixCoverageKeyEnum }> = ({
  coverage,
}) => {
  return (
    <Chip
      size="small"
      variant="outlined"
      label={RISK_MATRIX_COVERAGE_LABELS[coverage] ?? coverage}
      title={RISK_MATRIX_COVERAGE_TITLES[coverage] ?? coverage}
    />
  );
};

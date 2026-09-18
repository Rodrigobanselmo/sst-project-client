import { FC, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { PermissionEnum } from 'project/enum/permission.enum';

import { useFetchMatrixWorkspaceAvailability } from '@v2/services/security/risk-matrix/hooks/useFetchMatrixWorkspaceAvailability';
import {
  useMutateDisableWorkspaceRiskMatrix,
  useMutateEnableWorkspaceRiskMatrix,
  useMutateSwitchWorkspaceRiskMatrix,
} from '@v2/services/security/risk-matrix/hooks/useMutateRiskMatrix';
import {
  CompanyRiskMatrixStatusEnum,
  type MatrixWorkspaceAvailabilityWorkspace,
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import {
  RISK_MATRIX_AVAILABILITY_DISCLAIMER,
  RISK_MATRIX_COVERAGE_LABELS,
  RISK_MATRIX_SIMPLESST_ALWAYS_AVAILABLE,
} from '../maps/risk-matrix.maps';
import { describeWorkspaceAvailability } from '../utils/risk-matrix-availability.util';
import {
  formatRiskMatrixBindingConflicts,
  getRiskMatrixApiErrorMessage,
  getRiskMatrixAvailabilityConflictMessage,
} from '../utils/risk-matrix-error.util';

type RiskMatrixWorkspaceAvailabilityDialogProps = {
  open: boolean;
  companyId: string;
  matrixId: string | null;
  matrixName?: string;
  canWrite: boolean;
  onClose: () => void;
};

export const RiskMatrixWorkspaceAvailabilityDialog: FC<
  RiskMatrixWorkspaceAvailabilityDialogProps
> = ({ open, companyId, matrixId, matrixName, canWrite, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [pendingWorkspaceId, setPendingWorkspaceId] = useState<string | null>(
    null,
  );

  const availabilityQuery = useFetchMatrixWorkspaceAvailability(
    companyId,
    matrixId,
    open,
  );
  const enableMutation = useMutateEnableWorkspaceRiskMatrix(companyId);
  const disableMutation = useMutateDisableWorkspaceRiskMatrix(companyId);
  const switchMutation = useMutateSwitchWorkspaceRiskMatrix(companyId);

  const availability = availabilityQuery.data;
  const target = availability?.targetPublishedVersion;
  const pending = Boolean(pendingWorkspaceId);

  const handleClose = () => {
    if (pending) return;
    setError(null);
    onClose();
  };

  const runWorkspaceAction = async (
    workspaceId: string,
    action: () => Promise<unknown>,
    conflictFallback: boolean,
  ) => {
    setError(null);
    setPendingWorkspaceId(workspaceId);
    try {
      await action();
      await availabilityQuery.refetch();
    } catch (actionError) {
      setError(
        conflictFallback
          ? getRiskMatrixAvailabilityConflictMessage(actionError)
          : getRiskMatrixApiErrorMessage(
              actionError,
              'Não foi possível alterar a disponibilidade neste estabelecimento.',
            ),
      );
      await availabilityQuery.refetch();
    } finally {
      setPendingWorkspaceId(null);
    }
  };

  const handleEnable = (workspace: MatrixWorkspaceAvailabilityWorkspace) => {
    if (!workspace.targetVersionId) return;
    void runWorkspaceAction(
      workspace.workspaceId,
      () =>
        enableMutation.mutateAsync({
          workspaceId: workspace.workspaceId,
          versionId: workspace.targetVersionId as string,
        }),
      true,
    );
  };

  const handleDisable = (workspace: MatrixWorkspaceAvailabilityWorkspace) => {
    if (!workspace.enabledVersionId) return;
    void runWorkspaceAction(
      workspace.workspaceId,
      () =>
        disableMutation.mutateAsync({
          workspaceId: workspace.workspaceId,
          versionId: workspace.enabledVersionId as string,
        }),
      false,
    );
  };

  const handleSwitch = (workspace: MatrixWorkspaceAvailabilityWorkspace) => {
    if (!workspace.enabledVersionId || !workspace.targetVersionId) return;
    void runWorkspaceAction(
      workspace.workspaceId,
      () =>
        switchMutation.mutateAsync({
          workspaceId: workspace.workspaceId,
          payload: {
            sourceVersionId: workspace.enabledVersionId as string,
            targetVersionId: workspace.targetVersionId as string,
          },
        }),
      true,
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        Disponível em estabelecimentos
        <Typography variant="body2" color="text.secondary">
          {availability?.matrixName || matrixName || 'Matriz de risco'}
          {target ? ` · versão publicada v${target.versionNumber}` : ''}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert severity="info">{RISK_MATRIX_AVAILABILITY_DISCLAIMER}</Alert>
        <Alert severity="info">{RISK_MATRIX_SIMPLESST_ALWAYS_AVAILABLE}</Alert>

        {error && <Alert severity="error">{error}</Alert>}

        {availabilityQuery.isLoading && (
          <Box display="flex" alignItems="center" gap={2} py={1}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Carregando estabelecimentos…
            </Typography>
          </Box>
        )}

        {availabilityQuery.isError && (
          <Alert severity="error">
            {getRiskMatrixApiErrorMessage(
              availabilityQuery.error,
              'Não foi possível carregar a disponibilidade nos estabelecimentos.',
            )}
          </Alert>
        )}

        {availability && !availability.enableable && (
          <Alert severity="warning">
            {availability.matrixStatus === CompanyRiskMatrixStatusEnum.ARCHIVED
              ? 'Esta identidade está arquivada e não pode ser disponibilizada.'
              : 'Não há versão publicada para disponibilizar.'}
          </Alert>
        )}

        {target && target.coverages.length > 0 && (
          <Box display="flex" flexWrap="wrap" gap={0.5}>
            {target.coverages.map((coverage) => (
              <Chip
                key={coverage}
                size="small"
                variant="outlined"
                label={RISK_MATRIX_COVERAGE_LABELS[coverage] ?? coverage}
              />
            ))}
          </Box>
        )}

        {availability && availability.workspaces.length === 0 && (
          <Alert severity="warning">
            Nenhum estabelecimento válido encontrado para esta empresa.
          </Alert>
        )}

        {availability?.workspaces.map((workspace) => (
          <WorkspaceAvailabilityRow
            key={workspace.workspaceId}
            workspace={workspace}
            targetVersionNumber={target?.versionNumber ?? null}
            canWrite={canWrite}
            pending={pendingWorkspaceId === workspace.workspaceId}
            disabled={pending}
            onEnable={() => handleEnable(workspace)}
            onDisable={() => handleDisable(workspace)}
            onSwitch={() => handleSwitch(workspace)}
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={pending}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const WorkspaceAvailabilityRow: FC<{
  workspace: MatrixWorkspaceAvailabilityWorkspace;
  targetVersionNumber: number | null;
  canWrite: boolean;
  pending: boolean;
  disabled: boolean;
  onEnable: () => void;
  onDisable: () => void;
  onSwitch: () => void;
}> = ({
  workspace,
  targetVersionNumber,
  canWrite,
  pending,
  disabled,
  onEnable,
  onDisable,
  onSwitch,
}) => {
  const conflictText = formatRiskMatrixBindingConflicts(workspace.conflicts);

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 1.5,
        display: 'flex',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      }}
    >
      <Box flex={1} minWidth={240}>
        <Typography variant="subtitle2">{workspace.workspaceName}</Typography>
        <Typography variant="body2" color="text.secondary">
          {describeWorkspaceAvailability(workspace)}
        </Typography>
        {conflictText && (
          <Typography variant="caption" color="error" display="block" mt={0.5}>
            {conflictText}
          </Typography>
        )}
      </Box>
      <SAuthShow permissions={[PermissionEnum.RISK]} cruds="c">
        <Box display="flex" gap={1} flexWrap="wrap">
          {workspace.canEnable && (
            <Button
              size="small"
              variant="contained"
              disabled={!canWrite || disabled}
              onClick={onEnable}
            >
              {pending ? 'Disponibilizando…' : 'Disponibilizar'}
            </Button>
          )}
          {workspace.canSwitch && (
            <Button
              size="small"
              variant="contained"
              disabled={!canWrite || disabled}
              onClick={onSwitch}
            >
              {pending
                ? 'Atualizando…'
                : `Atualizar para v${targetVersionNumber ?? ''}`}
            </Button>
          )}
          {workspace.canDisable && (
            <Button
              size="small"
              color="inherit"
              variant="outlined"
              disabled={!canWrite || disabled}
              onClick={onDisable}
            >
              {pending ? 'Desabilitando…' : 'Desabilitar'}
            </Button>
          )}
        </Box>
      </SAuthShow>
    </Box>
  );
};


import { useState } from 'react';

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
  Divider,
  Drawer,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useQueryClient } from '@tanstack/react-query';
import { FrpsConceptualContent } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormRisksAnalysis/frps-explainability/FrpsExplainabilityContent';
import { useMutateValidateConceptualExplanation } from '@v2/services/forms/form-questions-answers-analysis/frps-explainability/hooks';
import {
  frpsExplainabilityLibraryQueryKeys,
  useFetchFrpsConceptualExplanationById,
  type FrpsLibraryItemType,
} from '@v2/services/forms/frps-explainability-library';

import { getFrpsLibraryStatusLabel } from '../frps-explainability-library-filters.util';
import {
  FRPS_VALIDATE_CONCEPTUAL_BUTTON_LABEL,
  FRPS_VALIDATE_CONCEPTUAL_CONFIRM_BODY,
  FRPS_VALIDATE_CONCEPTUAL_CONFIRM_TITLE,
  FRPS_VALIDATE_CONCEPTUAL_SUCCESS_MESSAGE,
} from '../frps-explainability-library-ux.constants';
import {
  canShowFrpsLibraryConceptualValidateAction,
  formatFrpsValidatedAtLabel,
} from '../frps-library-conceptual-validate.util';

export type FrpsLibraryViewTarget = {
  explanationId: string;
  itemName: string;
  itemType: FrpsLibraryItemType;
  /** Pré-filtro da linha; a API/status do drawer confirmam. */
  canValidateConceptual: boolean;
};

function validationStatusColor(
  status: string,
): 'default' | 'warning' | 'success' | 'error' {
  switch (status) {
    case 'VALIDATED':
      return 'success';
    case 'DRAFT_AI':
      return 'warning';
    case 'REJECTED':
      return 'error';
    default:
      return 'default';
  }
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const maybeAxios = error as {
      response?: { data?: { message?: string | string[] } };
      message?: string;
    };
    const apiMessage = maybeAxios.response?.data?.message;
    if (Array.isArray(apiMessage) && apiMessage[0]) return String(apiMessage[0]);
    if (typeof apiMessage === 'string' && apiMessage) return apiMessage;
    if (typeof maybeAxios.message === 'string' && maybeAxios.message) {
      return maybeAxios.message;
    }
  }
  return 'Erro inesperado ao validar.';
}

export function FrpsLibraryConceptualViewDrawer({
  open,
  target,
  onClose,
  onValidated,
}: {
  open: boolean;
  target: FrpsLibraryViewTarget | null;
  onClose: () => void;
  onValidated?: () => void;
}) {
  const queryClient = useQueryClient();
  const validateMutation = useMutateValidateConceptualExplanation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [validateError, setValidateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } =
    useFetchFrpsConceptualExplanationById(
      open ? target?.explanationId ?? null : null,
      open && Boolean(target?.explanationId),
    );

  const status = data?.validationStatus;
  const statusLabel =
    status === 'DRAFT_AI' ||
    status === 'VALIDATED' ||
    status === 'REJECTED'
      ? getFrpsLibraryStatusLabel(status)
      : status || null;

  const showValidateButton =
    Boolean(target?.canValidateConceptual) &&
    canShowFrpsLibraryConceptualValidateAction({
      isMaster: true,
      origin: 'GLOBAL',
      isAliasRow: false,
      conceptualExplanationId: data?.id ?? target?.explanationId,
      validationStatus: status,
    });

  const validatedAtLabel = formatFrpsValidatedAtLabel(data?.validatedAt);
  const validatorName = data?.validatedByUser?.name?.trim() || null;
  const isValidating = validateMutation.isPending;

  const handleClose = () => {
    if (isValidating) return;
    setConfirmOpen(false);
    setValidateError(null);
    setSuccessMessage(null);
    onClose();
  };

  const handleConfirmValidate = async () => {
    if (!target?.explanationId || isValidating) return;
    setValidateError(null);

    try {
      await validateMutation.mutateAsync(target.explanationId);
      await queryClient.invalidateQueries({
        queryKey: frpsExplainabilityLibraryQueryKeys.all,
      });
      await queryClient.invalidateQueries({
        queryKey: frpsExplainabilityLibraryQueryKeys.conceptualById(
          target.explanationId,
        ),
      });
      await refetch();
      setConfirmOpen(false);
      setSuccessMessage(FRPS_VALIDATE_CONCEPTUAL_SUCCESS_MESSAGE);
      onValidated?.();
    } catch (err) {
      setValidateError(getErrorMessage(err));
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480, md: 560 }, p: 0 } }}
      >
        <Box
          display="flex"
          alignItems="flex-start"
          justifyContent="space-between"
          gap={1}
          px={2.5}
          py={2}
        >
          <Box minWidth={0}>
            <Typography variant="overline" color="text.secondary">
              Conhecimento conceitual
            </Typography>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ wordBreak: 'break-word' }}
            >
              {target?.itemName || 'Item'}
            </Typography>
            {statusLabel ? (
              <Chip
                size="small"
                label={statusLabel}
                color={validationStatusColor(status || '')}
                sx={{ mt: 1 }}
              />
            ) : null}
            {status === 'VALIDATED' ? (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={1}
              >
                {validatorName ? `Validado por ${validatorName}` : 'Validado'}
                {validatedAtLabel ? ` · ${validatedAtLabel}` : ''}
              </Typography>
            ) : null}
          </Box>
          <IconButton
            aria-label="Fechar"
            onClick={handleClose}
            size="small"
            disabled={isValidating}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        <Box px={2.5} py={2.5} sx={{ overflowY: 'auto', flex: 1 }}>
          {successMessage ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          ) : null}

          {validateError ? (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setValidateError(null)}
            >
              {validateError}
            </Alert>
          ) : null}

          {showValidateButton ? (
            <Box mb={2}>
              <Button
                variant="contained"
                onClick={() => {
                  setValidateError(null);
                  setConfirmOpen(true);
                }}
                disabled={isValidating}
              >
                {FRPS_VALIDATE_CONCEPTUAL_BUTTON_LABEL}
              </Button>
            </Box>
          ) : null}

          {isLoading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress size={28} />
            </Box>
          ) : null}

          {isError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              }
            >
              Não foi possível carregar o conteúdo conceitual.
              {error instanceof Error && error.message
                ? ` ${error.message}`
                : ''}
            </Alert>
          ) : null}

          {!isLoading && !isError && data ? (
            <FrpsConceptualContent
              itemType={data.itemType}
              content={data.content}
            />
          ) : null}
        </Box>
      </Drawer>

      <Dialog
        open={confirmOpen}
        onClose={() => {
          if (!isValidating) setConfirmOpen(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{FRPS_VALIDATE_CONCEPTUAL_CONFIRM_TITLE}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {FRPS_VALIDATE_CONCEPTUAL_CONFIRM_BODY}
          </Typography>
          {validateError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {validateError}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            disabled={isValidating}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleConfirmValidate()}
            disabled={isValidating}
            startIcon={
              isValidating ? (
                <CircularProgress size={14} color="inherit" />
              ) : undefined
            }
          >
            {isValidating ? 'Validando…' : FRPS_VALIDATE_CONCEPTUAL_BUTTON_LABEL}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

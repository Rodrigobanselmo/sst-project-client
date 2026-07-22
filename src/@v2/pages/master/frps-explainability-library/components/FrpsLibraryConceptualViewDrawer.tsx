import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FrpsConceptualContent } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormRisksAnalysis/frps-explainability/FrpsExplainabilityContent';
import { useFetchFrpsConceptualExplanationById } from '@v2/services/forms/frps-explainability-library';
import type { FrpsLibraryItemType } from '@v2/services/forms/frps-explainability-library';

import { getFrpsLibraryStatusLabel } from '../frps-explainability-library-filters.util';

export type FrpsLibraryViewTarget = {
  explanationId: string;
  itemName: string;
  itemType: FrpsLibraryItemType;
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

export function FrpsLibraryConceptualViewDrawer({
  open,
  target,
  onClose,
}: {
  open: boolean;
  target: FrpsLibraryViewTarget | null;
  onClose: () => void;
}) {
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

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
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
          <Typography variant="h6" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
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
        </Box>
        <IconButton aria-label="Fechar" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <Box px={2.5} py={2.5} sx={{ overflowY: 'auto', flex: 1 }}>
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
  );
}

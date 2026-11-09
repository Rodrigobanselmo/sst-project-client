import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  Alert,
  Box,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { InventoryPgrImportPanel } from '@v2/pages/companies/exposure-group-assistant/components/InventoryPgrImportPanel';
import { parseOrgWorkspaceFilterIds } from 'core/utils/org-workspace-query';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  eligibleEnvironmentWorkspaces,
  environmentWorkspaceId,
} from '../../org-panels.model';
import { OrgFloatingPanel } from '../GseVisualAssistance/GseFloatingPanel';
import { InventoryPreviewTree } from './InventoryPreviewTree';

type Props = {
  companyId: string;
  canvas: HTMLElement | null;
  onClose: () => void;
};

export function InventoryOrganogramPanel({
  companyId,
  canvas,
  onClose,
}: Props) {
  const { query } = useRouter();
  const { data: company } = useQueryCompany();
  const workspaces = eligibleEnvironmentWorkspaces(
    company?.workspace,
    companyId,
  );
  const explicit = parseOrgWorkspaceFilterIds(query);
  const options = explicit.length
    ? workspaces.filter(({ id }) => explicit.includes(id))
    : workspaces;
  const [selectedId, setSelectedId] = useState('');
  const workspace = options.find(
    ({ id }) => id === (selectedId || environmentWorkspaceId(query, options)),
  );

  return (
    <OrgFloatingPanel
      id="inventory-organogram-panel"
      sx={{
        '&:has([data-inventory-links])': {
          width: 'min(740px, calc(100vw - 32px))',
          '& [data-inventory-links] .MuiTableCell-root': { px: '8px' },
        },
      }}
    >
      <Paper
        role="region"
        aria-label="Importar Inventário / PGR"
        elevation={4}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 4,
        }}
      >
        <Stack direction="row" alignItems="center" sx={{ px: 4, py: 2 }}>
          <IconButton
            aria-label="Fechar importação"
            size="small"
            onClick={onClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ flex: 1 }}>Importar Inventário / PGR</Typography>
          <Box
            component="span"
            tabIndex={0}
            data-gse-drag-handle
            aria-label="Mover painel com as setas"
            sx={{ display: 'inline-flex', color: 'text.secondary' }}
          >
            <DragIndicatorIcon />
          </Box>
        </Stack>
        <Stack spacing={3} sx={{ p: 5, overflow: 'auto', minHeight: 0 }}>
          {options.length ? (
            <TextField
              select
              fullWidth
              size="small"
              label="Estabelecimento"
              value={workspace?.id ?? ''}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              <MenuItem value="" disabled>
                Selecione um estabelecimento
              </MenuItem>
              {options.map(({ id, name }) => (
                <MenuItem key={id} value={id}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <Alert severity="info">
              A importação requer um estabelecimento ativo no recorte atual.
            </Alert>
          )}
          {workspace && (
            <InventoryPgrImportPanel
              key={workspace.id}
              companyId={companyId}
              workspaceId={workspace.id}
              renderVisualReview={(context) =>
                canvas &&
                createPortal(
                  <InventoryPreviewTree
                    {...context}
                    workspaceName={workspace.name}
                  />,
                  canvas,
                )
              }
            />
          )}
        </Stack>
      </Paper>
    </OrgFloatingPanel>
  );
}

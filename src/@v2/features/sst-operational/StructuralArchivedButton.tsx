import { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';

import { useSstAccess } from './access';
import { sstGet } from './api';
import { StructuralRevisionDialog } from './StructuralRevisionDialog';
import type { StructuralTable } from './structural-review-model';

type ArchivedSource = {
  id: string;
  name: string;
  archivedOn: string;
  workspaceId?: string;
};
export function StructuralArchivedButton({
  companyId,
  table,
  workspaceId,
  label = 'Consultar cadastros encerrados',
  disabled = false,
  fullWidth = false,
  iconOnly = false,
}: {
  companyId: string;
  table: StructuralTable;
  workspaceId?: string;
  label?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  iconOnly?: boolean;
}) {
  const access = useSstAccess();
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState<string>();
  const [selected, setSelected] = useState<ArchivedSource>();
  const list = useQuery<{ items: ArchivedSource[]; nextCursor: string | null }>(
    ['sst-structural-archived', companyId, table, workspaceId, cursor],
    () =>
      sstGet(
        companyId,
        `/sst-operational/structure/archived?table=${table}${workspaceId ? `&workspaceId=${encodeURIComponent(workspaceId)}` : ''}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
      ),
    {
      enabled: open && access.canReadStructure(table) && !!companyId,
      retry: false,
      keepPreviousData: true,
    },
  );
  if (!access.canReadStructure(table) || !companyId) return null;
  const response = list.isError && axios.isAxiosError(list.error)
    ? list.error.response
    : undefined;
  const accessDenied = response?.status === 403;
  const accessMessage: unknown = response?.data?.message;
  const openArchived = () => {
    setOpen(true);
    setCursor(undefined);
  };

  return (
    <>
      {iconOnly ? (
        <Tooltip title={label}>
          <Box component="span" sx={{ display: 'inline-flex', flexShrink: 0 }}>
            <IconButton
              type="button"
              aria-label={label}
              aria-haspopup="dialog"
              disabled={disabled}
              onClick={openArchived}
              sx={{ color: 'text.secondary', width: 40, height: 40 }}
            >
              <RestoreOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Tooltip>
      ) : (
        <Button
          type="button"
          variant="outlined"
          fullWidth={fullWidth}
          disabled={disabled}
          onClick={openArchived}
        >
          {label}
        </Button>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
        aria-labelledby={`archived-${table}-title`}
      >
        <DialogTitle
          id={`archived-${table}-title`}
          sx={{ p: '24px', pb: '16px' }}
        >
          {label}
        </DialogTitle>
        <DialogContent sx={{ px: '24px', py: '8px' }}>
          <Stack spacing={8} useFlexGap>
            <Alert severity="info">
              Cadastros encerrados conservam sua identidade e seus períodos. Uma
              restauração precisa de nova data de início; os períodos antigos
              não são reabertos.
            </Alert>
            {list.isError && (
              <Alert severity={accessDenied ? 'warning' : 'error'}>
                {accessDenied ? (
                  typeof accessMessage === 'string' && accessMessage.trim() ? (
                    accessMessage
                  ) : (
                    'Sua sessão não tem acesso à consulta nesta empresa.'
                  )
                ) : (
                  <>
                    Não foi possível consultar os cadastros encerrados.{' '}
                    <Button onClick={() => list.refetch()}>
                      Tentar novamente
                    </Button>
                  </>
                )}
              </Alert>
            )}
            {list.isLoading && (
              <Typography>Consultando cadastros encerrados…</Typography>
            )}
            {!list.isError && list.data && (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Cadastro</TableCell>
                      <TableCell>Encerrado desde</TableCell>
                      <TableCell>Revisão</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {list.data?.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          {item.archivedOn
                            ?.slice(0, 10)
                            .split('-')
                            .reverse()
                            .join('/') || '—'}
                        </TableCell>
                        <TableCell>
                          {access.canUpdateStructure(table) && (
                            <Button
                              disabled={list.isFetching || list.isError}
                              onClick={() => setSelected(item)}
                            >
                              Revisar restauração
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {list.data && !list.data.items.length && (
                      <TableRow>
                        <TableCell colSpan={3}>
                          Nenhum cadastro encerrado nesta consulta.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            )}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={8}
              useFlexGap
            >
              {cursor && (
                <Button
                  disabled={list.isFetching}
                  onClick={() => setCursor(undefined)}
                >
                  Voltar à primeira página
                </Button>
              )}
              {!list.isError && list.data?.nextCursor && (
                <Button
                  disabled={list.isFetching}
                  onClick={() => setCursor(list.data?.nextCursor || undefined)}
                >
                  Próximos cadastros encerrados
                </Button>
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: '24px' }}>
          <Button onClick={() => setOpen(false)}>Voltar à listagem</Button>
        </DialogActions>
        {selected && (
          <StructuralRevisionDialog
            companyId={companyId}
            target={{ table, id: selected.id }}
            action="RESTORE"
            onClose={() => setSelected(undefined)}
            onApplied={() => {
              setSelected(undefined);
              void list.refetch();
            }}
          />
        )}
      </Dialog>
    </>
  );
}

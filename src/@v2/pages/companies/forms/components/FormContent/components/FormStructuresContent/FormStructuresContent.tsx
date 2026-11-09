import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  FormStructure,
  useDeleteFormStructure,
  useFormStructures,
  useSaveFormStructure,
} from '@v2/services/forms/form-structures/form-structures.service';
import { useState } from 'react';
import { FormStructureDialog } from './FormStructureDialog';

export function FormStructuresContent({ companyId }: { companyId: string }) {
  const structures = useFormStructures(companyId);
  const save = useSaveFormStructure(companyId);
  const remove = useDeleteFormStructure(companyId);
  const [deleteTarget, setDeleteTarget] = useState<FormStructure | null>(null);
  const [selection, setSelection] = useState<FormStructure | 'new' | null>(
    null,
  );
  const current = selection === 'new' ? undefined : (selection ?? undefined);

  return (
    <Stack gap={4}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={4}
      >
        <Typography variant="body2">
          Estruturas reutilizáveis para organizar formulários psicossociais.
        </Typography>
        <Button variant="outlined" onClick={() => setSelection('new')}>
          Adicionar
        </Button>
      </Stack>
      {structures.isPending && <Typography>Carregando estruturas…</Typography>}
      {structures.isError && (
        <Alert severity="error">Não foi possível carregar as estruturas.</Alert>
      )}
      {structures.data && (
        <Paper sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Escalas</TableCell>
                <TableCell>Dimensões</TableCell>
                <TableCell>Origem</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {structures.data.map((structure) => (
                <TableRow key={structure.id}>
                  <TableCell>{structure.name}</TableCell>
                  <TableCell>{structure.scales.length}</TableCell>
                  <TableCell>
                    {structure.scales.reduce(
                      (count, scale) => count + scale.dimensions.length,
                      0,
                    )}
                  </TableCell>
                  <TableCell>
                    {structure.system ? 'Sistema' : 'Empresa'}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={() => setSelection(structure)}
                    >
                      {structure.system ? 'Ver estrutura' : 'Editar'}
                    </Button>
                    {!structure.system && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget(structure)}
                      >
                        Excluir
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
      {selection && (
        <FormStructureDialog
          initial={current}
          readOnly={current?.system}
          busy={save.isPending}
          onClose={() => setSelection(null)}
          onSubmit={(input) =>
            save.mutate(
              { input, id: current?.id },
              { onSuccess: () => setSelection(null) },
            )
          }
        />
      )}
      {deleteTarget && (
        <Dialog
          open
          fullWidth
          maxWidth="xs"
          aria-labelledby="delete-form-structure-title"
          aria-describedby="delete-form-structure-description"
          onClose={remove.isPending ? undefined : () => setDeleteTarget(null)}
        >
          <DialogTitle id="delete-form-structure-title">
            Excluir estrutura
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-form-structure-description">
              Excluir a estrutura “{deleteTarget.name}” do catálogo?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              disabled={remove.isPending}
              onClick={() => setDeleteTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              color="error"
              variant="contained"
              disabled={remove.isPending}
              onClick={() =>
                remove.mutate(deleteTarget.id, {
                  onSuccess: () => setDeleteTarget(null),
                })
              }
            >
              Excluir estrutura
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}

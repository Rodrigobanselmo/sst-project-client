import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import {
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { api } from 'core/services/apiClient';
import { messageOf } from './api';
import { SstDateField, useSstDateValidity } from './SstDateField';
export function EmployeeExposureGroups({
  companyId,
  employeeId,
}: {
  companyId: string;
  employeeId: number;
}) {
  const { datesValid, dateFieldValidity } = useSstDateValidity();
  const [open, setOpen] = useState(false),
    [group, setGroup] = useState(''),
    [start, setStart] = useState(''),
    [end, setEnd] = useState(''),
    [id, setId] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const client = useQueryClient();
  const path = `/employee-exposure-groups/${companyId}`;
  const options = useQuery(
    ['employee-gse-options', companyId],
    async () => (await api.get(path + '/options')).data,
    { enabled: open, retry: false },
  );
  const rows = useQuery(
    ['employee-gse-history', companyId, employeeId],
    async () => (await api.get(path + '/' + employeeId)).data,
    { enabled: open, retry: false },
  );
  const clear = () => {
    setId('');
    setGroup('');
    setStart('');
    setEnd('');
  };
  const save = async () => {
    setBusy(true);
    setError('');
    try {
      await api.post(path, {
        ...(id && { id }),
        employeeId,
        homogeneousGroupId: group,
        startDate: start,
        ...(end && { endDate: end }),
      });
      await client.invalidateQueries([
        'employee-gse-history',
        companyId,
        employeeId,
      ]);
      clear();
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Grupos de exposição do empregado
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ px: 12, pt: 12, pb: 6 }}>
          Grupos de exposição do empregado
        </DialogTitle>
        <DialogContent sx={{ px: 12, pb: 12 }}>
          <Stack spacing={8} useFlexGap>
            <Alert severity="info">
              Estes vínculos têm vigência própria e não alteram o cargo do
              empregado.
            </Alert>
            {(rows.isError || options.isError) && (
              <Alert severity="error">
                Não foi possível consultar os vínculos. Feche e abra novamente
                para tentar.
              </Alert>
            )}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>GSE</TableCell>
                  <TableCell>Início</TableCell>
                  <TableCell>Fim</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.data?.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.group.name}</TableCell>
                    <TableCell>{r.startDate.slice(0, 10)}</TableCell>
                    <TableCell>
                      {r.endDate?.slice(0, 10) || 'Em aberto'}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => {
                          setId(r.id);
                          setGroup(r.homogeneousGroupId);
                          setStart(r.startDate.slice(0, 10));
                          setEnd(r.endDate?.slice(0, 10) || '');
                        }}
                      >
                        Editar vínculo
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TextField
              select
              label="Grupo de exposição"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              {options.data?.map((g: any) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.name}
                </MenuItem>
              ))}
            </TextField>
            <SstDateField
              label="Início do vínculo ao GSE"
              value={start}
              onChange={setStart}
              onValidityChange={dateFieldValidity('start')}
            />
            <SstDateField
              label="Fim do vínculo ao GSE"
              helperText="A partir desta data este vínculo deixa de valer."
              value={end}
              onChange={setEnd}
              onValidityChange={dateFieldValidity('end')}
            />
            {error && <Alert severity="error">{error}</Alert>}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={4}
              useFlexGap
              sx={{ flexWrap: 'wrap' }}
            >
              <Button
                disabled={busy || !group || !start || !datesValid}
                onClick={save}
              >
                Salvar vínculo ao GSE
              </Button>
              <Button onClick={clear}>Novo vínculo</Button>
              <Button onClick={() => setOpen(false)}>
                Voltar ao empregado
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

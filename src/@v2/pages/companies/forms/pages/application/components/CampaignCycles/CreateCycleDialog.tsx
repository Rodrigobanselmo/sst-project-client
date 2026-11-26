import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  SstDateField,
  useSstDateValidity,
} from '@v2/features/sst-operational/SstDateField';
import { PageRoutes } from '@v2/constants/pages/routes';
import { useAppRouter } from '@v2/hooks/useAppRouter';
import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { CampaignCycles, createCampaignCycle } from './campaign-cycles.api';
export function CreateCycleDialog({
  companyId,
  applicationId,
  data,
  onClose,
}: {
  companyId: string;
  applicationId: string;
  data: CampaignCycles;
  onClose: () => void;
}) {
  const router = useAppRouter();
  const cache = useQueryClient();
  const suggested = /^\d{4}$/.test(data.current.referencePeriod)
    ? String(Number(data.current.referencePeriod) + 1)
    : '';
  const [period, setPeriod] = useState(suggested);
  const [sourcePeriod, setSourcePeriod] = useState(
    data.current.referencePeriod,
  );
  const [series, setSeries] = useState(data.seriesName);
  const [name, setName] = useState(
    `${data.seriesName}${suggested ? ` ${suggested}` : ''}`,
  );
  const [preserveHierarchyFilter, setPreserveHierarchyFilter] = useState(true);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [automaticStart, setAutomaticStart] = useState(false);
  const [automaticEnd, setAutomaticEnd] = useState(false);
  const [selected, setSelected] = useState(
    data.selectedWorkspaceIds.filter((id) =>
      data.workspaces.some((w) => w.id === id),
    ),
  );
  const { datesValid, dateFieldValidity } = useSstDateValidity();
  const mutation = useMutation({
    mutationFn: () =>
      createCampaignCycle(companyId, applicationId, {
        automaticStart,
        automaticEnd,
        name,
        referencePeriod: period,
        sourceReferencePeriod: sourcePeriod,
        seriesName: series,
        fingerprint: data.fingerprint,
        workspaceIds: selected,
        preserveHierarchyFilter,
        plannedStart: start || undefined,
        plannedEnd: end || undefined,
      }),
    onSuccess: async (result) => {
      await cache.invalidateQueries({
        queryKey: ['form-campaign-cycles', companyId],
      });
      await cache.invalidateQueries({
        queryKey: [QueryKeyFormEnum.FORM_APPLICATION, companyId],
      });
      onClose();
      router.push(PageRoutes.FORMS.FORMS_APPLICATION.VIEW, {
        pathParams: { companyId, id: result.id },
      });
    },
  });
  const error = (mutation.error as any)?.response?.data?.message;
  return (
    <Dialog
      open
      onClose={mutation.isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      sx={{
        '& .MuiFormControlLabel-label': { color: 'text.primary' },
        '& .MuiFormHelperText-root:not(.Mui-error)': {
          color: 'text.secondary',
        },
      }}
    >
      <DialogTitle sx={{ color: 'text.primary' }}>
        Criar próximo ciclo
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            pt: '8px',
          }}
        >
          <Alert severity="info">
            Ciclo {data.current.number + 1} com as mesmas {data.questionCount}{' '}
            perguntas, alternativas e pontuações. Será criado pendente, com um
            novo link e sem respostas.
          </Alert>
          {data.cycles.length === 1 && data.current.number === 1 && (
            <>
              <TextField
                label="Nome da pesquisa na série histórica"
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                inputProps={{ maxLength: 200 }}
              />
              <TextField
                label="Referência do ciclo de origem"
                value={sourcePeriod}
                onChange={(e) => setSourcePeriod(e.target.value)}
                inputProps={{ maxLength: 60 }}
              />
            </>
          )}
          <TextField
            label="Nome do novo ciclo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            inputProps={{ maxLength: 200 }}
          />
          <TextField
            label="Período de referência"
            helperText="Ex.: 2026 ou 2º semestre de 2026"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            inputProps={{ maxLength: 60 }}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: '16px',
            }}
          >
            <SstDateField
              label="Início previsto (opcional)"
              value={start}
              onChange={setStart}
              onValidityChange={dateFieldValidity('start')}
            />
            <SstDateField
              label="Término previsto (opcional)"
              value={end}
              onChange={setEnd}
              onValidityChange={dateFieldValidity('end')}
            />
          </Box>
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={automaticStart}
                  onChange={(_, checked) => setAutomaticStart(checked)}
                />
              }
              label="Iniciar automaticamente às 00h00 da data inicial"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={automaticEnd}
                  onChange={(_, checked) => setAutomaticEnd(checked)}
                />
              }
              label="Encerrar automaticamente ao final da data de término (23h59min59s)"
            />
            <Typography variant="body2" color="text.secondary">
              Horário de Brasília. Todo o último dia está incluído. A mudança de
              status ocorre na virada do dia, com tolerância de até um minuto,
              mesmo com o navegador fechado. O agendamento pode ser editado ou
              removido no painel do ciclo.
            </Typography>
          </Box>
          {start && end && end < start && (
            <Alert severity="error">
              O término deve ser igual ou posterior ao início.
            </Alert>
          )}
          <Box>
            <Typography color="text.primary" fontWeight={600}>
              Estabelecimentos participantes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Revise o público atual. As pessoas elegíveis serão consultadas no
              novo ciclo.
            </Typography>
            {data.hasHierarchyFilter && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={preserveHierarchyFilter}
                    onChange={(_, checked) =>
                      setPreserveHierarchyFilter(checked)
                    }
                  />
                }
                label="Manter o recorte por hierarquias da campanha de origem"
              />
            )}
            {data.workspaces.map((w) => (
              <FormControlLabel
                key={w.id}
                sx={{ display: 'flex' }}
                control={
                  <Checkbox
                    checked={selected.includes(w.id)}
                    onChange={(_, checked) =>
                      setSelected((v) =>
                        checked ? [...v, w.id] : v.filter((id) => id !== w.id),
                      )
                    }
                  />
                }
                label={w.name}
              />
            ))}
            {!data.workspaces.length && (
              <Alert severity="warning">
                Nenhum estabelecimento ativo disponível.
              </Alert>
            )}
          </Box>
          {mutation.isError && (
            <Alert severity="error">
              {Array.isArray(error)
                ? error.join(' ')
                : error || 'Não foi possível criar o ciclo. Tente novamente.'}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: '20px', gap: '8px' }}>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={
            mutation.isPending ||
            !name.trim() ||
            !period.trim() ||
            !series.trim() ||
            !sourcePeriod.trim() ||
            !selected.length ||
            !datesValid ||
            (automaticStart && !start) ||
            (automaticEnd && !end) ||
            !!(start && end && end < start)
          }
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Criando…' : 'Criar ciclo pendente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, LinearProgress, Tooltip, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { BulkRiskAddExecution, BulkRiskAddTask, runBulkRiskAdd } from './bulk-risk-add.runner';
const LEVELS = [{ value: 5, label: 'Muito altos' }, { value: 4, label: 'Altos' }, { value: 3, label: 'Moderados' }, { value: 2, label: 'Baixos' }, { value: 1, label: 'Muito baixos' }, { value: null, label: 'Protegidos ou não classificados' }];
export function SectorBulkRiskRemove({ title, buildTasks, onComplete, canRemove, scope = 'sector' }: { scope?: 'sector' | 'risk'; canRemove: boolean; title: string; buildTasks: () => BulkRiskAddTask[]; onComplete: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [levels, setLevels] = useState<Array<number | null>>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [, update] = useState(0);
  const running = useRef(false);
  const executions = useRef<BulkRiskAddExecution[] | null>(null);
  const available = open && !executions.current ? buildTasks() : [];
  const tasks = executions.current?.map(entry => entry.task) ?? available.filter(task => levels.includes(task.level));
  const failures = executions.current?.filter(entry => !entry.done) ?? [];
  const run = async () => {
    if (running.current || !confirmed || !tasks.length) return;
    running.current = true; setBusy(true); setRefreshFailed(false);
    executions.current ??= tasks.map(task => ({ task, nextStep: 0, done: false }));
    try {
      await runBulkRiskAdd(executions.current, () => update(value => value + 1));
      try { await onComplete(); } catch { setRefreshFailed(true); }
    } finally { running.current = false; setBusy(false); update(value => value + 1); }
  };
  return <>
    <Tooltip describeChild title={scope === 'risk' ? 'Remove este fator do inventário dos setores selecionados, junto com todas as fontes geradoras e recomendações vinculadas, inclusive as anteriores ao lote.' : 'Remove do inventário os riscos selecionados deste setor, junto com todas as fontes geradoras e recomendações vinculadas, inclusive as anteriores ao lote.'}><span><Button size="small" variant="outlined" disabled={!canRemove} onClick={() => { executions.current = null; setLevels([]); setConfirmed(false); setRefreshFailed(false); setOpen(true); }} sx={{ textTransform: 'none', color: 'text.primary', borderColor: 'divider', borderRadius: '999px' }}>Remover riscos</Button></span></Tooltip>
    <Dialog open={open} onClose={() => { if (!busy) setOpen(false); }} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: 'background.paper', color: 'text.primary' } }}>
      <DialogTitle sx={{ color: 'text.primary', fontWeight: 700 }}>Remover riscos do inventário</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '12px', '& .MuiFormControlLabel-label': { color: 'text.primary' }, '& .MuiTypography-root': { color: 'text.primary' }, '& .MuiAlert-root .MuiTypography-root': { color: 'inherit' } }}>
        <Typography fontWeight={600}>{title}</Typography>
        <Typography>{scope === 'risk' ? 'Selecione os níveis dos setores dos quais deseja retirar este fator. Os demais setores serão mantidos.' : 'Selecione os níveis que deseja retirar. Os demais serão mantidos.'}</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <FormControlLabel label="Todos" control={<Checkbox disabled={busy || Boolean(executions.current)} checked={available.length > 0 && available.every(task => levels.includes(task.level))} onChange={event => { setLevels(event.target.checked ? [...new Set(available.map(task => task.level))] : []); setConfirmed(false); }} />} />
          {LEVELS.map(option => { const count = available.filter(task => task.level === option.value).length; return count ? <FormControlLabel key={String(option.value)} label={`${option.label} (${count})`} control={<Checkbox disabled={busy || Boolean(executions.current)} checked={levels.includes(option.value)} onChange={event => { setLevels(previous => event.target.checked ? [...previous, option.value] : previous.filter(level => level !== option.value)); setConfirmed(false); }} />} /> : null; })}
        </Box>
        <Alert severity="warning">A remoção é definitiva para cada risco selecionado: retira o risco e todas as fontes geradoras e recomendações vinculadas a ele, inclusive as cadastradas antes deste lote. As análises da IA continuam no formulário. Riscos com bloqueios do plano de ação não serão removidos.</Alert>
        <Typography fontWeight={600}>Prévia: {tasks.length} situações de risco/setor para remover.</Typography>
        <Box sx={{ maxHeight: 180, overflowY: 'auto' }}>{tasks.map(task => <Typography key={task.id} variant="body2">{task.label}</Typography>)}</Box>
        <FormControlLabel label="Confirmo a remoção dos riscos selecionados e de todas as suas fontes geradoras e recomendações do inventário." control={<Checkbox checked={confirmed} disabled={busy || Boolean(executions.current)} onChange={event => setConfirmed(event.target.checked)} />} />
        {busy && <LinearProgress />}
        {executions.current && !busy && <Alert severity={failures.length ? 'warning' : 'success'}>{tasks.length - failures.length} de {tasks.length} situações removidas. {failures.length ? `${failures.length} pendentes.` : 'Lote concluído.'}</Alert>}
        {refreshFailed && <Alert severity="warning">Não foi possível atualizar a tela. Atualize a página para consultar o inventário.</Alert>}
        {!busy && failures.map(entry => <Typography key={entry.task.id} variant="body2">{entry.task.label}: {entry.error}</Typography>)}
      </DialogContent>
      <DialogActions><Button sx={{ textTransform: 'none', color: 'text.primary' }} disabled={busy} onClick={() => setOpen(false)}>{executions.current ? 'Fechar' : 'Cancelar'}</Button><Button sx={{ textTransform: 'none' }} color="error" variant="outlined" disabled={busy || !confirmed || !tasks.length || Boolean(executions.current && !failures.length)} onClick={() => void run()}>{executions.current ? 'Tentar somente pendentes' : 'Remover riscos e vínculos'}</Button></DialogActions>
    </Dialog>
  </>;
}

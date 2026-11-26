import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, LinearProgress, Menu, MenuItem, Typography, Tooltip } from '@mui/material';
import { useRef, useState } from 'react';
import { BulkRiskAddExecution, BulkRiskAddTask, runBulkRiskAdd } from './bulk-risk-add.runner';

const LEVELS = [
  { value: 5, label: 'Muito altos' }, { value: 4, label: 'Altos' },
  { value: 3, label: 'Moderados' }, { value: 2, label: 'Baixos' }, { value: 1, label: 'Muito baixos' },
];

type Props = { scope?: 'sector' | 'risk'; title: string; buildTasks: (includeAi: boolean) => BulkRiskAddTask[]; onComplete: () => Promise<void> };

export function SectorBulkRiskAdd({ title, buildTasks, onComplete, scope = 'sector' }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<number | null>(null);
  const [includeAi, setIncludeAi] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [, setRevision] = useState(0);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const running = useRef(false);
  const executions = useRef<BulkRiskAddExecution[] | null>(null);
  const menuTasks = anchor ? buildTasks(false) : [];
  const previewTasks = open && !executions.current ? buildTasks(includeAi).filter(task => level === null || task.level === level) : [];
  const tasks = executions.current?.map(entry => entry.task) ?? previewTasks;
  const done = executions.current?.filter(entry => entry.done).length ?? 0;
  const failures = executions.current?.filter(entry => !entry.done) ?? [];
  const sources = tasks.reduce((sum, task) => sum + task.sources, 0);
  const recommendations = tasks.reduce((sum, task) => sum + task.recommendations, 0);
  const sourcesToAdd = tasks.reduce((sum, task) => sum + (task.sourcesToAdd ?? task.sources), 0);
  const recommendationsToAdd = tasks.reduce((sum, task) => sum + (task.recommendationsToAdd ?? task.recommendations), 0);
  const existing = tasks.filter(task => task.alreadyInInventory).length;
  const withoutAnalysis = tasks.filter(task => !task.hasAnalysis).length;
  const prepare = (value: number | null) => {
    setAnchor(null); setLevel(value); setIncludeAi(false); setAcknowledged(false);
    executions.current = null; setProgress(0); setRefreshFailed(false); setOpen(true);
  };
  const run = async () => {
    if (running.current || busy || !tasks.length || (includeAi && !acknowledged)) return;
    if (!executions.current) executions.current = tasks.map(task => ({ task, nextStep: 0, done: false }));
    running.current = true; setBusy(true); setRefreshFailed(false);
    try {
      await runBulkRiskAdd(executions.current, (completed, total) => setProgress(completed / total * 100));
      try { await onComplete(); } catch { setRefreshFailed(true); }
    } finally { running.current = false; setBusy(false); setRevision(value => value + 1); }
  };
  return <>
    <Tooltip describeChild title={scope === 'risk' ? 'Inclui este fator no inventário dos setores selecionados pelo nível de risco. Conforme as opções escolhidas, também inclui e registra o aceite das fontes geradoras e recomendações da IA disponíveis.' : 'Inclui os riscos selecionados no inventário de riscos deste setor. Conforme as opções escolhidas, também inclui e registra o aceite das fontes geradoras e recomendações da IA disponíveis.'}><Button variant="outlined" size="small" onClick={event => setAnchor(event.currentTarget)}
      sx={{ textTransform: 'none', color: 'text.primary', borderColor: 'divider', borderRadius: '999px' }}>Adicionar riscos</Button></Tooltip>
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
      PaperProps={{ sx: { bgcolor: 'background.paper', color: 'text.primary', '& .MuiMenuItem-root': { color: 'text.primary' } } }}>
      <MenuItem disabled={!menuTasks.length} onClick={() => prepare(null)}>Todos ({new Set(menuTasks.map(task => scope === 'risk' ? task.id : task.riskId)).size})</MenuItem>
      {LEVELS.map(option => {
        const count = new Set(menuTasks.filter(task => task.level === option.value).map(task => scope === 'risk' ? task.id : task.riskId)).size;
        return count ? <MenuItem key={option.value} onClick={() => prepare(option.value)}>{option.label} ({count})</MenuItem> : null;
      })}
    </Menu>
    <Dialog open={open} onClose={() => { if (!busy) setOpen(false); }} fullWidth maxWidth="sm"
      PaperProps={{ sx: { bgcolor: 'background.paper', color: 'text.primary', border: '1px solid', borderColor: 'divider', borderRadius: 3 } }}>
      <DialogTitle sx={{ px: 10, pt: 10, pb: 6, color: 'text.primary', fontWeight: 700 }}>Adicionar riscos em lote</DialogTitle>
      <DialogContent sx={{ px: 10, py: 4, display: 'flex', flexDirection: 'column', gap: 6, '& .MuiFormControlLabel-label': { color: 'text.primary' } }}>
        <Typography color="text.primary" fontWeight={600}>{title}</Typography>
        <Typography color="text.secondary" variant="body2">Faixa: {level === null ? 'Todos os níveis do filtro atual' : LEVELS.find(option => option.value === level)?.label}. {scope === 'risk' ? 'A ação considera somente este fator, nos setores do recorte atual. O nível é a classificação deste fator em cada setor.' : 'A ação considera somente este setor ou os membros deste agrupamento.'}</Typography>
        <FormControlLabel control={<Checkbox checked={includeAi} disabled={busy || Boolean(executions.current)} onChange={event => { setIncludeAi(event.target.checked); setAcknowledged(false); }} />}
          label="Aceitar e incluir também todas as fontes geradoras e recomendações da IA disponíveis" />
        <Box sx={{ p: 6, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'action.hover' }}>
          <Typography fontWeight={600} color="text.primary">Prévia</Typography>
          <Typography variant="body2" color="text.primary">Situações de risco/setor: {tasks.length}. Para adicionar: {tasks.length - existing}. Já presentes no inventário: {existing}.</Typography>
          {includeAi && <Typography variant="body2" color="text.primary">Fontes geradoras para aceite: {sources} ({sourcesToAdd} para incluir; {sources - sourcesToAdd} já no inventário). Recomendações para aceite: {recommendations} ({recommendationsToAdd} para incluir; {recommendations - recommendationsToAdd} já no inventário). Situações sem análise disponível: {withoutAnalysis}; nelas, será adicionado somente o risco.</Typography>}
        </Box>
        {includeAi && <FormControlLabel control={<Checkbox checked={acknowledged} disabled={busy || Boolean(executions.current)} onChange={event => setAcknowledged(event.target.checked)} />}
          label="Revisei as análises selecionadas e confirmo o aceite técnico de todas as fontes e recomendações disponíveis neste lote." />}
        {busy && <Box role="status"><Typography variant="body2" color="text.primary">Processando lote… {Math.round(progress)}%</Typography><LinearProgress variant="determinate" value={progress} /></Box>}
        {executions.current && !busy && <Alert severity={failures.length ? 'warning' : 'success'}>{done} de {tasks.length} situações concluídas. {failures.length ? `${failures.length} pendentes; tente novamente para continuar somente as etapas que falharam.` : 'Lote concluído.'}</Alert>}
        {refreshFailed && <Alert severity="warning">As operações foram executadas, mas não foi possível atualizar a tela. Atualize a página para consultar o inventário.</Alert>}
        {!busy && failures.length > 0 && <Box sx={{ maxHeight: 180, overflowY: 'auto' }}>{failures.map(entry => <Typography key={entry.task.id} variant="body2" color="text.secondary">{entry.task.label}: {entry.error}</Typography>)}</Box>}
      </DialogContent>
      <DialogActions sx={{ px: 10, py: 8, gap: 4, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap' }}>
        <Button disabled={busy} onClick={() => setOpen(false)} sx={{ color: 'text.primary', textTransform: 'none' }}>{executions.current ? 'Fechar' : 'Cancelar'}</Button>
        <Button variant="outlined" disabled={busy || !tasks.length || (includeAi && !acknowledged) || (Boolean(executions.current) && failures.length === 0)} onClick={() => void run()}
          sx={{ textTransform: 'none', color: 'text.primary', borderColor: 'divider' }}>{executions.current ? 'Tentar somente pendentes' : includeAi ? 'Adicionar e aceitar análises' : 'Adicionar riscos'}</Button>
      </DialogActions>
    </Dialog>
  </>;
}

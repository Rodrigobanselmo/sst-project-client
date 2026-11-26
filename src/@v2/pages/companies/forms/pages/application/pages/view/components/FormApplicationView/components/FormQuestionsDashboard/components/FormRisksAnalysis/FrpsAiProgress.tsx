import { Alert, Box, LinearProgress, Typography } from '@mui/material';
import type { IFormQuestionsAnswersAnalysisBrowseResultModel } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';

export function FrpsAiProgress({results, fetching, fetchError, starting}: { results: IFormQuestionsAnswersAnalysisBrowseResultModel[]; fetching: boolean; fetchError: boolean; starting: boolean }) {
  const ordered = [...results].sort((a,b) => new Date(String(b.metadata?.startedAt ?? b.updatedAt)).getTime() - new Date(String(a.metadata?.startedAt ?? a.updatedAt)).getTime());
  const latest = ordered[0];
  if (!latest && !starting) return null;
  const batchId = latest?.metadata?.batchId;
  const rows = batchId ? results.filter(row => row.metadata?.batchId === batchId) : results.filter(row => row.status === 'PROCESSING');
  if (!batchId && !rows.length && !starting) return null;
  const jobs = new Map<string, typeof rows>();
  for (const row of rows) { const key = String(row.metadata?.batchJobKey ?? `${row.hierarchyId}:${row.riskId}`); jobs.set(key,[...(jobs.get(key) ?? []),row]); }
  let done=0, failed=0, pending=0;
  for (const group of jobs.values()) {
    if (group.some(row => row.status === 'FAILED')) failed++;
    else if (group.every(row => row.status === 'DONE')) done++;
    else pending++;
  }
  const total = Math.max(Number(latest?.metadata?.batchTotal) || jobs.size, jobs.size);
  const missing = Math.max(0,total-jobs.size);
  const finished = !!batchId && !pending && !missing && !starting;
  const percent = total ? Math.floor((done+failed)/total*100) : 0;
  return <Box role="status" aria-live="polite" sx={{width:'100%',mb:6,p:6,border:'1px solid',borderColor:'divider',borderRadius:2,color:'text.primary'}}>
    <Typography color="text.primary" fontWeight={700}>{starting ? 'Preparando execução…' : finished ? (failed ? 'Execução encerrada com falhas' : 'Análises concluídas') : 'Acompanhamento da geração de IA'}</Typography>
    <Typography color="text.secondary" sx={{my:3}}>Total: {total} · Concluídas: {done} · Com falha: {failed} · Pendentes/em processamento: {pending+missing}</Typography>
    <LinearProgress variant={starting ? 'indeterminate' : 'determinate'} value={percent} color={failed ? 'warning' : 'primary'} aria-label="Progresso da geração de análises de IA" />
    <Typography variant="caption" color="text.secondary" sx={{display:'block',mt:3}}>{batchId ? 'Contagem por análise de risco/setor ou agrupamento; setores que herdam a mesma análise são contados uma única vez.' : 'Contagem de registros legados; o total pode incluir setores que herdam uma mesma análise.'} {batchId ? `${percent}% encerradas.` : 'Execução anterior sem identificação de lote: não é possível confirmar atividade apenas pelos registros pendentes.'} {fetching ? 'Atualizando status…' : ''}</Typography>
    {!batchId && rows.length > 0 && <Alert severity="warning" sx={{mt:4}}>Há registros pendentes de uma execução anterior. Eles não confirmam que a IA continua trabalhando. Em “Limpar análises de IA”, você pode remover falhas e travamentos sem conteúdo após 60 minutos. A recuperação continua disponível para regularizar registros e preservar conteúdo salvo.</Alert>}
    {fetchError && <Alert severity="warning" sx={{mt:4}}>Não foi possível atualizar o status. Os números exibidos são da última consulta; isso não confirma que a execução parou.</Alert>}
    {!!failed && <Alert severity="error" sx={{mt:4}}>Uma ou mais análises falharam. As concluídas foram preservadas. Confira as falhas antes de solicitar uma nova geração.</Alert>}
  </Box>;
}

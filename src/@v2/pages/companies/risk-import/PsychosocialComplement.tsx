import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Checkbox, FormControlLabel, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { api } from 'core/services/apiClient';

type Addition = { id: string; sector: string; factor: string; sources: string[]; controls: string[]; recommendations: string[]; document: string; page: number };
type Preview = { rows: Addition[]; previewHash: string; additions: number; canImport: boolean };
type Record = { id: string; importedAt: string; rows: Addition[] };
const errorMessage = (e: any) => [].concat(e?.response?.data?.message || 'Não foi possível concluir o complemento.').join(' ');

export function PsychosocialComplement({ companyId, workspaceId, reportId }: { companyId: string; workspaceId: string; reportId: string }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<{ name: string; base64: string }>();
  const [preview, setPreview] = useState<Preview>();
  const [history, setHistory] = useState<Record[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const generation = useRef(0);
  const base = `risk-data/psychosocial-import/${companyId}`;
  useEffect(() => {
    generation.current++;
    setFile(undefined); setPreview(undefined); setHistory([]); setConfirmed(false); setError(''); setNotice(''); setBusy(false);
    return () => { generation.current++; };
  }, [companyId, workspaceId, reportId]);
  useEffect(() => {
    if (!file) return;
    const guard = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [file]);
  async function run(action: () => Promise<void>) {
    const version = generation.current;
    setBusy(true); setError(''); setNotice('');
    try { await action(); } catch (e) { if (version === generation.current) setError(errorMessage(e)); }
    finally { if (version === generation.current) setBusy(false); }
  }
  async function read(selected?: File) {
    if (!selected) return;
    const version = generation.current;
    setPreview(undefined); setConfirmed(false); setNotice(''); setError('');
    if (!/\.xlsx$/i.test(selected.name) || selected.size > 2000000) { setFile(undefined); setError('Selecione um Excel .xlsx de até 2 MB.'); return; }
    try {
      const bytes = new Uint8Array(await selected.arrayBuffer());
      let binary = ''; bytes.forEach(b => { binary += String.fromCharCode(b); });
      if (version === generation.current) setFile({ name: selected.name, base64: btoa(binary) });
    } catch { if (version === generation.current) setError('Não foi possível ler o arquivo.'); }
  }
  const details = (rows: Addition[]) => <TableContainer sx={{ maxHeight: 440 }}><Table size="small"><TableHead><TableRow>{['Setor / fator', 'Fontes geradoras', 'Controles existentes (ADM)', 'Recomendações', 'Origem'].map(h => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead><TableBody>{rows.map(row => <TableRow key={row.id}><TableCell>{row.sector}<br />{row.factor}</TableCell>{[row.sources, row.controls, row.recommendations].map((items, i) => <TableCell key={i} sx={{ minWidth: 170, whiteSpace: 'pre-line' }}>{items.join('\n') || '—'}</TableCell>)}<TableCell>{row.document}, p. {row.page}</TableCell></TableRow>)}</TableBody></Table></TableContainer>;
  return <Stack spacing={6} sx={{ mt: 8, mb: 8, p: 6, border: 1, borderColor: 'divider', borderRadius: 1, color: 'text.primary', '& .MuiTypography-root': { color: 'text.primary' } }}>
    <Typography fontWeight={600}>Complementar fontes geradoras e medidas</Typography>
    <Typography>Exporte as avaliações desta importação. Preencha as colunas “Adicionar” com um item por linha e informe documento e página. Células vazias preservam os dados atuais. A probabilidade, a severidade e a matriz permanecem como estão.</Typography>
    <Typography>Registre como controle existente apenas uma medida já adotada e documentada. Ações propostas devem entrar em Recomendações.</Typography>
    <Stack direction="row" flexWrap="wrap" gap={4}>
      <Button variant="outlined" disabled={busy} onClick={() => void run(async () => {
        const response = await api.get(`${base}/reports/${workspaceId}/${reportId}/excel`, { responseType: 'blob' });
        const url = URL.createObjectURL(response.data); const a = document.createElement('a'); a.href = url; a.download = `complemento-${reportId}.xlsx`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      })}>Baixar Excel para complementar</Button>
      <Button component="label" variant="outlined" disabled={busy}>Selecionar complemento<input type="file" hidden accept=".xlsx" onChange={e => { void read(e.target.files?.[0]); e.target.value = ''; }} /></Button>
      <Button disabled={busy || !file} onClick={() => void run(async () => {
        const version = generation.current;
        const { data } = await api.post(`${base}/complement/${reportId}/preview`, { workspaceId, fileBase64: file!.base64 });
        if (version === generation.current) { setPreview(data); setConfirmed(false); }
      })}>Conferir complemento</Button>
      <Button disabled={busy} onClick={() => void run(async () => {
        const version = generation.current; const { data } = await api.get(`${base}/reports/${workspaceId}/${reportId}/complements`);
        if (version === generation.current) { setHistory(data); if (!data.length) setNotice('Nenhum complemento gravado nesta importação.'); }
      })}>Consultar complementos</Button>
    </Stack>
    {file && <Typography>{file.name}</Typography>}
    {error && <Alert severity="error">{error}</Alert>}
    {notice && <Alert severity="success">{notice}</Alert>}
    {preview && <><Alert severity={preview.canImport ? 'info' : 'warning'}>{preview.additions} adições novas. Confira a associação ao setor e ao fator antes de gravar.</Alert>{details(preview.rows)}<FormControlLabel control={<Checkbox checked={confirmed} onChange={e => setConfirmed(e.target.checked)} disabled={busy} />} label="Conferi as fontes, as medidas, os fatores e as referências documentais." /><Button variant="contained" disabled={busy || !confirmed || !preview.canImport} onClick={() => void run(async () => {
      const version = generation.current;
      const { data } = await api.post(`${base}/complement/${reportId}/commit`, { workspaceId, fileBase64: file!.base64, previewHash: preview.previewHash });
      if (version !== generation.current) return;
      setNotice(`${data.added} adições gravadas. A avaliação original foi preservada.`); setHistory(h => [data.psychosocialComplementReport, ...h]); setFile(undefined); setPreview(undefined); setConfirmed(false);
      void queryClient.invalidateQueries();
    })}>Importar complemento conferido</Button></>}
    {history.map(record => <Stack spacing={4} key={record.id}><Typography fontWeight={600}>Complemento de {new Date(record.importedAt).toLocaleString('pt-BR')}</Typography><Typography variant="caption">Registro: {record.id}</Typography>{details(record.rows)}</Stack>)}
  </Stack>;
}

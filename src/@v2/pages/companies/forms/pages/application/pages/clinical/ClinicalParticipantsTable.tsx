import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { Alert, Box, Button, LinearProgress, MenuItem, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TableSortLabel, TextField, Typography } from '@mui/material';
import { api } from 'core/services/apiClient';
import { ParticipantAnswersDialog, participantPrivacyPath } from '../view/components/FormApplicationView/components/FormParticipantsTable/ParticipantPrivacyView';
import { IndicatorsQualityLegend } from '../view/components/FormApplicationView/components/FormQuestionsDashboard/components/IndicatorsQualityLegend/IndicatorsQualityLegend';
import { getIndicatorColorFromScore } from '../view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/form-indicator-quality.util';

export type ClinicalRow = {id:number;name:string;score:number|null;hasResponded:boolean;answeredItems:number;submittedAt:string|null};
export const individualPanelUrl = (c:string,a:string,e:number) => `/dashboard/empresas/${encodeURIComponent(c)}/formularios/aplicados/${encodeURIComponent(a)}/participantes/${e}`;
export function ScoreBar({score}:{score:number|null}) {
  if(score==null) return <Typography variant="body2" color="text.secondary">Sem score</Typography>;
  return <Box sx={{minWidth:130}}><LinearProgress variant="determinate" value={score*100} sx={{height:10,borderRadius:2,'& .MuiLinearProgress-bar':{bgcolor:getIndicatorColorFromScore(score)}}}/><Typography variant="caption">{Math.round(score*100)}% · {score.toFixed(3)}</Typography></Box>;
}
export function ClinicalParticipantsTable({companyId,applicationId}:{companyId:string;applicationId:string}) {
  const [search,setSearch]=useState(''),[direction,setDirection]=useState<'asc'|'desc'>('asc'),[page,setPage]=useState(0),[limit,setLimit]=useState(25),[employee,setEmployee]=useState<ClinicalRow|null>(null);
  const [response,setResponse]=useState('all');
  const query=useQuery<{results:ClinicalRow[]}>(['frps-clinical-list',companyId,applicationId],async()=>(await api.get(`${participantPrivacyPath(companyId,applicationId)}/clinical`)).data,{cacheTime:0,staleTime:0,retry:false,refetchOnWindowFocus:'always'});
  const rows=useMemo(()=> (query.data?.results??[]).filter(r=>r.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')) && (response==='all'||(response==='responded'?r.hasResponded:!r.hasResponded))).sort((a,b)=>{
    if(a.score==null) return b.score==null?a.name.localeCompare(b.name):1;
    if(b.score==null) return -1;
    return (direction==='asc'?a.score-b.score:b.score-a.score)||a.name.localeCompare(b.name)||a.id-b.id;
  }),[query.data,search,direction,response]);
  if(query.isError) return <Alert severity="error">Não foi possível carregar o painel individual. Confira a autorização e o vínculo com cadastro médico ativo contendo CRM e UF.</Alert>;
  return <Box>
    <Alert severity="info" sx={{mb:6}}>Visão individual sob sigilo profissional. Quanto menor o score, mais desfavoráveis são as respostas pontuadas. Sem envio válido ou sem itens pontuáveis: “Sem score”. A classificação inicial prioriza os menores scores; não representa diagnóstico.</Alert>
    <IndicatorsQualityLegend/>
    <Box sx={{display:'flex',gap:6,flexWrap:'wrap',my:6}}>
      <TextField size="small" label="Pesquisar empregado" value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}}/>
      <TextField select size="small" label="Participação" value={response} onChange={e=>{setResponse(e.target.value);setPage(0);}}><MenuItem value="all">Todos</MenuItem><MenuItem value="responded">Com envio válido</MenuItem><MenuItem value="pending">Sem envio válido</MenuItem></TextField>
      <Button onClick={()=>{setDirection(d=>d==='asc'?'desc':'asc');setPage(0);}}>Score: {direction==='asc'?'menor para maior':'maior para menor'}</Button>
      <Button disabled={query.isFetching} onClick={()=>void query.refetch()}>Atualizar</Button>
    </Box>
    {query.isFetching&&<LinearProgress/>}
    <Box sx={{overflowX:'auto'}}><Table><TableHead><TableRow><TableCell>Empregado</TableCell><TableCell><TableSortLabel active direction={direction} onClick={()=>{setDirection(d=>d==='asc'?'desc':'asc');setPage(0);}}>Score geral</TableSortLabel></TableCell><TableCell>Itens pontuados</TableCell><TableCell>Respostas</TableCell></TableRow></TableHead><TableBody>
      {rows.slice(page*limit,page*limit+limit).map(r=><TableRow key={r.id}><TableCell>{r.name}</TableCell><TableCell><ScoreBar score={r.score}/></TableCell><TableCell>{r.answeredItems}</TableCell><TableCell><Button variant="outlined" size="small" disabled={!r.hasResponded} onClick={()=>setEmployee(r)}>Ver respostas</Button></TableCell></TableRow>)}
      {!query.isLoading&&!rows.length&&<TableRow><TableCell colSpan={4}>Nenhum participante neste recorte autorizado.</TableCell></TableRow>}
    </TableBody></Table></Box>
    <TablePagination component="div" count={rows.length} page={Math.min(page,Math.max(0,Math.ceil(rows.length/limit)-1))} rowsPerPage={limit} onPageChange={(_,p)=>setPage(p)} onRowsPerPageChange={e=>{setLimit(Number(e.target.value));setPage(0);}} labelRowsPerPage="Linhas por página"/>
    <ParticipantAnswersDialog companyId={companyId} applicationId={applicationId} employee={employee} onClose={()=>setEmployee(null)}/>
  </Box>;
}

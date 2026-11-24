import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { Alert, Box, Button, Chip, CircularProgress, MenuItem, Paper, Tab, Tabs, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { api } from 'core/services/apiClient';
import { SContainer } from 'components/atoms/SContainer';
import { participantPrivacyPath, useParticipantAccess } from '../view/components/FormApplicationView/components/FormParticipantsTable/ParticipantPrivacyView';
import { IndicatorsQualityLegend } from '../view/components/FormApplicationView/components/FormQuestionsDashboard/components/IndicatorsQualityLegend/IndicatorsQualityLegend';
import { ScaleIndicatorsRadar } from '../view/components/FormApplicationView/components/FormQuestionsDashboard/components/ScaleIndicatorsRadar/ScaleIndicatorsRadar';
import { getIndicatorColorFromScore } from '../view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/form-indicator-quality.util';
import { resolveOccupationalRiskLevel, OCCUPATIONAL_RISK_LEVEL_NAMES } from 'core/utils/helpers/occupational-risk-level.util';
import { clinicalView, ClinicalDashboard, plain } from './clinical-model';
import { ScoreBar } from './ClinicalParticipantsTable';
ChartJS.register(CategoryScale,LinearScale,BarElement,ArcElement,Tooltip,Legend);

export function ClinicalDashboardPage() {
  const router=useRouter(), c=typeof router.query.companyId==='string'?router.query.companyId:'', a=typeof router.query.id==='string'?router.query.id:'', e=Number(router.query.employeeId);
  const access=useParticipantAccess(c,a);
  const [tab,setTab]=useState(0),[chart,setChart]=useState('bar'),[busy,setBusy]=useState(false),[exportError,setExportError]=useState('');
  const query=useQuery<ClinicalDashboard>(['frps-clinical-dashboard',c,a,e],async()=>(await api.get(`${participantPrivacyPath(c,a)}/${e}/clinical`)).data,{enabled:!!c&&!!a&&Number.isSafeInteger(e)&&e>0&&access.data?.canViewIndividualAnswers===true,cacheTime:0,staleTime:0,retry:false,refetchOnWindowFocus:true});
  const data=access.data?.canViewIndividualAnswers?query.data:undefined;
  const view=useMemo(()=>data?clinicalView(data):null,[data]);
  if(access.isError || (access.data&&!access.data.canViewIndividualAnswers)) return <SContainer><Alert severity="error">Acesso restrito: são necessários autorização nominal e cadastro médico ativo com CRM e UF vinculados ao usuário.</Alert></SContainer>;
  if(query.isError) return <SContainer><Alert severity="error">Não foi possível consultar o participante neste escopo autorizado. Confirme se há um envio válido identificado.</Alert></SContainer>;
  if(!data||!view) return <SContainer><CircularProgress/><Typography>Consultando painel individual…</Typography></SContainer>;
  const Chart = chart==='pie'?Pie:chart==='donut'?Doughnut:Bar;
  const summarize = (points:typeof view.scales) => ({labels:points.map(p=>p.name),datasets:[{label:'Score (%)',data:points.map(p=>p.hasValidAnswers?p.percentage:null),backgroundColor:points.map(p=>getIndicatorColorFromScore(p.score))}]});
  const exportPdf=async()=>{setBusy(true);setExportError('');try {
    const fresh=(await api.get<ClinicalDashboard>(`${participantPrivacyPath(c,a)}/${e}/clinical-export`)).data;
    const {exportClinicalPdf}=await import('./export-clinical-pdf');await exportClinicalPdf(fresh);setTab(tab);
  } catch {setExportError('Não foi possível gerar o PDF. Confira sua autorização e tente novamente.');}finally{setBusy(false);}};
  return <SContainer>
    <Box sx={{display:'flex',gap:6,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',mb:8}}><Box><Typography variant="h4">Painel individual — {data.employee.name}</Typography><Typography>{data.application.name} · {data.application.form.name}</Typography><Typography variant="body2">Envio válido de {new Date(data.submission.created_at).toLocaleString('pt-BR')}</Typography></Box><Button variant="contained" disabled={busy||query.isFetching} onClick={()=>void exportPdf()}>{busy?'Gerando PDF…':'Exportar relatório PDF'}</Button></Box>
    <Alert severity="warning" sx={{mb:6}}>Informações individuais sob sigilo profissional. A consulta e a exportação são registradas. Resultados para apoio à avaliação do médico do trabalho; não constituem diagnóstico. A severidade dos fatores vem do cadastro ocupacional e a probabilidade é calculada pelas respostas deste envio.</Alert>
    <Paper sx={{p:8,mb:8}}><Typography fontWeight={600}>Score geral individual</Typography><ScoreBar score={data.overall.hasValidAnswers?data.overall.score:null}/><Typography variant="body2">{data.overall.answeredItems} itens pontuados. Quanto menor o score, mais desfavoráveis são as respostas. Itens ausentes ou não pontuáveis não são tratados como zero.</Typography></Paper>
    <IndicatorsQualityLegend/>
    {exportError&&<Alert severity="error">{exportError}</Alert>}
    <Tabs value={tab} onChange={(_,v)=>setTab(v)} variant="scrollable" scrollButtons="auto" sx={{my:8}}><Tab label="Indicadores"/><Tab label="Gráficos das respostas"/><Tab label="Radar por escalas"/><Tab label="Radar por dimensões"/><Tab label="Análise de riscos"/><Tab label="Respostas"/></Tabs>
    {tab<2&&<TextField select label="Tipo de gráfico" size="small" value={chart} onChange={ev=>setChart(ev.target.value)} sx={{mb:8,minWidth:200}}><MenuItem value="bar">Barras</MenuItem><MenuItem value="donut">Rosca</MenuItem><MenuItem value="pie">Pizza</MenuItem></TextField>}
    {tab===0&&<>
      {chart==='bar'?<Box sx={{maxWidth:1100}}><Bar data={summarize(view.scales)} options={{indexAxis:'y',scales:{x:{min:0,max:100}}}}/></Box>:<Alert severity="info">Pizza e rosca mostram a distribuição dos indicadores individuais nas faixas da legenda, não uma distribuição de pessoas.</Alert>}
      {chart!=='bar'&&(()=>{const bands=[0,0,0,0,0];view.scales.filter(s=>s.hasValidAnswers).forEach(s=>bands[Math.min(4,Math.floor(s.percentage/20))]++);return <Box sx={{maxWidth:480}}><Chart data={{labels:['Muito negativo','Negativo','Neutro','Positivo','Muito positivo'],datasets:[{data:bands,backgroundColor:[0,.2,.4,.6,.8].map(getIndicatorColorFromScore)}]}}/></Box>;})()}
      <Table size="small"><TableHead><TableRow><TableCell>Escala / dimensão</TableCell><TableCell>Score</TableCell></TableRow></TableHead><TableBody>{view.scales.flatMap(s=>[s,...s.dimensions]).map(s=><TableRow key={s.id}><TableCell>{s.name}</TableCell><TableCell><ScoreBar score={s.hasValidAnswers?s.score:null}/></TableCell></TableRow>)}</TableBody></Table>
    </>}
    {tab===1&&<><Alert severity="info" sx={{mb:6}}>Cada gráfico representa as opções escolhidas por este empregado neste envio.</Alert><Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',md:'1fr 1fr'},gap:8}}>{view.questions.filter(q=>q.options.length).map(q=>{
      const counts=q.options.map((o:any)=>q.answers.filter((ans:any)=>ans.selectedOptionsIds.includes(o.id)).length);
      return <Paper key={q.id} sx={{p:8}}><Typography fontWeight={600}>{plain(q.details.text)}</Typography><Chart data={{labels:q.options.map((o:any)=>plain(o.text)),datasets:[{label:'Opções selecionadas',data:counts,backgroundColor:q.options.map((_:any,i:number)=>['#4477aa','#66ccee','#228833','#ccbb44','#ee6677'][i%5])}]}}/>{!counts.some(Boolean)&&<Typography>Sem resposta</Typography>}</Paper>;
    })}</Box></>}
    {tab===2&&<ScaleIndicatorsRadar groups={view.radar} byDimension={false}/>}
    {tab===3&&(view.dimensions.length?<ScaleIndicatorsRadar groups={view.radar} byDimension/>:<Alert severity="info">Este formulário não possui um mapeamento de dimensões compatível. Não foram inferidas dimensões.</Alert>)}
    {tab===4&&<Box sx={{overflowX:'auto'}}><Table><TableHead><TableRow><TableCell>Fator de risco</TableCell><TableCell>Severidade cadastrada</TableCell><TableCell>Probabilidade individual</TableCell><TableCell>Nível pela matriz do módulo</TableCell><TableCell>Itens pontuados</TableCell></TableRow></TableHead><TableBody>{data.risks.map(r=>{const level=resolveOccupationalRiskLevel(r.severity,r.probability);return <TableRow key={r.id}><TableCell>{plain(r.name)}</TableCell><TableCell>{r.severity??'Não informada'}</TableCell><TableCell>{r.probability}</TableCell><TableCell><Chip label={level?OCCUPATIONAL_RISK_LEVEL_NAMES[level]:'Não calculável'} color={level && level>=4?'error':level===3?'warning':'default'}/></TableCell><TableCell>{r.answeredItems}</TableCell></TableRow>;})}</TableBody></Table>{!data.risks.length&&<Alert severity="info">Não há fatores de risco vinculados às respostas pontuáveis deste envio.</Alert>}</Box>}
    {tab===5&&data.groups.map(g=><Box key={g.id} sx={{mb:8}}><Typography variant="h6">{plain(g.name)}</Typography>{g.questions.map((q:any)=><Paper key={q.id} sx={{p:8,my:4}}><Typography fontWeight={600}>{plain(q.details.text)}</Typography><Typography sx={{whiteSpace:'pre-wrap'}}>{q.answers.flatMap((ans:any)=>[ans.value,...ans.selectedOptionsIds.map((id:string)=>q.options.find((o:any)=>o.id===id)?.text)]).filter(Boolean).map(plain).join('; ')||'Sem resposta'}</Typography></Paper>)}</Box>)}
  </SContainer>;
}

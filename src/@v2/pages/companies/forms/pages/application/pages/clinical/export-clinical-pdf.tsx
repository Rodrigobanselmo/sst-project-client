import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, pdf } from '@react-pdf/renderer';
import { Chart } from 'chart.js';
import { clinicalView, ClinicalDashboard, plain } from './clinical-model';
import { buildIndicatorRadarChart, canDrawIndicatorRadar } from '../view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/formIndicatorRadar';
import { getIndicatorColorFromScore } from '../view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/form-indicator-quality.util';
import { resolveOccupationalRiskLevel, OCCUPATIONAL_RISK_LEVEL_NAMES } from 'core/utils/helpers/occupational-risk-level.util';
const styles=StyleSheet.create({page:{padding:32,fontSize:10,fontFamily:'Helvetica'},title:{fontSize:17,marginBottom:12},heading:{fontSize:12,marginTop:12,marginBottom:6},text:{marginBottom:6,lineHeight:1.4},item:{padding:8,marginBottom:6,borderBottom:'1px solid #dddddd'},footer:{position:'absolute',bottom:14,left:32,right:32,fontSize:8,color:'#555555'},image:{width:'100%',maxHeight:420,objectFit:'contain'}});
export async function exportClinicalPdf(data:ClinicalDashboard) {
  const view=clinicalView(data), charts:{title:string;image:string}[]=[];
  const render=(title:string,config:any)=>{const canvas=document.createElement('canvas');canvas.width=1100;canvas.height=700;const chart=new Chart(canvas,{...config,options:{...config.options,responsive:false,animation:false,devicePixelRatio:1}});try{chart.update('none');charts.push({title,image:canvas.toDataURL('image/png')});}finally{chart.destroy();canvas.remove();}};
  render('Indicadores individuais por escala',{type:'bar',data:{labels:view.scales.map(s=>s.name),datasets:[{label:'Score (%)',data:view.scales.map(s=>s.hasValidAnswers?s.percentage:null),backgroundColor:view.scales.map(s=>getIndicatorColorFromScore(s.score))}]},options:{indexAxis:'y',scales:{x:{min:0,max:100}}}});
  for(const [title,points,byDimension] of [ ['Radar por escalas',view.scales,false], ...view.scales.map(s=>[`Radar por dimensões — ${s.name}`,s.dimensions,true]) ] as [string,any[],boolean][]) {
    if(!canDrawIndicatorRadar(points,byDimension))continue;
    const radar=buildIndicatorRadarChart(points,{color:'#336699',textColor:'#222222',gridColor:'#cccccc',paperColor:'#ffffff'});
    render(title,{type:'radar',...radar});
  }
  for(const q of view.questions.filter(q=>q.options.length)) render(plain(q.details.text),{type:'bar',data:{labels:q.options.map((o:any)=>plain(o.text)),datasets:[{label:'Opções selecionadas neste envio',data:q.options.map((o:any)=>q.answers.filter((a:any)=>a.selectedOptionsIds.includes(o.id)).length),backgroundColor:'#4477aa'}]},options:{scales:{y:{beginAtZero:true,ticks:{precision:0}}}}});
  const footer=<Text fixed style={styles.footer} render={({pageNumber,totalPages})=>`Confidencial — uso profissional assistencial | ${data.employee.name} | ${pageNumber}/${totalPages}`}/>;
  const council=data.professional?.councils.find(c=>c.councilType==='CRM');
  const element=<Document title={`Relatório individual — ${data.employee.name}`} author={data.professional?.name??'SimpleSST'}>
    <Page size="A4" style={styles.page}>{footer}<Text style={styles.title}>Relatório individual sob sigilo profissional</Text>
      <Text style={styles.text}>Empregado: {data.employee.name}</Text><Text style={styles.text}>Campanha: {data.application.name} · {data.application.form.name}</Text>
      <Text style={styles.text}>Envio: {new Date(data.submission.created_at).toLocaleString('pt-BR')} · Referência: {data.submission.id}</Text><Text style={styles.text}>Emissão: {new Date(data.generatedAt).toLocaleString('pt-BR')}</Text>
      <Text style={styles.text}>Responsável pela consulta: {data.professional?.name??'Profissional autorizado'}{council?` · CRM-${council.councilUF} ${council.councilId}`:''}</Text>
      <Text style={styles.text}>Documento de apoio à avaliação do médico do trabalho. Não constitui diagnóstico. A severidade vem do cadastro ocupacional e a probabilidade das respostas deste envio; o resultado individual não altera o inventário coletivo.</Text>
      <Text style={styles.heading}>Score geral: {data.overall.hasValidAnswers?`${data.overall.percentage}% (${data.overall.score.toFixed(3)})`:'Sem score'}</Text><Text style={styles.text}>{data.overall.answeredItems} itens pontuados. Quanto menor o score, mais desfavoráveis as respostas. Itens ausentes ou não pontuáveis não são zero.</Text>
      <Text style={styles.text}>0–19% Muito negativo · 20–39% Negativo · 40–59% Neutro · 60–79% Positivo · 80–100% Muito positivo.</Text>
      {view.scales.flatMap(s=>[s,...s.dimensions]).map(s=><View key={s.id} style={styles.item} wrap={false}><Text>{s.name}: {s.hasValidAnswers?`${s.percentage}% (${s.score.toFixed(3)})`:'Sem score'}</Text></View>)}
      <Text style={styles.heading}>Análise individual dos fatores de risco</Text>
      {data.risks.map(r=>{const l=resolveOccupationalRiskLevel(r.severity,r.probability);return <View key={r.id} style={styles.item} wrap={false}><Text>{plain(r.name)}</Text><Text>Severidade cadastrada: {r.severity??'Não informada'} · Probabilidade individual: {r.probability} · Nível: {l?OCCUPATIONAL_RISK_LEVEL_NAMES[l]:'Não calculável'} · Itens: {r.answeredItems}</Text></View>;})}
      {!data.risks.length&&<Text>Sem fatores vinculados a respostas pontuáveis.</Text>}
    </Page>
    {charts.map((c,i)=><Page key={i} size="A4" style={styles.page}>{footer}<Text style={styles.heading}>{c.title}</Text><Image src={c.image} style={styles.image}/></Page>)}
    <Page size="A4" style={styles.page}>{footer}<Text style={styles.title}>Respostas do envio individual</Text>{data.groups.map(g=><View key={g.id}><Text style={styles.heading}>{plain(g.name)}</Text>{g.questions.map((q:any)=><View key={q.id} style={styles.item}><Text style={styles.text}>{plain(q.details.text)}</Text><Text style={styles.text}>{q.answers.flatMap((a:any)=>[a.value,...a.selectedOptionsIds.map((id:string)=>q.options.find((o:any)=>o.id===id)?.text)]).filter(Boolean).map(plain).join('; ')||'Sem resposta'}</Text></View>)}</View>)}</Page>
  </Document>;
  const blob=await pdf(element).toBlob(),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='relatorio-individual-confidencial.pdf';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}

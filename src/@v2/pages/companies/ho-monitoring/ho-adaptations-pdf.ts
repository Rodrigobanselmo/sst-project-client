import {createElement as h} from 'react';
import type {CollectionSummaryRow} from './ho-collection-summary';
import {methodAdaptation,shortLaboratory,skcBreakthroughReference} from './ho-method-adaptation';

export type AdaptationsReportKind = 'complete' | 'laboratory';

// Exclude campaign/GSE identifiers and evaluation labels: equivalent technical
// conditions require one laboratory answer, even across STEL and VMP.
export function adaptationReportEntries(rows:CollectionSummaryRow[],kind:AdaptationsReportKind) {
 const entries=rows.flatMap(row=>{const proposal=methodAdaptation(row);return proposal?[{row,proposal,evaluationTypes:[row.evaluationType]}]:[];});
 if(kind==='complete')return entries;
 const grouped=new Map<string,(typeof entries)[number]>();
 for(const entry of entries){
  const {row,proposal:p}=entry;
  const key=JSON.stringify([row.laboratory,row.agent,row.cas,row.method,row.sampler,row.samplerType,
   row.extractionSolvent,row.analyticalMethod,row.bounds,p.flow,p.volume,p.minutes,p.samplers,p.field,p.threshold]);
  const existing=grouped.get(key);
  if(existing){if(!existing.evaluationTypes.includes(row.evaluationType))existing.evaluationTypes.push(row.evaluationType);}
  else grouped.set(key,entry);
 }
 return [...grouped.values()];
}

export async function buildHoAdaptationsPdf(rows:CollectionSummaryRow[],campaignId:string,kind:AdaptationsReportKind='complete') {
 const {Document,Page,Text,View,Link,StyleSheet,pdf}=await import('@react-pdf/renderer');
 const styles=StyleSheet.create({
  page:{padding:34,paddingBottom:48,fontFamily:'Helvetica',fontSize:9,lineHeight:1.25,color:'#263238'},
  brand:{fontSize:10,fontFamily:'Helvetica-Bold',color:'#5b6470',marginBottom:10},
  title:{fontSize:20,fontFamily:'Helvetica-Bold',lineHeight:1.3,marginBottom:14},
  subtitle:{fontSize:11,lineHeight:1.3,color:'#5b6470',marginBottom:12},
  section:{fontSize:11,fontFamily:'Helvetica-Bold',marginTop:11,marginBottom:5},
  paragraph:{marginBottom:6},
  status:{backgroundColor:'#fff2f0',borderLeftWidth:3,borderLeftColor:'#c55248',padding:10,marginTop:10,marginBottom:8},
  row:{flexDirection:'row',borderBottomWidth:0.5,borderBottomColor:'#dce1e7',paddingVertical:5},
  label:{width:'40%',fontFamily:'Helvetica-Bold'},value:{width:'60%'},
  small:{fontSize:8,color:'#5b6470',marginBottom:4},link:{fontSize:8,color:'#245c85',marginBottom:5},
  response:{position:'absolute',left:34,right:34,bottom:181},
  footer:{position:'absolute',bottom:25,left:40,right:40,fontSize:8,color:'#657080'},
 });
 const safe=(s:string)=>s.replace(/[\u2010-\u2015]/g,'-').replace(/≥/g,'>=');
 const txt=(s:string,style:(typeof styles)[keyof typeof styles]=styles.paragraph)=>h(Text,{style},safe(s));
 const fmt=(n:number|null|undefined)=>n==null?'Não informado':n.toLocaleString('pt-BR',{maximumFractionDigits:6});
 const entries=adaptationReportEntries(rows,kind);
 const simplified=kind==='laboratory';
 const title=simplified?'Consulta técnica ao laboratório':'Registro de adaptações de coleta';
 const generated=new Date().toLocaleString('pt-BR',{timeZone:'America/Bahia'});
 const pages=entries.map(({row,proposal:p,evaluationTypes},i)=>{
  const b=row.bounds??{};
  const pair=(label:string,value:string)=>h(View,{style:styles.row},txt(label,styles.label),txt(value,styles.value));
  const methodNumber=row.method.match(/\b(?:1603|1500|1501)\b/)?.[0];
  return h(Page,{key:i,size:'A4',style:styles.page},
   txt('SimpleSST | Planejamento de Higiene Ocupacional',styles.brand),
   txt(title,styles.title),
   txt(rows.some(r=>r.preliminary)?'Triagem preliminar | Picos: referência de 15 minutos':simplified?'Condições de coleta agrupadas por método':'Relatório completo da campanha por GSE',styles.subtitle),
   txt(simplified?row.agent:`${row.group} | ${row.agent}`,styles.section),
   txt(`${simplified?evaluationTypes.join(" / "):row.evaluationType} | ${shortLaboratory(row.laboratory)} (${row.method})`),
   txt(simplified?`Consulta ${i+1} de ${entries.length} | Emitido em: ${generated}`:`Campanha: ${campaignId} | Emitido em: ${generated}`,styles.small),
   h(View,{style:styles.status},txt(simplified?'Solicitação de avaliação técnica da condição proposta.':row.adaptationAssumed?'Condição adaptada assumida e salva na estratégia.':'Proposta de adaptação - aceitação ainda não registrada.',{...styles.paragraph,fontFamily:'Helvetica-Bold'}),txt('Condição fora da faixa publicada. A aceitação profissional não equivale à validação analítica do método. Solicita-se ao laboratório avaliar alternativas e informar eventuais condições já validadas.')),
   txt('1. Condições do método e proposta',styles.section),
   pair('Vazão cadastrada',`${fmt(b.minimumFlowRate)} a ${fmt(b.maximumFlowRate)} ${b.flowRateUnit??'(unidade não informada)'}`),
   pair('Volume cadastrado por tubo',`${fmt(b.minimumVolume)} a ${fmt(b.maximumVolume)} ${b.volumeUnit??'(unidade não informada)'}`),
   pair('Vazão proposta',`${fmt(p.flow)} L/min`),pair('Duração por resultado',`${fmt(p.minutes)} min`),pair('Volume proposto por tubo',`${fmt(p.volume)} L`),pair('Tubos por resultado',fmt(p.samplers)),
   txt('2. Justificativa do desvio',styles.section),
   ...p.deviations.map(reason=>txt(reason)),
   txt('Preservar o registro das condições efetivas de campo. Solicitar análise separada das seções anterior e posterior quando aplicável e avaliar os critérios específicos do método. A ausência de breakthrough acima do critério, isoladamente, não comprova a validade da adaptação.'),
   txt('3. Referências bibliográficas',styles.section),
   txt('SKC - Active Sampling for Air Contaminants: orientação geral de breakthrough quando a massa na seção posterior é >=25% da anterior. Aplicar o critério específico mais restritivo.',styles.small),
   h(Link,{src:skcBreakthroughReference,style:styles.link},'Consultar apresentação técnica da SKC'),
   ...(p.threshold===10&&methodNumber?[txt(`${row.method}, item 13: reportar breakthrough e possível perda quando a massa na seção posterior superar 10% da anterior.`,styles.small),h(Link,{src:`https://www.cdc.gov/niosh/docs/2003-154/pdfs/${methodNumber}.pdf`,style:styles.link},`Consultar NIOSH ${methodNumber}`)]:[]),
   h(View,{style:styles.response},txt('4. Retorno do laboratório',styles.section),txt('Campo preenchível: informe alternativas, faixas validadas, restrições e orientações. Salve o PDF após escrever.',styles.small)),
   h(Text,{fixed:true,style:styles.footer},`SimpleSST | Registro técnico de planejamento | Página ${i+1} de ${entries.length}`),
  );
 });
 const doc=h(Document,{title,author:'SimpleSST'},...pages);
 const rendered=await pdf(doc).toBlob();
 const {PDFDocument,StandardFonts,rgb}=await import('pdf-lib');
 const document=await PDFDocument.load(await rendered.arrayBuffer());
 const form=document.getForm();
 const font=await document.embedFont(StandardFonts.Helvetica);
 document.getPages().forEach((page,index)=>{
  const field=form.createTextField(`retorno_laboratorio_${index+1}`);
  field.enableMultiline();
  field.addToPage(page,{x:34,y:55,width:page.getWidth()-68,height:120,
   font,textColor:rgb(0.15,0.19,0.22),borderColor:rgb(0.65,0.70,0.76),
   backgroundColor:rgb(1,1,1),borderWidth:0.75});
  field.setFontSize(10);
 });
 form.updateFieldAppearances(font);
 const bytes=await document.save();
 return new Blob([new Uint8Array(bytes)],{type:'application/pdf'});
}
export async function downloadHoAdaptationsPdf(rows:CollectionSummaryRow[],campaignId:string,kind:AdaptationsReportKind='complete') {
 const blob=await buildHoAdaptationsPdf(rows,campaignId,kind);
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=kind==='laboratory'?'consulta-simplificada-laboratorio.pdf':'relatorio-completo-adaptacoes-campanha.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

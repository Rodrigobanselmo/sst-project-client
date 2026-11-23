import type { CollectionSummaryRow } from './ho-collection-summary';
export const skcBreakthroughReference = 'https://www.skcinc.com/media/documents/KnowledgeCenter/Training%20Information/Presentations/Active%20Sampling%20for%20Air%20Contaminants.pdf';
export function shortLaboratory(name: string) {
  if (/sgs/i.test(name)) return 'SGS';
  if (/toxilab/i.test(name)) return 'Toxilab';
  if (/unian[aá]lises/i.test(name)) return 'Unianálises';
  return name;
}
export function methodAdaptation(row: CollectionSummaryRow) {
  if ((!row.methodAdaptation && row.calculation.flowLMin != null) || !/tubo|carv[aã]o|sorb/i.test(`${row.sampler} ${row.samplerType}`)) return null;
  const b = row.bounds;
  const flowUnit = b?.flowRateUnit?.toLowerCase().replace(/\s/g, '');
  const volumeUnit = b?.volumeUnit?.toLowerCase().replace(/\s/g, '');
  const ff = ['l/min','l/minuto'].includes(flowUnit || '') ? 1 : ['ml/min','ml/minuto'].includes(flowUnit || '') ? 0.001 : null;
  const vf = volumeUnit === 'l' ? 1 : volumeUnit === 'ml' ? 0.001 : ['m3','m³'].includes(volumeUnit || '') ? 1000 : null;
  if (!b || ff == null || vf == null || ![b.minimumFlowRate,b.maximumFlowRate,b.minimumVolume,b.maximumVolume].every(v=>typeof v === 'number' && Number.isFinite(v) && v > 0)) return null;
  const qmin=b.minimumFlowRate!*ff, qmax=b.maximumFlowRate!*ff, vmin=b.minimumVolume!*vf, vmax=b.maximumVolume!*vf;
  if(qmin>qmax || vmin>vmax) return null;
  const peak=!['TWA','TWA_CMPT','CMPT'].includes(row.evaluationType);
  const minutes=peak?15:row.plannedMinutes;
  if(!minutes || minutes<=0) return null;
  let flow=qmax, volume=flow*minutes, samplers=1;
  let field:'flow'|'volume';
  if(peak && volume<vmin){flow=vmin/minutes;volume=vmin;field='flow';}
  else { flow=qmin; samplers=peak?1:Math.max(1,Math.floor(flow*minutes/vmax));volume=flow*minutes/samplers;if(volume<=vmax)return null;field='volume'; }
  const threshold=/\b(?:1603|1500|1501)\b/.test(row.method)?10:null;
  const note=`Adaptação de planejamento — risco técnico assumido ao confirmar: ${flow.toLocaleString('pt-BR',{maximumFractionDigits:6})} L/min, ${minutes} min e ${volume.toLocaleString('pt-BR',{maximumFractionDigits:6})} L por tubo (${samplers} tubo(s)). Fora da faixa de ${field==='flow'?'vazão':'volume'} do método. Consultar o laboratório sobre condição já validada ou alternativa de método; registrar a resposta. A faixa publicada corresponde às condições avaliadas; outra condição exige evidência de desempenho. A orientação geral SKC indica breakthrough em massa posterior ≥25% da anterior; aplicar critério específico mais restritivo. ${threshold ? 'Método NIOSH específico: reportar breakthrough e possível perda quando a massa posterior superar 10% da anterior.' : 'Confirmar com o laboratório o critério específico: não assumir 25% como limite universal.'} Resultado abaixo do critério de breakthrough, isoladamente, não valida a adaptação. Esta proposta não altera limites de exposição ocupacional.`;
  const deviations: string[] = [];
  const fmt=(n:number)=>n.toLocaleString('pt-BR',{maximumFractionDigits:6});
  if(flow>qmax+1e-9)deviations.push(`Vazão acima do máximo: em ${fmt(minutes)} min, o máximo de ${fmt(qmax)} L/min coleta ${fmt(qmax*minutes)} L, abaixo do volume mínimo de ${fmt(vmin)} L. Proposta: ${fmt(flow)} L/min para coletar ${fmt(volume)} L.`);
  if(flow<qmin-1e-9)deviations.push(`Vazão abaixo do mínimo: ${fmt(flow)} L/min; mínimo do método: ${fmt(qmin)} L/min.`);
  if(volume>vmax+1e-9)deviations.push(`Volume acima do máximo: mesmo com vazão mínima de ${fmt(qmin)} L/min, a configuração proposta coleta ${fmt(volume)} L por tubo em ${fmt(minutes/samplers)} min; máximo do método: ${fmt(vmax)} L. A divisão consecutiva não resolveu as faixas cadastradas.`);
  if(volume<vmin-1e-9)deviations.push(`Volume abaixo do mínimo: ${fmt(volume)} L; mínimo do método: ${fmt(vmin)} L.`);
  return {flow,volume,minutes,samplers,field,note,threshold,deviations};
}

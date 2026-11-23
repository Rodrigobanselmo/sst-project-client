import {Box,Typography} from '@mui/material';
import type {CollectionSummaryRow} from './ho-collection-summary';
import {methodAdaptation,shortLaboratory,skcBreakthroughReference} from './ho-method-adaptation';
export function MethodAdaptationTooltip({row}:{row:CollectionSummaryRow}) {
 const p=methodAdaptation(row);if(!p)return null;
 return <Box sx={{lineHeight:1.15,color:'#fff','& p':{lineHeight:1.15,fontSize:'inherit',color:'inherit'},'& a':{color:'inherit'},maxWidth:420}}>
 <Typography component="p" fontWeight={700}>Justificativa:</Typography>
 <Typography component="p">{p.flow.toLocaleString('pt-BR',{maximumFractionDigits:6})} L/min por {p.minutes} min: {p.volume.toLocaleString('pt-BR',{maximumFractionDigits:6})} L por tubo. Condição fora da faixa publicada, assumida pelo responsável ao confirmar a estratégia; não equivale a validação do método. Consultar o laboratório sobre adaptação já validada ou solução melhor.</Typography>
 {p.deviations.map(reason=><Typography component="p" key={reason} sx={{mt:2}}>{reason}</Typography>)}
 <Typography component="p" sx={{mt:2}} fontWeight={700}>Referências bibliográficas:</Typography>
 <Typography component="p"><a href={skcBreakthroughReference} target="_blank" rel="noreferrer">SKC — Active Sampling for Air Contaminants</a>: breakthrough quando a massa posterior é ≥25% da anterior. Aplicar critério específico mais rigoroso; estar abaixo dele não comprova, isoladamente, a validade da adaptação.</Typography>
 {p.threshold===10 && <Typography component="p"><a href={`https://www.cdc.gov/niosh/docs/2003-154/pdfs/${row.method.match(/\b(?:1603|1500|1501)\b/)?.[0] ?? "1603"}.pdf`} target="_blank" rel="noreferrer">{row.method}, item 13</a>: reportar breakthrough e possível perda quando a massa posterior superar 10% da anterior.</Typography>}
 <Typography component="p" sx={{mt:2}} fontWeight={700}>Alternativas:</Typography>
 {row.alternatives?.length ? row.alternatives.map((a,i)=><Typography component="p" key={i}>{shortLaboratory(a.laboratory)} ({a.method}): {a.flowLMin.toLocaleString('pt-BR')} L/min, {a.volumeLitres.toLocaleString('pt-BR')} L em {a.minutes} min, dentro das faixas cadastradas. Selecionar na etapa 3.2.</Typography>) : <Typography component="p">Nenhuma alternativa de outro laboratório atende aos parâmetros cadastrados para esta avaliação em 15 min. Conferir atualização do catálogo com o laboratório; isso não indica inexistência de alternativas externas.</Typography>}
 </Box>;
}

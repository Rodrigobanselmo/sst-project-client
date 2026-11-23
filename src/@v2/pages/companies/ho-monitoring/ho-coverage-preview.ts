import type { CollectionSummaryRow } from './ho-collection-summary';
/** Planning preview within registered bounds. Never authorize a method deviation. */
export function coveragePreview(row:CollectionSummaryRow,total:number){
 const b=row.bounds, unit=(v?:string|null)=>(v??'').toLowerCase().replace(/\s/g,'');
 const ff=['l/min','l/minuto'].includes(unit(b?.flowRateUnit))?1:['ml/min','ml/minuto'].includes(unit(b?.flowRateUnit))?.001:null;
 const vf=unit(b?.volumeUnit)==='l'?1:unit(b?.volumeUnit)==='ml'?.001:['m3','m³'].includes(unit(b?.volumeUnit))?1000:null;
 if(!b || ff==null || vf==null || ![b.minimumFlowRate,b.maximumFlowRate,b.minimumVolume,b.maximumVolume,total].every(v=>typeof v==='number' && Number.isFinite(v) && v>0) || /passiv|difus|direta|direct reading/i.test(`${row.samplerType} ${row.sampler}`) || !/ativ|active|tubo|filtro|impinger|ciclone|cassete|borbulhador/i.test(`${row.samplerType} ${row.sampler}`))return null;
 const registered=(v:number)=>Number(v.toPrecision(7));
 const qmin=registered(b.minimumFlowRate!*ff),qmax=registered(b.maximumFlowRate!*ff),vmin=registered(b.minimumVolume!*vf),vmax=registered(b.maximumVolume!*vf);
 if(qmin>qmax || vmin>vmax)return null;
 const maxMinutes=vmax/qmin,minMinutes=vmin/qmax,target=Math.max(vmin,.9*vmax);
 const n=Math.max(1,Math.ceil(total/maxMinutes-1e-10));
 const time=total/n,flow=Math.max(qmin,Math.min(qmax,target/time)),volume=flow*time;
 return {maxMinutes,minMinutes,count:n,time,flow,volume,valid:volume>=vmin-1e-9 && volume<=vmax+1e-9};
}

export function singleSamplerSuggestion(rows:CollectionSummaryRow[],targetMinutes:number){
 const previews=rows.map(r=>coveragePreview(r,targetMinutes));
 if(!rows.length || previews.some(p=>p==null))return null;
 const minutes=Math.min(targetMinutes,...previews.map(p=>Math.floor(p!.maxMinutes+1e-9)));
 return minutes>=1 && rows.every(r=>{const p=coveragePreview(r,minutes);return p?.valid && p.count===1;})?minutes:null;
}

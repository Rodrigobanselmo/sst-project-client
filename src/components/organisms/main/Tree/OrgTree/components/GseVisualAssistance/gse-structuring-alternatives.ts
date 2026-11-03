export type StructuringKind = 'MAINTAIN'|'CONDITIONAL_MAINTAIN'|'REUSE'|'SPLIT'|'CREATE';
export type OccupationalBasis = { compatibleConditions:string[]; differences:string[]; unconfirmedEssentialInformation:string[]; nonMaterialPendingInformation:string[] };
export type StructuringAlternative = {
 occupationalBasis?:OccupationalBasis; otherStrategiesNotProposedReason?:string|null;
 id:string;kind:StructuringKind;title:string;sourceGroupId:string;currentHierarchyIds:string[];
 justification:string;evidence:string[];hypotheses:string[];pendingValidations:string[];preferred:boolean;preferenceReason:string|null;
 status:'CONSULTATIVE_NOT_APPLIED';humanReviewRequired:true;
 groups:{existingGroupId:string|null;name:string;description:string;hierarchyIds:string[];resultingHierarchyIds:string[];justification:string;
 comparisons:{groupId:string;assessment:'POTENTIALLY_COMPATIBLE'|'NOT_PREFERRED'|'INSUFFICIENT';reason:string;evidence:string[]}[]}[];
};
export const structuringLabels:Record<StructuringKind,string>={MAINTAIN:'Manutenção',CONDITIONAL_MAINTAIN:'Manutenção condicionada',REUSE:'Aproveitamento de GSE existente',SPLIT:'Desmembramento',CREATE:'Criação de novo GSE'};
/** Transport safety only. No decision, merge, normalization or persistence bridge. */
export function validStructuringAlternatives(value:unknown, sourceId:unknown, sources:Record<string,unknown>, requireOccupationalBasis=false):value is StructuringAlternative[]{
 const obj=(v:any):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v);
 const text=(v:unknown):v is string=>typeof v==='string'&&!!v.trim();
 const texts=(v:unknown):v is string[]=>Array.isArray(v)&&v.every(text);
 if(!Array.isArray(value)||value.length>3||!Array.isArray(sources.roles)||!Array.isArray(sources.existingGroups))return false;
 const roles=new Set(sources.roles.filter(obj).map((r)=>r.id));
 const groups=new Map<string,any>(sources.existingGroups.filter(obj).map((g)=>[g.id,g]));
 const source=typeof sourceId==='string'?groups.get(sourceId):null;
 const current=source&&texts(source.hierarchyIds)?source.hierarchyIds.filter((id:string)=>roles.has(id)):[];
 const same=(a:string[],b:string[])=>a.length===b.length&&new Set(a).size===a.length&&a.every((id)=>b.includes(id));
 const seen=new Set<string>();let preferred=0;
 return value.every((a)=>{
  if(!obj(a)||!text(a.id)||seen.has(a.id)||a.sourceGroupId!==sourceId||!source||a.status!=='CONSULTATIVE_NOT_APPLIED'||a.humanReviewRequired!==true||!Object.prototype.hasOwnProperty.call(structuringLabels,a.kind)||!text(a.title)||!text(a.justification)||!texts(a.evidence)||!a.evidence.length||!texts(a.hypotheses)||!texts(a.pendingValidations)||typeof a.preferred!=='boolean'||!(a.preferenceReason===null||text(a.preferenceReason))||!texts(a.currentHierarchyIds)||!same(a.currentHierarchyIds,current)||!Array.isArray(a.groups)||!a.groups.length||a.groups.length>5)return false;
  const basis=a.occupationalBasis;
  if((requireOccupationalBasis||basis!==undefined)&&(!obj(basis)||!['compatibleConditions','differences','unconfirmedEssentialInformation','nonMaterialPendingInformation'].every((key)=>texts(basis[key]))))return false;
  if((requireOccupationalBasis||a.otherStrategiesNotProposedReason!==undefined)&&!(a.otherStrategiesNotProposedReason===null||text(a.otherStrategiesNotProposedReason)))return false;
  if(basis&&a.preferred&&(basis.unconfirmedEssentialInformation.length||!basis.compatibleConditions.length))return false;
  seen.add(a.id);if(a.preferred&&(++preferred>1||!text(a.preferenceReason)))return false;
  if(a.kind!=='MAINTAIN'&&(!a.hypotheses.length||!a.pendingValidations.length))return false;
  const assigned:string[]=[];const targets=new Set<string>();let hasNew=false,hasOther=false,unresolved=false;
  for(const g of a.groups){
   if(!obj(g)||!(g.existingGroupId===null||groups.has(g.existingGroupId))||!text(g.name)||!text(g.description)||!text(g.justification)||!texts(g.hierarchyIds)||!g.hierarchyIds.length||!texts(g.resultingHierarchyIds)||!Array.isArray(g.comparisons))return false;
   if(g.existingGroupId!==null){if(targets.has(g.existingGroupId))return false;targets.add(g.existingGroupId);if(g.existingGroupId!==sourceId)hasOther=true;}else hasNew=true;
   if(g.hierarchyIds.some((id:string)=>!current.includes(id)||assigned.includes(id)))return false;assigned.push(...g.hierarchyIds);
   const prior=g.existingGroupId?groups.get(g.existingGroupId):null;
   if(prior&&!texts(prior.hierarchyIds))return false;
   const expected=g.existingGroupId===sourceId?g.hierarchyIds:prior?[...new Set([...prior.hierarchyIds.filter((id:string)=>roles.has(id)),...g.hierarchyIds])]:g.hierarchyIds;
   if(!same(g.resultingHierarchyIds,expected))return false;
   const compared=new Set<string>();
   for(const c of g.comparisons){if(!obj(c)||!groups.has(c.groupId)||compared.has(c.groupId)||!['POTENTIALLY_COMPATIBLE','NOT_PREFERRED','INSUFFICIENT'].includes(c.assessment)||!text(c.reason)||!texts(c.evidence)||!c.evidence.length)return false;compared.add(c.groupId);if(g.existingGroupId===null&&c.assessment!=='NOT_PREFERRED')unresolved=true;if(basis&&a.preferred&&g.existingGroupId!==sourceId&&c.assessment==='INSUFFICIENT')return false;}
   if(g.existingGroupId===null&&[...groups.keys()].some((id)=>!compared.has(id)))return false;
   if(g.existingGroupId&&g.existingGroupId!==sourceId&&!g.comparisons.some((c:any)=>c.groupId===g.existingGroupId&&c.assessment!=='NOT_PREFERRED'))return false;
  }
  if(!same(assigned,current))return false;
  if((a.kind==='MAINTAIN'||a.kind==='CONDITIONAL_MAINTAIN')&&(a.groups.length!==1||a.groups[0].existingGroupId!==sourceId))return false;
  if(a.kind==='SPLIT'&&a.groups.length<2)return false;
  if(a.kind==='REUSE'&&(!hasOther||hasNew))return false;
  if(a.kind==='CREATE'&&!hasNew)return false;
  return !(hasNew&&unresolved&&a.preferred);
 });
}

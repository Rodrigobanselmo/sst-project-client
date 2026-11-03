import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GseAiProposalCard } from './GseAiProposalCard';
import { aiGroupState, aiGroupPreview, aiGroupDestinations, initialAiReview, parseAiGseAnalysisResponse, type AiGseProposal } from './gse-ai-consultative';
import { preliminaryGseDistribution } from './gse-ai-preliminary';
import { readFileSync } from 'node:fs';
import path from 'node:path';
const rec = (id:string, conclusion:string, linked=true): any => ({hierarchyId:id,conclusion,existingInTarget:linked,currentGroups:linked?[{id:'g',name:'Administrativo'}]:[],justification:'Entrevista aponta atividades incompatíveis',recommendation:'Confrontar atividades com o perfil do grupo',evidence:['Entrevista registrada'],divergences:['Limpeza operacional difere de rotinas administrativas'],missingInformation:conclusion==='INSUFFICIENT'?['Falta frequência']:[],questions:conclusion==='INSUFFICIENT'?['Qual a frequência?']:[]});
const proposal = (groupId: string | null='g', conclusion='REMOVE'):AiGseProposal => ({id:groupId || 'new',name:'Grupo avaliado',description:'Atividades do grupo a confirmar',existingGroupId:groupId,hierarchyIds:['h'],recommendations:[rec('h',conclusion,!!groupId)],currentHierarchyIds:groupId?['h']:[],proposedHierarchyIds:[],justification:'Avaliação conjunta da composição',informationUsed:['Entrevista'],divergences:['Atividades distintas'],hypotheses:[],missingInformation:[],questions:[],fieldConfirmation:'Confirmar em campo',classification:'QUALITATIVE',occupationalHomogeneityConfirmed:false,review:'HUMAN_REVIEW_REQUIRED',overlaps:[],pendingHierarchyIds:[],groupAssessment:{characterization:'Perfil administrativo',exposureAssessment:'Equivalência de exposição não comprovada',compositionInconsistencies:['Atividades de limpeza operacional'],preliminaryAssessment:'Prévia aceita localmente ainda não está gravada',alternatives:[],newGroupJustification:groupId?null:'Nenhum grupo adequado após avaliação'}});
const analysis = (proposals:AiGseProposal[]):any => ({status:'ANALYZED',companyId:'c',workspaceId:'w',promptVersion:'gse-consultative-v4-group-centered-1',fallback:'NONE',proposals,questions:[],doNotGroup:[],sources:{roles:[{id:'h',name:'Serviços Gerais',formal:{text:'Limpeza',source:'Hierarchy.description'},interview:{text:'Limpeza operacional',source:'Hierarchy.realDescription'}}],structure:[{id:'h',name:'Serviços Gerais',type:'OFFICE',parentId:null}],existingGroups:[{id:'g',name:'GSE Administrativo',hierarchyIds:['h']},{id:'other',name:'GSE Operacional',hierarchyIds:[]}]}});
const render=(p:AiGseProposal)=>renderToStaticMarkup(<GseAiProposalCard proposal={p} analysis={analysis([p])} review={initialAiReview(p)} disabled={false} onEdit={()=>{}} onLocate={()=>{}}/>);
let count=0;function test(label:string, fn:()=>void){fn();count++;console.log('PASS',label);}
test('GSE identity precedes editable data and technical review',()=>{
 const html=render(proposal());assert.ok(html.indexOf('Identificação do GSE analisado')<html.indexOf('Nome proposto'));
 for(const text of ['GSE EXISTENTE COM ALTERAÇÕES PROPOSTAS','GSE Administrativo','Avaliação técnica do GSE','Alterações propostas para este GSE','Fundamentação técnica do grupo','Prévia das decisões consultivas'])assert.ok(html.includes(text));
 assert.ok(html.includes('Origem atual:'));assert.ok(html.includes('Destino em outras propostas:'));
});
test('existing neutral, changed amber and new purple identities use V1 color semantics',()=>{
 const keep=proposal('g','KEEP');assert.equal(aiGroupState(keep),'EXISTING');assert.ok(render(keep).includes('#EDF0F2'));
 assert.equal(aiGroupState(proposal()),'CHANGED');assert.ok(render(proposal()).includes('#FFF1CD'));
 const fresh=proposal(null,'INCLUDE');assert.equal(aiGroupState(fresh),'NEW');assert.ok(render(fresh).includes('NOVO GSE PROPOSTO'));assert.ok(render(fresh).includes('#F0E6FA'));assert.ok(render(fresh).includes('Grupo ainda não criado'));
});
test('role reviews remain subordinate and collapsed inside their GSE',()=>{
 const html=render(proposal());assert.ok(html.includes('<details><summary>Cargos a retirar (1)</summary>'));
 assert.ok(html.includes('Ver fundamentos da recomendação'));assert.ok(!html.includes('role="dialog"'));
});
test('pending, rejected and insufficient recommendations never remove persisted members in local preview',()=>{
 const p=proposal();const a=analysis([p]);const review=initialAiReview(p);assert.deepEqual(aiGroupPreview(p,a,review),['h']);
 review.roles.h='rejected';assert.deepEqual(aiGroupPreview(p,a,review),['h']);review.roles.h='accepted';assert.deepEqual(aiGroupPreview(p,a,review),[]);
 const missing=proposal('g','INSUFFICIENT');assert.deepEqual(initialAiReview(missing).roles,{});assert.ok(render(missing).includes('Dúvidas e informações insuficientes no GSE'));assert.ok(!render(missing).includes('Aceitar recomendação'));
});
test('inclusion and withdrawal have independent approvals and explicit destinations',()=>{
 const origin=proposal();const target=proposal('other','INCLUDE');target.currentHierarchyIds=[];target.recommendations![0].existingInTarget=false;
 const a=analysis([origin,target]);assert.deepEqual(aiGroupDestinations(a,origin,'h').map((p)=>p.existingGroupId),['other']);
 const targetReview=initialAiReview(target);assert.deepEqual(aiGroupPreview(target,a,targetReview),[]);targetReview.roles.h='accepted';assert.deepEqual(aiGroupPreview(target,a,targetReview),['h']);
 assert.ok(render(origin).includes('Aceitar recomendação'));assert.ok(render(origin).includes('Rejeitar recomendação'));
});
test('preliminary distribution preserves origin, canonical hierarchy and pending local decisions without mutation',()=>{
 const review:any={newGroups:[{id:'draft',name:'Prévia',decision:'accepted'}],changes:[{groupId:'draft',nodeId:'h//w',kind:'ADD',decision:'pending'}]};const before=JSON.stringify(review);
 const preview=preliminaryGseDistribution(review,{'h//w':{id:'h//w'}} as any,[]);assert.equal(preview[0].existingGroupId,null);assert.equal(preview[0].decision,'accepted');assert.equal(preview[0].changes[0].hierarchyId,'h');assert.equal(preview[0].changes[0].decision,'pending');assert.equal(JSON.stringify(review),before);
});
test('v4 requires complete group metadata and rejects a partial invalid second group',()=>{
 const p=proposal();const response=analysis([p]);assert.equal(parseAiGseAnalysisResponse(response,'c','w').status,'ANALYZED');
 const broken:any=proposal('other');broken.groupAssessment.alternatives=[{groupId:'g',assessment:'UNSUITABLE',reason:'X',evidence:'INVALID'}];
 assert.throws(()=>parseAiGseAnalysisResponse(analysis([p,broken]),'c','w'),/AI_INVALID_RESPONSE_ENVELOPE/);
 const legacyWithInvalidNewField=analysis([broken]);legacyWithInvalidNewField.promptVersion='gse-consultative-v3';assert.throws(()=>parseAiGseAnalysisResponse(legacyWithInvalidNewField,'c','w'),/AI_INVALID_RESPONSE_ENVELOPE/);
 const missing:any=proposal();delete missing.groupAssessment;assert.throws(()=>parseAiGseAnalysisResponse(analysis([missing]),'c','w'),/AI_INVALID_RESPONSE_ENVELOPE/);
});
test('a known existing group without direct roles remains a group-centered review with no fabricated role cards',()=>{
 const p=proposal('g','KEEP');p.hierarchyIds=[];p.recommendations=[];p.currentHierarchyIds=[];p.proposedHierarchyIds=[];
 p.missingInformation=['Confirme a composição deste GSE'];
 const a=analysis([p]);a.sources.existingGroups[0].hierarchyIds=[];
 assert.equal(parseAiGseAnalysisResponse(a,'c','w').status,'ANALYZED');
 const html=renderToStaticMarkup(<GseAiProposalCard proposal={p} analysis={a} review={initialAiReview(p)} disabled={false} onEdit={()=>{}} onLocate={()=>{}}/>);
 assert.ok(html.includes('GSE Administrativo'));assert.ok(html.includes('Avaliação técnica do GSE'));
 assert.ok(html.includes('Confirme a composição deste GSE'));assert.ok(!html.includes('Serviços Gerais'));
 assert.deepEqual(aiGroupPreview(p,a,initialAiReview(p)),[]);
});
test('AI uses explicit actions, previews and no write bridge; conventional list remains accessible',()=>{
 const folder=path.join(process.cwd(),'src/components/organisms/main/Tree/OrgTree/components');
 const source=readFileSync(path.join(folder,'GseVisualAssistance/GseAiConsultativeAnalysis.tsx'),'utf8');assert.ok(source.includes('preliminaryDistribution'));assert.ok(!/buildSaveRequest|useMut|createGseFromProposal/.test(source));
 const list=readFileSync(path.join(folder,'GhoTool/components/GhoToolView/index.tsx'),'utf8');assert.ok(list.includes('ghoOrderedData.map'));assert.ok(!list.includes('GseConventionalRowsSection')); // Panel simplification is excluded from the M2.3 release.
});
console.log(`${count} GSE-centered UI tests passed; no model, server or database calls.`);

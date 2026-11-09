import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createTheme } from '@mui/material/styles';
import { GseAiRegistryBridge } from './GseAiRegistryBridge';
import { GseVisualAssistanceContext } from './GseVisualAssistance.context';
import { GseAiProposalCard } from './GseAiProposalCard';
import { initialAiReview, professionalGseText } from './gse-ai-consultative';
import { consultativeObservations, consultativeDecisionStatements, declarationSummary, emptyFeedback, feedbackKey, operationalConclusion, registrySignature, consultativeBasis, previousFeedback } from './gse-consultative-interaction';
import { gseActiveButtonSx } from '../BottomButton/styles';
import { SIMPLESST_PRODUCT_YELLOW } from 'configs/theme/simplesst-product-identity';
import { readFileSync } from 'node:fs';
import path from 'node:path';
const g: any = globalThis;
let count=0;function test(name:string, fn:()=>void){fn();count++;console.log('PASS',name);}
const p:any={id:'p',existingGroupId:'group',name:'GSE Existente',description:'Perfil a confirmar',hierarchyIds:['h'],recommendations:[{hierarchyId:'h',conclusion:'INSUFFICIENT',existingInTarget:true,currentGroups:[{id:'group',name:'GSE Existente'}],evidence:['Entrevista não registrada'],divergences:[],missingInformation:['Entrevista'],questions:['Quais atividades reais?'],justification:'Atividades não descritas',recommendation:'Complementar dados'}],classification:'QUALITATIVE',informationUsed:['Descrição formal'],divergences:[],hypotheses:[],missingInformation:['Entrevista'],questions:[],fieldConfirmation:'Confirmar em campo',justification:'Revisão do grupo',currentHierarchyIds:['h'],groupAssessment:{characterization:'Grupo a confirmar',exposureAssessment:'Não confirmada',compositionInconsistencies:[],preliminaryAssessment:'Sem prévia',alternatives:[],newGroupJustification:null}};
const a:any={sources:{roles:[{id:'h',name:'Operador',formal:{text:''},interview:{text:''}}],structure:[{id:'h',name:'Operador',parentId:null}],existingGroups:[{id:'group',name:'GSE Existente',hierarchyIds:['h']}]}};
test('clarifications/positions are temporary user declarations, not occupational confirmation or persistence commands',()=>{
 const f=emptyFeedback(p); f.position='maintain'; f.justification='Conferir atividade predominante';f.clarification='Atividades precisam de entrevista';
 const feedback={[feedbackKey(p)]:f}, before=JSON.stringify({p,a,feedback});
 const request=consultativeObservations('Observação temporária',feedback);
 assert.ok(request.includes('Não são evidências ocupacionais confirmadas'));
 assert.ok(request.includes(f.justification));assert.ok(!/CREATE_GSE|ADD_LINK|REMOVE_LINK|COMPLETED/.test(request));
 assert.equal(JSON.stringify({p,a,feedback}),before);assert.ok(!declarationSummary('',feedback).includes('existing:'));
 assert.throws(()=>consultativeObservations('',{...feedback,[feedbackKey(p)]:{...f,justification:''}}),/justificativa técnica/);
 assert.throws(()=>consultativeObservations('x'.repeat(10001),{}),/nenhum texto foi truncado/);
});
test('individual selections are sent only as prior consultative positions and are not copied as approvals into a new analysis',()=>{
 const previous={...p,recommendations:[{...p.recommendations[0],conclusion:'REVIEW'}]};
 const review=initialAiReview(previous); review.roles.h='rejected';
 const statements=consultativeDecisionStatements({...a,proposals:[previous]}, {[previous.id]:review});
 assert.ok(statements[0].includes('discordância consultiva'));assert.ok(statements[0].includes('Operador'));
 const body=consultativeObservations('',{},statements);assert.ok(body.includes(statements[0]));assert.ok(body.includes('Não são evidências ocupacionais confirmadas'));
 assert.equal(initialAiReview(previous).roles.h,'pending');
});
test('conclusions keep insufficient data separate from removal and preserve AI reservations after professional maintenance',()=>{
 const before=JSON.stringify(p), lines=operationalConclusion(p).join(' ');
 assert.ok(lines.includes('Complementar'));assert.ok(!lines.includes('retiradas'));assert.equal(JSON.stringify(p),before);
 const kept={...p,recommendations:[{...p.recommendations[0],conclusion:'KEEP'}],missingInformation:[]};
 assert.ok(operationalConclusion(kept).join(' ').includes('Manutenção'));assert.ok(operationalConclusion(kept).join(' ').includes('ressalvas'));
});
test('registry fingerprint changes only for saved relevant data, not ordering/selection/other workspace',()=>{
 const h={id:'h',companyId:'c',workspaceIds:['w'],name:'Operador',description:'Formal',realDescription:'Entrevista',parentId:'s',status:'ACTIVE',type:'OFFICE'};
 const signature=registrySignature({h},[],'c','w');
 assert.equal(registrySignature({h:{...h,selected:true,expand:true}},[],'c','w'),signature);
 assert.equal(registrySignature({other:{...h,id:'other',workspaceIds:['outside']},h},[],'c','w'),signature);
 assert.notEqual(registrySignature({h:{...h,description:'Nova descrição salva'}},[],'c','w'),signature);
 assert.notEqual(registrySignature({h:{...h,realDescription:'Nova entrevista salva'}},[],'c','w'),signature);
 assert.notEqual(registrySignature({h:{...h,status:'INACTIVE'}},[],'c','w'),signature);
});
let captured:any;
const ctx:any={active:true,groups:[],nodes:{'h//w':{id:'h//w',type:'OFFICE',label:'Operador',childrenIds:[],parentId:'s//w'}},toggle:()=>{throw Error('ANALYSIS_MUST_REMAIN_OPEN')}};
function Capture(){const el=GseAiRegistryBridge({companyId:'c',workspaceId:'w',guidance:'',disabled:false,onLocate:()=>undefined});captured=el.props;return null;}
function capture(){renderToStaticMarkup(<GseVisualAssistanceContext.Provider value={ctx}><Capture/></GseVisualAssistanceContext.Provider>);}
test('contextual actions reuse the existing editor, keep the workspace and never close the assistance',()=>{
 g.__gseRegistry={h:{id:'h',companyId:'c',workspaceIds:['w'],name:'Operador',description:'Formal salva',realDescription:'Entrevista salva',type:'OFFICE'}};
 g.__gseCanEdit=true;g.__gseModalOpens=[];g.__gseDispatch=[];capture();
 assert.equal(captured.canEditRole('h','description'),true);captured.onEditRole('h','realDescription');
 assert.equal(g.__gseModalOpens.length,1);assert.equal(g.__gseModalOpens[0][1].gseFocusField,'realDescription');
 assert.equal(g.__gseDispatch[0].payload.id,'h//w');assert.equal(g.__gseDispatch[0].payload.realDescription,'Entrevista salva');
});
test('the editor refuses foreign roles, wrong workspace, missing permissions and unsupported interview levels',()=>{
 for(const kind of ['foreign','scope','permission','suboffice']){
  g.__gseCanEdit=kind!=='permission';g.__gseRegistry.h.workspaceIds=kind==='scope'?['outside']:['w'];g.__gseRegistry.h.type=kind==='suboffice'?'SUB_OFFICE':'OFFICE';g.__gseModalOpens=[];capture();
  captured.onEditRole(kind==='foreign'?'foreign':'h','realDescription');assert.equal(g.__gseModalOpens.length,0);
 }
});
test('group cards expose contextual editors and feedback without inventing links for insufficient information',()=>{
 const before=JSON.stringify(p);const html=renderToStaticMarkup(<GseAiProposalCard proposal={p} analysis={a} review={initialAiReview(p)} disabled={false} feedback={emptyFeedback(p)} onFeedback={()=>undefined} onEditRole={()=>undefined} canEditRole={()=>true} onEdit={()=>undefined} onLocate={()=>undefined}/>);
 for(const label of ['Conclusão operacional','Complementar descrição do cargo','Registrar ou complementar entrevista','Esclarecimentos para uma nova avaliação','Discordar com justificativa','Manter composição atual','Somente nesta sessão'])assert.ok(html.includes(label),label);
 assert.equal(JSON.stringify(p),before);assert.ok(!html.includes('Aplicar realocação'));assert.ok(!html.includes('Salvar decisão'));
});
test('presentation translates internal terms without changing the original payload',()=>{
 const raw='preliminaryDistribution existingGroups recommendationRules EXACT_EXISTING_GSE HIGH';
 const result=professionalGseText(raw);assert.ok(!/preliminaryDistribution|existingGroups|recommendationRules|EXACT_EXISTING_GSE|HIGH/.test(result));
 assert.ok(result.includes('Distribuição preliminar'));assert.ok(result.includes('grau de confiança elevado'));assert.ok(raw.includes('HIGH'));
});
test('active GSE and Environment share product yellow with dark contrast and keyboard focus',()=>{
 const sx=gseActiveButtonSx(createTheme())['&&'];assert.equal(sx.backgroundColor,SIMPLESST_PRODUCT_YELLOW);assert.notEqual(sx['& p, & svg'].color,'#fff');assert.ok(sx['&:focus-visible'].outline);
 const source=readFileSync(path.join(process.cwd(),'src/components/organisms/main/Tree/OrgTree/components/BottomButton/index.tsx'),'utf8');assert.ok(source.includes("current === panel ? gseActiveButtonSx : undefined"));assert.ok(source.includes("panel: 'GSE'"));assert.ok(source.includes("panel: 'ENVIRONMENT'"));
});
test('editor opening does not reset/rekey analysis, and reanalysis remains an explicit action with no write bridge',()=>{
 const base=path.join(process.cwd(),'src/components/organisms/main/Tree/OrgTree/components/GseVisualAssistance');
 const bridge=readFileSync(path.join(base,'GseAiRegistryBridge.tsx'),'utf8');assert.ok(!/toggle\(|setAnalysis|create\(|mutate\(/.test(bridge));
 const source=readFileSync(path.join(base,'GseAiConsultativeAnalysis.tsx'),'utf8');assert.ok(source.includes('onClick={analyze}'));assert.ok(source.includes('registryAtAnalysis !== registrySignature'));assert.ok(!source.includes('setAnalysis(null)'));assert.ok(!/buildSaveRequest|useMut|history|localStorage/.test(source));
});
test('previous manifestations retain their text and require explicit confirmation after data or composition review changes',()=>{
 const analysis={...a,companyId:'c',workspaceId:'w',proposals:[p]};
 const f={...emptyFeedback(p),clarification:'Confirmar atividades externas',basisSignature:consultativeBasis(analysis)};
 assert.equal(previousFeedback(f,analysis),false);
 const updated={...analysis,sources:{...analysis.sources,roles:[{...analysis.sources.roles[0],interview:{text:'Entrevista atualizada'}}]}};
 assert.equal(previousFeedback(f,updated),true);assert.equal(f.clarification,'Confirmar atividades externas');
 const body=consultativeObservations('',{[feedbackKey(p)]:f},[],updated);
 assert.ok(body.includes('Manifestação anterior'));assert.ok(!body.includes('basisSignature'));
 assert.equal(previousFeedback({...f,basisSignature:consultativeBasis(updated)},updated),false);
 assert.equal(previousFeedback({...f,basisSignature:undefined},analysis),true);
 assert.equal(consultativeBasis({...analysis,observations:'nova manifestação'} as any),consultativeBasis(analysis));
 const changed={...analysis,proposals:[{...p,recommendations:[{...p.recommendations[0],conclusion:'KEEP'}]}]};
 assert.equal(previousFeedback(f,changed),true);
 const html=renderToStaticMarkup(<GseAiProposalCard proposal={p} analysis={analysis} review={initialAiReview(p)} disabled={false} feedback={f} previousManifestation onConfirmManifestation={()=>undefined} onFeedback={()=>undefined} onEdit={()=>undefined} onLocate={()=>undefined}/>);
 assert.ok(html.includes('Manifestação anterior — requer confirmação'));assert.ok(html.includes('Confirmar validade nesta sessão'));
 assert.ok(!html.includes('Salvar decisão'));
});
for (const key of ['__gseRegistry','__gseCanEdit','__gseModalOpens','__gseDispatch']) delete g[key];
console.log(`${count} incremental consultative interaction tests passed; no provider/database calls.`);

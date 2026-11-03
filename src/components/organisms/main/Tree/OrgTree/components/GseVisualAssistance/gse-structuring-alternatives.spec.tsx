import assert from 'node:assert/strict';
import React from 'react';
import {matrixScrollSx} from './GseAlternativesMatrix';
import {GseAiProposalCard} from './GseAiProposalCard';
import {initialAiReview} from './gse-ai-consultative';
import {renderToStaticMarkup} from 'react-dom/server';
import {validStructuringAlternatives} from './gse-structuring-alternatives';
import {GseStructuringAlternatives, GseAlternativeStructure, GseAlternativesComparison, toggleAlternativeComparison, alternativeStrategy, consultativeGroupSx, isPreservedComposition} from './GseStructuringAlternatives';
let count=0;function test(name:string,fn:()=>void){fn();count++;console.log('PASS',name);}
const sources:any={roles:[{id:'operator',name:'Operador'},{id:'support',name:'Auxiliar externo'}],existingGroups:[{id:'source',name:'Varredeira',hierarchyIds:['operator','support']}],structure:[]};
const group=(id:string|null,role:string)=>({existingGroupId:id,name:id?'Varredeira — Cabine':'Varredeira — Apoio externo',description:'Composição preliminar a confirmar em campo',hierarchyIds:[role],resultingHierarchyIds:[role],justification:'Atividades relatadas distintas, exposição a confirmar',comparisons:id?[]:[{groupId:'source',assessment:'INSUFFICIENT',reason:'Comparação de exposição pendente',evidence:['Atividades relatadas']} ]});
const split:any={id:'split',kind:'SPLIT',title:'Avaliar separação',sourceGroupId:'source',currentHierarchyIds:['operator','support'],justification:'Hipótese sujeita à confirmação',evidence:['Condução e apoio externo relatados'],hypotheses:['Condições potencialmente distintas'],pendingValidations:['Verificar exposições em campo'],preferred:false,preferenceReason:null,status:'CONSULTATIVE_NOT_APPLIED',humanReviewRequired:true,groups:[group('source','operator'),group(null,'support')]};
const maintain:any={...split,id:'maintain',kind:'CONDITIONAL_MAINTAIN',title:'Manter mediante avaliação',groups:[{...group('source','operator'),hierarchyIds:['operator','support'],resultingHierarchyIds:['operator','support']}]};
const proposal:any={existingGroupId:'source',structuringAlternatives:[maintain,split]};const analysis:any={sources};
test('conditional maintenance and split render concrete compositions, hypotheses and pending validation without applying anything',()=>{
 const before=JSON.stringify({proposal,analysis});assert.equal(validStructuringAlternatives(proposal.structuringAlternatives,'source',sources),true);
 const html=renderToStaticMarkup(<GseStructuringAlternatives proposal={proposal} analysis={analysis} disabled={false}/>);
 for(const label of ['Alternativas de estruturação propostas pela IA','Manutenção condicionada','Desmembramento','Estrutura proposta','Operador','Auxiliar externo','Novo GSE proposto','Descrição preliminar','Proposta consultiva, não aplicada','Comparar esta alternativa','Pendências de validação'])assert.ok(html.includes(label),label);
 assert.ok(!html.includes('Aplicar realocação'));assert.equal(JSON.stringify({proposal,analysis}),before);
});
test('unsafe/incomplete alternatives reject the complete transport value',()=>{
 for(const mutate of [(s:any)=>s.groups[0].existingGroupId='foreign',(s:any)=>s.groups[0].hierarchyIds=['foreign'],(s:any)=>s.groups[1].hierarchyIds=['operator'],(s:any)=>s.groups[1].comparisons=[],(s:any)=>s.groups[0].resultingHierarchyIds=['operator','support'],(s:any)=>s.preferred=true]){
  const copy=JSON.parse(JSON.stringify(split));mutate(copy);assert.equal(validStructuringAlternatives([copy],'source',sources),false);
 }
 assert.equal(validStructuringAlternatives([{id:'incomplete'}],'source',sources),false);
});
test('legacy analyses and empty alternatives render safe explanatory messages',()=>{
 for(const value of [undefined,[]]){const html=renderToStaticMarkup(<GseStructuringAlternatives proposal={{...proposal,structuringAlternatives:value}} analysis={analysis} disabled={false}/>);assert.ok(html.includes(value?'Nenhuma reorganização concreta':'avaliação anterior'));}
 assert.equal(validStructuringAlternatives([],null,sources),true);
});
test('source and each resulting GSE are separate before/after sections with explicit existing/new identity',()=>{
 const html=renderToStaticMarkup(<GseAlternativeStructure option={split} analysis={analysis}/>);
 for(const label of ['ANTES — SITUAÇÃO ATUAL','DEPOIS — HIPÓTESE CONSULTIVA','GSE de origem:','Varredeira','GSE resultante 1','GSE resultante 2','Cargos que permaneceriam na origem:','Cargos da origem destinados a este GSE:','Novo GSE proposto — ainda não cadastrado.','Descrição preliminar:'])assert.ok(html.includes(label),label);
 assert.equal((html.match(/<li/g)||[]).length,4);assert.ok(!html.includes('<table'));
 assert.equal(alternativeStrategy(split),'Desmembramento com criação de novo GSE');
 assert.equal(alternativeStrategy(maintain),'Manutenção condicionada');
});
test('existing destination preserves its actual identity and already assigned members',()=>{
 const a:any={sources:{...sources,roles:[...sources.roles,{id:'prior',name:'Trabalhador já vinculado'}],existingGroups:[...sources.existingGroups,{id:'dest',name:'Apoio existente',hierarchyIds:['prior']}]}};
 const reuse:any={...split,kind:'REUSE',groups:[split.groups[0],{...split.groups[1],existingGroupId:'dest',resultingHierarchyIds:['prior','support']}]};
 const html=renderToStaticMarkup(<GseAlternativeStructure option={reuse} analysis={a}/>);
 for(const label of ['Aproveitamento de GSE existente','GSE de destino existente:','Apoio existente','Trabalhador já vinculado','Auxiliar externo'])assert.ok(html.includes(label),label);
 assert.ok(!html.includes('Novo GSE proposto — ainda não cadastrado.'));
});
test('expanded comparison aligns strategies, counts, roles and pending validation in a matrix',()=>{
 const before=JSON.stringify({proposal,analysis});
 const html=renderToStaticMarkup(<GseAlternativesComparison options={[maintain,split]} analysis={analysis}/>);
 for(const label of ['Estratégia','COMPOSIÇÃO DOS GSEs','Grupos e cargos','Quantidade de novos GSEs propostos','Cargos destinados ao novo GSE','Pendências de validação','Varredeira — Apoio externo','Auxiliar externo'])assert.ok(html.includes(label),label);
 assert.equal((html.match(/<table/g)||[]).length,1);assert.ok(html.includes('Matriz comparativa de alternativas de GSE'));
 assert.equal(JSON.stringify({proposal,analysis}),before);assert.ok(!/Aplicar realocação|Salvar decisão|Confirmar alteração/.test(html));
});
test('comparison selection is immutable, deduplicated, reversible and separate from professional manifestations',()=>{
 const feedback={justification:'Conferir similaridade',position:'maintain'}, original:string[]=[];
 const before=JSON.stringify({proposal,analysis,feedback});
 let selected=toggleAlternativeComparison(original,'maintain',true);
 selected=toggleAlternativeComparison(selected,'split',true);assert.deepEqual(selected,['maintain','split']);
 assert.deepEqual(toggleAlternativeComparison(selected,'split',true),selected);
 selected=toggleAlternativeComparison(selected,'maintain',false);assert.deepEqual(selected,['split']);
 selected=toggleAlternativeComparison(selected,'split',false);assert.deepEqual(selected,[]);assert.deepEqual(original,[]);
 assert.equal(JSON.stringify({proposal,analysis,feedback}),before);
});
test('incomplete before/after data produces a pending-information notice without presumed destinations',()=>{
 for(const partial of [{...split,sourceGroupId:'missing'},{...split,currentHierarchyIds:[]},{...split,groups:[{...split.groups[0],resultingHierarchyIds:[]}]}]){
  const html=renderToStaticMarkup(<GseAlternativeStructure option={partial} analysis={analysis}/>);
  assert.ok(html.includes('Informações insuficientes para representar'));assert.ok(!html.includes('GSE resultante'));
 }
});
test('matrix supports controlled scrolling while GSE containers remain distinct from inner content',()=>{
 assert.equal(matrixScrollSx.overflow,'auto');assert.ok(matrixScrollSx.maxHeight);assert.ok(matrixScrollSx['&:focus-visible']);
 assert.equal(consultativeGroupSx.border,'2px solid');assert.ok(consultativeGroupSx.my>=2);
 const html=renderToStaticMarkup(<GseStructuringAlternatives proposal={proposal} analysis={analysis} disabled={true}/>);
 assert.ok(html.includes('PROPOSTAS DE REORGANIZAÇÃO DOS GSEs'));assert.ok(html.includes('2 alternativas identificadas'));
 assert.ok(html.includes('Selecione duas ou mais alternativas'));assert.ok(html.includes('disabled=""'));
});
test('two GSEs render distinct outer articles with their own highlighted identity and consultative state',()=>{
 const make=(id:string,name:string):any=>({id,existingGroupId:id,name,description:'Avaliação consultiva',hierarchyIds:[],recommendations:[],classification:'QUALITATIVE',justification:'Confirmar composição',informationUsed:[],divergences:[],hypotheses:[],missingInformation:[],questions:[],fieldConfirmation:'Confirmar em campo',structuringAlternatives:[]});
 const proposals=[make('clean','Varrição e Limpeza'),make('sweep','Varredeira Mecanizada')];
 const a:any={sources:{roles:[],structure:[],existingGroups:proposals.map((p)=>({id:p.id,name:p.name,hierarchyIds:[]}))}};
 const html=renderToStaticMarkup(<>{proposals.map((p)=><GseAiProposalCard key={p.id} proposal={p} analysis={a} review={initialAiReview(p)} disabled={false} onEdit={()=>{throw Error('Unexpected decision');}} onLocate={()=>{throw Error('Unexpected navigation');}}/>)}</>);
 assert.equal((html.match(/<article/g)||[]).length,2);assert.equal((html.match(/<h3/g)||[]).length,2);
 for(const label of ['Análise consultiva do GSE: Varrição e Limpeza','Análise consultiva do GSE: Varredeira Mecanizada','Situação consultiva:'])assert.ok(html.includes(label),label);
});
test('versioned occupational basis rejects material uncertainty as preferred, and keeps older results readable',()=>{
 const modern={...maintain,occupationalBasis:{compatibleConditions:['Ambiente descrito'],differences:[],unconfirmedEssentialInformation:[],nonMaterialPendingInformation:['Referência documental']},otherStrategiesNotProposedReason:'Sem dados de duração para outro destino defensável.'};
 assert.equal(validStructuringAlternatives([modern],'source',sources,true),true);
 assert.equal(validStructuringAlternatives([maintain],'source',sources,true),false);
 assert.equal(validStructuringAlternatives([maintain],'source',sources),true);
 const invalid={...modern,preferred:true,preferenceReason:'Aproveitar',occupationalBasis:{...modern.occupationalBasis,unconfirmedEssentialInformation:['Duração não confirmada']}};
 assert.equal(validStructuringAlternatives([invalid],'source',sources,true),false);
 assert.equal(validStructuringAlternatives([{...modern,preferred:true,preferenceReason:'Condições fundamentadas'}],'source',sources,true),true);
});
test('unchanged membership uses compact maintenance with full details preserved and no duplicate AFTER block',()=>{
 const before=JSON.stringify(maintain);
 assert.equal(isPreservedComposition(maintain),true);assert.equal(isPreservedComposition(split),false);
 const reordered={...maintain,groups:[{...maintain.groups[0],hierarchyIds:['support','operator'],resultingHierarchyIds:['support','operator']}]};assert.equal(isPreservedComposition(reordered),true);
 assert.equal(isPreservedComposition({...maintain,groups:[{...maintain.groups[0],existingGroupId:'other'}]}),false);
 const html=renderToStaticMarkup(<GseAlternativeStructure option={maintain} analysis={analysis}/>);
 assert.ok(html.includes('COMPOSIÇÃO PRESERVADA — SEM ALTERAÇÃO ESTRUTURAL'));
 assert.ok(html.includes('Consultar composição e descrição completas'));assert.ok(html.includes('Operador'));assert.ok(html.includes('Auxiliar externo'));
 assert.ok(!html.includes('DEPOIS — HIPÓTESE CONSULTIVA'));assert.ok(html.includes('não comprova homogeneidade'));
 assert.equal(JSON.stringify(maintain),before);
});
test('comparison action precedes alternative cards and starts disabled until two selections',()=>{
 const html=renderToStaticMarkup(<GseStructuringAlternatives proposal={proposal} analysis={analysis} disabled={false}/>);
 assert.ok(html.indexOf('Abrir comparação ampliada')<html.indexOf('ALTERNATIVA 1'));
 assert.ok(html.includes('0 alternativas selecionadas'));assert.ok(html.includes('aria-live="polite"'));assert.ok(html.includes('disabled=""'));
});
test('occupational limitations and the reason for sole maintenance remain visible outside secondary details',()=>{
 const modern={...maintain,occupationalBasis:{compatibleConditions:['Mesmo controle registrado'],differences:['Cabine versus apoio externo'],unconfirmedEssentialInformation:['Duração de exposição não confirmada'],nonMaterialPendingInformation:['Referência documental pendente']},otherStrategiesNotProposedReason:'Faltam duração e comparação dos controles para definir outro destino.'};
 const html=renderToStaticMarkup(<GseStructuringAlternatives proposal={{...proposal,structuringAlternatives:[modern]}} analysis={analysis} disabled={false}/>);
 for(const label of ['Por que não foram propostas outras estruturas:','Cabine versus apoio externo','Informações essenciais ainda não confirmadas','Duração de exposição não confirmada','Justificativa da manutenção:','Referência documental pendente'])assert.ok(html.includes(label),label);
 assert.ok(html.indexOf('Duração de exposição não confirmada')<html.indexOf('Detalhes técnicos, evidências e hipóteses'));
 assert.equal(consultativeGroupSx.overflow,'clip');
});
test('matrix uses common row parameters and a single current-state column for two or three alternatives',()=>{
 for(const count of [2,3]){
  const options=[maintain,split,{...split,id:'third',kind:'CREATE',title:'Outra hipótese'}].slice(0,count);
  const html=renderToStaticMarkup(<GseAlternativesComparison options={options} analysis={analysis}/>);
  assert.equal((html.match(/scope="col"/g)||[]).length,count+2);
  assert.equal((html.match(/>Situação atual<\/th>/g)||[]).length,1);
  const rows=Array.from(html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g));
  for(const row of rows){const cells=(row[1].match(/<(?:td|th)(?:\s|>)/g)||[]).length;assert.ok(cells===1||cells===count+2,`aligned ${cells}`);}
  assert.ok(html.includes('Área rolável da matriz comparativa'));assert.ok(html.includes('tabindex="0"'));
 }
});
test('matrix distinguishes existing destinations by ID even with the same proposed names, and renders all resulting groups',()=>{
 const a:any={sources:{...sources,roles:[...sources.roles,{id:'prior',name:'Já vinculado'}],existingGroups:[...sources.existingGroups,{id:'dest',name:'Destino cadastrado',hierarchyIds:['prior']}]}};
 const reuse:any={...split,id:'reuse',kind:'REUSE',groups:[split.groups[0],{...split.groups[1],name:'Nome hipotético igual',existingGroupId:'dest',resultingHierarchyIds:['prior','support']}]};
 const create:any={...split,id:'create',groups:[split.groups[0],{...split.groups[1],name:'Nome hipotético igual',existingGroupId:null}]};
 const html=renderToStaticMarkup(<GseAlternativesComparison options={[reuse,create]} analysis={a}/>);
 assert.ok(html.includes('Destino cadastrado'));assert.ok(html.includes('Transferência proposta — não aplicada'));assert.ok(html.includes('Novo GSE proposto'));assert.ok(html.includes('Já vinculado'));
 const three:any={...split,groups:[{...split.groups[0],hierarchyIds:['operator'],resultingHierarchyIds:['operator']},split.groups[1],{...split.groups[1],name:'Terceiro grupo',hierarchyIds:['third-role'],resultingHierarchyIds:['third-role']}]};
 const scoped:any={sources:{...sources,roles:[...sources.roles,{id:'third-role',name:'Terceiro cargo'}],existingGroups:[{...sources.existingGroups[0],hierarchyIds:['operator','support','third-role']}]}};
 three.currentHierarchyIds=['operator','support','third-role'];
 const multiple=renderToStaticMarkup(<GseAlternativesComparison options={[three]} analysis={scoped}/>);
 assert.ok(multiple.includes('GSE resultante 3'));assert.ok(multiple.includes('Terceiro cargo'));assert.ok(multiple.includes('Terceiro grupo'));
});
test('matrix retains essential gaps, full technical details and neutral absence states without asserting exposure equivalence',()=>{
 const modern={...maintain,occupationalBasis:{compatibleConditions:['Condição relatada'],differences:['Diferença relatada'],unconfirmedEssentialInformation:['Duração ainda desconhecida'],nonMaterialPendingInformation:[]},otherStrategiesNotProposedReason:'Comparação de duração insuficiente.'};
 const before=JSON.stringify({modern,analysis});
 const html=renderToStaticMarkup(<GseAlternativesComparison options={[modern,split]} analysis={analysis}/>);
 for(const label of ['COMPOSIÇÃO PRESERVADA — SEM ALTERAÇÃO ESTRUTURAL','Sem transferências ou criação de GSEs','Lacunas ocupacionais essenciais','Duração ainda desconhecida','Informação não disponível.','Referência cadastrada — sem proposta de alteração.','Pendente de confirmação','Consultar fundamentação completa','Composição preliminar a confirmar em campo'])assert.ok(html.includes(label),label);
 assert.ok(!html.includes('Homogeneidade comprovada'));assert.equal(JSON.stringify({modern,analysis}),before);
});
test('selected columns retain the original alternative numbering',()=>{
 const third={...split,id:'third',title:'Terceira opção'};
 const html=renderToStaticMarkup(<GseAlternativesComparison options={[split,third]} allOptions={[maintain,split,third]} analysis={analysis}/>);
 assert.ok(html.includes('Alternativa 2 —'));assert.ok(html.includes('Alternativa 3 —'));assert.ok(!html.includes('Alternativa 1 —'));
});
test('A: current and maintenance columns list the same actual roles directly, without cross-column references',()=>{
 const html=renderToStaticMarkup(<GseAlternativesComparison options={[maintain,split]} analysis={analysis}/>);
 const row=Array.from(html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)).find((m)=>m[1].includes('Grupos e cargos'))![1];
 const cells=Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g));
 for(const cell of cells.slice(0,2)){assert.ok(cell[1].includes('Operador'));assert.ok(cell[1].includes('Auxiliar externo'));assert.ok(cell[1].includes('Varredeira'));}
 assert.ok(cells[0][1].includes('composição cadastrada'));assert.ok(!cells[0][1].includes('permaneceriam'));
 for(const banned of ['Referência comum na coluna','Mesmo GSE da referência','Todos os cargos da referência','Mesma referência da coluna','Não se aplica à situação cadastrada'])assert.ok(!html.includes(banned),banned);
 assert.ok(html.includes('COMPOSIÇÃO DOS GSEs'));assert.ok(html.includes('ALTERAÇÕES PROPOSTAS'));
});
test('B/E: an existing destination displays prior and incoming members separately and warns on incomplete composition',()=>{
 const scoped:any={sources:{...sources,roles:[...sources.roles,{id:'prior',name:'Agente já vinculado'}],existingGroups:[...sources.existingGroups,{id:'dest',name:'Destino existente',hierarchyIds:['prior']}]}};
 const reuse:any={...split,id:'reuse',kind:'REUSE',groups:[split.groups[0],{...split.groups[1],existingGroupId:'dest',resultingHierarchyIds:['prior','support']}]};
 const html=renderToStaticMarkup(<GseAlternativesComparison options={[maintain,reuse]} analysis={scoped}/>);
 for(const label of ['Destino existente','Cargos já vinculados ao destino','Agente já vinculado','Cargos da origem destinados a este GSE','Auxiliar externo','Transferência proposta'])assert.ok(html.includes(label),label);
 const missing:any={sources:{...scoped.sources,existingGroups:[sources.existingGroups[0],{id:'dest',name:'Destino existente'}]}};
 const partial=renderToStaticMarkup(<GseAlternativesComparison options={[reuse]} analysis={missing}/>);
 assert.ok(partial.includes('Composição atual do destino não disponível'));assert.ok(partial.includes('não representam necessariamente todo o grupo'));assert.ok(partial.includes('Auxiliar externo'));
 assert.ok(!partial.includes('As listas mostram a composição resultante no escopo disponível'));
 const noResult={...reuse,groups:[reuse.groups[0],{...reuse.groups[1],resultingHierarchyIds:undefined}]};
 const absent=renderToStaticMarkup(<GseAlternativesComparison options={[noResult]} analysis={scoped}/>);
 assert.ok(absent.includes('Composição integral do destino não disponível'));assert.ok(absent.includes('Agente já vinculado'));
});
test('overlapping source/destination membership is not presented as a new destination link',()=>{
 const scoped:any={sources:{...sources,existingGroups:[...sources.existingGroups,{id:'dest',name:'Destino existente',hierarchyIds:['support']}]}};
 const reuse:any={...split,groups:[split.groups[0],{...split.groups[1],existingGroupId:'dest',resultingHierarchyIds:['support']}]};
 const html=renderToStaticMarkup(<GseAlternativesComparison options={[reuse]} analysis={scoped}/>);
 assert.ok(html.includes('já possuem vínculo no destino'));assert.ok(html.includes('Nenhum novo vínculo no destino indicado'));
});
test('V1 and V2 matrices keep explicit composition while missing technical metadata stays unavailable',()=>{
 const v2={...maintain,occupationalBasis:{compatibleConditions:['Fonte declarada'],differences:[],unconfirmedEssentialInformation:['Condição pendente'],nonMaterialPendingInformation:[]},otherStrategiesNotProposedReason:'Faltam dados comparativos.'};
 for(const option of [maintain,v2]){
  const before=JSON.stringify({option,analysis});const html=renderToStaticMarkup(<GseAlternativesComparison options={[option]} analysis={analysis}/>);
  assert.ok(html.includes('Operador'));assert.ok(html.includes('Auxiliar externo'));assert.equal(JSON.stringify({option,analysis}),before);
  assert.ok(html.includes(option===maintain?'Informação não disponível.':'Condição pendente'));
 }
});
test('current composition follows the supplied registry snapshot and refuses a contradictory current-state projection',()=>{
 const contradictory={...maintain,currentHierarchyIds:['operator']};
 const html=renderToStaticMarkup(<GseAlternativesComparison options={[contradictory]} analysis={analysis}/>);
 assert.ok(html.includes('Não há referência atual comum suficiente'));assert.ok(!html.includes('<table'));
});
console.log(`${count} structural presentation tests passed; no provider/database calls.`);

test('M2.3 diagnosis-only result creates no alternative card or artificial matrix and never changes review state',()=>{
 const value={...proposal,structuringAlternatives:[],groupAssessment:{exposureAssessment:'Diferenças relatadas exigem investigação; não há suporte para definir outro agrupamento.'}};
 const before=JSON.stringify(value);
 const html=renderToStaticMarkup(<GseStructuringAlternatives proposal={value} analysis={analysis} disabled={false}/>);
 assert.ok(html.includes('Conclusão diagnóstica'));assert.ok(html.includes(value.groupAssessment.exposureAssessment));
 assert.ok(!html.includes('ALTERNATIVA 1'));assert.ok(!html.includes('<table'));assert.ok(!html.includes('Comparar esta alternativa'));
 assert.equal(JSON.stringify(value),before);
});

/** Isolated browser fixture for actual React/MUI interactions. Never the application or real AI data. */
import React from 'react';
import {createRoot} from 'react-dom/client';
import {ThemeProvider,createTheme} from '@mui/material/styles';
import {GseStructuringAlternatives} from './GseStructuringAlternatives';
const sources:any={roles:[{id:'operator',name:'Operador'},{id:'support',name:'Auxiliar externo'}],structure:[],existingGroups:[{id:'source',name:'Varredeira',hierarchyIds:['operator','support']}]};
const group=(id:string|null,roles:string[])=>({existingGroupId:id,name:id?'Varredeira':'Apoio externo',description:'Descrição sintética para teste de interface',hierarchyIds:roles,resultingHierarchyIds:roles,justification:'Justificativa sintética',comparisons:id?[]:[{groupId:'source',assessment:'INSUFFICIENT',reason:'Comparação pendente na fixture sintética',evidence:['Fixture sintética']}]});
const shared:any={sourceGroupId:'source',currentHierarchyIds:['operator','support'],justification:'Condições a confirmar',evidence:['Fixture sintética'],hypotheses:['Hipótese sintética'],pendingValidations:['Comparar exposições'],preferred:false,preferenceReason:null,status:'CONSULTATIVE_NOT_APPLIED',humanReviewRequired:true};
const proposal:any={existingGroupId:'source',structuringAlternatives:[{...shared,id:'keep',kind:'CONDITIONAL_MAINTAIN',title:'Manutenção condicionada',groups:[group('source',['operator','support'])]},{...shared,id:'split',kind:'SPLIT',title:'Desmembramento condicionado',groups:[group('source',['operator']),group(null,['support'])]}]};
const analysis:any={sources};const before=JSON.stringify({proposal,analysis});
let forbiddenRequests=0;
window.fetch=async()=>{forbiddenRequests++;throw Error('NETWORK_FORBIDDEN_IN_ISOLATED_UI_TEST');};
window.XMLHttpRequest=class {constructor(){forbiddenRequests++;throw Error('NETWORK_FORBIDDEN_IN_ISOLATED_UI_TEST');}} as any;
createRoot(document.getElementById('root')!).render(<ThemeProvider theme={createTheme()}><GseStructuringAlternatives proposal={proposal} analysis={analysis} disabled={false}/></ThemeProvider>);
const pause=()=>new Promise((resolve)=>setTimeout(resolve,350));
const check=(condition:unknown,message:string)=>{if(!condition)throw Error(message);};
const button=()=>Array.from(document.querySelectorAll('button')).find((b)=>b.textContent==='Abrir comparação ampliada')!;
const options=()=>Array.from(document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][aria-label^="Comparar alternativa"]'));
const dialog=()=>document.querySelector('[role="dialog"]');
const results:string[]=[];
(window as any).gseInteractive={
 async run(user:{click:(element:Element)=>Promise<void>}){
  const click=(element:Element)=>user.click(element);
  await pause();check(button().disabled,'Comparison must start disabled');results.push('initially disabled');
  await click(options()[0]);await pause();check(options()[0].checked&&button().disabled,'One selection must not open comparison');results.push('first selected');
  await click(options()[1]);await pause();check(options()[1].checked&&!button().disabled,'Two selections must enable explicit action');check(!dialog(),'Selection must not open automatically');results.push('second selected, explicit action enabled');
  check(document.querySelector('[aria-label="Ações de comparação consultiva"]')!.compareDocumentPosition(options()[0])&Node.DOCUMENT_POSITION_FOLLOWING,'Action must precede options');
  await click(button());await pause();check(dialog(),'Actual MUI dialog did not open');check(dialog()!.textContent!.includes('Comparando 2 alternativas'),'Missing dialog title');results.push('actual dialog opened');
  const table=dialog()!.querySelector('table');check(table,'Matrix must be rendered inside actual dialog');check(table!.querySelectorAll('thead th').length===4,'Matrix must have parameter/current/two alternatives');const parameters=Array.from(table!.querySelectorAll('tbody th[scope="row"]')).map((node)=>node.textContent);check(['Grupos e cargos','Alteração estrutural','Lacunas ocupacionais essenciais'].every((label)=>parameters.includes(label)),'Matrix must align composition, changes and occupational gaps');check(dialog()!.querySelector('[role="region"][tabindex="0"]'),'Scroll area must be keyboard focusable');results.push('actual matrix has common reference, aligned rows and focusable scroll area');
  await click(Array.from(dialog()!.querySelectorAll('button')).find((b)=>b.textContent==='Fechar comparação')!);await pause();check(!dialog(),'Close button did not close dialog');results.push('dialog closed explicitly');
  await click(button());await pause();await click(dialog()!.querySelector('input[type="checkbox"]')!);await pause();check(!dialog()&&button().disabled,'Deselecting must close dialog below two selections');results.push('deselection closes dialog, one selected');
  const unchecked=options().find((o)=>!o.checked)!;await click(unchecked);await pause();check(!button().disabled&&!dialog(),'Reselection must enable button without automatic reopening');results.push('reselection remains explicit');
  check(JSON.stringify({proposal,analysis})===before,'Input data mutated');check(forbiddenRequests===0,'Unexpected network call');results.push('inputs preserved, no network/persistence');
  button().focus();return {results,keyboardActionFocused:document.activeElement===button()};
 },
 inspect(){return{results,dialogOpen:!!dialog(),activeText:document.activeElement?.textContent,forbiddenRequests,unchanged:JSON.stringify({proposal,analysis})===before,oneColumn:window.innerWidth<900};}
};

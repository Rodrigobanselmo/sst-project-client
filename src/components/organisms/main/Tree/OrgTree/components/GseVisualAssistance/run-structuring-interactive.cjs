/* Actual React/MUI DOM interactions, no application/server/DB/model. Does not install packages.
 * Requires jsdom, @testing-library/dom and @testing-library/user-event in existing dependencies
 * or GSE_UI_TEST_MODULES (temporary test-only dependencies are supported).
 * Example: GSE_UI_TEST_MODULES=/private/tmp/simplesst-gse-ui-test-deps/node_modules node <this file>
 */
const fs=require('node:fs'),path=require('node:path');
let root=__dirname;while(!fs.existsSync(path.join(root,'tsconfig.json')))root=path.dirname(root);
const esbuild=require(require.resolve('esbuild',{paths:[root,path.resolve(root,'../sst-project-api')]}));
const resolveTest=(name)=>require(require.resolve(name,{paths:[root,...(process.env.GSE_UI_TEST_MODULES?[process.env.GSE_UI_TEST_MODULES]:[])]}));
const pause=(ms=350)=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const {JSDOM,VirtualConsole}=resolveTest('jsdom');
 const userEvent=resolveTest('@testing-library/user-event').default;
 const {getByRole}=resolveTest('@testing-library/dom');
 const result=await esbuild.build({entryPoints:[path.join(__dirname,'gse-structuring-alternatives.interactive.tsx')],bundle:true,platform:'browser',format:'iife',minify:true,write:false,tsconfig:path.join(root,'tsconfig.json'),define:{'process.env.NODE_ENV':'"test"'},plugins:[{name:'no-network',setup(build){build.onResolve({filter:/^core\/services\/apiClient$/},()=>({path:'no-network',namespace:'isolated'}));build.onLoad({filter:/.*/,namespace:'isolated'},()=>({contents:'export const api={post(){throw Error("API_FORBIDDEN")},get(){throw Error("API_FORBIDDEN")}}'}));}}]});
 const errors=[];const console=new VirtualConsole();console.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM('<!doctype html><html lang="pt-BR"><body><main id="root" style="max-width:462px;margin:20px auto"></main></body></html>',{runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:console,url:'http://gse-ui-test.invalid/'});
 try{
  dom.window.eval(result.outputFiles[0].text);
  for(let i=0;i<100&&!dom.window.gseInteractive;i++)await pause(10);
  const user=userEvent.setup({document:dom.window.document,delay:null});
  const {results,keyboardActionFocused}=await dom.window.gseInteractive.run(user);
  if(!keyboardActionFocused)throw Error('Comparison action must be focusable');
  await user.keyboard('{Enter}');await pause();
  const dialog=getByRole(dom.window.document.body,'dialog');
  // MUI initially focuses its Dialog container (role=presentation), which owns the dialog paper.
  if(!dialog.parentElement.contains(dom.window.document.activeElement))throw Error('Modal focus container must receive keyboard focus');
  results.push('Enter opens actual dialog and receives focus');
  await user.tab();if(!dialog.contains(dom.window.document.activeElement))throw Error('Tab must remain within modal');results.push('keyboard Tab inside dialog');
  await user.keyboard('{Escape}');await pause();
  if(dom.window.document.querySelector('[role="dialog"]'))throw Error('Escape must close dialog');
  if(dom.window.document.activeElement.textContent!=='Abrir comparação ampliada')throw Error('Focus must return to comparison action');
  results.push('Escape closes dialog and restores focus');
  const state=dom.window.gseInteractive.inspect();if(errors.length||state.forbiddenRequests||!state.unchanged)throw Error(JSON.stringify({errors,state}));
  global.console.log(JSON.stringify({passed:results.length,failed:0,results,networkRequests:state.forbiddenRequests,inputsUnchanged:state.unchanged},null,2));
 }finally{dom.window.close();}
})().catch(e=>{console.error(e.stack||e.message);process.exitCode=1;});

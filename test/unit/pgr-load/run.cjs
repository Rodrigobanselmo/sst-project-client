const path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..');
const esbuild=require(require.resolve('esbuild',{paths:[root,path.resolve(root,'../sst-project-api-planlink-counts')]}));
const {chromium}=require(path.join(root,'node_modules/@playwright/test'));
(async()=>{
 const bundle=await esbuild.build({entryPoints:[path.join(__dirname,'harness.tsx')],bundle:true,write:false,platform:'browser',format:'iife',tsconfig:path.join(root,'tsconfig.json'),nodePaths:[path.join(root,'node_modules')],define:{'process.env.NODE_ENV':'"test"'},plugins:[{name:'boundaries',setup(build){build.onResolve({filter:/^(core\/services\/apiClient|@v2\/components\/forms\/fields\/SAutocompleteSelect\/SAutocompleteSelect)$/},()=>({path:path.join(__dirname,'stubs.tsx')}));}}]});
 const server=http.createServer((req,res)=>{res.setHeader('content-type',req.url==='/bundle.js'?'application/javascript':'text/html');res.end(req.url==='/bundle.js'?bundle.outputFiles[0].text:'<div id="root"></div><script src="/bundle.js"></script>');});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try {for(const mode of ['pending','error']){
  const page=await browser.newPage();const requests=[];let release;const pending=new Promise(r=>release=r);
  await page.route('**/*',async route=>{const u=new URL(route.request().url());assert.equal(u.origin,origin);if(!u.pathname.includes('/forms/applications'))return route.continue();requests.push(u);
    assert.equal(u.searchParams.get('view'),'options');assert.equal(u.searchParams.get('limit'),'50');assert.equal(u.searchParams.get('types[0]'),'PSYCHOSOCIAL');
    if(!u.searchParams.has('applicationId')){if(mode==='pending'){await pending;}else return route.fulfill({status:503,body:'{}'});}
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({results:[{id:'bound-id',name:'Bound campaign',form:{id:'form',name:'COPSOQ',type:'PSYCHOSOCIAL'}}],pagination:{page:1,limit:50,total:1}})});
  });
  await page.goto(origin+'/?binding=bound-id');await page.getByTestId('status').filter({hasText:'ready'}).waitFor();
  assert.equal(await page.getByTestId('selected').textContent(),'Bound campaign');assert.equal(await page.getByTestId('binding').textContent(),'bound-id');assert.equal(requests.length,2);
  release();await page.close();console.log('PASS binding hydrates independently of '+mode+' browse, preserving tenant, type and pagination');
 }}finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});

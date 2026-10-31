/* Local unit/SSR tests only. All API/router/query boundaries are explicit synthetic stubs.
 * Run from any directory: node <this folder>/run-tests.cjs
 * No server, application DB, microphone, model call or occupational write is used. */
const path = require('node:path');
const fs = require('node:fs');
let root = __dirname;
while (!fs.existsSync(path.join(root, 'tsconfig.json'))) {
  const parent = path.dirname(root);
  if (parent === root) throw Error('Client workspace not found');
  root = parent;
}
let esbuild;
try {
  esbuild = require(
    require.resolve('esbuild', {
      paths: [root, path.resolve(root, '../sst-project-api')],
    }),
  );
} catch {
  throw Error(
    'esbuild is required in the existing workspace dependencies; no automatic installation.',
  );
}
const entries = process.argv.slice(2);
if (!entries.length)
  entries.push(
    path.relative(
      root,
      path.join(__dirname, 'gse-proposal-registration.spec.ts'),
    ),
    path.relative(root, path.join(__dirname, 'gse-additive-save.spec.ts')),
    path.relative(
      root,
      path.join(__dirname, 'gse-integrated-review.model.spec.ts'),
    ),
    path.relative(root, path.join(__dirname, 'gse-approved-additions.spec.ts')),
    path.relative(
      root,
      path.join(__dirname, 'gse-visual-assistance.model.spec.ts'),
    ),
    path.relative(
      root,
      path.join(__dirname, 'gse-visual-assistance.components.spec.tsx'),
    ),
  );
global.__GSE_VISUAL_TEST_ISOLATED = true;
(async () => {
  for (const entry of entries) {
    const result = await esbuild.build({
      entryPoints: [path.resolve(root, entry)],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      packages: 'external',
      write: false,
      tsconfig: path.join(root, 'tsconfig.json'),
      plugins: [
        {
          name: 'isolated-read-dependencies',
          setup(build) {
            const stubs = {
              'core/services/apiClient': `exports.api={get:async()=>({data:{available:false}}),post:async(path,body)=>{global.__visualRequests??=[];global.__visualRequests.push({path,body});if(path!=='/ai-chat/transcribe')throw Error('OCCUPATIONAL_WRITE_FORBIDDEN');return {data:{text:'Orientação transcrita'}};}};`,
              'core/services/hooks/queries/useQueryCompany': `exports.useQueryCompany=()=>({data:{id:'c'}});`,
              'core/services/hooks/queries/useQueryGHOAll': `exports.useQueryGHOAll=()=>({data:[],isLoading:false,isError:false});`,
              'core/hooks/useAppDispatch': `exports.useAppDispatch=()=>action=>action;`,
              'core/hooks/useAppSelector': `exports.useAppSelector=(selector)=>selector({hierarchy:{nodes:{},workspaceId:'w'},gho:{data:null,search:'',hierarchies:[],searchSelect:'',isOpen:false}});`,
              'next/router': `exports.useRouter=()=>({query:{},pathname:'/dashboard/empresas/[companyId]/hierarquia',asPath:'/hierarquia'});`,
            };
            build.onResolve(
              {
                filter:
                  /^(core\/services\/apiClient|core\/services\/hooks\/queries\/useQueryCompany|core\/services\/hooks\/queries\/useQueryGHOAll|core\/hooks\/useAppSelector|core\/hooks\/useAppDispatch|next\/router)$/,
              },
              (args) => ({ path: args.path, namespace: 'safe-stub' }),
            );
            build.onLoad({ filter: /.*/, namespace: 'safe-stub' }, (args) => ({
              contents: stubs[args.path],
              loader: 'js',
            }));
          },
        },
      ],
    });
    const Module = require('node:module');
    const m = new Module(path.join(root, 'visual-test.cjs'), module);
    m.filename = path.join(root, 'visual-test.cjs');
    m.paths = Module._nodeModulePaths(root);
    m._compile(result.outputFiles[0].text, m.filename);
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

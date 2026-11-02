/* Synthetic UI/transport tests. No server, real API, database or occupational writes. */
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const esbuild = require(
  require.resolve('esbuild', {
    paths: [root, path.resolve(root, '../sst-project-api')],
  }),
);
(async () => {
  const result = await esbuild.build({
    entryPoints: [path.join(__dirname, 'panels.spec.tsx')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    packages: 'external',
    write: false,
    tsconfig: path.join(root, 'tsconfig.json'),
    plugins: [
      {
        name: 'synthetic-boundaries',
        setup(build) {
          const stubs = {
            'core/services/apiClient': `exports.api={get:async()=>{throw Error('UNEXPECTED_GET')},patch:async(path,body)=>{global.__panel.requests.push({method:'PATCH',path,body});return {data:{...body}}},post:async(path,body)=>{global.__panel.requests.push({method:'POST',path,body});return {data:global.__panel.response}}};`,
            'core/services/hooks/queries/useQueryCompany': `exports.useQueryCompany=()=>({data:global.__panel.company});`,
            'core/services/hooks/queries/useQueryGHOAll': `exports.useQueryGHOAll=()=>({data:global.__panel.groups,isLoading:false,isError:false});`,
            'core/hooks/useAppDispatch': `exports.useAppDispatch=()=>action=>{const f=global.__panel;f.actions.push(action);if(action.type==='gho/setGhoState')Object.assign(f.state.gho,action.payload);if(action.type==='gho/setGhoOpen')f.state.gho.open=action.payload??!f.state.gho.open;return action};`,
            'core/hooks/useAppSelector': `exports.useAppSelector=selector=>selector(global.__panel.state);`,
            'core/hooks/useModal': `exports.useModal=()=>({onOpenModal:(...args)=>global.__panel.modals.push(args)});`,
            'core/hooks/usePreventAction': `exports.usePreventAction=()=>({preventDelete:()=>{throw Error('DELETE_NOT_AUTHORIZED_IN_TEST')}});`,
            'layouts/default/providers': `exports.queryClient={invalidateQueries:async(options)=>{global.__panel.invalidations??=[];global.__panel.invalidations.push(options)}};`,
            'core/contexts/AuthContext': `exports.useAuth=()=>({user:{companyId:'c'}});exports.refreshToken=async()=>({token:'synthetic-token'});`,
            'next/router': `exports.useRouter=()=>global.__panel.router;`,
          };
          build.onResolve(
            {
              filter:
                /^(core\/services\/apiClient|core\/services\/hooks\/queries\/useQueryCompany|core\/services\/hooks\/queries\/useQueryGHOAll|core\/hooks\/useAppSelector|core\/hooks\/useAppDispatch|core\/hooks\/useModal|core\/hooks\/usePreventAction|core\/contexts\/AuthContext|layouts\/default\/providers|next\/router)$/,
            },
            (args) => ({ path: args.path, namespace: 'stub' }),
          );
          build.onLoad({ filter: /.*/, namespace: 'stub' }, (args) => ({
            contents: stubs[args.path],
            loader: 'js',
          }));
          build.onResolve(
            {
              filter:
                /\/(ModalAddProbability|ModalExcelHierarchies|ModalHierarchySanitization|GhoToolTreeFilter)$/,
            },
            (args) => ({ path: args.path, namespace: 'modal-stub' }),
          );
          build.onLoad({ filter: /.*/, namespace: 'modal-stub' }, (args) => ({
            contents: `exports.${args.path.split('/').pop()}=()=>null;`,
            loader: 'js',
          }));
        },
      },
    ],
  });
  const Module = require('node:module');
  const m = new Module(path.join(root, 'panel-tests.cjs'), module);
  m.filename = path.join(root, 'panel-tests.cjs');
  m.paths = Module._nodeModulePaths(root);
  m._compile(result.outputFiles[0].text, m.filename);
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

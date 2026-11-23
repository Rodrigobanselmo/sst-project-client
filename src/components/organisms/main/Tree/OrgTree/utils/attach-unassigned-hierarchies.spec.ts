import assert from 'node:assert/strict';
import { attachUnassignedHierarchies } from './attach-unassigned-hierarchies';
import { filterTreeMapByWorkspace } from './filter-tree-map-by-workspace';
import { firstNodeId } from 'core/constants/first-node-id.constant';

const nodes: any = {
  [firstNodeId]: { id:firstNodeId,label:'Empresa',type:'COMPANY',parentId:null,childrenIds:['ws'],expand:true,ghos:[] },
  ws:{id:'ws',label:'Filial',type:'WORKSPACE',parentId:firstNodeId,childrenIds:[],expand:true,ghos:[]},
};
const records: any = {
  hidden:{id:'hidden',name:'Cargo sem vínculo',type:'OFFICE',parentId:'sector',workspaceIds:[]},
  regular:{id:'regular',name:'Cargo da filial',type:'OFFICE',workspaceIds:['ws']},
  removed:{id:'removed',name:'Excluído',type:'OFFICE',workspaceIds:[],deletedAt:'2026-01-01'},
};
const before=JSON.stringify(records);
attachUnassignedHierarchies(nodes,records,firstNodeId);
assert.equal(nodes.hidden.parentId,firstNodeId);
assert.equal(nodes.hidden.id,'hidden');
assert.equal(nodes.hidden.label,'Cargo sem vínculo');
assert.equal(nodes.hidden.missingWorkspace,true);
assert.equal(nodes.hidden.stopDrag,true);
assert.deepEqual(nodes[firstNodeId].childrenIds,['ws','hidden']);
assert.equal(nodes.regular,undefined);
assert.equal(nodes.removed,undefined);
assert.equal(JSON.stringify(records),before,'Display must not change the stored hierarchy');
attachUnassignedHierarchies(nodes,records,firstNodeId);
assert.deepEqual(nodes[firstNodeId].childrenIds,['ws','hidden'],'No duplicated warnings');
assert(filterTreeMapByWorkspace(nodes,['ws'])[firstNodeId].childrenIds.includes('hidden'));
console.log('Unassigned hierarchy display checks passed');

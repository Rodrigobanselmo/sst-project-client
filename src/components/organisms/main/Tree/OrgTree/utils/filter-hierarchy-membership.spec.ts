import assert from 'node:assert/strict';
import { membershipHiddenIds } from './filter-hierarchy-membership';
import { projectVisibleHierarchy } from './project-visible-hierarchy';
import { firstNodeId } from 'core/constants/first-node-id.constant';
import { TreeTypeEnum as T } from '../enums/tree-type.enums';
import type { ITreeMap } from '../interfaces';
const n = (id: string, type: T, parentId: string | null, childrenIds: string[] = [], ghos: any[] = []) => ({id, type, parentId, childrenIds, ghos, label:id, expand:true});
const g = (id: string, extra = {}) => ({id, companyId:'c', status:'ACTIVE', workspaceIds:['w'], type:0, ...extra});
const nodes: ITreeMap = {
  [firstNodeId]: n(firstNodeId,T.COMPANY,null,['w']), w:n('w',T.WORKSPACE,firstNodeId,['s//w','t//w','u//w']),
  's//w':n('s//w',T.SECTOR,'w',['a//w','b//w']),
  't//w':n('t//w',T.SECTOR,'w',['c//w'],[g('inherited')]),
  'u//w':n('u//w',T.SECTOR,'w'),
  'a//w':n('a//w',T.OFFICE,'s//w',[],[g('direct'),g('element',{type:'EQUIPMENT',characterization:{id:'e'}})]),
  'b//w':n('b//w',T.OFFICE,'s//w'), 'c//w':n('c//w',T.OFFICE,'t//w'),
};
const before=JSON.stringify(nodes);
let hidden=membershipHiddenIds(nodes,new Set(['withGse']));
assert(hidden.has('a//w')); assert(hidden.has('c//w')); assert(hidden.has('t//w'));
assert(!hidden.has('s//w')); assert(!hidden.has('b//w'));
let projected=projectVisibleHierarchy(nodes,new Set(),false,hidden);
assert.deepEqual(projected.children.get('w'),['s//w','u//w']);
hidden=membershipHiddenIds(nodes,new Set(['withoutGse']));
assert(!hidden.has('a//w'));assert(!hidden.has('c//w'));assert(hidden.has('b//w'));assert(hidden.has('u//w'));
hidden=membershipHiddenIds(nodes,new Set(['withElements']));assert(hidden.has('a//w'));assert(!hidden.has('b//w'));
hidden=membershipHiddenIds(nodes,new Set(['withoutElements']));assert(!hidden.has('a//w'));assert(hidden.has('c//w'));
assert.equal(JSON.stringify(nodes),before);
assert.equal(membershipHiddenIds(nodes,new Set(['withGse','withoutGse'])).size,Object.keys(nodes).length);
const changed=structuredClone(nodes);
changed['b//w'].ghos=[g('closed',{hierarchyOnHomogeneous:[{hierarchyId:'b',workspaceId:'w',endDate:'2020-01-01'}]}) as any];
assert(!membershipHiddenIds(changed,new Set(['withGse'])).has('b//w'));
changed['b//w'].ghos=[g('foreign',{workspaceIds:['other']}) as any];
assert(!membershipHiddenIds(changed,new Set(['withGse'])).has('b//w'));
changed['a//w'].ghos=[g('environment',{type:'ENVIRONMENT',environment:{id:'env'}}) as any];
assert(!membershipHiddenIds(changed,new Set(['withElements'])).has('a//w'));
console.log('Membership filters: inheritance, mixed/complete coverage, element semantics, ended and foreign links PASS');
